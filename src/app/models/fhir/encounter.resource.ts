/**
 * FHIR R4 Encounter Resource
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/encounter.html
 *
 * An Encounter is an interaction between a patient and healthcare provider(s)
 * for the purpose of providing healthcare service(s) or assessing the health status.
 */

import {
  DomainResource,
  Identifier,
  CodeableConcept,
  Coding,
  Reference,
  Period,
  Duration,
  FhirPositiveInt,
  BackboneElement,
  createReference,
  createCodeableConcept,
  FHIR_CODE_SYSTEMS
} from './base.types';

// ============================================
// Encounter Status (Workflow)
// ============================================

/**
 * Encounter Status represents the lifecycle of an encounter.
 *
 * WORKFLOW:
 * planned → arrived → triaged → in-progress → onleave → finished
 *                                    ↓
 *                              cancelled / entered-in-error
 */
export type EncounterStatus =
  | 'planned'           // Encounter has been scheduled
  | 'arrived'           // Patient has arrived but not yet started
  | 'triaged'           // Patient is being triaged
  | 'in-progress'       // Encounter is currently active
  | 'onleave'           // Patient has left temporarily
  | 'finished'          // Encounter has ended
  | 'cancelled'         // Encounter was cancelled
  | 'entered-in-error'  // Entered in error
  | 'unknown';          // Status is unknown

// ============================================
// Encounter Class (Setting)
// ============================================

/**
 * Encounter Class describes the setting where the encounter took place.
 * Based on HL7 ActCode vocabulary.
 */
export type EncounterClass =
  | 'AMB'      // Ambulatory (outpatient)
  | 'EMER'     // Emergency
  | 'FLD'      // Field (home visit, mobile unit)
  | 'HH'       // Home Health
  | 'IMP'      // Inpatient
  | 'ACUTE'    // Inpatient Acute
  | 'NONAC'    // Inpatient Non-Acute
  | 'OBSENC'   // Observation Encounter
  | 'PRENC'    // Pre-admission
  | 'SS'       // Short Stay
  | 'VR';      // Virtual (telehealth)

// ============================================
// Encounter StatusHistory
// ============================================

export interface EncounterStatusHistory extends BackboneElement {
  status: EncounterStatus;
  period: Period;
}

// ============================================
// Encounter ClassHistory
// ============================================

export interface EncounterClassHistory extends BackboneElement {
  class: Coding;
  period: Period;
}

// ============================================
// Encounter Participant
// ============================================

export type ParticipantType =
  | 'ADM'      // Admitter
  | 'ATND'     // Attender
  | 'CALLBCK'  // Callback contact
  | 'CON'      // Consultant
  | 'DIS'      // Discharger
  | 'ESC'      // Escort
  | 'REF'      // Referrer
  | 'SPRF'     // Secondary performer
  | 'PPRF'     // Primary performer
  | 'PART';    // Participation

export interface EncounterParticipant extends BackboneElement {
  type?: CodeableConcept[];
  period?: Period;
  individual?: Reference; // Practitioner, PractitionerRole, RelatedPerson
}

// ============================================
// Encounter Diagnosis
// ============================================

export type DiagnosisUse = 'AD' | 'DD' | 'CC' | 'CM' | 'pre-op' | 'post-op' | 'billing';

export interface EncounterDiagnosis extends BackboneElement {
  condition: Reference; // Condition or Procedure
  use?: CodeableConcept;
  rank?: FhirPositiveInt;
}

// ============================================
// Encounter Hospitalization
// ============================================

export interface EncounterHospitalization extends BackboneElement {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference; // Location or Organization
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  dietPreference?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  destination?: Reference; // Location or Organization
  dischargeDisposition?: CodeableConcept;
}

// ============================================
// Encounter Location
// ============================================

export type EncounterLocationStatus = 'planned' | 'active' | 'reserved' | 'completed';

export interface EncounterLocation extends BackboneElement {
  location: Reference; // Location
  status?: EncounterLocationStatus;
  physicalType?: CodeableConcept;
  period?: Period;
}

// ============================================
// Encounter Resource
// ============================================

export interface Encounter extends DomainResource {
  resourceType: 'Encounter';

  // Business identifiers
  identifier?: Identifier[];

  // Status (required)
  status: EncounterStatus;

  // Status history
  statusHistory?: EncounterStatusHistory[];

  // Class (required) - setting
  class: Coding;

  // Class history
  classHistory?: EncounterClassHistory[];

  // Type (kind of encounter)
  type?: CodeableConcept[];

  // Service type
  serviceType?: CodeableConcept;

  // Priority (emergency, urgent, routine, etc.)
  priority?: CodeableConcept;

  // Subject (required for patient encounters)
  subject?: Reference; // Patient or Group

