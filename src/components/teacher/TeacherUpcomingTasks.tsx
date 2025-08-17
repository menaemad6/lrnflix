import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle, BookOpen, Users, Target, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  courseId?: string;
  courseName?: string;
  metadata?: {
    studentCount?: number;
    lessonCount?: number;
    rating?: number;
  };
}

interface TeacherUpcomingTasksProps {
  tasks: Task[];
}

export function TeacherUpcomingTasks({ tasks }: TeacherUpcomingTasksProps) {
  const navigate = useNavigate();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDueDateColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-400';
    if (diffDays <= 1) return 'text-orange-400';
    if (diffDays <= 3) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const aCompleted = a.status === 'completed';
    const bCompleted = b.status === 'completed';
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const incompleteTasks = sortedTasks.filter(task => task.status !== 'completed');
  const completedTasks = sortedTasks.filter(task => task.status === 'completed');

  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="gradient-text text-xl">Upcoming Tasks</CardTitle>
              <p className="text-muted-foreground text-sm">Manage your teaching schedule</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="btn-secondary" onClick={() => navigate('/teacher/schedule')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Incomplete Tasks */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({incompleteTasks.length})
          </h3>
          
          {incompleteTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
              <p className="text-muted-foreground text-sm">All caught up! No pending tasks.</p>
            </div>
          ) : (
            incompleteTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:bg-white/5">
                <div className="flex items-start gap-3">
                  {/* Task Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                    <div className="text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {task.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                    
                    {/* Course Info */}
                    {task.courseName && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <BookOpen className="h-3 w-3" />
                        <span className="truncate">{task.courseName}</span>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    {task.metadata && (
                      <div className="flex items-center gap-3 text-xs">
                        {task.metadata.studentCount && (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Users className="h-3 w-3" />
                            <span>{task.metadata.studentCount}</span>
                          </div>
                        )}
                        {task.metadata.lessonCount && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Target className="h-3 w-3" />
                            <span>{task.metadata.lessonCount}</span>
                          </div>
                        )}
                        {task.metadata.rating && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-3 w-3" />
                            <span>{task.metadata.rating}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Due Date */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-xs font-medium ${getDueDateColor(task.due_date)}`}>
                      {formatDueDate(task.due_date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-primary/20">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Completed ({completedTasks.length})
            </h3>
            
            {completedTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 opacity-75">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground line-through line-clamp-1">
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Completed {formatDueDate(task.due_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Tasks */}
        {tasks.length > 8 && (
          <div className="pt-3 border-t border-primary/20">
            <Button variant="outline" className="w-full btn-secondary">
              View All {tasks.length} Tasks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
