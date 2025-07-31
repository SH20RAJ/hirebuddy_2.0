
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Applications Sent",
    value: "27",
    change: "+5 this week",
    color: "text-primary"
  },
  {
    title: "Interview Invites",
    value: "4",
    change: "+2 this week",
    color: "text-primary"
  },
  {
    title: "AI Match Score",
    value: "94%",
    change: "+3% improved",
    color: "text-primary"
  },
  {
    title: "Profile Views",
    value: "156",
    change: "+23 this week",
    color: "text-primary"
  }
];

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow border-pink-100">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-pink-50 to-pink-100">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
