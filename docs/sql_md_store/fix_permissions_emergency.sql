-- 🚨 CORRECTION D'URGENCE - PERMISSIONS SUPABASE
-- Exécuter ce script IMMÉDIATEMENT dans Supabase SQL Editor

-- 1. VÉRIFIER LES TABLES EXISTANTES
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('workflow_states', 'organisations', 'super_admins')
ORDER BY table_name;

-- 2. CRÉER LA TABLE workflow_states SI ELLE N'EXISTE PAS
CREATE TABLE IF NOT EXISTS public.workflow_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step text DEFAULT 'super_admin_check',
    completed_steps text[] DEFAULT '{}',
    is_completed boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. CRÉER LA TABLE organisations SI ELLE N'EXISTE PAS
CREATE TABLE IF NOT EXISTS public.organisations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    owner_id uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. CRÉER LA TABLE super_admins SI ELLE N'EXISTE PAS
CREATE TABLE IF NOT EXISTS public.super_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON workflow_states;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON workflow_states;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON workflow_states;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON workflow_states;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organisations;

-- 6. CRÉER DES POLITIQUES SIMPLES ET SÉCURISÉES
-- Workflow States : Utilisateur peut lire/modifier ses propres états
CREATE POLICY "workflow_states_user_policy" ON workflow_states
FOR ALL USING (auth.uid() = user_id);

-- Organisations : Super-admins ont accès complet, utilisateurs normaux à leurs orgs
CREATE POLICY "organisations_super_admin_policy" ON organisations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "organisations_user_policy" ON organisations
FOR ALL USING (
  owner_id = auth.uid()
);

-- Super Admins : Politique simple
CREATE POLICY "super_admins_simple_policy" ON super_admins
FOR ALL USING (
  (SELECT COUNT(*) FROM super_admins) = 0
  OR
  EXISTS (
    SELECT 1 FROM super_admins sa
    WHERE sa.user_id = auth.uid()
  )
);

-- 7. ACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 8. CRÉER DES INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON workflow_states(user_id);
CREATE INDEX IF NOT EXISTS idx_organisations_owner_id ON organisations(owner_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON super_admins(user_id);

-- 9. VÉRIFICATION DES POLITIQUES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('workflow_states', 'organisations', 'super_admins')
ORDER BY tablename, policyname;

-- 10. MESSAGE DE CONFIRMATION
DO $$
BEGIN
  RAISE NOTICE '✅ Permissions corrigées avec succès !';
  RAISE NOTICE '🔒 RLS activé sur toutes les tables';
  RAISE NOTICE '🚀 Les erreurs 500 et 403 devraient être résolues';
END $$;
