// src/components/OptimizedWorkflowWizard.tsx
import { OptimizedWorkflowWizardProps, WorkflowState, PlanDetails, AdminCredentials } from '@/types/workflow.types';
import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Imports des modaux
import { SuperAdminCreationModal } from './SuperAdminCreationModal';
import PricingModal from './PricingModal';
import { AdminCreationModal } from './AdminCreationModal';
import { OrganizationSetupModal } from './OrganizationSetupModal';
import SmsValidationModal from './SmsValidationModal';
import GarageSetupModal from './GarageSetupModal';
import CompletionSummaryModal from './CompletionSummaryModal';

interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  selectedPlan(Plan: any): any
}

// Types pour le workflow
type WorkflowStep =
  | 'super_admin'
  | 'pricing'
  | 'admin'
  | 'organization'
  | 'sms_validation'
  | 'garage'
  | 'completed';

export const OptimizedWorkflowWizard: React.FC<OptimizedWorkflowWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { isChecking, workflowState, error, checkWorkflowState } = useWorkflowState();
  const [currentModal, setCurrentModal] = useState<WorkflowStep | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);

  // Logs de débogage
  useEffect(() => {
    console.log('🔄 Current modal changed to:', currentModal);
  }, [currentModal]);

  useEffect(() => {
    console.log('📊 Workflow state updated:', workflowState);
  }, [workflowState]);

  const determineCurrentModal = useCallback(() => {
    if (!workflowState || !isOpen) {
      console.log('❌ État workflow non disponible ou modal fermé');
      return null;
    }

    console.log('🔍 Analyse workflow:', workflowState);

    // Vérification séquentielle stricte
    if (!workflowState.has_super_admin) {
      console.log('➡️ Affichage modal Super Admin');
      return 'super_admin';
    }

    if (!workflowState.has_admin) {
      console.log('➡️ Transition vers création Admin');
      return 'admin';
    }

    if (!workflowState.has_pricing_selected) {
      console.log('➡️ Plan non sélectionné → Affichage modal pricing');
      return 'pricing';
    }

    if (!workflowState.has_organization) {
      console.log('🔴 Organisation manquante → Affichage modal organisation');
      return 'organization';
    }

    if (!workflowState.has_sms_validated) {
      console.log('🔴 SMS non validé → Affichage modal validation SMS');
      return 'sms_validation';
    }

    if (!workflowState.has_garage) {
      console.log('🔴 Garage manquant → Affichage modal garage');
      return 'garage';
    }

    console.log('✅ Workflow complet');
    return 'completed';
  }, [workflowState, isOpen]);

  // Mise à jour du modal actuel
  useEffect(() => {
    const nextModal = determineCurrentModal();
    if (nextModal !== currentModal) {
      console.log(`🔄 Changement modal: ${currentModal} → ${nextModal}`);
      setCurrentModal(nextModal);
    }
  }, [determineCurrentModal, currentModal]);

  // Effet pour forcer la vérification après chaque étape
  useEffect(() => {
    if (currentModal === 'completed') {
      onComplete('completed');
    }
  }, [currentModal, onComplete]);

  // Handlers
  const handleStepCompleted = async (step: WorkflowStep) => {
    console.log(`✅ Étape terminée: ${step}`);
    await checkWorkflowState();
    toast.success(`${step.replace('_', ' ')} complété ! 🎉`);
  };

  const handlePlanSelected = async (planDetails: PlanDetails) => {
    setSelectedPlan(planDetails);
    console.log('📋 Plan sélectionné:', planDetails);
    await handleStepCompleted('pricing');
    setCurrentModal('organization');
  };

  const handleAdminCreated = async (credentials: AdminCredentials) => {
    setAdminCredentials(credentials);
    await handleStepCompleted('admin');
  };

  const handleCompletionClose = () => {
    onComplete('completed');
  };

  // Loader
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>Vérification du workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500">{error}</p>
          <button
            onClick={checkWorkflowState}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const handleSmsValidated = async (validationData: any) => {
    console.log('📱 SMS validation completed:', validationData);
    await handleStepCompleted('sms_validation');
  };

  // Rendu des modaux
  return (
    <>
      {currentModal === 'super_admin' && (
        <SuperAdminCreationModal
          isOpen={true}
          onComplete={() => handleStepCompleted('super_admin')}
          onClose={() => { }}
        />
      )}

      {currentModal === 'admin' && (
        <AdminCreationModal
          isOpen={true}
          onComplete={() => handleStepCompleted('admin')}
          onClose={() => { }}
          selectedPlan={selectedPlan}
        />
      )}

      {currentModal === 'pricing' && (
        <PricingModal
          isOpen={true}
          onSelectPlan={handlePlanSelected}
          adminCredentials={adminCredentials}
        />
      )}

      {currentModal === 'organization' && (
        <OrganizationSetupModal
          isOpen={true}
          onComplete={() => handleStepCompleted('organization')}
          selectedPlan={selectedPlan?.type}
        />
      )}

      {currentModal === 'sms_validation' && workflowState && (
        <SmsValidationModal
          isOpen={true}
          onComplete={handleSmsValidated}
          onSubmit={handleSmsValidated}
          onClose={() => { }}
          organizationData={{
            id: workflowState.organization_id || '',
            name: workflowState.organization_name || '',
            phone: workflowState.organization_phone || ''
          }}
        />
      )}

      {currentModal === 'garage' && workflowState && (
        <GarageSetupModal
          isOpen={true}
          onComplete={() => handleStepCompleted('garage')}
          organizationName={workflowState.organization_name || ''}
        />
      )}

      {currentModal === 'completed' && (
        <CompletionSummaryModal
          isOpen={true}
          onClose={handleCompletionClose}
        />
      )}
    </>
  );
};

export default OptimizedWorkflowWizard;