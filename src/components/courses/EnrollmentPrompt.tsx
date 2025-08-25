import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import clsx from 'clsx';

interface EnrollmentPromptProps {
  courseId: string;
  courseTitle?: string;
  onEnroll?: () => void;
}

export const EnrollmentPrompt: React.FC<EnrollmentPromptProps> = ({ 
  courseId, 
  courseTitle,
  onEnroll 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('courses');
  const { theme } = useTheme();
  const bgClass = useRandomBackground();

  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll();
    } else {
      // Navigate to the course page without /progress
      navigate(`/courses/${courseId}`);
    }
  };

  const handleGoToCourses = () => {
    navigate('/courses');
  };

  return (
    <div className={clsx("min-h-screen flex items-center justify-center p-4 pt-16", bgClass)}>
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('enrollmentPrompt.courseLocked')}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            {courseTitle ? (
              <>
                {t('enrollmentPrompt.toAccessCourse')} <span className="font-semibold text-foreground">"{courseTitle}"</span>
              </>
            ) : (
              t('enrollmentPrompt.toAccessThisCourse')
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-muted/50 to-accent/20 rounded-lg p-6 border border-border/50">
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {t('enrollmentPrompt.whatYouGet')}
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{t('enrollmentPrompt.accessToLessons')}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{t('enrollmentPrompt.quizAccess')}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{t('enrollmentPrompt.progressTracking')}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{t('enrollmentPrompt.certificate')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleEnroll}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('enrollmentPrompt.enrollNow')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoToCourses}
              className="flex-1 py-3 text-lg"
            >
              {t('enrollmentPrompt.browseOtherCourses')}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('enrollmentPrompt.alreadyEnrolled')}{' '}
              <button 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="text-primary hover:underline font-medium"
              >
                {t('enrollmentPrompt.goToCoursePage')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
