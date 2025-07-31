import React, { useState } from 'react';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SignInPopup from '@/components/SignInPopup';
import { cn } from '@/lib/utils';

interface CashfreePaymentButtonProps {
  className?: string;
  variant?: 'default' | 'sidebar';
}

export const CashfreePaymentButton: React.FC<CashfreePaymentButtonProps> = ({ 
  className = "", 
  variant = "default" 
}) => {
  const { user } = useAuth();
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsSignInPopupOpen(true);
    }
    // If user is signed in, the link will proceed normally
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'sidebar':
        return cn(
          "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-sm",
          "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
          "text-white shadow-lg hover:shadow-xl hover:scale-105",
          "border-2 border-yellow-400/50 hover:border-yellow-300",
          "flex items-center justify-center gap-2 group",
          "active:scale-95 transform-gpu"
        );
      default:
        return "w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-t from-[#f9b6bc] to-[#fffcfd] text-[#8f5055] transition-colors duration-200 text-sm";
    }
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'sidebar':
        return (
          <>
            <Crown className="h-4 w-4 group-hover:animate-bounce" />
            <span>Upgrade to Premium</span>
            <Sparkles className="h-3 w-3 opacity-75 group-hover:opacity-100" />
          </>
        );
      default:
        return <span>Subscribe to Premium</span>;
    }
  };

  return (
    <div className={className}>
      <a 
        href="https://payments.cashfree.com/forms/hirebuddy_premium_subscription" 
        target="_parent"
        className="block w-full"
        style={{ textDecoration: 'none' }}
        onClick={handleClick}
      >
        <button className={getButtonStyles()}>
          {getButtonContent()}
        </button>
      </a>
      
      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={() => setIsSignInPopupOpen(false)}
      />
    </div>
  );
}; 