import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, FileSearch, Zap } from "lucide-react";
import { SmartContentSuggestions } from "./SmartContentSuggestions";
import { SkillGapAnalysis } from "./SkillGapAnalysis";
import { JobDescriptionMatcher } from "./JobDescriptionMatcher";
import { ContentSuggestion, JobMatchingResult } from "@/services/openaiService";
import { toast } from "sonner";

interface AIDashboardProps {
  resumeData: any;
  onUpdateResumeData: (section: string, data: any) => void;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({
  resumeData,
  onUpdateResumeData
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');

  const handleApplyContentSuggestions = (suggestions: ContentSuggestion) => {
    // Add suggested skills to the resume
    const currentSkills = resumeData.skills || { technical: [], soft: [], languages: [], frameworks: [] };
    const newTechnicalSkills = [...currentSkills.technical];
    const newSoftSkills = [...currentSkills.soft];

    // Categorize and add new skills
    suggestions.skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      // Simple categorization logic - you can make this more sophisticated
      if (lowerSkill.includes('programming') || lowerSkill.includes('development') || 
          lowerSkill.includes('javascript') || lowerSkill.includes('python') || 
          lowerSkill.includes('react') || lowerSkill.includes('node') ||
          lowerSkill.includes('sql') || lowerSkill.includes('database') ||
          lowerSkill.includes('api') || lowerSkill.includes('framework')) {
        if (!newTechnicalSkills.includes(skill)) {
          newTechnicalSkills.push(skill);
        }
      } else {
        if (!newSoftSkills.includes(skill)) {
          newSoftSkills.push(skill);
        }
      }
    });

    onUpdateResumeData('skills', {
      ...currentSkills,
      technical: newTechnicalSkills,
      soft: newSoftSkills
    });

    // If there's an active experience entry, add bullet points to it
    if (resumeData.experience && resumeData.experience.length > 0) {
      const updatedExperience = [...resumeData.experience];
      const latestExp = updatedExperience[0];
      
      // Add suggested bullet points as achievements
      const newAchievements = [...(latestExp.achievements || [])];
      suggestions.bulletPoints.forEach(point => {
        if (!newAchievements.includes(point)) {
          newAchievements.push(point);
        }
      });

      updatedExperience[0] = {
        ...latestExp,
        achievements: newAchievements
      };

      onUpdateResumeData('experience', updatedExperience);
    }
  };

  const handleAddSkills = (skills: string[]) => {
    const currentSkills = resumeData.skills || { technical: [], soft: [], languages: [], frameworks: [] };
    const newTechnicalSkills = [...currentSkills.technical];

    skills.forEach(skill => {
      if (!newTechnicalSkills.includes(skill)) {
        newTechnicalSkills.push(skill);
      }
    });

    onUpdateResumeData('skills', {
      ...currentSkills,
      technical: newTechnicalSkills
    });
  };

  const handleAddCertifications = (certifications: string[]) => {
    const currentCertifications = resumeData.certifications || [];
    const newCertifications = [...currentCertifications];

    certifications.forEach(cert => {
      const certExists = newCertifications.some(existing => existing.name === cert);
      if (!certExists) {
        newCertifications.push({
          id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: cert,
          issuer: 'To be specified',
          date: new Date().getFullYear().toString(),
          expiryDate: '',
          credentialId: '',
          link: ''
        });
      }
    });

    onUpdateResumeData('certifications', newCertifications);
  };

