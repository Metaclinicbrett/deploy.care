/**
 * FHIR R4 Practitioner, PractitionerRole, and Organization Resources
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/practitioner.html
 * https://hl7.org/fhir/R4/practitionerrole.html
 * https://hl7.org/fhir/R4/organization.html
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
  FhirTime,
  FhirCode,
  BackboneElement,
  createHumanName,
  createContactPoint,
  createAddress,
  createIdentifier,
  createCodeableConcept,
  getDisplayName,
  getPrimaryPhone,
  getPrimaryEmail,
  FHIR_CODE_SYSTEMS
} from './base.types';
import { AdministrativeGender } from './patient.resource';

// ============================================
// Practitioner Qualification
// ============================================

export interface PractitionerQualification extends BackboneElement {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference; // Organization
}

// ============================================
// Practitioner Resource
// ============================================

export interface Practitioner extends DomainResource {
  resourceType: 'Practitioner';

  // Business identifiers (NPI, DEA, state license)
  identifier?: Identifier[];

  // Active status
  active?: boolean;

  // Name(s)
  name?: HumanName[];

  // Contact information
  telecom?: ContactPoint[];

  // Address(es)
  address?: Address[];

  // Demographics
  gender?: AdministrativeGender;
  birthDate?: FhirDate;

  // Photo
  photo?: Attachment[];

  // Qualifications (certifications, licenses)
  qualification?: PractitionerQualification[];

  // Communication languages
  communication?: CodeableConcept[];
}

// ============================================
// PractitionerRole Available Time
// ============================================

export type DaysOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface PractitionerRoleAvailableTime extends BackboneElement {
  daysOfWeek?: DaysOfWeek[];
  allDay?: boolean;
  availableStartTime?: FhirTime;
  availableEndTime?: FhirTime;
}

// ============================================
// PractitionerRole Not Available
// ============================================

export interface PractitionerRoleNotAvailable extends BackboneElement {
  description: string;
  during?: Period;
}

// ============================================
// PractitionerRole Resource
// ============================================

export interface PractitionerRole extends DomainResource {
  resourceType: 'PractitionerRole';

  // Business identifiers
  identifier?: Identifier[];

  // Active status
  active?: boolean;

  // Period during which the role is valid
  period?: Period;

  // The practitioner
  practitioner?: Reference; // Practitioner

  // The organization
  organization?: Reference; // Organization

  // Roles/specialties
  code?: CodeableConcept[];

  // Specialties
  specialty?: CodeableConcept[];

  // Locations where services are provided
  location?: Reference[]; // Location

  // Healthcare services provided
  healthcareService?: Reference[]; // HealthcareService

  // Contact information specific to this role
  telecom?: ContactPoint[];

  // Available times
  availableTime?: PractitionerRoleAvailableTime[];

  // Not available times
  notAvailable?: PractitionerRoleNotAvailable[];

  // Description of availability
  availabilityExceptions?: string;

  // Technical endpoints
  endpoint?: Reference[]; // Endpoint
}

// ============================================
// Organization Contact
// ============================================

export interface OrganizationContact extends BackboneElement {
  purpose?: CodeableConcept;
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
}

// ============================================
// Organization Resource
// ============================================

export interface Organization extends DomainResource {
  resourceType: 'Organization';

  // Business identifiers (NPI, EIN, etc.)
  identifier?: Identifier[];

  // Active status
  active?: boolean;

  // Organization type
  type?: CodeableConcept[];

  // Name
  name?: string;

  // Alias names
  alias?: string[];

  // Contact information
  telecom?: ContactPoint[];

  // Address(es)
  address?: Address[];

  // Parent organization
  partOf?: Reference; // Organization

  // Contact persons
  contact?: OrganizationContact[];

  // Technical endpoints
  endpoint?: Reference[]; // Endpoint
}

// ============================================
// Practitioner Builder & Utilities
// ============================================

export interface PractitionerInput {
  id?: string;
  npi?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  credentials?: string; // e.g., "MD", "DO", "DC", "PT"
  gender?: AdministrativeGender;
  phone?: string;
  email?: string;
  specialty?: string;
  active?: boolean;
}

/**
 * Create a FHIR Practitioner resource from simple input
 */
