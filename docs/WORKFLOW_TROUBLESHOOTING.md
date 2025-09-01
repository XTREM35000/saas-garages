# Guide de Dépannage - Workflow d'Onboarding

## 🚨 Problème : Page blanche après "Nouveau tenant"

### Symptômes
- Page blanche après avoir cliqué sur "Nouveau tenant"
- Erreurs 406 et 401 dans la console
- Le modal SuperAdminCreationModal ne s'affiche pas

### Cause
Les tables de base de données nécessaires au workflow n'existent pas encore.

## 🔧 Solution Étape par Étape

### 1. Créer les Tables de Base de Données

**Option A : Via l'Interface Supabase (Recommandé)**

1. Allez sur votre projet Supabase
2. Naviguez vers **SQL Editor**
3. Copiez et collez le contenu du fichier `fix_workflow_tables.sql`
4. Cliquez sur **Run** pour exécuter le script

**Option B : Via la CLI (si Docker est disponible)**

```bash
# Dans le terminal, à la racine du projet
supabase db push
```

### 2. Vérifier que les Tables sont Créées

Dans l'interface Supabase SQL Editor, exécutez :

```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workflow_states', 'admin_plans', 'sms_validations');

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('workflow_states', 'admin_plans', 'sms_validations');

-- Vérifier les fonctions RPC
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_super_admin_exists', 'check_admin_exists', 'create_super_admin', 'create_admin');
```

### 3. Tester le Workflow

1. **Redémarrez votre application** :
   ```bash
   npm run dev
   ```

2. **Ouvrez la page de debug** :
   - Naviguez vers `/workflow-debug` (si disponible)
   - Ou ajoutez temporairement le composant `WorkflowDebug` à votre page principale

3. **Vérifiez les logs de la console** :
   - Plus d'erreurs 406/401
   - Messages de succès pour les vérifications

### 4. Intégrer le Composant de Debug

Ajoutez temporairement ce composant à votre page principale pour diagnostiquer :

```tsx
import { WorkflowDebug } from '@/components/WorkflowDebug';

function App() {
  return (
    <div>
      {/* Votre contenu existant */}
      <WorkflowDebug />
    </div>
  );
}
```

## 🔍 Diagnostic Avancé

### Vérifier les Erreurs Spécifiques

**Erreur 406 (Not Acceptable)**
- Signifie que la table n'existe pas
- Solution : Créer les tables

**Erreur 401 (Unauthorized)**
- Signifie que les politiques RLS bloquent l'accès
- Solution : Vérifier les politiques RLS

**Erreur 404 (Not Found)**
- Signifie que les fonctions RPC n'existent pas
- Solution : Créer les fonctions RPC

### Vérifier l'État de l'Authentification

```typescript
// Dans la console du navigateur
const { data: { user } } = await supabase.auth.getUser();
console.log('Utilisateur connecté:', user);
```

### Vérifier les Politiques RLS

```sql
-- Vérifier les politiques pour workflow_states
SELECT * FROM pg_policies WHERE tablename = 'workflow_states';

-- Tester l'accès (remplacez USER_ID par l'ID de votre utilisateur)
SELECT * FROM workflow_states WHERE user_id = 'USER_ID';
```

## 🛠️ Corrections Manuelles

### Si les Tables Existent Mais les Politiques RLS Échouent

```sql
-- Réinitialiser les politiques RLS pour workflow_states
DROP POLICY IF EXISTS "Users can view their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can insert their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can update their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can delete their own workflow state" ON workflow_states;

-- Recréer les politiques
CREATE POLICY "Users can view their own workflow state" ON workflow_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow state" ON workflow_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow state" ON workflow_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow state" ON workflow_states
  FOR DELETE USING (auth.uid() = user_id);
```

### Si les Fonctions RPC Échouent

```sql
-- Recréer la fonction check_super_admin_exists
CREATE OR REPLACE FUNCTION check_super_admin_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'super_admin'
    AND deleted_at IS NULL
  );
END;
$$;
```

## 🧪 Test du Workflow

### Test Manuel

1. **Ouvrir l'application**
2. **Cliquer sur "Nouveau tenant"**
3. **Vérifier que le modal SuperAdminCreationModal s'affiche**
4. **Remplir le formulaire et soumettre**
5. **Vérifier la transition vers l'étape suivante**

### Test Automatisé

```bash
# Exécuter le script de test
node scripts/test-workflow.js
```

## 📋 Checklist de Vérification

- [ ] Tables `workflow_states`, `admin_plans`, `sms_validations` créées
- [ ] Index créés sur les tables
- [ ] Politiques RLS configurées
- [ ] Fonctions RPC créées
- [ ] Triggers configurés
- [ ] Application redémarrée
- [ ] Utilisateur authentifié
- [ ] Modal SuperAdminCreationModal s'affiche
- [ ] Workflow fonctionne end-to-end

## 🆘 Si le Problème Persiste

### 1. Vérifier les Logs

```bash
# Dans la console du navigateur
console.log('État Supabase:', await supabase.auth.getUser());
console.log('Tables existantes:', await supabase.from('workflow_states').select('*'));
```

### 2. Vérifier la Configuration

```typescript
// Vérifier les variables d'environnement
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### 3. Contacter le Support

Si le problème persiste après avoir suivi toutes les étapes :

1. **Collecter les logs** de la console
2. **Screenshot** de l'interface Supabase
3. **Description détaillée** des étapes suivies
4. **Version** de Supabase et des dépendances

## 🔄 Réinitialisation Complète

Si rien ne fonctionne, vous pouvez réinitialiser complètement :

```sql
-- Supprimer toutes les données de test
DELETE FROM workflow_states;
DELETE FROM admin_plans;
DELETE FROM sms_validations;

-- Recréer les tables
DROP TABLE IF EXISTS workflow_states CASCADE;
DROP TABLE IF EXISTS admin_plans CASCADE;
DROP TABLE IF EXISTS sms_validations CASCADE;

-- Puis exécuter le script fix_workflow_tables.sql
```

---

**Note** : Ce guide couvre les problèmes les plus courants. Si vous rencontrez un problème spécifique non couvert ici, consultez les logs de la console et les messages d'erreur pour plus de détails. 