-- Exclusive Jobs Schema Migration
-- This migration creates the exclusive jobs table for storing premium job postings

-- Create exclusive jobs table with same structure as hirebuddy_job_board
CREATE TABLE IF NOT EXISTS hirebuddy_exclusive_jobs (
  job_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  job_title TEXT,
  company_name TEXT,
  job_description TEXT,
  experience_required TEXT,
  apply_link TEXT,
  job_location TEXT,
  city TEXT,
  state TEXT,
  remote_flag BOOLEAN DEFAULT false,
  probably_remote BOOLEAN DEFAULT false,
  -- Additional fields for exclusive jobs
  is_featured BOOLEAN DEFAULT true,
  priority_level INTEGER DEFAULT 1, -- 1 = highest priority
  exclusive_until TIMESTAMP WITH TIME ZONE -- when exclusivity expires
);

-- Enable RLS (Row Level Security)
ALTER TABLE hirebuddy_exclusive_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (exclusive jobs should be publicly viewable)
-- But restrict write access to authenticated users only
CREATE POLICY "Anyone can view exclusive jobs" ON hirebuddy_exclusive_jobs
  FOR SELECT USING (true);

-- Only authenticated users can create exclusive jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can create exclusive jobs" ON hirebuddy_exclusive_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update exclusive jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can update exclusive jobs" ON hirebuddy_exclusive_jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete exclusive jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can delete exclusive jobs" ON hirebuddy_exclusive_jobs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exclusive_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_hirebuddy_exclusive_jobs_updated_at ON hirebuddy_exclusive_jobs;
CREATE TRIGGER update_hirebuddy_exclusive_jobs_updated_at
    BEFORE UPDATE ON hirebuddy_exclusive_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_exclusive_jobs_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_created_at ON hirebuddy_exclusive_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_company_name ON hirebuddy_exclusive_jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_location ON hirebuddy_exclusive_jobs(job_location);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_remote_flag ON hirebuddy_exclusive_jobs(remote_flag);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_experience ON hirebuddy_exclusive_jobs(experience_required);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_priority ON hirebuddy_exclusive_jobs(priority_level);
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_featured ON hirebuddy_exclusive_jobs(is_featured);

-- Create a text search index for job titles and descriptions
CREATE INDEX IF NOT EXISTS idx_exclusive_jobs_text_search ON hirebuddy_exclusive_jobs 
  USING gin(to_tsvector('english', coalesce(job_title, '') || ' ' || coalesce(job_description, '') || ' ' || coalesce(company_name, '')));

-- Insert some sample exclusive jobs data
INSERT INTO hirebuddy_exclusive_jobs (
  job_title, company_name, job_description, experience_required, apply_link, 
  job_location, city, state, remote_flag, probably_remote, is_featured, priority_level
) VALUES 
(
  'Senior Full Stack Engineer - Exclusive Opportunity',
  'TechCorp Elite',
  'Join our exclusive team building next-generation AI-powered applications. This is a limited-time exclusive opportunity with exceptional benefits and equity package.',
  'Senior Level (5+ years)',
  'https://example.com/apply/exclusive-1',
  'San Francisco, CA',
  'San Francisco',
  'CA',
  true,
  true,
  true,
  1
),
(
  'Principal Software Architect - Premium Role',
  'Innovation Labs',
  'Lead architectural decisions for our cutting-edge platform. Exclusive position with direct reporting to CTO and significant equity stake.',
  'Principal Level (8+ years)',
  'https://example.com/apply/exclusive-2',
  'New York, NY',
  'New York',
  'NY',
  false,
  false,
  true,
  1
),
(
  'VP of Engineering - Executive Opportunity',
  'StartupX',
  'Shape the future of our engineering organization. This exclusive executive role offers substantial equity and the opportunity to build a world-class team.',
  'Executive Level (10+ years)',
  'https://example.com/apply/exclusive-3',
  'Remote',
  'Remote',
  'Remote',
  true,
  true,
  true,
  1
),
(
  'Lead Frontend Developer - Premium Position',
  'DesignFirst',
  'Lead our frontend engineering efforts with the latest technologies. Exclusive opportunity with flexible work arrangements and top-tier compensation.',
  'Lead Level (6+ years)',
  'https://example.com/apply/exclusive-4',
  'Austin, TX',
  'Austin',
  'TX',
  true,
  true,
  true,
  2
),
(
  'Senior Data Scientist - AI Division',
  'DataCorp',
  'Drive AI innovation in our exclusive data science division. Work with cutting-edge ML technologies and shape product direction.',
  'Senior Level (4+ years)',
  'https://example.com/apply/exclusive-5',
  'Seattle, WA',
  'Seattle',
  'WA',
  true,
  true,
  true,
  2
);

-- Success message
SELECT 'Exclusive jobs schema created successfully!' as message; 