import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined" | "filled" | "compact";
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  onClick,
  padding = "md",
  variant = "default"
}) => {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border-0 shadow-lg",
    outlined: "bg-transparent border-2 border-gray-300 shadow-none",
    filled: "bg-gray-50 border border-gray-200 shadow-sm",
    compact: "bg-white border border-gray-100 shadow-sm"
  };

  return (
    <Card
      className={cn(
        "rounded-xl transition-all duration-200 mobile-touch-target",
        variantClasses[variant],
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98] touch-manipulation",
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle || Icon) && (
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(paddingClasses[padding], title && "pt-0")}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileCard; 