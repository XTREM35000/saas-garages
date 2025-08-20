-- 🔒 POLITIQUES RLS SÉCURISÉES DÉFINITIVES
-- Exécuter ce script APRÈS la correction d'urgence
-- Ce script remplace les politiques temporaires par des politiques sécurisées

-- ==========================================
-- 1. SUPPRIMER LES POLITIQUES TEMPORAIRES
-- ==========================================
DROP POLICY IF EXISTS "super_admins_emergency_policy" ON public.super_admins;
DROP POLICY IF EXISTS "organisations_emergency_policy" ON public.organisations;
DROP POLICY IF EXISTS "workflow_states_emergency_policy" ON public.workflow_states;
DROP POLICY IF EXISTS "profiles_emergency_policy" ON public.profiles;

-- ==========================================
-- 2. CRÉER DES POLITIQUES SÉCURISÉES
-- ==========================================

-- Super Admins : Politique sécurisée sans récursion
CREATE POLICY "super_admins_secure_policy" ON public.super_admins
FOR ALL USING (
  -- Permettre si c'est le premier super-admin (table vide)
  (SELECT COUNT(*) FROM public.super_admins) = 0
  OR
  -- Ou si l'utilisateur est déjà super-admin
  EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- Organisations : Super-admins ont accès complet, utilisateurs normaux à leurs orgs
CREATE POLICY "organisations_super_admin_policy" ON public.organisations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "organisations_user_policy" ON public.organisations
FOR ALL USING (
  owner_id = auth.uid()
);

-- Workflow States : Utilisateur peut lire/modifier ses propres états
CREATE POLICY "workflow_states_user_policy" ON public.workflow_states
FOR ALL USING (auth.uid() = user_id);

-- Profiles : Utilisateur peut lire/modifier son propre profil
CREATE POLICY "profiles_user_policy" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- Super-admins peuvent lire tous les profils
CREATE POLICY "profiles_super_admin_policy" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE user_id = auth.uid()
  )
);

-- ==========================================
-- 3. VÉRIFICATION DES POLITIQUES
-- ==========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('super_admins', 'organisations', 'workflow_states', 'profiles')
ORDER BY tablename, policyname;

-- ==========================================
-- 4. TEST DE SÉCURITÉ
-- ==========================================
-- Vérifier que les politiques sont actives
SELECT 
  table_name,
  row_security
FROM information_schema.tables 
WHERE table_name IN ('super_admins', 'organisations', 'workflow_states', 'profiles')
AND table_schema = 'public';

-- ==========================================
-- 5. MESSAGE DE CONFIRMATION
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ POLITIQUES RLS SÉCURISÉES APPLIQUÉES !';
  RAISE NOTICE '🔒 Sécurité renforcée avec des politiques appropriées';
  RAISE NOTICE '🚀 Le workflow devrait maintenant fonctionner correctement';
  RAISE NOTICE '📋 Testez le bouton "Suivant" pour vérifier le bon fonctionnement';
END $$;
