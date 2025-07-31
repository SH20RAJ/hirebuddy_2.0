"use client";

import { useAuth } from "@/contexts/AuthContext";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { getConfig } from "@/config/environment";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    useEffect(() => {
        // In development, bypass authentication
        if (getConfig().isDevelopment) {
            return;
        }

        // In production, enforce authentication
        if (!loading && !user) {
            redirect("/signin");
        }
    }, [user, loading]);

    // In development, bypass authentication
    if (getConfig().isDevelopment) {
        return <OnboardingWrapper>{children}</OnboardingWrapper>;
    }

    // In production, enforce authentication
    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return <OnboardingWrapper>{children}</OnboardingWrapper>;
}