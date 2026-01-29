-- Seed data for testing Deploy.Care
-- Run this after 001_foundation.sql

-- Create a demo organization
INSERT INTO organizations (id, name, type, subscription_tier, settings) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Deploy Care Demo', 'healthcare', 'professional', '{"theme": "light", "timezone": "America/Los_Angeles"}'),
  ('00000000-0000-0000-0000-000000000002', 'Smith & Associates Law', 'law_firm', 'professional', '{"theme": "light"}');

-- Note: User profiles will be created automatically when users sign up via the trigger
-- For testing, you can manually insert after creating auth users

-- Sample patients (will be linked to org after user signs up)
-- These use the demo org ID for now

-- You can run these after signing up and updating your user's organization_id:
/*
INSERT INTO patients (organization_id, first_name, last_name, date_of_birth, gender, email, phone, address_line1, city, state, postal_code, primary_diagnosis_icd10, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John', 'Smith', '1985-03-15', 'male', 'john.smith@email.com', '555-0101', '123 Main St', 'Los Angeles', 'CA', '90001', 'S06.0X0A', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Johnson', '1990-07-22', 'female', 'sarah.j@email.com', '555-0102', '456 Oak Ave', 'San Francisco', 'CA', '94102', 'M54.5', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Michael', 'Williams', '1978-11-08', 'male', 'mwilliams@email.com', '555-0103', '789 Pine Rd', 'San Diego', 'CA', '92101', 'S32.000A', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Emily', 'Brown', '1995-01-30', 'female', 'emily.b@email.com', '555-0104', '321 Elm St', 'Sacramento', 'CA', '95814', 'S06.5X0A', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'David', 'Martinez', '1982-09-12', 'male', 'dmartinez@email.com', '555-0105', '654 Cedar Ln', 'Oakland', 'CA', '94601', 'M79.3', 'active');
*/

-- Message templates
INSERT INTO organizations (id, name, type) VALUES
  ('00000000-0000-0000-0000-000000000000', 'System', 'healthcare')
ON CONFLICT DO NOTHING;
