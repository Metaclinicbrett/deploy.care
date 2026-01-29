import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CarePlanSummary {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'draft' | 'archived';
  encounters: number;
  partners: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p class="text-gray-500">Manage your care plans and organization settings</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Care Plan
        </button>
      </div>

      <!-- Care Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (plan of carePlans(); track plan.id) {
          <a [routerLink]="['/settings', plan.id]"
             class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {{ plan.name.charAt(0) }}
              </div>
              <span [class]="getStatusClass(plan.status)">
                {{ plan.status | titlecase }}
              </span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{{ plan.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ plan.type }}</p>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1 text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ plan.encounters }} encounters
              </div>
              <div class="flex items-center gap-1 text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {{ plan.partners }} partners
              </div>
            </div>
          </a>
        }
      </div>
    </main>
  `
})
export class SettingsComponent {
  carePlans = signal<CarePlanSummary[]>([
    { id: '1', name: 'TeleNeurology', type: 'DX/TX', status: 'active', encounters: 156, partners: 8 },
    { id: '2', name: 'DaylightRx', type: 'TX', status: 'active', encounters: 89, partners: 3 },
    { id: '3', name: 'Report Review', type: 'DX', status: 'active', encounters: 234, partners: 12 },
    { id: '4', name: 'VNS Therapy', type: 'TX', status: 'active', encounters: 45, partners: 2 },
    { id: '5', name: 'RPM - mTBI', type: 'TX', status: 'draft', encounters: 0, partners: 0 },
  ]);

  getStatusClass(status: string): string {
    const base = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'active': return `${base} bg-green-100 text-green-700`;
      case 'draft': return `${base} bg-amber-100 text-amber-700`;
      case 'archived': return `${base} bg-gray-100 text-gray-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  }
}
