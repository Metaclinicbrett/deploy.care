/**
 * Messaging Models
 *
 * Models for care team ↔ patient communication including:
 * - Real-time chat (Supabase Realtime)
 * - SMS notifications (Twilio)
 * - Email (Gmail API)
 */

// ============================================
// Message Types
// ============================================

export type MessageChannel = 'chat' | 'sms' | 'email';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ParticipantType = 'patient' | 'staff' | 'provider' | 'system';

// ============================================
// Conversation
// ============================================

export interface Conversation {
  id: string;
  caseId?: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  organizationId: string;
  status: 'active' | 'archived' | 'closed';
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId?: string; // Staff/provider user ID
  patientId?: string; // For patient participant
  type: ParticipantType;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  joinedAt: string;
  lastReadAt?: string;
  isTyping?: boolean;
}

// ============================================
// Chat Message
// ============================================

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ParticipantType;
  senderName: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system';
  attachments?: MessageAttachment[];
  replyToId?: string;
  status: MessageStatus;
  readBy?: string[]; // User IDs who have read
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string; // MIME type
  url: string;
  size: number;
  thumbnailUrl?: string;
}

// ============================================
// SMS Message
// ============================================

export interface SMSMessage {
  id: string;
  conversationId?: string;
  patientId: string;
  caseId?: string;
  direction: MessageDirection;
  to: string; // Phone number
  from: string; // Twilio number
  body: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  segmentCount?: number;
  twilioSid?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// ============================================
// Email Message
// ============================================

export interface EmailMessage {
  id: string;
  conversationId?: string;
  patientId?: string;
  caseId?: string;
  direction: MessageDirection;
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: EmailAttachment[];
  status: 'draft' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  gmailMessageId?: string;
  gmailThreadId?: string;
  sentAt?: string;
  openedAt?: string;
  createdAt: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  content?: string; // Base64 for small files
  url?: string; // Storage URL for large files
}

// ============================================
// Notification Preferences
// ============================================

export interface NotificationPreferences {
  patientId: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string;
  preferredChannel: MessageChannel;
  language: string;
}

// ============================================
// Message Templates
// ============================================

export type TemplateCategory =
  | 'appointment_reminder'
  | 'assessment_request'
  | 'care_plan_update'
  | 'billing_notification'
  | 'general';

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  channel: MessageChannel;
  subject?: string; // For email
  body: string;
  variables: string[]; // e.g., ['patient_name', 'appointment_date']
  isActive: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Communication Log Entry
// ============================================

export interface CommunicationLogEntry {
  id: string;
  patientId: string;
  caseId?: string;
  encounterId?: string;
  channel: MessageChannel;
  direction: MessageDirection;
  summary: string;
  content?: string;
  staffId?: string;
  staffName?: string;
  status: MessageStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Real-time Events (Supabase)
// ============================================

export type RealtimeEventType =
  | 'new_message'
  | 'message_updated'
  | 'message_deleted'
  | 'typing_start'
  | 'typing_stop'
  | 'participant_joined'
  | 'participant_left'
  | 'message_read';

export interface RealtimeEvent {
  type: RealtimeEventType;
  conversationId: string;
  payload: unknown;
  timestamp: string;
}

// ============================================
// Twilio Configuration
// ============================================

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  messagingServiceSid?: string;
  phoneNumbers: TwilioPhoneNumber[];
}

export interface TwilioPhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName?: string;
  capabilities: {
    sms: boolean;
    mms: boolean;
    voice: boolean;
  };
  isDefault: boolean;
}

// ============================================
// Gmail Configuration
// ============================================

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiry?: string;
  sendingEmail: string; // e.g., notifications@deploy.care
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format phone number for Twilio (E.164)
 */
export function formatPhoneE164(phone: string, countryCode: string = '1'): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // If already has country code
  if (digits.length === 11 && digits.startsWith(countryCode)) {
    return `+${digits}`;
  }

  // Add country code
  if (digits.length === 10) {
    return `+${countryCode}${digits}`;
  }

  // Return as-is if already formatted
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+${countryCode}${digits}`;
}

/**
 * Format phone for display
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Extract variable names from template
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Get time ago string
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

// ============================================
// Default Templates
// ============================================

export const DEFAULT_TEMPLATES: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Appointment Reminder - SMS',
    category: 'appointment_reminder',
    channel: 'sms',
    body: 'Hi {{patient_name}}, this is a reminder of your appointment on {{appointment_date}} at {{appointment_time}} with {{provider_name}}. Reply YES to confirm or call us to reschedule.',
    variables: ['patient_name', 'appointment_date', 'appointment_time', 'provider_name'],
    isActive: true
  },
  {
    name: 'Assessment Request - SMS',
    category: 'assessment_request',
    channel: 'sms',
    body: 'Hi {{patient_name}}, please complete your health questionnaire: {{assessment_link}} It takes about {{estimated_time}} minutes. Thank you!',
    variables: ['patient_name', 'assessment_link', 'estimated_time'],
    isActive: true
  },
  {
    name: 'Appointment Reminder - Email',
    category: 'appointment_reminder',
    channel: 'email',
    subject: 'Appointment Reminder: {{appointment_date}}',
    body: `Dear {{patient_name}},

This is a friendly reminder of your upcoming appointment:

Date: {{appointment_date}}
Time: {{appointment_time}}
Provider: {{provider_name}}
Location: {{location_address}}

Please arrive 15 minutes early and bring your insurance card and ID.

If you need to reschedule, please call us at {{clinic_phone}} or reply to this email.

Best regards,
{{clinic_name}}`,
    variables: ['patient_name', 'appointment_date', 'appointment_time', 'provider_name', 'location_address', 'clinic_phone', 'clinic_name'],
    isActive: true
  },
  {
    name: 'Care Plan Update - Email',
    category: 'care_plan_update',
    channel: 'email',
    subject: 'Your Care Plan Has Been Updated',
    body: `Dear {{patient_name}},

Your care plan has been updated by {{provider_name}}.

Summary of changes:
{{update_summary}}

You can view your full care plan by logging into your patient portal: {{portal_link}}

If you have any questions, please don't hesitate to contact us.

Best regards,
{{clinic_name}}`,
    variables: ['patient_name', 'provider_name', 'update_summary', 'portal_link', 'clinic_name'],
    isActive: true
  }
];
