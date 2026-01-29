import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type CaseStatus = 'treating' | 'not_treating' | 'released' | 'pending_settlement' | 'complete' | 'dropped';
type CaseTab = 'active' | 'completed' | 'dropped';

interface Case {
  id: string;
  caseNumber: string;
  patientName: string;
  carePlan: string;
  status: CaseStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  doi: string;
  createdAt: string;
  encounterCount: number;
  lastActivity: string;
}

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Cases</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage patient cases and track progress</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Case
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex -mb-px">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                [class]="getTabClass(tab.id)"
              >
                <span [class]="getTabIconClass(tab.id)">{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
                <span [class]="getTabCountClass(tab.id)">{{ getTabCount(tab.id) }}</span>
              </button>
            }
          </nav>
        </div>

        <!-- Search within tab -->
        <div class="p-4">
          <div class="flex items-center gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Search by patient name, case number, or care plan..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            @if (activeTab() === 'active') {
              <select [(ngModel)]="statusFilter" class="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">All Active</option>
                <option value="treating">Treating</option>
                <option value="not_treating">Not Treating</option>
                <option value="pending_settlement">Pending Settlement</option>
              </select>
            }
            <select [(ngModel)]="priorityFilter" class="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Active Cases View -->
      @if (activeTab() === 'active') {
        <div class="space-y-4">
          @for (case_ of filteredCases(); track case_.id) {
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden">
              <div class="flex items-stretch">
                <!-- Status accent -->
                <div [class]="getStatusAccent(case_.status)"></div>

                <div class="flex-1 p-4">
                  <div class="flex items-start justify-between">
                    <!-- Left: Case Info -->
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <a [routerLink]="['/cases', case_.id]" class="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-lg">
                          {{ case_.patientName }}
                        </a>
                        <span [class]="getStatusBadge(case_.status)">
                          {{ getStatusLabel(case_.status) }}
                        </span>
                        <span [class]="getPriorityBadge(case_.priority)">
                          {{ case_.priority | titlecase }}
                        </span>
                      </div>

                      <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span class="font-mono">{{ case_.caseNumber }}</span>
                        <span>•</span>
                        <span>{{ case_.carePlan }}</span>
                        <span>•</span>
                        <span>DOI: {{ case_.doi }}</span>
                      </div>

                      <!-- Encounters summary -->
                      <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-300">{{ case_.encounterCount }} encounters</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-300">Last activity: {{ case_.lastActivity }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Right: Actions -->
                    <div class="flex items-center gap-2">
                      <a [routerLink]="['/cases', case_.id]" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        View Case
                      </a>
                      <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">No active cases found</p>
            </div>
          }
        </div>
      }

      <!-- Completed Cases View -->
      @if (activeTab() === 'completed') {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Case #</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Patient</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Care Plan</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">DOI</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Completed</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Encounters</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (case_ of filteredCases(); track case_.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3">
                    <a [routerLink]="['/cases', case_.id]" class="font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700">
                      {{ case_.caseNumber }}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ case_.patientName }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ case_.carePlan }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ case_.doi }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ case_.lastActivity }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {{ case_.encounterCount }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <a [routerLink]="['/cases', case_.id]" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium">
                      View
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    No completed cases found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Dropped Cases View -->
      @if (activeTab() === 'dropped') {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Case #</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Patient</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Care Plan</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">DOI</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Dropped Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (case_ of filteredCases(); track case_.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-75">
                  <td class="px-4 py-3">
                    <a [routerLink]="['/cases', case_.id]" class="font-mono text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      {{ case_.caseNumber }}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ case_.patientName }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ case_.carePlan }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ case_.doi }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ case_.lastActivity }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                      Patient Request
                    </span>
                  </td>
                  <td class="px-4 py-3 space-x-2">
                    <a [routerLink]="['/cases', case_.id]" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 text-sm font-medium">
                      View
                    </a>
                    <button class="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium">
                      Reactivate
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    No dropped cases found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `
})
export class CasesComponent {
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  activeTab = signal<CaseTab>('active');

  tabs = [
    { id: 'active' as CaseTab, label: 'Active', icon: '🔄' },
    { id: 'completed' as CaseTab, label: 'Completed', icon: '✅' },
    { id: 'dropped' as CaseTab, label: 'Dropped', icon: '🗑️' }
  ];

  cases = signal<Case[]>([
    { id: '1', caseNumber: 'CASE-20250128-0001', patientName: 'John Smith', carePlan: 'TeleNeurology', status: 'treating', priority: 'high', doi: '01/15/2025', createdAt: '2025-01-28', encounterCount: 4, lastActivity: '2 hours ago' },
    { id: '2', caseNumber: 'CASE-20250128-0002', patientName: 'Maria Garcia', carePlan: 'DaylightRx', status: 'not_treating', priority: 'normal', doi: '01/20/2025', createdAt: '2025-01-28', encounterCount: 2, lastActivity: '1 day ago' },
    { id: '3', caseNumber: 'CASE-20250127-0003', patientName: 'Robert Johnson', carePlan: 'VNS Therapy', status: 'treating', priority: 'urgent', doi: '12/10/2024', createdAt: '2025-01-27', encounterCount: 8, lastActivity: '30 min ago' },
    { id: '4', caseNumber: 'CASE-20250126-0004', patientName: 'Sarah Williams', carePlan: 'RPM - mTBI', status: 'complete', priority: 'normal', doi: '11/05/2024', createdAt: '2025-01-26', encounterCount: 12, lastActivity: 'Jan 20, 2025' },
    { id: '5', caseNumber: 'CASE-20250125-0005', patientName: 'Michael Brown', carePlan: 'Report Review', status: 'dropped', priority: 'low', doi: '01/02/2025', createdAt: '2025-01-25', encounterCount: 1, lastActivity: 'Jan 18, 2025' },
    { id: '6', caseNumber: 'CASE-20250124-0006', patientName: 'Jennifer Davis', carePlan: 'TeleNeurology', status: 'pending_settlement', priority: 'normal', doi: '01/10/2025', createdAt: '2025-01-24', encounterCount: 6, lastActivity: '3 hours ago' },
    { id: '7', caseNumber: 'CASE-20250123-0007', patientName: 'David Martinez', carePlan: 'VNS Therapy', status: 'treating', priority: 'high', doi: '12/28/2024', createdAt: '2025-01-23', encounterCount: 5, lastActivity: '1 day ago' },
    { id: '8', caseNumber: 'CASE-20250122-0008', patientName: 'Emily Wilson', carePlan: 'DaylightRx', status: 'complete', priority: 'normal', doi: '01/05/2025', createdAt: '2025-01-22', encounterCount: 10, lastActivity: 'Jan 15, 2025' },
    { id: '9', caseNumber: 'CASE-20250121-0009', patientName: 'Chris Anderson', carePlan: 'RPM - mTBI', status: 'dropped', priority: 'low', doi: '12/15/2024', createdAt: '2025-01-21', encounterCount: 3, lastActivity: 'Jan 10, 2025' },
    { id: '10', caseNumber: 'CASE-20250120-0010', patientName: 'Lisa Thompson', carePlan: 'TeleNeurology', status: 'released', priority: 'normal', doi: '11/20/2024', createdAt: '2025-01-20', encounterCount: 7, lastActivity: '5 hours ago' }
  ]);

  filteredCases = computed(() => {
    let result = this.cases();
    const search = this.searchTerm.toLowerCase().trim();
    const tab = this.activeTab();

    // Filter by tab
    if (tab === 'active') {
      result = result.filter(c => ['treating', 'not_treating', 'released', 'pending_settlement'].includes(c.status));
    } else if (tab === 'completed') {
      result = result.filter(c => c.status === 'complete');
    } else if (tab === 'dropped') {
      result = result.filter(c => c.status === 'dropped');
    }

    // Filter by search
    if (search) {
      result = result.filter(c =>
        c.patientName.toLowerCase().includes(search) ||
        c.caseNumber.toLowerCase().includes(search) ||
        c.carePlan.toLowerCase().includes(search)
      );
    }

    // Filter by status (only for active tab)
    if (this.statusFilter && tab === 'active') {
      result = result.filter(c => c.status === this.statusFilter);
    }

    // Filter by priority
    if (this.priorityFilter) {
      result = result.filter(c => c.priority === this.priorityFilter);
    }

    return result;
  });

  getTabCount(tabId: CaseTab): number {
    const cases = this.cases();
    if (tabId === 'active') {
      return cases.filter(c => ['treating', 'not_treating', 'released', 'pending_settlement'].includes(c.status)).length;
    } else if (tabId === 'completed') {
      return cases.filter(c => c.status === 'complete').length;
    } else {
      return cases.filter(c => c.status === 'dropped').length;
    }
  }

  getTabClass(tabId: CaseTab): string {
    const base = 'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors';
    if (this.activeTab() === tabId) {
      return `${base} border-blue-600 text-blue-600 dark:text-blue-400`;
    }
    return `${base} border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300`;
  }

  getTabIconClass(tabId: CaseTab): string {
    return 'text-lg';
  }

  getTabCountClass(tabId: CaseTab): string {
    const base = 'px-2 py-0.5 text-xs font-semibold rounded-full';
    if (this.activeTab() === tabId) {
      return `${base} bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300`;
    }
    return `${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
  }

  getStatusAccent(status: CaseStatus): string {
    const base = 'w-1.5';
    switch (status) {
      case 'treating': return `${base} bg-gradient-to-b from-green-400 to-green-600`;
      case 'not_treating': return `${base} bg-gradient-to-b from-amber-400 to-amber-600`;
      case 'released': return `${base} bg-gradient-to-b from-blue-400 to-blue-600`;
      case 'pending_settlement': return `${base} bg-gradient-to-b from-purple-400 to-purple-600`;
      case 'complete': return `${base} bg-gradient-to-b from-teal-400 to-teal-600`;
      case 'dropped': return `${base} bg-gradient-to-b from-red-400 to-red-600`;
      default: return `${base} bg-gradient-to-b from-gray-400 to-gray-600`;
    }
  }

  getStatusBadge(status: CaseStatus): string {
    const base = 'px-2.5 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'treating': return `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`;
      case 'not_treating': return `${base} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300`;
      case 'released': return `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`;
      case 'pending_settlement': return `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`;
      case 'complete': return `${base} bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300`;
      case 'dropped': return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`;
      default: return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
    }
  }

  getStatusLabel(status: CaseStatus): string {
    const labels: Record<CaseStatus, string> = {
      treating: 'Treating',
      not_treating: 'Not Treating',
      released: 'Released',
      pending_settlement: 'Pending Settlement',
      complete: 'Complete',
      dropped: 'Dropped'
    };
    return labels[status] || status;
  }

  getPriorityBadge(priority: string): string {
    const base = 'px-2.5 py-1 text-xs font-medium rounded-full';
    switch (priority) {
      case 'urgent': return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`;
      case 'high': return `${base} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300`;
      case 'normal': return `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`;
      case 'low': return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
      default: return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
    }
  }
}
