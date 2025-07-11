import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Building, ChevronRight } from "lucide-react";
import MobileCard from "./MobileCard";
import MobileButton from "./MobileButton";

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  experience_level?: string;
  created_at: string;
  is_remote?: boolean;
  skills?: string[];
}

interface MobileJobCardProps {
  job: Job;
  onClick?: () => void;
  onApply?: () => void;
  applied?: boolean;
  className?: string;
}

export const MobileJobCard: React.FC<MobileJobCardProps> = ({
  job,
  onClick,
  onApply,
  applied = false,
  className
}) => {
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

  const formatSalary = (salary?: string) => {
    if (!salary) return null;
    return salary.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  return (
    <MobileCard
      className={cn("mb-2", className)}
      variant="compact"
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mobile-body text-gray-900 line-clamp-2 leading-tight">
              {job.job_title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <p className="mobile-body-xs text-gray-600 truncate">{job.company_name}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 ml-1.5 flex-shrink-0" />
        </div>

        {/* Location and Time */}
        <div className="flex items-center gap-3 mobile-body-xs text-gray-600">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {job.is_remote && (
            <Badge variant="secondary" className="mobile-body-xs">
              Remote
            </Badge>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(job.created_at)}</span>
          </div>
        </div>

        {/* Salary and Type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {job.salary_range && (
            <div className="flex items-center gap-1 mobile-body-xs text-green-600 font-medium">
              <DollarSign className="w-3 h-3" />
              <span>{formatSalary(job.salary_range)}</span>
            </div>
          )}
          {job.job_type && (
            <Badge variant="outline" className="mobile-body-xs">
              {job.job_type}
            </Badge>
          )}
          {job.experience_level && (
            <Badge variant="outline" className="mobile-body-xs">
              {job.experience_level}
            </Badge>
          )}
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="mobile-body-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="mobile-body-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Apply Button */}
        {onApply && (
          <div className="pt-1.5">
            <MobileButton
              variant={applied ? "outline" : "primary"}
              size="full"
              onClick={() => onApply()}
              disabled={applied}
              className={`${!applied ? 'mobile-button-primary' : ''}`}
            >
              {applied ? "Applied" : "Apply Now"}
            </MobileButton>
          </div>
        )}
      </div>
    </MobileCard>
  );
};

export default MobileJobCard; 