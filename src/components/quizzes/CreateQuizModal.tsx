
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileQuestion } from 'lucide-react';

interface CreateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onQuizCreated: () => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  open,
  onOpenChange,
  courseId,
  onQuizCreated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'assignment',
    time_limit: 60,
    max_attempts: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a quiz title',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('quizzes')
        .insert({
          course_id: courseId,
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          time_limit: formData.time_limit,
          max_attempts: formData.max_attempts,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Quiz created successfully!',
      });

      setFormData({
        title: '',
        description: '',
        type: 'quiz',
        time_limit: 60,
        max_attempts: 1
      });
      onOpenChange(false);
      onQuizCreated();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create quiz',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-orange-500" />
            Create New Quiz
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quiz Title</label>
              <Input
                placeholder="Enter quiz title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value: 'quiz' | 'assignment') => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Quiz description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 60 }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Attempts</label>
              <Input
                type="number"
                value={formData.max_attempts}
                onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="btn-primary flex-1" disabled={loading}>
              <FileQuestion className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
