import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

interface Case {
  id: string;
  case_number: string;
  patient_id: string;
  status: string;
  priority: string;
  incident_date: string;
  case_type: string;
  created_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

interface NewCase {
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  patient_dob: string;
  case_type: string;
  incident_date: string;
  priority: string;
  description: string;
}

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- Simple Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Cases</h1>
        <button
          (click)="showNewForm.set(true)"
          class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">
          + New Case
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <span class="ml-3 text-gray-500">Loading cases...</span>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
          {{ error() }}
          <button (click)="loadCases()" class="ml-2 underline">Retry</button>
        </div>
      }

      <!-- New Case Form (Notion-style inline) -->
      @if (showNewForm()) {
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-medium text-gray-900">New Case</h2>
            <button (click)="showNewForm.set(false)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Patient Info -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
              <input
                type="text"
                [(ngModel)]="newCase.patient_first_name"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
              <input
                type="text"
                [(ngModel)]="newCase.patient_last_name"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Smith"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="newCase.patient_email"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                [(ngModel)]="newCase.patient_phone"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Date of Birth *</label>
              <input
                type="date"
                [(ngModel)]="newCase.patient_dob"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Case Type *</label>
              <select
                [(ngModel)]="newCase.case_type"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="personal_injury">Personal Injury</option>
                <option value="auto_accident">Auto Accident</option>
                <option value="workers_comp">Workers Comp</option>
                <option value="medical_malpractice">Medical Malpractice</option>
                <option value="slip_and_fall">Slip and Fall</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Incident Date</label>
              <input
                type="date"
                [(ngModel)]="newCase.incident_date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                [(ngModel)]="newCase.priority"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="routine">Routine</option>
                <option value="asap">ASAP</option>
                <option value="urgent">Urgent</option>
                <option value="stat">Stat</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                [(ngModel)]="newCase.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the case..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              (click)="showNewForm.set(false)"
              class="px-4 py-2 text-gray-600 text-sm hover:text-gray-900">
              Cancel
            </button>
            <button
              (click)="createCase()"
              [disabled]="saving()"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ saving() ? 'Creating...' : 'Create Case' }}
            </button>
          </div>
        </div>
      }

      <!-- Cases Table (Notion-style) -->
      @if (!loading() && cases().length > 0) {
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (case_ of cases(); track case_.id) {
                <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/cases', case_.id]">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {{ getInitials(case_.patient) }}
                      </div>
                      <span class="font-medium text-gray-900">{{ getPatientName(case_.patient) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ case_.case_number }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatCaseType(case_.case_type) }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(case_.status)">{{ case_.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="getPriorityClass(case_.priority)">{{ case_.priority }}</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(case_.incident_date) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(case_.created_at) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && cases().length === 0 && !error()) {
        <div class="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-500 mb-4">No cases yet</p>
          <button
            (click)="showNewForm.set(true)"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Create your first case
          </button>
        </div>
      }
    </main>
  `
})
export class CasesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  cases = signal<Case[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  showNewForm = signal(false);

  newCase: NewCase = {
    patient_first_name: '',
    patient_last_name: '',
    patient_email: '',
    patient_phone: '',
    patient_dob: '',
    case_type: 'personal_injury',
    incident_date: '',
    priority: 'routine',
    description: ''
  };

  ngOnInit() {
    this.loadCases();
  }

  async loadCases() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase.client
        .from('cases')
        .select(`
          id,
          case_number,
          patient_id,
          status,
          priority,
          incident_date,
          case_type,
          created_at,
          patient:patients(id, first_name, last_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.cases.set(data || []);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load cases');
      console.error('Error loading cases:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async createCase() {
    if (!this.newCase.patient_first_name || !this.newCase.patient_last_name || !this.newCase.patient_dob) {
      this.error.set('Please fill in required fields (First Name, Last Name, DOB)');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const profile = this.auth.profile();
      if (!profile?.organization_id) {
        throw new Error('You must belong to an organization to create cases');
      }

      // First create the patient
      const { data: patient, error: patientError } = await this.supabase.client
        .from('patients')
        .insert({
          organization_id: profile.organization_id,
          first_name: this.newCase.patient_first_name,
          last_name: this.newCase.patient_last_name,
          email: this.newCase.patient_email || null,
          phone: this.newCase.patient_phone || null,
          date_of_birth: this.newCase.patient_dob,
          created_by: profile.id
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Then create the case
      const { data: newCase, error: caseError } = await this.supabase.client
        .from('cases')
        .insert({
          organization_id: profile.organization_id,
          patient_id: patient.id,
          case_type: this.newCase.case_type,
          incident_date: this.newCase.incident_date || null,
          priority: this.newCase.priority,
          description: this.newCase.description || null,
          status: 'in-progress',
          created_by: profile.id
        })
        .select(`
          id,
          case_number,
          patient_id,
          status,
          priority,
          incident_date,
          case_type,
          created_at,
          patient:patients(id, first_name, last_name, email, phone)
        `)
        .single();

      if (caseError) throw caseError;

      // Add to list and reset form
      this.cases.update(cases => [newCase, ...cases]);
      this.resetNewCase();
      this.showNewForm.set(false);

    } catch (err: any) {
      this.error.set(err.message || 'Failed to create case');
      console.error('Error creating case:', err);
    } finally {
      this.saving.set(false);
    }
  }

  resetNewCase() {
    this.newCase = {
      patient_first_name: '',
      patient_last_name: '',
      patient_email: '',
      patient_phone: '',
      patient_dob: '',
      case_type: 'personal_injury',
      incident_date: '',
      priority: 'routine',
      description: ''
    };
  }

  getPatientName(patient: Case['patient']): string {
    if (!patient) return 'Unknown';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown';
  }

  getInitials(patient: Case['patient']): string {
    if (!patient) return '?';
    const first = patient.first_name?.charAt(0) || '';
    const last = patient.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  formatCaseType(type: string): string {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    const base = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'in-progress': return `${base} bg-blue-100 text-blue-700`;
      case 'completed': return `${base} bg-green-100 text-green-700`;
      case 'on-hold': return `${base} bg-amber-100 text-amber-700`;
      case 'cancelled': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  }

  getPriorityClass(priority: string): string {
    const base = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (priority) {
      case 'stat': return `${base} bg-red-100 text-red-700`;
      case 'urgent': return `${base} bg-orange-100 text-orange-700`;
      case 'asap': return `${base} bg-amber-100 text-amber-700`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  }
}
