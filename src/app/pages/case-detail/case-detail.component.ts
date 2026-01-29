import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <a routerLink="/cases" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Cases
      </a>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-bold text-gray-900">{{ caseData().caseNumber }}</h1>
              <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
            <p class="text-gray-600">{{ caseData().patientName }} • DOI: {{ caseData().doi }}</p>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Export</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Encounter</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="border-b border-gray-200">
              <nav class="flex gap-6 px-6">
                @for (tab of tabs(); track tab) {
                  <button (click)="activeTab.set(tab)"
                    [class]="activeTab() === tab ? 'border-b-2 border-blue-600 text-blue-600 py-4 font-medium' : 'py-4 text-gray-500 hover:text-gray-700'">
                    {{ tab }}
                  </button>
                }
              </nav>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <h3 class="font-semibold text-gray-900">Provider Recommendations</h3>
                @for (provider of providers(); track provider.name) {
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-gray-900">{{ provider.name }}</p>
                        <p class="text-sm text-gray-500">{{ provider.specialty }}</p>
                      </div>
                      <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{{ provider.status }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">GatherMed RPM Data</h3>
              <span class="flex items-center gap-2 text-green-600 text-sm">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
            <div class="grid grid-cols-4 gap-4">
              @for (metric of metrics(); track metric.label) {
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold" [class]="metric.color">{{ metric.value }}</p>
                  <p class="text-sm text-gray-500">{{ metric.label }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-2">
              <button class="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">Generate LMN</button>
              <button class="p-3 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100">New Encounter</button>
              <button class="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100">Schedule</button>
              <button class="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm hover:bg-amber-100">Export</button>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Encounters</h3>
            <div class="space-y-3">
              @for (encounter of encounters(); track encounter.id) {
                <a [routerLink]="['/encounters', encounter.id]"
                   class="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900">{{ encounter.type }}</span>
                    <span class="text-sm text-gray-500">{{ encounter.date }}</span>
                  </div>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class CaseDetailComponent {
  @Input() id?: string;
  activeTab = signal('Cure View');
  tabs = signal(['Cure View', 'LOP', 'Patient Details']);
  caseData = signal({ caseNumber: 'CASE-20250128-0001', patientName: 'John Smith', doi: '01/15/2025', carePlan: 'TeleNeurology' });
  providers = signal([
    { name: 'Dr. Sarah Chen', specialty: 'Neurology', status: 'Recommended' },
    { name: 'Dr. Michael Ross', specialty: 'Pain Management', status: 'Pending' }
  ]);
  metrics = signal([
    { label: 'Stress Score', value: '42', color: 'text-amber-600' },
    { label: 'RPQ-13', value: '28', color: 'text-blue-600' },
    { label: 'Depression', value: '12', color: 'text-green-600' },
    { label: 'Anxiety', value: '18', color: 'text-purple-600' }
  ]);
  encounters = signal([
    { id: '1', type: 'Initial Consult', date: '01/28/2025' },
    { id: '2', type: 'Follow-up', date: '01/20/2025' },
    { id: '3', type: 'Telehealth', date: '01/15/2025' }
  ]);
}
