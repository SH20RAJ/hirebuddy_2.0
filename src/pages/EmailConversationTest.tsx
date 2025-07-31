import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import emailService from '@/services/emailService';
import conversationService from '@/services/conversationService';

const EmailConversationTest: React.FC = () => {
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  const testBackendAPI = async () => {
    if (!senderEmail || !recipientEmail) {
      setError('Please enter both sender and recipient emails');
      return;
    }

    setLoading(true);
    setError('');
    setApiResponse(null);
    setConversationHistory([]);

    try {
      console.log('Testing backend API with:', { senderEmail, recipientEmail });
      
      // Test direct API call
      const response = await emailService.getEmailConversation({
        sender: senderEmail,
        to: recipientEmail
      });

      console.log('Backend API response:', response);
      setApiResponse(response);

      // Test conversation service
      const history = await conversationService.getConversationHistory(
        `email-${recipientEmail}`,
        senderEmail,
        recipientEmail
      );

      console.log('Conversation service response:', history);
      setConversationHistory(history);

    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailType = (email: any) => {
    switch (email.email_type) {
      case 'outbound':
        return <Badge variant="outline" className="text-blue-600">Sent</Badge>;
      case 'inbound':
        return <Badge variant="outline" className="text-green-600">Reply</Badge>;
      case 'follow_up':
        return <Badge variant="outline" className="text-orange-600">Follow-up</Badge>;
      default:
        return <Badge variant="outline">{email.email_type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Conversation API Test</CardTitle>
          <p className="text-sm text-gray-600">
            Test the backend API to verify email conversations and replies are being fetched correctly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sender Email</label>
              <Input
                type="email"
                placeholder="your-email@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email</label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={testBackendAPI} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Email Conversation API'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Direct API Response */}
      {apiResponse && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Direct Backend API Response</CardTitle>
            <p className="text-sm text-gray-600">
              Raw response from /get_email_and_replies endpoint
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
              <pre className="text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Summary:</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Total emails found: {Array.isArray(apiResponse) ? apiResponse.length : 'Not an array'}</li>
                {Array.isArray(apiResponse) && apiResponse.length > 0 && (
                  <>
                    <li>• First email from: {apiResponse[0].from || 'Unknown'}</li>
                    <li>• First email subject: {apiResponse[0].subject || 'No subject'}</li>
                    <li>• First email body length: {apiResponse[0].body?.length || 0} characters</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Service Response */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Service Response</CardTitle>
            <p className="text-sm text-gray-600">
              Processed conversation history from conversation service
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversationHistory.map((email, index) => (
                <div key={email.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {renderEmailType(email)}
                      <span className="text-sm font-medium">
                        From: {email.sender_email}
                      </span>
                      <span className="text-sm text-gray-500">
                        To: {email.recipient_email}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.sent_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium">Subject:</span>
                    <span className="text-sm ml-2">{email.subject || 'No Subject'}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium">Body:</span>
                    <div className="text-sm ml-2 mt-1 p-2 bg-gray-50 rounded">
                      {email.body ? (
                        email.body.length > 200 ? (
                          <>
                            {email.body.substring(0, 200)}...
                            <span className="text-blue-600 ml-2">({email.body.length} chars total)</span>
                          </>
                        ) : (
                          email.body
                        )
                      ) : (
                        <span className="text-gray-500 italic">No body content</span>
                      )}
                    </div>
                  </div>

                  {email.metadata && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Source:</span> {email.metadata.source || 'Unknown'}
                      {email.metadata.is_reply && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Is Reply
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailConversationTest; 