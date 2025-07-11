import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Filter,
  Send,
  TrendingUp,
  Target,
  Sparkles,
  Menu,
  Search,
  MapPin,
  Briefcase
} from "lucide-react";

interface QuickActionsProps {
  appliedJobsCount: number;
  activeFilterCount: number;
  onShowFilters: () => void;
  onShowApplied: () => void;
  onShowRecommendations: () => void;
}

export const QuickActions = ({
  appliedJobsCount,
  activeFilterCount,
  onShowFilters,
  onShowApplied,
  onShowRecommendations
}: QuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActionItems = [
    {
      icon: Filter,
      label: "Filters",
      count: activeFilterCount,
      color: "bg-blue-500",
      onClick: () => {
        onShowFilters();
        setIsOpen(false);
      }
    },
    {
      icon: Send,
      label: "Applied",
      count: appliedJobsCount,
      color: "bg-green-500",
      onClick: () => {
        onShowApplied();
        setIsOpen(false);
      }
    },
    {
      icon: Sparkles,
      label: "AI Recommendations",
      count: 0,
      color: "bg-orange-500",
      onClick: () => {
        onShowRecommendations();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </motion.div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Actions
            </SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {quickActionItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={item.onClick}
                className="relative"
              >
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.count > 0 && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Quick Search */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Quick Search
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {["Remote Jobs", "Senior Roles", "Startups", "Tech Companies"].map((term, index) => (
                <motion.div
                  key={term}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <Briefcase className="w-3 h-3 mr-2" />
                    {term}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular Locations */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Popular Locations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {["San Francisco", "New York", "Remote", "Austin"].map((location, index) => (
                <motion.div
                  key={location}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    {location}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}; 