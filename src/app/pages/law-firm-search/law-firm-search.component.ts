import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CaseCoordinationService } from '../../services/case-coordination.service';
import { AuthService } from '../../services/auth.service';
import {
  LawFirmSearchFilters,
  CarePlanSummary,
  formatCurrency
} from '../../models/care-coordination.model';

@Component({
  selector: 'app-law-firm-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center gap-4">
            <a routerLink="/law-firm/dashboard" class="text-gray-500 hover:text-gray-700">
              ← Back
            </a>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Search Care Models</h1>
              <p class="text-gray-600 mt-1">Find care models by diagnosis codes or symptoms</p>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h2 class="font-semibold text-gray-900 mb-4">Search Filters</h2>

              <!-- Diagnosis Code Search -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ICD-10 Diagnosis Codes
                </label>
                <input
                  type="text"
                  [(ngModel)]="diagnosisInput"
                  (keyup.enter)="addDiagnosisCode()"
                  placeholder="e.g., S06.0X1A"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                <p class="text-xs text-gray-500 mt-1">Press Enter to add</p>
                @if (selectedDiagnosisCodes().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (code of selectedDiagnosisCodes(); track code) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {{ code }}
                        <button (click)="removeDiagnosisCode(code)" class="text-blue-600 hover:text-blue-800">×</button>
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- Symptom Search -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <input
                  type="text"
                  [(ngModel)]="symptomInput"
                  (keyup.enter)="addSymptom()"
                  placeholder="e.g., headache, dizziness"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                @if (selectedSymptoms().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (symptom of selectedSymptoms(); track symptom) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                        {{ symptom }}
                        <button (click)="removeSymptom(symptom)" class="text-purple-600 hover:text-purple-800">×</button>
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- Care Type Filter -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Care Type
                </label>
                <select
                  [(ngModel)]="careType"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="DX">Diagnosis Only (DX)</option>
                  <option value="TX">Treatment Only (TX)</option>
                  <option value="DX/TX">Combined (DX/TX)</option>
                </select>
              </div>

              <!-- Pricing Filter -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Model
                </label>
                <select
                  [(ngModel)]="pricingModel"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Pricing</option>
                  <option value="one-time">One-Time</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>

              <!-- Contracted Only -->
              <div class="mb-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="contractedOnly"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">Contracted clinics only</span>
                </label>
              </div>

              <!-- Search Button -->
              <button
                (click)="search()"
                [disabled]="loading()"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                @if (loading()) {
                  Searching...
                } @else {
                  Search Care Models
                }
              </button>

              <!-- Clear Filters -->
              <button
                (click)="clearFilters()"
                class="w-full mt-2 py-2 px-4 text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <!-- Results -->
          <div class="lg:col-span-3">
            @if (hasSearched() && results().length === 0) {
              <div class="bg-white rounded-xl shadow-sm border p-12 text-center">
                <span class="text-5xl mb-4 block">🔍</span>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No care models found</h3>
                <p class="text-gray-600">
                  Try adjusting your search filters or adding different diagnosis codes
                </p>
              </div>
            }

            @if (!hasSearched()) {
              <div class="bg-white rounded-xl shadow-sm border p-12 text-center">
                <span class="text-5xl mb-4 block">🏥</span>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Search for Care Models</h3>
                <p class="text-gray-600">
                  Enter diagnosis codes or symptoms to find matching care models
                </p>

                <!-- Common Diagnosis Quick Add -->
                <div class="mt-6">
                  <p class="text-sm text-gray-500 mb-3">Quick add common codes:</p>
                  <div class="flex flex-wrap justify-center gap-2">
                    @for (code of commonCodes; track code.code) {
                      <button
                        (click)="quickAddCode(code.code)"
                        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                        [title]="code.description"
                      >
                        {{ code.code }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            }

            @if (results().length > 0) {
              <div class="mb-4 flex justify-between items-center">
                <p class="text-gray-600">
                  Found <span class="font-medium">{{ results().length }}</span> care models
                </p>
                <div class="flex gap-2">
                  <button
                    (click)="viewMode.set('grid')"
                    [class]="'p-2 rounded ' + (viewMode() === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400')"
                  >
                    ⊞
                  </button>
                  <button
                    (click)="viewMode.set('list')"
                    [class]="'p-2 rounded ' + (viewMode() === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400')"
                  >
                    ☰
                  </button>
                </div>
              </div>

              <div [class]="viewMode() === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'">
                @for (model of results(); track model.id) {
                  <div class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                    <div class="p-6">
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <h3 class="font-semibold text-gray-900">{{ model.name }}</h3>
                          <p class="text-sm text-gray-600">{{ model.provider }}</p>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {{ model.care_type }}
                        </span>
                      </div>

                      @if (model.price) {
                        <p class="text-lg font-bold text-gray-900 mb-4">
                          {{ formatCurrency(model.price) }}
                        </p>
                      }

                      <div class="flex gap-2">
                        <button
                          (click)="requestCare(model)"
                          class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Request Care
                        </button>
                        <button
                          (click)="viewDetails(model)"
                          class="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Request Care Modal -->
      @if (showRequestModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Request Care</h3>
                <button (click)="closeRequestModal()" class="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
            <div class="p-6">
              @if (selectedModel()) {
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p class="font-medium text-gray-900">{{ selectedModel()!.name }}</p>
                  <p class="text-sm text-gray-600">{{ selectedModel()!.provider }}</p>
                </div>
              }

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Request Message (Optional)
                </label>
                <textarea
                  [(ngModel)]="requestMessage"
                  rows="4"
                  placeholder="Add any notes about this care request..."
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Selected Diagnosis Codes
                </label>
                <div class="flex flex-wrap gap-2">
                  @for (code of selectedDiagnosisCodes(); track code) {
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {{ code }}
                    </span>
                  }
                  @if (selectedDiagnosisCodes().length === 0) {
                    <span class="text-gray-500 text-sm">No codes selected</span>
                  }
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  (click)="closeRequestModal()"
                  class="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  (click)="submitCareRequest()"
                  [disabled]="submitting()"
                  class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  @if (submitting()) {
                    Submitting...
                  } @else {
                    Submit Request
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (showSuccess()) {
        <div class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span>✓</span>
          Care request submitted successfully!
        </div>
      }
    </div>
  `
})
export class LawFirmSearchComponent implements OnInit {
  private coordinationService = inject(CaseCoordinationService);
  private authService = inject(AuthService);

  // Form inputs
  diagnosisInput = '';
  symptomInput = '';
  careType = '';
  pricingModel = '';
  contractedOnly = false;
  requestMessage = '';

  // State
  private _selectedDiagnosisCodes = signal<string[]>([]);
  private _selectedSymptoms = signal<string[]>([]);
  private _results = signal<CarePlanSummary[]>([]);
  private _hasSearched = signal(false);
  private _selectedModel = signal<CarePlanSummary | null>(null);

  loading = signal(false);
  submitting = signal(false);
  showRequestModal = signal(false);
  showSuccess = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');

  // Public computed
  readonly selectedDiagnosisCodes = this._selectedDiagnosisCodes.asReadonly();
  readonly selectedSymptoms = this._selectedSymptoms.asReadonly();
  readonly results = this._results.asReadonly();
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly selectedModel = this._selectedModel.asReadonly();

  formatCurrency = formatCurrency;

  // Common diagnosis codes for quick add
  commonCodes = [
    { code: 'S06.0X1A', description: 'Concussion with LOC' },
    { code: 'F07.81', description: 'Postconcussional syndrome' },
    { code: 'R51.9', description: 'Headache' },
    { code: 'G43.909', description: 'Migraine' },
    { code: 'F41.1', description: 'Generalized anxiety disorder' },
    { code: 'G47.00', description: 'Insomnia' }
  ];

  ngOnInit() {
    // Load partnerships for contracted filtering
    this.coordinationService.loadPartnerships();
  }

  addDiagnosisCode() {
    const code = this.diagnosisInput.trim().toUpperCase();
    if (code && !this._selectedDiagnosisCodes().includes(code)) {
      this._selectedDiagnosisCodes.update(codes => [...codes, code]);
      this.diagnosisInput = '';
    }
  }

  removeDiagnosisCode(code: string) {
    this._selectedDiagnosisCodes.update(codes => codes.filter(c => c !== code));
  }

  quickAddCode(code: string) {
    if (!this._selectedDiagnosisCodes().includes(code)) {
      this._selectedDiagnosisCodes.update(codes => [...codes, code]);
    }
  }

  addSymptom() {
    const symptom = this.symptomInput.trim().toLowerCase();
    if (symptom && !this._selectedSymptoms().includes(symptom)) {
      this._selectedSymptoms.update(symptoms => [...symptoms, symptom]);
      this.symptomInput = '';
    }
  }

  removeSymptom(symptom: string) {
    this._selectedSymptoms.update(symptoms => symptoms.filter(s => s !== symptom));
  }

  clearFilters() {
    this._selectedDiagnosisCodes.set([]);
    this._selectedSymptoms.set([]);
    this.careType = '';
    this.pricingModel = '';
    this.contractedOnly = false;
    this._results.set([]);
    this._hasSearched.set(false);
  }

  async search() {
    this.loading.set(true);
    this._hasSearched.set(true);

    try {
      const filters: LawFirmSearchFilters = {
        diagnosis_codes: this._selectedDiagnosisCodes().length > 0 ? this._selectedDiagnosisCodes() : undefined,
        symptoms: this._selectedSymptoms().length > 0 ? this._selectedSymptoms() : undefined,
        care_type: this.careType as 'DX' | 'TX' | 'DX/TX' | undefined,
        pricing_model: this.pricingModel as 'subscription' | 'one-time' | undefined,
        contracted_only: this.contractedOnly
      };

      const results = await this.coordinationService.searchCareModels(filters);
      this._results.set(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  requestCare(model: CarePlanSummary) {
    this._selectedModel.set(model);
    this.showRequestModal.set(true);
  }

  closeRequestModal() {
    this.showRequestModal.set(false);
    this._selectedModel.set(null);
    this.requestMessage = '';
  }

  async submitCareRequest() {
    const model = this._selectedModel();
    if (!model) return;

    this.submitting.set(true);

    try {
      await this.coordinationService.createCareRequest({
        care_plan_id: model.id,
        request_message: this.requestMessage,
        diagnosis_codes: this._selectedDiagnosisCodes(),
        symptoms: this._selectedSymptoms()
      });

      this.closeRequestModal();
      this.showSuccess.set(true);
      setTimeout(() => this.showSuccess.set(false), 3000);
    } catch (err) {
      console.error('Error submitting care request:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  viewDetails(model: CarePlanSummary) {
    // TODO: Navigate to care plan detail or show modal
    console.log('View details:', model);
  }
}
