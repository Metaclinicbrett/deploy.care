/**
 * Care Coordination Models
 * Types and interfaces for multi-party care coordination,
 * settlement workflows, and law firm integration.
 */

// ============================================
// ENUMS AND TYPES
// ============================================

/** New case statuses for the coordination workflow */
export type CaseStatus =
  | 'treating'
  | 'not_treating'
  | 'released'
  | 'pending_settlement'
  | 'complete';

/** Care model workflow stages */
export type CareModelStage =
  | 'created'
  | 'awaiting_approval'
  | 'awaiting_signature'
  | 'completed_billed';

/** Settlement status for tracking billing/payment */
export type SettlementStatus =
  | 'not_applicable'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'disputed'
  | 'complete';

/** Settlement request status */
export type SettlementRequestStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'disputed'
  | 'escalated'
  | 'confirmed'
  | 'paid';

/** Escalation status */
export type EscalationStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

/** Escalation type for categorization */
export type EscalationType =
  | 'disputed_reduction'
  | 'approval_timeout'
  | 'payment_discrepancy'
  | 'documentation_issue'
  | 'contract_dispute';

/** Care model relationship types (symphony of care) */
export type CareModelRelationshipType =
  | 'complimentary'
  | 'sequential'
  | 'parallel'
  | 'prerequisite'
  | 'alternative';

/** Participant roles in a case */
export type ParticipantRole =
  | 'primary_provider'
  | 'secondary_provider'
  | 'referral_source'
  | 'billing_contact'
  | 'law_firm'
  | 'care_coordinator';

/** Access levels for case participants */
export type AccessLevel =
  | 'read_only'
  | 'read_write'
  | 'admin';

/** Partnership types between organizations */
export type PartnershipType =
  | 'standard'
  | 'law_firm'
  | 'referral'
  | 'specialist';

/** Reduction categories for settlements */
export type ReductionCategory =
  | 'standard_reduction'
  | 'hardship'
  | 'insurance_adjustment'
  | 'negotiated_settlement'
  | 'write_off'
  | 'other';

/** Payment methods */
export type PaymentMethod =
  | 'check'
  | 'ach'
  | 'wire'
  | 'credit_card'
  | 'other';

/** Resolution types for escalations */
export type ResolutionType =
  | 'approved_as_requested'
  | 'approved_modified'
  | 'denied'
  | 'withdrawn'
  | 'settled_externally';

/** Care request status */
export type CareRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired';

/** Priority levels */
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================
// INTERFACES
// ============================================

/** Organization partnership/contract */
export interface OrganizationPartnership {
  id: string;
  organization_a_id: string;
  organization_b_id: string;
  partnership_type: PartnershipType;
  contract_date: string;
  contract_expiry?: string;
  contract_terms: Record<string, unknown>;
  data_authority: DataAuthorityConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined fields
  organization_a?: OrganizationSummary;
  organization_b?: OrganizationSummary;
}

/** Data authority configuration in contracts */
export interface DataAuthorityConfig {
  patient_data_owner?: 'organization_a' | 'organization_b' | 'shared';
  clinical_data_owner?: 'organization_a' | 'organization_b' | 'shared';
  billing_data_owner?: 'organization_a' | 'organization_b' | 'shared';
  custom_rules?: Record<string, unknown>;
}

/** Organization summary for joins */
export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

/** Case participant with access control */
export interface CaseParticipant {
  id: string;
  case_id: string;
  user_id?: string;
  organization_id?: string;
  participant_role: ParticipantRole;
  access_level: AccessLevel;
  can_request_settlement: boolean;
  can_approve_settlement: boolean;
  added_at: string;
  added_by?: string;
  notes?: string;
  // Joined fields
  user?: UserSummary;
  organization?: OrganizationSummary;
}

