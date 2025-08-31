import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log(`[Admin Management] Processing action: ${action}`);
    switch(action){
      case 'create-super-admin':
        {
          const { email, password, fullName, avatarUrl } = await req.json();
          console.log(`[Create Super Admin] Creating super admin for email: ${email}`);
          // Check if a super admin already exists
          const { data: existingSuperAdmin } = await supabase.from('super_admins').select('id').eq('est_actif', true).single();
          if (existingSuperAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Un super administrateur existe déjà dans le système'
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          // Create user in auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              avatar_url: avatarUrl || null,
              role: 'superadmin'
            }
          });
          if (authError) {
            console.error('[Create Super Admin] Auth error:', authError);
            return new Response(JSON.stringify({
              success: false,
              error: `Erreur lors de la création de l'utilisateur: ${authError.message}`
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          const userId = authUser.user?.id;
          if (!userId) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Impossible de récupérer l\'ID utilisateur'
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          // Split full name
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          // Create profile with is_super_admin = true
          const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            user_id: userId,
            email,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl || null,
            role: 'superadmin',
            status: true
          });
          if (profileError) {
            console.error('[Create Super Admin] Profile error:', profileError);
          }
          // Create entry in users table
          const { error: usersError } = await supabase.from('users').insert({
            id: userId,
            email,
            name: fullName,
            role: 'superadmin',
            avatar_url: avatarUrl || null
          });
          if (usersError) {
            console.error('[Create Super Admin] Users table error:', usersError);
          }
          // Create entry in super_admins table
          const { error: superAdminError } = await supabase.from('super_admins').insert({
            id: userId,
            user_id: userId,
            email,
            name: fullName,
            nom: lastName,
            prenom: firstName,
            role: 'superadmin',
            est_actif: true,
            pricing_plan: 'free',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            trial_consumed: false
          });
          if (superAdminError) {
            console.error('[Create Super Admin] Super admin table error:', superAdminError);
          }
          console.log(`[Create Super Admin] Super admin created successfully with ID: ${userId}`);
          return new Response(JSON.stringify({
            success: true,
            message: 'Super administrateur créé avec succès',
            userId
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      case 'login':
        {
          const { email, password } = await req.json();
          console.log(`[Login] Attempting login for: ${email}`);
          // Sign in user
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) {
            console.error('[Login] Sign in error:', signInError);
            return new Response(JSON.stringify({
              success: false,
              error: 'Email ou mot de passe incorrect'
            }), {
              status: 401,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          // Verify user is a super admin
          const { data: superAdmin, error: superAdminError } = await supabase.from('super_admins').select('*').eq('user_id', signInData.user.id).eq('est_actif', true).single();
          if (superAdminError || !superAdmin) {
            console.error('[Login] Super admin verification failed:', superAdminError);
            return new Response(JSON.stringify({
              success: false,
              error: 'Accès refusé: vous devez être super administrateur'
            }), {
              status: 403,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          console.log(`[Login] Super admin logged in successfully: ${email}`);
          return new Response(JSON.stringify({
            success: true,
            message: 'Connexion réussie',
            user: signInData.user,
            session: signInData.session,
            superAdmin
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      case 'check-super-admin':
        {
          // Check if any super admin exists
          const { data: superAdmins, error } = await supabase.from('super_admins').select('id').eq('est_actif', true);
          if (error) {
            console.error('[Check Super Admin] Error:', error);
            return new Response(JSON.stringify({
              success: false,
              error: 'Erreur lors de la vérification'
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          return new Response(JSON.stringify({
            success: true,
            hasSuperAdmin: superAdmins && superAdmins.length > 0
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Action non supportée'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    console.error('[Admin Management] Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur interne du serveur'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
