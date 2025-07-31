import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobApplicationService, CreateJobApplicationData } from '@/services/jobApplicationService';
import { JobApplication } from '@/types/job';
import { UserProfile, UserExperience } from '@/services/profileService';
import { toast } from 'sonner';

// Query keys
export const jobApplicationQueryKeys = {
  all: ['jobApplications'] as const,
  lists: () => [...jobApplicationQueryKeys.all, 'list'] as const,
  list: (params: any) => [...jobApplicationQueryKeys.lists(), params] as const,
  userApplications: (userId: string) => [...jobApplicationQueryKeys.all, 'user', userId] as const,
  adminApplications: () => [...jobApplicationQueryKeys.all, 'admin'] as const,
  adminList: (params: any) => [...jobApplicationQueryKeys.adminApplications(), params] as const,
  stats: () => [...jobApplicationQueryKeys.all, 'stats'] as const,
  hasApplied: (userId: string, jobId: string) => [...jobApplicationQueryKeys.all, 'hasApplied', userId, jobId] as const,
};

// Hook to check if user has applied to a job
export function useHasApplied(userId: string | undefined, jobId: string) {
  return useQuery({
    queryKey: jobApplicationQueryKeys.hasApplied(userId || '', jobId),
    queryFn: () => JobApplicationService.hasUserApplied(userId!, jobId),
    enabled: !!userId && !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get user's applications
export function useUserApplications(userId: string | undefined) {
  return useQuery({
    queryKey: jobApplicationQueryKeys.userApplications(userId || ''),
    queryFn: () => JobApplicationService.getUserApplications(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to create a job application
export function useCreateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userEmail,
      jobData,
      userProfile,
      userExperiences = []
    }: {
      userId: string;
      userEmail: string;
      jobData: CreateJobApplicationData;
      userProfile: UserProfile;
      userExperiences?: UserExperience[];
    }) => {
      return JobApplicationService.createApplication(userId, userEmail, jobData, userProfile, userExperiences);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.userApplications(variables.userId) });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.hasApplied(variables.userId, variables.jobData.job_id) });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.adminApplications() });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.stats() });
      
      toast.success('Application submitted successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating application:', error);
      toast.error(error.message || 'Failed to submit application');
    },
  });
}

// Hook to create a regular job application (for external jobs)
export function useCreateRegularApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userEmail,
      job,
      userProfile
    }: {
      userId: string;
      userEmail: string;
      job: {
        id: string;
        title: string;
        company: string;
        location?: string;
        applyLink?: string;
      };
      userProfile?: UserProfile;
    }) => {
      return JobApplicationService.createRegularApplication(userId, userEmail, job, userProfile);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.userApplications(variables.userId) });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.hasApplied(variables.userId, variables.job.id) });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.adminApplications() });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.stats() });
      
      toast.success('Application tracked successfully!');
    },
    onError: (error: any) => {
      console.error('Error tracking regular application:', error);
      toast.error(error.message || 'Failed to track application');
    },
  });
}

// Admin hooks
// Hook to get all applications (admin only)
export function useAdminApplications(params: {
  status?: string;
  jobId?: string;
  companyName?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery({
    queryKey: jobApplicationQueryKeys.adminList(params),
    queryFn: () => JobApplicationService.getAllApplications(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook to update application status (admin only)
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      adminNotes,
      reviewedBy
    }: {
      applicationId: string;
      status: JobApplication['status'];
      adminNotes?: string;
      reviewedBy?: string;
    }) => {
      return JobApplicationService.updateApplicationStatus(applicationId, status, adminNotes, reviewedBy);
    },
    onSuccess: () => {
      // Invalidate all admin queries
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.adminApplications() });
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.stats() });
      
      toast.success('Application status updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating application status:', error);
      toast.error(error.message || 'Failed to update application status');
    },
  });
}

// Hook to get application statistics
export function useApplicationStats() {
  return useQuery({
    queryKey: jobApplicationQueryKeys.stats(),
    queryFn: () => JobApplicationService.getApplicationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 