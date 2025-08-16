# Quick Match Setup Guide

## Overview
The quick match functionality allows users to find 1v1 opponents quickly by selecting a category. Questions are randomly selected between 5-15 for each match.

## Setup Steps

### 1. Deploy the Edge Function
```bash
cd supabase/functions
supabase functions deploy matchmaking
```

### 2. Run Database Migrations
```bash
supabase db reset
# or manually run the migration:
supabase db push
```

### 3. Test the Functionality

1. **Start the app** and navigate to the multiplayer quiz section
2. **Select a category** from the dropdown above the Quick Match button
3. **Click "Quick Match 1v1"** to start searching for an opponent
4. **Wait for matching** - the system will find another player in the same category
5. **Game starts automatically** when both players are matched

## How It Works

### Matchmaking Flow
1. User selects category and clicks Quick Match
2. User is added to matchmaking queue
3. System searches for compatible opponent (same category)
4. When match is found, a new room is created with 2 players max
5. Question count is randomly determined (5-15 questions)
6. Both players are automatically added to the room
7. Game can start immediately

### Edge Function Endpoints
- `find_match`: Add user to queue and look for matches
- `check_match`: Poll for match status
- `cancel_match`: Remove user from queue

### Database Tables
- `matchmaking_queue`: Tracks users waiting for matches
- `quiz_rooms`: Stores room information and settings
- `quiz_room_players`: Manages players in each room
- `multiplayer_quiz_questions`: Question bank by category

## Troubleshooting

### Common Issues
1. **Edge function not found**: Ensure `supabase functions deploy matchmaking` was run
2. **Database errors**: Check that migrations were applied correctly
3. **No matches found**: Verify there are questions in the selected category

### Testing
- Open two browser windows/tabs
- Use different user accounts
- Select the same category in both
- Click Quick Match in both
- Should match within a few seconds

## Features
- ✅ 1v1 matches only
- ✅ Category-based matching
- ✅ Random question count (5-15)
- ✅ Automatic room creation
- ✅ Real-time matchmaking
- ✅ Category selection UI
