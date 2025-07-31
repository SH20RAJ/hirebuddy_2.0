
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface JobSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const JobSearch = ({ searchQuery, setSearchQuery }: JobSearchProps) => {
  const [location, setLocation] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Mock suggestions based on input
  useEffect(() => {
    if (searchQuery.length > 1) {
      const mockSuggestions = [
        `${searchQuery} Developer`,
        `Senior ${searchQuery} Engineer`,
        `${searchQuery} Designer`,
        `${searchQuery} Manager`,
        `${searchQuery} Specialist`
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery, "in", location);
    setShowSuggestions(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };
  
  const handleFocus = () => {
    setIsExpanded(true);
    if (searchQuery.length > 1) {
      setShowSuggestions(true);
    }
  };
  
  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 ${isExpanded ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <motion.div 
              initial={{ scale: 1 }}
              animate={{ scale: isExpanded ? 1.03 : 1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white transition-colors shadow-sm focus:shadow-md"
              />
              
              {/* Animated suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Suggestions</span>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <motion.div 
                          key={suggestion}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer rounded-md transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4 text-blue-500" />
                          <span>{suggestion}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Button 
                onClick={handleSearch}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Jobs
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {["Remote", "Full-time", "Part-time", "Contract", "Internship"].map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                variant="outline"
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer"
              >
                {tag}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
