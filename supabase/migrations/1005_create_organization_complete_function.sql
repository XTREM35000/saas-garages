-- Migration 1005: Créer la fonction RPC pour créer une organisation complète
-- Cette fonction gère la création d'organisation avec slug, sous-domaine et email d'entreprise

CREATE OR REPLACE FUNCTION public.create_organization_complete(
  p_name TEXT,
  p_description TEXT,
  p_slug TEXT,
  p_address TEXT,
  p_city TEXT,
  p_country TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_website TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_plan_type TEXT,
  p_subdomain TEXT,
  p_company_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
  v_super_admin_id UUID;
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est un Super Admin
  SELECT id INTO v_super_admin_id
  FROM public.super_admins
  WHERE est_actif = true
  LIMIT 1;

  IF v_super_admin_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucun Super Admin actif trouvé'
    );
  END IF;

  -- Vérifier l'unicité du slug
  IF EXISTS (
    SELECT 1 FROM public.organizations
    WHERE slug = p_slug
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Une organisation avec ce nom existe déjà. Veuillez choisir un nom différent.'
    );
  END IF;

  -- Créer l'organisation
  INSERT INTO public.organizations (
    id,
    name,
    description,
    slug,
    address,
    city,
    country,
    phone,
    email,
    website,
    logo_url,
    plan_type,
    subdomain,
    company_email,
    super_admin_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_name,
    p_description,
    p_slug,
    p_address,
    p_city,
    p_country,
    p_phone,
    p_email,
    p_website,
    p_logo_url,
    p_plan_type,
    p_subdomain,
    p_company_email,
    v_super_admin_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_organization_id;

  -- Créer l'état du workflow pour cette organisation
  INSERT INTO public.workflow_states (
    user_id,
    current_step,
    completed_steps,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_super_admin_id,
    'org_creation',
    ARRAY['super_admin_check', 'pricing_selection', 'admin_creation'],
    jsonb_build_object(
      'organization_id', v_organization_id,
      'organization_name', p_name,
      'plan_type', p_plan_type,
      'slug', p_slug,
      'subdomain', p_subdomain,
      'company_email', p_company_email
    ),
    NOW(),
    NOW()
  );

  -- Retourner le succès avec les informations
  v_result := jsonb_build_object(
    'success', true,
    'organization_id', v_organization_id,
    'organization', jsonb_build_object(
      'id', v_organization_id,
      'name', p_name,
      'slug', p_slug,
      'subdomain', p_subdomain,
      'company_email', p_company_email,
      'plan_type', p_plan_type
    ),
    'message', 'Organisation créée avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, nettoyer et retourner l'erreur
    IF v_organization_id IS NOT NULL THEN
      DELETE FROM public.organizations WHERE id = v_organization_id;
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreur lors de la création de l\'organisation: ' || SQLERRM
    );
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_organization_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_complete TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_organization_complete IS 'Crée une organisation complète avec slug, sous-domaine et email d\'entreprise en une seule transaction atomique';
