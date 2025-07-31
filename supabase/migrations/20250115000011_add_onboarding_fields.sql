-- Add onboarding fields to user_profiles table
-- Migration to add fields for onboarding flow

-- Add the new columns for onboarding
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_roles TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS work_mode TEXT,
ADD COLUMN IF NOT EXISTS salary_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS salary_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS career_goals TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS job_search_urgency TEXT; -- 'rush' or 'open'

-- Add constraints for the new fields (drop if exists first)
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_experience_level_check;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_work_mode_check;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_job_search_urgency_check;
    
    -- Add the constraints
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_experience_level_check 
    CHECK (experience_level IN ('student', 'entry', 'mid', 'senior', 'leadership'));

    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_work_mode_check 
    CHECK (work_mode IN ('remote', 'hybrid', 'onsite'));

    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_job_search_urgency_check 
    CHECK (job_search_urgency IN ('rush', 'open'));
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed 
ON user_profiles (onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_roles 
ON user_profiles USING gin (preferred_roles);

CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_level 
ON user_profiles (experience_level);

CREATE INDEX IF NOT EXISTS idx_user_profiles_work_mode 
ON user_profiles (work_mode);

CREATE INDEX IF NOT EXISTS idx_user_profiles_salary_range 
ON user_profiles (salary_min, salary_max);

-- Success message
SELECT 'Onboarding fields added successfully to user_profiles table!' as message; 