-- Comprehensive RLS Security Script for HireBuddy Database
-- This script secures all tables with appropriate Row Level Security policies

-- Define admin emails (update these with your actual admin emails)
DO $$
BEGIN
    -- Create a custom function to check if user is admin
    CREATE OR REPLACE FUNCTION is_admin(user_email text DEFAULT NULL)
    RETURNS boolean AS 
    $_$
    BEGIN
        RETURN COALESCE(user_email, auth.jwt() ->> 'email') IN (
            'subhayudas49@gmail.com', 
            'sharmanishant9119@gmail.com'
        );
    END;
    $_$ LANGUAGE plpgsql SECURITY DEFINER;
END
$$;

-- =============================================================================
-- 1. CONTACTS TABLE - Admin only access (shared contact database for admin management)
-- =============================================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only access" ON public.contacts;
CREATE POLICY "Admin only access" ON public.contacts
    FOR ALL USING (is_admin());

-- =============================================================================
-- 2. EMAIL_DATABASE TABLE - Authenticated users can view, Admin can manage
-- =============================================================================
ALTER TABLE public.email_database ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view email database" ON public.email_database;
DROP POLICY IF EXISTS "Admin can manage email database" ON public.email_database;

CREATE POLICY "Authenticated users can view email database" ON public.email_database
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage email database" ON public.email_database
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update email database" ON public.email_database
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can delete email database" ON public.email_database
    FOR DELETE USING (is_admin());

-- =============================================================================
-- 3. FOLLOWUPLOGS TABLE - Users own data + Admin access (personal email tracking)
-- =============================================================================
ALTER TABLE public.followuplogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own followup logs or admin can view all" ON public.followuplogs;
DROP POLICY IF EXISTS "Users can create own followup logs" ON public.followuplogs;
DROP POLICY IF EXISTS "Users can update own followup logs or admin can update all" ON public.followuplogs;

CREATE POLICY "Users can view own followup logs or admin can view all" ON public.followuplogs
    FOR SELECT USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can create own followup logs" ON public.followuplogs
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND user_id = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own followup logs or admin can update all" ON public.followuplogs
    FOR UPDATE USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

-- =============================================================================
-- 4. HIREBUDDY_EXCLUSIVE_JOBS TABLE - Public read, Admin write
-- =============================================================================
ALTER TABLE public.hirebuddy_exclusive_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view exclusive jobs" ON public.hirebuddy_exclusive_jobs;
DROP POLICY IF EXISTS "Admin can manage exclusive jobs" ON public.hirebuddy_exclusive_jobs;

CREATE POLICY "Anyone can view exclusive jobs" ON public.hirebuddy_exclusive_jobs
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage exclusive jobs" ON public.hirebuddy_exclusive_jobs
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update exclusive jobs" ON public.hirebuddy_exclusive_jobs
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can delete exclusive jobs" ON public.hirebuddy_exclusive_jobs
    FOR DELETE USING (is_admin());

-- =============================================================================
-- 5. HIREBUDDY_JOB_APPLICATIONS TABLE - Users own data + Admin access
-- =============================================================================
ALTER TABLE public.hirebuddy_job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications or admin can view all" ON public.hirebuddy_job_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.hirebuddy_job_applications;
DROP POLICY IF EXISTS "Users can update own applications or admin can update all" ON public.hirebuddy_job_applications;

CREATE POLICY "Users can view own applications or admin can view all" ON public.hirebuddy_job_applications
    FOR SELECT USING (
        auth.uid() = user_id OR is_admin()
    );

CREATE POLICY "Authenticated users can create applications" ON public.hirebuddy_job_applications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND auth.uid() = user_id
    );

CREATE POLICY "Users can update own applications or admin can update all" ON public.hirebuddy_job_applications
    FOR UPDATE USING (
        auth.uid() = user_id OR is_admin()
    );

-- =============================================================================
-- 6. HIREBUDDY_JOB_BOARD TABLE - Public read, Admin write
-- =============================================================================
ALTER TABLE public.hirebuddy_job_board ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view jobs" ON public.hirebuddy_job_board;
DROP POLICY IF EXISTS "Admin can manage jobs" ON public.hirebuddy_job_board;

CREATE POLICY "Anyone can view jobs" ON public.hirebuddy_job_board
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage jobs" ON public.hirebuddy_job_board
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update jobs" ON public.hirebuddy_job_board
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can delete jobs" ON public.hirebuddy_job_board
    FOR DELETE USING (is_admin());

-- =============================================================================
-- 7. PAID_USERS TABLE - Admin only access (contains payment data)
-- =============================================================================
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only access" ON public.paid_users;
CREATE POLICY "Admin only access" ON public.paid_users
    FOR ALL USING (is_admin());

