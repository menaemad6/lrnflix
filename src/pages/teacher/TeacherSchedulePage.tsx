
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalendarIcon, Clock, Tag, GripVertical, Sparkles, AlertCircle, Target, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

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

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: Date | undefined;
  estimated_hours: string;
  course_id: string | null;
}

const priorityColors: { [key in Task['priority']]: string } = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const statusConfig: { [key in Task['status']]: { title: string; icon: React.ElementType; color: string } } = {
  todo: { title: 'To Do', icon: AlertCircle, color: 'text-gray-500' },
  in_progress: { title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  review: { title: 'Review', icon: Target, color: 'text-orange-500' },
  completed: { title: 'Completed', icon: CheckCircle2, color: 'text-green-500' }
};

export default function TeacherSchedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: undefined,
    estimated_hours: '',
    course_id: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        due_date: editingTask.due_date ? new Date(editingTask.due_date) : undefined,
        estimated_hours: editingTask.estimated_hours?.toString() || '',
        course_id: editingTask.course_id
      });
      setIsDialogOpen(true);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: undefined,
        estimated_hours: '',
        course_id: null
      });
    }
  }, [editingTask]);
  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
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

  // Fetch courses for selection
  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-select'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.user.id)
        .eq('status', 'published');
      
      if (error) throw error;
      return data as Course[];
    }
  });

  // Enhance task with Gemini AI
  const enhanceWithAI = async (basicInfo: { title: string; description: string }) => {
    setIsEnhancing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_GEMINI_BASE_URL}${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on this task info: "${basicInfo.title}" - "${basicInfo.description}", enhance it with educational context and return a JSON object with these fields:
              {
                "enhanced_title": "Clear, actionable task title",
                "enhanced_description": "Detailed description with educational context",
                "suggested_priority": "low|medium|high|urgent",
                "estimated_hours": number,
                "suggested_tags": ["tag1", "tag2", "tag3"]
              }
              
              Consider this is for a teacher managing educational tasks. Make it professional and actionable.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enhance task with AI');
      }

      const data = await response.json();
      const enhanced = JSON.parse(data.candidates[0].content.parts[0].text);
      
      setFormData(prev => ({
        ...prev,
        title: enhanced.enhanced_title || prev.title,
        description: enhanced.enhanced_description || prev.description,
        priority: enhanced.suggested_priority || prev.priority,
        estimated_hours: enhanced.estimated_hours?.toString() || prev.estimated_hours
      }));

      toast({
        title: "Task Enhanced!",
        description: "AI has improved your task details.",
      });
    } catch (error) {
      console.error('Error enhancing task:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance task with AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teacher_schedule_tasks')
        .insert({
          ...taskData,
          teacher_id: user.user.id,
        } as TaskInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule-tasks'] });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: undefined,
        estimated_hours: '',
        course_id: null
      });
      toast({
        title: "Task Created",
        description: "Your task has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
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
      setIsDialogOpen(false);
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teacher_schedule_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule-tasks'] });
      setTaskToDelete(null);
      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
      setTaskToDelete(null);
    }
  });
  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !tasks) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      // Moving between columns - update status
      const newStatus = destination.droppableId as Task['status'];
      updateTaskStatusMutation.mutate({
        id: draggableId,
        updates: { status: newStatus }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskPayload = {
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      due_date: formData.due_date ? formData.due_date.toISOString() : null,
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours, 10) : null,
      course_id: formData.course_id || null,
    };

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        updates: taskPayload,
      });
    } else {
      createTaskMutation.mutate({
        ...taskPayload,
        status: 'todo',
        order_index: (tasks?.filter(t => t.status === 'todo').length || 0)
      });
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks?.filter(task => task.status === status) || [];
  };

  const TaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "mb-3 cursor-pointer transition-all hover:shadow-md",
            snapshot.isDragging && "rotate-2 shadow-lg"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
              <div {...provided.dragHandleProps}>
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              <Badge 
                variant="outline" 
                className={cn("text-xs", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              
              {task.estimated_hours && (
                <Badge variant="default" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.estimated_hours}h
                </Badge>
              )}
            </div>
            
            {task.due_date && (
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {format(new Date(task.due_date), 'MMM dd')}
              </div>
            )}
             <div className="flex items-center justify-end mt-4 gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTask(task)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTaskToDelete(task)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const Column = ({ status, title, icon: Icon, color }: { 
    status: Task['status']; 
    title: string; 
    icon: React.ElementType; 
    color: string;
  }) => {
    const columnTasks = getTasksByStatus(status);
    
    return (
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", color)} />
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="default" className="text-xs">
              {columnTasks.length}
            </Badge>
          </div>
        </div>
        
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-colors",
                snapshot.isDraggingOver 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 bg-transparent"
              )}
            >
              {columnTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  if (tasksLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Schedule Tasks</h1>
            <p className="text-muted-foreground">Manage your teaching tasks and schedule</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
              setEditingTask(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTask(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update the details of your task.' : 'Add a new task to your schedule. AI can help enhance it!'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => enhanceWithAI({ title: formData.title, description: formData.description })}
                  disabled={isEnhancing || !formData.title || !formData.description}
                  className="w-full"
                >
                  {isEnhancing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance with AI
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
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
                    <label className="text-sm font-medium">Est. Hours</label>
                    <Input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="Hours"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date as Date | undefined }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {courses && courses.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Related Course</label>
                    <Select 
                      value={formData.course_id || 'no-course'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value === 'no-course' ? null : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-course">No course</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setEditingTask(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                    {editingTask 
                      ? (updateTaskMutation.isPending ? "Updating..." : "Update Task")
                      : (createTaskMutation.isPending ? "Creating..." : "Create Task")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Column
                key={status}
                status={status as Task['status']}
                title={config.title}
                icon={config.icon}
                color={config.color}
              />
            ))}
          </div>
        </DragDropContext>
         <Dialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the task from your schedule.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaskToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => taskToDelete && deleteTaskMutation.mutate(taskToDelete.id)}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
