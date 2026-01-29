import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'suspended';
  user_count: number;
  care_plan_count: number;
  created_at: string;
}

interface PendingUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  created_at: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Admin Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">Admin Console</h1>
          <p class="text-gray-500">Manage organizations, users, and platform settings</p>
        </div>
        @if (authService.impersonation().isImpersonating) {
          <div class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <span class="text-amber-700">
              Viewing as: <strong>{{ authService.impersonation().impersonatingOrgName }}</strong>
            </span>
            <button
              (click)="stepOut()"
              class="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Step Out
            </button>
          </div>
        }
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
            <p class="text-2xl font-bold" [class]="stat.color">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex gap-6 px-6">
            @for (tab of tabs; track tab) {
              <button
                (click)="activeTab.set(tab)"
                [class]="activeTab() === tab ? 'border-b-2 border-blue-600 text-blue-600 py-4 font-medium' : 'py-4 text-gray-500 hover:text-gray-700'"
              >
                {{ tab }}
              </button>
            }
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('Organizations') {
              <div class="space-y-4">
                @for (org of organizations(); track org.id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {{ org.name.charAt(0) }}
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-900">{{ org.name }}</h3>
                          <p class="text-sm text-gray-500">{{ org.user_count }} users • {{ org.care_plan_count }} care plans</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span [class]="getStatusClass(org.status)">
                          {{ org.status | titlecase }}
                        </span>
                        @if (org.status === 'pending') {
                          <button
                            (click)="approveOrg(org.id)"
                            class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                        }
                        @if (org.status === 'approved') {
                          <button
                            (click)="stepInto(org)"
                            class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Step In
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @case ('Pending Users') {
              <div class="space-y-4">
                @if (pendingUsers().length === 0) {
                  <p class="text-gray-500 text-center py-8">No pending users</p>
                } @else {
                  @for (user of pendingUsers(); track user.id) {
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {{ (user.first_name?.charAt(0) || user.email.charAt(0)) | uppercase }}
                          </div>
                          <div>
                            <h3 class="font-medium text-gray-900">
                              {{ user.first_name || '' }} {{ user.last_name || '' }}
                              @if (!user.first_name && !user.last_name) {
                                <span class="text-gray-500">{{ user.email }}</span>
                              }
                            </h3>
                            <p class="text-sm text-gray-500">{{ user.email }}</p>
                            @if (user.organization_name) {
                              <p class="text-xs text-blue-600">{{ user.organization_name }}</p>
                            }
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button
                            (click)="approveUser(user.id)"
                            class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            (click)="rejectUser(user.id)"
                            class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            }

            @case ('Care Models') {
              <div class="grid grid-cols-3 gap-4">
                @for (model of careModels(); track model.id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                    <div class="flex items-start justify-between mb-3">
                      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {{ model.name.charAt(0) }}
                      </div>
                      <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-1">{{ model.name }}</h3>
                    <p class="text-sm text-gray-500 mb-2">{{ model.organization }}</p>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span>{{ model.encounters }} encounters</span>
                      <span>{{ model.revenue }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </main>
  `
})
export class AdminComponent implements OnInit {
  authService = inject(AuthService);

  activeTab = signal('Organizations');
  tabs = ['Organizations', 'Pending Users', 'Care Models'];

  stats = signal([
    { label: 'Total Organizations', value: '12', color: 'text-blue-600' },
    { label: 'Pending Approvals', value: '3', color: 'text-amber-600' },
    { label: 'Active Users', value: '89', color: 'text-green-600' },
    { label: 'Total Care Plans', value: '45', color: 'text-purple-600' }
  ]);

  organizations = signal<Organization[]>([
    { id: '1', name: 'Neuroglympse', slug: 'neuroglympse', status: 'approved', user_count: 12, care_plan_count: 5, created_at: '2025-01-01' },
    { id: '2', name: 'Austin Neuro Associates', slug: 'austin-neuro', status: 'approved', user_count: 8, care_plan_count: 3, created_at: '2025-01-10' },
    { id: '3', name: 'Houston Brain & Spine', slug: 'houston-brain', status: 'pending', user_count: 0, care_plan_count: 0, created_at: '2025-01-28' },
    { id: '4', name: 'Dallas Medical Center', slug: 'dallas-medical', status: 'approved', user_count: 15, care_plan_count: 7, created_at: '2025-01-05' }
  ]);

  pendingUsers = signal<PendingUser[]>([
    { id: '1', email: 'dr.wilson@houstonbrain.com', first_name: 'James', last_name: 'Wilson', organization_name: 'Houston Brain & Spine', created_at: '2025-01-28' },
    { id: '2', email: 'sarah@newclinic.com', first_name: 'Sarah', last_name: null, organization_name: null, created_at: '2025-01-27' }
  ]);

  careModels = signal([
    { id: '1', name: 'TeleNeurology', organization: 'Neuroglympse', encounters: 156, revenue: '$45,200' },
    { id: '2', name: 'DaylightRx', organization: 'Big Health', encounters: 89, revenue: '$12,400' },
    { id: '3', name: 'VNS Therapy', organization: 'Neuroglympse', encounters: 45, revenue: '$28,900' },
    { id: '4', name: 'Concussion Protocol', organization: 'Austin Neuro', encounters: 67, revenue: '$19,500' },
    { id: '5', name: 'Sleep Disorders', organization: 'Dallas Medical', encounters: 112, revenue: '$33,600' },
    { id: '6', name: 'RPM - mTBI', organization: 'Neuroglympse', encounters: 34, revenue: '$8,900' }
  ]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    // TODO: Load real data from Supabase
  }

  getStatusClass(status: string): string {
    const base = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'approved': return `${base} bg-green-100 text-green-700`;
      case 'pending': return `${base} bg-amber-100 text-amber-700`;
      case 'suspended': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  }

  async stepInto(org: Organization) {
    await this.authService.stepIntoOrg(org.id, org.name);
  }

  stepOut() {
    this.authService.stepOut();
  }

  async approveOrg(orgId: string) {
    // TODO: Implement with Supabase
    console.log('Approving org:', orgId);
  }

  async approveUser(userId: string) {
    // TODO: Implement with Supabase
    console.log('Approving user:', userId);
  }

  async rejectUser(userId: string) {
    // TODO: Implement with Supabase
    console.log('Rejecting user:', userId);
  }
}
