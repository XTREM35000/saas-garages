import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};

serve(async (req) => {
  console.log("=== CRÉATION SUPER ADMIN ===");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Configuration manquante" }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    const { email, password, firstName, lastName, phone, avatarUrl } = body;

    console.log("📦 Données reçues:", { email, firstName, lastName });

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Email, password, firstName et lastName requis" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // 1. Création de l'utilisateur Auth
    console.log("🔐 Création user Auth...");
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone ? phone.replace(/\s/g, '') : '',
        avatar_url: avatarUrl || '',
        role: 'super_admin'
      },
    });

    if (authError) {
      console.error("❌ Erreur auth:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Aucun utilisateur créé" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log("✅ User Auth créé:", userData.user.id);

    // 2. Création du profil
    console.log("👤 Création profil...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        role: 'super_admin',
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone ? phone.replace(/\s/g, '') : '',
        avatar_url: avatarUrl || '',
        organization_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error("❌ Erreur profil:", profileError);
      // Compensation : suppression de l'user auth
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: "Erreur création profil: " + profileError.message }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log("✅ Profil créé");

    // 3. Création super_admin
    console.log("⭐ Création super_admin...");
    const { error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .insert({
        user_id: userData.user.id,
        permissions: ['all'],
        is_active: true,
        pricing_plan_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString()
      });

    if (superAdminError) {
      console.warn("⚠️ Erreur super_admin:", superAdminError);
      // On ne compense pas car le profil est déjà créé
    } else {
      console.log("✅ Super_admin créé");
    }

    // Succès
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: userData.user.id,
            email: userData.user.email,
            role: "super_admin"
          }
        }
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("💥 Erreur inattendue:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});