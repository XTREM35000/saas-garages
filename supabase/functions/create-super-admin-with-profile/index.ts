import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};
serve(async (req)=>{
  console.log("=== CRÉATION SUPER ADMIN ===");
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({
        error: "Configuration manquante"
      }), {
        headers: corsHeaders,
        status: 500
      });
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    // CORRECTION ICI : valeur par défaut pour avatarUrl
    const { email, password, firstName, lastName, phone, avatarUrl = null } = body;
    console.log("📦 Données reçues:", {
      email,
      firstName,
      lastName,
      avatarUrl
    });
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return new Response(JSON.stringify({
        error: "Email, password, firstName et lastName requis"
      }), {
        headers: corsHeaders,
        status: 400
      });
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
        avatar_url: avatarUrl,
        role: 'super_admin'
      }
    });
    if (authError) {
      console.error("❌ Erreur auth:", authError);
      return new Response(JSON.stringify({
        error: authError.message
      }), {
        headers: corsHeaders,
        status: 400
      });
    }
    if (!userData.user) {
      return new Response(JSON.stringify({
        error: "Aucun utilisateur créé"
      }), {
        headers: corsHeaders,
        status: 400
      });
    }
    console.log("✅ User Auth créé:", userData.user.id);
    // 2. Création du profil
    console.log("👤 Création profil...");
    const profileData = {
      id: userData.user.id,
      email: userData.user.email,
      password_hash: 'auth_managed',
      role: 'super_admin',
      phone: phone ? phone.replace(/\s/g, '') : '',
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      user_name: firstName.trim() + ' ' + lastName.trim(),
      avatar_url: avatarUrl // Utilisation sécurisée
    };
    const { error: profileError } = await supabaseAdmin.from('profiles').insert(profileData);
    if (profileError) {
      console.error("❌ Erreur profil:", profileError);
      // Gestion d'erreur améliorée
      if (profileError.message.includes('password_hash')) {
        console.warn("⚠️ Problème password_hash, tentative sans...");
        delete profileData.password_hash;
        const { error: retryError } = await supabaseAdmin.from('profiles').insert(profileData);
        if (retryError) {
          throw new Error(`Erreur création profil: ${retryError.message}`);
        }
      } else {
        throw new Error(`Erreur création profil: ${profileError.message}`);
      }
    }
    console.log("✅ Profil créé avec succès");
    // Succès
    return new Response(JSON.stringify({
      success: true,
      message: "Super admin créé avec succès",
      data: {
        user: {
          id: userData.user.id,
          email: userData.user.email,
          role: "super_admin"
        }
      }
    }), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    console.error("💥 Erreur inattendue:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
