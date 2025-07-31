import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { conversationService, ContactWithConversation, EmailConversation } from '@/services/conversationService';
import { 
  Search, 
  MessageSquare, 
  RefreshCw, 
  Loader2, 
  Building2, 
  Clock, 
  Check, 
  CheckCheck,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  linkedin_link?: string;
}

interface WhatsAppLikeConversationProps {
  contacts: Contact[];
}

const WhatsAppLikeConversation: React.FC<WhatsAppLikeConversationProps> = ({ contacts }) => {
  const [conversationData, setConversationData] = useState<EmailConversation[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationContacts, setConversationContacts] = useState<ContactWithConversation[]>([]);
  const [selectedConversationContact, setSelectedConversationContact] = useState<string>('');
  const [isLoadingConversationContacts, setIsLoadingConversationContacts] = useState(false);
  const [conversationSearchTerm, setConversationSearchTerm] = useState('');
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [conversationStats, setConversationStats] = useState<{
    total_emails: number;
    outbound_emails: number;
    inbound_emails: number;
    last_email_date: string;
    first_email_date: string;
  } | null>(null);
  const [conversationSubject, setConversationSubject] = useState<string>('');

  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversation contacts based on search term
  const filteredConversationContacts = conversationContacts.filter(contact =>
    contact.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(conversationSearchTerm.toLowerCase())) ||
    (contact.position && contact.position.toLowerCase().includes(conversationSearchTerm.toLowerCase()))
  );

  // Scroll to bottom when new messages are loaded
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData]);

  // Load conversation contacts on component mount
  useEffect(() => {
    loadConversationContacts();
  }, []);

  const loadConversationContacts = async () => {
    setIsLoadingConversationContacts(true);
    try {
      console.log('Loading conversation contacts...');
      const contactsWithConversations = await conversationService.getContactsWithConversations();
      console.log('Loaded conversation contacts:', contactsWithConversations);
      setConversationContacts(contactsWithConversations);
      
      if (contactsWithConversations.length === 0) {
        toast({
          title: "No Conversations Found",
          description: "You haven't had any email conversations yet. Send some emails first to see conversation history.",
        });
      }
    } catch (error) {
      console.error('Failed to load conversation contacts:', error);
      
      toast({
        title: "Failed to Load Conversations",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversationContacts(false);
    }
  };

  const loadConversationHistory = async (contactId: string) => {
    setIsLoadingConversation(true);
    try {
      const selectedContact = conversationContacts.find(c => c.id === contactId);
      
      // Get sender email from user profile or form
      const senderEmail = user?.email;
      const recipientEmail = selectedContact?.email;
      
      console.log('Loading conversation history for:', {
        contactId,
        senderEmail,
        recipientEmail,
        selectedContact
      });
      
      const history = await conversationService.getConversationHistory(
        contactId, 
        senderEmail, 
        recipientEmail
      );
      
      console.log('Loaded conversation history:', history);
      console.log('Email types breakdown:');
      const emailTypes = history.reduce((acc, email) => {
        acc[email.email_type] = (acc[email.email_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Email types:', emailTypes);
      
      // Log individual emails for debugging
      history.forEach((email, index) => {
        console.log(`${index + 1}. [${email.email_type.toUpperCase()}] From: ${email.sender_email} | Subject: ${email.subject} | Body length: ${email.body?.length || 0} | Source: ${email.metadata?.source || 'unknown'}`);
      });
      
      setConversationData(history);
      
      // Set conversation subject from the first email (usually the original subject)
      if (history.length > 0) {
        // Find the first outbound email to get the original subject
        const firstOutboundEmail = history.find(email => email.email_type === 'outbound');
        const subjectToUse = firstOutboundEmail?.subject || history[0].subject || 'No Subject';
        setConversationSubject(subjectToUse);
      } else {
        setConversationSubject('');
      }
      
      // Load conversation statistics
      try {
        const stats = await conversationService.getConversationStats(contactId);
        setConversationStats(stats);
      } catch (statsError) {
        console.warn('Could not load conversation stats:', statsError);
        setConversationStats(null);
      }
      
      if (history.length === 0) {
        toast({
          title: "No Conversation History",
          description: "No email conversation found with this contact. Try sending an email first.",
        });
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Email content copied successfully",
    });
  };

  const toggleEmailExpansion = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const renderEmailBody = (email: EmailConversation) => {
    const isExpanded = expandedEmails.has(email.id);
    const body = email.body || '';
    const isLongContent = body.length > 300;
    
    // Clean HTML content if present
    const cleanBody = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const displayBody = isLongContent && !isExpanded 
      ? cleanBody.substring(0, 300) + '...' 
      : cleanBody;

    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayBody}
        </div>
        {isLongContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleEmailExpansion(email.id)}
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show more
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const selectedContactInfo = conversationContacts.find(c => c.id === selectedConversationContact);

  return (
    <div className="flex h-[700px] bg-white rounded-lg shadow-sm border">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-lg mb-3">Conversations</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={conversationSearchTerm}
              onChange={(e) => setConversationSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingConversationContacts ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversationContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No conversations found</p>
                {conversationContacts.length === 0 ? (
                  <p className="text-xs mt-1">Send emails to see conversations here</p>
                ) : (
                  <p className="text-xs mt-1">No matches for your search</p>
                )}
              </div>
            ) : (
              filteredConversationContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-white ${
                    selectedConversationContact === contact.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => {
                    setSelectedConversationContact(contact.id);
                    setConversationData([]);
                    setConversationStats(null);
                    setConversationSubject('');
                    loadConversationHistory(contact.id);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {getContactInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      {contact.company && (
                        <p className="text-xs text-gray-400 truncate">{contact.company}</p>
                      )}
                      {contact.last_email_at && (
                        <p className="text-xs text-gray-400">
                          {formatTime(contact.last_email_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-white">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadConversationContacts}
            disabled={isLoadingConversationContacts}
            className="w-full"
          >
            {isLoadingConversationContacts ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContactInfo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                      {getContactInitials(selectedContactInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedContactInfo.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContactInfo.email}</p>
                    {selectedContactInfo.company && (
                      <p className="text-xs text-gray-400">{selectedContactInfo.company}</p>
                    )}
                    {conversationSubject && (
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {conversationSubject}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {conversationStats && (
                    <div className="text-right text-xs text-gray-500">
                      <p>{conversationStats.total_emails} emails</p>
                      <p>{conversationStats.outbound_emails} sent, {conversationStats.inbound_emails} received</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadConversationHistory(selectedConversationContact)}
                    disabled={isLoadingConversation}
                  >
                    {isLoadingConversation ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {isLoadingConversation ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Loading conversation...</p>
                  </div>
                ) : conversationData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation by sending an email</p>
                  </div>
                ) : (
                  conversationData
                    .filter(email => {
                      // Filter out emails that don't have body content
                      const body = email.body || '';
                      const cleanBody = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                      return cleanBody.length > 0;
                    })
                    .map((email, index) => {
                    const isOutbound = email.email_type === 'outbound' || email.email_type === 'follow_up' || 
                                     (email.sender_email && email.sender_email === user?.email);
                    const emailDate = new Date(email.sent_at);
                    const showDateSeparator = index === 0 || 
                      new Date(conversationData.filter(e => {
                        const body = e.body || '';
                        const cleanBody = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                        return cleanBody.length > 0;
                      })[index - 1]?.sent_at || email.sent_at).toDateString() !== emailDate.toDateString();

                    return (
                      <div key={email.id || index}>
                        {/* Date Separator */}
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border">
                              {emailDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`max-w-[70%] ${isOutbound ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                isOutbound
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 rounded-bl-md border'
                              }`}
                            >
                              {/* Email Body */}
                              {renderEmailBody(email)}

                              {/* Message Actions */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20">
                                <div className={`text-xs ${
                                  isOutbound ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {formatTime(email.sent_at)}
                                  {email.email_type === 'follow_up' && (
                                    <Badge 
                                      variant="outline" 
                                      className={`ml-2 text-xs ${
                                        isOutbound 
                                          ? 'border-blue-200 text-blue-100' 
                                          : 'border-orange-300 text-orange-600'
                                      }`}
                                    >
                                      Follow-up
                                    </Badge>
                                  )}
                                  {email.email_type === 'inbound' && (
                                    <Badge 
                                      variant="outline" 
                                      className="ml-2 text-xs border-green-300 text-green-600"
                                    >
                                      Reply
                                    </Badge>
                                  )}

                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(email.body || '')}
                                    className={`h-6 w-6 p-0 ${
                                      isOutbound 
                                        ? 'text-blue-100 hover:text-white hover:bg-blue-600' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  {isOutbound && (
                                    <div className={`text-xs ${
                                      isOutbound ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                      <CheckCheck className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a contact from the list to view your email conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppLikeConversation; 