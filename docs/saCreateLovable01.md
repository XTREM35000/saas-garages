# Documentation SuperAdmin - Lovable Integration

## Corrections effectuées - Session du 21/08/2025

### 1. Problème identifié
- **SuperAdminCreationModal.tsx** utilisait une edge function au lieu de la RPC function Supabase
- Erreurs de build avec les tables `user_organizations` vs `user_organisations`
- Props manquantes dans plusieurs composants

### 2. Fichiers modifiés

#### src/components/SuperAdminCreationModal.tsx
- **AVANT** : Utilisation de `fetch()` vers une edge function
- **APRÈS** : Utilisation de `supabase.rpc('create_super_admin_complete')`
- **Variables** : Utilise directement la connexion Supabase partagée (même pour local et Lovable)

```typescript
// ANCIEN CODE (ligne 116-135)
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setup-super-admin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
});

// NOUVEAU CODE
const { data: result, error } = await (supabase as any).rpc('create_super_admin_complete', {
  p_email: formData.email,
  p_password: formData.password,
  p_name: formData.name,
  p_phone: formData.phone
});
```

#### src/components/UserMenu.tsx & UserMenuDebug.tsx
- **Correction** : `user_organizations` → `user_organisations`
- **Raison** : Nom de table correct selon le schéma Supabase

### 3. Variables d'environnement

#### Local vs Lovable
- **IDENTIQUES** : Même projet Supabase utilisé
- **URL Supabase** : `https://metssugfqsnttghfrsxx.supabase.co`
- **Anon Key** : Partagée entre les deux environnements
- **Pas de variables VITE_*** : Utilisation des URLs directes dans client.ts

### 4. Workflow Super Admin

#### Étapes actuelles
1. **SuperAdminCreationModal** → Formulaire de création
2. **create_super_admin_complete** → RPC function Supabase
3. **Insertion dans tables** :
   - `auth.users` (authentification)
   - `profiles` (profil utilisateur)
   - `super_admins` (rôle super admin)

#### Transition vers étape suivante
- **onComplete()** appelé après succès RPC
- **Données retournées** : `{ success: true, user_id: uuid }`
- **Navigation** : Automatique vers "pricing_selection"

### 5. Tests requis

#### Local
- [ ] Formulaire SuperAdmin fonctionne
- [ ] Insertion en base Supabase correcte
- [ ] Transition vers pricing plan

#### Lovable
- [ ] Même comportement qu'en local
- [ ] Pas d'erreurs de build
- [ ] Navigation workflow complète

### 6. Prochaines actions

1. **Tester la création SuperAdmin** complète
2. **Vérifier les données en base** Supabase
3. **Valider la transition** vers l'étape suivante
4. **Résoudre les erreurs de build** restantes

### 7. Architecture technique

#### Supabase Integration
- **Client** : Connexion directe via client.ts
- **RPC Functions** : Logique métier côté serveur
- **RLS Policies** : Sécurité niveau ligne
- **Tables impliquées** :
  - `super_admins` (données super admin)
  - `profiles` (profil utilisateur)
  - `auth.users` (authentification)

#### Workflow Manager
- **Hook principal** : `useWorkflowManager.ts`
- **RPC Functions utilisées** :
  - `check_workflow_state()`
  - `create_super_admin_complete()`
  - `create_admin_complete()`
  - etc.

---

**Dernière mise à jour** : 21/08/2025 01:15  
**Status** : Corrections appliquées - Tests en cours