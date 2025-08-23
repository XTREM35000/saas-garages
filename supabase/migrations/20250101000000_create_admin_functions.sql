-- Migration pour les fonctions de gestion des administrateurs
-- Date: 2025-01-01

-- 1. Fonction pour créer un administrateur complet
CREATE OR REPLACE FUNCTION public.create_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_admin_id uuid;
  v_first_name text;
  v_last_name text;
BEGIN
  -- Validation des paramètres
  IF p_email IS NULL OR p_password IS NULL OR p_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email, mot de passe et nom sont requis'
    );
  END IF;

  -- Vérifier que l'email n'existe pas déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Un utilisateur avec cet email existe déjà'
    );
  END IF;

  -- Extraire prénom et nom
  v_first_name := split_part(p_name, ' ', 1);
  v_last_name := CASE 
    WHEN array_length(string_to_array(p_name, ' '), 1) > 1 
    THEN array_to_string(string_to_array(p_name, ' ')[2:], ' ')
    ELSE v_first_name
  END;

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'name', p_name,
      'first_name', v_first_name,
      'last_name', v_last_name,
      'phone', p_phone,
      'avatar_url', p_avatar_url
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  -- Créer le profil dans public.users
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    v_first_name,
    v_last_name,
    p_name,
    p_phone,
    p_avatar_url,
    now(),
    now()
  );

  -- Créer le profil dans public.profiles
  INSERT INTO public.profiles (
    id,
    user_id,
    first_name,
    last_name,
    full_name,
    phone,
    avatar_url,
    theme,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_first_name,
    v_last_name,
    p_name,
    p_phone,
    p_avatar_url,
    'default',
    now(),
    now()
  ) RETURNING id INTO v_profile_id;

  -- Créer l'administrateur dans public.admins
  INSERT INTO public.admins (
    id,
    user_id,
    email,
    name,
    phone,
    avatar_url,
    permissions,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    p_email,
    p_name,
    p_phone,
    p_avatar_url,
    '["manage_organization", "manage_garages", "manage_users"]',
    'active',
    now(),
    now()
  ) RETURNING id INTO v_admin_id;

  -- Retourner le succès
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'admin_id', v_admin_id,
    'message', 'Administrateur créé avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, nettoyer et retourner l'erreur
  IF v_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 2. Fonction pour vérifier si un administrateur existe
CREATE OR REPLACE FUNCTION public.check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins LIMIT 1);
END;
$$;

-- 3. Fonction pour vérifier l'état du workflow
CREATE OR REPLACE FUNCTION public.get_workflow_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_super_admin_exists boolean;
  v_admin_exists boolean;
  v_organization_exists boolean;
  v_current_step text;
BEGIN
  -- Vérifier l'existence des éléments
  v_super_admin_exists := EXISTS (SELECT 1 FROM public.super_admins LIMIT 1);
  v_admin_exists := EXISTS (SELECT 1 FROM public.admins LIMIT 1);
  v_organization_exists := EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

  -- Déterminer l'étape actuelle
  IF NOT v_super_admin_exists THEN
    v_current_step := 'super_admin';
  ELSIF NOT v_admin_exists THEN
    v_current_step := 'admin';
  ELSIF NOT v_organization_exists THEN
    v_current_step := 'organization';
  ELSE
    v_current_step := 'completed';
  END IF;

  RETURN jsonb_build_object(
    'current_step', v_current_step,
    'super_admin_exists', v_super_admin_exists,
    'admin_exists', v_admin_exists,
    'organization_exists', v_organization_exists,
    'completed_steps', array_remove(ARRAY[
      CASE WHEN v_super_admin_exists THEN 'super_admin' END,
      CASE WHEN v_admin_exists THEN 'admin' END,
      CASE WHEN v_organization_exists THEN 'organization' END
    ], NULL)
  );
END;
$$;

-- 4. Fonction pour réinitialiser le workflow (pour les tests)
CREATE OR REPLACE FUNCTION public.reset_workflow()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer dans l'ordre pour respecter les contraintes
  DELETE FROM public.organizations;
  DELETE FROM public.admins;
  DELETE FROM public.profiles;
  DELETE FROM public.users;
  DELETE FROM public.super_admins;
  
  -- Note: auth.users n'est pas supprimé pour des raisons de sécurité
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Workflow réinitialisé avec succès'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 5. Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION public.create_admin_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_workflow_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_workflow TO service_role;

-- 6. Commentaires pour la documentation
COMMENT ON FUNCTION public.create_admin_complete IS 'Crée un administrateur complet dans auth.users, public.users, public.profiles et public.admins';
COMMENT ON FUNCTION public.check_admin_exists IS 'Vérifie si au moins un administrateur existe dans le système';
COMMENT ON FUNCTION public.get_workflow_status IS 'Retourne l''état actuel du workflow de configuration';
COMMENT ON FUNCTION public.reset_workflow IS 'Réinitialise le workflow (pour les tests uniquement)';
