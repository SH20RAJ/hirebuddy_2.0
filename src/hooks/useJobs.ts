import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobService } from '@/services/jobService';
import { Job, JobSearchParams, CreateJobData, UpdateJobData } from '@/types/job';
import { toast } from 'sonner';

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
};

// Hook to fetch jobs with search and filters
export function useJobs(params: JobSearchParams = {}) {
  return useQuery({
    queryKey: jobQueryKeys.list(params),
    queryFn: () => JobService.getJobs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch exclusive jobs with search and filters
export function useExclusiveJobs(params: JobSearchParams = {}) {
  return useQuery({
    queryKey: jobQueryKeys.exclusiveList(params),
    queryFn: () => JobService.getExclusiveJobs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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