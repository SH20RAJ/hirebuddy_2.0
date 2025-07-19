import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useContacts } from '@/hooks/useContacts';
import { useCampaignContacts } from '@/hooks/useCampaignContacts';
import { useEmailCompliance } from '@/hooks/useEmailCompliance';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/profileService';
import { checkEmailPermission, ProfileCompletionData, ExperienceData } from '@/lib/utils';
import { ProfileCompletionWarning } from '@/components/ui/profile-completion-warning';
import ContactSelector from './ContactSelector';
import CampaignForm from './email-composer/CampaignForm';
import CampaignSummary from './email-composer/CampaignSummary';
import RecipientsPreview from './email-composer/RecipientsPreview';
import GettingStartedGuide from './email-composer/GettingStartedGuide';
import DomainVerificationGuide from './email-composer/DomainVerificationGuide';
import { emailTemplates } from './email-composer/EmailTemplates';
import { Mail, Send, Shield, AlertTriangle } from 'lucide-react';

const EmailComposer = () => {
  const [emailData, setEmailData] = useState({
    name: '',
    subject: '',
    content: '',
    template: '',
    schedule: 'immediate'
  });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [spamTestLoading, setSpamTestLoading] = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [profileData, setProfileData] = useState<ProfileCompletionData | null>(null);
  const [experienceData, setExperienceData] = useState<ExperienceData[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { contacts } = useContacts();
  const { sendCampaignEmails, loading: sendingEmails } = useCampaignContacts();
  const { runSpamTest, complianceSettings } = useEmailCompliance();

  // Load user profile data for completion check
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        const [profile, experiences] = await Promise.all([
          ProfileService.getProfile(user.id),
          ProfileService.getUserExperiences(user.id)
        ]);

        setProfileData(profile);
        setExperienceData(experiences || []);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  const handleSpamTest = async () => {
    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter both subject and content before running spam test.",
        variant: "destructive",
      });
      return;
    }

    setSpamTestLoading(true);
    try {
      const result = await runSpamTest('temp-campaign', emailData.subject, emailData.content);
      
      if (result) {
        toast({
          title: "Spam test completed",
          description: `Your email scored ${result.score}/10. ${result.issues.length === 0 ? 'No issues found!' : `${result.issues.length} issues detected.`}`,
          variant: result.score >= 7 ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Spam test error:', error);
    } finally {
      setSpamTestLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    // Check profile completion before allowing email send
    const emailPermission = checkEmailPermission(profileData, experienceData);
    if (!emailPermission.canSendEmail) {
      toast({
        title: "Profile Incomplete",
        description: `Your profile is ${emailPermission.completionPercentage}% complete. You need at least 85% to send emails.`,
        variant: "destructive",
      });
      return;
    }

    if (!emailData.name.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please enter a name for your campaign.",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.subject.trim()) {
      toast({
        title: "Subject line required",
        description: "Please enter a subject line for your email.",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.content.trim()) {
      toast({
        title: "Email content required",
        description: "Please enter the content for your email.",
        variant: "destructive",
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one contact to send emails to.",
        variant: "destructive",
      });
      return;
    }

    let finalContent = emailData.content;
    
    if (complianceSettings?.can_spam_enabled) {
      if (!finalContent.toLowerCase().includes('unsubscribe')) {
        finalContent += '\n\n' + (complianceSettings.unsubscribe_link_template || 'Click here to unsubscribe: {{unsubscribe_url}}');
      }
      
      if (complianceSettings.company_address && !finalContent.includes(complianceSettings.company_address)) {
        finalContent += '\n\n' + complianceSettings.company_address;
      }
    }

    setIsCreating(true);
    try {
      console.log('Creating campaign with data:', { ...emailData, content: finalContent });
      
      const campaign = await createCampaign({
        name: emailData.name,
        subject: emailData.subject,
        content: finalContent,
        status: emailData.schedule === 'immediate' ? 'active' : 'scheduled',
        send_rate_limit: 100,
        scheduled_at: emailData.schedule === 'schedule' ? new Date(Date.now() + 3600000).toISOString() : undefined
      });

      console.log('Campaign created successfully:', campaign);

      if (emailData.schedule === 'immediate' && campaign?.id) {
        console.log('Sending campaign emails to contacts:', selectedContacts);
        try {
          const result = await sendCampaignEmails(campaign.id, selectedContacts);
          
          // Show domain verification guide if there were domain-related issues
          if (result.domainVerificationRequired) {
            setShowDomainGuide(true);
          }
        } catch (error: any) {
          console.error('Error sending emails:', error);
          
          // Check if it's an email limit error
          if (error.isEmailLimitError) {
            toast({
              title: "Email limit exceeded",
              description: error.message || "You've reached your email sending limit.",
              variant: "destructive",
            });
          }
          // Don't throw here as the campaign was created successfully
        }
      }

      toast({
        title: "Campaign created successfully!",
        description: `Your campaign "${emailData.name}" has been created${emailData.schedule === 'immediate' ? ' and emails are being sent' : ''}.`,
      });

      setEmailData({
        name: '',
        subject: '',
        content: '',
        template: '',
        schedule: 'immediate'
      });
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
  const isProcessing = isCreating || sendingEmails;
  const emailPermission = checkEmailPermission(profileData, experienceData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email Composition */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Compose Cold Email Campaign</span>
            </CardTitle>
            <CardDescription>
              Create your cold email campaign with personalized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CampaignForm
              emailData={emailData}
              onEmailDataChange={setEmailData}
              templates={emailTemplates}
            />

            <Separator />

            <CampaignSummary
              selectedContactsCount={selectedContacts.length}
              schedule={emailData.schedule}
            />

            {/* Profile Completion Warning */}
            {!profileLoading && !emailPermission.canSendEmail && (
              <ProfileCompletionWarning
                completionPercentage={emailPermission.completionPercentage}
                missingFields={emailPermission.missingFields}
                requiredPercentage={85}
              />
            )}

            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline"
                onClick={handleSpamTest}
                disabled={spamTestLoading || !emailData.subject.trim() || !emailData.content.trim()}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                {spamTestLoading ? 'Testing...' : 'Spam Test'}
              </Button>
              
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleCreateCampaign}
                disabled={isProcessing || selectedContacts.length === 0 || !emailPermission.canSendEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : `Send to ${selectedContacts.length} Contacts`}
              </Button>
            </div>

            {/* Domain verification warning */}
            {selectedContacts.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Domain verification may be required</p>
                    <p>If you haven't verified your domain with Resend, emails may only be sent to your registered email address.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Verification Guide */}
        {showDomainGuide && (
          <DomainVerificationGuide />
        )}
      </div>

      {/* Contact Selection */}
      <div className="space-y-6">
        <ContactSelector
          selectedContacts={selectedContacts}
          onSelectionChange={setSelectedContacts}
        />

        <RecipientsPreview selectedContacts={selectedContactsData} />

        <GettingStartedGuide selectedContactsCount={selectedContacts.length} />
      </div>
    </div>
  );
};

export default EmailComposer; 