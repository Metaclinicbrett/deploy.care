/**
 * FHIR R4 Appointment Resource
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/appointment.html
 *
 * Appointment is used for establishing a date for the encounter.
 * When the patient actually shows up, an Encounter is created.
 */

import {
  DomainResource,
  Identifier,
  CodeableConcept,
  Reference,
  Period,
  FhirDateTime,
  FhirInstant,
  FhirPositiveInt,
  FhirUnsignedInt,
  BackboneElement,
  createReference,
  createCodeableConcept,
  FHIR_CODE_SYSTEMS
} from './base.types';

// ============================================
// Appointment Status (Lifecycle)
// ============================================

/**
 * Appointment Status represents the lifecycle of an appointment.
 *
 * WORKFLOW:
 * proposed → pending → booked → arrived → fulfilled
 *                ↓         ↓
 *           cancelled  noshow
 *
 * OR: proposed → pending → waitlist → booked → ...
 */
export type AppointmentStatus =
  | 'proposed'       // Tentative appointment, awaiting response
  | 'pending'        // Appointment requires action before it can be booked
  | 'booked'         // Appointment has been confirmed
  | 'arrived'        // Patient has arrived (transitions to Encounter)
  | 'fulfilled'      // Appointment completed (Encounter finished)
  | 'cancelled'      // Appointment was cancelled
  | 'noshow'         // Patient did not show up
  | 'entered-in-error'  // Entered in error
  | 'checked-in'     // Patient has checked in but not yet arrived
  | 'waitlist';      // On waiting list

// ============================================
// Participant Required
// ============================================

export type ParticipantRequired = 'required' | 'optional' | 'information-only';

// ============================================
// Participant Status
// ============================================

export type ParticipationStatus =
  | 'accepted'       // Participant has accepted
  | 'declined'       // Participant has declined
  | 'tentative'      // Participation is tentative
  | 'needs-action';  // Participant needs to respond

// ============================================
// Appointment Participant
// ============================================

export interface AppointmentParticipant extends BackboneElement {
  type?: CodeableConcept[];
  actor?: Reference; // Patient, Practitioner, PractitionerRole, RelatedPerson, Device, HealthcareService, Location
  required?: ParticipantRequired;
  status: ParticipationStatus;
  period?: Period;
}

// ============================================
// Appointment Resource
// ============================================

export interface Appointment extends DomainResource {
  resourceType: 'Appointment';

  // Business identifiers
  identifier?: Identifier[];

  // Status (required)
  status: AppointmentStatus;

  // Status change reason
  cancelationReason?: CodeableConcept;

  // Service category
  serviceCategory?: CodeableConcept[];

  // Service type
  serviceType?: CodeableConcept[];

  // Specialty
  specialty?: CodeableConcept[];

  // Appointment type
  appointmentType?: CodeableConcept;

  // Reason codes
  reasonCode?: CodeableConcept[];

  // Reason references
  reasonReference?: Reference[]; // Condition, Procedure, Observation, ImmunizationRecommendation

  // Priority
  priority?: FhirUnsignedInt;

  // Description
  description?: string;

  // Supporting information
  supportingInformation?: Reference[];

  // Start time (required when booked)
  start?: FhirInstant;

  // End time (required when booked)
  end?: FhirInstant;

  // Minutes duration
  minutesDuration?: FhirPositiveInt;

  // Slots
  slot?: Reference[]; // Slot

  // Created timestamp
  created?: FhirDateTime;

  // Comment
  comment?: string;

  // Patient instruction
  patientInstruction?: string;

  // Based on (ServiceRequest)
  basedOn?: Reference[]; // ServiceRequest

  // Participants (required)
  participant: AppointmentParticipant[];

  // Requested period
  requestedPeriod?: Period[];
}

// ============================================
// Slot Resource (Available times)
// ============================================

export type SlotStatus = 'busy' | 'free' | 'busy-unavailable' | 'busy-tentative' | 'entered-in-error';

export interface Slot extends DomainResource {
  resourceType: 'Slot';
  identifier?: Identifier[];
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  schedule: Reference; // Schedule
  status: SlotStatus;
  start: FhirInstant;
  end: FhirInstant;
  overbooked?: boolean;
  comment?: string;
}

// ============================================
// Schedule Resource
// ============================================

export interface Schedule extends DomainResource {
  resourceType: 'Schedule';
  identifier?: Identifier[];
  active?: boolean;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  actor: Reference[]; // Practitioner, PractitionerRole, Device, HealthcareService, Location
  planningHorizon?: Period;
  comment?: string;
}

// ============================================
// Appointment Builder & Utilities
// ============================================

