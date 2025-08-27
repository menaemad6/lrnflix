import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gift, BarChart3, Zap, BookOpen, MessageSquare, Calendar, Target, Rocket, Brain, Palette, Video, FileText, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function TeacherQuickActions() {
  const { t } = useTranslation('teacher');
  
  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl flex items-center justify-center">
            <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <CardTitle className="gradient-text text-lg sm:text-xl">{t('dashboard.quickActions.title')}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">{t('dashboard.quickActions.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <Link to="/teacher/create-course">
            <Button className="w-full btn-primary justify-start group hover-glow h-10 sm:h-12 text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold truncate">{t('dashboard.quickActions.createNewCourse')}</span>
              <Badge className="ml-auto bg-white/20 text-white text-xs px-2 py-1 flex-shrink-0">
                <Star className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{t('dashboard.quickActions.featured')}</span>
                <span className="sm:hidden">New</span>
              </Badge>
            </Button>
          </Link>
          
          <Link to="/teacher/lessons">
            <Button className="w-full btn-secondary justify-start group hover-glow h-10 sm:h-12 text-sm sm:text-base">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold truncate">{t('dashboard.quickActions.manageLessons')}</span>
              <Badge className="ml-auto bg-primary-500/20 text-primary-400 text-xs px-2 py-1 flex-shrink-0">
                <Target className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{t('dashboard.quickActions.active')}</span>
                <span className="sm:hidden">Active</span>
              </Badge>
            </Button>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <Link to="/teacher/groups">
            <Button className="w-full btn-secondary justify-start group hover-glow h-9 sm:h-10 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
              {t('dashboard.quickActions.groups')}
            </Button>
          </Link>
          
          <Link to="/teacher/discussions">
            <Button className="w-full btn-secondary justify-start group hover-glow h-9 sm:h-10 text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
              {t('dashboard.quickActions.discussions')}
            </Button>
          </Link>
          
          <Link to="/teacher/analytics">
            <Button className="w-full btn-secondary justify-start group hover-glow h-9 sm:h-10 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
              {t('dashboard.quickActions.analytics')}
            </Button>
          </Link>
          
          <Link to="/teacher/schedule">
            <Button className="w-full btn-secondary justify-start group hover-glow h-9 sm:h-10 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
              {t('dashboard.quickActions.schedule')}
            </Button>
          </Link>
        </div>

        {/* Tertiary Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link to="/teacher/codes">
            <Button variant="outline" className="w-full justify-start group hover-glow h-8 sm:h-9 text-xs">
              <Gift className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
              {t('dashboard.quickActions.codes')}
            </Button>
          </Link>
          
          <Link to="/teacher/quizzes">
            <Button variant="outline" className="w-full justify-start group hover-glow h-8 sm:h-9 text-xs">
              <Target className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform duration-300" />
              {t('dashboard.quickActions.quizzes')}
            </Button>
          </Link>
          
          <Link to="/teacher/settings" className="sm:col-span-1 col-span-2">
            <Button variant="outline" className="w-full justify-start group hover-glow h-8 sm:h-9 text-xs">
              <Settings className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
              {t('dashboard.quickActions.settings')}
            </Button>
          </Link>
        </div>

        {/* AI Features */}
        <div className="pt-2 border-t border-primary/20">
          <Button className="w-full btn-secondary justify-start group hover-glow h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30">
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium truncate">AI Course Builder</span>
            <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 flex-shrink-0">
              <Zap className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
