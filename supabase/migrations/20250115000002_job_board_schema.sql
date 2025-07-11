-- Job Board Schema Migration
-- This migration creates the job board table for storing job postings

-- Create job board table
CREATE TABLE IF NOT EXISTS hirebuddy_job_board (
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
  probably_remote BOOLEAN DEFAULT false
);

-- Enable RLS (Row Level Security)
ALTER TABLE hirebuddy_job_board ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (jobs should be publicly viewable)
-- But restrict write access to authenticated users only
CREATE POLICY "Anyone can view jobs" ON hirebuddy_job_board
  FOR SELECT USING (true);

-- Only authenticated users can create jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can create jobs" ON hirebuddy_job_board
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can update jobs" ON hirebuddy_job_board
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete jobs (you might want to restrict this further)
CREATE POLICY "Authenticated users can delete jobs" ON hirebuddy_job_board
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_board_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_hirebuddy_job_board_updated_at ON hirebuddy_job_board;
CREATE TRIGGER update_hirebuddy_job_board_updated_at
    BEFORE UPDATE ON hirebuddy_job_board
    FOR EACH ROW
    EXECUTE FUNCTION update_job_board_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_board_created_at ON hirebuddy_job_board(created_at);
CREATE INDEX IF NOT EXISTS idx_job_board_company_name ON hirebuddy_job_board(company_name);
CREATE INDEX IF NOT EXISTS idx_job_board_location ON hirebuddy_job_board(job_location);
CREATE INDEX IF NOT EXISTS idx_job_board_remote_flag ON hirebuddy_job_board(remote_flag);
CREATE INDEX IF NOT EXISTS idx_job_board_experience ON hirebuddy_job_board(experience_required);

-- Create a text search index for job titles and descriptions
CREATE INDEX IF NOT EXISTS idx_job_board_text_search ON hirebuddy_job_board 
  USING gin(to_tsvector('english', coalesce(job_title, '') || ' ' || coalesce(job_description, '') || ' ' || coalesce(company_name, '')));

-- Success message
SELECT 'Job board schema created successfully!' as message; 