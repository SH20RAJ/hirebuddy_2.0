import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Loader2,
  Copy,
  Check,
  Plus,
  Lightbulb,
  Sparkles,
  Target,
  ArrowRight,
  Download,
  RefreshCw
} from "lucide-react";
import { openaiService, JobMatchingResult } from "@/services/openaiService";
import { toast } from "sonner";

interface JobDescriptionMatcherProps {
  resumeData: any;
  onApplyChanges: (changes: JobMatchingResult['suggestedChanges']) => void;
}

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  resumeData,
  onApplyChanges
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchingResult, setMatchingResult] = useState<JobMatchingResult | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const analyzeJobMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    if (!resumeData.personalInfo?.name && !resumeData.summary && (!resumeData.experience || resumeData.experience.length === 0)) {
      toast.error("Please add some resume content before analyzing job match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await openaiService.matchJobDescription(resumeData, jobDescription);
      setMatchingResult(result);
      setAppliedSuggestions(new Set()); // Reset applied suggestions
      toast.success("Job matching analysis completed!");
    } catch (error) {
      console.error('Error analyzing job match:', error);
      toast.error("Failed to analyze job match. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, id]));
      toast.success("Copied to clipboard!");
      
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

  const applyAllChanges = () => {
    if (matchingResult) {
      onApplyChanges(matchingResult.suggestedChanges);
      setAppliedSuggestions(new Set(['all']));
      toast.success("All suggested changes applied to your resume!");
    }
  };

  const applySpecificSuggestion = (type: string, data: any) => {
    if (!matchingResult) return;

    const changes: Partial<JobMatchingResult['suggestedChanges']> = {};

    switch (type) {
      case 'summary':
        changes.summary = matchingResult.suggestedChanges.summary;
        break;
      case 'skills':
        changes.skillsToAdd = matchingResult.suggestedChanges.skillsToAdd;
        changes.skillsToEmphasize = matchingResult.suggestedChanges.skillsToEmphasize;
        break;
      case 'experience':
        changes.experienceUpdates = matchingResult.suggestedChanges.experienceUpdates;
        break;
    }

    onApplyChanges(changes as JobMatchingResult['suggestedChanges']);
    setAppliedSuggestions(prev => new Set([...prev, type]));
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} suggestions applied!`);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-200";
    if (score >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  const getMatchScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent match! Your resume is perfectly aligned with this job.";
    if (score >= 80) return "Great match! Your resume aligns well with this job.";
    if (score >= 70) return "Good match with some room for improvement.";
    if (score >= 60) return "Moderate match. Consider implementing the suggestions below.";
    return "Significant optimization needed to match this job requirements.";
  };

  const clearAnalysis = () => {
    setMatchingResult(null);
    setAppliedSuggestions(new Set());
    setCopiedItems(new Set());
  };

  const loadDemoData = () => {
    const demoJobDescription = `
Software Engineer - Frontend Development

We are seeking a talented Frontend Software Engineer to join our dynamic team. The ideal candidate will have strong experience in modern web development technologies and a passion for creating exceptional user experiences.

Key Responsibilities:
• Develop and maintain responsive web applications using React.js and TypeScript
• Collaborate with cross-functional teams including designers, product managers, and backend engineers
• Implement modern frontend architectures and design patterns
• Write clean, maintainable, and well-tested code
• Participate in code reviews and contribute to team best practices
• Optimize applications for maximum speed and scalability
• Work with RESTful APIs and GraphQL
• Implement CI/CD pipelines and automated testing

Required Qualifications:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in frontend development
• Proficiency in React.js, TypeScript, and modern JavaScript (ES6+)
• Experience with state management libraries (Redux, Zustand)
• Strong understanding of HTML5, CSS3, and responsive design
• Experience with version control systems (Git)
• Knowledge of testing frameworks (Jest, React Testing Library)
• Familiarity with build tools (Webpack, Vite)

Preferred Qualifications:
• Experience with Next.js or other React frameworks
• Knowledge of cloud platforms (AWS, Azure, GCP)
• Experience with Docker and containerization
• Understanding of Agile/Scrum methodologies
• Experience with design systems and component libraries
• Knowledge of accessibility standards (WCAG)
• Experience with performance optimization techniques

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and remote work options
• Professional development opportunities
• Modern tech stack and cutting-edge projects
• Collaborative and inclusive work environment
`;

    setJobDescription(demoJobDescription);
    toast.success("Demo job description loaded! Click 'Analyze Job Match' to see how it works.");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-green-600" />
          Job Description Matcher
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste a job description to get tailored resume optimization suggestions with AI-powered analysis
        </p>
        
        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How to get the best results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include the complete job posting with requirements, responsibilities, and qualifications</li>
                <li>• Make sure your resume has some content (summary, experience, skills) before analyzing</li>
                <li>• The AI will identify missing keywords and suggest specific improvements</li>
                <li>• You can apply suggestions individually or all at once to your resume</li>
              </ul>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Description Input */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description *</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the complete job description here including requirements, responsibilities, qualifications, and preferred skills..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px] resize-y"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Include the full job posting for best results ({jobDescription.length} characters)
            </p>
            <div className="flex gap-2">
              {!jobDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDemoData}
                  className="text-xs"
                >
                  Try Demo
                </Button>
              )}
              {jobDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setJobDescription('')}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={analyzeJobMatch} 
            disabled={isLoading || !jobDescription.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Job Match...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Job Match
              </>
            )}
          </Button>
          
          {matchingResult && (
            <Button
              variant="outline"
              onClick={clearAnalysis}
              className="px-3"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Matching Results */}
        {matchingResult && (
          <div className="space-y-6">
            <Separator />
            
            {/* Match Score */}
            <div className={`p-6 rounded-lg border ${getMatchScoreBackground(matchingResult.matchingScore)}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Job Match Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on skills, experience, and keyword alignment
                  </p>
                </div>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(matchingResult.matchingScore)}`}>
                    {matchingResult.matchingScore}%
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">Match Score</div>
                </div>
              </div>
              <Progress value={matchingResult.matchingScore} className="h-3 mb-3" />
              <p className="text-sm font-medium">
                {getMatchScoreMessage(matchingResult.matchingScore)}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={applyAllChanges} 
                className="bg-green-600 hover:bg-green-700"
                disabled={appliedSuggestions.has('all')}
              >
                {appliedSuggestions.has('all') ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    All Applied
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Apply All Suggestions
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => applySpecificSuggestion('summary', null)}
                disabled={appliedSuggestions.has('summary')}
              >
                {appliedSuggestions.has('summary') ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Summary Applied
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Apply Summary
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => applySpecificSuggestion('skills', null)}
                disabled={appliedSuggestions.has('skills')}
              >
                {appliedSuggestions.has('skills') ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Skills Applied
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Skills
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Keywords */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Matching Keywords ({matchingResult.keywordMatches.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {matchingResult.keywordMatches.slice(0, 8).map((keyword, index) => (
                          <Badge key={index} variant="default" className="bg-green-100 text-green-800 text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {matchingResult.keywordMatches.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{matchingResult.keywordMatches.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Keywords */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Missing Keywords ({matchingResult.missingKeywords.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {matchingResult.missingKeywords.slice(0, 8).map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="destructive" 
                            className="bg-red-100 text-red-800 text-xs cursor-pointer hover:bg-red-200"
                            onClick={() => copyToClipboard(keyword, `missing-${index}`)}
                          >
                            {keyword}
                            {copiedItems.has(`missing-${index}`) ? (
                              <Check className="w-3 h-3 ml-1" />
                            ) : (
                              <Copy className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                        {matchingResult.missingKeywords.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{matchingResult.missingKeywords.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Key Improvement Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {matchingResult.missingKeywords.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          <div>
                            <p className="font-medium text-sm">Add Missing Keywords</p>
                            <p className="text-xs text-muted-foreground">
                              Incorporate {matchingResult.missingKeywords.length} important keywords throughout your resume
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {matchingResult.suggestedChanges.skillsToAdd.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                          <div>
                            <p className="font-medium text-sm">Enhance Skills Section</p>
                            <p className="text-xs text-muted-foreground">
                              Add {matchingResult.suggestedChanges.skillsToAdd.length} relevant skills to strengthen your profile
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {matchingResult.suggestedChanges.experienceUpdates.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <div>
                            <p className="font-medium text-sm">Optimize Experience Descriptions</p>
                            <p className="text-xs text-muted-foreground">
                              Update {matchingResult.suggestedChanges.experienceUpdates.length} experience entries with job-specific language
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Keywords Tab */}
              <TabsContent value="keywords" className="space-y-4">
                {/* Matching Keywords */}
                {matchingResult.keywordMatches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium">Keywords You Already Have ({matchingResult.keywordMatches.length})</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchingResult.keywordMatches.map((keyword, index) => (
                        <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {matchingResult.missingKeywords.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium">Missing Important Keywords ({matchingResult.missingKeywords.length})</h4>
                    </div>
                    <Alert>
                      <AlertDescription>
                        These keywords appear frequently in the job description but are missing from your resume. Click to copy and add them strategically.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap gap-2">
                      {matchingResult.missingKeywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="destructive" 
                          className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 transition-colors"
                          onClick={() => copyToClipboard(keyword, `missing-${index}`)}
                        >
                          {keyword}
                          {copiedItems.has(`missing-${index}`) ? (
                            <Check className="w-3 h-3 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">Optimized Professional Summary</h4>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applySpecificSuggestion('summary', null)}
                      disabled={appliedSuggestions.has('summary')}
                    >
                      {appliedSuggestions.has('summary') ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Apply to Resume
                        </>
                      )}
                    </Button>
                  </div>
                  <Alert>
                    <AlertDescription>
                      This AI-generated summary is tailored to match the job requirements and highlight your most relevant qualifications.
                    </AlertDescription>
                  </Alert>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-blue-900 flex-1 leading-relaxed">
                        {matchingResult.suggestedChanges.summary}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(matchingResult.suggestedChanges.summary, 'summary')}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        {copiedItems.has('summary') ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium">Experience Optimization ({matchingResult.suggestedChanges.experienceUpdates.length})</h4>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applySpecificSuggestion('experience', null)}
                      disabled={appliedSuggestions.has('experience')}
                    >
                      {appliedSuggestions.has('experience') ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Apply All
                        </>
                      )}
                    </Button>
                  </div>
                  <Alert>
                    <AlertDescription>
                      Updated descriptions and achievements tailored to the job requirements with relevant keywords and quantifiable results.
                    </AlertDescription>
                  </Alert>
                  <ScrollArea className="h-64 w-full">
                    <div className="space-y-4">
                      {matchingResult.suggestedChanges.experienceUpdates.map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">Experience #{index + 1}</h5>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(update.suggestedDescription, `exp-${index}`)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedItems.has(`exp-${index}`) ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Suggested Description:</p>
                              <p className="text-sm bg-purple-50 p-3 rounded border border-purple-200">
                                {update.suggestedDescription}
                              </p>
                            </div>
                            
                            {update.suggestedAchievements.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Additional Achievements:</p>
                                <ul className="space-y-1">
                                  {update.suggestedAchievements.map((achievement, achIndex) => (
                                    <li key={achIndex} className="text-sm bg-purple-50 p-2 rounded border border-purple-200 flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span className="flex-1">{achievement}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(achievement, `ach-${index}-${achIndex}`)}
                                        className="h-5 w-5 p-0 flex-shrink-0"
                                      >
                                        {copiedItems.has(`ach-${index}-${achIndex}`) ? (
                                          <Check className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-4">
                <div className="space-y-4">
                  {/* Skills to Add */}
                  {matchingResult.suggestedChanges.skillsToAdd.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-green-600" />
                          <h4 className="font-medium">Skills to Add ({matchingResult.suggestedChanges.skillsToAdd.length})</h4>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applySpecificSuggestion('skills', null)}
                          disabled={appliedSuggestions.has('skills')}
                        >
                          {appliedSuggestions.has('skills') ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Applied
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Add All Skills
                            </>
                          )}
                        </Button>
                      </div>
                      <Alert>
                        <AlertDescription>
                          These skills are mentioned in the job description and would strengthen your application.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-wrap gap-2">
                        {matchingResult.suggestedChanges.skillsToAdd.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="border-green-300 text-green-700 cursor-pointer hover:bg-green-50 transition-colors"
                            onClick={() => copyToClipboard(skill, `add-skill-${index}`)}
                          >
                            {skill}
                            {copiedItems.has(`add-skill-${index}`) ? (
                              <Check className="w-3 h-3 ml-1" />
                            ) : (
                              <Copy className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills to Emphasize */}
                  {matchingResult.suggestedChanges.skillsToEmphasize.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium">Skills to Emphasize ({matchingResult.suggestedChanges.skillsToEmphasize.length})</h4>
                      </div>
                      <Alert>
                        <AlertDescription>
                          These skills from your resume should be highlighted more prominently as they match the job requirements.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-wrap gap-2">
                        {matchingResult.suggestedChanges.skillsToEmphasize.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="border-blue-300 text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => copyToClipboard(skill, `emphasize-skill-${index}`)}
                          >
                            {skill}
                            {copiedItems.has(`emphasize-skill-${index}`) ? (
                              <Check className="w-3 h-3 ml-1" />
                            ) : (
                              <Copy className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 