-- Deploy.Care Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CARE PLANS
-- ============================================

CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'Telemedicine',
  description TEXT,
  care_type TEXT NOT NULL CHECK (care_type IN ('DX', 'TX', 'DX/TX')),
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('subscription', 'one-time')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_unit TEXT DEFAULT '',
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10,2),
  lop_required BOOLEAN DEFAULT FALSE,
  documents_required TEXT[] DEFAULT '{}',
  color TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE diagnosis_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cpt_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  insurance_provider TEXT,
  insurance_member_id TEXT,
  insurance_group_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- CASES
-- ============================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  care_plan_id UUID REFERENCES care_plans(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'on_hold')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  primary_diagnosis_code TEXT,
  secondary_diagnosis_codes TEXT[],
  assigned_provider_id UUID REFERENCES auth.users(id),
  referral_source TEXT,
  referral_date DATE,
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_date DATE,
  lop_received BOOLEAN DEFAULT FALSE,
  lop_received_date DATE,
  coverage_verified BOOLEAN DEFAULT FALSE,
  coverage_status TEXT,
  authorization_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- ENCOUNTERS
-- ============================================

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  encounter_type TEXT NOT NULL CHECK (encounter_type IN ('initial', 'follow_up', 'telehealth', 'in_person', 'phone', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  scheduled_date TIMESTAMPTZ,
  actual_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  provider_id UUID REFERENCES auth.users(id),
  location TEXT,
  chief_complaint TEXT,
  subjective_notes TEXT,
  objective_notes TEXT,
  assessment TEXT,
  plan TEXT,
  cpt_codes TEXT[],
  icd_codes TEXT[],
  billing_status TEXT DEFAULT 'pending' CHECK (billing_status IN ('pending', 'submitted', 'paid', 'denied', 'appealed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- USER PROFILES (extends auth.users)
-- ============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'provider', 'staff', 'user')),
  specialty TEXT,
  npi_number TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  organization_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORGANIZATIONS (for multi-tenancy)
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_care_plan_id ON cases(care_plan_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_encounters_case_id ON encounters(case_id);
CREATE INDEX idx_encounters_scheduled_date ON encounters(scheduled_date);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_patient_id ON documents(patient_id);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_diagnosis_codes_care_plan_id ON diagnosis_codes(care_plan_id);
CREATE INDEX idx_cpt_codes_care_plan_id ON cpt_codes(care_plan_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Care Plans: Anyone can read active plans
CREATE POLICY "Care plans are viewable by authenticated users"
  ON care_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Patients: Users can only see patients they created or are assigned to
CREATE POLICY "Users can view their own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Cases: Users can see cases they created or are assigned to
CREATE POLICY "Users can view their own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR assigned_provider_id = auth.uid());

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR assigned_provider_id = auth.uid());

-- Encounters: Users can see encounters for their cases
CREATE POLICY "Users can view encounters for their cases"
  ON encounters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = encounters.case_id
      AND (cases.created_by = auth.uid() OR cases.assigned_provider_id = auth.uid())
    )
  );

CREATE POLICY "Users can create encounters for their cases"
  ON encounters FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Documents: Users can see documents for their cases/patients
CREATE POLICY "Users can view their documents"
  ON documents FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- User profiles: Users can see and update their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Diagnosis codes and CPT codes are readable by authenticated users
CREATE POLICY "Diagnosis codes are viewable by authenticated users"
  ON diagnosis_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CPT codes are viewable by authenticated users"
  ON cpt_codes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'CASE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('case_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL)
  EXECUTE FUNCTION generate_case_number();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_care_plans_updated_at
  BEFORE UPDATE ON care_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_encounters_updated_at
  BEFORE UPDATE ON encounters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA: Sample Care Plans
-- ============================================

