
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { generateQuestionTitle } from '@/utils/geminiTitleGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, HelpCircle, Users, Eye, EyeOff, Sparkles } from 'lucide-react';
import type { RootState } from '@/store/store';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionCreated: () => void;
}

export const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onClose,
  onQuestionCreated,
}) => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    is_anonymous: false,
    allow_student_answers: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to ask a question',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your question',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Generate title using AI
      setGeneratingTitle(true);
      let generatedTitle = '';
      
      try {
        generatedTitle = await generateQuestionTitle(formData.content);
      } catch (titleError) {
        console.warn('Title generation failed, using fallback:', titleError);
        // Fallback title generation
        generatedTitle = formData.content.split(' ').slice(0, 8).join(' ');
        if (generatedTitle.length > 50) {
          generatedTitle = generatedTitle.substring(0, 47) + '...';
        }
      }
      setGeneratingTitle(false);

      const { error } = await supabase
        .from('questions')
        .insert({
          student_id: user.id,
          title: generatedTitle,
          content: formData.content.trim(),
          is_anonymous: formData.is_anonymous,
          allow_student_answers: formData.allow_student_answers,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your question has been posted successfully!',
      });

      setFormData({
        content: '',
        is_anonymous: false,
        allow_student_answers: true,
      });

      onQuestionCreated();
    } catch (error: any) {
      console.error('Error creating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to post question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setGeneratingTitle(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl gradient-text">
            <HelpCircle className="h-6 w-6" />
            Ask a Question
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your question with the community. Our AI will automatically generate a professional title for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
              Your Question *
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">(Title will be generated automatically)</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Describe your question in detail. Be specific about what you need help with..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="glass min-h-[120px]"
              required
            />
            {generatingTitle && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating professional title...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.is_anonymous ? (
                      <EyeOff className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <Label htmlFor="anonymous" className="text-sm font-medium">
                        Post Anonymously
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Hide your identity from other users
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_anonymous: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <Label htmlFor="student-answers" className="text-sm font-medium">
                        Allow Student Answers
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Let other students answer your question
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="student-answers"
                    checked={formData.allow_student_answers}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allow_student_answers: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || generatingTitle}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : generatingTitle ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Title...
                </>
              ) : (
                'Post Question'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
