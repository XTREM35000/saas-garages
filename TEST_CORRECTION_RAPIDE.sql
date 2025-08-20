-- 🧪 TEST RAPIDE - VÉRIFICATION DES CORRECTIONS RLS
-- Exécuter ce script APRÈS avoir appliqué EMERGENCY_RLS_FIX_AGGRESSIVE.sql

-- ==========================================
-- 1. VÉRIFIER QUE RLS EST DÉSACTIVÉ
-- ==========================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as row_security
FROM pg_tables 
WHERE tablename IN ('super_admins', 'organisations', 'workflow_states', 'profiles', 'user_organisations')
AND schemaname = 'public';

-- ==========================================
-- 2. VÉRIFIER QU'AUCUNE POLITIQUE N'EXISTE
-- ==========================================
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('super_admins', 'organisations', 'workflow_states', 'profiles', 'user_organisations')
AND schemaname = 'public';

-- ==========================================
-- 3. TEST D'ACCÈS AUX TABLES
-- ==========================================
-- Ces requêtes devraient fonctionner sans erreur 500
SELECT COUNT(*) as super_admins_count FROM public.super_admins;
SELECT COUNT(*) as organisations_count FROM public.organisations;
SELECT COUNT(*) as workflow_states_count FROM public.workflow_states;
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- ==========================================
-- 4. MESSAGE DE CONFIRMATION
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '🧪 TEST RAPIDE TERMINÉ !';
  RAISE NOTICE '📊 Vérifiez que toutes les requêtes ont fonctionné';
  RAISE NOTICE '✅ Si aucune erreur 500, le bouton "Suivant" devrait fonctionner';
  RAISE NOTICE '🚀 Redémarrez l''application et testez le workflow';
END $$;
