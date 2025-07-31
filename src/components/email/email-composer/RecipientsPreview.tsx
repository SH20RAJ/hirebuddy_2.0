import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface RecipientsPreviewProps {
  selectedContacts: Contact[];
}

const RecipientsPreview = ({ selectedContacts }: RecipientsPreviewProps) => {
  if (selectedContacts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Selected Recipients Preview</CardTitle>
        <CardDescription>
          These contacts will receive your campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedContacts.slice(0, 5).map((contact) => (
            <div key={contact.id} className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{contact.first_name} {contact.last_name}</span>
              <span className="text-gray-500">({contact.email})</span>
            </div>
          ))}
          {selectedContacts.length > 5 && (
            <div className="text-sm text-gray-500 italic">
              +{selectedContacts.length - 5} more contacts...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipientsPreview; 