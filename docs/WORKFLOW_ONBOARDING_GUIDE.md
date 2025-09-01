# Guide du Workflow d'Onboarding

## Vue d'ensemble

Le workflow d'onboarding est un système complet pour guider les utilisateurs à travers la configuration initiale de l'application SaaS Multi-Garages. Il suit une séquence stricte de 7 étapes pour assurer une configuration correcte et sécurisée.

## Architecture

### Structure des fichiers

```
/src/
  ├── types/
  │   └── workflow.types.ts       # Types et interfaces
  ├── components/
  │   ├── WorkflowOrchestrator.tsx    # Orchestrateur principal
  │   ├── WorkflowTestSuite.tsx       # Suite de tests
  │   ├── SuperAdminCreationModal.tsx # Step 1
  │   ├── AdminCreationModal.tsx      # Step 2
  │   ├── PricingModal.tsx            # Step 3
  │   ├── OrganizationSetupModal.tsx  # Step 4
  │   ├── SmsValidationModal.tsx      # Step 5
  │   ├── GarageSetupModal.tsx        # Step 6
  │   └── CompletionSummaryModal.tsx  # Step final
  ├── hooks/
  │   └── useWorkflowManager.ts  # Logique de gestion
  └── stores/
      └── workflowStore.ts       # État global Zustand
```

### Séquence du Workflow

1. **Super Admin** → Vérifier/Créer compte super admin
2. **Admin** → Créer compte admin avec credentials
3. **Pricing** → Sélectionner plan d'abonnement
4. **Organization** → Configuration organisation
5. **SMS Validation** → Validation numéro téléphone
6. **Garage** → Setup du premier garage
7. **Dashboard** → Redirection dashboard admin

## Utilisation

### Composant principal

```tsx
import { WorkflowOrchestrator } from '@/components/WorkflowOrchestrator';

function App() {
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  const handleWorkflowComplete = async (step: WorkflowStep) => {
    console.log('Étape terminée:', step);
    if (step === 'completed') {
      setIsWorkflowOpen(false);
      // Rediriger vers le dashboard
    }
  };

  return (
    <WorkflowOrchestrator
      isOpen={isWorkflowOpen}
      onComplete={handleWorkflowComplete}
      onClose={() => setIsWorkflowOpen(false)}
    />
  );
}
```

### Hook de gestion

```tsx
import { useWorkflowManager } from '@/hooks/useWorkflowManager';

function MyComponent() {
  const {
    currentStep,
    progress,
    handleSuperAdminComplete,
    handleAdminComplete,
    // ... autres méthodes
  } = useWorkflowManager();

  // Utiliser les méthodes selon l'étape actuelle
}
```

### Store Zustand

```tsx
import { useWorkflowStore } from '@/stores/workflowStore';

function MyComponent() {
  const {
    currentStep,
    completedSteps,
    completeStep,
    resetWorkflow,
  } = useWorkflowStore();

  // Accéder directement à l'état global
}
```

## Types et Interfaces

### WorkflowStep

```typescript
type WorkflowStep = 
  | 'super_admin'
  | 'admin'
  | 'pricing'
  | 'organization'
  | 'sms_validation'
  | 'garage'
  | 'completed';
```

### WorkflowProgress

```typescript
interface WorkflowProgress {
  currentStep: WorkflowStep;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  canProceed: boolean;
  canGoBack: boolean;
}
```

### Données des étapes

