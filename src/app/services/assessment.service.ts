import { Injectable, signal, computed } from '@angular/core';
import {
  AssessmentType,
  AssessmentTemplate,
  PatientAssessment,
  AssessmentResponse,
  PatientAccessToken,
  ASSESSMENT_TEMPLATES,
  calculateScore,
  getInterpretation
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private _assessments = signal<PatientAssessment[]>([]);
  private _currentAssessment = signal<PatientAssessment | null>(null);
  private _accessTokens = signal<PatientAccessToken[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly assessments = this._assessments.asReadonly();
  readonly currentAssessment = this._currentAssessment.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Get available assessment templates
  getAvailableTemplates(): AssessmentTemplate[] {
    return [
      ASSESSMENT_TEMPLATES.phq9,
      ASSESSMENT_TEMPLATES.rivermead_pcs,
      ASSESSMENT_TEMPLATES.gad7,
      ASSESSMENT_TEMPLATES.vas_pain
    ];
  }

  getTemplate(type: AssessmentType): AssessmentTemplate {
    return ASSESSMENT_TEMPLATES[type];
  }

  // Create a new assessment for staff entry
  createStaffAssessment(
    patientId: string,
    type: AssessmentType,
    staffUserId: string,
    caseId?: string
  ): PatientAssessment {
    const assessment: PatientAssessment = {
      id: this.generateId(),
      patientId,
      caseId,
      assessmentType: type,
      entryMode: 'staff',
      enteredBy: staffUserId,
      status: 'in_progress',
      responses: [],
      createdAt: new Date().toISOString()
    };

    this._assessments.update(list => [...list, assessment]);
    this._currentAssessment.set(assessment);
    return assessment;
  }

  // Create a patient self-service assessment with secure link
  createPatientAssessment(
    patientId: string,
    type: AssessmentType,
    createdByStaffId: string,
    options: {
      caseId?: string;
      email?: string;
      phone?: string;
      expiresInHours?: number;
    } = {}
  ): { assessment: PatientAssessment; accessToken: PatientAccessToken; link: string } {
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (options.expiresInHours || 72));

    const assessment: PatientAssessment = {
      id: this.generateId(),
      patientId,
      caseId: options.caseId,
      assessmentType: type,
      entryMode: 'patient',
      status: 'pending',
      responses: [],
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessToken: token
    };

    const accessToken: PatientAccessToken = {
      token,
      patientId,
      assessmentId: assessment.id,
      email: options.email,
      phone: options.phone,
      expiresAt: expiresAt.toISOString(),
      createdBy: createdByStaffId
    };

    this._assessments.update(list => [...list, assessment]);
    this._accessTokens.update(list => [...list, accessToken]);

    // Generate the patient-facing link
    const link = `${window.location.origin}/patient/assessment/${token}`;

    return { assessment, accessToken, link };
  }

  // Validate and load assessment by access token (for patient portal)
  async loadAssessmentByToken(token: string): Promise<PatientAssessment | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const accessToken = this._accessTokens().find(t => t.token === token);
      if (!accessToken) {
        this._error.set('This link is invalid or has already been used.');
        return null;
      }

      if (new Date(accessToken.expiresAt) < new Date()) {
        this._error.set('This link has expired. Please contact your care team for a new link.');
        return null;
      }

      if (accessToken.usedAt) {
        this._error.set('This questionnaire has already been completed. Thank you!');
        return null;
      }

      const assessment = this._assessments().find(a => a.id === accessToken.assessmentId);
      if (!assessment) {
        this._error.set('Assessment not found.');
        return null;
      }

      if (assessment.status === 'completed') {
        this._error.set('This questionnaire has already been completed. Thank you!');
        return null;
      }

      this._currentAssessment.set(assessment);
      return assessment;
    } finally {
      this._loading.set(false);
    }
  }

  // Save a response
  saveResponse(assessmentId: string, questionId: string, value: number | string | boolean): void {
    this._assessments.update(list =>
      list.map(a => {
        if (a.id !== assessmentId) return a;

        const existingIndex = a.responses.findIndex(r => r.questionId === questionId);
        const response: AssessmentResponse = {
          questionId,
          value,
          timestamp: new Date().toISOString()
        };

        const newResponses = [...a.responses];
        if (existingIndex >= 0) {
          newResponses[existingIndex] = response;
        } else {
          newResponses.push(response);
        }

        return { ...a, responses: newResponses, status: 'in_progress' as const };
      })
    );

    // Update current assessment if it matches
    const updated = this._assessments().find(a => a.id === assessmentId);
    if (updated && this._currentAssessment()?.id === assessmentId) {
      this._currentAssessment.set(updated);
    }
  }

  // Complete an assessment
  completeAssessment(assessmentId: string): PatientAssessment | null {
    // Find the assessment first to get the token
    const existingAssessment = this._assessments().find(a => a.id === assessmentId);
    if (!existingAssessment) return null;

    const template = this.getTemplate(existingAssessment.assessmentType);
    const score = calculateScore(template, existingAssessment.responses);
    const interpretation = getInterpretation(template, score);

    const completedAssessment: PatientAssessment = {
      ...existingAssessment,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      totalScore: score,
      interpretation: interpretation?.label,
      severity: interpretation?.severity
    };

    // Update the assessments list
    this._assessments.update(list =>
      list.map(a => a.id === assessmentId ? completedAssessment : a)
    );

    // Mark access token as used
    if (completedAssessment.accessToken) {
      const token = completedAssessment.accessToken;
      this._accessTokens.update(list =>
        list.map(t =>
          t.token === token
            ? { ...t, usedAt: new Date().toISOString() }
            : t
        )
      );
    }

    this._currentAssessment.set(null);
    return completedAssessment;
  }

  // Get assessments for a patient
  getPatientAssessments(patientId: string): PatientAssessment[] {
    return this._assessments().filter(a => a.patientId === patientId);
  }

  // Get assessments for a case
  getCaseAssessments(caseId: string): PatientAssessment[] {
    return this._assessments().filter(a => a.caseId === caseId);
  }

  // Get pending patient assessments (for reminders)
  getPendingPatientAssessments(): PatientAssessment[] {
    return this._assessments().filter(
      a => a.entryMode === 'patient' && a.status === 'pending'
    );
  }

  // Resend assessment link
  resendAssessmentLink(assessmentId: string): string | null {
    const assessment = this._assessments().find(a => a.id === assessmentId);
    if (!assessment || assessment.status === 'completed') return null;

    // Generate new token
    const newToken = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // Update assessment
    this._assessments.update(list =>
      list.map(a =>
        a.id === assessmentId
          ? { ...a, accessToken: newToken, expiresAt: expiresAt.toISOString() }
          : a
      )
    );

    // Update token
    this._accessTokens.update(list =>
      list.map(t =>
        t.assessmentId === assessmentId
          ? { ...t, token: newToken, expiresAt: expiresAt.toISOString(), usedAt: undefined }
          : t
      )
    );

    return `${window.location.origin}/patient/assessment/${newToken}`;
  }

  // Helper methods
  private generateId(): string {
    return 'asmt_' + Math.random().toString(36).substring(2, 15);
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get friendly name for assessment type
  getFriendlyName(type: AssessmentType): string {
    const friendlyNames: Record<AssessmentType, string> = {
      phq9: 'Mood & Wellbeing Check',
      rivermead_pcs: 'Head Injury Symptoms Check',
      gad7: 'Worry & Anxiety Check',
      vas_pain: 'Pain Level Check',
      oswestry: 'Back Pain Assessment',
      neck_disability: 'Neck Pain Assessment',
      sf36: 'Overall Health Survey',
      dash: 'Arm & Shoulder Function',
      custom: 'Custom Assessment'
    };
    return friendlyNames[type] || type;
  }

  // Get patient-friendly description
  getFriendlyDescription(type: AssessmentType): string {
    const descriptions: Record<AssessmentType, string> = {
      phq9: 'A few quick questions about how you\'ve been feeling lately. This helps us understand your emotional wellbeing.',
      rivermead_pcs: 'Questions about symptoms you may have experienced since your injury. This helps us track your recovery.',
      gad7: 'Questions about worry and nervousness. Your answers help us support you better.',
      vas_pain: 'A simple way to tell us about your pain levels. Takes less than a minute.',
      oswestry: 'Questions about how your back affects daily activities.',
      neck_disability: 'Questions about how your neck affects daily activities.',
      sf36: 'A comprehensive look at your overall health and quality of life.',
      dash: 'Questions about your arm, shoulder, and hand function.',
      custom: 'A customized set of questions from your care team.'
    };
    return descriptions[type] || '';
  }
}
