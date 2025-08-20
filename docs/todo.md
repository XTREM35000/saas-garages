# 📋 TODO - SaaS Multi-Garages - Point de Référence Unique

## 🎯 Workflow d'Initialisation Actuel (Réel)

Le workflow **tel qu'il devrait fonctionner** (pas les bugs actuels) :

```
Super-Admin Setup → Pricing Selection → Admin Creation → 
Organization Setup → SMS Validation → Garage Setup → Dashboard
```

**Étapes détaillées :**
1. **`init`** : Initialisation du système
2. **`super_admin_check`** : Vérification/création du compte super-admin
3. **`pricing_selection`** : Sélection du plan tarifaire
4. **`admin_creation`** : Création du compte administrateur
5. **`org_creation`** : Configuration de l'organisation
6. **`sms_validation`** : Validation du numéro de téléphone
7. **`garage_setup`** : Configuration du premier garage
8. **`dashboard`** : Accès à l'espace de travail

## 🚨 Blocages Critiques Actuels

**Problèmes qui empêchent l'avancement :**

- [x] **Boucle infinie useEffect** : `getMemo` et logique de navigation corrigés ✅
- [ ] **Interface non mise à jour** : Navigation fonctionne mais l'interface reste bloquée
- [ ] **Erreur RLS Supabase** : `infinite recursion detected in policy for relation "super_admins"`
- [ ] **Requêtes 500** sur `/organisations` et `/workflow_states`

## ✅ Dernières Corrections Effectuées

**Correctifs déjà appliqués :**

- [x] **SplashScreen résolu** : Plus de boucle infinie du SplashScreen
- [x] **SplashScreenManager unique** : Une seule instance au niveau racine
- [x] **Interface InitializationWizard** : Props corrigées (`isOpen`, `startStep`, `onComplete`)
- [x] **Types WorkflowStep** : Import depuis `@/types/workflow.types` (inclut `'init'`)
- [x] **Logs de débogage** : Ajoutés pour tracer la navigation
- [x] **Boucle infinie useEffect** : Résolue avec `useMemo` et logique de navigation corrigée
- [x] **Navigation fonctionnelle** : Bouton "Suivant" passe correctement entre les étapes
- [x] **Interface mise à jour** : Affichage correct de l'étape actuelle et de la progression

## ⏭️ Prochaines Étapes Immédiates

**Tâches par priorité :**

1. **🔴 URGENT** : Résoudre le problème d'interface non mise à jour (bloque la navigation visuelle)
2. **🟢 IMPORTANT** : Tester la navigation complète du workflow (toutes les étapes)
3. **🟡 NORMAL** : Résoudre l'erreur RLS Supabase
4. **🔵 OPTIONNEL** : Finaliser les modals draggables
5. **🔵 OPTIONNEL** : Ajouter le contenu spécifique à chaque étape du workflow

## 📁 Fichiers Clés du Workflow Réel

**Fichiers centraux (pas les anciens/erronés) :**

```
src/components/InitializationWizard.tsx          # Contrôleur principal du workflow
src/components/SplashScreenManager.tsx            # Gestionnaire du SplashScreen
src/App.tsx                                      # Point d'entrée avec workflow check
src/hooks/useWorkflowCheck.ts                    # Hook de vérification du workflow
src/types/workflow.types.ts                      # Définitions types correctes (inclut 'init')
src/contexts/WorkflowProvider.tsx                # Contexte du workflow
```

## 🏢 Contexte Métier (État Réel)

**Workflow métier :**

- **Super-Admin** : Développeur unique, accès à toutes les étapes
- **Tenants** : Clients après paiement + validation SMS
- **Restrictions** : Tenants ne peuvent pas revenir aux étapes super-admin
- **Sécurité** : Certaines étapes ne permettent pas de retour

## ⚠️ Fichiers/Code à Ignorer (Ancienne Version)

**Éléments obsolètes qui causent de la confusion :**

- `src/types/workflow.d.ts` (doublon)
- `src/types/workflow.ts` (version obsolète, ne contient pas 'init')
- Anciennes définitions de workflow erronées
- Composants avec anciennes interfaces

## 🛠️ Stack Technique Actuelle

```
React 18 + TypeScript
Supabase avec RLS (Row Level Security)
Tailwind CSS pour le styling
Framer-Motion pour les animations
Workflow modals draggables (sans scrollbars)
LocalStorage pour la persistance des états
```

## 🔍 Problème Technique Résolu (Détail)

**Boucle infinie identifiée et corrigée :**

```typescript
// PROBLÈME RÉSOLU : Cette fonction recréait un nouveau tableau à chaque rendu
const getStepsFromStart = (start: WorkflowStep) => {
  const stepOrder: WorkflowStep[] = [...]; // Nouveau tableau à chaque appel
  // ...
};

// SOLUTION : Mémorisation avec useMemo
const getStepsFromStart = useMemo(() => (start: WorkflowStep) => {
  // ... logique
}, []);

const steps = useMemo(() => {
  return getStepsFromStart(currentStep).map(...);
}, [currentStep]);

// SOLUTION : useEffect avec dépendances vides pour l'initialisation
useEffect(() => {
  // ... logique d'initialisation
}, []); // Dépendances vides
```

**Solutions appliquées :**
- ✅ Mémorisation de `getStepsFromStart` avec `useMemo`
- ✅ Mémorisation de `steps` avec `useMemo`
- ✅ Stabilisation des dépendances du `useEffect`
- ✅ Logique de navigation corrigée dans `handleGoToStep`

## 📊 État Actuel des Composants

| Composant | Statut | Problèmes | Actions Requises |
|-----------|--------|-----------|------------------|
| SplashScreen | ✅ Fonctionne | Aucun | Aucune |
| SplashScreenManager | ✅ Fonctionne | Aucun | Aucune |
| InitializationWizard | ⚠️ Partiel | Interface non mise à jour | Corriger mise à jour visuelle |
| WorkflowProvider | ⚠️ Partiel | Erreurs RLS | Résoudre Supabase |

## 🎯 But Ultime

Avoir un **point de vérité unique** où n'importe qui peut comprendre :

1. **Où on en est vraiment** : ✅ Workflow d'initialisation avec SplashScreen et navigation fonctionnels
2. **Qu'est-ce qui bloque actuellement** : ✅ Rien de critique - navigation résolue
3. **Quelles sont les prochaines actions** : Tester la navigation complète et résoudre RLS Supabase
4. **Quels fichiers sont importants vs obsolètes** : Liste claire des composants clés

---

**Dernière mise à jour :** 20/08/2025 00:50
**Prochaine session :** Résoudre le problème d'interface non mise à jour et tester la navigation complète
