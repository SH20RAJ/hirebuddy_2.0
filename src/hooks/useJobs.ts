import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { JobService } from '@/services/jobService';
import { Job, JobSearchParams, CreateJobData, UpdateJobData } from '@/types/job';
import { toast } from 'sonner';
import { JobRankingService, JobMatchScore } from '@/services/jobRankingService';
import { UserProfile } from '@/services/profileService';

// Query keys
export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (params: JobSearchParams) => [...jobQueryKeys.lists(), params] as const,
  exclusive: () => [...jobQueryKeys.all, 'exclusive'] as const,
  exclusiveList: (params: JobSearchParams) => [...jobQueryKeys.exclusive(), params] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
  stats: () => [...jobQueryKeys.all, 'stats'] as const,
  companies: () => [...jobQueryKeys.all, 'companies'] as const,
  locations: () => [...jobQueryKeys.all, 'locations'] as const,
  remote: () => [...jobQueryKeys.all, 'remote'] as const,
  remoteList: (params: JobSearchParams) => [...jobQueryKeys.remote(), params] as const,
  infiniteJobs: (params: JobSearchParams) => [...jobQueryKeys.all, 'infinite', params] as const,
  infiniteRemote: (params: JobSearchParams) => [...jobQueryKeys.remote(), 'infinite', params] as const,
  ranked: (userId: string) => [...jobQueryKeys.all, 'ranked', userId] as const,
  rankedList: (userId: string, params: JobSearchParams) => [...jobQueryKeys.ranked(userId), params] as const,
  infiniteRanked: (userId: string, params: JobSearchParams) => [...jobQueryKeys.ranked(userId), 'infinite', params] as const,
};

