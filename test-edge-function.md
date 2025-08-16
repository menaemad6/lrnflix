# Test Edge Function to Fix 400 Error

## Quick Debug Steps

### 1. Deploy the Updated Edge Function
```bash
# Make sure you're in the project directory
cd supabase/functions
supabase functions deploy matchmaking
```

### 2. Test the Basic Function
First, test if the function is accessible at all:

```bash
# Test basic connectivity (replace with your actual project URL)
curl -X POST https://wxlamjmnqefpjdewxbyz.supabase.co/functions/v1/matchmaking \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Matchmaking function is working",
  "timestamp": "2025-01-16T..."
}
```

### 3. Test the Find Match Function
If the test works, try the actual find_match:

```bash
curl -X POST https://wxlamjmnqefpjdewxbyz.supabase.co/functions/v1/matchmaking \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "find_match",
    "userId": "test-user-123",
    "username": "TestUser",
    "category": "Science"
  }'
```

### 4. Check Browser Console
Look for these messages:
```
Starting matchmaking for category: Science
Matchmaking response: { success: true, matched: false, message: "Added to queue..." }
```

### 5. Common Issues & Solutions

#### Issue: 400 Bad Request
**Possible Causes:**
1. **Missing required fields** - Check if userId, username, or action are undefined
2. **Invalid JSON** - Check the request payload
3. **Database connection issues** - Check if Supabase is accessible

**Debug Steps:**
1. Check browser console for the exact request being sent
2. Verify all required fields are present
3. Test with the curl command above

#### Issue: Edge Function Not Found
**Solution:**
```bash
supabase functions deploy matchmaking
```

#### Issue: Database Connection
**Check:**
1. Environment variables in edge function
2. Supabase project status
3. Database migrations applied

### 6. Manual Database Check
If you have access to Supabase dashboard:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('matchmaking_queue', 'quiz_rooms', 'quiz_room_players');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('matchmaking_queue', 'quiz_rooms', 'quiz_room_players');
```

### 7. Frontend Debug
Add this to your browser console to see what's being sent:

```javascript
// In browser console, check the request
console.log('User data:', {
  userId: 'your-user-id',
  username: 'your-username',
  category: 'selected-category'
});
```

### 8. Expected Flow After Fix
1. **User clicks Quick Match** → Function called with valid data
2. **Function validates input** → All required fields present
3. **User added to queue** → Success response returned
4. **Real-time updates** → First user gets matched when second joins

## Quick Fix Checklist

- [ ] Edge function deployed successfully
- [ ] Test endpoint returns success
- [ ] All required fields present in request
- [ ] Database tables exist and accessible
- [ ] RLS policies allow edge function access
- [ ] Real-time enabled for all tables

## If Still Getting 400 Error

1. **Check edge function logs** in Supabase dashboard
2. **Verify request payload** in browser network tab
3. **Test with curl** to isolate frontend vs backend issue
4. **Check database permissions** and RLS policies
