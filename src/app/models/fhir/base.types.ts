/**
 * FHIR R4 Base Data Types
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/datatypes.html
 */

// ============================================
// Primitive Types
// ============================================

export type FhirId = string;
export type FhirUri = string;
export type FhirUrl = string;
export type FhirCanonical = string;
export type FhirCode = string;
export type FhirOid = string;
export type FhirUuid = string;
export type FhirInstant = string; // ISO 8601 with timezone
export type FhirDateTime = string; // ISO 8601
export type FhirDate = string; // YYYY-MM-DD
export type FhirTime = string; // HH:MM:SS
export type FhirDecimal = number;
export type FhirInteger = number;
export type FhirPositiveInt = number;
export type FhirUnsignedInt = number;
export type FhirBase64Binary = string;
export type FhirMarkdown = string;

// ============================================
// Complex Types - Element
// ============================================

export interface Element {
  id?: FhirId;
  extension?: Extension[];
}

export interface Extension {
  url: FhirUri;
  valueString?: string;
  valueInteger?: number;
  valueBoolean?: boolean;
  valueCode?: FhirCode;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
  valueUri?: FhirUri;
  valueCoding?: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueReference?: Reference;
  valuePeriod?: Period;
  valueQuantity?: Quantity;
}

// ============================================
// Data Types - Coding & CodeableConcept
// ============================================

export interface Coding extends Element {
  system?: FhirUri;
  version?: string;
  code?: FhirCode;
  display?: string;
  userSelected?: boolean;
}

export interface CodeableConcept extends Element {
  coding?: Coding[];
  text?: string;
}

// ============================================
// Data Types - Identifier
// ============================================

export type IdentifierUse = 'usual' | 'official' | 'temp' | 'secondary' | 'old';

