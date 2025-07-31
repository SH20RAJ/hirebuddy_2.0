import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw, 
  Plus, 
  X, 
  Lightbulb,
  Target,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { coverLetterService, type CoverLetterRequest, type CoverLetterResponse } from "@/services/coverLetterService";
import { toast } from "sonner";

interface CoverLetterGeneratorProps {
  resumeData: any;
  onClose?: () => void;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ 
  resumeData, 
  onClose 
}) => {
  // State management
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'conversational'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<CoverLetterResponse | null>(null);
  const [improvementRequest, setImprovementRequest] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // Add a new key point
  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, '']);
  };

  // Remove a key point
  const removeKeyPoint = (index: number) => {
    if (keyPoints.length > 1) {
      setKeyPoints(keyPoints.filter((_, i) => i !== index));
    }
  };

  // Update a key point
  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  // Extract company name and position from job description
  const extractJobInfo = (description: string) => {
    const lines = description.split('\n');
    const firstLine = lines[0]?.toLowerCase() || '';
    
    if (firstLine.includes('position:') || firstLine.includes('role:') || firstLine.includes('job title:')) {
      const title = firstLine.split(':')[1]?.trim() || '';
      setPositionTitle(title);
    }
    
    const companyMatch = description.match(/(?:at|@|company:)\s*([A-Z][a-zA-Z\s&.,]+?)(?:\n|,|\.|\s-)/i);
    if (companyMatch) {
      setCompanyName(companyMatch[1].trim());
    }
  };

  // Handle job description change
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    if (value && (!companyName || !positionTitle)) {
      extractJobInfo(value);
    }
  };

  // Validate form
  const isFormValid = () => {
    return jobDescription.trim().length >= 50;
  };

  // Generate cover letter
  const generateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error('Please provide a more detailed job description (at least 50 characters)');
      return;
    }

    // Check if resume data has basic information
    if (!resumeData?.personalInfo?.name || !resumeData?.personalInfo?.email) {
      toast.error('Please complete your personal information in the resume first');
      return;
    }

    setIsGenerating(true);
    try {
      const validKeyPoints = keyPoints.filter(point => point.trim());
      
      const request: CoverLetterRequest = {
        resumeData,
        jobDescription: jobDescription.trim(),
        keyPoints: validKeyPoints.length > 0 ? validKeyPoints : ['Highlight relevant experience and skills'],
        companyName: companyName?.trim() || undefined,
        positionTitle: positionTitle?.trim() || undefined,
        userPreferences: {
          tone,
          length
        }
      };

      console.log('Generating cover letter with request:', request);
      const response = await coverLetterService.generateCoverLetter(request);
      console.log('Cover letter generated successfully:', response);
      
      setGeneratedCoverLetter(response);
      toast.success('Cover letter generated successfully!');
      setActiveTab('preview');
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      
      let errorMessage = 'Failed to generate cover letter. Please try again.';
      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'OpenAI API key is not configured. Please contact support.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('too short')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Improve cover letter
  const improveCoverLetter = async () => {
    if (!generatedCoverLetter) {
      toast.error('No cover letter to improve');
      return;
    }

    if (!improvementRequest.trim()) {
      toast.error('Please enter an improvement request');
      return;
    }

    if (improvementRequest.trim().length < 10) {
      toast.error('Please provide a more detailed improvement request');
      return;
    }

    setIsImproving(true);
    try {
      console.log('Improving cover letter with request:', improvementRequest);
      const improvedLetter = await coverLetterService.improveCoverLetter(
        generatedCoverLetter.coverLetter,
        improvementRequest.trim(),
        resumeData,
        jobDescription
      );

      setGeneratedCoverLetter({
        ...generatedCoverLetter,
        coverLetter: improvedLetter
      });
      setImprovementRequest('');
      toast.success('Cover letter improved successfully!');
    } catch (error: any) {
      console.error('Error improving cover letter:', error);
      
      let errorMessage = 'Failed to improve cover letter. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsImproving(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download as text file
  const downloadCoverLetter = () => {
    if (!generatedCoverLetter) return;

    const element = document.createElement('a');
    const file = new Blob([generatedCoverLetter.coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName || 'job'}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Cover letter downloaded!');
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Cover Letter Generator</h2>
              <p className="text-sm text-muted-foreground">
                Create personalized cover letters using your resume data
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="generate" className="h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-6 mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!generatedCoverLetter}>
                <FileText className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 px-6 pb-6">
                  {/* Job Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Job Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Google, Microsoft"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position Title</Label>
                          <Input
                            id="position"
                            value={positionTitle}
                            onChange={(e) => setPositionTitle(e.target.value)}
                            placeholder="e.g., Software Engineer, Product Manager"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="jobDescription" className="flex items-center justify-between">
                          <span>Job Description *</span>
                          <span className={`text-xs ${jobDescription.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                            {jobDescription.length}/50 min
                          </span>
                        </Label>
                        <Textarea
                          id="jobDescription"
                          value={jobDescription}
                          onChange={(e) => handleJobDescriptionChange(e.target.value)}
                          placeholder="Paste the complete job description here... Include responsibilities, requirements, qualifications, and company information for best results."
                          className={`min-h-[120px] resize-none ${jobDescription.length < 50 ? 'border-red-300 focus:border-red-500' : ''}`}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground">
                            Paste the full job posting to get the best results
                          </p>
                          {jobDescription.length < 50 && jobDescription.length > 0 && (
                            <p className="text-xs text-red-500">
                              Need {50 - jobDescription.length} more characters
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Key Points to Emphasize (Optional)
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add specific points you want the AI to highlight in your cover letter. Examples: "Highlight my leadership experience", "Emphasize Python skills", "Mention startup experience". Leave empty for AI to choose automatically.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {keyPoints.map((point, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={point}
                            onChange={(e) => updateKeyPoint(index, e.target.value)}
                            placeholder={index === 0 ? "e.g., Highlight my 5+ years of React experience" : `Key point ${index + 1}...`}
                            className="flex-1"
                          />
                          {keyPoints.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeKeyPoint(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addKeyPoint}
                        className="w-full"
                        disabled={keyPoints.length >= 5}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Key Point {keyPoints.length >= 5 && "(Max 5)"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Tone</Label>
                          <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Length</Label>
                          <Select value={length} onValueChange={(value: any) => setLength(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">Short (2-3 paragraphs)</SelectItem>
                              <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
                              <SelectItem value="long">Long (4-5 paragraphs)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={generateCoverLetter}
                      disabled={!isFormValid() || isGenerating}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Cover Letter
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-hidden">
              {generatedCoverLetter ? (
                <div className="h-full flex flex-col">
                  {/* Preview Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Cover Letter Generated</span>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedCoverLetter.coverLetter)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy to clipboard</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={downloadCoverLetter}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download as text file</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                        {/* Cover Letter Content */}
                        <div className="lg:col-span-2">
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle>Your Cover Letter</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[400px]">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {generatedCoverLetter.coverLetter}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Sidebar with suggestions and keywords */}
                        <div className="space-y-4">
                          {/* Keywords Used */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Keywords Incorporated</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1">
                                {generatedCoverLetter.keywordsUsed.map((keyword, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Suggestions */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="max-h-[200px]">
                                <ul className="space-y-2 text-xs">
                                  {generatedCoverLetter.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            </CardContent>
                          </Card>

                          {/* Improvement Request */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Request Improvements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Textarea
                                value={improvementRequest}
                                onChange={(e) => setImprovementRequest(e.target.value)}
                                placeholder="e.g., Make it more enthusiastic, add more technical details..."
                                className="text-xs"
                                rows={3}
                              />
                              <Button
                                onClick={improveCoverLetter}
                                disabled={!improvementRequest.trim() || isImproving}
                                size="sm"
                                className="w-full"
                              >
                                {isImproving ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Improving...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Improve
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Cover Letter Generated</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate a cover letter first to see the preview
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}; 