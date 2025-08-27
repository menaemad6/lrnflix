import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Zap, BookOpen, Brain, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface ActivityItem {
  id: string;
  type: 'lesson' | 'quiz' | 'course' | 'achievement';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
  date: Date;
}

interface StudentActivityProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    studyStreak?: number;
  };
}

export const StudentActivity = ({ stats }: StudentActivityProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch recent lessons completed
        const { data: lessonProgress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed_at, lessons(title, course_id)')
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5);
        // Fetch recent quiz attempts
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('quiz_id, started_at, score, quizzes(title, course_id)')
          .eq('student_id', user.id)
          .order('started_at', { ascending: false })
          .limit(5);
        // Fetch recent enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id, enrolled_at, course:courses(title, category)')
          .eq('student_id', user.id)
          .order('enrolled_at', { ascending: false })
          .limit(5);
        // Build activity list
        let activityList: ActivityItem[] = [];
        if (lessonProgress) {
          activityList = activityList.concat(
            lessonProgress.map((lp: any) => ({
              id: `lesson-${lp.lesson_id}-${lp.completed_at}`,
              type: 'lesson',
              title: t('studentActivity.completedLesson', { lessonName: lp.lessons?.title || t('studentActivity.lesson') }),
              subtitle: lp.lessons?.course_id ? t('studentActivity.courseId', { id: lp.lessons.course_id }) : undefined,
              timestamp: lp.completed_at ? new Date(lp.completed_at).toLocaleString() : '',
              icon: <BookOpen className="h-4 w-4" />,
              color: 'text-blue-400',
              date: lp.completed_at ? new Date(lp.completed_at) : new Date(0),
            }))
          );
        }
        if (quizAttempts) {
          activityList = activityList.concat(
            quizAttempts.map((qa: any) => ({
              id: `quiz-${qa.quiz_id}-${qa.started_at}`,
              type: 'quiz',
              title: t('studentActivity.scoredOnQuiz', { score: Math.round((qa.score || 0) * 100), quizName: qa.quizzes?.title || t('studentActivity.quiz') }),
              subtitle: qa.quizzes?.course_id ? t('studentActivity.courseId', { id: qa.quizzes.course_id }) : undefined,
              timestamp: qa.started_at ? new Date(qa.started_at).toLocaleString() : '',
              icon: <Brain className="h-4 w-4" />,
              color: 'text-green-400',
              date: qa.started_at ? new Date(qa.started_at) : new Date(0),
            }))
          );
        }
        if (enrollments) {
          activityList = activityList.concat(
            enrollments.map((en: any) => ({
              id: `enroll-${en.id}-${en.enrolled_at}`,
              type: 'course',
              title: t('studentActivity.enrolledInCourse', { courseName: en.course?.title || t('studentActivity.course') }),
              subtitle: en.course?.category ? en.course.category : undefined,
              timestamp: en.enrolled_at ? new Date(en.enrolled_at).toLocaleString() : '',
              icon: <Target className="h-4 w-4" />,
              color: 'text-purple-400',
              date: en.enrolled_at ? new Date(en.enrolled_at) : new Date(0),
            }))
          );
        }
        // Sort and take latest 5
        activityList = activityList.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
        setActivities(activityList);
      } catch (e) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'quiz': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'course': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'achievement': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="gradient-text text-lg sm:text-xl font-bold">{t('studentActivity.title')}</div>
            <CardDescription className="text-muted-foreground/80 text-xs sm:text-sm">{t('studentActivity.subtitle')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t('studentActivity.loadingActivity')}</div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4 group hover:bg-white/5 transition-colors rounded-lg p-2 -m-2 min-w-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className={activity.color}>
                      {activity.icon}
                    </span>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {activity.title}
                    </h4>
                    <Badge variant="secondary" className={`text-xs capitalize truncate ${getTypeColor(activity.type)}`}>
                      {t(`studentActivity.${activity.type}`)}
                    </Badge>
                  </div>
                  {activity.subtitle && (
                    <p className="text-xs text-muted-foreground mb-1 truncate">
                      {activity.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              {t('studentActivity.noRecentActivity')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('studentActivity.startLearningToSee')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
