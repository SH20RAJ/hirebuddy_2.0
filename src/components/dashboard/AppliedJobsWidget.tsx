import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobApplicationService } from "@/services/jobApplicationService";
import { JobApplication } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Briefcase, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  ArrowUpRight,
  ArrowRight,
  Eye,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppliedJobsWidgetProps {
  limit?: number;
}

export const AppliedJobsWidget: React.FC<AppliedJobsWidgetProps> = ({ limit = 3 }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userApplications = await JobApplicationService.getUserApplications(user.id);
        setApplications(userApplications.slice(0, limit));
      } catch (err) {
        console.error('Error loading user applications:', err);
        setError('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [user, limit]);

  const getStatusConfig = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-400'
        };
      case 'reviewed':
        return {
          icon: <Eye className="h-3 w-3" />,
          text: 'Reviewed',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-400'
        };
      case 'shortlisted':
        return {
          icon: <TrendingUp className="h-3 w-3" />,
          text: 'Shortlisted',
          color: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-400'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-3 w-3" />,
          text: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-400'
        };
      case 'hired':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Hired',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-400'
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Pending',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-400'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getStatusStats = () => {
    const stats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: applications.length,
      pending: stats.pending || 0,
      reviewed: stats.reviewed || 0,
      shortlisted: stats.shortlisted || 0,
      rejected: stats.rejected || 0,
      hired: stats.hired || 0
    };
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
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
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

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Applied Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Applied Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Sign in to view your job applications</p>
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Applied Jobs
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                Find Jobs
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Start your job search journey by applying to positions that match your skills and interests.
            </p>
            <Button asChild>
              <Link to="/jobs" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Jobs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getStatusStats();

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Applied Jobs
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} application{stats.total !== 1 ? 's' : ''} • {stats.pending} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Manage
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.reviewed}</div>
            <div className="text-xs text-gray-500">Reviewed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.shortlisted}</div>
            <div className="text-xs text-gray-500">Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{stats.hired}</div>
            <div className="text-xs text-gray-500">Hired</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {applications.map((application, index) => {
            const statusConfig = getStatusConfig(application.status);
            
            return (
              <div
                key={application.id}
                className={cn(
                  "group relative p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer",
                  index !== applications.length - 1 && "border-b border-gray-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("w-2 h-2 rounded-full", statusConfig.dotColor)}></div>
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {application.job_title}
                      </h3>
                      <Badge variant="outline" className={cn("text-xs font-medium", statusConfig.color)}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.text}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>{application.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(application.created_at)}</span>
                      </div>
                      {application.job_type === 'exclusive' && (
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                          Exclusive
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {applications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Track your progress and follow up strategically
              </div>
              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Link to="/jobs" className="flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 