-- Job Applications Schema Migration
-- This migration creates the job applications table for storing user applications to exclusive jobs

-- Create job applications table
CREATE TABLE IF NOT EXISTS hirebuddy_job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- User information
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  
  -- Job information
  job_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_type TEXT DEFAULT 'exclusive', -- 'exclusive', 'regular'
  
  -- User profile data at time of application
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
  skills TEXT[], -- Array of skills
  experience_years INTEGER DEFAULT 0,
  available_for_work BOOLEAN DEFAULT false,
  
  -- Resume information
  resume_url TEXT,
  resume_filename TEXT,
  
  -- Application status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE hirebuddy_job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON hirebuddy_job_applications;
DROP POLICY IF EXISTS "Admin can update all applications" ON hirebuddy_job_applications;

-- Create policies
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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_hirebuddy_job_applications_updated_at ON hirebuddy_job_applications;
CREATE TRIGGER update_hirebuddy_job_applications_updated_at
    BEFORE UPDATE ON hirebuddy_job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_applications_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON hirebuddy_job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON hirebuddy_job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON hirebuddy_job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON hirebuddy_job_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_company ON hirebuddy_job_applications(company_name);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_type ON hirebuddy_job_applications(job_type);

-- Create a composite index for job applications by job
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON hirebuddy_job_applications(job_id, status);

-- Create a text search index for applicant information
CREATE INDEX IF NOT EXISTS idx_job_applications_text_search ON hirebuddy_job_applications 
  USING gin(to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(user_email, '') || ' ' || coalesce(title, '') || ' ' || coalesce(company, '')));

-- Success message
SELECT 'Job applications schema created successfully!' as message; 