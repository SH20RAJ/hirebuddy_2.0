-- Admin Fix: Update RLS Policies for Job Applications
-- Run this script in your Supabase SQL Editor to allow ONLY admins to view all job applications
-- Regular users will have NO access to view applications through the admin interface

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can update all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can view applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update applications" ON hirebuddy_job_applications;

-- Create new policies that ONLY allow admin access for viewing applications
-- ADMINS ONLY: Can view ALL applications from ALL users
CREATE POLICY "Admin can view all applications" ON hirebuddy_job_applications
  FOR SELECT USING (
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Users can still create their own applications (for job application functionality)
CREATE POLICY "Users can create own applications" ON hirebuddy_job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ADMINS ONLY: Can update ANY application
CREATE POLICY "Admin can update all applications" ON hirebuddy_job_applications
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com')
  );

-- Create an admin function to get all applications (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_job_applications_admin(
  status_filter TEXT DEFAULT NULL,
  company_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  user_email TEXT,
  job_id UUID,
  job_title TEXT,
  company_name TEXT,
  job_type TEXT,
  full_name TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  phone TEXT,
  bio TEXT,
  website TEXT,
  github TEXT,
  linkedin TEXT,
  college TEXT,
  skills TEXT[],
  experience_years INTEGER,
  available_for_work BOOLEAN,
  resume_url TEXT,
  resume_filename TEXT,
  status TEXT,
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin - STRICT ADMIN ONLY ACCESS
  IF (auth.jwt() ->> 'email') NOT IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required. Only administrators can view job applications.';
  END IF;

  -- Return ALL applications from ALL users (admin view)
  RETURN QUERY
  SELECT 
    app.id,
    app.created_at,
    app.updated_at,
    app.user_id,
    app.user_email,
    app.job_id,
    app.job_title,
    app.company_name,
    app.job_type,
    app.full_name,
    app.title,
    app.company,
    app.location,
    app.phone,
    app.bio,
    app.website,
    app.github,
    app.linkedin,
    app.college,
    app.skills,
    app.experience_years,
    app.available_for_work,
    app.resume_url,
    app.resume_filename,
    app.status,
    app.admin_notes,
    app.reviewed_at,
    app.reviewed_by
  FROM hirebuddy_job_applications app
  WHERE 
    (status_filter IS NULL OR app.status = status_filter) AND
    (company_filter IS NULL OR app.company_name ILIKE '%' || company_filter || '%')
  ORDER BY app.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users (but function has internal admin check)
GRANT EXECUTE ON FUNCTION get_all_job_applications_admin TO authenticated;

-- Create admin function to get application statistics (admin only)
CREATE OR REPLACE FUNCTION get_application_stats_admin()
RETURNS TABLE (
  total BIGINT,
  pending BIGINT,
  reviewed BIGINT,
  shortlisted BIGINT,
  rejected BIGINT,
  hired BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin
  IF (auth.jwt() ->> 'email') NOT IN ('subhayudas49@gmail.com', 'sharmanishant9119@gmail.com') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return statistics for ALL applications
  RETURN QUERY
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
    COUNT(*) FILTER (WHERE status = 'shortlisted') as shortlisted,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'hired') as hired
  FROM hirebuddy_job_applications;
END;
$$;

-- Grant execute permission to authenticated users (but function has internal admin check)
GRANT EXECUTE ON FUNCTION get_application_stats_admin TO authenticated;

-- Success message
SELECT 'Admin-only RLS policies and functions created successfully!' as message;

-- Test queries (uncomment to test - these will only work for admin users)
-- SELECT * FROM get_all_job_applications_admin() LIMIT 5;
-- SELECT * FROM get_application_stats_admin(); 