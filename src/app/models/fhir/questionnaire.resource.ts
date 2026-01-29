/**
 * FHIR R4 Questionnaire and QuestionnaireResponse Resources
 * Based on HL7 FHIR R4 (v4.0.1) specification
 * https://hl7.org/fhir/R4/questionnaire.html
 * https://hl7.org/fhir/R4/questionnaireresponse.html
 *
 * Used for structured data capture including PHQ-9, GAD-7, Rivermead PCS, etc.
 */

import {
  DomainResource,
  Identifier,
  CodeableConcept,
  Coding,
  Reference,
  Period,
  Attachment,
  Quantity,
  FhirDate,
  FhirDateTime,
  FhirTime,
  FhirUri,
  FhirCanonical,
  FhirDecimal,
  FhirInteger,
  FhirCode,
  BackboneElement,
  createReference,
  FHIR_CODE_SYSTEMS,
  LOINC_CODES
} from './base.types';

// ============================================
// Questionnaire Status
// ============================================

export type PublicationStatus = 'draft' | 'active' | 'retired' | 'unknown';

// ============================================
// Questionnaire Item Type
// ============================================

export type QuestionnaireItemType =
  | 'group'         // Group of questions
  | 'display'       // Display only (instructions)
  | 'boolean'       // Yes/No
  | 'decimal'       // Decimal number
  | 'integer'       // Integer
  | 'date'          // Date
  | 'dateTime'      // Date and time
  | 'time'          // Time
  | 'string'        // Short text
  | 'text'          // Long text
  | 'url'           // URL
  | 'choice'        // Single choice from options
  | 'open-choice'   // Choice with option for other
  | 'attachment'    // File attachment
  | 'reference'     // Reference to another resource
  | 'quantity';     // Quantity with unit

// ============================================
// Questionnaire Enable Behavior
// ============================================

export type EnableBehavior = 'all' | 'any';

// ============================================
// Questionnaire Enable When Operator
// ============================================

export type EnableWhenOperator = 'exists' | '=' | '!=' | '>' | '<' | '>=' | '<=';

// ============================================
// Questionnaire Item Enable When
// ============================================

export interface QuestionnaireItemEnableWhen extends BackboneElement {
  question: string; // linkId of the question
  operator: EnableWhenOperator;
  answerBoolean?: boolean;
  answerDecimal?: FhirDecimal;
  answerInteger?: FhirInteger;
  answerDate?: FhirDate;
  answerDateTime?: FhirDateTime;
  answerTime?: FhirTime;
  answerString?: string;
  answerCoding?: Coding;
  answerQuantity?: Quantity;
  answerReference?: Reference;
}

// ============================================
// Questionnaire Item Answer Option
// ============================================

export interface QuestionnaireItemAnswerOption extends BackboneElement {
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueTime?: FhirTime;
  valueString?: string;
  valueCoding?: Coding;
  valueReference?: Reference;
  initialSelected?: boolean;
}

// ============================================
// Questionnaire Item Initial Value
// ============================================

export interface QuestionnaireItemInitial extends BackboneElement {
  valueBoolean?: boolean;
  valueDecimal?: FhirDecimal;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueTime?: FhirTime;
  valueString?: string;
  valueUri?: FhirUri;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference;
}

// ============================================
// Questionnaire Item
// ============================================

export interface QuestionnaireItem extends BackboneElement {
  linkId: string;
  definition?: FhirUri;
  code?: Coding[];
  prefix?: string;
  text?: string;
  type: QuestionnaireItemType;
  enableWhen?: QuestionnaireItemEnableWhen[];
  enableBehavior?: EnableBehavior;
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  maxLength?: FhirInteger;
  answerValueSet?: FhirCanonical;
  answerOption?: QuestionnaireItemAnswerOption[];
  initial?: QuestionnaireItemInitial[];
  item?: QuestionnaireItem[]; // Nested items
}

// ============================================
// Questionnaire Resource
// ============================================

export interface Questionnaire extends DomainResource {
  resourceType: 'Questionnaire';
  url?: FhirUri;
  identifier?: Identifier[];
  version?: string;
  name?: string;
  title?: string;
  derivedFrom?: FhirCanonical[];
  status: PublicationStatus;
  experimental?: boolean;
  subjectType?: FhirCode[];
  date?: FhirDateTime;
  publisher?: string;
  contact?: ContactDetail[];
  description?: string;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: string;
  copyright?: string;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  code?: Coding[];
  item?: QuestionnaireItem[];
}

// Supporting types for Questionnaire
export interface ContactDetail {
  name?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
}

export interface UsageContext {
  code: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: { low?: Quantity; high?: Quantity };
  valueReference?: Reference;
}

// ============================================
// QuestionnaireResponse Status
// ============================================

