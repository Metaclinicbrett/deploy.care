import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- Impersonation Banner -->
    @if (authService.impersonation().isImpersonating) {
      <div class="fixed top-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 z-50">
        <div class="flex items-center justify-center gap-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span class="font-medium">Viewing as: {{ authService.impersonation().impersonatingOrgName }}</span>
          <button
            (click)="stepOut()"
            class="px-3 py-1 bg-white text-amber-600 rounded text-sm font-medium hover:bg-amber-50"
          >
            Exit View
          </button>
        </div>
      </div>
    }

    <div class="flex h-screen bg-gray-50" [class.pt-10]="authService.impersonation().isImpersonating">
      <!-- Sidebar -->
      <aside
        class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
        [class.w-64]="!collapsed()"
        [class.w-20]="collapsed()"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-100">
          <a routerLink="/dashboard" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            @if (!collapsed()) {
              <span class="font-semibold text-gray-900 tracking-tight">
                deploy<span class="text-indigo-600">.care</span>
              </span>
            }
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 px-3">
          @for (section of navSections(); track section.title) {
            @if (section.title && !collapsed()) {
              <div class="px-3 mb-2 mt-6 first:mt-0">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ section.title }}</span>
              </div>
            }
            <div class="space-y-1">
              @for (item of section.items; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-indigo-50 text-indigo-600 border-indigo-200"
                  [routerLinkActiveOptions]="{exact: item.path === '/dashboard'}"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent group"
                  [class.justify-center]="collapsed()"
                  [title]="collapsed() ? item.label : ''"
                >
                  <span class="text-xl flex-shrink-0" [innerHTML]="item.icon"></span>
                  @if (!collapsed()) {
                    <span class="font-medium text-sm">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ item.badge }}</span>
                    }
                  }
                </a>
              }
            </div>
          }
        </nav>

        <!-- Collapse Toggle -->
        <div class="p-3 border-t border-gray-100">
          <button
            (click)="toggleCollapse()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            [class.justify-center]="collapsed()"
          >
            <svg class="w-5 h-5 transition-transform" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-sm">Collapse</span>
            }
          </button>
        </div>

        <!-- User Profile -->
        <div class="p-3 border-t border-gray-100">
          @if (authService.isAuthenticated()) {
            <div
              class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors relative group"
              [class.justify-center]="collapsed()"
            >
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {{ userInitial() }}
              </div>
              @if (!collapsed()) {
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-gray-900 truncate">{{ userName() }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ userRole() }}</p>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                </svg>
              }

              <!-- Dropdown -->
              <div class="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 hidden group-hover:block z-50">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="font-medium text-sm text-gray-900">{{ userName() }}</p>
                  <p class="text-xs text-gray-500">{{ userEmail() }}</p>
                </div>
                @if (authService.isAdmin()) {
                  <a routerLink="/admin" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Admin Console
                  </a>
                }
                <a routerLink="/settings" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Account Settings
                </a>
                <div class="border-t border-gray-100 my-1"></div>
                <button
                  (click)="signOut()"
                  class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          } @else {
            <a
              routerLink="/login"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </a>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div class="flex items-center gap-4">
            <!-- Breadcrumb or Page Title could go here -->
          </div>

          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search patients, cases..."
                class="w-72 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
              />
              <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>

            <!-- Notifications -->
            <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- Help -->
            <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  collapsed = signal(false);

  navSections = computed((): NavSection[] => {
    const sections: NavSection[] = [
      {
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: '📊' },
        ]
      },
      {
        title: 'Patient Care',
        items: [
          { label: 'Patients', path: '/patients', icon: '👥' },
          { label: 'Cases', path: '/cases', icon: '📁', badge: 3 },
          { label: 'Assessments', path: '/patient-assessment', icon: '📋' },
          { label: 'Care Plans', path: '/care-plans', icon: '💊' },
        ]
      },
      {
        title: 'Clinical',
        items: [
          { label: 'Clinical Trials', path: '/clinical-trials', icon: '🔬' },
          { label: 'Documents', path: '/documents', icon: '📄' },
        ]
      },
      {
        title: 'Legal & Billing',
        items: [
          { label: 'Settlements', path: '/settlement-approval', icon: '⚖️' },
          { label: 'Law Firms', path: '/law-firm-search', icon: '🏛️' },
        ]
      }
    ];

    if (this.authService.isAdmin()) {
      sections.push({
        title: 'Admin',
        items: [
          { label: 'Admin Console', path: '/admin', icon: '⚙️' },
          { label: 'Team', path: '/team', icon: '👤' },
        ]
      });
    }

    return sections;
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

  userEmail = computed(() => {
    return this.authService.profile()?.email || '';
  });

  userRole = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '';
    const role = profile.role;
    const roleLabel = role === 'super_admin' ? 'Super Admin' :
                      role === 'org_admin' ? 'Admin' :
                      role === 'provider' ? 'Provider' :
                      role === 'law_firm' ? 'Law Firm' : 'Staff';
    return roleLabel;
  });

  toggleCollapse() {
    this.collapsed.update(v => !v);
  }

  stepOut() {
    this.authService.stepOut();
  }

  async signOut() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
