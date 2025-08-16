# Matchmaking Debug Guide

## Common Issues & Solutions

### 1. First User Not Getting Updated When Matched

**Problem**: First user stays in "finding" state even after second user joins

**Causes**:
- Real-time subscription not working
- Database update not triggering subscription
- Frontend polling not catching the update

**Solutions**:
1. **Check Browser Console** for matchmaking logs
2. **Verify Edge Function** is deployed and accessible
3. **Check Database** for queue entries and room creation
4. **Test Real-time** subscriptions

### 2. Debugging Steps

#### Step 1: Check Browser Console
Look for these log messages:
```
Starting matchmaking for category: Science
Matchmaking response: { success: true, matched: false, message: "Added to queue..." }
User added to queue, starting polling...
Polling for match (attempt 1)...
Check match response: { success: true, matched: false }
```

#### Step 2: Check Database
```sql
-- Check matchmaking queue
SELECT * FROM matchmaking_queue WHERE status = 'waiting';

-- Check if room was created
SELECT * FROM quiz_rooms ORDER BY created_at DESC LIMIT 5;

-- Check if players were added
SELECT * FROM quiz_room_players ORDER BY joined_at DESC LIMIT 5;
```

#### Step 3: Test Edge Function
```bash
# Test the function directly
curl -X POST https://your-project.supabase.co/functions/v1/matchmaking \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"find_match","userId":"test","username":"test","category":"Science"}'
```

### 3. Real-time Subscription Issues

**Check if subscriptions are working**:
1. Open browser dev tools
2. Look for WebSocket connections
3. Check for subscription errors in console

**Manual test**:
```javascript
// In browser console
const { data, error } = await supabase
  .from('matchmaking_queue')
  .select('*')
  .eq('user_id', 'your-user-id');

console.log('Current queue status:', data);
```

### 4. Edge Function Debugging

**Check function logs**:
```bash
supabase functions logs matchmaking --follow
```

**Common edge function issues**:
- Environment variables not set
- Database permissions
- CORS issues
- Function not deployed

### 5. Testing Matchmaking

#### Test with Two Users
1. **User A**: Select category, click Quick Match
2. **User B**: Select same category, click Quick Match
3. **Expected**: Both should be matched within seconds

#### Test with One User
1. **User A**: Select category, click Quick Match
2. **Expected**: Should see "Looking for opponent..." message
3. **Wait**: Should stay in queue until opponent joins

### 6. Database Schema Issues

**Verify migrations ran**:
```bash
supabase db reset
# or
supabase db push
```

**Check table structure**:
```sql
-- Should have these columns
\d matchmaking_queue
\d quiz_rooms
\d quiz_room_players
```

### 7. Quick Fixes

#### Reset User State
```javascript
// In browser console
localStorage.clear();
window.location.reload();
```

#### Clear Queue
```sql
-- Clear all queue entries (use carefully)
DELETE FROM matchmaking_queue;
```

#### Check Room Status
```sql
-- See all rooms and their status
SELECT 
  r.id, 
  r.status, 
  r.category, 
  r.max_players,
  COUNT(p.id) as player_count
FROM quiz_rooms r
LEFT JOIN quiz_room_players p ON r.id = p.room_id
GROUP BY r.id, r.status, r.category, r.max_players
ORDER BY r.created_at DESC;
```

## Expected Flow

1. **User clicks Quick Match**
   - Frontend calls edge function
   - User added to queue
   - Frontend starts polling

2. **Second user joins**
   - Edge function finds match
   - Creates room
   - Updates both users' status
   - Adds both to room

3. **Real-time update**
   - Subscription catches status change
   - Frontend updates to 'matched' state
   - Shows room details

## Troubleshooting Checklist

- [ ] Edge function deployed and accessible
- [ ] Database migrations applied
- [ ] Real-time subscriptions enabled
- [ ] Browser console shows no errors
- [ ] Database has correct data
- [ ] Two users testing with same category
- [ ] Network requests succeeding
- [ ] Local storage cleared if needed
