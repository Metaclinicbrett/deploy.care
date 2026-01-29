import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseCoordinationService } from '../../services/case-coordination.service';
import { SettlementService } from '../../services/settlement.service';
import {
  LawFirmDashboardStats,
  CareRequest,
  SettlementRequest,
  formatCurrency,
  getSettlementStatusBadge
} from '../../models/care-coordination.model';

@Component({
  selector: 'app-law-firm-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Law Firm Dashboard</h1>
              <p class="text-gray-600 mt-1">{{ orgName() || 'Welcome' }}</p>
            </div>
            <a
              routerLink="/law-firm/search"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>🔍</span>
              Search Care Models
            </a>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          @for (stat of statsCards(); track stat.label) {
            <div class="bg-white rounded-xl shadow-sm p-4 border">
              <div class="flex items-center gap-3">
                <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stat.bgColor">
                  <span class="text-lg">{{ stat.icon }}</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                  <p class="text-xs text-gray-500">{{ stat.label }}</p>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Pending Settlements -->
          <div class="bg-white rounded-xl shadow-sm border">
            <div class="p-4 border-b flex justify-between items-center">
              <h2 class="font-semibold text-gray-900">Pending Settlements</h2>
              <a routerLink="/settlement/approval" class="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </a>
            </div>
            <div class="divide-y">
              @if (pendingSettlements().length === 0) {
                <div class="p-8 text-center text-gray-500">
                  <span class="text-3xl mb-2 block">✓</span>
                  No pending settlements
                </div>
              }
              @for (settlement of pendingSettlements().slice(0, 5); track settlement.id) {
                <div class="p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">
                        Case: {{ settlement.case?.case_number || 'Unknown' }}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                        Original: {{ formatCurrency(settlement.original_amount) }}
                        → Requested: {{ formatCurrency(settlement.original_amount - settlement.requested_reduction) }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ settlement.reduction_percentage | number:'1.0-1' }}% reduction
                      </p>
                    </div>
                    <span [class]="'px-2 py-1 text-xs rounded-full ' + getStatusClass(settlement.status)">
                      {{ settlement.status }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent Care Requests -->
          <div class="bg-white rounded-xl shadow-sm border">
            <div class="p-4 border-b flex justify-between items-center">
              <h2 class="font-semibold text-gray-900">Care Requests</h2>
              <a routerLink="/law-firm/search" class="text-sm text-blue-600 hover:text-blue-800">
                New Request →
              </a>
            </div>
            <div class="divide-y">
              @if (careRequests().length === 0) {
                <div class="p-8 text-center text-gray-500">
                  <span class="text-3xl mb-2 block">📋</span>
                  No care requests yet
                  <br>
                  <a routerLink="/law-firm/search" class="text-blue-600 hover:text-blue-800 text-sm">
                    Search for care models
                  </a>
                </div>
              }
              @for (request of careRequests().slice(0, 5); track request.id) {
                <div class="p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ request.care_plan?.name || 'Care Model' }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ request.care_plan?.provider }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ request.created_at | date:'short' }}
                      </p>
                    </div>
                    <span [class]="'px-2 py-1 text-xs rounded-full ' + getRequestStatusClass(request.status)">
                      {{ request.status }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Contracted Clinics -->
          <div class="bg-white rounded-xl shadow-sm border">
            <div class="p-4 border-b">
              <h2 class="font-semibold text-gray-900">Contracted Clinics</h2>
            </div>
            <div class="divide-y">
              @if (contractedClinics().length === 0) {
                <div class="p-8 text-center text-gray-500">
                  <span class="text-3xl mb-2 block">🏥</span>
                  No contracted clinics yet
                </div>
              }
              @for (clinic of contractedClinics(); track clinic.id) {
                <div class="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {{ clinic.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ clinic.name }}</p>
                      <p class="text-xs text-gray-500">Contract active</p>
                    </div>
                  </div>
                  <span class="text-green-500">✓</span>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border">
            <div class="p-4 border-b">
              <h2 class="font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div class="p-4 grid grid-cols-2 gap-3">
              <a
                routerLink="/law-firm/search"
                class="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <span class="text-2xl mb-2 block">🔍</span>
                <span class="text-sm font-medium text-blue-900">Search Care</span>
              </a>
              <a
                routerLink="/cases"
                class="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <span class="text-2xl mb-2 block">📁</span>
                <span class="text-sm font-medium text-purple-900">View Cases</span>
              </a>
              <a
                routerLink="/settlement/approval"
                class="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center"
              >
                <span class="text-2xl mb-2 block">💰</span>
                <span class="text-sm font-medium text-amber-900">Settlements</span>
              </a>
              <a
                routerLink="/settings"
                class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                <span class="text-2xl mb-2 block">⚙️</span>
                <span class="text-sm font-medium text-gray-900">Settings</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LawFirmDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private coordinationService = inject(CaseCoordinationService);
  private settlementService = inject(SettlementService);

  // State
  private stats = signal<LawFirmDashboardStats>({
    active_cases: 0,
    pending_settlements: 0,
    total_billed: 0,
    total_collected: 0,
    pending_care_requests: 0,
    contracted_clinics: 0
  });

  // Computed
  readonly orgName = computed(() => this.authService.profile()?.organization_name);
  readonly pendingSettlements = computed(() => this.settlementService.pendingSettlements());
  readonly careRequests = computed(() => this.coordinationService.careRequests());
  readonly contractedClinics = computed(() => {
    const partnerships = this.coordinationService.partnerships();
    const orgId = this.authService.profile()?.organization_id;
    return partnerships.map(p => {
      if (p.organization_a_id === orgId) {
        return p.organization_b || { id: p.organization_b_id, name: 'Unknown' };
      }
      return p.organization_a || { id: p.organization_a_id, name: 'Unknown' };
    });
  });

  readonly statsCards = computed(() => {
    const s = this.stats();
    return [
      { icon: '📁', label: 'Active Cases', value: s.active_cases, bgColor: 'bg-blue-100' },
      { icon: '⏳', label: 'Pending Settlements', value: s.pending_settlements, bgColor: 'bg-amber-100' },
      { icon: '💵', label: 'Total Billed', value: this.formatCurrency(s.total_billed), bgColor: 'bg-green-100' },
      { icon: '✓', label: 'Collected', value: this.formatCurrency(s.total_collected), bgColor: 'bg-emerald-100' },
      { icon: '📋', label: 'Care Requests', value: s.pending_care_requests, bgColor: 'bg-purple-100' },
      { icon: '🏥', label: 'Clinics', value: s.contracted_clinics, bgColor: 'bg-indigo-100' }
    ];
  });

  formatCurrency = formatCurrency;

  async ngOnInit() {
    const orgId = this.authService.profile()?.organization_id;
    if (orgId) {
      // Load dashboard data
      const [dashStats] = await Promise.all([
        this.coordinationService.getLawFirmDashboardStats(orgId),
        this.settlementService.loadSettlements({ requested_by_org_id: orgId }),
        this.coordinationService.loadCareRequests(orgId),
        this.coordinationService.loadPartnerships()
      ]);
      this.stats.set(dashStats);
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      disputed: 'bg-red-100 text-red-800',
      escalated: 'bg-purple-100 text-purple-800',
      confirmed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getRequestStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
