import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "full";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = "left",
  className,
  style
}) => {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md [&]:text-white",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground [&:hover]:text-white",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md [&]:text-white"
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-base",
    full: "h-9 px-4 text-sm w-full"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={cn(
        "rounded-xl font-semibold transition-all duration-200 mobile-touch-target",
        "active:scale-[0.98] touch-manipulation",
        "focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!loading && Icon && iconPosition === "left" && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </Button>
  );
};

export default MobileButton; 