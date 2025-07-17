import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Determine frontend URL from environment or request origin
    const getFrontendUrl = () => {
      // First try environment variable
      const envUrl = Deno.env.get('FRONTEND_URL');
      if (envUrl) return envUrl;
      
      // Fallback to common development URLs
      const origin = req.headers.get('origin');
      if (origin) {
        // Extract base URL from origin
        return origin;
      }
      
      // Final fallback
      return 'http://localhost:8080';
    };

    const frontendUrl = getFrontendUrl();

    if (error) {
      console.error('OAuth error from Google:', error);
      // Redirect to static HTML page with error
      const redirectUrl = `${frontendUrl}/oauth-success.html?error=${encodeURIComponent(error)}`;
      return new Response(null, {
        status: 302,
        headers: { 
          'Location': redirectUrl,
          ...corsHeaders 
        },
      });
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
    const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth-callback`;

    console.log('Exchanging code for tokens...');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      const errorMessage = `Token exchange failed: ${tokenData.error || 'Unknown error'}`;
      const redirectUrl = `${frontendUrl}/oauth-success.html?error=${encodeURIComponent(errorMessage)}`;
      return new Response(null, {
        status: 302,
        headers: { 
          'Location': redirectUrl,
          ...corsHeaders 
        },
      });
    }

    console.log('Token exchange successful');

    // Redirect to static HTML page with tokens
    const tokensParam = encodeURIComponent(JSON.stringify(tokenData));
    const redirectUrl = `${frontendUrl}/oauth-success.html?tokens=${tokensParam}`;
    
    return new Response(null, {
      status: 302,
      headers: { 
        'Location': redirectUrl,
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Determine frontend URL for error case
    const getFrontendUrl = () => {
      const envUrl = Deno.env.get('FRONTEND_URL');
      if (envUrl) return envUrl;
      
      const origin = req.headers.get('origin');
      if (origin) return origin;
      
      return 'http://localhost:8080';
    };
    
    const frontendUrl = getFrontendUrl();
    const redirectUrl = `${frontendUrl}/oauth-success.html?error=${encodeURIComponent(errorMessage)}`;
    
    return new Response(null, {
      status: 302,
      headers: { 
        'Location': redirectUrl,
        ...corsHeaders 
      },
    });
  }
})
