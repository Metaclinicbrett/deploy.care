/**
 * Assessment/Questionnaire Models
 * Supports both staff entry and patient self-service completion
 */

export type AssessmentType =
  | 'phq9'           // Patient Health Questionnaire (Depression)
  | 'rivermead_pcs'  // Rivermead Post-Concussion Symptoms
  | 'gad7'           // Generalized Anxiety Disorder
  | 'oswestry'       // Oswestry Disability Index (Back Pain)
  | 'neck_disability' // Neck Disability Index
  | 'vas_pain'       // Visual Analog Scale for Pain
  | 'sf36'           // Short Form 36 Health Survey
  | 'dash'           // Disabilities of Arm, Shoulder, Hand
  | 'custom';

export type QuestionType =
  | 'scale'          // Numeric scale (0-10, 0-4, etc.)
  | 'multiple_choice'
  | 'yes_no'
  | 'text'
  | 'number'
  | 'date';

export type EntryMode = 'staff' | 'patient';

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: { value: number | string; label: string }[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  section?: string;
}

export interface AssessmentTemplate {
  id: AssessmentType;
  name: string;
  shortName: string;
  description: string;
  instructions: string;
  questions: AssessmentQuestion[];
  scoringMethod?: 'sum' | 'average' | 'custom';
  maxScore?: number;
  interpretations?: { minScore: number; maxScore: number; label: string; severity: string }[];
  estimatedMinutes: number;
}

export interface AssessmentResponse {
  questionId: string;
  value: number | string | boolean;
  timestamp?: string;
}

export interface PatientAssessment {
  id: string;
  patientId: string;
  caseId?: string;
  encounterId?: string;
  assessmentType: AssessmentType;
  entryMode: EntryMode;
  enteredBy?: string; // Staff user ID if staff entry
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  responses: AssessmentResponse[];
  totalScore?: number;
  interpretation?: string;
  severity?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  accessToken?: string; // For patient self-service links
}

export interface PatientAccessToken {
  token: string;
  patientId: string;
  assessmentId: string;
  email?: string;
  phone?: string;
  expiresAt: string;
  usedAt?: string;
  createdBy: string;
}

// ============================================
// PHQ-9 (Patient Health Questionnaire-9)
// ============================================
export const PHQ9_TEMPLATE: AssessmentTemplate = {
  id: 'phq9',
  name: 'Patient Health Questionnaire-9',
  shortName: 'PHQ-9',
  description: 'A 9-question instrument for screening, diagnosing, monitoring and measuring the severity of depression.',
  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  estimatedMinutes: 3,
  scoringMethod: 'sum',
  maxScore: 27,
  interpretations: [
    { minScore: 0, maxScore: 4, label: 'Minimal depression', severity: 'minimal' },
    { minScore: 5, maxScore: 9, label: 'Mild depression', severity: 'mild' },
    { minScore: 10, maxScore: 14, label: 'Moderate depression', severity: 'moderate' },
    { minScore: 15, maxScore: 19, label: 'Moderately severe depression', severity: 'moderately_severe' },
    { minScore: 20, maxScore: 27, label: 'Severe depression', severity: 'severe' }
  ],
  questions: [
    {
      id: 'phq9_1',
      text: 'Little interest or pleasure in doing things',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_2',
      text: 'Feeling down, depressed, or hopeless',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_3',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_4',
      text: 'Feeling tired or having little energy',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_5',
      text: 'Poor appetite or overeating',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_6',
      text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_8',
      text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_9',
      text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_difficulty',
      text: 'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
      type: 'multiple_choice',
      required: false,
      options: [
        { value: 'not_difficult', label: 'Not difficult at all' },
        { value: 'somewhat', label: 'Somewhat difficult' },
        { value: 'very', label: 'Very difficult' },
        { value: 'extremely', label: 'Extremely difficult' }
      ]
    }
  ]
};

// ============================================
// Rivermead Post-Concussion Symptoms Questionnaire
// ============================================
export const RIVERMEAD_PCS_TEMPLATE: AssessmentTemplate = {
  id: 'rivermead_pcs',
  name: 'Rivermead Post-Concussion Symptoms Questionnaire',
  shortName: 'RPQ',
  description: 'A standardized questionnaire for assessing the severity of post-concussion symptoms.',
  instructions: 'After a head injury or accident some people experience symptoms which can cause worry or nuisance. We would like to know if you now suffer from any of the symptoms given below. Because many of these symptoms occur normally, we would like you to compare yourself now with before the accident.',
  estimatedMinutes: 5,
  scoringMethod: 'sum',
  maxScore: 64,
  interpretations: [
    { minScore: 0, maxScore: 12, label: 'Minimal symptoms', severity: 'minimal' },
    { minScore: 13, maxScore: 24, label: 'Mild symptoms', severity: 'mild' },
    { minScore: 25, maxScore: 40, label: 'Moderate symptoms', severity: 'moderate' },
    { minScore: 41, maxScore: 64, label: 'Severe symptoms', severity: 'severe' }
  ],
  questions: [
    {
      id: 'rpq_1',
      text: 'Headaches',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_2',
      text: 'Feelings of dizziness',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_3',
      text: 'Nausea and/or vomiting',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_4',
      text: 'Noise sensitivity, easily upset by loud noise',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_5',
      text: 'Sleep disturbance',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_6',
      text: 'Fatigue, tiring more easily',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_7',
      text: 'Being irritable, easily angered',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_8',
      text: 'Feeling depressed or tearful',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_9',
      text: 'Feeling frustrated or impatient',
      type: 'scale',
      required: true,
      section: 'Symptoms',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_10',
      text: 'Forgetfulness, poor memory',
      type: 'scale',
      required: true,
      section: 'Cognitive',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_11',
      text: 'Poor concentration',
      type: 'scale',
      required: true,
      section: 'Cognitive',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_12',
      text: 'Taking longer to think',
      type: 'scale',
      required: true,
      section: 'Cognitive',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_13',
      text: 'Blurred vision',
      type: 'scale',
      required: true,
      section: 'Vision',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_14',
      text: 'Light sensitivity, easily upset by bright light',
      type: 'scale',
      required: true,
      section: 'Vision',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_15',
      text: 'Double vision',
      type: 'scale',
      required: true,
      section: 'Vision',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    },
    {
      id: 'rpq_16',
      text: 'Restlessness',
      type: 'scale',
      required: true,
      section: 'Other',
      options: [
        { value: 0, label: 'Not experienced at all' },
        { value: 1, label: 'No more of a problem' },
        { value: 2, label: 'A mild problem' },
        { value: 3, label: 'A moderate problem' },
        { value: 4, label: 'A severe problem' }
      ]
    }
  ]
};

