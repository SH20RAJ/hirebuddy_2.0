import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { premiumService, PremiumUser } from '@/services/premiumService';

export interface UsePremiumUserReturn {
  isPremium: boolean;
  premiumData: PremiumUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePremiumUser = (): UsePremiumUserReturn => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumData, setPremiumData] = useState<PremiumUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkPremiumStatus = async () => {
    if (!user?.email) {
      setIsPremium(false);
      setPremiumData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user is premium
      const isPremiumUser = await premiumService.isPremiumUser(user.email);
      setIsPremium(isPremiumUser);

      // If premium, fetch full premium data
      if (isPremiumUser) {
        const data = await premiumService.getPremiumUserData(user.email);
        setPremiumData(data);
      } else {
        setPremiumData(null);
      }
    } catch (err) {
      console.error('Error checking premium status:', err);
      setError('Failed to check premium status');
      setIsPremium(false);
      setPremiumData(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await checkPremiumStatus();
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user?.email]);

  return {
    isPremium,
    premiumData,
    loading,
    error,
    refetch
  };
}; 