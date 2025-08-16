import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

         const { action, userId, username, category } = await req.json()
     
     console.log('Received request:', { action, userId, username, category })
     
     // Validate required fields based on action
     if (!action || !userId) {
       console.error('Missing required fields:', { action, userId, username })
       return new Response(
         JSON.stringify({ 
           error: 'Missing required fields: action and userId are required' 
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
       )
     }
     
     // Username is only required for find_match action
     if (action === 'find_match' && !username) {
       console.error('Missing username for find_match:', { action, userId, username })
       return new Response(
         JSON.stringify({ 
           error: 'Username is required for find_match action' 
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
       )
     }

         if (action === 'test') {
       // Simple test endpoint to verify function is working
       return new Response(
         JSON.stringify({ 
           success: true, 
           message: 'Matchmaking function is working',
           timestamp: new Date().toISOString()
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
     
     if (action === 'find_match') {
       // Check if user is already in queue or has a pending match
       const { data: existingEntries } = await supabaseClient
         .from('matchmaking_queue')
         .select('*')
         .eq('user_id', userId)

       if (existingEntries && existingEntries.length > 0) {
         const existingEntry = existingEntries[0]
         
         if (existingEntry.status === 'matched' && existingEntry.room_id) {
           // User already has a match, return room details
           const { data: roomData } = await supabaseClient
             .from('quiz_rooms')
             .select('*')
             .eq('id', existingEntry.room_id)
             .single()
           
           if (roomData) {
             return new Response(
               JSON.stringify({ 
                 success: true, 
                 room: roomData,
                 matched: true,
                 message: 'User already matched'
               }),
               { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
             )
           }
         } else if (existingEntry.status === 'waiting') {
           // User is already waiting, return current status instead of error
           return new Response(
             JSON.stringify({ 
               success: true, 
               matched: false,
               message: 'User already in queue, continuing to wait...',
               status: 'waiting'
             }),
             { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           )
         }
       }

             // Add user to matchmaking queue
       console.log('Adding user to queue:', { userId, username, category: category || 'General' })
       
       const { error: insertError } = await supabaseClient
         .from('matchmaking_queue')
         .insert({
           user_id: userId,
           username: username,
           status: 'waiting',
           category: category || 'General'
         })

       if (insertError) {
         console.error('Error adding user to queue:', insertError)
         throw new Error(`Failed to add user to queue: ${insertError.message}`)
       }
       
       console.log('User successfully added to queue')

      // Look for a compatible match
      const { data: potentialMatches } = await supabaseClient
        .from('matchmaking_queue')
        .select('*')
        .eq('status', 'waiting')
        .neq('user_id', userId)
        .eq('category', category || 'General')
        .limit(1)

             if (potentialMatches && potentialMatches.length > 0) {
         const match = potentialMatches[0]
         
         // Create a new room for the match
         const roomCode = Math.floor(1000 + Math.random() * 9000).toString()
         
         const { data: newRoom, error: roomError } = await supabaseClient
           .from('quiz_rooms')
           .insert({
             max_players: 2, // 1v1
             is_public: false,
             room_code: roomCode,
             status: 'waiting',
             category: category || 'General'
           })
           .select()
           .single()

         if (roomError) throw roomError

         // Update both users' status to matched and assign room_id
         const { error: updateError } = await supabaseClient
           .from('matchmaking_queue')
           .update({ 
             status: 'matched', 
             room_id: newRoom.id 
           })
           .in('user_id', [userId, match.user_id])

         if (updateError) throw updateError

         // Add both users to the room with initial scores
         console.log('Adding players to room:', newRoom.id);
         
         const { error: insertError } = await supabaseClient
           .from('quiz_room_players')
           .insert([
             {
               room_id: newRoom.id,
               user_id: userId,
               username: username,
               score: 0,
               streak: 0,
               xp_earned: 0
             },
             {
               room_id: newRoom.id,
               user_id: match.user_id,
               username: match.username,
               score: 0,
               streak: 0,
               xp_earned: 0
             }
           ])

         if (insertError) {
           console.error('Error adding players to room:', insertError);
           throw new Error(`Failed to add players to room: ${insertError.message}`);
         }

         // Verify both users are now matched
         const { data: verifyMatches } = await supabaseClient
           .from('matchmaking_queue')
           .select('*')
           .in('user_id', [userId, match.user_id])
           .eq('status', 'matched')

         console.log('Match verification:', verifyMatches)
         
                   // Force refresh the matchmaking queue to trigger real-time updates
          await supabaseClient
            .from('matchmaking_queue')
            .update({ updated_at: new Date().toISOString() })
            .in('user_id', [userId, match.user_id])
          
          // Automatically start the game for quick match (1v1)
          const { error: startError } = await supabaseClient
            .from('quiz_rooms')
            .update({ 
              status: 'started',
              current_question_index: 0,
              question_start_time: new Date().toISOString()
            })
            .eq('id', newRoom.id);

          if (startError) {
            console.error('Error starting game:', startError);
          } else {
            console.log('Game automatically started for quick match');
          }
          
          console.log('Match created successfully for users:', userId, match.user_id);

         return new Response(
           JSON.stringify({ 
             success: true, 
             room: newRoom,
             matched: true,
             matchDetails: {
               opponent: match.username,
               category: category || 'General',
               roomCode: roomCode
             }
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

      return new Response(
        JSON.stringify({ 
          success: true, 
          matched: false,
          message: 'Added to queue, waiting for opponent...' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'cancel_match') {
      // Remove user from matchmaking queue
      const { error } = await supabaseClient
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

         if (action === 'check_match') {
       // Check if user has been matched
       console.log('Checking match for user:', userId);
       
       const { data: queueEntry, error: queueError } = await supabaseClient
         .from('matchmaking_queue')
         .select('*')
         .eq('user_id', userId)
         .single()

       if (queueError) {
         console.error('Error checking queue:', queueError);
         return new Response(
           JSON.stringify({ 
             success: false, 
             error: 'Failed to check queue status' 
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
         )
       }

       console.log('Queue entry found:', queueEntry);

       if (queueEntry && queueEntry.status === 'matched' && queueEntry.room_id) {
         // Get room details
         const { data: room, error: roomError } = await supabaseClient
           .from('quiz_rooms')
           .select('*')
           .eq('id', queueEntry.room_id)
           .single()

         if (roomError) {
           console.error('Error getting room:', roomError);
           return new Response(
             JSON.stringify({ 
               success: false, 
               error: 'Failed to get room details' 
             }),
             { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
           )
         }

         console.log('Room found:', room);

         return new Response(
           JSON.stringify({ 
             success: true, 
             matched: true, 
             room: room 
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       console.log('User not matched yet, status:', queueEntry?.status);

       return new Response(
         JSON.stringify({ 
           success: true, 
           matched: false,
           status: queueEntry?.status || 'not_found'
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Matchmaking error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