  // Episode of care
  episodeOfCare?: Reference[]; // EpisodeOfCare

  // Based on (ServiceRequest, etc.)
  basedOn?: Reference[]; // ServiceRequest

  // Participants
  participant?: EncounterParticipant[];

  // Appointment that triggered this encounter
  appointment?: Reference[]; // Appointment

  // Period (start/end time)
  period?: Period;

  // Length of encounter
  length?: Duration;

  // Reason for encounter
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[]; // Condition, Procedure, Observation, ImmunizationRecommendation

  // Diagnoses
  diagnosis?: EncounterDiagnosis[];

  // Accounts for billing
  account?: Reference[]; // Account

  // Hospitalization details
  hospitalization?: EncounterHospitalization;

  // Locations
  location?: EncounterLocation[];

  // Service provider organization
  serviceProvider?: Reference; // Organization

  // Part of another encounter
  partOf?: Reference; // Encounter
}

// ============================================
// Encounter Builder & Utilities
// ============================================

export interface EncounterInput {
  id?: string;
  status: EncounterStatus;
  classCode: EncounterClass;
  patientId: string;
  patientDisplay?: string;
  practitionerId?: string;
  practitionerDisplay?: string;
  organizationId?: string;
  organizationDisplay?: string;
  appointmentId?: string;
  startTime?: string;
  endTime?: string;
  type?: string; // e.g., 'Initial Visit', 'Follow-up', 'Physical Therapy'
  reasonCode?: string; // ICD-10 or SNOMED code
  reasonDisplay?: string;
  locationId?: string;
  locationDisplay?: string;
}

/**
 * Create a FHIR Encounter resource from simple input
 */
export function createEncounter(input: EncounterInput): Encounter {
  const encounter: Encounter = {
    resourceType: 'Encounter',
    id: input.id,
    status: input.status,
    class: {
      system: FHIR_CODE_SYSTEMS.ACT_CODE,
      code: input.classCode,
      display: getEncounterClassDisplay(input.classCode)
    },
    subject: createReference('Patient', input.patientId, input.patientDisplay),
  };

  // Type
  if (input.type) {
    encounter.type = [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/encounter-type',
        display: input.type
      }],
      text: input.type
    }];
  }

  // Period
  if (input.startTime || input.endTime) {
    encounter.period = {
      start: input.startTime,
      end: input.endTime
    };
  }

  // Practitioner participant
  if (input.practitionerId) {
    encounter.participant = [{
      type: [{
        coding: [{
          system: FHIR_CODE_SYSTEMS.PARTICIPANT_TYPE,
          code: 'PPRF',
          display: 'Primary Performer'
        }]
      }],
      individual: createReference('Practitioner', input.practitionerId, input.practitionerDisplay),
      period: encounter.period
    }];
  }

  // Service provider
  if (input.organizationId) {
    encounter.serviceProvider = createReference(
      'Organization',
      input.organizationId,
      input.organizationDisplay
    );
  }

  // Appointment reference
  if (input.appointmentId) {
    encounter.appointment = [createReference('Appointment', input.appointmentId)];
  }

  // Reason
  if (input.reasonCode || input.reasonDisplay) {
    encounter.reasonCode = [{
      coding: input.reasonCode ? [{
        system: FHIR_CODE_SYSTEMS.ICD10_CM,
        code: input.reasonCode,
        display: input.reasonDisplay
      }] : undefined,
      text: input.reasonDisplay
    }];
  }

  // Location
  if (input.locationId) {
    encounter.location = [{
      location: createReference('Location', input.locationId, input.locationDisplay),
      status: input.status === 'in-progress' ? 'active' : 'planned'
    }];
  }

  return encounter;
}

/**
 * Get display text for encounter class
 */
export function getEncounterClassDisplay(classCode: EncounterClass): string {
  const displays: Record<EncounterClass, string> = {
    'AMB': 'Ambulatory',
    'EMER': 'Emergency',
    'FLD': 'Field',
    'HH': 'Home Health',
    'IMP': 'Inpatient',
    'ACUTE': 'Inpatient Acute',
    'NONAC': 'Inpatient Non-Acute',
    'OBSENC': 'Observation',
    'PRENC': 'Pre-Admission',
    'SS': 'Short Stay',
    'VR': 'Virtual'
  };
  return displays[classCode] || classCode;
}

/**
 * Get display text for encounter status
 */
export function getEncounterStatusDisplay(status: EncounterStatus): string {
  const displays: Record<EncounterStatus, string> = {
    'planned': 'Planned',
    'arrived': 'Arrived',
    'triaged': 'Triaged',
    'in-progress': 'In Progress',
    'onleave': 'On Leave',
    'finished': 'Finished',
    'cancelled': 'Cancelled',
    'entered-in-error': 'Entered in Error',
    'unknown': 'Unknown'
  };
  return displays[status] || status;
}

