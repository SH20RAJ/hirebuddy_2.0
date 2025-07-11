import { useState, useEffect, useCallback, useRef } from 'react';
import { Job } from '@/types/job';

interface PendingApplication {
  job: Job;
  timestamp: number;
  tabId?: string;
}

interface UseApplicationConfirmationProps {
  onConfirmApplication: (job: Job) => Promise<void>;
}

export const useApplicationConfirmation = ({ onConfirmApplication }: UseApplicationConfirmationProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track the last time user left the page
  const lastVisibilityChange = useRef<number>(0);
  const pendingApplications = useRef<Map<string, PendingApplication>>(new Map());
  
  // Key for localStorage
  const STORAGE_KEY = 'hirebuddy_pending_applications';
  const POPUP_DELAY = 2000; // 2 seconds delay before showing popup
  const APPLICATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes timeout

  // Load pending applications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Filter out expired applications
        Object.entries(data).forEach(([jobId, app]: [string, any]) => {
          if (now - app.timestamp < APPLICATION_TIMEOUT) {
            pendingApplications.current.set(jobId, app);
          }
        });
        
        // Clean up localStorage
        savePendingApplications();
      }
    } catch (error) {
      console.error('Error loading pending applications:', error);
    }
  }, []);

  // Save pending applications to localStorage
  const savePendingApplications = useCallback(() => {
    try {
      const data: Record<string, PendingApplication> = {};
      pendingApplications.current.forEach((app, jobId) => {
        data[jobId] = app;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving pending applications:', error);
    }
  }, []);

  // Track when user clicks an external apply link
  const trackExternalApplication = useCallback((job: Job) => {
    const now = Date.now();
    const tabId = `${job.id}_${now}`;
    
    pendingApplications.current.set(job.id, {
      job,
      timestamp: now,
      tabId
    });
    
    savePendingApplications();
    
    // Store the job ID in sessionStorage to track across page visibility changes
    sessionStorage.setItem('hirebuddy_last_external_job', job.id);
    sessionStorage.setItem('hirebuddy_external_timestamp', now.toString());
  }, [savePendingApplications]);

  // Check for pending applications when user returns to the page
  const checkForPendingApplications = useCallback(() => {
    const lastJobId = sessionStorage.getItem('hirebuddy_last_external_job');
    const lastTimestamp = sessionStorage.getItem('hirebuddy_external_timestamp');
    
    if (!lastJobId || !lastTimestamp) return;
    
    const timestamp = parseInt(lastTimestamp);
    const now = Date.now();
    const timeDiff = now - timestamp;
    
    // Only show popup if:
    // 1. Less than 30 minutes have passed
    // 2. More than 5 seconds have passed (user had time to apply)
    // 3. We have a pending application for this job
    if (timeDiff < APPLICATION_TIMEOUT && timeDiff > 5000) {
      const pendingApp = pendingApplications.current.get(lastJobId);
      
      if (pendingApp && !isPopupOpen) {
        // Clean up session storage
        sessionStorage.removeItem('hirebuddy_last_external_job');
        sessionStorage.removeItem('hirebuddy_external_timestamp');
        
        // Show popup after a delay
        setTimeout(() => {
          setPendingJob(pendingApp.job);
          setIsPopupOpen(true);
        }, POPUP_DELAY);
      }
    }
  }, [isPopupOpen]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceLastChange = now - lastVisibilityChange.current;
        
        // If user was away for more than 5 seconds, check for pending applications
        if (timeSinceLastChange > 5000) {
          checkForPendingApplications();
        }
        
        lastVisibilityChange.current = now;
      } else {
        lastVisibilityChange.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check when the hook first loads (page refresh/navigation)
    setTimeout(checkForPendingApplications, 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForPendingApplications]);

  // Handle window focus (additional detection method)
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;
      
      if (timeSinceLastChange > 5000) {
        checkForPendingApplications();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkForPendingApplications]);

  // Confirm application
  const confirmApplication = useCallback(async () => {
    if (!pendingJob) return;
    
    setIsSubmitting(true);
    
    try {
      await onConfirmApplication(pendingJob);
      
      // Remove from pending applications
      pendingApplications.current.delete(pendingJob.id);
      savePendingApplications();
      
      // Close popup after a delay to show success state
      setTimeout(() => {
        setIsPopupOpen(false);
        setPendingJob(null);
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error confirming application:', error);
      setIsSubmitting(false);
    }
  }, [pendingJob, onConfirmApplication, savePendingApplications]);

  // Deny application
  const denyApplication = useCallback(() => {
    if (!pendingJob) return;
    
    // Remove from pending applications
    pendingApplications.current.delete(pendingJob.id);
    savePendingApplications();
    
    // Close popup
    setIsPopupOpen(false);
    setPendingJob(null);
    setIsSubmitting(false);
  }, [pendingJob, savePendingApplications]);

  // Close popup
  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setPendingJob(null);
    setIsSubmitting(false);
  }, []);

  // Clean up expired applications periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      let hasChanges = false;
      
      pendingApplications.current.forEach((app, jobId) => {
        if (now - app.timestamp > APPLICATION_TIMEOUT) {
          pendingApplications.current.delete(jobId);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        savePendingApplications();
      }
    };

    // Clean up every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [savePendingApplications]);

  return {
    isPopupOpen,
    pendingJob,
    isSubmitting,
    trackExternalApplication,
    confirmApplication,
    denyApplication,
    closePopup
  };
}; 