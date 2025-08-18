-- ==========================================
-- SUPPRESSION DES ANCIENNES FONCTIONS RPC
-- ==========================================
DROP FUNCTION IF EXISTS create_super_admin(text, text, text);
DROP FUNCTION IF EXISTS can_create_first_super_admin();
DROP FUNCTION IF EXISTS create_profile(uuid, varchar, varchar, varchar, text, varchar);
DROP FUNCTION IF EXISTS create_organisation_with_admin_v2(text, text, text, uuid);

-- ==========================================
-- NOUVELLES FONCTIONS RPC POUR LE WORKFLOW
-- ==========================================

-- 1. Fonction pour vérifier si on peut créer le premier super admin
CREATE OR REPLACE FUNCTION public.check_first_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.super_admins LIMIT 1);
$$;

-- 2. Fonction pour créer un super admin complet (auth + profile + super_admin)
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
  v_result jsonb;
BEGIN
  -- Vérifier qu'aucun super admin n'existe
  IF EXISTS (SELECT 1 FROM public.super_admins LIMIT 1) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Un super admin existe déjà'
    );
  END IF;

  -- Générer un UUID pour l'utilisateur
  v_user_id := gen_random_uuid();

  -- 1. Créer dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
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
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', p_name, 'phone', p_phone, 'role', 'super_admin'),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 2. Créer dans profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    is_superadmin,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    p_name,
    p_phone,
    'superadmin',
    true,
    now(),
    now()
  );

  -- 3. Créer dans super_admins
  INSERT INTO public.super_admins (
    id,
    user_id,
    email,
    name,
    phone,
    est_actif,
    created_at
  ) VALUES (
    v_user_id,
    v_user_id,
    p_email,
    p_name,
    p_phone,
    true,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'message', 'Super admin créé avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 3. Fonction pour créer un admin complet
CREATE OR REPLACE FUNCTION public.create_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_pricing_plan text DEFAULT 'starter'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_super_admin_id uuid;
BEGIN
  -- Récupérer le premier super admin
  SELECT user_id INTO v_super_admin_id 
  FROM public.super_admins 
  WHERE est_actif = true 
  LIMIT 1;

  IF v_super_admin_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucun super admin trouvé'
    );
  END IF;

  -- Générer un UUID pour l'utilisateur
  v_user_id := gen_random_uuid();

  -- 1. Créer dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
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
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', p_name, 'phone', p_phone, 'role', 'admin'),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 2. Créer dans profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    p_name,
    p_phone,
    'admin',
    now(),
    now()
  );

  -- 3. Créer dans admins
  INSERT INTO public.admins (
    id,
    super_admin_id,
    email,
    name,
    pricing_plan,
    phone,
    created_at
  ) VALUES (
    v_user_id,
    v_super_admin_id,
    p_email,
    p_name,
    p_pricing_plan,
    p_phone,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'message', 'Admin créé avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. Fonction pour créer une organisation
CREATE OR REPLACE FUNCTION public.create_organization_complete(
  p_name text,
  p_address text DEFAULT NULL,
  p_admin_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_admin_id uuid;
BEGIN
  -- Récupérer l'admin actuel
  IF p_admin_email IS NOT NULL THEN
    SELECT id INTO v_admin_id FROM public.admins WHERE email = p_admin_email LIMIT 1;
  ELSE
    -- Prendre le premier admin disponible
    SELECT id INTO v_admin_id FROM public.admins ORDER BY created_at DESC LIMIT 1;
  END IF;

  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucun admin trouvé'
    );
  END IF;

  -- Créer l'organisation
  INSERT INTO public.organizations (
    admin_id,
    name,
    address,
    created_at
  ) VALUES (
    v_admin_id,
    p_name,
    p_address,
    now()
  ) RETURNING id INTO v_org_id;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'message', 'Organisation créée avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 5. Fonction pour créer un garage
CREATE OR REPLACE FUNCTION public.create_garage_complete(
  p_name text,
  p_address text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_organization_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_garage_id uuid;
  v_org_id uuid;
BEGIN
  -- Récupérer l'organisation
  IF p_organization_id IS NOT NULL THEN
    v_org_id := p_organization_id;
  ELSE
    -- Prendre la première organisation disponible
    SELECT id INTO v_org_id FROM public.organizations ORDER BY created_at DESC LIMIT 1;
  END IF;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucune organisation trouvée'
    );
  END IF;

  -- Créer le garage
  INSERT INTO public.garages (
    organization_id,
    name,
    address,
    phone,
    created_at
  ) VALUES (
    v_org_id,
    p_name,
    p_address,
    p_phone,
    now()
  ) RETURNING id INTO v_garage_id;

  RETURN jsonb_build_object(
    'success', true,
    'garage_id', v_garage_id,
    'message', 'Garage créé avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 6. Fonction pour valider le SMS (simulation)
CREATE OR REPLACE FUNCTION public.validate_sms_code(
  p_code text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simulation : code correct = 1234
  IF p_code = '1234' THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Code SMS validé avec succès'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Code SMS incorrect'
    );
  END IF;
END;
$$;

-- 7. Fonction pour vérifier l'état du workflow
CREATE OR REPLACE FUNCTION public.check_workflow_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_super_admin boolean;
  v_has_admin boolean;
  v_has_organization boolean;
  v_has_garage boolean;
  v_current_step text;
BEGIN
  -- Vérifier chaque étape
  SELECT EXISTS(SELECT 1 FROM public.super_admins LIMIT 1) INTO v_has_super_admin;
  SELECT EXISTS(SELECT 1 FROM public.admins LIMIT 1) INTO v_has_admin;
  SELECT EXISTS(SELECT 1 FROM public.organizations LIMIT 1) INTO v_has_organization;
  SELECT EXISTS(SELECT 1 FROM public.garages LIMIT 1) INTO v_has_garage;

  -- Déterminer l'étape actuelle
  IF NOT v_has_super_admin THEN
    v_current_step := 'super_admin';
  ELSIF NOT v_has_admin THEN
    v_current_step := 'admin';
  ELSIF NOT v_has_organization THEN
    v_current_step := 'organization';
  ELSIF NOT v_has_garage THEN
    v_current_step := 'sms_validation';
  ELSE
    v_current_step := 'garage';
  END IF;

  -- Si tout est configuré
  IF v_has_super_admin AND v_has_admin AND v_has_organization AND v_has_garage THEN
    v_current_step := 'completed';
  END IF;

  RETURN jsonb_build_object(
    'current_step', v_current_step,
    'has_super_admin', v_has_super_admin,
    'has_admin', v_has_admin,
    'has_organization', v_has_organization,
    'has_garage', v_has_garage,
    'is_completed', v_current_step = 'completed'
  );
END;
$$;