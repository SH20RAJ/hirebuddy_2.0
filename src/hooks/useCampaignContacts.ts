import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface CampaignContact {
  id: string;
  campaign_id: string;
  contact_id: string;
  user_id: string;
  status: 'pending' | 'sent' | 'failed' | 'opened' | 'clicked' | 'replied';
  sent_at?: string;
  created_at: string;
}

export const useCampaignContacts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendCampaignEmails = async (campaignId: string, contactIds: string[]) => {
    setLoading(true);
    try {
      console.log(`Sending campaign ${campaignId} to ${contactIds.length} contacts:`, contactIds);
      
      const { data, error } = await supabase.functions.invoke('send-campaign-emails', {
        body: {
          campaignId,
          contactIds,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Check if it's an email limit error
        if (error.message && error.message.includes('Email limit exceeded')) {
          const limitError = new Error(error.message);
          (limitError as any).isEmailLimitError = true;
          (limitError as any).currentUsage = data?.current_usage;
          throw limitError;
        }
        throw new Error(error.message || 'Failed to send emails');
      }

      console.log('Campaign email response:', data);

      // Show appropriate success/warning message
      if (data.domainVerificationRequired) {
        toast({
          title: "Emails sent with limitations",
          description: `${data.successful || 0} emails sent. Some failed due to domain verification. Please verify your domain at resend.com/domains to send to all addresses.`,
          variant: "destructive",
        });
      } else {
        const emailUsageText = data.email_usage 
          ? ` (${data.email_usage.used}/${data.email_usage.limit} emails used)`
          : '';
        toast({
          title: "Campaign emails sent successfully!",
          description: `${data.successful || 0} emails sent successfully${data.failed > 0 ? `, ${data.failed} failed` : ''}${emailUsageText}`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error sending campaign emails:', error);
      toast({
        title: "Error sending campaign emails",
        description: error.message || "An unexpected error occurred while sending emails",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCampaignContacts = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaign_contacts')
        .select(`
          *,
          contacts:contact_id (
            first_name,
            last_name,
            email,
            company
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error fetching campaign contacts",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const trackEmailOpen = async (campaignContactId: string, userAgent?: string, ipAddress?: string) => {
    try {
      const { error } = await supabase
        .from('email_events')
        .insert([{
          campaign_contact_id: campaignContactId,
          event_type: 'opened',
          user_agent: userAgent,
          ip_address: ipAddress,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'email_pixel'
          }
        }]);

      if (error) throw error;
      
      await supabase
        .from('campaign_contacts')
        .update({ status: 'opened' })
        .eq('id', campaignContactId);

    } catch (error: any) {
      console.error('Error tracking email open:', error);
    }
  };

  const trackEmailClick = async (campaignContactId: string, linkUrl: string, userAgent?: string, ipAddress?: string) => {
    try {
      const { error } = await supabase
        .from('email_events')
        .insert([{
          campaign_contact_id: campaignContactId,
          event_type: 'clicked',
          link_url: linkUrl,
          user_agent: userAgent,
          ip_address: ipAddress,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'email_link'
          }
        }]);

      if (error) throw error;
      
      await supabase
        .from('campaign_contacts')
        .update({ status: 'clicked' })
        .eq('id', campaignContactId);

    } catch (error: any) {
      console.error('Error tracking email click:', error);
    }
  };

  const trackConversion = async (
    campaignContactId: string, 
    conversionType: string, 
    conversionValue: number = 0,
    conversionData: any = {}
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: campaignContact } = await supabase
        .from('campaign_contacts')
        .select('campaign_id, contact_id')
        .eq('id', campaignContactId)
        .single();

      if (!campaignContact) throw new Error('Campaign contact not found');

      const { error: eventError } = await supabase
        .from('email_events')
        .insert([{
          campaign_contact_id: campaignContactId,
          event_type: 'converted',
          conversion_value: conversionValue,
          metadata: {
            conversion_type: conversionType,
            conversion_data: conversionData,
            timestamp: new Date().toISOString()
          }
        }]);

      if (eventError) throw eventError;

      const { error: conversionError } = await supabase
        .from('conversions')
        .insert([{
          campaign_id: campaignContact.campaign_id,
          contact_id: campaignContact.contact_id,
          user_id: user.user.id,
          conversion_type: conversionType,
          conversion_value: conversionValue,
          conversion_data: conversionData
        }]);

      if (conversionError) throw conversionError;

      toast({
        title: "Conversion tracked!",
        description: `${conversionType} conversion worth $${conversionValue} has been recorded.`,
      });

    } catch (error: any) {
      console.error('Error tracking conversion:', error);
      toast({
        title: "Error tracking conversion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    sendCampaignEmails,
    getCampaignContacts,
    trackEmailOpen,
    trackEmailClick,
    trackConversion,
    loading,
  };
}; 