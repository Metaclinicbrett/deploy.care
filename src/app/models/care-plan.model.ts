export interface DiagnosisCode {
  code: string;
  description: string;
}

export type CareType = 'DX' | 'TX' | 'DX/TX';
export type PricingModel = 'subscription' | 'one-time';
export type ColorTheme = 'amber' | 'blue' | 'purple' | 'pink' | 'teal' | 'green' | 'red' | 'indigo' | 'orange' | 'cyan';

/**
 * Patient Experience Type - indicates what kind of treatment/device the care model uses
 */
export type PatientExperienceType =
  | 'medical_device'
  | 'wearable'
  | 'test'
  | 'lab_test'
  | 'medicine'
  | 'electroceutical'
  | 'therapy'
  | 'telemedicine'
  | 'in_person';

/**
 * Experience type configuration with icon and display info
 */
export interface ExperienceTypeConfig {
  type: PatientExperienceType;
  label: string;
  icon: string;
  description: string;
  defaultColor: string;
}

/**
 * Get configuration for a patient experience type
 */
export const EXPERIENCE_TYPE_CONFIGS: Record<PatientExperienceType, ExperienceTypeConfig> = {
  medical_device: {
    type: 'medical_device',
    label: 'Medical Device',
    icon: '🔬',
    description: 'FDA-cleared medical device treatment',
    defaultColor: 'blue'
  },
  wearable: {
    type: 'wearable',
    label: 'Wearable',
    icon: '⌚',
    description: 'Wearable monitoring or therapeutic device',
    defaultColor: 'purple'
  },
  test: {
    type: 'test',
    label: 'Diagnostic Test',
    icon: '📋',
    description: 'Diagnostic assessment or evaluation',
    defaultColor: 'amber'
  },
  lab_test: {
    type: 'lab_test',
    label: 'Lab Test',
    icon: '🧪',
    description: 'Laboratory testing and analysis',
    defaultColor: 'teal'
  },
  medicine: {
    type: 'medicine',
    label: 'Medicine',
    icon: '💊',
    description: 'Pharmaceutical treatment',
    defaultColor: 'green'
  },
  electroceutical: {
    type: 'electroceutical',
    label: 'Electroceutical',
    icon: '⚡',
    description: 'Electrical stimulation therapy (VNS, TMS, etc.)',
    defaultColor: 'indigo'
  },
  therapy: {
    type: 'therapy',
    label: 'Therapy',
    icon: '🧠',
    description: 'Therapeutic session or program',
    defaultColor: 'pink'
  },
  telemedicine: {
    type: 'telemedicine',
    label: 'Telemedicine',
    icon: '📱',
    description: 'Remote/virtual care delivery',
    defaultColor: 'cyan'
  },
  in_person: {
    type: 'in_person',
    label: 'In-Person',
    icon: '🏥',
    description: 'In-person clinical visit',
    defaultColor: 'orange'
  }
};

/**
 * Location information with logo and branding
 */
export interface CarePlanLocation {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  logoUrl?: string;
  brandColor?: string;
  isDefault?: boolean;
}

/**
 * User color preference for care plan display
 */
export interface UserColorPreference {
  carePlanId: number;
  userId: string;
  customColor?: ColorTheme;
  highlightColor?: string;
  accentColor?: string;
}

export interface CarePlan {
  id: number;
  name: string;
  provider: string;
  location: string | null;
  type: string;
  description: string;
  diagnosisCodes: DiagnosisCode[];
  cptCodes: string[];
  careType: CareType;
  pricingModel: PricingModel;
  price: number;
  priceUnit: string;
  depositRequired: boolean;
  depositAmount?: number;
  lopRequired: boolean;
  documentsRequired: string[];
  color: ColorTheme;
  // NEW: Patient Experience Fields
  experienceType?: PatientExperienceType;
  experienceTypes?: PatientExperienceType[]; // Support multiple types
  locationDetails?: CarePlanLocation;
  locations?: CarePlanLocation[]; // Multiple locations
  customBrandColor?: string;
  logoUrl?: string;
}

/**
 * Get the icon for a patient experience type
 */
export function getExperienceIcon(type: PatientExperienceType): string {
  return EXPERIENCE_TYPE_CONFIGS[type]?.icon || '📋';
}

/**
 * Get the label for a patient experience type
 */
export function getExperienceLabel(type: PatientExperienceType): string {
  return EXPERIENCE_TYPE_CONFIGS[type]?.label || type;
}

/**
 * Get all experience type options for dropdowns
 */
export function getExperienceTypeOptions(): ExperienceTypeConfig[] {
  return Object.values(EXPERIENCE_TYPE_CONFIGS);
}

export interface CarePlanFilters {
  search: string;
  quickFilter: string;
  diagnosisCode: string;
  cptCode: string;
  depositRequired: boolean;
  lopRequired: boolean;
  docsRequired: boolean;
}

export type ViewVariation = 'list' | 'card' | 'hybrid';

// Alias for backwards compatibility
export type LocationDetails = CarePlanLocation;
