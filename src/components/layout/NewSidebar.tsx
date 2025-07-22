import React, { createContext, useContext, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { CashfreePaymentButton } from "@/components/ui/cashfree-payment-button";
import { usePremiumUser } from "@/hooks/usePremiumUser";
import MobileSidebar from "./MobileSidebar";
import MobileHeader from "./MobileHeader";
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Briefcase,
  Mail,
  TrendingUp,
  Calendar,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown
} from "lucide-react";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isCollapsed,
        setIsCollapsed,
        isMobile,
        isHovered,
        setIsHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Find Jobs", url: "/jobs", icon: Search },
  { title: "Resume Builder", url: "/resume-builder", icon: FileText },
  { title: "Email Outreach", url: "/email-outreach", icon: Mail },
  { title: "Profile", url: "/profile", icon: User },
];



interface SidebarLinkProps {
  item: NavItem;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <NavLink
      to={item.url}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      {item.badge && !isCollapsed && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full"
        >
          {item.badge}
        </motion.span>
      )}
      {isCollapsed && item.badge && (
        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {item.badge}
        </div>
      )}
    </NavLink>
  );
};

interface SidebarSectionProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, items, isCollapsed }) => {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {title}
          </motion.h3>
        )}
      </AnimatePresence>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarLink key={item.url} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>
    </div>
  );
};

const DesktopSidebar: React.FC = () => {
  const { isCollapsed, setIsCollapsed, isHovered, setIsHovered } = useSidebar();
  const { user, signOut } = useAuth();
  const { isPremium } = usePremiumUser();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Determine if sidebar should be expanded (either not collapsed or hovered)
  const isExpanded = !isCollapsed || isHovered;

  return (
    <motion.div
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Always show logo, but expand with text when not collapsed */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => navigate('/')}
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <h2 className="font-semibold text-lg whitespace-nowrap">Hirebuddy</h2>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Your Career Assistant</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Only show toggle button when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainItems.map((item) => (
          <SidebarLink key={item.url} item={item} isCollapsed={!isExpanded} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {/* When expanded - show full premium button above user info */}
        <AnimatePresence>
          {!isPremium && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-3"
            >
              <CashfreePaymentButton className="w-full" variant="sidebar" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info Section */}
        <div className="relative">
          {/* When collapsed - show premium button positioned right above user avatar */}
          <AnimatePresence>
            {!isPremium && !isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute -top-12 left-1 flex justify-center z-10 w-8"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open('https://payments.cashfree.com/forms/hirebuddy_premium_subscription', '_parent')}
                  className="h-6 w-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg hover:scale-110 border border-yellow-400/50 hover:border-yellow-300 rounded-md transition-all duration-200"
                  title="Upgrade to Premium"
                >
                  <Crown className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    {isPremium && <PremiumBadge variant="compact" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut?.()}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OldMobileSidebar: React.FC = () => {
  // This component is now deprecated in favor of the new MobileSidebar
  return null;
};

export const NewSidebar: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <DesktopSidebar />
      <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
    </SidebarProvider>
  );
};

export default NewSidebar; 