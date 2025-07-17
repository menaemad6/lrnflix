
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // Handle GET request for webhook verification
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification attempt:', { mode, token, challenge });

      // Verify the webhook
      if (mode === 'subscribe' && token === 'whatsapp123') {
        console.log('Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        console.log('Webhook verification failed - invalid token or mode');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle POST request for webhook events
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Process webhook entries
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          // Process status updates (delivery confirmations)
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.value && change.value.statuses) {
                for (const status of change.value.statuses) {
                  console.log('Message status update:', {
                    messageId: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                    recipientId: status.recipient_id
                  });

                  // Store the delivery status in database
                  try {
                    const { error } = await supabaseClient
                      .from('whatsapp_message_status')
                      .upsert({
                        message_id: status.id,
                        status: status.status,
                        recipient_id: status.recipient_id,
                        timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
                        webhook_data: status
                      }, {
                        onConflict: 'message_id'
                      });

                    if (error) {
                      console.error('Error storing message status:', error);
                    } else {
                      console.log('Message status stored successfully');
                    }
                  } catch (dbError) {
                    console.error('Database error:', dbError);
                  }
                }
              }

              // Process incoming messages (if needed)
              if (change.value && change.value.messages) {
                for (const message of change.value.messages) {
                  console.log('Incoming message:', {
                    messageId: message.id,
                    from: message.from,
                    type: message.type,
                    timestamp: message.timestamp
                  });
                }
              }
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
