import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResumeDropzone } from "./ResumeDropzone";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Alert, AlertDescription } from "../../ui/alert";
import { 
  FileText, 
  Zap, 
  Shield, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Clock,
  FileCheck,
  Brain,
  Target,
  Lightbulb,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import type { Resume } from "../../../types/resume";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeImportProps {
  onResumeImported?: (resume: Resume) => void;
  showCreateFromScratch?: boolean;
}

export const ResumeImport = ({ 
  onResumeImported, 
  showCreateFromScratch = true 
}: ResumeImportProps) => {
  const [hasAddedResume, setHasAddedResume] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [extractedData, setExtractedData] = useState<Resume | null>(null);
  const navigate = useNavigate();

  const processingSteps = [
    { label: "Uploading file", icon: Upload },
    { label: "Analyzing document", icon: Brain },
    { label: "Extracting information", icon: FileCheck },
    { label: "Optimizing content", icon: Target },
    { label: "Ready to build", icon: CheckCircle }
  ];

  const handleResumeExtracted = (resume: Resume) => {
    setHasAddedResume(true);
    setExtractedData(resume);
    onResumeImported?.(resume);
    
    // Store the parsed resume data in localStorage for the resume builder
    localStorage.setItem('parsedResumeData', JSON.stringify(resume));
    
    // Simulate processing steps for better UX
    setIsProcessing(true);
    setProcessingStep(0);
    
    const stepInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsProcessing(false);
            // Navigate to resume builder form after processing
            navigate('/resume-builder-form');
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleCreateFromScratch = () => {
    // Clear any existing parsed data
    localStorage.removeItem('parsedResumeData');
    navigate('/resume-builder-form');
  };

  const handleTryAgain = () => {
    setHasAddedResume(false);
    setExtractedData(null);
    setIsProcessing(false);
    setProcessingStep(0);
  };

  const handleGoBack = () => {
    navigate('/resume-builder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-2 hover:bg-pink-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Builder
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Smart Resume Import
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered resume parsing and optimization
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
              <Shield className="w-3 h-3 mr-1" />
              100% Secure & Private
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-8 h-8 text-pink-600" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl">Processing Your Resume</CardTitle>
                  <CardDescription className="text-lg">
                    Our AI is analyzing and optimizing your resume content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {processingSteps.map((step, index) => {
                      const isActive = index === processingStep;
                      const isCompleted = index < processingStep;
                      const Icon = step.icon;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive ? 'bg-pink-50 border border-pink-200' : 
                            isCompleted ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-pink-600 text-white' :
                            isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                            )}
                          </div>
                          <span className={`font-medium ${
                            isActive ? 'text-pink-900' : 
                            isCompleted ? 'text-green-900' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-auto"
                            >
                              <div className="w-2 h-2 bg-pink-600 rounded-full" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(((processingStep + 1) / processingSteps.length) * 100)}%</span>
                    </div>
                    <Progress 
                      value={((processingStep + 1) / processingSteps.length) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : !hasAddedResume ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Transform Your Resume with AI
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Upload your existing resume and watch our AI extract, optimize, and enhance 
                    your content for maximum impact with recruiters and ATS systems.
                  </p>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid md:grid-cols-3 gap-6 mt-12"
                >
                  <div className="flex flex-col items-center text-center p-6 bg-white/60 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                    <p className="text-sm text-gray-600">
                      Extract all information from your PDF in seconds with 95%+ accuracy
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-6 bg-white/60 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
                    <p className="text-sm text-gray-600">
                      Your data never leaves your browser. Everything is processed locally
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-6 bg-white/60 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">ATS Optimized</h3>
                    <p className="text-sm text-gray-600">
                      Automatically optimize content for Applicant Tracking Systems
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                      <Upload className="w-6 h-6 text-pink-600" />
                      Upload Your Resume
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Drag and drop your PDF file or click to browse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeDropzone onResumeExtracted={handleResumeExtracted} />
                    
                    <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-pink-900 mb-1">Pro Tips for Best Results</h4>
                          <ul className="text-sm text-pink-800 space-y-1">
                            <li>• Use a single-column resume format for optimal parsing</li>
                            <li>• Ensure text is selectable (not scanned images)</li>
                            <li>• Include standard section headers (Experience, Education, Skills)</li>
                            <li>• File size should be under 10MB</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Alternative Option */}
              {showCreateFromScratch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-6 text-gray-500 font-medium">or</span>
                    </div>
                  </div>

                  <Card className="mt-6 border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Start from Scratch
                      </CardTitle>
                      <CardDescription>
                        Don't have a resume yet? Create one from the beginning with our guided builder
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleCreateFromScratch}
                        variant="outline" 
                        className="w-full h-12 text-base hover:bg-green-50 hover:border-green-300"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Create New Resume
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-900">Resume Successfully Imported!</CardTitle>
                  <CardDescription className="text-lg">
                    Your resume has been parsed and is ready for enhancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Great!</strong> We've extracted your information and you'll be redirected to the resume builder shortly.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleTryAgain}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Another Resume
                    </Button>
                    <Button 
                      onClick={() => navigate('/resume-builder-form')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Continue Building
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};