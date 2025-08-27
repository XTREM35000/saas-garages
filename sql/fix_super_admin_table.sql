-- Script de correction pour la table super_admins
-- Problème : "Database error querying schema" lors de la connexion

-- 1. Désactiver RLS temporairement
ALTER TABLE public.super_admins DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "super_admins_insert_initial" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_simple" ON public.super_admins;
DROP POLICY IF EXISTS "allow_super_admin_creation" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_own" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_own" ON public.super_admins;

-- 3. Vérifier et corriger la structure de la table
DO $$
BEGIN
    -- S'assurer que toutes les colonnes nécessaires existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'id') THEN
        ALTER TABLE public.super_admins ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'user_id') THEN
        ALTER TABLE public.super_admins ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'email') THEN
        ALTER TABLE public.super_admins ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'nom') THEN
        ALTER TABLE public.super_admins ADD COLUMN nom TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'prenom') THEN
        ALTER TABLE public.super_admins ADD COLUMN prenom TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'phone') THEN
        ALTER TABLE public.super_admins ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'est_actif') THEN
        ALTER TABLE public.super_admins ADD COLUMN est_actif BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'created_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'updated_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'permissions') THEN
        ALTER TABLE public.super_admins ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. Créer des politiques RLS simples et permissives
CREATE POLICY "super_admins_select_all" ON public.super_admins
    FOR SELECT USING (true);

CREATE POLICY "super_admins_insert_all" ON public.super_admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "super_admins_update_all" ON public.super_admins
    FOR UPDATE USING (true);

CREATE POLICY "super_admins_delete_all" ON public.super_admins
    FOR DELETE USING (true);

-- 5. Réactiver RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 6. S'assurer que les permissions sont correctes
GRANT ALL ON public.super_admins TO anon;
GRANT ALL ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO service_role;

-- 7. Créer ou mettre à jour la fonction is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.user_id = user_id
        AND est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Permissions sur la fonction
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO service_role;

-- 9. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_est_actif ON public.super_admins(est_actif);

-- 10. Forcer la mise à jour du cache du schéma
NOTIFY pgrst, 'reload schema';

-- 11. Vérifier qu'il y a au moins un super admin
DO $$
DECLARE
    super_admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO super_admin_count FROM public.super_admins WHERE est_actif = true;
    
    IF super_admin_count = 0 THEN
        RAISE NOTICE 'Aucun super admin actif trouvé. Création d''un super admin par défaut...';
        
        -- Insérer un super admin par défaut si aucun n'existe
        INSERT INTO public.super_admins (
            user_id,
            email,
            nom,
            prenom,
            est_actif,
            permissions
        ) VALUES (
            (SELECT id FROM auth.users WHERE email = 'superadmin@gmail.com' LIMIT 1),
            'superadmin@gmail.com',
            'Super',
            'Admin',
            true,
            '{"all": true}'::jsonb
        );
        
        RAISE NOTICE 'Super admin par défaut créé';
    ELSE
        RAISE NOTICE 'Super admin(s) trouvé(s): %', super_admin_count;
    END IF;
END $$;

-- 12. Afficher le statut final
SELECT 
    'Table super_admins corrigée' as status,
    COUNT(*) as total_super_admins,
    COUNT(*) FILTER (WHERE est_actif = true) as active_super_admins
FROM public.super_admins; 