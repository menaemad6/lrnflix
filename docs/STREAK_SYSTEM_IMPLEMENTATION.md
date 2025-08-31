# Study Streak System Implementation

## Overview

The study streak system has been completely refactored to calculate streaks based on actual user activity data instead of random numbers. The system now tracks various learning activities and calculates consecutive days of study.

## Features

### 1. Real-time Streak Calculation
- **Lesson Completions**: Tracks when users complete lessons
- **Quiz Attempts**: Counts quiz attempts and submissions
- **Lesson Views**: Monitors lesson viewing activity
- **AI Calls**: Tracks AI tutoring sessions
- **Course Enrollments**: Records new course enrollments

### 2. Smart Streak Logic
- **Consecutive Days**: Only counts consecutive days with activity
- **Today's Activity**: Shows if user has already studied today
- **Streak Maintenance**: Provides motivation to maintain streaks
- **Milestone Tracking**: Progress towards 7, 30, and 100 day milestones

### 3. Visual Indicators
- **Streak Badges**: Different badges based on streak length
  - Getting Started (0-6 days)
  - On Fire (7-29 days)
  - Consistent (30-99 days)
  - Legendary (100+ days)
- **Progress Bars**: Visual progress towards next milestone
- **Motivational Messages**: Contextual encouragement based on streak status

## Components

### 1. `StreakProgress` Component
A comprehensive streak display component with two modes:

```tsx
// Compact mode for headers
<StreakProgress userId={userId} compact={true} />

// Full mode with motivation and progress
<StreakProgress userId={userId} showMotivation={true} />
```

### 2. `useStudyStreak` Hook
Custom hook for managing streak data:

```tsx
const {
  currentStreak,
  longestStreak,
  hasActivityToday,
  isLoading,
  getStreakMotivation,
  isOnFire,
  isConsistent,
  isLegendary
} = useStudyStreak({ userId });
```

### 3. `useSimpleStreak` Hook
Simplified hook for just getting the streak number:

```tsx
const { data: streak } = useSimpleStreak(userId);
```

## Database Tables Used

The streak system analyzes data from these tables:
- `lesson_progress` - Completed lessons
- `quiz_attempts` - Quiz attempts and scores
- `lesson_views` - Lesson viewing activity
- `student_call_history` - AI tutoring sessions
- `enrollments` - Course enrollments

## Implementation Details

### 1. Streak Calculation Algorithm
```typescript
// 1. Collect all activity dates from various sources
// 2. Sort dates in descending order
// 3. Calculate consecutive days from most recent activity
// 4. Handle edge cases (no activity today, breaks in streak)
```

### 2. Activity Definition
A day counts towards the streak if the user:
- Completes a lesson
- Attempts or submits a quiz
- Views a lesson
- Has an AI tutoring session
- Enrolls in a new course

### 3. Caching and Performance
- Uses React Query for efficient data fetching
- Implements stale time and garbage collection
- Auto-refresh functionality for real-time updates
- Optimized database queries with proper indexing

## Usage Examples

### 1. In Dashboard Header
```tsx
import { StreakProgress } from '@/components/student/StreakProgress';

// Compact display for header
<StreakProgress userId={user.id} compact={true} />
```

### 2. In Profile Stats
```tsx
import { useStudyStreak } from '@/hooks/useStudyStreak';

const { currentStreak, hasActivityToday } = useStudyStreak({ userId: user.id });

// Display streak information
<div className="streak-display">
  <span>{currentStreak} day streak</span>
  {hasActivityToday && <span>✓ Today</span>}
</div>
```

### 3. In Learning Goals
```tsx
// The StudentGoals component automatically uses the calculated streak
// No additional implementation needed
```

## Configuration

### 1. Auto-refresh Settings
```tsx
const streakData = useStudyStreak({
  userId,
  autoRefresh: true,        // Enable auto-refresh
  refreshInterval: 30000    // Refresh every 30 seconds
});
```

### 2. Translation Keys
Add these keys to your translation files:
```json
{
  "studentProfile": {
    "studyStreak": "Study Streak",
    "consecutiveDays": "consecutive days",
    "startYourStreak": "Start your streak today!",
    "bestStreak": "Best: {{count}} days",
    "progressToNextMilestone": "Progress to next milestone",
    "maxed": "Maxed!",
    "greatJobToday": "🎉 Great job! You've already studied today!",
    "dontBreakStreak": "⚡ Don't break your streak! Study something today!"
  }
}
```

## Migration from Random Streaks

### Before (Random)
```typescript
studyStreak: Math.floor(Math.random() * 15) + 1,
```

### After (Real Calculation)
```typescript
import { getStudyStreak } from '@/utils/streakCalculator';

// Calculate study streak
const studyStreak = await getStudyStreak(user.id);

const stats = {
  // ... other stats
  studyStreak,
  // ... other stats
};
```

## Performance Considerations

1. **Database Queries**: Optimized with proper indexing on date columns
2. **Caching**: React Query handles caching and background updates
3. **Batch Processing**: Multiple activity types are queried in parallel
4. **Lazy Loading**: Streak data is only fetched when needed

## Future Enhancements

1. **Streak Analytics**: Detailed streak history and patterns
2. **Social Features**: Compare streaks with friends
3. **Achievements**: Unlock badges for streak milestones
4. **Notifications**: Reminders to maintain streaks
5. **Export Data**: Allow users to export their streak history

## Troubleshooting

### Common Issues

1. **Streak Not Updating**: Check if the user has recent activity
2. **Performance Issues**: Verify database indexes are properly set
3. **Translation Missing**: Ensure all translation keys are added
4. **Component Not Rendering**: Check if userId is properly passed

### Debug Mode

Enable debug logging by setting environment variable:
```bash
REACT_APP_DEBUG_STREAK=true
```

## Testing

The streak system can be tested by:
1. Completing lessons on consecutive days
2. Taking quizzes on different days
3. Viewing lessons without completing them
4. Having AI tutoring sessions
5. Enrolling in new courses

Each activity should increment the streak counter appropriately.
