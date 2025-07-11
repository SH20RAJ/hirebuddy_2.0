-- Update Profile Database with Education Fields
-- Run this script in your Supabase SQL Editor to add college, university, and GPA fields

-- Add education fields to existing user_profiles table
DO $$ 
BEGIN
    -- Add college column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='college') THEN
        ALTER TABLE user_profiles ADD COLUMN college TEXT;
        RAISE NOTICE 'Added college column to user_profiles table';
    ELSE
        RAISE NOTICE 'College column already exists in user_profiles table';
    END IF;
    
    -- Add university column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='university') THEN
        ALTER TABLE user_profiles ADD COLUMN university TEXT;
        RAISE NOTICE 'Added university column to user_profiles table';
    ELSE
        RAISE NOTICE 'University column already exists in user_profiles table';
    END IF;
    
    -- Add gpa column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='gpa') THEN
        ALTER TABLE user_profiles ADD COLUMN gpa DECIMAL(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00);
        RAISE NOTICE 'Added gpa column to user_profiles table';
    ELSE
        RAISE NOTICE 'GPA column already exists in user_profiles table';
    END IF;
END $$;

-- Add comments for documentation
DO $$
BEGIN
    -- Add comment for college column
    EXECUTE 'COMMENT ON COLUMN user_profiles.college IS ''College name for undergraduate education''';
    
    -- Add comment for university column  
    EXECUTE 'COMMENT ON COLUMN user_profiles.university IS ''University name (can be same as college or for graduate education)''';
    
    -- Add comment for gpa column
    EXECUTE 'COMMENT ON COLUMN user_profiles.gpa IS ''Grade Point Average (0.00 to 4.00 scale)''';
    
    RAISE NOTICE 'Added column comments for education fields';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add comments (this is normal if columns already exist): %', SQLERRM;
END $$;

-- Success message
SELECT 'Education fields (college, university, gpa) have been successfully added to user_profiles table!' as message;
SELECT 'You can now use the updated Profile page to add your education information.' as next_step; 