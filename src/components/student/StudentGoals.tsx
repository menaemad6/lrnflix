
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, CheckCircle2, Clock, Zap } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'courses' | 'quizzes' | 'streak' | 'credits';
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface StudentGoalsProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    studyStreak?: number;
    totalCreditsSpent: number;
  };
}

export const StudentGoals = ({ stats }: StudentGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete 5 Courses',
      description: 'Finish 5 courses by end of month',
      target: 5,
      current: stats.completedCourses,
      type: 'courses',
      deadline: 'End of Month',
      priority: 'high'
    },
    {
      id: '2',
      title: '30-Day Learning Streak',
      description: 'Study consistently for 30 days',
      target: 30,
      current: stats.studyStreak || 0,
      type: 'streak',
      deadline: 'Ongoing',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Invest 1000 Credits',
      description: 'Spend 1000 credits on learning resources',
      target: 1000,
      current: stats.totalCreditsSpent,
      type: 'credits',
      deadline: 'End of Quarter',
      priority: 'low'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'courses': return <Target className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      case 'credits': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isCompleted = (current: number, target: number) => {
    return current >= target;
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Target className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="gradient-text text-xl font-bold">Learning Goals</div>
            <CardDescription className="text-muted-foreground/80">Track and achieve your learning goals</CardDescription>
          </div>
          <Button size="sm" className="btn-secondary ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`group p-4 rounded-xl border transition-all duration-300 hover:border-primary-400/30 ${
                isCompleted(goal.current, goal.target)
                  ? 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/30 dark:bg-gradient-to-br dark:from-primary-500/10 dark:to-secondary-500/10'
                  : 'bg-white/80 border-gray-200 dark:bg-white/5 dark:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCompleted(goal.current, goal.target)
                      ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 dark:from-primary-500/20 dark:to-secondary-500/20'
                      : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20'
                  }`}>
                    {isCompleted(goal.current, goal.target) ? (
                      <CheckCircle2 className="h-4 w-4 text-primary-400" />
                    ) : (
                      getTypeIcon(goal.type)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${
                      isCompleted(goal.current, goal.target)
                        ? 'text-primary-500 dark:text-primary-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {goal.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>{goal.priority} priority</Badge>
                      <Badge className="text-xs bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {goal.deadline}
                      </Badge>
                    </div>
                  </div>
                </div>
                {isCompleted(goal.current, goal.target) && (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`font-medium ${
                    isCompleted(goal.current, goal.target)
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(goal.current, goal.target)}
                  className="h-2"
                />
                <div className="text-right">
                  <span className={`text-xs font-medium ${
                    isCompleted(goal.current, goal.target)
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}>
                    {Math.round(calculateProgress(goal.current, goal.target))}% Complete
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
