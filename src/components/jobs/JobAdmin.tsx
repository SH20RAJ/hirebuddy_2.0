import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useCreateJob } from "@/hooks/useJobs";
import { CreateJobData } from "@/types/job";
import { toast } from "sonner";

export const JobAdmin = () => {
  const [formData, setFormData] = useState<CreateJobData>({
    job_title: "",
    company_name: "",
    job_description: "",
    experience_required: "",
    apply_link: "",
    job_location: "",
    city: "",
    state: "",
    remote_flag: false,
    probably_remote: false,
  });

  const createJobMutation = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.job_title || !formData.company_name || !formData.job_description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createJobMutation.mutateAsync(formData);
      // Reset form
      setFormData({
        job_title: "",
        company_name: "",
        job_description: "",
        experience_required: "",
        apply_link: "",
        job_location: "",
        city: "",
        state: "",
        remote_flag: false,
        probably_remote: false,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const addSampleJobs = async () => {
    const sampleJobs: CreateJobData[] = [
      {
        job_title: "Senior Software Engineer",
        company_name: "TechCorp",
        job_description: "We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing scalable web applications, mentoring junior developers, and contributing to architectural decisions. The ideal candidate has 5+ years of experience with React, Node.js, and cloud technologies.",
        experience_required: "Senior Level (5+ years)",
        apply_link: "https://example.com/apply/senior-engineer",
        job_location: "San Francisco, CA",
        city: "San Francisco",
        state: "CA",
        remote_flag: false,
        probably_remote: true,
      },
      {
        job_title: "Frontend Developer - Remote",
        company_name: "StartupXYZ",
        job_description: "Join our fast-growing startup as a Frontend Developer! You'll work on cutting-edge user interfaces using React, TypeScript, and modern CSS frameworks. We offer flexible hours, competitive salary, and the opportunity to work with a passionate team building the future of fintech.",
        experience_required: "Mid Level (2-4 years)",
        apply_link: "https://example.com/apply/frontend-dev",
        job_location: "Remote",
        city: "",
        state: "",
        remote_flag: true,
        probably_remote: true,
      },
      {
        job_title: "Data Science Intern",
        company_name: "DataCorp",
        job_description: "Summer internship opportunity for aspiring data scientists. You'll work on real-world machine learning projects, analyze large datasets, and present findings to stakeholders. Perfect for students pursuing degrees in Computer Science, Statistics, or related fields.",
        experience_required: "Internship",
        apply_link: "https://example.com/apply/data-intern",
        job_location: "New York, NY",
        city: "New York",
        state: "NY",
        remote_flag: false,
        probably_remote: false,
      },
      {
        job_title: "Full Stack Developer",
        company_name: "InnovateLabs",
        job_description: "We're seeking a Full Stack Developer to build and maintain our web applications. You'll work with React, Node.js, PostgreSQL, and AWS. This role offers great learning opportunities and the chance to work on products used by thousands of users daily.",
        experience_required: "Entry Level (0-2 years)",
        apply_link: "https://example.com/apply/fullstack",
        job_location: "Austin, TX",
        city: "Austin",
        state: "TX",
        remote_flag: false,
        probably_remote: true,
      },
      {
        job_title: "DevOps Engineer - Hybrid",
        company_name: "CloudTech Solutions",
        job_description: "Looking for a DevOps Engineer to help scale our infrastructure. You'll work with Kubernetes, Docker, CI/CD pipelines, and cloud platforms. Hybrid work model with 2-3 days in office. Great benefits and collaborative team environment.",
        experience_required: "Mid Level (3-5 years)",
        apply_link: "https://example.com/apply/devops",
        job_location: "Seattle, WA",
        city: "Seattle",
        state: "WA",
        remote_flag: false,
        probably_remote: true,
      }
    ];

    try {
      for (const job of sampleJobs) {
        await createJobMutation.mutateAsync(job);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success("Sample jobs added successfully!");
    } catch (error) {
      toast.error("Failed to add some sample jobs");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Job Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <Button 
              onClick={addSampleJobs}
              disabled={createJobMutation.isPending}
              className="w-full"
              variant="outline"
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Sample Jobs...
                </>
              ) : (
                "Add 5 Sample Jobs"
              )}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="e.g. TechCorp"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job_description">Job Description *</Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={(e) => setFormData(prev => ({ ...prev, job_description: e.target.value }))}
                placeholder="Detailed job description..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_required">Experience Level</Label>
                <Select 
                  value={formData.experience_required || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experience_required: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="Mid Level (2-4 years)">Mid Level (2-4 years)</SelectItem>
                    <SelectItem value="Senior Level (5+ years)">Senior Level (5+ years)</SelectItem>
                    <SelectItem value="Lead/Principal (8+ years)">Lead/Principal (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apply_link">Application Link</Label>
                <Input
                  id="apply_link"
                  type="url"
                  value={formData.apply_link || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, apply_link: e.target.value }))}
                  placeholder="https://company.com/apply"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="job_location">Full Location</Label>
                <Input
                  id="job_location"
                  value={formData.job_location || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. San Francisco"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g. CA"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="remote_flag"
                  checked={formData.remote_flag || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remote_flag: checked }))}
                />
                <Label htmlFor="remote_flag">Fully Remote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="probably_remote"
                  checked={formData.probably_remote || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, probably_remote: checked }))}
                />
                <Label htmlFor="probably_remote">Remote Friendly</Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Job...
                </>
              ) : (
                "Create Job"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 