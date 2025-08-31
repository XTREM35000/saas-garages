-- Migration pour optimisation workflow conditionnel
-- Création des fonctions RPC de vérification pour éviter les modaux inutiles

-- 1. Fonction pour vérifier l'existence d'un super admin
CREATE OR REPLACE FUNCTION check_super_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM super_admins 
    WHERE est_actif = true 
    LIMIT 1
  );
END;
$$;

-- 2. Fonction pour vérifier l'existence d'un admin
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1
  );
END;
$$;

-- 3. Fonction pour vérifier l'existence d'une organisation
CREATE OR REPLACE FUNCTION check_organization_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM organizations 
    WHERE slug IS NOT NULL 
    LIMIT 1
  );
END;
$$;

-- 4. Fonction pour vérifier l'existence d'un garage
CREATE OR REPLACE FUNCTION check_garage_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM garages 
    WHERE is_active = true 
    LIMIT 1
  );
END;
$$;

-- 5. Fonction pour obtenir l'état complet du workflow
CREATE OR REPLACE FUNCTION get_workflow_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'has_super_admin', check_super_admin_exists(),
    'has_admin', check_admin_exists(),
    'has_organization', check_organization_exists(),
    'has_garage', check_garage_exists(),
    'current_step', CASE 
      WHEN NOT check_super_admin_exists() THEN 'super_admin'
      WHEN NOT check_admin_exists() THEN 'pricing'
      WHEN NOT check_organization_exists() THEN 'organization'
      WHEN NOT check_garage_exists() THEN 'garage'
      ELSE 'dashboard'
    END,
    'is_completed', (
      check_super_admin_exists() AND 
      check_admin_exists() AND 
      check_organization_exists() AND 
      check_garage_exists()
    )
  ) INTO result;
  
  RETURN result;
END;
$$;