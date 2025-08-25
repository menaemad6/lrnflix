import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Award,
  FileText,
  Target,
  Video,
  Calendar,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { useLiveLectures } from '@/hooks/useLiveLectures';
import { getLectureStatusInfo, formatLectureTime } from '@/utils/lectureUtils';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  chapter_id: string;
  course_id: string;
  order_index: number;
  video_url: string | null;
  view_limit: number | null;
  duration_minutes?: number; // Added for lesson duration
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons?: Lesson[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  created_at: string;
  order_index: number;
}

interface QuizAttempt {
  quiz_id: string;
  score: number;
  max_score: number;
}

interface Attachment {
  id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  type: string;
  order_index: number;
  course_id: string;
  size: number | null;
}

interface CourseSidebarProps {
  course: Course;
  currentLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
  lessons: Lesson[];
  quizzes: Quiz[];
  attachments: Attachment[];
  quizAttempts: QuizAttempt[];
  onQuizSelect?: (quiz: Quiz) => void;
  onAttachmentSelect?: (attachment: Attachment) => void;
  currentQuiz?: Quiz | null;
  currentAttachment?: Attachment | null;
}

export const CourseSidebar = ({ 
  course, 
  currentLesson, 
  onLessonSelect,
  lessons,
  quizzes,
  attachments,
  quizAttempts,
  onQuizSelect,
  onAttachmentSelect,
  currentQuiz,
  currentAttachment
}: CourseSidebarProps) => {
  const { t } = useTranslation('courses');
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    }
    fetchUser();
  }, []);
  const progress = useCourseProgress(course.id, userId);
  const { lectures, loading: lecturesLoading } = useLiveLectures(course.id);

  const getQuizAttemptScore = (quizId: string) => {
    const attempts = quizAttempts.filter(attempt => attempt.quiz_id === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(attempt => attempt.score));
  };

  const getQuizMaxScore = (quizId: string) => {
    const attempts = quizAttempts.filter(attempt => attempt.quiz_id === quizId);
    if (attempts.length === 0) return null;
    return attempts[0].max_score;
  };

  // Combine lessons, quizzes, and attachments, sort by order_index, and mark type
  const allContent = [
    ...lessons.map(lesson => ({ ...lesson, type: 'lesson' as const })),
    ...quizzes.map(quiz => ({ ...quiz, type: 'quiz' as const })),
    ...attachments.map(attachment => ({ ...attachment, type: 'attachment' as const }))
  ].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Course Header */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold leading-tight">
                <Link to={`/courses/${course.id}`} className="hover:underline text-primary-foreground">
                  {course.title}
                </Link>
              </CardTitle>
              <p className="text-primary-foreground/80 text-sm">
                by {course.profiles?.full_name || t('sidebar.instructor')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('sidebar.progress')}</span>
              <span>{Math.round(((progress.completedLessons + progress.completedQuizzes) / (progress.totalLessons + progress.totalQuizzes + attachments.length)) * 100)}%</span>
            </div>
            <Progress 
              value={Math.round(((progress.completedLessons + progress.completedQuizzes) / (progress.totalLessons + progress.totalQuizzes + attachments.length)) * 100)} 
              className="h-2 bg-primary-foreground/20" 
            />
            <div className="flex justify-between text-xs text-primary-foreground/80">
              <span>{progress.completedLessons + progress.completedQuizzes} {t('sidebar.completed')}</span>
              <span>{progress.totalLessons + progress.totalQuizzes + attachments.length - (progress.completedLessons + progress.completedQuizzes)} {t('sidebar.remaining')}</span>
            </div>
            <div className="flex justify-between text-xs text-primary-foreground/80 mt-1">
              <span>{t('sidebar.lessons')}: {progress.completedLessons}/{progress.totalLessons}</span>
              <span>{t('sidebar.quizzes')}: {progress.completedQuizzes}/{progress.totalQuizzes}</span>
              <span>{t('attachments.attachmentsLabel')}: 0/{attachments.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Content */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t('sidebar.courseContent')}
        </h3>

        <div className="space-y-3">
          {allContent.length > 0 ? (
            allContent.map((item) => {
              if (item.type === 'lesson') {
                const isCurrent = currentLesson?.id === item.id;
                const isCompleted = progress.completedLessonIds.includes(item.id);
                return (
                  <Card
                    key={`lesson-${item.id}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : isCompleted
                        ? 'border-primary-500/40 bg-primary-100/10'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => onLessonSelect(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                            ? 'bg-primary-500 text-white'
                            : 'bg-muted'
                        }`}>
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.title}</div>
                          {item.duration_minutes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ~{item.duration_minutes} {t('lessonContent.minutes')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <CheckCircle className="h-4 w-4 text-primary-500" />}
                          <Badge variant="outline" className="text-xs">{t('sidebar.lesson')}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else if (item.type === 'quiz') {
                const bestScore = getQuizAttemptScore(item.id);
                const maxScore = getQuizMaxScore(item.id);
                const isCurrent = currentQuiz?.id === item.id;
                const hasAttempts = bestScore !== null;
                
                return (
                  <Card
                    key={`quiz-${item.id}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isCurrent 
                        ? "border-primary bg-primary/5" 
                        : hasAttempts 
                          ? "border-primary/20 bg-primary/5" 
                          : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => navigate(`/courses/${course.id}/progress/quiz/${item.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCurrent || hasAttempts
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <Target className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.time_limit && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.time_limit}{t('lessonContent.minutes')}
                              </Badge>
                            )}
                          </div>
                          
                          {hasAttempts && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {t('quizProgress.bestScore')} {bestScore}/{maxScore} ({Math.round((bestScore! / maxScore!) * 100)}%)
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasAttempts && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {t('sidebar.quiz')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else if (item.type === 'attachment') {
                const isCurrent = currentAttachment?.id === item.id;
                const isCompleted = false; // TODO: Implement attachment progress tracking
                
                return (
                  <Card
                    key={`attachment-${item.id}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : isCompleted
                        ? 'border-primary-500/40 bg-primary-100/10'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => onAttachmentSelect?.(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                            ? 'bg-primary-500 text-white'
                            : 'bg-muted'
                        }`}>
                          {(item as Attachment).type === 'pdf' ? (
                            <FileText className="h-5 w-5" />
                          ) : (
                            <LinkIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(item as Attachment).type === 'pdf' ? t('attachments.pdfDocument') : t('attachments.externalLink')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <CheckCircle className="h-4 w-4 text-primary-500" />}
                          <Badge variant="outline" className="text-xs">
                            {(item as Attachment).type === 'pdf' ? t('attachments.pdfFile') : t('attachments.externalLink')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null; // Should not happen for valid types
            })
          ) : (
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">{t('sidebar.noCourseContent')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Live Lectures Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          {t('sidebar.liveLectures')}
        </h3>

        {lecturesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">{t('sidebar.noLiveLectures')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lectures.map((lecture) => {
              const statusInfo = getLectureStatusInfo(lecture);
              const timeInfo = formatLectureTime(lecture.start_time, lecture.duration_minutes);
              
              return (
                <Card
                  key={lecture.id}
                  className={`transition-all hover:shadow-md ${
                    statusInfo.status === 'live' 
                      ? "border-red-500 bg-red-500/5" 
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        statusInfo.status === 'live'
                          ? 'bg-red-500 text-white'
                          : statusInfo.status === 'upcoming'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted'
                      }`}>
                        <Video className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm">{lecture.title}</div>
                          <Badge 
                            variant={statusInfo.badgeVariant} 
                            className={statusInfo.badgeColor}
                          >
                            {statusInfo.badgeText}
                          </Badge>
                        </div>
                        
                        {lecture.description && (
                          <div className="text-xs text-muted-foreground mb-2">
                            {lecture.description}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {timeInfo.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeInfo.startTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {timeInfo.duration}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {statusInfo.message}
                        </div>
                      </div>
                      
                      {statusInfo.canJoin && lecture.meet_link && (
                        <Button
                          size="sm"
                          onClick={() => window.open(lecture.meet_link, '_blank')}
                          className="btn-primary"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t('sidebar.join')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
