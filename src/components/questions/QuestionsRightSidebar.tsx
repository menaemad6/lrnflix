
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Users, 
  Clock,
  Zap,
  TrendingUp,
  Award,
  Target,
  Rocket,
  Star,
  Activity
} from 'lucide-react';

interface QuestionsRightSidebarProps {
  recentActivity?: Array<{
    action: string;
    time: string;
    user: string;
  }>;
}

export const QuestionsRightSidebar = ({ recentActivity = [] }: QuestionsRightSidebarProps) => {
  const aiFeatures = [
    {
      title: 'Smart Suggestions',
      description: 'Get AI-powered question suggestions',
      icon: Brain,
      color: 'text-purple-500',
      available: true
    },
    {
      title: 'Auto-Categorization',
      description: 'Questions are automatically categorized',
      icon: BookOpen,
      color: 'text-blue-500',
      available: true
    },
    {
      title: 'Answer Quality Score',
      description: 'AI evaluates answer helpfulness',
      icon: Zap,
      color: 'text-yellow-500',
      available: false
    },
    {
      title: 'Learning Path',
      description: 'Personalized study recommendations',
      icon: Target,
      color: 'text-green-500',
      available: false
    }
  ];

  const studyInsights = [
    {
      title: 'Most Active Time',
      value: '2-4 PM',
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      title: 'Popular Topics',
      value: 'Mathematics, Physics',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Success Rate',
      value: '87%',
      icon: Award,
      color: 'text-yellow-500'
    }
  ];

  const defaultActivity = [
    { action: 'New question posted', time: '2 min ago', user: 'Anonymous' },
    { action: 'Question resolved', time: '5 min ago', user: 'John Doe' },
    { action: 'AI answer generated', time: '8 min ago', user: 'System' },
    { action: 'Student joined discussion', time: '12 min ago', user: 'Jane Smith' },
    { action: 'Answer marked as helpful', time: '15 min ago', user: 'Alex Brown' },
  ];

  const activityToShow = recentActivity.length > 0 ? recentActivity : defaultActivity;

  return (
    <div className="space-y-4">
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
              <div key={feature.title} className="space-y-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.title}</span>
                  {feature.available ? (
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
                      Coming Soon
                    </Badge>
                  )}
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Study Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {studyInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.title} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${insight.color}`} />
                  <span className="text-sm text-muted-foreground">{insight.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {insight.value}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activityToShow.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <div className="text-sm">{activity.action}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{activity.user}</span>
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-left">
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Study Tips
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-left">
            <Star className="h-4 w-4 mr-2" />
            Rate Questions
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-left">
            <Users className="h-4 w-4 mr-2" />
            Find Study Groups
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
