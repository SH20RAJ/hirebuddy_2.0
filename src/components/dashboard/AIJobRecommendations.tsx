import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JobRecommendationService, JobRecommendation } from "@/services/jobRecommendationService";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Building, 
  ArrowUpRight, 
  Clock, 
  Target,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Brain,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface AIJobRecommendationsProps {
  limit?: number;
}

export const AIJobRecommendations: React.FC<AIJobRecommendationsProps> = ({ limit = 5 }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRecommendations = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const recs = await JobRecommendationService.getRecommendedJobs(user.id, limit);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error loading job recommendations:', err);
      setError('Failed to load job recommendations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user, limit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
  };

  const getMatchScoreText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Brain className="h-5 w-5 text-gray-600" />
            Job Recommendations
            <Skeleton className="h-6 w-20 ml-auto" />
          </CardTitle>
          <p className="text-sm text-gray-500">Personalized matches based on your profile</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Brain className="h-5 w-5 text-gray-600" />
            Job Recommendations
          </CardTitle>
          <p className="text-sm text-gray-500">Personalized matches based on your profile</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Brain className="h-5 w-5 text-gray-600" />
            Job Recommendations
          </CardTitle>
          <p className="text-sm text-gray-500">Personalized matches based on your profile</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Sign in to get personalized job recommendations</p>
            <Button variant="outline" asChild>
              <Link to="/signin" className="text-gray-700">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Brain className="h-5 w-5 text-gray-600" />
                Job Recommendations
              </CardTitle>
              <p className="text-sm text-gray-500">Personalized matches based on your profile</p>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Complete your profile to get personalized job recommendations
            </p>
            <Button variant="outline" asChild>
              <Link to="/profile" className="text-gray-700">
                Complete Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Brain className="h-5 w-5 text-gray-600" />
              Job Recommendations
              <span className="text-sm font-normal text-gray-500">
                {recommendations.length} match{recommendations.length !== 1 ? 'es' : ''}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-500">Personalized matches based on your profile</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {recommendations.map((job) => (
            <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-gray-200">
                  <AvatarImage src={job.logo} alt={job.company} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                    {job.company.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Building className="h-3 w-3" />
                        <span>{job.company}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                        {job.isRemote && (
                          <>
                            <span>•</span>
                            <span className="text-xs text-gray-600 font-medium">Remote</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {job.matchScore}% match
                      </div>
                      <div className="text-xs text-gray-500">
                        {getMatchScoreText(job.matchScore)}
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {job.matchReasons.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-gray-600" />
                        Why it matches:
                      </div>
                      <div className="space-y-1">
                        {job.matchReasons.slice(0, 2).map((reason, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.tags.slice(0, 4).map((skill, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        if (job.applyLink) {
                          window.open(job.applyLink, '_blank');
                        }
                      }}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild
                    >
                      <Link to={`/jobs?search=${encodeURIComponent(job.title)}`}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.posted}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Want more personalized recommendations?
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="text-gray-700">
                  <Target className="h-3 w-3 mr-1" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobs" className="text-gray-700">
                  <span>Browse all jobs</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 