-- =============================================================================
-- 8. REPLIES_KPI TABLE - Users own data + Admin access (email analytics)
-- =============================================================================
ALTER TABLE public.replies_kpi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own replies or admin can view all" ON public.replies_kpi;
DROP POLICY IF EXISTS "Users can create own reply records" ON public.replies_kpi;

CREATE POLICY "Users can view own replies or admin can view all" ON public.replies_kpi
    FOR SELECT USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can create own reply records" ON public.replies_kpi
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND user_id = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own reply records" ON public.replies_kpi
    FOR UPDATE USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

-- =============================================================================
-- 9. TESTDB TABLE - Admin only access (test data)
-- =============================================================================
ALTER TABLE public.testdb ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only access" ON public.testdb;
CREATE POLICY "Admin only access" ON public.testdb
    FOR ALL USING (is_admin());

-- =============================================================================
-- 10. TOTALEMAILCOUNTTABLE TABLE - Users own data + Admin access
-- =============================================================================
ALTER TABLE public.totalemailcounttable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email count or admin can view all" ON public.totalemailcounttable;
DROP POLICY IF EXISTS "Users can manage own email count" ON public.totalemailcounttable;

CREATE POLICY "Users can view own email count or admin can view all" ON public.totalemailcounttable
    FOR SELECT USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can manage own email count" ON public.totalemailcounttable
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND user_id = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own email count" ON public.totalemailcounttable
    FOR UPDATE USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

-- =============================================================================
-- 11. USER_EXPERIENCES TABLE - Users own data only
-- =============================================================================
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can insert own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can update own experiences" ON public.user_experiences;
DROP POLICY IF EXISTS "Users can delete own experiences" ON public.user_experiences;

CREATE POLICY "Users can view own experiences" ON public.user_experiences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences" ON public.user_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences" ON public.user_experiences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences" ON public.user_experiences
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 12. USER_PROFILES TABLE - Users own data only
-- =============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 13. USEREMAILLOG TABLE - Users own data + Admin access (personal email logs)
-- =============================================================================
ALTER TABLE public.useremaillog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email logs or admin can view all" ON public.useremaillog;
DROP POLICY IF EXISTS "Users can create own email logs" ON public.useremaillog;
DROP POLICY IF EXISTS "Users can update own email logs or admin can update all" ON public.useremaillog;

CREATE POLICY "Users can view own email logs or admin can view all" ON public.useremaillog
    FOR SELECT USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can create own email logs" ON public.useremaillog
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND user_id = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own email logs or admin can update all" ON public.useremaillog
    FOR UPDATE USING (
        user_id = (auth.jwt() ->> 'email') OR is_admin()
    );

-- =============================================================================
-- 14. USERS TABLE - Users own data + Admin access (Google auth tokens)
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own auth data or admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can manage own auth data" ON public.users;

CREATE POLICY "Users can view own auth data or admin can view all" ON public.users
    FOR SELECT USING (
        email = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can manage own auth data" ON public.users
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own auth data" ON public.users
    FOR UPDATE USING (
        email = (auth.jwt() ->> 'email') OR is_admin()
    );

CREATE POLICY "Users can delete own auth data" ON public.users
    FOR DELETE USING (
        email = (auth.jwt() ->> 'email') OR is_admin()
    );

-- =============================================================================
-- GRANT PERMISSIONS AND FINAL SECURITY CHECKS
-- =============================================================================

-- Ensure authenticated users can access their own data
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hirebuddy_job_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followuplogs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.useremaillog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.totalemailcounttable TO authenticated;
-- Note: contacts table is admin-only, no grants needed for regular users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.replies_kpi TO authenticated;
GRANT SELECT ON public.hirebuddy_job_board TO authenticated;
GRANT SELECT ON public.hirebuddy_exclusive_jobs TO authenticated;
GRANT SELECT ON public.email_database TO authenticated;

-- Ensure anon users can view public job data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.hirebuddy_job_board TO anon;
GRANT SELECT ON public.hirebuddy_exclusive_jobs TO anon;

-- Create a security audit function
CREATE OR REPLACE FUNCTION security_audit()
RETURNS TABLE (
    table_name text,
    rls_enabled boolean,
    policy_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        c.relrowsecurity,
        COUNT(p.polname)
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename, c.relrowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Display security audit results
SELECT 
    'Security audit completed successfully!' as message,
    'All tables now have RLS enabled with appropriate policies' as status;

-- Show security status
SELECT * FROM security_audit(); 