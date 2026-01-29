/**
 * FHIR R4 Models Index
 *
 * Exports all FHIR resources and utilities for use throughout the application.
 * Based on HL7 FHIR R4 (v4.0.1) specification.
 *
 * Compatible with Oystehr and other FHIR-native platforms.
 */

// Base Types
export * from './base.types';

// Patient Resource
export * from './patient.resource';

// Encounter Resource
export * from './encounter.resource';

// Appointment Resource
export * from './appointment.resource';

// Questionnaire & QuestionnaireResponse Resources
export * from './questionnaire.resource';

// Practitioner, PractitionerRole, Organization Resources
export * from './practitioner.resource';