export function createPractitioner(input: PractitionerInput): Practitioner {
  const practitioner: Practitioner = {
    resourceType: 'Practitioner',
    id: input.id,
    active: input.active ?? true,
    name: [],
    telecom: [],
  };

  // Name with credentials
  const givenNames = [input.firstName];
  if (input.middleName) givenNames.push(input.middleName);

  const name = createHumanName(input.lastName, givenNames, 'official');
  if (input.credentials) {
    name.suffix = [input.credentials];
  }
  practitioner.name!.push(name);

  // NPI identifier
  if (input.npi) {
    practitioner.identifier = [{
      system: 'http://hl7.org/fhir/sid/us-npi',
      value: input.npi,
      use: 'official'
    }];
  }

  // Gender
  if (input.gender) {
    practitioner.gender = input.gender;
  }

  // Phone
  if (input.phone) {
    practitioner.telecom!.push(createContactPoint('phone', input.phone, 'work'));
  }

  // Email
  if (input.email) {
    practitioner.telecom!.push(createContactPoint('email', input.email, 'work'));
  }

  // Qualification/specialty
  if (input.specialty || input.credentials) {
    practitioner.qualification = [{
      code: createCodeableConcept(
        'http://terminology.hl7.org/CodeSystem/v2-0360',
        input.credentials || 'OTH',
        input.specialty || input.credentials
      )
    }];
  }

  return practitioner;
}

/**
 * Get display name for a practitioner
 */
export function getPractitionerDisplayName(practitioner: Practitioner): string {
  const name = practitioner.name?.[0];
  if (name) {
    let displayName = getDisplayName(name);
    if (name.suffix?.length) {
      displayName += `, ${name.suffix.join(', ')}`;
    }
    return displayName;
  }
  return 'Unknown Practitioner';
}

// ============================================
// Organization Builder & Utilities
// ============================================

export interface OrganizationInput {
  id?: string;
  npi?: string;
  ein?: string;
  name: string;
  type?: OrganizationType;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  parentOrganizationId?: string;
  active?: boolean;
}

export type OrganizationType =
  | 'prov'      // Healthcare Provider
  | 'dept'      // Hospital Department
  | 'team'      // Care Team
  | 'govt'      // Government
  | 'ins'       // Insurance Company
  | 'pay'       // Payer
  | 'edu'       // Educational Institution
  | 'reli'      // Religious Institution
  | 'crs'       // Clinical Research Sponsor
  | 'cg'        // Community Group
  | 'bus'       // Business
  | 'other';    // Other

/**
 * Create a FHIR Organization resource from simple input
 */
export function createOrganization(input: OrganizationInput): Organization {
  const organization: Organization = {
    resourceType: 'Organization',
    id: input.id,
    active: input.active ?? true,
    name: input.name,
    identifier: [],
    telecom: [],
    address: [],
  };

  // NPI identifier
  if (input.npi) {
    organization.identifier!.push({
      system: 'http://hl7.org/fhir/sid/us-npi',
      value: input.npi,
      use: 'official',
      type: createCodeableConcept(
        FHIR_CODE_SYSTEMS.IDENTIFIER_TYPE,
        'NPI',
        'National Provider Identifier'
      )
    });
  }

  // EIN identifier
  if (input.ein) {
    organization.identifier!.push({
      system: 'urn:oid:2.16.840.1.113883.4.4',
      value: input.ein,
      use: 'official',
      type: createCodeableConcept(
        FHIR_CODE_SYSTEMS.IDENTIFIER_TYPE,
        'TAX',
        'Tax ID Number'
      )
    });
  }

  // Organization type
  if (input.type) {
    organization.type = [createCodeableConcept(
      'http://terminology.hl7.org/CodeSystem/organization-type',
      input.type,
      getOrganizationTypeDisplay(input.type)
    )];
  }

  // Phone
  if (input.phone) {
    organization.telecom!.push(createContactPoint('phone', input.phone, 'work'));
  }

  // Fax
  if (input.fax) {
    organization.telecom!.push(createContactPoint('fax', input.fax, 'work'));
  }

  // Email
  if (input.email) {
    organization.telecom!.push(createContactPoint('email', input.email, 'work'));
  }

  // Website
  if (input.website) {
    organization.telecom!.push(createContactPoint('url', input.website, 'work'));
  }

  // Address
  if (input.addressLine1 && input.city && input.state && input.postalCode) {
    const lines = [input.addressLine1];
    if (input.addressLine2) lines.push(input.addressLine2);
    organization.address!.push(
      createAddress(lines, input.city, input.state, input.postalCode, input.country || 'US', 'work')
    );
  }

  // Parent organization
  if (input.parentOrganizationId) {
    organization.partOf = {
      reference: `Organization/${input.parentOrganizationId}`
    };
  }

  return organization;
}

