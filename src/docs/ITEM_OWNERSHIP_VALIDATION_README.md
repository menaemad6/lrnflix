# Item Ownership Validation Hook

## Overview

The `useItemOwnershipValidation` hook is a React hook designed to validate that the current logged-in user owns a specific item before allowing access to edit pages or sensitive operations. It automatically redirects unauthorized users and shows appropriate error messages.

## Purpose

This hook prevents teachers from accessing or editing items (courses, lessons, quizzes, etc.) that belong to other teachers. It's essential for maintaining data security and ensuring users can only modify their own content.

## Key Features

- **Automatic Redirection**: Redirects unauthorized users to a specified page
- **Toast Notifications**: Shows user-friendly error messages
- **Simple Validation**: Takes only the creator ID as parameter
- **Comprehensive Logging**: Provides detailed console logs for debugging
- **Type Safety**: Full TypeScript support with proper interfaces

## Hook Structure

```typescript
export const useItemOwnershipValidation = (options: UseItemOwnershipValidationOptions = {}) => {
  // Returns validation function
  return {
    validateOwnership
  };
};
```

## Options Interface

```typescript
export interface UseItemOwnershipValidationOptions {
  redirectTo?: string;        // Where to redirect unauthorized users (default: '/unauthorized')
  showToast?: boolean;        // Whether to show error toast (default: true)
  toastTitle?: string;        // Custom toast title
  toastDescription?: string;  // Custom toast description
}
```

## Validation Function

### `validateOwnership(creatorId: string)`

Validates ownership using a direct creator ID string.

**Parameters:**
- `creatorId`: The ID of the user who created/owns the item

**Usage:**
```typescript
const { validateOwnership } = useItemOwnershipValidation();

// Validate with a specific creator ID
validateOwnership(course.creator_id);
```

## Implementation Examples

### Basic Usage

```typescript
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';

const EditCoursePage = ({ course }) => {
  const { validateOwnership } = useItemOwnershipValidation();
  
  useEffect(() => {
    // This will redirect if the user doesn't own the course
    validateOwnership(course.creator_id);
  }, [course, validateOwnership]);

  // Rest of component...
};
```

### Custom Options

```typescript
const { validateOwnership } = useItemOwnershipValidation({
  redirectTo: '/dashboard',
  showToast: true,
  toastTitle: 'Access Denied',
  toastDescription: 'You can only edit your own courses'
});

// Use in component
useEffect(() => {
  validateOwnership(course.creator_id);
}, [course, validateOwnership]);
```

### In Route Protection

```typescript
const ProtectedEditRoute = ({ course }) => {
  const { validateOwnership } = useItemOwnershipValidation();
  
  useEffect(() => {
    validateOwnership(course.creator_id);
  }, [course, validateOwnership]);

  return <EditCourseForm course={course} />;
};
```

## Error Handling

### Unauthorized Access
- Shows destructive toast notification
- Redirects to specified page (default: `/unauthorized`)
- Logs detailed information to console

### No User Logged In
- Redirects to `/auth` page
- No toast shown (user needs to log in first)

## Console Logging

The hook provides comprehensive logging for debugging:

```typescript
// Successful validation
console.log('useItemOwnershipValidation: Access granted - user owns this item');

// Access denied
console.log('useItemOwnershipValidation: Access denied - user does not own this item:', {
  creatorId: 'abc123',
  currentUserId: 'def456'
});
```

## Integration with Existing Code

### Replacing Manual Checks

**Before (Manual):**
```typescript
useEffect(() => {
  if (user?.id !== course.creator_id) {
    toast({
      title: 'Access Denied',
      description: 'You can only edit your own courses',
      variant: 'destructive',
    });
    navigate('/unauthorized');
  }
}, [user, course, toast, navigate]);
```

**After (With Hook):**
```typescript
const { validateOwnership } = useItemOwnershipValidation();

useEffect(() => {
  validateOwnership(course.creator_id);
}, [course, validateOwnership]);
```

### Combining with Other Hooks

```typescript
const { validateOwnership } = useItemOwnershipValidation();
const { validateAndHandle } = useTenantItemValidation();

useEffect(() => {
  // First check tenant validation
  validateAndHandle(course);
  
  // Then check ownership
  validateOwnership(course.creator_id);
}, [course, validateAndHandle, validateOwnership]);
```

## Best Practices

### 1. Use Early in Component Lifecycle
```typescript
// Good: Validate immediately
useEffect(() => {
  validateOwnership(course.creator_id);
}, [course, validateOwnership]);

// Avoid: Validating after complex operations
```

### 2. Handle Loading States
```typescript
const [isValidating, setIsValidating] = useState(true);

useEffect(() => {
  if (course) {
    validateOwnership(course.creator_id);
    setIsValidating(false);
  }
}, [course, validateOwnership]);

if (isValidating) return <LoadingSpinner />;
```

### 3. Provide Meaningful Error Messages
```typescript
const { validateOwnership } = useItemOwnershipValidation({
  toastTitle: 'Course Access Restricted',
  toastDescription: 'You can only edit courses you created'
});
```

## Security Considerations

- **User Authentication**: Checks for logged-in user before validation
- **Direct ID Validation**: Simple and secure creator ID comparison
- **Automatic Redirects**: Prevents unauthorized access attempts

## Performance Notes

- Uses `useCallback` for memoized validation function
- Minimal re-renders due to dependency optimization
- Lightweight validation logic
- No unnecessary API calls

## Troubleshooting

### Common Issues

1. **Hook not redirecting**
   - Check if user is properly logged in
   - Verify creator ID is being passed correctly
   - Ensure navigation is working in your app

2. **Toast not showing**
   - Check `showToast` option
   - Verify toast context is properly set up
   - Check browser console for errors

3. **Infinite redirects**
   - Ensure redirect destination is not the same page
   - Check for circular dependencies in useEffect

### Debug Mode

Enable detailed logging by checking console output:
```typescript
// All validation attempts are logged with detailed information
console.log('useItemOwnershipValidation: Validating ownership:', {
  creatorId,
  currentUserId: user.id,
  user: user
});
```

## Migration Guide

### From Manual Validation

1. **Import the hook:**
   ```typescript
   import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';
   ```

2. **Replace validation logic:**
   ```typescript
   // Old manual code
   if (user?.id !== item.creator_id) {
     // manual redirect and toast
   }
   
   // New with hook
   const { validateOwnership } = useItemOwnershipValidation();
   validateOwnership(item.creator_id);
   ```

3. **Remove manual navigation and toast calls**

### From useTenantItemValidation

The `useItemOwnershipValidation` hook is complementary to `useTenantItemValidation`:

- **useTenantItemValidation**: Checks if item belongs to current tenant
- **useItemOwnershipValidation**: Checks if current user owns the item

Use both for comprehensive access control:
```typescript
const { validateAndHandle } = useTenantItemValidation();
const { validateOwnership } = useItemOwnershipValidation();

useEffect(() => {
  validateAndHandle(course);      // Tenant check
  validateOwnership(course.creator_id);  // Ownership check
}, [course, validateAndHandle, validateOwnership]);
```

## Future Enhancements

- Role-based validation support
- Batch validation for multiple items
- Custom validation rules
- Integration with permission systems
- Audit logging for access attempts

## Related Hooks

- `useTenantItemValidation` - Tenant-level validation
- `useAuth` - Authentication context
- `useToast` - Toast notifications
- `useNavigate` - Navigation utilities