/** User summary for joins */
export interface UserSummary {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

/** Settlement reduction request */
export interface SettlementRequest {
  id: string;
  case_id: string;
  encounter_id?: string;
  requested_by_user_id: string;
  requested_by_org_id?: string;
  original_amount: number;
  requested_reduction: number;
  reduction_percentage: number;
  final_amount?: number;
  reduction_reason: string;
  reduction_category?: ReductionCategory;
  status: SettlementRequestStatus;
  attachment_urls?: string[];
  requested_at: string;
  responded_at?: string;
  response_by_user_id?: string;
  response_notes?: string;
  override_reason?: string;
  override_by_user_id?: string;
  override_attachment_url?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  requested_by_user?: UserSummary;
  requested_by_org?: OrganizationSummary;
  response_by_user?: UserSummary;
  case?: CaseSummary;
  encounter?: EncounterSummary;
  confirmations?: SettlementConfirmation[];
}

/** Case summary for joins */
export interface CaseSummary {
  id: string;
  case_number: string;
  patient_name?: string;
  status: CaseStatus;
}

/** Encounter summary for joins */
export interface EncounterSummary {
  id: string;
  encounter_type: string;
  scheduled_date?: string;
  bill_amount?: number;
}

/** Settlement confirmation from a party */
export interface SettlementConfirmation {
  id: string;
  settlement_request_id: string;
  confirming_user_id: string;
  confirming_org_id?: string;
  confirmed_amount: number;
  payment_received: boolean;
  payment_amount?: number;
  payment_date?: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  confirmation_notes?: string;
  confirmed_at: string;
  // Joined fields
  confirming_user?: UserSummary;
  confirming_org?: OrganizationSummary;
}

/** Escalation queue item for disputed reductions */
export interface EscalationQueueItem {
  id: string;
  settlement_request_id: string;
  escalated_by_user_id: string;
  escalation_reason: string;
  escalation_type: EscalationType;
  priority: Priority;
  assigned_to_user_id?: string;
  assigned_at?: string;
  status: EscalationStatus;
  resolution?: string;
  resolution_type?: ResolutionType;
  resolved_by_user_id?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  escalated_by_user?: UserSummary;
  assigned_to_user?: UserSummary;
  resolved_by_user?: UserSummary;
  settlement_request?: SettlementRequest;
}

/** Care model relationship (symphony of care) */
export interface CareModelRelationship {
  id: string;
  primary_care_plan_id: string;
  related_care_plan_id: string;
  relationship_type: CareModelRelationshipType;
  auto_suggested: boolean;
  manually_linked: boolean;
  linked_by_user_id?: string;
  link_reason?: string;
  is_active: boolean;
  created_at: string;
  // Joined fields
  primary_care_plan?: CarePlanSummary;
  related_care_plan?: CarePlanSummary;
}

/** Care plan summary for joins */
export interface CarePlanSummary {
  id: string;
  name: string;
  provider: string;
  care_type: string;
  price?: number;
}

/** Care request from law firm */
export interface CareRequest {
  id: string;
  requesting_org_id: string;
  requesting_user_id: string;
  care_plan_id: string;
  patient_id?: string;
  case_id?: string;
  request_message?: string;
  diagnosis_codes?: string[];
  symptoms?: string[];
  status: CareRequestStatus;
  sent_to_emails?: string[];
  responded_by_user_id?: string;
  responded_at?: string;
  response_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  requesting_org?: OrganizationSummary;
  requesting_user?: UserSummary;
  care_plan?: CarePlanSummary;
}

// ============================================
// FORM / INPUT TYPES
// ============================================

/** Input for creating a settlement request */
export interface CreateSettlementRequestInput {
  case_id: string;
  encounter_id?: string;
  original_amount: number;
  requested_reduction: number;
  reduction_reason: string;
  reduction_category?: ReductionCategory;
  attachment_urls?: string[];
}

/** Input for confirming a settlement */
export interface ConfirmSettlementInput {
  settlement_request_id: string;
  confirmed_amount: number;
  payment_received?: boolean;
  payment_amount?: number;
  payment_date?: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  confirmation_notes?: string;
}

/** Input for escalating a dispute */
export interface EscalateDisputeInput {
  settlement_request_id: string;
  escalation_reason: string;
  escalation_type: EscalationType;
  priority?: Priority;
}

/** Input for resolving an escalation */
export interface ResolveEscalationInput {
  escalation_id: string;
  resolution: string;
  resolution_type: ResolutionType;
}

/** Input for adding a case participant */
export interface AddParticipantInput {
  case_id: string;
  user_id?: string;
  organization_id?: string;
  participant_role: ParticipantRole;
  access_level: AccessLevel;
  can_request_settlement?: boolean;
  can_approve_settlement?: boolean;
  notes?: string;
}

/** Input for requesting care (law firm) */
export interface RequestCareInput {
  care_plan_id: string;
  patient_id?: string;
  case_id?: string;
  request_message?: string;
  diagnosis_codes?: string[];
  symptoms?: string[];
  send_to_emails?: string[];
}

/** Input for linking care models */
export interface LinkCareModelsInput {
  primary_care_plan_id: string;
  related_care_plan_id: string;
  relationship_type: CareModelRelationshipType;
  link_reason?: string;
}

// ============================================
// FILTER / SEARCH TYPES
// ============================================

/** Filters for law firm care model search */
export interface LawFirmSearchFilters {
  diagnosis_codes?: string[];
  symptoms?: string[];
  care_type?: 'DX' | 'TX' | 'DX/TX';
  pricing_model?: 'subscription' | 'one-time';
  max_price?: number;
  contracted_only?: boolean;
  location?: string;
}

/** Filters for settlement requests */
export interface SettlementFilters {
  case_id?: string;
  status?: SettlementRequestStatus | SettlementRequestStatus[];
  requested_by_org_id?: string;
  date_from?: string;
  date_to?: string;
}

/** Filters for escalation queue */
export interface EscalationFilters {
  status?: EscalationStatus | EscalationStatus[];
  escalation_type?: EscalationType;
  priority?: Priority;
  assigned_to_user_id?: string;
}

// ============================================
// STATISTICS / DASHBOARD TYPES
// ============================================

/** Settlement statistics for dashboard */
export interface SettlementStats {
  total_requests: number;
  pending_count: number;
  approved_count: number;
  disputed_count: number;
  total_original_amount: number;
  total_reduction_amount: number;
  average_reduction_percentage: number;
}

/** Escalation statistics */
export interface EscalationStats {
  total_escalations: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  average_resolution_time_days: number;
}

/** Law firm dashboard stats */
export interface LawFirmDashboardStats {
  active_cases: number;
  pending_settlements: number;
  total_billed: number;
  total_collected: number;
  pending_care_requests: number;
  contracted_clinics: number;
}

// ============================================
// HELPER / UTILITY TYPES
// ============================================

/** Status badge configuration */
export interface StatusBadgeConfig {
  label: string;
  color: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple';
  icon?: string;
}

/** Get status badge config for case status */
export function getCaseStatusBadge(status: CaseStatus): StatusBadgeConfig {
  const configs: Record<CaseStatus, StatusBadgeConfig> = {
    treating: { label: 'Treating', color: 'green', icon: '🏥' },
    not_treating: { label: 'Not Treating', color: 'gray', icon: '⏸️' },
    released: { label: 'Released', color: 'blue', icon: '✓' },
    pending_settlement: { label: 'Pending Settlement', color: 'amber', icon: '💰' },
    complete: { label: 'Complete', color: 'purple', icon: '✅' }
  };
  return configs[status];
}

/** Get status badge config for care model stage */
export function getCareModelStageBadge(stage: CareModelStage): StatusBadgeConfig {
  const configs: Record<CareModelStage, StatusBadgeConfig> = {
    created: { label: 'Created', color: 'gray', icon: '📝' },
    awaiting_approval: { label: 'Awaiting Approval', color: 'amber', icon: '⏳' },
    awaiting_signature: { label: 'Awaiting Signature', color: 'blue', icon: '✍️' },
    completed_billed: { label: 'Billed', color: 'green', icon: '💵' }
  };
  return configs[stage];
}

/** Get status badge config for settlement status */
export function getSettlementStatusBadge(status: SettlementRequestStatus): StatusBadgeConfig {
  const configs: Record<SettlementRequestStatus, StatusBadgeConfig> = {
    pending: { label: 'Pending', color: 'amber', icon: '⏳' },
    approved: { label: 'Approved', color: 'green', icon: '✓' },
    denied: { label: 'Denied', color: 'red', icon: '✕' },
    disputed: { label: 'Disputed', color: 'red', icon: '⚠️' },
    escalated: { label: 'Escalated', color: 'purple', icon: '📤' },
    confirmed: { label: 'Confirmed', color: 'blue', icon: '✓✓' },
    paid: { label: 'Paid', color: 'green', icon: '💵' }
  };
  return configs[status];
}

/** Get status badge config for escalation status */
export function getEscalationStatusBadge(status: EscalationStatus): StatusBadgeConfig {
  const configs: Record<EscalationStatus, StatusBadgeConfig> = {
    open: { label: 'Open', color: 'red', icon: '🔴' },
    in_progress: { label: 'In Progress', color: 'amber', icon: '🔄' },
    resolved: { label: 'Resolved', color: 'green', icon: '✓' },
    closed: { label: 'Closed', color: 'gray', icon: '📁' }
  };
  return configs[status];
}

/** Format currency for display */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/** Calculate reduction percentage */
export function calculateReductionPercentage(original: number, reduction: number): number {
  if (original <= 0) return 0;
  return Math.round((reduction / original) * 100 * 100) / 100;
}
