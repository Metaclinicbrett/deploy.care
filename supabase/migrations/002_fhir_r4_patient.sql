-- ============================================
-- FHIR R4 Patient Schema Migration
-- https://www.hl7.org/fhir/patient.html
-- ============================================

-- Drop old patients table (if starting fresh) or ALTER for migration
-- For fresh start:
DROP TABLE IF EXISTS patients CASCADE;

-- ============================================
-- FHIR R4 Patient Resource
-- ============================================
CREATE TABLE patients (
  -- Internal ID
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- FHIR: active (whether record is in active use)
  active BOOLEAN DEFAULT TRUE,

  -- FHIR: identifier[] - MRN, SSN, etc.
  -- Stored as JSONB array: [{"system": "mrn", "value": "12345"}, {"system": "ssn", "value": "xxx-xx-xxxx"}]
  identifiers JSONB DEFAULT '[]',

  -- FHIR: name[] - HumanName
  -- [{"use": "official", "family": "Smith", "given": ["John", "Michael"], "prefix": ["Mr."], "suffix": ["Jr."]}]
  names JSONB DEFAULT '[]',

  -- Convenience fields (denormalized from names for querying)
  family_name TEXT,
  given_names TEXT[], -- Array for multiple given names

  -- FHIR: telecom[] - ContactPoint
  -- [{"system": "phone", "value": "555-1234", "use": "home"}, {"system": "email", "value": "john@example.com", "use": "work"}]
  telecom JSONB DEFAULT '[]',

  -- FHIR: gender (male | female | other | unknown)
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),

  -- FHIR: birthDate
  birth_date DATE,

  -- FHIR: deceased[x] - can be boolean or dateTime
  deceased_boolean BOOLEAN DEFAULT FALSE,
  deceased_date_time TIMESTAMPTZ,

  -- FHIR: address[]
  -- [{"use": "home", "type": "physical", "line": ["123 Main St", "Apt 4"], "city": "LA", "state": "CA", "postalCode": "90001", "country": "US"}]
  addresses JSONB DEFAULT '[]',

  -- FHIR: maritalStatus
  marital_status TEXT CHECK (marital_status IN ('A', 'D', 'I', 'L', 'M', 'P', 'S', 'T', 'U', 'W')),
  -- A=Annulled, D=Divorced, I=Interlocutory, L=Legally Separated, M=Married,
  -- P=Polygamous, S=Never Married, T=Domestic Partner, U=Unknown, W=Widowed

  -- FHIR: contact[] - Emergency contacts, next of kin
  -- [{"relationship": [{"coding": [{"code": "C"}]}], "name": {...}, "telecom": [...], "address": {...}}]
  contacts JSONB DEFAULT '[]',

  -- FHIR: communication[] - Language preferences
  -- [{"language": {"coding": [{"system": "urn:ietf:bcp:47", "code": "en"}]}, "preferred": true}]
  communication JSONB DEFAULT '[]',

  -- FHIR: generalPractitioner[] - Reference to Practitioner
  general_practitioner_ids UUID[],

  -- FHIR: managingOrganization - Reference to Organization
  managing_organization_id UUID,

  -- FHIR: link[] - Links to other patient records (for merged records)
  links JSONB DEFAULT '[]',

  -- FHIR: photo[] - We'll store references, actual files in storage
  photo_urls TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- FHIR Meta
  version_id INTEGER DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FHIR R4 Coverage (Insurance) - Separate Resource
-- https://www.hl7.org/fhir/coverage.html
-- ============================================
CREATE TABLE coverages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to patient (beneficiary)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

  -- FHIR: status (active | cancelled | draft | entered-in-error)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'draft', 'entered-in-error')),

  -- FHIR: type - Type of coverage (medical, dental, vision, etc.)
  type TEXT,

  -- FHIR: subscriber - The person who owns the policy
  subscriber_id UUID REFERENCES patients(id),
  subscriber_relationship TEXT, -- self, spouse, child, other

  -- FHIR: payor[] - Insurance company
  payor_name TEXT NOT NULL,
  payor_identifier TEXT, -- Payer ID

  -- Coverage details
  member_id TEXT,
  group_number TEXT,
  plan_name TEXT,

  -- FHIR: period - Coverage period
  period_start DATE,
  period_end DATE,

  -- FHIR: class[] - Plan classification
  -- [{"type": "group", "value": "GRP123"}, {"type": "plan", "value": "GOLD"}]
  classes JSONB DEFAULT '[]',

  -- FHIR: order - Priority of this coverage
  priority INTEGER DEFAULT 1, -- 1 = primary, 2 = secondary, etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_patients_family_name ON patients(family_name);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_patients_identifiers ON patients USING GIN (identifiers);
CREATE INDEX idx_patients_names ON patients USING GIN (names);
CREATE INDEX idx_coverages_patient_id ON coverages(patient_id);
CREATE INDEX idx_coverages_member_id ON coverages(member_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverages ENABLE ROW LEVEL SECURITY;

-- Patients: Users can see patients they created or are assigned to their organization
CREATE POLICY "Users can view patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR managing_organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update patients they have access to"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR managing_organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Coverages follow patient access
CREATE POLICY "Users can view coverages for their patients"
  ON coverages FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create coverages"
  ON coverages FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- Helper Functions
-- ============================================

-- Get patient display name
CREATE OR REPLACE FUNCTION patient_display_name(p patients)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    array_to_string(p.given_names, ' ') || ' ' || p.family_name,
    p.family_name,
    'Unknown'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-populate convenience fields from FHIR names
CREATE OR REPLACE FUNCTION sync_patient_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract first official name
  IF NEW.names IS NOT NULL AND jsonb_array_length(NEW.names) > 0 THEN
    NEW.family_name := NEW.names->0->>'family';
    NEW.given_names := ARRAY(SELECT jsonb_array_elements_text(NEW.names->0->'given'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_patient_names_trigger
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION sync_patient_names();

-- Update timestamps
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coverages_updated_at
  BEFORE UPDATE ON coverages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
