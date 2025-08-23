import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'question_answer'
  | 'question_reply'
  | 'course_purchase'
  | 'new_enrollment'
  | 'course_published'
  | 'new_discussion'
  | 'quiz_completion'
  | 'lesson_completion'
  | 'group_invitation'
  | 'system_message';

export interface NotificationTemplate {
  title: string;
  message: string;
  type: NotificationType;
}

export const useNotifications = () => {
  /**
   * Send a single notification to a user
   */
  const sendNotification = useCallback(async (notificationData: NotificationData): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('create-notification', {
        body: notificationData
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error invoking notification function:', error);
      return false;
    }
  }, []);

  /**
   * Send notifications to multiple users
   */
  const sendBulkNotifications = useCallback(async (notifications: NotificationData[]): Promise<boolean[]> => {
    const results = await Promise.allSettled(
      notifications.map(notification => sendNotification(notification))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }, [sendNotification]);

  /**
   * Send notification for question answers
   */
  const notifyQuestionAnswer = useCallback(async (
    questionOwnerId: string,
    answerAuthorName: string,
    questionTitle: string,
    answerContent: string
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: questionOwnerId,
      title: 'New Answer to Your Question',
      message: `${answerAuthorName} answered your question "${questionTitle}": "${answerContent.substring(0, 100)}${answerContent.length > 100 ? '...' : ''}"`,
      type: 'question_answer',
      metadata: {
        questionTitle,
        answerAuthorName,
        answerContent: answerContent.substring(0, 100)
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for question replies
   */
  const notifyQuestionReply = useCallback(async (
    replyTargetId: string,
    replyAuthorName: string,
    questionTitle: string,
    replyContent: string,
    isReplyToAnswer: boolean = true
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: replyTargetId,
      title: isReplyToAnswer ? 'New Reply to Your Answer' : 'New Reply to Your Question',
      message: `${replyAuthorName} replied to your ${isReplyToAnswer ? 'answer' : 'question'} "${questionTitle}": "${replyContent.substring(0, 100)}${replyContent.length > 100 ? '...' : ''}"`,
      type: 'question_reply',
      metadata: {
        questionTitle,
        replyAuthorName,
        replyContent: replyContent.substring(0, 100),
        isReplyToAnswer
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for course purchases
   */
  const notifyCoursePurchase = useCallback(async (
    instructorId: string,
    studentName: string,
    courseTitle: string,
    amountPaid: number
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: instructorId,
      title: 'New Course Purchase!',
      message: `${studentName} purchased your course "${courseTitle}" for ${amountPaid} credits.`,
      type: 'course_purchase',
      metadata: {
        courseTitle,
        studentName,
        amountPaid
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for new enrollments
   */
  const notifyNewEnrollment = useCallback(async (
    instructorId: string,
    studentName: string,
    courseTitle: string
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: instructorId,
      title: 'New Student Enrollment',
      message: `${studentName} enrolled in your course "${courseTitle}".`,
      type: 'new_enrollment',
      metadata: {
        courseTitle,
        studentName
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for course updates
   */
  const notifyCourseUpdate = useCallback(async (
    studentIds: string[],
    courseTitle: string,
    updateType: string
  ): Promise<boolean[]> => {
    const notifications: NotificationData[] = studentIds.map(studentId => ({
      userId: studentId,
      title: 'Course Update',
      message: `Your course "${courseTitle}" has been updated: ${updateType}`,
      type: 'course_published',
      metadata: {
        courseTitle,
        updateType
      }
    }));

    return sendBulkNotifications(notifications);
  }, [sendBulkNotifications]);

  /**
   * Send notification for quiz completions
   */
  const notifyQuizCompletion = useCallback(async (
    studentId: string,
    quizTitle: string,
    score: number,
    totalQuestions: number
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: studentId,
      title: 'Quiz Completed!',
      message: `You completed "${quizTitle}" with a score of ${score}/${totalQuestions}.`,
      type: 'quiz_completion',
      metadata: {
        quizTitle,
        score,
        totalQuestions
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for lesson completions
   */
  const notifyLessonCompletion = useCallback(async (
    studentId: string,
    lessonTitle: string,
    courseTitle: string
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: studentId,
      title: 'Lesson Completed!',
      message: `You completed "${lessonTitle}" in "${courseTitle}". Great job!`,
      type: 'lesson_completion',
      metadata: {
        lessonTitle,
        courseTitle
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send notification for group invitations
   */
  const notifyGroupInvitation = useCallback(async (
    invitedUserId: string,
    groupName: string,
    inviterName: string
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId: invitedUserId,
      title: 'Group Invitation',
      message: `${inviterName} invited you to join the study group "${groupName}".`,
      type: 'group_invitation',
      metadata: {
        groupName,
        inviterName
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send system message notification
   */
  const notifySystemMessage = useCallback(async (
    userId: string,
    title: string,
    message: string
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId,
      title,
      message,
      type: 'system_message',
      metadata: {
        isSystemMessage: true
      }
    };

    return sendNotification(notification);
  }, [sendNotification]);

  /**
   * Send custom notification with any type
   */
  const sendCustomNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    const notification: NotificationData = {
      userId,
      title,
      message,
      type,
      metadata
    };

    return sendNotification(notification);
  }, [sendNotification]);

  return {
    // Core functions
    sendNotification,
    sendBulkNotifications,
    
    // Predefined notification types
    notifyQuestionAnswer,
    notifyQuestionReply,
    notifyCoursePurchase,
    notifyNewEnrollment,
    notifyCourseUpdate,
    notifyQuizCompletion,
    notifyLessonCompletion,
    notifyGroupInvitation,
    notifySystemMessage,
    
    // Custom notifications
    sendCustomNotification
  };
};
