import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Plus,
  ExternalLink
} from "lucide-react";
import { openaiService, SkillGapAnalysis as SkillGapAnalysisType } from "@/services/openaiService";
import { toast } from "sonner";

interface SkillGapAnalysisProps {
  resumeData: any;
  onAddSkills: (skills: string[]) => void;
  onAddCertifications: (certifications: string[]) => void;
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

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  resumeData,
  onAddSkills,
  onAddCertifications
}) => {
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysisType | null>(null);

  const runAnalysis = async () => {
    if (!targetJobTitle || !targetIndustry) {
      toast.error("Please fill in target job title and industry");
      return;
    }

    if (!resumeData.personalInfo?.name && !resumeData.summary && resumeData.experience?.length === 0) {
      toast.error("Please add some resume content before running skill gap analysis");
      return;
    }

    setIsLoading(true);
    try {
      const result = await openaiService.analyzeSkillGap(
        resumeData,
        targetJobTitle,
        targetIndustry
      );
      setAnalysis(result);
      toast.success("Skill gap analysis completed!");
    } catch (error) {
      console.error('Error running skill gap analysis:', error);
      toast.error("Failed to analyze skill gap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkillsToResume = (skills: string[]) => {
    onAddSkills(skills);
    toast.success(`Added ${skills.length} skills to your resume!`);
  };

  const addCertificationsToResume = (certifications: string[]) => {
    onAddCertifications(certifications);
    toast.success(`Added ${certifications.length} certifications to your resume!`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Skill Gap Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze your resume against target roles and get personalized skill recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetJobTitle">Target Job Title *</Label>
            <Input
              id="targetJobTitle"
              placeholder="e.g., Senior Software Engineer"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetIndustry">Target Industry *</Label>
            <Select value={targetIndustry} onValueChange={setTargetIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={runAnalysis} 
          disabled={isLoading || !targetJobTitle || !targetIndustry}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Your Resume...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Run Skill Gap Analysis
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <Separator />
            
            {/* Overall Score */}
            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.overallScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Overall Readiness Score</h3>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </span>
              </div>
              <Progress value={analysis.overallScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {analysis.overallScore >= 80 
                  ? "Excellent! You're well-prepared for this role."
                  : analysis.overallScore >= 60
                  ? "Good foundation, but some areas need improvement."
                  : "Significant skill gaps identified. Focus on key missing skills."
                }
              </p>
            </div>

            {/* Strength Areas */}
            {analysis.strengthAreas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Your Strengths</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengthAreas.map((strength, index) => (
                    <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {analysis.missingSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium">Missing Skills</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSkillsToResume(analysis.missingSkills)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Resume
                  </Button>
                </div>
                <Alert>
                  <AlertDescription>
                    These skills are commonly required for {targetJobTitle} roles but are missing from your resume.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, index) => (
                    <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Certifications */}
            {analysis.recommendedCertifications.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium">Recommended Certifications</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCertificationsToResume(analysis.recommendedCertifications)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Resume
                  </Button>
                </div>
                <Alert>
                  <AlertDescription>
                    These certifications would strengthen your profile for {targetJobTitle} positions.
                  </AlertDescription>
                </Alert>
                <ScrollArea className="h-32 w-full">
                  <div className="space-y-2">
                    {analysis.recommendedCertifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="text-sm">{cert}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Improvement Areas */}
            {analysis.improvementAreas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium">Areas for Improvement</h4>
                </div>
                <Alert>
                  <AlertDescription>
                    Focus on these areas to better align with {targetJobTitle} requirements.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  {analysis.improvementAreas.map((area, index) => (
                    <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on acquiring the missing skills identified above</li>
                <li>• Consider pursuing recommended certifications</li>
                <li>• Update your resume to highlight your strength areas</li>
                <li>• Practice explaining how your experience relates to the target role</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 