# Platform Indicator Implementation for QuestionCard

## Overview
This implementation adds a "Asked in your platform" indicator to the QuestionCard component when a question's `instructor_id` matches the current user's tenant ID.

## Changes Made

### 1. QuestionCard.tsx Updates
- **File**: `src/components/questions/QuestionCard.tsx`
- **Changes**:
  - Added `useTenant` hook import to access current tenant information
  - Updated `Question` interface to include `instructor_id: string | null`
  - Added platform indicator badge that shows when `question.instructor_id === teacher?.id`

### 2. Translation Updates
- **English**: `src/i18n/locales/en/other.json`
  - Added `"askedInYourPlatform": "Asked in your platform"` to badges section
- **Arabic**: `src/i18n/locales/ar/other.json`
  - Added `"askedInYourPlatform": "سُئل في منصتك"` to badges section

## Implementation Details

### Platform Indicator Logic
```typescript
{/* Platform Indicator - Show when question is asked in current user's platform */}
{question.instructor_id && teacher?.id && question.instructor_id === teacher.id && (
  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
    <Users className="h-3 w-3 mr-1" />
    {t('questionsPage.badges.askedInYourPlatform')}
  </Badge>
)}
```

### Badge Styling
- **Color**: Emerald green (`text-emerald-500`)
- **Background**: Light emerald with transparency (`bg-emerald-500/5`)
- **Border**: Emerald with transparency (`border-emerald-500/30`)
- **Icon**: Users icon to represent platform/community

### When It Shows
The platform indicator appears when:
1. The question has an `instructor_id` (not NULL)
2. The current user has a tenant context (`teacher?.id` exists)
3. The question's `instructor_id` matches the current user's tenant ID

## User Experience

### For Instructors/Tenant Owners
- **With Platform**: See "Asked in your platform" badge on questions from their students
- **Without Platform**: No special indicator shown

### For Students
- **With Platform**: See "Asked in your platform" badge on questions from their instructor's platform
- **Without Platform**: No special indicator shown

### For Global Users (No Tenant)
- No platform indicator shown (as expected)

## Visual Placement
The platform indicator badge is positioned in the badges section at the top of the question card, alongside:
- Status badges (Open, Resolved, Closed)
- Admin-only indicator
- Anonymous indicator

## Benefits

1. **Clear Ownership**: Users can easily identify questions from their own platform
2. **Community Awareness**: Helps users understand which questions belong to their learning community
3. **Visual Consistency**: Follows the existing badge design pattern
4. **Multilingual Support**: Available in both English and Arabic
5. **Conditional Display**: Only shows when relevant, avoiding clutter

## Testing Scenarios

1. **Question from User's Platform**: Verify badge appears with correct text and styling
2. **Question from Different Platform**: Verify no badge appears
3. **Global Question (NULL instructor_id)**: Verify no badge appears
4. **User Without Tenant**: Verify no badge appears
5. **Language Switching**: Verify badge text changes between English and Arabic

## Future Enhancements

Potential improvements could include:
- Different badge colors for different platform types
- Platform name display in the badge
- Filtering questions by platform
- Platform-specific question statistics
