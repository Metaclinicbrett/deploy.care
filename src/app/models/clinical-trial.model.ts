/**
 * Clinical Trial Models
 * Based on ClinicalTrials.gov API and FHIR ResearchStudy resource
 *
 * Used for matching patients to potentially qualifying clinical trials
 * based on their condition, demographics, and eligibility criteria.
 */

// ============================================
// Trial Status
// ============================================

export type TrialStatus =
  | 'RECRUITING'
  | 'NOT_YET_RECRUITING'
  | 'ACTIVE_NOT_RECRUITING'
  | 'COMPLETED'
  | 'ENROLLING_BY_INVITATION'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'WITHDRAWN'
  | 'AVAILABLE'
  | 'NO_LONGER_AVAILABLE'
  | 'TEMPORARILY_NOT_AVAILABLE'
  | 'APPROVED_FOR_MARKETING'
  | 'WITHHELD'
  | 'UNKNOWN';

export type TrialPhase =
  | 'EARLY_PHASE1'
  | 'PHASE1'
  | 'PHASE2'
  | 'PHASE3'
  | 'PHASE4'
  | 'NA';

export type StudyType =
  | 'INTERVENTIONAL'
  | 'OBSERVATIONAL'
  | 'EXPANDED_ACCESS';

export type Sex = 'ALL' | 'FEMALE' | 'MALE';

// ============================================
// Trial Location
// ============================================

export interface TrialLocation {
  facility?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  geoPoint?: {
    lat: number;
    lon: number;
  };
  distance?: number; // Miles from patient
}

// ============================================
// Trial Contact
// ============================================

export interface TrialContact {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
}

// ============================================
// Eligibility Criteria
// ============================================

export interface EligibilityCriteria {
  criteria?: string; // Full text
  healthyVolunteers?: boolean;
  sex?: Sex;
  minimumAge?: string; // e.g., "18 Years"
  maximumAge?: string; // e.g., "65 Years"
  stdAges?: string[]; // CHILD, ADULT, OLDER_ADULT
}

// ============================================
// Intervention/Arm
// ============================================

export interface TrialIntervention {
  type?: string; // Drug, Device, Procedure, etc.
  name?: string;
  description?: string;
  armGroupLabels?: string[];
  otherNames?: string[];
}

export interface TrialArm {
  label?: string;
  type?: string;
  description?: string;
  interventionNames?: string[];
}

// ============================================
// Outcome Measure (Endpoint)
// ============================================

export interface OutcomeMeasure {
  measure?: string;
  description?: string;
  timeFrame?: string;
  type?: 'PRIMARY' | 'SECONDARY' | 'OTHER';
}

// ============================================
// Sponsor
// ============================================

export interface TrialSponsor {
  name?: string;
  class?: string; // INDUSTRY, NIH, FED, OTHER, NETWORK, OTHER_GOV
  leadOrCollaborator?: 'LEAD' | 'COLLABORATOR';
}

// ============================================
// Clinical Trial
// ============================================

export interface ClinicalTrial {
  nctId: string;
  title?: string;
  briefTitle?: string;
  officialTitle?: string;
  acronym?: string;
  status?: TrialStatus;
  statusVerifiedDate?: string;
  phase?: TrialPhase;
  studyType?: StudyType;
  briefSummary?: string;
  detailedDescription?: string;
  conditions?: string[];
  keywords?: string[];
  enrollment?: number;
  enrollmentType?: 'ACTUAL' | 'ESTIMATED';
  startDate?: string;
  startDateType?: 'ACTUAL' | 'ESTIMATED';
  primaryCompletionDate?: string;
  completionDate?: string;
  studyFirstSubmitDate?: string;
  studyFirstPostDate?: string;
  lastUpdatePostDate?: string;
  resultsFirstPostDate?: string;

  // Eligibility
  eligibility?: EligibilityCriteria;

  // Design
  interventions?: TrialIntervention[];
  arms?: TrialArm[];
  primaryOutcomes?: OutcomeMeasure[];
  secondaryOutcomes?: OutcomeMeasure[];

  // Sponsors and contacts
  sponsors?: TrialSponsor[];
  overallOfficials?: TrialContact[];
  centralContacts?: TrialContact[];

  // Locations
  locations?: TrialLocation[];
  locationCountries?: string[];

  // IDs
  orgStudyId?: string;
  secondaryIds?: string[];

  // Links
  resultsUrl?: string;
  ctgovUrl?: string;
}

// ============================================
// Patient Match Criteria
// ============================================

export interface PatientMatchCriteria {
  // Demographics
  age?: number;
  sex?: 'male' | 'female' | 'other';
  birthDate?: string;

  // Location
  zipCode?: string;
  city?: string;
  state?: string;
  maxDistance?: number; // Miles

