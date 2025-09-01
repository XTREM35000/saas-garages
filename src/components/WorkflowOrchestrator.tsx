// src/components/WorkflowOrchestrator.tsx
import React, { useEffect } from 'react';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { WorkflowStep } from '@/types/workflow.types';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

// Imports des modaux
import { SuperAdminCreationModal } from './SuperAdminCreationModal';
import { AdminCreationModal } from './AdminCreationModal';
import PricingModal from './PricingModal';
import { OrganizationSetupModal } from './OrganizationSetupModal';
import SmsValidationModal from './SmsValidationModal';
import GarageSetupModal from './GarageSetupModal';
import CompletionSummaryModal from './CompletionSummaryModal';

interface WorkflowOrchestratorProps {
  isOpen: boolean;
  onComplete: (step: WorkflowStep) => Promise<void>;
  onClose?: () => void;
}

export const WorkflowOrchestrator: React.FC<WorkflowOrchestratorProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const {
    currentStep,
    isLoading,
    error,
    progress,
    handleSuperAdminComplete,
    handleAdminComplete,
    handlePricingComplete,
    handleOrganizationComplete,
    handleSmsValidationComplete,
    handleGarageComplete,
    checkWorkflowStatus,
    setError,
  } = useWorkflowManager();

  // Vérifier l'état au montage
  useEffect(() => {
    if (isOpen) {
      checkWorkflowStatus();
    }
  }, [isOpen, checkWorkflowStatus]);

  // Gérer la completion du workflow
  useEffect(() => {
    if (currentStep === 'completed') {
      onComplete('completed');
    }
  }, [currentStep, onComplete]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handlers pour chaque étape
  const handleStepComplete = async (step: WorkflowStep, data?: any) => {
    try {
      switch (step) {
        case 'super_admin':
          await handleSuperAdminComplete(data);
          break;
        case 'admin':
          await handleAdminComplete(data);
          break;
        case 'pricing':
          await handlePricingComplete(data);
          break;
        case 'organization':
          await handleOrganizationComplete(data);
          break;
        case 'sms_validation':
          await handleSmsValidationComplete(data);
          break;
        case 'garage':
          await handleGarageComplete(data);
          break;
        default:
          console.warn('Étape non reconnue:', step);
      }

      // Notifier la completion
      await onComplete(step);

    } catch (error) {
      console.error('Erreur lors de la completion de l\'étape:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  // Loader global
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold">Configuration en cours...</h3>
              <p className="text-sm text-gray-600">
                Étape {progress.completedSteps + 1} sur {progress.totalSteps}
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Erreur globale
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-semibold">Erreur</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Réessayer
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendu des modaux selon l'étape actuelle
  return (
    <>
      {currentStep === 'super_admin' && (
        <SuperAdminCreationModal
          isOpen={isOpen}
          onComplete={(data) => handleStepComplete('super_admin', data)}
          onClose={onClose || (() => { })}
        />
      )}

      {currentStep === 'admin' && (
        <AdminCreationModal
          isOpen={isOpen}
          onComplete={(data) => handleStepComplete('admin', data)}
          onClose={onClose || (() => { })}
        />
      )}

      {currentStep === 'pricing' && (
        <PricingModal
          isOpen={isOpen}
          onSelectPlan={(plan) => handleStepComplete('pricing', plan)}
        />
      )}

      {currentStep === 'organization' && (
        <OrganizationSetupModal
          isOpen={isOpen}
          onComplete={(data) => handleStepComplete('organization', data)}
          selectedPlan={null} // Sera récupéré depuis le store
        />
      )}

      {currentStep === 'sms_validation' && (
        <SmsValidationModal
          isOpen={isOpen}
          onComplete={(data) => handleStepComplete('sms_validation', data)}
          onSubmit={(data) => handleStepComplete('sms_validation', data)}
          onClose={onClose || (() => { })}
          organizationData={{
            id: '',
            name: '',
            phone: ''
          }}
        />
      )}

      {currentStep === 'garage' && (
        <GarageSetupModal
          isOpen={isOpen}
          onComplete={(data) => handleStepComplete('garage', data)}
          organizationName=""
        />
      )}

      {currentStep === 'completed' && (
        <CompletionSummaryModal
          isOpen={isOpen}
          onClose={() => onComplete('completed')}
        />
      )}
    </>
  );
};

export default WorkflowOrchestrator; 