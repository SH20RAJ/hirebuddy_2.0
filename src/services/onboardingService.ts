import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  preferred_roles: string[] | null;
  experience_level: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_max: number | null;
  job_search_urgency: string | null;
  career_goals: string[] | null;
  created_at: string;
  updated_at: string;
}

export class OnboardingService {
  /**
   * Check if user needs to complete onboarding
   */
  static async checkOnboardingStatus(user: User): Promise<{
    needsOnboarding: boolean;
    profile: UserProfile | null;
  }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        return { needsOnboarding: true, profile: null };
      }

      // If profile doesn't exist or onboarding is not completed, needs onboarding
      const needsOnboarding = !profile || !profile.onboarding_completed;

      return { needsOnboarding, profile };
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      return { needsOnboarding: true, profile: null };
    }
  }

  /**
   * Create initial user profile if it doesn't exist
   */
  static async createInitialProfile(user: User): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          onboarding_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating initial profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in createInitialProfile:', error);
      return null;
    }
  }

  /**
   * Complete onboarding with user data
   */
  static async completeOnboarding(
    userId: string,
    onboardingData: {
      job_search_urgency: 'rush' | 'open';
      preferred_roles: string[];
      experience_level: 'student' | 'entry' | 'mid' | 'senior' | 'leadership';
      work_mode: 'remote' | 'hybrid' | 'onsite';
      salary_min: number;
      salary_max: number;
      career_goals?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...onboardingData,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error completing onboarding:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in completeOnboarding:', error);
      return { success: false, error: 'Failed to complete onboarding' };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }
} 