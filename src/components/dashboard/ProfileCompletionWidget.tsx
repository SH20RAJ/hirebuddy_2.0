import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileService } from "@/services/profileService";
import {
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  ArrowRight,
  Plus,
  Star,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
  icon: React.ComponentType<any>;
  action: string;
  actionLink: string;
  priority: 'high' | 'medium' | 'low';
}

export const ProfileCompletionWidget: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionItems, setCompletionItems] = useState<ProfileCompletionItem[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [profileData, experienceData] = await Promise.all([
          ProfileService.getProfile(user.id),
          ProfileService.getUserExperiences(user.id)
        ]);

        setProfile(profileData);
        setExperiences(experienceData || []);

        // Calculate completion items
        const items = calculateCompletionItems(profileData, experienceData || []);
        setCompletionItems(items);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  const calculateCompletionItems = (profile: any, experiences: any[]): ProfileCompletionItem[] => {
    const items: ProfileCompletionItem[] = [
      {
        id: 'basic_info',
        title: 'Complete Basic Information',
        description: 'Add your name, title, and location',
        completed: !!(profile?.full_name && profile?.title && profile?.location),
        weight: 20,
        icon: User,
        action: 'Complete Profile',
        actionLink: '/profile',
        priority: 'high'
      },
      {
        id: 'resume',
        title: 'Upload Resume',
        description: 'Upload your latest resume for better job matching',
        completed: !!(profile?.resume_url),
        weight: 25,
        icon: FileText,
        action: 'Upload Resume',
        actionLink: '/resume-builder',
        priority: 'high'
      },
      {
        id: 'experience',
        title: 'Add Work Experience',
        description: 'Add at least one work experience entry',
        completed: experiences.length > 0,
        weight: 20,
        icon: Briefcase,
        action: 'Add Experience',
        actionLink: '/profile',
        priority: 'high'
      },
      {
        id: 'skills',
        title: 'Add Skills',
        description: 'List your technical and soft skills',
        completed: !!(profile?.skills && profile.skills.length > 0),
        weight: 15,
        icon: Star,
        action: 'Add Skills',
        actionLink: '/profile',
        priority: 'medium'
      },
      {
        id: 'bio',
        title: 'Write Professional Summary',
        description: 'Add a compelling professional summary',
        completed: !!(profile?.bio && profile.bio.length > 50),
        weight: 10,
        icon: FileText,
        action: 'Add Summary',
        actionLink: '/profile',
        priority: 'medium'
      },
      {
        id: 'social',
        title: 'Connect Social Profiles',
        description: 'Add LinkedIn, GitHub, or portfolio links',
        completed: !!(profile?.linkedin || profile?.github || profile?.website),
        weight: 10,
        icon: LinkIcon,
        action: 'Add Links',
        actionLink: '/profile',
        priority: 'low'
      }
    ];

    return items;
  };

  const getCompletionPercentage = () => {
    if (completionItems.length === 0) return 0;
    const completedWeight = completionItems
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    return Math.round(completedWeight);
  };

  const getIncompleteItems = () => {
    return completionItems
      .filter(item => !item.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Sign in to track your profile completion</p>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = getCompletionPercentage();
  const incompleteItems = getIncompleteItems();
  const isComplete = completionPercentage === 100;

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Profile Completion
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {isComplete ? 'Profile complete!' : `${incompleteItems.length} items remaining`}
            </p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-2xl font-bold",
              completionPercentage >= 80 ? "text-green-600" :
                completionPercentage >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
              {completionPercentage}%
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Progress
            value={completionPercentage}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Incomplete</span>
            <span>Complete</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isComplete ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your profile is fully optimized for job matching.
            </p>
            <Button asChild>
              <Link href="/jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Find Jobs
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {incompleteItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={item.actionLink} className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      {item.action}
                    </Link>
                  </Button>
                </div>
              );
            })}

            {incompleteItems.length > 3 && (
              <div className="pt-2 border-t border-gray-100">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/profile" className="flex items-center gap-1">
                    <span>View All ({incompleteItems.length - 3} more)</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 