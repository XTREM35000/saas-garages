-- Script pour fusionner les tables organisations et organizations
-- À exécuter directement dans l'interface SQL de Supabase

-- 1. Créer la table organizations finale avec toutes les colonnes nécessaires
DROP TABLE IF EXISTS public.organizations CASCADE;

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  plan_type TEXT DEFAULT 'starter',
  subdomain TEXT,
  company_email TEXT,
  super_admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Supprimer l'ancienne table organisations (pas de migration de données)
DROP TABLE IF EXISTS public.organisations CASCADE;

-- 3. Créer les index pour les performances

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan_type ON public.organizations(plan_type);
CREATE INDEX IF NOT EXISTS idx_organizations_super_admin_id ON public.organizations(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations(created_at);

-- 4. Supprimer TOUTES les versions existantes de la fonction create_organization_complete
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text, text);
DROP FUNCTION IF EXISTS public.create_organization_complete(text);
DROP FUNCTION IF EXISTS public.create_organization_complete();

-- 5. Créer la fonction create_organization_complete pour la table organizations
CREATE OR REPLACE FUNCTION public.create_organization_complete(
  p_name text,
  p_description text,
  p_slug text,
  p_address text,
  p_city text,
  p_country text,
  p_phone text,
  p_email text,
  p_website text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_plan_type text DEFAULT 'starter',
  p_subdomain text DEFAULT NULL,
  p_company_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_super_admin_id uuid;
  v_workflow_state_id uuid;
BEGIN
  -- Vérifier qu'un Super Admin existe
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
      'error', 'Une organisation avec ce slug existe déjà'
    );
  END IF;

  -- Générer l'ID de l'organisation
  v_organization_id := gen_random_uuid();

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
    v_organization_id,
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
    now(),
    now()
  );

  -- Créer l'état du workflow pour cette organisation
  v_workflow_state_id := gen_random_uuid();
  
  INSERT INTO public.workflow_states (
    id,
    user_id,
    current_step,
    completed_steps,
    is_completed,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_workflow_state_id,
    v_super_admin_id,
    'garage_setup',
    jsonb_build_array('super_admin_check', 'admin_creation', 'org_creation'),
    false,
    jsonb_build_object(
      'organization_id', v_organization_id,
      'has_super_admin', true,
      'has_admin', true,
      'has_organization', true,
      'has_garage', false
    ),
    now(),
    now()
  );

  -- Retourner le succès avec les informations
  RETURN jsonb_build_object(
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
    'workflow_state_id', v_workflow_state_id
  );

EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 6. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_organization_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_complete TO anon;

-- 7. Commentaire sur la fonction
COMMENT ON FUNCTION public.create_organization_complete IS 'Fonction pour créer une organisation complète avec toutes ses informations et l''état du workflow associé.';

-- 8. Vérifier que la fonction a été créée
SELECT 
  proname as function_name,
  proargnames as parameter_names,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname = 'create_organization_complete' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 9. Vérifier la structure de la table organizations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;
