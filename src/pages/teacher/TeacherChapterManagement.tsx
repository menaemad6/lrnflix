import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';
import { AddCourseToChapterModal } from '@/components/chapters/AddCourseToChapterModal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';
import { BookOpen, Plus, Trash2, Edit, Save, X, Settings, Sparkles, Upload } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  cover_image_url?: string;
  instructor_id?: string;
  creator_id?: string;
  user_id?: string;
  teacher_id?: string;
  [key: string]: unknown;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

export const TeacherChapterManagement = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const { validateAndHandle } = useTenantItemValidation({ redirectTo: '/teacher/chapters' });
  const { validateOwnership } = useItemOwnershipValidation({ redirectTo: '/teacher/chapters' });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'draft'
  });
  const [activeTab, setActiveTab] = useState('courses');
  const [students, setStudents] = useState<{ student_id: string, profiles?: { full_name: string | null, email: string } }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chapterCourses, setChapterCourses] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData();
      fetchEnrolledStudents();
    }
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Get chapter details
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();
      if (chapterError) throw chapterError;
      
      // Validate chapter access before setting state
      validateAndHandle(chapterData);
      validateOwnership(chapterData.instructor_id || '');
      setChapter(chapterData);
      setEditForm({
        title: chapterData.title,
        description: chapterData.description || '',
        price: chapterData.price,
        status: chapterData.status
      });
      // Get chapter_objects of type course, join with courses
      const { data: objectsData, error: objectsError } = await supabase
        .from('chapter_objects')
        .select('*, course:courses!object_id(*)')
        .eq('chapter_id', chapterId)
        .eq('object_type', 'course');
      if (objectsError) throw objectsError;
      setChapterCourses(objectsData || []);
    } catch (error: any) {
      console.error('Error fetching chapter:', error);
      toast({
        title: t('teacherChapterManagement.error'),
        description: t('teacherChapterManagement.failedToLoadChapter'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('chapter_enrollments')
        .select('student_id, profiles!student_id (full_name, email)')
        .eq('chapter_id', chapterId);
      if (error) throw error;
      // Defensive: filter out rows where profiles is not an object
      setStudents(
        (data || []).map((row: { student_id: string; profiles?: { full_name: string | null; email: string } }) => {
          if (
            row.profiles &&
            typeof row.profiles === 'object' &&
            'full_name' in row.profiles &&
            'email' in row.profiles
          ) {
            return row;
          } else {
            return { student_id: row.student_id };
          }
        })
      );
    } catch (error) {
      setStudents([]);
    }
  };



  const handleRemoveCourseFromChapter = async (courseId: string) => {
    try {
      // Delete the chapter_object for this course
      const { error } = await supabase
        .from('chapter_objects')
        .delete()
        .eq('chapter_id', chapterId)
        .eq('object_type', 'course')
        .eq('object_id', courseId);
      if (error) throw error;
      toast({
        title: t('teacherChapterManagement.success'),
        description: t('teacherChapterManagement.courseRemovedFromChapter'),
      });
      fetchChapterData();
    } catch (error: any) {
      console.error('Error removing course:', error);
      toast({
        title: t('teacherChapterManagement.error'),
        description: t('teacherChapterManagement.failedToRemoveCourse'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChapter = async () => {
    try {
      // Delete related objects first (order matters due to FKs)
      await supabase.from('chapter_objects').delete().eq('chapter_id', chapterId);
      await supabase.from('chapter_enrollments').delete().eq('chapter_id', chapterId);
      // Delete the chapter itself
      await supabase.from('chapters').delete().eq('id', chapterId);
      // Optionally redirect or update UI
      window.location.href = '/teacher/chapters';
    } catch (error) {
      // Optionally show error toast
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('chapter_enrollments')
        .delete()
        .eq('chapter_id', chapterId)
        .eq('student_id', studentId);
      if (error) throw error;
      toast({
        title: t('teacherChapterManagement.success'),
        description: t('teacherChapterManagement.studentRemovedFromChapter'),
      });
      fetchEnrolledStudents();
    } catch (error: any) {
      toast({
        title: t('teacherChapterManagement.error'),
        description: t('teacherChapterManagement.failedToRemoveStudent'),
        variant: 'destructive',
      });
    }
  };

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: t('teacherChapterManagement.success'),
      description: t('teacherChapterManagement.chapterThumbnailUploaded'),
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: t('teacherChapterManagement.success'),
      description: t('teacherChapterManagement.chapterThumbnailRemoved'),
    });
  };

  const handlePublishChapter = async () => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({ status: chapter.status === 'published' ? 'draft' : 'published' })
        .eq('id', chapterId);
      if (error) throw error;
      toast({
        title: t('teacherChapterManagement.success'),
        description: t('teacherChapterManagement.chapterPublishedSuccessfully'),
      });
      fetchChapterData();
    } catch (error: unknown) {
      console.error('Error publishing chapter:', error);
      toast({
        title: t('teacherChapterManagement.error'),
        description: t('teacherChapterManagement.failedToPublishChapter'),
        variant: 'destructive',
      });
    }
  };

  const updateChapterDetails = async () => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          status: editForm.status,
          cover_image_url: uploadedImage?.url || chapter?.cover_image_url || null
        })
        .eq('id', chapterId);

      if (error) throw error;

      toast({
        title: t('teacherChapterManagement.success'),
        description: t('teacherChapterManagement.chapterDetailsUpdatedSuccessfully'),
      });

      // Refresh chapter data
      fetchChapterData();
      setUploadedImage(null);

    } catch (error: any) {
      console.error('Error updating chapter:', error);
      toast({
        title: t('teacherChapterManagement.error'),
        description: t('teacherChapterManagement.failedToUpdateChapter'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!chapter) {
    return (
      <DashboardLayout>
        <Card className="glass-card border-0">
          <CardContent className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('teacherChapterManagement.chapterNotFound')}</h3>
            <p className="text-muted-foreground">
              {t('teacherChapterManagement.chapterNotFoundDescription')}
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SEOHead 
        contentTitle={chapter.title}
        contentDescription={chapter.description || 'Organize and manage your learning chapter with comprehensive tools.'}
      />
      <DashboardLayout>
        <div className="space-y-6">
        {/* Chapter Details */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl gradient-text">
                    {chapter.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                      {chapter.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                  <Button variant={chapter.status === "published" ? 'destructive' : 'default'} onClick={() => handlePublishChapter()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {chapter.status === 'published' ? t('teacherChapterManagement.unpublish') : t('teacherChapterManagement.publish')}
                  </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            
              <div className="space-y-4">
                <p className="text-muted-foreground">{chapter.description}</p>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-semibold text-primary">{chapter.price} EGP</span>
                  <span className="text-sm text-muted-foreground">
                    {t('teacherChapterManagement.created')} {new Date(chapter.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            
          </CardContent>
        </Card>

        {/* Tabs for Courses and Students */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">{t('teacherChapterManagement.lessons')}</TabsTrigger>
            <TabsTrigger value="students">{t('teacherChapterManagement.enrolledStudents')}</TabsTrigger>
            <TabsTrigger value="settings">{t('teacherChapterManagement.chapterSettings')}</TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            {/* Courses Management */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('teacherChapterManagement.coursesInChapter')} ({chapterCourses.length})</CardTitle>
                  <Button 
                    variant='default'
                    onClick={() => setIsAddCourseModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('teacherChapterManagement.addCourse')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chapterCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('teacherChapterManagement.noCoursesYet')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('teacherChapterManagement.noCoursesDescription')}
                    </p>
                    <Button 
                      onClick={() => setIsAddCourseModalOpen(true)}
                      variant='default'>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('teacherChapterManagement.addFirstCourse')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chapterCourses.map((obj) => (
                      <Card key={obj.id} className="border border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{obj.course?.title || obj.title || t('teacherChapterManagement.unknownCourse')}</h4>
                                  <p className="text-sm text-muted-foreground">{obj.course?.description || obj.description || ''}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={obj.course?.status === 'published' ? 'default' : 'secondary'}>
                                      {obj.course?.status || 'unknown'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {obj.course?.price ? `${obj.course.price} ${t('teacherChapterManagement.credits')}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveCourseFromChapter(obj.course?.id || '')}
                              className="text-red-400 hover:text-red-300 hover:border-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="students">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>{t('teacherChapterManagement.enrolledStudents')} ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('teacherChapterManagement.name')}</TableHead>
                        <TableHead>{t('teacherChapterManagement.email')}</TableHead>
                        <TableHead>{t('teacherChapterManagement.studentId')}</TableHead>
                        <TableHead>{t('teacherChapterManagement.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <div className="text-lg font-semibold mb-2">{t('teacherChapterManagement.noStudentsEnrolled')}</div>
                            <div className="text-muted-foreground mb-4">
                              {t('teacherChapterManagement.noStudentsDescription')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        students.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell><Link to={`/teacher/students/${student.student_id}`}>{student.profiles?.full_name || t('teacherChapterManagement.unknownName')}</Link></TableCell>
                            <TableCell>{student.profiles?.email || t('teacherChapterManagement.unknownEmail')}</TableCell>
                            <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveStudent(student.student_id)}
                              >
                                {t('teacherChapterManagement.removeStudent')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            {/* Chapter Settings */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('teacherChapterManagement.chapterSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Thumbnail Display */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('teacherChapterManagement.currentThumbnail')}</label>
                  <div className="w-full h-48 overflow-hidden rounded-xl border border-white/10">
                    {chapter?.cover_image_url ? (
                      <img
                        src={chapter.cover_image_url}
                        alt={chapter.title}
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
                  <label className="text-sm font-medium mb-2 block">{t('teacherChapterManagement.updateThumbnail')}</label>
                  <ImageUploader
                    bucket={IMAGE_UPLOAD_BUCKETS.CHAPTERS_THUMBNAILS}
                    folder="chapters"
                    compress={true}
                    generateThumbnail={true}
                    onImageUploaded={handleImageUploaded}
                    onImageDeleted={handleImageDeleted}
                    onError={(error) => {
                      toast({
                        title: t('teacherChapterManagement.error'),
                        description: error,
                        variant: 'destructive',
                      });
                    }}
                    variant="compact"
                    size="sm"
                    placeholder={t('teacherChapterManagement.uploadChapterThumbnail')}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('teacherChapterManagement.titleLabel')}</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('teacherChapterManagement.enterChapterTitlePlaceholder')}
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('teacherChapterManagement.descriptionLabel')}</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('teacherChapterManagement.enterChapterDescriptionPlaceholder')}
                      rows={4}
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('teacherChapterManagement.price')}</label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder={t('teacherChapterManagement.enterChapterPricePlaceholder')}
                      className="glass-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('teacherChapterManagement.statusLabel')}</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="draft">{t('teacherChapterManagement.draft')}</option>
                      <option value="published">{t('teacherChapterManagement.published')}</option>
                    </select>
                  </div>

                                  {/* Danger Zone inside the edit form */}
                <div className="mt-8">
                  <div className="border border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">{t('teacherChapterManagement.dangerZone')}</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">{t('teacherChapterManagement.dangerZoneDescription')}</p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('teacherChapterManagement.deleteChapter')}
                    </Button>
                  </div>
                </div>
                  
                  <Button onClick={updateChapterDetails} className="w-full" variant="default">
                    <Save className="h-4 w-4 mr-2" />
                    {t('teacherChapterManagement.saveChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <AddCourseToChapterModal
          isOpen={isAddCourseModalOpen}
          onClose={() => setIsAddCourseModalOpen(false)}
          chapterId={chapterId!}
          onCourseAdded={fetchChapterData}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('teacherChapterManagement.deleteChapterConfirm')}</DialogTitle>
              <DialogDescription>
                {t('teacherChapterManagement.deleteChapterDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {t('teacherChapterManagement.cancelEdit')}
              </Button>
              <Button variant="destructive" onClick={handleDeleteChapter} className="bg-red-600 hover:bg-red-700">
                {t('teacherChapterManagement.deleteChapter')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </>
  );
};