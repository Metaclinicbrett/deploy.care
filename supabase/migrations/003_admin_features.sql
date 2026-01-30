-- Admin Features Migration
-- Adds organization approval workflow

-- Add status field to organizations for approval workflow
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'suspended'));

-- Add slug field if not exists (for URL-friendly names)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- Update existing organizations to approved status
UPDATE organizations SET status = 'approved' WHERE status IS NULL;

-- Create admin policies for super_admin role
-- Super admins can see all organizations
DROP POLICY IF EXISTS "Super admins see all orgs" ON organizations;
CREATE POLICY "Super admins see all orgs" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Super admins can update all organizations
DROP POLICY IF EXISTS "Super admins can update orgs" ON organizations;
CREATE POLICY "Super admins can update orgs" ON organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Super admins can see all user profiles
DROP POLICY IF EXISTS "Super admins see all profiles" ON user_profiles;
CREATE POLICY "Super admins see all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Super admins can update all user profiles
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Super admins can delete user profiles (for rejecting users)
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;
CREATE POLICY "Super admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Function to get organization stats
CREATE OR REPLACE FUNCTION get_organization_stats(org_id UUID)
RETURNS TABLE (
  user_count BIGINT,
  care_plan_count BIGINT,
  case_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = org_id) as user_count,
    (SELECT COUNT(*) FROM care_plans WHERE organization_id = org_id) as care_plan_count,
    (SELECT COUNT(*) FROM cases WHERE organization_id = org_id) as case_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_organizations BIGINT,
  pending_organizations BIGINT,
  total_users BIGINT,
  pending_users BIGINT,
  total_care_plans BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM organizations) as total_organizations,
    (SELECT COUNT(*) FROM organizations WHERE status = 'pending') as pending_organizations,
    (SELECT COUNT(*) FROM user_profiles WHERE is_approved = true) as total_users,
    (SELECT COUNT(*) FROM user_profiles WHERE is_approved = false) as pending_users,
    (SELECT COUNT(*) FROM care_plans) as total_care_plans;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
