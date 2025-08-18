
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface CreateLectureModalProps {
  courseId: string;
  onLectureCreated: () => void;
}

export const CreateLectureModal = ({ courseId, onLectureCreated }: CreateLectureModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: 60
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.title || !formData.start_time) {
        throw new Error('Please fill in all required fields');
      }

      const startTime = new Date(formData.start_time);
      if (startTime <= new Date()) {
        throw new Error('Start time must be in the future');
      }

      const { data, error } = await supabase.functions.invoke('create-meet-lecture', {
        body: {
          course_id: courseId,
          title: formData.title,
          description: formData.description,
          start_time: startTime.toISOString(),
          duration_minutes: formData.duration_minutes
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Live lecture created successfully!',
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        duration_minutes: 60
      });
      onLectureCreated();

    } catch (error: any) {
      console.error('Error creating lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lecture',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format datetime-local input value
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const now = new Date();
  const minDateTime = formatDateTimeLocal(now);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Live Lecture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Live Lecture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter lecture title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter lecture description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time *</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              min={minDateTime}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
              min={15}
              max={480}
              step={15}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Lecture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
