import { supabase } from '@/lib/supabase';
import { DatabaseJob, Job, JobSearchParams, CreateJobData, UpdateJobData } from '@/types/job';
import { formatDistanceToNow } from 'date-fns';

export class JobService {
  // Transform database job to frontend job interface
  private static transformDatabaseJob(dbJob: DatabaseJob): Job {
    // Handle date parsing - the database might return just a date string like "2025-06-02"
    let posted = 'Recently';
    try {
      const createdDate = dbJob.created_at.includes('T') 
        ? new Date(dbJob.created_at) 
        : new Date(dbJob.created_at + 'T00:00:00Z');
      posted = formatDistanceToNow(createdDate, { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting date:', error);
      posted = 'Recently';
    }
    
    return {
      id: dbJob.job_id,
      title: dbJob.job_title || 'Untitled Position',
      company: dbJob.company_name || 'Unknown Company',
      location: this.formatLocation(dbJob.job_location, dbJob.city, dbJob.state),
      city: dbJob.city || undefined,
      state: dbJob.state || undefined,
      description: dbJob.job_description || 'No description available',
      experienceRequired: dbJob.experience_required || undefined,
      applyLink: dbJob.apply_link || undefined,
      isRemote: dbJob.remote_flag || false,
      isProbablyRemote: dbJob.probably_remote || false,
      createdAt: dbJob.created_at,
      posted,
      logo: this.generateCompanyLogo(dbJob.company_name),
      tags: this.generateTags(dbJob),
      type: this.determineJobType(dbJob.experience_required)
    };
  }

  // Format location string from database fields
  private static formatLocation(location?: string | null, city?: string | null, state?: string | null): string {
    if (location) return location;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return 'Location not specified';
  }

  // Generate tags from job data
  private static generateTags(dbJob: DatabaseJob): string[] {
    const tags: string[] = [];
    
    // Add experience level tag
    if (dbJob.experience_required) {
      if (dbJob.experience_required.toLowerCase().includes('senior')) tags.push('Senior Level');
      else if (dbJob.experience_required.toLowerCase().includes('mid')) tags.push('Mid Level');
      else if (dbJob.experience_required.toLowerCase().includes('entry')) tags.push('Entry Level');
      else if (dbJob.experience_required.toLowerCase().includes('intern')) tags.push('Internship');
    }
    
    // Add remote tag
    if (dbJob.remote_flag) tags.push('Remote');
    
    // Extract skills from job description (basic keyword matching)
    const description = (dbJob.job_description || '').toLowerCase();
    const commonSkills = ['react', 'javascript', 'typescript', 'python', 'java', 'node.js', 'sql', 'aws', 'docker', 'kubernetes'];
    commonSkills.forEach(skill => {
      if (description.includes(skill)) {
        tags.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    return tags.slice(0, 4); // Limit to 4 tags for UI purposes
  }

  // Determine job type from experience required
  private static determineJobType(experienceRequired?: string | null): string {
    if (!experienceRequired) return 'Not Specified';
    
    const exp = experienceRequired.toLowerCase();
    if (exp.includes('intern')) return 'Internship';
    if (exp.includes('entry') || exp.includes('0-2')) return 'Entry Level';
    if (exp.includes('mid') || exp.includes('2-4')) return 'Mid Level';
    if (exp.includes('senior') || exp.includes('5+')) return 'Senior Level';
    if (exp.includes('lead') || exp.includes('principal') || exp.includes('8+')) return 'Lead/Principal';
    
    return 'Not Specified';
  }

  // Generate a company logo URL (placeholder service)
  private static generateCompanyLogo(companyName?: string | null): string {
    if (!companyName) return 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center';
    
    // Use a simple hash to consistently generate the same logo for the same company
    const logos = [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=60&h=60&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=60&h=60&fit=crop&crop=center'
    ];
    
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      const char = companyName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return logos[Math.abs(hash) % logos.length];
  }

  // Get all jobs with optional search and filtering
  static async getJobs(params: JobSearchParams = {}): Promise<{ jobs: Job[]; total: number }> {
    try {
      console.log('JobService.getJobs called with params:', params);
      
      let query = supabase
        .from('hirebuddy_job_board')
        .select('*', { count: 'exact' });

      // Apply text search if query provided
      if (params.query) {
        query = query.or(`job_title.ilike.%${params.query}%,company_name.ilike.%${params.query}%,job_description.ilike.%${params.query}%`);
      }

      // Apply filters
      if (params.filters) {
        const { location, experience, remote, company } = params.filters;
        
        if (location) {
          query = query.or(`job_location.ilike.%${location}%,city.ilike.%${location}%,state.ilike.%${location}%`);
        }
        
        if (experience && experience !== 'any') {
          query = query.ilike('experience_required', `%${experience}%`);
        }
        
        if (remote === 'remote') {
          query = query.eq('remote_flag', true);
        } else if (remote === 'onsite') {
          query = query.eq('remote_flag', false);
        }
        
        if (company) {
          query = query.ilike('company_name', `%${company}%`);
        }
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log(`JobService: Fetched ${data?.length || 0} jobs out of ${count || 0} total`);
      
      const jobs = (data || []).map(job => {
        try {
          return this.transformDatabaseJob(job);
        } catch (transformError) {
          console.error('Error transforming job:', job.job_id, transformError);
          // Return a basic job object if transformation fails
          return {
            id: job.job_id,
            title: job.job_title || 'Untitled Position',
            company: job.company_name || 'Unknown Company',
            location: job.job_location || 'Location not specified',
            description: job.job_description || 'No description available',
            isRemote: job.remote_flag || false,
            isProbablyRemote: job.probably_remote || false,
            createdAt: job.created_at,
            posted: 'Recently',
            logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center',
            tags: [],
            type: 'Full-time'
          };
        }
      });
      
      return {
        jobs,
        total: count || 0
      };
    } catch (error) {
      console.error('Error in JobService.getJobs:', error);
      throw error;
    }
  }

  // Get remote jobs from both regular and exclusive job tables
  static async getRemoteJobs(params: JobSearchParams = {}): Promise<{ jobs: Job[]; total: number }> {
    try {
      console.log('JobService.getRemoteJobs called with params:', params);
      
      // Query regular jobs that are remote
      let regularQuery = supabase
        .from('hirebuddy_job_board')
        .select('*', { count: 'exact' })
        .eq('remote_flag', true);

      // Query exclusive jobs that are remote
      let exclusiveQuery = supabase
        .from('hirebuddy_exclusive_jobs')
        .select('*', { count: 'exact' })
        .eq('remote_flag', true);

      // Apply text search if query provided
      if (params.query) {
        const searchCondition = `job_title.ilike.%${params.query}%,company_name.ilike.%${params.query}%,job_description.ilike.%${params.query}%`;
        regularQuery = regularQuery.or(searchCondition);
        exclusiveQuery = exclusiveQuery.or(searchCondition);
      }

      // Apply filters
      if (params.filters) {
        const { location, experience, company } = params.filters;
        
        if (location) {
          const locationCondition = `job_location.ilike.%${location}%,city.ilike.%${location}%,state.ilike.%${location}%`;
          regularQuery = regularQuery.or(locationCondition);
          exclusiveQuery = exclusiveQuery.or(locationCondition);
        }
        
        if (experience && experience !== 'any') {
          regularQuery = regularQuery.ilike('experience_required', `%${experience}%`);
          exclusiveQuery = exclusiveQuery.ilike('experience_required', `%${experience}%`);
        }
        
        if (company) {
          regularQuery = regularQuery.ilike('company_name', `%${company}%`);
          exclusiveQuery = exclusiveQuery.ilike('company_name', `%${company}%`);
        }
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      regularQuery = regularQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      exclusiveQuery = exclusiveQuery.order(sortBy, { ascending: sortOrder === 'asc' });

      // Execute both queries
      const regularResult = await regularQuery;
      let exclusiveResult;
      try {
        exclusiveResult = await exclusiveQuery;
      } catch (error: any) {
        // If exclusive jobs table doesn't exist, return empty result
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          exclusiveResult = { data: [], error: null, count: 0 };
        } else {
          throw error;
        }
      }

      if (regularResult.error) {
        console.error('Regular jobs query error:', regularResult.error);
        throw new Error(`Regular jobs query failed: ${regularResult.error.message}`);
      }

      if (exclusiveResult.error) {
        console.error('Exclusive jobs query error:', exclusiveResult.error);
        throw new Error(`Exclusive jobs query failed: ${exclusiveResult.error.message}`);
      }

      // Combine and transform jobs
      const allRemoteJobs = [
        ...(regularResult.data || []),
        ...(exclusiveResult.data || [])
      ];

      const totalCount = (regularResult.count || 0) + (exclusiveResult.count || 0);

      // Sort combined results
      allRemoteJobs.sort((a, b) => {
        if (sortBy === 'created_at') {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        } else if (sortBy === 'job_title') {
          const titleA = a.job_title || '';
          const titleB = b.job_title || '';
          return sortOrder === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
        } else if (sortBy === 'company_name') {
          const companyA = a.company_name || '';
          const companyB = b.company_name || '';
          return sortOrder === 'asc' ? companyA.localeCompare(companyB) : companyB.localeCompare(companyA);
        }
        return 0;
      });

      // Apply pagination to combined results
      let paginatedJobs = allRemoteJobs;
      if (params.offset || params.limit) {
        const offset = params.offset || 0;
        const limit = params.limit || 50;
        paginatedJobs = allRemoteJobs.slice(offset, offset + limit);
      }

      console.log(`JobService: Fetched ${paginatedJobs.length} remote jobs out of ${totalCount} total`);
      
      const jobs = paginatedJobs.map(job => {
        try {
          return this.transformDatabaseJob(job);
        } catch (transformError) {
          console.error('Error transforming remote job:', job.job_id, transformError);
          // Return a basic job object if transformation fails
          return {
            id: job.job_id,
            title: job.job_title || 'Untitled Position',
            company: job.company_name || 'Unknown Company',
            location: job.job_location || 'Location not specified',
            description: job.job_description || 'No description available',
            isRemote: job.remote_flag || false,
            isProbablyRemote: job.probably_remote || false,
            createdAt: job.created_at,
            posted: 'Recently',
            logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center',
            tags: ['Remote'],
            type: 'Full-time'
          };
        }
      });
      
      return {
        jobs,
        total: totalCount
      };
    } catch (error) {
      console.error('Error in JobService.getRemoteJobs:', error);
      throw error;
    }
  }

  // Get exclusive jobs with optional search and filtering
  static async getExclusiveJobs(params: JobSearchParams = {}): Promise<{ jobs: Job[]; total: number }> {
    try {
      console.log('JobService.getExclusiveJobs called with params:', params);
      
      let query = supabase
        .from('hirebuddy_exclusive_jobs')
        .select('*', { count: 'exact' });

      // Apply text search if query provided
      if (params.query) {
        query = query.or(`job_title.ilike.%${params.query}%,company_name.ilike.%${params.query}%,job_description.ilike.%${params.query}%`);
      }

      // Apply filters
      if (params.filters) {
        const { location, experience, remote, company } = params.filters;
        
        if (location) {
          query = query.or(`job_location.ilike.%${location}%,city.ilike.%${location}%,state.ilike.%${location}%`);
        }
        
        if (experience && experience !== 'any') {
          query = query.ilike('experience_required', `%${experience}%`);
        }
        
        if (remote === 'remote') {
          query = query.eq('remote_flag', true);
        } else if (remote === 'onsite') {
          query = query.eq('remote_flag', false);
        }
        
        if (company) {
          query = query.ilike('company_name', `%${company}%`);
        }
      }

      // Default sorting for exclusive jobs - priority first, then created_at
      const sortBy = params.sortBy || 'priority_level';
      const sortOrder = params.sortOrder || 'asc'; // Lower priority number = higher priority
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Secondary sort by created_at for same priority jobs
      if (sortBy !== 'created_at') {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase exclusive jobs query error:', error);
        // If table doesn't exist, return mock data for testing
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.log('Exclusive jobs table not found, returning mock data');
          return this.getMockExclusiveJobs(params);
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log(`JobService: Fetched ${data?.length || 0} exclusive jobs out of ${count || 0} total`);
      
      const jobs = (data || []).map(job => {
        try {
          return this.transformDatabaseJob(job);
        } catch (transformError) {
          console.error('Error transforming exclusive job:', job.job_id, transformError);
          // Return a basic job object if transformation fails
          return {
            id: job.job_id,
            title: job.job_title || 'Untitled Position',
            company: job.company_name || 'Unknown Company',
            location: job.job_location || 'Location not specified',
            description: job.job_description || 'No description available',
            isRemote: job.remote_flag || false,
            isProbablyRemote: job.probably_remote || false,
            createdAt: job.created_at,
            posted: 'Recently',
            logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center',
            tags: ['Exclusive'],
            type: 'Full-time'
          };
        }
      });
      
      return {
        jobs,
        total: count || 0
      };
    } catch (error) {
      console.error('Error in JobService.getExclusiveJobs:', error);
      // Fallback to mock data if there's any error
      console.log('Falling back to mock exclusive jobs data');
      return this.getMockExclusiveJobs(params);
    }
  }

  // Mock exclusive jobs data for testing when database table doesn't exist
  private static getMockExclusiveJobs(params: JobSearchParams = {}): { jobs: Job[]; total: number } {
    const mockJobs: Job[] = [
      {
        id: 'exclusive-1',
        title: 'Senior Full Stack Engineer - Exclusive Opportunity',
        company: 'TechCorp Elite',
        location: 'San Francisco, CA',
        city: 'San Francisco',
        state: 'CA',
        description: 'Join our exclusive team building next-generation AI-powered applications. This is a limited-time exclusive opportunity with exceptional benefits and equity package. Work with cutting-edge technologies including React, Node.js, and AI/ML frameworks.',
        experienceRequired: 'Senior Level (5+ years)',
        applyLink: 'https://example.com/apply/exclusive-1',
        isRemote: true,
        isProbablyRemote: true,
        createdAt: new Date().toISOString(),
        posted: '2 days ago',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=center',
        tags: ['Exclusive', 'Senior Level', 'Remote', 'React', 'Node.js'],
        type: 'Full-time'
      },
      {
        id: 'exclusive-2',
        title: 'Principal Software Architect - Premium Role',
        company: 'Innovation Labs',
        location: 'New York, NY',
        city: 'New York',
        state: 'NY',
        description: 'Lead architectural decisions for our cutting-edge platform. Exclusive position with direct reporting to CTO and significant equity stake. Shape the future of our technology stack and mentor senior engineers.',
        experienceRequired: 'Principal Level (8+ years)',
        applyLink: 'https://example.com/apply/exclusive-2',
        isRemote: false,
        isProbablyRemote: false,
        createdAt: new Date().toISOString(),
        posted: '1 day ago',
        logo: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=60&h=60&fit=crop&crop=center',
        tags: ['Exclusive', 'Principal Level', 'Architecture', 'Leadership'],
        type: 'Full-time'
      },
      {
        id: 'exclusive-3',
        title: 'VP of Engineering - Executive Opportunity',
        company: 'StartupX',
        location: 'Remote',
        city: 'Remote',
        state: 'Remote',
        description: 'Shape the future of our engineering organization. This exclusive executive role offers substantial equity and the opportunity to build a world-class team from the ground up.',
        experienceRequired: 'Executive Level (10+ years)',
        applyLink: 'https://example.com/apply/exclusive-3',
        isRemote: true,
        isProbablyRemote: true,
        createdAt: new Date().toISOString(),
        posted: '3 days ago',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=60&h=60&fit=crop&crop=center',
        tags: ['Exclusive', 'Executive Level', 'Remote', 'Leadership', 'Management'],
        type: 'Full-time'
      },
      {
        id: 'exclusive-4',
        title: 'Lead Frontend Developer - Premium Position',
        company: 'DesignFirst',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        description: 'Lead our frontend engineering efforts with the latest technologies. Exclusive opportunity with flexible work arrangements and top-tier compensation. Work with React, TypeScript, and modern design systems.',
        experienceRequired: 'Lead Level (6+ years)',
        applyLink: 'https://example.com/apply/exclusive-4',
        isRemote: true,
        isProbablyRemote: true,
        createdAt: new Date().toISOString(),
        posted: '4 days ago',
        logo: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=60&h=60&fit=crop&crop=center',
        tags: ['Exclusive', 'Lead Level', 'Remote', 'React', 'TypeScript'],
        type: 'Full-time'
      },
      {
        id: 'exclusive-5',
        title: 'Senior Data Scientist - AI Division',
        company: 'DataCorp',
        location: 'Seattle, WA',
        city: 'Seattle',
        state: 'WA',
        description: 'Drive AI innovation in our exclusive data science division. Work with cutting-edge ML technologies and shape product direction. Opportunity to work on large-scale data problems with real-world impact.',
        experienceRequired: 'Senior Level (4+ years)',
        applyLink: 'https://example.com/apply/exclusive-5',
        isRemote: true,
        isProbablyRemote: true,
        createdAt: new Date().toISOString(),
        posted: '1 week ago',
        logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=60&h=60&fit=crop&crop=center',
        tags: ['Exclusive', 'Senior Level', 'Remote', 'Python', 'AI/ML'],
        type: 'Full-time'
      }
    ];

    // Apply basic filtering for mock data
    let filteredJobs = [...mockJobs];

    if (params.query) {
      const query = params.query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    if (params.filters) {
      const { location, experience, remote, company } = params.filters;
      
      if (location) {
        const loc = location.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(loc) ||
          (job.city && job.city.toLowerCase().includes(loc)) ||
          (job.state && job.state.toLowerCase().includes(loc))
        );
      }
      
      if (experience && experience !== 'any') {
        filteredJobs = filteredJobs.filter(job => 
          job.experienceRequired?.toLowerCase().includes(experience.toLowerCase())
        );
      }
      
      if (remote === 'remote') {
        filteredJobs = filteredJobs.filter(job => job.isRemote);
      } else if (remote === 'onsite') {
        filteredJobs = filteredJobs.filter(job => !job.isRemote);
      }
      
      if (company) {
        filteredJobs = filteredJobs.filter(job => 
          job.company.toLowerCase().includes(company.toLowerCase())
        );
      }
    }

    // Apply pagination
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length
    };
  }

  // Get a single job by ID
  static async getJobById(jobId: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('hirebuddy_job_board')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Job not found
        }
        throw error;
      }

      return this.transformDatabaseJob(data);
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw error;
    }
  }

  // Create a new job
  static async createJob(jobData: CreateJobData): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from('hirebuddy_job_board')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      return this.transformDatabaseJob(data);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Update an existing job
  static async updateJob(updateData: UpdateJobData): Promise<Job> {
    try {
      const { job_id, ...updates } = updateData;
      
      const { data, error } = await supabase
        .from('hirebuddy_job_board')
        .update(updates)
        .eq('job_id', job_id)
        .select()
        .single();

      if (error) throw error;

      return this.transformDatabaseJob(data);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  // Delete a job
  static async deleteJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('hirebuddy_job_board')
        .delete()
        .eq('job_id', jobId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Get jobs count by various criteria
  static async getJobsStats(): Promise<{
    total: number;
    remote: number;
    thisWeek: number;
    companies: number;
  }> {
    try {
      // Get total jobs
      const { count: total } = await supabase
        .from('hirebuddy_job_board')
        .select('*', { count: 'exact', head: true });

      // Get remote jobs
      const { count: remote } = await supabase
        .from('hirebuddy_job_board')
        .select('*', { count: 'exact', head: true })
        .eq('remote_flag', true);

      // Get jobs from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoString = weekAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const { count: thisWeek } = await supabase
        .from('hirebuddy_job_board')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoString);

      // Get unique companies count
      const { data: companiesData } = await supabase
        .from('hirebuddy_job_board')
        .select('company_name')
        .not('company_name', 'is', null);

      const uniqueCompanies = new Set(companiesData?.map(job => job.company_name)).size;

      return {
        total: total || 0,
        remote: remote || 0,
        thisWeek: thisWeek || 0,
        companies: uniqueCompanies || 0
      };
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }

  // Search for companies (for autocomplete)
  static async searchCompanies(query: string, limit: number = 10): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('hirebuddy_job_board')
        .select('company_name')
        .ilike('company_name', `%${query}%`)
        .not('company_name', 'is', null)
        .limit(limit);

      const companies = Array.from(new Set(data?.map(job => job.company_name) || []));
      return companies.filter(Boolean) as string[];
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  // Search for locations (for autocomplete)
  static async searchLocations(query: string, limit: number = 10): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('hirebuddy_job_board')
        .select('job_location, city, state')
        .or(`job_location.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
        .limit(limit);

      const locations = new Set<string>();
      
      data?.forEach(job => {
        if (job.job_location) locations.add(job.job_location);
        if (job.city && job.state) locations.add(`${job.city}, ${job.state}`);
        if (job.city) locations.add(job.city);
        if (job.state) locations.add(job.state);
      });

      return Array.from(locations).slice(0, limit);
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }
} 