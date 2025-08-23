# Guide d'Application des Migrations - GarageConnect

## 🎯 Objectif
Appliquer les nouvelles migrations pour la fonction RPC `create_super_admin_complete` et tester le système.

## 📋 Migrations à Appliquer

### 1. Migration 1000 : Fonction RPC Super Admin
**Fichier** : `supabase/migrations/1000_create_super_admin_complete_function.sql`

**Fonctionnalités** :
- Création complète d'un Super Admin
- Peuplement automatique des 4 tables
- Gestion des erreurs et validations

### 2. Migration 1001 : Fonction de Vérification
**Fichier** : `supabase/migrations/1001_create_ensure_unique_user_function.sql`

**Fonctionnalités** :
- Vérification de l'unicité email/téléphone
- Support pour la fonction RPC principale

## 🚀 Application des Migrations

### Option 1 : Via Supabase CLI (Recommandé)
```bash
# Naviguer vers le dossier supabase
cd supabase

# Appliquer les migrations
supabase db push

# Vérifier le statut
supabase db status
```

### Option 2 : Via l'Interface Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Sélectionner votre projet
3. Aller dans **SQL Editor**
4. Copier-coller le contenu de chaque migration
5. Exécuter les requêtes une par une

### Option 3 : Via PowerShell (Test)
```powershell
# Utiliser votre script PowerShell existant
$headers = @{
  "apikey" = "VOTRE_SUPABASE_ANON_KEY"
  "Authorization" = "Bearer VOTRE_SUPABASE_ANON_KEY"
  "Content-Type" = "application/json"
}

$body = @{
  p_email = "test@example.com"
  p_password = "MotDePasse123!"
  p_name = "Thierry"
  p_phone = "+2250700000000"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://metssugfqsnttghfrsxx.supabase.co/rest/v1/rpc/create_super_admin_complete" `
  -Headers $headers `
  -Body $body
```

## 🧪 Tests à Effectuer

### 1. Test de la Fonction RPC
- [ ] Créer un Super Admin via l'interface
- [ ] Vérifier que les 4 tables sont peuplées
- [ ] Confirmer que la contrainte d'unicité fonctionne

### 2. Test de Validation
- [ ] Essayer de créer un Super Admin avec un email existant
- [ ] Essayer de créer un Super Admin avec un téléphone existant
- [ ] Essayer de créer un deuxième Super Admin

### 3. Test de l'Interface
- [ ] Formulaire de création Super Admin
- [ ] Messages d'erreur et de succès
- [ ] Animation de succès
- [ ] Callback de complétion

## 🔍 Vérifications dans la Base de Données

### Table `auth.users`
```sql
SELECT id, email, phone, raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'super_admin';
```

### Table `public.users`
```sql
SELECT * FROM public.users WHERE role = 'super_admin';
```

### Table `public.profiles`
```sql
SELECT * FROM public.profiles WHERE is_superadmin = true;
```

### Table `public.super_admins`
```sql
SELECT * FROM public.super_admins WHERE est_actif = true;
```

## ⚠️ Points d'Attention

1. **Sauvegarde** : Faire une sauvegarde avant d'appliquer les migrations
2. **Environnement** : Tester d'abord en développement
3. **Permissions** : Vérifier que les fonctions RPC ont les bonnes permissions
4. **RLS** : S'assurer que les politiques RLS sont correctes

## 🐛 Résolution de Problèmes

### Erreur : Fonction non trouvée
```sql
-- Vérifier que la fonction existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_super_admin_complete';
```

### Erreur : Permissions insuffisantes
```sql
-- Vérifier les permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'super_admins';
```

### Erreur : Table non trouvée
```sql
-- Vérifier que les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'profiles', 'super_admins');
```

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Consulter la documentation des migrations
3. Tester avec des requêtes SQL simples
4. Vérifier la configuration RLS et des permissions
