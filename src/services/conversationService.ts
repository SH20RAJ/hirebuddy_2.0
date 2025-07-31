import { supabase } from '@/lib/supabase';
import emailService from './emailService';

export interface EmailConversation {
  id: string;
  user_id: string;
  contact_id: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  email_type: 'outbound' | 'inbound' | 'follow_up';
  thread_id?: string;
  message_id?: string;
  sent_at: string;
  read_at?: string;
  replied_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ConversationThread {
  id: string;
  user_id: string;
  contact_id: string;
  subject: string;
  last_email_at: string;
  email_count: number;
  status: 'active' | 'archived' | 'closed';
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
    position?: string;
  };
}

export interface ContactWithConversation {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  last_email_at?: string;
  email_count: number;
  status: string;
}

class ConversationService {
  /**
   * Get all contacts that have conversation history with the current user
   * Uses the useremaillog table to find contacts the user has sent emails to
   */
  async getContactsWithConversations(): Promise<ContactWithConversation[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      console.log('Getting contacts with conversations for user:', user.user.email);

      // First, get all email logs for this user from useremaillog table
      let emailLogs: any[] = [];
      try {
        const { data: logs, error } = await supabase
          .from('useremaillog')
          .select('*')
          .eq('user_id', user.user.email) // useremaillog uses email as user_id
          .order('sent_at', { ascending: false });

        if (error) {
          console.warn('Could not fetch from useremaillog table:', error);
        } else {
          emailLogs = logs || [];
          console.log('Found email logs for conversations:', emailLogs.length);
        }
      } catch (dbError) {
        console.warn('useremaillog table might not exist:', dbError);
      }

      // Also get follow-up logs for this user from followuplogs table
      let followupLogs: any[] = [];
      try {
        const { data: logs, error } = await supabase
          .from('followuplogs')
          .select('*')
          .eq('user_id', user.user.email) // followuplogs uses email as user_id
          .order('sent_at', { ascending: false });

        if (error) {
          console.warn('Could not fetch from followuplogs table:', error);
        } else {
          followupLogs = logs || [];
          console.log('Found follow-up logs for conversations:', followupLogs.length);
        }
      } catch (dbError) {
        console.warn('followuplogs table might not exist:', dbError);
      }

      // Get all contacts to match with email logs
      const { contactsService } = await import('./contactsService');
      const allContacts = await contactsService.getContacts();

      if (allContacts.length === 0) {
        console.warn('No contacts found in the system');
        return [];
      }

      console.log('Total contacts in system:', allContacts.length);

      // Create a map of email addresses to contact info
      const contactsByEmail = new Map();
      allContacts.forEach(contact => {
        contactsByEmail.set(contact.email.toLowerCase(), contact);
      });

      // Process email logs to find contacts with conversations
      const contactsWithConversations: ContactWithConversation[] = [];
      const processedEmails = new Set<string>();

      // Combine all email logs (both initial and follow-up) to get unique recipient emails
      const allEmailRecipients = new Set<string>();
      
      // Add recipients from initial email logs
      emailLogs.forEach(log => {
        if (log.to) {
          allEmailRecipients.add(log.to.toLowerCase());
        }
      });
      
      // Add recipients from follow-up logs
      followupLogs.forEach(log => {
        if (log.to) {
          allEmailRecipients.add(log.to.toLowerCase());
        }
      });

      for (const recipientEmail of allEmailRecipients) {
        if (processedEmails.has(recipientEmail)) {
          continue;
        }

        const contact = contactsByEmail.get(recipientEmail);
        if (contact) {
          // Count emails sent to this contact from useremaillog
          const initialEmailCount = emailLogs.filter(l => l.to?.toLowerCase() === recipientEmail).length;
          
          // Count follow-up emails sent to this contact from followuplogs
          const followupEmailsForContact = followupLogs.filter(l => l.to?.toLowerCase() === recipientEmail);
          let followupEmailCount = 0;
          followupEmailsForContact.forEach(log => {
            const count = parseInt(log.followup_count) || 1;
            followupEmailCount += count;
          });
          
          // Total email count includes both initial emails and follow-ups
          const totalEmailCount = initialEmailCount + followupEmailCount;
          
          // Get the most recent email date for this contact (check both email logs and follow-up logs)
          const recentInitialEmails = emailLogs
            .filter(l => l.to?.toLowerCase() === recipientEmail)
            .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
          
          const recentFollowupEmails = followupLogs
            .filter(l => l.to?.toLowerCase() === recipientEmail)
            .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
          
          // Find the most recent date between initial and follow-up emails
          const lastInitialEmailAt = recentInitialEmails.length > 0 ? recentInitialEmails[0].sent_at : '';
          const lastFollowupEmailAt = recentFollowupEmails.length > 0 ? recentFollowupEmails[0].sent_at : '';
          
          let lastEmailAt = lastInitialEmailAt;
          if (lastFollowupEmailAt && (!lastInitialEmailAt || new Date(lastFollowupEmailAt) > new Date(lastInitialEmailAt))) {
            lastEmailAt = lastFollowupEmailAt;
          }

          contactsWithConversations.push({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            company: contact.company,
            position: contact.title,
            last_email_at: lastEmailAt,
            email_count: totalEmailCount,
            status: 'active'
          });

          processedEmails.add(recipientEmail);
        } else {
          // Create a contact entry for emails sent to addresses not in contacts
          if (!processedEmails.has(recipientEmail)) {
            // Count emails sent to this contact from useremaillog
            const initialEmailCount = emailLogs.filter(l => l.to?.toLowerCase() === recipientEmail).length;
            
            // Count follow-up emails sent to this contact from followuplogs
            const followupEmailsForContact = followupLogs.filter(l => l.to?.toLowerCase() === recipientEmail);
            let followupEmailCount = 0;
            followupEmailsForContact.forEach(log => {
              const count = parseInt(log.followup_count) || 1;
              followupEmailCount += count;
            });
            
            // Total email count includes both initial emails and follow-ups
            const totalEmailCount = initialEmailCount + followupEmailCount;
            
            // Get the most recent email date for this contact
            const recentInitialEmails = emailLogs
              .filter(l => l.to?.toLowerCase() === recipientEmail)
              .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
            
            const recentFollowupEmails = followupLogs
              .filter(l => l.to?.toLowerCase() === recipientEmail)
              .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
            
            // Find the most recent date between initial and follow-up emails
            const lastInitialEmailAt = recentInitialEmails.length > 0 ? recentInitialEmails[0].sent_at : '';
            const lastFollowupEmailAt = recentFollowupEmails.length > 0 ? recentFollowupEmails[0].sent_at : '';
            
            let lastEmailAt = lastInitialEmailAt;
            if (lastFollowupEmailAt && (!lastInitialEmailAt || new Date(lastFollowupEmailAt) > new Date(lastInitialEmailAt))) {
              lastEmailAt = lastFollowupEmailAt;
            }

            contactsWithConversations.push({
              id: `email-${recipientEmail}`,
              name: recipientEmail.split('@')[0],
              email: recipientEmail,
              company: undefined,
              position: undefined,
              last_email_at: lastEmailAt,
              email_count: totalEmailCount,
              status: 'active'
            });

            processedEmails.add(recipientEmail);
          }
        }
      }

      console.log('Total contacts with conversations:', contactsWithConversations.length);

      // Sort by most recent email first
      return contactsWithConversations.sort((a, b) => {
        if (!a.last_email_at) return 1;
        if (!b.last_email_at) return -1;
        return new Date(b.last_email_at).getTime() - new Date(a.last_email_at).getTime();
      });

    } catch (error) {
      console.error('Error fetching contacts with conversations:', error);
      return [];
    }
  }

  /**
   * Get conversation history for a specific contact
   * This method combines useremaillog data with Gmail API data
   */
  async getConversationHistory(contactId: string, senderEmail?: string, recipientEmail?: string): Promise<EmailConversation[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      console.log('Getting conversation history for contact:', contactId);

      // Get contact details if not provided
      if (!recipientEmail && contactId) {
        try {
          // Check if this is a generated email contact ID
          if (contactId.startsWith('email-')) {
            recipientEmail = contactId.replace('email-', '');
          } else {
            const { contactsService } = await import('./contactsService');
            const allContacts = await contactsService.getContacts();
            const contact = allContacts.find(c => c.id === contactId);
            if (contact) {
              recipientEmail = contact.email;
            }
          }
        } catch (error) {
          console.warn('Could not fetch contact details:', error);
        }
      }

      // Get sender email if not provided
      if (!senderEmail) {
        senderEmail = user.user.email;
      }

      console.log('Conversation params:', { senderEmail, recipientEmail });

      let allConversations: EmailConversation[] = [];

      // First, get emails from useremaillog table for outbound emails
      if (recipientEmail) {
        try {
          const { data: emailLogs, error } = await supabase
            .from('useremaillog')
            .select('*')
            .eq('user_id', user.user.email)
            .eq('to', recipientEmail)
            .order('sent_at', { ascending: true });

          if (!error && emailLogs) {
            console.log('Found email logs from useremaillog:', emailLogs.length);
            
            // Transform useremaillog entries to EmailConversation format
            const logConversations = emailLogs.map((log, index) => ({
              id: log.id?.toString() || `log-${index}-${Date.now()}`,
              user_id: user.user.id,
              contact_id: contactId,
              sender_email: senderEmail || user.user.email,
              recipient_email: recipientEmail,
              subject: log.subject || 'No Subject',
              body: log.body || log.content || '', // Try to get body from log if available
              email_type: 'outbound' as const,
              thread_id: log.threadId,
              message_id: log.messageId,
              sent_at: log.sent_at,
              created_at: log.sent_at,
              updated_at: log.sent_at,
              metadata: {
                reference: log.reference,
                source: 'useremaillog'
              }
            }));

            allConversations = [...allConversations, ...logConversations];
          }
        } catch (dbError) {
          console.warn('Could not fetch from useremaillog table:', dbError);
        }

        // Also get follow-up emails from followuplogs table
        try {
          const { data: followupLogs, error } = await supabase
            .from('followuplogs')
            .select('*')
            .eq('user_id', user.user.email)
            .eq('to', recipientEmail)
            .order('sent_at', { ascending: true });

          if (!error && followupLogs) {
            console.log('Found follow-up logs from followuplogs:', followupLogs.length);
            
            // Transform followuplogs entries to EmailConversation format
            const followupConversations = followupLogs.map((log, index) => ({
              id: log.id?.toString() || `followup-${index}-${Date.now()}`,
              user_id: user.user.id,
              contact_id: contactId,
              sender_email: senderEmail || user.user.email,
              recipient_email: recipientEmail,
              subject: log.subject || `Follow-up Email ${log.followup_count ? `(#${log.followup_count})` : ''}`,
              body: log.body || log.content || '', // Try to get body from log if available
              email_type: 'follow_up' as const,
              thread_id: undefined,
              message_id: undefined,
              sent_at: log.sent_at,
              created_at: log.sent_at,
              updated_at: log.sent_at,
              metadata: {
                followup_count: log.followup_count,
                source: 'followuplogs'
              }
            }));

            allConversations = [...allConversations, ...followupConversations];
          }
        } catch (dbError) {
          console.warn('Could not fetch from followuplogs table:', dbError);
        }
      }

      // Also try to get conversation history from local email_conversations table (if exists)
      try {
        const { data, error } = await supabase
          .from('email_conversations')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('contact_id', contactId)
          .order('sent_at', { ascending: true });

        if (!error && data) {
          console.log('Found local conversations:', data.length);
          
          // Merge with existing conversations, avoiding duplicates
          const existingMessageIds = new Set(allConversations.map(c => c.message_id).filter(Boolean));
          const newLocalConversations = data.filter(c => 
            !c.message_id || !existingMessageIds.has(c.message_id)
          );
          
          allConversations = [...allConversations, ...newLocalConversations];
        }
      } catch (dbError) {
        console.warn('Could not fetch from local email_conversations table:', dbError);
      }

      // ENHANCED: Get full conversation thread including replies from Gmail API
      if (senderEmail && recipientEmail) {
        try {
          console.log('Fetching conversation thread from Gmail API:', { senderEmail, recipientEmail });
          
          const gmailConversations = await emailService.getEmailConversation({
            sender: senderEmail,
            to: recipientEmail
          });

          console.log('Gmail API response:', gmailConversations);

          if (gmailConversations && gmailConversations.length > 0) {
            // Transform Gmail API response to match our interface
            const transformedGmailConversations = gmailConversations.map((email, index) => {
              // Determine email type based on sender - this is crucial for showing replies correctly
              let emailType: 'outbound' | 'inbound' | 'follow_up' = 'inbound';
              const emailFromUser = email.from?.toLowerCase() === senderEmail?.toLowerCase();
              const emailFromRecipient = email.from?.toLowerCase() === recipientEmail?.toLowerCase();
              
              if (emailFromUser) {
                emailType = 'outbound';
              } else if (emailFromRecipient) {
                emailType = 'inbound'; // This is a reply from the recipient
              }

              // Determine actual sender and recipient emails
              const actualSenderEmail = email.from || (emailFromUser ? senderEmail : recipientEmail);
              const actualRecipientEmail = email.to || (emailFromUser ? recipientEmail : senderEmail);

              console.log('Processing Gmail email:', {
                emailId: email.id,
                from: email.from,
                to: email.to,
                subject: email.subject,
                emailType,
                bodyLength: email.body?.length || 0
              });

              return {
                id: email.id || `gmail-${index}-${Date.now()}`,
                user_id: user.user.id,
                contact_id: contactId,
                sender_email: actualSenderEmail,
                recipient_email: actualRecipientEmail,
                subject: email.subject || 'No Subject',
                body: email.body || '',
                email_type: emailType,
                thread_id: email.thread_id || email.id,
                message_id: email.id,
                sent_at: email.date || new Date().toISOString(),
                created_at: email.date || new Date().toISOString(),
                updated_at: email.date || new Date().toISOString(),
                metadata: {
                  source: 'gmail_api',
                  original_from: email.from,
                  original_to: email.to,
                  is_reply: emailFromRecipient,
                  thread_id: email.thread_id
                }
              };
            });

            // Enhanced deduplication - prioritize Gmail API data as it has the most complete information
            const existingMessageIds = new Set(allConversations.map(c => c.message_id).filter(Boolean));
            
            const newGmailConversations = transformedGmailConversations.filter(gc => {
              // Skip if we already have this message ID
              if (gc.message_id && existingMessageIds.has(gc.message_id)) {
                return false;
              }
              
              return true;
            });

            console.log('Adding new Gmail conversations (including replies):', newGmailConversations.length);
            
            // Replace existing conversations with Gmail data if they have message IDs that match
            allConversations = allConversations.filter(conv => {
              if (!conv.message_id) return true; // Keep conversations without message IDs
              return !transformedGmailConversations.some(gc => gc.message_id === conv.message_id);
            });
            
            allConversations = [...allConversations, ...transformedGmailConversations];
          }
        } catch (gmailError) {
          console.warn('Could not fetch from Gmail API:', gmailError);
        }
      }

      console.log('Total conversations found:', allConversations.length);

      // Sort conversations by date
      return allConversations.sort((a, b) => 
        new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Save an email to conversation history
   */
  async saveEmailToConversation(emailData: {
    contact_id: string;
    sender_email: string;
    recipient_email: string;
    subject: string;
    body: string;
    email_type: 'outbound' | 'inbound' | 'follow_up';
    thread_id?: string;
    message_id?: string;
    sent_at?: string;
  }): Promise<EmailConversation | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_conversations')
        .insert({
          user_id: user.user.id,
          contact_id: emailData.contact_id,
          sender_email: emailData.sender_email,
          recipient_email: emailData.recipient_email,
          subject: emailData.subject,
          body: emailData.body,
          email_type: emailData.email_type,
          thread_id: emailData.thread_id,
          message_id: emailData.message_id,
          sent_at: emailData.sent_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, log warning but don't crash
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Conversation tables not yet created. Email not saved to conversation history.');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving email to conversation:', error);
      // Don't throw error to prevent email sending from failing
      return null;
    }
  }

  /**
   * Mark an email as read
   */
  async markEmailAsRead(emailId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('email_conversations')
        .update({ read_at: new Date().toISOString() })
        .eq('id', emailId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  /**
   * Archive a conversation thread
   */
  async archiveConversation(contactId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_threads')
        .update({ status: 'archived' })
        .eq('contact_id', contactId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  /**
   * Search conversations by keyword
   */
  async searchConversations(keyword: string): Promise<EmailConversation[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_conversations')
        .select('*')
        .eq('user_id', user.user.id)
        .or(`subject.ilike.%${keyword}%,body.ilike.%${keyword}%`)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation statistics for a contact using useremaillog and followuplogs tables
   */
  async getConversationStats(contactId: string): Promise<{
    total_emails: number;
    outbound_emails: number;
    inbound_emails: number;
    last_email_date: string;
    first_email_date: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get contact email
      let recipientEmail = '';
      if (contactId.startsWith('email-')) {
        recipientEmail = contactId.replace('email-', '');
      } else {
        try {
          const { contactsService } = await import('./contactsService');
          const allContacts = await contactsService.getContacts();
          const contact = allContacts.find(c => c.id === contactId);
          if (contact) {
            recipientEmail = contact.email;
          }
        } catch (error) {
          console.warn('Could not fetch contact details for stats:', error);
          return {
            total_emails: 0,
            outbound_emails: 0,
            inbound_emails: 0,
            last_email_date: '',
            first_email_date: ''
          };
        }
      }

      // Get outbound emails from useremaillog
      let outboundCount = 0;
      let emailDates: string[] = [];
      
      try {
        const { data: emailLogs, error } = await supabase
          .from('useremaillog')
          .select('sent_at')
          .eq('user_id', user.user.email)
          .eq('to', recipientEmail);

        if (!error && emailLogs) {
          outboundCount = emailLogs.length;
          emailDates = emailLogs.map(log => log.sent_at);
        }
      } catch (error) {
        console.warn('Could not get useremaillog stats:', error);
      }

      // Get follow-up emails from followuplogs
      try {
        const { data: followupLogs, error } = await supabase
          .from('followuplogs')
          .select('followup_count, sent_at')
          .eq('user_id', user.user.email)
          .eq('to', recipientEmail);

        if (!error && followupLogs) {
          const followupCount = followupLogs.reduce((sum, log) => sum + (parseInt(log.followup_count) || 1), 0);
          outboundCount += followupCount;
          emailDates = [...emailDates, ...followupLogs.map(log => log.sent_at)];
        }
      } catch (error) {
        console.warn('Could not get followuplogs stats:', error);
      }

      // For now, we assume inbound emails would come from Gmail API
      // In a full implementation, you'd want to track inbound emails separately
      const inboundCount = 0; // This would need to be implemented based on your Gmail API integration

      const totalEmails = outboundCount + inboundCount;
      
      // Sort dates to get first and last
      emailDates.sort();
      const firstEmailDate = emailDates.length > 0 ? emailDates[0] : '';
      const lastEmailDate = emailDates.length > 0 ? emailDates[emailDates.length - 1] : '';

      return {
        total_emails: totalEmails,
        outbound_emails: outboundCount,
        inbound_emails: inboundCount,
        first_email_date: firstEmailDate,
        last_email_date: lastEmailDate
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        total_emails: 0,
        outbound_emails: 0,
        inbound_emails: 0,
        last_email_date: '',
        first_email_date: ''
      };
    }
  }

  /**
   * Get all conversation threads for the current user
   */
  async getConversationThreads(): Promise<ConversationThread[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversation_threads')
        .select(`
          *,
          contact:contacts(*)
        `)
        .eq('user_id', user.user.id)
        .order('last_email_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation threads:', error);
      return [];
    }
  }

  /**
   * Create a new conversation thread
   */
  async createConversationThread(contactId: string, subject: string): Promise<ConversationThread | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversation_threads')
        .insert({
          user_id: user.user.id,
          contact_id: contactId,
          subject: subject,
          last_email_at: new Date().toISOString(),
          email_count: 1,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating conversation thread:', error);
      return null;
    }
  }

  /**
   * Update conversation thread
   */
  async updateConversationThread(threadId: string, updates: Partial<ConversationThread>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_threads')
        .update(updates)
        .eq('id', threadId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation thread:', error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService();
export default conversationService; 