-- Multi-Party Care Coordination System Migration
-- This migration adds support for law firm integration, settlement workflows,
-- and "symphony of care" coordination between multiple organizations.

-- ============================================
-- PART 1: NEW TABLES
-- ============================================

-- Organization Partnerships (contracts between clinics/law firms)
CREATE TABLE IF NOT EXISTS organization_partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_a_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_b_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  partnership_type TEXT NOT NULL DEFAULT 'standard' CHECK (partnership_type IN ('standard', 'law_firm', 'referral', 'specialist')),
  contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_expiry DATE,
  contract_terms JSONB DEFAULT '{}',
  data_authority JSONB DEFAULT '{}', -- defines who owns what data
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_a_id, organization_b_id)
);

-- Case Participants (multi-party case access)
CREATE TABLE IF NOT EXISTS case_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  participant_role TEXT NOT NULL CHECK (participant_role IN (
    'primary_provider',
    'secondary_provider',
    'referral_source',
    'billing_contact',
    'law_firm',
    'care_coordinator'
  )),
  access_level TEXT NOT NULL DEFAULT 'read_only' CHECK (access_level IN ('read_only', 'read_write', 'admin')),
  can_request_settlement BOOLEAN DEFAULT FALSE,
  can_approve_settlement BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(case_id, user_id),
  UNIQUE(case_id, organization_id, participant_role)
);

-- Settlement Requests (reduction requests from law firms or other parties)
CREATE TABLE IF NOT EXISTS settlement_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES encounters(id),
  requested_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  requested_by_org_id UUID REFERENCES organizations(id),
  original_amount DECIMAL(12,2) NOT NULL,
  requested_reduction DECIMAL(12,2) NOT NULL,
  reduction_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN original_amount > 0
    THEN ROUND((requested_reduction / original_amount) * 100, 2)
    ELSE 0 END
  ) STORED,
  final_amount DECIMAL(12,2),
  reduction_reason TEXT NOT NULL,
  reduction_category TEXT CHECK (reduction_category IN (
    'standard_reduction',
    'hardship',
    'insurance_adjustment',
    'negotiated_settlement',
    'write_off',
    'other'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'denied',
    'disputed',
    'escalated',
    'confirmed',
    'paid'
  )),
  attachment_urls TEXT[],
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_by_user_id UUID REFERENCES auth.users(id),
  response_notes TEXT,
  override_reason TEXT,
  override_by_user_id UUID REFERENCES auth.users(id),
  override_attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement Confirmations (dual-party confirmation)
CREATE TABLE IF NOT EXISTS settlement_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_request_id UUID NOT NULL REFERENCES settlement_requests(id) ON DELETE CASCADE,
  confirming_user_id UUID NOT NULL REFERENCES auth.users(id),
  confirming_org_id UUID REFERENCES organizations(id),
  confirmed_amount DECIMAL(12,2) NOT NULL,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_amount DECIMAL(12,2),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'other')),
  payment_reference TEXT,
  confirmation_notes TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(settlement_request_id, confirming_org_id)
);

-- Escalation Queue (disputed reductions)
CREATE TABLE IF NOT EXISTS escalation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_request_id UUID NOT NULL REFERENCES settlement_requests(id) ON DELETE CASCADE,
  escalated_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  escalation_reason TEXT NOT NULL,
  escalation_type TEXT NOT NULL CHECK (escalation_type IN (
    'disputed_reduction',
    'approval_timeout',
    'payment_discrepancy',
    'documentation_issue',
    'contract_dispute'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution TEXT,
  resolution_type TEXT CHECK (resolution_type IN (
    'approved_as_requested',
    'approved_modified',
    'denied',
    'withdrawn',
    'settled_externally'
  )),
  resolved_by_user_id UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Model Relationships (symphony of care linking)
CREATE TABLE IF NOT EXISTS care_model_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  related_care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'complimentary',  -- Can be done together
    'sequential',     -- One should follow the other
    'parallel',       -- Can run at the same time
    'prerequisite',   -- Must be completed first
    'alternative'     -- Either/or option
  )),
  auto_suggested BOOLEAN DEFAULT FALSE,
  manually_linked BOOLEAN DEFAULT FALSE,
  linked_by_user_id UUID REFERENCES auth.users(id),
  link_reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(primary_care_plan_id, related_care_plan_id)
);

-- Care Request Log (law firm care requests)
CREATE TABLE IF NOT EXISTS care_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requesting_org_id UUID NOT NULL REFERENCES organizations(id),
  requesting_user_id UUID NOT NULL REFERENCES auth.users(id),
  care_plan_id UUID NOT NULL REFERENCES care_plans(id),
  patient_id UUID REFERENCES patients(id),
  case_id UUID REFERENCES cases(id),
  request_message TEXT,
  diagnosis_codes TEXT[],
  symptoms TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  sent_to_emails TEXT[],
  responded_by_user_id UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 2: SCHEMA MODIFICATIONS
