import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CarePlanService } from '../../services/care-plan.service';
import { AuthService } from '../../services/auth.service';
import { ViewVariation } from '../../models/care-plan.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Impersonation Banner -->
    @if (authService.impersonation().isImpersonating) {
      <div class="bg-amber-500 text-white py-2 px-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="font-medium">
              Viewing as: {{ authService.impersonation().impersonatingOrgName }}
            </span>
          </div>
          <button
            (click)="stepOut()"
            class="px-3 py-1 bg-white text-amber-600 rounded text-sm font-medium hover:bg-amber-50"
          >
            Step Out
          </button>
        </div>
      </div>
    }

    <!-- Main Header -->
    <header class="bg-neuro-blue text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
              </svg>
            </div>
            <span class="font-semibold tracking-wider">
              <span class="text-white">deploy</span>
              <span class="text-blue-200">.care</span>
            </span>
          </a>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6 text-sm">
            @for (item of navItems(); track item.path) {
              <a [routerLink]="item.path"
                 routerLinkActive="border-b-2 border-white pb-1"
                 class="hover:text-blue-200 transition">
                {{ item.label }}
              </a>
            }
          </nav>
        </div>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          @if (authService.isAuthenticated()) {
            <button class="p-2 hover:bg-blue-700 rounded-full transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div class="flex items-center gap-2 cursor-pointer group relative">
              <div class="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-medium">
                {{ userInitial() }}
              </div>
              <div class="text-sm">
                <div class="font-medium">{{ userName() }}</div>
                <div class="text-blue-200 text-xs">{{ userRole() }}</div>
              </div>
              <!-- Dropdown -->
              <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-50">
                @if (authService.isAdmin()) {
                  <a routerLink="/admin" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                    Admin Console
                  </a>
                  <div class="border-t border-gray-100 my-1"></div>
                }
                <button
                  (click)="signOut()"
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          } @else {
            <a routerLink="/login" class="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50">
              Sign In
            </a>
          }
        </div>
      </div>
    </header>

    <!-- Variation Selector (only on care-plans page) -->
    @if (showVariationSelector) {
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-center gap-4">
            <span class="text-sm font-medium">View:</span>
            <div class="flex gap-2">
              @for (variation of variations; track variation.key) {
                <button
                  (click)="setVariation(variation.key)"
                  [class]="getVariationButtonClass(variation.key)">
                  {{ variation.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class HeaderComponent {
  private carePlanService = inject(CarePlanService);
  private router = inject(Router);
  authService = inject(AuthService);

  navItems = computed(() => {
    const base = [
      { label: 'DASHBOARD', path: '/dashboard' },
      { label: 'CARE PLANS', path: '/care-plans' },
      { label: 'CASES', path: '/cases' },
      { label: 'SETTINGS', path: '/settings' }
    ];

    if (this.authService.isAdmin()) {
      base.push({ label: 'ADMIN', path: '/admin' });
    }

    return base;
  });

  userInitial = computed(() => {
    const profile = this.authService.profile();
    if (profile?.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile?.email) return profile.email.charAt(0).toUpperCase();
    return 'U';
  });

  userName = computed(() => {
    const profile = this.authService.profile();
    if (profile?.first_name) {
      return profile.first_name + (profile.last_name ? ' ' + profile.last_name : '');
    }
    return profile?.email?.split('@')[0] || 'User';
  });

  userRole = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '';

    const orgName = this.authService.impersonation().isImpersonating
      ? this.authService.impersonation().impersonatingOrgName
      : profile.organization_name;

    const roleLabel = profile.role === 'super_admin' ? 'Super Admin' :
                      profile.role === 'org_admin' ? 'Admin' :
                      profile.role === 'provider' ? 'Provider' : 'Staff';

    return orgName ? `${roleLabel} • ${orgName}` : roleLabel;
  });

  variations: { key: ViewVariation; label: string }[] = [
    { key: 'list', label: 'List View' },
    { key: 'card', label: 'Card Grid' },
    { key: 'hybrid', label: 'Hybrid' }
  ];

  get showVariationSelector(): boolean {
    return window.location.pathname === '/care-plans';
  }

  get currentVariation(): ViewVariation {
    return this.carePlanService.viewVariation();
  }

  setVariation(variation: ViewVariation): void {
    this.carePlanService.setViewVariation(variation);
  }

  getVariationButtonClass(variation: ViewVariation): string {
    const base = 'px-4 py-1.5 rounded-full text-sm font-medium transition';
    return variation === this.currentVariation
      ? `${base} bg-white text-purple-600`
      : `${base} bg-white/20 hover:bg-white/30`;
  }

  stepOut() {
    this.authService.stepOut();
  }

  async signOut() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
