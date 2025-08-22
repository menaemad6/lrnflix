# Tenant Item Validation Hook

## Overview

The `useTenantItemValidation` hook is a reusable React hook that automatically validates whether an item (course, chapter, group, lesson, quiz, etc.) belongs to the current tenant. It provides tenant isolation while maintaining platform-wide access when no tenant context is present. The hook handles all validation logic internally - if access is invalid, it automatically shows a toast message and redirects the user.

## Features

- **Tenant Isolation**: Prevents access to content from other tenants
- **Platform Mode**: Allows access to all content when no tenant is active
- **Flexible Validation**: Supports multiple creator field names
- **Creator ID Validation**: Can validate with just a creator ID string
- **Automatic Handling**: Automatically shows toast messages and redirects on invalid access
- **Customizable**: Configurable redirect paths and toast messages
- **Type Safe**: Full TypeScript support with proper interfaces

## How It Works

### Platform Mode (No Tenant)
When a user is not in a tenant context (e.g., accessing the platform directly):
- All content is accessible
- No validation restrictions
- Hook allows access for all items

### Tenant Mode (With Tenant)
When a user is in a tenant context (e.g., accessing through a teacher's platform):
- Only content created by the current tenant is accessible
- Content from other tenants is blocked
- Invalid access automatically triggers toast + redirect

## Installation

The hook is already available in your project at:
```
src/hooks/useTenantItemValidation.ts
```

## Basic Usage

### 1. Import the Hook

```typescript
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
```

### 2. Use in Component

```typescript
const MyComponent = () => {
  const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation();
  
  // Your component logic
};
```

## API Reference

### Hook Return Values

```typescript
const {
  validateAndHandle,        // Function to validate item object and handle invalid cases
  validateWithCreatorId     // Function to validate with just a creator ID string
} = useTenantItemValidation(options);
```

### Options

```typescript
interface UseTenantItemValidationOptions {
  redirectTo?: string;           // Where to redirect on invalid access (default: '/')
  showToast?: boolean;           // Whether to show toast message (default: true)
  toastTitle?: string;           // Custom toast title
  toastDescription?: string;     // Custom toast description
}
```

### Item Interface

The hook accepts items with any of these creator fields:

```typescript
interface TenantItem {
  instructor_id?: string;    // Used by courses, questions
  creator_id?: string;       // Used by chapters, groups
  user_id?: string;          // Used by groups, discussions
  teacher_id?: string;       // Used by lessons, quizzes
  [key: string]: unknown;    // Other fields
}
```

## Usage Examples

### 1. Simple Item Validation

```typescript
const { validateAndHandle } = useTenantItemValidation();

const handleCourseAccess = (course: Course) => {
  // This will automatically handle invalid access
  validateAndHandle(course);
  
  // If we reach here, course is accessible
  navigateToCourse(course);
};
```

### 2. Creator ID Validation

```typescript
const { validateWithCreatorId } = useTenantItemValidation();

const handleCreatorValidation = (creatorId: string) => {
  // Validate with just the creator ID
  validateWithCreatorId(creatorId);
  
  // If we reach here, creator ID is valid for current tenant
  proceedWithAction();
};
```

### 3. Validation with Automatic Handling

```typescript
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/courses',
  toastTitle: 'Access Denied',
  toastDescription: 'This course is not available in your platform'
});

const handleCourseAccess = (course: Course) => {
  // This will automatically show toast and redirect if invalid
  validateAndHandle(course);
  
  // If we reach here, course is accessible
  loadCourseContent(course);
};
```

### 4. Custom Configuration

```typescript
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/home',
  showToast: false,  // Don't show toast, just redirect
});

// Use in component
validateAndHandle(item);
```

### 5. Conditional Validation

```typescript
const { validateAndHandle } = useTenantItemValidation();

const handleItemAccess = (item: TenantItem) => {
  // Always validate - hook handles tenant mode internally
  validateAndHandle(item);
  
  // If we reach here, item is accessible
  return true;
};
```

## Real-World Examples

### Course Validation

```typescript
// In CourseView.tsx
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/courses'
});

const fetchCourseData = async () => {
  try {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    // Validate tenant access
    validateAndHandle(courseData);

    setCourse(courseData);
  } catch (error) {
    // Handle error
  }
};
```

### Chapter Validation

```typescript
// In ChapterDetailPage.tsx
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/chapters'
});

useEffect(() => {
  if (chapter) {
    validateAndHandle(chapter);
  }
}, [chapter]);
```

### Group Validation

```typescript
// In GroupDetailPage.tsx
const { validateAndHandle } = useTenantItemValidation({
  redirectTo: '/groups'
});

const handleGroupAccess = (group: Group) => {
  validateAndHandle(group);
  
  // If we reach here, group is accessible
  loadGroupContent(group);
};
```

### Creator ID Only Validation

```typescript
// When you only have the creator ID, not the full object
const { validateWithCreatorId } = useTenantItemValidation({
  redirectTo: '/home'
});

const handleCreatorAccess = (creatorId: string) => {
  // Validate access with just the creator ID
  validateWithCreatorId(creatorId);
  
  // If we reach here, access is allowed
  loadCreatorContent(creatorId);
};
```

## Supported Content Types

The hook works with all content types that have creator identification:

- **Courses**: `instructor_id`
- **Chapters**: `creator_id` or `instructor_id`
- **Lessons**: `teacher_id` or `instructor_id`
- **Quizzes**: `teacher_id` or `instructor_id`
- **Groups**: `user_id` or `creator_id`
- **Discussions**: `user_id`
- **Questions**: `instructor_id`
- **Any custom content**: Any field containing creator ID

## Error Handling

### Invalid Access Response

When content is not accessible:

1. **Toast Message**: Shows "Content Unavailable" message
2. **Redirect**: Automatically redirects to specified path
3. **Function**: Both `validateAndHandle` and `validateWithCreatorId` handle everything internally

### Custom Error Messages

```typescript
const { validateAndHandle } = useTenantItemValidation({
  toastTitle: 'Course Not Available',
  toastDescription: 'This course is not part of your learning platform'
});
```

## Best Practices

### 1. Use Early Validation

Validate access as early as possible in your component lifecycle:

```typescript
useEffect(() => {
  if (item) {
    validateAndHandle(item);
  }
  // Continue with valid item
}, [item]);
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(true);
const { validateAndHandle } = useTenantItemValidation();

useEffect(() => {
  const loadItem = async () => {
    try {
      const item = await fetchItem(id);
      
      validateAndHandle(item);
      setItem(item);
    } finally {
      setLoading(false);
    }
  };
  
  loadItem();
}, [id]);
```

### 3. Provide Fallback Content

```typescript
const { validateAndHandle } = useTenantItemValidation();

// validateAndHandle will redirect if invalid
validateAndHandle(course);

return <CourseContent course={course} />;
```

### 4. Use Creator ID Validation When Appropriate

```typescript
const { validateWithCreatorId } = useTenantItemValidation();

// When you only need to check creator access
const checkCreatorAccess = (creatorId: string) => {
  validateWithCreatorId(creatorId);
  // Proceed if valid
};
```

## Testing

### Demo Component

Use the included demo component to test the hook:

```typescript
import { TenantValidationDemo } from '@/components/TenantValidationDemo';

// Add to your page for testing
<TenantValidationDemo />
```

### Test Scenarios

1. **Platform Mode**: Access without tenant context
2. **Tenant Mode**: Access with tenant context
3. **Valid Content**: Content from current tenant
4. **Invalid Content**: Content from other tenant
5. **Mixed Content**: Mix of valid and invalid items
6. **Creator ID Validation**: Testing with just creator ID strings

## Migration Guide

### From Manual Validation

**Before:**
```typescript
const { teacher } = useTenant();
const canAccess = teacher ? course.instructor_id === teacher.user_id : true;

if (!canAccess) {
  toast({ title: 'Access Denied', variant: 'destructive' });
  navigate('/courses');
  return;
}
```

**After:**
```typescript
const { validateAndHandle } = useTenantItemValidation();

validateAndHandle(course);
```

### From Multiple Validation Functions

**Before:**
```typescript
const validateCourse = (course) => course.instructor_id === teacher?.user_id;
const validateChapter = (chapter) => chapter.creator_id === teacher?.user_id;
const validateGroup = (group) => group.user_id === teacher?.user_id;
```

**After:**
```typescript
const { validateAndHandle } = useTenantItemValidation();

// Single function works for all content types
validateAndHandle(item);
```

### From Creator ID Validation

**Before:**
```typescript
const { teacher } = useTenant();
if (teacher && creatorId !== teacher.user_id) {
  toast({ title: 'Access Denied', variant: 'destructive' });
  navigate('/home');
  return;
}
```

**After:**
```typescript
const { validateWithCreatorId } = useTenantItemValidation();

validateWithCreatorId(creatorId);
```

## Troubleshooting

### Common Issues

1. **Hook not working**: Ensure `TenantProvider` wraps your component
2. **Always redirecting**: Check if tenant context is properly set
3. **Type errors**: Verify item interface matches `TenantItem`
4. **Toast not showing**: Check `showToast` option and toast provider setup

### Debug Mode

Enable console logging to debug validation:

```typescript
const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation();

// Both functions include console logging for debugging
validateAndHandle(item);
validateWithCreatorId(creatorId);
```

## Performance Considerations

- **Memoization**: Hook uses `useCallback` for optimal performance
- **Early Exit**: Validation stops on first invalid case
- **Minimal Re-renders**: Hook only re-runs when tenant changes
- **Lightweight**: No heavy computations or API calls
- **Flexible**: Choose between item validation or creator ID validation based on your needs

## Security Notes

- **Client-side Only**: This is a client-side validation hook
- **Server Validation**: Always implement server-side validation as well
- **RLS Policies**: Use Supabase RLS policies for database-level security
- **API Protection**: Protect your API endpoints with proper authentication
- **Creator ID Validation**: `validateWithCreatorId` is useful when you only have the creator ID

## Future Enhancements

Potential improvements for future versions:

1. **Batch Validation**: Validate multiple items at once
2. **Caching**: Cache validation results for better performance
3. **Custom Validators**: Allow custom validation logic
4. **Audit Logging**: Log validation attempts for security
5. **Role-based Access**: Support for different user roles within tenants
6. **Async Validation**: Support for async validation scenarios
