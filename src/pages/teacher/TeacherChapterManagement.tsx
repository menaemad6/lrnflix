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
import { AddCourseToChapterModal } from '@/components/chapters/AddCourseToChapterModal';
import { BookOpen, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
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
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
        title: 'Error',
        description: 'Failed to load chapter data',
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

  const handleSaveChapter = async () => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          status: editForm.status
        })
        .eq('id', chapterId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Chapter updated successfully',
      });

      setIsEditing(false);
      fetchChapterData();
    } catch (error: any) {
      console.error('Error updating chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to update chapter',
        variant: 'destructive',
      });
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
        title: 'Success',
        description: 'Course removed from chapter',
      });
      fetchChapterData();
    } catch (error: any) {
      console.error('Error removing course:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove course',
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
        title: 'Success',
        description: 'Student removed from chapter',
      });
      fetchEnrolledStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove student',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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
            <h3 className="text-xl font-semibold mb-2">Chapter Not Found</h3>
            <p className="text-muted-foreground">
              The chapter you're looking for doesn't exist or you don't have permission to manage it.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Chapter Details */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl gradient-text">
                    {isEditing ? 'Edit Chapter' : chapter.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                      {chapter.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveChapter} className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Credits)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                {/* Danger Zone inside the edit form */}
                <div className="mt-8">
                  <div className="border border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">Deleting this chapter will permanently remove it and all related courses, enrollments, and objects. This action cannot be undone.</p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chapter
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">{chapter.description}</p>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-semibold gradient-text">{chapter.price} credits</span>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(chapter.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Courses and Students */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Enrolled Students</TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            {/* Courses Management */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Courses in Chapter ({chapterCourses.length})</CardTitle>
                  <Button 
                    className="btn-primary"
                    onClick={() => setIsAddCourseModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chapterCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add courses to this chapter to create a comprehensive learning path.
                    </p>
                    <Button 
                      onClick={() => setIsAddCourseModalOpen(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Course
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
                                  <h4 className="font-semibold">{obj.course?.title || obj.title || 'Unknown Course'}</h4>
                                  <p className="text-sm text-muted-foreground">{obj.course?.description || obj.description || ''}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={obj.course?.status === 'published' ? 'default' : 'secondary'}>
                                      {obj.course?.status || 'unknown'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {obj.course?.price ? `${obj.course.price} credits` : ''}
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
                <CardTitle>Enrolled Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <div className="text-lg font-semibold mb-2">No Students Enrolled</div>
                            <div className="text-muted-foreground mb-4">
                              No students are currently enrolled in this chapter.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        students.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell><Link to={`/teacher/students/${student.student_id}`}>{student.profiles?.full_name || 'Unknown Name'}</Link></TableCell>
                            <TableCell>{student.profiles?.email || 'Unknown Email'}</TableCell>
                            <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveStudent(student.student_id)}
                              >
                                Remove
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
              <DialogTitle>Delete Chapter?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this chapter and all its related data? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteChapter} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};