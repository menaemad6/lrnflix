
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  BookOpen,
  Sparkles,
  AlertCircle,
  Target,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date: string | null;
  estimated_hours: number | null;
  tags: string[] | null;
  course_id: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

const TeacherSchedulePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_date: undefined as Date | undefined,
    estimated_hours: '',
    tags: '',
    course_id: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['teacher-schedule-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_schedule_tasks')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as Task[];
    }
  });

  // Fetch courses for task linking
  const { data: courses = [] } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data as Course[];
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const { data, error } = await supabase
        .from('teacher_schedule_tasks')
        .insert([taskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule-tasks'] });
      setIsCreateModalOpen(false);
      resetNewTask();
      toast({
        title: "Task created successfully!",
        description: "Your new task has been added to the board."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('teacher_schedule_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule-tasks'] });
    }
  });

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      due_date: undefined,
      estimated_hours: '',
      tags: '',
      course_id: ''
    });
  };

  const enhanceWithAI = async () => {
    if (!newTask.title) {
      toast({
        title: "Please enter a task title first",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const prompt = `You are an educational AI assistant. Given this basic task info:
      Title: "${newTask.title}"
      Description: "${newTask.description}"
      
      Please enhance this task with educational context and return a JSON object with:
      {
        "enhanced_description": "A detailed, professional description for an educational task",
        "suggested_priority": "low|medium|high|urgent",
        "estimated_hours": number (1-40),
        "suggested_tags": ["tag1", "tag2", "tag3"] (max 5 educational tags),
        "educational_tips": "Brief tips for completing this educational task effectively"
      }
      
      Focus on educational terminology and make it suitable for a teaching environment.`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to enhance task');

      const result = await response.json();
      const enhanced = JSON.parse(result.response);

      setNewTask(prev => ({
        ...prev,
        description: enhanced.enhanced_description,
        priority: enhanced.suggested_priority,
        estimated_hours: enhanced.estimated_hours.toString(),
        tags: enhanced.suggested_tags.join(', ')
      }));

      toast({
        title: "Task enhanced with AI!",
        description: enhanced.educational_tips
      });
    } catch (error) {
      toast({
        title: "AI enhancement failed",
        description: "Please fill in the details manually.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCreateTask = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const taskData = {
      teacher_id: user.id,
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      status: 'todo' as const,
      due_date: newTask.due_date?.toISOString() || null,
      estimated_hours: newTask.estimated_hours ? parseInt(newTask.estimated_hours) : null,
      tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
      course_id: newTask.course_id || null,
      order_index: tasks.filter(t => t.status === 'todo').length
    };

    createTaskMutation.mutate(taskData);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as Task['status'];
      updateTaskMutation.mutate({
        id: draggableId,
        updates: { status: newStatus }
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Target className="h-5 w-5" />;
      case 'in_progress': return <Clock className="h-5 w-5" />;
      case 'review': return <AlertCircle className="h-5 w-5" />;
      case 'completed': return <CheckCircle2 className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-slate-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-300' },
    { id: 'review', title: 'Review', color: 'border-orange-300' },
    { id: 'completed', title: 'Completed', color: 'border-green-300' }
  ];

  const getTasksByStatus = (status: string) => 
    tasks.filter(task => task.status === status);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-24 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teaching Schedule</h1>
            <p className="text-muted-foreground">Organize and manage your teaching tasks</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={enhanceWithAI}
                    disabled={isEnhancing || !newTask.title}
                    className="flex-shrink-0"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                      setNewTask(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Estimated Hours</Label>
                    <Input
                      type="number"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="Hours"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.due_date ? format(newTask.due_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.due_date}
                          onSelect={(date) => setNewTask(prev => ({ ...prev, due_date: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Course (Optional)</Label>
                    <Select value={newTask.course_id} onValueChange={(value) => 
                      setNewTask(prev => ({ ...prev, course_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newTask.tags}
                    onChange={(e) => setNewTask(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="lesson-planning, grading, meeting..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={!newTask.title || createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(column => (
              <div key={column.id} className="space-y-4">
                <div className={cn("border-b-2 pb-2", column.color)}>
                  <div className="flex items-center gap-2 mb-2">
                    {getColumnIcon(column.id)}
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {getTasksByStatus(column.id).length}
                    </Badge>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[200px] space-y-3 p-2 rounded-lg transition-colors",
                        snapshot.isDraggingOver ? "bg-muted/50" : ""
                      )}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
                                snapshot.isDragging ? "shadow-lg rotate-3" : ""
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {task.title}
                                  </h4>
                                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", getPriorityColor(task.priority))} />
                                </div>

                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    {task.estimated_hours && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {task.estimated_hours}h
                                      </div>
                                    )}
                                    {task.course_id && (
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        Course
                                      </div>
                                    )}
                                  </div>
                                  {task.due_date && (
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      {format(new Date(task.due_date), "MMM d")}
                                    </div>
                                  )}
                                </div>

                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.slice(0, 2).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </DashboardLayout>
  );
};

export default TeacherSchedulePage;
