/**
 * FHIR R4 Patient Resource
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/patient.html
 */

import {
  DomainResource,
  HumanName,
  ContactPoint,
  Address,
  Identifier,
  CodeableConcept,
  Attachment,
  Reference,
  Period,
  FhirDate,
  FhirDateTime,
  FhirCode,
  BackboneElement,
  createHumanName,
  createContactPoint,
  createAddress,
  createIdentifier,
  getDisplayName,
  getPrimaryPhone,
  getPrimaryEmail,
  FHIR_CODE_SYSTEMS
} from './base.types';

// ============================================
// Patient Resource Types
// ============================================

export type AdministrativeGender = 'male' | 'female' | 'other' | 'unknown';

export type LinkType = 'replaced-by' | 'replaces' | 'refer' | 'seealso';

// ============================================
// Patient Contact (Emergency Contact, Next of Kin)
// ============================================

export interface PatientContact extends BackboneElement {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: AdministrativeGender;
  organization?: Reference; // Organization
  period?: Period;
}

// ============================================
// Patient Communication
// ============================================

export interface PatientCommunication extends BackboneElement {
  language: CodeableConcept;
  preferred?: boolean;
}

// ============================================
// Patient Link
// ============================================

export interface PatientLink extends BackboneElement {
  other: Reference; // Patient or RelatedPerson
  type: LinkType;
}

// ============================================
// Patient Resource
// ============================================

export interface Patient extends DomainResource {
  resourceType: 'Patient';

  // Identifiers (MRN, SSN, etc.)
  identifier?: Identifier[];

  // Record status
  active?: boolean;

  // Name(s)
  name?: HumanName[];

  // Contact information
  telecom?: ContactPoint[];

  // Demographics
  gender?: AdministrativeGender;
  birthDate?: FhirDate;

  // Deceased indicator
  deceasedBoolean?: boolean;
  deceasedDateTime?: FhirDateTime;

  // Address(es)
  address?: Address[];

  // Marital status
  maritalStatus?: CodeableConcept;

  // Multiple birth
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;

  // Photo
  photo?: Attachment[];

  // Emergency contacts
  contact?: PatientContact[];

  // Communication preferences
  communication?: PatientCommunication[];

  // Primary care provider
  generalPractitioner?: Reference[]; // Organization, Practitioner, PractitionerRole

  // Managing organization
  managingOrganization?: Reference; // Organization

  // Links to other patient records
  link?: PatientLink[];
}

// ============================================
// US Core Extensions (Race, Ethnicity)
// ============================================

export interface USCoreRaceExtension {
  url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race';
  extension: Array<{
    url: 'ombCategory' | 'detailed' | 'text';
    valueCoding?: {
      system: string;
      code: string;
      display: string;
    };
    valueString?: string;
  }>;
}

export interface USCoreEthnicityExtension {
  url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity';
  extension: Array<{
    url: 'ombCategory' | 'detailed' | 'text';
    valueCoding?: {
      system: string;
      code: string;
      display: string;
    };
    valueString?: string;
  }>;
}

// ============================================
// Patient Builder & Utilities
// ============================================

export interface PatientInput {
  id?: string;
  mrn?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  gender?: AdministrativeGender;
  birthDate?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLanguage?: string;
  managingOrganizationId?: string;
  active?: boolean;
}

/**
 * Create a FHIR Patient resource from simple input
 */
export function createPatient(input: PatientInput): Patient {
  const patient: Patient = {
    resourceType: 'Patient',
    id: input.id,
    active: input.active ?? true,
    name: [],
    telecom: [],
    address: [],
  };

  // Official name
  const givenNames = [input.firstName];
  if (input.middleName) givenNames.push(input.middleName);

  patient.name!.push(createHumanName(input.lastName, givenNames, 'official'));

  // Preferred/nickname
  if (input.preferredName) {
    patient.name!.push({
      use: 'nickname',
      given: [input.preferredName]
    });
  }

  // MRN identifier
  if (input.mrn) {
    patient.identifier = [
      createIdentifier(
        'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.14', // Example MRN system
        input.mrn,
        'usual'
      )
    ];
    patient.identifier[0].type = {
      coding: [{
        system: FHIR_CODE_SYSTEMS.IDENTIFIER_TYPE,
        code: 'MR',
        display: 'Medical Record Number'
      }]
    };
  }

  // Gender
  if (input.gender) {
    patient.gender = input.gender;
  }

  // Birth date
  if (input.birthDate) {
    patient.birthDate = input.birthDate;
  }

  // Phone
  if (input.phone) {
    patient.telecom!.push(createContactPoint('phone', input.phone, 'mobile'));
  }

  // Email
  if (input.email) {
    patient.telecom!.push(createContactPoint('email', input.email, 'home'));
  }

  // Address
  if (input.addressLine1 && input.city && input.state && input.postalCode) {
    const lines = [input.addressLine1];
    if (input.addressLine2) lines.push(input.addressLine2);
    patient.address!.push(
      createAddress(lines, input.city, input.state, input.postalCode, input.country || 'US')
    );
  }

  // Emergency contact
  if (input.emergencyContactName && input.emergencyContactPhone) {
    const nameParts = input.emergencyContactName.split(' ');
    const ecLastName = nameParts.pop() || '';
    const ecFirstNames = nameParts;

    patient.contact = [{
      relationship: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
          code: input.emergencyContactRelationship === 'spouse' ? 'C' : 'N',
          display: input.emergencyContactRelationship || 'Emergency Contact'
        }],
        text: input.emergencyContactRelationship || 'Emergency Contact'
      }],
      name: createHumanName(ecLastName, ecFirstNames),
      telecom: [createContactPoint('phone', input.emergencyContactPhone, 'mobile')]
    }];
  }

  // Preferred language
  if (input.preferredLanguage) {
    patient.communication = [{
      language: {
        coding: [{
          system: 'urn:ietf:bcp:47',
          code: input.preferredLanguage,
          display: getLanguageDisplay(input.preferredLanguage)
        }],
        text: getLanguageDisplay(input.preferredLanguage)
      },
      preferred: true
    }];
  }

  // Managing organization
  if (input.managingOrganizationId) {
    patient.managingOrganization = {
      reference: `Organization/${input.managingOrganizationId}`
    };
  }

  return patient;
}

