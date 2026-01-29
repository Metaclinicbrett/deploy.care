-- Deploy.Care Foundation Schema
-- Professional healthcare case management database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ============================================
-- ORGANIZATIONS & USERS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('healthcare', 'law_firm', 'insurance', 'provider_network')),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'care_coordinator', 'case_manager', 'attorney', 'provider', 'billing', 'viewer')),
  phone TEXT,
  title TEXT,
  permissions JSONB DEFAULT '[]',
  last_active_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS (FHIR-aligned)
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- FHIR identifiers
  mrn TEXT, -- Medical Record Number
  external_ids JSONB DEFAULT '[]', -- [{system, value}]

  -- Demographics
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),

  -- Contact
  email TEXT,
  phone TEXT,
  phone_secondary TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,

  -- Medical
  primary_diagnosis_icd10 TEXT,
  diagnoses JSONB DEFAULT '[]', -- [{code, display, system}]
  allergies JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased', 'unknown')),

  -- Metadata
  tags JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_name ON patients USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_patients_mrn ON patients(mrn);

-- ============================================
-- CASES / ENCOUNTERS
-- ============================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,

  -- Case identification
  case_number TEXT NOT NULL,
  external_case_id TEXT,

  -- Type & Status (FHIR Encounter-aligned)
  case_type TEXT NOT NULL CHECK (case_type IN ('personal_injury', 'workers_comp', 'medical_malpractice', 'auto_accident', 'slip_and_fall', 'other')),
  status TEXT DEFAULT 'active' CHECK (status IN ('planned', 'in-progress', 'on-hold', 'completed', 'cancelled', 'entered-in-error')),
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'asap', 'routine')),

  -- Dates
  incident_date DATE,
  intake_date DATE DEFAULT CURRENT_DATE,
  target_resolution_date DATE,
  closed_date DATE,

  -- Details
  description TEXT,
  incident_location TEXT,
  injury_description TEXT,

  -- Financials
  estimated_settlement DECIMAL(12,2),
  actual_settlement DECIMAL(12,2),
  medical_expenses DECIMAL(12,2) DEFAULT 0,
  legal_fees DECIMAL(12,2) DEFAULT 0,

  -- Assignments
  assigned_to UUID REFERENCES user_profiles(id),
  law_firm_id UUID REFERENCES organizations(id),
  attorney_id UUID REFERENCES user_profiles(id),

  -- Metadata
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_cases_org ON cases(organization_id);
CREATE INDEX idx_cases_patient ON cases(patient_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_assigned ON cases(assigned_to);
CREATE UNIQUE INDEX idx_cases_number ON cases(organization_id, case_number);

-- ============================================
-- CARE TEAM
-- ============================================

CREATE TABLE care_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Member can be internal user or external
  user_id UUID REFERENCES user_profiles(id),

  -- External member info (if not a user)
  external_name TEXT,
  external_email TEXT,
  external_phone TEXT,
  external_organization TEXT,

  -- Role on this case
  role TEXT NOT NULL CHECK (role IN ('lead', 'case_manager', 'care_coordinator', 'attorney', 'paralegal', 'provider', 'specialist', 'billing', 'observer')),
  specialty TEXT,

  -- Permissions for this case
  can_edit BOOLEAN DEFAULT FALSE,
  can_message BOOLEAN DEFAULT TRUE,
  can_view_financials BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_team_case ON care_team_members(case_id);
CREATE INDEX idx_care_team_user ON care_team_members(user_id);

-- ============================================
-- ASSESSMENTS (FHIR QuestionnaireResponse-aligned)
-- ============================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  case_id UUID REFERENCES cases(id),

  -- Assessment type
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('phq9', 'gad7', 'rivermead_pcs', 'oswestry', 'sf36', 'custom')),
  questionnaire_id TEXT, -- FHIR Questionnaire reference

  -- Status
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'amended', 'stopped')),

  -- Timing
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  responses JSONB NOT NULL DEFAULT '[]', -- Array of {linkId, answer, score}
  total_score INTEGER,
  severity TEXT, -- Interpretation

  -- Clinical notes
  clinician_notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,

  -- Administered by
  administered_by UUID REFERENCES user_profiles(id),
  administration_method TEXT CHECK (administration_method IN ('self', 'clinician', 'phone', 'video')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_patient ON assessments(patient_id);
CREATE INDEX idx_assessments_case ON assessments(case_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);

-- ============================================
-- TASKS & ACTIVITIES
-- ============================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  case_id UUID REFERENCES cases(id),
  patient_id UUID REFERENCES patients(id),

  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('follow_up', 'document_request', 'review', 'call', 'meeting', 'assessment', 'filing', 'other')),

  -- Status & Priority
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_by UUID REFERENCES user_profiles(id),

  -- Dates
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,

  -- Metadata
  tags JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_case ON tasks(case_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);

