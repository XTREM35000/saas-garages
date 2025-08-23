import React, { useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { WorkflowStep } from '@/types/workflow.types';

const WorkflowTest: React.FC = () => {
  const { state, completeStep, reset } = useWorkflow();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleStepComplete = async (step: WorkflowStep) => {
    try {
      addLog(`🎯 Tentative de complétion de l'étape: ${step}`);
      await completeStep(step);
      addLog(`✅ Étape ${step} complétée avec succès`);
    } catch (error) {
      addLog(`❌ Erreur lors de la complétion de l'étape ${step}: ${error}`);
    }
  };

  const handleReset = async () => {
    try {
      addLog('🔄 Réinitialisation du workflow...');
      await reset();
      addLog('✅ Workflow réinitialisé');
      setLogs([]);
    } catch (error) {
      addLog(`❌ Erreur lors de la réinitialisation: ${error}`);
    }
  };

  const getStepInfo = (step: WorkflowStep) => {
    const stepInfo: Record<WorkflowStep, { title: string; description: string; icon: string }> = {
      init: { title: 'Initialisation', description: 'Démarrage du workflow', icon: '🚀' },
      loading: { title: 'Chargement', description: 'Chargement en cours', icon: '⏳' },
      super_admin_check: { title: 'Super Admin', description: 'Vérification/Création du Super Admin', icon: '👑' },
      pricing_selection: { title: 'Plan Tarifaire', description: 'Sélection du plan de prix', icon: '💰' },
      admin_creation: { title: 'Administrateur', description: 'Création de l\'administrateur', icon: '👤' },
      org_creation: { title: 'Organisation', description: 'Création de l\'organisation', icon: '🏢' },
      sms_validation: { title: 'Validation SMS', description: 'Validation par SMS', icon: '📱' },
      garage_setup: { title: 'Configuration Garage', description: 'Configuration du garage', icon: '🔧' },
      dashboard: { title: 'Tableau de bord', description: 'Accès au dashboard', icon: '📊' },
      completed: { title: 'Terminé', description: 'Workflow complété', icon: '🎉' }
    };

    return stepInfo[step];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🧪 Test du Workflow</h1>

        {/* État actuel */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">État Actuel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Étape Courante</p>
              <p className="text-lg font-bold text-blue-800">{state.currentStep}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Étapes Complétées</p>
              <p className="text-lg font-bold text-green-800">{state.completedSteps.length}</p>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Progression du Workflow</h2>
          <div className="flex items-center space-x-2">
            {(['super_admin_check', 'pricing_selection', 'admin_creation', 'org_creation', 'garage_setup'] as WorkflowStep[]).map((step, index) => {
              const isCompleted = state.completedSteps.includes(step);
              const isCurrent = state.currentStep === step;
              const stepInfo = getStepInfo(step);

              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
                  `}>
                    {isCompleted ? '✅' : stepInfo.icon}
                  </div>
                  <div className="text-xs text-center mt-1 max-w-16">
                    <div className="font-medium">{stepInfo.title}</div>
                    <div className="text-gray-500">{stepInfo.description}</div>
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-1 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Actions de Test</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStepComplete('super_admin_check')}
              disabled={state.completedSteps.includes('super_admin_check')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Compléter Super Admin
            </button>
            <button
              onClick={() => handleStepComplete('pricing_selection')}
              disabled={!state.completedSteps.includes('super_admin_check')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600"
            >
              Compléter Pricing
            </button>
            <button
              onClick={() => handleStepComplete('admin_creation')}
              disabled={!state.completedSteps.includes('pricing_selection')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600"
            >
              Compléter Admin
            </button>
            <button
              onClick={() => handleStepComplete('org_creation')}
              disabled={!state.completedSteps.includes('admin_creation')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600"
            >
              Compléter Organisation
            </button>
            <button
              onClick={() => handleStepComplete('garage_setup')}
              disabled={!state.completedSteps.includes('org_creation')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600"
            >
              Compléter Garage
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Logs */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Logs Console</h2>
          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun log pour le moment...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
