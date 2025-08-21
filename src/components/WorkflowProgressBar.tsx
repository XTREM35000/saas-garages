import React from 'react';
import { motion } from 'framer-motion';
import { Crown, CreditCard, User, Building, MessageSquare, Wrench, CheckCircle } from 'lucide-react';
import { WorkflowStep } from '@/types/workflow.types';
import { cn } from '@/lib/utils';

interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  className?: string;
}

interface StepInfo {
  key: WorkflowStep;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const WORKFLOW_STEPS: StepInfo[] = [
  {
    key: 'super_admin_check',
    name: 'Super Admin',
    icon: Crown,
    description: 'Vérification Super Admin',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    key: 'pricing_selection',
    name: 'Pricing',
    icon: CreditCard,
    description: 'Sélection Plan',
    color: 'from-[#128C7E] to-[#075E54]'
  },
  {
    key: 'admin_creation',
    name: 'Admin',
    icon: User,
    description: 'Création Admin',
    color: 'from-blue-500 to-blue-700'
  },
  {
    key: 'org_creation',
    name: 'Organisation',
    icon: Building,
    description: 'Création Organisation',
    color: 'from-purple-500 to-purple-700'
  },
  {
    key: 'sms_validation',
    name: 'SMS',
    icon: MessageSquare,
    description: 'Validation SMS',
    color: 'from-green-500 to-green-700'
  },
  {
    key: 'garage_setup',
    name: 'Garage',
    icon: Wrench,
    description: 'Configuration Garage',
    color: 'from-orange-500 to-orange-700'
  }
];

export const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
  completedSteps,
  className = ''
}) => {
  // Calcul de la progression
  const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.key === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100;

  // Déterminer l'état de chaque étape
  const getStepStatus = (stepKey: WorkflowStep) => {
    if (completedSteps.includes(stepKey)) return 'completed';
    if (stepKey === currentStep) return 'current';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Barre de progression principale */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-[#128C7E]">
              Étape {currentStepIndex + 1} sur {WORKFLOW_STEPS.length}
            </div>
            <div className="text-sm text-gray-600">
              {WORKFLOW_STEPS[currentStepIndex]?.description}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full relative"
            >
              {/* Indicateur de progression */}
              <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-lg transform translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
        </div>

        {/* Étapes détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.key);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-lg transition-all duration-200",
                  isCompleted
                    ? "bg-green-50 border border-green-200"
                    : isCurrent
                    ? "bg-[#128C7E]/10 border border-[#128C7E]/30 shadow-md"
                    : "bg-gray-50 border border-gray-200"
                )}
              >
                {/* Indicateur de statut */}
                <div className="relative mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white shadow-lg"
                      : "bg-gray-300 text-gray-500"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Ligne de connexion */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn(
                      "absolute top-1/2 left-full w-4 h-0.5 transform -translate-y-1/2",
                      isCompleted ? "bg-green-300" : "bg-gray-300"
                    )} />
                  )}
                </div>

                {/* Nom de l'étape */}
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-semibold mb-1",
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-[#128C7E]"
                      : "text-gray-500"
                  )}>
                    {step.name}
                  </div>

                  {/* Description courte */}
                  <div className="text-xs text-gray-500 leading-tight">
                    {step.description}
                  </div>
                </div>

                {/* Indicateur de progression */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
