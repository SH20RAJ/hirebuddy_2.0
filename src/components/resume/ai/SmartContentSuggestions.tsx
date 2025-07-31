import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus, Copy, Check, Loader2 } from "lucide-react";
import { openaiService, ContentSuggestion } from "@/services/openaiService";
import { toast } from "sonner";

interface SmartContentSuggestionsProps {
  onApplySuggestions: (suggestions: ContentSuggestion) => void;
  currentDescription?: string;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Engineering",
  "Design",
  "Operations",
  "Human Resources",
  "Legal",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Media",
  "Non-profit",
  "Government",
  "Other"
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive Level",
  "Intern"
];

export const SmartContentSuggestions: React.FC<SmartContentSuggestionsProps> = ({
  onApplySuggestions,
  currentDescription
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const generateSuggestions = async () => {
    if (!jobTitle || !industry || !experienceLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await openaiService.generateContentSuggestions(
        jobTitle,
        industry,
        experienceLevel,
        currentDescription
      );
      setSuggestions(result);
      toast.success("AI suggestions generated successfully!");
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, id]));
      toast.success("Copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const applySuggestions = () => {
    if (suggestions) {
      onApplySuggestions(suggestions);
      toast.success("Suggestions applied to your resume!");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Smart Content Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get AI-powered suggestions for bullet points, skills, and achievements based on your role
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level *</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentDescription && (
          <div className="space-y-2">
            <Label>Current Description (Optional)</Label>
            <Textarea
              value={currentDescription}
              readOnly
              className="h-20 bg-muted"
              placeholder="Your current job description will be used for context"
            />
          </div>
        )}

        <Button 
          onClick={generateSuggestions} 
          disabled={isLoading || !jobTitle || !industry || !experienceLevel}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Suggestions
            </>
          )}
        </Button>

        {/* Suggestions Display */}
        {suggestions && (
          <div className="space-y-6">
            <Separator />
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Generated Suggestions</h3>
              <Button onClick={applySuggestions} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Apply All to Resume
              </Button>
            </div>

            {/* Bullet Points */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Experience Bullet Points
              </h4>
              <ScrollArea className="h-48 w-full border rounded-md p-4">
                <div className="space-y-2">
                  {suggestions.bulletPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 hover:bg-muted rounded-md">
                      <div className="flex-1 text-sm">{point}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(point, `bullet-${index}`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedItems.has(`bullet-${index}`) ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recommended Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => copyToClipboard(skill, `skill-${index}`)}
                  >
                    {skill}
                    {copiedItems.has(`skill-${index}`) ? (
                      <Check className="w-3 h-3 ml-1 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Achievement Examples
              </h4>
              <ScrollArea className="h-32 w-full border rounded-md p-4">
                <div className="space-y-2">
                  {suggestions.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 hover:bg-muted rounded-md">
                      <div className="flex-1 text-sm">{achievement}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(achievement, `achievement-${index}`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedItems.has(`achievement-${index}`) ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 