/**
 * Check if encounter can transition to a new status
 */
export function canTransitionTo(currentStatus: EncounterStatus, newStatus: EncounterStatus): boolean {
  const validTransitions: Record<EncounterStatus, EncounterStatus[]> = {
    'planned': ['arrived', 'cancelled', 'entered-in-error'],
    'arrived': ['triaged', 'in-progress', 'cancelled', 'entered-in-error'],
    'triaged': ['in-progress', 'cancelled', 'entered-in-error'],
    'in-progress': ['onleave', 'finished', 'cancelled', 'entered-in-error'],
    'onleave': ['in-progress', 'finished', 'cancelled', 'entered-in-error'],
    'finished': ['entered-in-error'],
    'cancelled': ['entered-in-error'],
    'entered-in-error': [],
    'unknown': ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error']
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Add status change to history
 */
export function addStatusHistory(
  encounter: Encounter,
  newStatus: EncounterStatus,
  startTime: string = new Date().toISOString()
): Encounter {
  // End the current status period
  if (!encounter.statusHistory) {
    encounter.statusHistory = [];
  }

  // If there's an existing status, end it
  if (encounter.statusHistory.length > 0) {
    const lastEntry = encounter.statusHistory[encounter.statusHistory.length - 1];
    if (!lastEntry.period.end) {
      lastEntry.period.end = startTime;
    }
  }

  // Add new status to history
  encounter.statusHistory.push({
    status: encounter.status,
    period: {
      start: encounter.statusHistory.length === 0 ? encounter.period?.start : startTime,
      end: undefined
    }
  });

  // Update current status
  encounter.status = newStatus;

  return encounter;
}

// ============================================
// Common Encounter Types
// ============================================

export const ENCOUNTER_TYPES = {
  INITIAL_VISIT: { code: 'INIT', display: 'Initial Visit' },
  FOLLOW_UP: { code: 'FUP', display: 'Follow-up Visit' },
  ROUTINE_CHECKUP: { code: 'CHECKUP', display: 'Routine Checkup' },
  URGENT_VISIT: { code: 'URGENT', display: 'Urgent Visit' },
  EMERGENCY: { code: 'EMER', display: 'Emergency Visit' },
  PHYSICAL_THERAPY: { code: 'PT', display: 'Physical Therapy' },
  CHIROPRACTIC: { code: 'CHIRO', display: 'Chiropractic Care' },
  CONSULTATION: { code: 'CONSULT', display: 'Consultation' },
  PROCEDURE: { code: 'PROC', display: 'Procedure' },
  TELEHEALTH: { code: 'TELE', display: 'Telehealth Visit' },
  ASSESSMENT: { code: 'ASSESS', display: 'Assessment' },
} as const;

// ============================================
// Admit Source Codes
// ============================================

export const ADMIT_SOURCES = {
  PHYSICIAN_REFERRAL: { code: 'phys', display: 'Physician Referral' },
  TRANSFER: { code: 'trans', display: 'Transferred' },
  EMERGENCY: { code: 'emd', display: 'Emergency Department' },
  BORN: { code: 'born', display: 'Born in Hospital' },
  OTHER: { code: 'other', display: 'Other' },
} as const;

// ============================================
// Discharge Disposition Codes
// ============================================

export const DISCHARGE_DISPOSITIONS = {
  HOME: { code: 'home', display: 'Home' },
  HOME_HEALTH: { code: 'hosp', display: 'Home Health Care' },
  SNF: { code: 'snf', display: 'Skilled Nursing Facility' },
  REHAB: { code: 'rehab', display: 'Rehabilitation Facility' },
  LONG_TERM_CARE: { code: 'long', display: 'Long-term Care' },
  AMA: { code: 'aadvice', display: 'Left Against Medical Advice' },
  EXPIRED: { code: 'exp', display: 'Expired' },
  OTHER: { code: 'oth', display: 'Other' },
} as const;

// ============================================
// Priority Codes
// ============================================

export const ENCOUNTER_PRIORITIES = {
  ASAP: { code: 'A', display: 'ASAP' },
  CALLBACK: { code: 'CR', display: 'Callback Results' },
  ELECTIVE: { code: 'EL', display: 'Elective' },
  EMERGENCY: { code: 'EM', display: 'Emergency' },
  PREOP: { code: 'P', display: 'Preoperative' },
  ROUTINE: { code: 'R', display: 'Routine' },
  STAT: { code: 'S', display: 'Stat' },
  TIMING_CRITICAL: { code: 'T', display: 'Timing Critical' },
  URGENT: { code: 'UR', display: 'Urgent' },
} as const;
