import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WORKFLOW_STEPS } from '@/lib/workflow-state';
import WorkflowProgressBar from '@/components/WorkflowProgressBar';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { WorkflowStepConfig, WorkflowStep } from '@/types/workflow.types';


export const WorkflowManager = () => {
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.SUPER_ADMIN.id);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérification des étapes
  const checkStep = async (stepId: string) => {
    try {
      const step = WORKFLOW_STEPS[stepId];

      switch (stepId) {
        case 'SUPER_ADMIN':
          const { count: adminCount } = await supabase
            .from('super_admins')
            .select('count');
          return adminCount > 0;

        case 'AUTH':
          const { data: session } = await supabase.auth.getSession();
          return !!session;

        // ...autres vérifications selon le step
      }
    } catch (error) {
      console.error(`Erreur vérification ${stepId}:`, error);
      return false;
    }
  };

  // Progression au step suivant
  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
    const currentOrder = WORKFLOW_STEPS[stepId].order;
    const nextStep = Object.values(WORKFLOW_STEPS)
      .find(step => step.order === currentOrder + 1);

    if (nextStep) {
      setCurrentStep(nextStep.id);
    } else {
      toast.success('Configuration terminée !');
      // Redirection vers le dashboard
    }
  };

  const handleLoginSuccess = (data: { user: any; profile: any }) => {
    completeStep(currentStep);
    // Ajoutez ici la logique supplémentaire post-login
  };

  // Rendu du modal actif
  const renderCurrentModal = () => {
    const step = WORKFLOW_STEPS[currentStep] as WorkflowStepConfig;
    const StepComponent = step.component;

    const modalProps = {
      isOpen: true,
      onClose: () => { }, // Désactivé pendant le workflow
      onComplete: () => completeStep(currentStep),
      onLoginSuccess: handleLoginSuccess
    };

    return <StepComponent {...modalProps} />;
  };

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

  return (
    <>
      <WorkflowProgressBar
        currentStep={WORKFLOW_STEPS[currentStep].id as WorkflowStep}
        completedSteps={completedSteps.map(stepId => WORKFLOW_STEPS[stepId].id as WorkflowStep)}
      />
      {!loading && renderCurrentModal()}
    </>
  );
};