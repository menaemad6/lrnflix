# useTenantItemValidation Hook Documentation

## Overview

The `useTenantItemValidation` hook is a reusable React hook that provides tenant-based access control for items in a multi-tenant application. It automatically validates whether the current user has access to specific content based on tenant ownership and handles unauthorized access gracefully.

## Features

- **Automatic Validation**: Checks if items belong to the current tenant
- **Flexible Creator Field Detection**: Automatically detects various creator ID fields
- **Manual Creator ID Validation**: Direct validation with specific creator IDs for more control
- **Built-in Error Handling**: Shows toast notifications and redirects unauthorized users
- **Customizable Options**: Configurable toast messages and redirect destinations
- **Platform Mode Support**: Works in both tenant and platform modes
- **Debug Logging**: Console logs for troubleshooting validation issues

## Import

```typescript
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
```

## Basic Usage

```typescript
const { validateAndHandle } = useTenantItemValidation();

// Validate an item (e.g., course, chapter, lesson)
useEffect(() => {
  if (course) {
    validateAndHandle(course);
  }
}, [course]);
```

## Advanced Usage with Custom Options

```typescript
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/unauthorized',
  showToast: true,
  toastTitle: 'Access Denied',
  toastDescription: 'You do not have permission to view this content'
});

// Validate with custom error handling
useEffect(() => {
  if (item) {
    validateAndHandle(item);
  }
}, [item]);
```

## Manual Creator ID Validation

For cases where you need more control over validation or when the item structure doesn't match expected patterns:

```typescript
const { validateWithCreatorId } = useTenantItemValidation({
  redirectTo: '/dashboard',
  toastTitle: 'Course Access Denied',
  toastDescription: 'This course is not available in your learning platform'
});

// Validate with specific creator ID
useEffect(() => {
  if (course) {
    validateWithCreatorId(course.instructor_id);
  }
}, [course]);
```

## Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirectTo` | `string` | `'/'` | URL to redirect unauthorized users |
| `showToast` | `boolean` | `true` | Whether to show error toast notifications |
| `toastTitle` | `string` | `'Content Unavailable'` | Title for error toast |
| `toastDescription` | `string` | `'This content is not available in your platform'` | Description for error toast |

## Supported Creator Fields

The hook automatically detects creator ownership using these fields (in order of priority):

1. `instructor_id` - For instructor-created content
2. `creator_id` - For general creator identification
3. `user_id` - For user-created content
4. `teacher_id` - For teacher-created content

## Content Types and Validation Patterns

Different content types use different creator fields:

### Courses
- **Field**: `instructor_id`
- **Usage**: `validateWithCreatorId(course.instructor_id)`
- **Example**: Course pages, course progress, course view

### Chapters
- **Field**: `instructor_id` (inherited from courses)
- **Usage**: `validateWithCreatorId(chapter.instructor_id)`
- **Example**: Chapter detail pages

### Groups
- **Field**: `created_by`
- **Usage**: `validateWithCreatorId(group.created_by)`
- **Example**: Group detail pages, group management

### Lessons & Quizzes
- **Field**: Inherit from parent course (`instructor_id`)
- **Usage**: `validateWithCreatorId(course.instructor_id)`
- **Example**: Lesson content, quiz taking

### Other Content
- **Field**: Varies by content type
- **Usage**: Check the specific table structure
- **Example**: Discussions, assignments, etc.

## How It Works

1. **Tenant Check**: If no tenant context exists (platform mode), access is allowed
2. **Creator Detection**: Automatically finds the creator ID from the item
3. **Ownership Validation**: Compares creator ID with current tenant's user ID
4. **Access Control**: 
   - If valid: No action taken
   - If invalid: Shows toast and redirects to specified URL

## Important Notes on ID Comparison

The hook compares the following IDs:
- **`teacher.user_id`**: The profile ID from the teachers table (from TenantContext)
- **`item.instructor_id`**: The profile ID from the courses/chapters table

Both IDs reference the same `profiles` table, so they should match if the content belongs to the current tenant.

## Example Implementation

### Basic Course Validation

```typescript
import React, { useEffect } from 'react';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';

const CoursePage = () => {
  const { validateAndHandle } = useTenantItemValidation();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (course) {
      validateAndHandle(course);
    }
  }, [course]);

  // ... rest of component
};
```

### Manual Creator ID Validation (Recommended)

