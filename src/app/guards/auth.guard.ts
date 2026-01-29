import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (authService.loading()) {
    return true; // Will be checked again when loading completes
  }

  if (!authService.isAuthenticated()) {
    if (authService.isPendingApproval()) {
      router.navigate(['/pending-approval']);
      return false;
    }
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  // If already authenticated, redirect to appropriate dashboard
  if (authService.isAuthenticated()) {
    if (authService.isLawFirm()) {
      router.navigate(['/law-firm/dashboard']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  return true;
};

/**
 * Guard for law firm specific routes
 * Only allows users with law_firm role
 */
export const lawFirmGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  if (!authService.isLawFirm()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

/**
 * Guard for clinic/provider specific routes
 * Excludes law firm users
 */
export const providerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  // Law firms cannot access provider routes
  if (authService.isLawFirm()) {
    router.navigate(['/law-firm/dashboard']);
    return false;
  }

  return true;
};

/**
 * Guard for settlement-related routes
 * Requires user to be authenticated and have settlement permissions
 */
export const settlementGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  // Must be authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Admin, org_admin, law_firm, and providers can access settlement routes
  const profile = authService.profile();
  const allowedRoles = ['super_admin', 'org_admin', 'provider', 'law_firm'];

  if (profile && allowedRoles.includes(profile.role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard for escalation queue (admin only)
 */
export const escalationGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return true;
  }

  // Only super_admin and org_admin can access escalation queue
  const profile = authService.profile();
  if (profile && ['super_admin', 'org_admin'].includes(profile.role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
