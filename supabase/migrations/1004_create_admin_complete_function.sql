-- Migration 1004: Créer la fonction RPC pour créer un Admin complet
-- Cette fonction est similaire à create_super_admin_complete mais pour les Admins

CREATE OR REPLACE FUNCTION public.create_admin_complete(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_admin_id UUID;
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est un Super Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE est_actif = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucun Super Admin actif trouvé'
    );
  END IF;

  -- Vérifier l'unicité de l'email et du téléphone
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = p_email
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cet email est déjà utilisé'
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone = p_phone
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce numéro de téléphone est déjà utilisé'
    );
  END IF;

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
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"' || p_name || '"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  -- Créer le profil dans public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    avatar_url,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    p_phone,
    p_avatar_url,
    'admin',
    NOW(),
    NOW()
  ) RETURNING id INTO v_profile_id;

  -- Créer l'admin dans public.admins
  INSERT INTO public.admins (
    id,
    user_id,
    nom,
    prenom,
    email,
    telephone,
    avatar_url,
    est_actif,
    date_creation,
    date_modification
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    split_part(p_name, ' ', 1), -- Premier mot comme nom
    split_part(p_name, ' ', 2), -- Deuxième mot comme prénom
    p_email,
    p_phone,
    p_avatar_url,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_admin_id;

  -- Retourner le succès avec les informations
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'admin_id', v_admin_id,
    'message', 'Admin créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, nettoyer et retourner l'erreur
    IF v_user_id IS NOT NULL THEN
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création de l''admin: ' || SQLERRM
    );
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_admin_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_complete TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_admin_complete IS 'Crée un Admin complet avec utilisateur, profil et admin en une seule transaction atomique';
