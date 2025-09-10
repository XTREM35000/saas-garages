// functions/create-admin-with-profile/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// Fonction utilitaire pour insertion sécurisée du profil
async function insertProfileSafe(supabase: any, profileData: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert(profileData);
    
    if (error && error.message.includes('column') && error.message.includes('not found')) {
      console.warn("Colonnes manquantes détectées, utilisation des champs de base...");
      
      // Version minimaliste avec seulement les colonnes essentielles
      const basicProfile = {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        phone: profileData.phone || '',
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString()
      };
      
      const { error: basicError } = await supabase
        .from('profiles')
        .insert(basicProfile);
        
      if (basicError) throw basicError;
      return { success: true };
    }
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Fonction utilitaire pour insertion sécurisée admin
async function insertAdminSafe(supabase: any, adminData: any) {
  try {
    const { error } = await supabase
      .from('admins')
      .insert(adminData);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.warn("Table admins non disponible, continuation sans...");
        return { success: true, skipped: true };
      }
      throw error;
    }
    return { success: true };
  } catch (error) {
    return { error };
  }
}

serve(async (req) => {
  console.log("=== CRÉATION ADMIN ===");

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, firstName, lastName, phone, avatarUrl, createdBy } = await req.json();
    
    // Validation des données requises
    if (!email || !password || !firstName || !lastName || !phone) {
      return new Response(
        JSON.stringify({
          error: 'Tous les champs obligatoires doivent être remplis: email, password, firstName, lastName, phone'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format d\'email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation mot de passe
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 6 caractères' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialisation du client Supabase admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration Supabase manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Création du user avec l'API Admin
    console.log("🔐 Création user Auth...");
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.replace(/\s/g, ''),
        role: 'admin'
      }
    });

    if (userError) {
      console.error('❌ Erreur création user auth:', userError);
      return new Response(
        JSON.stringify({ error: `Erreur création utilisateur: ${userError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      throw new Error('Aucun utilisateur créé');
    }

    const userId = userData.user.id;
    console.log("✅ User Auth créé:", userId);

    // 2. Création du profil (version sécurisée)
    console.log("👤 Création profil...");
    const profileResult = await insertProfileSafe(supabaseAdmin, {
      id: userId,
      email: email.trim(),
      role: 'admin',
      phone: phone.replace(/\s/g, ''),
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      avatar_url: avatarUrl || null
    });

    if (profileResult.error) {
      console.error('❌ Erreur création profil:', profileResult.error);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erreur création profil: ${profileResult.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ Profil créé avec succès");

    // 3. Création de l'entrée admin (optionnelle)
    console.log("⭐ Tentative création entrée admin...");
    let createdByValue = null;
    if (createdBy && isValidUUID(createdBy)) {
      createdByValue = createdBy;
    }

    const adminResult = await insertAdminSafe(supabaseAdmin, {
      user_id: userId,
      created_by: createdByValue,
      status: 'active',
      created_at: new Date().toISOString()
    });

    if (adminResult.error) {
      console.error('❌ Erreur création admin:', adminResult.error);
      // Compensation: supprimer le profil et le user auth
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erreur création admin: ${adminResult.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (adminResult.skipped) {
      console.warn("⚠️ Table admins non disponible, continuation sans...");
    } else {
      console.log("✅ Entrée admin créée");
    }

    // Succès
    console.log('✅ Admin créé avec succès:', { userId, email });
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: userId,
            email: email.trim(),
            role: 'admin',
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.replace(/\s/g, '')
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction utilitaire pour valider les UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}