export interface AppointmentInput {
  id?: string;
  status: AppointmentStatus;
  patientId: string;
  patientDisplay?: string;
  practitionerId?: string;
  practitionerDisplay?: string;
  locationId?: string;
  locationDisplay?: string;
  organizationId?: string;
  organizationDisplay?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  appointmentType?: string;
  serviceType?: string;
  reasonCode?: string; // ICD-10 or description
  reasonDisplay?: string;
  description?: string;
  comment?: string;
  patientInstruction?: string;
}

/**
 * Create a FHIR Appointment resource from simple input
 */
export function createAppointment(input: AppointmentInput): Appointment {
  const appointment: Appointment = {
    resourceType: 'Appointment',
    id: input.id,
    status: input.status,
    created: new Date().toISOString(),
    participant: []
  };

  // Start/End times
  if (input.start) {
    appointment.start = input.start;
  }
  if (input.end) {
    appointment.end = input.end;
  }
  if (input.minutesDuration) {
    appointment.minutesDuration = input.minutesDuration;
  }

  // Appointment type
  if (input.appointmentType) {
    appointment.appointmentType = createCodeableConcept(
      'http://terminology.hl7.org/CodeSystem/v2-0276',
      input.appointmentType,
      getAppointmentTypeDisplay(input.appointmentType)
    );
  }

  // Service type
  if (input.serviceType) {
    appointment.serviceType = [{
      coding: [{
        display: input.serviceType
      }],
      text: input.serviceType
    }];
  }

  // Reason
  if (input.reasonCode || input.reasonDisplay) {
    appointment.reasonCode = [{
      coding: input.reasonCode ? [{
        system: FHIR_CODE_SYSTEMS.ICD10_CM,
        code: input.reasonCode,
        display: input.reasonDisplay
      }] : undefined,
      text: input.reasonDisplay
    }];
  }

  // Description and comments
  if (input.description) {
    appointment.description = input.description;
  }
  if (input.comment) {
    appointment.comment = input.comment;
  }
  if (input.patientInstruction) {
    appointment.patientInstruction = input.patientInstruction;
  }

  // Patient participant (required)
  appointment.participant.push({
    actor: createReference('Patient', input.patientId, input.patientDisplay),
    required: 'required',
    status: input.status === 'proposed' ? 'needs-action' : 'accepted'
  });

  // Practitioner participant
  if (input.practitionerId) {
    appointment.participant.push({
      type: [{
        coding: [{
          system: FHIR_CODE_SYSTEMS.PARTICIPANT_TYPE,
          code: 'PPRF',
          display: 'Primary Performer'
        }]
      }],
      actor: createReference('Practitioner', input.practitionerId, input.practitionerDisplay),
      required: 'required',
      status: 'accepted'
    });
  }

  // Location participant
  if (input.locationId) {
    appointment.participant.push({
      actor: createReference('Location', input.locationId, input.locationDisplay),
      required: 'required',
      status: 'accepted'
    });
  }

  return appointment;
}

/**
 * Get display text for appointment status
 */
export function getAppointmentStatusDisplay(status: AppointmentStatus): string {
  const displays: Record<AppointmentStatus, string> = {
    'proposed': 'Proposed',
    'pending': 'Pending',
    'booked': 'Booked',
    'arrived': 'Arrived',
    'fulfilled': 'Fulfilled',
    'cancelled': 'Cancelled',
    'noshow': 'No Show',
    'entered-in-error': 'Entered in Error',
    'checked-in': 'Checked In',
    'waitlist': 'Waitlist'
  };
  return displays[status] || status;
}

/**
 * Get display text for appointment type
 */
export function getAppointmentTypeDisplay(type: string): string {
  const displays: Record<string, string> = {
    'CHECKUP': 'Routine Checkup',
    'EMERGENCY': 'Emergency',
    'FOLLOWUP': 'Follow-up',
    'ROUTINE': 'Routine Visit',
    'WALKIN': 'Walk-in',
    'URGENT': 'Urgent Visit',
    'INIT': 'Initial Visit',
    'PT': 'Physical Therapy',
    'CHIRO': 'Chiropractic',
    'CONSULT': 'Consultation',
    'TELEHEALTH': 'Telehealth',
  };
  return displays[type] || type;
}

/**
 * Check if appointment can transition to a new status
 */
