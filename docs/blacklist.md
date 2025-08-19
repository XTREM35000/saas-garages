# Fichiers à supprimer ou à nettoyer

## Fichiers de contexte redondants
- [ ] `/src/contexts/AppContext.tsx` (si uniquement utilisé pour le thème)
- [ ] `/src/contexts/ThemeContext.tsx` (si existe)
- [ ] `/src/contexts/AuthContext.tsx` (si vous utilisez déjà Supabase Auth)

## Fichiers de workflow redondants
- [ ] `/src/components/Wizard.tsx` (ancien composant)
- [ ] `/src/components/WorkflowWizard.tsx` (ancien composant)
- [ ] `/src/components/OnboardingWizard.tsx` (ancien composant)
- [ ] `/src/hooks/useWizard.ts` (ancien hook)
- [ ] `/src/hooks/useOnboarding.ts` (ancien hook)

## Types redondants
- [ ] `/src/types/wizard.types.ts` (anciens types)
- [ ] `/src/types/onboarding.types.ts` (anciens types)
- [ ] `/src/types/workflow.d.ts` (si vous avez déjà workflow.types.ts)

## Composants de modal redondants
- [ ] `/src/components/modals/OnboardingModal.tsx`
- [ ] `/src/components/modals/WorkflowModal.tsx`
- [ ] `/src/components/modals/WizardModal.tsx`

## Providers inutiles
- [ ] `/src/providers/WizardProvider.tsx`
- [ ] `/src/providers/OnboardingProvider.tsx`

## États et stores redondants
- [ ] `/src/stores/wizardStore.ts`
- [ ] `/src/stores/workflowStore.ts`
- [ ] `/src/stores/onboardingStore.ts`

## Utilitaires redondants
- [ ] `/src/utils/wizard.ts`
- [ ] `/src/utils/workflow.ts`
- [ ] `/src/utils/onboarding.ts`

## Les fichiers essentiels à garder

### Core
- [x] `/src/App.tsx`
- [x] `/src/contexts/WorkflowProvider.tsx`
- [x] `/src/types/workflow.types.ts`
- [x] `/src/components/InitializationWizard.tsx`
- [x] `/src/hooks/useWorkflowCheck.ts`

### Composants UI
- [x] `/src/components/ui/button.tsx`
- [x] `/src/components/ui/dialog.tsx`
- [x] `/src/components/ui/form.tsx`
- [x] `/src/components/ui/input.tsx`

### Types
- [x] `/src/types/database.types.ts`
- [x] `/src/types/supabase.ts`

## Notes importantes
1. Avant de supprimer un fichier, vérifiez qu'il n'est pas importé ailleurs
2. Faites une sauvegarde des fichiers avant suppression
3. Testez l'application après chaque lot de suppressions
4. Mettez à jour les imports dans les fichiers restants

## Ordre de nettoyage recommandé
1. Supprimer d'abord les providers redondants
2. Puis les composants de modal non utilisés
3. Ensuite les types en double
4. Enfin les utilitaires redondants

## Commande pour sauvegarder les fichiers avant suppression
```bash
mkdir backup-files
xcopy /E /I src\* backup-files
```