// ============================================
// GAD-7 (Generalized Anxiety Disorder)
// ============================================
export const GAD7_TEMPLATE: AssessmentTemplate = {
  id: 'gad7',
  name: 'Generalized Anxiety Disorder 7-item',
  shortName: 'GAD-7',
  description: 'A brief self-report questionnaire for screening generalized anxiety disorder.',
  instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  estimatedMinutes: 2,
  scoringMethod: 'sum',
  maxScore: 21,
  interpretations: [
    { minScore: 0, maxScore: 4, label: 'Minimal anxiety', severity: 'minimal' },
    { minScore: 5, maxScore: 9, label: 'Mild anxiety', severity: 'mild' },
    { minScore: 10, maxScore: 14, label: 'Moderate anxiety', severity: 'moderate' },
    { minScore: 15, maxScore: 21, label: 'Severe anxiety', severity: 'severe' }
  ],
  questions: [
    {
      id: 'gad7_1',
      text: 'Feeling nervous, anxious, or on edge',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_2',
      text: 'Not being able to stop or control worrying',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_3',
      text: 'Worrying too much about different things',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_4',
      text: 'Trouble relaxing',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_5',
      text: 'Being so restless that it\'s hard to sit still',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_6',
      text: 'Becoming easily annoyed or irritable',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_7',
      text: 'Feeling afraid as if something awful might happen',
      type: 'scale',
      required: true,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ]
};

// ============================================
// VAS Pain Scale
// ============================================
export const VAS_PAIN_TEMPLATE: AssessmentTemplate = {
  id: 'vas_pain',
  name: 'Visual Analog Scale - Pain',
  shortName: 'VAS Pain',
  description: 'A simple scale for measuring pain intensity.',
  instructions: 'Please indicate your current level of pain by selecting a number from 0 to 10.',
  estimatedMinutes: 1,
  scoringMethod: 'sum',
  maxScore: 10,
  interpretations: [
    { minScore: 0, maxScore: 0, label: 'No pain', severity: 'none' },
    { minScore: 1, maxScore: 3, label: 'Mild pain', severity: 'mild' },
    { minScore: 4, maxScore: 6, label: 'Moderate pain', severity: 'moderate' },
    { minScore: 7, maxScore: 10, label: 'Severe pain', severity: 'severe' }
  ],
  questions: [
    {
      id: 'vas_current',
      text: 'Rate your current pain level',
      type: 'scale',
      required: true,
      minValue: 0,
      maxValue: 10,
      minLabel: 'No Pain',
      maxLabel: 'Worst Pain Imaginable'
    },
    {
      id: 'vas_average',
      text: 'Rate your average pain level over the past week',
      type: 'scale',
      required: true,
      minValue: 0,
      maxValue: 10,
      minLabel: 'No Pain',
      maxLabel: 'Worst Pain Imaginable'
    },
    {
      id: 'vas_worst',
      text: 'Rate your worst pain level over the past week',
      type: 'scale',
      required: true,
      minValue: 0,
      maxValue: 10,
      minLabel: 'No Pain',
      maxLabel: 'Worst Pain Imaginable'
    }
  ]
};

// Template registry
export const ASSESSMENT_TEMPLATES: Record<AssessmentType, AssessmentTemplate> = {
  phq9: PHQ9_TEMPLATE,
  rivermead_pcs: RIVERMEAD_PCS_TEMPLATE,
  gad7: GAD7_TEMPLATE,
  vas_pain: VAS_PAIN_TEMPLATE,
  oswestry: PHQ9_TEMPLATE, // Placeholder - would need full implementation
  neck_disability: PHQ9_TEMPLATE, // Placeholder
  sf36: PHQ9_TEMPLATE, // Placeholder
  dash: PHQ9_TEMPLATE, // Placeholder
  custom: PHQ9_TEMPLATE // Placeholder
};

// Helper functions
export function calculateScore(template: AssessmentTemplate, responses: AssessmentResponse[]): number {
  if (template.scoringMethod === 'sum') {
    return responses.reduce((sum, r) => {
      const value = typeof r.value === 'number' ? r.value : 0;
      return sum + value;
    }, 0);
  }
  return 0;
}

export function getInterpretation(template: AssessmentTemplate, score: number): { label: string; severity: string } | null {
  if (!template.interpretations) return null;
  return template.interpretations.find(i => score >= i.minScore && score <= i.maxScore) || null;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    none: 'green',
    minimal: 'green',
    mild: 'amber',
    moderate: 'orange',
    moderately_severe: 'red',
    severe: 'red'
  };
  return colors[severity] || 'gray';
}
