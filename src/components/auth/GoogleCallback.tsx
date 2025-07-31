import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuthService } from '@/services/googleAuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authenticating with Google...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Google');
        return;
      }

      try {
        setMessage('Exchanging authorization code for tokens...');
        const user = await googleAuthService.handleCallback(code);
        
        if (user) {
          setStatus('success');
          setMessage('Successfully authenticated! Redirecting to Email Outreach...');
          
          // Redirect to email outreach after a short delay with authentication flag
          setTimeout(() => {
            navigate('/email-outreach?authenticated=true');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to authenticate with Google');
        }
      } catch (error) {
        console.error('Error handling Google callback:', error);
        setStatus('error');
        setMessage('An error occurred during authentication');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/email-outreach');
  };

  return (
    <div className="min-h-screen bg-[#fff7f8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-[#d35c65]" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Google Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">{message}</p>
          
          {status === 'error' && (
            <Button 
              onClick={handleRetry}
              className="bg-[#d35c65] hover:bg-[#b24e55] text-white"
            >
              Back to Email Outreach
            </Button>
          )}
          
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                You can now send emails through your Gmail account!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback; 