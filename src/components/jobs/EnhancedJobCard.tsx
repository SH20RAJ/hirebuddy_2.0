import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Heart, 
  ExternalLink, 
  Building,
  Star,
  TrendingUp,
  Zap,
  Users,
  Calendar,
  Target,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
  featured: boolean;
  remote: boolean;
  urgent: boolean;
  requirements?: string[];
  benefits?: string[];
  teamSize?: number;
  companySize?: string;
  industry?: string;
  growth?: number;
}

interface EnhancedJobCardProps {
  job: Job;
  index: number;
  onLike: (jobId: number) => void;
  onJobClick: (jobId: number) => void;
  likedJobs: Set<number>;
}

export const EnhancedJobCard = ({ 
  job, 
  index, 
  onLike, 
  onJobClick, 
  likedJobs 
}: EnhancedJobCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [jobFitScore, setJobFitScore] = useState(0);
  const [skillMatches, setSkillMatches] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);

  // Calculate job fit score based on various factors
  useEffect(() => {
    const calculateJobFit = () => {
      let score = Math.floor(Math.random() * 30) + 70; // Base score 70-100
      
      // Adjust based on job characteristics
      if (job.remote) score += 5;
      if (job.featured) score += 3;
      if (job.tags.length > 3) score += 2;
      
      // Simulate skill matching
      const mockUserSkills = ["React", "TypeScript", "JavaScript", "Python", "Design", "Analytics"];
      const matches = job.tags.filter(tag => 
        mockUserSkills.some(skill => 
          skill.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      setSkillMatches(matches);
      setJobFitScore(Math.min(score + matches.length * 2, 98));
    };

    setAnimationDelay(index * 100);
    setTimeout(calculateJobFit, 500 + index * 100);
  }, [job, index]);

  const getFitColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 80) return "text-primary/90";
    if (score >= 70) return "text-primary/80";
    return "text-gray-600";
  };

  const getFitGradient = (score: number) => {
    if (score >= 90) return "from-pink-400 to-primary";
    if (score >= 80) return "from-pink-300 to-primary/90";
    if (score >= 70) return "from-pink-200 to-primary/80";
    return "from-gray-400 to-gray-600";
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: animationDelay / 1000,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: [0.25, 0.25, 0, 1] }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: [0.25, 0.25, 0, 1] }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <div className="relative h-full preserve-3d">
        <motion.div
          variants={flipVariants}
          animate={isFlipped ? "back" : "front"}
          className="w-full h-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Front of card */}
          <Card className={`
            group cursor-pointer transition-all duration-500 border-0 overflow-hidden relative
            ${isHovered ? 'shadow-2xl shadow-pink-500/20' : 'shadow-lg'} 
            ${job.featured ? 'ring-2 ring-pink-200 ring-opacity-60' : ''}
            backdrop-blur-sm bg-white/90
          `}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-white to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-pink-400/20 rounded-full"
                  animate={{
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`
                  }}
                />
              ))}
            </div>

            <CardContent className="p-6 relative z-10">
              {job.featured && (
                <motion.div 
                  className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-pink-400 via-primary to-pink-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                />
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4 flex-1">
                  {/* Company Logo with glow effect */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-primary rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    <img 
                      src={job.logo} 
                      alt={job.company}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg relative z-10"
                    />
                    {job.featured && (
                      <motion.div 
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-primary rounded-full flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, delay: 0.5 + index * 0.1 }}
                      >
                        <Star className="w-3 h-3 text-white fill-current" />
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-primary transition-all duration-300"
                          whileHover={{ x: 5 }}
                        >
                          {job.title}
                        </motion.h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 font-medium">{job.company}</span>
                          {job.urgent && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <Badge variant="destructive" className="text-xs flex items-center gap-1 animate-pulse bg-primary">
                                <Zap className="w-3 h-3" />
                                Urgent
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Target className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Job details with icons */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ x: 3, color: "#dc425d" }}
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                        {job.remote && (
                          <Badge variant="secondary" className="text-xs bg-pink-100 text-primary">
                            Remote
                          </Badge>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ x: 3, color: "#dc425d" }}
                      >
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ x: 3, color: "#dc425d" }}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{job.salary}</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ x: 3, color: "#dc425d" }}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{job.posted}</span>
                      </motion.div>
                    </div>

                    {/* Job description */}
                    <motion.p 
                      className="text-gray-600 mb-4 line-clamp-2"
                      animate={{ 
                        height: isHovered ? "auto" : "3rem" 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {job.description}
                    </motion.p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 4).map((tag, tagIndex) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 + tagIndex * 0.05 }}
                          whileHover={{ y: -3, scale: 1.05 }}
                        >
                          <Badge 
                            variant="outline" 
                            className={`
                              bg-gradient-to-r from-pink-50 to-pink-100 
                              text-primary border-pink-200 
                              hover:from-pink-100 hover:to-pink-200 
                              hover:border-pink-300 transition-all duration-200
                              ${skillMatches.includes(tag) ? 'ring-2 ring-pink-300 bg-pink-50 text-primary' : ''}
                            `}
                          >
                            {tag}
                            {skillMatches.includes(tag) && (
                              <Award className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        </motion.div>
                      ))}
                      {job.tags.length > 4 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{job.tags.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLike(job.id);
                            }}
                            className={`${
                              likedJobs.has(job.id) 
                                ? 'text-red-600 bg-red-50 shadow-md' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            } transition-all duration-200`}
                          >
                            <Heart className={`w-5 h-5 ${likedJobs.has(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{likedJobs.has(job.id) ? 'Unlike job' : 'Like job'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Action Bar */}
              <motion.div 
                className="flex items-center justify-between pt-4 border-t border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Match Score
                  </div>
                  <div className={`text-2xl font-bold ${getFitColor(jobFitScore)}`}>
                    {jobFitScore}%
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job.id);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Details
                    </Button>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back of card - Job Fit Details */}
        <motion.div
          variants={flipVariants}
          animate={isFlipped ? "front" : "back"}
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <Card className="h-full border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Job Fit Analysis
                </h3>
                <motion.button
                  onClick={() => setIsFlipped(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </motion.button>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-6">
                <motion.div 
                  className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getFitGradient(jobFitScore)} bg-clip-text text-transparent`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {jobFitScore}%
                </motion.div>
                <div className="text-gray-600 mb-4">Overall Match</div>
                <Progress 
                  value={jobFitScore} 
                  className="h-3 bg-gray-200"
                />
              </div>

              {/* Skill Matches */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Skill Matches ({skillMatches.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skillMatches.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        <Award className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Fit Categories */}
              <div className="space-y-4 flex-1">
                {[
                  { label: "Skills Match", value: Math.min(85 + skillMatches.length * 5, 98), icon: Code },
                  { label: "Experience Level", value: Math.floor(Math.random() * 20) + 75, icon: GraduationCap },
                  { label: "Location Preference", value: job.remote ? 95 : Math.floor(Math.random() * 30) + 60, icon: Globe },
                  { label: "Company Culture", value: Math.floor(Math.random() * 25) + 70, icon: Users }
                ].map((category, idx) => (
                  <motion.div
                    key={category.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={category.value} className="w-20 h-2" />
                      <span className={`text-sm font-semibold ${getFitColor(category.value)}`}>
                        {category.value}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobClick(job.id);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};