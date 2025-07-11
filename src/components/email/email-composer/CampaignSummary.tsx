import React from 'react';
import { Users, Clock } from 'lucide-react';

interface CampaignSummaryProps {
  selectedContactsCount: number;
  schedule: string;
  campaignId?: string;
  showLiveMetrics?: boolean;
}

const CampaignSummary = ({ selectedContactsCount, schedule }: CampaignSummaryProps) => {

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Campaign Summary</h4>
      <div className="space-y-1 text-sm text-blue-800">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>{selectedContactsCount} recipients selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{schedule === 'immediate' ? 'Send immediately' : 'Send later'}</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignSummary; 