import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { contactsService } from '@/services/contactsService';
import WhatsAppLikeConversation from '@/components/email/WhatsAppLikeConversation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  linkedin_link?: string;
}

const EmailConversations: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoadingContacts(true);
      const allContacts = await contactsService.getContacts();
      
      // Transform contacts to match our interface
      const transformedContacts = allContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        position: contact.title,
        linkedin_link: contact.linkedin_link
      }));
      
      setContacts(transformedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your email conversations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/email-outreach')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Email Outreach</span>
              </Button>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Email Conversations</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Signed in as {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingContacts ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-500">Loading contacts...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp-like Email Conversations</CardTitle>
                <CardDescription>
                  View all your email conversations in a modern, chat-like interface. 
                  Select a contact from the sidebar to see your complete email history with them.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Conversation Interface */}
            <WhatsAppLikeConversation contacts={contacts} />

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">💬 Chat-like Interface</h4>
                    <p className="text-gray-600">Messages displayed as bubbles, just like WhatsApp</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📧 Complete Email Bodies</h4>
                    <p className="text-gray-600">View full email content with expand/collapse for long messages</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">🔍 Smart Search</h4>
                    <p className="text-gray-600">Search through contacts and conversations easily</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📊 Conversation Stats</h4>
                    <p className="text-gray-600">See email counts and conversation statistics</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">🕒 Date Separators</h4>
                    <p className="text-gray-600">Clear date separators for better timeline view</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📋 Copy to Clipboard</h4>
                    <p className="text-gray-600">Easily copy email content with one click</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConversations; 