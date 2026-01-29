import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicGuard, lawFirmGuard, settlementGuard, escalationGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [publicGuard],
    title: 'Login'
  },
  {
    path: 'pending-approval',
    loadComponent: () => import('./pages/pending-approval/pending-approval.component')
      .then(m => m.PendingApprovalComponent),
    title: 'Pending Approval'
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Authenticating...'
  },

  // Protected routes
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard'
  },
  {
    path: 'care-plans',
    loadComponent: () => import('./pages/care-plans/care-plans.component')
      .then(m => m.CarePlansComponent),
    canActivate: [authGuard],
    title: 'Care Plan Enrollment'
  },
  {
    path: 'cases',
    loadComponent: () => import('./pages/cases/cases.component')
      .then(m => m.CasesComponent),
    canActivate: [authGuard],
    title: 'Cases'
  },
  {
    path: 'cases/:id',
    loadComponent: () => import('./pages/case-detail/case-detail.component')
      .then(m => m.CaseDetailComponent),
    canActivate: [authGuard],
    title: 'Case Details'
  },
  {
    path: 'encounters/:id',
    loadComponent: () => import('./pages/encounter-detail/encounter-detail.component')
      .then(m => m.EncounterDetailComponent),
    canActivate: [authGuard],
    title: 'Encounter'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component')
      .then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings'
  },
  {
    path: 'settings/:id',
    loadComponent: () => import('./pages/care-plan-settings/care-plan-settings.component')
      .then(m => m.CarePlanSettingsComponent),
    canActivate: [authGuard],
    title: 'Care Plan Settings'
  },

  // Law Firm routes
  {
    path: 'law-firm/dashboard',
    loadComponent: () => import('./pages/law-firm-dashboard/law-firm-dashboard.component')
      .then(m => m.LawFirmDashboardComponent),
    canActivate: [authGuard, lawFirmGuard],
    title: 'Law Firm Dashboard'
  },
  {
    path: 'law-firm/search',
    loadComponent: () => import('./pages/law-firm-search/law-firm-search.component')
      .then(m => m.LawFirmSearchComponent),
    canActivate: [authGuard, lawFirmGuard],
    title: 'Search Care Models'
  },

  // Settlement routes
  {
    path: 'settlement/approval',
    loadComponent: () => import('./pages/settlement-approval/settlement-approval.component')
      .then(m => m.SettlementApprovalComponent),
    canActivate: [authGuard, settlementGuard],
    title: 'Settlement Approval'
  },

  // Assessment routes (Staff)
  {
    path: 'assessments',
    loadComponent: () => import('./pages/staff-assessment/staff-assessment.component')
      .then(m => m.StaffAssessmentComponent),
    canActivate: [authGuard],
    title: 'Patient Assessments'
  },
  {
    path: 'assessments/entry/:id',
    loadComponent: () => import('./pages/staff-assessment/staff-assessment.component')
      .then(m => m.StaffAssessmentComponent),
    canActivate: [authGuard],
    title: 'Assessment Entry'
  },
  {
    path: 'assessments/results/:id',
    loadComponent: () => import('./pages/staff-assessment/staff-assessment.component')
      .then(m => m.StaffAssessmentComponent),
    canActivate: [authGuard],
    title: 'Assessment Results'
  },

  // Patient Self-Service Portal (public with token)
  {
    path: 'patient/assessment/:token',
    loadComponent: () => import('./pages/patient-assessment/patient-assessment.component')
      .then(m => m.PatientAssessmentComponent),
    title: 'Health Questionnaire'
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component')
      .then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Admin Console'
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
