import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, User, ArrowRight, CheckCircle, Target, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileCompletionWarningProps {
  completionPercentage: number;
  missingFields: string[];
  requiredPercentage?: number;
  showAsDialog?: boolean;
  onClose?: () => void;
}

export const ProfileCompletionWarning: React.FC<ProfileCompletionWarningProps> = ({
  completionPercentage,
  missingFields,
  requiredPercentage = 85,
  showAsDialog = false,
  onClose
}) => {
  const content = (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Profile Completion Required ({completionPercentage}% complete)
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div className="text-orange-700">
          <p className="mb-2">
            To send emails and auto-apply to jobs, your profile must be at least {requiredPercentage}% complete. 
            This helps ensure professional communication and better response rates.
          </p>
          
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2"
            />
          </div>
          
          {missingFields.length > 0 && (
            <div>
              <p className="font-medium mb-2">Missing information:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {missingFields.map((field, index) => (
                  <li key={index} className="text-orange-600">{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Link to="/profile">
              <User className="h-4 w-4 mr-2" />
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );

  if (showAsDialog) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

interface ProfileCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  completionPercentage: number;
  missingFields: string[];
  isNewUser?: boolean;
}

export const ProfileCompletionPopup: React.FC<ProfileCompletionPopupProps> = ({
  isOpen,
  onClose,
  completionPercentage,
  missingFields,
  isNewUser = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center pb-3">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isNewUser ? 'Welcome to Hirebuddy!' : 'Complete Your Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {isNewUser 
                ? 'Complete your profile to unlock premium features and start applying to jobs!'
                : 'Your profile needs to be at least 85% complete to access premium features.'
              }
            </p>
          </div>

          {/* Profile Completion Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">
              {completionPercentage < 85 
                ? `${85 - completionPercentage}% more needed to unlock all features`
                : 'All features unlocked!'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/profile" className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                Complete Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Later
            </Button>
          </div>

          {isNewUser && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 Tip: Upload your resume to quickly reach 85%
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 