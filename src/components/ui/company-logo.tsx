import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
  isLoading?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-xl'
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  logoUrl,
  size = 'md',
  className,
  showTooltip = true,
  isLoading: externalLoading = false
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Generate fallback logo if needed
  const generateFallbackLogo = (companyName: string): string => {
    const initials = getInitials(companyName);
    const colors = getConsistentColors(companyName);
    
    const svg = `
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" rx="8" fill="${colors.background}"/>
        <text x="30" y="40" font-family="system-ui, -apple-system, sans-serif" 
              font-size="24" font-weight="600" text-anchor="middle" 
              fill="${colors.text}">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const getConsistentColors = (companyName: string): { background: string; text: string } => {
    const colorPairs = [
      { background: '#3B82F6', text: '#FFFFFF' }, // Blue
      { background: '#10B981', text: '#FFFFFF' }, // Green
      { background: '#8B5CF6', text: '#FFFFFF' }, // Purple
      { background: '#F59E0B', text: '#FFFFFF' }, // Orange
      { background: '#EF4444', text: '#FFFFFF' }, // Red
      { background: '#06B6D4', text: '#FFFFFF' }, // Cyan
      { background: '#84CC16', text: '#FFFFFF' }, // Lime
      { background: '#EC4899', text: '#FFFFFF' }, // Pink
      { background: '#6366F1', text: '#FFFFFF' }, // Indigo
      { background: '#14B8A6', text: '#FFFFFF' }, // Teal
    ];

    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      const char = companyName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return colorPairs[Math.abs(hash) % colorPairs.length];
  };

  // If no logoUrl is provided, generate a fallback immediately
  const fallbackLogo = !logoUrl ? generateFallbackLogo(companyName) : logoUrl;

  const handleImageError = () => {
    console.log(`Image failed to load for ${companyName}, falling back to initials`);
    setImageError(true);
  };

  const getInitials = (name: string): string => {
    if (!name) return 'C';
    
    const cleaned = name
      .replace(/[^\w\s]/g, '')
      .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b/gi, '')
      .trim();
    
    const words = cleaned.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) {
      return name.charAt(0).toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  };

  // Check if logo is a data URL (SVG initials) or external image
  const isInitials = fallbackLogo?.startsWith('data:image/svg+xml');
  
  if (externalLoading) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-gray-200 animate-pulse flex items-center justify-center',
          className
        )}
      >
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
      </div>
    );
  }

  const avatarContent = (
    <Avatar className={cn(sizeClasses[size], 'border border-gray-200', className)}>
      {!isInitials && fallbackLogo && !imageError && (
        <AvatarImage
          src={fallbackLogo}
          alt={`${companyName} logo`}
          onError={handleImageError}
          className="object-contain p-1"
        />
      )}
      <AvatarFallback 
        className={cn(
          'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold',
          textSizeClasses[size]
        )}
      >
        {isInitials && fallbackLogo ? (
          // For SVG initials, render as image
          <img 
            src={fallbackLogo} 
            alt={`${companyName} initials`}
            className="w-full h-full object-contain"
          />
        ) : (
          getInitials(companyName)
        )}
      </AvatarFallback>
    </Avatar>
  );

  if (showTooltip) {
    return (
      <div title={companyName} className="cursor-help">
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
};

export default CompanyLogo; 