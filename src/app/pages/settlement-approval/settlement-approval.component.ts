import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettlementService } from '../../services/settlement.service';
import { AuthService } from '../../services/auth.service';
import {
  SettlementRequest,
  SettlementRequestStatus,
  formatCurrency,
  getSettlementStatusBadge
} from '../../models/care-coordination.model';

@Component({
  selector: 'app-settlement-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Settlement Management</h1>
              <p class="text-gray-600 mt-1">Review and manage settlement requests</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex gap-2 text-sm">
                <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                  {{ pendingCount() }} Pending
                </span>
                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {{ disputedCount() }} Disputed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl shadow-sm border p-4">
            <p class="text-sm text-gray-500">Total Original</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats().total_original_amount) }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4">
            <p class="text-sm text-gray-500">Total Reductions</p>
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(stats().total_reduction_amount) }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4">
            <p class="text-sm text-gray-500">Avg Reduction</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats().average_reduction_percentage | number:'1.0-1' }}%</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4">
            <p class="text-sm text-gray-500">Approved</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats().approved_count }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div class="flex flex-wrap gap-4 items-center">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Status</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="applyFilters()"
                class="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="disputed">Disputed</option>
                <option value="escalated">Escalated</option>
                <option value="confirmed">Confirmed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Search</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Search by case number..."
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Settlement List -->
        <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Original</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reduction</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @if (filteredSettlements().length === 0) {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      <span class="text-3xl block mb-2">📋</span>
                      No settlement requests found
                    </td>
                  </tr>
                }
                @for (settlement of filteredSettlements(); track settlement.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                      <p class="font-medium text-gray-900">
                        {{ settlement.case?.case_number || 'Unknown' }}
                      </p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-gray-900">{{ settlement.requested_by_org?.name || 'Unknown' }}</p>
                      <p class="text-xs text-gray-500">
                        {{ settlement.requested_by_user?.first_name }} {{ settlement.requested_by_user?.last_name }}
                      </p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="font-medium text-gray-900">{{ formatCurrency(settlement.original_amount) }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <p class="font-medium text-green-600">-{{ formatCurrency(settlement.requested_reduction) }}</p>
                      <p class="text-xs text-gray-500">{{ settlement.reduction_percentage | number:'1.0-1' }}%</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="'px-2 py-1 text-xs rounded-full ' + getStatusClass(settlement.status)">
                        {{ settlement.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-sm">
                      {{ settlement.requested_at | date:'short' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        @if (settlement.status === 'pending') {
                          <button
                            (click)="openApprovalModal(settlement)"
                            class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Review
                          </button>
                        }
                        @if (settlement.status === 'approved' && !hasConfirmed(settlement)) {
                          <button
                            (click)="openConfirmModal(settlement)"
                            class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        }
                        <button
                          (click)="viewDetails(settlement)"
                          class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Approval Modal -->
      @if (showApprovalModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold text-gray-900">Review Settlement Request</h3>
            </div>
            <div class="p-6">
              @if (selectedSettlement()) {
                <div class="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Original Amount:</span>
                    <span class="font-medium">{{ formatCurrency(selectedSettlement()!.original_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Requested Reduction:</span>
                    <span class="font-medium text-green-600">-{{ formatCurrency(selectedSettlement()!.requested_reduction) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Final Amount:</span>
                    <span class="font-bold text-lg">{{ formatCurrency(selectedSettlement()!.original_amount - selectedSettlement()!.requested_reduction) }}</span>
                  </div>
                  <hr class="my-2">
                  <div>
                    <span class="text-gray-600">Reason:</span>
                    <p class="text-gray-900 mt-1">{{ selectedSettlement()!.reduction_reason }}</p>
                  </div>
                </div>
              }

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Response Notes</label>
                <textarea
                  [(ngModel)]="responseNotes"
                  rows="3"
                  placeholder="Add any notes..."
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div class="flex gap-3">
                <button
                  (click)="denySettlement()"
                  [disabled]="processing()"
                  class="flex-1 py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Deny
                </button>
                <button
                  (click)="disputeSettlement()"
                  [disabled]="processing()"
                  class="flex-1 py-2 px-4 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50"
                >
                  Dispute
                </button>
                <button
                  (click)="approveSettlement()"
                  [disabled]="processing()"
                  class="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>

              <button
                (click)="closeModals()"
                class="w-full mt-3 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Confirm Modal -->
      @if (showConfirmModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold text-gray-900">Confirm Settlement</h3>
              <p class="text-sm text-gray-600 mt-1">Both parties must confirm to finalize</p>
            </div>
            <div class="p-6">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmed Amount</label>
                <input
                  type="number"
                  [(ngModel)]="confirmAmount"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div class="mb-4">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="paymentReceived"
                    class="w-4 h-4 text-blue-600 rounded"
                  >
                  <span class="text-sm text-gray-700">Payment Received</span>
                </label>
              </div>

              @if (paymentReceived) {
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input
                      type="date"
                      [(ngModel)]="paymentDate"
                      class="w-full px-3 py-2 border rounded-lg"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      [(ngModel)]="paymentMethod"
                      class="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="check">Check</option>
                      <option value="ach">ACH</option>
                      <option value="wire">Wire</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              }

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  [(ngModel)]="confirmNotes"
                  rows="2"
                  class="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div class="flex gap-3">
                <button
                  (click)="closeModals()"
                  class="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  (click)="confirmSettlement()"
                  [disabled]="processing()"
                  class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SettlementApprovalComponent implements OnInit {
  private settlementService = inject(SettlementService);
  private authService = inject(AuthService);

  // Filters
  statusFilter = '';
  searchTerm = '';

  // Modal state
  showApprovalModal = signal(false);
  showConfirmModal = signal(false);
  selectedSettlement = signal<SettlementRequest | null>(null);
  processing = signal(false);

  // Form fields
  responseNotes = '';
  confirmAmount = 0;
  paymentReceived = false;
  paymentDate = '';
  paymentMethod = 'check';
  confirmNotes = '';

  // Computed
  readonly settlements = computed(() => this.settlementService.settlements());
  readonly stats = computed(() => this.settlementService.settlementStats());
  readonly pendingCount = computed(() => this.settlementService.pendingSettlements().length);
  readonly disputedCount = computed(() => this.settlementService.disputedSettlements().length);

  readonly filteredSettlements = computed(() => {
    let results = this.settlements();

    if (this.statusFilter) {
      results = results.filter(s => s.status === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(s =>
        s.case?.case_number?.toLowerCase().includes(term) ||
        s.requested_by_org?.name?.toLowerCase().includes(term)
      );
    }

    return results;
  });

  formatCurrency = formatCurrency;

  async ngOnInit() {
    await this.settlementService.loadSettlements();
  }

  applyFilters() {
    // Triggers computed recalculation
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

  hasConfirmed(settlement: SettlementRequest): boolean {
    const orgId = this.authService.profile()?.organization_id;
    return settlement.confirmations?.some(c => c.confirming_org_id === orgId) || false;
  }

  openApprovalModal(settlement: SettlementRequest) {
    this.selectedSettlement.set(settlement);
    this.responseNotes = '';
    this.showApprovalModal.set(true);
  }

  openConfirmModal(settlement: SettlementRequest) {
    this.selectedSettlement.set(settlement);
    this.confirmAmount = settlement.original_amount - settlement.requested_reduction;
    this.paymentReceived = false;
    this.paymentDate = '';
    this.paymentMethod = 'check';
    this.confirmNotes = '';
    this.showConfirmModal.set(true);
  }

  closeModals() {
    this.showApprovalModal.set(false);
    this.showConfirmModal.set(false);
    this.selectedSettlement.set(null);
  }

  async approveSettlement() {
    const settlement = this.selectedSettlement();
    if (!settlement) return;

    this.processing.set(true);
    try {
      await this.settlementService.approveSettlement(settlement.id, this.responseNotes);
      this.closeModals();
      await this.settlementService.loadSettlements();
    } finally {
      this.processing.set(false);
    }
  }

  async denySettlement() {
    const settlement = this.selectedSettlement();
    if (!settlement || !this.responseNotes) {
      alert('Please provide a reason for denial');
      return;
    }

    this.processing.set(true);
    try {
      await this.settlementService.denySettlement(settlement.id, this.responseNotes);
      this.closeModals();
      await this.settlementService.loadSettlements();
    } finally {
      this.processing.set(false);
    }
  }

  async disputeSettlement() {
    const settlement = this.selectedSettlement();
    if (!settlement || !this.responseNotes) {
      alert('Please provide a reason for dispute');
      return;
    }

    this.processing.set(true);
    try {
      await this.settlementService.escalateDispute({
        settlement_request_id: settlement.id,
        escalation_reason: this.responseNotes,
        escalation_type: 'disputed_reduction'
      });
      this.closeModals();
      await this.settlementService.loadSettlements();
    } finally {
      this.processing.set(false);
    }
  }

  async confirmSettlement() {
    const settlement = this.selectedSettlement();
    if (!settlement) return;

    this.processing.set(true);
    try {
      await this.settlementService.confirmSettlement({
        settlement_request_id: settlement.id,
        confirmed_amount: this.confirmAmount,
        payment_received: this.paymentReceived,
        payment_amount: this.paymentReceived ? this.confirmAmount : undefined,
        payment_date: this.paymentReceived ? this.paymentDate : undefined,
        payment_method: this.paymentReceived ? this.paymentMethod as any : undefined,
        confirmation_notes: this.confirmNotes
      });
      this.closeModals();
      await this.settlementService.loadSettlements();
    } finally {
      this.processing.set(false);
    }
  }

  viewDetails(settlement: SettlementRequest) {
    // TODO: Navigate to detail view
    console.log('View details:', settlement);
  }
}