// Hook to fetch jobs with basic pagination
export function useJobs(params: JobSearchParams = {}) {
  return useQuery({
    queryKey: jobQueryKeys.list(params),
    queryFn: () => JobService.getJobs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch exclusive jobs
export function useExclusiveJobs(params: JobSearchParams = {}) {
  return useQuery({
    queryKey: jobQueryKeys.exclusiveList(params),
    queryFn: () => JobService.getExclusiveJobs(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch remote jobs specifically
export function useRemoteJobs(params: JobSearchParams = {}) {
  const remoteParams = {
    ...params,
    filters: {
      ...params.filters,
      remote: 'remote' as const
    }
  };
  
  return useQuery({
    queryKey: jobQueryKeys.remoteList(remoteParams),
    queryFn: () => JobService.getRemoteJobs(remoteParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch ranked jobs based on user profile
export function useRankedJobs(
  userProfile: UserProfile | null, 
  params: JobSearchParams = {}
) {
  return useQuery({
    queryKey: jobQueryKeys.rankedList(userProfile?.user_id || 'anonymous', params),
    queryFn: async (): Promise<{ jobs: Job[]; total: number; rankedJobs: JobMatchScore[] }> => {
      // First fetch regular jobs
      const jobsResult = await JobService.getJobs(params);
      
      // If user profile is available and has enough data, rank the jobs
      if (userProfile && JobRankingService.hasEnoughProfileData(userProfile)) {
        const rankedJobs = JobRankingService.rankJobs(jobsResult.jobs, userProfile);
        return {
          jobs: rankedJobs.map(rj => rj.job),
          total: jobsResult.total,
          rankedJobs
        };
      }
      
      // Otherwise return jobs as-is
      return {
        jobs: jobsResult.jobs,
        total: jobsResult.total,
        rankedJobs: jobsResult.jobs.map(job => ({
          job,
          score: 50, // Default score
          matchReasons: []
        }))
      };
    },
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for infinite scrolling/load more functionality for all jobs
export function useInfiniteJobs(baseParams: JobSearchParams = {}) {
  const limit = baseParams.limit || 20;
  
  return useInfiniteQuery({
    queryKey: jobQueryKeys.infiniteJobs(baseParams),
    queryFn: ({ pageParam = 0 }) => {
      const params = {
        ...baseParams,
        limit,
        offset: pageParam * limit,
      };
      return JobService.getJobs(params);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * limit;
      return currentOffset < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for infinite scrolling/load more functionality for ranked jobs
export function useInfiniteRankedJobs(
  userProfile: UserProfile | null,
  baseParams: JobSearchParams = {}
) {
  const limit = baseParams.limit || 20;
  
  return useInfiniteQuery({
    queryKey: jobQueryKeys.infiniteRanked(userProfile?.user_id || 'anonymous', baseParams),
    queryFn: async ({ pageParam = 0 }) => {
      // If this is the first page, fetch ALL jobs and rank them
      if (pageParam === 0) {
        // Fetch ALL jobs from database (no limit for ranking)
        const allJobsParams = {
          ...baseParams,
          limit: undefined, // Remove limit to get all jobs
          offset: undefined // Remove offset to get all jobs
        };
        
        const allJobsResult = await JobService.getJobs(allJobsParams);
        
        // If user profile is available and has enough data, rank ALL jobs
        if (userProfile && JobRankingService.hasEnoughProfileData(userProfile)) {
          const rankedJobs = JobRankingService.rankJobs(allJobsResult.jobs, userProfile);
          
          // Store ranked jobs in a way that can be accessed by subsequent pages
          // For now, we'll return the first page of ranked jobs
          const firstPageJobs = rankedJobs.slice(0, limit);
          
          return {
            jobs: firstPageJobs.map(rj => rj.job),
            total: allJobsResult.total,
            rankedJobs: firstPageJobs,
            allRankedJobs: rankedJobs // Store all ranked jobs for pagination
          };
        }
        
        // Otherwise return first page of jobs as-is
        const firstPageJobs = allJobsResult.jobs.slice(0, limit);
        return {
          jobs: firstPageJobs,
          total: allJobsResult.total,
          rankedJobs: firstPageJobs.map(job => ({
            job,
            score: 50, // Default score
            matchReasons: []
          })),
          allRankedJobs: allJobsResult.jobs.map(job => ({
            job,
            score: 50,
            matchReasons: []
          }))
        };
      } else {
        // For subsequent pages, we need to get the ranked jobs from the first page's cache
        // This is a limitation of the current approach - we'll use a different strategy
        
        // Fetch all jobs again and rank them (this could be optimized with caching)
        const allJobsParams = {
          ...baseParams,
          limit: undefined,
          offset: undefined
        };
        
        const allJobsResult = await JobService.getJobs(allJobsParams);
        
        if (userProfile && JobRankingService.hasEnoughProfileData(userProfile)) {
          const rankedJobs = JobRankingService.rankJobs(allJobsResult.jobs, userProfile);
          
          // Get the jobs for this specific page
          const startIndex = pageParam * limit;
          const endIndex = startIndex + limit;
          const pageJobs = rankedJobs.slice(startIndex, endIndex);
          
          return {
            jobs: pageJobs.map(rj => rj.job),
            total: allJobsResult.total,
            rankedJobs: pageJobs
          };
        }
        
        // For non-ranked jobs, just paginate normally
        const startIndex = pageParam * limit;
        const endIndex = startIndex + limit;
        const pageJobs = allJobsResult.jobs.slice(startIndex, endIndex);
        
        return {
          jobs: pageJobs,
          total: allJobsResult.total,
          rankedJobs: pageJobs.map(job => ({
            job,
            score: 50,
            matchReasons: []
          }))
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * limit;
      return currentOffset < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for infinite scrolling/load more functionality for remote jobs
export function useInfiniteRemoteJobs(baseParams: JobSearchParams = {}) {
  const limit = baseParams.limit || 20;
  
  return useInfiniteQuery({
    queryKey: jobQueryKeys.infiniteRemote(baseParams),
    queryFn: ({ pageParam = 0 }) => {
      const params = {
        ...baseParams,
        limit,
        offset: pageParam * limit,
        filters: {
          ...baseParams.filters,
          remote: 'remote' as const
        }
      };
      return JobService.getRemoteJobs(params);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * limit;
      return currentOffset < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for infinite scrolling/load more functionality for exclusive jobs
export function useInfiniteExclusiveJobs(baseParams: JobSearchParams = {}) {
  const limit = baseParams.limit || 20;
  
  return useInfiniteQuery({
    queryKey: [...jobQueryKeys.exclusive(), 'infinite', baseParams],
    queryFn: ({ pageParam = 0 }) => {
      const params = {
        ...baseParams,
        limit,
        offset: pageParam * limit,
      };
      return JobService.getExclusiveJobs(params);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * limit;
      return currentOffset < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch a single job
export function useJob(jobId: string) {
  return useQuery({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: () => JobService.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch job statistics
export function useJobStats() {
  return useQuery({
    queryKey: jobQueryKeys.stats(),
    queryFn: () => JobService.getJobsStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to search companies
export function useCompanySearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...jobQueryKeys.companies(), query],
    queryFn: () => JobService.searchCompanies(query),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to search locations
export function useLocationSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...jobQueryKeys.locations(), query],
    queryFn: () => JobService.searchLocations(query),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create a job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: CreateJobData) => JobService.createJob(jobData),
    onSuccess: (newJob) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() });
      
      // Add the new job to the cache
      queryClient.setQueryData(jobQueryKeys.detail(newJob.id), newJob);
      
      toast.success('Job created successfully!');
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    },
  });
}

// Hook to update a job
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData: UpdateJobData) => JobService.updateJob(updateData),
    onSuccess: (updatedJob) => {
      // Update the job in the cache
      queryClient.setQueryData(jobQueryKeys.detail(updatedJob.id), updatedJob);
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
      
      toast.success('Job updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating job:', error);
      toast.error('Failed to update job. Please try again.');
    },
  });
}

// Hook to delete a job
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => JobService.deleteJob(jobId),
    onSuccess: (_, jobId) => {
      // Remove the job from cache
      queryClient.removeQueries({ queryKey: jobQueryKeys.detail(jobId) });
      
      // Invalidate lists to refetch without the deleted job
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() });
      
      toast.success('Job deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job. Please try again.');
    },
  });
}

// Hook for paginated jobs loading
export function usePaginatedJobs(baseParams: JobSearchParams = {}, page: number = 0) {
  const limit = baseParams.limit || 20;
  
  const params = {
    ...baseParams,
    limit,
    offset: page * limit,
  };
  
  return useQuery({
    queryKey: [...jobQueryKeys.list(baseParams), 'paginated', page],
    queryFn: () => JobService.getJobs(params),
    staleTime: 5 * 60 * 1000,
  });
} 