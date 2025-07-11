-- Fix Admin Applications RLS Policies
-- This migration updates the RLS policies to allow admins to view all job applications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can update all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can view applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update applications" ON hirebuddy_job_applications;

-- Create new policies
-- Users can view their own applications OR if they are admin
CREATE POLICY "Users can view applications" ON hirebuddy_job_applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Users can create their own applications
CREATE POLICY "Users can create own applications" ON hirebuddy_job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications OR if they are admin
CREATE POLICY "Users can update applications" ON hirebuddy_job_applications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Success message
SELECT 'Admin applications RLS policies updated successfully!' as message; 