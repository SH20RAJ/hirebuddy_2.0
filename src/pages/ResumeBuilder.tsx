import { NewSidebar } from "@/components/layout/NewSidebar";
import { EnhancedResumeBuilder } from "@/components/resume/EnhancedResumeBuilder";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import MobileButton from "@/components/mobile/MobileButton";
import { Button } from "@/components/ui/button";

const ResumeBuilder = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 md:flex">
      <NewSidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Desktop Header */}
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
        </header>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-12 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <MobileButton
                onClick={handleBack}
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Back</span>
              </MobileButton>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <h1 className="font-semibold mobile-body text-gray-900">Resume Builder</h1>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">
          <EnhancedResumeBuilder template="perfect-fit" onBack={handleBack} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;