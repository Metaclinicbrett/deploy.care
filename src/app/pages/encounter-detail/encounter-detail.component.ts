import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-encounter-detail',
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
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">JS</div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ encounter().patientName }}</h1>
              <p class="text-gray-500">{{ encounter().type }} • {{ encounter().date }}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{{ encounter().status }}</span>
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
              @switch (activeTab()) {
                @case ('Final Report') {
                  <div class="space-y-6">
                    <div>
                      <h3 class="font-semibold text-gray-900 mb-2">Chief Complaint</h3>
                      <p class="text-gray-600 bg-blue-50 p-4 rounded-lg">{{ report().chiefComplaint }}</p>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 mb-2">Assessment</h3>
                      <p class="text-gray-600">{{ report().assessment }}</p>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 mb-2">Plan</h3>
                      <p class="text-gray-600">{{ report().plan }}</p>
                    </div>
                  </div>
                }
                @case ('Notes & Files') {
                  <div class="space-y-4">
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p class="text-gray-500">Drag and drop files here or click to upload</p>
                    </div>
                    <div class="space-y-2">
                      @for (file of files(); track file.name) {
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span class="text-gray-700">{{ file.name }}</span>
                          <span class="text-sm text-gray-500">{{ file.size }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
                @case ('Activity') {
                  <div class="space-y-4">
                    @for (entry of timeline(); track entry.time) {
                      <div class="flex gap-4">
                        <div class="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                        <div>
                          <p class="font-medium text-gray-900">{{ entry.action }}</p>
                          <p class="text-sm text-gray-500">{{ entry.time }} by {{ entry.actor }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Diagnosis Codes</h3>
            <div class="space-y-2">
              @for (code of diagnosisCodes(); track code.code) {
                <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span class="font-mono text-sm text-blue-600">{{ code.code }}</span>
                  <span class="text-sm text-gray-600">{{ code.description }}</span>
                </div>
              }
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Care Team</h3>
            <div class="space-y-3">
              @for (contact of contacts(); track contact.name) {
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ contact.initials }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ contact.name }}</p>
                    <p class="text-sm text-gray-500">{{ contact.role }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class EncounterDetailComponent {
  @Input() id?: string;
  activeTab = signal('Final Report');
  tabs = signal(['Final Report', 'Notes & Files', 'Activity']);
  encounter = signal({ patientName: 'John Smith', type: 'Follow-up Visit', date: '01/28/2025', status: 'Pending Approval' });
  report = signal({
    chiefComplaint: 'Patient reports persistent headaches and difficulty concentrating following motor vehicle accident.',
    assessment: 'Mild traumatic brain injury with post-concussive symptoms. Patient showing gradual improvement.',
    plan: 'Continue current medication regimen. Follow up in 2 weeks. Refer to neuropsychology for cognitive assessment.'
  });
  files = signal([
    { name: 'MRI_Report.pdf', size: '2.4 MB' },
    { name: 'Lab_Results.pdf', size: '156 KB' }
  ]);
  timeline = signal([
    { action: 'Encounter created', time: '10:30 AM', actor: 'Dr. Chen' },
    { action: 'Report submitted', time: '11:45 AM', actor: 'Dr. Chen' },
    { action: 'Pending review', time: '12:00 PM', actor: 'System' }
  ]);
  diagnosisCodes = signal([
    { code: 'S06.0X1A', description: 'Concussion with LOC' },
    { code: 'F07.81', description: 'Postconcussional syndrome' },
    { code: 'R51.9', description: 'Headache, unspecified' }
  ]);
  contacts = signal([
    { name: 'Dr. Sarah Chen', role: 'Neurologist', initials: 'SC' },
    { name: 'Maria Lopez', role: 'Care Coordinator', initials: 'ML' }
  ]);
}
