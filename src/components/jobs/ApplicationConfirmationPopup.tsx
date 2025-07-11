import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Briefcase, 
  Building, 
  MapPin,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Job } from '@/types/job';

interface ApplicationConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onConfirmApplication: () => void;
  onDenyApplication: () => void;
  isSubmitting?: boolean;
}

export const ApplicationConfirmationPopup: React.FC<ApplicationConfirmationPopupProps> = ({
  isOpen,
  onClose,
  job,
  onConfirmApplication,
  onDenyApplication,
  isSubmitting = false
}) => {
  const [hasResponded, setHasResponded] = useState(false);

  const handleConfirm = () => {
    setHasResponded(true);
    onConfirmApplication();
  };

  const handleDeny = () => {
    setHasResponded(true);
    onDenyApplication();
  };

  const handleClose = () => {
    setHasResponded(false);
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
          >
            <Briefcase className="w-8 h-8 text-blue-600" />
          </motion.div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Did you apply for this job?
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            We noticed you opened the application link. Let us know if you submitted your application so we can track it for you.
          </DialogDescription>
        </DialogHeader>

        {/* Job Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Building className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Building className="w-3 h-3" />
                {job.company}
              </p>
              {job.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {job.isRemote && (
                  <Badge variant="outline" className="text-xs">
                    Remote
                  </Badge>
                )}
                {job.experienceRequired && (
                  <Badge variant="outline" className="text-xs">
                    {job.experienceRequired}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <AnimatePresence mode="wait">
          {!hasResponded ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={handleDeny}
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                <XCircle className="w-4 h-4" />
                No, I didn't apply
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Yes, I applied!
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  <span>Saving your application...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Application tracked successfully!</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            This helps us track your applications and provide better job recommendations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 