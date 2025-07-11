import { supabase } from '@/lib/supabase';
import { JobApplication } from '@/types/job';
import { UserProfile, UserExperience } from './profileService';

export interface CreateJobApplicationData {
  job_id: string;
  job_title: string;
  company_name: string;
  job_type?: 'exclusive' | 'regular';
}

export interface JobApplicationWithExperiences extends JobApplication {
  experiences?: UserExperience[];
}

export class JobApplicationService {
  // Create a new job application
  static async createApplication(
    userId: string, 
    userEmail: string, 
    jobData: CreateJobApplicationData, 
    userProfile: UserProfile,
    userExperiences: UserExperience[] = []
  ): Promise<JobApplication> {
    try {
      // Check if user already applied to this job
      const { data: existingApplication, error: checkError } = await supabase
        .from('hirebuddy_job_applications')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobData.job_id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Create the application with user profile data
      const applicationData = {
        user_id: userId,
        user_email: userEmail,
        job_id: jobData.job_id,
        job_title: jobData.job_title,
        company_name: jobData.company_name,
        job_type: jobData.job_type || 'exclusive',
        
        // Copy user profile data
        full_name: userProfile.full_name,
        title: userProfile.title,
        company: userProfile.company,
        location: userProfile.location,
        phone: userProfile.phone,
        bio: userProfile.bio,
        website: userProfile.website,
        github: userProfile.github,
        linkedin: userProfile.linkedin,
        college: userProfile.college,
        skills: userProfile.skills,
        experience_years: userProfile.experience_years,
        available_for_work: userProfile.available_for_work,
        resume_url: userProfile.resume_url,
        resume_filename: userProfile.resume_filename,
        
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }

  // Create a regular job application (for external/regular jobs)
  static async createRegularApplication(
    userId: string,
    userEmail: string,
    job: {
      id: string;
      title: string;
      company: string;
      location?: string;
      applyLink?: string;
    },
    userProfile?: UserProfile
  ): Promise<JobApplication> {
    try {
      // Check if user already applied to this job
      const { data: existingApplication } = await supabase
        .from('hirebuddy_job_applications')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', job.id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Create the application with available data
      const applicationData = {
        user_id: userId,
        user_email: userEmail,
        job_id: job.id,
        job_title: job.title,
        company_name: job.company,
        job_type: 'regular',
        
        // Copy user profile data if available
        full_name: userProfile?.full_name || null,
        title: userProfile?.title || null,
        company: userProfile?.company || null,
        location: userProfile?.location || job.location || null,
        phone: userProfile?.phone || null,
        bio: userProfile?.bio || null,
        website: userProfile?.website || null,
        github: userProfile?.github || null,
        linkedin: userProfile?.linkedin || null,
        college: userProfile?.college || null,
        skills: userProfile?.skills || null,
        experience_years: userProfile?.experience_years || 0,
        available_for_work: userProfile?.available_for_work || false,
        resume_url: userProfile?.resume_url || null,
        resume_filename: userProfile?.resume_filename || null,
        
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating regular job application:', error);
      throw error;
    }
  }

  // Get user's applications
  static async getUserApplications(userId: string): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  // Check if user has applied to a specific job
  static async hasUserApplied(userId: string, jobId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .single();

      return !!data;
    } catch (error) {
      // If no application found, return false
      return false;
    }
  }

  // Admin functions - Get all applications (ADMIN ONLY)
  static async getAllApplications(params: {
    status?: string;
    jobId?: string;
    companyName?: string;
    jobType?: 'exclusive' | 'regular';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      // First, try using the admin function (bypasses RLS and enforces admin-only access)
      const { data: adminData, error: adminError } = await supabase
        .rpc('get_all_job_applications_admin', {
          status_filter: params.status && params.status !== 'all' ? params.status : null,
          company_filter: params.companyName || null,
          limit_count: params.limit || 100,
          offset_count: params.offset || 0
        });

      if (!adminError && adminData) {
        return {
          applications: adminData || [],
          total: adminData.length || 0
        };
      }

      // If admin function fails, this means user is not admin
      if (adminError) {
        console.error('Admin function error (user not admin):', adminError.message);
        throw new Error('Access denied: Admin privileges required to view all applications');
      }

      // Fallback to regular query (will be limited by RLS - should only work for admins)
      let query = supabase
        .from('hirebuddy_job_applications')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params.jobId) {
        query = query.eq('job_id', params.jobId);
      }

      if (params.companyName) {
        query = query.ilike('company_name', `%${params.companyName}%`);
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 100) - 1);
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('RLS query error:', error.message);
        throw new Error('Access denied: Unable to fetch applications');
      }

      return {
        applications: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  }

  // Admin function - Update application status
  static async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status'], 
    adminNotes?: string,
    reviewedBy?: string
  ): Promise<JobApplication> {
    try {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (reviewedBy) {
        updateData.reviewed_by = reviewedBy;
      }

      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Admin function - Get application statistics (ADMIN ONLY)
  static async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  }> {
    try {
      // Try admin function first
      const { data: adminStats, error: adminError } = await supabase
        .rpc('get_application_stats_admin');

      if (!adminError && adminStats && adminStats.length > 0) {
        const stats = adminStats[0];
        return {
          total: Number(stats.total) || 0,
          pending: Number(stats.pending) || 0,
          reviewed: Number(stats.reviewed) || 0,
          shortlisted: Number(stats.shortlisted) || 0,
          rejected: Number(stats.rejected) || 0,
          hired: Number(stats.hired) || 0
        };
      }

      // If admin function fails, user is not admin
      if (adminError) {
        console.error('Admin stats function error:', adminError.message);
        throw new Error('Access denied: Admin privileges required');
      }

      // Fallback to regular query (will be limited by RLS)
      const { data, error } = await supabase
        .from('hirebuddy_job_applications')
        .select('status');

      if (error) {
        console.error('Error fetching application stats:', error);
        throw new Error('Access denied: Unable to fetch statistics');
      }

      const stats = {
        total: data?.length || 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        hired: 0
      };

      data?.forEach(app => {
        if (app.status in stats) {
          stats[app.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  }
} 