export interface Identifier extends Element {
  use?: IdentifierUse;
  type?: CodeableConcept;
  system?: FhirUri;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

// ============================================
// Data Types - HumanName
// ============================================

export type NameUse = 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';

export interface HumanName extends Element {
  use?: NameUse;
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

// ============================================
// Data Types - ContactPoint (Telecom)
// ============================================

export type ContactPointSystem = 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
export type ContactPointUse = 'home' | 'work' | 'temp' | 'old' | 'mobile';

export interface ContactPoint extends Element {
  system?: ContactPointSystem;
  value?: string;
  use?: ContactPointUse;
  rank?: FhirPositiveInt;
  period?: Period;
}

// ============================================
// Data Types - Address
// ============================================

export type AddressUse = 'home' | 'work' | 'temp' | 'old' | 'billing';
export type AddressType = 'postal' | 'physical' | 'both';

export interface Address extends Element {
  use?: AddressUse;
  type?: AddressType;
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

// ============================================
// Data Types - Period & Timing
// ============================================

export interface Period extends Element {
  start?: FhirDateTime;
  end?: FhirDateTime;
}

export interface Timing extends Element {
  event?: FhirDateTime[];
  repeat?: TimingRepeat;
  code?: CodeableConcept;
}

export interface TimingRepeat extends Element {
  boundsDuration?: Duration;
  boundsPeriod?: Period;
  boundsRange?: Range;
  count?: FhirPositiveInt;
  countMax?: FhirPositiveInt;
  duration?: FhirDecimal;
  durationMax?: FhirDecimal;
  durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  frequency?: FhirPositiveInt;
  frequencyMax?: FhirPositiveInt;
  period?: FhirDecimal;
  periodMax?: FhirDecimal;
  periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  dayOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  timeOfDay?: FhirTime[];
  when?: string[];
  offset?: FhirUnsignedInt;
}

// ============================================
// Data Types - Quantity & Range
// ============================================

export interface Quantity extends Element {
  value?: FhirDecimal;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: FhirUri;
  code?: FhirCode;
}

export interface SimpleQuantity extends Quantity {
  comparator?: undefined; // Not allowed in SimpleQuantity
}

export interface Duration extends Quantity {
  // Duration is a Quantity with time units
}

export interface Age extends Quantity {
  // Age is a Quantity with time units
}

export interface Range extends Element {
  low?: SimpleQuantity;
  high?: SimpleQuantity;
}

export interface Ratio extends Element {
  numerator?: Quantity;
  denominator?: Quantity;
}

// ============================================
// Data Types - Reference
// ============================================

export interface Reference extends Element {
  reference?: string; // Literal reference, Relative, internal or absolute URL
  type?: FhirUri; // Type the reference refers to (e.g., "Patient")
  identifier?: Identifier;
  display?: string;
}

// ============================================
// Data Types - Attachment
// ============================================

export interface Attachment extends Element {
  contentType?: FhirCode;
  language?: FhirCode;
  data?: FhirBase64Binary;
  url?: FhirUrl;
  size?: FhirUnsignedInt;
  hash?: FhirBase64Binary;
  title?: string;
  creation?: FhirDateTime;
}

// ============================================
// Data Types - Annotation
// ============================================

export interface Annotation extends Element {
  authorReference?: Reference;
  authorString?: string;
  time?: FhirDateTime;
  text: FhirMarkdown;
}

// ============================================
// Data Types - Narrative
// ============================================

export type NarrativeStatus = 'generated' | 'extensions' | 'additional' | 'empty';

export interface Narrative extends Element {
  status: NarrativeStatus;
  div: string; // XHTML content
}

// ============================================
// Data Types - Meta
// ============================================

export interface Meta extends Element {
  versionId?: FhirId;
  lastUpdated?: FhirInstant;
  source?: FhirUri;
  profile?: FhirCanonical[];
  security?: Coding[];
  tag?: Coding[];
}

// ============================================
// BackboneElement - Base for complex nested structures
// ============================================

export interface BackboneElement extends Element {
  modifierExtension?: Extension[];
}

// ============================================
// Resource - Base for all FHIR resources
// ============================================

export interface Resource {
  resourceType: string;
  id?: FhirId;
  meta?: Meta;
  implicitRules?: FhirUri;
  language?: FhirCode;
}

export interface DomainResource extends Resource {
  text?: Narrative;
  contained?: Resource[];
  extension?: Extension[];
  modifierExtension?: Extension[];
}

// ============================================
// Common Code Systems
// ============================================

export const FHIR_CODE_SYSTEMS = {
  // Identifier Types
  IDENTIFIER_TYPE: 'http://terminology.hl7.org/CodeSystem/v2-0203',

  // Contact Point Systems
  CONTACT_POINT_SYSTEM: 'http://hl7.org/fhir/contact-point-system',

  // Administrative Gender
  ADMINISTRATIVE_GENDER: 'http://hl7.org/fhir/administrative-gender',

  // Encounter Class (ActCode)
  ACT_CODE: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',

  // Encounter Status
  ENCOUNTER_STATUS: 'http://hl7.org/fhir/encounter-status',

  // Appointment Status
  APPOINTMENT_STATUS: 'http://hl7.org/fhir/appointmentstatus',

  // Participant Type
  PARTICIPANT_TYPE: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',

  // Care Plan Status
  CARE_PLAN_STATUS: 'http://hl7.org/fhir/request-status',

  // Care Plan Intent
  CARE_PLAN_INTENT: 'http://hl7.org/fhir/request-intent',

  // Observation Status
  OBSERVATION_STATUS: 'http://hl7.org/fhir/observation-status',

  // Questionnaire Response Status
  QUESTIONNAIRE_RESPONSE_STATUS: 'http://hl7.org/fhir/questionnaire-answers-status',

  // LOINC (for PHQ-9, etc.)
  LOINC: 'http://loinc.org',

  // SNOMED CT
  SNOMED_CT: 'http://snomed.info/sct',

  // ICD-10-CM
  ICD10_CM: 'http://hl7.org/fhir/sid/icd-10-cm',

  // US Core
  US_CORE_RACE: 'urn:oid:2.16.840.1.113883.6.238',
  US_CORE_ETHNICITY: 'urn:oid:2.16.840.1.113883.6.238',
} as const;

// ============================================
// Common LOINC Codes for Assessments
// ============================================

export const LOINC_CODES = {
  // PHQ-9 (Patient Health Questionnaire)
  PHQ9_PANEL: '44249-1',
  PHQ9_TOTAL_SCORE: '44261-6',

  // GAD-7 (Generalized Anxiety Disorder)
  GAD7_PANEL: '69737-5',
  GAD7_TOTAL_SCORE: '70274-6',

  // Rivermead Post-Concussion Symptoms
  RIVERMEAD_PCS: '72170-4', // Post-concussion symptom inventory

  // Pain Scales
  VAS_PAIN: '72514-3', // Pain severity - 0-10 verbal numeric rating

  // Vital Signs
  BODY_WEIGHT: '29463-7',
  BODY_HEIGHT: '8302-2',
  BMI: '39156-5',
  BLOOD_PRESSURE_SYSTOLIC: '8480-6',
  BLOOD_PRESSURE_DIASTOLIC: '8462-4',
  HEART_RATE: '8867-4',
  RESPIRATORY_RATE: '9279-1',
  BODY_TEMPERATURE: '8310-5',
  OXYGEN_SATURATION: '2708-6',
} as const;

// ============================================
// Utility Functions
// ============================================

/**
 * Create a reference to a FHIR resource
 */
export function createReference(resourceType: string, id: string, display?: string): Reference {
  return {
    reference: `${resourceType}/${id}`,
    type: resourceType,
    display
  };
}

/**
 * Create a CodeableConcept from a single code
 */
export function createCodeableConcept(
  system: string,
  code: string,
  display?: string,
  text?: string
): CodeableConcept {
  return {
    coding: [{ system, code, display }],
    text: text || display
  };
}

/**
 * Create a HumanName from parts
 */
export function createHumanName(
  family: string,
  given: string[],
  use: NameUse = 'official'
): HumanName {
  return {
    use,
    family,
    given,
    text: `${given.join(' ')} ${family}`
  };
}

/**
 * Create a ContactPoint (telecom)
 */
export function createContactPoint(
  system: ContactPointSystem,
  value: string,
  use?: ContactPointUse
): ContactPoint {
  return { system, value, use };
}

/**
 * Create an Address
 */
export function createAddress(
  line: string[],
  city: string,
  state: string,
  postalCode: string,
  country: string = 'US',
  use: AddressUse = 'home'
): Address {
  return {
    use,
    line,
    city,
    state,
    postalCode,
    country,
    text: `${line.join(', ')}, ${city}, ${state} ${postalCode}, ${country}`
  };
}

/**
 * Create an Identifier
 */
export function createIdentifier(
  system: string,
  value: string,
  use: IdentifierUse = 'official'
): Identifier {
  return { system, value, use };
}

/**
 * Extract display name from HumanName
 */
export function getDisplayName(name: HumanName): string {
  if (name.text) return name.text;
  const parts: string[] = [];
  if (name.prefix) parts.push(...name.prefix);
  if (name.given) parts.push(...name.given);
  if (name.family) parts.push(name.family);
  if (name.suffix) parts.push(...name.suffix);
  return parts.join(' ');
}

/**
 * Get primary phone number from telecom array
 */
export function getPrimaryPhone(telecom: ContactPoint[]): string | undefined {
  const phone = telecom.find(t => t.system === 'phone' && t.use === 'mobile')
    || telecom.find(t => t.system === 'phone');
  return phone?.value;
}

/**
 * Get primary email from telecom array
 */
export function getPrimaryEmail(telecom: ContactPoint[]): string | undefined {
  const email = telecom.find(t => t.system === 'email');
  return email?.value;
}
