import { useNavigate } from "react-router-dom";
import { NewSidebar } from "@/components/layout/NewSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  Brain,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const ResumeChoice = () => {
  const navigate = useNavigate();

  const handleImportResume = () => {
    navigate('/resume-import');
  };

  const handleBuildFromScratch = () => {
    localStorage.removeItem('parsedResumeData');
    navigate('/resume-builder-form');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 md:flex">
      <NewSidebar />
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden w-full">
        {/* Header */}
        <header className="hidden md:flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="flex items-center gap-2 px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume Builder
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-6">
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
              AI-Powered
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How would you like to get started?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the option that works best for you. Both paths use AI to help you create an ATS-optimized resume.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Import Resume Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                  onClick={handleImportResume}>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Import Existing Resume
                </CardTitle>
                <CardDescription className="text-base">
                  Upload your current resume and let AI enhance it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">AI-powered content extraction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Automatic formatting optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">ATS compatibility improvements</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <ShimmerButton
                    className="w-full"
                    background="linear-gradient(110deg,rgb(123, 62, 208) 0%,rgb(110, 35, 240) 50%,rgb(77, 84, 212) 100%)"
                    onClick={handleImportResume}
                  >
                    Upload Resume
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </ShimmerButton>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Takes 2-3 minutes</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Build from Scratch Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                  onClick={handleBuildFromScratch}>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Build from Scratch
                </CardTitle>
                <CardDescription className="text-base">
                  Create a new resume with AI guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Step-by-step guided process</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">AI-generated content suggestions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Professional templates</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <ShimmerButton
                    className="w-full"
                    background="linear-gradient(110deg, #059669 0%, #047857 50%, #059669 100%)"
                    onClick={handleBuildFromScratch}
                  >
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </ShimmerButton>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Takes 10-15 minutes</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Why choose our AI Resume Builder?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
              <p className="text-sm text-gray-600">
                Advanced AI analyzes job descriptions and optimizes your content
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">ATS-Optimized</h4>
              <p className="text-sm text-gray-600">
                Ensures your resume passes through applicant tracking systems
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast & Easy</h4>
              <p className="text-sm text-gray-600">
                Create professional resumes in minutes, not hours
              </p>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeChoice;