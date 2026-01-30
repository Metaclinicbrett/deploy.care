-- ============================================
-- Provider Fields Migration
-- Add NPI and CLIA to user_profiles for medical providers
-- ============================================

-- Add provider-specific fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS npi_number TEXT,
ADD COLUMN IF NOT EXISTS clia_number TEXT,
ADD COLUMN IF NOT EXISTS provider_type TEXT,
ADD COLUMN IF NOT EXISTS credentials TEXT[], -- MD, DO, NP, PA, etc.
ADD COLUMN IF NOT EXISTS taxonomy_codes TEXT[]; -- Healthcare provider taxonomy

-- Add constraints
ALTER TABLE user_profiles
ADD CONSTRAINT npi_format CHECK (
  npi_number IS NULL OR npi_number ~ '^\d{10}$'
);

-- NPI must be exactly 10 digits

-- CLIA is typically 10 characters (2 letters + 8 digits)
ALTER TABLE user_profiles
ADD CONSTRAINT clia_format CHECK (
  clia_number IS NULL OR clia_number ~ '^[A-Z0-9]{10}$'
);

-- Update role constraint to include provider types
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check CHECK (
  role IN ('admin', 'provider', 'staff', 'user', 'lab_admin', 'lab_tech', 'billing')
);

-- Create index for NPI lookups (common query)
CREATE INDEX IF NOT EXISTS idx_user_profiles_npi ON user_profiles(npi_number) WHERE npi_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_clia ON user_profiles(clia_number) WHERE clia_number IS NOT NULL;

-- ============================================
-- Provider Specialties Reference Table
-- ============================================
CREATE TABLE IF NOT EXISTS provider_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- Taxonomy code
  name TEXT NOT NULL,
  category TEXT, -- Physician, Nurse, Technician, etc.
  description TEXT
);

-- Seed common specialties
INSERT INTO provider_specialties (code, name, category) VALUES
  ('207L00000X', 'Anesthesiology', 'Physician'),
  ('207R00000X', 'Internal Medicine', 'Physician'),
  ('207RC0000X', 'Cardiovascular Disease', 'Physician'),
  ('207RN0300X', 'Nephrology', 'Physician'),
  ('207Q00000X', 'Family Medicine', 'Physician'),
  ('208D00000X', 'General Practice', 'Physician'),
  ('2084N0400X', 'Neurology', 'Physician'),
  ('2084P0800X', 'Psychiatry', 'Physician'),
  ('207X00000X', 'Orthopaedic Surgery', 'Physician'),
  ('208600000X', 'Surgery', 'Physician'),
  ('363L00000X', 'Nurse Practitioner', 'Nurse'),
  ('363A00000X', 'Physician Assistant', 'Physician Assistant'),
  ('291U00000X', 'Clinical Laboratory', 'Laboratory'),
  ('293D00000X', 'Physiological Laboratory', 'Laboratory')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- RLS for provider_specialties
-- ============================================
ALTER TABLE provider_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider specialties are viewable by all authenticated users"
  ON provider_specialties FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- View for easy provider lookup
-- ============================================
CREATE OR REPLACE VIEW providers AS
SELECT
  up.id,
  up.first_name,
  up.last_name,
  up.first_name || ' ' || up.last_name AS display_name,
  up.role,
  up.npi_number,
  up.clia_number,
  up.provider_type,
  up.credentials,
  up.specialty,
  up.organization_id,
  up.is_active,
  o.name AS organization_name
FROM user_profiles up
LEFT JOIN organizations o ON o.id = up.organization_id
WHERE up.role IN ('provider', 'lab_admin', 'lab_tech')
  AND up.is_active = true;
