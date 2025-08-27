-- Script de diagnostic pour la table super_admins
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier l'existence de la table
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'super_admins';

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'super_admins'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
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
WHERE tablename = 'super_admins';

-- 4. Vérifier les permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'super_admins';

-- 5. Vérifier s'il y a des données
SELECT COUNT(*) as total_super_admins FROM public.super_admins;

-- 6. Vérifier les super admins actifs
SELECT 
    id,
    user_id,
    email,
    nom,
    prenom,
    est_actif,
    created_at
FROM public.super_admins 
WHERE est_actif = true;

-- 7. Vérifier la fonction is_super_admin
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_super_admin';

-- 8. Tester la fonction is_super_admin
SELECT is_super_admin() as current_user_is_super_admin;

-- 9. Vérifier les utilisateurs auth
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
LIMIT 5;

-- 10. Vérifier les profils
SELECT 
    id,
    email,
    full_name,
    created_at
FROM public.profiles 
LIMIT 5; 