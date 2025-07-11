-- User Experiences Schema Migration
-- This migration creates a table for storing detailed work experience entries

-- Create user_experiences table
CREATE TABLE IF NOT EXISTS public.user_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date TEXT, -- Storing as text to allow flexible date formats like "Jan 2020"
    end_date TEXT,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    achievements TEXT[], -- Array of achievement strings
    skills_used TEXT[], -- Array of skills used in this role
    display_order INTEGER DEFAULT 0, -- For ordering experiences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for user_experiences
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can insert own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can update own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can delete own experiences" ON public.user_experiences;

-- Policy: Users can view their own experiences
CREATE POLICY "Users can view own experiences" ON public.user_experiences
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own experiences
CREATE POLICY "Users can insert own experiences" ON public.user_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own experiences
CREATE POLICY "Users can update own experiences" ON public.user_experiences
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own experiences
CREATE POLICY "Users can delete own experiences" ON public.user_experiences
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_experiences_updated_at
    BEFORE UPDATE ON public.user_experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id ON public.user_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experiences_display_order ON public.user_experiences(user_id, display_order);

-- Success message
SELECT 'User experiences table created successfully!' as message; 