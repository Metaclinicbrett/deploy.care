/**
 * Messaging Service
 *
 * Handles care team ↔ patient communication:
 * - Real-time chat via Supabase Realtime
 * - SMS via Twilio (through backend API)
 * - Email via Gmail API (through backend API)
 */

import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import {
  Conversation,
  ConversationParticipant,
  ChatMessage,
  SMSMessage,
  EmailMessage,
  NotificationPreferences,
  MessageTemplate,
  CommunicationLogEntry,
  ParticipantType,
  MessageStatus,
  formatPhoneE164,
  renderTemplate,
  DEFAULT_TEMPLATES
} from '../models/messaging.model';

@Injectable({
  providedIn: 'root'
})
export class MessagingService implements OnDestroy {
  private supabase = inject(SupabaseService);

  // Real-time channel
  private conversationChannels = new Map<string, RealtimeChannel>();

  // State
  private _conversations = signal<Conversation[]>([]);
  private _activeConversation = signal<Conversation | null>(null);
  private _messages = signal<ChatMessage[]>([]);
  private _typingUsers = signal<Map<string, ConversationParticipant>>(new Map());
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _templates = signal<MessageTemplate[]>([]);

  // Public signals
  conversations = this._conversations.asReadonly();
  activeConversation = this._activeConversation.asReadonly();
  messages = this._messages.asReadonly();
  typingUsers = this._typingUsers.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  templates = this._templates.asReadonly();

  // Computed
  unreadCount = computed(() =>
    this._conversations().reduce((sum, c) => sum + c.unreadCount, 0)
  );

  sortedMessages = computed(() =>
    [...this._messages()].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  );

  activeConversations = computed(() =>
    this._conversations().filter(c => c.status === 'active')
  );

  ngOnDestroy() {
    // Cleanup all real-time subscriptions
    this.conversationChannels.forEach(channel => {
      this.supabase.client.removeChannel(channel);
    });
  }

  // ============================================
  // Conversations
  // ============================================

  /**
   * Load conversations for the current user/organization
   */
  async loadConversations(organizationId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await this.supabase.client
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(*)
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      this._conversations.set(data as Conversation[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations';
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Create a new conversation with a patient
   */
  async createConversation(
    patientId: string,
    patientName: string,
    patientPhone?: string,
    patientEmail?: string,
    organizationId?: string,
    caseId?: string
  ): Promise<Conversation | null> {
    try {
      // Check for existing conversation
      const existing = this._conversations().find(
        c => c.patientId === patientId && c.status === 'active'
      );
      if (existing) {
        this.setActiveConversation(existing.id);
        return existing;
      }

      const conversation: Partial<Conversation> = {
        id: crypto.randomUUID(),
        patientId,
        patientName,
        patientPhone,
        patientEmail,
        organizationId: organizationId || 'org-default',
        caseId,
        status: 'active',
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: []
      };

      // In production: insert to Supabase
      // const { data, error } = await this.supabase.client
      //   .from('conversations')
      //   .insert(conversation)
      //   .select()
      //   .single();

      this._conversations.update(list => [conversation as Conversation, ...list]);
      this.setActiveConversation(conversation.id!);

      return conversation as Conversation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create conversation';
      this._error.set(message);
      return null;
    }
  }

  /**
   * Set the active conversation and load messages
   */
  async setActiveConversation(conversationId: string): Promise<void> {
    const conversation = this._conversations().find(c => c.id === conversationId);
    if (!conversation) return;

    this._activeConversation.set(conversation);

    // Subscribe to real-time updates
    this.subscribeToConversation(conversationId);

    // Load messages
    await this.loadMessages(conversationId);

    // Mark as read
    this.markAsRead(conversationId);
  }

  /**
   * Subscribe to real-time updates for a conversation
   */
  private subscribeToConversation(conversationId: string): void {
    // Unsubscribe from previous if exists
    if (this.conversationChannels.has(conversationId)) {
      return; // Already subscribed
    }

    const channel = this.supabase.client
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          this.handleNewMessage(payload.new as ChatMessage);
        }
      )
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          this.handleTypingEvent(payload);
        }
      )
      .subscribe();

