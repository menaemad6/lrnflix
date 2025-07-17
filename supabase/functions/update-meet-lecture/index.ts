import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateLectureRequest {
  lecture_id: string;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { lecture_id, title, description, start_time, duration_minutes }: UpdateLectureRequest = await req.json();

    // Get lecture details
    const { data: lectureData, error: lectureError } = await supabaseClient
      .from('live_lectures')
      .select('*')
      .eq('id', lecture_id)
      .single();

    if (lectureError || !lectureData) {
      throw new Error('Lecture not found');
    }

    // Check if user is the teacher of this lecture
    if (lectureData.teacher_id !== user.id) {
      throw new Error('You can only update your own lectures');
    }

    // Check if lecture has a Google event
    if (!lectureData.google_event_id) {
      throw new Error('This lecture does not have a Google Calendar event');
    }

    // Get user's OAuth tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google OAuth not configured. Please connect your Google account first.');
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Google access token');
      }

      accessToken = refreshData.access_token;
      
      // Update stored token
      await supabaseClient
        .from('google_oauth_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Update Google Calendar event
    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + duration_minutes * 60000);

    const eventData = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${lectureData.google_event_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json();
      throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const eventResult = await calendarResponse.json();

    // Update lecture in database with new meet link if it changed
    const { error: updateError } = await supabaseClient
      .from('live_lectures')
      .update({
        meet_link: eventResult.hangoutLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lecture_id);

    if (updateError) {
      throw new Error(`Failed to update lecture: ${updateError.message}`);
    }

    console.log('Lecture updated successfully:', lecture_id);

    return new Response(JSON.stringify({ 
      success: true, 
      meet_link: eventResult.hangoutLink 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating lecture:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}) 