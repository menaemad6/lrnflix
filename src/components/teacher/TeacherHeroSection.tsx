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
    <div className="glass-card p-8 border-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-blue-500/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center animate-pulse-glow shadow-2xl shadow-primary-500/25">
              <Brain className="h-10 w-10 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {t('dashboard.hero.welcomeBack')} <span className="gradient-text">{t('dashboard.hero.educator')}</span>
              </h1>
              <p className="text-muted-foreground text-lg">{t('dashboard.hero.readyToInspire')}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-primary-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-500/20 text-primary-400 border-primary-500/30 px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              {t('dashboard.hero.educatorBadge')}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Link to="/teacher/create-course">
            <Button variant='default'>
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              {t('dashboard.hero.createCourse')}
            </Button>
          </Link>
          <Link to="/teacher/analytics">
            <Button variant='outline'>
              <Target className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('dashboard.hero.viewAnalytics')}
            </Button>
          </Link>
          <Link to="/teacher/codes">
            <Button variant="outline" >
              <Gift className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              {t('dashboard.hero.generateCodes')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
