import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="md:hidden mobile-nav-sticky flex items-center justify-between h-12 px-3 mobile-safe-area shadow-sm">
      {/* Left side - Menu button and logo */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="mobile-touch-target-sm h-8 w-8 rounded-lg hover:bg-accent/80 active:scale-95 transition-all duration-200 touch-manipulation"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#b24e55] to-[#d35c65] flex items-center justify-center text-white font-bold shadow-md text-xs">
            H
          </div>
          <h1 className="font-bold mobile-body text-foreground hidden sm:block">Hirebuddy</h1>
        </div>
      </div>

      {/* Right side - User avatar */}
      <div className="flex items-center gap-1 pr-1">
        <Avatar className="h-7 w-7 ring-1 ring-primary/20 mobile-touch-target-sm">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="font-semibold mobile-body-xs bg-gradient-to-br from-[#b24e55] to-[#d35c65] text-white">{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default MobileHeader; 