-- Add Education Fields to User Profiles
-- Migration to add college/university and GPA fields

-- Add the new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS gpa DECIMAL(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.college IS 'College name for undergraduate education';
COMMENT ON COLUMN user_profiles.university IS 'University name (can be same as college or for graduate education)';
COMMENT ON COLUMN user_profiles.gpa IS 'Grade Point Average (0.00 to 4.00 scale)';

-- Success message
SELECT 'Education fields (college, university, gpa) added to user_profiles table successfully!' as message; 