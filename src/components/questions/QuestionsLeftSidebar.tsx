
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Brain,
  Target,
  Zap,
  Trophy,
  User
} from 'lucide-react';

interface QuestionsLeftSidebarProps {
  stats: {
    total: number;
    open: number;
    resolved: number;
  };
  topQuestions?: Array<{
    id: string;
    title: string;
    answer_count: number;
  }>;
  topUsers?: Array<{
    id: string;
    full_name: string;
    avatar_url?: string;
    question_count: number;
  }>;
}

export const QuestionsLeftSidebar = ({ stats, topQuestions = [], topUsers = [] }: QuestionsLeftSidebarProps) => {
  const quickStats = [
    { label: 'Total Questions', value: stats.total, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Open', value: stats.open, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Resolved', value: stats.resolved, icon: Users, color: 'text-green-500' },
  ];

  const aiFeatures = [
    {
      title: 'Smart Q&A',
      description: 'AI analyzes questions for instant answers',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      title: 'Topic Insights',
      description: 'Discover trending discussion topics',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      title: 'Study Buddy',
      description: 'Get personalized learning suggestions',
      icon: Zap,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <Badge variant="secondary" className="font-mono bg-primary/10 text-primary">
                  {stat.value}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Most Discussed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topQuestions.length > 0 ? (
            topQuestions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                <Badge variant="outline" className="mt-1 text-xs">
                  #{index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    {question.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {question.answer_count} answers
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No questions yet. Be the first to ask!
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topUsers.length > 0 ? (
            topUsers.slice(0, 3).map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.question_count} questions
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contributors yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 Use clear, specific titles for better responses</p>
            <p>🤖 Try the AI Answer feature for instant help</p>
            <p>👥 Allow student answers to get diverse perspectives</p>
            <p>🎯 Use tags to categorize your questions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
