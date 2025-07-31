import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmailCountService, EmailUsageStats } from '@/services/emailCountService';
import { toast } from 'sonner';

export interface UseEmailUsageReturn {
  emailUsage: EmailUsageStats;
  loading: boolean;
  error: string | null;
  refreshUsage: () => Promise<void>;
  checkCanSendEmails: (count: number) => Promise<{
    canSend: boolean;
    message?: string;
  }>;
  incrementEmailCount: (count: number) => Promise<void>;
}

export const useEmailUsage = (): UseEmailUsageReturn => {
  const { user } = useAuth();
  const [emailUsage, setEmailUsage] = useState<EmailUsageStats>({
    used: 0,
    limit: 125,
    remaining: 125,
    percentage: 0,
    canSendEmail: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsage = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const usage = await EmailCountService.getEmailUsageStats(user.id);
      setEmailUsage(usage);
    } catch (err) {
      console.error('Error fetching email usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to load email usage');
      toast.error('Failed to load email usage data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const checkCanSendEmails = useCallback(async (count: number = 1) => {
    if (!user?.id) {
      return { canSend: false, message: 'User not authenticated' };
    }

    try {
      const result = await EmailCountService.canSendEmails(user.id, count);
      return {
        canSend: result.canSend,
        message: result.message
      };
    } catch (err) {
      console.error('Error checking email send permission:', err);
      return { 
        canSend: false, 
        message: 'Error checking email limits' 
      };
    }
  }, [user?.id]);

  const incrementEmailCount = useCallback(async (count: number = 1) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await EmailCountService.incrementEmailCount(user.id, count);
      // Refresh usage after incrementing
      await refreshUsage();
    } catch (err) {
      console.error('Error incrementing email count:', err);
      throw err;
    }
  }, [user?.id, refreshUsage]);

  // Initial load
  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  return {
    emailUsage,
    loading,
    error,
    refreshUsage,
    checkCanSendEmails,
    incrementEmailCount
  };
}; 