import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  SettlementRequest,
  SettlementConfirmation,
  EscalationQueueItem,
  CreateSettlementRequestInput,
  ConfirmSettlementInput,
  EscalateDisputeInput,
  ResolveEscalationInput,
  SettlementFilters,
  EscalationFilters,
  SettlementStats,
  EscalationStats,
  SettlementRequestStatus,
  EscalationStatus
} from '../models/care-coordination.model';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {
  private supabase = inject(SupabaseService);

  // State signals
  private _settlements = signal<SettlementRequest[]>([]);
  private _selectedSettlement = signal<SettlementRequest | null>(null);
  private _escalations = signal<EscalationQueueItem[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly settlements = this._settlements.asReadonly();
  readonly selectedSettlement = this._selectedSettlement.asReadonly();
  readonly escalations = this._escalations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly pendingSettlements = computed(() =>
    this._settlements().filter(s => s.status === 'pending')
  );

  readonly approvedSettlements = computed(() =>
    this._settlements().filter(s => s.status === 'approved' || s.status === 'confirmed')
  );

  readonly disputedSettlements = computed(() =>
    this._settlements().filter(s => s.status === 'disputed' || s.status === 'escalated')
  );

  readonly openEscalations = computed(() =>
    this._escalations().filter(e => e.status === 'open' || e.status === 'in_progress')
  );

  readonly settlementStats = computed<SettlementStats>(() => {
    const settlements = this._settlements();
    const approved = settlements.filter(s => ['approved', 'confirmed', 'paid'].includes(s.status));

    return {
      total_requests: settlements.length,
      pending_count: settlements.filter(s => s.status === 'pending').length,
      approved_count: approved.length,
      disputed_count: settlements.filter(s => ['disputed', 'escalated'].includes(s.status)).length,
      total_original_amount: settlements.reduce((sum, s) => sum + s.original_amount, 0),
      total_reduction_amount: approved.reduce((sum, s) => sum + s.requested_reduction, 0),
      average_reduction_percentage: approved.length > 0
        ? approved.reduce((sum, s) => sum + s.reduction_percentage, 0) / approved.length
        : 0
    };
  });

  // ============================================
  // SETTLEMENT REQUESTS
  // ============================================

  /**
   * Load settlement requests with optional filters
   */
  async loadSettlements(filters?: SettlementFilters): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      let query = this.supabase.client
        .from('settlement_requests')
        .select(`
          *,
          requested_by_user:user_profiles!requested_by_user_id(id, email, first_name, last_name, avatar_url),
          requested_by_org:organizations!requested_by_org_id(id, name, slug, logo_url),
          response_by_user:user_profiles!response_by_user_id(id, email, first_name, last_name),
          confirmations:settlement_confirmations(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.case_id) {
        query = query.eq('case_id', filters.case_id);
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.requested_by_org_id) {
        query = query.eq('requested_by_org_id', filters.requested_by_org_id);
      }

      if (filters?.date_from) {
        query = query.gte('requested_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('requested_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      this._settlements.set(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load settlements';
      this._error.set(message);
      console.error('Error loading settlements:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Get a single settlement request by ID
   */
  async getSettlement(id: string): Promise<SettlementRequest | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('settlement_requests')
        .select(`
          *,
          requested_by_user:user_profiles!requested_by_user_id(id, email, first_name, last_name, avatar_url),
          requested_by_org:organizations!requested_by_org_id(id, name, slug, logo_url),
          response_by_user:user_profiles!response_by_user_id(id, email, first_name, last_name),
          confirmations:settlement_confirmations(
            *,
            confirming_user:user_profiles!confirming_user_id(id, email, first_name, last_name),
            confirming_org:organizations!confirming_org_id(id, name, slug)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      this._selectedSettlement.set(data);
      return data;
    } catch (err) {
      console.error('Error getting settlement:', err);
      return null;
    }
  }

  /**
   * Create a new settlement/reduction request
   */
  async createSettlementRequest(input: CreateSettlementRequestInput): Promise<SettlementRequest | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's organization
      const { data: profile } = await this.supabase.client
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.user.id)
        .single();

      const { data, error } = await this.supabase.client
        .from('settlement_requests')
        .insert({
          case_id: input.case_id,
          encounter_id: input.encounter_id,
          requested_by_user_id: user.user.id,
          requested_by_org_id: profile?.organization_id,
          original_amount: input.original_amount,
          requested_reduction: input.requested_reduction,
          reduction_reason: input.reduction_reason,
          reduction_category: input.reduction_category || 'standard_reduction',
          attachment_urls: input.attachment_urls,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      this._settlements.update(settlements => [data, ...settlements]);

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create settlement request';
      this._error.set(message);
      console.error('Error creating settlement request:', err);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Approve a settlement request
   */
  async approveSettlement(
    settlementId: string,
    notes?: string
  ): Promise<boolean> {
    return this.updateSettlementStatus(settlementId, 'approved', notes);
  }

  /**
   * Deny a settlement request
   */
  async denySettlement(
    settlementId: string,
    reason: string
  ): Promise<boolean> {
    return this.updateSettlementStatus(settlementId, 'denied', reason);
  }

  /**
   * Update settlement status
   */
  private async updateSettlementStatus(
    settlementId: string,
    status: SettlementRequestStatus,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await this.supabase.client
        .from('settlement_requests')
        .update({
          status,
          response_notes: notes,
          response_by_user_id: user.user.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', settlementId);

      if (error) throw error;

      // Update local state
      this._settlements.update(settlements =>
        settlements.map(s =>
          s.id === settlementId
            ? { ...s, status, response_notes: notes, responded_at: new Date().toISOString() }
            : s
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating settlement status:', err);
      return false;
    }
  }

  /**
   * Override a settlement decision with reason
   */
  async overrideSettlement(
    settlementId: string,
    reason: string,
    attachmentUrl?: string
  ): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await this.supabase.client
        .from('settlement_requests')
        .update({
          override_reason: reason,
          override_by_user_id: user.user.id,
          override_attachment_url: attachmentUrl,
          status: 'approved'
        })
        .eq('id', settlementId);

      if (error) throw error;

      // Update local state
      this._settlements.update(settlements =>
        settlements.map(s =>
          s.id === settlementId
            ? { ...s, override_reason: reason, status: 'approved' as SettlementRequestStatus }
            : s
        )
      );

      return true;
    } catch (err) {
      console.error('Error overriding settlement:', err);
      return false;
    }
  }

  // ============================================
  // SETTLEMENT CONFIRMATIONS
  // ============================================

  /**
   * Confirm a settlement (dual-party confirmation)
   */
  async confirmSettlement(input: ConfirmSettlementInput): Promise<SettlementConfirmation | null> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's organization
      const { data: profile } = await this.supabase.client
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.user.id)
        .single();

      const { data, error } = await this.supabase.client
        .from('settlement_confirmations')
        .insert({
          settlement_request_id: input.settlement_request_id,
          confirming_user_id: user.user.id,
          confirming_org_id: profile?.organization_id,
          confirmed_amount: input.confirmed_amount,
          payment_received: input.payment_received || false,
          payment_amount: input.payment_amount,
          payment_date: input.payment_date,
          payment_method: input.payment_method,
          payment_reference: input.payment_reference,
          confirmation_notes: input.confirmation_notes
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the settlement to get updated confirmations
      await this.getSettlement(input.settlement_request_id);

      return data;
    } catch (err) {
      console.error('Error confirming settlement:', err);
      return null;
    }
  }

  /**
   * Record payment for a settlement
   */
  async recordPayment(
    confirmationId: string,
    paymentInfo: {
      payment_amount: number;
      payment_date: string;
      payment_method: string;
      payment_reference?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('settlement_confirmations')
        .update({
          payment_received: true,
          ...paymentInfo
        })
        .eq('id', confirmationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error recording payment:', err);
      return false;
    }
  }

  // ============================================
  // ESCALATIONS
  // ============================================

  /**
   * Load escalation queue with optional filters
   */
  async loadEscalations(filters?: EscalationFilters): Promise<void> {
    this._loading.set(true);

    try {
      let query = this.supabase.client
        .from('escalation_queue')
        .select(`
          *,
          escalated_by_user:user_profiles!escalated_by_user_id(id, email, first_name, last_name),
          assigned_to_user:user_profiles!assigned_to_user_id(id, email, first_name, last_name),
          resolved_by_user:user_profiles!resolved_by_user_id(id, email, first_name, last_name),
          settlement_request:settlement_requests(
            *,
            requested_by_org:organizations!requested_by_org_id(id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.escalation_type) {
        query = query.eq('escalation_type', filters.escalation_type);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.assigned_to_user_id) {
        query = query.eq('assigned_to_user_id', filters.assigned_to_user_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      this._escalations.set(data || []);
    } catch (err) {
      console.error('Error loading escalations:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Escalate a disputed settlement
   */
  async escalateDispute(input: EscalateDisputeInput): Promise<EscalationQueueItem | null> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Update settlement status to escalated
      await this.supabase.client
        .from('settlement_requests')
        .update({ status: 'escalated' })
        .eq('id', input.settlement_request_id);

      // Create escalation
      const { data, error } = await this.supabase.client
        .from('escalation_queue')
        .insert({
          settlement_request_id: input.settlement_request_id,
          escalated_by_user_id: user.user.id,
          escalation_reason: input.escalation_reason,
          escalation_type: input.escalation_type,
          priority: input.priority || 'normal',
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      this._escalations.update(escalations => [data, ...escalations]);
      this._settlements.update(settlements =>
        settlements.map(s =>
          s.id === input.settlement_request_id
            ? { ...s, status: 'escalated' as SettlementRequestStatus }
            : s
        )
      );

      return data;
    } catch (err) {
      console.error('Error escalating dispute:', err);
      return null;
    }
  }

  /**
   * Assign an escalation to a user
   */
  async assignEscalation(escalationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('escalation_queue')
        .update({
          assigned_to_user_id: userId,
          assigned_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', escalationId);

      if (error) throw error;

      // Update local state
      this._escalations.update(escalations =>
        escalations.map(e =>
          e.id === escalationId
            ? { ...e, assigned_to_user_id: userId, status: 'in_progress' as EscalationStatus }
            : e
        )
      );

      return true;
    } catch (err) {
      console.error('Error assigning escalation:', err);
      return false;
    }
  }

  /**
   * Resolve an escalation
   */
  async resolveEscalation(input: ResolveEscalationInput): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await this.supabase.client
        .from('escalation_queue')
        .update({
          status: 'resolved',
          resolution: input.resolution,
          resolution_type: input.resolution_type,
          resolved_by_user_id: user.user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', input.escalation_id);

      if (error) throw error;

      // Update local state
      this._escalations.update(escalations =>
        escalations.map(e =>
          e.id === input.escalation_id
            ? { ...e, status: 'resolved' as EscalationStatus, resolution: input.resolution }
            : e
        )
      );

      return true;
    } catch (err) {
      console.error('Error resolving escalation:', err);
      return false;
    }
  }

  /**
   * Get escalation statistics
   */
  getEscalationStats(): EscalationStats {
    const escalations = this._escalations();
    const resolved = escalations.filter(e => e.status === 'resolved' || e.status === 'closed');

    // Calculate average resolution time
    let avgTime = 0;
    if (resolved.length > 0) {
      const totalDays = resolved.reduce((sum, e) => {
        if (e.resolved_at && e.created_at) {
          const created = new Date(e.created_at).getTime();
          const resolvedAt = new Date(e.resolved_at).getTime();
          return sum + (resolvedAt - created) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0);
      avgTime = totalDays / resolved.length;
    }

    return {
      total_escalations: escalations.length,
      open_count: escalations.filter(e => e.status === 'open').length,
      in_progress_count: escalations.filter(e => e.status === 'in_progress').length,
      resolved_count: resolved.length,
      average_resolution_time_days: Math.round(avgTime * 10) / 10
    };
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to settlement updates for a case
   */
  subscribeToSettlementUpdates(caseId: string, callback: (settlement: SettlementRequest) => void) {
    return this.supabase.client
      .channel(`settlements:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlement_requests',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as SettlementRequest);
            // Update local state
            this._settlements.update(settlements => {
              const index = settlements.findIndex(s => s.id === (payload.new as SettlementRequest).id);
              if (index >= 0) {
                const updated = [...settlements];
                updated[index] = payload.new as SettlementRequest;
                return updated;
              }
              return [payload.new as SettlementRequest, ...settlements];
            });
          }
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to escalation queue updates
   */
  subscribeToEscalationUpdates(callback: (escalation: EscalationQueueItem) => void) {
    return this.supabase.client
      .channel('escalations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escalation_queue'
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as EscalationQueueItem);
          }
        }
      )
      .subscribe();
  }
}
