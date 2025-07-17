import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LiveLecture {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  start_time: string;
  duration_minutes: number;
  google_event_id: string | null;
  meet_link: string | null;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface EditLectureModalProps {
  lecture: LiveLecture;
  onLectureUpdated: () => void;
}

export const EditLectureModal = ({ lecture, onLectureUpdated }: EditLectureModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lecture.title,
    description: lecture.description || '',
    start_time: new Date(lecture.start_time).toISOString().slice(0, 16), // Format for datetime-local input
    duration_minutes: lecture.duration_minutes
  });

  useEffect(() => {
    setFormData({
      title: lecture.title,
      description: lecture.description || '',
      start_time: new Date(lecture.start_time).toISOString().slice(0, 16),
      duration_minutes: lecture.duration_minutes
    });
  }, [lecture]);

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

      // Update lecture in database
      const { error } = await supabase
        .from('live_lectures')
        .update({
          title: formData.title,
          description: formData.description || null,
          start_time: startTime.toISOString(),
          duration_minutes: formData.duration_minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', lecture.id);

      if (error) throw error;

      // If lecture has a Google event, update it as well
      if (lecture.google_event_id) {
        const { error: googleError } = await supabase.functions.invoke('update-meet-lecture', {
          body: {
            lecture_id: lecture.id,
            title: formData.title,
            description: formData.description,
            start_time: startTime.toISOString(),
            duration_minutes: formData.duration_minutes
          }
        });

        if (googleError) {
          console.error('Error updating Google event:', googleError);
          // Don't throw error here as the lecture was updated successfully
          toast({
            title: 'Warning',
            description: 'Lecture updated but Google Calendar event update failed',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Live lecture updated successfully!',
      });

      onLectureUpdated();

    } catch (error: any) {
      console.error('Error updating lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lecture',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={!!lecture} onOpenChange={() => onLectureUpdated()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Live Lecture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter lecture title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
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
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              value={formData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              placeholder="60"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onLectureUpdated()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Lecture'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 