/**
 * Care Team Chat Component
 *
 * Real-time chat interface for care team ↔ patient communication.
 * Uses Supabase Realtime for instant messaging.
 */

import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import {
  Conversation,
  ChatMessage,
  ParticipantType,
  getTimeAgo
} from '../../models/messaging.model';

@Component({
  selector: 'app-care-team-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          @if (showConversationList()) {
            <button
              (click)="backToList.emit()"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg lg:hidden"
            >
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          }
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {{ getInitials(patientName || 'P') }}
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ patientName || 'Patient' }}</h3>
            @if (messagingService.typingUsers().size > 0) {
              <p class="text-xs text-blue-500">typing...</p>
            } @else if (messagingService.activeConversation()) {
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ messagingService.activeConversation()!.patientPhone || 'No phone' }}
              </p>
            }
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- SMS Button -->
          @if (patientPhone) {
            <button
              (click)="showSMSModal.set(true)"
              class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
              title="Send SMS"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </button>
          }
          <!-- Email Button -->
          @if (patientEmail) {
            <button
              (click)="showEmailModal.set(true)"
              class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
              title="Send Email"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </button>
          }
          <!-- More Options -->
          <button
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        #messagesContainer
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        @if (messagingService.loading()) {
          <div class="flex justify-center py-8">
            <div class="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        }

        @for (message of messagingService.sortedMessages(); track message.id) {
          <div
            [class]="message.senderType === 'patient' ? 'flex justify-start' : 'flex justify-end'"
          >
            <div
              [class]="message.senderType === 'patient'
                ? 'bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md'
                : 'bg-blue-600 text-white rounded-2xl rounded-br-md'"
              class="max-w-[80%] px-4 py-2"
            >
              @if (message.senderType === 'patient') {
                <p class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {{ message.senderName }}
                </p>
              }
              <p
                [class]="message.senderType === 'patient'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-white'"
              >
                {{ message.content }}
              </p>
              <p
                [class]="message.senderType === 'patient'
                  ? 'text-xs text-gray-500 dark:text-gray-400 mt-1'
                  : 'text-xs text-blue-200 mt-1'"
              >
                {{ getTimeAgo(message.createdAt) }}
                @if (message.senderType !== 'patient') {
                  @if (message.status === 'sent') {
                    <span class="ml-1">✓</span>
                  } @else if (message.status === 'delivered') {
                    <span class="ml-1">✓✓</span>
                  } @else if (message.status === 'read') {
                    <span class="ml-1 text-blue-300">✓✓</span>
                  }
                }
              </p>
            </div>
          </div>
        } @empty {
          @if (!messagingService.loading()) {
            <div class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Start a conversation with {{ patientName || 'the patient' }}
              </p>
            </div>
          }
        }

        <!-- Typing Indicator -->
        @if (messagingService.typingUsers().size > 0) {
          <div class="flex justify-start">
            <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-end gap-3">
          <!-- Attachment Button -->
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
            title="Attach file"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
          </button>

          <!-- Message Input -->
          <div class="flex-1 relative">
            <textarea
              [(ngModel)]="messageText"
              (keydown)="onKeyDown($event)"
              (input)="onInput()"
              placeholder="Type a message..."
              rows="1"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                     max-h-32"
            ></textarea>
          </div>

          <!-- Send Button -->
          <button
            (click)="sendMessage()"
            [disabled]="!messageText.trim()"
            class="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600
                   text-white rounded-full transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center gap-2 mt-3">
          <span class="text-xs text-gray-400 dark:text-gray-500">Quick:</span>
          <button
            (click)="insertQuickReply('Thank you for your message. I\\'ll get back to you shortly.')"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                   rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Acknowledge
          </button>
          <button
            (click)="insertQuickReply('Please feel free to call our office if you have any urgent concerns.')"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                   rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Call office
          </button>
          <button
            (click)="showTemplateSelector.set(true)"
            class="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                   rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Templates
          </button>
        </div>
      </div>
    </div>

    <!-- SMS Modal -->
    @if (showSMSModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Send SMS</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">To: {{ patientPhone }}</p>
          </div>
          <div class="p-4">
            <textarea
              [(ngModel)]="smsText"
              rows="4"
              placeholder="Type your message..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
            <p class="text-xs text-gray-400 mt-2">{{ smsText.length }}/160 characters ({{ Math.ceil(smsText.length / 160) }} segment{{ smsText.length > 160 ? 's' : '' }})</p>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-xl">
            <button
              (click)="showSMSModal.set(false); smsText = ''"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              (click)="sendSMS()"
              [disabled]="!smsText.trim()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg"
            >
              Send SMS
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Email Modal -->
    @if (showEmailModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Send Email</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">To: {{ patientEmail }}</p>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                [(ngModel)]="emailSubject"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                [(ngModel)]="emailBody"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-xl">
            <button
              (click)="showEmailModal.set(false); emailSubject = ''; emailBody = ''"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              (click)="sendEmail()"
              [disabled]="!emailSubject.trim() || !emailBody.trim()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg"
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CareTeamChatComponent implements OnInit, AfterViewChecked {
  @Input() conversationId?: string;
  @Input() patientId?: string;
  @Input() patientName?: string;
  @Input() patientPhone?: string;
  @Input() patientEmail?: string;
  @Input() caseId?: string;
  @Input() showConversationList = signal(false);

  @Output() backToList = new EventEmitter<void>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  messagingService = inject(MessagingService);

  // Local state
  messageText = '';
  smsText = '';
  emailSubject = '';
  emailBody = '';
  showSMSModal = signal(false);
  showEmailModal = signal(false);
  showTemplateSelector = signal(false);

  // Expose Math for template
  Math = Math;

  // Expose utility function
  getTimeAgo = getTimeAgo;

  private shouldScrollToBottom = false;
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentUserId = 'staff-user-1'; // Would come from auth
  private currentUserName = 'Care Team'; // Would come from auth

  ngOnInit() {
    // Load templates
    this.messagingService.loadTemplates();

    // Initialize conversation if provided
    if (this.conversationId) {
      this.messagingService.setActiveConversation(this.conversationId);
    } else if (this.patientId && this.patientName) {
      // Create new conversation
      this.messagingService.createConversation(
        this.patientId,
        this.patientName,
        this.patientPhone,
        this.patientEmail,
        undefined,
        this.caseId
      );
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onKeyDown(event: KeyboardEvent) {
    // Send on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInput() {
    // Send typing indicator (debounced)
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    const conversationId = this.messagingService.activeConversation()?.id;
    if (conversationId && this.messageText.trim()) {
      this.messagingService.sendTypingIndicator(conversationId, true);

      this.typingTimeout = setTimeout(() => {
        this.messagingService.sendTypingIndicator(conversationId, false);
      }, 2000);
    }
  }

  async sendMessage() {
    if (!this.messageText.trim()) return;

    const conversationId = this.messagingService.activeConversation()?.id;
    if (!conversationId) return;

    const message = this.messageText;
    this.messageText = '';

    await this.messagingService.sendMessage(
      conversationId,
      message,
      this.currentUserId,
      'staff',
      this.currentUserName
    );

    this.shouldScrollToBottom = true;

    // Clear typing indicator
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.messagingService.sendTypingIndicator(conversationId, false);
    }
  }

  insertQuickReply(text: string) {
    this.messageText = text;
  }

  async sendSMS() {
    if (!this.smsText.trim() || !this.patientPhone) return;

    await this.messagingService.sendSMS(
      this.patientPhone,
      this.smsText,
      this.patientId,
      this.caseId
    );

    this.smsText = '';
    this.showSMSModal.set(false);
  }

  async sendEmail() {
    if (!this.emailSubject.trim() || !this.emailBody.trim() || !this.patientEmail) return;

    await this.messagingService.sendEmail(
      [this.patientEmail],
      this.emailSubject,
      this.emailBody,
      undefined,
      this.patientId,
      this.caseId
    );

    this.emailSubject = '';
    this.emailBody = '';
    this.showEmailModal.set(false);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
