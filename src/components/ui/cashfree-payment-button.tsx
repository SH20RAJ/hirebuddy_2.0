import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SignInPopup from '@/components/SignInPopup';

interface CashfreePaymentButtonProps {
  className?: string;
}

export const CashfreePaymentButton: React.FC<CashfreePaymentButtonProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsSignInPopupOpen(true);
    }
    // If user is signed in, the link will proceed normally
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
        <button className="w-full py-4 px-6 rounded-lg font-medium bg-gradient-to-t from-[#f9b6bc] to-[#fffcfd] text-[#8f5055] transition-colors duration-200">
          <span>Subscribe to Premium</span>
        </button>
      </a>
      
      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={() => setIsSignInPopupOpen(false)}
      />
    </div>
  );
}; 