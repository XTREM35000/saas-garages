import React from 'react';
import { Icons } from '@/components/ui/icons';
import { WORKFLOW_STEPS } from '@/lib/workflow-state';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/workflow.types';
import { Lock, Unlock } from 'lucide-react';

interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
}

const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick
}) => {
  const steps = Object.values(WORKFLOW_STEPS).sort((a, b) => a.order - b.order);
  const progress = (completedSteps.length / steps.length) * 100;

  const getStepStatus = (stepKey: WorkflowStep) => {
    if (completedSteps.includes(stepKey)) {
      return 'completed';
    }
    if (stepKey === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  const getStepIndex = (stepKey: WorkflowStep) => {
    return Object.values(WORKFLOW_STEPS).findIndex(step => step.id === stepKey);
  };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Titre du workflow */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuration Multi-Garage-Connect (MGC)
          </h1>
          <p className="text-gray-600">
            Suivez les étapes pour configurer votre instance SaaS
          </p>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          {/* Ligne de connexion */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] transition-all duration-500 ease-in-out"
              style={{
                width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`
              }}
            />
          </div>

          {/* Étapes */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id as WorkflowStep);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isPending = status === 'pending';

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Cercle de l'étape */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 relative z-10",
                      {
                        // Étape terminée
                        "bg-gradient-to-r from-green-500 to-green-600 shadow-lg scale-110 cursor-pointer hover:scale-125": isCompleted,
                        // Étape actuelle
                        "bg-gradient-to-r from-[#128C7E] to-[#25D366] shadow-lg scale-110 ring-4 ring-[#128C7E]/20": isCurrent,
                        // Étape en attente
                        "bg-gray-200 text-gray-400": isPending
                      }
                    )}
                    onClick={() => onStepClick && onStepClick(step.id as WorkflowStep)}
                  >
                    {isCompleted ? (
                      <div className="relative">
                        <Icons.check className="w-6 h-6 text-white" />
                        {/* Petit cadenas déverrouillé */}
                        <Unlock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-green-600 rounded-full p-0.5" />
                      </div>
                    ) : (
                      <step.icon
                        size={24}
                        color={isCurrent ? "#ffffff" : "#9ca3af"}
                      />
                    )}
                  </div>

                  {/* Label de l'étape */}
                  <div className="text-center max-w-24">
                    <div className={cn(
                      "font-medium text-sm mb-1",
                      {
                        "text-gray-900": isCompleted || isCurrent,
                        "text-gray-500": isPending
                      }
                    )}>
                      {step.title}
                    </div>
                    <div className={cn(
                      "text-xs",
                      {
                        "text-gray-700": isCompleted || isCurrent,
                        "text-gray-400": isPending
                      }
                    )}>
                      {step.description}
                    </div>
                  </div>

                  {/* Indicateur de progression pour l'étape actuelle */}
                  {isCurrent && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#128C7E] text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                        En cours...
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Informations sur l'étape actuelle */}
        {currentStep && currentStep !== 'completed' && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Icons.info className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Étape {currentStepIndex + 1} sur {steps.length} : {steps.find(s => s.id === currentStep)?.description}
              </span>
            </div>
          </div>
        )}

        {/* Progression globale */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Progression globale
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.max(0, (completedSteps.length / steps.length) * 100)}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgressBar;
