import { Crown, Sparkles, Star } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  variant?: "default" | "compact" | "icon-only";
  showIcon?: boolean;
}

export const PremiumBadge = ({ 
  className, 
  variant = "default", 
  showIcon = true 
}: PremiumBadgeProps) => {
  const baseClasses = "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 border-yellow-300 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg";
  
  if (variant === "icon-only") {
    return (
      <div className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg",
        className
      )}>
        <Crown className="h-4 w-4 text-yellow-900" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Badge className={cn(baseClasses, "text-xs px-2 py-1 whitespace-nowrap", className)}>
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        Premium
      </Badge>
    );
  }

  return (
    <Badge className={cn(baseClasses, "text-sm px-3 py-1.5 font-semibold whitespace-nowrap", className)}>
      {showIcon && <Crown className="h-4 w-4 mr-2" />}
      Premium Member
      <Sparkles className="h-3 w-3 ml-2 animate-pulse" />
    </Badge>
  );
};

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PremiumCard = ({ children, className }: PremiumCardProps) => {
  return (
    <div className={cn(
      "relative bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-200 rounded-xl shadow-lg overflow-hidden",
      className
    )}>
      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 animate-pulse" />
      
      {/* Premium corner badge */}
      <div className="absolute top-2 right-2 z-10">
        <PremiumBadge variant="icon-only" />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const PremiumHeader = ({ title, subtitle, className }: PremiumHeaderProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 px-6 py-4 border-b border-yellow-300",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Crown className="h-5 w-5" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-yellow-800 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-700 fill-current" />
          <Star className="h-4 w-4 text-yellow-700 fill-current" />
          <Star className="h-4 w-4 text-yellow-700 fill-current" />
        </div>
      </div>
    </div>
  );
}; 