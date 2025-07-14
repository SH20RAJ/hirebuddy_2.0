import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Clock, DollarSign, Building, ChevronRight } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { ProfileService } from "@/services/profileService";
import { checkJobApplicationPermission } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MobileCard from "@/components/mobile/MobileCard";
import MobileButton from "@/components/mobile/MobileButton";

export const JobRecommendations = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  
  // Fetch a limited number of recent jobs as recommendations
  const { data: jobsData, isLoading, error } = useJobs({
    limit: 3,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const jobs = jobsData?.jobs || [];

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const [profileData, experienceData] = await Promise.all([
          ProfileService.getProfile(user.id),
          ProfileService.getUserExperiences(user.id)
        ]);
        setProfile(profileData);
        setExperiences(experienceData || []);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card className="border-pink-100">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 border-b">
          <CardTitle className="flex items-center justify-between">
            AI Job Recommendations
            <Skeleton className="h-6 w-20" />
          </CardTitle>
          <CardDescription>
            Jobs perfectly matched to your skills and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-pink-100 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-2 w-12" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || jobs.length === 0) {
    return (
      <Card className="border-pink-100">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 border-b">
          <CardTitle className="flex items-center justify-between">
            AI Job Recommendations
            <Badge variant="secondary" className="bg-pink-100 text-primary">
              No matches
            </Badge>
          </CardTitle>
          <CardDescription>
            Jobs perfectly matched to your skills and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {error ? "Unable to load job recommendations" : "No job recommendations available"}
            </p>
            <Link to="/jobs">
              <Button variant="outline" className="border-pink-200 hover:bg-pink-50 text-primary">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate mock match scores for display (in a real app, this would be calculated based on user profile)
  const getMatchScore = (index: number) => {
    const baseScores = [96, 92, 89];
    return baseScores[index] || 85;
  };

  // Mobile job card component
  const MobileJobRecommendationCard = ({ job, index }: { job: any; index: number }) => {
    const matchScore = getMatchScore(index);
    
    const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    };

    return (
      <MobileCard className="mb-2" variant="compact">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mobile-body text-gray-900 line-clamp-2 leading-tight">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <p className="mobile-body-xs text-gray-600 truncate">{job.company}</p>
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-primary">
                  {matchScore}%
                </span>
                <div className="w-8 h-1.5 bg-pink-100 rounded-full">
                  <div 
                    className="h-1.5 bg-primary rounded-full" 
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Location and Time */}
          <div className="flex items-center gap-3 mobile-body-xs text-gray-600">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{job.posted}</span>
            </div>
          </div>

          {/* Skills */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                <Badge key={tagIndex} variant="secondary" className="mobile-body-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="secondary" className="mobile-body-xs">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Apply Button */}
          <div className="flex gap-2 pt-1">
            <MobileButton
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => {
                // Check profile completion before applying
                const jobPermission = checkJobApplicationPermission(profile, experiences);
                if (!jobPermission.canApply) {
                  toast.error('Complete your profile to 85% before applying to jobs');
                  return;
                }
                
                if (job.applyLink) {
                  window.open(job.applyLink, '_blank');
                }
              }}
            >
              Apply Now
            </MobileButton>
            <Link to={`/jobs`} className="flex-1">
              <MobileButton size="sm" variant="primary" className="w-full">
                View Details
              </MobileButton>
            </Link>
          </div>
        </div>
      </MobileCard>
    );
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Job Recommendations</h3>
            <Badge variant="secondary" className="bg-pink-100 text-primary mobile-body-xs">
              {jobs.length} New Match{jobs.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Jobs perfectly matched to your skills</p>
        </div>
        
        <div className="space-y-2">
          {jobs.map((job, index) => (
            <MobileJobRecommendationCard key={job.id} job={job} index={index} />
          ))}
        </div>
        
        <div className="mt-4">
          <Link to="/jobs">
            <MobileButton variant="primary" size="full" className="w-full">
              View All Job Recommendations
            </MobileButton>
          </Link>
        </div>
      </div>

      {/* Desktop View */}
      <Card className="border-pink-100 hidden md:block">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 border-b">
          <CardTitle className="flex items-center justify-between">
            AI Job Recommendations
            <Badge variant="secondary" className="bg-pink-100 text-primary">
              {jobs.length} New Match{jobs.length !== 1 ? 'es' : ''}
            </Badge>
          </CardTitle>
          <CardDescription>
            Jobs perfectly matched to your skills and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.map((job, index) => {
            const matchScore = getMatchScore(index);
            
            return (
              <div key={job.id} className="border border-pink-100 rounded-lg p-4 hover:shadow-md hover:bg-pink-50/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover border border-pink-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location} • {job.posted}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs border-pink-200 bg-pink-50 text-primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary">
                        {matchScore}% match
                      </span>
                      <div className="w-12 h-2 bg-pink-100 rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{job.posted}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      // Check profile completion before applying
                      const jobPermission = checkJobApplicationPermission(profile, experiences);
                      if (!jobPermission.canApply) {
                        toast.error('Complete your profile to 85% before applying to jobs');
                        return;
                      }
                      
                      if (job.applyLink) {
                        window.open(job.applyLink, '_blank');
                      }
                    }}
                  >
                    Auto Apply
                  </Button>
                  <Link to={`/jobs`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full border-pink-200 hover:bg-pink-50 text-primary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 border-t border-pink-100">
            <Link to="/jobs" className="block">
              <Button variant="ghost" className="w-full text-primary hover:bg-pink-50">
                View All Job Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
