/**
 * Clinical Trials Page Component
 *
 * Search for clinical trials and match patients to potentially qualifying studies.
 * Uses ClinicalTrials.gov data through backend API.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalTrialService } from '../../services/clinical-trial.service';
import {
  ClinicalTrial,
  PatientMatchCriteria,
  PatientTrialMatch,
  TrialStatus,
  TrialPhase,
  getTrialStatusDisplay,
  getTrialStatusColor,
  getPhaseDisplay
} from '../../models/clinical-trial.model';

type ViewMode = 'search' | 'patient-match' | 'saved';

@Component({
  selector: 'app-clinical-trials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Clinical Trials</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search and match patients to qualifying clinical trials
              </p>
            </div>
            <div class="flex items-center gap-3">
              <!-- View Mode Tabs -->
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  (click)="viewMode.set('search')"
                  [class]="viewMode() === 'search'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  Search Trials
                </button>
                <button
                  (click)="viewMode.set('patient-match')"
                  [class]="viewMode() === 'patient-match'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  Patient Match
                </button>
                <button
                  (click)="viewMode.set('saved')"
                  [class]="viewMode() === 'saved'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  Saved ({{ trialService.savedInterests().length }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-6">
        <!-- Search View -->
        @if (viewMode() === 'search') {
          <div class="space-y-6">
            <!-- Search Form -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Clinical Trials</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Condition -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition / Disease
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="searchCondition"
                    placeholder="e.g., traumatic brain injury, depression"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Intervention -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intervention / Treatment
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="searchIntervention"
                    placeholder="e.g., physical therapy, drug name"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Location -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="searchLocation"
                    placeholder="e.g., California, Los Angeles"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    [(ngModel)]="searchStatus"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="RECRUITING">Recruiting</option>
                    <option value="NOT_YET_RECRUITING">Not Yet Recruiting</option>
                    <option value="ACTIVE_NOT_RECRUITING">Active, Not Recruiting</option>
                    <option value="">All Statuses</option>
                  </select>
                </div>

                <!-- Phase -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phase
                  </label>
                  <select
                    [(ngModel)]="searchPhase"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Phases</option>
                    <option value="PHASE1">Phase 1</option>
                    <option value="PHASE2">Phase 2</option>
                    <option value="PHASE3">Phase 3</option>
                    <option value="PHASE4">Phase 4</option>
                  </select>
                </div>

                <!-- Search Button -->
                <div class="flex items-end">
                  <button
                    (click)="performSearch()"
                    [disabled]="trialService.loading()"
                    class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                           font-medium disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                  >
                    @if (trialService.loading()) {
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      Search
                    }
                  </button>
                </div>
              </div>
            </div>

            <!-- Results -->
            @if (trialService.totalCount() !== undefined) {
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Found {{ trialService.totalCount() }} trials
                </p>
              </div>
            }

            <!-- Trial Cards -->
            <div class="space-y-4">
              @for (trial of trialService.trials(); track trial.nctId) {
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <ng-container *ngTemplateOutlet="trialCard; context: { trial: trial }"></ng-container>
                </div>
              } @empty {
                @if (!trialService.loading() && searchPerformed()) {
                  <div class="text-center py-12">
                    <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400">No trials found matching your criteria</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Try broadening your search</p>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- Patient Match View -->
        @if (viewMode() === 'patient-match') {
          <div class="space-y-6">
            <!-- Patient Criteria Form -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Matching Criteria</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter patient details to find potentially qualifying trials
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Age -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="patientAge"
                    placeholder="e.g., 45"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Sex -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sex
                  </label>
                  <select
                    [(ngModel)]="patientSex"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <!-- State -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="patientState"
                    placeholder="e.g., CA"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Conditions -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conditions (comma-separated)
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="patientConditions"
                    placeholder="e.g., TBI, depression, back pain"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div class="mt-4">
                <button
                  (click)="performPatientMatch()"
                  [disabled]="trialService.loading()"
                  class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                         font-medium disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
                >
                  @if (trialService.loading()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Matching...
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Find Matching Trials
                  }
                </button>
              </div>
            </div>

            <!-- Match Results -->
            @if (trialService.matches().length > 0) {
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Potential Matches ({{ trialService.matches().length }})
                </h3>

                @for (match of trialService.matches(); track match.trial.nctId) {
                  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <!-- Match Score Header -->
                    <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div
                        [class]="getMatchScoreClass(match.matchScore)"
                        class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      >
                        {{ match.matchScore }}
                      </div>
                      <div>
                        <span
                          [class]="getMatchStatusClass(match.status)"
                          class="px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {{ getMatchStatusDisplay(match.status) }}
                        </span>
                      </div>
                      <div class="ml-auto flex gap-2">
                        @for (reason of match.matchReasons; track reason) {
                          <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {{ reason }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Trial Info -->
                    <ng-container *ngTemplateOutlet="trialCard; context: { trial: match.trial }"></ng-container>

                    <!-- Potential Issues -->
                    @if (match.potentialIssues && match.potentialIssues.length > 0) {
                      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                          ⚠️ Potential Issues
                        </p>
                        <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          @for (issue of match.potentialIssues; track issue) {
                            <li>• {{ issue }}</li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Saved View -->
        @if (viewMode() === 'saved') {
          <div class="space-y-4">
            @for (interest of trialService.savedInterests(); track interest.id) {
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ interest.trialTitle }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ interest.nctId }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Saved {{ interest.createdAt | date:'medium' }}
                    </p>
                  </div>
                  <span
                    [class]="getSavedStatusClass(interest.status)"
                    class="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ interest.status | titlecase }}
                  </span>
                </div>
                @if (interest.notes) {
                  <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">{{ interest.notes }}</p>
                }
              </div>
            } @empty {
              <div class="text-center py-12">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">No saved trial interests</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Save trials you're interested in for patients
                </p>
              </div>
            }
          </div>
        }
      </main>
    </div>

    <!-- Trial Card Template -->
    <ng-template #trialCard let-trial="trial">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ trial.nctId }}</span>
            @if (trial.phase) {
              <span class="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                {{ getPhaseDisplay(trial.phase) }}
              </span>
            }
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ trial.briefTitle }}</h3>
        </div>
        @if (trial.status) {
          <span
            [class]="getTrialStatusColor(trial.status)"
            class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
          >
            {{ getTrialStatusDisplay(trial.status) }}
          </span>
        }
      </div>

      <!-- Conditions -->
      @if (trial.conditions && trial.conditions.length > 0) {
        <div class="flex flex-wrap gap-2 mb-3">
          @for (condition of trial.conditions.slice(0, 5); track condition) {
            <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
              {{ condition }}
            </span>
          }
        </div>
      }

      <!-- Summary -->
      @if (trial.briefSummary) {
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {{ trial.briefSummary }}
        </p>
      }

      <!-- Metadata Row -->
      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        @if (trial.enrollment) {
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ trial.enrollment }} {{ trial.enrollmentType === 'ESTIMATED' ? 'est.' : '' }} participants
          </span>
        }
        @if (trial.sponsors && trial.sponsors.length > 0) {
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            {{ trial.sponsors[0].name }}
          </span>
        }
        @if (trial.locations && trial.locations.length > 0) {
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ trial.locations.length }} location{{ trial.locations.length > 1 ? 's' : '' }}
          </span>
        }
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <a
          [href]="trial.ctgovUrl || 'https://clinicaltrials.gov/study/' + trial.nctId"
          target="_blank"
          class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
        >
          View on ClinicalTrials.gov
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
        <button
          (click)="saveTrialInterest(trial)"
          class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          Save
        </button>
        <button
          (click)="selectedTrial.set(trial); showDetailsModal.set(true)"
          class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
        >
          View Details
        </button>
      </div>
    </ng-template>
  `
})
export class ClinicalTrialsComponent implements OnInit {
  trialService = inject(ClinicalTrialService);

  // View state
  viewMode = signal<ViewMode>('search');
  searchPerformed = signal(false);
  showDetailsModal = signal(false);
  selectedTrial = signal<ClinicalTrial | null>(null);

  // Search form
  searchCondition = '';
  searchIntervention = '';
  searchLocation = '';
  searchStatus: TrialStatus | '' = 'RECRUITING';
  searchPhase: TrialPhase | '' = '';

  // Patient match form
  patientAge: number | null = null;
  patientSex: 'male' | 'female' | '' = '';
  patientState = '';
  patientConditions = '';

  // Expose utility functions to template
  getTrialStatusDisplay = getTrialStatusDisplay;
  getTrialStatusColor = getTrialStatusColor;
  getPhaseDisplay = getPhaseDisplay;

  ngOnInit() {
    // Could load saved searches or recent trials here
  }

  async performSearch() {
    this.searchPerformed.set(true);

    await this.trialService.searchTrials({
      condition: this.searchCondition || undefined,
      intervention: this.searchIntervention || undefined,
      location: this.searchLocation || undefined,
      status: this.searchStatus ? [this.searchStatus] : undefined,
      phase: this.searchPhase ? [this.searchPhase] : undefined,
      pageSize: 20,
      countTotal: true
    });
  }

  async performPatientMatch() {
    const criteria: PatientMatchCriteria = {
      age: this.patientAge || undefined,
      sex: this.patientSex || undefined,
      state: this.patientState || undefined,
      conditions: this.patientConditions
        ? this.patientConditions.split(',').map(c => c.trim())
        : undefined,
      preferredStatuses: ['RECRUITING', 'NOT_YET_RECRUITING']
    };

    await this.trialService.searchByEligibility(criteria);
  }

  saveTrialInterest(trial: ClinicalTrial) {
    // In production, would prompt for patient selection
    this.trialService.saveTrialInterest(
      'patient-123', // Would come from context
      trial.nctId,
      trial.briefTitle || trial.nctId
    );
  }

  getMatchScoreClass(score: number): string {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  }

  getMatchStatusClass(status: PatientTrialMatch['status']): string {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-700';
      case 'potential': return 'bg-blue-100 text-blue-700';
      case 'needs_review': return 'bg-amber-100 text-amber-700';
      case 'ineligible': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getMatchStatusDisplay(status: PatientTrialMatch['status']): string {
    switch (status) {
      case 'eligible': return 'Likely Eligible';
      case 'potential': return 'Potential Match';
      case 'needs_review': return 'Needs Review';
      case 'ineligible': return 'Ineligible';
      default: return status;
    }
  }

  getSavedStatusClass(status: string): string {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-700';
      case 'contacted': return 'bg-blue-100 text-blue-700';
      case 'interested': return 'bg-purple-100 text-purple-700';
      case 'declined': return 'bg-gray-100 text-gray-600';
      case 'ineligible': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
