
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { MessageSquare, Users, Send, FileText, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'new-course',
    name: 'New Course Available',
    content: 'Hello {studentName}! 🎓 Exciting news! A new course "{courseTitle}" is now available. Check it out in your dashboard and start learning today!',
    variables: ['studentName', 'courseTitle']
  },
  {
    id: 'new-lecture',
    name: 'New Lecture Posted',
    content: 'Hi {studentName}! 📚 A new lecture "{lectureTitle}" has been added to your course "{courseTitle}". Don\'t miss out on the latest content!',
    variables: ['studentName', 'lectureTitle', 'courseTitle']
  },
  {
    id: 'new-quiz',
    name: 'New Quiz Available',
    content: 'Hello {studentName}! 📝 A new quiz "{quizTitle}" is ready for you in "{courseTitle}". Test your knowledge and see how well you\'ve learned!',
    variables: ['studentName', 'quizTitle', 'courseTitle']
  },
  {
    id: 'live-lecture-reminder',
    name: 'Live Lecture Reminder',
    content: 'Hi {studentName}! ⏰ Reminder: Live lecture "{lectureTitle}" starts at {startTime}. Join us at: {meetLink}',
    variables: ['studentName', 'lectureTitle', 'startTime', 'meetLink']
  },
  {
    id: 'assignment-deadline',
    name: 'Assignment Deadline Reminder',
    content: 'Hello {studentName}! ⚠️ Reminder: Your assignment "{assignmentTitle}" is due on {dueDate}. Don\'t forget to submit it on time!',
    variables: ['studentName', 'assignmentTitle', 'dueDate']
  },
  {
    id: 'custom',
    name: 'Custom Message',
    content: '',
    variables: ['studentName']
  }
];

export const AnnouncementsTab = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { sendBulkMessages, isLoading } = useWhatsApp();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the course IDs for this teacher
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', user.id);

      if (courseError) throw courseError;

      const courseIds = courseData?.map(course => course.id) || [];

      if (courseIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Get students enrolled in teacher's courses
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('course_id', courseIds);

      if (enrollmentError) throw enrollmentError;

      const studentIds = [...new Set(enrollmentData?.map(e => e.student_id) || [])];

      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Get student profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number')
        .in('id', studentIds);

      if (profileError) throw profileError;

      setStudents(profileData || []);
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

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.content);
      // Reset template variables
      const newVariables: Record<string, string> = {};
      template.variables.forEach(variable => {
        newVariables[variable] = '';
      });
      setTemplateVariables(newVariables);
    }
  };

  const replaceTemplateVariables = (message: string, studentName: string): string => {
    let finalMessage = message.replace('{studentName}', studentName);
    Object.entries(templateVariables).forEach(([key, value]) => {
      finalMessage = finalMessage.replace(`{${key}}`, value);
    });
    return finalMessage;
  };

  const handleSendMessages = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select at least one student to send the message.',
        variant: 'destructive',
      });
      return;
    }

    if (!customMessage.trim()) {
      toast({
        title: 'No Message',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    const selectedStudentsList = students.filter(s => selectedStudents.has(s.id));
    const studentsWithoutPhone = selectedStudentsList.filter(s => !s.phone_number);
    
    if (studentsWithoutPhone.length > 0) {
      toast({
        title: 'Missing Phone Numbers',
        description: `${studentsWithoutPhone.length} students don't have phone numbers. Messages will only be sent to students with valid phone numbers.`,
        variant: 'destructive',
      });
    }

    const validStudents = selectedStudentsList.filter(s => s.phone_number);
    
    if (validStudents.length === 0) {
      toast({
        title: 'No Valid Recipients',
        description: 'None of the selected students have phone numbers.',
        variant: 'destructive',
      });
      return;
    }

    const messages = validStudents.map(student => ({
      to: student.phone_number!,
      message: replaceTemplateVariables(customMessage, student.full_name || 'Student')
    }));

    await sendBulkMessages(messages);
    
    // Reset form
    setSelectedStudents(new Set());
    setCustomMessage('');
    setSelectedTemplate('');
    setTemplateVariables({});
  };

  const studentsWithPhone = students.filter(s => s.phone_number);
  const studentsWithoutPhone = students.filter(s => !s.phone_number);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">WhatsApp Announcements</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipients
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                <Phone className="h-3 w-3 mr-1" />
                {studentsWithPhone.length} with phone
              </Badge>
              {studentsWithoutPhone.length > 0 && (
                <Badge variant="outline" className="text-orange-600">
                  {studentsWithoutPhone.length} without phone
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedStudents.size === students.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">
                Select All ({students.length} students)
              </Label>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2 p-2 rounded border">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={() => handleStudentToggle(student.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={student.id} className="cursor-pointer">
                      {student.full_name || student.email}
                    </Label>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {student.phone_number ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Phone className="h-3 w-3" />
                          {student.phone_number}
                        </span>
                      ) : (
                        <span className="text-orange-600">No phone number</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Message Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Variables */}
            {selectedTemplate && MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.variables.length > 1 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Template Variables</Label>
                {MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.variables
                  .filter(variable => variable !== 'studentName')
                  .map((variable) => (
                    <div key={variable} className="space-y-1">
                      <Label htmlFor={variable} className="text-xs capitalize">
                        {variable.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={variable}
                        placeholder={`Enter ${variable.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}...`}
                        value={templateVariables[variable] || ''}
                        onChange={(e) => setTemplateVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{studentName}'} to personalize messages with student names.
              </p>
            </div>

            <Button 
              onClick={handleSendMessages}
              disabled={isLoading || selectedStudents.size === 0 || !customMessage.trim()}
              className="w-full"
            >
              {isLoading ? (
                'Sending Messages...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
