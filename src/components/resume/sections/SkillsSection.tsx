
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Sparkles, FileCheck, Tag, Zap } from "lucide-react";
import { useState } from "react";

interface SkillsSectionProps {
  skills: string[];
  onUpdate: (skills: string[]) => void;
  jobDescription?: string;
}

type SkillCategory = {
  name: string;
  skills: string[];
};

export const SkillsSection = ({ skills, onUpdate, jobDescription }: SkillsSectionProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([
    { name: "Technical", skills: [] },
    { name: "Soft Skills", skills: [] },
    { name: "Tools", skills: [] },
    { name: "Other", skills: [] }
  ]);

  // Industry-specific skill suggestions
  const industrySkills = {
    tech: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "Git", "SQL", "NoSQL", "CI/CD", "Agile", "REST APIs"],
    marketing: ["SEO", "Content Strategy", "Social Media", "Google Analytics", "Email Marketing", "A/B Testing", "CRM", "Adobe Creative Suite"],
    finance: ["Financial Analysis", "Excel", "Forecasting", "Budgeting", "Risk Assessment", "QuickBooks", "SAP", "Bloomberg Terminal"],
    healthcare: ["Patient Care", "Medical Records", "HIPAA", "Clinical Research", "Medical Terminology", "Epic Systems", "Care Coordination"],
    design: ["UI/UX", "Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping", "Visual Design", "Typography", "Color Theory"]
  };

  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      onUpdate(updatedSkills);
      setNewSkill("");
      categorizeSkills(updatedSkills);
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    onUpdate(updatedSkills);
    categorizeSkills(updatedSkills);
  };

  // Add suggested skills based on industry
  const addSuggestedSkills = (industry: keyof typeof industrySkills) => {
    const suggestedSkills = industrySkills[industry];
    const newSkills = [...skills];
    
    suggestedSkills.forEach(skill => {
      if (!newSkills.includes(skill)) {
        newSkills.push(skill);
      }
    });
    
    onUpdate(newSkills);
    categorizeSkills(newSkills);
  };

  // Categorize skills (simplified implementation)
  const categorizeSkills = (skillsList: string[]) => {
    // This is a simplified categorization - in a real app, this would use more sophisticated logic
    const technical = ["React", "TypeScript", "JavaScript", "Python", "Java", "C++", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "SQL", "NoSQL", "MongoDB", "REST", "GraphQL", "Git", "CI/CD", "HTML", "CSS"];
    const softSkills = ["Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking", "Time Management", "Adaptability", "Creativity", "Collaboration", "Presentation", "Negotiation", "Conflict Resolution"];
    const tools = ["Figma", "Adobe", "Photoshop", "Illustrator", "Sketch", "JIRA", "Confluence", "Slack", "Microsoft Office", "Google Workspace", "Trello", "Asana", "Notion", "Excel", "PowerPoint", "Word"];
    
    const categorized = skillCategories.map(category => {
      return { ...category, skills: [] };
    });
    
    skillsList.forEach(skill => {
      if (technical.some(tech => skill.toLowerCase().includes(tech.toLowerCase()))) {
        categorized[0].skills.push(skill);
      } else if (softSkills.some(soft => skill.toLowerCase().includes(soft.toLowerCase()))) {
        categorized[1].skills.push(skill);
      } else if (tools.some(tool => skill.toLowerCase().includes(tool.toLowerCase()))) {
        categorized[2].skills.push(skill);
      } else {
        categorized[3].skills.push(skill);
      }
    });
    
    setSkillCategories(categorized);
  };

  // Analyze skills against job description
  const analyzeSkillsForATS = () => {
    // This would be implemented with NLP in a real application
    // For now, we'll just categorize the skills
    categorizeSkills(skills);
  };

  // Handle key press (Enter) to add skill
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Skills</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Project Management)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addSkill} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="mt-4">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full ml-1"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No skills added yet. Add skills to improve your resume's ATS compatibility.
                </p>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => analyzeSkillsForATS()}
                className="gap-1"
              >
                <FileCheck className="h-4 w-4" />
                Analyze for ATS
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            {skillCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {category.skills.length}
                  </Badge>
                </div>
                
                {category.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pl-6">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full ml-1"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 pl-6">
                    No {category.name.toLowerCase()} skills added yet.
                  </p>
                )}
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("all")}
                className="w-full"
              >
                Add More Skills
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Industry-Specific Skill Suggestions
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Technology
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSuggestedSkills("tech")}
                        className="bg-white"
                      >
                        Add Tech Skills
                      </Button>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {industrySkills.tech.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-white cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              if (!skills.includes(skill)) {
                                onUpdate([...skills, skill]);
                                categorizeSkills([...skills, skill]);
                              }
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="bg-white">+{industrySkills.tech.length - 6} more</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-purple-500" />
                      Marketing
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSuggestedSkills("marketing")}
                        className="bg-white"
                      >
                        Add Marketing Skills
                      </Button>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {industrySkills.marketing.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-white cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              if (!skills.includes(skill)) {
                                onUpdate([...skills, skill]);
                                categorizeSkills([...skills, skill]);
                              }
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="bg-white">+{industrySkills.marketing.length - 6} more</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-500" />
                      Design
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSuggestedSkills("design")}
                        className="bg-white"
                      >
                        Add Design Skills
                      </Button>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {industrySkills.design.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-white cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              if (!skills.includes(skill)) {
                                onUpdate([...skills, skill]);
                                categorizeSkills([...skills, skill]);
                              }
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="bg-white">+{industrySkills.design.length - 6} more</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("all")}
                className="w-full"
              >
                Return to Skills
              </Button>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
};
