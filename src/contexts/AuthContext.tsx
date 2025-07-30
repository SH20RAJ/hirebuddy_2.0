'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isNewUser } from '@/lib/utils';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isFirstTimeUser: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  markUserAsReturning: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user is new and handle redirection
  const handleUserAuth = (user: User | null) => {
    if (user) {
      const isNew = isNewUser(user);
      setIsFirstTimeUser(isNew);
      
      // Store new user flag in localStorage for persistence across page reloads
      if (isNew) {
        localStorage.setItem('isFirstTimeUser', 'true');
        // Set a timeout to redirect to profile page after auth completes
        setTimeout(() => {
          if (window.location.pathname !== '/profile') {
            window.location.href = '/profile?newUser=true';
          }
        }, 1000);
      }
    } else {
      setIsFirstTimeUser(false);
      localStorage.removeItem('isFirstTimeUser');
    }
  };

  useEffect(() => {
    // Get session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is new on initial load
      if (session?.user) {
        handleUserAuth(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle new user detection on auth state change
        if (event === 'SIGNED_IN' && session?.user) {
          handleUserAuth(session.user);
        } else if (event === 'SIGNED_OUT') {
          setIsFirstTimeUser(false);
          localStorage.removeItem('isFirstTimeUser');
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check localStorage on mount to restore first time user state
  useEffect(() => {
    const storedFirstTimeUser = localStorage.getItem('isFirstTimeUser');
    if (storedFirstTimeUser === 'true') {
      setIsFirstTimeUser(true);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data: data.session, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data: data.session, error };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
  };

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const markUserAsReturning = () => {
    setIsFirstTimeUser(false);
    localStorage.removeItem('isFirstTimeUser');
  };

  const value = {
    session,
    user,
    loading,
    isFirstTimeUser,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    markUserAsReturning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}