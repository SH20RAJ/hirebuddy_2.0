import { ShinyButton } from "@/components/ui/shiny-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  ArrowRight,
  Palette
} from "lucide-react";
import { useState } from "react";

interface TemplateToggleProps {
  currentTemplate: string;
  availableTemplates: Array<{
    id: string;
    name: string;
    description: string;
    atsScore: number;
    features: string[];
  }>;
  onTemplateChange: (templateId: string) => void;
  preserveContent?: boolean;
}

export const TemplateToggle = ({ 
  currentTemplate, 
  availableTemplates, 
  onTemplateChange,
  preserveContent = true 
}: TemplateToggleProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTemplateSwitch = async (newTemplateId: string) => {
    if (newTemplateId === currentTemplate) return;
    
    setIsTransitioning(true);
    
    // Simulate content preservation process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onTemplateChange(newTemplateId);
    setIsTransitioning(false);
  };

  const currentTemplateData = availableTemplates.find(t => t.id === currentTemplate);
  const otherTemplates = availableTemplates.filter(t => t.id !== currentTemplate);

  return (
    <div className="space-y-4">
      {/* Current Template Display */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {currentTemplateData?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Currently active template
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {currentTemplateData?.atsScore}% ATS
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Template Switching Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-600" />
          <h5 className="font-medium text-gray-900">Switch Template</h5>
          {preserveContent && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Content Preserved
            </Badge>
          )}
        </div>

        {otherTemplates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
            onClick={() => handleTemplateSwitch(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">{template.name}</h5>
                    <Badge variant="outline" className="text-xs">
                      {template.atsScore}% ATS
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {isTransitioning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Switch Actions */}
      <div className="pt-4 border-t">
        <div className="flex gap-2">
          <ShinyButton
            onClick={() => {
              // Switch to next template in the list
              const currentIndex = availableTemplates.findIndex(t => t.id === currentTemplate);
              const nextIndex = (currentIndex + 1) % availableTemplates.length;
              handleTemplateSwitch(availableTemplates[nextIndex].id);
            }}
            className="flex-1"
          >
            <ToggleRight className="w-4 h-4 mr-2" />
            Next Template
          </ShinyButton>
        </div>
      </div>
    </div>
  );
}; 