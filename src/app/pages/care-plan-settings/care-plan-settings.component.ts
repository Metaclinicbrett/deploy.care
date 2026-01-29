import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-care-plan-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <a routerLink="/settings" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Settings
      </a>

      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ carePlan().name }}</h1>
            <p class="text-blue-100">{{ carePlan().type }} Care Plan</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
            <span class="px-3 py-1 bg-white/20 rounded-full text-sm">Listed on Marketplace</span>
          </div>
        </div>
        <div class="grid grid-cols-5 gap-4 mt-6">
          @for (stat of heroStats(); track stat.label) {
            <div class="text-center">
              <p class="text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-sm text-blue-100">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>

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
            @case ('Overview') {
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <h3 class="font-semibold text-gray-900 mb-4">Care Plan Details</h3>
                  <div class="space-y-3">
                    <div class="flex justify-between py-2 border-b border-gray-100">
                      <span class="text-gray-500">Name</span>
                      <span class="font-medium">{{ carePlan().name }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                      <span class="text-gray-500">Type</span>
                      <span class="font-medium">{{ carePlan().type }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                      <span class="text-gray-500">Price</span>
                      <span class="font-medium">{{ carePlan().price }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-4">Description</h3>
                  <p class="text-gray-600">{{ carePlan().description }}</p>
                </div>
              </div>
            }
            @case ('Licensing') {
              <div class="grid grid-cols-3 gap-6">
                <div class="col-span-2 space-y-6">
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-4">Pending Requests ({{ pendingRequests().length }})</h3>
                    @for (request of pendingRequests(); track request.name) {
                      <div class="border border-gray-200 rounded-lg p-4 mb-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {{ request.initials }}
                            </div>
                            <div>
                              <p class="font-medium text-gray-900">{{ request.name }}</p>
                              <p class="text-sm text-gray-500">{{ request.practice }}</p>
                            </div>
                          </div>
                          <div class="flex gap-2">
                            <button class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>
                            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Decline</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <div>
                    <h3 class="font-semibold text-gray-900 mb-4">Active Partners ({{ activePartners().length }})</h3>
                    @for (partner of activePartners(); track partner.name) {
                      <div class="border border-gray-200 rounded-lg p-4 mb-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                              {{ partner.initials }}
                            </div>
                            <div>
                              <p class="font-medium text-gray-900">{{ partner.name }}</p>
                              <p class="text-sm text-gray-500">{{ partner.practice }} • {{ partner.encounters }} encounters</p>
                            </div>
                          </div>
                          <span class="text-green-600 font-medium">{{ partner.revenue }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-3">Marketplace Settings</h4>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Listed on Marketplace</span>
                        <div class="w-10 h-6 bg-blue-600 rounded-full relative">
                          <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Auto-approve requests</span>
                        <div class="w-10 h-6 bg-gray-300 rounded-full relative">
                          <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-3">Licensing Revenue</h4>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-sm text-gray-500">This Month</span>
                        <span class="font-medium text-green-600">$2,450</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Last Month</span>
                        <span class="font-medium">$2,180</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-sm text-gray-500">YTD</span>
                        <span class="font-medium">$18,750</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            @default {
              <p class="text-gray-500">{{ activeTab() }} content coming soon...</p>
            }
          }
        </div>
      </div>
    </main>
  `
})
export class CarePlanSettingsComponent {
  @Input() id?: string;
  activeTab = signal('Overview');
  tabs = signal(['Overview', 'Workflow', 'Billing', 'Documents', 'Report Delivery', 'Licensing']);
  carePlan = signal({
    name: 'TeleNeurology',
    type: 'DX/TX',
    price: '$495',
    description: 'Comprehensive telemedicine neurology evaluation including mTBI assessment, cognitive screening, and treatment planning.'
  });
  heroStats = signal([
    { label: 'Total Encounters', value: '156' },
    { label: 'Active Partners', value: '8' },
    { label: 'Monthly Revenue', value: '$12,450' },
    { label: 'Avg. Rating', value: '4.8' },
    { label: 'Completion Rate', value: '94%' }
  ]);
  pendingRequests = signal([
    { name: 'Dr. James Wilson', initials: 'JW', practice: 'Houston Neurology Clinic' },
    { name: 'Dr. Emily Brown', initials: 'EB', practice: 'Dallas Medical Center' }
  ]);
  activePartners = signal([
    { name: 'Dr. Sarah Chen', initials: 'SC', practice: 'Austin Neuro Associates', encounters: 45, revenue: '$4,250' },
    { name: 'Dr. Michael Ross', initials: 'MR', practice: 'San Antonio Brain & Spine', encounters: 32, revenue: '$3,100' }
  ]);
}