  const handleApplyJobMatchChanges = (changes: JobMatchingResult['suggestedChanges']) => {
    let appliedCount = 0;
    
    // Update summary
    if (changes.summary) {
      onUpdateResumeData('summary', changes.summary);
      appliedCount++;
    }

    // Update experience descriptions
    if (changes.experienceUpdates && changes.experienceUpdates.length > 0) {
      const updatedExperience = [...(resumeData.experience || [])];
      
      changes.experienceUpdates.forEach((update, index) => {
        if (updatedExperience[index]) {
          // Merge suggested description with existing content
          const existingDescription = updatedExperience[index].description || '';
          const newDescription = update.suggestedDescription;
          
          // Use the suggested description if it's more comprehensive
          updatedExperience[index] = {
            ...updatedExperience[index],
            description: newDescription.length > existingDescription.length ? newDescription : existingDescription,
            achievements: [
              ...(updatedExperience[index].achievements || []),
              ...update.suggestedAchievements.filter(ach => 
                !(updatedExperience[index].achievements || []).includes(ach)
              )
            ]
          };
          appliedCount++;
        }
      });

      onUpdateResumeData('experience', updatedExperience);
    }

    // Add new skills intelligently
    if (changes.skillsToAdd && changes.skillsToAdd.length > 0) {
      const currentSkills = resumeData.skills || { technical: [], soft: [], languages: [], frameworks: [] };
      const updatedSkills = { ...currentSkills };
      
      changes.skillsToAdd.forEach(skill => {
        // Categorize skills intelligently
        const skillLower = skill.toLowerCase();
        
        // Technical skills
        if (skillLower.includes('javascript') || skillLower.includes('python') || 
            skillLower.includes('java') || skillLower.includes('c++') || 
            skillLower.includes('sql') || skillLower.includes('html') || 
            skillLower.includes('css') || skillLower.includes('git')) {
          if (!updatedSkills.technical.includes(skill)) {
            updatedSkills.technical.push(skill);
          }
        }
        // Frameworks
        else if (skillLower.includes('react') || skillLower.includes('angular') || 
                 skillLower.includes('vue') || skillLower.includes('node') || 
                 skillLower.includes('express') || skillLower.includes('django') ||
                 skillLower.includes('spring') || skillLower.includes('laravel')) {
          if (!updatedSkills.frameworks.includes(skill)) {
            updatedSkills.frameworks.push(skill);
          }
        }
        // Soft skills
        else if (skillLower.includes('leadership') || skillLower.includes('communication') || 
                 skillLower.includes('teamwork') || skillLower.includes('problem') || 
                 skillLower.includes('management') || skillLower.includes('collaboration')) {
          if (!updatedSkills.soft.includes(skill)) {
            updatedSkills.soft.push(skill);
          }
        }
        // Default to technical
        else {
          if (!updatedSkills.technical.includes(skill)) {
            updatedSkills.technical.push(skill);
          }
        }
      });

      onUpdateResumeData('skills', updatedSkills);
      appliedCount += changes.skillsToAdd.length;
    }

    // Handle skills to emphasize (move them to the front of their respective arrays)
    if (changes.skillsToEmphasize && changes.skillsToEmphasize.length > 0) {
      const currentSkills = resumeData.skills || { technical: [], soft: [], languages: [], frameworks: [] };
      const updatedSkills = { ...currentSkills };
      
      changes.skillsToEmphasize.forEach(skill => {
        // Find and move skill to front of appropriate array
        Object.keys(updatedSkills).forEach(category => {
          const skillIndex = updatedSkills[category].indexOf(skill);
          if (skillIndex > 0) {
            // Move to front
            updatedSkills[category].splice(skillIndex, 1);
            updatedSkills[category].unshift(skill);
          }
        });
      });

      onUpdateResumeData('skills', updatedSkills);
    }

    // Provide detailed feedback
    const feedbackMessages = [];
    if (changes.summary) feedbackMessages.push('Professional summary updated');
    if (changes.experienceUpdates?.length > 0) feedbackMessages.push(`${changes.experienceUpdates.length} experience entries enhanced`);
    if (changes.skillsToAdd?.length > 0) feedbackMessages.push(`${changes.skillsToAdd.length} new skills added`);
    if (changes.skillsToEmphasize?.length > 0) feedbackMessages.push(`${changes.skillsToEmphasize.length} skills emphasized`);
    
    if (feedbackMessages.length > 0) {
      toast.success(`Applied changes: ${feedbackMessages.join(', ')}`);
    }
  };

  const getCurrentExperienceDescription = () => {
    if (resumeData.experience && resumeData.experience.length > 0) {
      return resumeData.experience[0].description;
    }
    return undefined;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          AI-Powered Resume Enhancement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use artificial intelligence to optimize your resume with smart suggestions, skill analysis, and job matching
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Skill Analysis
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              Job Matching
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  AI Content Generation
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Get personalized content suggestions based on your role and industry
                </span>
              </div>
              <SmartContentSuggestions
                onApplySuggestions={handleApplyContentSuggestions}
                currentDescription={getCurrentExperienceDescription()}
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Career Analysis
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Identify skill gaps and get recommendations for your target role
                </span>
              </div>
              <SkillGapAnalysis
                resumeData={resumeData}
                onAddSkills={handleAddSkills}
                onAddCertifications={handleAddCertifications}
              />
            </div>
          </TabsContent>

          <TabsContent value="matching" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Job Optimization
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Tailor your resume to specific job descriptions for better ATS compatibility
                </span>
              </div>
              <JobDescriptionMatcher
                resumeData={resumeData}
                onApplyChanges={handleApplyJobMatchChanges}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 