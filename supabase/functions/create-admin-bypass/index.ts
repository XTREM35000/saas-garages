import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req) => {
  // 🔥 BYPASS COMPLET POUR LA PRÉSENTATION
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { email, password, firstName, lastName, phone } = await req.json();
    // Création du user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        phone,
        role: 'superadmin'
      }
    });
    if (userError) throw userError;
    // Création du profil (bypass RLS)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userData.user.id,
      email,
      role: 'superadmin',
      full_name: `${firstName} ${lastName}`,
      phone,
      created_at: new Date().toISOString()
    });
    return new Response(JSON.stringify({
      success: true,
      user: userData.user
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
