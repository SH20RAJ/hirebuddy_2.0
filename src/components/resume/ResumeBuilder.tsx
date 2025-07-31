import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Eye, 
  Save, 
  RotateCcw, 
  FileCheck, 
  Share2, 
  FileText, 
  ArrowLeft,
  CheckCircle,
  Circle,
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  Upload
} from "lucide-react";
import { convertParsedResumeToBuilderFormat } from "../../lib/resume-data-converter";
import type { Resume } from "../../types/resume";
import { ResumePreview } from "./ResumePreview";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { SummarySection } from "./sections/SummarySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeBuilderProps {
  template: string;
  onBack: () => void;
}

export const ResumeBuilder = ({ template, onBack }: ResumeBuilderProps) => {
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: []
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [atsScore, setAtsScore] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showAtsView, setShowAtsView] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const modalResumeRef = useRef<HTMLDivElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Format data for ResumePreview component
  const formattedData = {
    personalInfo: {
      name: resumeData.name,
      email: resumeData.email,
      phone: resumeData.phone,
      location: resumeData.location,
      website: resumeData.website,
      linkedin: resumeData.linkedin,
      github: resumeData.github
    },
    summary: resumeData.summary,
    experience: resumeData.experience,
    education: resumeData.education,
    skills: resumeData.skills
  };

  // Calculate completion percentage and section status
  const calculateProgress = () => {
    const sections = [
      { id: 'personal', completed: !!(resumeData.name && resumeData.email) },
      { id: 'contact', completed: !!(resumeData.phone && resumeData.location) },
      { id: 'summary', completed: !!resumeData.summary },
      { id: 'experience', completed: resumeData.experience.length > 0 },
      { id: 'education', completed: resumeData.education.length > 0 },
      { id: 'skills', completed: resumeData.skills.length > 0 }
    ];
    
    const completedCount = sections.filter(section => section.completed).length;
    return {
      percentage: Math.round((completedCount / sections.length) * 100),
      sections
    };
  };

  const progress = calculateProgress();

  // ATS Score calculation
  const updateAtsScore = () => {
    let score = 0;
    
    // Basic information (20 points)
    if (resumeData.name && resumeData.email && resumeData.phone) score += 20;
    
    // Professional summary (20 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 20;
    
    // Experience section (30 points)
    if (resumeData.experience.length > 0) {
      score += 15;
      const hasDescriptions = resumeData.experience.some(exp => exp.description && exp.description.length > 50);
      if (hasDescriptions) score += 15;
    }
    
    // Education (15 points)
    if (resumeData.education.length > 0) score += 15;
    
    // Skills (15 points)
    if (resumeData.skills.length >= 5) score += 15;
    
    setAtsScore(Math.min(score, 100));
  };

  useEffect(() => {
    updateAtsScore();
  }, [resumeData]);

  // Initialize with parsed resume data if available
  useEffect(() => {
    const parsedResumeData = localStorage.getItem('parsedResumeData');
    if (parsedResumeData) {
      try {
        const parsedResume: Resume = JSON.parse(parsedResumeData);
        const convertedData = convertParsedResumeToBuilderFormat(parsedResume);
        setResumeData(convertedData);
        // Clear the parsed data after using it
        localStorage.removeItem('parsedResumeData');
      } catch (error) {
        console.error('Error loading parsed resume data:', error);
      }
    } else {
      // Load draft if no parsed data
      const draftData = localStorage.getItem('resume_draft');
      if (draftData) {
        try {
          setResumeData(JSON.parse(draftData));
        } catch (error) {
          console.error('Error loading draft data:', error);
        }
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('resume_draft', JSON.stringify(resumeData));
      setLastSaved(new Date());
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Generate PDF
  const generatePDF = async (fromModal = false) => {
    const targetRef = fromModal ? modalResumeRef.current : resumeRef.current;
    if (!targetRef) return;
    
    try {
      setIsGeneratingPdf(true);
      
      const { generateResumePDF } = await import('@/utils/pdfGenerator');
      
      // Find the actual resume content element
      const resumeContent = targetRef.querySelector('#resume-content') || targetRef;
      
      const contactInfo = {
        email: resumeData.email,
        phone: resumeData.phone,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        website: resumeData.website
      };
      
      const fileName = resumeData.name ? 
        `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf` : 
        'Resume.pdf';
        
      await generateResumePDF(resumeContent as HTMLElement, contactInfo, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const updatePersonalInfo = (personalInfo: any) => {
    setResumeData(prev => ({ 
      ...prev, 
      name: personalInfo.name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      website: personalInfo.website,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github
    }));
  };

  const updateSummary = (summary: string) => {
    setResumeData(prev => ({ ...prev, summary }));
  };

  const updateExperience = (experience: any[]) => {
    setResumeData(prev => ({ ...prev, experience }));
  };

  const updateEducation = (education: any[]) => {
    setResumeData(prev => ({ ...prev, education }));
  };

  const updateSkills = (skills: string[]) => {
    setResumeData(prev => ({ ...prev, skills }));
  };

  const resetForm = () => {
    setResumeData({
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
      experience: [],
      education: [],
      skills: []
    });
    setActiveTab("personal");
  };

  const getTemplateDisplayName = (templateId: string) => {
    return 'Software Engineer';
  };

  const getAtsScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSectionIcon = (sectionId: string, completed: boolean) => {
    return completed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Circle className="w-4 h-4 text-gray-400" />
    );
  };

  const handleImportResume = () => {
    // Navigate to import page or show import dialog
    window.location.href = '/resume-import';
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <InteractiveHoverButton
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Templates
                </InteractiveHoverButton>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Resume Builder
                  </h1>
                  <p className="text-sm text-gray-600">
                    {getTemplateDisplayName(template)} Template
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShimmerButton
                      onClick={handleImportResume}
                      className="flex items-center gap-2"
                      background="linear-gradient(110deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)"
                    >
                      <Upload className="w-4 h-4" />
                      Import Resume
                    </ShimmerButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Import an existing resume to auto-fill this form</p>
                  </TooltipContent>
                </Tooltip>

                {/* Auto-save indicator */}
                {lastSaved && (
                  <div className="text-xs text-gray-500">
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}

                {/* ATS Score */}
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${getAtsScoreColor(atsScore)}`}>
                          ATS: {atsScore}%
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Applicant Tracking System compatibility score</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <ShinyButton>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </ShinyButton>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Resume Preview</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div ref={modalResumeRef} className="flex justify-center">
                          <ResumePreview 
                            data={formattedData} 
                            template={template}
                            scale={0.75}
                            showAtsView={showAtsView}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <InteractiveHoverButton
                              onClick={() => setShowAtsView(!showAtsView)}
                            >
                              {showAtsView ? "Styled View" : "ATS View"}
                            </InteractiveHoverButton>
                          </div>
                          <RainbowButton 
                            onClick={() => generatePDF(true)}
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? (
                              "Generating..."
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </>
                            )}
                          </RainbowButton>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <RainbowButton 
                    onClick={() => generatePDF(false)}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      "Generating..."
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </RainbowButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Resume Completion</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {progress.percentage}% Complete
                    </Badge>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'personal', label: 'Personal Info', tab: 'personal' },
                      { id: 'summary', label: 'Summary', tab: 'summary' },
                      { id: 'experience', label: 'Experience', tab: 'experience' },
                      { id: 'education', label: 'Education', tab: 'education' },
                      { id: 'skills', label: 'Skills', tab: 'skills' }
                    ].map((section) => {
                      const sectionStatus = progress.sections.find(s => s.id === section.id);
                      const isCompleted = sectionStatus?.completed || false;
                      
                      return (
                        <Button
                          key={section.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab(section.tab)}
                          className={`justify-start h-auto p-3 ${
                            activeTab === section.tab ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {getSectionIcon(section.id, isCompleted)}
                            <span className="text-sm">{section.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ATS Tips */}
              {atsScore < 80 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ATS Optimization Tips:</strong>
                    {atsScore < 60 && " Add more detailed work experience descriptions."}
                    {resumeData.skills.length < 5 && " Include at least 5 relevant skills."}
                    {!resumeData.summary && " Write a compelling professional summary."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Tabs */}
              <Card>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader>
                    <TabsList className="grid w-full grid-cols-5 h-8 md:h-10 p-0.5 md:p-1">
                      <TabsTrigger value="personal" className="text-xs sm:text-sm px-1 md:px-3">
                        <span className="hidden sm:inline">Personal</span>
                        <span className="sm:hidden">Info</span>
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="text-xs sm:text-sm px-1 md:px-3">
                        <span className="hidden sm:inline">Summary</span>
                        <span className="sm:hidden">Sum</span>
                      </TabsTrigger>
                      <TabsTrigger value="experience" className="text-xs sm:text-sm px-1 md:px-3">
                        <span className="hidden sm:inline">Experience</span>
                        <span className="sm:hidden">Exp</span>
                      </TabsTrigger>
                      <TabsTrigger value="education" className="text-xs sm:text-sm px-1 md:px-3">
                        <span className="hidden sm:inline">Education</span>
                        <span className="sm:hidden">Edu</span>
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="text-xs sm:text-sm px-1 md:px-3">
                        <span className="hidden sm:inline">Skills</span>
                        <span className="sm:hidden">Skill</span>
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent>
                    <TabsContent value="personal" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Personal Information Guide
                            </h4>
                            <p className="text-sm text-blue-800">
                              Ensure your contact information is professional and up-to-date. 
                              Use a professional email address and include a phone number where employers can reach you.
                            </p>
                          </div>
                        </div>
                        <PersonalInfoSection 
                          personalInfo={{
                            name: resumeData.name,
                            email: resumeData.email,
                            phone: resumeData.phone,
                            location: resumeData.location,
                            website: resumeData.website,
                            linkedin: resumeData.linkedin,
                            github: resumeData.github
                          }}
                          onUpdate={updatePersonalInfo}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                          <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-green-900 mb-1">
                              Professional Summary Tips
                            </h4>
                            <p className="text-sm text-green-800">
                              Write 2-3 sentences highlighting your key qualifications, years of experience, 
                              and what value you bring to employers. Focus on achievements and relevant skills.
                            </p>
                          </div>
                        </div>
                        <SummarySection 
                          summary={resumeData.summary}
                          onUpdate={updateSummary}
                          jobDescription={jobDescription}
                          onJobDescriptionChange={setJobDescription}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                          <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-purple-900 mb-1">
                              Experience Best Practices
                            </h4>
                            <p className="text-sm text-purple-800">
                              List experiences in reverse chronological order. Use action verbs and quantify 
                              achievements where possible (e.g., "Increased sales by 20%").
                            </p>
                          </div>
                        </div>
                        <ExperienceSection 
                          experience={resumeData.experience}
                          onUpdate={updateExperience}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <FileCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-900 mb-1">
                              Education Section Guide
                            </h4>
                            <p className="text-sm text-amber-800">
                              Include your highest degree first. Add relevant certifications, honors, 
                              or coursework if they're relevant to your target role.
                            </p>
                          </div>
                        </div>
                        <EducationSection 
                          education={resumeData.education}
                          onUpdate={updateEducation}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-cyan-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-cyan-900 mb-1">
                              Skills Selection Tips
                            </h4>
                            <p className="text-sm text-cyan-800">
                              Include both hard skills (technical abilities) and soft skills (communication, leadership). 
                              Match skills to job requirements for better ATS compatibility.
                            </p>
                          </div>
                        </div>
                        <SkillsSection 
                          skills={resumeData.skills}
                          onUpdate={updateSkills}
                        />
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    localStorage.setItem('resume_draft', JSON.stringify(resumeData));
                    setLastSaved(new Date());
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAtsView(!showAtsView)}
                      >
                        {showAtsView ? "Styled" : "ATS"} View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div ref={resumeRef} className="flex justify-center">
                        <div className="w-full">
                          <ResumePreview 
                            data={formattedData} 
                            template={template}
                            scale={0.35}
                            showAtsView={showAtsView}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};