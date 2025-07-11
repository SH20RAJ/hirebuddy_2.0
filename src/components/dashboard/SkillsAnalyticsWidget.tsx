import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileService } from "@/services/profileService";
import { openaiService } from "@/services/openaiService";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus, 
  ArrowRight,
  Brain,
  Code,
  Users,
  Zap,
  Award,
  AlertCircle,
  Sparkles,
  DollarSign,
  Lightbulb,
  Loader2,
  RefreshCw,
  Info,
  Minus,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EnhancedSkillAnalysis {
  skill: string;
  userHas: boolean;
  demandLevel: 'high' | 'medium' | 'low';
  marketTrend: 'rising' | 'stable' | 'declining';
  jobMatches: number;
  category: 'technical' | 'soft' | 'tool' | 'language' | 'certification';
  priority: number;
  salaryImpact: string;
  description: string;
}

interface MarketInsights {
  overallScore: number;
  marketAlignment: number;
  recommendations: string[];
  emergingSkills: string[];
  industryTrends: string[];
}

export const SkillsAnalyticsWidget: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingMoreSkills, setIsLoadingMoreSkills] = useState(false);
  const [skillsAnalysis, setSkillsAnalysis] = useState<EnhancedSkillAnalysis[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [removedSkills, setRemovedSkills] = useState<Set<string>>(new Set());
  const [addingSkills, setAddingSkills] = useState<Set<string>>(new Set());

  // OpenAI service is imported as a singleton

  useEffect(() => {
    const loadSkillsData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const profileData = await ProfileService.getProfile(user.id);
        setProfile(profileData);
        
        // Load removed skills from localStorage
        const savedRemovedSkills = localStorage.getItem(`removedSkills_${user.id}`);
        if (savedRemovedSkills) {
          setRemovedSkills(new Set(JSON.parse(savedRemovedSkills)));
        }
        
        // Use AI analysis if available, otherwise fallback to basic analysis
        await performAIAnalysis(profileData);
      } catch (error) {
        console.error('Error loading skills data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load skills data');
        // Fallback to basic analysis
        if (profile) {
          const basicAnalysis = getBasicSkillsAnalysis(profile?.skills || []);
          setSkillsAnalysis(basicAnalysis);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSkillsData();
  }, [user?.id]);

  const performAIAnalysis = async (profileData: any) => {
    try {
      setIsAnalyzing(true);
      const userSkills = profileData?.skills || [];
      const jobTitle = profileData?.job_title || profileData?.desired_job_title;
      const industry = profileData?.industry;
      const experienceLevel = profileData?.experience_level;

      const analysis = await openaiService.analyzeSkillsMarket(
        userSkills,
        jobTitle,
        industry,
        experienceLevel
      );

      setSkillsAnalysis(analysis.skillsAnalysis);
      setMarketInsights(analysis.marketInsights);
      setLastAnalyzed(new Date());
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to basic analysis
      const basicAnalysis = getBasicSkillsAnalysis(profileData?.skills || []);
      setSkillsAnalysis(basicAnalysis);
      setError('AI analysis unavailable. Showing basic analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadMoreSkillRecommendations = async () => {
    if (!user?.id || !profile || isLoadingMoreSkills) return;

    try {
      setIsLoadingMoreSkills(true);
      
      const userSkills = profile?.skills || [];
      const jobTitle = profile?.job_title || profile?.desired_job_title;
      const industry = profile?.industry;
      const experienceLevel = profile?.experience_level;

      // Get current skill names to avoid duplicates
      const existingSkillNames = skillsAnalysis.map(s => s.skill);
      const excludedSkills = Array.from(removedSkills);

      // Generate additional skills using OpenAI
      const additionalSkills = await openaiService.generateAdditionalSkillRecommendations(
        userSkills,
        excludedSkills,
        existingSkillNames,
        jobTitle,
        industry,
        experienceLevel,
        15 // Generate 15 new skills
      );

      if (additionalSkills.length > 0) {
        // Add new skills to the analysis, avoiding duplicates
        const uniqueNewSkills = additionalSkills.filter(newSkill => 
          !existingSkillNames.some(existing => 
            existing.toLowerCase() === newSkill.skill.toLowerCase()
          )
        );

        setSkillsAnalysis(prev => [...prev, ...uniqueNewSkills]);
        toast.success(`Added ${uniqueNewSkills.length} new skill recommendations`);
      } else {
        // If OpenAI fails, add some backup skills
        const backupSkills = getBackupSkillRecommendations(userSkills, existingSkillNames, excludedSkills);
        if (backupSkills.length > 0) {
          setSkillsAnalysis(prev => [...prev, ...backupSkills]);
          toast.success(`Added ${backupSkills.length} additional skill recommendations`);
        }
      }
    } catch (error) {
      console.error('Error loading more skills:', error);
      // Add backup skills as fallback
      const backupSkills = getBackupSkillRecommendations(
        profile?.skills || [], 
        skillsAnalysis.map(s => s.skill), 
        Array.from(removedSkills)
      );
      if (backupSkills.length > 0) {
        setSkillsAnalysis(prev => [...prev, ...backupSkills]);
        toast.success(`Added ${backupSkills.length} additional skill recommendations`);
      } else {
        toast.error('Unable to load more skill recommendations. Please try refreshing.');
      }
    } finally {
      setIsLoadingMoreSkills(false);
    }
  };

  const getBackupSkillRecommendations = (
    userSkills: string[], 
    existingSkills: string[], 
    excludedSkills: string[]
  ): EnhancedSkillAnalysis[] => {
    // Extended backup skill pool with more diverse options
    const backupSkillPool: EnhancedSkillAnalysis[] = [
      // AI/ML & Data Science
      { skill: 'TensorFlow', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 850, category: 'technical', priority: 92, salaryImpact: '+20% average', description: 'Open-source machine learning framework' },
      { skill: 'PyTorch', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 780, category: 'technical', priority: 90, salaryImpact: '+18% average', description: 'Deep learning framework' },
      { skill: 'Pandas', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 920, category: 'technical', priority: 88, salaryImpact: '+15% average', description: 'Data manipulation and analysis library' },
      { skill: 'Scikit-learn', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 650, category: 'technical', priority: 82, salaryImpact: '+12% average', description: 'Machine learning library for Python' },
      { skill: 'OpenAI API', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 560, category: 'technical', priority: 89, salaryImpact: '+22% average', description: 'Integration with AI models' },
      { skill: 'LangChain', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 480, category: 'technical', priority: 86, salaryImpact: '+25% average', description: 'Framework for building AI applications' },
      
      // Cloud & DevOps
      { skill: 'Google Cloud Platform', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 890, category: 'tool', priority: 87, salaryImpact: '+18% average', description: 'Google cloud services platform' },
      { skill: 'Azure', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 850, category: 'tool', priority: 86, salaryImpact: '+17% average', description: 'Microsoft cloud platform' },
      { skill: 'Serverless', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 720, category: 'technical', priority: 84, salaryImpact: '+16% average', description: 'Cloud computing execution model' },
      { skill: 'CI/CD', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 980, category: 'technical', priority: 88, salaryImpact: '+14% average', description: 'Continuous integration and deployment' },
      { skill: 'GitHub Actions', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 620, category: 'tool', priority: 78, salaryImpact: '+8% average', description: 'Automation and CI/CD platform' },
      { skill: 'Pulumi', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 340, category: 'tool', priority: 72, salaryImpact: '+15% average', description: 'Infrastructure as code platform' },
      
      // Modern Development
      { skill: 'Deno', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 280, category: 'technical', priority: 70, salaryImpact: '+10% average', description: 'Modern JavaScript/TypeScript runtime' },
      { skill: 'Bun', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 250, category: 'technical', priority: 68, salaryImpact: '+8% average', description: 'Fast JavaScript runtime and bundler' },
      { skill: 'Vite', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 450, category: 'tool', priority: 75, salaryImpact: '+6% average', description: 'Fast build tool for modern web projects' },
      { skill: 'Turborepo', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 320, category: 'tool', priority: 73, salaryImpact: '+12% average', description: 'High-performance monorepo tool' },
      { skill: 'SvelteKit', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 380, category: 'technical', priority: 74, salaryImpact: '+8% average', description: 'Full-stack Svelte framework' },
      { skill: 'Astro', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 290, category: 'technical', priority: 71, salaryImpact: '+7% average', description: 'Static site generator for modern web' },
      
      // Databases & Backend
      { skill: 'PostgreSQL', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 1100, category: 'tool', priority: 85, salaryImpact: '+12% average', description: 'Advanced open-source relational database' },
      { skill: 'Prisma', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 480, category: 'tool', priority: 76, salaryImpact: '+10% average', description: 'Modern database toolkit' },
      { skill: 'Supabase', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 420, category: 'tool', priority: 74, salaryImpact: '+8% average', description: 'Open-source Firebase alternative' },
      { skill: 'PlanetScale', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 280, category: 'tool', priority: 69, salaryImpact: '+12% average', description: 'Serverless MySQL database platform' },
      { skill: 'Elasticsearch', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 620, category: 'tool', priority: 77, salaryImpact: '+14% average', description: 'Search and analytics engine' },
      
      // Security & Testing
      { skill: 'Cybersecurity', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 950, category: 'technical', priority: 91, salaryImpact: '+25% average', description: 'Information security practices' },
      { skill: 'Penetration Testing', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 520, category: 'technical', priority: 85, salaryImpact: '+30% average', description: 'Security testing methodology' },
      { skill: 'Jest', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 720, category: 'tool', priority: 78, salaryImpact: '+5% average', description: 'JavaScript testing framework' },
      { skill: 'Cypress', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 480, category: 'tool', priority: 76, salaryImpact: '+8% average', description: 'End-to-end testing framework' },
      { skill: 'Playwright', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 380, category: 'tool', priority: 74, salaryImpact: '+10% average', description: 'Cross-browser automation library' },
      
      // Soft Skills & Leadership
      { skill: 'Agile Methodology', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 1200, category: 'soft', priority: 86, salaryImpact: '+8% average', description: 'Iterative project management approach' },
      { skill: 'Scrum Master', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 780, category: 'certification', priority: 84, salaryImpact: '+15% average', description: 'Agile framework facilitation role' },
      { skill: 'Product Management', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 890, category: 'soft', priority: 88, salaryImpact: '+20% average', description: 'Product strategy and development' },
      { skill: 'Design Thinking', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 650, category: 'soft', priority: 75, salaryImpact: '+10% average', description: 'Human-centered problem solving' },
      { skill: 'Cross-functional Collaboration', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 1100, category: 'soft', priority: 82, salaryImpact: '+8% average', description: 'Working across different teams' },
      { skill: 'Mentoring', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 580, category: 'soft', priority: 76, salaryImpact: '+12% average', description: 'Guiding and developing others' },
      
      // Analytics & Business Intelligence
      { skill: 'Tableau', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 620, category: 'tool', priority: 77, salaryImpact: '+12% average', description: 'Data visualization platform' },
      { skill: 'Power BI', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 580, category: 'tool', priority: 75, salaryImpact: '+10% average', description: 'Business analytics tool' },
      { skill: 'Google Analytics', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 750, category: 'tool', priority: 72, salaryImpact: '+6% average', description: 'Web analytics service' },
      { skill: 'Mixpanel', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 320, category: 'tool', priority: 68, salaryImpact: '+8% average', description: 'Product analytics platform' },
      
      // Emerging Technologies
      { skill: 'Web3', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 450, category: 'technical', priority: 79, salaryImpact: '+25% average', description: 'Decentralized web technologies' },
      { skill: 'Blockchain', userHas: false, demandLevel: 'medium', marketTrend: 'stable', jobMatches: 520, category: 'technical', priority: 80, salaryImpact: '+22% average', description: 'Distributed ledger technology' },
      { skill: 'Solidity', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 280, category: 'technical', priority: 77, salaryImpact: '+30% average', description: 'Smart contract programming language' },
      { skill: 'IoT', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 480, category: 'technical', priority: 73, salaryImpact: '+15% average', description: 'Internet of Things technologies' },
      { skill: 'Edge Computing', userHas: false, demandLevel: 'medium', marketTrend: 'rising', jobMatches: 380, category: 'technical', priority: 81, salaryImpact: '+18% average', description: 'Distributed computing paradigm' }
    ];

    // Filter out skills that already exist or have been removed
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedExistingSkills = existingSkills.map(s => s.toLowerCase().trim());
    const normalizedExcludedSkills = excludedSkills.map(s => s.toLowerCase().trim());

    return backupSkillPool
      .filter(skill => {
        const skillLower = skill.skill.toLowerCase();
        return !normalizedUserSkills.some(userSkill => 
          userSkill.includes(skillLower) || skillLower.includes(userSkill)
        ) && 
        !normalizedExistingSkills.includes(skillLower) &&
        !normalizedExcludedSkills.includes(skillLower);
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // Return top 10 unique skills
  };

  const getBasicSkillsAnalysis = (userSkills: string[]): EnhancedSkillAnalysis[] => {
    // Core essential skills that should always be available
    const coreSkills: EnhancedSkillAnalysis[] = [
      { skill: 'React', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 1250, category: 'technical', priority: 95, salaryImpact: '+12% average', description: 'Popular frontend framework' },
      { skill: 'TypeScript', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 980, category: 'technical', priority: 92, salaryImpact: '+15% average', description: 'Type-safe JavaScript' },
      { skill: 'Python', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 1100, category: 'technical', priority: 90, salaryImpact: '+18% average', description: 'Versatile programming language' },
      { skill: 'AWS', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 945, category: 'tool', priority: 89, salaryImpact: '+20% average', description: 'Leading cloud platform' },
      { skill: 'Machine Learning', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 890, category: 'technical', priority: 93, salaryImpact: '+25% average', description: 'AI/ML capabilities' },
      { skill: 'Node.js', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 875, category: 'technical', priority: 88, salaryImpact: '+8% average', description: 'Backend JavaScript runtime' },
      { skill: 'SQL', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 1300, category: 'technical', priority: 88, salaryImpact: '+10% average', description: 'Database query language' },
      { skill: 'Docker', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 720, category: 'tool', priority: 85, salaryImpact: '+10% average', description: 'Container technology' },
      { skill: 'Kubernetes', userHas: false, demandLevel: 'high', marketTrend: 'rising', jobMatches: 650, category: 'tool', priority: 87, salaryImpact: '+22% average', description: 'Container orchestration' },
      { skill: 'Git', userHas: false, demandLevel: 'high', marketTrend: 'stable', jobMatches: 1150, category: 'tool', priority: 85, salaryImpact: '+5% average', description: 'Version control system' },
    ];

    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
    
    return coreSkills.map(skill => ({
      ...skill,
      userHas: normalizedUserSkills.some(userSkill => 
        userSkill.includes(skill.skill.toLowerCase()) || 
        skill.skill.toLowerCase().includes(userSkill)
      )
    })).sort((a, b) => b.priority - a.priority);
  };

  const refreshAnalysis = async () => {
    if (profile) {
      await performAIAnalysis(profile);
    }
  };

  const handleAddSkill = async (skillName: string) => {
    if (!user?.id || !profile) {
      toast.error("Please sign in to add skills");
      return;
    }

    setAddingSkills(prev => new Set([...prev, skillName]));

    try {
      const currentSkills = profile.skills || [];
      if (currentSkills.includes(skillName)) {
        toast.info("Skill already added to your profile");
        return;
      }

      const updatedSkills = [...currentSkills, skillName];
      
      // Update profile in database
      const updatedProfile = await ProfileService.updateProfile(user.id, {
        skills: updatedSkills
      });

      // Update local state
      setProfile(updatedProfile);
      
      // Update skills analysis to reflect the new skill
      setSkillsAnalysis(prev => prev.map(skill => 
        skill.skill === skillName ? { ...skill, userHas: true } : skill
      ));

      toast.success(`Added "${skillName}" to your profile`);
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error("Failed to add skill. Please try again.");
    } finally {
      setAddingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillName);
        return newSet;
      });
    }
  };

  const handleRemoveSkillRecommendation = async (skillName: string) => {
    if (!user?.id) return;

    const newRemovedSkills = new Set([...removedSkills, skillName]);
    setRemovedSkills(newRemovedSkills);
    
    // Save to localStorage
    localStorage.setItem(`removedSkills_${user.id}`, JSON.stringify([...newRemovedSkills]));
    
    toast.success(`"${skillName}" removed from recommendations`);

    // Automatically load more skills when one is removed to ensure we always have recommendations
    const remainingRecommendations = getRecommendedSkills().filter(s => s.skill !== skillName);
    if (remainingRecommendations.length < 4) {
      // Load more skills in the background to maintain a good pool
      setTimeout(() => {
        loadMoreSkillRecommendations();
      }, 500);
    }
  };

  const getSkillStats = () => {
    const userSkills = skillsAnalysis.filter(s => s.userHas);
    const highDemandSkills = userSkills.filter(s => s.demandLevel === 'high');
    const risingSkills = userSkills.filter(s => s.marketTrend === 'rising');
    const technicalSkills = userSkills.filter(s => s.category === 'technical');
    
    return {
      total: userSkills.length,
      highDemand: highDemandSkills.length,
      rising: risingSkills.length,
      technical: technicalSkills.length,
      marketAlignment: marketInsights?.marketAlignment || Math.round((highDemandSkills.length / Math.max(userSkills.length, 1)) * 100)
    };
  };

  const getRecommendedSkills = () => {
    return skillsAnalysis
      .filter(s => !s.userHas && s.demandLevel === 'high' && !removedSkills.has(s.skill))
      .slice(0, 8); // Show more recommendations
  };

  const getDemandColor = (demand: 'high' | 'medium' | 'low') => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'stable': return <div className="h-3 w-3 bg-yellow-500 rounded-full" />;
      case 'declining': return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
  };

  const getCategoryIcon = (category: 'technical' | 'soft' | 'tool' | 'language' | 'certification') => {
    switch (category) {
      case 'technical': return <Code className="h-4 w-4" />;
      case 'soft': return <Users className="h-4 w-4" />;
      case 'tool': return <Zap className="h-4 w-4" />;
      case 'language': return <Brain className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
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
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
            <Brain className="h-5 w-5 text-blue-600" />
            AI Skills Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Sign in to get AI-powered skills analysis</p>
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getSkillStats();
  const recommendedSkills = getRecommendedSkills();

  return (
    <Card className="border-0 shadow-sm bg-white h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Skills Analytics
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} skills • {stats.marketAlignment}% market aligned
              {marketInsights && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  AI-powered
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshAnalysis} disabled={isAnalyzing}>
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">{error}</span>
          </div>
        )}

        {/* Enhanced Skills Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="text-lg font-bold text-green-700">{stats.highDemand}</div>
            <div className="text-xs text-green-600">High Demand</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-lg font-bold text-blue-700">
              {marketInsights?.overallScore || stats.marketAlignment}
              {marketInsights?.overallScore ? '' : '%'}
            </div>
            <div className="text-xs text-blue-600">
              {marketInsights?.overallScore ? 'AI Score' : 'Market Aligned'}
            </div>
          </div>
        </div>

        {/* Market Alignment Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Market Alignment</span>
            <span className="text-sm text-gray-600">{stats.marketAlignment}%</span>
          </div>
          <Progress value={stats.marketAlignment} className="h-2" />
        </div>

        {/* AI Recommendations */}
        {marketInsights?.recommendations && marketInsights.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              AI Recommendations
            </h4>
            <div className="space-y-1">
              {marketInsights.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Recommended Skills */}
        {recommendedSkills.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 flex-1 min-w-0">
                <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Top Skill Recommendations</span>
              </h4>
              {skillsAnalysis.length > 15 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadMoreSkillRecommendations}
                  disabled={isLoadingMoreSkills}
                  className="text-xs h-6 px-2 ml-2 flex-shrink-0"
                >
                  {isLoadingMoreSkills ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {recommendedSkills.slice(0, 6).map((skill) => (
                <div
                  key={skill.skill}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(skill.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">{skill.skill}</span>
                        {getTrendIcon(skill.marketTrend)}
                        {skill.salaryImpact && (
                          <DollarSign className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {skill.description} • {skill.jobMatches > 1000 ? `${Math.round(skill.jobMatches/1000)}k` : skill.jobMatches} jobs
                      </div>
                      {skill.salaryImpact && (
                        <div className="text-xs text-green-600 font-medium">
                          {skill.salaryImpact}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 hover:bg-green-50 hover:border-green-300"
                      onClick={() => handleAddSkill(skill.skill)}
                      disabled={addingSkills.has(skill.skill)}
                    >
                      {addingSkills.has(skill.skill) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Add {skill.skill}</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleRemoveSkillRecommendation(skill.skill)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Remove {skill.skill} from recommendations</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Skills Button */}
            <div className="mt-3 space-y-2">
              {recommendedSkills.length > 6 && (
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link to="/profile" className="flex items-center justify-center gap-1 text-xs">
                    <span>View all {recommendedSkills.length} recommendations</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMoreSkillRecommendations}
                disabled={isLoadingMoreSkills}
                className="w-full flex items-center justify-center gap-1 text-xs"
              >
                {isLoadingMoreSkills ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Finding skills...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Get fresh recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* No recommendations but has skills pool - show load more button */}
        {recommendedSkills.length === 0 && skillsAnalysis.length > 0 && stats.total > 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Great Skills Profile!</h3>
            <p className="text-gray-600 mb-3 text-sm">
              You have excellent market-aligned skills. Want to explore more?
            </p>
            <Button 
              size="sm" 
              onClick={loadMoreSkillRecommendations}
              disabled={isLoadingMoreSkills}
              className="flex items-center gap-2"
            >
              {isLoadingMoreSkills ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding skills...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Discover new skills
                </>
              )}
            </Button>
          </div>
        )}

        {/* Emerging Skills */}
        {marketInsights?.emergingSkills && marketInsights.emergingSkills.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Emerging Skills
            </h4>
            <div className="flex flex-wrap gap-1">
              {marketInsights.emergingSkills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* No skills state */}
        {stats.total === 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Add Your Skills</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Get AI-powered job recommendations and market insights
            </p>
            <Button size="sm" asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Skills
              </Link>
            </Button>
          </div>
        )}

        {lastAnalyzed && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Last analyzed: {lastAnalyzed.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 