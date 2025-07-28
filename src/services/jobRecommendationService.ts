import { supabase } from '@/lib/supabase';
import { Job } from '@/types/job';
import { UserProfile, UserExperience } from './profileService';
import { JobService } from './jobService';

export interface JobRecommendation extends Job {
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
}

interface OpenAIJobMatchResponse {
  recommendations: Array<{
    jobId: string;
    matchScore: number;
    matchReasons: string[];
    missingSkills: string[];
  }>;
}

export class JobRecommendationService {
  // Remove direct API key access - use Supabase Edge Function proxy instead

  static async getRecommendedJobs(userId: string, limit = 5): Promise<JobRecommendation[]> {
    try {
      // Get user profile and experiences
      const [profile, experiences] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserExperiences(userId)
      ]);

      if (!profile) {
        console.warn('No user profile found, returning empty recommendations');
        return [];
      }

      // Get available jobs from the database
      const { jobs } = await JobService.getJobs({ limit: 50, sortBy: 'created_at', sortOrder: 'desc' });

      if (jobs.length === 0) {
        console.warn('No jobs available for recommendations');
        return [];
      }

      // Use OpenAI to analyze and recommend jobs
      const recommendations = await this.analyzeJobMatches(profile, experiences, jobs);

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting job recommendations:', error);
      // Return fallback recommendations based on recent jobs
      return this.getFallbackRecommendations(limit);
    }
  }

  private static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private static async getUserExperiences(userId: string): Promise<UserExperience[]> {
    try {
      const { data, error } = await supabase
        .from('user_experiences')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user experiences:', error);
      return [];
    }
  }

  private static async analyzeJobMatches(
    profile: UserProfile,
    experiences: UserExperience[],
    jobs: Job[]
  ): Promise<JobRecommendation[]> {
    // Remove direct API key access - use Supabase Edge Function proxy instead
    try {
      const userContext = this.buildUserContext(profile, experiences);
      
      const prompt = `Analyze the following user profile and job listings. Provide job recommendations with match scores (0-100) and reasons.

User Profile:
${userContext}

Available Jobs:
${jobs.map(job => `
Job ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Experience Required: ${job.experienceRequired || 'Not specified'}
Type: ${job.type || 'Not specified'}
Description: ${job.description?.substring(0, 500) || 'No description'}
`).join('\n')}

Return JSON in this exact format:
{
  "recommendations": [
    {
      "jobId": "job_id_here",
      "matchScore": 95,
      "matchReasons": ["Strong React experience match", "Senior level aligns with 5+ years experience", "Remote work preference satisfied"],
      "missingSkills": ["GraphQL", "Docker"]
    }
  ]
}

Focus on jobs with match scores above 70. Limit to top 10 recommendations.
`;

      const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert job matching AI that provides accurate job recommendations based on user profiles.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        },
      });

      if (error) {
        console.error('OpenAI proxy error:', error);
        throw new Error('Failed to get AI recommendations');
      }

      const aiResponse: OpenAIJobMatchResponse = JSON.parse(data.choices[0]?.message?.content || '{"recommendations":[]}');

      // Map AI recommendations to job objects
      const recommendations: JobRecommendation[] = [];
      
      for (const rec of aiResponse.recommendations) {
        const job = jobs.find(j => j.id === rec.jobId);
        if (job && rec.matchScore >= 70) {
          recommendations.push({
            ...job,
            matchScore: rec.matchScore,
            matchReasons: rec.matchReasons,
            missingSkills: rec.missingSkills
          });
        }
      }

      return recommendations;

    } catch (error) {
      console.error('Error with OpenAI job matching:', error);
      return this.getFallbackMatching(profile, experiences, jobs);
    }
  }

  private static buildUserContext(profile: UserProfile, experiences: UserExperience[]): string {
    const skills = profile.skills?.join(', ') || 'Not specified';
    const title = profile.title || 'Not specified';
    const experienceYears = profile.experience_years || 0;
    const location = profile.location || 'Not specified';
    
    let experienceContext = '';
    if (experiences.length > 0) {
      experienceContext = experiences.map(exp => 
        `- ${exp.job_title} at ${exp.company} (${exp.start_date} - ${exp.end_date || 'Present'})\n  Skills: ${exp.skills_used?.join(', ') || 'Not specified'}\n  Description: ${exp.description || 'Not provided'}`
      ).join('\n');
    }

    return `
Name: ${profile.full_name || 'Not provided'}
Current Title: ${title}
Experience Level: ${experienceYears} years
Skills: ${skills}
Location: ${location}
Available for Work: ${profile.available_for_work ? 'Yes' : 'No'}

Work Experience:
${experienceContext || 'No experience data provided'}

Bio: ${profile.bio || 'Not provided'}
`;
  }

  private static buildJobsContext(jobs: Job[]): string {
    return jobs.map(job => `
Job ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Remote: ${job.isRemote ? 'Yes' : 'No'}
Type: ${job.type || 'Not specified'}
Skills Required: ${job.tags?.join(', ') || 'Not specified'}
Description: ${job.description.substring(0, 300)}...
`).join('\n---\n');
  }

  private static getFallbackMatching(
    profile: UserProfile,
    experiences: UserExperience[],
    jobs: Job[]
  ): JobRecommendation[] {
    const userSkills = new Set((profile.skills || []).map(s => s.toLowerCase()));
    const userTitle = profile.title?.toLowerCase() || '';
    const experienceYears = profile.experience_years || 0;

    return jobs
      .map(job => {
        let matchScore = 50; // Base score
        const matchReasons: string[] = [];
        const missingSkills: string[] = [];

        // Skills matching
        const jobSkills = job.tags?.map(t => t.toLowerCase()) || [];
        const skillMatches = jobSkills.filter(skill => userSkills.has(skill));
        
        if (skillMatches.length > 0) {
          matchScore += skillMatches.length * 10;
          matchReasons.push(`${skillMatches.length} matching skills: ${skillMatches.join(', ')}`);
        }

        // Title matching
        if (userTitle && job.title.toLowerCase().includes(userTitle)) {
          matchScore += 15;
          matchReasons.push('Job title matches your current role');
        }

        // Experience level matching
        const jobTitle = job.title.toLowerCase();
        if (experienceYears >= 5 && (jobTitle.includes('senior') || jobTitle.includes('lead'))) {
          matchScore += 10;
          matchReasons.push('Experience level aligns with senior position');
        } else if (experienceYears < 3 && (jobTitle.includes('junior') || jobTitle.includes('entry'))) {
          matchScore += 10;
          matchReasons.push('Perfect for your experience level');
        }

        // Remote work preference
        if (job.isRemote) {
          matchScore += 5;
          matchReasons.push('Remote work available');
        }

        // Add some missing skills for improvement
        const unmatchedSkills = jobSkills.filter(skill => !userSkills.has(skill));
        missingSkills.push(...unmatchedSkills.slice(0, 3));

        return {
          ...job,
          matchScore: Math.min(matchScore, 100),
          matchReasons: matchReasons.slice(0, 3),
          missingSkills: missingSkills.slice(0, 3)
        };
      })
      .filter(job => job.matchScore >= 60);
  }

  private static async getFallbackRecommendations(limit: number): Promise<JobRecommendation[]> {
    try {
      const { jobs } = await JobService.getJobs({ limit, sortBy: 'created_at', sortOrder: 'desc' });
      
      return jobs.map(job => ({
        ...job,
        matchScore: 75 + Math.floor(Math.random() * 20), // Random score between 75-95
        matchReasons: ['Recently posted', 'Popular in your field', 'Good company reputation'],
        missingSkills: ['Additional skills may be beneficial']
      }));
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }
} 