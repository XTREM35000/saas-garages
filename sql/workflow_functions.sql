-- 🚀 Fonctions RPC pour le Workflow d'Onboarding GarageConnect
-- Ce fichier contient toutes les fonctions nécessaires pour le workflow

-- =====================================================
-- 1. VÉRIFICATION SUPER ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  -- Vérifier s'il existe au moins un super admin
  SELECT COUNT(*) INTO super_admin_count
  FROM public.super_admins;
  
  RETURN super_admin_count > 0;
END;
$$;

-- =====================================================
-- 2. CRÉATION SUPER ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION create_super_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_display_name TEXT;
  v_result JSONB;
BEGIN
  -- Validation des paramètres
  IF p_email IS NULL OR p_password IS NULL OR p_first_name IS NULL OR p_last_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tous les champs sont obligatoires'
    );
  END IF;

  -- Vérifier si un super admin existe déjà
  IF EXISTS (SELECT 1 FROM public.super_admins) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Un Super Administrateur existe déjà'
    );
  END IF;

  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cet email est déjà utilisé'
    );
  END IF;

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- Construire le nom d'affichage
  v_display_name := p_first_name || ' ' || p_last_name;

  -- Insérer dans public.users
  INSERT INTO public.users (id, display_name, first_name, last_name, phone, role, created_at, updated_at)
  VALUES (v_user_id, v_display_name, p_first_name, p_last_name, p_phone, 'super_admin', NOW(), NOW());

  -- Créer le profil dans public.profiles
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (v_user_id, NOW(), NOW());

  -- Ajouter dans public.super_admins
  INSERT INTO public.super_admins (id, permissions, created_at, updated_at)
  VALUES (v_user_id, 
    jsonb_build_object(
      'can_manage_organizations', true,
      'can_manage_super_admins', true,
      'can_access_analytics', true,
      'can_manage_billing', true
    ),
    NOW(), NOW()
  );

  -- Retourner le succès
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'display_name', v_display_name,
    'message', 'Super Administrateur créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, nettoyer et retourner l'erreur
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.super_admins WHERE id = v_user_id;
      DELETE FROM public.profiles WHERE id = v_user_id;
      DELETE FROM public.users WHERE id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création: ' || SQLERRM
    );
END;
$$;

-- =====================================================
-- 3. CRÉATION ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_display_name TEXT;
  v_result JSONB;
BEGIN
  -- Validation des paramètres
  IF p_email IS NULL OR p_password IS NULL OR p_first_name IS NULL OR p_last_name IS NULL OR p_organization_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tous les champs sont obligatoires'
    );
  END IF;

  -- Vérifier si l'organisation existe
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = p_organization_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organisation non trouvée'
    );
  END IF;

  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cet email est déjà utilisé'
    );
  END IF;

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- Construire le nom d'affichage
  v_display_name := p_first_name || ' ' || p_last_name;

  -- Insérer dans public.users
  INSERT INTO public.users (id, display_name, first_name, last_name, phone, role, created_at, updated_at)
  VALUES (v_user_id, v_display_name, p_first_name, p_last_name, p_phone, 'admin', NOW(), NOW());

  -- Créer le profil dans public.profiles
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (v_user_id, NOW(), NOW());

  -- Associer l'admin à l'organisation (table de liaison)
  INSERT INTO public.organization_users (user_id, organization_id, role, created_at, updated_at)
  VALUES (v_user_id, p_organization_id, 'admin', NOW(), NOW());

  -- Retourner le succès
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'display_name', v_display_name,
    'organization_id', p_organization_id,
    'message', 'Administrateur créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, nettoyer et retourner l'erreur
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.profiles WHERE id = v_user_id;
      DELETE FROM public.users WHERE id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création: ' || SQLERRM
    );
END;
$$;

-- =====================================================
-- 4. CRÉATION ORGANISATION
-- =====================================================

CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_plan_type TEXT,
  p_super_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
  v_slug TEXT;
  v_domain TEXT;
  v_result JSONB;
  v_slug_counter INTEGER := 0;
  v_temp_slug TEXT;
BEGIN
  -- Validation des paramètres
  IF p_name IS NULL OR p_plan_type IS NULL OR p_super_admin_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tous les champs sont obligatoires'
    );
  END IF;

  -- Vérifier si le super admin existe
  IF NOT EXISTS (SELECT 1 FROM public.super_admins WHERE id = p_super_admin_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Super Administrateur non trouvé'
    );
  END IF;

  -- Vérifier le type de plan
  IF p_plan_type NOT IN ('free', 'pro', 'enterprise') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Type de plan invalide'
    );
  END IF;

  -- Générer le slug unique
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9\s]', '', 'g'));
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  
  -- Vérifier l'unicité du slug
  v_temp_slug := v_slug;
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = v_temp_slug) LOOP
    v_slug_counter := v_slug_counter + 1;
    v_temp_slug := v_slug || '-' || v_slug_counter;
  END LOOP;
  
  v_slug := v_temp_slug;

  -- Générer le domaine par défaut
  v_domain := v_slug || '.garageconnect.com';

  -- Créer l'organisation
  INSERT INTO public.organizations (
    name, slug, domain, plan_type, status, created_at, updated_at
  )
  VALUES (
    p_name, v_slug, v_domain, p_plan_type, 'active', NOW(), NOW()
  )
  RETURNING id INTO v_organization_id;

  -- Créer le plan d'abonnement
  INSERT INTO public.organization_plans (
    organization_id, plan_type, status, start_date, created_at, updated_at
  )
  VALUES (
    v_organization_id, p_plan_type, 'active', NOW(), NOW(), NOW()
  );

  -- Associer le super admin à l'organisation
  INSERT INTO public.organization_users (user_id, organization_id, role, created_at, updated_at)
  VALUES (p_super_admin_id, v_organization_id, 'super_admin', NOW(), NOW());

  -- Retourner le succès
  v_result := jsonb_build_object(
    'success', true,
    'organization_id', v_organization_id,
    'name', p_name,
    'slug', v_slug,
    'domain', v_domain,
    'plan_type', p_plan_type,
    'message', 'Organisation créée avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, nettoyer et retourner l'erreur
    IF v_organization_id IS NOT NULL THEN
      DELETE FROM public.organization_plans WHERE organization_id = v_organization_id;
      DELETE FROM public.organization_users WHERE organization_id = v_organization_id;
      DELETE FROM public.organizations WHERE id = v_organization_id;
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création: ' || SQLERRM
    );
END;
$$;

-- =====================================================
-- 5. VÉRIFICATION ORGANISATION
-- =====================================================

CREATE OR REPLACE FUNCTION get_organization_status(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_data JSONB;
BEGIN
  -- Récupérer les informations de l'organisation
  SELECT jsonb_build_object(
    'id', o.id,
    'name', o.name,
    'slug', o.slug,
    'domain', o.domain,
    'custom_domain', o.custom_domain,
    'plan_type', o.plan_type,
    'status', o.status,
    'created_at', o.created_at,
    'admin_count', (
      SELECT COUNT(*) 
      FROM public.organization_users 
      WHERE organization_id = o.id AND role = 'admin'
    ),
    'garage_count', (
      SELECT COUNT(*) 
      FROM public.garages 
      WHERE organization_id = o.id
    )
  ) INTO v_org_data
  FROM public.organizations o
  WHERE o.id = p_organization_id;

  IF v_org_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organisation non trouvée'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_org_data
  );
END;
$$;

-- =====================================================
-- 6. GESTION DES DOMAINES PERSONNALISÉS
-- =====================================================

