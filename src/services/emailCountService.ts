import { supabase } from '@/lib/supabase';

export interface EmailCountData {
  id: string;
  created_at: string;
  total_count: number;
  user_id: string;
  email_limit: number;
}

export interface EmailUsageStats {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  canSendEmail: boolean;
}

export class EmailCountService {
  /**
   * Get or create email count record for a user
   */
  static async getEmailCount(userId: string): Promise<EmailCountData> {
    try {
      // Try to get existing record
      const { data: existingRecord, error: selectError } = await supabase
        .from('totalemailcounttable')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingRecord && !selectError) {
        return existingRecord;
      }

      // If no record exists, create one
      const { data: newRecord, error: insertError } = await supabase
        .from('totalemailcounttable')
        .insert([{
          user_id: userId,
          total_count: 0,
          email_limit: 125
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create email count record: ${insertError.message}`);
      }

      return newRecord;
    } catch (error) {
      console.error('Error in getEmailCount:', error);
      throw error;
    }
  }

  /**
   * Get email usage statistics for a user
   */
  static async getEmailUsageStats(userId: string): Promise<EmailUsageStats> {
    try {
      // Get the email limit from totalemailcounttable (or create record if needed)
      const emailCountRecord = await this.getEmailCount(userId);
      const limit = emailCountRecord.email_limit;

      // Count actual emails sent from useremaillog table
      // Note: useremaillog uses email as user_id, but our service uses Supabase user ID
      // We need to get the user's email first
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;

      if (!userEmail) {
        throw new Error('User email not found');
      }

      const { data: emailLogs, error } = await supabase
        .from('useremaillog')
        .select('id')
        .eq('user_id', userEmail); // useremaillog uses email as user_id

      if (error) {
        console.error('Error counting emails from useremaillog:', error);
        // Fallback to stored count if useremaillog query fails
        const used = emailCountRecord.total_count;
        const remaining = Math.max(0, limit - used);
        const percentage = Math.min(100, (used / limit) * 100);
        const canSendEmail = used < limit;

        return {
          used,
          limit,
          remaining,
          percentage,
          canSendEmail
        };
      }

      const used = emailLogs ? emailLogs.length : 0;
      const remaining = Math.max(0, limit - used);
      const percentage = Math.min(100, (used / limit) * 100);
      const canSendEmail = used < limit;

      // Sync the count in totalemailcounttable for consistency
      if (emailCountRecord.total_count !== used) {
        await supabase
          .from('totalemailcounttable')
          .update({ total_count: used })
          .eq('user_id', userId);
      }

      return {
        used,
        limit,
        remaining,
        percentage,
        canSendEmail
      };
    } catch (error) {
      console.error('Error getting email usage stats:', error);
      // Return safe defaults in case of error
      return {
        used: 0,
        limit: 125,
        remaining: 125,
        percentage: 0,
        canSendEmail: true
      };
    }
  }

  /**
   * Increment email count by specified amount
   * Note: This is now primarily used for manual count updates.
   * In most cases, emails are automatically logged to useremaillog table.
   */
  static async incrementEmailCount(userId: string, emailsSent: number = 1): Promise<EmailCountData> {
    try {
      // Since we now count from useremaillog table, we don't need to manually increment
      // But we'll keep this method for backward compatibility and manual adjustments
      const currentRecord = await this.getEmailCount(userId);
      
      // Get actual count from useremaillog
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;

      if (!userEmail) {
        throw new Error('User email not found');
      }

      const { data: emailLogs, error: emailError } = await supabase
        .from('useremaillog')
        .select('id')
        .eq('user_id', userEmail);

      if (emailError) {
        console.warn('Could not count from useremaillog, using manual increment:', emailError);
        // Fallback to manual increment
        const newCount = currentRecord.total_count + emailsSent;
        
        const { data: updatedRecord, error } = await supabase
          .from('totalemailcounttable')
          .update({ 
            total_count: newCount,
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to increment email count: ${error.message}`);
        }

        return updatedRecord;
      }

      // Sync the actual count from useremaillog
      const actualCount = emailLogs ? emailLogs.length : 0;
      const { data: updatedRecord, error } = await supabase
        .from('totalemailcounttable')
        .update({ 
          total_count: actualCount,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to sync email count: ${error.message}`);
      }

      return updatedRecord;
    } catch (error) {
      console.error('Error incrementing email count:', error);
      throw error;
    }
  }

  /**
   * Check if user can send specified number of emails
   */
  static async canSendEmails(userId: string, emailsToSend: number = 1): Promise<{
    canSend: boolean;
    currentUsage: EmailUsageStats;
    message?: string;
  }> {
    try {
      const usage = await this.getEmailUsageStats(userId);
      
      if (usage.remaining >= emailsToSend) {
        return {
          canSend: true,
          currentUsage: usage
        };
      }

      return {
        canSend: false,
        currentUsage: usage,
        message: `You can only send ${usage.remaining} more emails. You've used ${usage.used} out of ${usage.limit} emails.`
      };
    } catch (error) {
      console.error('Error checking email send permission:', error);
      return {
        canSend: false,
        currentUsage: {
          used: 0,
          limit: 125,
          remaining: 125,
          percentage: 0,
          canSendEmail: true
        },
        message: 'Error checking email limits. Please try again.'
      };
    }
  }

  /**
   * Reset email count for a user (admin function or subscription renewal)
   */
  static async resetEmailCount(userId: string, newLimit: number = 125): Promise<EmailCountData> {
    try {
      // First ensure user has a record
      await this.getEmailCount(userId);
      
      const { data: updatedRecord, error } = await supabase
        .from('totalemailcounttable')
        .update({ 
          total_count: 0,
          email_limit: newLimit,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reset email count: ${error.message}`);
      }

      return updatedRecord;
    } catch (error) {
      console.error('Error resetting email count:', error);
      throw error;
    }
  }

  /**
   * Update email limit for a user
   */
  static async updateEmailLimit(userId: string, newLimit: number): Promise<EmailCountData> {
    try {
      // First ensure user has a record
      await this.getEmailCount(userId);
      
      const { data: updatedRecord, error } = await supabase
        .from('totalemailcounttable')
        .update({ 
          email_limit: newLimit,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update email limit: ${error.message}`);
      }

      return updatedRecord;
    } catch (error) {
      console.error('Error updating email limit:', error);
      throw error;
    }
  }
} 