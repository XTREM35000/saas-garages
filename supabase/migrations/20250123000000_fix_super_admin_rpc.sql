-- Migration pour corriger la fonction create_super_admin_complete
-- Supprimer toutes les anciennes versions
DROP FUNCTION IF EXISTS public.create_super_admin_complete(p_email text, p_password text, p_name text, p_phone text, p_avatar_url text);
DROP FUNCTION IF EXISTS public.create_super_admin_complete(p_email text, p_password text, p_name text, p_phone text);

-- Créer la fonction unifiée avec 4 paramètres
CREATE OR REPLACE FUNCTION public.create_super_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_has_super boolean;
BEGIN
  -- Enforce single active super admin
  SELECT EXISTS(SELECT 1 FROM public.super_admins WHERE est_actif = true) INTO v_has_super;
  IF v_has_super THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un Super Admin existe déjà');
  END IF;

  -- Basic validations
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email requis');
  END IF;
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mot de passe trop court');
  END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Téléphone requis');
  END IF;

  -- Create user id
  v_user_id := gen_random_uuid();

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    phone,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    p_phone,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('display_name', p_name, 'phone', p_phone, 'role', 'super_admin'),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Insert into public.users
  INSERT INTO public.users (
    id,
    avatar_url,
    email,
    name,
    phone,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'public/avatar01.png',
    p_email,
    p_name,
    p_phone,
    'super_admin',
    now(),
    now()
  );

  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    is_superadmin,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    p_name,
    p_phone,
    'super_admin',
    true,
    'public/avatar01.png',
    now(),
    now()
  );

  -- Insertion dans super_admins
  INSERT INTO public.super_admins (
    id,
    user_id,
    email,
    name,
    phone,
    role,
    est_actif,
    pricing_plan,
    trial_started_at,
    trial_ends_at,
    trial_consumed,
    created_at
  ) VALUES (
    v_user_id,
    v_user_id,
    p_email,
    p_name,
    p_phone,
    'super_admin',
    true,
    'free',
    now(),
    now() + interval '7 days',
    false,
    now()
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);

EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_super_admin_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_super_admin_complete TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_super_admin_complete IS 'Fonction pour créer un Super Administrateur complet avec email, mot de passe, nom et téléphone. Peuple automatiquement les 4 tables.';
