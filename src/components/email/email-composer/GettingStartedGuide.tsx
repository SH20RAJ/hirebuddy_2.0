import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

interface GettingStartedGuideProps {
  selectedContactsCount: number;
}

const GettingStartedGuide = ({ selectedContactsCount }: GettingStartedGuideProps) => {
  if (selectedContactsCount > 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <span>Getting Started</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="font-medium">How to send your first campaign:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Choose a template or write your own email</li>
            <li>Select contacts from the list on the right</li>
            <li>Personalize your message using placeholders</li>
            <li>Click "Send to X Contacts" to launch your campaign</li>
          </ol>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Tip: Use placeholders like &#123;&#123;firstName&#125;&#125; and &#123;&#123;company&#125;&#125; to personalize each email automatically
        </div>
      </CardContent>
    </Card>
  );
};

export default GettingStartedGuide; 