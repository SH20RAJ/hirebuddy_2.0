import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

// WARNING: This component used campaign functionality which has been removed
// Consider using AWSEmailComposer or SimpleEmailComposer instead
const EmailComposer = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Composer</CardTitle>
          <CardDescription>
            This component is being updated. Please use the alternative email composers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Feature Under Maintenance</h3>
            <p className="text-gray-600 mb-4">
              The campaign-based email composer is temporarily unavailable.
            </p>
            <p className="text-sm text-gray-500">
              Use the AWS Email Composer or Simple Email Composer for sending emails.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailComposer; 