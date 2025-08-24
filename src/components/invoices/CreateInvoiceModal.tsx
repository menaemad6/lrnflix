import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  course_id: string;
}

interface Quiz {
  id: string;
  title: string;
  course_id: string;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const { useCreateInvoice } = useInvoices();
  const createInvoiceMutation = useCreateInvoice();

  const [formData, setFormData] = useState({
    student_id: '',
    item_id: '',
    item_type: 'course' as 'course' | 'chapter' | 'lesson' | 'quiz',
    total_price: '',
    payment_type: 'vodafone_cash' as 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'wallet',
    notes: '',
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchTeacherItems();
    }
  }, [isOpen, user?.id]);

  const fetchTeacherItems = async () => {
    if (!user?.id) return;

    try {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (coursesData) setCourses(coursesData);

      // Fetch chapters
      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (chaptersData) setChapters(chaptersData);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, title, course_id')
        .eq('instructor_id', user.id);

      if (lessonsData) setLessons(lessonsData);

      // Fetch quizzes
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('id, title, course_id')
        .eq('instructor_id', user.id);

      if (quizzesData) setQuizzes(quizzesData);

      // Fetch students (users who have enrolled in the teacher's courses)
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          course:courses!enrollments_course_id_fkey(instructor_id)
        `)
        .eq('course.instructor_id', user.id);

      if (enrollmentsData && enrollmentsData.length > 0) {
        const studentIds = [...new Set(enrollmentsData.map(e => e.student_id))];
        
        // Fetch student profiles
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (studentsData) {
          setStudents(studentsData);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher items:', error);
    }
  };

  const getItemsByType = () => {
    switch (formData.item_type) {
      case 'course':
        return courses;
      case 'chapter':
        return chapters;
      case 'lesson':
        return lessons;
      case 'quiz':
        return quizzes;
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!formData.student_id || !formData.item_id || !formData.total_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createInvoiceMutation.mutateAsync({
        user_id: formData.student_id,
        instructor_id: user.id,
        item_id: formData.item_id,
        item_type: formData.item_type,
        total_price: parseFloat(formData.total_price),
        payment_type: formData.payment_type,
        status: 'pending',
        notes: formData.notes || undefined,
      });

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      // Reset form
      setFormData({
        student_id: '',
        item_id: '',
        item_type: 'course',
        total_price: '',
        payment_type: 'vodafone_cash',
        notes: '',
      });

      onInvoiceCreated();
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student_id">Select Student</Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, student_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name || student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_type">Item Type</Label>
            <Select
              value={formData.item_type}
              onValueChange={(value: 'course' | 'chapter' | 'lesson' | 'quiz') =>
                setFormData(prev => ({ ...prev, item_type: value, item_id: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="chapter">Chapter</SelectItem>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_id">Select Item</Label>
            <Select
              value={formData.item_id}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, item_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {getItemsByType().map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_price">Total Price</Label>
            <Input
              id="total_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_price}
              onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_type">Payment Type</Label>
            <Select
              value={formData.payment_type}
              onValueChange={(value: 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'wallet') =>
                setFormData(prev => ({ ...prev, payment_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
