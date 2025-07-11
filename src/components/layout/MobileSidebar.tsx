import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Briefcase,
  Mail,
  Menu,
  X,
  LogOut,
  CreditCard,
  ChevronRight,
  Home
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const mobileNavItems: NavItem[] = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    description: "Overview & stats"
  },
  { 
    title: "Find Jobs", 
    url: "/jobs", 
    icon: Search,
    description: "Search opportunities"
  },
  { 
    title: "Resume Builder", 
    url: "/resume-builder", 
    icon: FileText,
    description: "Create & edit resume"
  },
  { 
    title: "Email Outreach", 
    url: "/email-outreach", 
    icon: Mail,
    description: "Connect with recruiters"
  },
  { 
    title: "Profile", 
    url: "/profile", 
    icon: User,
    description: "Manage your profile"
  },
  { 
    title: "Pricing", 
    url: "/pricing", 
    icon: CreditCard,
    description: "Upgrade your plan"
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MobileNavLinkProps {
  item: NavItem;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ item, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <NavLink
      to={item.url}
      onClick={onClick}
      className={cn(
        "mobile-nav-item flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative group mobile-touch-target",
        "active:scale-95 touch-manipulation",
        isActive
          ? "bg-gradient-to-r from-[#b24e55] to-[#d35c65] text-white shadow-lg"
          : "text-foreground hover:bg-accent/80 active:bg-accent"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-white/20" 
          : "bg-accent/50 group-hover:bg-accent/70"
      )}>
        <item.icon className={cn(
          "h-4 w-4 transition-all duration-200",
          isActive ? "text-white" : "text-foreground"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-semibold mobile-body leading-tight",
          isActive ? "text-white" : "text-foreground"
        )}>
          {item.title}
        </div>
        {item.description && (
          <div className={cn(
            "mobile-body-xs mt-0.5 leading-tight",
            isActive ? "text-white/80" : "text-muted-foreground"
          )}>
            {item.description}
          </div>
        )}
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all duration-200",
        isActive ? "text-white/80" : "text-muted-foreground"
      )} />
      {item.badge && (
        <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white mobile-body-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
          {item.badge}
        </div>
      )}
    </NavLink>
  );
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isOpen) {
        handleClose();
      }
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleNavClick = () => {
    handleClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut?.();
      handleClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.top = 'unset';
      document.body.style.left = 'unset';
      document.body.style.right = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.top = 'unset';
      document.body.style.left = 'unset';
      document.body.style.right = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={handleClose}
          />

          {/* Sidebar */}
          <motion.div
            {...swipeHandlers}
            initial={{ x: "-100%" }}
            animate={{ x: isClosing ? "-100%" : 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.3
            }}
            className="fixed left-0 top-0 h-full w-[85vw] max-w-sm bg-background border-r border-border z-50 md:hidden flex flex-col shadow-2xl overflow-hidden mobile-safe-area"
          >
            {/* Header */}
            <div className="mobile-app-header p-4 border-b border-border/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold mobile-body shadow-lg">
                    H
                  </div>
                  <div>
                    <h2 className="font-bold mobile-heading-sm text-white">Hirebuddy</h2>
                    <p className="mobile-body-xs text-white/80">Your Career Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="mobile-touch-target-sm h-8 w-8 rounded-lg hover:bg-white/20 active:scale-95 transition-all duration-200 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Avatar className="h-8 w-8 ring-1 ring-white/30">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="font-semibold mobile-body-xs bg-white/20 text-white">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mobile-body text-white truncate">{userName}</p>
                  <p className="mobile-body-xs text-white/80 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 mobile-scroll-container">
              <nav className="px-4 space-y-2">
                {mobileNavItems.map((item) => (
                  <MobileNavLink 
                    key={item.url} 
                    item={item} 
                    onClick={handleNavClick}
                  />
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-card/30">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="mobile-button w-full h-9 rounded-lg font-semibold mobile-body hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 transition-all duration-200 mobile-touch-target"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar; 