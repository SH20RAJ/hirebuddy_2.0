import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { BookmarkIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendedJobCardProps {
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  location: string;
  salary: string;
  postedTime: string;
  matchScore: number;
  skills: string[];
}

export const RecommendedJobCard = ({
  title,
  company,
  logo,
  logoColor,
  location,
  salary,
  postedTime,
  matchScore,
  skills
}: RecommendedJobCardProps) => {
  // Function to determine match score badge color
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-pink-100 text-primary border-pink-200";
    if (score >= 80) return "bg-pink-50 text-primary border-pink-100";
    return "bg-pink-50/50 text-primary/80 border-pink-100";
  };

  return (
    <div className="p-3 md:p-4 hover:bg-pink-50/30 transition-colors border border-pink-100 rounded-lg mb-2">
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-8 w-8 md:h-10 md:w-10", logoColor)}>
          <AvatarFallback className="text-xs md:text-sm">{logo}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{title}</h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">{company}</p>
            </div>
            <Badge className={cn("ml-2 flex-shrink-0 text-xs", getMatchScoreColor(matchScore))}>
              {matchScore}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 mt-1 text-xs text-gray-500 flex-wrap">
            <span className="truncate">{location}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">{salary}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {postedTime}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-pink-50 border-pink-200 text-primary/80">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs bg-pink-50 border-pink-200 text-primary/80">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs md:text-sm"
              asChild
            >
              <Link to={`/jobs/apply/${encodeURIComponent(title)}`}>
                Apply Now
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-2 border-pink-200 hover:bg-pink-50"
            >
              <BookmarkIcon className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};