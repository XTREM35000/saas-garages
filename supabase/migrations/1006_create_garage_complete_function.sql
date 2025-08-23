-- Migration pour créer la fonction RPC create_garage_complete
-- Cette fonction permet de créer un garage complet avec responsable en une seule fois

CREATE OR REPLACE FUNCTION public.create_garage_complete(
  p_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_country TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_description TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_organization_id UUID,
  p_responsable_name TEXT,
  p_responsable_email TEXT,
  p_responsable_phone TEXT,
  p_responsable_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_garage_id UUID;
  v_responsable_id UUID;
  v_user_id UUID;
  v_profile_id UUID;
  v_result JSONB;
BEGIN
  -- Vérifications de base
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nom du garage requis');
  END IF;

  IF p_organization_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ID de l\'organisation requis');
  END IF;

  IF p_responsable_name IS NULL OR length(trim(p_responsable_name)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nom du responsable requis');
  END IF;

  -- Vérifier que l'organisation existe
  IF NOT EXISTS(SELECT 1 FROM public.organizations WHERE id = p_organization_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organisation non trouvée');
  END IF;

  -- Vérifier l'unicité de l'email du responsable
  IF EXISTS(SELECT 1 FROM auth.users WHERE email = p_responsable_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cet email est déjà utilisé');
  END IF;

  -- Créer l'utilisateur responsable dans auth.users
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    p_responsable_email,
    p_responsable_phone,
    crypt(p_responsable_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('display_name', p_responsable_name, 'phone', p_responsable_phone, 'role', 'responsable'),
    'authenticated',
    'authenticated',
    now(),
    now()
  ) RETURNING id INTO v_user_id;

  -- Créer le profil du responsable
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    is_superadmin,
    avatar_url,
    organization_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_responsable_email,
    p_responsable_name,
    p_responsable_name,
    p_responsable_phone,
    'responsable',
    false,
    COALESCE(p_logo_url, 'public/avatar01.png'),
    p_organization_id,
    now(),
    now()
  ) RETURNING id INTO v_profile_id;

  -- Créer le garage
  INSERT INTO public.garages (
    id,
    name,
    address,
    city,
    country,
    phone,
    email,
    description,
    logo_url,
    organization_id,
    responsable_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_name,
    p_address,
    p_city,
    p_country,
    p_phone,
    p_email,
    p_description,
    p_logo_url,
    p_organization_id,
    v_user_id,
    now(),
    now()
  ) RETURNING id INTO v_garage_id;

  -- Créer le responsable
  INSERT INTO public.responsables (
    id,
    user_id,
    garage_id,
    name,
    email,
    phone,
    role,
    est_actif,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_garage_id,
    p_responsable_name,
    p_responsable_email,
    p_responsable_phone,
    'responsable',
    true,
    now(),
    now()
  ) RETURNING id INTO v_responsable_id;

  -- Retourner le succès avec les informations
  v_result := jsonb_build_object(
    'success', true,
    'garage_id', v_garage_id,
    'responsable_id', v_responsable_id,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'message', 'Garage créé avec succès'
  );

  RETURN v_result;

EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_garage_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_garage_complete TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_garage_complete IS 'Fonction pour créer un garage complet avec responsable en une seule transaction atomique';
