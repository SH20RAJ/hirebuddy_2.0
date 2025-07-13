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
    queryFn: async () => {
      // If user profile is available and has enough data, use global ranking
      if (userProfile && JobRankingService.hasEnoughProfileData(userProfile)) {
        const result = await JobRankingService.getRankedJobsWithPagination(
          JobService,
          userProfile,
          params,
          0, // First page
          params.limit || 20
        );
        
        return {
          jobs: result.jobs,
          total: result.total,
          rankedJobs: result.rankedJobs
        };
      }
      
      // Otherwise return regular jobs
      const jobsResult = await JobService.getJobs(params);
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
      // If user profile is available and has enough data, use global ranking
      if (userProfile && JobRankingService.hasEnoughProfileData(userProfile)) {
        const result = await JobRankingService.getRankedJobsWithPagination(
          JobService,
          userProfile,
          baseParams,
          pageParam,
          limit
        );
        
        return {
          jobs: result.jobs,
          total: result.total,
          rankedJobs: result.rankedJobs,
          hasNextPage: result.hasNextPage
        };
      }
      
      // Otherwise fall back to regular pagination
      const params = {
        ...baseParams,
        limit,
        offset: pageParam * limit,
      };
      
      const jobsResult = await JobService.getJobs(params);
      
      return {
        jobs: jobsResult.jobs,
        total: jobsResult.total,
        rankedJobs: jobsResult.jobs.map(job => ({
          job,
          score: 50, // Default score
          matchReasons: []
        })),
        hasNextPage: (pageParam + 1) * limit < jobsResult.total
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length : undefined;
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