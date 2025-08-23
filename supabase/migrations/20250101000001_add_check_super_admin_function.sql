-- Migration pour ajouter la fonction check_super_admin_exists
-- Date: 2025-01-01

-- 1. Fonction pour vérifier si un super admin existe
CREATE OR REPLACE FUNCTION public.check_super_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  super_admin_count integer;
BEGIN
  -- Compter le nombre de super admins actifs
  SELECT COUNT(*) INTO super_admin_count
  FROM public.super_admins
  WHERE est_actif = true;

  -- Retourner true s'il y a au moins un super admin
  RETURN super_admin_count > 0;
END;
$$;

-- 2. Permissions pour la fonction
GRANT EXECUTE ON FUNCTION public.check_super_admin_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_super_admin_exists TO anon;

-- 3. Commentaires pour la documentation
COMMENT ON FUNCTION public.check_super_admin_exists IS 'Vérifie s''il existe au moins un super administrateur actif dans le système';
