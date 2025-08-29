# Instructor ID Implementation for Questions

## Overview
This implementation adds tenant categorization functionality to questions by introducing an `instructor_id` column that allows questions to be associated with specific instructors/tenants.

## Changes Made

### 1. Database Migration
- **File**: `supabase/migrations/20250819000000-add-instructor-id-to-questions.sql`
- **Purpose**: Adds `instructor_id` column to questions table
- **Features**:
  - Foreign key reference to `teachers.id`
  - Index for performance optimization
  - Backward compatibility (existing questions get `NULL` instructor_id)

### 2. TypeScript Types Update
- **File**: `src/integrations/supabase/types.ts`
- **Changes**: Added `instructor_id: string | null` to questions table types
- **Relationships**: Added foreign key relationship to teachers table

### 3. QuestionsPage.tsx Updates
- **File**: `src/pages/QuestionsPage.tsx`
- **Changes**:
  - Added `useTenant` hook import
  - Updated Question interface to include `instructor_id`
  - Modified `fetchQuestions` function to filter by instructor_id when tenant is available
  - Logic: If tenant exists, fetch questions with matching instructor_id OR NULL instructor_id (global questions)
  - If no tenant, fetch all questions

### 4. CreateQuestionModal.tsx Updates
- **File**: `src/components/questions/CreateQuestionModal.tsx`
- **Changes**:
  - Added `useTenant` hook import
  - Modified question creation to include `instructor_id: teacher?.id || null`
  - When creating questions, if tenant exists, associate with that instructor; otherwise, keep as NULL (global)

## Implementation Logic

### Question Fetching Logic
```typescript
// Filter by instructor_id if tenant is available, otherwise fetch all questions
if (teacher?.id) {
  query = query.or(`instructor_id.eq.${teacher.id},instructor_id.is.null`);
}
```

This logic ensures that:
1. **With Tenant**: Questions are filtered to show only questions from the current instructor OR global questions (NULL instructor_id)
2. **Without Tenant**: All questions are fetched (maintaining backward compatibility)

### Question Creation Logic
```typescript
instructor_id: teacher?.id || null
```

This logic ensures that:
1. **With Tenant**: New questions are associated with the current instructor
2. **Without Tenant**: New questions are created as global (NULL instructor_id)

## Database Schema

### Questions Table Structure
```sql
ALTER TABLE public.questions 
ADD COLUMN instructor_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;
```

### Index for Performance
```sql
CREATE INDEX IF NOT EXISTS idx_questions_instructor_id ON public.questions(instructor_id);
```

## Benefits

1. **Tenant Isolation**: Questions can be categorized by instructor/tenant
2. **Global Access**: Questions without instructor_id remain accessible to all users
3. **Backward Compatibility**: Existing questions continue to work
4. **Performance**: Indexed column for efficient filtering
5. **Flexibility**: Supports both tenant-specific and global question scenarios

## Usage

### For Students
- Students can see questions from their instructor's tenant
- Students can also see global questions (questions without instructor_id)
- Questions are automatically categorized based on the current tenant context

### For Instructors
- Instructors can see questions from their own tenant
- Instructors can also see global questions
- New questions are automatically associated with their tenant

### For Global Users (No Tenant)
- All questions are visible
- New questions are created as global (NULL instructor_id)

## Migration Notes

- Run the migration: `supabase db push`
- Existing questions will have `instructor_id` set to NULL
- No data loss or breaking changes
- All existing functionality continues to work

## Testing

1. **With Tenant**: Verify questions are filtered by instructor_id
2. **Without Tenant**: Verify all questions are visible
3. **Question Creation**: Verify instructor_id is set correctly
4. **Performance**: Verify filtering performance with the new index
