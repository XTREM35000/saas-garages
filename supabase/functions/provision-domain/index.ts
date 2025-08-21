import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VercelDomainPayload { name: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { organization_id, custom_domain } = await req.json()
    if (!organization_id || !custom_domain) {
      return new Response(JSON.stringify({ error: 'organization_id et custom_domain requis' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const vercelToken = Deno.env.get('VERCEL_TOKEN')
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID')
    if (!vercelToken || !vercelProjectId) {
      return new Response(JSON.stringify({ error: 'Configuration Vercel manquante' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Call Vercel Domains API
    const addDomainRes = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: custom_domain } satisfies VercelDomainPayload),
    })

    const addDomainJson = await addDomainRes.json()
    if (!addDomainRes.ok) {
      return new Response(JSON.stringify({ error: addDomainJson?.error?.message || 'Echec Vercel' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Update DB with pending status and instructions
    const { error: updError } = await supabase
      .from('organizations')
      .update({
        custom_domain: custom_domain,
        custom_domain_status: 'pending_dns',
        custom_domain_meta: { vercel_response: addDomainJson, requested_at: new Date().toISOString() },
      })
      .eq('id', organization_id)

    if (updError) {
      return new Response(JSON.stringify({ error: updError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, vercel: addDomainJson }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


