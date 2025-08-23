import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export const NotificationExamples = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    notifyQuestionAnswer,
    notifyQuestionReply,
    notifyCoursePurchase,
    notifyNewEnrollment,
    notifyCourseUpdate,
    notifyQuizCompletion,
    notifyLessonCompletion,
    notifyGroupInvitation,
    notifySystemMessage,
    sendCustomNotification
  } = useNotifications();

  const handleTestQuestionAnswer = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyQuestionAnswer(
      user.id,
      'John Doe',
      'How to implement React hooks?',
      'You can use the useState and useEffect hooks to manage state and side effects in functional components.'
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Question answer notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestQuestionReply = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyQuestionReply(
      user.id,
      'Jane Smith',
      'How to implement React hooks?',
      'Great answer! I also found that custom hooks are very useful for reusing logic.',
      true
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Question reply notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestCoursePurchase = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyCoursePurchase(
      user.id,
      'Alice Johnson',
      'Advanced React Patterns',
      150
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Course purchase notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestQuizCompletion = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyQuizCompletion(
      user.id,
      'React Fundamentals Quiz',
      18,
      20
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Quiz completion notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestLessonCompletion = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyLessonCompletion(
      user.id,
      'Introduction to React Hooks',
      'React Fundamentals'
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Lesson completion notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestGroupInvitation = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifyGroupInvitation(
      user.id,
      'Study Group Alpha',
      'Bob Wilson'
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Group invitation notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestSystemMessage = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await notifySystemMessage(
      user.id,
      'System Maintenance',
      'The platform will be undergoing maintenance on Sunday from 2-4 AM. Please save your work.'
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'System message notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const handleTestCustomNotification = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    const success = await sendCustomNotification(
      user.id,
      'Custom Achievement Unlocked!',
      'Congratulations! You have earned the "Early Bird" badge for being active before 9 AM.',
      'system_message',
      { badgeName: 'Early Bird', category: 'achievement' }
    );

    if (success) {
      toast({
        title: 'Success',
        description: 'Custom notification sent!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Hook Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={handleTestQuestionAnswer} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Question Answer</span>
              <span className="text-xs text-muted-foreground">Notify question owner of new answer</span>
            </Button>

            <Button onClick={handleTestQuestionReply} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Question Reply</span>
              <span className="text-xs text-muted-foreground">Notify user of reply to their answer</span>
            </Button>

            <Button onClick={handleTestCoursePurchase} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Course Purchase</span>
              <span className="text-xs text-muted-foreground">Notify instructor of course sale</span>
            </Button>

            <Button onClick={handleTestQuizCompletion} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Quiz Completion</span>
              <span className="text-xs text-muted-foreground">Notify student of quiz results</span>
            </Button>

            <Button onClick={handleTestLessonCompletion} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Lesson Completion</span>
              <span className="text-xs text-muted-foreground">Notify student of lesson progress</span>
            </Button>

            <Button onClick={handleTestGroupInvitation} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Group Invitation</span>
              <span className="text-xs text-muted-foreground">Notify user of group invitation</span>
            </Button>

            <Button onClick={handleTestSystemMessage} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">System Message</span>
              <span className="text-xs text-muted-foreground">Send system-wide notifications</span>
            </Button>

            <Button onClick={handleTestCustomNotification} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="font-semibold">Custom Notification</span>
              <span className="text-xs text-muted-foreground">Send custom notifications with metadata</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">How to Use:</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This component demonstrates how to use the <code>useNotifications</code> hook for various notification types.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Each button will send a test notification to your own account, so you can see how different notification types appear in your notification center.
            </p>
            <p className="text-sm text-muted-foreground">
              Check your notifications page to see the results!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