export type QuestionnaireResponseStatus =
  | 'in-progress'    // Response is being worked on
  | 'completed'      // Response is complete
  | 'amended'        // Response has been amended
  | 'entered-in-error'  // Entered in error
  | 'stopped';       // Response was stopped before completion

// ============================================
// QuestionnaireResponse Answer
// ============================================

export interface QuestionnaireResponseAnswer extends BackboneElement {
  valueBoolean?: boolean;
  valueDecimal?: FhirDecimal;
  valueInteger?: FhirInteger;
  valueDate?: FhirDate;
  valueDateTime?: FhirDateTime;
  valueTime?: FhirTime;
  valueString?: string;
  valueUri?: FhirUri;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference;
  item?: QuestionnaireResponseItem[]; // Nested items for groups
}

// ============================================
// QuestionnaireResponse Item
// ============================================

export interface QuestionnaireResponseItem extends BackboneElement {
  linkId: string;
  definition?: FhirUri;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[]; // Nested items
}

// ============================================
// QuestionnaireResponse Resource
// ============================================

export interface QuestionnaireResponse extends DomainResource {
  resourceType: 'QuestionnaireResponse';
  identifier?: Identifier;
  basedOn?: Reference[]; // CarePlan, ServiceRequest
  partOf?: Reference[]; // Observation, Procedure
  questionnaire?: FhirCanonical;
  status: QuestionnaireResponseStatus;
  subject?: Reference; // Patient, Group
  encounter?: Reference; // Encounter
  authored?: FhirDateTime;
  author?: Reference; // Practitioner, Patient, RelatedPerson, Organization
  source?: Reference; // Patient or RelatedPerson who provided answers
  item?: QuestionnaireResponseItem[];
}

// ============================================
// Assessment Templates (PHQ-9, GAD-7, etc.)
// ============================================

/**
 * PHQ-9 (Patient Health Questionnaire-9) - LOINC 44249-1
 * Depression screening instrument
 */
export const PHQ9_QUESTIONNAIRE: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'phq-9',
  url: 'http://hl7.org/fhir/us/core/Questionnaire/phq-9',
  name: 'PHQ9',
  title: 'Patient Health Questionnaire-9',
  status: 'active',
  subjectType: ['Patient'],
  code: [{
    system: FHIR_CODE_SYSTEMS.LOINC,
    code: LOINC_CODES.PHQ9_PANEL,
    display: 'Patient Health Questionnaire-9'
  }],
  item: [
    createPHQ9Item('phq9-1', '44250-9', 'Little interest or pleasure in doing things'),
    createPHQ9Item('phq9-2', '44255-8', 'Feeling down, depressed, or hopeless'),
    createPHQ9Item('phq9-3', '44259-0', 'Trouble falling or staying asleep, or sleeping too much'),
    createPHQ9Item('phq9-4', '44254-1', 'Feeling tired or having little energy'),
    createPHQ9Item('phq9-5', '44251-7', 'Poor appetite or overeating'),
    createPHQ9Item('phq9-6', '44258-2', 'Feeling bad about yourself'),
    createPHQ9Item('phq9-7', '44252-5', 'Trouble concentrating on things'),
    createPHQ9Item('phq9-8', '44253-3', 'Moving or speaking slowly, or being fidgety'),
    createPHQ9Item('phq9-9', '44260-8', 'Thoughts of self-harm'),
    {
      linkId: 'phq9-total',
      code: [{
        system: FHIR_CODE_SYSTEMS.LOINC,
        code: LOINC_CODES.PHQ9_TOTAL_SCORE,
        display: 'PHQ-9 Total Score'
      }],
      text: 'PHQ-9 Total Score',
      type: 'integer',
      readOnly: true
    }
  ]
};

function createPHQ9Item(linkId: string, loincCode: string, text: string): QuestionnaireItem {
  return {
    linkId,
    code: [{
      system: FHIR_CODE_SYSTEMS.LOINC,
      code: loincCode
    }],
    text,
    type: 'choice',
    required: true,
    answerOption: [
      { valueCoding: { code: '0', display: 'Not at all' } },
      { valueCoding: { code: '1', display: 'Several days' } },
      { valueCoding: { code: '2', display: 'More than half the days' } },
      { valueCoding: { code: '3', display: 'Nearly every day' } }
    ]
  };
}

/**
 * GAD-7 (Generalized Anxiety Disorder-7) - LOINC 69737-5
 * Anxiety screening instrument
 */
