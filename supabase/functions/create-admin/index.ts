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
    // Use service role for elevated actions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { email, password, nom, prenom, role, phone, avatar_url, name } = await req.json()

    // Validate input
    if (!email || !password) {
      throw new Error('Email et mot de passe requis')
    }

    // Use RPC to create admin fully (auth + profiles + admins)
    const { data: result, error: rpcError } = await (supabaseClient as any).rpc('create_admin_complete', {
      p_email: email,
      p_password: password,
      p_name: name || `${prenom ?? ''} ${nom ?? ''}`.trim(),
      p_phone: phone ?? null,
      p_pricing_plan: 'starter',
      p_avatar_url: avatar_url ?? null
    })

    if (rpcError || !result?.success) {
      throw new Error(rpcError?.message || result?.error || 'Erreur création admin')
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: result.user_id,
          email: email,
          role: role || 'admin'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
