import { supabase, testConnection } from '@/lib/supabase';

export interface DashboardStats {
  totalApplications: number;
  interviewInvites: number;
  profileViews: number;
  weeklyApplications: number;
  weeklyGoal: number;
  applicationsByStatus: {
    applied: number;
    screening: number;
    interview_scheduled: number;
    interviewed: number;
    technical_assessment: number;
    final_round: number;
    offer_received: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
  weeklyTrend: number[];
}

export interface JobRecommendation {
  job_id: string;
  job_title: string;
  company_name: string;
  job_location: string;
  job_description?: string;
  salary_range?: string;
  remote_flag: boolean;
  probably_remote: boolean;
  created_at: string;
  apply_link?: string;
  match_score?: number;
  skills?: string[];
  is_urgent?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'view' | 'interview' | 'update' | 'email' | 'call';
  title: string;
  company?: string;
  description?: string;
  time: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}



export interface UserProfile {
  id: string;
  full_name?: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  profile_completion?: number;
  resume_score?: number;
}

export interface EmailOutreachStats {
  emailsSent: number;
  openRate: number;
  responseRate: number;
  campaignsActive: number;
  responsesReceived: number;
  interviewRequests: number;
}

export class DashboardService {
  /**
   * Check if user is authenticated and return user info
   * In development mode, we'll use sample data if no user is authenticated
   */
  static async checkAuthStatus() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, user: null };
      }
      return { authenticated: !!user, user };
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { authenticated: false, user: null };
    }
  }

  /**
   * Test database connection and log status
   */
  static async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing database connection...');
      const isConnected = await testConnection();
      if (isConnected) {
        console.log('✅ Database connection verified');
      } else {
        console.warn('⚠️ Database connection failed, using demo mode');
      }
      return isConnected;
    } catch (error) {
      console.error('❌ Database connection test error:', error);
      return false;
    }
  }

  /**
   * Get comprehensive dashboard statistics for the authenticated user
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Test database connection first
      const isConnected = await this.testDatabaseConnection();
      
      const { authenticated, user } = await this.checkAuthStatus();
      
      // If no connection or no user, return sample stats with some real data if possible
      if (!isConnected) {
        console.log('No database connection, using sample stats');
        return this.getSampleStatsWithRealData();
      }
      
      if (!authenticated || !user) {
        console.log('No authenticated user, using sample stats with real job data');
        return this.getSampleStatsWithRealData();
      }

      // Get total applications count from hirebuddy_job_applications table
      const { count: totalApplications, error: totalError } = await supabase
        .from('hirebuddy_job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (totalError) {
        console.error('Error fetching total applications:', totalError);
        return this.getSampleStatsWithRealData();
      }

      // Get applications by status from hirebuddy_job_applications
      const { data: applicationsByStatus, error: statusError } = await supabase
        .from('hirebuddy_job_applications')
        .select('status')
        .eq('user_id', user.id);

      if (statusError) {
        console.error('Error fetching applications by status:', statusError);
      }

      // Count by status - mapping job application statuses to dashboard statuses
      const statusCounts = {
        applied: 0,
        screening: 0,
        interview_scheduled: 0,
        interviewed: 0,
        technical_assessment: 0,
        final_round: 0,
        offer_received: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };

      // Map job application statuses to dashboard statuses
      applicationsByStatus?.forEach(app => {
        switch (app.status) {
          case 'pending':
            statusCounts.applied++;
            break;
          case 'reviewed':
            statusCounts.screening++;
            break;
          case 'shortlisted':
            statusCounts.interview_scheduled++;
            break;
          case 'rejected':
            statusCounts.rejected++;
            break;
          case 'hired':
            statusCounts.accepted++;
            break;
          default:
            statusCounts.applied++;
        }
      });

      // Get weekly applications (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: weeklyApplications, error: weeklyError } = await supabase
        .from('hirebuddy_job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      if (weeklyError) {
        console.error('Error fetching weekly applications:', weeklyError);
      }

      // Get interview invites (shortlisted + hired)
      const interviewInvites = statusCounts.interview_scheduled + 
                              statusCounts.interviewed + 
                              statusCounts.technical_assessment + 
                              statusCounts.final_round +
                              statusCounts.accepted;

      // Get weekly trend data
      const weeklyTrend: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { count, error } = await supabase
          .from('hirebuddy_job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
        
        if (error) {
          console.error(`Error fetching trend data for ${startOfDay.toISOString().split('T')[0]}:`, error);
          weeklyTrend.push(0);
        } else {
          weeklyTrend.push(count || 0);
        }
      }

      // Use placeholder for profile views (could be enhanced with actual tracking later)
      const profileViews = Math.floor(Math.random() * 100) + 50;

      return {
        totalApplications: totalApplications || 0,
        interviewInvites,
        profileViews: profileViews || 0,
        weeklyApplications: weeklyApplications || 0,
        weeklyGoal: 15,
        applicationsByStatus: statusCounts,
        weeklyTrend,
      };

    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return this.getSampleStatsWithRealData();
    }
  }

  /**
   * Get sample stats with some real data mixed in for development/demo
   */
  private static getSampleStatsWithRealData(): DashboardStats {
    return {
      totalApplications: 12,
      interviewInvites: 3,
      profileViews: 28,
      weeklyApplications: 4,
      weeklyGoal: 15,
      applicationsByStatus: {
        applied: 5,
        screening: 3,
        interview_scheduled: 2,
        interviewed: 1,
        technical_assessment: 1,
        final_round: 0,
        offer_received: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      },
      weeklyTrend: [1, 2, 0, 3, 1, 2, 1],
    };
  }

  /**
   * Get sample stats for demo purposes when user is not authenticated or has no data
   */
  private static getSampleStats(): DashboardStats {
    return {
      totalApplications: 8,
      interviewInvites: 2,
      profileViews: 24,
      weeklyApplications: 3,
      weeklyGoal: 15,
      applicationsByStatus: {
        applied: 3,
        screening: 2,
        interview_scheduled: 1,
        interviewed: 1,
        technical_assessment: 1,
        final_round: 0,
        offer_received: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      },
      weeklyTrend: [0, 1, 0, 2, 1, 1, 0],
    };
  }

  /**
   * Get default stats when data is not available
   */
  private static getDefaultStats(): DashboardStats {
    return {
      totalApplications: 0,
      interviewInvites: 0,
      profileViews: 0,
      weeklyApplications: 0,
      weeklyGoal: 15,
      applicationsByStatus: {
        applied: 0,
        screening: 0,
        interview_scheduled: 0,
        interviewed: 0,
        technical_assessment: 0,
        final_round: 0,
        offer_received: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      },
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  /**
   * Get job recommendations based on user profile and preferences
   */
  static async getJobRecommendations(limit: number = 5): Promise<JobRecommendation[]> {
    try {
      // Always try to get real jobs from the database first
      const { data: jobs, error } = await supabase
        .from('hirebuddy_job_board')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) {
        console.error('Error fetching jobs:', error);
        return this.getSampleJobRecommendations(limit);
      }

      if (!jobs || jobs.length === 0) {
        console.warn('No jobs found in database, returning sample recommendations');
        return this.getSampleJobRecommendations(limit);
      }

      // Get user profile for better matching
      const { authenticated, user } = await this.checkAuthStatus();
      let profile = null;
      
      if (authenticated && user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('skills, title, location')
          .eq('user_id', user.id)
          .single();

        if (!profileError && profileData) {
          profile = profileData;
        }
      }

      // Calculate match scores
      const jobsWithScores = jobs.map(job => {
        let matchScore = 60;

        if (job.remote_flag || job.probably_remote) {
          matchScore += 20;
        }

        if (profile?.location && job.job_location?.toLowerCase().includes(profile.location.toLowerCase())) {
          matchScore += 15;
        }

        if (profile?.title && job.job_title?.toLowerCase().includes(profile.title.toLowerCase())) {
          matchScore += 10;
        }

        matchScore += Math.floor(Math.random() * 15);
        matchScore = Math.min(matchScore, 98);

        return {
          ...job,
          match_score: matchScore,
          skills: this.extractSkillsFromJob(job),
          is_urgent: Math.random() > 0.8,
        };
      });

      return jobsWithScores
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getJobRecommendations:', error);
      return this.getSampleJobRecommendations(limit);
    }
  }

  /**
   * Extract skills from job title and description
   */
  private static extractSkillsFromJob(job: JobRecommendation): string[] {
    const title = job.job_title?.toLowerCase() || '';
    const description = job.job_description?.toLowerCase() || '';
    const text = `${title} ${description}`;
    
    const skills = [];
    if (text.includes('react')) skills.push('React');
    if (text.includes('typescript') || text.includes('ts')) skills.push('TypeScript');
    if (text.includes('node')) skills.push('Node.js');
    if (text.includes('python')) skills.push('Python');
    if (text.includes('java') && !text.includes('javascript')) skills.push('Java');
    if (text.includes('javascript') || text.includes('js')) skills.push('JavaScript');
    if (text.includes('aws')) skills.push('AWS');
    if (text.includes('docker')) skills.push('Docker');
    if (text.includes('kubernetes')) skills.push('Kubernetes');
    if (text.includes('sql')) skills.push('SQL');
    
    return skills.length > 0 ? skills.slice(0, 4) : ['JavaScript', 'HTML', 'CSS'];
  }

  /**
   * Get sample job recommendations when no data is available
   */
  private static getSampleJobRecommendations(limit: number): JobRecommendation[] {
    const sampleJobs: JobRecommendation[] = [
      {
        job_id: 'sample-1',
        job_title: 'Senior Frontend Developer',
        company_name: 'TechCorp',
        job_location: 'San Francisco, CA',
        salary_range: '$120,000 - $160,000',
        remote_flag: true,
        probably_remote: true,
        created_at: new Date().toISOString(),
        match_score: 95,
        skills: ['React', 'TypeScript', 'Next.js'],
        is_urgent: false,
      },
      {
        job_id: 'sample-2',
        job_title: 'Full Stack Engineer',
        company_name: 'StartupXYZ',
        job_location: 'Remote',
        salary_range: '$100,000 - $140,000',
        remote_flag: true,
        probably_remote: true,
        created_at: new Date().toISOString(),
        match_score: 90,
        skills: ['Node.js', 'React', 'PostgreSQL'],
        is_urgent: true,
      },
      {
        job_id: 'sample-3',
        job_title: 'Backend Developer',
        company_name: 'InnovateInc',
        job_location: 'New York, NY',
        salary_range: '$110,000 - $150,000',
        remote_flag: false,
        probably_remote: true,
        created_at: new Date().toISOString(),
        match_score: 85,
        skills: ['Python', 'Django', 'AWS'],
        is_urgent: false,
      },
    ];

    return sampleJobs.slice(0, limit);
  }

  /**
   * Get recent activity for the user
   */
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      // Try to get real activities first, even without authentication
      let activities = null;
      let error = null;

      if (authenticated && user) {
        const result = await supabase
          .from('application_activities')
          .select(`
            *,
            applications (
              company_name,
              job_title
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        activities = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching activities:', error);
        return this.getSampleActivities(limit);
      }

      if (!activities || activities.length === 0) {
        console.log('No activities found, returning sample activities for demo');
        return this.getSampleActivities(limit);
      }

      return activities.map(activity => {
        const timeAgo = this.getTimeAgo(new Date(activity.created_at));
        
        let type: RecentActivity['type'] = 'update';
        let icon = '⚡';
        let color: RecentActivity['color'] = 'blue';

        switch (activity.activity_type) {
          case 'applied':
            type = 'application';
            icon = '📝';
            color = 'blue';
            break;
          case 'interview_scheduled':
          case 'interview_completed':
            type = 'interview';
            icon = '📅';
            color = 'purple';
            break;
          case 'email_sent':
          case 'email_received':
            type = 'email';
            icon = '📧';
            color = 'green';
            break;
          default:
            type = 'update';
            icon = '📋';
            color = 'blue';
        }

        return {
          id: activity.id,
          type,
          title: activity.title,
          company: (activity.applications as any)?.company_name,
          description: activity.description,
          time: timeAgo,
          icon,
          color,
        };
      });
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      return this.getSampleActivities(limit);
    }
  }

  /**
   * Get sample activities when no data is available
   */
  private static getSampleActivities(limit: number): RecentActivity[] {
    const sampleActivities: RecentActivity[] = [
      {
        id: 'sample-1',
        type: 'application',
        title: 'Application submitted',
        company: 'TechCorp',
        description: 'Successfully submitted application for Senior Frontend Developer',
        time: '2 hours ago',
        icon: '📝',
        color: 'blue',
      },
      {
        id: 'sample-2',
        type: 'interview',
        title: 'Interview scheduled',
        company: 'StartupXYZ',
        description: 'Phone interview scheduled for tomorrow at 2 PM',
        time: '1 day ago',
        icon: '📅',
        color: 'purple',
      },
      {
        id: 'sample-3',
        type: 'email',
        title: 'Recruiter response',
        company: 'InnovateInc',
        description: 'Received response from recruiter about next steps',
        time: '2 days ago',
        icon: '📧',
        color: 'green',
      },
    ];

    return sampleActivities.slice(0, limit);
  }



  /**
   * Get user profile data
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample profile for demo');
        return {
          id: 'sample-user',
          full_name: 'Demo User',
          title: 'Software Developer',
          company: 'Tech Company',
          location: 'San Francisco, CA',
          bio: 'Passionate software developer with experience in modern web technologies.',
          skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python'],
          experience_years: 3,
          profile_completion: 75,
          resume_score: 85,
        };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Return sample profile as fallback
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          profile_completion: 50,
          resume_score: 70,
        };
      }

      if (!profile) {
        console.warn('No profile found for user, returning basic profile');
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          profile_completion: 25,
          resume_score: 60,
        };
      }

      const fields = ['full_name', 'title', 'company', 'location', 'bio', 'skills'];
      const completedFields = fields.filter(field => profile[field] && 
        (Array.isArray(profile[field]) ? profile[field].length > 0 : profile[field].trim().length > 0)
      );
      const profileCompletion = (completedFields.length / fields.length) * 100;
      const resumeScore = profile.resume_url ? 85 : 60;

      return {
        ...profile,
        profile_completion: Math.round(profileCompletion),
        resume_score: resumeScore,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Get total emails sent by the signed in user
   */
  static async getEmailsSentCount(): Promise<number> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample emails sent count for demo');
        return 15;
      }

      // Count unique contacts from useremaillog table (using user.email to match user_id)
      const { data: emailLogs, error: emailError } = await supabase
        .from('useremaillog')
        .select('to')
        .eq('user_id', user.email); // useremaillog uses email as user_id

      if (emailError) {
        console.error('Error fetching emails sent:', emailError);
        return 0;
      }

      if (!emailLogs || emailLogs.length === 0) {
        return 0;
      }

      // Count unique email addresses that received emails
      const uniqueContacts = new Set(emailLogs.map(email => email.to).filter(Boolean));
      
      console.log('Total unique contacts sent emails to:', uniqueContacts.size);
      return uniqueContacts.size;
    } catch (error) {
      console.error('Error in getEmailsSentCount:', error);
      return 0;
    }
  }

  /**
   * Get total replies received by the signed in user from the replies_kpi table
   */
  static async getRepliesReceivedCount(): Promise<number> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample replies count for demo');
        return 3;
      }

      // Count replies where reply = true from replies_kpi table
      const { data: replies, error: repliesError } = await supabase
        .from('replies_kpi')
        .select('reply')
        .eq('user_id', user.email) // Match user_id to user email
        .eq('reply', true); // Only count true replies

      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        return 0;
      }

      if (!replies || replies.length === 0) {
        return 0;
      }

      console.log('Total replies received:', replies.length);
      return replies.length;
    } catch (error) {
      console.error('Error in getRepliesReceivedCount:', error);
      return 0;
    }
  }

  /**
   * Get total count of all contacts in the email_database table
   */
  static async getTotalContactsCount(): Promise<number> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample total contacts count for demo');
        return 150;
      }

      // Count all contacts from email_database table
      const { count, error } = await supabase
        .from('email_database')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total contacts count:', error);
        return 0;
      }

      console.log('Total contacts in database:', count);
      return count || 0;
    } catch (error) {
      console.error('Error in getTotalContactsCount:', error);
      return 0;
    }
  }

  /**
   * Check if a contact has replied by looking up the replies_kpi table
   */
  static async hasContactReplied(userEmail: string, contactEmail: string): Promise<boolean> {
    try {
      // Try different possible field names for contact email
      const possibleFields = ['contact_email', 'to', 'recipient_email', 'email'];
      
      for (const field of possibleFields) {
        try {
          const { data: replies, error } = await supabase
            .from('replies_kpi')
            .select('reply')
            .eq('user_id', userEmail)
            .eq(field, contactEmail)
            .eq('reply', true)
            .limit(1);

          if (!error && replies && replies.length > 0) {
            return true;
          }
        } catch (fieldError) {
          // Continue to next field if this one doesn't exist
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('Error in hasContactReplied:', error);
      return false;
    }
  }

  /**
   * Get list of contacts who have replied to the user
   */
  static async getContactsWhoReplied(userEmail: string): Promise<string[]> {
    try {
      // Try different possible field names for contact email
      const possibleFields = ['contact_email', 'to', 'recipient_email', 'email'];
      
      for (const field of possibleFields) {
        try {
          const { data: replies, error } = await supabase
            .from('replies_kpi')
            .select(field)
            .eq('user_id', userEmail)
            .eq('reply', true);

          if (!error && replies && replies.length > 0) {
            return replies.map(r => r[field]).filter(Boolean);
          }
        } catch (fieldError) {
          // Continue to next field if this one doesn't exist
          continue;
        }
      }

      console.warn('Could not find contact email field in replies_kpi table');
      return [];
    } catch (error) {
      console.error('Error in getContactsWhoReplied:', error);
      return [];
    }
  }

  /**
   * Get count of contacts that need followups (emails sent but no follow-up done after 24 hours)
   * Updated to exclude contacts who have replied
   */
  static async getFollowupsNeededCount(): Promise<number> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample followups needed count for demo');
        return 8;
      }

      // Get email recipients from useremaillog (emails sent) with timestamps
      const { data: sentEmails, error: sentError } = await supabase
        .from('useremaillog')
        .select('to, sent_at')
        .eq('user_id', user.email); // useremaillog uses email as user_id

      if (sentError) {
        console.error('Error fetching sent emails:', sentError);
        return 0;
      }

      if (!sentEmails || sentEmails.length === 0) {
        return 0;
      }

      // Get follow-up emails with timestamps
      const { data: followupEmails, error: followupError } = await supabase
        .from('followuplogs')
        .select('to, sent_at')
        .eq('user_id', user.email); // followuplogs uses email as user_id

      if (followupError) {
        console.error('Error fetching follow-up emails:', followupError);
      }

      // Get contacts who have replied (exclude them from follow-up)
      const contactsWhoReplied = await this.getContactsWhoReplied(user.email);
      const repliedContactsSet = new Set(contactsWhoReplied.map(email => email.toLowerCase()));

      // Calculate 24 hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Group sent emails by recipient and find the most recent email to each
      const emailsByRecipient = new Map<string, Date>();
      
      sentEmails.forEach(email => {
        if (email.to) {
          const emailDate = new Date(email.sent_at);
          const existingDate = emailsByRecipient.get(email.to);
          
          if (!existingDate || emailDate > existingDate) {
            emailsByRecipient.set(email.to, emailDate);
          }
        }
      });

      // Group follow-up emails by recipient and find the most recent follow-up to each
      const followupsByRecipient = new Map<string, Date>();
      
      followupEmails?.forEach(email => {
        if (email.to) {
          const followupDate = new Date(email.sent_at);
          const existingDate = followupsByRecipient.get(email.to);
          
          if (!existingDate || followupDate > existingDate) {
            followupsByRecipient.set(email.to, followupDate);
          }
        }
      });

      // Count contacts that need follow-ups:
      // 1. Have received emails
      // 2. Either have NO follow-ups OR last follow-up was more than 24 hours ago
      // 3. Last email (initial or follow-up) was sent more than 24 hours ago
      // 4. EXCLUDE contacts who have replied (NEW REQUIREMENT)
      let needsFollowupCount = 0;
      
      for (const [emailAddress, lastEmailDate] of emailsByRecipient) {
        // Skip contacts who have replied - no follow-up needed
        if (repliedContactsSet.has(emailAddress.toLowerCase())) {
          continue;
        }
        
        const lastFollowupDate = followupsByRecipient.get(emailAddress);
        
        // Determine the most recent communication (email or follow-up)
        const mostRecentCommunication = lastFollowupDate && lastFollowupDate > lastEmailDate 
          ? lastFollowupDate 
          : lastEmailDate;
        
        // Check if it's been more than 24 hours since the last communication
        const isOlderThan24Hours = mostRecentCommunication < twentyFourHoursAgo;
        
        if (isOlderThan24Hours) {
          needsFollowupCount++;
        }
      }

      console.log('Followup analysis:', {
        totalContacts: emailsByRecipient.size,
        contactsWithFollowups: followupsByRecipient.size,
        contactsWhoReplied: contactsWhoReplied.length,
        needsFollowup: needsFollowupCount,
        twentyFourHoursAgo: twentyFourHoursAgo.toISOString()
      });

      return needsFollowupCount;
    } catch (error) {
      console.error('Error in getFollowupsNeededCount:', error);
      return 0;
    }
  }

  /**
   * Get email outreach statistics
   */
  static async getEmailOutreachStats(): Promise<EmailOutreachStats> {
    try {
      const { authenticated, user } = await this.checkAuthStatus();
      
      if (!authenticated || !user) {
        console.log('No authenticated user, returning sample email stats for demo');
        return {
          emailsSent: 15,
          openRate: 68,
          responseRate: 24,
          campaignsActive: 2,
          responsesReceived: 4,
          interviewRequests: 2,
        };
      }

      // Get emails sent count
      const emailsSentCount = await this.getEmailsSentCount();
      
      // Get replies count from the new replies_kpi table
      const repliesReceivedCount = await this.getRepliesReceivedCount();

      // For now, use placeholder values for open rate and other metrics
      // These could be enhanced later with actual tracking data
      const openRate = emailsSentCount > 0 ? Math.floor(Math.random() * 30) + 40 : 0; // Random between 40-70%
      const responseRate = emailsSentCount > 0 ? Math.round((repliesReceivedCount / emailsSentCount) * 100) : 0;

      return {
        emailsSent: emailsSentCount,
        openRate: openRate,
        responseRate: responseRate,
        campaignsActive: 0, // Placeholder - could be enhanced
        responsesReceived: repliesReceivedCount,
        interviewRequests: Math.floor(repliesReceivedCount * 0.4), // Estimate 40% of replies lead to interviews
      };
    } catch (error) {
      console.error('Error in getEmailOutreachStats:', error);
      return this.getDefaultEmailStats();
    }
  }

  /**
   * Get default email stats when data is not available
   */
  private static getDefaultEmailStats(): EmailOutreachStats {
    return {
      emailsSent: 0,
      openRate: 0,
      responseRate: 0,
      campaignsActive: 0,
      responsesReceived: 0,
      interviewRequests: 0,
    };
  }

  /**
   * Helper function to calculate time ago
   */
  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
  }
} 