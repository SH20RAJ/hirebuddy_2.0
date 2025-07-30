import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskStatus = 'upcoming' | 'completed' | 'overdue';

interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  status: TaskStatus;
  type: 'interview' | 'followup' | 'task';
}

interface TaskWidgetProps {
  tasks: Task[];
  title?: string;
  description?: string;
  showAddButton?: boolean;
  maxItems?: number;
}

export const TaskWidget: React.FC<TaskWidgetProps> = ({
  tasks,
  title = "Upcoming Tasks",
  description = "Your schedule for the next few days",
  showAddButton = true,
  maxItems = 3
}) => {
  const displayTasks = tasks.slice(0, maxItems);

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-purple-100 border-purple-200';
      case 'followup':
        return 'bg-amber-100 border-amber-200';
      case 'task':
        return 'bg-gray-100 border-gray-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'interview':
        return 'Interview';
      case 'followup':
        return 'Follow-up';
      case 'task':
        return 'Task';
      default:
        return 'Task';
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showAddButton && (
          <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
            <Link href="/dashboard">
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {displayTasks.length > 0 ? (
          <div className="divide-y">
            {displayTasks.map((task) => (
              <div key={task.id} className="p-3 hover:bg-gray-50">
                <div className="flex gap-3">
                  <div className={cn(
                    "w-1.5 self-stretch rounded-full",
                    task.status === 'upcoming' && "bg-blue-500",
                    task.status === 'completed' && "bg-green-500",
                    task.status === 'overdue' && "bg-red-500"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <Badge variant="outline" className={cn("text-xs", getTypeStyles(task.type))}>
                        {getTypeLabel(task.type)}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.date}
                      </div>
                      {task.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>No upcoming tasks</p>
            <Button variant="link" size="sm" asChild>
              <Link href="/dashboard">Add a task</Link>
            </Button>
          </div>
        )}

        {tasks.length > maxItems && (
          <div className="p-3 bg-gray-50 border-t text-center">
            <Button variant="link" size="sm" asChild>
              <Link href="/calendar">
                View all {tasks.length} tasks
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};