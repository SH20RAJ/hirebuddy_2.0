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
      const emailCount = await this.getEmailCount(userId);
      
      const used = emailCount.total_count;
      const limit = emailCount.email_limit;
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
   */
  static async incrementEmailCount(userId: string, emailsSent: number = 1): Promise<EmailCountData> {
    try {
      const currentRecord = await this.getEmailCount(userId);
      
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