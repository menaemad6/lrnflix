import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreateLessonModal } from '@/components/lessons/CreateLessonModal';
import { CreateQuizModal } from '@/components/quizzes/CreateQuizModal';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Clock, 
  BarChart3, 
  Calendar,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Video,
  Brain,
  TrendingUp
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  order_index: number;
  created_at: string;
}

interface TeacherCourseOverviewProps {
  course: Course;
  lessons: Lesson[];
  quizzes: Quiz[];
  onItemSelect: (type: 'lesson' | 'quiz', id: string) => void;
}

export const TeacherCourseOverview = ({ 
  course, 
  lessons, 
  quizzes,
  onViewModeChange,
  onItemSelect
}: TeacherCourseOverviewProps) => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const { t } = useTranslation('dashboard');
  
  const totalContent = lessons.length + quizzes.length;
  const lastUpdated = new Date(
    Math.max(
      ...lessons.map(l => new Date(l.created_at).getTime()),
      ...quizzes.map(q => new Date(q.created_at).getTime())
    )
  );

  const handleLessonCreated = () => {
    setShowLessonModal(false);
    // Refresh data will be handled by parent
  };

  const handleQuizCreated = () => {
    setShowQuizModal(false);
    // Refresh data will be handled by parent
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" /> */}
      
      <div className="space-y-8 relative z-10 p-8">
        {/* Header */}
        <div className="card p-4 sm:p-6 lg:p-8 border border-border bg-card">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
              <Link to={`/teacher/courses/${courseId}`}>
                <Button 
                  variant="outline" 
                  className="border border-primary-500/30 text-primary-300 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('teacherCourseOverview.backToCourse')}
                </Button>
              </Link>
              <div className="space-y-1 sm:space-y-2 min-w-0">
                <h1 className="truncate text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base truncate">{course.description}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-end">
              <Button 
                onClick={() => navigate(`/teacher/courses/${course.id}/manage/lessons`)}
                variant="default"
              >
                <Video className="h-4 w-4 mr-2" />
                                  {t('teacherCourseOverview.manageLessons')}
              </Button>
              <Button 
                onClick={() => navigate(`/teacher/courses/${course.id}/manage/quizzes`)}
                variant="default" >
                <Brain className="h-4 w-4 mr-2" />
                                  {t('teacherCourseOverview.manageQuizzes')}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid (unified palette, tighter spacing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                             <CardTitle className="text-sm font-medium text-primary-300">{t('teacherCourseOverview.totalContent')}</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-300">
                {totalContent}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                                 {t('teacherCourseOverview.lessonsAndQuizzes', { lessons: lessons.length, quizzes: quizzes.length })}
              </p>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                             <CardTitle className="text-sm font-medium text-primary-300">{t('teacherCourseOverview.lastUpdated')}</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-300">
                {lastUpdated.toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                             <CardTitle className="text-sm font-medium text-primary-300">{t('teacherCourseOverview.contentProgress')}</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-300">
                {Math.round((totalContent / 20) * 100)}%
              </div>
              <Progress 
                value={Math.round((totalContent / 20) * 100)} 
                className="mt-3 h-2 bg-background/20" 
              />
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                             <CardTitle className="text-sm font-medium text-primary-300">{t('teacherCourseOverview.courseStatus')}</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-300">
                                 {totalContent > 0 ? t('teacherCourseOverview.active') : t('teacherCourseOverview.draft')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                                 {totalContent > 0 ? t('teacherCourseOverview.readyForStudents') : t('teacherCourseOverview.addContentToPublish')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Content (unified accent, tighter gaps) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-primary-300">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Video className="h-4 w-4 text-black" />
                </div>
                                 {t('teacherCourseOverview.recentLessons')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.slice(0, 3).map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 hover:border-primary-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('lesson', lesson.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Video className="h-5 w-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-primary-300 group-hover:text-primary-400 transition-colors truncate max-w-[200px] sm:max-w-none">
                          {lesson.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                                                     {t('teacherCourseOverview.order', { index: lesson.order_index })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Video className="h-8 w-8 text-primary-400" />
                    </div>
                                         <p className="text-sm text-muted-foreground">{t('teacherCourseOverview.noLessonsYet')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-primary-300">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-black" />
                </div>
                                 {t('teacherCourseOverview.recentQuizzes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 hover:border-primary-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('quiz', quiz.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Brain className="h-5 w-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-primary-300 group-hover:text-primary-400 transition-colors truncate max-w-[200px] sm:max-w-none">
                          {quiz.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400 bg-primary-500/10">
                            {quiz.type}
                          </Badge>
                          {quiz.time_limit && (
                            <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400 bg-primary-500/10">
                              {quiz.time_limit} {t('minutes')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-primary-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t('teacherCourseOverview.noQuizzesYet')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (unified accent) */}
        <Card className="card border border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
              {t('teacherCourseOverview.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Button 
                variant="outline" 
                className="h-auto py-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border-primary-500/30 hover:border-primary-500/50 text-primary-300 hover:text-primary-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowLessonModal(true)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-semibold">{t('teacherCourseOverview.addNewLesson')}</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border-primary-500/30 hover:border-primary-500/50 text-primary-300 hover:text-primary-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowQuizModal(true)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-semibold">{t('teacherCourseOverview.createNewQuiz')}</span>
                </div>
              </Button>

            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {showLessonModal && (
          <CreateLessonModal
            open={showLessonModal}
            onOpenChange={setShowLessonModal}
            courseId={course.id}
            onLessonCreated={handleLessonCreated}
          />
        )}

        {showQuizModal && (
          <CreateQuizModal
            open={showQuizModal}
            onOpenChange={setShowQuizModal}
            courseId={course.id}
            onQuizCreated={handleQuizCreated}
          />
        )}
      </div>
    </div>
  );
};
