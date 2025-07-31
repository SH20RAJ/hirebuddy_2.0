
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileCheck, AlertCircle, Lightbulb } from "lucide-react";
import { useState } from "react";

interface SummarySectionProps {
  summary: string;
  onUpdate: (summary: string) => void;
  jobDescription?: string;
  onJobDescriptionChange?: (jobDescription: string) => void;
}

export const SummarySection = ({ summary, onUpdate, jobDescription, onJobDescriptionChange }: SummarySectionProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [keywordMatches, setKeywordMatches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulate AI enhancement of the summary
  const aiEnhance = () => {
    setIsEnhancing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const enhancedSummary = 
        "Results-driven software engineer with 5+ years of experience developing scalable web applications. " +
        "Proficient in React, Node.js, and cloud technologies with a track record of improving application performance by 40%. " +
        "Led cross-functional teams to deliver projects on time and under budget while maintaining code quality standards. " +
        "Passionate about creating intuitive user experiences and implementing best practices in software development.";
      
      onUpdate(enhancedSummary);
      setIsEnhancing(false);
      
      // Analyze keywords if job description is available
      if (jobDescription) {
        analyzeKeywords(enhancedSummary, jobDescription);
      }
    }, 1500);
  };

  // Analyze keywords in summary against job description
  const analyzeKeywords = (text: string, jobDesc: string) => {
    // This is a simplified simulation of keyword matching
    // In a real implementation, this would use NLP or a more sophisticated algorithm
    const jobKeywords = [
      "React", "Node.js", "cloud", "scalable", "performance", "cross-functional",
      "user experience", "code quality", "best practices"
    ];
    
    const matches: string[] = [];
    const missing: string[] = [];
    
    jobKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        matches.push(keyword);
      } else {
        missing.push(keyword);
      }
    });
    
    setKeywordMatches(matches);
    setSuggestions(missing);
  };

  // Analyze current summary if job description changes
  const analyzeSummary = () => {
    if (jobDescription && summary) {
      analyzeKeywords(summary, jobDescription);
      setActiveTab("analyze");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Professional Summary</CardTitle>
        <p className="text-sm text-gray-500">
          Your professional summary is the first thing recruiters see. Make it compelling and keyword-rich.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger 
              value="analyze" 
              disabled={!jobDescription}
              className="relative"
            >
              Analyze
              {!jobDescription && (
                <span className="absolute -top-1 -right-1">
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4">
            {onJobDescriptionChange && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description (Optional)</label>
                <Textarea
                  placeholder="Paste a job description here to get personalized keyword suggestions..."
                  className="min-h-[80px] resize-none"
                  value={jobDescription || ""}
                  onChange={(e) => onJobDescriptionChange(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional Summary</label>
              <Textarea
                placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career goals..."
                className="min-h-[150px] resize-none"
                value={summary}
                onChange={(e) => {
                  onUpdate(e.target.value);
                  if (jobDescription) {
                    analyzeKeywords(e.target.value, jobDescription);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={aiEnhance} 
                className="gap-2"
                disabled={isEnhancing}
              >
                <Sparkles className="h-4 w-4" />
                {isEnhancing ? "Enhancing..." : "AI Enhance"}
              </Button>
              
              {jobDescription && (
                <Button 
                  variant="outline" 
                  onClick={analyzeSummary}
                  className="gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Check ATS Match
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="space-y-4">
            {jobDescription ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    Keyword Analysis
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Matched Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {keywordMatches.length > 0 ? (
                          keywordMatches.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No keywords matched yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Suggested Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.length > 0 ? (
                          suggestions.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-green-600">Great job! You've included all key terms.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("write")}
                  className="w-full"
                >
                  Return to Editing
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Job Description Added</h3>
                <p className="text-gray-500 mb-4">
                  Add a job description in the Job Description Analyzer to check your summary against it.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Software Engineer</h3>
                <p className="text-sm text-gray-700">
                  Results-driven software engineer with 5+ years of experience developing scalable web applications. Proficient in React, Node.js, and cloud technologies with a track record of improving application performance by 40%. Led cross-functional teams to deliver projects on time and under budget while maintaining code quality standards.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    onUpdate("Results-driven software engineer with 5+ years of experience developing scalable web applications. Proficient in React, Node.js, and cloud technologies with a track record of improving application performance by 40%. Led cross-functional teams to deliver projects on time and under budget while maintaining code quality standards.");
                    setActiveTab("write");
                  }}
                >
                  Use This Example
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Marketing Manager</h3>
                <p className="text-sm text-gray-700">
                  Strategic marketing manager with 7+ years of experience driving brand growth and digital engagement. Developed and executed comprehensive marketing campaigns that increased conversion rates by 35% and expanded social media following by 50K+. Skilled in data analytics, content strategy, and team leadership with a proven ability to deliver results within budget constraints.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    onUpdate("Strategic marketing manager with 7+ years of experience driving brand growth and digital engagement. Developed and executed comprehensive marketing campaigns that increased conversion rates by 35% and expanded social media following by 50K+. Skilled in data analytics, content strategy, and team leadership with a proven ability to deliver results within budget constraints.");
                    setActiveTab("write");
                  }}
                >
                  Use This Example
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Project Manager</h3>
                <p className="text-sm text-gray-700">
                  Certified project manager (PMP) with 8+ years of experience leading complex projects from conception to completion. Successfully delivered over $5M in projects on time and under budget by implementing agile methodologies and effective resource allocation. Strong communicator with expertise in stakeholder management, risk mitigation, and process optimization.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    onUpdate("Certified project manager (PMP) with 8+ years of experience leading complex projects from conception to completion. Successfully delivered over $5M in projects on time and under budget by implementing agile methodologies and effective resource allocation. Strong communicator with expertise in stakeholder management, risk mitigation, and process optimization.");
                    setActiveTab("write");
                  }}
                >
                  Use This Example
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 bg-amber-50 p-4 rounded-lg flex gap-3">
          <div className="shrink-0">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-800">Pro Tip</h4>
            <p className="text-sm text-amber-700">
              Keep your summary concise (3-5 sentences) and focus on quantifiable achievements. Use industry-specific keywords to improve ATS compatibility.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