  // Medical conditions (ICD-10 or text)
  conditions?: string[];
  diagnoses?: Array<{
    code?: string;
    display?: string;
  }>;

  // Other eligibility
  eligibilityKeywords?: string[];

  // Preferences
  healthyVolunteer?: boolean;
  preferredPhases?: TrialPhase[];
  excludePhases?: TrialPhase[];
  preferredStatuses?: TrialStatus[];
}

// ============================================
// Trial Search Request
// ============================================

export interface TrialSearchRequest {
  condition?: string;
  intervention?: string;
  location?: string;
  sponsor?: string;
  phase?: TrialPhase[];
  status?: TrialStatus[];
  studyType?: StudyType;
  minAge?: string;
  maxAge?: string;
  sex?: Sex;
  eligibilityKeywords?: string;
  pageSize?: number;
  pageToken?: string;
  countTotal?: boolean;
}

// ============================================
// Trial Search Response
// ============================================

export interface TrialSearchResponse {
  trials: ClinicalTrial[];
  totalCount?: number;
  nextPageToken?: string;
  searchTerms?: string;
}

// ============================================
// Patient Trial Match
// ============================================

export interface PatientTrialMatch {
  trial: ClinicalTrial;
  matchScore: number; // 0-100
  matchReasons: string[];
  potentialIssues?: string[];
  nearestLocation?: TrialLocation;
  status: 'potential' | 'eligible' | 'ineligible' | 'needs_review';
}

// ============================================
// Saved Trial Interest
// ============================================

export interface SavedTrialInterest {
  id: string;
  patientId: string;
  caseId?: string;
  nctId: string;
  trialTitle?: string;
  status: 'interested' | 'contacted' | 'enrolled' | 'declined' | 'ineligible';
  notes?: string;
  contactedDate?: string;
  enrolledDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse age string to years (e.g., "18 Years" -> 18)
 */
export function parseAgeToYears(ageString: string | undefined): number | undefined {
  if (!ageString) return undefined;

  const match = ageString.match(/(\d+)\s*(Years?|Months?|Days?|Weeks?)/i);
  if (!match) return undefined;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('year')) return value;
  if (unit.startsWith('month')) return Math.floor(value / 12);
  if (unit.startsWith('week')) return Math.floor(value / 52);
  if (unit.startsWith('day')) return Math.floor(value / 365);

  return value;
}

/**
 * Check if patient age is within trial age range
 */
export function isAgeEligible(
  patientAge: number,
  minAge: string | undefined,
  maxAge: string | undefined
): boolean {
  const min = parseAgeToYears(minAge) || 0;
  const max = parseAgeToYears(maxAge) || 999;
  return patientAge >= min && patientAge <= max;
}

/**
 * Get friendly status display
 */
export function getTrialStatusDisplay(status: TrialStatus): string {
  const displays: Record<TrialStatus, string> = {
    'RECRUITING': 'Recruiting',
    'NOT_YET_RECRUITING': 'Not Yet Recruiting',
    'ACTIVE_NOT_RECRUITING': 'Active, Not Recruiting',
    'COMPLETED': 'Completed',
    'ENROLLING_BY_INVITATION': 'Enrolling by Invitation',
    'SUSPENDED': 'Suspended',
    'TERMINATED': 'Terminated',
    'WITHDRAWN': 'Withdrawn',
    'AVAILABLE': 'Available',
    'NO_LONGER_AVAILABLE': 'No Longer Available',
    'TEMPORARILY_NOT_AVAILABLE': 'Temporarily Not Available',
    'APPROVED_FOR_MARKETING': 'Approved for Marketing',
    'WITHHELD': 'Withheld',
    'UNKNOWN': 'Unknown'
  };
  return displays[status] || status;
}

/**
 * Get status color class
 */
