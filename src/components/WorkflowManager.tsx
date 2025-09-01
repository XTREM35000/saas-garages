// src/components/WorkflowManager.tsx
import React, { useEffect, useState } from 'react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { WorkflowStep } from '@/types/workflow.types';
import { OptimizedWorkflowWizard } from './OptimizedWorkflowWizard';
import { Loader2 } from 'lucide-react';

interface WorkflowManagerProps {
  onComplete?: () => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onComplete
}) => {
  const { isChecking, workflowState, error, checkWorkflowState } = useWorkflowState();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  // Ouvrir le workflow si nécessaire
  useEffect(() => {
    if (!isChecking && workflowState && !workflowState.is_completed) {
      setIsWorkflowOpen(true);
    }
  }, [isChecking, workflowState]);

  const handleWorkflowComplete = async (step: WorkflowStep) => {
    console.log('✅ Workflow step completed:', step);
    
    if (step === 'completed') {
      setIsWorkflowOpen(false);
      onComplete?.();
    } else {
      // Reverifier l'état après chaque étape
      await checkWorkflowState();
    }
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

  // Rendu du workflow wizard
  return (
    <OptimizedWorkflowWizard
      isOpen={isWorkflowOpen}
      onComplete={handleWorkflowComplete}
    />
  );
};

export default WorkflowManager;