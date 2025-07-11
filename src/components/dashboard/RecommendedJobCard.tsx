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
    <div className="p-4 hover:bg-pink-50/30 transition-colors border border-pink-100 rounded-lg mb-2">
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-10 w-10", logoColor)}>
          <AvatarFallback>{logo}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{company}</p>
            </div>
            <Badge className={cn("ml-2", getMatchScoreColor(matchScore))}>
              {matchScore}% match
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{location}</span>
            <span>•</span>
            <span>{salary}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {postedTime}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-pink-50 border-pink-200 text-primary/80">
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
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
              <BookmarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};