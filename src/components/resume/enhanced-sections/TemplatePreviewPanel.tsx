import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Download, 
  Edit3, 
  Move, 
  RotateCcw,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface TemplatePreviewPanelProps {
  selectedTemplate: string;
  resumeData?: any;
  onSectionReorder?: (sections: string[]) => void;
  onTemplateSwitch?: (templateId: string) => void;
}

const templateStyles = {
  "perfect-fit": {
    layout: "academic-style",
    colors: { primary: "#000000", secondary: "#374151", accent: "#2563eb" },
    typography: { heading: "font-bold", body: "font-serif" }
  }
};

const guidedTips = [
  {
    id: "header",
    title: "Professional Header",
    description: "Include your full name, professional title, and contact information",
    icon: Info,
    priority: "high"
  },
  {
    id: "summary",
    title: "Compelling Summary",
    description: "Write 2-3 sentences highlighting your key achievements and value proposition",
    icon: Lightbulb,
    priority: "high"
  },
  {
    id: "experience",
    title: "Quantified Experience",
    description: "Use numbers and metrics to demonstrate your impact in previous roles",
    icon: CheckCircle,
    priority: "high"
  },
  {
    id: "skills",
    title: "Relevant Skills",
    description: "List skills that match the job requirements, prioritizing technical skills",
    icon: AlertCircle,
    priority: "medium"
  }
];

export const TemplatePreviewPanel = ({ 
  selectedTemplate, 
  resumeData, 
  onSectionReorder,
  onTemplateSwitch 
}: TemplatePreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [sections, setSections] = useState([
    "header", "summary", "experience", "education", "skills"
  ]);

  const currentStyle = templateStyles[selectedTemplate as keyof typeof templateStyles] || templateStyles["perfect-fit"];

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSection: string) => {
    e.preventDefault();
    if (!draggedSection) return;

    const newSections = [...sections];
    const draggedIndex = newSections.indexOf(draggedSection);
    const targetIndex = newSections.indexOf(targetSection);

    newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    setSections(newSections);
    setDraggedSection(null);
    onSectionReorder?.(newSections);
  };

  const ResumePreview = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-[600px] shadow-sm">
      <div className="max-w-2xl mx-auto space-y-6">
        {sections.map((section, index) => (
          <div
            key={section}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            className={`group cursor-move transition-all duration-200 ${
              draggedSection === section ? 'opacity-50' : ''
            } hover:bg-gray-50 rounded p-2 -m-2`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Move className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`h-4 bg-gray-900 rounded ${getSectionWidth(section)}`}></div>
            </div>
            <div className="space-y-1 ml-6">
              {getSectionContent(section).map((line, lineIndex) => (
                <div key={lineIndex} className={`h-2 bg-gray-300 rounded ${line.width}`}></div>
              ))}
            </div>
            {index < sections.length - 1 && <div className="mt-4 border-b border-gray-100"></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const getSectionWidth = (section: string) => {
    const widths = {
      header: "w-32",
      summary: "w-24",
      experience: "w-28",
      education: "w-24",
      skills: "w-20"
    };
    return widths[section as keyof typeof widths] || "w-24";
  };

  const getSectionContent = (section: string) => {
    const content = {
      header: [
        { width: "w-full" },
        { width: "w-3/4" },
        { width: "w-2/3" }
      ],
      summary: [
        { width: "w-full" },
        { width: "w-5/6" },
        { width: "w-4/5" }
      ],
      experience: [
        { width: "w-full" },
        { width: "w-4/5" },
        { width: "w-5/6" },
        { width: "w-3/4" }
      ],
      education: [
        { width: "w-full" },
        { width: "w-2/3" }
      ],
      skills: [
        { width: "w-full" },
        { width: "w-4/5" }
      ]
    };
    return content[section as keyof typeof content] || [{ width: "w-full" }];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <div className="flex items-center gap-2">
          <InteractiveHoverButton>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Layout
          </InteractiveHoverButton>
          <RainbowButton>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </RainbowButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="tips">Guided Tips</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 p-4">
          <ResumePreview />
        </TabsContent>

        <TabsContent value="tips" className="flex-1 p-4">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Lightbulb className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900">Resume Writing Tips</h4>
              <p className="text-sm text-gray-600">Follow these best practices for maximum impact</p>
            </div>

            {guidedTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card key={tip.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        tip.priority === 'high' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          tip.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{tip.title}</h5>
                          <Badge 
                            variant={tip.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {tip.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="customize" className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Style</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(templateStyles).map(([templateId, style]) => (
                  <ShinyButton
                    key={templateId}
                    onClick={() => onTemplateSwitch?.(templateId)}
                    className={`justify-start ${selectedTemplate === templateId ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: style.colors.accent }}
                      ></div>
                      <span className="text-xs capitalize">
                        {templateId.replace('-', ' ')}
                      </span>
                    </div>
                  </ShinyButton>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Section Order</h4>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, section)}
                  >
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {section}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Pro Tip</h5>
                  <p className="text-sm text-blue-700">
                    Drag and drop sections to reorder them. Your content will be preserved 
                    when switching between templates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 