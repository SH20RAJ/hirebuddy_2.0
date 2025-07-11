-- Simplify Education Fields Migration
-- Remove university and gpa fields, keep only college

-- Remove university and gpa columns from user_profiles table
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS university,
DROP COLUMN IF EXISTS gpa;

-- Add comment for college field
COMMENT ON COLUMN public.user_profiles.college IS 'College/University name for education';

-- Success message
SELECT 'Education fields simplified - only college field remains' as message; 