import { Job } from '@/types/job';
import { UserProfile } from '@/services/profileService';

export interface JobMatchScore {
  job: Job;
  score: number;
  matchReasons: string[];
}

export interface RankingFactors {
  skillsWeight: number;
  roleWeight: number;
  experienceWeight: number;
  locationWeight: number;
  workModeWeight: number;
  salaryWeight: number;
}

export class JobRankingService {
  private static readonly DEFAULT_WEIGHTS: RankingFactors = {
    skillsWeight: 0.35,      // 35% - Most important
    roleWeight: 0.25,        // 25% - Very important
    experienceWeight: 0.20,  // 20% - Important
    locationWeight: 0.10,    // 10% - Moderate
    workModeWeight: 0.05,    // 5% - Minor
    salaryWeight: 0.05       // 5% - Minor
  };

  /**
   * Calculate job match score based on user profile
   */
  static calculateJobMatchScore(
    job: Job, 
    userProfile: UserProfile, 
    weights: RankingFactors = this.DEFAULT_WEIGHTS
  ): JobMatchScore {
    const matchReasons: string[] = [];
    let totalScore = 0;

    // 1. Skills matching (35% weight)
    const skillsScore = this.calculateSkillsMatch(job, userProfile, matchReasons);
    totalScore += skillsScore * weights.skillsWeight;

    // 2. Role matching (25% weight)
    const roleScore = this.calculateRoleMatch(job, userProfile, matchReasons);
    totalScore += roleScore * weights.roleWeight;

    // 3. Experience level matching (20% weight)
    const experienceScore = this.calculateExperienceMatch(job, userProfile, matchReasons);
    totalScore += experienceScore * weights.experienceWeight;

    // 4. Location matching (10% weight)
    const locationScore = this.calculateLocationMatch(job, userProfile, matchReasons);
    totalScore += locationScore * weights.locationWeight;

    // 5. Work mode matching (5% weight)
    const workModeScore = this.calculateWorkModeMatch(job, userProfile, matchReasons);
    totalScore += workModeScore * weights.workModeWeight;

    // 6. Salary matching (5% weight)
    const salaryScore = this.calculateSalaryMatch(job, userProfile, matchReasons);
    totalScore += salaryScore * weights.salaryWeight;

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, Math.max(0, totalScore * 100));

