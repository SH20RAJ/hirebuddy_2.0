import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  period: string;
  icon: ReactNode;
  color: "blue" | "green" | "amber" | "purple" | "indigo";
}

export const StatCard = ({ title, value, change, period, icon, color }: StatCardProps) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      text: "text-blue-700",
      changeText: "text-blue-600"
    },
    green: {
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-700",
      changeText: "text-green-600"
    },
    amber: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      text: "text-amber-700",
      changeText: "text-amber-600"
    },
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      text: "text-purple-700",
      changeText: "text-purple-600"
    },
    indigo: {
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      text: "text-indigo-700",
      changeText: "text-indigo-600"
    }
  };

  const styles = colorStyles[color];

  return (
    <Card className={cn("border-0 shadow-sm overflow-hidden", styles.bg)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className={cn("text-2xl font-bold mt-0.5", styles.text)}>{value}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", styles.iconBg)}>
            {icon}
          </div>
        </div>
        <div className={cn("mt-2 text-xs flex items-center gap-1", styles.changeText)}>
          <span>{change}</span>
          <span className="text-gray-500">{period}</span>
        </div>
      </CardContent>
    </Card>
  );
};