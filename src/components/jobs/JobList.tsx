import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Heart, 
  ExternalLink, 
  Building,
  Star,
  TrendingUp,
  Zap,
  ChevronDown,
  Briefcase,
  Calendar,
  Globe
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job } from "@/types/job";

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  searchQuery?: string;
  onJobClick?: (job: Job) => void;
}

export const JobList = ({ jobs, isLoading = false, searchQuery, onJobClick }: JobListProps) => {
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  const toggleLike = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newLiked = new Set(likedJobs);
    if (newLiked.has(jobId)) {
      newLiked.delete(jobId);
    } else {
      newLiked.add(jobId);
    }
    setLikedJobs(newLiked);
  };
  
  const handleJobClick = (job: Job) => {
    if (onJobClick) {
      onJobClick(job);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600">
          {searchQuery 
            ? `No jobs found matching "${searchQuery}". Try different keywords.`
            : "No jobs available at the moment. Check back later!"
          }
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => handleJobClick(job)}
              onMouseEnter={() => setHoveredJob(job.id)}
              onMouseLeave={() => setHoveredJob(null)}
            >
              <Card 
                className={`group cursor-pointer transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden ${
                  hoveredJob === job.id ? 'shadow-xl transform -translate-y-1' : 'shadow-md'
                }`}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Main content */}
                    <div className="relative p-6">
                      <div className="flex items-start gap-4">
                        {/* Company Logo with enhanced styling */}
                        <div className="relative">
                          <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                            <AvatarImage src={job.logo} alt={job.company} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {job.company.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Remote indicator */}
                          {job.isRemote && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <Globe className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          {/* Featured indicator */}
                          {job.tags.includes('Featured') && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Job title with enhanced styling */}
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1 mb-1">
                                {job.title}
                              </h3>
                              
                              {/* Company name */}
                              <div className="flex items-center gap-2 mb-3">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 font-semibold">{job.company}</span>
                              </div>

                              {/* Job meta information */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{job.posted}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{job.type}</span>
                                </div>
                              </div>

                              {/* Job description */}
                              <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                {job.description}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2">
                                {job.tags.slice(0, 5).map((tag, tagIndex) => (
                                  <Badge 
                                    key={tagIndex} 
                                    variant="secondary" 
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {job.tags.length > 5 && (
                                  <Badge variant="outline" className="text-xs px-2 py-1">
                                    +{job.tags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 ml-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`p-2 h-8 w-8 transition-all ${
                                        likedJobs.has(job.id) 
                                          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                      }`}
                                      onClick={(e) => toggleLike(job.id, e)}
                                    >
                                      <Heart className={`w-4 h-4 ${likedJobs.has(job.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{likedJobs.has(job.id) ? 'Unlike' : 'Like'} this job</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (job.applyLink) {
                                    window.open(job.applyLink, '_blank');
                                  }
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};
