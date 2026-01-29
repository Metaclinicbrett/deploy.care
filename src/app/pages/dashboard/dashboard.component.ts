import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit: string;
  carePlan: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header with Patient Search -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p class="text-gray-500">Overview of your care plan performance</p>
        </div>
        <div class="flex gap-2">
          <select class="px-4 py-2 border border-gray-200 rounded-lg bg-white">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This Year</option>
          </select>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export</button>
        </div>
      </div>

      <!-- Patient Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="patientSearch"
              (input)="onPatientSearch()"
              placeholder="Search patients by name, DOB, or phone..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            + New Patient
          </button>
        </div>

        <!-- Search Results -->
        @if (showSearchResults() && patientSearch.length >= 2) {
          <div class="mt-4 border-t border-gray-100 pt-4">
            <p class="text-sm text-gray-500 mb-3">
              {{ filteredPatients().length }} patient(s) found
            </p>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              @for (patient of filteredPatients(); track patient.id) {
                <a [routerLink]="['/cases']" [queryParams]="{patient: patient.id}"
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {{ getInitials(patient.name) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ patient.name }}</p>
                      <p class="text-sm text-gray-500">DOB: {{ patient.dob }} • {{ patient.phone }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600">{{ patient.carePlan }}</p>
                    <p class="text-xs text-gray-400">Last: {{ patient.lastVisit }}</p>
                  </div>
                </a>
              } @empty {
                <p class="text-gray-500 text-center py-4">No patients found matching "{{ patientSearch }}"</p>
              }
            </div>
          </div>
        }
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-2">
              <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stat.bgColor">
                <span class="text-lg">{{ stat.icon }}</span>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p [class]="'text-sm mt-1 ' + (stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600')">
              {{ stat.change }} from last month
            </p>
          </div>
        }
      </div>

      <div class="grid grid-cols-3 gap-6 mb-6">
        <div class="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Encounter Trend</h3>
          <div class="h-64 flex items-end gap-2">
            @for (month of chartData(); track month.label) {
              <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full bg-blue-500 rounded-t" [style.height.px]="month.value * 2"></div>
                <span class="text-xs text-gray-500">{{ month.label }}</span>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">By Location</h3>
          <div class="space-y-4">
            @for (loc of locationBreakdown(); track loc.name) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">{{ loc.name }}</span>
                  <span class="font-medium">{{ loc.value }}%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full">
                  <div [class]="'h-full rounded-full ' + loc.color" [style.width.%]="loc.value"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">Performance by Care Plan</h3>
        </div>
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Care Plan</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Encounters</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Completed</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (row of tableData(); track row.name) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">{{ row.name }}</td>
                <td class="px-6 py-4 text-gray-600">{{ row.encounters }}</td>
                <td class="px-6 py-4 text-gray-600">{{ row.completed }}</td>
                <td class="px-6 py-4 text-green-600 font-medium">{{ row.revenue }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </main>
  `
})
export class DashboardComponent {
  patientSearch = '';
  showSearchResults = signal(false);

  patients = signal<Patient[]>([
    { id: '1', name: 'John Smith', dob: '03/15/1975', phone: '(555) 123-4567', lastVisit: '01/28/2025', carePlan: 'TeleNeurology' },
    { id: '2', name: 'Maria Garcia', dob: '07/22/1982', phone: '(555) 234-5678', lastVisit: '01/25/2025', carePlan: 'DaylightRx' },
    { id: '3', name: 'Robert Johnson', dob: '11/08/1968', phone: '(555) 345-6789', lastVisit: '01/27/2025', carePlan: 'VNS Therapy' },
    { id: '4', name: 'Sarah Williams', dob: '05/30/1990', phone: '(555) 456-7890', lastVisit: '01/20/2025', carePlan: 'RPM - mTBI' },
    { id: '5', name: 'Michael Brown', dob: '02/14/1985', phone: '(555) 567-8901', lastVisit: '01/15/2025', carePlan: 'Report Review' },
    { id: '6', name: 'Jennifer Davis', dob: '09/03/1978', phone: '(555) 678-9012', lastVisit: '01/22/2025', carePlan: 'TeleNeurology' },
    { id: '7', name: 'David Martinez', dob: '12/20/1965', phone: '(555) 789-0123', lastVisit: '01/18/2025', carePlan: 'VNS Therapy' },
    { id: '8', name: 'Emily Wilson', dob: '04/11/1995', phone: '(555) 890-1234', lastVisit: '01/26/2025', carePlan: 'DaylightRx' }
  ]);

  filteredPatients = signal<Patient[]>([]);

  stats = signal([
    { label: 'Encounters Opened', value: '156', change: '+12%', icon: '📋', bgColor: 'bg-blue-100' },
    { label: 'Completed', value: '142', change: '+8%', icon: '✓', bgColor: 'bg-green-100' },
    { label: 'Total Billed', value: '$48,250', change: '+15%', icon: '💰', bgColor: 'bg-emerald-100' },
    { label: 'Active Locations', value: '8', change: '+2', icon: '📍', bgColor: 'bg-purple-100' }
  ]);

  chartData = signal([
    { label: 'Jan', value: 45 }, { label: 'Feb', value: 52 }, { label: 'Mar', value: 48 },
    { label: 'Apr', value: 61 }, { label: 'May', value: 55 }, { label: 'Jun', value: 67 },
    { label: 'Jul', value: 72 }, { label: 'Aug', value: 68 }, { label: 'Sep', value: 75 },
    { label: 'Oct', value: 82 }, { label: 'Nov', value: 78 }, { label: 'Dec', value: 85 }
  ]);

  locationBreakdown = signal([
    { name: 'Houston, TX', value: 45, color: 'bg-blue-500' },
    { name: 'Dallas, TX', value: 30, color: 'bg-purple-500' },
    { name: 'Austin, TX', value: 25, color: 'bg-pink-500' }
  ]);

  tableData = signal([
    { name: 'TeleNeurology', encounters: 89, completed: 82, revenue: '$24,500' },
    { name: 'DaylightRx', encounters: 45, completed: 42, revenue: '$8,750' },
    { name: 'VNS Therapy', encounters: 22, completed: 18, revenue: '$15,000' }
  ]);

  onPatientSearch() {
    const search = this.patientSearch.toLowerCase().trim();

    if (search.length < 2) {
      this.showSearchResults.set(false);
      this.filteredPatients.set([]);
      return;
    }

    this.showSearchResults.set(true);
    const filtered = this.patients().filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.dob.includes(search) ||
      p.phone.includes(search)
    );
    this.filteredPatients.set(filtered);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('');
  }
}
