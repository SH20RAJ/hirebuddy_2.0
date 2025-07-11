-- Fix Job Applications RLS Policies
-- This script allows ALL authenticated users to apply to jobs and view their own applications
-- while maintaining admin-only access to view ALL applications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can update all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can view applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update applications" ON hirebuddy_job_applications;

-- FIXED POLICIES: Allow users to manage their own applications + admin access

-- 1. Users can view their OWN applications OR admins can view ALL applications
CREATE POLICY "Users can view own applications or admin can view all" ON hirebuddy_job_applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- 2. ALL authenticated users can create applications (this was working before)
CREATE POLICY "Authenticated users can create applications" ON hirebuddy_job_applications
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- 3. Users can update their OWN applications OR admins can update ANY application
CREATE POLICY "Users can update own applications or admin can update all" ON hirebuddy_job_applications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Ensure the table has RLS enabled
ALTER TABLE hirebuddy_job_applications ENABLE ROW LEVEL SECURITY;

-- Ensure the update trigger function exists
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the update trigger exists
DROP TRIGGER IF EXISTS update_hirebuddy_job_applications_updated_at ON hirebuddy_job_applications;
CREATE TRIGGER update_hirebuddy_job_applications_updated_at
    BEFORE UPDATE ON hirebuddy_job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_applications_updated_at();

-- Keep the admin functions for admin dashboard functionality
-- (These were created in the previous admin-fix script and should remain)

-- Success message
SELECT 'Job applications RLS policies fixed! All authenticated users can now apply to jobs.' as message;

-- Test queries to verify the fix works:
-- 1. Regular users should be able to insert their own applications
-- 2. Regular users should be able to view their own applications  
-- 3. Admins should be able to view all applications
-- 4. Users should NOT be able to view other users' applications

SELECT 'Verification: Check that authenticated users can now create and view their own job applications' as verification_note; 