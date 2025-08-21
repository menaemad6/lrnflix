
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
  User,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface QuestionsLeftSidebarProps {
  stats: {
    total: number;
    filtered: number;
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
  loading?: boolean;
}

export const QuestionsLeftSidebar = ({ stats, topQuestions = [], topUsers = [], loading = false }: QuestionsLeftSidebarProps) => {
  const { t } = useTranslation('other');
  const navigate = useNavigate();
  
  const quickStats = [
    { label: t('questionsPage.totalQuestions'), value: stats.total, icon: MessageSquare, color: 'text-blue-500' },
    { label: t('questionsPage.filteredQuestions'), value: stats.filtered, icon: TrendingUp, color: 'text-purple-500' },
    { label: t('questionsPage.openQuestions'), value: stats.open, icon: TrendingUp, color: 'text-orange-500' },
    { label: t('questionsPage.resolvedQuestions'), value: stats.resolved, icon: Users, color: 'text-green-500' },
  ];

  const aiFeatures = [
    {
      title: t('questionsPage.smartQA'),
      description: t('questionsPage.smartQADescription'),
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      title: t('questionsPage.topicInsights'),
      description: t('questionsPage.topicInsightsDescription'),
      icon: Target,
      color: 'text-blue-500'
    },
    {
      title: t('questionsPage.studyBuddy'),
      description: t('questionsPage.studyBuddyDescription'),
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
            {t('questionsPage.quickStats')}
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
            {t('questionsPage.mostDiscussed')}
            {!loading && topQuestions.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs bg-yellow-500/10 text-yellow-600">
                {topQuestions.length} {t('questionsPage.questionCount')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg animate-pulse">
                <div className="h-5 w-8 bg-muted/40 rounded mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/40 rounded w-full"></div>
                  <div className="h-3 bg-muted/40 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : topQuestions.length > 0 ? (
            topQuestions.slice(0, 3).map((question, index) => (
              <div 
                key={question.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group"
                onClick={() => {
                  // Update URL hash directly
                  window.location.hash = `question-${question.id}`;
                  // Scroll to top to ensure modal is visible
                  window.scrollTo(0, 0);
                }}
                title={`Click to view: ${question.title}`}
              >
                <Badge variant="outline" className="mt-1 text-xs">
                  #{index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    {question.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {question.answer_count} {t('questionsPage.answerCount')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('questionsPage.noQuestionsYet')}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t('questionsPage.beFirstToAskQuestion')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {t('questionsPage.topContributors')}
            {!loading && topUsers.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs bg-blue-500/10 text-blue-600">
                {topUsers.length} {t('questionsPage.userCount')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
                <div className="h-5 w-8 bg-muted/40 rounded"></div>
                <div className="h-8 w-8 bg-muted/40 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/40 rounded w-24"></div>
                  <div className="h-3 bg-muted/40 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : topUsers.length > 0 ? (
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
                    {user.full_name || t('questionsPage.anonymousUser')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.question_count} {t('questionsPage.questions')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('questionsPage.noContributorsYet')}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t('questionsPage.startAskingToAppear')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t('questionsPage.aiFeatures')}
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
          <CardTitle className="text-lg">{t('questionsPage.proTips')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t('questionsPage.proTip1')}</p>
            <p>{t('questionsPage.proTip2')}</p>
            <p>{t('questionsPage.proTip3')}</p>
            <p>{t('questionsPage.proTip4')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