```typescript
const { validateWithCreatorId } = useTenantItemValidation({
  redirectTo: '/dashboard',
  toastTitle: 'Course Access Denied',
  toastDescription: 'This course is not available in your learning platform'
});

useEffect(() => {
  if (course) {
    // More explicit and reliable validation
    validateWithCreatorId(course.instructor_id);
  }
}, [course]);
```

### Multiple Item Validation

```typescript
const { validateWithCreatorId } = useTenantItemValidation();

useEffect(() => {
  // Validate course
  if (course) {
    validateWithCreatorId(course.instructor_id);
  }
  
  // Validate chapter
  if (chapter) {
    validateWithCreatorId(chapter.instructor_id);
  }
}, [course, chapter]);
```

### Inherited Validation (for lessons/quizzes)

```typescript
// Lessons and quizzes inherit the course's instructor_id
if (lessonsData) {
  lessonsData.forEach(lesson => {
    // Use the course's instructor_id since lessons don't have their own
    validateWithCreatorId(courseData.instructor_id);
  });
}
```

### Group Validation

```typescript
// Groups use created_by field for validation
const { validateWithCreatorId } = useTenantItemValidation({
  redirectTo: '/groups',
  toastTitle: 'Group Access Denied',
  toastDescription: 'This group is not available in your platform'
});

// Validate group access
validateWithCreatorId(groupData.created_by);
```

## Best Practices

1. **Use `validateWithCreatorId`**: More explicit and reliable than automatic field detection
2. **Call Early**: Validate items as soon as they're loaded, before rendering content
3. **Handle Loading States**: Don't validate until items are fully loaded
4. **Consistent Redirects**: Use consistent redirect URLs across your application
5. **Custom Messages**: Provide clear, user-friendly error messages
6. **Platform Mode**: Remember that the hook allows access when no tenant context exists
7. **Debug Logging**: Check console logs for validation troubleshooting

## Error Scenarios

### No Creator ID
- **Cause**: Item doesn't have any creator identification fields
- **Action**: Access denied, user redirected
- **Prevention**: Use `validateWithCreatorId` with explicit creator ID

### Wrong Tenant
- **Cause**: Item belongs to a different tenant
- **Action**: Access denied, user redirected
- **Prevention**: Implement proper tenant isolation in your data layer

### Missing Tenant Context
- **Cause**: No teacher/tenant information available
- **Action**: Access allowed (platform mode)
- **Prevention**: Ensure proper tenant context setup

### ID Mismatch
- **Cause**: Creator ID doesn't match tenant user ID
- **Action**: Access denied, user redirected
- **Debug**: Check console logs for ID comparison details

## Integration with Existing Code

The hook is designed to be non-intrusive and can be easily integrated into existing components:

```typescript
// Before: No validation
useEffect(() => {
  if (course) {
    setCourse(course);
  }
}, [course]);

// After: With automatic validation
const { validateAndHandle } = useTenantItemValidation();

useEffect(() => {
  if (course) {
    validateAndHandle(course);
    setCourse(course);
  }
}, [course]);

// After: With manual validation (recommended)
const { validateWithCreatorId } = useTenantItemValidation();

useEffect(() => {
  if (course) {
    validateWithCreatorId(course.instructor_id);
    setCourse(course);
  }
}, [course]);
```

## Troubleshooting

### Hook Not Working
- Check if `TenantContext` is properly set up
- Verify that items have creator ID fields
- Ensure the hook is called after items are loaded
- Check console logs for validation details

### Infinite Redirects
- Check `redirectTo` URL to ensure it's not the same as current page
- Verify that the redirect destination doesn't trigger validation again

### Toast Not Showing
- Ensure `showToast` is not set to `false`
- Check if toast context is properly configured
- Verify translation keys exist in your i18n files

### Validation Always Failing
- Check console logs for ID comparison details
- Verify that `teacher.user_id` matches `item.instructor_id`
- Ensure both IDs reference the same profile

### Debug Information
The hook provides detailed console logging:
- Tenant context status
- Item validation details
- Creator ID comparisons
- Access decisions

## Related Files

- **Hook Implementation**: `src/hooks/useTenantItemValidation.ts`
- **Tenant Context**: `src/contexts/TenantContext.tsx`
- **Toast Hook**: `src/hooks/use-toast.ts`
- **Translation**: `src/i18n/locales/en/other.json` (tenantValidation section)
