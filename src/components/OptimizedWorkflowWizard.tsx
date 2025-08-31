import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflowCheck } from '@/hooks/useWorkflowCheck';
import { WorkflowStep } from '@/types/workflow.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Imports conditionnels pour les modaux
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import PricingModal from '@/components/PricingModal';
import { AdminCreationModal } from '@/components/AdminCreationModal';
import { OrganizationSetupModal } from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import CompletionSummaryModal from '@/components/CompletionSummaryModal';

interface OptimizedWorkflowWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OptimizedWorkflowWizard: React.FC<OptimizedWorkflowWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { isChecking, workflowState, error, checkWorkflowState } = useWorkflowCheck();
  
  // États pour les modaux (seulement ceux nécessaires sont chargés)
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Fonction pour déterminer quel modal ouvrir basé sur l'état réel
  const determineCurrentModal = useCallback(() => {
    if (!workflowState || !isOpen) return null;

    console.log('🎯 [OptimizedWorkflow] Détermination modal basé sur:', workflowState);

    // Workflow conditionnel - on n'ouvre QUE ce qui manque
    if (!workflowState.has_super_admin) {
      console.log('🔴 Super Admin manquant - Modal Super Admin');
      return 'super_admin';
    }

    if (!workflowState.has_admin) {
      console.log('🔴 Admin manquant - Modal Pricing puis Admin');
      return 'pricing';
    }

    if (!workflowState.has_organization) {
      console.log('🔴 Organisation manquante - Modal Organisation');
      return 'organization';
    }

    if (!workflowState.has_garage) {
      console.log('🔴 Garage manquant - Modal Garage');
      return 'garage';
    }

    if (workflowState.is_completed) {
      console.log('✅ Workflow terminé - Modal de résumé');
      return 'completed';
    }

    return null;
  }, [workflowState, isOpen]);

  // Mise à jour du modal actuel
  useEffect(() => {
    const modal = determineCurrentModal();
    setCurrentModal(modal);
  }, [determineCurrentModal]);

  // Gestionnaires d'événements optimisés
  const handleSuperAdminCreated = async () => {
    console.log('✅ [OptimizedWorkflow] Super Admin créé');
    toast.success('Super Administrateur créé ! 🎉');
    await checkWorkflowState(); // Re-vérifier l'état
  };

  const handlePlanSelected = async (planData: any) => {
    console.log('✅ [OptimizedWorkflow] Plan sélectionné:', planData);
    setSelectedPlan(planData.plan);
    toast.success(`Plan ${planData.plan} sélectionné ! 🎉`);
    
    // Passer directement à la création d'admin
    setCurrentModal('admin');
  };

  const handleAdminCreated = async () => {
    console.log('✅ [OptimizedWorkflow] Admin créé');
    toast.success('Administrateur créé ! 🎉');
    await checkWorkflowState(); // Re-vérifier l'état
  };

  const handleOrgCreated = async () => {
    console.log('✅ [OptimizedWorkflow] Organisation créée');
    toast.success('Organisation créée ! 🎉');
    await checkWorkflowState(); // Re-vérifier l'état
  };

  const handleGarageCreated = async () => {
    console.log('✅ [OptimizedWorkflow] Garage créé');
    toast.success('Garage créé ! 🎉');
    await checkWorkflowState(); // Re-vérifier l'état
  };

  const handleCompletionClose = () => {
    console.log('✅ [OptimizedWorkflow] Workflow terminé');
    onComplete();
  };

  // Affichage du loading
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground">Optimisation du workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Erreur Workflow
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <button
              onClick={checkWorkflowState}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si aucun modal nécessaire, ne rien afficher
  if (!currentModal) {
    console.log('🟢 [OptimizedWorkflow] Aucun modal nécessaire');
    return null;
  }

  // Rendu conditionnel des modaux (seulement celui nécessaire)
  return (
    <>
      {/* Modal Super Admin - SEULEMENT si aucun super admin */}
      {currentModal === 'super_admin' && (
        <SuperAdminCreationModal
          isOpen={true}
          onComplete={handleSuperAdminCreated}
          onClose={() => setCurrentModal(null)}
        />
      )}

      {/* Modal Pricing - SEULEMENT si pas d'admin */}
      {currentModal === 'pricing' && (
        <PricingModal
          isOpen={true}
          onSelectPlan={handlePlanSelected}
        />
      )}

      {/* Modal Admin - SEULEMENT si pas d'admin */}
      {currentModal === 'admin' && (
        <AdminCreationModal
          isOpen={true}
          onComplete={handleAdminCreated}
          onClose={() => setCurrentModal(null)}
        />
      )}

      {/* Modal Organisation - SEULEMENT si pas d'organisation */}
      {currentModal === 'organization' && (
        <OrganizationSetupModal
          isOpen={true}
          onComplete={handleOrgCreated}
        />
      )}

      {/* Modal Garage - SEULEMENT si pas de garage */}
      {currentModal === 'garage' && (
        <GarageSetupModal
          isOpen={true}
          onComplete={handleGarageCreated}
          organizationName="Organisation"
        />
      )}

      {/* Modal de résumé - SEULEMENT si workflow terminé */}
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