```typescript
interface AdminCredentials {
  email: string;
  password: string;
}

interface PlanDetails {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  type: PlanType;
  selected_at: string;
}

interface OrganizationData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
}

interface SmsValidationData {
  id: string;
  organization_id: string;
  phone_number: string;
  validation_code: string;
  is_validated: boolean;
  validated_at: string;
  created_at: string;
}

interface GarageSetupData {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  manager_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Validation

### Validation des champs

```typescript
const validateField = (field: string, value: string): ValidationResult => {
  switch (field) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        error: emailRegex.test(value) ? undefined : 'Email invalide'
      };
    
    case 'password':
      return {
        isValid: value.length >= 8,
        error: value.length >= 8 ? undefined : 'Le mot de passe doit contenir au moins 8 caractères'
      };
    
    case 'phone':
      const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
      return {
        isValid: phoneRegex.test(value.replace(/\s/g, '')),
        error: phoneRegex.test(value.replace(/\s/g, '')) ? undefined : 'Numéro de téléphone invalide'
      };
    
    // ... autres validations
  }
};
```

### Validation des étapes

```typescript
const validateStep = (step: WorkflowStep): boolean => {
  switch (step) {
    case 'super_admin':
      return true; // Toujours valide
    case 'admin':
      return completedSteps.includes('super_admin');
    case 'pricing':
      return completedSteps.includes('admin') && !!adminCredentials;
    case 'organization':
      return completedSteps.includes('pricing') && !!selectedPlan;
    case 'sms_validation':
      return completedSteps.includes('organization') && !!organizationData;
    case 'garage':
      return completedSteps.includes('sms_validation') && !!smsValidationData;
    case 'completed':
      return completedSteps.includes('garage') && !!garageSetupData;
    default:
      return false;
  }
};
```

## Persistence

### Sauvegarde automatique

Le workflow sauvegarde automatiquement l'état dans :
- **LocalStorage** : Pour la persistance côté client
- **Supabase** : Pour la persistance côté serveur

### Tables de base de données

```sql
-- État du workflow
CREATE TABLE workflow_states (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  current_step TEXT NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans d'abonnement
CREATE TABLE admin_plans (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  plan_id TEXT NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validations SMS
CREATE TABLE sms_validations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  phone_number TEXT NOT NULL,
  validation_code TEXT NOT NULL,
  is_validated BOOLEAN DEFAULT FALSE,
  is_used BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Gestion des erreurs

### Types d'erreurs

1. **Erreurs de validation** : Champs invalides
2. **Erreurs de réseau** : Problèmes de connexion
3. **Erreurs de base de données** : Échecs de sauvegarde
4. **Erreurs d'authentification** : Problèmes de permissions

### Gestion des erreurs

```typescript
try {
  await handleStepComplete(step, data);
} catch (error) {
  console.error('Erreur lors de la completion de l\'étape:', error);
  setError(error instanceof Error ? error.message : 'Erreur inconnue');
  toast.error('Une erreur est survenue');
}
```

## Tests

### Suite de tests

Utilisez le composant `WorkflowTestSuite` pour tester le workflow :

```tsx
import { WorkflowTestSuite } from '@/components/WorkflowTestSuite';

function TestPage() {
  return <WorkflowTestSuite />;
}
```

### Tests automatisés

```typescript
// Test de validation des étapes
describe('Workflow Validation', () => {
  it('should validate super_admin step', () => {
    expect(validateStep('super_admin')).toBe(true);
  });

  it('should require previous steps', () => {
    expect(validateStep('admin')).toBe(false); // Pas de super_admin
    // ... autres tests
  });
});
```

## Sécurité

### RLS Policies

Toutes les tables ont des politiques RLS appropriées :

```sql
-- Exemple pour workflow_states
CREATE POLICY "Users can view their own workflow state" ON workflow_states
  FOR SELECT USING (auth.uid() = user_id);
```

### Validation côté serveur

Toutes les données sont validées côté serveur avant sauvegarde.

### Chiffrement des credentials

Les mots de passe sont chiffrés avec bcrypt avant stockage.

## Performance

### Optimisations

1. **Lazy loading** des modaux
2. **Memoization** des calculs de progression
3. **Indexation** des tables de base de données
4. **Pagination** pour les grandes listes

### Monitoring

```typescript
// Logs de performance
console.time('workflow-step-completion');
await handleStepComplete(step, data);
console.timeEnd('workflow-step-completion');
```

## Déploiement

### Migration

```bash
# Appliquer la migration
supabase db push

# Vérifier les tables
supabase db diff
```

### Variables d'environnement

```env
# Configuration SMS (optionnel)
SMS_PROVIDER_API_KEY=your_api_key
SMS_PROVIDER_URL=https://api.sms-provider.com

# Configuration workflow
WORKFLOW_TIMEOUT=300000 # 5 minutes
SMS_CODE_EXPIRY=600000 # 10 minutes
```

## Maintenance

### Nettoyage des données

```sql
-- Nettoyer les validations SMS expirées
DELETE FROM sms_validations 
WHERE expires_at < NOW() 
AND is_used = false;

-- Nettoyer les états de workflow orphelins
DELETE FROM workflow_states 
WHERE user_id NOT IN (SELECT id FROM auth.users);
```

### Monitoring

Surveillez les métriques suivantes :
- Taux de completion du workflow
- Temps moyen par étape
- Taux d'erreur par étape
- Performance des requêtes

## Support

Pour toute question ou problème :
1. Consultez les logs de la console
2. Vérifiez l'état dans le store Zustand
3. Testez avec `WorkflowTestSuite`
4. Contactez l'équipe de développement 