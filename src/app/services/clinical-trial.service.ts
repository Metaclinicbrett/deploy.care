/**
 * Clinical Trial Service
 *
 * Service for searching ClinicalTrials.gov and matching patients to trials.
 * Interfaces with the ClinicalTrials.gov API through backend endpoints.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import {
  ClinicalTrial,
  TrialSearchRequest,
  TrialSearchResponse,
  PatientMatchCriteria,
  PatientTrialMatch,
  SavedTrialInterest,
  TrialStatus,
  TrialPhase,
  calculateMatchScore,
  getSearchTermsForCondition
} from '../models/clinical-trial.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ClinicalTrialService {
  private supabase = inject(SupabaseService);

  // State
  private _trials = signal<ClinicalTrial[]>([]);
  private _matches = signal<PatientTrialMatch[]>([]);
  private _savedInterests = signal<SavedTrialInterest[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _totalCount = signal<number | undefined>(undefined);

  // Public signals
  trials = this._trials.asReadonly();
  matches = this._matches.asReadonly();
  savedInterests = this._savedInterests.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  totalCount = this._totalCount.asReadonly();

  // Computed
  recruitingTrials = computed(() =>
    this._trials().filter(t => t.status === 'RECRUITING')
  );

  eligibleMatches = computed(() =>
    this._matches().filter(m => m.status === 'eligible' || m.status === 'potential')
  );

  /**
   * Search for clinical trials
   */
  async searchTrials(request: TrialSearchRequest): Promise<TrialSearchResponse> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Build query params
      const params = new URLSearchParams();

      if (request.condition) {
        params.append('query.cond', request.condition);
      }
      if (request.intervention) {
        params.append('query.intr', request.intervention);
      }
      if (request.location) {
        params.append('query.locn', request.location);
      }
      if (request.status && request.status.length > 0) {
        params.append('filter.overallStatus', request.status.join(','));
      } else {
        // Default to recruiting
        params.append('filter.overallStatus', 'RECRUITING');
      }
      if (request.phase && request.phase.length > 0) {
        params.append('filter.phase', request.phase.join(','));
      }
      if (request.studyType) {
        params.append('filter.studyType', request.studyType);
      }

      params.append('pageSize', String(request.pageSize || 20));
      if (request.pageToken) {
        params.append('pageToken', request.pageToken);
      }
      if (request.countTotal) {
        params.append('countTotal', 'true');
      }

      // For now, use mock data since we don't have a backend
      // In production, this would call the backend which uses the MCP tools
      const response = await this.mockSearchTrials(request);

      this._trials.set(response.trials);
      this._totalCount.set(response.totalCount);

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search trials';
      this._error.set(message);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Search trials by patient eligibility criteria
   */
  async searchByEligibility(criteria: PatientMatchCriteria): Promise<PatientTrialMatch[]> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Convert patient criteria to search terms
      const searchTerms: string[] = [];

      // Add conditions
      if (criteria.conditions) {
        searchTerms.push(...criteria.conditions);
      }
      if (criteria.diagnoses) {
        for (const dx of criteria.diagnoses) {
          if (dx.code) {
            const terms = getSearchTermsForCondition(dx.code);
            searchTerms.push(...terms);
          }
          if (dx.display) {
            searchTerms.push(dx.display);
          }
        }
      }

      // Build request
      const request: TrialSearchRequest = {
        condition: searchTerms.join(' OR '),
        status: criteria.preferredStatuses || ['RECRUITING'],
        phase: criteria.preferredPhases,
        location: criteria.state || criteria.city,
        pageSize: 50,
        countTotal: true
      };

      // Add age filters
      if (criteria.age) {
        request.minAge = `${Math.max(0, criteria.age - 1)} Years`;
        request.maxAge = `${criteria.age + 1} Years`;
      }

      // Add sex filter
      if (criteria.sex) {
        request.sex = criteria.sex === 'male' ? 'MALE' :
                      criteria.sex === 'female' ? 'FEMALE' : 'ALL';
      }

      // Search trials
      const response = await this.searchTrials(request);

      // Calculate match scores
      const matches = response.trials.map(trial =>
        calculateMatchScore(trial, criteria)
      );

      // Sort by score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      this._matches.set(matches);
      return matches;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to match trials';
      this._error.set(message);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Get trial details by NCT ID
   */
  async getTrialDetails(nctId: string): Promise<ClinicalTrial | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // In production, this would call the backend
      const trial = await this.mockGetTrialDetails(nctId);
      return trial;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get trial details';
      this._error.set(message);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Save trial interest for a patient
   */
  async saveTrialInterest(
    patientId: string,
    nctId: string,
    trialTitle: string,
    caseId?: string
  ): Promise<SavedTrialInterest> {
    const interest: SavedTrialInterest = {
      id: crypto.randomUUID(),
      patientId,
      caseId,
      nctId,
      trialTitle,
      status: 'interested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this._savedInterests.update(list => [...list, interest]);

    // In production, save to Supabase
    // await this.supabase.client.from('trial_interests').insert(interest);

    return interest;
  }

  /**
   * Update trial interest status
   */
  updateTrialInterestStatus(
    interestId: string,
    status: SavedTrialInterest['status'],
    notes?: string
  ): void {
    this._savedInterests.update(list =>
      list.map(i => {
        if (i.id !== interestId) return i;

        const updated: SavedTrialInterest = {
          ...i,
          status,
          notes: notes || i.notes,
          updatedAt: new Date().toISOString()
        };

        if (status === 'contacted') {
          updated.contactedDate = new Date().toISOString();
        }
        if (status === 'enrolled') {
          updated.enrolledDate = new Date().toISOString();
        }

        return updated;
      })
    );
  }

  /**
   * Get saved interests for a patient
   */
  getPatientInterests(patientId: string): SavedTrialInterest[] {
    return this._savedInterests().filter(i => i.patientId === patientId);
  }

  // ============================================
  // Mock Data (Replace with backend calls)
  // ============================================

  private async mockSearchTrials(request: TrialSearchRequest): Promise<TrialSearchResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock trials based on search criteria
    const mockTrials: ClinicalTrial[] = [
      {
        nctId: 'NCT05123456',
        briefTitle: 'Study of Novel Treatment for Traumatic Brain Injury',
        officialTitle: 'A Phase 3, Randomized, Double-Blind, Placebo-Controlled Study of Novel Neuroprotective Agent in Patients with Mild to Moderate Traumatic Brain Injury',
        status: 'RECRUITING',
        phase: 'PHASE3',
        studyType: 'INTERVENTIONAL',
        briefSummary: 'This study evaluates the safety and efficacy of a novel neuroprotective agent in patients who have experienced mild to moderate traumatic brain injury within the past 72 hours.',
        conditions: ['Traumatic Brain Injury', 'Concussion', 'Head Injury'],
        enrollment: 450,
        enrollmentType: 'ESTIMATED',
        startDate: '2024-01-15',
        eligibility: {
          criteria: 'Inclusion Criteria:\n- Age 18-65 years\n- Diagnosed with mild to moderate TBI\n- Injury within 72 hours\n\nExclusion Criteria:\n- Severe TBI\n- Previous neurosurgery\n- Pregnancy',
          healthyVolunteers: false,
          sex: 'ALL',
          minimumAge: '18 Years',
          maximumAge: '65 Years',
          stdAges: ['ADULT', 'OLDER_ADULT']
        },
        sponsors: [{ name: 'Neurogen Therapeutics', class: 'INDUSTRY', leadOrCollaborator: 'LEAD' }],
        locations: [
          { facility: 'UCLA Medical Center', city: 'Los Angeles', state: 'CA', country: 'United States', status: 'Recruiting' },
          { facility: 'Stanford Hospital', city: 'Stanford', state: 'CA', country: 'United States', status: 'Recruiting' },
          { facility: 'Mayo Clinic', city: 'Rochester', state: 'MN', country: 'United States', status: 'Recruiting' }
        ],
        primaryOutcomes: [
          { measure: 'Change in Glasgow Outcome Scale Extended', timeFrame: '6 months', type: 'PRIMARY' }
        ],
        ctgovUrl: 'https://clinicaltrials.gov/study/NCT05123456'
      },
      {
        nctId: 'NCT05234567',
        briefTitle: 'Cognitive Rehabilitation for Post-Concussion Syndrome',
        officialTitle: 'Randomized Controlled Trial of Computerized Cognitive Rehabilitation in Adults with Post-Concussion Syndrome',
        status: 'RECRUITING',
        phase: 'NA',
        studyType: 'INTERVENTIONAL',
        briefSummary: 'This study investigates the effectiveness of a computerized cognitive rehabilitation program for adults experiencing persistent symptoms following concussion.',
        conditions: ['Post-Concussion Syndrome', 'Mild Traumatic Brain Injury'],
        enrollment: 200,
        enrollmentType: 'ESTIMATED',
        startDate: '2024-03-01',
        eligibility: {
          criteria: 'Inclusion Criteria:\n- Age 18-55 years\n- Diagnosed with post-concussion syndrome\n- Symptoms persisting >3 months\n\nExclusion Criteria:\n- History of moderate/severe TBI\n- Current psychiatric condition',
          healthyVolunteers: false,
          sex: 'ALL',
          minimumAge: '18 Years',
          maximumAge: '55 Years',
          stdAges: ['ADULT']
        },
        sponsors: [{ name: 'University of California', class: 'OTHER', leadOrCollaborator: 'LEAD' }],
        locations: [
          { facility: 'UC San Diego Health', city: 'San Diego', state: 'CA', country: 'United States', status: 'Recruiting' }
        ],
        primaryOutcomes: [
          { measure: 'Rivermead Post-Concussion Symptoms Questionnaire', timeFrame: '12 weeks', type: 'PRIMARY' }
        ],
        ctgovUrl: 'https://clinicaltrials.gov/study/NCT05234567'
      },
      {
        nctId: 'NCT05345678',
        briefTitle: 'Physical Therapy for Chronic Low Back Pain',
        officialTitle: 'Comparison of Manual Therapy vs Exercise-Based Physical Therapy for Chronic Non-Specific Low Back Pain',
        status: 'RECRUITING',
        phase: 'NA',
        studyType: 'INTERVENTIONAL',
        briefSummary: 'This study compares the effectiveness of manual therapy versus exercise-based physical therapy approaches for treating chronic low back pain.',
        conditions: ['Chronic Low Back Pain', 'Lumbar Pain', 'Back Pain'],
        enrollment: 300,
        enrollmentType: 'ESTIMATED',
        startDate: '2024-02-01',
        eligibility: {
          criteria: 'Inclusion Criteria:\n- Age 21-70 years\n- Low back pain >3 months\n- Pain score >4 on VAS\n\nExclusion Criteria:\n- Spinal surgery in past year\n- Red flag symptoms',
          healthyVolunteers: false,
          sex: 'ALL',
          minimumAge: '21 Years',
          maximumAge: '70 Years',
          stdAges: ['ADULT', 'OLDER_ADULT']
        },
        sponsors: [{ name: 'National Institutes of Health', class: 'NIH', leadOrCollaborator: 'LEAD' }],
        locations: [
          { facility: 'Johns Hopkins Hospital', city: 'Baltimore', state: 'MD', country: 'United States', status: 'Recruiting' },
          { facility: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', country: 'United States', status: 'Recruiting' }
        ],
        primaryOutcomes: [
          { measure: 'Oswestry Disability Index', timeFrame: '6 months', type: 'PRIMARY' },
          { measure: 'Pain VAS', timeFrame: '6 months', type: 'PRIMARY' }
        ],
        ctgovUrl: 'https://clinicaltrials.gov/study/NCT05345678'
      },
      {
        nctId: 'NCT05456789',
        briefTitle: 'Novel Antidepressant for Treatment-Resistant Depression',
        officialTitle: 'A Phase 2 Study of Rapid-Acting Antidepressant in Patients with Treatment-Resistant Major Depressive Disorder',
        status: 'RECRUITING',
        phase: 'PHASE2',
        studyType: 'INTERVENTIONAL',
        briefSummary: 'This study evaluates a novel rapid-acting antidepressant compound in patients who have not responded to standard antidepressant therapies.',
        conditions: ['Major Depressive Disorder', 'Treatment-Resistant Depression'],
        enrollment: 150,
        enrollmentType: 'ESTIMATED',
        startDate: '2024-01-01',
        eligibility: {
          criteria: 'Inclusion Criteria:\n- Age 18-65 years\n- Diagnosis of MDD\n- Failed ≥2 antidepressant trials\n- PHQ-9 ≥15\n\nExclusion Criteria:\n- Bipolar disorder\n- Active suicidal ideation\n- Substance use disorder',
          healthyVolunteers: false,
          sex: 'ALL',
          minimumAge: '18 Years',
          maximumAge: '65 Years',
          stdAges: ['ADULT', 'OLDER_ADULT']
        },
        sponsors: [{ name: 'Mindset Pharmaceuticals', class: 'INDUSTRY', leadOrCollaborator: 'LEAD' }],
        locations: [
          { facility: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', country: 'United States', status: 'Recruiting' },
          { facility: 'Emory University Hospital', city: 'Atlanta', state: 'GA', country: 'United States', status: 'Recruiting' }
        ],
        primaryOutcomes: [
          { measure: 'Montgomery-Åsberg Depression Rating Scale', timeFrame: '4 weeks', type: 'PRIMARY' }
        ],
        ctgovUrl: 'https://clinicaltrials.gov/study/NCT05456789'
      }
    ];

    // Filter based on request
    let filtered = mockTrials;

    if (request.condition) {
      const searchLower = request.condition.toLowerCase();
      filtered = filtered.filter(t =>
        t.conditions?.some(c => c.toLowerCase().includes(searchLower)) ||
        t.briefTitle?.toLowerCase().includes(searchLower) ||
        t.briefSummary?.toLowerCase().includes(searchLower)
      );
    }

    if (request.phase && request.phase.length > 0) {
      filtered = filtered.filter(t => request.phase!.includes(t.phase!));
    }

    return {
      trials: filtered,
      totalCount: filtered.length,
      searchTerms: request.condition
    };
  }

  private async mockGetTrialDetails(nctId: string): Promise<ClinicalTrial | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const response = await this.mockSearchTrials({});
    return response.trials.find(t => t.nctId === nctId) || null;
  }
}
