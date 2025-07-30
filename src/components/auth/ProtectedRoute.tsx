'use client'

import { useAuth } from "@/contexts/AuthContext";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { getConfig } from "@/config/environment";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // In development, bypass authentication
    if (getConfig().isDevelopment) {
      return;
    }

    // In production, enforce authentication
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // In development, bypass authentication
  if (getConfig().isDevelopment) {
    return <OnboardingWrapper>{children}</OnboardingWrapper>;
  }

  // In production, enforce authentication
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return <OnboardingWrapper>{children}</OnboardingWrapper>;
};