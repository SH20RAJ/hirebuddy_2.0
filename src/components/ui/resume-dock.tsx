import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface DockProps {
  className?: string;
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
}

interface DockIconProps {
  size?: number;
  magnification?: number;
  distance?: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  isCompleted?: boolean;
  isDisabled?: boolean;
  tooltip?: string;
  badge?: string;
}

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

export function Dock({
  className,
  children,
  direction = "bottom",
  ...props
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      {...props}
      className={cn(
        "mx-auto flex h-16 items-end gap-4 rounded-2xl border bg-white/90 backdrop-blur-md px-4 pb-3",
        "shadow-xl border-white-200",
        {
          "items-start": direction === "top",
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
        },
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
          } as any);
        }
        return child;
      })}
    </motion.div>
  );
}

export function DockIcon({
  size = 40,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  onClick,
  isActive = false,
  isCompleted = false,
  isDisabled = false,
  tooltip,
  badge,
  ...props
}: DockIconProps & { mouseX?: any }) {
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40],
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const iconContent = (
    <motion.div
      ref={ref}
      style={{ width }}
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full relative",
        "transition-colors duration-300",
        {
          // Active state - black for active state
          "bg-black text-white shadow-lg": isActive && !className,
          // Completed state - dark gray for completed state
          "bg-gray-800 text-white": isCompleted && !isActive,
          // Default state - light gray for default state
          "bg-gray-100 hover:bg-gray-200 text-gray-700": !isActive && !isCompleted && !isDisabled,
          // Disabled state - very light gray for disabled state
          "bg-gray-50 text-gray-300 cursor-not-allowed opacity-50": isDisabled,
          "cursor-pointer": !isDisabled,
        },
        className,
      )}
      {...props}
    >
      {children}
      
      {/* Completion indicator */}
      {isCompleted && !isActive && (
        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-900" />
      )}
      
      {/* Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {badge}
        </div>
      )}
    </motion.div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip
          delayDuration={0} // Instant tooltip display
        >
          <TooltipTrigger asChild>
            {iconContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="mb-2 bg-black text-white border-0 font-medium">
            <p className="font-medium">{tooltip}</p>
            {isDisabled && <p className="text-xs text-gray-300">Section disabled</p>}
            {isCompleted && <p className="text-xs text-white">✓ Completed</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return iconContent;
}

// Resume-specific dock component
interface ResumeSectionDockProps {
  sections: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
  }>;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  completedSections: string[];
  enabledSections: Record<string, boolean>;
  className?: string;
}

export function ResumeSectionDock({
  sections,
  activeSection,
  onSectionChange,
  completedSections,
  enabledSections,
  className,
}: ResumeSectionDockProps) {
  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50", className)}>
      <Dock className="bg-white backdrop-blur-xl border-gray-100 shadow-xl">
        {sections.map((section) => {
          const IconComponent = section.icon;
          const isEnabled = enabledSections[section.id] ?? true;
          const isCompleted = completedSections.includes(section.id);
          const isActive = activeSection === section.id;
          
          const isDisabled = !isEnabled && section.id !== 'ai'; // Never disable AI section
          
          // Special styling for AI icon (Sparkles) - keep its color
          const isAiSection = section.id === 'ai';
          
          return (
            <DockIcon
              key={section.id}
              onClick={() => isEnabled && onSectionChange(section.id)}
              isActive={isActive}
              isCompleted={isCompleted}
              isDisabled={isDisabled}
              tooltip={section.label}
              badge={isDisabled ? "!" : undefined}
              className={isAiSection && isActive ? "bg-gradient-to-r from-pink-500 to-purple-600 !text-white" : ""}
            >
              <IconComponent 
                className={cn(
                  "w-5 h-5",
                  // Keep the AI icon colorful, all others black and white
                  isAiSection ? "text-purple-500" : ""
                )} 
              />
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
}