export const GAD7_QUESTIONNAIRE: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'gad-7',
  url: 'http://hl7.org/fhir/us/core/Questionnaire/gad-7',
  name: 'GAD7',
  title: 'Generalized Anxiety Disorder 7-item',
  status: 'active',
  subjectType: ['Patient'],
  code: [{
    system: FHIR_CODE_SYSTEMS.LOINC,
    code: LOINC_CODES.GAD7_PANEL,
    display: 'GAD-7'
  }],
  item: [
    createGAD7Item('gad7-1', '69725-0', 'Feeling nervous, anxious, or on edge'),
    createGAD7Item('gad7-2', '68509-9', 'Not being able to stop or control worrying'),
    createGAD7Item('gad7-3', '69733-4', 'Worrying too much about different things'),
    createGAD7Item('gad7-4', '69734-2', 'Trouble relaxing'),
    createGAD7Item('gad7-5', '69735-9', 'Being so restless that it is hard to sit still'),
    createGAD7Item('gad7-6', '69689-6', 'Becoming easily annoyed or irritable'),
    createGAD7Item('gad7-7', '69736-7', 'Feeling afraid as if something awful might happen'),
    {
      linkId: 'gad7-total',
      code: [{
        system: FHIR_CODE_SYSTEMS.LOINC,
        code: LOINC_CODES.GAD7_TOTAL_SCORE,
        display: 'GAD-7 Total Score'
      }],
      text: 'GAD-7 Total Score',
      type: 'integer',
      readOnly: true
    }
  ]
};

function createGAD7Item(linkId: string, loincCode: string, text: string): QuestionnaireItem {
  return {
    linkId,
    code: [{
      system: FHIR_CODE_SYSTEMS.LOINC,
      code: loincCode
    }],
    text,
    type: 'choice',
    required: true,
    answerOption: [
      { valueCoding: { code: '0', display: 'Not at all' } },
      { valueCoding: { code: '1', display: 'Several days' } },
      { valueCoding: { code: '2', display: 'More than half the days' } },
      { valueCoding: { code: '3', display: 'Nearly every day' } }
    ]
  };
}

/**
 * Rivermead Post-Concussion Symptoms Questionnaire
 */
export const RIVERMEAD_PCS_QUESTIONNAIRE: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'rivermead-pcs',
  name: 'RivermeadPCS',
  title: 'Rivermead Post-Concussion Symptoms Questionnaire',
  status: 'active',
  subjectType: ['Patient'],
  code: [{
    system: FHIR_CODE_SYSTEMS.LOINC,
    code: LOINC_CODES.RIVERMEAD_PCS,
    display: 'Rivermead Post-Concussion Symptoms'
  }],
  item: [
    createRivermeadItem('riv-1', 'Headaches'),
    createRivermeadItem('riv-2', 'Feelings of dizziness'),
    createRivermeadItem('riv-3', 'Nausea and/or vomiting'),
    createRivermeadItem('riv-4', 'Noise sensitivity'),
    createRivermeadItem('riv-5', 'Sleep disturbance'),
    createRivermeadItem('riv-6', 'Fatigue, tiring more easily'),
    createRivermeadItem('riv-7', 'Being irritable, easily angered'),
    createRivermeadItem('riv-8', 'Feeling depressed or tearful'),
    createRivermeadItem('riv-9', 'Feeling frustrated or impatient'),
    createRivermeadItem('riv-10', 'Forgetfulness, poor memory'),
    createRivermeadItem('riv-11', 'Poor concentration'),
    createRivermeadItem('riv-12', 'Taking longer to think'),
    createRivermeadItem('riv-13', 'Blurred vision'),
    createRivermeadItem('riv-14', 'Light sensitivity'),
    createRivermeadItem('riv-15', 'Double vision'),
    createRivermeadItem('riv-16', 'Restlessness'),
  ]
};

function createRivermeadItem(linkId: string, text: string): QuestionnaireItem {
  return {
    linkId,
    text,
    type: 'choice',
    required: true,
    answerOption: [
      { valueCoding: { code: '0', display: 'Not experienced at all' } },
      { valueCoding: { code: '1', display: 'No more of a problem' } },
      { valueCoding: { code: '2', display: 'A mild problem' } },
      { valueCoding: { code: '3', display: 'A moderate problem' } },
      { valueCoding: { code: '4', display: 'A severe problem' } }
    ]
  };
}

/**
 * Visual Analog Scale for Pain - LOINC 72514-3
 */
export const VAS_PAIN_QUESTIONNAIRE: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'vas-pain',
  name: 'VASPain',
  title: 'Visual Analog Scale - Pain',
  status: 'active',
  subjectType: ['Patient'],
  code: [{
    system: FHIR_CODE_SYSTEMS.LOINC,
    code: LOINC_CODES.VAS_PAIN,
    display: 'Pain severity - 0-10 verbal numeric rating'
  }],
  item: [{
    linkId: 'vas-pain-score',
    code: [{
      system: FHIR_CODE_SYSTEMS.LOINC,
      code: LOINC_CODES.VAS_PAIN
    }],
    text: 'On a scale of 0 to 10, where 0 is no pain and 10 is the worst pain imaginable, how would you rate your pain right now?',
    type: 'integer',
    required: true
  }]
};

