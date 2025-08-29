# Notification Hook Documentation

## Overview

The `useNotifications` hook is a comprehensive, reusable solution for sending notifications across the Learnify platform. It provides predefined notification types for common scenarios and allows for custom notifications with metadata.

## Features

- **Predefined Notification Types**: Ready-to-use functions for common notification scenarios
- **Custom Notifications**: Flexible system for sending custom notifications with metadata
- **Bulk Notifications**: Send notifications to multiple users simultaneously
- **Error Handling**: Built-in error handling with fallbacks
- **Type Safety**: Full TypeScript support with proper interfaces
- **Real-time Integration**: Works seamlessly with the existing notification system

## Installation

The hook is already integrated into the project. Simply import it where needed:

```typescript
import { useNotifications } from '@/hooks/useNotifications';
```

## Basic Usage

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const MyComponent = () => {
  const { sendNotification, notifyQuestionAnswer } = useNotifications();

  const handleSendNotification = async () => {
    const success = await sendNotification({
      userId: 'user-123',
      title: 'Hello!',
      message: 'This is a test notification',
      type: 'system_message'
    });

    if (success) {
      console.log('Notification sent successfully');
    }
  };

  return (
    <button onClick={handleSendNotification}>
      Send Notification
    </button>
  );
};
```

## Predefined Notification Types

### 1. Question & Answer Notifications

#### `notifyQuestionAnswer`
Notifies a question owner when someone answers their question.

```typescript
const { notifyQuestionAnswer } = useNotifications();

await notifyQuestionAnswer(
  questionOwnerId,        // string - ID of the question owner
  answerAuthorName,       // string - Name of the person answering
  questionTitle,          // string - Title of the question
  answerContent           // string - Content of the answer
);
```

**Example:**
```typescript
await notifyQuestionAnswer(
  'user-123',
  'John Doe',
  'How to implement React hooks?',
  'You can use useState and useEffect hooks...'
);
```

#### `notifyQuestionReply`
Notifies a user when someone replies to their answer or question.

```typescript
const { notifyQuestionReply } = useNotifications();

await notifyQuestionReply(
  replyTargetId,          // string - ID of the user being replied to
  replyAuthorName,        // string - Name of the person replying
  questionTitle,          // string - Title of the question
  replyContent,           // string - Content of the reply
  isReplyToAnswer         // boolean - Whether replying to an answer (true) or question (false)
);
```

**Example:**
```typescript
await notifyQuestionReply(
  'user-456',
  'Jane Smith',
  'How to implement React hooks?',
  'Great answer! I also found...',
  true
);
```

### 2. Course Notifications

#### `notifyCoursePurchase`
Notifies an instructor when a student purchases their course.

```typescript
const { notifyCoursePurchase } = useNotifications();

await notifyCoursePurchase(
  instructorId,           // string - ID of the course instructor
  studentName,            // string - Name of the student
  courseTitle,            // string - Title of the course
  amountPaid              // number - Amount paid in credits
);
```

#### `notifyNewEnrollment`
Notifies an instructor when a student enrolls in their course.

```typescript
const { notifyNewEnrollment } = useNotifications();

await notifyNewEnrollment(
  instructorId,           // string - ID of the course instructor
  studentName,            // string - Name of the student
  courseTitle             // string - Title of the course
);
```

#### `notifyCourseUpdate`
Notifies multiple students about course updates.

```typescript
const { notifyCourseUpdate } = useNotifications();

await notifyCourseUpdate(
  studentIds,             // string[] - Array of student IDs
  courseTitle,            // string - Title of the course
  updateType               // string - Description of the update
);
```

### 3. Learning Progress Notifications

#### `notifyQuizCompletion`
Notifies a student when they complete a quiz.

```typescript
const { notifyQuizCompletion } = useNotifications();

await notifyQuizCompletion(
  studentId,              // string - ID of the student
  quizTitle,              // string - Title of the quiz
  score,                  // number - Student's score
  totalQuestions          // number - Total number of questions
);
```

#### `notifyLessonCompletion`
Notifies a student when they complete a lesson.

```typescript
const { notifyLessonCompletion } = useNotifications();

await notifyLessonCompletion(
  studentId,              // string - ID of the student
  lessonTitle,            // string - Title of the lesson
  courseTitle             // string - Title of the course
);
```

### 4. Group & Social Notifications

#### `notifyGroupInvitation`
Notifies a user when they're invited to join a study group.

```typescript
const { notifyGroupInvitation } = useNotifications();

await notifyGroupInvitation(
  invitedUserId,          // string - ID of the invited user
  groupName,              // string - Name of the group
  inviterName             // string - Name of the person inviting
);
```

### 5. System Notifications

#### `notifySystemMessage`
Sends a system message notification to a user.

```typescript
const { notifySystemMessage } = useNotifications();

await notifySystemMessage(
  userId,                 // string - ID of the user
  title,                  // string - Notification title
  message                 // string - Notification message
);
```

## Custom Notifications

### `sendCustomNotification`
Send a notification with any type and custom metadata.

```typescript
const { sendCustomNotification } = useNotifications();

await sendCustomNotification(
  userId,                 // string - ID of the user
  title,                  // string - Notification title
  message,                // string - Notification message
  type,                   // NotificationType - Type of notification
  metadata                // Record<string, any> - Optional metadata
);
```

**Example:**
```typescript
await sendCustomNotification(
  'user-123',
  'Achievement Unlocked!',
  'Congratulations! You earned the "Early Bird" badge.',
  'system_message',
  { 
    badgeName: 'Early Bird', 
    category: 'achievement',
    points: 100 
  }
);
```

## Bulk Operations

### `sendBulkNotifications`
Send notifications to multiple users simultaneously.

```typescript
const { sendBulkNotifications } = useNotifications();