INSERT INTO care_plans (name, provider, location, type, description, care_type, pricing_model, price, price_unit, deposit_required, deposit_amount, lop_required, documents_required, color) VALUES
  ('DaylightRx', 'Big Health', NULL, 'Telemedicine', 'SleepioRx1 and DaylightRx2 are FDA-cleared digital treatments for insomnia disorder and generalized anxiety disorder.', 'TX', 'subscription', 49, '/month', FALSE, NULL, FALSE, ARRAY['Patient consent form'], 'amber'),
  ('Report Review', 'Neuroglympse', 'Telemedicine, LA', 'Telemedicine', 'Neuroglympse Care team reviews the patient''s final report to discuss any questions or concerns.', 'DX', 'one-time', 150, '', FALSE, NULL, FALSE, ARRAY['Assessment results', 'Medical history'], 'blue'),
  ('+ New Patient TeleNeurology', 'Neuroglympse', 'Telemedicine, LA', 'Telemedicine', 'Objective mild traumatic brain injury (mTBI) evaluation with comprehensive neurological assessment.', 'DX/TX', 'one-time', 495, '', TRUE, 150, TRUE, ARRAY['ID verification', 'Insurance card', 'Prior medical records', 'Signed LOP'], 'purple'),
  ('Vagus Nerve Stimulation (VNS)', 'Neuroglympse', 'Telemedicine, LA', 'Telemedicine', 'The care plan for Vagus Nerve Stimulation (VNS) in the treatment of Mild Traumatic Brain Injury (mTBI) is focused on reducing symptoms.', 'TX', 'subscription', 299, '/month', TRUE, 500, TRUE, ARRAY['Medical clearance', 'Signed consent', 'Insurance authorization'], 'pink'),
  ('Remote Patient Monitoring - mTBI', 'Neuroglympse', 'Telemedicine', 'Telemedicine', 'A cohesive platform that facilitates effective communication between your healthcare team, ensuring that every aspect of your care is harmonized.', 'TX', 'subscription', 89, '/month', FALSE, NULL, FALSE, ARRAY['Device agreement', 'HIPAA consent'], 'teal');

-- Insert diagnosis codes
INSERT INTO diagnosis_codes (care_plan_id, code, description)
SELECT id, 'F51.01', 'Primary insomnia' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, 'F41.1', 'Generalized anxiety disorder' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, 'G47.00', 'Insomnia, unspecified' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, 'S06.0X0A', 'Concussion without LOC, initial' FROM care_plans WHERE name = 'Report Review'
UNION ALL
SELECT id, 'F07.81', 'Postconcussional syndrome' FROM care_plans WHERE name = 'Report Review'
UNION ALL
SELECT id, 'S06.0X1A', 'Concussion with LOC <30 min' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, 'S06.0X0A', 'Concussion without LOC, initial' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, 'F07.81', 'Postconcussional syndrome' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, 'R51.9', 'Headache, unspecified' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, 'S06.0X1A', 'Concussion with LOC <30 min' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, 'G43.909', 'Migraine, unspecified' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, 'F07.81', 'Postconcussional syndrome' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, 'S06.0X0A', 'Concussion without LOC, initial' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI'
UNION ALL
SELECT id, 'Z87.820', 'Personal history of TBI' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI';

-- Insert CPT codes
INSERT INTO cpt_codes (care_plan_id, code)
SELECT id, '98975' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, '98976' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, '98977' FROM care_plans WHERE name = 'DaylightRx'
UNION ALL
SELECT id, '99213' FROM care_plans WHERE name = 'Report Review'
UNION ALL
SELECT id, '99214' FROM care_plans WHERE name = 'Report Review'
UNION ALL
SELECT id, '99205' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, '99215' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, '96132' FROM care_plans WHERE name = '+ New Patient TeleNeurology'
UNION ALL
SELECT id, '64568' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, '95970' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, '95971' FROM care_plans WHERE name = 'Vagus Nerve Stimulation (VNS)'
UNION ALL
SELECT id, '99453' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI'
UNION ALL
SELECT id, '99454' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI'
UNION ALL
SELECT id, '99457' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI'
UNION ALL
SELECT id, '99458' FROM care_plans WHERE name = 'Remote Patient Monitoring - mTBI';
