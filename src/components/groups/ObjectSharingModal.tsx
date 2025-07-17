
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Image, Link as LinkIcon, Video, BookOpen, PlayCircle, Brain } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface ObjectSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onObjectShared: () => void;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
}

export const ObjectSharingModal = ({ isOpen, onClose, groupId, onObjectShared }: ObjectSharingModalProps) => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [objectType, setObjectType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectData, setObjectData] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Teacher's content
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const objectTypes = [
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'link', label: 'Link', icon: LinkIcon },
    { value: 'video', label: 'Video', icon: Video },
    ...(user?.role === 'teacher' ? [
      { value: 'course', label: 'Course', icon: BookOpen },
      { value: 'lesson', label: 'Lesson', icon: PlayCircle },
      { value: 'quiz', label: 'Quiz', icon: Brain },
    ] : []),
  ];

  useEffect(() => {
    if (isOpen && user?.role === 'teacher') {
      fetchTeacherContent();
    }
  }, [isOpen, user?.role]);

  useEffect(() => {
    if (objectType === 'lesson' || objectType === 'quiz') {
      fetchCourseLessonsAndQuizzes();
    }
  }, [objectType, selectedCourse]);

  const fetchTeacherContent = async () => {
    if (!user?.id) return;

    try {
      // Fetch teacher's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('instructor_id', user.id)
        .eq('status', 'published');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

    } catch (error: any) {
      console.error('Error fetching teacher content:', error);
    }
  };

  const fetchCourseLessonsAndQuizzes = async () => {
    if (!selectedCourse) return;

    try {
      // Fetch lessons for the selected course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, description, course_id')
        .eq('course_id', selectedCourse);

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch quizzes for the selected course
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, description, course_id')
        .eq('course_id', selectedCourse);

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

    } catch (error: any) {
      console.error('Error fetching course content:', error);
    }
  };

  const handleShare = async () => {
    if (!objectType) {
      toast({
        title: 'Error',
        description: 'Please select an object type',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on object type
    if (['course', 'lesson', 'quiz'].includes(objectType)) {
      if (objectType === 'course' && !selectedCourse) {
        toast({
          title: 'Error',
          description: 'Please select a course to share',
          variant: 'destructive',
        });
        return;
      }
      if (objectType === 'lesson' && !selectedLesson) {
        toast({
          title: 'Error',
          description: 'Please select a lesson to share',
          variant: 'destructive',
        });
        return;
      }
      if (objectType === 'quiz' && !selectedQuiz) {
        toast({
          title: 'Error',
          description: 'Please select a quiz to share',
          variant: 'destructive',
        });
        return;
      }
    } else if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      let processedObjectData: any = {};
      let finalTitle = title;
      let finalDescription = description;
      
      // Process object data based on type
      switch (objectType) {
        case 'course':
          const course = courses.find(c => c.id === selectedCourse);
          if (course) {
            finalTitle = course.title;
            finalDescription = course.description || '';
            processedObjectData = { course_id: selectedCourse };
          }
          break;
        case 'lesson':
          const lesson = lessons.find(l => l.id === selectedLesson);
          if (lesson) {
            finalTitle = lesson.title;
            finalDescription = lesson.description || '';
            processedObjectData = { lesson_id: selectedLesson, course_id: selectedCourse };
          }
          break;
        case 'quiz':
          const quiz = quizzes.find(q => q.id === selectedQuiz);
          if (quiz) {
            finalTitle = quiz.title;
            finalDescription = quiz.description || '';
            processedObjectData = { quiz_id: selectedQuiz, course_id: selectedCourse };
          }
          break;
        case 'link':
          processedObjectData = { url: objectData };
          break;
        case 'document':
          processedObjectData = { content: objectData };
          break;
        case 'image':
          processedObjectData = { url: objectData };
          break;
        case 'video':
          processedObjectData = { url: objectData };
          break;
        default:
          processedObjectData = { data: objectData };
      }

      const { error } = await supabase
        .from('group_objects')
        .insert({
          group_id: groupId,
          shared_by: currentUser.id,
          object_type: objectType,
          title: finalTitle.trim(),
          description: finalDescription.trim() || null,
          object_data: processedObjectData
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Object shared successfully!',
      });

      // Reset form
      setObjectType('');
      setTitle('');
      setDescription('');
      setObjectData('');
      setSelectedCourse('');
      setSelectedLesson('');
      setSelectedQuiz('');
      onObjectShared();
      onClose();
    } catch (error: any) {
      console.error('Error sharing object:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to share object',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (objectType) {
      case 'link':
        return 'Enter URL (e.g., https://example.com)';
      case 'document':
        return 'Enter document content or paste text';
      case 'image':
        return 'Enter image URL';
      case 'video':
        return 'Enter video URL (YouTube, Vimeo, etc.)';
      default:
        return 'Enter object data';
    }
  };

  const renderEducationalContentSelector = () => {
    if (objectType === 'course') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Select Course *</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a course to share" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {course.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (objectType === 'lesson') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Course *</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course first" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Lesson *</label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lesson to share" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4" />
                        {lesson.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      );
    }

    if (objectType === 'quiz') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Course *</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course first" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Quiz *</label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a quiz to share" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {quiz.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Object</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Object Type *</label>
            <Select value={objectType} onValueChange={setObjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select object type" />
              </SelectTrigger>
              <SelectContent>
                {objectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderEducationalContentSelector()}

          {!['course', 'lesson', 'quiz'].includes(objectType) && objectType && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter object title"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {objectType === 'document' ? 'Content' : 'URL'}
                </label>
                <Textarea
                  value={objectData}
                  onChange={(e) => setObjectData(e.target.value)}
                  placeholder={getPlaceholderText()}
                  rows={objectType === 'document' ? 4 : 2}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleShare}
              disabled={loading || !objectType}
              className="flex-1"
            >
              {loading ? 'Sharing...' : 'Share Object'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
