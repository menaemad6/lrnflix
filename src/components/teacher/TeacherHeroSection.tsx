import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Target, Gift, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TeacherHeroSectionProps {
  user: any;
}

export function TeacherHeroSection({ user }: TeacherHeroSectionProps) {
  const { t } = useTranslation('teacher');
  
  return (
    <div className="glass-card p-3 sm:p-6 lg:p-8 border-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-blue-500/10" />
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl sm:rounded-3xl flex items-center justify-center animate-pulse-glow shadow-xl sm:shadow-2xl shadow-primary-500/25">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                {t('dashboard.hero.welcomeBack')} <span className="gradient-text">{t('dashboard.hero.educator')}</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">{t('dashboard.hero.readyToInspire')}</p>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-primary-400">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge className="bg-primary-500/20 text-primary-400 border-primary-500/30 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
              <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              <span className="hidden sm:inline">{t('dashboard.hero.educatorBadge')}</span>
              <span className="sm:hidden">Edu</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Link to="/teacher/create-course" className="w-full sm:w-auto">
            <Button variant='default' className="w-full sm:w-auto text-sm sm:text-base">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:rotate-90 transition-transform" />
              {t('dashboard.hero.createCourse')}
            </Button>
          </Link>
          <Link to="/teacher/analytics" className="w-full sm:w-auto">
            <Button variant='outline' className="w-full sm:w-auto text-sm sm:text-base">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
              {t('dashboard.hero.viewAnalytics')}
            </Button>
          </Link>
          <Link to="/teacher/codes" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
              <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:rotate-12 transition-transform" />
              {t('dashboard.hero.generateCodes')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