-- Activity log (audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- What happened
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', 'exported', etc.
  entity_type TEXT NOT NULL, -- 'patient', 'case', 'assessment', etc.
  entity_id UUID NOT NULL,

  -- Who did it
  user_id UUID REFERENCES user_profiles(id),
  user_name TEXT,

  -- Details
  changes JSONB, -- {field: {old, new}}
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_log(organization_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_time ON activity_log(created_at DESC);

-- ============================================
-- MESSAGING
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  case_id UUID REFERENCES cases(id),

  title TEXT,
  type TEXT DEFAULT 'case' CHECK (type IN ('case', 'direct', 'group', 'announcement')),

  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) NOT NULL,

  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  muted BOOLEAN DEFAULT FALSE,

  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES user_profiles(id),

  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),

  attachments JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]', -- [{user_id, name}]

  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants ON conversation_participants(user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  case_id UUID REFERENCES cases(id),
  patient_id UUID REFERENCES patients(id),

  -- File info
  name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,

  -- Classification
  document_type TEXT CHECK (document_type IN ('medical_record', 'legal', 'insurance', 'correspondence', 'billing', 'image', 'report', 'other')),
  category TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

  -- Metadata
  description TEXT,
  tags JSONB DEFAULT '[]',
  ocr_text TEXT, -- Extracted text for search

  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_search ON documents USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(ocr_text, '')));

-- ============================================
-- SETTLEMENTS & FINANCIALS
-- ============================================

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  case_id UUID REFERENCES cases(id) NOT NULL,

  -- Settlement details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'proposed', 'negotiating', 'accepted', 'rejected', 'finalized', 'paid')),

  -- Amounts
  initial_demand DECIMAL(12,2),
  counter_offer DECIMAL(12,2),
  final_amount DECIMAL(12,2),

  -- Breakdown
  medical_expenses DECIMAL(12,2) DEFAULT 0,
  lost_wages DECIMAL(12,2) DEFAULT 0,
  pain_suffering DECIMAL(12,2) DEFAULT 0,
  legal_fees DECIMAL(12,2) DEFAULT 0,
  other_expenses DECIMAL(12,2) DEFAULT 0,

  -- Dates
  proposed_date DATE,
  accepted_date DATE,
  payment_date DATE,

  -- Parties
  proposed_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),

  -- Notes
  notes TEXT,
  terms JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlements_case ON settlements(case_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- ============================================
-- CLINICAL TRIALS (saved/matched)
-- ============================================

CREATE TABLE saved_clinical_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  patient_id UUID REFERENCES patients(id),

  -- Trial info from ClinicalTrials.gov
  nct_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT,
  phase TEXT,
  conditions JSONB DEFAULT '[]',
  interventions JSONB DEFAULT '[]',
  locations JSONB DEFAULT '[]',

  -- Match info
  match_score DECIMAL(5,2),
  match_reasons JSONB DEFAULT '[]',

  -- Status
  interest_status TEXT DEFAULT 'saved' CHECK (interest_status IN ('saved', 'contacted', 'enrolled', 'not_eligible', 'declined')),

  -- Notes
  notes TEXT,

  saved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trials_patient ON saved_clinical_trials(patient_id);
CREATE INDEX idx_trials_nct ON saved_clinical_trials(nct_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_clinical_trials ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users see their organization's data)
CREATE POLICY "Users see own org" ON organizations
  FOR ALL USING (id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see own profile" ON user_profiles
  FOR ALL USING (id = auth.uid() OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org patients" ON patients
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org cases" ON cases
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see case team" ON care_team_members
  FOR ALL USING (case_id IN (SELECT id FROM cases WHERE organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid())));

CREATE POLICY "Users see org assessments" ON assessments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org tasks" ON tasks
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org activity" ON activity_log
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org conversations" ON conversations
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see own conversations" ON conversation_participants
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users see conversation messages" ON messages
  FOR ALL USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users see org documents" ON documents
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org settlements" ON settlements
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users see org trials" ON saved_clinical_trials
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  next_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM cases
  WHERE organization_id = NEW.organization_id
  AND case_number LIKE year_prefix || '-%';

  NEW.case_number := year_prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_case_number_trigger
  BEFORE INSERT ON cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL)
  EXECUTE FUNCTION generate_case_number();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
