// functions/create-admin-with-profile/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, firstName, lastName, phone, avatarUrl, createdBy } = await req.json()

    // Validation des données requises
    if (!email || !password || !firstName || !lastName || !phone) {
      return new Response(
        JSON.stringify({
          error: 'Tous les champs obligatoires doivent être remplis: email, password, firstName, lastName, phone'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format d\'email invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validation mot de passe
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 6 caractères' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialisation du client Supabase avec les droits admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Création du user avec l'API Admin
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.replace(/\s/g, ''),
        role: 'admin'
      }
    })

    if (userError) {
      console.error('❌ Erreur création user auth:', userError)
      return new Response(
        JSON.stringify({ error: `Erreur création utilisateur: ${userError.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!userData.user) {
      throw new Error('Aucun utilisateur créé')
    }

    const userId = userData.user.id
    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // 2. Création du profil dans la table profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email.trim(),
        role: 'admin',
        full_name: fullName,
        phone: phone.replace(/\s/g, ''),
        avatar_url: avatarUrl || null
      })

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError)

      // Compensation: supprimer le user auth si le profil échoue
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return new Response(
        JSON.stringify({ error: `Erreur création profil: ${profileError.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Création de l'entrée admin dans la table admins
    // Utiliser NULL si createdBy n'est pas un UUID valide
    let createdByValue = null
    if (createdBy && isValidUUID(createdBy)) {
      createdByValue = createdBy
    }

    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        user_id: userId,
        created_by: createdByValue, // Peut être NULL
        status: 'active'
      })

    if (adminError) {
      console.error('❌ Erreur création entrée admin:', adminError)

      // Compensation: supprimer le profil et le user auth
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return new Response(
        JSON.stringify({ error: `Erreur création admin: ${adminError.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Admin créé avec succès:', { userId, email, fullName })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: userId,
            email: email.trim(),
            role: 'admin',
            full_name: fullName,
            phone: phone.replace(/\s/g, '')
          },
          admin: {
            user_id: userId,
            status: 'active',
            created_by: createdByValue
          }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Fonction utilitaire pour valider les UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}