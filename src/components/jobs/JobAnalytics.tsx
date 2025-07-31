import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  Clock,
  XCircle,
  Send,
  Eye,
  Calendar,
  Award,
  Users,
  MapPin,
  Briefcase
} from "lucide-react";

interface JobAnalyticsProps {
  jobsViewed: number;
}

export const JobAnalytics = ({ jobsViewed }: JobAnalyticsProps) => {
  // Mock analytics data - in a real app, this would come from user's actual data
  const profileStats = {
    profileViews: 127,
    resumeScore: 85,
    connections: 23,
    emailsSent: 45,
    responses: 12
  };

  const searchStats = {
    totalSearches: 47,
    avgSearchesPerDay: 3.2,
    topKeywords: ["React", "Frontend", "JavaScript", "Remote", "Senior"],
    responseRate: 12.5
  };

  const getResponseRate = () => {
    if (profileStats.emailsSent === 0) return 0;
    return Math.round((profileStats.responses / profileStats.emailsSent) * 100);
  };

  const getTopCompanies = () => [
    { name: "Google", views: 8, saved: 3 },
    { name: "Microsoft", views: 6, saved: 2 },
    { name: "Meta", views: 5, saved: 1 },
    { name: "Apple", views: 4, saved: 2 },
    { name: "Amazon", views: 7, saved: 3 }
  ];

  const getSearchTrend = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map(month => ({
      month,
      searches: Math.floor(Math.random() * 20) + 10,
      jobsViewed: Math.floor(Math.random() * 50) + 20
    }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Profile Views</p>
                  <p className="text-2xl font-bold text-blue-900">{profileStats.profileViews}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Response Rate</p>
                  <p className="text-2xl font-bold text-green-900">{getResponseRate()}%</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Emails Sent</p>
                  <p className="text-2xl font-bold text-purple-900">{profileStats.emailsSent}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Resume Score</p>
                  <p className="text-2xl font-bold text-orange-900">{profileStats.resumeScore}%</p>
                </div>
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Analytics</TabsTrigger>
          <TabsTrigger value="search">Search Activity</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Profile Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Profile Views</span>
                    <span className="text-sm font-medium">{profileStats.profileViews}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Resume Score</span>
                    <span className="text-sm font-medium">{profileStats.resumeScore}%</span>
                  </div>
                  <Progress value={profileStats.resumeScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email Responses</span>
                    <span className="text-sm font-medium">{profileStats.responses}</span>
                  </div>
                  <Progress value={(profileStats.responses / profileStats.emailsSent) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Connections</span>
                    <span className="text-sm font-medium">{profileStats.connections}</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Search Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Search Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getSearchTrend().slice(-4).map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{data.month}</p>
                        <p className="text-sm text-gray-600">{data.searches} searches</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">{data.jobsViewed}</p>
                        <p className="text-sm text-gray-600">jobs viewed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Search Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Searches</span>
                  <span className="text-sm font-medium">{searchStats.totalSearches}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Daily Average</span>
                  <span className="text-sm font-medium">{searchStats.avgSearchesPerDay}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Response Rate</span>
                  <span className="text-sm font-medium">{searchStats.responseRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Search Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchStats.topKeywords.map((keyword, index) => (
                    <div key={keyword} className="flex items-center justify-between">
                      <Badge variant="outline" className="text-sm">
                        {keyword}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Progress value={85 - index * 10} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">{85 - index * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Company Interest Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopCompanies().map((company, index) => (
                  <div key={company.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-gray-600">{company.views} jobs viewed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{company.saved} saved</p>
                      <p className="text-sm text-gray-600">
                        {Math.round((company.saved / company.views) * 100)}% save rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 