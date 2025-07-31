import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileText, 
  Mail, 
  User, 
  Calendar,
  Briefcase,
  Upload,
  MessageSquare,
  Target,
  Settings,
  PlusCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  to: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  external?: boolean;
}

export const QuickActionsWidget: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: 'browse_jobs',
      title: 'Browse Jobs',
      description: 'Find new opportunities',
      icon: Search,
      to: '/jobs',
      color: 'blue'
    },
    {
      id: 'update_resume',
      title: 'Update Resume',
      description: 'Enhance your resume',
      icon: FileText,
      to: '/resume-builder',
      color: 'green'
    },
    {
      id: 'send_emails',
      title: 'Email Outreach',
      description: 'Connect with recruiters',
      icon: Mail,
      to: '/email-outreach',
      color: 'purple'
    },
    {
      id: 'update_profile',
      title: 'Update Profile',
      description: 'Complete your profile',
      icon: User,
      to: '/profile',
      color: 'orange'
    },
    {
      id: 'schedule_interview',
      title: 'Schedule Interview',
      description: 'Book interview slots',
      icon: Calendar,
      to: '/interviews',
      color: 'red'
    },
    {
      id: 'track_applications',
      title: 'Track Applications',
      description: 'Monitor your progress',
      icon: Target,
      to: '/jobs?tab=applied',
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: QuickAction['color']) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-900',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-900',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      orange: {
        bg: 'bg-orange-50 hover:bg-orange-100',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-900',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      red: {
        bg: 'bg-red-50 hover:bg-red-100',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-900',
        button: 'bg-red-600 hover:bg-red-700'
      },
      yellow: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        text: 'text-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      }
    };
    return colorMap[color];
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-blue-600" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Common tasks to boost your job search
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);
            
            const ActionCard = (
              <div
                className={cn(
                  "group p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer",
                  colors.bg,
                  colors.border
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                  </div>
                  {action.external && (
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
                
                <div className="mb-3">
                  <h3 className={cn("font-semibold mb-1", colors.text)}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
                
                <Button 
                  size="sm" 
                  className={cn("w-full text-white", colors.button)}
                >
                  Get Started
                </Button>
              </div>
            );

            return action.external ? (
              <a
                key={action.id}
                href={action.to}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {ActionCard}
              </a>
            ) : (
              <Link key={action.id} to={action.to} className="block">
                {ActionCard}
              </Link>
            );
          })}
        </div>
        
        {/* Additional Quick Links */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">More Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="justify-start">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="justify-start">
              <Link to="/email-outreach" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 