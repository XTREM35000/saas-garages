import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Initialiser Supabase avec la clé de service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les données du body
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      avatarUrl 
    } = await req.json();

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Email, mot de passe, prénom et nom sont requis',
            code: 'missing_required_fields'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('🔐 Création Super Admin:', { email, firstName, lastName });

    // 1️⃣ Créer l'utilisateur dans auth.users
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        phone: phone || '',
        avatarUrl: avatarUrl || '',
        role: 'superadmin' // Important: définir le rôle ici
      }
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError);
      return new Response(
        JSON.stringify({
          error: {
            message: authError.message,
            code: authError.status || 'auth_error',
            details: authError
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Échec création utilisateur',
            code: 'user_creation_failed'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('✅ Utilisateur créé:', user.id);

    // Le trigger sur auth.users s'occupe automatiquement de créer le profile et super_admin
    // grâce aux métadonnées avec role: 'superadmin'

    return new Response(
      JSON.stringify({
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: 'superadmin'
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Erreur interne du serveur',
          code: 'unexpected_failure',
          details: error
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
