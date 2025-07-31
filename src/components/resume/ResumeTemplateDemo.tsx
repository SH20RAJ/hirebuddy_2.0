import { useState } from "react";
import { ResumeTemplates } from "./ResumeTemplates";
import { TemplatePreviewPanel } from "./enhanced-sections/TemplatePreviewPanel";
import { TemplateToggle } from "./TemplateToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layout, 
  Eye, 
  Settings, 
  FileText,
  Sparkles,
  ArrowLeft,
  Download
} from "lucide-react";

const templates = [
  {
    id: "perfect-fit",
    name: "Software Engineer",
    description: "Academic-style template with clean typography and structured layout",
    category: "Software Engineering",
    atsScore: 99,
    features: ["Academic Style", "Clean Layout", "Perfect Typography"]
  }
];

export const ResumeTemplateDemo = () => {
  const [currentView, setCurrentView] = useState<'selection' | 'builder'>('selection');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('minimal-professional');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "John Doe",
      title: "Software Engineer",
      email: "john@email.com",
      phone: "+1-234-567-8900"
    },
    sections: ["header", "summary", "experience", "education", "skills"]
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentView('builder');
  };

  const handleTemplateSwitch = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSectionReorder = (newSections: string[]) => {
    setResumeData(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  if (currentView === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResumeTemplates onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <InteractiveHoverButton
                onClick={() => setCurrentView('selection')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </InteractiveHoverButton>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Resume Builder</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {templates.find(t => t.id === selectedTemplate)?.name}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ShinyButton>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </ShinyButton>
              <RainbowButton>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Switching */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Template Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateToggle
                  currentTemplate={selectedTemplate}
                  availableTemplates={templates}
                  onTemplateChange={handleTemplateSwitch}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InteractiveHoverButton className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Sections
                </InteractiveHoverButton>
                <InteractiveHoverButton className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Full Screen Preview
                </InteractiveHoverButton>
                <InteractiveHoverButton className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  ATS Optimization Check
                </InteractiveHoverButton>
              </CardContent>
            </Card>

            {/* Template Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-gray-600">Template Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ATS Compatibility</span>
                    <Badge className="bg-green-100 text-green-800">
                      {templates.find(t => t.id === selectedTemplate)?.atsScore}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Readability Score</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Industry Match</span>
                    <Badge variant="secondary">High</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <TemplatePreviewPanel
                selectedTemplate={selectedTemplate}
                resumeData={resumeData}
                onSectionReorder={handleSectionReorder}
                onTemplateSwitch={handleTemplateSwitch}
              />
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Preview</h3>
            <p className="text-sm text-gray-600">
              See your changes instantly as you build your resume with live preview functionality.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Drag & Drop</h3>
            <p className="text-sm text-gray-600">
              Easily rearrange sections and customize your resume layout with intuitive controls.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Templates</h3>
            <p className="text-sm text-gray-600">
              Switch between templates seamlessly while preserving all your content and formatting.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}; 