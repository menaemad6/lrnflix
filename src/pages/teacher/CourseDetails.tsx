import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LessonManager } from '@/components/lessons/LessonManager';
import { CourseCodesManager } from '@/components/courses/CourseCodesManager';
import { StudentManager } from '@/components/students/StudentManager';
import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';
import { 
  ArrowLeft, 
  MessageSquare, 
  Edit, 
  Tag, 
  Users, 
  Settings, 
  Save,
  BarChart3,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Globe,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Cog,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useIsLargeScreen } from '@/hooks/use-mobile';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  enrollment_code: string | null;
  created_at: string;
  category: string | null;
  price: number;
  cover_image_url?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  created_at: string;
}

export const CourseDetails = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchEnrollmentCount();
      fetchQuizzes();
    }
  }, [courseId]);

  useEffect(() => {
    if (course) {
      setEditForm({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        price: course.price
      });
    }
  }, [course]);

  const islarge = useIsLargeScreen();
  useEffect(() => {
    if (islarge) {
      setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed(true);
    }
  }, [islarge])

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error: unknown) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load course details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      if (error) throw error;
      setEnrollmentCount(count || 0);
    } catch (error: unknown) {
      console.error('Error fetching enrollment count:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: unknown) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const updateCourseStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status })
        .eq('id', courseId);

      if (error) throw error;

      setCourse(prev => prev ? { ...prev, status } : null);
      toast({
        title: 'Success',
        description: `Course ${status === 'published' ? 'published' : 'saved as draft'}!`,
      });
    } catch (error: unknown) {
      console.error('Error updating course status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course status',
        variant: 'destructive',
      });
    }
  };

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: 'Success',
      description: 'Course thumbnail uploaded successfully!',
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: 'Success',
      description: 'Course thumbnail removed',
    });
  };

  const updateCourseDetails = async () => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          price: editForm.price,
          cover_image_url: uploadedImage?.url || course?.cover_image_url || null
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Course details updated successfully!',
      });

      // Refresh course data
      fetchCourseDetails();
      setUploadedImage(null);
    } catch (error: unknown) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  const deleteCourse = async () => {
    setIsDeleting(true);
    try {
      // Delete related data first (enrollments, lessons, quizzes, etc.)
      const { error: enrollmentsError } = await supabase
        .from('enrollments')
        .delete()
        .eq('course_id', courseId);

      if (enrollmentsError) throw enrollmentsError;

      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;

      const { error: quizzesError } = await supabase
        .from('quizzes')
        .delete()
        .eq('course_id', courseId);

      if (quizzesError) throw quizzesError;



      // Finally delete the course
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (courseError) throw courseError;

      toast({
        title: 'Success',
        description: 'Course deleted successfully!',
      });

      // Navigate back to teacher dashboard
      navigate('/teacher/courses');
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Course statistics & discussions' },
    { id: 'manage', label: 'Manage Content', icon: Cog, description: 'Lessons & Quizzes', isLink: true, href: `/teacher/courses/${courseId}/manage` },
    { id: 'students', label: 'Students', icon: Users, description: 'Manage enrollment' },
    { id: 'codes', label: 'Course Codes', icon: Tag, description: 'Access codes' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Course configuration' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 md:space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <Card className="glass-card border-white/10 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Students</p>
                      <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">{enrollmentCount}</p>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                      <Users className="h-6 w-6 text-primary-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-blue-500/10 to-accent-500/10 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Revenue</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{enrollmentCount * course.price}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Completion Rate</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">87%</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Trophy className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Rating</p>
                      <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">4.8</p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Target className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Course header moved above tabs; removed here to avoid duplication */}
            {/* Course Discussions */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Course Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DiscussionForum courseId={courseId!} />
              </CardContent>
            </Card>
          </div>
        );

      case 'students':
        return (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudentManager courseId={courseId!} />
            </CardContent>
          </Card>
        );

      case 'codes':
        return (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Course Codes & Discounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseCodesManager courseId={courseId!} />
            </CardContent>
          </Card>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Course Settings */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Course Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">


                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Course Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter course title"
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter course description"
                      rows={4}
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter course category"
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Price (Credits)</label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter course price"
                      className="glass-input"
                    />
                  </div>
                  
                                  {/* Current Thumbnail Display */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Thumbnail</label>
                  <div className="w-full h-48 overflow-hidden rounded-xl border border-white/10">
                    {course?.cover_image_url ? (
                      <img
                        src={course.cover_image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-primary/60" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Uploader */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Thumbnail</label>
                  <ImageUploader
                    bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
                    folder="courses"
                    compress={true}
                    generateThumbnail={true}
                    onImageUploaded={handleImageUploaded}
                    onImageDeleted={handleImageDeleted}
                    onError={(error) => {
                      toast({
                        title: 'Error',
                        description: error,
                        variant: 'destructive',
                      });
                    }}
                    variant="compact"
                    size="sm"
                    placeholder="Upload course thumbnail"
                  />
                </div>
                
                  <Button onClick={updateCourseDetails} className="w-full btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-400 mb-1">Delete Course</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete this course and all its content. This action cannot be undone.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• All lessons, quizzes, and chapters will be deleted</p>
                        <p>• All student enrollments will be removed</p>
                        <p>• Course codes will be invalidated</p>
                        <p>• This action is irreversible</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-red-500/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Course
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you absolutely sure you want to delete "{course?.title}"? This action cannot be undone and will permanently remove:
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• The course and all its content</li>
                            <li>• All lessons, quizzes, and chapters</li>
                            <li>• All student enrollments ({enrollmentCount} students)</li>
                            <li>• Course codes and access</li>
                          </ul>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border hover:bg-muted">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteCourse}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-background relative overflow-hidden">
        {/* Left Sidebar - hidden on mobile, collapsible on desktop */}
        <div className={`hidden md:block transition-all duration-300 ease-in-out border-r border-white/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl ${sidebarCollapsed ? 'md:w-20' : 'md:w-80'} md:relative z-30 shrink-0`}>
          {/* Collapse/Expand Button - Only visible on desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block absolute -right-4 top-8 z-50 h-8 w-8 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          
          {/* Mobile close button removed since sidebar is hidden on mobile */}

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <Link to="/teacher/dashboard">
                <Button variant="outline" size="sm" className={`glass-card transition-all duration-200 ${sidebarCollapsed ? 'w-8 h-8 p-0' : ''}`}>
                  <ArrowLeft className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-2">Back to Dashboard</span>}
                </Button>
              </Link>
              
              {!sidebarCollapsed && (
                <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Course Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage all aspects of your course
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              

              {sidebarItems.map((item) => {
                if (item.isLink) {
                  return (
                    <Link key={item.id} to={item.href!} onClick={() => setSidebarCollapsed(true)}>
                      <button
                        className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden hover:bg-white/10 hover:text-primary hover-glow hover:shadow-lg hover:shadow-white/10 ${
                          sidebarCollapsed ? 'justify-center' : ''
                        }`}
                        title={sidebarCollapsed ? item.label : ''}
                      >
                        <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-md`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-sm">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        )}
                      </button>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarCollapsed(true);
                    }}
                    className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary glow border border-primary/30 shadow-lg shadow-primary/20'
                        : 'hover:bg-white/10 hover:text-primary hover-glow hover:shadow-lg hover:shadow-white/10'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-primary/20 text-primary shadow-lg shadow-primary/25'
                        : 'group-hover:bg-primary/10 group-hover:shadow-md'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    )}
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary to-secondary rounded-r shadow-lg shadow-primary/50" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 min-w-0 min-h-0 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto space-y-4">
            {/* Course Header - persistent on all tabs */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {course.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="px-3 py-1">
                        {course.status || 'draft'}
                      </Badge>
                      {course.category && <Badge variant="outline">{course.category}</Badge>}
                      <Badge variant="outline">{course.price} Credits</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <Link to={`/teacher/courses/${courseId}/manage`}>
                        <Cog className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/courses/${courseId}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Link>
                    </Button>
                    {course.status !== 'published' ? (
                      <Button onClick={() => updateCourseStatus('published')}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Publish Course
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => updateCourseStatus('draft')}>
                        Unpublish
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || 'No description available'}
                </p>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Code: {course.enrollment_code || 'None'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Tabs - under header, replaces sidebar on small screens */}
            <div className="md:hidden">
              <Tabs value={activeTab} onValueChange={(v) => {
                if (v === 'manage') {
                  navigate(`/teacher/courses/${courseId}/manage`);
                  return;
                }
                setActiveTab(v);
              }}>
                <div className="w-full overflow-x-auto">
                  <TabsList className="flex p-1 gap-1 whitespace-nowrap">
                    <TabsTrigger className="shrink-0" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="students">Students</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="codes">Codes</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="settings">Settings</TabsTrigger>
                    
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
