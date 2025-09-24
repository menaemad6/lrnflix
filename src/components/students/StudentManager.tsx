
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, UserMinus, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  enrolled_at: string;
  source: string;
}

interface StudentManagerProps {
  courseId: string;
}

export const StudentManager = ({ courseId }: StudentManagerProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  useEffect(() => {
    const filtered = students.filter(student => 
      (student.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      // First get the enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('student_id, enrolled_at, source')
        .eq('course_id', courseId);

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Then get the profile data for those students
      const studentIds = enrollments.map(e => e.student_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profileError) throw profileError;

      // Combine the data
      const studentsData = enrollments.map(enrollment => {
        const profile = profiles?.find(p => p.id === enrollment.student_id);
        return {
          id: profile?.id || enrollment.student_id,
          full_name: profile?.full_name || null,
          email: profile?.email || 'Unknown',
          enrolled_at: enrollment.enrolled_at,
          source: enrollment.source || 'unknown'
        };
      });

      setStudents(studentsData);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName || 'this student'} from the course?`)) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student removed from course',
      });

      fetchStudents();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Student Management</h3>
          <p className="text-sm text-muted-foreground">
            {students.length} students enrolled
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">
                        <Link to={`/teacher/students/${student.id}`}>
                        {student.full_name || 'No name provided'}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(student.enrolled_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {student.source.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStudent(student.id, student.full_name || student.email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h4 className="text-lg font-semibold mb-2">No students found</h4>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'No students are enrolled in this course yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
