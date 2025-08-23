# Guide de Correction - Workflow States

## 🚨 Problème Identifié

L'erreur suivante se produit lors de la progression du workflow :
```
POST https://metssugfqsnttghfrsxx.supabase.co/rest/v1/workflow_states?on_conflict=user_id&select=* 400 (Bad Request)
{code: '42P10', details: null, hint: null, message: 'there is no unique or exclusion constraint matching the ON CONFLICT specification'}
```

## 🔍 Cause

La table `workflow_states` n'a pas de contrainte unique sur la colonne `user_id`, ce qui empêche l'utilisation de `onConflict` dans les requêtes Supabase.

## ✅ Solution Appliquée

### 1. Migration SQL
Création de `supabase/migrations/1002_fix_workflow_states_constraints.sql` :
```sql
-- Ajouter une contrainte unique sur user_id
ALTER TABLE public.workflow_states 
ADD CONSTRAINT workflow_states_user_id_unique UNIQUE (user_id);
```

### 2. Code Frontend
Modification de `src/components/NewInitializationWizard.tsx` pour gérer l'insert/update manuellement :
```typescript
// Essayer d'abord un insert
let { data, error } = await supabase
  .from('workflow_states')
  .insert({...})
  .select()
  .single();

// Si échec à cause d'un user_id existant, faire un update
if (error && error.code === '23505') {
  const { data: updateData, error: updateError } = await supabase
    .from('workflow_states')
    .update({...})
    .eq('user_id', session?.user?.id || 'system')
    .select()
    .single();
  
  if (updateError) {
    error = updateError;
  } else {
    data = updateData;
    error = null;
  }
}
```

## 🚀 Étapes de Déploiement

### 1. Appliquer la Migration
```bash
# Via Supabase CLI
supabase db push

# Ou via Supabase Dashboard
# - Aller dans Database > Migrations
# - Exécuter le fichier 1002_fix_workflow_states_constraints.sql
```

### 2. Vérifier la Contrainte
```sql
-- Vérifier que la contrainte unique a été ajoutée
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'workflow_states' 
    AND tc.constraint_type = 'UNIQUE';
```

### 3. Tester le Workflow
1. Recharger la page d'initialisation
2. Vérifier que la progression fonctionne sans erreur 400
3. Confirmer que l'état du workflow est correctement mis à jour

## 🔧 Alternative Temporaire

Si la migration ne peut pas être appliquée immédiatement, le code actuel gère déjà le cas en fallback avec insert/update manuel.

## 📊 Structure de la Table

```sql
CREATE TABLE public.workflow_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step text NOT NULL,
    is_completed boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

## ✅ Résultat Attendu

- Plus d'erreurs 400 lors de la progression du workflow
- Progression automatique vers `pricing_selection` si Super Admin existe
- Mise à jour correcte de l'état du workflow dans la base de données
