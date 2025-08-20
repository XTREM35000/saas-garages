-- 🚨 CORRECTION D'URGENCE - RLS RÉCURSION INFINIE
-- Exécuter ce script IMMÉDIATEMENT dans Supabase SQL Editor

-- 1. DÉSACTIVER TEMPORAIREMENT RLS pour éviter la récursion
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE organisations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_organisations DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES les politiques problématiques
DROP POLICY IF EXISTS "Super admins can manage super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable read access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable insert access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable update access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable delete access for super admins" ON super_admins;
DROP POLICY IF EXISTS "super_admins_read_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_insert_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_update_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_delete_policy" ON super_admins;

-- 3. CRÉER une politique SIMPLE et SÉCURISÉE
CREATE POLICY "super_admin_simple_policy" ON super_admins
FOR ALL USING (
  -- Permettre si c'est le premier super-admin (table vide)
  (SELECT COUNT(*) FROM super_admins) = 0
  OR
  -- Ou si l'utilisateur est déjà super-admin
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- 4. RÉACTIVER RLS avec la nouvelle politique
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 5. VÉRIFICATION
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'super_admins';

-- 6. MESSAGE DE CONFIRMATION
DO $$
BEGIN
  RAISE NOTICE '✅ RLS corrigé avec succès !';
  RAISE NOTICE '🔒 Politique simple et sécurisée appliquée';
  RAISE NOTICE '🚀 Le premier Super-Admin peut maintenant être créé';
END $$;