    return {
      job,
      score: normalizedScore,
      matchReasons
    };
  }

  /**
   * Calculate skills match score
   */
  private static calculateSkillsMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const userSkills = userProfile.skills || [];
    if (userSkills.length === 0) return 0.3; // Default score if no skills

    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const jobTags = job.tags || [];
    
    let matchedSkills = 0;
    const matchedSkillNames: string[] = [];

    // Check for skill matches in job title, description, and tags
    userSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const isInJobText = jobText.includes(skillLower);
      const isInTags = jobTags.some(tag => tag.toLowerCase().includes(skillLower));
      
      if (isInJobText || isInTags) {
        matchedSkills++;
        matchedSkillNames.push(skill);
      }
    });

    if (matchedSkillNames.length > 0) {
      matchReasons.push(`Skills match: ${matchedSkillNames.slice(0, 3).join(', ')}${matchedSkillNames.length > 3 ? ` +${matchedSkillNames.length - 3} more` : ''}`);
    }

    // Score based on percentage of skills matched
    return Math.min(1, matchedSkills / Math.max(userSkills.length, 1));
  }

  /**
   * Calculate role match score
   */
  private static calculateRoleMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const preferredRoles = userProfile.preferred_roles || [];
    if (preferredRoles.length === 0) return 0.5; // Default score if no preferred roles

    const jobTitle = job.title.toLowerCase();
    const jobDescription = job.description.toLowerCase();
    
    let bestMatch = 0;
    let matchedRole = '';

    preferredRoles.forEach(role => {
      const roleLower = role.toLowerCase();
      let roleScore = 0;

      // Higher score for title match
      if (jobTitle.includes(roleLower)) {
        roleScore = 1.0;
      }
      // Medium score for description match
      else if (jobDescription.includes(roleLower)) {
        roleScore = 0.7;
      }
      // Lower score for partial keyword match
      else {
        const roleKeywords = roleLower.split(' ');
        const matchedKeywords = roleKeywords.filter(keyword => 
          jobTitle.includes(keyword) || jobDescription.includes(keyword)
        );
        roleScore = matchedKeywords.length / roleKeywords.length * 0.5;
      }

      if (roleScore > bestMatch) {
        bestMatch = roleScore;
        matchedRole = role;
      }
    });

    if (bestMatch > 0.3 && matchedRole) {
      matchReasons.push(`Role match: ${matchedRole}`);
    }

    return bestMatch;
  }

  /**
   * Calculate experience level match score
   */
  private static calculateExperienceMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const userExperienceLevel = userProfile.experience_level;
    const userExperienceYears = userProfile.experience_years || 0;
    
    if (!userExperienceLevel && userExperienceYears === 0) return 0.5;

    const jobExperience = job.experienceRequired?.toLowerCase() || '';
    
    // Experience level mapping
    const experienceLevels = {
      'student': { min: 0, max: 1, keywords: ['student', 'intern', 'entry', 'junior', 'fresher'] },
      'entry': { min: 0, max: 2, keywords: ['entry', 'junior', 'fresher', '0-2', '1-2'] },
      'mid': { min: 2, max: 5, keywords: ['mid', 'intermediate', '2-5', '3-5', '2-4'] },
      'senior': { min: 5, max: 10, keywords: ['senior', 'lead', '5+', '5-10', '6+'] },
      'leadership': { min: 8, max: 20, keywords: ['principal', 'staff', 'architect', 'manager', 'director', '8+', '10+'] }
    };

    let score = 0.5; // Default score

    if (userExperienceLevel && experienceLevels[userExperienceLevel as keyof typeof experienceLevels]) {
      const levelData = experienceLevels[userExperienceLevel as keyof typeof experienceLevels];
      
      // Check if job experience matches user's level keywords
      const hasKeywordMatch = levelData.keywords.some(keyword => 
        jobExperience.includes(keyword)
      );
      
      if (hasKeywordMatch) {
        score = 1.0;
        matchReasons.push(`Experience level match: ${userExperienceLevel}`);
      }
      // Check if user's years of experience fits the level
      else if (userExperienceYears >= levelData.min && userExperienceYears <= levelData.max) {
        score = 0.8;
        matchReasons.push(`Experience years match: ${userExperienceYears} years`);
      }
    }

    return score;
  }

  /**
   * Calculate location match score
   */
  private static calculateLocationMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const userLocation = userProfile.location?.toLowerCase() || '';
    const jobLocation = job.location.toLowerCase();
    
    // Remote jobs get high score if user prefers remote
    if (job.isRemote && userProfile.work_mode === 'remote') {
      matchReasons.push('Remote work preference match');
      return 1.0;
    }
    
    // If job is remote, it's accessible to everyone
    if (job.isRemote) {
      return 0.8;
    }
    
    if (!userLocation) return 0.5; // Default if no user location
    
    // Check for city/state match
    if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
      matchReasons.push(`Location match: ${job.location}`);
      return 1.0;
    }
    
    // Check for state match (extract state from location)
    const userStateParts = userLocation.split(',').map(s => s.trim());
    const jobStateParts = jobLocation.split(',').map(s => s.trim());
    
    if (userStateParts.length > 1 && jobStateParts.length > 1) {
      const userState = userStateParts[userStateParts.length - 1];
      const jobState = jobStateParts[jobStateParts.length - 1];
      
      if (userState === jobState) {
        matchReasons.push(`State match: ${jobState}`);
        return 0.7;
      }
    }
    
    return 0.3; // Low score for different locations
  }

  /**
   * Calculate work mode match score
   */
  private static calculateWorkModeMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const userWorkMode = userProfile.work_mode;
    
    if (!userWorkMode) return 0.5;
    
    if (userWorkMode === 'remote' && job.isRemote) {
      matchReasons.push('Remote work match');
      return 1.0;
    }
    
    if (userWorkMode === 'onsite' && !job.isRemote) {
      matchReasons.push('Onsite work match');
      return 1.0;
    }
    
    if (userWorkMode === 'hybrid') {
      // Hybrid workers are flexible
      return 0.8;
    }
    
    return 0.3;
  }

  /**
   * Calculate salary match score
   */
  private static calculateSalaryMatch(
    job: Job, 
    userProfile: UserProfile, 
    matchReasons: string[]
  ): number {
    const userSalaryMin = userProfile.salary_min || 0;
    const userSalaryMax = userProfile.salary_max || 0;
    
    if (userSalaryMin === 0 && userSalaryMax === 0) return 0.5;
    
    // Since job salary info is not always available, 
    // we'll give a default score and improve this when job salary data is available
    return 0.5;
  }

  /**
   * Rank jobs based on user profile
   */
  static rankJobs(
    jobs: Job[], 
    userProfile: UserProfile, 
    weights?: RankingFactors
  ): JobMatchScore[] {
    const scoredJobs = jobs.map(job => 
      this.calculateJobMatchScore(job, userProfile, weights)
    );
    
    // Sort by score (highest first)
    return scoredJobs.sort((a, b) => b.score - a.score);
  }

  /**
   * Get top matching jobs
   */
  static getTopMatches(
    jobs: Job[], 
    userProfile: UserProfile, 
    limit: number = 20,
    weights?: RankingFactors
  ): JobMatchScore[] {
    const rankedJobs = this.rankJobs(jobs, userProfile, weights);
    return rankedJobs.slice(0, limit);
  }

  /**
   * Check if user profile has enough data for meaningful ranking
   */
  static hasEnoughProfileData(userProfile: UserProfile): boolean {
    const hasSkills = userProfile.skills && userProfile.skills.length > 0;
    const hasRoles = userProfile.preferred_roles && userProfile.preferred_roles.length > 0;
    const hasExperience = userProfile.experience_level || userProfile.experience_years > 0;
    
    // Need at least 2 out of 3 key factors for meaningful ranking
    return [hasSkills, hasRoles, hasExperience].filter(Boolean).length >= 2;
  }

  /**
   * Get ranked jobs with pagination - fetches all jobs, ranks them globally, then returns paginated results
   * This ensures proper ranking across all jobs, not just within batches
   */
  static async getRankedJobsWithPagination(
    jobService: any,
    userProfile: UserProfile,
    params: any = {},
    page: number = 0,
    limit: number = 20,
    weights?: RankingFactors
  ): Promise<{
    jobs: Job[];
    rankedJobs: JobMatchScore[];
    total: number;
    hasNextPage: boolean;
    currentPage: number;
  }> {
    // For the first page, we need to fetch all jobs to rank them properly
    // For subsequent pages, we can use cached ranking if available
    
    // Fetch all jobs (or a large batch for performance)
    const allJobsParams = {
      ...params,
      limit: 5000, // Fetch a large batch to ensure we get most jobs
      offset: 0,
    };
    
    const allJobsResult = await jobService.getJobs(allJobsParams);
    
    // Rank all jobs
    const allRankedJobs = this.rankJobs(allJobsResult.jobs, userProfile, weights);
    
    // Calculate pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedRankedJobs = allRankedJobs.slice(startIndex, endIndex);
    
    return {
      jobs: paginatedRankedJobs.map(rj => rj.job),
      rankedJobs: paginatedRankedJobs,
      total: allRankedJobs.length,
      hasNextPage: endIndex < allRankedJobs.length,
      currentPage: page,
    };
  }
}

export default JobRankingService; 