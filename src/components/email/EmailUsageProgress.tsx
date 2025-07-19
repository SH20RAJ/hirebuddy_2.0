import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Mail, Crown, RefreshCw } from 'lucide-react';
import { EmailUsageStats } from '@/services/emailCountService';
import { Button } from '@/components/ui/button';

interface EmailUsageProgressProps {
  usage: EmailUsageStats;
  loading?: boolean;
  onRenewClick?: () => void;
  showRenewButton?: boolean;
  compact?: boolean;
}

export const EmailUsageProgress: React.FC<EmailUsageProgressProps> = ({
  usage,
  loading = false,
  onRenewClick,
  showRenewButton = true,
  compact = false
}) => {
  const getProgressColor = () => {
    if (usage.percentage >= 90) return 'bg-red-500';
    if (usage.percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusBadge = () => {
    if (!usage.canSendEmail) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Limit Reached
        </Badge>
      );
    }
    if (usage.percentage >= 90) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Almost Full
        </Badge>
      );
    }
    if (usage.percentage >= 75) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          High Usage
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Mail className="h-3 w-3" />
        Available
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {usage.used}/{usage.limit} emails used
              </span>
              {getStatusBadge()}
            </div>
            <Progress 
              value={usage.percentage} 
              className={`h-2 ${getProgressColor()}`}
            />
          </div>
        </div>
        
        {!usage.canSendEmail && showRenewButton && onRenewClick && (
          <Button 
            size="sm" 
            onClick={onRenewClick}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white flex-shrink-0"
          >
            <Crown className="h-3 w-3 mr-1" />
            Renew
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Usage
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading usage data...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">
                  {usage.used} of {usage.limit} emails
                </span>
              </div>
              <Progress 
                value={usage.percentage} 
                className={`h-2 ${getProgressColor()}`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(usage.percentage)}% used</span>
                <span>{usage.remaining} remaining</span>
              </div>
            </div>

            {!usage.canSendEmail && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Email Limit Reached
                    </p>
                    <p className="text-xs text-red-700 mb-3">
                      You've used all {usage.limit} emails in your current plan. 
                      Renew your subscription to continue sending emails.
                    </p>
                    {showRenewButton && onRenewClick && (
                      <Button 
                        size="sm" 
                        onClick={onRenewClick}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                      >
                        <Crown className="h-3 w-3 mr-2" />
                        Renew Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {usage.canSendEmail && usage.percentage >= 75 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Approaching Limit
                    </p>
                    <p className="text-xs text-yellow-700">
                      You have {usage.remaining} emails remaining. 
                      Consider renewing your subscription soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 