-- Script pour vérifier l'état actuel de la base de données
-- Exécuter ce script dans votre base de données Supabase

-- 1. Vérifier la structure de la table profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table super_admins
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'super_admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier si le trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 4. Vérifier les politiques RLS sur super_admins
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'super_admins' 
AND schemaname = 'public';

-- 5. Vérifier les permissions sur les tables
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN ('profiles', 'super_admins') 
AND table_schema = 'public';

-- 6. Vérifier si des super admins existent déjà
SELECT COUNT(*) as super_admin_count FROM public.super_admins WHERE est_actif = true;

-- 7. Vérifier la fonction handle_new_user
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
