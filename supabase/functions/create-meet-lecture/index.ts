
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateLectureRequest {
  course_id: string;
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

    const { course_id, title, description, start_time, duration_minutes }: CreateLectureRequest = await req.json();

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

    // Create Google Calendar event with Meet link
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
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const eventResult = await calendarResponse.json();
    if (!calendarResponse.ok) {
      throw new Error(`Calendar API error: ${eventResult.error?.message || 'Unknown error'}`);
    }

    // Store lecture in database
    const { data: lecture, error: lectureError } = await supabaseClient
      .from('live_lectures')
      .insert({
        course_id,
        teacher_id: user.id,
        title,
        description,
        start_time,
        duration_minutes,
        google_event_id: eventResult.id,
        meet_link: eventResult.hangoutLink,
      })
      .select()
      .single();

    if (lectureError) {
      throw new Error(`Failed to save lecture: ${lectureError.message}`);
    }

    console.log('Lecture created successfully:', lecture.id);

    return new Response(JSON.stringify({ 
      success: true, 
      lecture,
      meet_link: eventResult.hangoutLink 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating lecture:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
