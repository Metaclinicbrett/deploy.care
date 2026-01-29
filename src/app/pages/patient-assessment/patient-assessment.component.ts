import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import {
  PatientAssessment,
  AssessmentTemplate,
  AssessmentQuestion,
  ASSESSMENT_TEMPLATES
} from '../../models/assessment.model';

@Component({
  selector: 'app-patient-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Clean, friendly patient portal - NO billing/cost info -->
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <!-- Simple header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-2xl mx-auto px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">Your Health Check</h1>
              <p class="text-sm text-gray-500">Secure & confidential</p>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-8">
        <!-- Loading state -->
        @if (loading()) {
          <div class="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Loading your questionnaire...</p>
          </div>
        }

        <!-- Error state -->
        @if (error()) {
          <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
            <p class="text-gray-600 mb-6">{{ error() }}</p>
            <p class="text-sm text-gray-500">
              Need help? Contact your care team or call us at <a href="tel:+18005551234" class="text-blue-600 hover:underline">1-800-555-1234</a>
            </p>
          </div>
        }

        <!-- Assessment form -->
        @if (assessment() && template() && !completed()) {
          <!-- Welcome card -->
          @if (currentStep() === 0) {
            <div class="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <div class="text-center mb-8">
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-4xl">👋</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Hi there!</h2>
                <p class="text-gray-600">
                  {{ assessmentService.getFriendlyDescription(assessment()!.assessmentType) }}
                </p>
              </div>

              <div class="bg-blue-50 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-900">What to expect</p>
                    <ul class="mt-1 text-sm text-blue-700 space-y-1">
                      <li>• {{ template()!.questions.length }} simple questions</li>
                      <li>• Takes about {{ template()!.estimatedMinutes }} minutes</li>
                      <li>• Your answers are private and secure</li>
                      <li>• There are no right or wrong answers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                (click)="startAssessment()"
                class="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Let's Begin →
              </button>
            </div>
          }

          <!-- Questions -->
          @if (currentStep() > 0 && currentStep() <= template()!.questions.length) {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
              <!-- Progress bar -->
              <div class="h-2 bg-gray-100">
                <div
                  class="h-full bg-blue-600 transition-all duration-300"
                  [style.width.%]="progressPercent()"
                ></div>
              </div>

              <div class="p-8">
                <!-- Question number -->
                <div class="flex items-center justify-between mb-6">
                  <span class="text-sm font-medium text-gray-500">
                    Question {{ currentStep() }} of {{ template()!.questions.length }}
                  </span>
                  <span class="text-sm text-gray-400">{{ progressPercent() | number:'1.0-0' }}% complete</span>
                </div>

                <!-- Question -->
                <div class="mb-8">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    {{ currentQuestion()?.text }}
                  </h3>
                  @if (currentQuestion()?.section) {
                    <p class="text-sm text-gray-500">{{ currentQuestion()?.section }}</p>
                  }
                </div>

                <!-- Answer options -->
                @if (currentQuestion()?.options) {
                  <div class="space-y-3">
                    @for (option of currentQuestion()?.options; track option.value) {
                      <button
                        (click)="selectAnswer(option.value)"
                        [class]="getOptionClass(option.value)"
                      >
                        <span class="flex-1 text-left">{{ option.label }}</span>
                        @if (currentAnswer() === option.value) {
                          <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        }
                      </button>
                    }
                  </div>
                }

                <!-- Numeric scale (for VAS pain, etc.) -->
                @if (currentQuestion()?.minValue !== undefined && currentQuestion()?.maxValue !== undefined && !currentQuestion()?.options) {
                  <div class="space-y-4">
                    <div class="flex justify-between text-sm text-gray-500">
                      <span>{{ currentQuestion()?.minLabel || currentQuestion()?.minValue }}</span>
                      <span>{{ currentQuestion()?.maxLabel || currentQuestion()?.maxValue }}</span>
                    </div>
                    <div class="flex gap-2">
                      @for (num of getScaleNumbers(); track num) {
                        <button
                          (click)="selectAnswer(num)"
                          [class]="getScaleButtonClass(num)"
                        >
                          {{ num }}
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Navigation -->
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <button
                    (click)="previousQuestion()"
                    [disabled]="currentStep() === 1"
                    class="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>

                  @if (currentStep() < template()!.questions.length) {
                    <button
                      (click)="nextQuestion()"
                      [disabled]="currentAnswer() === null && currentQuestion()?.required"
                      class="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Continue
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  } @else {
                    <button
                      (click)="submitAssessment()"
                      [disabled]="currentAnswer() === null && currentQuestion()?.required"
                      class="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Submit
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Encouragement message -->
            <p class="text-center text-sm text-gray-500 mt-4">
              {{ getEncouragementMessage() }}
            </p>
          }
        }

        <!-- Completion screen -->
        @if (completed()) {
          <div class="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-5xl">🎉</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">All done!</h2>
            <p class="text-gray-600 mb-6">
              Thank you for completing this questionnaire. Your responses have been securely saved and will help your care team support you better.
            </p>

            <div class="bg-blue-50 rounded-xl p-4 mb-6">
              <p class="text-sm text-blue-800">
                <strong>What happens next?</strong><br>
                Your care team will review your responses and may reach out if they have any follow-up questions.
              </p>
            </div>

            <p class="text-sm text-gray-500">
              You can safely close this page now.
            </p>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3">
        <div class="max-w-2xl mx-auto px-4">
          <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Secure & encrypted</span>
            <span>•</span>
            <span>HIPAA compliant</span>
            <span>•</span>
            <a href="#" class="hover:text-gray-600">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PatientAssessmentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  assessmentService = inject(AssessmentService);

  assessment = signal<PatientAssessment | null>(null);
  template = signal<AssessmentTemplate | null>(null);
  currentStep = signal(0); // 0 = welcome, 1+ = questions
  completed = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);

  // Track answers locally
  private answers = signal<Map<string, number | string | boolean>>(new Map());

  currentQuestion = computed(() => {
    const t = this.template();
    const step = this.currentStep();
    if (!t || step === 0 || step > t.questions.length) return null;
    return t.questions[step - 1];
  });

  currentAnswer = computed(() => {
    const q = this.currentQuestion();
    if (!q) return null;
    return this.answers().get(q.id) ?? null;
  });

  progressPercent = computed(() => {
    const t = this.template();
    const step = this.currentStep();
    if (!t || step === 0) return 0;
    return (step / t.questions.length) * 100;
  });

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.loadAssessment(token);
    } else {
      this.error.set('Invalid link. Please check the link and try again.');
      this.loading.set(false);
    }
  }

  async loadAssessment(token: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const assessment = await this.assessmentService.loadAssessmentByToken(token);
      if (assessment) {
        this.assessment.set(assessment);
        this.template.set(ASSESSMENT_TEMPLATES[assessment.assessmentType]);

        // Load any existing answers
        const answersMap = new Map<string, number | string | boolean>();
        assessment.responses.forEach(r => {
          answersMap.set(r.questionId, r.value);
        });
        this.answers.set(answersMap);
      } else {
        this.error.set(this.assessmentService.error() || 'Unable to load questionnaire.');
      }
    } catch (e) {
      this.error.set('Something went wrong. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  startAssessment() {
    this.currentStep.set(1);
  }

  selectAnswer(value: number | string | boolean) {
    const q = this.currentQuestion();
    if (!q) return;

    this.answers.update(map => {
      const newMap = new Map(map);
      newMap.set(q.id, value);
      return newMap;
    });

    // Save to service
    const a = this.assessment();
    if (a) {
      this.assessmentService.saveResponse(a.id, q.id, value);
    }
  }

  nextQuestion() {
    const t = this.template();
    if (!t) return;

    if (this.currentStep() < t.questions.length) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousQuestion() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  submitAssessment() {
    const a = this.assessment();
    if (!a) return;

    // Save final answer if any
    const q = this.currentQuestion();
    const answer = this.currentAnswer();
    if (q && answer !== null) {
      this.assessmentService.saveResponse(a.id, q.id, answer);
    }

    // Complete the assessment
    this.assessmentService.completeAssessment(a.id);
    this.completed.set(true);
  }

  getOptionClass(value: number | string): string {
    const isSelected = this.currentAnswer() === value;
    const base = 'w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all text-left';

    if (isSelected) {
      return `${base} border-blue-600 bg-blue-50 text-blue-900`;
    }
    return `${base} border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700`;
  }

  getScaleButtonClass(num: number): string {
    const isSelected = this.currentAnswer() === num;
    const base = 'flex-1 py-4 rounded-xl font-semibold text-lg transition-all';

    if (isSelected) {
      return `${base} bg-blue-600 text-white`;
    }
    return `${base} bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700`;
  }

  getScaleNumbers(): number[] {
    const q = this.currentQuestion();
    if (!q || q.minValue === undefined || q.maxValue === undefined) return [];
    const nums = [];
    for (let i = q.minValue; i <= q.maxValue; i++) {
      nums.push(i);
    }
    return nums;
  }

  getEncouragementMessage(): string {
    const messages = [
      "You're doing great! Take your time with each question.",
      "Thank you for being honest with your answers.",
      "Your responses help us understand how to support you better.",
      "Almost there! Just a few more questions.",
      "Remember, there are no right or wrong answers."
    ];
    return messages[this.currentStep() % messages.length];
  }
}
