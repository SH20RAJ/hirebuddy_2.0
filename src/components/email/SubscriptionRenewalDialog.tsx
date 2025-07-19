import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Mail, CheckCircle, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { EmailUsageStats } from '@/services/emailCountService';
import { CashfreePaymentButton } from '@/components/ui/cashfree-payment-button';

interface SubscriptionRenewalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  emailUsage: EmailUsageStats;
  onRenewalSuccess?: () => void;
}

export const SubscriptionRenewalDialog: React.FC<SubscriptionRenewalDialogProps> = ({
  isOpen,
  onClose,
  emailUsage,
  onRenewalSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    'Reset email limit to 125 emails',
    'Hyper-Personalized Cold Emails',
    'Follow-up Emails and tracker',
    'Access to Exclusive Job Openings',
    'Unlimited Job Applications',
    '24/7 Premium Support',
    'AI-powered email templates'
  ];

  const handlePaymentSuccess = () => {
    setIsProcessing(false);
    onRenewalSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <DialogTitle className="text-xl">Renew Premium Subscription</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Your email limit has been reached. Renew your premium subscription to continue sending emails.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage Status */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-800">
                <AlertTriangle className="h-4 w-4" />
                Current Email Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">
                    <span className="font-medium">{emailUsage.used} of {emailUsage.limit}</span> emails used
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {emailUsage.remaining} emails remaining
                  </p>
                </div>
                <Badge variant="destructive">
                  {Math.round(emailUsage.percentage)}% Used
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan Details */}
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Crown className="h-5 w-5" />
                Premium Plan - ₹149
              </CardTitle>
              <p className="text-sm text-yellow-700">
                Everything you need to accelerate your job search
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plan Price</span>
                  <span className="font-medium">₹149</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email Limit</span>
                  <span className="font-medium text-green-600">125 emails</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Access Period</span>
                  <span className="font-medium">1 Month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits After Renewal */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-green-800">
                <Mail className="h-4 w-4" />
                After Renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Email Count</span>
                  <span className="font-medium text-green-800">Reset to 0/125</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Available Emails</span>
                  <span className="font-medium text-green-800">125 emails</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Premium Features</span>
                  <Badge variant="default" className="bg-green-600">Activated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Complete Your Renewal</CardTitle>
              <p className="text-sm text-gray-600 text-center">
                Secure payment powered by Cashfree
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">₹149</div>
                <p className="text-sm text-gray-600">One-time payment</p>
              </div>

              <CashfreePaymentButton className="w-full" />

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By proceeding, you agree to our terms of service and privacy policy.
                  Your subscription will be activated immediately after payment.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-blue-800 font-medium">
                  Need help or have questions?
                </p>
                <p className="text-xs text-blue-700">
                  Contact our support team at support@hirebuddy.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 