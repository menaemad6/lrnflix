import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  onViewModeChange: (mode: 'lessons' | 'quizzes') => void;
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
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
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
        <div className="card p-8 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to={`/teacher/courses/${courseId}`}>
                <Button 
                  variant="outline" 
                  className="border border-emerald-500/30 text-emerald-300 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </Link>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-lg">{course.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => onViewModeChange('lessons')}
                className="border border-emerald-500/30 text-emerald-300 transition-all duration-300"
              >
                <Video className="h-4 w-4 mr-2" />
                Manage Lessons
              </Button>
              <Button 
                onClick={() => onViewModeChange('quizzes')}
                className="border border-emerald-500/30 text-emerald-300 transition-all duration-300"
              >
                <Brain className="h-4 w-4 mr-2" />
                Manage Quizzes
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-emerald-300">Total Content</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {totalContent}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lessons.length} lessons + {quizzes.length} quizzes
              </p>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-teal-300">Last Updated</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {lastUpdated.toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-cyan-300">Content Progress</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
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
              <CardTitle className="text-sm font-medium text-purple-300">Course Status</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {totalContent > 0 ? 'Active' : 'Draft'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalContent > 0 ? 'Ready for students' : 'Add content to publish'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card border border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-emerald-300">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Video className="h-4 w-4 text-black" />
                </div>
                Recent Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.slice(0, 3).map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('lesson', lesson.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Video className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-300 group-hover:text-emerald-400 transition-colors">
                          {lesson.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order: {lesson.order_index}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Video className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">No lessons added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card border border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-teal-300">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-black" />
                </div>
                Recent Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border border-teal-500/20 hover:border-teal-500/40 cursor-pointer transition-all duration-300 group"
                    onClick={() => onItemSelect('quiz', quiz.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300">
                        <Brain className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium text-teal-300 group-hover:text-teal-400 transition-colors">
                          {quiz.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-teal-500/30 text-teal-400 bg-teal-500/10"
                          >
                            {quiz.type}
                          </Badge>
                          {quiz.time_limit && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                            >
                              {quiz.time_limit} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-teal-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">No quizzes added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card border border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button 
                variant="outline" 
                className="h-auto py-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowLessonModal(true)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-semibold">Add New Lesson</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border-teal-500/30 hover:border-teal-500/50 text-teal-300 hover:text-teal-400 backdrop-blur-sm transition-all duration-300" 
                onClick={() => setShowQuizModal(true)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-semibold">Create New Quiz</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-400 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <span className="font-semibold">View Students</span>
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
