import { supabase } from '@/lib/supabase';

export interface PremiumUser {
  id: number;
  created_at: string;
  email: string;
  name: string;
  phone: string;
  zoom_id: string;
  designation: string;
  order_id: string;
  amount: number;
}

export const premiumService = {
  /**
   * Check if a user is premium by email
   */
  async isPremiumUser(email: string): Promise<boolean> {
    if (!email) return false;
    
    try {
      const { data, error } = await supabase
        .from('paid_users')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  },

  /**
   * Get premium user data by email
   */
  async getPremiumUserData(email: string): Promise<PremiumUser | null> {
    if (!email) return null;
    
    try {
      const { data, error } = await supabase
        .from('paid_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching premium user data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching premium user data:', error);
      return null;
    }
  },

  /**
   * Get all premium users (admin only)
   */
  async getAllPremiumUsers(): Promise<PremiumUser[]> {
    try {
      const { data, error } = await supabase
        .from('paid_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all premium users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all premium users:', error);
      return [];
    }
  },

  /**
   * Add a new premium user
   */
  async addPremiumUser(userData: Omit<PremiumUser, 'id' | 'created_at'>): Promise<PremiumUser | null> {
    try {
      const { data, error } = await supabase
        .from('paid_users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error adding premium user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding premium user:', error);
      return null;
    }
  },

  /**
   * Update premium user data
   */
  async updatePremiumUser(id: number, updates: Partial<Omit<PremiumUser, 'id' | 'created_at'>>): Promise<PremiumUser | null> {
    try {
      const { data, error } = await supabase
        .from('paid_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating premium user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating premium user:', error);
      return null;
    }
  },

  /**
   * Remove premium user
   */
  async removePremiumUser(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('paid_users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing premium user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing premium user:', error);
      return false;
    }
  }
}; 