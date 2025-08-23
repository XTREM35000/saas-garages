-- Migration pour corriger les permissions de workflow_states
-- Date: 2025-01-27

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can access their own workflow state" ON public.workflow_states;
DROP POLICY IF EXISTS "workflow_owner_access" ON public.workflow_states;

-- Créer une politique plus permissive pour le workflow d'onboarding
-- Permet l'accès sans authentification pour le workflow initial
CREATE POLICY "Allow workflow access for onboarding"
    ON public.workflow_states
    FOR ALL
    USING (
        -- Accès libre pour les enregistrements "system" du workflow d'onboarding
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR
        -- Accès normal pour les utilisateurs authentifiés
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    )
    WITH CHECK (
        -- Insert/Update autorisé pour "system" ou utilisateur authentifié
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

-- Politique supplémentaire pour les super admins
CREATE POLICY "Super admins can manage all workflow states"
    ON public.workflow_states
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.super_admins
            WHERE user_id = auth.uid()
            AND est_actif = true
        )
    );

-- Vérifier que les politiques ont été créées
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'workflow_states';