export function getTrialStatusColor(status: TrialStatus): string {
  switch (status) {
    case 'RECRUITING':
      return 'bg-green-100 text-green-800';
    case 'NOT_YET_RECRUITING':
    case 'ENROLLING_BY_INVITATION':
      return 'bg-blue-100 text-blue-800';
    case 'ACTIVE_NOT_RECRUITING':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800';
    case 'SUSPENDED':
    case 'TERMINATED':
    case 'WITHDRAWN':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

/**
 * Get phase display
 */
export function getPhaseDisplay(phase: TrialPhase): string {
  const displays: Record<TrialPhase, string> = {
    'EARLY_PHASE1': 'Early Phase 1',
    'PHASE1': 'Phase 1',
    'PHASE2': 'Phase 2',
    'PHASE3': 'Phase 3',
    'PHASE4': 'Phase 4',
    'NA': 'N/A'
  };
  return displays[phase] || phase;
}

/**
 * Calculate match score based on criteria
 */
export function calculateMatchScore(
  trial: ClinicalTrial,
  criteria: PatientMatchCriteria
): PatientTrialMatch {
  let score = 0;
  const reasons: string[] = [];
  const issues: string[] = [];

  // Status check (recruiting is best)
  if (trial.status === 'RECRUITING') {
    score += 30;
    reasons.push('Currently recruiting');
  } else if (trial.status === 'NOT_YET_RECRUITING') {
    score += 15;
    reasons.push('Will be recruiting soon');
  } else {
    issues.push(`Trial status: ${getTrialStatusDisplay(trial.status || 'UNKNOWN')}`);
  }

  // Age eligibility
  if (criteria.age && trial.eligibility) {
    if (isAgeEligible(criteria.age, trial.eligibility.minimumAge, trial.eligibility.maximumAge)) {
      score += 25;
      reasons.push('Age eligible');
    } else {
      issues.push('Age may not meet criteria');
    }
  }

  // Sex eligibility
  if (criteria.sex && trial.eligibility?.sex) {
    const trialSex = trial.eligibility.sex;
    if (trialSex === 'ALL' ||
        (trialSex === 'MALE' && criteria.sex === 'male') ||
        (trialSex === 'FEMALE' && criteria.sex === 'female')) {
      score += 15;
    } else {
      issues.push('Sex does not match eligibility');
    }
  }

  // Condition match
  if (criteria.conditions && trial.conditions) {
    const matchedConditions = criteria.conditions.filter(c =>
      trial.conditions!.some(tc =>
        tc.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(tc.toLowerCase())
      )
    );
    if (matchedConditions.length > 0) {
      score += 20;
      reasons.push(`Condition match: ${matchedConditions.join(', ')}`);
    }
  }

  // Location proximity
  if (trial.locations && trial.locations.length > 0) {
    if (criteria.state && trial.locations.some(l => l.state === criteria.state)) {
      score += 10;
      reasons.push('Location in same state');
    } else if (trial.locations.some(l => l.country === 'United States')) {
      score += 5;
      reasons.push('US locations available');
    }
  }

  // Determine status
  let status: PatientTrialMatch['status'] = 'potential';
  if (issues.length > 2) {
    status = 'needs_review';
  } else if (score >= 70 && issues.length === 0) {
    status = 'eligible';
  } else if (issues.some(i => i.includes('Sex does not match') || i.includes('Age'))) {
    status = 'ineligible';
  }

  return {
    trial,
    matchScore: Math.min(score, 100),
    matchReasons: reasons,
    potentialIssues: issues.length > 0 ? issues : undefined,
    nearestLocation: trial.locations?.[0],
    status
  };
}

// ============================================
// Common Condition Mappings (ICD-10 to search terms)
// ============================================

export const CONDITION_SEARCH_TERMS: Record<string, string[]> = {
  // Traumatic Brain Injury
  'S06': ['traumatic brain injury', 'TBI', 'concussion', 'head injury'],
  'S06.0': ['concussion', 'mild TBI', 'mTBI'],
  'S06.1': ['traumatic cerebral edema'],

  // Chronic Pain
  'G89': ['chronic pain', 'pain syndrome'],
  'M54.5': ['low back pain', 'lumbar pain', 'back pain'],
  'M54.2': ['cervicalgia', 'neck pain'],

  // Depression
  'F32': ['depression', 'major depressive disorder', 'MDD'],
  'F33': ['recurrent depression', 'major depressive disorder'],

  // Anxiety
  'F41': ['anxiety', 'generalized anxiety disorder', 'GAD'],
  'F41.1': ['generalized anxiety disorder', 'GAD'],

  // Post-concussion
  'F07.81': ['post-concussion syndrome', 'postconcussional syndrome'],

  // PTSD
  'F43.1': ['PTSD', 'post-traumatic stress disorder'],

  // Fibromyalgia
  'M79.7': ['fibromyalgia', 'fibromyalgia syndrome'],

  // Migraines
  'G43': ['migraine', 'migraine headache'],

  // Whiplash
  'S13.4': ['whiplash', 'cervical sprain', 'neck sprain'],
};

/**
 * Get search terms for an ICD-10 code
 */
export function getSearchTermsForCondition(icd10Code: string): string[] {
  // Try exact match
  if (CONDITION_SEARCH_TERMS[icd10Code]) {
    return CONDITION_SEARCH_TERMS[icd10Code];
  }

  // Try prefix match (e.g., S06.0X -> S06.0 -> S06)
  const parts = icd10Code.split('.');
  while (parts.length > 0) {
    const prefix = parts.join('.');
    if (CONDITION_SEARCH_TERMS[prefix]) {
      return CONDITION_SEARCH_TERMS[prefix];
    }
    parts.pop();
  }

  return [];
}
