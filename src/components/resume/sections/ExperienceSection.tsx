
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Wand2, FileCheck, AlertCircle, Info, Zap, CheckCircle2 } from "lucide-react";

export interface Experience {
  jobTitle: string;
  company: string;
  duration: string;
  description: string;
}

export interface ExperienceSectionProps {
  experience: Experience[];
  onUpdate: (experience: Experience[]) => void;
  jobDescription?: string;
}

export const ExperienceSection = ({ experience, onUpdate, jobDescription }: ExperienceSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>("write");
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [keywordMatches, setKeywordMatches] = useState<{[key: string]: string[]}>({});
  
  // Example bullet point templates for different job types
  const bulletPointTemplates = {
    engineering: [
      "Developed and maintained {feature/product} using {technologies}, resulting in {measurable outcome}.",
      "Led a team of {team_size} engineers to deliver {project} on time and under budget.",
      "Optimized {system/process}, improving performance by {percentage}%.",
      "Collaborated with cross-functional teams to implement {feature} that increased {metric} by {percentage}%.",
      "Architected and implemented {solution} to solve {problem}, resulting in {benefit}."
    ],
    marketing: [
      "Executed {campaign_type} campaigns that generated {leads_count} qualified leads and {revenue} in revenue.",
      "Increased social media engagement by {percentage}% through strategic content creation and community management.",
      "Developed and implemented {strategy_type} strategy that improved {metric} by {percentage}%.",
      "Managed a marketing budget of {budget_amount}, achieving a ROI of {roi_percentage}%.",
      "Created compelling content for {platforms}, resulting in {outcome}."
    ],
    management: [
      "Led a team of {team_size} professionals, overseeing {projects_count} concurrent projects with a combined budget of {budget}.",
      "Implemented process improvements that increased team productivity by {percentage}%.",
      "Developed and executed strategic plans that resulted in {outcome}.",
      "Managed client relationships, achieving a {percentage}% retention rate and {upsell_amount} in additional business.",
      "Mentored and developed team members, with {promotion_count} receiving promotions within {timeframe}."
    ],
    default: [
      "Successfully delivered {project/task} that {benefit}.",
      "Collaborated with {teams/departments} to implement {initiative} that resulted in {outcome}.",
      "Managed {resource/process}, exceeding targets by {percentage}%.",
      "Recognized for excellence in {area}, receiving {award/recognition}.",
      "Improved {process/system} that saved {time/money/resources}."
    ]
  };

  const addExperience = () => {
    onUpdate([
      ...experience,
      { jobTitle: "", company: "", duration: "", description: "" },
    ]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updatedExperiences = [...experience];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    onUpdate(updatedExperiences);
    
    // If job description is available, analyze for keywords
    if (jobDescription && field === 'description') {
      analyzeKeywords(index, value);
    }
  };

  const removeExperience = (index: number) => {
    onUpdate(experience.filter((_, i) => i !== index));
  };

  const enhanceDescription = async (index: number) => {
    setIsEnhancing(true);
    setActiveExperienceIndex(index);
    
    try {
      // Determine job type based on job title
      const jobTitle = experience[index].jobTitle.toLowerCase();
      let templateType = 'default';
      
      if (jobTitle.includes('engineer') || jobTitle.includes('developer') || jobTitle.includes('programmer')) {
        templateType = 'engineering';
      } else if (jobTitle.includes('market') || jobTitle.includes('content') || jobTitle.includes('brand')) {
        templateType = 'marketing';
      } else if (jobTitle.includes('manager') || jobTitle.includes('director') || jobTitle.includes('lead')) {
        templateType = 'management';
      }
      
      // Get appropriate templates
      const templates = bulletPointTemplates[templateType as keyof typeof bulletPointTemplates];
      
      // Create bullet points with job-specific details
      let enhancedDescription = '';
      
      // If job description is available, extract keywords for better enhancement
      let keywordsToInclude: string[] = [];
      if (jobDescription) {
        const keywords = extractKeywords(jobDescription);
        keywordsToInclude = keywords.slice(0, 5); // Use top 5 keywords
      }
      
      // Generate 3-5 bullet points
      const numBullets = Math.floor(Math.random() * 3) + 3; // 3-5 bullets
      
      for (let i = 0; i < numBullets; i++) {
        const template = templates[i % templates.length];
        let bullet = template;
        
        // Replace placeholders with realistic values
        bullet = bullet
          .replace('{team_size}', String(Math.floor(Math.random() * 10) + 2))
          .replace('{percentage}', String(Math.floor(Math.random() * 30) + 10))
          .replace('{budget}', `$${(Math.floor(Math.random() * 900) + 100)}K`)
          .replace('{timeframe}', `${Math.floor(Math.random() * 2) + 1} year${Math.random() > 0.5 ? 's' : ''}`);
        
        // Include extracted keywords if available
        if (keywordsToInclude.length > 0 && i < keywordsToInclude.length) {
          const keyword = keywordsToInclude[i];
          bullet = bullet.replace(/\{[^}]+\}/, keyword);
        }
        
        enhancedDescription += `• ${bullet}\n`;
      }
      
      // Update the experience with enhanced description
      const updatedExperiences = [...experience];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        description: enhancedDescription.trim(),
      };
      onUpdate(updatedExperiences);
      
      // Analyze keywords after enhancement
      if (jobDescription) {
        analyzeKeywords(index, enhancedDescription);
      }
      
      // Simulate delay for AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error enhancing description:", error);
    } finally {
      setIsEnhancing(false);
      setActiveExperienceIndex(null);
    }
  };
  
  const analyzeKeywords = (index: number, description: string) => {
    if (!jobDescription) return;
    
    const descriptionLower = description.toLowerCase();
    const jobDescriptionLower = jobDescription.toLowerCase();
    
    // Extract keywords from job description
    const keywords = extractKeywords(jobDescription);
    
    // Find matches in the description
    const matches = keywords.filter(keyword => 
      descriptionLower.includes(keyword.toLowerCase())
    );
    
    // Find suggested keywords (not in description)
    const suggested = keywords.filter(keyword => 
      !descriptionLower.includes(keyword.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
    
    // Update keyword matches state
    const newKeywordMatches = {...keywordMatches};
    newKeywordMatches[index] = matches;
    setKeywordMatches(newKeywordMatches);
    
    return { matches, suggested };
  };
  
  const extractKeywords = (text: string): string[] => {
    // Common technical skills and buzzwords
    const commonKeywords = [
      'leadership', 'management', 'team', 'project', 'development', 'strategy',
      'analysis', 'design', 'implementation', 'testing', 'deployment',
      'react', 'javascript', 'typescript', 'node', 'python', 'java', 'c#', 'sql',
      'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'six sigma',
      'communication', 'collaboration', 'problem-solving', 'critical thinking',
      'budget', 'cost reduction', 'revenue growth', 'roi', 'kpi', 'metrics',
      'customer', 'client', 'stakeholder', 'user experience', 'ux', 'ui'
    ];
    
    // Extract words from text
    const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
    
    // Filter out common words and keep relevant keywords
    const stopWords = ['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
    const filteredWords = words.filter(word => 
      !stopWords.includes(word) && 
      word.length > 2 && 
      (commonKeywords.includes(word) || /^[a-z]+$/.test(word))
    );
    
    // Count word frequency
    const wordCount: {[key: string]: number} = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);
    
    // Return top keywords
    return sortedWords.slice(0, 15);
  };
  
  const getAtsScore = (index: number): number => {
    if (!jobDescription || !keywordMatches[index]) return 0;
    
    const matches = keywordMatches[index].length;
    const totalKeywords = Math.min(extractKeywords(jobDescription).length, 15);
    
    return Math.round((matches / totalKeywords) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-green-500" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        {experiences.map((experience, index) => (
          <div key={index} className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  placeholder="e.g. Software Engineer"
                  value={experience.jobTitle}
                  onChange={(e) =>
                    updateExperience(index, "jobTitle", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  placeholder="e.g. Acme Inc."
                  value={experience.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Duration</label>
              <Input
                placeholder="e.g. Jan 2020 - Present"
                value={experience.duration}
                onChange={(e) =>
                  updateExperience(index, "duration", e.target.value)
                }
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                {jobDescription && <TabsTrigger value="analyze">Analyze</TabsTrigger>}
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">Description</label>
                    <div className="flex items-center gap-2">
                      {jobDescription && keywordMatches[index] && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs">
                                <Badge variant={getAtsScore(index) >= 50 ? "success" : "outline"} className="h-6">
                                  {getAtsScore(index)}% Match
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Keyword match score with job description</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enhanceDescription(index)}
                        disabled={isEnhancing && activeExperienceIndex === index}
                        className="flex items-center gap-1"
                      >
                        {isEnhancing && activeExperienceIndex === index ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></span>
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4" />
                            AI Enhance
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={experience.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    className="min-h-[150px]"
                  />
                </div>
              </TabsContent>
              
              {jobDescription && (
                <TabsContent value="analyze" className="space-y-4">
                  <div className="p-4 border rounded bg-gray-50">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {keywordMatches[index] && keywordMatches[index].length > 0 ? (
                        keywordMatches[index].map((keyword, i) => (
                          <Badge key={i} variant="success" className="text-xs">{keyword}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No keywords matched yet. Try enhancing your description.</p>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Suggested Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobDescription && (
                        extractKeywords(jobDescription)
                          .filter(keyword => !keywordMatches[index] || !keywordMatches[index].includes(keyword))
                          .slice(0, 5)
                          .map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
                          ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="tips" className="space-y-4">
                <div className="p-4 border rounded bg-blue-50">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    ATS-Friendly Tips
                  </h3>
                  <ul className="text-sm space-y-2 list-disc pl-5">
                    <li>Use bullet points starting with action verbs</li>
                    <li>Include measurable achievements with numbers and percentages</li>
                    <li>Match keywords from the job description</li>
                    <li>Be specific about technologies and methodologies used</li>
                    <li>Focus on results and impact, not just responsibilities</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded bg-amber-50">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Power Verbs
                  </h3>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {[
                      "Achieved", "Delivered", "Implemented", "Developed", "Managed", 
                      "Led", "Created", "Designed", "Optimized", "Improved",
                      "Increased", "Reduced", "Negotiated", "Coordinated", "Analyzed"
                    ].map((verb, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-amber-100">
                        {verb}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeExperience(index)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addExperience}
          className="w-full flex items-center justify-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </CardContent>
    </Card>
  );
};
