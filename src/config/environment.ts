/**
 * Environment Configuration
 * 
 * This file manages environment variables safely:
 * - Public configs are exposed (safe for client-side)
 * - Private configs are handled via server-side functions only
 */

interface PublicConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  google: {
    clientId: string;
  };
  api: {
    baseUrl: string;
    awsBaseUrl: string;
  };
  stack: {
    publishableKey: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

// Only expose truly public configuration
// NO sensitive keys should be here
export const config: PublicConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    awsBaseUrl: import.meta.env.VITE_AWS_API_BASE_URL || '',
  },
  stack: {
    publishableKey: import.meta.env.VITE_STACK_PUBLISHABLE_KEY || '',
  },
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.PROD,
};

// Validation helper to ensure required public configs are present
export function validatePublicConfig(): { isValid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  
  if (!config.supabase.url) missingVars.push('VITE_SUPABASE_URL');
  if (!config.supabase.anonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  if (!config.google.clientId) missingVars.push('VITE_GOOGLE_CLIENT_ID');
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

// Helper to get config values safely
export function getConfig(): PublicConfig {
  const validation = validatePublicConfig();
  
  if (!validation.isValid) {
    console.error('Missing required environment variables:', validation.missingVars);
    throw new Error(`Missing required environment variables: ${validation.missingVars.join(', ')}`);
  }
  
  return config;
}

// For development debugging only
if (config.isDevelopment) {
  console.log('🔧 Environment Config:', {
    supabaseUrl: config.supabase.url ? '✓ Present' : '❌ Missing',
    supabaseKey: config.supabase.anonKey ? '✓ Present' : '❌ Missing',
    googleClientId: config.google.clientId ? '✓ Present' : '❌ Missing',
    apiBaseUrl: config.api.baseUrl ? '✓ Present' : '❌ Missing',
  });
} 