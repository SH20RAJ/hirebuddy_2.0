
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    action: "AI Auto-Applied to Senior Frontend Developer at TechFlow Inc",
    time: "2 hours ago",
    icon: "🤖"
  },
  {
    action: "Resume viewed by DataCorp recruiter",
    time: "4 hours ago",
    icon: "👀"
  },
  {
    action: "Interview scheduled with StartupXYZ",
    time: "1 day ago",
    icon: "📅"
  },
  {
    action: "AI updated your skills based on recent projects",
    time: "2 days ago",
    icon: "⚡"
  },
  {
    action: "New job matches found (5 high-match positions)",
    time: "3 days ago",
    icon: "🎯"
  }
];

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
