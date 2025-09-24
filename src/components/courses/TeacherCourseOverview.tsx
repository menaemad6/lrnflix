import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreateLessonModal } from '@/components/lessons/CreateLessonModal';
import { CreateQuizModal } from '@/components/quizzes/CreateQuizModal';
import { CreateAttachmentModal } from '@/components/attachments/CreateAttachmentModal';
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
  TrendingUp,
  Paperclip
} from 'lucide-react';
import { Attachment } from '@/lib/attachmentQueries';

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
  attachments: Attachment[];
  onItemSelect: (type: 'lesson' | 'quiz' | 'attachment', id: string) => void;
}

export const TeacherCourseOverview = ({ 
  course, 
  lessons, 
  quizzes,
  attachments,
  onItemSelect
}: TeacherCourseOverviewProps) => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const { t } = useTranslation('dashboard');
  
  const totalContent = lessons.length + quizzes.length + attachments.length;
  const lastUpdated = new Date(
    Math.max(
      ...lessons.map(l => new Date(l.created_at).getTime()),
      ...quizzes.map(q => new Date(q.created_at).getTime()),
      ...attachments.map(a => new Date(a.created_at).getTime())
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

  const handleAttachmentCreated = () => {
    setShowAttachmentModal(false);
    // Refresh data will be handled by parent
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" /> */}
      
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 p-3 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="card p-3 sm:p-4 lg:p-6 border border-border bg-card">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-1 min-w-0">
              <Link to={`/teacher/courses/${courseId}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border border-primary-500/30 text-primary-300 transition-all duration-300 text-xs sm:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('teacherCourseOverview.backToCourse')}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h1 className="truncate text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base truncate">{course.description}</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 lg:gap-3 flex-wrap justify-end">
              <Button 
                onClick={() => navigate(`/teacher/courses/${course.id}/manage/lessons`)}
                variant="default"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('teacherCourseOverview.manageLessons')}</span>
                <span className="sm:hidden">Lessons</span>
              </Button>
              <Button 
                onClick={() => navigate(`/teacher/courses/${course.id}/manage/quizzes`)}
                variant="default"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('teacherCourseOverview.manageQuizzes')}</span>
                <span className="sm:hidden">Quizzes</span>
              </Button>
              <Button 
                onClick={() => navigate(`/teacher/courses/${course.id}/manage/attachments`)}
                variant="default"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('attachments.manageAttachments')}</span>
                <span className="sm:hidden">Files</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid (unified palette, tighter spacing) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary-300">{t('teacherCourseOverview.totalContent')}</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-300">
                {totalContent}
              </div>

            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary-300">{t('teacherCourseOverview.lastUpdated')}</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-300">
                {lastUpdated.toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary-300">{t('teacherCourseOverview.contentProgress')}</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-300">
                {Math.round((totalContent / 20) * 100)}%
              </div>
              <Progress 
                value={Math.round((totalContent / 20) * 100)} 
                className="mt-2 sm:mt-3 h-2 bg-background/20" 
              />
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary-300">{t('teacherCourseOverview.courseStatus')}</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-300">
                {totalContent > 0 ? t('teacherCourseOverview.active') : t('teacherCourseOverview.draft')}
              </div>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                {totalContent > 0 ? t('teacherCourseOverview.readyForStudents') : t('teacherCourseOverview.addContentToPublish')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Content (unified accent, tighter gaps) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl text-primary-300">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                </div>
                {t('teacherCourseOverview.recentLessons')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {lessons.slice(0, 3).map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between p-2 sm:p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 hover:border-primary-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('lesson', lesson.id)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-primary-300 group-hover:text-primary-400 transition-colors truncate text-sm sm:text-base max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                          {lesson.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t('teacherCourseOverview.order', { index: lesson.order_index })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 p-1 sm:p-2">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <div className="text-center py-4 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('teacherCourseOverview.noLessonsYet')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl text-primary-300">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                </div>
                {t('teacherCourseOverview.recentQuizzes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {quizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center justify-between p-2 sm:p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 hover:border-primary-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('quiz', quiz.id)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-primary-300 group-hover:text-primary-400 transition-colors truncate text-sm sm:text-base max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                          {quiz.title}
                        </p>
                        <div className="flex gap-1 sm:gap-2 mt-1 flex-wrap">
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
                    <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 p-1 sm:p-2">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center py-4 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('teacherCourseOverview.noQuizzesYet')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl text-primary-300">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                </div>
                {t('attachments.recentAttachments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {attachments.slice(0, 3).map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className="flex items-center justify-between p-2 sm:p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 hover:border-primary-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('attachment', attachment.id)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-primary-300 group-hover:text-primary-400 transition-colors truncate text-sm sm:text-base max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                          {attachment.title}
                        </p>
                        <div className="flex gap-1 sm:gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400 bg-primary-500/10">
                            {attachment.type}
                          </Badge>
                          {attachment.view_limit && (
                            <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400 bg-primary-500/10">
                              {attachment.view_limit} views
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 p-1 sm:p-2">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <div className="text-center py-4 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Paperclip className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('attachments.noAttachmentsYetSimple')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (unified accent) */}
        <Card className="card border border-border bg-card">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
              </div>
              {t('teacherCourseOverview.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <Button 
                variant="outline" 
                className="h-auto py-4 sm:py-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border-primary-500/30 hover:border-primary-500/50 text-primary-300 hover:text-primary-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowLessonModal(true)}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{t('teacherCourseOverview.addNewLesson')}</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 sm:py-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border-primary-500/30 hover:border-primary-500/50 text-primary-300 hover:text-primary-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowQuizModal(true)}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{t('teacherCourseOverview.createNewQuiz')}</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 sm:py-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border-primary-500/30 hover:border-primary-500/50 text-primary-300 hover:text-primary-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowAttachmentModal(true)}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{t('attachments.createAttachment')}</span>
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

        {showAttachmentModal && (
          <CreateAttachmentModal
            isOpen={showAttachmentModal}
            onClose={() => setShowAttachmentModal(false)}
            onAttachmentCreated={handleAttachmentCreated}
            courseId={course.id}
          />
        )}
      </div>
    </div>
  );
};