// ============================================
// QuestionnaireResponse Builder & Utilities
// ============================================

export interface QuestionnaireResponseInput {
  id?: string;
  questionnaire: string; // Canonical URL or reference
  patientId: string;
  patientDisplay?: string;
  encounterId?: string;
  authorId?: string; // Practitioner or Patient who authored
  authorType?: 'Practitioner' | 'Patient' | 'RelatedPerson';
  authorDisplay?: string;
  status?: QuestionnaireResponseStatus;
  authored?: string;
  answers: Record<string, number | string | boolean>; // linkId -> value
}

/**
 * Create a FHIR QuestionnaireResponse from simple input
 */
export function createQuestionnaireResponse(input: QuestionnaireResponseInput): QuestionnaireResponse {
  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: input.id,
    questionnaire: input.questionnaire,
    status: input.status || 'completed',
    subject: createReference('Patient', input.patientId, input.patientDisplay),
    authored: input.authored || new Date().toISOString(),
    item: []
  };

  // Encounter reference
  if (input.encounterId) {
    response.encounter = createReference('Encounter', input.encounterId);
  }

  // Author reference
  if (input.authorId && input.authorType) {
    response.author = createReference(input.authorType, input.authorId, input.authorDisplay);
  }

  // Convert answers to FHIR format
  for (const [linkId, value] of Object.entries(input.answers)) {
    const item: QuestionnaireResponseItem = {
      linkId,
      answer: [createAnswerValue(value)]
    };
    response.item!.push(item);
  }

  return response;
}

/**
 * Create an answer value based on type
 */
function createAnswerValue(value: number | string | boolean): QuestionnaireResponseAnswer {
  if (typeof value === 'boolean') {
    return { valueBoolean: value };
  } else if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { valueInteger: value };
    }
    return { valueDecimal: value };
  } else {
    // Check if it's a coded value (number as string)
    if (/^\d+$/.test(value)) {
      return {
        valueCoding: { code: value }
      };
    }
    return { valueString: value };
  }
}

/**
 * Calculate total score from QuestionnaireResponse
 */
export function calculateQuestionnaireScore(response: QuestionnaireResponse): number {
  let total = 0;

  for (const item of response.item || []) {
    for (const answer of item.answer || []) {
      if (answer.valueInteger !== undefined) {
        total += answer.valueInteger;
      } else if (answer.valueCoding?.code) {
        const numValue = parseInt(answer.valueCoding.code, 10);
        if (!isNaN(numValue)) {
          total += numValue;
        }
      }
    }
  }

  return total;
}

/**
 * Get interpretation for PHQ-9 score
 */
export function interpretPHQ9Score(score: number): { severity: string; interpretation: string } {
  if (score <= 4) {
    return { severity: 'minimal', interpretation: 'Minimal depression' };
  } else if (score <= 9) {
    return { severity: 'mild', interpretation: 'Mild depression' };
  } else if (score <= 14) {
    return { severity: 'moderate', interpretation: 'Moderate depression' };
  } else if (score <= 19) {
    return { severity: 'moderately-severe', interpretation: 'Moderately severe depression' };
  } else {
    return { severity: 'severe', interpretation: 'Severe depression' };
  }
}

/**
 * Get interpretation for GAD-7 score
 */
export function interpretGAD7Score(score: number): { severity: string; interpretation: string } {
  if (score <= 4) {
    return { severity: 'minimal', interpretation: 'Minimal anxiety' };
  } else if (score <= 9) {
    return { severity: 'mild', interpretation: 'Mild anxiety' };
  } else if (score <= 14) {
    return { severity: 'moderate', interpretation: 'Moderate anxiety' };
  } else {
    return { severity: 'severe', interpretation: 'Severe anxiety' };
  }
}

/**
 * Get interpretation for Rivermead PCS score
 */
export function interpretRivermeadScore(score: number): { severity: string; interpretation: string } {
  if (score <= 12) {
    return { severity: 'minimal', interpretation: 'Minimal post-concussion symptoms' };
  } else if (score <= 24) {
    return { severity: 'mild', interpretation: 'Mild post-concussion symptoms' };
  } else if (score <= 36) {
    return { severity: 'moderate', interpretation: 'Moderate post-concussion symptoms' };
  } else {
    return { severity: 'severe', interpretation: 'Severe post-concussion symptoms' };
  }
}

/**
 * Get interpretation for VAS Pain score
 */
export function interpretVASPainScore(score: number): { severity: string; interpretation: string } {
  if (score === 0) {
    return { severity: 'none', interpretation: 'No pain' };
  } else if (score <= 3) {
    return { severity: 'mild', interpretation: 'Mild pain' };
  } else if (score <= 6) {
    return { severity: 'moderate', interpretation: 'Moderate pain' };
  } else {
    return { severity: 'severe', interpretation: 'Severe pain' };
  }
}
