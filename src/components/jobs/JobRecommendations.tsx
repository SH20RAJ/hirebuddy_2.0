import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  MapPin, 
  Clock, 
  Briefcase,
  ExternalLink,
  RefreshCw,
  Star,
  Zap
} from "lucide-react";
import { Job } from "@/types/job";
import { toast } from "sonner";

interface JobRecommendationsProps {
  onApplyJob: (job: Job) => void;
  onJobClick: (job: Job) => void;
}

export const JobRecommendations = ({ 
  onApplyJob, 
  onJobClick 
}: JobRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock recommendations data - in a real app, this would come from an AI service
  const mockRecommendations: Job[] = [
    {
      id: "rec-1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      description: "Join our innovative team building next-generation web applications with React, TypeScript, and modern frameworks.",
      isRemote: true,
      isProbablyRemote: true,
      createdAt: new Date().toISOString(),
      posted: "2 days ago",
      logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop&crop=center",
      tags: ["React", "TypeScript", "Remote", "Senior Level"],
      type: "Full-time",
      applyLink: "https://example.com/apply/1"
    },
    {
      id: "rec-2",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      description: "Build scalable applications using modern technologies. Experience with React, Node.js, and cloud platforms required.",
      isRemote: false,
      isProbablyRemote: false,
      createdAt: new Date().toISOString(),
      posted: "1 day ago",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=center",
      tags: ["JavaScript", "Node.js", "Full Stack", "Mid Level"],
      type: "Full-time",
      applyLink: "https://example.com/apply/2"
    },
    {
      id: "rec-3",
      title: "UI/UX Designer",
      company: "DesignStudio",
      location: "Remote",
      description: "Create beautiful and intuitive user experiences. Work with cross-functional teams to deliver exceptional design solutions.",
      isRemote: true,
      isProbablyRemote: true,
      createdAt: new Date().toISOString(),
      posted: "3 days ago",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop&crop=center",
      tags: ["UI/UX", "Figma", "Design Systems", "Remote"],
      type: "Full-time",
      applyLink: "https://example.com/apply/3"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadRecommendations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    };

    loadRecommendations();
  }, [refreshKey]);

  const refreshRecommendations = () => {
    setRefreshKey(prev => prev + 1);
    toast.info("Refreshing recommendations...");
  };

  const getRecommendationReason = (index: number) => {
    const reasons = [
      "Based on your skills and experience",
      "High match with your profile",
      "Popular in your area",
      "Trending in tech industry",
      "Remote work opportunity"
    ];
    return reasons[index % reasons.length];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Job Recommendations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRecommendations}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Personalized job suggestions based on your profile and preferences
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {recommendations.map((job, index) => {
            const matchScore = 85 + Math.floor(Math.random() * 15); // Mock match score 85-100%
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div 
                  className="p-4 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onJobClick(job)}
                >
                  <div className="flex items-start gap-3">
                    {/* Company Logo */}
                    <Avatar className="w-10 h-10 border border-gray-200">
                      <AvatarImage src={job.logo} alt={job.company} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {job.company.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{job.posted}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs px-2 py-0 h-5">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Match Score and Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            <Target className="w-3 h-3" />
                            {matchScore}% match
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyJob(job);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Recommendation Reason */}
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>{getRecommendationReason(index)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* View All Button */}
        <motion.div 
          className="pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline" 
            className="w-full text-sm h-9 bg-white/50 hover:bg-white border-gray-200"
            onClick={() => toast.info("Feature coming soon!")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View All Recommendations
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}; 