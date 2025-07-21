import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { emailService } from '@/services/emailService';

interface EmailPreviewProps {
  subject: string;
  body: string;
  children?: React.ReactNode;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ 
  subject, 
  body, 
  children 
}) => {
  const formattedHtml = emailService.formatAsHtml(body);
  const formattedPlainText = emailService.formatAsPlainText(body);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Headers */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Subject:</span>
                <span className="text-gray-900">{subject || 'No subject'}</span>
              </div>
            </div>
          </div>

          {/* Current Format Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-amber-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-amber-800">
                <strong>Email Format:</strong> Currently sending as plain text with proper line spacing for maximum compatibility across email clients. HTML format is available for future use when backend support is confirmed.
              </div>
            </div>
          </div>

          {/* Email Body Preview - Plain Text (Currently Used) */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-100 px-4 py-2 text-sm font-medium text-green-800 border-b">
              ✅ Email Content (Plain Text - Currently Sent)
            </div>
            
            <div className="p-6 bg-white">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
                {formattedPlainText}
              </pre>
            </div>
          </div>

          {/* Email Body Preview - HTML Version */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 border-b">
              📋 Email Content (HTML Format - For Future Use)
            </div>
            
            <div className="p-6 bg-white">
              <div 
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>

          {/* HTML Source Code (for debugging) */}
          <details className="bg-gray-50 rounded-lg">
            <summary className="px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
              View HTML Source (for debugging)
            </summary>
            <div className="p-4 border-t">
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                <code>{formattedHtml}</code>
              </pre>
            </div>
          </details>

          {/* Original Input */}
          <details className="bg-gray-50 rounded-lg">
            <summary className="px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
              View Original Input (Before Formatting)
            </summary>
            <div className="p-4 border-t">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 bg-white p-3 rounded border">
                {body}
              </pre>
            </div>
          </details>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => window.open('data:text/html,' + encodeURIComponent(emailService.previewEmailHtml(body)), '_blank')}>
            Open in New Tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreview; 