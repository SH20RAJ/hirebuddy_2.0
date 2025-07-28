import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getConfig } from '@/config/environment';
import emailService, { EmailSendRequest, FollowUpRequest } from '@/services/emailService';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Send, 
  RefreshCw,
  Zap,
  MessageSquare,
  User
} from 'lucide-react';

const EmailAPITester = () => {
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testEmailData, setTestEmailData] = useState({
    sender: '',
    to: '',
    subject: 'Test Email from Hirebuddy',
    body: 'This is a test email to verify the AWS email API integration is working correctly.'
  });
  const [followUpData, setFollowUpData] = useState({
    sender: '',
    to: '',
    body: 'This is a test follow-up email.'
  });

  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize sender emails from authenticated user
  useEffect(() => {
    if (user?.email) {
      setTestEmailData(prev => ({ ...prev, sender: user.email }));
      setFollowUpData(prev => ({ ...prev, sender: user.email }));
    }
  }, [user]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await emailService.testConnection();
      setApiStatus({
        connected: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast({
          title: "API Connected",
          description: result.message,
        });
      } else {
        toast({
          title: "API Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiStatus({
        connected: false,
        message: `Connection error: ${errorMessage}`
      });
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailData.sender || !testEmailData.to || !testEmailData.subject || !testEmailData.body) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      });
      return;
    }

    if (!emailService.isValidEmail(testEmailData.sender) || !emailService.isValidEmail(testEmailData.to)) {
      toast({
        title: "Invalid Email",
        description: "Please enter valid email addresses.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const request: EmailSendRequest = {
        sender: testEmailData.sender,
        to: testEmailData.to,
        subject: testEmailData.subject,
        body: emailService.formatAsHtml(testEmailData.body)
      };

      const result = await emailService.sendEmail(request);
      
      toast({
        title: "Email Sent Successfully",
        description: `Message ID: ${result.messageId}`,
      });

      console.log('Email sent successfully:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Email Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Email send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUpData.sender || !followUpData.to || !followUpData.body) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields before sending follow-up.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const request: FollowUpRequest = {
        sender: followUpData.sender,
        body: followUpData.body,
        to: followUpData.to
      };

      const result = await emailService.sendFollowUp(request);
      
      toast({
        title: "Follow-up Sent",
        description: result.message,
      });

      console.log('Follow-up sent successfully:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Follow-up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Follow-up error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AWS Email API Status</span>
          </CardTitle>
          <CardDescription>
            Test the connection to your AWS email automation API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Alert className={apiStatus?.connected ? "border-green-200 bg-green-50 flex-1 mr-4" : "border-red-200 bg-red-50 flex-1 mr-4"}>
              <div className="flex items-center space-x-2">
                {apiStatus?.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={apiStatus?.connected ? "text-green-800" : "text-red-800"}>
                  <strong>Status:</strong> {apiStatus?.message || 'Checking...'}
                </AlertDescription>
              </div>
            </Alert>
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">API Endpoint Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Base URL:</strong> {getConfig().api.awsBaseUrl ? 'Configured' : 'Not configured'}</p>
              <p><strong>Available Endpoints:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><Badge variant="outline">GET /</Badge> - Health check</li>
                <li><Badge variant="outline">POST /send_email</Badge> - Send email</li>
                <li><Badge variant="outline">POST /send_followup</Badge> - Send follow-up</li>
                <li><Badge variant="outline">POST /get_email_and_replies</Badge> - Get conversation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Test Email Sending</span>
          </CardTitle>
          <CardDescription>
            Send a test email using the AWS API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender">Sender Email</Label>
              <Input
                id="sender"
                type="email"
                placeholder="your-email@gmail.com"
                value={testEmailData.sender}
                disabled
                className="bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500">Automatically set to your authenticated account email</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="recipient@example.com"
                value={testEmailData.to}
                onChange={(e) => setTestEmailData(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject..."
              value={testEmailData.subject}
              onChange={(e) => setTestEmailData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              placeholder="Email content..."
              className="min-h-[100px]"
              value={testEmailData.body}
              onChange={(e) => setTestEmailData(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>

          <Button 
            className="w-full"
            onClick={handleSendTestEmail}
            disabled={isSending || !apiStatus?.connected}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSending ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Follow-up Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Test Follow-up Email</span>
          </CardTitle>
          <CardDescription>
            Send a follow-up email to a previous recipient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followup-sender">Sender Email</Label>
              <Input
                id="followup-sender"
                type="email"
                placeholder="your-email@gmail.com"
                value={followUpData.sender}
                disabled
                className="bg-gray-50 text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-recipient">Recipient Email</Label>
              <Input
                id="followup-recipient"
                type="email"
                placeholder="recipient@example.com"
                value={followUpData.to}
                onChange={(e) => setFollowUpData(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-body">Follow-up Message</Label>
            <Textarea
              id="followup-body"
              placeholder="Follow-up message content..."
              className="min-h-[100px]"
              value={followUpData.body}
              onChange={(e) => setFollowUpData(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>

          <Button 
            className="w-full"
            onClick={handleSendFollowUp}
            disabled={isSending || !apiStatus?.connected}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            {isSending ? 'Sending Follow-up...' : 'Send Follow-up'}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <User className="h-5 w-5" />
            <span>Usage Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-2 text-sm">
            <p><strong>Before sending emails:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Ensure the sender email is authenticated with Gmail in your AWS API backend</li>
              <li>The API will check if you've already sent an email to the recipient</li>
              <li>Follow-ups are rate-limited (24 hours minimum between sends)</li>
              <li>Maximum of 50 emails per user (upgradeable)</li>
              <li>Maximum of 3 follow-ups per recipient</li>
            </ul>
            <p className="mt-3"><strong>API Features:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Automatic email threading and conversation tracking</li>
              <li>Built-in spam prevention and rate limiting</li>
              <li>Email status tracking and logging</li>
              <li>Integration with Supabase for data storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAPITester; 