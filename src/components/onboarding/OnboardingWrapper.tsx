import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingService } from '@/services/onboardingService';
import { OnboardingFlow } from './OnboardingFlow';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { needsOnboarding } = await OnboardingService.checkOnboardingStatus(user);
        
        if (needsOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/dashboard');
  };

  // Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div className="fixed inset-0 bg-[#fff7f8] flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#b24e55] mx-auto" />
          <p className="text-lg text-[#4A3D55]">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  // Show onboarding flow if needed
  if (showOnboarding && user) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Otherwise, show the normal app
  return <>{children}</>;
}; 