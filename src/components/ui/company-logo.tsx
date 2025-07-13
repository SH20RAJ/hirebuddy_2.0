import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompanyLogoService } from '@/services/companyLogoService';
import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  companyName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
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
  size = 'md',
  className,
  showTooltip = true
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isInitials, setIsInitials] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadLogo = async () => {
      if (!companyName) {
        setIsLoading(false);
        setError(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(false);
        
        const logoResult = await CompanyLogoService.getCompanyLogo(companyName);
        setLogoUrl(logoResult.url);
        setIsInitials(logoResult.isInitials);
      } catch (err) {
        console.warn('Failed to load company logo:', err);
        setError(true);
        // Generate fallback initials logo
        const fallback = await CompanyLogoService.getCompanyLogo(companyName);
        setLogoUrl(fallback.url);
        setIsInitials(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogo();
  }, [companyName]);

  const handleImageError = () => {
    if (!error) {
      console.log(`Image failed to load for ${companyName}, falling back to initials`);
      setError(true);
      setIsInitials(true);
      // Don't try to fetch again, just use initials
      setLogoUrl('');
    }
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

  if (isLoading) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-gray-200 animate-pulse',
          className
        )}
      />
    );
  }

  const avatarContent = (
    <Avatar className={cn(sizeClasses[size], 'border border-gray-200', className)}>
      {!isInitials && logoUrl && !error && (
        <AvatarImage
          src={logoUrl}
          alt={`${companyName} logo`}
          onError={handleImageError}
          className="object-contain p-1" // Changed to object-contain with padding for better fit
        />
      )}
      <AvatarFallback 
        className={cn(
          'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold',
          textSizeClasses[size]
        )}
      >
        {isInitials && logoUrl && logoUrl.startsWith('data:image/svg+xml') ? (
          // For SVG initials, render as image
          <img 
            src={logoUrl} 
            alt={`${companyName} initials`}
            className="w-full h-full object-contain"
            onError={() => setLogoUrl('')}
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