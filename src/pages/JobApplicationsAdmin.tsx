import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search,
  Filter,
  Eye,
  FileText,
  ExternalLink,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Github,
  Linkedin,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Building,
  Download
} from "lucide-react";
import { toast } from "sonner";

// Import our hooks and services
import { useAuth } from "@/contexts/AuthContext";
import { useAdminApplications, useUpdateApplicationStatus, useApplicationStats } from "@/hooks/useJobApplications";
import { getConfig } from "@/config/environment";
import { JobApplication } from "@/types/job";
import { NewSidebar } from "@/components/layout/NewSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { AdminDebugInfo } from "@/components/debug/AdminDebugInfo";

// Admin email configuration - you should add this to your environment variables
const ADMIN_EMAILS = [
  "subhayudas49@gmail.com",
  "sharmanishant9119@gmail.com"
];

const JobApplicationsAdmin = () => {
  const { user } = useAuth();
  
  // Check if user is admin - strict admin-only access
  const isAdmin = getConfig().isDevelopment || (user?.email && ADMIN_EMAILS.includes(user.email));
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Prepare filters for API - Admin gets ALL applications
  const filters = useMemo(() => ({
    status: statusFilter !== "all" ? statusFilter : undefined,
    companyName: companyFilter || undefined,
    limit: 100 // Increased limit for admin view
  }), [statusFilter, companyFilter]);

  // Fetch data - Only for admins, gets ALL applications from ALL users
  const { data: applicationsData, isLoading, error, refetch } = useAdminApplications(filters);
  const { data: stats, isLoading: statsLoading } = useApplicationStats();
  const updateStatusMutation = useUpdateApplicationStatus();

  const applications = applicationsData?.applications || [];
  const totalApplications = applicationsData?.total || 0;

  // Debug logging - Admin only
  console.log('Admin Applications Debug:', {
    isAdmin,
    userEmail: user?.email,
    applicationsData,
    applications: applications.length,
    totalApplications,
    error,
    isLoading,
    filters
  });

  // Filter applications by search query and only show exclusive jobs
  const filteredApplications = useMemo(() => {
    // First filter to only show exclusive job applications
    const exclusiveApplications = applications.filter(app => app.job_type === 'exclusive');
    
    // Then apply search query filter if provided
    if (!searchQuery) return exclusiveApplications;
    
    const query = searchQuery.toLowerCase();
    return exclusiveApplications.filter(app => 
      app.full_name?.toLowerCase().includes(query) ||
      app.user_email.toLowerCase().includes(query) ||
      app.job_title.toLowerCase().includes(query) ||
      app.company_name.toLowerCase().includes(query) ||
      app.title?.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  // Handle status update - Admin only
  const handleStatusUpdate = async (applicationId: string, newStatus: JobApplication['status']) => {
    if (!isAdmin) {
      toast.error("Unauthorized access");
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status: newStatus,
        adminNotes: adminNotes || undefined,
        reviewedBy: user?.id
      });
      
      setAdminNotes("");
      setShowApplicationDetails(false);
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'shortlisted': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <Star className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // If not admin, show access denied - NO access for regular users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 md:flex">
        <NewSidebar />
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </div>
              <p className="text-muted-foreground mb-4">
                This page is restricted to administrators only.
              </p>
              <p className="text-sm text-muted-foreground">
                Only authorized admin users can view job applications.
              </p>
              {getConfig().isDevelopment && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-700">
                    <strong>Dev Mode:</strong> Admin emails: {ADMIN_EMAILS.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 md:flex">
      <NewSidebar />
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden w-full">
        {/* Header */}
        <header className="hidden md:flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="flex items-center gap-2 px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Exclusive Job Applications Admin
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-6 gap-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.total || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.pending || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Reviewed</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.reviewed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Shortlisted</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.shortlisted || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.rejected || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hired</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : stats?.hired || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  Exclusive Jobs Only
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Showing applications for exclusive job postings only
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exclusive job applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by company..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          {/* Debug Info - Remove in production */}
          {getConfig().isDevelopment && (
            <div className="bg-white border-b border-gray-200 p-6">
              <AdminDebugInfo />
            </div>
          )}

          {/* Applications List */}
          <div className="flex-1 overflow-auto p-6">
            {error && (
              <Card className="p-6 mb-4 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold">Error Loading Applications</h3>
                    <p className="text-sm mt-1">{error.message || 'Failed to load job applications'}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Exclusive Job Applications Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || companyFilter
                    ? "Try adjusting your filters to see more exclusive job applications."
                    : "No exclusive job applications have been submitted yet."}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowApplicationDetails(true);
                            setAdminNotes(application.admin_notes || "");
                          }}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>
                                {application.full_name?.charAt(0)?.toUpperCase() || 
                                 application.user_email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg truncate">
                                  {application.full_name || "Unknown Applicant"}
                                </h3>
                                <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1">
                                  {getStatusIcon(application.status)}
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {application.user_email}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {application.title || "No title"}
                                </span>
                                {application.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {application.location}
                                  </span>
                                )}
                                {application.experience_years && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {application.experience_years} years exp.
                                  </span>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                                <p className="font-medium text-sm">Applied for:</p>
                                <p className="font-semibold">{application.job_title}</p>
                                <p className="text-sm text-muted-foreground">at {application.company_name}</p>
                              </div>
                              
                              {application.skills && application.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {application.skills.slice(0, 5).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {application.skills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{application.skills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </p>
                            {application.resume_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(application.resume_url, '_blank');
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Application Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-lg">
                          {selectedApplication.full_name?.charAt(0)?.toUpperCase() || 
                           selectedApplication.user_email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedApplication.full_name || "Unknown Applicant"}
                        </h3>
                        <p className="text-muted-foreground">{selectedApplication.title}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedApplication.user_email}</span>
                      </div>
                      
                      {selectedApplication.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.phone}</span>
                        </div>
                      )}
                      
                      {selectedApplication.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.location}</span>
                        </div>
                      )}
                      
                      {selectedApplication.college && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.college}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedApplication.experience_years || 0} years experience
                        </span>
                      </div>
                    </div>
                    
                    {/* Social Links */}
                    <div className="flex gap-2">
                      {selectedApplication.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {selectedApplication.github && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {selectedApplication.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Job Application</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{selectedApplication.job_title}</h4>
                      <p className="text-muted-foreground">at {selectedApplication.company_name}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedApplication.status)} className="flex items-center gap-1">
                          {getStatusIcon(selectedApplication.status)}
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Applied:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedApplication.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {selectedApplication.reviewed_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Reviewed:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(selectedApplication.reviewed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {selectedApplication.resume_url && (
                      <Button className="w-full" asChild>
                        <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          View Resume
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bio */}
              {selectedApplication.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedApplication.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Update Status:</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] as const).map((status) => (
                        <Button
                          key={status}
                          variant={selectedApplication.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedApplication.id, status)}
                          disabled={updatingStatus}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Admin Notes:</label>
                    <Textarea
                      placeholder="Add notes about this application..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {selectedApplication.admin_notes && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Previous Notes:</label>
                      <div className="bg-gray-50 rounded-md p-3 text-sm">
                        {selectedApplication.admin_notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobApplicationsAdmin; 