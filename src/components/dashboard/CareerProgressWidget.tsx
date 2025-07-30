import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileService } from "@/services/profileService";
import { DashboardService } from "@/services/dashboardService";
import {
  TrendingUp,
  Calendar,
  Award,
  Target,
  ArrowRight,
  Briefcase,
  Users,
  DollarSign,
  Star,
  Trophy,
  CheckCircle,
  Clock,
  MapPin,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: string;
  targetDate?: string;
  category: 'application' | 'skill' | 'experience' | 'network' | 'salary';
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
}

interface CareerStats {
  currentLevel: string;
  experienceYears: number;
  totalApplications: number;
  interviewRate: number;
  avgResponseTime: number;
  skillsCount: number;
  networkSize: number;
}

export const CareerProgressWidget: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [milestones, setMilestones] = useState<CareerMilestone[]>([]);

  useEffect(() => {
    const loadCareerData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [profileData, experienceData, statsData] = await Promise.all([
          ProfileService.getProfile(user.id),
          ProfileService.getUserExperiences(user.id),
          DashboardService.getDashboardStats()
        ]);

        setProfile(profileData);
        setExperiences(experienceData || []);
        setDashboardStats(statsData);

        // Calculate milestones
        const calculatedMilestones = calculateMilestones(profileData, experienceData || [], statsData);
        setMilestones(calculatedMilestones);
      } catch (error) {
        console.error('Error loading career data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerData();
  }, [user?.id]);

  const calculateMilestones = (profile: any, experiences: any[], stats: any): CareerMilestone[] => {
    const milestones: CareerMilestone[] = [
      {
        id: 'first_application',
        title: 'First Job Application',
        description: 'Submit your first job application',
        completed: (stats?.totalApplications || 0) > 0,
        category: 'application',
        priority: 'High',
        progress: (stats?.totalApplications || 0) > 0 ? 100 : 0
      },
      {
        id: 'profile_complete',
        title: 'Complete Professional Profile',
        description: 'Fill out all profile sections',
        completed: !!(profile?.full_name && profile?.title && profile?.bio && profile?.skills?.length > 0),
        category: 'skill',
        priority: 'High',
        progress: calculateProfileCompletionProgress(profile)
      },
      {
        id: 'ten_applications',
        title: 'Apply to 10 Jobs',
        description: 'Reach 10 job applications milestone',
        completed: (stats?.totalApplications || 0) >= 10,
        category: 'application',
        priority: 'Medium',
        progress: Math.min(((stats?.totalApplications || 0) / 10) * 100, 100)
      },

      {
        id: 'skill_master',
        title: 'Skill Master',
        description: 'Add 15+ skills to your profile',
        completed: (profile?.skills?.length || 0) >= 15,
        category: 'skill',
        priority: 'Medium',
        progress: Math.min(((profile?.skills?.length || 0) / 15) * 100, 100)
      },
      {
        id: 'experience_documented',
        title: 'Document Work Experience',
        description: 'Add detailed work experience entries',
        completed: experiences.length >= 2,
        category: 'experience',
        priority: 'Medium',
        progress: Math.min((experiences.length / 2) * 100, 100)
      },
      {
        id: 'monthly_goal',
        title: 'Monthly Application Goal',
        description: 'Apply to 20+ jobs this month',
        completed: (stats?.weeklyApplications || 0) * 4 >= 20,
        category: 'application',
        priority: 'Medium',
        progress: Math.min((((stats?.weeklyApplications || 0) * 4) / 20) * 100, 100)
      }
    ];

    return milestones.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const calculateProfileCompletionProgress = (profile: any): number => {
    const fields = [
      profile?.full_name,
      profile?.title,
      profile?.bio,
      profile?.location,
      profile?.skills?.length > 0,
      profile?.resume_url
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getCareerStats = (): CareerStats => {
    const experienceYears = experiences.reduce((total, exp) => {
      if (exp.start_date && exp.end_date) {
        const start = new Date(exp.start_date);
        const end = exp.is_current ? new Date() : new Date(exp.end_date);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + Math.max(years, 0);
      }
      return total;
    }, 0);

    return {
      currentLevel: getCareerLevel(experienceYears),
      experienceYears: Math.round(experienceYears * 10) / 10,
      totalApplications: dashboardStats?.totalApplications || 0,
      interviewRate: dashboardStats?.totalApplications > 0
        ? Math.round(((dashboardStats?.interviewInvites || 0) / dashboardStats.totalApplications) * 100)
        : 0,
      avgResponseTime: 3, // Mock data
      skillsCount: profile?.skills?.length || 0,
      networkSize: 0 // Mock data
    };
  };

  const getCareerLevel = (years: number): string => {
    if (years < 1) return 'Entry Level';
    if (years < 3) return 'Junior';
    if (years < 5) return 'Mid-Level';
    if (years < 8) return 'Senior';
    return 'Lead/Principal';
  };

  const getCategoryIcon = (category: CareerMilestone['category']) => {
    switch (category) {
      case 'application': return <Briefcase className="h-4 w-4" />;
      case 'skill': return <Star className="h-4 w-4" />;
      case 'experience': return <Award className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'salary': return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
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
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Career Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Sign in to track your career progress</p>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getCareerStats();
  const completedMilestones = milestones.filter(m => m.completed).length;
  const nextMilestones = milestones.filter(m => !m.completed).slice(0, 3);

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Career Progress
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {stats.currentLevel} • {completedMilestones}/{milestones.length} milestones
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((completedMilestones / milestones.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Career Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.experienceYears}y</div>
            <div className="text-xs text-gray-500">Experience</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.interviewRate}%</div>
            <div className="text-xs text-gray-500">Interview Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.skillsCount}</div>
            <div className="text-xs text-gray-500">Skills</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {completedMilestones}/{milestones.length}
            </span>
          </div>
          <Progress value={(completedMilestones / milestones.length) * 100} className="h-2" />
        </div>

        {/* Next Milestones */}
        {nextMilestones.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Next Milestones
            </h4>
            <div className="space-y-3">
              {nextMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getCategoryIcon(milestone.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(milestone.priority))}>
                          {milestone.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={milestone.progress} className="h-1 flex-1" />
                        <span className="text-xs text-gray-500">{Math.round(milestone.progress)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {completedMilestones > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {milestones.filter(m => m.completed).slice(0, 2).map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-green-900">{milestone.title}</h5>
                    <p className="text-sm text-green-700">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No progress state */}
        {completedMilestones === 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-4 max-w-sm mx-auto">
              Complete your profile and start applying to jobs to track your career progress.
            </p>
            <Button asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Complete Profile
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 