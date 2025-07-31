import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal } from "lucide-react";
import MobileButton from "./MobileButton";

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  filterCount?: number;
  className?: string;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onFilter,
  filterCount = 0,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 p-3 bg-white border-b border-gray-200", className)}>
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-8 pr-8 h-9 mobile-body rounded-lg border-2 border-gray-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "mobile-touch-target"
          )}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {onFilter && (
        <div className="relative">
          <MobileButton
            variant="outline"
            size="sm"
            onClick={onFilter}
            icon={SlidersHorizontal}
            className="h-9 w-9 p-0"
          >
            <span className="sr-only">Filter</span>
          </MobileButton>
          {filterCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center mobile-body-xs font-bold">
              {filterCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileSearchBar; 