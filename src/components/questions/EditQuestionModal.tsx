import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { RootState } from '@/store/store';

interface Question {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  allow_student_answers: boolean;
  status: string;
}

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onQuestionUpdated: () => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onQuestionUpdated
}) => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_anonymous: false,
    allow_student_answers: true
  });

  // Check if user can edit anonymous setting (only teachers and admins)
  const canEditAnonymous = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        content: question.content,
        is_anonymous: question.is_anonymous,
        allow_student_answers: question.allow_student_answers
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setLoading(true);
    try {
      // Prepare update data
      const updateData: any = {
        title: formData.title,
        content: formData.content,
        allow_student_answers: formData.allow_student_answers,
        updated_at: new Date().toISOString()
      };

      // Only include is_anonymous if user can edit it (teachers/admins)
      if (canEditAnonymous) {
        updateData.is_anonymous = formData.is_anonymous;
      }

      const { error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });

      onQuestionUpdated();
      onClose();
    } catch (error: unknown) {
      console.error('Error updating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Question</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter question title..."
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Question Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Describe your question in detail..."
              required
              className="min-h-[200px] w-full"
            />
          </div>

          <div className="space-y-4">
            {/* Only show anonymous toggle for teachers and admins */}
            {canEditAnonymous && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous">Post Anonymously</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your identity when posting this question
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-answers">Allow Student Answers</Label>
                <p className="text-sm text-muted-foreground">
                  Let other students answer this question
                </p>
              </div>
              <Switch
                id="allow-answers"
                checked={formData.allow_student_answers}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_student_answers: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Question'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 