export function canTransitionAppointmentTo(currentStatus: AppointmentStatus, newStatus: AppointmentStatus): boolean {
  const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    'proposed': ['pending', 'booked', 'cancelled', 'entered-in-error'],
    'pending': ['booked', 'waitlist', 'cancelled', 'entered-in-error'],
    'waitlist': ['pending', 'booked', 'cancelled', 'entered-in-error'],
    'booked': ['arrived', 'checked-in', 'cancelled', 'noshow', 'entered-in-error'],
    'checked-in': ['arrived', 'cancelled', 'noshow', 'entered-in-error'],
    'arrived': ['fulfilled', 'cancelled', 'entered-in-error'],
    'fulfilled': ['entered-in-error'],
    'cancelled': ['entered-in-error'],
    'noshow': ['booked', 'entered-in-error'], // Can rebook
    'entered-in-error': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Create an Encounter from an Appointment when patient arrives
 */
export function appointmentToEncounterData(appointment: Appointment): {
  patientId: string;
  practitionerId?: string;
  organizationId?: string;
  locationId?: string;
  reasonCode?: string;
  reasonDisplay?: string;
  appointmentId: string;
} {
  // Find patient participant
  const patientParticipant = appointment.participant.find(
    p => p.actor?.reference?.startsWith('Patient/')
  );
  const patientId = patientParticipant?.actor?.reference?.split('/')[1] || '';

  // Find practitioner participant
  const practitionerParticipant = appointment.participant.find(
    p => p.actor?.reference?.startsWith('Practitioner/')
  );
  const practitionerId = practitionerParticipant?.actor?.reference?.split('/')[1];

  // Find location participant
  const locationParticipant = appointment.participant.find(
    p => p.actor?.reference?.startsWith('Location/')
  );
  const locationId = locationParticipant?.actor?.reference?.split('/')[1];

  return {
    patientId,
    practitionerId,
    organizationId: undefined, // Extract from location if needed
    locationId,
    reasonCode: appointment.reasonCode?.[0]?.coding?.[0]?.code,
    reasonDisplay: appointment.reasonCode?.[0]?.text,
    appointmentId: appointment.id || ''
  };
}

// ============================================
// Common Appointment Types
// ============================================

export const APPOINTMENT_TYPES = {
  CHECKUP: { code: 'CHECKUP', display: 'A routine check-up' },
  EMERGENCY: { code: 'EMERGENCY', display: 'Emergency appointment' },
  FOLLOWUP: { code: 'FOLLOWUP', display: 'A follow up visit' },
  ROUTINE: { code: 'ROUTINE', display: 'Routine appointment' },
  WALKIN: { code: 'WALKIN', display: 'A walk in visit' },
  INITIAL: { code: 'INIT', display: 'Initial visit' },
  PROCEDURE: { code: 'PROC', display: 'Procedure appointment' },
  PHYSICAL_THERAPY: { code: 'PT', display: 'Physical therapy session' },
  CHIROPRACTIC: { code: 'CHIRO', display: 'Chiropractic adjustment' },
  CONSULTATION: { code: 'CONSULT', display: 'Consultation' },
  TELEHEALTH: { code: 'TELEHEALTH', display: 'Telehealth/virtual visit' },
} as const;

// ============================================
// Cancellation Reason Codes
// ============================================

export const CANCELLATION_REASONS = {
  PATIENT_REQUEST: { code: 'pat', display: 'Patient request' },
  PROVIDER_REQUEST: { code: 'prov', display: 'Provider request' },
  EQUIPMENT: { code: 'equip', display: 'Equipment failure' },
  OTHER: { code: 'other', display: 'Other' },
  NO_LONGER_REQUIRED: { code: 'nlr', display: 'No longer required' },
  SCHEDULE_CONFLICT: { code: 'conflict', display: 'Schedule conflict' },
  EMERGENCY: { code: 'emer', display: 'Emergency' },
} as const;

// ============================================
// Participant Type Codes
// ============================================

export const APPOINTMENT_PARTICIPANT_TYPES = {
  ADMITTER: { code: 'ADM', display: 'Admitter' },
  ATTENDER: { code: 'ATND', display: 'Attender' },
  CALLBACK: { code: 'CALLBCK', display: 'Callback Contact' },
  CONSULTANT: { code: 'CON', display: 'Consultant' },
  DISCHARGER: { code: 'DIS', display: 'Discharger' },
  ESCORT: { code: 'ESC', display: 'Escort' },
  REFERRER: { code: 'REF', display: 'Referrer' },
  SECONDARY_PERFORMER: { code: 'SPRF', display: 'Secondary Performer' },
  PRIMARY_PERFORMER: { code: 'PPRF', display: 'Primary Performer' },
  PARTICIPANT: { code: 'PART', display: 'Participant' },
  TRANSLATOR: { code: 'TRANS', display: 'Translator' },
  LOCATION: { code: 'LOC', display: 'Location' },
} as const;
