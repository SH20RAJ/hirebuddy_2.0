import React, { useState, useMemo } from 'react';
import { ContactForDisplay } from '@/services/contactsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Mail, Phone, Building, Users, Send, ExternalLink, CheckCircle } from 'lucide-react';

interface ContactListProps {
  contacts: ContactForDisplay[];
  selectedContacts: string[];
  onContactSelect: (contactId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSendEmail: (contactIds: string[]) => void;
  loading?: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContacts,
  onContactSelect,
  onSelectAll,
  onClearSelection,
  onSendEmail,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'company' | 'email'>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterBy === 'company') {
        return matchesSearch && contact.company;
      } else if (filterBy === 'email') {
        return matchesSearch && contact.email;
      }
      
      return matchesSearch;
    });
  }, [contacts, searchTerm, filterBy]);

  const handleSelectContact = (contactId: string) => {
    onContactSelect(contactId);
  };

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedContactsData = contacts.filter(contact => 
    selectedContacts.includes(contact.id)
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#d35c65]" />
            Your Contacts ({filteredContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search contacts by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('all')}
                className={filterBy === 'all' ? 'bg-[#d35c65] hover:bg-[#b24e55]' : ''}
              >
                All
              </Button>
              <Button
                variant={filterBy === 'company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('company')}
                className={filterBy === 'company' ? 'bg-[#d35c65] hover:bg-[#b24e55]' : ''}
              >
                <Building className="h-4 w-4 mr-1" />
                With Company
              </Button>
              <Button
                variant={filterBy === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('email')}
                className={filterBy === 'email' ? 'bg-[#d35c65] hover:bg-[#b24e55]' : ''}
              >
                <Mail className="h-4 w-4 mr-1" />
                With Email
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                disabled={filteredContacts.length === 0}
              >
                Select All ({filteredContacts.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
                disabled={selectedContacts.length === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {/* Selected Contacts Summary */}
          {selectedContacts.length > 0 && (
            <div className="bg-[#d35c65]/10 border border-[#d35c65]/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#d35c65] text-white">
                    {selectedContacts.length} Selected
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Ready to send emails
                  </span>
                </div>
                <Button
                  onClick={() => onSendEmail(selectedContacts)}
                  className="bg-[#d35c65] hover:bg-[#b24e55] text-white"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredContacts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No contacts found' : 'No contacts available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : 'Your contacts will appear here once loaded'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Card 
              key={contact.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedContacts.includes(contact.id) 
                  ? 'ring-2 ring-[#d35c65] bg-[#d35c65]/5' 
                  : 'hover:border-[#d35c65]/30'
              }`}
              onClick={() => handleSelectContact(contact.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="mr-2"
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#d35c65]/10 text-[#d35c65] font-semibold">
                        {getContactInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.email_sent_on && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                    </div>
                    

                    
                    {contact.company && (
                      <div className="flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">
                          {contact.company}
                          {contact.title && ` • ${contact.title}`}
                        </span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {contact.phone}
                        </span>
                      </div>
                    )}

                    {contact.linkedin_link && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                        <a 
                          href={contact.linkedin_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList; 