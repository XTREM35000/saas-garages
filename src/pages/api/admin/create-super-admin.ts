// src/pages/api/admin/create-super-admin.ts
import { type APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, avatarUrl } = body;

    console.log('📥 Création Super Admin demandée:', { email, firstName, lastName });

    // 🎯 CONFIGURATION EN DUR POUR L'API
    const supabaseUrl = "https://bmkmiqpasfaprfpfynms.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJta21pcXBhc2ZhcHJmcGZ5bm1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUyMDQyNywiZXhwIjoyMDcyMDk2NDI3fQ.1zvzrmGdtlitXNhZcEdoWeO5xIPX3WN30T4NuuNKotc"; // ← REMPLACEZ!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Création du user auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.replace(/\s/g, ''),
        role: 'super_admin'
      }
    });

    if (userError) {
      console.error('❌ Erreur auth:', userError);
      throw userError;
    }

    console.log('✅ User auth créé:', userData.user.id);

    // 2. Création du profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: email.trim(),
        role: 'super_admin',
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.replace(/\s/g, ''),
        avatar_url: avatarUrl,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Erreur profil:', profileError);
      // Compensation
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw profileError;
    }

    console.log('✅ Profil créé avec succès');

    return new Response(JSON.stringify({
      success: true,
      user: userData.user,
      profile: {
        id: userData.user.id,
        email: userData.user.email,
        role: 'super_admin'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error('💥 Erreur API:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur interne du serveur'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
};