import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Metric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  type: string;
}

interface Activity {
  id: string;
  type: 'case_created' | 'assessment_completed' | 'document_uploaded' | 'settlement_updated' | 'note_added';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  entityId?: string;
}

interface RecentCase {
  id: string;
  patient: string;
  caseNumber: string;
  type: string;
  status: 'active' | 'pending' | 'completed';
  lastUpdate: string;
  assignee: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Good {{ greeting() }}, {{ userName() }}</h1>
        <p class="text-gray-500 mt-1">Here's what's happening with your cases today.</p>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        @for (metric of metrics(); track metric.label) {
          <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-500">{{ metric.label }}</p>
                <p class="text-2xl font-semibold text-gray-900 mt-2">{{ metric.value }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  @if (metric.changeType === 'positive') {
                    <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    <span class="text-sm font-medium text-emerald-600">{{ metric.change }}</span>
                  } @else if (metric.changeType === 'negative') {
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    <span class="text-sm font-medium text-red-600">{{ metric.change }}</span>
                  } @else {
                    <span class="text-sm text-gray-500">{{ metric.change }}</span>
                  }
                  <span class="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center ' + metric.color">
                <span class="text-xl">{{ metric.icon }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tasks -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Your Tasks</h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">{{ pendingTaskCount() }} pending</span>
              <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            @for (task of tasks(); track task.id) {
              <div class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="flex items-start gap-4">
                  <button class="mt-1 w-5 h-5 rounded border-2 border-gray-300 hover:border-indigo-500 transition-colors flex-shrink-0 group-hover:border-indigo-400"></button>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-gray-900 truncate">{{ task.title }}</p>
                      @if (task.priority === 'high') {
                        <span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">High</span>
                      } @else if (task.priority === 'medium') {
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Medium</span>
                      }
                    </div>
                    <p class="text-sm text-gray-500 mt-0.5 truncate">{{ task.description }}</p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {{ task.dueDate }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                        {{ task.type }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="px-6 py-12 text-center">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p class="text-gray-500">All caught up!</p>
              </div>
            }
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            @for (activity of activities(); track activity.id) {
              <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div class="flex gap-3">
                  <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + getActivityColor(activity.type)">
                    <span class="text-sm">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">{{ activity.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ activity.description }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ activity.timestamp }} · {{ activity.user }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Cases Table -->
      <div class="mt-6 bg-white rounded-xl border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Recent Cases</h2>
          <a routerLink="/cases" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All Cases →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 bg-gray-50">Patient</th>
                <th class="px-6 py-3 bg-gray-50">Case #</th>
                <th class="px-6 py-3 bg-gray-50">Type</th>
                <th class="px-6 py-3 bg-gray-50">Status</th>
                <th class="px-6 py-3 bg-gray-50">Assigned To</th>
                <th class="px-6 py-3 bg-gray-50">Last Update</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (caseItem of recentCases(); track caseItem.id) {
                <tr class="hover:bg-gray-50 transition-colors cursor-pointer" [routerLink]="['/cases', caseItem.id]">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-medium">
                        {{ getInitials(caseItem.patient) }}
                      </div>
                      <span class="font-medium text-gray-900">{{ caseItem.patient }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 font-mono text-sm">{{ caseItem.caseNumber }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ caseItem.type }}</td>
                  <td class="px-6 py-4">
                    @switch (caseItem.status) {
                      @case ('active') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Active
                        </span>
                      }
                      @case ('pending') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Pending
                        </span>
                      }
                      @case ('completed') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          Completed
                        </span>
                      }
                    }
                  </td>
                  <td class="px-6 py-4 text-gray-600">{{ caseItem.assignee }}</td>
                  <td class="px-6 py-4 text-gray-500 text-sm">{{ caseItem.lastUpdate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/cases" [queryParams]="{new: true}" class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">New Case</p>
            <p class="text-xs text-gray-500">Create a case</p>
          </div>
        </a>

        <a routerLink="/patient-assessment" class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">Assessment</p>
            <p class="text-xs text-gray-500">PHQ-9, GAD-7</p>
          </div>
        </a>

        <a routerLink="/clinical-trials" class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">Clinical Trials</p>
            <p class="text-xs text-gray-500">Find trials</p>
          </div>
        </a>

        <a routerLink="/settlement-approval" class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">Settlements</p>
            <p class="text-xs text-gray-500">Review & approve</p>
          </div>
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {
  userName = signal('Brett');

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  });

  metrics = signal<Metric[]>([
    { label: 'Active Cases', value: '47', change: '+12%', changeType: 'positive', icon: '📁', color: 'bg-indigo-100' },
    { label: 'Pending Assessments', value: '8', change: '-3', changeType: 'positive', icon: '📋', color: 'bg-purple-100' },
    { label: 'This Month Revenue', value: '$124,500', change: '+18%', changeType: 'positive', icon: '💰', color: 'bg-emerald-100' },
    { label: 'Settlement Rate', value: '94%', change: '+2%', changeType: 'positive', icon: '✅', color: 'bg-amber-100' },
  ]);

  tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Review PHQ-9 assessment for John Smith',
      description: 'Patient completed assessment yesterday, score: 14 (moderate depression)',
      priority: 'high',
      dueDate: 'Today',
      assignee: 'You',
      type: 'Assessment'
    },
    {
      id: '2',
      title: 'Follow up on settlement offer - Martinez case',
      description: 'Insurance counter-offer received, needs review within 48 hours',
      priority: 'high',
      dueDate: 'Tomorrow',
      assignee: 'You',
      type: 'Settlement'
    },
    {
      id: '3',
      title: 'Schedule follow-up appointment - Sarah Johnson',
      description: '30-day post-treatment check-in required per care plan',
      priority: 'medium',
      dueDate: 'Jan 31',
      assignee: 'You',
      type: 'Care Plan'
    },
    {
      id: '4',
      title: 'Upload medical records for Williams case',
      description: 'MRI and neurology report from Dr. Chen',
      priority: 'medium',
      dueDate: 'Feb 2',
      assignee: 'You',
      type: 'Documentation'
    },
  ]);

  pendingTaskCount = computed(() => this.tasks().length);

  activities = signal<Activity[]>([
    {
      id: '1',
      type: 'case_created',
      title: 'New case created',
      description: 'Auto accident case for Emily Brown',
      user: 'Sarah M.',
      timestamp: '10 min ago'
    },
    {
      id: '2',
      type: 'assessment_completed',
      title: 'Assessment completed',
      description: 'GAD-7 score: 12 - Michael Davis',
      user: 'System',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      type: 'settlement_updated',
      title: 'Settlement approved',
      description: '$45,000 - Thompson case',
      user: 'James R.',
      timestamp: '2 hours ago'
    },
    {
      id: '4',
      type: 'document_uploaded',
      title: 'Documents uploaded',
      description: '3 medical records added',
      user: 'Maria L.',
      timestamp: '3 hours ago'
    },
    {
      id: '5',
      type: 'note_added',
      title: 'Case note added',
      description: 'Treatment progress update - Garcia case',
      user: 'Dr. Kim',
      timestamp: '4 hours ago'
    },
  ]);

  recentCases = signal<RecentCase[]>([
    { id: '1', patient: 'John Smith', caseNumber: '2025-00147', type: 'Auto Accident', status: 'active', assignee: 'Sarah M.', lastUpdate: '2 hours ago' },
    { id: '2', patient: 'Maria Garcia', caseNumber: '2025-00146', type: 'Workers Comp', status: 'pending', assignee: 'James R.', lastUpdate: '5 hours ago' },
    { id: '3', patient: 'Robert Johnson', caseNumber: '2025-00145', type: 'Medical Malpractice', status: 'active', assignee: 'You', lastUpdate: '1 day ago' },
    { id: '4', patient: 'Sarah Williams', caseNumber: '2025-00144', type: 'Slip and Fall', status: 'completed', assignee: 'Maria L.', lastUpdate: '2 days ago' },
    { id: '5', patient: 'Michael Brown', caseNumber: '2025-00143', type: 'Auto Accident', status: 'active', assignee: 'Sarah M.', lastUpdate: '3 days ago' },
  ]);

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('');
  }

  getActivityIcon(type: Activity['type']): string {
    const icons: Record<Activity['type'], string> = {
      case_created: '📁',
      assessment_completed: '📋',
      document_uploaded: '📄',
      settlement_updated: '💰',
      note_added: '📝'
    };
    return icons[type];
  }

  getActivityColor(type: Activity['type']): string {
    const colors: Record<Activity['type'], string> = {
      case_created: 'bg-indigo-100',
      assessment_completed: 'bg-purple-100',
      document_uploaded: 'bg-blue-100',
      settlement_updated: 'bg-emerald-100',
      note_added: 'bg-gray-100'
    };
    return colors[type];
  }
}
