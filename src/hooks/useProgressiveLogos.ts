import { useState, useEffect } from 'react';
import { CompanyLogoService } from '@/services/companyLogoService';
import { Job } from '@/types/job';

interface LogoUpdateMap {
  [jobId: string]: string;
}

export const useProgressiveLogos = (jobs: Job[]) => {
  const [logoUpdates, setLogoUpdates] = useState<LogoUpdateMap>({});
  const [loadingLogos, setLoadingLogos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    const loadLogosProgressively = async () => {
      // Clear previous updates when jobs change
      setLogoUpdates({});
      setLoadingLogos(new Set());

      // Get unique company names to avoid duplicate API calls
      const uniqueCompanies = new Map<string, Job[]>();
      jobs.forEach(job => {
        const companyKey = job.company.toLowerCase().trim();
        if (!uniqueCompanies.has(companyKey)) {
          uniqueCompanies.set(companyKey, []);
        }
        uniqueCompanies.get(companyKey)!.push(job);
      });

      console.log(`🔄 Starting progressive logo loading for ${uniqueCompanies.size} unique companies`);

      // Load logos for each unique company
      for (const [companyName, companyJobs] of uniqueCompanies) {
        // Mark these jobs as loading
        setLoadingLogos(prev => {
          const newSet = new Set(prev);
          companyJobs.forEach(job => newSet.add(job.id));
          return newSet;
        });

        try {
          // Get the real logo
          const logoResult = await CompanyLogoService.getCompanyLogo(companyName);
          
          // Only update if we got a real logo (not initials)
          if (!logoResult.isInitials && logoResult.url) {
            const updates: LogoUpdateMap = {};
            companyJobs.forEach(job => {
              updates[job.id] = logoResult.url;
            });

            setLogoUpdates(prev => ({ ...prev, ...updates }));
            console.log(`✅ Updated logo for ${companyName}: ${logoResult.source}`);
          } else {
            console.log(`ℹ️ Using fallback logo for ${companyName}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to load logo for ${companyName}:`, error);
        } finally {
          // Remove from loading set
          setLoadingLogos(prev => {
            const newSet = new Set(prev);
            companyJobs.forEach(job => newSet.delete(job.id));
            return newSet;
          });
        }

        // Small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('🎉 Progressive logo loading completed');
    };

    // Start loading logos after a small delay to let the UI render first
    const timeoutId = setTimeout(loadLogosProgressively, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [jobs]);

  // Helper function to get the current logo for a job
  const getJobLogo = (job: Job): string => {
    return logoUpdates[job.id] || job.logo || '';
  };

  // Helper function to check if a job's logo is still loading
  const isLogoLoading = (jobId: string): boolean => {
    return loadingLogos.has(jobId);
  };

  return {
    getJobLogo,
    isLogoLoading,
    logoUpdates,
    loadingCount: loadingLogos.size
  };
}; 