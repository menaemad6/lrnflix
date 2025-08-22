# Quick Usage Guide: useItemOwnershipValidation Hook

## What It Does

The `useItemOwnershipValidation` hook automatically prevents teachers from accessing or editing items (courses, lessons, quizzes, etc.) that belong to other teachers. It redirects unauthorized users and shows error messages.

## Basic Usage

```typescript
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';

const EditPage = ({ course }) => {
  const { validateOwnership } = useItemOwnershipValidation();
  
  useEffect(() => {
    // This will redirect if user doesn't own the course
    validateOwnership(course.creator_id);
  }, [course, validateOwnership]);

  // If we reach here, user owns the course
  return <EditForm course={course} />;
};
```

## Validation Method

### `validateOwnership(creatorId: string)`
```typescript
// Pass the creator ID directly
validateOwnership(course.creator_id);
```

## Custom Options

```typescript
const { validateOwnership } = useItemOwnershipValidation({
  redirectTo: '/dashboard',           // Where to redirect unauthorized users
  showToast: true,                    // Show error message (default: true)
  toastTitle: 'Access Denied',        // Custom error title
  toastDescription: 'Custom message'  // Custom error message
});
```

## What Happens

✅ **If user owns item**: Nothing happens, component continues
❌ **If user doesn't own item**: Shows error toast + redirects to `/unauthorized`
🔐 **If no user logged in**: Redirects to `/auth`

## Complete Example

```typescript
import React, { useEffect } from 'react';
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';

const EditCoursePage = ({ course }) => {
  const { validateOwnership } = useItemOwnershipValidation({
    redirectTo: '/courses',
    toastTitle: 'Course Access Restricted',
    toastDescription: 'You can only edit courses you created'
  });

  useEffect(() => {
    validateOwnership(course.creator_id);
  }, [course, validateOwnership]);

  return (
    <div>
      <h1>Edit Course: {course.title}</h1>
      {/* Your edit form here */}
    </div>
  );
};
```

## When to Use

- ✅ Course edit pages
- ✅ Lesson edit pages
- ✅ Quiz edit pages
- ✅ Any page where users should only access their own content
- ❌ Public viewing pages
- ❌ Admin pages (use role-based validation instead)

## Security Benefits

- Prevents unauthorized access to edit pages
- Automatic redirection for security
- User-friendly error messages
- Comprehensive logging for debugging
- Type-safe implementation

## Need Help?

- Check the full documentation: `ITEM_OWNERSHIP_VALIDATION_README.md`
