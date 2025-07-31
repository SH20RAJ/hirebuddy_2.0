
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, GraduationCap, BookOpen, Calendar, Info } from "lucide-react";

export interface Education {
  degree: string;
  school: string;
  year: string;
  fieldOfStudy?: string;
  gpa?: string;
  achievements?: string;
}

export interface EducationSectionProps {
  education: Education[];
  onUpdate: (education: Education[]) => void;
}

export const EducationSection = ({ education, onUpdate }: EducationSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>("education");
  const [showAdvanced, setShowAdvanced] = useState<{[key: number]: boolean}>({});

  const addEducation = () => {
    onUpdate([
      ...education,
      { degree: "", school: "", year: "", fieldOfStudy: "", gpa: "", achievements: "" },
    ]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    onUpdate(updatedEducation);
  };

  const removeEducation = (index: number) => {
    onUpdate(education.filter((_, i) => i !== index));
  };
  
  const toggleAdvanced = (index: number) => {
    setShowAdvanced(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const addSuggestedDegree = (degree: string) => {
    if (education.length === 0) {
      addEducation();
      setTimeout(() => {
        updateEducation(0, "degree", degree);
      }, 0);
    } else {
      updateEducation(education.length - 1, "degree", degree);
    }
  };

  return (
    <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="tips">ATS Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="education" className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Degree</label>
                    <Input
                      placeholder="e.g. Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School</label>
                    <Input
                      placeholder="e.g. University of California"
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(index, "school", e.target.value)
                      }
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <Input
                    placeholder="e.g. 2018 - 2022"
                    value={edu.year}
                    onChange={(e) =>
                      updateEducation(index, "year", e.target.value)
                    }
                  />
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleAdvanced(index)}
                    className="text-sm text-blue-600 hover:text-blue-800 p-0"
                  >
                    {showAdvanced[index] ? "Hide" : "Show"} Advanced Options
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                
                {showAdvanced[index] && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium mb-1">Field of Study</label>
                      <Input
                        placeholder="e.g. Computer Science"
                        value={edu.fieldOfStudy || ""}
                        onChange={(e) =>
                          updateEducation(index, "fieldOfStudy", e.target.value)
                        }
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">GPA</label>
                      <Input
                        placeholder="e.g. 3.8/4.0"
                        value={edu.gpa || ""}
                        onChange={(e) =>
                          updateEducation(index, "gpa", e.target.value)
                        }
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Achievements & Activities</label>
                      <Input
                        placeholder="e.g. Dean's List, Relevant Coursework, Honors"
                        value={edu.achievements || ""}
                        onChange={(e) =>
                          updateEducation(index, "achievements", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Education
            </Button>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            <div className="p-4 border rounded bg-blue-50">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Common Degree Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Bachelor of Science",
                  "Bachelor of Arts",
                  "Master of Science",
                  "Master of Arts",
                  "Master of Business Administration",
                  "Doctor of Philosophy",
                  "Associate of Arts",
                  "Associate of Science"
                ].map((degree, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-100 justify-start py-2"
                    onClick={() => addSuggestedDegree(degree)}
                  >
                    {degree}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Date Format Examples
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "2018 - 2022",
                  "May 2022",
                  "2020 - Present",
                  "Expected May 2023",
                  "2015 - 2019",
                  "Fall 2021"
                ].map((date, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-200 justify-start py-2"
                  >
                    {date}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <div className="p-4 border rounded bg-amber-50">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                Education Section ATS Tips
              </h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>List your highest level of education first</li>
                <li>Spell out degree names completely (e.g., "Bachelor of Science" instead of "BS")</li>
                <li>Include your field of study/major</li>
                <li>For recent graduates, include GPA if it's 3.0 or higher</li>
                <li>Only include relevant coursework if directly applicable to the job</li>
                <li>For advanced degrees, you can omit high school education</li>
              </ul>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 border rounded bg-green-50 cursor-help">
                    <h3 className="text-sm font-medium mb-2">Pro Tip: Education Keywords</h3>
                    <p className="text-sm text-gray-600">Including specific educational keywords can help your resume pass ATS filters.</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4">
                  <h4 className="font-medium mb-2">Effective Education Keywords:</h4>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    <li><strong>Degree types:</strong> Bachelor, Master, PhD, MBA, Associate</li>
                    <li><strong>Academic achievements:</strong> Cum Laude, Magna Cum Laude, Dean's List, Honors</li>
                    <li><strong>Certifications:</strong> Include relevant professional certifications</li>
                    <li><strong>Coursework:</strong> List courses relevant to the position</li>
                    <li><strong>Projects:</strong> Mention significant academic projects</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsContent>
        </Tabs>
    </div>
  );
};
