import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ComplianceSettings {
  id: string;
  user_id: string;
  gdpr_enabled: boolean;
  can_spam_enabled: boolean;
  auto_unsubscribe_enabled: boolean;
  bounce_management_enabled: boolean;
  domain_authentication: {
    spf_record: string;
    dkim_record: string;
    dmarc_record: string;
    verified: boolean;
  };
  reputation_monitoring: boolean;
  spam_testing: boolean;
  unsubscribe_link_template: string;
  privacy_policy_url: string;
  company_address: string;
  created_at: string;
  updated_at: string;
}

export interface UnsubscribeRequest {
  id: string;
  contact_id: string;
  campaign_id: string;
  reason: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  status: 'pending' | 'processed' | 'failed';
}

export interface BouncedEmail {
  id: string;
  contact_id: string;
  campaign_id: string;
  bounce_type: 'hard' | 'soft' | 'complaint';
  bounce_reason: string;
  timestamp: string;
  processed: boolean;
}

export interface SpamTestResult {
  id: string;
  campaign_id: string;
  score: number;
  issues: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  tested_at: string;
}

export const useEmailCompliance = () => {
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings | null>(null);
  const [unsubscribeRequests, setUnsubscribeRequests] = useState<UnsubscribeRequest[]>([]);
  const [bouncedEmails, setBouncedEmails] = useState<BouncedEmail[]>([]);
  const [spamTestResults, setSpamTestResults] = useState<SpamTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get compliance settings
  const getComplianceSettings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('compliance_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setComplianceSettings(data as unknown as ComplianceSettings);
      }
      return data as unknown as ComplianceSettings;
    } catch (error: any) {
      console.error('Error fetching compliance settings:', error);
      return null;
    }
  };

  // Update compliance settings
  const updateComplianceSettings = async (settings: Partial<ComplianceSettings>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('compliance_settings')
        .upsert({
          user_id: user.user.id,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setComplianceSettings(data as unknown as ComplianceSettings);
      }
      toast({
        title: "Compliance settings updated",
        description: "Your email compliance settings have been saved.",
      });

      return data as unknown as ComplianceSettings;
    } catch (error: any) {
      toast({
        title: "Error updating compliance settings",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Process unsubscribe request
  const processUnsubscribe = async (contactId: string, campaignId: string, reason: string) => {
    try {
      // Add to unsubscribe requests
      const { data: unsubscribeData, error: unsubscribeError } = await supabase
        .from('unsubscribe_requests')
        .insert({
          contact_id: contactId,
          campaign_id: campaignId,
          reason,
          timestamp: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (unsubscribeError) throw unsubscribeError;

      // Update contact status to unsubscribed
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ status: 'unsubscribed' })
        .eq('id', contactId);

      if (contactError) throw contactError;

      // Mark unsubscribe as processed
      if (unsubscribeData) {
        await supabase
          .from('unsubscribe_requests')
          .update({ status: 'processed' })
          .eq('id', unsubscribeData.id);
      }

      toast({
        title: "Unsubscribe processed",
        description: "The contact has been successfully unsubscribed.",
      });

      return unsubscribeData;
    } catch (error: any) {
      toast({
        title: "Error processing unsubscribe",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Handle bounced email
  const handleBounce = async (contactId: string, campaignId: string, bounceType: BouncedEmail['bounce_type'], bounceReason: string) => {
    try {
      // Record the bounce
      const { data: bounceData, error: bounceError } = await supabase
        .from('bounced_emails')
        .insert({
          contact_id: contactId,
          campaign_id: campaignId,
          bounce_type: bounceType,
          bounce_reason: bounceReason,
          timestamp: new Date().toISOString(),
          processed: false
        })
        .select()
        .single();

      if (bounceError) throw bounceError;

      // Handle hard bounces by marking contact as bounced
      if (bounceType === 'hard') {
        await supabase
          .from('contacts')
          .update({ status: 'bounced' })
          .eq('id', contactId);
      }

      return bounceData;
    } catch (error: any) {
      console.error('Error handling bounce:', error);
      return null;
    }
  };

  // Run spam test
  const runSpamTest = async (campaignId: string, subject: string, content: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spam-test', {
        body: {
          campaignId,
          subject,
          content,
        },
      });

      if (error) throw error;

      const result = data as SpamTestResult;
      setSpamTestResults(prev => [result, ...prev]);
      
      return result;
    } catch (error: any) {
      console.error('Error running spam test:', error);
      toast({
        title: "Error running spam test",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get deliverability tips
  const getDeliverabilityTips = () => {
    return [
      {
        category: 'Authentication',
        tips: [
          'Set up SPF, DKIM, and DMARC records for your domain',
          'Use a dedicated IP address for better reputation control',
          'Verify your domain with your email service provider'
        ]
      },
      {
        category: 'Content',
        tips: [
          'Avoid spam trigger words like "FREE", "URGENT", "ACT NOW"',
          'Maintain a good text-to-image ratio',
          'Use a clear and relevant subject line',
          'Include a physical address in your emails'
        ]
      },
      {
        category: 'List Management',
        tips: [
          'Regularly clean your email list',
          'Remove bounced and unsubscribed contacts',
          'Use double opt-in for new subscribers',
          'Monitor engagement rates and remove inactive contacts'
        ]
      },
      {
        category: 'Sending Practices',
        tips: [
          'Maintain consistent sending volume',
          'Avoid sending too many emails at once',
          'Monitor your sender reputation',
          'Use proper unsubscribe mechanisms'
        ]
      }
    ];
  };

  // Clean email list
  const cleanEmailList = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get all bounced and unsubscribed contacts
      const { data: contactsToClean, error } = await supabase
        .from('contacts')
        .select('id, email, status')
        .eq('user_id', user.user.id)
        .in('status', ['bounced', 'unsubscribed']);

      if (error) throw error;

      if (contactsToClean && contactsToClean.length > 0) {
        toast({
          title: "Email list cleaned",
          description: `Found ${contactsToClean.length} contacts to clean (bounced/unsubscribed)`,
        });
      } else {
        toast({
          title: "Email list is clean",
          description: "No bounced or unsubscribed contacts found",
        });
      }

      return contactsToClean;
    } catch (error: any) {
      toast({
        title: "Error cleaning email list",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    complianceSettings,
    unsubscribeRequests,
    bouncedEmails,
    spamTestResults,
    loading,
    getComplianceSettings,
    updateComplianceSettings,
    processUnsubscribe,
    handleBounce,
    runSpamTest,
    getDeliverabilityTips,
    cleanEmailList,
  };
}; 