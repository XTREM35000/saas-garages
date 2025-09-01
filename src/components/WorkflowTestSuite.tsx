// src/components/WorkflowTestSuite.tsx
import React, { useState } from 'react';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { WorkflowStep } from '@/types/workflow.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  Building,
  Phone,
  Car,
  CheckSquare
} from 'lucide-react';

export const WorkflowTestSuite: React.FC = () => {
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const {
    currentStep,
    completedSteps,
    isCompleted,
    isLoading,
    error,
    progress,
    resetWorkflow,
    checkWorkflowStatus,
    validateStep,
    canProceedToStep,
  } = useWorkflowManager();

  const handleWorkflowComplete = async (step: WorkflowStep) => {
    console.log('✅ Workflow step completed:', step);
    if (step === 'completed') {
      setIsWorkflowOpen(false);
    }
  };

  const handleReset = async () => {
    await resetWorkflow();
    console.log('🔄 Workflow reset');
  };

  const handleCheckStatus = async () => {
    await checkWorkflowStatus();
    console.log('🔍 Workflow status checked');
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step) {
      case 'super_admin':
        return <Settings className="w-4 h-4" />;
      case 'admin':
        return <Users className="w-4 h-4" />;
      case 'pricing':
        return <CheckSquare className="w-4 h-4" />;
      case 'organization':
        return <Building className="w-4 h-4" />;
      case 'sms_validation':
        return <Phone className="w-4 h-4" />;
      case 'garage':
        return <Car className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (completedSteps.includes(step)) {
      return { status: 'completed', color: 'bg-green-500' };
    }
    if (currentStep === step) {
      return { status: 'current', color: 'bg-blue-500' };
    }
    if (canProceedToStep(step)) {
      return { status: 'available', color: 'bg-gray-300' };
    }
    return { status: 'locked', color: 'bg-gray-100' };
  };

  const workflowSteps: WorkflowStep[] = [
    'super_admin',
    'admin',
    'pricing',
    'organization',
    'sms_validation',
    'garage',
    'completed'
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Test Suite - Workflow d'Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* État global */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {isCompleted ? "Complété" : "En cours"}
              </Badge>
              <span className="text-sm font-medium">
                État: {isCompleted ? "Terminé" : "En cours"}
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Badge variant="outline">
                {completedSteps.length}/{workflowSteps.length}
              </Badge>
              <span className="text-sm font-medium">
                Étapes complétées
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Badge variant="outline">
                {progress.percentage}%
              </Badge>
              <span className="text-sm font-medium">
                Progression
              </span>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="w-full" />
          </div>

          {/* Étapes du workflow */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Étapes du Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workflowSteps.map((step, index) => {
                const { status, color } = getStepStatus(step);
                const isCurrent = currentStep === step;
                const isCompleted = completedSteps.includes(step);
                const canProceed = canProceedToStep(step);

                return (
                  <div
                    key={step}
                    className={`p-3 rounded-lg border-2 transition-all ${isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : isCompleted
                          ? 'border-green-500 bg-green-50'
                          : canProceed
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {step.replace('_', ' ')}
                          </span>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Actuel
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          Étape {index + 1} sur {workflowSteps.length}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsWorkflowOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isCompleted ? 'Relancer Workflow' : 'Continuer Workflow'}
            </Button>

            <Button
              onClick={handleCheckStatus}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Vérifier État
            </Button>

            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Workflow
            </Button>
          </div>

          {/* État détaillé */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erreur:</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Informations de debug */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-gray-700">
              Informations de Debug
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  currentStep,
                  completedSteps,
                  isCompleted,
                  isLoading,
                  progress,
                  canProceedToStep: workflowSteps.map(step => ({
                    step,
                    canProceed: canProceedToStep(step),
                    isValid: validateStep(step)
                  }))
                }, null, 2)}
              </pre>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Orchestrateur du workflow */}
      <WorkflowOrchestrator
        isOpen={isWorkflowOpen}
        onComplete={handleWorkflowComplete}
        onClose={() => setIsWorkflowOpen(false)}
      />
    </div>
  );
};

export default WorkflowTestSuite; 