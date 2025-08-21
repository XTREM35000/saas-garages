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
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, phone, nom, prenom, display_name, avatar_url } = await req.json()

    // Validation des données
    if (!email || !password || !phone || !nom || !prenom) {
      return new Response(
        JSON.stringify({ error: 'Toutes les données sont requises' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🏗️ Configuration Super-Admin:', { email, nom, prenom })

    let userId: string

    // Utiliser la RPC transactionnelle pour créer Super Admin + profil + pricing
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('create_super_admin_complete', {
      p_email: email,
      p_password: password,
      p_name: display_name || `${prenom} ${nom}`,
      p_phone: phone,
      p_avatar_url: avatar_url || null
    })

    if (rpcError || !rpcData?.success) {
      const message = rpcError?.message || rpcData?.error || 'Echec création Super Admin'
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    userId = rpcData.user_id

    // 3. Créer la relation user_organizations pour le Super-Admin (best-effort)
    const { data: orgs } = await supabase
      .from('organisations')
      .select('id')
      .limit(1)

    if (orgs && orgs.length > 0) {
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: userId,
          organization_id: orgs[0].id,
          role: 'superadmin'
        })

      if (userOrgError) {
        console.error('⚠️ Erreur création relation user_organizations:', userOrgError)
        // Ne pas échouer pour cette erreur
      }
    }

    console.log('✅ Super-Admin configuré avec succès:', userId)

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: userId, email: email },
        profile: {
          id: userId,
          email: email,
          nom: nom,
          prenom: prenom,
          role: 'superadmin'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur dans setup-super-admin:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
