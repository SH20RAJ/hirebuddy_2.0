import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface CampaignFormProps {
  emailData: {
    name: string;
    subject: string;
    content: string;
    template: string;
    schedule: string;
  };
  onEmailDataChange: (data: any) => void;
  templates: Template[];
}

const CampaignForm = ({ emailData, onEmailDataChange, templates }: CampaignFormProps) => {
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onEmailDataChange({
        ...emailData,
        template: templateId,
        subject: template.subject,
        content: template.content
      });
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = emailData.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      onEmailDataChange({
        ...emailData,
        content: before + placeholder + after
      });
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name</Label>
        <Input
          id="campaign-name"
          placeholder="e.g., Q1 2024 Outreach Campaign"
          value={emailData.name}
          onChange={(e) => onEmailDataChange({ ...emailData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Email Template</Label>
        <Select value={emailData.template} onValueChange={handleTemplateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a template or start from scratch" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          placeholder="Enter email subject..."
          value={emailData.subject}
          onChange={(e) => onEmailDataChange({ ...emailData, subject: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Email Content</Label>
        <Textarea
          id="content"
          placeholder="Write your email content here..."
          className="min-h-[250px]"
          value={emailData.content}
          onChange={(e) => onEmailDataChange({ ...emailData, content: e.target.value })}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-blue-50"
            onClick={() => insertPlaceholder('{{firstName}}')}
          >
            &#123;&#123;firstName&#125;&#125;
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-blue-50"
            onClick={() => insertPlaceholder('{{lastName}}')}
          >
            &#123;&#123;lastName&#125;&#125;
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-blue-50"
            onClick={() => insertPlaceholder('{{company}}')}
          >
            &#123;&#123;company&#125;&#125;
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-blue-50"
            onClick={() => insertPlaceholder('{{position}}')}
          >
            &#123;&#123;position&#125;&#125;
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click on the placeholder badges above to insert them at your cursor position
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule">Campaign Schedule</Label>
        <Select value={emailData.schedule} onValueChange={(value) => onEmailDataChange({ ...emailData, schedule: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Send Immediately</SelectItem>
            <SelectItem value="schedule">Schedule for Later</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CampaignForm; 