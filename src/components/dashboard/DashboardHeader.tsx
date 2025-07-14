import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  ChevronRight, 
  FileText, 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  User,
  Crown,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { usePremiumUser } from "@/hooks/usePremiumUser";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface DashboardHeaderProps {
  userName: string;
  isNewSession?: boolean;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function DashboardHeader({ userName, isNewSession = false }: DashboardHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(false);
  const { isPremium, premiumData, loading: premiumLoading } = usePremiumUser();
  
  useEffect(() => {
    // Check if this is a new session (user just logged in)
    const isNewLogin = sessionStorage.getItem('newLogin');
    
    if (isNewLogin === 'true') {
      setShowWelcome(true);
      // Show welcome toast
      toast({
        title: 'Welcome to Hirebuddy!',
        description: 'Your account has been accessed successfully.',
      });
      // Remove the flag so toast doesn't show again on page refresh
      sessionStorage.removeItem('newLogin');
    }
  }, [toast]);

  return (
    <div className="pb-8">
      {/* Welcome Section */}
      <div className={`mb-8 p-6 rounded-xl border ${
        isPremium 
          ? "bg-white border-gray-200" 
          : "bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Good {timeOfDay}, {userName}!</h1>
              {isPremium && !premiumLoading && (
                <PremiumBadge variant="compact"  />
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isPremium 
                ? "Welcome back to your premium dashboard experience!" 
                : "Here's what's happening with your job search today."
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className={`bg-white/80 ${
              isPremium 
                ? "border-gray-200 hover:bg-gray-100 hover:text-primary" 
                : "border-pink-200 hover:bg-pink-100 hover:text-primary"
            }`}>
              <Link to="/resume-builder">
                <FileText className="mr-2 h-4 w-4" />
                {isPremium ? "AI Resume Builder" : "Update Resume"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className={`bg-white/80 ${
              isPremium 
                ? "border-gray-200 hover:bg-gray-100 hover:text-primary" 
                : "border-pink-200 hover:bg-pink-100 hover:text-primary"
            }`}>
              <Link to="/jobs">
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                {isPremium ? "Premium Jobs" : "Find Jobs"}
              </Link>
            </Button>
            <Button asChild size="sm" className={`${
              isPremium 
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" 
                : "bg-primary hover:bg-primary/90"
            }`}>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                {isPremium ? "Premium Profile" : "Complete Profile"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`mt-4 flex items-center gap-2 text-sm bg-white/60 p-3 rounded-lg border ${
          isPremium ? "border-gray-200" : "border-pink-200"
        }`}>
          {isPremium ? (
            <Crown className="h-4 w-4 text-gray-600" />
          ) : (
            <Lightbulb className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">
            {isPremium ? "Premium Tip:" : "Pro Tip:"}
          </span>
          <span className="text-muted-foreground">
            {isPremium 
              ? "Your premium account gives you access to exclusive job opportunities and AI-powered insights." 
              : "Update your skills section to match job descriptions for better results."
            }
          </span>
          {isPremium ? (
            <Star className="h-4 w-4 text-gray-600 ml-auto fill-current" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary ml-auto" />
          )}
        </div>
      </div>

      {/* Dashboard Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          {isPremium && !premiumLoading && (
            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Premium Access</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}