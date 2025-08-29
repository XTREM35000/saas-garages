-- Script de diagnostic pour identifier le problème de création de Super Admin
-- Exécuter ce script dans votre base de données Supabase

-- 1. Vérifier l'état actuel
DO $$
DECLARE
    profile_columns TEXT;
    super_admin_columns TEXT;
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
    super_admin_count INTEGER;
BEGIN
    -- Vérifier la structure de profiles
    SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
    INTO profile_columns
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND table_schema = 'public';
    
    RAISE NOTICE 'Structure de profiles: %', profile_columns;
    
    -- Vérifier la structure de super_admins
    SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
    INTO super_admin_columns
    FROM information_schema.columns 
    WHERE table_name = 'super_admins' AND table_schema = 'public';
    
    RAISE NOTICE 'Structure de super_admins: %', super_admin_columns;
    
    -- Vérifier si le trigger existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
        AND trigger_name LIKE '%handle_new_user%'
    ) INTO trigger_exists;
    
    RAISE NOTICE 'Trigger handle_new_user existe: %', trigger_exists;
    
    -- Vérifier si la fonction existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user' 
        AND routine_schema = 'public'
    ) INTO function_exists;
    
    RAISE NOTICE 'Fonction handle_new_user existe: %', function_exists;
    
    -- Vérifier le nombre de super admins
    SELECT COUNT(*) INTO super_admin_count FROM public.super_admins WHERE est_actif = true;
    RAISE NOTICE 'Nombre de super admins actifs: %', super_admin_count;
    
END $$;

-- 2. Vérifier les politiques RLS
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
WHERE tablename IN ('profiles', 'super_admins') 
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Vérifier les permissions
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name IN ('profiles', 'super_admins') 
AND table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- 4. Tester la création d'un utilisateur de test (si aucun super admin n'existe)
DO $$
DECLARE
    test_user_id UUID;
    profile_created BOOLEAN := FALSE;
    super_admin_created BOOLEAN := FALSE;
BEGIN
    -- Vérifier qu'aucun super admin n'existe
    IF EXISTS (SELECT 1 FROM public.super_admins WHERE est_actif = true) THEN
        RAISE NOTICE 'Un super admin existe déjà. Test annulé.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Début du test de création...';
    
    -- Créer un utilisateur de test
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'test-super-admin-' || extract(epoch from now()) || '@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Test", "lastName": "Admin", "phone": "123456789", "role": "superadmin"}',
        'authenticated',
        'authenticated',
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Utilisateur de test créé: %', test_user_id;
    
    -- Attendre un peu pour que le trigger s'exécute
    PERFORM pg_sleep(1);
    
    -- Vérifier si le profil a été créé
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = test_user_id) THEN
        profile_created := TRUE;
        RAISE NOTICE '✅ Profil créé avec succès';
    ELSE
        RAISE NOTICE '❌ Profil non créé';
    END IF;
    
    -- Vérifier si le super admin a été créé
    IF EXISTS (SELECT 1 FROM public.super_admins WHERE id = test_user_id) THEN
        super_admin_created := TRUE;
        RAISE NOTICE '✅ Super admin créé avec succès';
    ELSE
        RAISE NOTICE '❌ Super admin non créé';
    END IF;
    
    -- Nettoyer
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Test terminé. Profil: %, Super Admin: %', profile_created, super_admin_created;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors du test: %', SQLERRM;
    
    -- Nettoyer en cas d'erreur
    IF test_user_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = test_user_id;
    END IF;
END $$;