/**
 * Extract simple patient data from FHIR Patient resource
 */
export function extractPatientData(patient: Patient): PatientInput {
  const officialName = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
  const nickname = patient.name?.find(n => n.use === 'nickname');
  const address = patient.address?.[0];
  const emergencyContact = patient.contact?.[0];

  return {
    id: patient.id,
    mrn: patient.identifier?.find(i => i.type?.coding?.[0]?.code === 'MR')?.value,
    firstName: officialName?.given?.[0] || '',
    lastName: officialName?.family || '',
    middleName: officialName?.given?.[1],
    preferredName: nickname?.given?.[0],
    gender: patient.gender,
    birthDate: patient.birthDate,
    phone: getPrimaryPhone(patient.telecom || []),
    email: getPrimaryEmail(patient.telecom || []),
    addressLine1: address?.line?.[0],
    addressLine2: address?.line?.[1],
    city: address?.city,
    state: address?.state,
    postalCode: address?.postalCode,
    country: address?.country,
    emergencyContactName: emergencyContact?.name ? getDisplayName(emergencyContact.name) : undefined,
    emergencyContactPhone: emergencyContact?.telecom ? getPrimaryPhone(emergencyContact.telecom) : undefined,
    emergencyContactRelationship: emergencyContact?.relationship?.[0]?.text,
    preferredLanguage: patient.communication?.[0]?.language?.coding?.[0]?.code,
    managingOrganizationId: patient.managingOrganization?.reference?.split('/')[1],
    active: patient.active
  };
}

/**
 * Get the display name for a patient
 */
export function getPatientDisplayName(patient: Patient): string {
  const officialName = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
  if (officialName) {
    return getDisplayName(officialName);
  }
  return 'Unknown Patient';
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get language display name
 */
function getLanguageDisplay(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'en-US': 'English (United States)',
    'es': 'Spanish',
    'es-MX': 'Spanish (Mexico)',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'vi': 'Vietnamese',
    'ko': 'Korean',
    'tl': 'Tagalog',
    'ar': 'Arabic',
    'ru': 'Russian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
  };
  return languages[code] || code;
}

// ============================================
// Common Contact Relationships
// ============================================

export const CONTACT_RELATIONSHIPS = {
  EMERGENCY: { code: 'C', display: 'Emergency Contact' },
  NEXT_OF_KIN: { code: 'N', display: 'Next of Kin' },
  SPOUSE: { code: 'S', display: 'Spouse' },
  PARENT: { code: 'P', display: 'Parent' },
  GUARDIAN: { code: 'G', display: 'Guardian' },
  SIBLING: { code: 'SB', display: 'Sibling' },
  CHILD: { code: 'CH', display: 'Child' },
  OTHER: { code: 'O', display: 'Other' },
} as const;

// ============================================
// Marital Status Codes
// ============================================

export const MARITAL_STATUS = {
  ANNULLED: { code: 'A', display: 'Annulled' },
  DIVORCED: { code: 'D', display: 'Divorced' },
  INTERLOCUTORY: { code: 'I', display: 'Interlocutory' },
  LEGALLY_SEPARATED: { code: 'L', display: 'Legally Separated' },
  MARRIED: { code: 'M', display: 'Married' },
  POLYGAMOUS: { code: 'P', display: 'Polygamous' },
  NEVER_MARRIED: { code: 'S', display: 'Never Married' },
  DOMESTIC_PARTNER: { code: 'T', display: 'Domestic Partner' },
  UNMARRIED: { code: 'U', display: 'Unmarried' },
  WIDOWED: { code: 'W', display: 'Widowed' },
  UNKNOWN: { code: 'UNK', display: 'Unknown' },
} as const;
