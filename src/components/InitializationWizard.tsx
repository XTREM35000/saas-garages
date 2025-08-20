import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { WorkflowStep } from "@/types/workflow.types";
import { cn } from "@/lib/utils";

interface InitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  startStep?: WorkflowStep;
  className?: string;
}

interface StepConfig {
  id: WorkflowStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  canGoBack: boolean;
  permissions: string[];
}

const STEP_CONFIGS: Record<WorkflowStep, StepConfig> = {
  init: {
    id: "init",
    title: "Initialisation",
    description: "Configuration initiale du système",
    icon: Lock,
    required: true,
    canGoBack: false,
    permissions: ["admin", "tenant"]
  },
  loading: {
    id: "loading",
    title: "Chargement",
    description: "Chargement en cours...",
    icon: Lock,
    required: false,
    canGoBack: false,
    permissions: ["admin", "tenant"]
  },
  super_admin_check: {
    id: "super_admin_check",
    title: "Vérification Super-Admin",
    description: "Configuration du compte administrateur principal",
    icon: Lock,
    required: true,
    canGoBack: false,
    permissions: ["super_admin"]
  },
  pricing_selection: {
    id: "pricing_selection",
    title: "Sélection du Plan",
    description: "Choisissez votre formule tarifaire",
    icon: CheckCircle,
    required: true,
    canGoBack: false,
    permissions: ["tenant", "admin"]
  },
  admin_creation: {
    id: "admin_creation",
    title: "Création Admin",
    description: "Configuration du compte administrateur",
    icon: CheckCircle,
    required: true,
    canGoBack: true,
    permissions: ["tenant", "admin"]
  },
  org_creation: {
    id: "org_creation",
    title: "Création Organisation",
    description: "Configuration de votre organisation",
    icon: CheckCircle,
    required: true,
    canGoBack: true,
    permissions: ["tenant", "admin"]
  },
  sms_validation: {
    id: "sms_validation",
    title: "Validation SMS",
    description: "Vérification de votre numéro de téléphone",
    icon: CheckCircle,
    required: true,
    canGoBack: true,
    permissions: ["tenant", "admin"]
  },
  garage_setup: {
    id: "garage_setup",
    title: "Configuration Garage",
    description: "Paramétrage de votre premier garage",
    icon: CheckCircle,
    required: true,
    canGoBack: true,
    permissions: ["tenant", "admin"]
  },
  dashboard: {
    id: "dashboard",
    title: "Tableau de Bord",
    description: "Accès à votre espace de travail",
    icon: CheckCircle,
    required: true,
    canGoBack: false,
    permissions: ["tenant", "admin", "super_admin"]
  },
  completed: {
    id: "completed",
    title: "Terminé",
    description: "Configuration terminée avec succès",
    icon: CheckCircle,
    required: false,
    canGoBack: false,
    permissions: ["admin", "tenant"]
  }
};

