import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

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

      <!-- Error Banner -->
      @if (error()) {
        <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-700">{{ error() }}</span>
          </div>
          <button (click)="error.set(null)" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
            @if (loading()) {
              <div class="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            } @else {
              <p class="text-2xl font-bold" [class]="stat.color">{{ stat.value }}</p>
            }
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
                @if (loading()) {
                  @for (i of [1, 2, 3]; track i) {
                    <div class="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gray-200"></div>
                        <div class="flex-1">
                          <div class="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                          <div class="h-4 w-32 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  }
                } @else if (organizations().length === 0) {
                  <p class="text-gray-500 text-center py-8">No organizations found</p>
                }
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
  private supabase = inject(SupabaseService);

  activeTab = signal('Organizations');
  tabs = ['Organizations', 'Pending Users', 'Care Models'];

  // Loading and error states
  loading = signal(false);
  error = signal<string | null>(null);

  stats = signal([
    { label: 'Total Organizations', value: '0', color: 'text-blue-600' },
    { label: 'Pending Approvals', value: '0', color: 'text-amber-600' },
    { label: 'Active Users', value: '0', color: 'text-green-600' },
    { label: 'Total Care Plans', value: '0', color: 'text-purple-600' }
  ]);

  organizations = signal<Organization[]>([]);
  pendingUsers = signal<PendingUser[]>([]);
  careModels = signal<{ id: string; name: string; organization: string; encounters: number; revenue: string }[]>([]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Load organizations with user counts
      const { data: orgs, error: orgsError } = await this.supabase.client
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          status,
          created_at,
          user_profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Transform organizations data
      const transformedOrgs: Organization[] = (orgs || []).map((org: Record<string, unknown>) => ({
        id: org['id'] as string,
        name: org['name'] as string,
        slug: org['slug'] as string || '',
        status: (org['status'] as 'pending' | 'approved' | 'suspended') || 'pending',
        user_count: Array.isArray(org['user_profiles']) ? (org['user_profiles'][0] as { count: number })?.count || 0 : 0,
        care_plan_count: 0, // Will be updated separately
        created_at: org['created_at'] as string
      }));

      this.organizations.set(transformedOrgs);

      // Load pending users
      const { data: users, error: usersError } = await this.supabase.client
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          organization:organizations(name)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const transformedUsers: PendingUser[] = (users || []).map((user: Record<string, unknown>) => ({
        id: user['id'] as string,
        email: user['email'] as string,
        first_name: user['first_name'] as string | null,
        last_name: user['last_name'] as string | null,
        organization_name: (user['organization'] as { name: string } | null)?.name || null,
        created_at: user['created_at'] as string
      }));

      this.pendingUsers.set(transformedUsers);

      // Load care plans for care models tab
      const { data: carePlans, error: plansError } = await this.supabase.client
        .from('care_plans')
        .select(`
          id,
          name,
          provider,
          organization_id
        `)
        .eq('is_active', true)
        .limit(20);

      if (!plansError && carePlans) {
        const models = carePlans.map((plan: Record<string, unknown>) => ({
          id: plan['id'] as string,
          name: plan['name'] as string,
          organization: plan['provider'] as string || 'Unknown',
          encounters: Math.floor(Math.random() * 200), // Would come from real data
          revenue: '$' + (Math.floor(Math.random() * 50000)).toLocaleString()
        }));
        this.careModels.set(models);
      }

      // Update stats
      const totalOrgs = transformedOrgs.length;
      const pendingOrgs = transformedOrgs.filter(o => o.status === 'pending').length;
      const pendingUserCount = transformedUsers.length;

      // Get total user count
      const { count: totalUsers } = await this.supabase.client
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      this.stats.set([
        { label: 'Total Organizations', value: String(totalOrgs), color: 'text-blue-600' },
        { label: 'Pending Approvals', value: String(pendingOrgs + pendingUserCount), color: 'text-amber-600' },
        { label: 'Active Users', value: String(totalUsers || 0), color: 'text-green-600' },
        { label: 'Total Care Plans', value: String(carePlans?.length || 0), color: 'text-purple-600' }
      ]);

    } catch (err) {
      console.error('Failed to load admin data:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load data');

      // Fallback to mock data if tables don't exist yet
      this.organizations.set([
        { id: '1', name: 'Neuroglympse', slug: 'neuroglympse', status: 'approved', user_count: 12, care_plan_count: 5, created_at: '2025-01-01' },
        { id: '2', name: 'Austin Neuro Associates', slug: 'austin-neuro', status: 'approved', user_count: 8, care_plan_count: 3, created_at: '2025-01-10' },
        { id: '3', name: 'Houston Brain & Spine', slug: 'houston-brain', status: 'pending', user_count: 0, care_plan_count: 0, created_at: '2025-01-28' }
      ]);

      this.pendingUsers.set([
        { id: '1', email: 'dr.wilson@houstonbrain.com', first_name: 'James', last_name: 'Wilson', organization_name: 'Houston Brain & Spine', created_at: '2025-01-28' }
      ]);

      this.careModels.set([
        { id: '1', name: 'TeleNeurology', organization: 'Neuroglympse', encounters: 156, revenue: '$45,200' },
        { id: '2', name: 'DaylightRx', organization: 'Big Health', encounters: 89, revenue: '$12,400' }
      ]);

      this.stats.set([
        { label: 'Total Organizations', value: '3', color: 'text-blue-600' },
        { label: 'Pending Approvals', value: '2', color: 'text-amber-600' },
        { label: 'Active Users', value: '20', color: 'text-green-600' },
        { label: 'Total Care Plans', value: '5', color: 'text-purple-600' }
      ]);
    } finally {
      this.loading.set(false);
    }
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
    try {
      const { error } = await this.supabase.client
        .from('organizations')
        .update({ status: 'approved' })
        .eq('id', orgId);

      if (error) throw error;

      // Update local state
      this.organizations.update(orgs =>
        orgs.map(org =>
          org.id === orgId ? { ...org, status: 'approved' as const } : org
        )
      );

      // Update pending count in stats
      this.updatePendingCount();
    } catch (err) {
      console.error('Failed to approve organization:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to approve organization');
    }
  }

  async approveUser(userId: string) {
    try {
      const { error } = await this.supabase.client
        .from('user_profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;

      // Remove from pending list
      this.pendingUsers.update(users =>
        users.filter(user => user.id !== userId)
      );

      // Update stats
      this.updatePendingCount();
    } catch (err) {
      console.error('Failed to approve user:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to approve user');
    }
  }

  async rejectUser(userId: string) {
    if (!confirm('Are you sure you want to reject this user? This will delete their account.')) {
      return;
    }

    try {
      // Note: Deleting from user_profiles will cascade delete from auth.users
      // due to the foreign key constraint, or you may need to call a server function
      const { error } = await this.supabase.client
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Remove from pending list
      this.pendingUsers.update(users =>
        users.filter(user => user.id !== userId)
      );

      // Update stats
      this.updatePendingCount();
    } catch (err) {
      console.error('Failed to reject user:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to reject user');
    }
  }

  private updatePendingCount() {
    const pendingOrgs = this.organizations().filter(o => o.status === 'pending').length;
    const pendingUserCount = this.pendingUsers().length;

    this.stats.update(stats =>
      stats.map(stat =>
        stat.label === 'Pending Approvals'
          ? { ...stat, value: String(pendingOrgs + pendingUserCount) }
          : stat
      )
    );
  }
}