CREATE OR REPLACE FUNCTION add_custom_domain(
  p_organization_id UUID,
  p_custom_domain TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_exists BOOLEAN;
BEGIN
  -- Validation des paramètres
  IF p_organization_id IS NULL OR p_custom_domain IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tous les champs sont obligatoires'
    );
  END IF;

  -- Vérifier si l'organisation existe
  SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = p_organization_id) INTO v_org_exists;
  
  IF NOT v_org_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organisation non trouvée'
    );
  END IF;

  -- Vérifier si le domaine personnalisé est déjà utilisé
  IF EXISTS (SELECT 1 FROM public.organizations WHERE custom_domain = p_custom_domain) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce domaine est déjà utilisé par une autre organisation'
    );
  END IF;

  -- Mettre à jour l'organisation avec le domaine personnalisé
  UPDATE public.organizations 
  SET custom_domain = p_custom_domain, updated_at = NOW()
  WHERE id = p_organization_id;

  RETURN jsonb_build_object(
    'success', true,
    'custom_domain', p_custom_domain,
    'message', 'Domaine personnalisé ajouté avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de l\'ajout du domaine: ' || SQLERRM
    );
END;
$$;

-- =====================================================
-- 7. CRÉATION DU PREMIER GARAGE
-- =====================================================

CREATE OR REPLACE FUNCTION create_first_garage(
  p_organization_id UUID,
  p_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_postal_code TEXT,
  p_country TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_phone TEXT,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_garage_id UUID;
  v_result JSONB;
BEGIN
  -- Validation des paramètres
  IF p_organization_id IS NULL OR p_name IS NULL OR p_address IS NULL OR p_city IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Les champs nom, adresse et ville sont obligatoires'
    );
  END IF;

  -- Vérifier si l'organisation existe
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = p_organization_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organisation non trouvée'
    );
  END IF;

  -- Créer le garage
  INSERT INTO public.garages (
    organization_id, name, address, city, postal_code, country,
    latitude, longitude, phone, email, status, created_at, updated_at
  )
  VALUES (
    p_organization_id, p_name, p_address, p_city, p_postal_code, p_country,
    p_latitude, p_longitude, p_phone, p_email, 'active', NOW(), NOW()
  )
  RETURNING id INTO v_garage_id;

  -- Retourner le succès
  v_result := jsonb_build_object(
    'success', true,
    'garage_id', v_garage_id,
    'name', p_name,
    'organization_id', p_organization_id,
    'message', 'Garage créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création: ' || SQLERRM
    );
END;
$$;

-- =====================================================
-- 8. FONCTION DE RÉINITIALISATION (pour les tests)
-- =====================================================

CREATE OR REPLACE FUNCTION reset_workflow_test_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer toutes les données de test (à utiliser uniquement en développement)
  DELETE FROM public.garages;
  DELETE FROM public.organization_plans;
  DELETE FROM public.organization_users;
  DELETE FROM public.organizations;
  DELETE FROM public.super_admins;
  DELETE FROM public.profiles;
  DELETE FROM public.users;
  
  -- Note: auth.users n'est pas supprimé pour des raisons de sécurité
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Données de test réinitialisées'
  );
END;
$$;

-- =====================================================
-- COMMENTAIRES ET MÉTADONNÉES
-- =====================================================

COMMENT ON FUNCTION is_super_admin() IS 'Vérifie si un Super Administrateur existe dans le système';
COMMENT ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Crée un Super Administrateur avec tous les privilèges';
COMMENT ON FUNCTION create_admin(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS 'Crée un administrateur pour une organisation spécifique';
COMMENT ON FUNCTION create_organization(TEXT, TEXT, UUID) IS 'Crée une nouvelle organisation avec slug et domaine automatiques';
COMMENT ON FUNCTION get_organization_status(UUID) IS 'Récupère le statut et les informations d''une organisation';
COMMENT ON FUNCTION add_custom_domain(UUID, TEXT) IS 'Ajoute un domaine personnalisé à une organisation';
COMMENT ON FUNCTION create_first_garage(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT) IS 'Crée le premier garage d''une organisation';
COMMENT ON FUNCTION reset_workflow_test_data() IS 'Réinitialise les données de test (développement uniquement)';

