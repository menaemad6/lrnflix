# Test Matchmaking After RLS Fix

## Quick Test Steps

### 1. Apply the RLS Fix
```bash
# Run the new migration
supabase db push

# Or if you want to reset everything
supabase db reset
```

### 2. Deploy the Updated Edge Function
```bash
supabase functions deploy matchmaking
```

### 3. Test with Two Users

#### User A (First User)
1. Open browser, go to multiplayer quiz
2. Select a category (e.g., "Science")
3. Click "Quick Match 1v1"
4. Should see "Looking for opponent in Science..."

#### User B (Second User)
1. Open another browser/incognito window
2. Login with different account
3. Go to multiplayer quiz
4. Select same category ("Science")
5. Click "Quick Match 1v1"

#### Expected Result
- Both users should be matched within 2-3 seconds
- Both should see "Match Found!" message
- Both should be in the same room
- Room should show 2 players

### 4. Check Browser Console
Look for these messages:
```
Starting matchmaking for category: Science
Matchmaking response: { success: true, matched: false, message: "Added to queue..." }
User added to queue, starting polling...
Matchmaking queue change: { eventType: "INSERT", new: {...} }
Another user joined queue: {...}
Match found after another user joined: {...}
```

### 5. If Still Not Working

#### Check Database
```sql
-- Check queue status
SELECT * FROM matchmaking_queue ORDER BY created_at DESC;

-- Check rooms
SELECT * FROM quiz_rooms ORDER BY created_at DESC;

-- Check players
SELECT * FROM quiz_room_players ORDER BY joined_at DESC;
```

#### Check Edge Function Logs
```bash
supabase functions logs matchmaking --follow
```

#### Manual Test Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/matchmaking \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"find_match","userId":"test","username":"test","category":"Science"}'
```

## What the Fix Does

1. **Removes restrictive RLS policies** that were blocking the edge function
2. **Allows edge function to insert players** into rooms
3. **Enables real-time updates** for immediate matchmaking
4. **Adds fallback checks** when other users join the queue

## Common Issues After Fix

- **Still getting RLS errors**: Make sure migration ran successfully
- **No real-time updates**: Check if real-time is enabled in Supabase dashboard
- **Edge function not found**: Ensure function is deployed
- **Database connection issues**: Verify environment variables in edge function

## Success Indicators

✅ No more RLS policy errors  
✅ First user gets updated immediately  
✅ Both users see "Match Found!" message  
✅ Room is created with 2 players  
✅ Real-time updates work in console  
✅ Edge function logs show successful operations
