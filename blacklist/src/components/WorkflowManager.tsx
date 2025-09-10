// src/components/WorkflowManager.tsx
import React, { useEffect, useState } from 'react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { WorkflowStep } from '@/types/workflow.types';
import { SuperAdminCreationModal } from './SuperAdminCreationModal';
import { GeneralAuthModal } from './GeneralAuthModal';
import { Loader2 } from 'lucide-react';

interface WorkflowManagerProps {
  onComplete?: () => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onComplete
}) => {
  const { isChecking, workflowState, error, checkWorkflowState } = useWorkflowState();
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  // Déterminer quel modal afficher
  useEffect(() => {
    if (!isChecking && workflowState) {
      console.log('🔄 Workflow state:', workflowState);
      
      if (!workflowState.has_super_admin) {
        setCurrentModal('super_admin');
      } else if (!workflowState.has_admin) {
        setCurrentModal('general_auth');
      } else {
        setCurrentModal(null);
      }
    }
  }, [isChecking, workflowState]);

  const handleSuperAdminComplete = async () => {
    console.log('✅ Super admin créé');
    await checkWorkflowState();
  };

  const handleAuthComplete = async () => {
    console.log('✅ Auth complétée');
    await checkWorkflowState();
  };

  // Loader pendant la vérification
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold">Vérification du système...</h3>
              <p className="text-sm text-gray-600">
                Analyse de la configuration
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="font-semibold text-red-600 mb-4">Erreur de configuration</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={checkWorkflowState}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Workflow terminé
  if (workflowState?.is_completed) {
    return null;
  }

  // Affichage conditionnel des modals
  return (
    <>
      {currentModal === 'super_admin' && (
        <SuperAdminCreationModal
          isOpen={true}
          onComplete={handleSuperAdminComplete}
          onClose={() => setCurrentModal(null)}
        />
      )}

      {currentModal === 'general_auth' && (
        <GeneralAuthModal
          isOpen={true}
          onClose={() => setCurrentModal(null)}
          onNewTenant={() => {
            console.log('🚀 Nouveau tenant requis');
            setCurrentModal('pricing');
          }}
          onAuthSuccess={handleAuthComplete}
        />
      )}

      {!currentModal && !isChecking && workflowState?.is_completed && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Système configuré !</h1>
            <p className="text-muted-foreground">Prêt à être utilisé.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowManager;