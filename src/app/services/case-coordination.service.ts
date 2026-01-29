import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  CaseParticipant,
  CareModelRelationship,
  CareRequest,
  OrganizationPartnership,
  CaseStatus,
  CareModelStage,
  AddParticipantInput,
  RequestCareInput,
  LinkCareModelsInput,
  LawFirmSearchFilters,
  LawFirmDashboardStats,
  CarePlanSummary
} from '../models/care-coordination.model';

@Injectable({
  providedIn: 'root'
})
export class CaseCoordinationService {
  private supabase = inject(SupabaseService);

  // State signals
  private _participants = signal<CaseParticipant[]>([]);
  private _relatedCareModels = signal<CareModelRelationship[]>([]);
  private _partnerships = signal<OrganizationPartnership[]>([]);
  private _careRequests = signal<CareRequest[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly participants = this._participants.asReadonly();
  readonly relatedCareModels = this._relatedCareModels.asReadonly();
  readonly partnerships = this._partnerships.asReadonly();
  readonly careRequests = this._careRequests.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly primaryProvider = computed(() =>
    this._participants().find(p => p.participant_role === 'primary_provider')
  );

  readonly lawFirmParticipants = computed(() =>
    this._participants().filter(p => p.participant_role === 'law_firm')
  );

  readonly activePartnerships = computed(() =>
    this._partnerships().filter(p => p.is_active)
  );

  readonly pendingCareRequests = computed(() =>
    this._careRequests().filter(r => r.status === 'pending')
  );

  // ============================================
  // CASE PARTICIPANTS
  // ============================================

  /**
   * Load participants for a case
   */
  async loadParticipants(caseId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await this.supabase.client
        .from('case_participants')
        .select(`
          *,
          user:user_profiles!user_id(id, email, first_name, last_name, avatar_url, role),
          organization:organizations!organization_id(id, name, slug, logo_url)
        `)
        .eq('case_id', caseId)
        .order('added_at', { ascending: true });

      if (error) throw error;
      this._participants.set(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load participants';
      this._error.set(message);
      console.error('Error loading participants:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Add a participant to a case
   */
  async addParticipant(input: AddParticipantInput): Promise<CaseParticipant | null> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase.client
        .from('case_participants')
        .insert({
          case_id: input.case_id,
          user_id: input.user_id,
          organization_id: input.organization_id,
          participant_role: input.participant_role,
          access_level: input.access_level,
          can_request_settlement: input.can_request_settlement ?? (input.participant_role === 'law_firm'),
          can_approve_settlement: input.can_approve_settlement ?? (input.participant_role === 'primary_provider'),
          added_by: user.user.id,
          notes: input.notes
        })
        .select(`
          *,
          user:user_profiles!user_id(id, email, first_name, last_name, avatar_url),
          organization:organizations!organization_id(id, name, slug, logo_url)
        `)
        .single();

      if (error) throw error;

      // Update local state
      this._participants.update(participants => [...participants, data]);

      return data;
    } catch (err) {
      console.error('Error adding participant:', err);
      return null;
    }
  }

  /**
   * Remove a participant from a case
   */
  async removeParticipant(participantId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('case_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      // Update local state
      this._participants.update(participants =>
        participants.filter(p => p.id !== participantId)
      );

      return true;
    } catch (err) {
      console.error('Error removing participant:', err);
      return false;
    }
  }

  /**
   * Update participant access level
   */
  async updateParticipantAccess(
    participantId: string,
    accessLevel: 'read_only' | 'read_write' | 'admin'
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('case_participants')
        .update({ access_level: accessLevel })
        .eq('id', participantId);

      if (error) throw error;

      // Update local state
      this._participants.update(participants =>
        participants.map(p =>
          p.id === participantId ? { ...p, access_level: accessLevel } : p
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating participant access:', err);
      return false;
    }
  }

  /**
   * Check if current user has access to a case
   */
  async checkCaseAccess(caseId: string): Promise<{ hasAccess: boolean; accessLevel?: string }> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) return { hasAccess: false };

      const { data } = await this.supabase.client
        .from('case_participants')
        .select('access_level')
        .eq('case_id', caseId)
        .eq('user_id', user.user.id)
        .single();

      if (data) {
        return { hasAccess: true, accessLevel: data.access_level };
      }

      // Also check organization-level access
      const { data: profile } = await this.supabase.client
        .from('user_profiles')
        .select('organization_id, role')
        .eq('id', user.user.id)
        .single();

      if (profile?.role === 'super_admin') {
        return { hasAccess: true, accessLevel: 'admin' };
      }

      if (profile?.organization_id) {
        const { data: orgAccess } = await this.supabase.client
          .from('case_participants')
          .select('access_level')
          .eq('case_id', caseId)
          .eq('organization_id', profile.organization_id)
          .single();

        if (orgAccess) {
          return { hasAccess: true, accessLevel: orgAccess.access_level };
        }
      }

      return { hasAccess: false };
    } catch {
      return { hasAccess: false };
    }
  }

  // ============================================
  // CASE STATUS & STAGE MANAGEMENT
  // ============================================

  /**
   * Update case status
   */
  async updateCaseStatus(caseId: string, status: CaseStatus): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('cases')
        .update({ status })
        .eq('id', caseId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating case status:', err);
      return false;
    }
  }

  /**
   * Update care model stage for a case
   */
  async updateCareModelStage(caseId: string, stage: CareModelStage): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('cases')
        .update({ care_model_stage: stage })
        .eq('id', caseId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating care model stage:', err);
      return false;
    }
  }

  // ============================================
  // CARE MODEL RELATIONSHIPS (Symphony of Care)
  // ============================================

  /**
   * Load related care models for a care plan
   */
  async loadRelatedCareModels(carePlanId: string): Promise<void> {
    this._loading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from('care_model_relationships')
        .select(`
          *,
          primary_care_plan:care_plans!primary_care_plan_id(id, name, provider, care_type, price),
          related_care_plan:care_plans!related_care_plan_id(id, name, provider, care_type, price)
        `)
        .or(`primary_care_plan_id.eq.${carePlanId},related_care_plan_id.eq.${carePlanId}`)
        .eq('is_active', true);

      if (error) throw error;
      this._relatedCareModels.set(data || []);
    } catch (err) {
      console.error('Error loading related care models:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Link two care models (manual linking)
   */
  async linkCareModels(input: LinkCareModelsInput): Promise<CareModelRelationship | null> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase.client
        .from('care_model_relationships')
        .insert({
          primary_care_plan_id: input.primary_care_plan_id,
          related_care_plan_id: input.related_care_plan_id,
          relationship_type: input.relationship_type,
          manually_linked: true,
          linked_by_user_id: user.user.id,
          link_reason: input.link_reason
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      this._relatedCareModels.update(models => [...models, data]);

      return data;
    } catch (err) {
      console.error('Error linking care models:', err);
      return null;
    }
  }

  /**
   * Unlink care models
   */
  async unlinkCareModels(relationshipId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('care_model_relationships')
        .update({ is_active: false })
        .eq('id', relationshipId);

      if (error) throw error;

      // Update local state
      this._relatedCareModels.update(models =>
        models.filter(m => m.id !== relationshipId)
      );

      return true;
    } catch (err) {
      console.error('Error unlinking care models:', err);
      return false;
    }
  }

  /**
   * Auto-suggest related care models based on diagnosis codes
   */
  async suggestRelatedCareModels(diagnosisCodes: string[]): Promise<CarePlanSummary[]> {
    try {
      const { data, error } = await this.supabase.client
        .rpc('get_related_care_models', { p_diagnosis_codes: diagnosisCodes });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error suggesting related care models:', err);
      return [];
    }
  }

  // ============================================
  // ORGANIZATION PARTNERSHIPS
  // ============================================

  /**
   * Load partnerships for the current user's organization
   */
  async loadPartnerships(): Promise<void> {
    this._loading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from('organization_partnerships')
        .select(`
          *,
          organization_a:organizations!organization_a_id(id, name, slug, logo_url),
          organization_b:organizations!organization_b_id(id, name, slug, logo_url)
        `)
        .eq('is_active', true);

      if (error) throw error;
      this._partnerships.set(data || []);
    } catch (err) {
      console.error('Error loading partnerships:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Get contracted partners for an organization
   */
  async getContractedPartners(organizationId: string): Promise<OrganizationPartnership[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('organization_partnerships')
        .select(`
          *,
          organization_a:organizations!organization_a_id(id, name, slug, logo_url),
          organization_b:organizations!organization_b_id(id, name, slug, logo_url)
        `)
        .or(`organization_a_id.eq.${organizationId},organization_b_id.eq.${organizationId}`)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting contracted partners:', err);
      return [];
    }
  }

  // ============================================
  // LAW FIRM CARE REQUESTS
  // ============================================

  /**
   * Load care requests (for law firm dashboard)
   */
  async loadCareRequests(orgId?: string): Promise<void> {
    this._loading.set(true);

    try {
      let query = this.supabase.client
        .from('care_requests')
        .select(`
          *,
          requesting_org:organizations!requesting_org_id(id, name, slug),
          requesting_user:user_profiles!requesting_user_id(id, email, first_name, last_name),
          care_plan:care_plans!care_plan_id(id, name, provider, care_type, price)
        `)
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('requesting_org_id', orgId);
      }

      const { data, error } = await query;

      if (error) throw error;
      this._careRequests.set(data || []);
    } catch (err) {
      console.error('Error loading care requests:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Create a care request (law firm requesting care)
   */
  async createCareRequest(input: RequestCareInput): Promise<CareRequest | null> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's organization
      const { data: profile } = await this.supabase.client
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User must belong to an organization');
      }

      const { data, error } = await this.supabase.client
        .from('care_requests')
        .insert({
          requesting_org_id: profile.organization_id,
          requesting_user_id: user.user.id,
          care_plan_id: input.care_plan_id,
          patient_id: input.patient_id,
          case_id: input.case_id,
          request_message: input.request_message,
          diagnosis_codes: input.diagnosis_codes,
          symptoms: input.symptoms,
          sent_to_emails: input.send_to_emails,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      this._careRequests.update(requests => [data, ...requests]);

      // TODO: Trigger email notification to sent_to_emails

      return data;
    } catch (err) {
      console.error('Error creating care request:', err);
      return null;
    }
  }

  /**
   * Respond to a care request (accept/reject)
   */
  async respondToCareRequest(
    requestId: string,
    status: 'accepted' | 'rejected',
    notes?: string
  ): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.client.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await this.supabase.client
        .from('care_requests')
        .update({
          status,
          responded_by_user_id: user.user.id,
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      this._careRequests.update(requests =>
        requests.map(r =>
          r.id === requestId ? { ...r, status, response_notes: notes } : r
        )
      );

      return true;
    } catch (err) {
      console.error('Error responding to care request:', err);
      return false;
    }
  }

  // ============================================
  // LAW FIRM SEARCH
  // ============================================

  /**
   * Search care models by diagnosis codes or symptoms (for law firms)
   */
  async searchCareModels(filters: LawFirmSearchFilters): Promise<CarePlanSummary[]> {
    try {
      let query = this.supabase.client
        .from('care_plans')
        .select(`
          id,
          name,
          provider,
          location,
          type,
          description,
          care_type,
          pricing_model,
          price,
          price_unit,
          lop_required,
          diagnosis_codes(code, description),
          cpt_codes(code)
        `)
        .eq('is_active', true);

      if (filters.care_type) {
        query = query.eq('care_type', filters.care_type);
      }

      if (filters.pricing_model) {
        query = query.eq('pricing_model', filters.pricing_model);
      }

      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by diagnosis codes if provided
      let results = data || [];
      if (filters.diagnosis_codes && filters.diagnosis_codes.length > 0) {
        results = results.filter(plan => {
          const planCodes = (plan.diagnosis_codes || []).map((dc: { code: string }) => dc.code);
          return filters.diagnosis_codes!.some(code => planCodes.includes(code));
        });
      }

      // Filter by symptoms (search in description)
      if (filters.symptoms && filters.symptoms.length > 0) {
        results = results.filter(plan => {
          const description = (plan.description || '').toLowerCase();
          return filters.symptoms!.some(symptom =>
            description.includes(symptom.toLowerCase())
          );
        });
      }

      // If contracted_only, filter by partnerships
      if (filters.contracted_only) {
        const partnerships = this._partnerships();
        const { data: profile } = await this.supabase.client
          .from('user_profiles')
          .select('organization_id')
          .eq('id', (await this.supabase.client.auth.getUser()).data.user?.id)
          .single();

        if (profile?.organization_id) {
          const partnerOrgIds = partnerships
            .filter(p =>
              p.organization_a_id === profile.organization_id ||
              p.organization_b_id === profile.organization_id
            )
            .map(p =>
              p.organization_a_id === profile.organization_id
                ? p.organization_b_id
                : p.organization_a_id
            );

          // For now, we'll include all results since we don't have org_id on care_plans
          // In a full implementation, care_plans would have an organization_id field
        }
      }

      return results as unknown as CarePlanSummary[];
    } catch (err) {
      console.error('Error searching care models:', err);
      return [];
    }
  }

  // ============================================
  // LAW FIRM DASHBOARD STATS
  // ============================================

  /**
   * Get dashboard statistics for law firm
   */
  async getLawFirmDashboardStats(orgId: string): Promise<LawFirmDashboardStats> {
    try {
      // Get active cases where org is a participant
      const { data: cases } = await this.supabase.client
        .from('case_participants')
        .select('case_id, cases!inner(status)')
        .eq('organization_id', orgId)
        .eq('participant_role', 'law_firm');

      const activeCases = (cases || []).filter(
        c => ['treating', 'pending_settlement'].includes((c as unknown as { cases: { status: string } }).cases.status)
      );

      // Get pending settlements
      const { data: settlements } = await this.supabase.client
        .from('settlement_requests')
        .select('id, original_amount, final_amount, status')
        .eq('requested_by_org_id', orgId);

      const pendingSettlements = (settlements || []).filter(s => s.status === 'pending');
      const approvedSettlements = (settlements || []).filter(
        s => ['approved', 'confirmed', 'paid'].includes(s.status)
      );

      // Get care requests
      const { data: careRequests } = await this.supabase.client
        .from('care_requests')
        .select('id, status')
        .eq('requesting_org_id', orgId);

      const pendingCareRequests = (careRequests || []).filter(r => r.status === 'pending');

      // Get partnerships
      const { data: partnerships } = await this.supabase.client
        .from('organization_partnerships')
        .select('id')
        .or(`organization_a_id.eq.${orgId},organization_b_id.eq.${orgId}`)
        .eq('is_active', true);

      return {
        active_cases: activeCases.length,
        pending_settlements: pendingSettlements.length,
        total_billed: (settlements || []).reduce((sum, s) => sum + (s.original_amount || 0), 0),
        total_collected: approvedSettlements.reduce((sum, s) => sum + (s.final_amount || s.original_amount || 0), 0),
        pending_care_requests: pendingCareRequests.length,
        contracted_clinics: (partnerships || []).length
      };
    } catch (err) {
      console.error('Error getting law firm dashboard stats:', err);
      return {
        active_cases: 0,
        pending_settlements: 0,
        total_billed: 0,
        total_collected: 0,
        pending_care_requests: 0,
        contracted_clinics: 0
      };
    }
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to participant changes for a case
   */
  subscribeToParticipantChanges(caseId: string, callback: (participant: CaseParticipant) => void) {
    return this.supabase.client
      .channel(`participants:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_participants',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as CaseParticipant);
          }
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to care request updates
   */
  subscribeToCareRequestUpdates(orgId: string, callback: (request: CareRequest) => void) {
    return this.supabase.client
      .channel(`care_requests:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_requests',
          filter: `requesting_org_id=eq.${orgId}`
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as CareRequest);
          }
        }
      )
      .subscribe();
  }
}
