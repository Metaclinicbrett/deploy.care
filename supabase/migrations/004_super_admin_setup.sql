-- Super Admin Setup Migration
-- Run this to set up the first super_admin user

-- Option 1: Update existing user by email to be super_admin
-- Replace 'brett@meta.clinic' with your actual email
UPDATE user_profiles
SET
  role = 'super_admin',
  is_approved = TRUE
WHERE email = 'brett@meta.clinic';

-- If no rows updated, we need to create the profile when the user signs up
-- This modifies the new user trigger to auto-approve super_admin email

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  super_admin_emails TEXT[] := ARRAY['brett@meta.clinic'];
  user_role TEXT := 'user';
  user_approved BOOLEAN := FALSE;
BEGIN
  -- Auto-approve super admin emails
  IF NEW.email = ANY(super_admin_emails) THEN
    user_role := 'super_admin';
    user_approved := TRUE;
  END IF;

  INSERT INTO user_profiles (id, email, first_name, last_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role,
    user_approved
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved
  WHERE user_profiles.role != 'super_admin'; -- Don't downgrade existing super_admins

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a default organization for the super_admin
INSERT INTO organizations (id, name, type, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Deploy.Care Admin',
  'healthcare',
  'enterprise'
)
ON CONFLICT (id) DO NOTHING;

-- Update super_admin to belong to this org
UPDATE user_profiles
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE role = 'super_admin' AND organization_id IS NULL;

-- Grant super_admin policy (can see all orgs for impersonation)
DROP POLICY IF EXISTS "Super admin sees all orgs" ON organizations;
CREATE POLICY "Super admin sees all orgs" ON organizations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

-- Super admin can see all users for admin panel
DROP POLICY IF EXISTS "Super admin sees all users" ON user_profiles;
CREATE POLICY "Super admin sees all users" ON user_profiles
  FOR ALL USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );
