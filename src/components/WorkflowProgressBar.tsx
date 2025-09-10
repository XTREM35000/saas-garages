import React from 'react';
import { Icons } from '@/components/ui/icons';
import { WORKFLOW_STEPS } from '@/lib/workflow-state';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/workflow.types';
import { Lock, Unlock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
  compact?: boolean;
  whatsappTheme?: boolean;
}

const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  compact = true,
  whatsappTheme = true
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
    <div
      className={cn(
        "px-4 sm:px-6 py-3 sm:py-4 border-b",
        whatsappTheme
          ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur border-[#128C7E]/20"
          : "bg-white border-gray-200",
        compact ? "sticky top-0 z-40" : ""
      )}
    >
      <div className={cn("mx-auto", compact ? "max-w-5xl" : "max-w-6xl") }>
        {/* Titre du workflow */}
        <div className={cn("text-center", compact ? "mb-3" : "mb-6") }>
          <h1 className={cn(
            "font-bold mb-1",
            compact ? "text-lg" : "text-2xl",
            whatsappTheme ? "text-[#075E54] dark:text-[#25D366]" : "text-gray-900"
          )}>
            Configuration Multi-Garage-Connect (MGC)
          </h1>
          <p className={cn("", compact ? "text-xs" : "text-sm", whatsappTheme ? "text-[#128C7E] opacity-80" : "text-gray-600") }>
            Suivez les étapes pour configurer votre instance SaaS
          </p>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          {/* Ligne de connexion */}
          <div className={cn("absolute left-0 right-0 h-0.5", compact ? "top-5" : "top-6", whatsappTheme ? "bg-[#128C7E]/20" : "bg-gray-200") }>
            <div
              className={cn(
                "h-full transition-all duration-500 ease-in-out",
                whatsappTheme ? "bg-gradient-to-r from-[#128C7E] to-[#25D366]" : "bg-blue-500"
              )}
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
                  {/* Cercle de l'étape + Tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                    className={cn(
                      "rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                      compact ? "w-9 h-9 mb-2" : "w-12 h-12 mb-3",
                      {
                        // Étape terminée
                        "bg-gradient-to-r from-green-500 to-green-600 shadow-lg scale-105 cursor-pointer hover:scale-110": isCompleted,
                        // Étape actuelle
                        "bg-gradient-to-r from-[#128C7E] to-[#25D366] shadow-lg scale-105 ring-4 ring-[#128C7E]/20": isCurrent,
                        // Étape en attente
                        "bg-gray-200 text-gray-400": isPending
                      }
                    )}
                    onClick={() => onStepClick && onStepClick(step.id as WorkflowStep)}
                        >
                    {isCompleted ? (
                      <div className="relative">
                        <Icons.check className={cn("text-white", compact ? "w-5 h-5" : "w-6 h-6")} />
                        {/* Petit cadenas déverrouillé */}
                        <Unlock className={cn("text-white absolute -top-1 -right-1 bg-green-600 rounded-full p-0.5", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                      </div>
                    ) : (
                      <div className="relative">
                        <step.icon
                          size={compact ? 18 : 24}
                          color={isCurrent ? "#ffffff" : "#9ca3af"}
                        />
                        {isPending && (
                          <Lock className={cn("absolute -top-1 -right-1 text-gray-500", compact ? "w-3 h-3" : "w-4 h-4")} />
                        )}
                      </div>
                    )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {step.title}
                          </div>
                          <div className="text-xs opacity-80">
                            {isCompleted ? 'Terminé' : isCurrent ? 'En cours' : 'Verrouillé'} • {step.description}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Label de l'étape */}
                  <div className={cn("text-center", compact ? "max-w-20" : "max-w-24") }>
                    <div className={cn(
                      compact ? "font-medium text-xs mb-0.5" : "font-medium text-sm mb-1",
                      {
                        "text-gray-900": isCompleted || isCurrent,
                        "text-gray-500": isPending
                      }
                    )}>
                      {step.title}
                    </div>
                    <div className={cn(
                      compact ? "text-[10px]" : "text-xs",
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
                    <div className={cn("absolute left-1/2 transform -translate-x-1/2", compact ? "-bottom-6" : "-bottom-8") }>
                      <div className={cn("text-white rounded-full font-medium animate-pulse", compact ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1", whatsappTheme ? "bg-[#128C7E]" : "bg-blue-500") }>
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
          <div className={cn("text-center", compact ? "mt-4" : "mt-8") }>
            <div className={cn(
              "inline-flex items-center space-x-2 rounded-lg px-3 sm:px-4 py-1.5",
              whatsappTheme ? "bg-[#E7F6EE] border border-[#128C7E]/30" : "bg-blue-50 border border-blue-200"
            )}>
              <Icons.info className={cn("", compact ? "w-3.5 h-3.5" : "w-4 h-4", whatsappTheme ? "text-[#128C7E]" : "text-blue-600")} />
              <span className={cn(compact ? "text-xs" : "text-sm", whatsappTheme ? "text-[#075E54]" : "text-blue-800") }>
                Étape {currentStepIndex + 1} sur {steps.length} : {steps.find(s => s.id === currentStep)?.description}
              </span>
            </div>
          </div>
        )}

        {/* Progression globale */}
        <div className={cn("text-center", compact ? "mt-3" : "mt-6") }>
          <div className="inline-flex items-center space-x-3">
            <div className={cn(compact ? "text-xs" : "text-sm", whatsappTheme ? "text-[#075E54]" : "text-gray-600") }>
              Progression globale
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn("rounded-full overflow-hidden", compact ? "w-24 h-1.5" : "w-32 h-2", whatsappTheme ? "bg-[#128C7E]/20" : "bg-gray-200") }>
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-in-out",
                    whatsappTheme ? "bg-gradient-to-r from-[#128C7E] to-[#25D366]" : "bg-blue-500"
                  )}
                  style={{
                    width: `${Math.max(0, (completedSteps.length / steps.length) * 100)}%`
                  }}
                />
              </div>
              <span className={cn("font-medium min-w-[3rem] text-center", compact ? "text-xs" : "text-sm", whatsappTheme ? "text-[#075E54]" : "text-gray-700") }>
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