/**
 * Get display text for organization type
 */
export function getOrganizationTypeDisplay(type: OrganizationType): string {
  const displays: Record<OrganizationType, string> = {
    'prov': 'Healthcare Provider',
    'dept': 'Hospital Department',
    'team': 'Care Team',
    'govt': 'Government',
    'ins': 'Insurance Company',
    'pay': 'Payer',
    'edu': 'Educational Institution',
    'reli': 'Religious Institution',
    'crs': 'Clinical Research Sponsor',
    'cg': 'Community Group',
    'bus': 'Business',
    'other': 'Other'
  };
  return displays[type] || type;
}

// ============================================
// Common Practitioner Specialties
// ============================================

export const PRACTITIONER_SPECIALTIES = {
  // Primary Care
  FAMILY_MEDICINE: { code: '207Q00000X', display: 'Family Medicine' },
  INTERNAL_MEDICINE: { code: '207R00000X', display: 'Internal Medicine' },
  PEDIATRICS: { code: '208000000X', display: 'Pediatrics' },

  // Surgical
  GENERAL_SURGERY: { code: '208600000X', display: 'Surgery' },
  ORTHOPEDIC_SURGERY: { code: '207X00000X', display: 'Orthopedic Surgery' },
  NEUROSURGERY: { code: '207T00000X', display: 'Neurological Surgery' },

  // Medical Specialties
  CARDIOLOGY: { code: '207RC0000X', display: 'Cardiovascular Disease' },
  NEUROLOGY: { code: '2084N0400X', display: 'Neurology' },
  PSYCHIATRY: { code: '2084P0800X', display: 'Psychiatry' },
  PHYSICAL_MEDICINE: { code: '2081P2900X', display: 'Physical Medicine & Rehabilitation' },

  // Allied Health
  CHIROPRACTIC: { code: '111N00000X', display: 'Chiropractor' },
  PHYSICAL_THERAPY: { code: '225100000X', display: 'Physical Therapist' },
  OCCUPATIONAL_THERAPY: { code: '225X00000X', display: 'Occupational Therapist' },
  SPEECH_THERAPY: { code: '235Z00000X', display: 'Speech-Language Pathologist' },

  // Nursing
  NURSE_PRACTITIONER: { code: '363L00000X', display: 'Nurse Practitioner' },
  PHYSICIAN_ASSISTANT: { code: '363A00000X', display: 'Physician Assistant' },
  REGISTERED_NURSE: { code: '163W00000X', display: 'Registered Nurse' },

  // Other
  PSYCHOLOGIST: { code: '103T00000X', display: 'Psychologist' },
  SOCIAL_WORKER: { code: '104100000X', display: 'Social Worker' },
  MASSAGE_THERAPIST: { code: '225700000X', display: 'Massage Therapist' },
  ACUPUNCTURIST: { code: '171100000X', display: 'Acupuncturist' },
} as const;

// ============================================
// Healthcare Provider Taxonomy Codes
// ============================================

export const TAXONOMY_CODE_SYSTEM = 'http://nucc.org/provider-taxonomy';

// ============================================
// Practitioner Role Codes
// ============================================

export const PRACTITIONER_ROLE_CODES = {
  DOCTOR: { code: 'doctor', display: 'Doctor' },
  NURSE: { code: 'nurse', display: 'Nurse' },
  PHARMACIST: { code: 'pharmacist', display: 'Pharmacist' },
  RESEARCHER: { code: 'researcher', display: 'Researcher' },
  TEACHER: { code: 'teacher', display: 'Teacher/Educator' },
  ICT_PROFESSIONAL: { code: 'ict', display: 'ICT professional' },
} as const;