export const InitializationWizard: React.FC<InitializationWizardProps> = ({
  isOpen,
  onComplete,
  startStep = 'init',
  className = ""
}) => {
  const { state, completeStep } = useWorkflow();
  
  // Utiliser startStep ou l'état du workflow
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(startStep || state.currentStep || 'init');
  
  // Créer la liste des étapes en fonction du startStep
  const getStepsFromStart = useMemo(() => (start: WorkflowStep) => {
    const stepOrder: WorkflowStep[] = [
      'init',
      'super_admin_check',
      'pricing_selection', 
      'admin_creation',
      'org_creation',
      'sms_validation',
      'garage_setup',
      'dashboard'
    ];
    
    const startIndex = stepOrder.indexOf(start);
    console.log(`🔍 getStepsFromStart: start=${start}, startIndex=${startIndex}, stepOrder=`, stepOrder);
    
    if (startIndex === -1) {
      console.log(`⚠️ startIndex non trouvé, retour de toutes les étapes`);
      return stepOrder;
    }
    
    const result = stepOrder.slice(startIndex);
    console.log(`✅ Étapes retournées:`, result);
    return result;
  }, []);
  
  const steps = useMemo(() => {
    console.log(`🔍 useMemo: recalcul des étapes pour currentStep=${currentStep}`);
    return getStepsFromStart(currentStep).map(id => ({ 
      id: id as WorkflowStep, 
      status: 'pending' 
    }));
  }, [currentStep]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<WorkflowStep, any>>({} as any);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialiser l'index de l'étape actuelle (seulement au montage)
  useEffect(() => {
    const index = steps.findIndex(step => step.id === currentStep);
    console.log(`🔄 useEffect initial: currentStep=${currentStep}, index trouvé=${index}, steps=`, steps.map(s => s.id));
    setCurrentStepIndex(index >= 0 ? index : 0);
  }, []); // Dépendances vides pour ne s'exécuter qu'une fois au montage

  // Log quand currentStep change
  useEffect(() => {
    console.log(`🎯 currentStep a changé vers: ${currentStep}`);
  }, [currentStep]);

  // Log pour vérifier que steps ne change plus constamment
  useEffect(() => {
    console.log(`📊 steps a changé:`, steps.map(s => s.id));
  }, [steps]);

  // Log pour vérifier que currentStepIndex est bien mis à jour
  useEffect(() => {
    console.log(`📈 currentStepIndex a changé vers: ${currentStepIndex}`);
  }, [currentStepIndex]);

  // Log pour vérifier que l'interface se met à jour
  useEffect(() => {
    console.log(`🎨 Interface mise à jour: currentStep=${currentStep}, currentStepIndex=${currentStepIndex}, steps.length=${steps.length}`);
  }, [currentStep, currentStepIndex, steps.length]);

  // Fonction de validation des permissions pour le retour
  const canGoBackTo = (targetStep: WorkflowStep): boolean => {
    const targetConfig = STEP_CONFIGS[targetStep];
    if (!targetConfig) return false;

    // Vérifier les permissions de base
    if (!targetConfig.permissions.includes('admin')) return false;

    // Vérifier les restrictions spécifiques
    if (!targetConfig.canGoBack) return false;

    return true;
  };

  // Navigation vers une étape spécifique
  const handleGoToStep = async (stepId: WorkflowStep) => {
    setIsNavigating(true);
    try {
      console.log(`🚀 Navigation vers ${stepId}`);
      
      // Mettre à jour currentStep AVANT de chercher l'index
      setCurrentStep(stepId);
      
      // Attendre que currentStep soit mis à jour
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Maintenant chercher l'index dans le nouveau tableau d'étapes
      const newSteps = getStepsFromStart(stepId);
      const newIndex = newSteps.indexOf(stepId);
      console.log(`📍 Nouveau tableau d'étapes:`, newSteps);
      console.log(`📍 Index trouvé: ${newIndex} pour ${stepId}`);
      
      if (newIndex >= 0) {
        console.log(`✅ Mise à jour de l'index de ${currentStepIndex} vers ${newIndex}`);
        setCurrentStepIndex(newIndex);
        
        // Mettre à jour l'état local de l'étape précédente
        const previousStep = currentStep;
        setStepData(prev => ({
          ...prev,
          [previousStep]: { ...prev[previousStep], status: 'completed' }
        }));
        
        // Marquer l'étape comme complétée dans le workflow
        await completeStep(stepId);
        console.log(`✅ Étape ${stepId} marquée comme complétée`);
        
        // Forcer la mise à jour de l'interface
        console.log(`🔄 Interface mise à jour: étape ${stepId} à l'index ${newIndex}`);
      } else {
        console.error(`❌ Index non trouvé pour l'étape ${stepId}`);
      }
    } catch (error) {
      console.error("❌ Erreur navigation:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Navigation vers l'étape précédente
  const handlePreviousStep = async () => {
    if (currentStepIndex <= 0) return;

    const previousStep = steps[currentStepIndex - 1];
    if (canGoBackTo(previousStep.id)) {
      await handleGoToStep(previousStep.id);
    }
  };

  // Navigation vers l'étape suivante
  const handleNextStep = async () => {
    console.log(`🔄 handleNextStep: currentStepIndex=${currentStepIndex}, steps.length=${steps.length}`);
    
    if (currentStepIndex >= steps.length - 1) {
      console.log(`🏁 Dernière étape atteinte, fin du wizard`);
      onComplete();
      return;
    }

    const nextStep = steps[currentStepIndex + 1];
    console.log(`➡️ Prochaine étape: ${nextStep.id}`);
    await handleGoToStep(nextStep.id);
  };

  // Sauvegarder les données d'une étape
  const saveStepData = (stepId: WorkflowStep, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
  };

  // Récupérer les données d'une étape
  const getStepData = (stepId: WorkflowStep) => {
    return stepData[stepId] || {};
  };

  // Rendu d'une étape
  const renderStep = (step: any) => {
    const config = STEP_CONFIGS[step.id];
    if (!config) return null;

    const StepIcon = config.icon;
    const isCompleted = step.status === "completed";
    const isCurrent = step.id === currentStep;
    const canGoBack = canGoBackTo(step.id);

    return (
      <motion.div
        key={step.id}
        layout
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
          isCurrent
            ? "border-blue-500 bg-blue-50 shadow-md"
            : isCompleted
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50",
          !canGoBack && "opacity-60"
        )}
      >
        {/* Icône de l'étape */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isCurrent
            ? "bg-blue-500 text-white"
            : isCompleted
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600"
        )}>
          <StepIcon className="w-5 h-5" />
        </div>

        {/* Informations de l'étape */}
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-sm",
            isCurrent ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-700"
          )}>
            {config.title}
          </h3>
          <p className={cn(
            "text-xs",
            isCurrent ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"
          )}>
            {config.description}
          </p>
        </div>

        {/* Statut et actions */}
        <div className="flex items-center gap-2">
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}

          {!canGoBack && (
            <Lock className="w-4 h-4 text-gray-400" />
          )}

          {isCurrent && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
      </motion.div>
    );
  };

  // Barre de progression
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* En-tête avec titre et mode */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuration {STEP_CONFIGS[currentStep]?.title || "Organisation"}
        </h1>
        <p className="text-gray-600">
          Suivez les étapes pour configurer votre compte
        </p>
      </div>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStepIndex + 1} sur {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Étapes du workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AnimatePresence>
          {steps.map(renderStep)}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStepIndex <= 0 || isNavigating}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          {/* Bouton de retour vers une étape spécifique */}
          {currentStepIndex > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-500">Retour vers:</span>
              {steps.slice(0, currentStepIndex).reverse().map((step, index) => {
                const config = STEP_CONFIGS[step.id];
                if (!config || !canGoBackTo(step.id)) return null;

                return (
                  <Button
                    key={step.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGoToStep(step.id)}
                    disabled={isNavigating}
                    className="text-xs"
                  >
                    {config.title}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleNextStep}
            disabled={currentStepIndex >= steps.length - 1 || isNavigating}
            className="flex items-center gap-2"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Informations de sécurité */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Navigation sécurisée</p>
            <p>
              Certaines étapes ne permettent pas de retour pour des raisons de sécurité et de cohérence des données.
            </p>
          </div>
        </div>
      </div>

      {/* Contenu de l'étape actuelle */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {STEP_CONFIGS[currentStep]?.title || "Étape en cours"}
          </h2>

          {/* Ici, vous pouvez ajouter le contenu spécifique à chaque étape */}
          <div className="text-gray-600">
            Contenu de l'étape: {currentStep}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitializationWizard;