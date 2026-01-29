import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import {
  AssessmentType,
  AssessmentTemplate,
  PatientAssessment,
  ASSESSMENT_TEMPLATES,
  getSeverityColor
} from '../../models/assessment.model';

@Component({
  selector: 'app-staff-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="max-w-5xl mx-auto px-4 py-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Patient Assessments</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage questionnaires and track patient outcomes</p>
        </div>
        <button
          (click)="showNewAssessmentModal.set(true)"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Assessment
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex -mb-px">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                [class]="getTabClass(tab.id)"
              >
                {{ tab.label }}
                <span [class]="getTabCountClass(tab.id)">{{ getTabCount(tab.id) }}</span>
              </button>
            }
          </nav>
        </div>
      </div>

      <!-- Assessment List -->
      <div class="space-y-4">
        @for (assessment of filteredAssessments(); track assessment.id) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Type icon -->
                <div [class]="getTypeIconClass(assessment.assessmentType)">
                  {{ getTypeEmoji(assessment.assessmentType) }}
                </div>

                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {{ getTemplateName(assessment.assessmentType) }}
                    </h3>
                    <span [class]="getStatusBadge(assessment.status)">
                      {{ assessment.status | titlecase }}
                    </span>
                    <span [class]="getModeBadge(assessment.entryMode)">
                      {{ assessment.entryMode === 'staff' ? 'Staff Entry' : 'Patient Self-Service' }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Patient ID: {{ assessment.patientId }}
                    @if (assessment.caseId) {
                      • Case: {{ assessment.caseId }}
                    }
                    • Created: {{ assessment.createdAt | date:'short' }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Score if completed -->
                @if (assessment.status === 'completed' && assessment.totalScore !== undefined) {
                  <div class="text-right">
                    <div class="text-2xl font-bold" [class]="getScoreColor(assessment.severity)">
                      {{ assessment.totalScore }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ assessment.interpretation }}
                    </div>
                  </div>
                }

                <!-- Actions -->
                @if (assessment.status === 'pending' && assessment.entryMode === 'patient') {
                  <button
                    (click)="copyLink(assessment)"
                    class="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                    </svg>
                    Copy Link
                  </button>
                  <button
                    (click)="resendLink(assessment)"
                    class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium"
                  >
                    Resend
                  </button>
                }

                @if (assessment.status !== 'completed') {
                  <button
                    (click)="openStaffEntry(assessment)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    {{ assessment.entryMode === 'staff' ? 'Continue Entry' : 'Enter for Patient' }}
                  </button>
                } @else {
                  <button
                    (click)="viewResults(assessment)"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    View Results
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-4">No assessments found</p>
            <button
              (click)="showNewAssessmentModal.set(true)"
              class="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Create your first assessment
            </button>
          </div>
        }
      </div>

      <!-- New Assessment Modal -->
      @if (showNewAssessmentModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">New Assessment</h2>
                <button
                  (click)="showNewAssessmentModal.set(false)"
                  class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- Patient ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient ID <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newAssessment.patientId"
                  placeholder="Enter patient ID or search..."
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <!-- Assessment Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assessment Type <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  @for (template of assessmentService.getAvailableTemplates(); track template.id) {
                    <button
                      (click)="newAssessment.type = template.id"
                      [class]="newAssessment.type === template.id
                        ? 'p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left'
                        : 'p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-blue-300'"
                    >
                      <div class="text-2xl mb-1">{{ getTypeEmoji(template.id) }}</div>
                      <div class="font-medium text-gray-900 dark:text-white text-sm">{{ template.shortName }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">~{{ template.estimatedMinutes }} min</div>
                    </button>
                  }
                </div>
              </div>

              <!-- Entry Mode -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How will this be completed?
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    (click)="newAssessment.entryMode = 'staff'"
                    [class]="newAssessment.entryMode === 'staff'
                      ? 'p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left'
                      : 'p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-blue-300'"
                  >
                    <div class="text-2xl mb-1">👨‍⚕️</div>
                    <div class="font-medium text-gray-900 dark:text-white text-sm">Staff Entry</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">I'll enter the responses</div>
                  </button>
                  <button
                    (click)="newAssessment.entryMode = 'patient'"
                    [class]="newAssessment.entryMode === 'patient'
                      ? 'p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left'
                      : 'p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-blue-300'"
                  >
                    <div class="text-2xl mb-1">📱</div>
                    <div class="font-medium text-gray-900 dark:text-white text-sm">Send to Patient</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Patient completes online</div>
                  </button>
                </div>
              </div>

              <!-- Patient contact (if patient self-service) -->
              @if (newAssessment.entryMode === 'patient') {
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    A secure link will be generated for the patient to complete this assessment.
                  </p>
                  <div class="space-y-3">
                    <input
                      type="email"
                      [(ngModel)]="newAssessment.email"
                      placeholder="Patient email (optional)"
                      class="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                    <input
                      type="tel"
                      [(ngModel)]="newAssessment.phone"
                      placeholder="Patient phone (optional)"
                      class="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              }

              <!-- Case ID (optional) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to Case (optional)
                </label>
                <input
                  type="text"
                  [(ngModel)]="newAssessment.caseId"
                  placeholder="Case ID"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                (click)="showNewAssessmentModal.set(false)"
                class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                (click)="createAssessment()"
                [disabled]="!newAssessment.patientId || !newAssessment.type"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ newAssessment.entryMode === 'patient' ? 'Create & Get Link' : 'Create & Start Entry' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Link Copied Toast -->
      @if (showLinkCopied()) {
        <div class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Link copied to clipboard!
        </div>
      }
    </main>
  `
})
export class StaffAssessmentComponent {
  private router = inject(Router);
  assessmentService = inject(AssessmentService);

  activeTab = signal<'all' | 'pending' | 'completed'>('all');
  showNewAssessmentModal = signal(false);
  showLinkCopied = signal(false);

  tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'pending' as const, label: 'Pending' },
    { id: 'completed' as const, label: 'Completed' }
  ];

  newAssessment = {
    patientId: '',
    type: '' as AssessmentType | '',
    entryMode: 'patient' as 'staff' | 'patient',
    email: '',
    phone: '',
    caseId: ''
  };

  // Sample data for demo
  sampleAssessments = signal<PatientAssessment[]>([
    {
      id: 'asmt_1',
      patientId: 'PAT-001',
      caseId: 'CASE-001',
      assessmentType: 'phq9',
      entryMode: 'patient',
      status: 'pending',
      responses: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      accessToken: 'abc123'
    },
    {
      id: 'asmt_2',
      patientId: 'PAT-002',
      assessmentType: 'rivermead_pcs',
      entryMode: 'staff',
      enteredBy: 'STAFF-001',
      status: 'completed',
      responses: [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      totalScore: 28,
      interpretation: 'Moderate symptoms',
      severity: 'moderate'
    },
    {
      id: 'asmt_3',
      patientId: 'PAT-003',
      assessmentType: 'gad7',
      entryMode: 'patient',
      status: 'completed',
      responses: [],
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 8,
      interpretation: 'Mild anxiety',
      severity: 'mild'
    }
  ]);

  filteredAssessments = computed(() => {
    const tab = this.activeTab();
    const assessments = this.sampleAssessments();

    if (tab === 'pending') {
      return assessments.filter(a => a.status !== 'completed');
    } else if (tab === 'completed') {
      return assessments.filter(a => a.status === 'completed');
    }
    return assessments;
  });

  getTabCount(tabId: 'all' | 'pending' | 'completed'): number {
    const assessments = this.sampleAssessments();
    if (tabId === 'pending') {
      return assessments.filter(a => a.status !== 'completed').length;
    } else if (tabId === 'completed') {
      return assessments.filter(a => a.status === 'completed').length;
    }
    return assessments.length;
  }

  getTabClass(tabId: string): string {
    const base = 'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors';
    if (this.activeTab() === tabId) {
      return `${base} border-blue-600 text-blue-600 dark:text-blue-400`;
    }
    return `${base} border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700`;
  }

  getTabCountClass(tabId: string): string {
    const base = 'px-2 py-0.5 text-xs font-semibold rounded-full';
    if (this.activeTab() === tabId) {
      return `${base} bg-blue-100 dark:bg-blue-900/50 text-blue-600`;
    }
    return `${base} bg-gray-100 dark:bg-gray-700 text-gray-600`;
  }

  getTypeEmoji(type: AssessmentType | string): string {
    const emojis: Record<string, string> = {
      phq9: '😊',
      rivermead_pcs: '🧠',
      gad7: '💭',
      vas_pain: '📊',
      oswestry: '🦴',
      neck_disability: '🦴',
      sf36: '❤️',
      dash: '💪'
    };
    return emojis[type] || '📋';
  }

  getTypeIconClass(type: AssessmentType): string {
    return 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-700';
  }

  getTemplateName(type: AssessmentType): string {
    return ASSESSMENT_TEMPLATES[type]?.shortName || type;
  }

  getStatusBadge(status: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (status) {
      case 'pending': return `${base} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300`;
      case 'in_progress': return `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`;
      case 'completed': return `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`;
      case 'expired': return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`;
      default: return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
    }
  }

  getModeBadge(mode: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    return mode === 'staff'
      ? `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`
      : `${base} bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300`;
  }

  getScoreColor(severity?: string): string {
    if (!severity) return 'text-gray-900 dark:text-white';
    const colors: Record<string, string> = {
      minimal: 'text-green-600 dark:text-green-400',
      mild: 'text-amber-600 dark:text-amber-400',
      moderate: 'text-orange-600 dark:text-orange-400',
      moderately_severe: 'text-red-600 dark:text-red-400',
      severe: 'text-red-700 dark:text-red-300'
    };
    return colors[severity] || 'text-gray-900 dark:text-white';
  }

  createAssessment() {
    if (!this.newAssessment.patientId || !this.newAssessment.type) return;

    if (this.newAssessment.entryMode === 'patient') {
      const result = this.assessmentService.createPatientAssessment(
        this.newAssessment.patientId,
        this.newAssessment.type as AssessmentType,
        'STAFF-001', // Would come from auth
        {
          caseId: this.newAssessment.caseId || undefined,
          email: this.newAssessment.email || undefined,
          phone: this.newAssessment.phone || undefined
        }
      );

      // Add to sample data for demo
      this.sampleAssessments.update(list => [result.assessment, ...list]);

      // Copy link to clipboard
      navigator.clipboard.writeText(result.link);
      this.showLinkCopied.set(true);
      setTimeout(() => this.showLinkCopied.set(false), 3000);
    } else {
      const assessment = this.assessmentService.createStaffAssessment(
        this.newAssessment.patientId,
        this.newAssessment.type as AssessmentType,
        'STAFF-001',
        this.newAssessment.caseId || undefined
      );

      this.sampleAssessments.update(list => [assessment, ...list]);
      // Navigate to staff entry form
      this.router.navigate(['/assessments/entry', assessment.id]);
    }

    // Reset form
    this.newAssessment = {
      patientId: '',
      type: '',
      entryMode: 'patient',
      email: '',
      phone: '',
      caseId: ''
    };
    this.showNewAssessmentModal.set(false);
  }

  copyLink(assessment: PatientAssessment) {
    if (!assessment.accessToken) return;
    const link = `${window.location.origin}/patient/assessment/${assessment.accessToken}`;
    navigator.clipboard.writeText(link);
    this.showLinkCopied.set(true);
    setTimeout(() => this.showLinkCopied.set(false), 3000);
  }

  resendLink(assessment: PatientAssessment) {
    const newLink = this.assessmentService.resendAssessmentLink(assessment.id);
    if (newLink) {
      navigator.clipboard.writeText(newLink);
      this.showLinkCopied.set(true);
      setTimeout(() => this.showLinkCopied.set(false), 3000);
    }
  }

  openStaffEntry(assessment: PatientAssessment) {
    this.router.navigate(['/assessments/entry', assessment.id]);
  }

  viewResults(assessment: PatientAssessment) {
    this.router.navigate(['/assessments/results', assessment.id]);
  }
}
