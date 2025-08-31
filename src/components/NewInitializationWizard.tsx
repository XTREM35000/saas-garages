import React, { useEffect } from 'react';
import { OptimizedWorkflowWizard } from './OptimizedWorkflowWizard';
import { useWorkflowCheck } from '@/hooks/useWorkflowCheck';
import { WorkflowStep } from '@/types/workflow.types';

interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const NewInitializationWizard: React.FC<NewInitializationWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { isChecking, workflowState, error, checkWorkflowState } = useWorkflowCheck();

  // Effet pour la vérification initiale
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Initialisation du workflow...');
      checkWorkflowState();
    }
  }, [isOpen, checkWorkflowState]);

  const handleWorkflowComplete = async (step: WorkflowStep) => {
    console.log('✨ Workflow terminé à l\'étape:', step);

    // Vérifier une dernière fois l'état avant de terminer
    await checkWorkflowState();

    if (step === 'completed') {
      console.log('🎉 Toutes les étapes sont terminées');
      onComplete();
    }
  };

  // Si le workflow est en cours de vérification, on peut afficher un loader
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p>Initialisation du workflow...</p>
        </div>
      </div>
    );
  }

  // Si une erreur survient, on l'affiche
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => checkWorkflowState()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // On ne rend le wizard que si on a l'état initial
  if (!workflowState) {
    return null;
  }

  // Modification du rendu final
  return (
    <OptimizedWorkflowWizard
      isOpen={isOpen}
      onComplete={handleWorkflowComplete}
      workflowState={workflowState} // Changé de initialState à workflowState
    />
  );
};

export default NewInitializationWizard;
