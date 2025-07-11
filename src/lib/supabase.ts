import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase Configuration Check:');
console.log('- Environment Mode:', import.meta.env.MODE);
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? `✓ Present (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✓ Present (${supabaseAnonKey.length} chars)` : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key is missing. Please check your environment variables.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  console.error('Available environment variables:', Object.keys(import.meta.env));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'hirebuddy-dashboard',
    },
  },
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('hirebuddy_job_board')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};