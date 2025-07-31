import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';

const DomainVerificationGuide = () => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-900">
          <Shield className="h-5 w-5" />
          <span>Domain Verification Required</span>
        </CardTitle>
        <CardDescription className="text-orange-800">
          To send emails to any recipient, you need to verify your domain with Resend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>What you need to do:</AlertTitle>
          <AlertDescription>
            Currently, you can only send test emails to your own email address. To send to all your contacts, follow these steps:
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium text-orange-900">Visit Resend Domains</p>
              <p className="text-sm text-orange-700">Go to resend.com/domains to add and verify your domain</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium text-orange-900">Add DNS Records</p>
              <p className="text-sm text-orange-700">Add the required SPF, DKIM, and DMARC records to your domain's DNS</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium text-orange-900">Update Profile Email</p>
              <p className="text-sm text-orange-700">Use an email address from your verified domain when sending campaigns</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => window.open('https://resend.com/domains', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Verify Domain
          </Button>
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => window.open('https://resend.com/docs/send-with-nodejs', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Docs
          </Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>Pro tip:</strong> While setting up domain verification, you can still test the email functionality by sending campaigns to your own email address.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DomainVerificationGuide; 