const notifications = [
  {
    userId: 'user-1',
    title: 'Welcome!',
    message: 'Welcome to our platform',
    type: 'system_message'
  },
  {
    userId: 'user-2',
    title: 'Welcome!',
    message: 'Welcome to our platform',
    type: 'system_message'
  }
];

const results = await sendBulkNotifications(notifications);
// Returns array of boolean results indicating success/failure for each notification
```

## Core Functions

### `sendNotification`
Send a single notification with full control over the data.

```typescript
const { sendNotification } = useNotifications();

await sendNotification({
  userId: 'user-123',
  title: 'Custom Title',
  message: 'Custom message content',
  type: 'custom_type',
  metadata: { key: 'value' }
});
```

## Integration Examples

### 1. Question Answers Component

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const QuestionAnswers = ({ questionId, questionTitle, questionOwnerId }) => {
  const { notifyQuestionAnswer, notifyQuestionReply } = useNotifications();

  const handleSubmitAnswer = async (content) => {
    // ... submit answer logic ...

    // Send notification to question owner
    if (questionOwnerId && questionOwnerId !== user.id) {
      await notifyQuestionAnswer(
        questionOwnerId,
        user.full_name || 'Anonymous User',
        questionTitle,
        content
      );
    }
  };

  const handleSubmitReply = async (parentId, content) => {
    // ... submit reply logic ...

    // Send notification to the person being replied to
    const parentData = await getParentData(parentId);
    if (parentData && parentData.user_id !== user.id) {
      await notifyQuestionReply(
        parentData.user_id,
        user.full_name || 'Anonymous User',
        questionTitle,
        content,
        !parentData.parent_id // true if replying to answer, false if replying to question
      );
    }
  };
};
```

### 2. Course Purchase

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const PurchaseModal = ({ course, user }) => {
  const { notifyCoursePurchase } = useNotifications();

  const handlePurchase = async () => {
    // ... purchase logic ...

    // Notify instructor
    await notifyCoursePurchase(
      course.instructor_id,
      user.full_name || 'A student',
      course.title,
      amountPaid
    );
  };
};
```

### 3. Quiz Completion

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const QuizComponent = ({ quiz, user }) => {
  const { notifyQuizCompletion } = useNotifications();

  const handleQuizComplete = async (score, totalQuestions) => {
    // ... quiz completion logic ...

    // Notify student
    await notifyQuizCompletion(
      user.id,
      quiz.title,
      score,
      totalQuestions
    );
  };
};
```

## Error Handling

The hook includes built-in error handling:

```typescript
const { notifyQuestionAnswer } = useNotifications();

try {
  const success = await notifyQuestionAnswer(
    questionOwnerId,
    authorName,
    questionTitle,
    answerContent
  );

  if (success) {
    console.log('Notification sent successfully');
  } else {
    console.log('Failed to send notification');
  }
} catch (error) {
  console.error('Error in notification process:', error);
  // Handle error appropriately
}
```

## Notification Types

The hook supports these notification types:

- `question_answer` - New answer to a question
- `question_reply` - Reply to an answer or question
- `course_purchase` - Course purchase notification
- `new_enrollment` - New student enrollment
- `course_published` - Course update notification
- `new_discussion` - New discussion activity
- `quiz_completion` - Quiz completion notification
- `lesson_completion` - Lesson completion notification
- `group_invitation` - Group invitation
- `system_message` - System message

## Metadata Support

All notifications can include optional metadata for additional context:

```typescript
await notifyQuestionAnswer(
  questionOwnerId,
  authorName,
  questionTitle,
  answerContent
);

// The hook automatically adds metadata:
// {
//   questionTitle: "How to implement React hooks?",
//   answerAuthorName: "John Doe",
//   answerContent: "You can use useState..."
// }
```

## Best Practices

1. **Always check user existence**: Ensure the user exists before sending notifications
2. **Handle errors gracefully**: Don't let notification failures break main functionality
3. **Use appropriate types**: Choose the most relevant notification type for your use case
4. **Include meaningful content**: Provide clear, actionable notification messages
5. **Respect user preferences**: Consider user notification settings in the future
6. **Test notifications**: Use the example component to test different notification types

## Testing

Use the `NotificationExamples` component to test all notification types:

```typescript
import { NotificationExamples } from '@/components/examples/NotificationExamples';

// Add to any page to test notifications
<NotificationExamples />
```

## Future Enhancements

- **Notification Preferences**: User-configurable notification settings
- **Email Notifications**: Integration with email service
- **Push Notifications**: Browser push notification support
- **Notification Templates**: Customizable notification templates
- **Scheduled Notifications**: Send notifications at specific times
- **Notification Analytics**: Track notification engagement

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check that the user ID is correct and the user exists
2. **Permission errors**: Ensure the Supabase function has proper permissions
3. **Type errors**: Verify that all required parameters are provided
4. **Real-time updates**: Check that the notification center is properly subscribed

### Debug Mode

Enable console logging to debug notification issues:

```typescript
// The hook automatically logs errors to console
// Check browser console for detailed error messages
```

## Support

For issues or questions about the notification hook:

1. Check the console for error messages
2. Verify all required parameters are provided
3. Test with the example component
4. Check Supabase function logs
5. Review the notification center implementation

---

This hook provides a robust foundation for all notification needs across the Learnify platform. It's designed to be easy to use while maintaining flexibility for complex scenarios.