    this.conversationChannels.set(conversationId, channel);
  }

  // ============================================
  // Messages
  // ============================================

  /**
   * Load messages for a conversation
   */
  async loadMessages(conversationId: string, limit: number = 50): Promise<void> {
    this._loading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this._messages.set((data as ChatMessage[]).reverse());
    } catch (err) {
      // If table doesn't exist, use mock data
      this._messages.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    senderType: ParticipantType,
    senderName: string
  ): Promise<ChatMessage | null> {
    try {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        conversationId,
        senderId,
        senderType,
        senderName,
        content,
        contentType: 'text',
        status: 'sent',
        createdAt: new Date().toISOString()
      };

      // Optimistic update
      this._messages.update(list => [...list, message]);

      // Update conversation
      this._conversations.update(list =>
        list.map(c => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            lastMessageAt: message.createdAt,
            lastMessagePreview: content.slice(0, 100),
            updatedAt: message.createdAt
          };
        })
      );

      // In production: insert to Supabase
      // const { data, error } = await this.supabase.client
      //   .from('chat_messages')
      //   .insert(message)
      //   .select()
      //   .single();

      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      this._error.set(errorMessage);
      return null;
    }
  }

  /**
   * Handle incoming message from real-time subscription
   */
  private handleNewMessage(message: ChatMessage): void {
    // Avoid duplicates
    if (this._messages().some(m => m.id === message.id)) return;

    this._messages.update(list => [...list, message]);

    // Update conversation unread count if not active
    if (this._activeConversation()?.id !== message.conversationId) {
      this._conversations.update(list =>
        list.map(c => {
          if (c.id !== message.conversationId) return c;
          return {
            ...c,
            unreadCount: c.unreadCount + 1,
            lastMessageAt: message.createdAt,
            lastMessagePreview: message.content.slice(0, 100)
          };
        })
      );
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    const channel = this.conversationChannels.get(conversationId);
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { isTyping, userId: 'current-user', timestamp: new Date().toISOString() }
    });
  }

  /**
   * Handle typing event from real-time
   */
  private handleTypingEvent(payload: { isTyping: boolean; userId: string }): void {
    // Update typing users map
    this._typingUsers.update(map => {
      const newMap = new Map(map);
      if (payload.isTyping) {
        // Add to typing (would include full participant info in production)
        newMap.set(payload.userId, { id: payload.userId } as ConversationParticipant);
      } else {
        newMap.delete(payload.userId);
      }
      return newMap;
    });

    // Auto-clear after 3 seconds
    setTimeout(() => {
      this._typingUsers.update(map => {
        const newMap = new Map(map);
        newMap.delete(payload.userId);
        return newMap;
      });
    }, 3000);
  }

  /**
   * Mark conversation as read
   */
  markAsRead(conversationId: string): void {
    this._conversations.update(list =>
      list.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );

    // In production: update in Supabase
  }

  // ============================================
  // SMS (via Twilio backend)
  // ============================================

  /**
   * Send SMS message
   */
  async sendSMS(
    to: string,
    body: string,
    patientId?: string,
    caseId?: string,
    templateId?: string
  ): Promise<SMSMessage | null> {
    this._loading.set(true);

    try {
      const formattedTo = formatPhoneE164(to);

      const smsMessage: SMSMessage = {
        id: crypto.randomUUID(),
        patientId: patientId || '',
        caseId,
        direction: 'outbound',
        to: formattedTo,
        from: '+18005551234', // Would come from config
        body,
        status: 'queued',
        createdAt: new Date().toISOString()
      };

      // In production: call backend API which calls Twilio
      // const response = await fetch('/api/messaging/sms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to: formattedTo, body, patientId, caseId })
      // });

      // Simulate success
      smsMessage.status = 'sent';
      smsMessage.sentAt = new Date().toISOString();

      console.log('SMS sent:', smsMessage);
      return smsMessage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send SMS';
      this._error.set(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Send templated SMS
   */
  async sendTemplatedSMS(
    to: string,
    templateId: string,
    variables: Record<string, string>,
    patientId?: string,
    caseId?: string
  ): Promise<SMSMessage | null> {
    const template = this._templates().find(t => t.id === templateId);
    if (!template) {
      this._error.set('Template not found');
      return null;
    }

    const body = renderTemplate(template.body, variables);
    return this.sendSMS(to, body, patientId, caseId, templateId);
  }

  // ============================================
  // Email (via Gmail API backend)
  // ============================================

  /**
   * Send email message
   */
  async sendEmail(
    to: string[],
    subject: string,
    bodyHtml: string,
    bodyText?: string,
    patientId?: string,
    caseId?: string,
    cc?: string[],
    attachments?: File[]
  ): Promise<EmailMessage | null> {
    this._loading.set(true);

    try {
      const emailMessage: EmailMessage = {
        id: crypto.randomUUID(),
        patientId,
        caseId,
        direction: 'outbound',
        to,
        cc,
        from: 'notifications@deploy.care', // From config
        subject,
        bodyHtml,
        bodyText,
        status: 'queued',
        createdAt: new Date().toISOString()
      };

      // In production: call backend API which uses Gmail API
      // const response = await fetch('/api/messaging/email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to, subject, bodyHtml, bodyText, patientId, caseId })
      // });

      // Simulate success
      emailMessage.status = 'sent';
      emailMessage.sentAt = new Date().toISOString();

      console.log('Email sent:', emailMessage);
      return emailMessage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      this._error.set(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(
    to: string[],
    templateId: string,
    variables: Record<string, string>,
    patientId?: string,
    caseId?: string
  ): Promise<EmailMessage | null> {
    const template = this._templates().find(t => t.id === templateId);
    if (!template) {
      this._error.set('Template not found');
      return null;
    }

    const subject = template.subject ? renderTemplate(template.subject, variables) : '';
    const bodyHtml = renderTemplate(template.body, variables);

    return this.sendEmail(to, subject, bodyHtml, undefined, patientId, caseId);
  }

  // ============================================
  // Templates
  // ============================================

  /**
   * Load message templates
   */
  async loadTemplates(organizationId?: string): Promise<void> {
    try {
      // In production: load from Supabase
      // const { data, error } = await this.supabase.client
      //   .from('message_templates')
      //   .select('*')
      //   .or(`organization_id.is.null,organization_id.eq.${organizationId}`)
      //   .eq('is_active', true);

      // For now, use defaults
      const templates: MessageTemplate[] = DEFAULT_TEMPLATES.map((t, i) => ({
        ...t,
        id: `template-${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      this._templates.set(templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }

  /**
   * Get templates by channel
   */
  getTemplatesByChannel(channel: 'sms' | 'email'): MessageTemplate[] {
    return this._templates().filter(t => t.channel === channel && t.isActive);
  }

  // ============================================
  // Quick Actions
  // ============================================

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    patientName: string,
    patientPhone: string,
    patientEmail: string,
    appointmentDate: string,
    appointmentTime: string,
    providerName: string,
    patientId?: string,
    caseId?: string,
    preferSMS: boolean = true
  ): Promise<void> {
    const variables = {
      patient_name: patientName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      provider_name: providerName
    };

    if (preferSMS && patientPhone) {
      const smsTemplate = this._templates().find(
        t => t.category === 'appointment_reminder' && t.channel === 'sms'
      );
      if (smsTemplate) {
        await this.sendTemplatedSMS(patientPhone, smsTemplate.id, variables, patientId, caseId);
      }
    }

    if (patientEmail) {
      const emailTemplate = this._templates().find(
        t => t.category === 'appointment_reminder' && t.channel === 'email'
      );
      if (emailTemplate) {
        await this.sendTemplatedEmail([patientEmail], emailTemplate.id, {
          ...variables,
          location_address: '123 Care Center Drive, Suite 100', // Would come from org config
          clinic_phone: '(800) 555-1234',
          clinic_name: 'Deploy Care'
        }, patientId, caseId);
      }
    }
  }

  /**
   * Send assessment request to patient
   */
  async sendAssessmentRequest(
    patientName: string,
    patientPhone: string,
    patientEmail: string,
    assessmentLink: string,
    estimatedTime: string,
    patientId?: string,
    caseId?: string
  ): Promise<void> {
    const variables = {
      patient_name: patientName,
      assessment_link: assessmentLink,
      estimated_time: estimatedTime
    };

    // Send SMS
    if (patientPhone) {
      const smsTemplate = this._templates().find(
        t => t.category === 'assessment_request' && t.channel === 'sms'
      );
      if (smsTemplate) {
        await this.sendTemplatedSMS(patientPhone, smsTemplate.id, variables, patientId, caseId);
      }
    }
  }
}
