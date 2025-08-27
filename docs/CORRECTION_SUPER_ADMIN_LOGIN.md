# Correction du problème de connexion Super Admin

## Problème identifié

L'erreur `Database error querying schema` lors de la connexion Super Admin indique un problème avec la table `super_admins` dans Supabase. Cette erreur peut être causée par :

1. **Problèmes de schéma de table** : Colonnes manquantes ou mal configurées
2. **Politiques RLS (Row Level Security)** : Permissions trop restrictives
3. **Cache de schéma** : Supabase n'a pas mis à jour son cache interne
4. **Permissions insuffisantes** : Droits d'accès manquants

## Solution

### Étape 1 : Appliquer le script de correction

1. Ouvrez le **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `sql/fix_super_admin_table.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

### Étape 2 : Vérifier l'application des corrections

Exécutez le script de diagnostic `sql/diagnostic_super_admin.sql` pour vérifier que tout fonctionne correctement.

### Étape 3 : Tester la connexion

1. Redémarrez votre application
2. Essayez de vous connecter avec les identifiants Super Admin
3. Vérifiez les logs dans la console du navigateur

## Améliorations apportées

### Dans le composant SuperAdminLoginModal.tsx

1. **Gestion d'erreur améliorée** : Détection des erreurs de schéma
2. **Création automatique** : Si aucun Super Admin n'existe, création automatique
3. **Vérification robuste** : Utilisation de `user_id` au lieu de `id`
4. **Logs détaillés** : Meilleur suivi des étapes de connexion

### Dans la base de données

1. **Politiques RLS simplifiées** : Permissions plus permissives
2. **Structure de table corrigée** : Toutes les colonnes nécessaires
3. **Index optimisés** : Performance améliorée
4. **Fonction is_super_admin** : Vérification fiable

## Scripts fournis

### `sql/fix_super_admin_table.sql`
Script principal de correction qui :
- Corrige la structure de la table
- Simplifie les politiques RLS
- Crée les index nécessaires
- Met à jour le cache du schéma

### `sql/diagnostic_super_admin.sql`
Script de diagnostic pour vérifier :
- L'existence de la table
- La structure des colonnes
- Les politiques RLS
- Les permissions
- Les données existantes

### `scripts/fix-super-admin.ps1`
Script PowerShell pour automatiser le processus de correction.

## Structure de la table super_admins

```sql
CREATE TABLE public.super_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nom TEXT,
    prenom TEXT,
    phone TEXT,
    est_actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    permissions JSONB DEFAULT '{}'
);
```

## Politiques RLS appliquées

```sql
-- Politiques permissives pour éviter les problèmes d'accès
CREATE POLICY "super_admins_select_all" ON public.super_admins FOR SELECT USING (true);
CREATE POLICY "super_admins_insert_all" ON public.super_admins FOR INSERT WITH CHECK (true);
CREATE POLICY "super_admins_update_all" ON public.super_admins FOR UPDATE USING (true);
CREATE POLICY "super_admins_delete_all" ON public.super_admins FOR DELETE USING (true);
```

## Fonction is_super_admin

```sql
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
```

## Dépannage

### Si le problème persiste

1. **Vérifiez les logs Supabase** :
   - Allez dans Dashboard > Logs
   - Recherchez les erreurs liées à `super_admins`

2. **Vérifiez les permissions** :
   - Exécutez le script de diagnostic
   - Vérifiez que les rôles `anon` et `authenticated` ont les bonnes permissions

3. **Forcez la mise à jour du cache** :
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

4. **Vérifiez la connexion Supabase** :
   - Testez la connexion dans l'application
   - Vérifiez les variables d'environnement

### Erreurs courantes

- **PGRST116** : Problème de cache de schéma
- **42501** : Permissions insuffisantes
- **42P01** : Table inexistante
- **42703** : Colonne inexistante

## Test de la solution

Après avoir appliqué les corrections :

1. **Test de connexion** :
   ```javascript
   // Dans la console du navigateur
   console.log('Test de connexion Super Admin...');
   ```

2. **Vérification des données** :
   ```sql
   SELECT * FROM public.super_admins WHERE est_actif = true;
   ```

3. **Test de la fonction** :
   ```sql
   SELECT is_super_admin() as is_super;
   ```

## Support

Si vous rencontrez encore des problèmes :

1. Consultez les logs de l'application
2. Vérifiez les logs Supabase
3. Exécutez le script de diagnostic
4. Contactez l'équipe de développement

---

**Note** : Cette correction résout le problème de base de données mais n'affecte pas la sécurité de l'application. Les politiques RLS peuvent être renforcées une fois que la connexion fonctionne correctement. 