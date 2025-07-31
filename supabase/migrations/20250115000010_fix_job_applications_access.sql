-- Fix Job Applications Access for All Users
-- Migration to allow ALL authenticated users to apply to jobs and view their own applications

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can update all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can view applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update applications" ON hirebuddy_job_applications;

-- Create new policies that allow proper access

-- 1. SELECT: Users can view their OWN applications OR admins can view ALL applications
CREATE POLICY "Users can view own applications or admin can view all" ON hirebuddy_job_applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- 2. INSERT: ALL authenticated users can create applications for themselves
CREATE POLICY "Authenticated users can create applications" ON hirebuddy_job_applications
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- 3. UPDATE: Users can update their OWN applications OR admins can update ANY application
CREATE POLICY "Users can update own applications or admin can update all" ON hirebuddy_job_applications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Success message
SELECT 'Job applications access fixed! All authenticated users can now apply to jobs and view their own applications.' as message; 