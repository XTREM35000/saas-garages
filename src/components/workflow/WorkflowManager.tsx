import React from 'react';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { SuperAdminForm } from './SuperAdminForm';
import { AdminForm } from './AdminForm';
import { OrganizationForm } from './OrganizationForm';
import { SMSValidationForm } from './SMSValidationForm';
import { GarageForm } from './GarageForm';
import { Loader2 } from 'lucide-react';

interface WorkflowManagerProps {
  onComplete: () => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onComplete
}) => {
  const {
    currentStep,
    isLoading,
    error,
    createSuperAdmin,
    createAdmin,
    createOrganization,
    validateSMS,
    createGarage
  } = useWorkflowManager();

  // Affichage du loading initial
  if (isLoading && currentStep === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-foreground">Vérification du workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Erreur Workflow
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Workflow terminé
  if (currentStep === 'completed') {
    onComplete();
    return null;
  }

  // Rendu selon l'étape courante
  switch (currentStep) {
    case 'super_admin':
      return (
        <SuperAdminForm
          onSubmit={createSuperAdmin}
          isLoading={isLoading}
        />
      );

    case 'admin':
      return (
        <AdminForm
          onSubmit={createAdmin}
          isLoading={isLoading}
        />
      );

    case 'organization':
      return (
        <OrganizationForm
          onSubmit={createOrganization}
          isLoading={isLoading}
        />
      );

    case 'sms_validation':
      return (
        <SMSValidationForm
          onSubmit={(code) => validateSMS(code)}
          isLoading={isLoading}
        />
      );

    case 'garage':
      return (
        <GarageForm
          onSubmit={createGarage}
          isLoading={isLoading}
        />
      );

    default:
      return null;
  }
};