-- ============================================

-- Update user_profiles role constraint to include law_firm
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('super_admin', 'org_admin', 'admin', 'provider', 'staff', 'user', 'law_firm'));

-- Add is_approved column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_approved')
  THEN
    ALTER TABLE user_profiles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update cases status constraint with new values
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN (
    'treating',
    'not_treating',
    'released',
    'pending_settlement',
    'complete',
    -- Keep old values for backward compatibility during migration
    'pending', 'active', 'completed', 'cancelled', 'on_hold'
  ));

-- Add new columns to cases
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'care_model_stage')
  THEN
    ALTER TABLE cases ADD COLUMN care_model_stage TEXT DEFAULT 'created'
      CHECK (care_model_stage IN ('created', 'awaiting_approval', 'awaiting_signature', 'completed_billed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'primary_organization_id')
  THEN
    ALTER TABLE cases ADD COLUMN primary_organization_id UUID REFERENCES organizations(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'settlement_status')
  THEN
    ALTER TABLE cases ADD COLUMN settlement_status TEXT DEFAULT 'not_applicable'
      CHECK (settlement_status IN ('not_applicable', 'pending', 'in_review', 'approved', 'disputed', 'complete'));
  END IF;
END $$;

-- Add billing columns to encounters
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encounters' AND column_name = 'care_model_id')
  THEN
    ALTER TABLE encounters ADD COLUMN care_model_id UUID REFERENCES care_plans(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encounters' AND column_name = 'bill_amount')
  THEN
    ALTER TABLE encounters ADD COLUMN bill_amount DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encounters' AND column_name = 'reduction_applied')
  THEN
    ALTER TABLE encounters ADD COLUMN reduction_applied DECIMAL(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encounters' AND column_name = 'final_amount')
  THEN
    ALTER TABLE encounters ADD COLUMN final_amount DECIMAL(12,2);
  END IF;
END $$;

-- ============================================
-- PART 3: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_partnerships_orgs ON organization_partnerships(organization_a_id, organization_b_id);
CREATE INDEX IF NOT EXISTS idx_org_partnerships_active ON organization_partnerships(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_case_participants_case ON case_participants(case_id);
CREATE INDEX IF NOT EXISTS idx_case_participants_user ON case_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_case_participants_org ON case_participants(organization_id);

CREATE INDEX IF NOT EXISTS idx_settlement_requests_case ON settlement_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_settlement_requests_status ON settlement_requests(status);
CREATE INDEX IF NOT EXISTS idx_settlement_requests_org ON settlement_requests(requested_by_org_id);

CREATE INDEX IF NOT EXISTS idx_settlement_confirmations_request ON settlement_confirmations(settlement_request_id);

CREATE INDEX IF NOT EXISTS idx_escalation_queue_status ON escalation_queue(status);
CREATE INDEX IF NOT EXISTS idx_escalation_queue_assigned ON escalation_queue(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_queue_priority ON escalation_queue(priority, status);

CREATE INDEX IF NOT EXISTS idx_care_model_relationships_primary ON care_model_relationships(primary_care_plan_id);
CREATE INDEX IF NOT EXISTS idx_care_model_relationships_related ON care_model_relationships(related_care_plan_id);

CREATE INDEX IF NOT EXISTS idx_care_requests_org ON care_requests(requesting_org_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_status ON care_requests(status);

-- ============================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE organization_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_model_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_requests ENABLE ROW LEVEL SECURITY;

-- Organization Partnerships Policies
CREATE POLICY "Users can view partnerships their org is part of"
  ON organization_partnerships FOR SELECT
  TO authenticated
  USING (
    organization_a_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR organization_b_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Admins can manage partnerships"
  ON organization_partnerships FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin')
  );

-- Case Participants Policies
CREATE POLICY "Case participants can view their participation"
  ON case_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Case admins can manage participants"
  ON case_participants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_participants cp
      WHERE cp.case_id = case_participants.case_id
      AND cp.user_id = auth.uid()
      AND cp.access_level = 'admin'
    )
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin')
  );

-- Settlement Requests Policies
CREATE POLICY "Participants can view settlement requests for their cases"
  ON settlement_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_participants cp
      WHERE cp.case_id = settlement_requests.case_id
      AND (cp.user_id = auth.uid() OR cp.organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
    )
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Authorized users can create settlement requests"
  ON settlement_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM case_participants cp
      WHERE cp.case_id = settlement_requests.case_id
      AND cp.user_id = auth.uid()
      AND cp.can_request_settlement = TRUE
    )
  );

CREATE POLICY "Authorized users can update settlement requests"
  ON settlement_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_participants cp
      WHERE cp.case_id = settlement_requests.case_id
      AND cp.user_id = auth.uid()
      AND cp.can_approve_settlement = TRUE
    )
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Settlement Confirmations Policies
CREATE POLICY "Participants can view confirmations for their settlements"
  ON settlement_confirmations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM settlement_requests sr
      JOIN case_participants cp ON cp.case_id = sr.case_id
      WHERE sr.id = settlement_confirmations.settlement_request_id
      AND (cp.user_id = auth.uid() OR cp.organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Participants can confirm settlements"
  ON settlement_confirmations FOR INSERT
  TO authenticated
  WITH CHECK (
    confirming_user_id = auth.uid()
  );

-- Escalation Queue Policies
CREATE POLICY "Admins and assigned users can view escalations"
  ON escalation_queue FOR SELECT
  TO authenticated
  USING (
    assigned_to_user_id = auth.uid()
    OR escalated_by_user_id = auth.uid()
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin')
  );

CREATE POLICY "Admins can manage escalations"
  ON escalation_queue FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin')
    OR assigned_to_user_id = auth.uid()
  );

-- Care Model Relationships Policies
CREATE POLICY "All authenticated users can view care model relationships"
  ON care_model_relationships FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage care model relationships"
  ON care_model_relationships FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin', 'provider')
  );

-- Care Requests Policies
CREATE POLICY "Users can view care requests they're involved in"
  ON care_requests FOR SELECT
  TO authenticated
  USING (
    requesting_user_id = auth.uid()
    OR requesting_org_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Law firms can create care requests"
  ON care_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requesting_user_id = auth.uid()
  );

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_partnerships_updated_at
  BEFORE UPDATE ON organization_partnerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlement_requests_updated_at
  BEFORE UPDATE ON settlement_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalation_queue_updated_at
  BEFORE UPDATE ON escalation_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_requests_updated_at
  BEFORE UPDATE ON care_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create case participant when case is created
CREATE OR REPLACE FUNCTION auto_add_case_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO case_participants (
    case_id,
    user_id,
    organization_id,
    participant_role,
    access_level,
    can_request_settlement,
    can_approve_settlement,
    added_by
  )
  SELECT
    NEW.id,
    NEW.created_by,
    (SELECT organization_id FROM user_profiles WHERE id = NEW.created_by),
    'primary_provider',
    'admin',
    TRUE,
    TRUE,
    NEW.created_by
  WHERE NOT EXISTS (
    SELECT 1 FROM case_participants WHERE case_id = NEW.id AND user_id = NEW.created_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_case_participant
  AFTER INSERT ON cases
  FOR EACH ROW EXECUTE FUNCTION auto_add_case_creator_as_participant();

-- Update case settlement_status when settlement is confirmed
CREATE OR REPLACE FUNCTION update_case_settlement_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all parties have confirmed
  IF (
    SELECT COUNT(DISTINCT confirming_org_id) >= 2
    FROM settlement_confirmations
    WHERE settlement_request_id = NEW.settlement_request_id
  ) THEN
    UPDATE settlement_requests
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = NEW.settlement_request_id;

    UPDATE cases
    SET settlement_status = 'approved'
    WHERE id = (SELECT case_id FROM settlement_requests WHERE id = NEW.settlement_request_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_settlement_confirmation
  AFTER INSERT ON settlement_confirmations
  FOR EACH ROW EXECUTE FUNCTION update_case_settlement_status();

-- ============================================
-- PART 6: HELPER FUNCTIONS
-- ============================================

-- Function to check if user has access to a case
CREATE OR REPLACE FUNCTION user_has_case_access(p_user_id UUID, p_case_id UUID, p_required_level TEXT DEFAULT 'read_only')
RETURNS BOOLEAN AS $$
DECLARE
  v_access_level TEXT;
  v_user_role TEXT;
BEGIN
  -- Super admins always have access
  SELECT role INTO v_user_role FROM user_profiles WHERE id = p_user_id;
  IF v_user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Check case_participants table
  SELECT access_level INTO v_access_level
  FROM case_participants
  WHERE case_id = p_case_id
  AND (user_id = p_user_id OR organization_id = (SELECT organization_id FROM user_profiles WHERE id = p_user_id));

  IF v_access_level IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check access level hierarchy
  IF p_required_level = 'read_only' THEN
    RETURN TRUE;
  ELSIF p_required_level = 'read_write' THEN
    RETURN v_access_level IN ('read_write', 'admin');
  ELSIF p_required_level = 'admin' THEN
    RETURN v_access_level = 'admin';
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related care models by diagnosis codes
CREATE OR REPLACE FUNCTION get_related_care_models(p_diagnosis_codes TEXT[])
RETURNS TABLE (
  care_plan_id UUID,
  care_plan_name TEXT,
  match_score INT,
  matching_codes TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    COUNT(dc.code)::INT as match_score,
    ARRAY_AGG(dc.code) as matching_codes
  FROM care_plans cp
  JOIN diagnosis_codes dc ON dc.care_plan_id = cp.id
  WHERE dc.code = ANY(p_diagnosis_codes)
  AND cp.is_active = TRUE
  GROUP BY cp.id, cp.name
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;
