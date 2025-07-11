import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContacts } from '@/hooks/useContacts';
import { Search, Users, Mail, Building, User } from 'lucide-react';

interface ContactSelectorProps {
  selectedContacts: string[];
  onSelectionChange: (contactIds: string[]) => void;
}

const ContactSelector = ({ selectedContacts, onSelectionChange }: ContactSelectorProps) => {
  const { contacts, loading } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.status === 'active' && (
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredContacts.map(contact => contact.id));
    }
  };

  const handleContactToggle = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      onSelectionChange(selectedContacts.filter(id => id !== contactId));
    } else {
      onSelectionChange([...selectedContacts, contactId]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading contacts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Select Recipients</span>
          <Badge variant="outline">
            {selectedContacts.length} selected
          </Badge>
        </CardTitle>
        <CardDescription>
          Choose contacts to receive your cold email campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Select All */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleSelectAll}
            disabled={filteredContacts.length === 0}
          >
            {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Contact List */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No contacts found matching your search' : 'No active contacts available'}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleContactToggle(contact.id)}
              >
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleContactToggle(contact.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm truncate">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <Badge className="bg-green-100 text-green-800">
                      {contact.status}
                    </Badge>
                  </div>

                  {contact.company && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{contact.company}</span>
                      {contact.position && <span>• {contact.position}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Total contacts: {filteredContacts.length}
            </span>
            <span className="font-medium">
              Selected: {selectedContacts.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSelector; 