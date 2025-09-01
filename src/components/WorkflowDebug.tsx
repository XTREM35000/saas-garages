// src/components/WorkflowDebug.tsx
import React, { useState } from 'react';
import { useWorkflowCheck } from '@/hooks/useWorkflowCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Play } from 'lucide-react';

export const WorkflowDebug: React.FC = () => {
  const { state, isChecking, error, checkWorkflowState } = useWorkflowCheck();
  const [showDetails, setShowDetails] = useState(false);

  const handleStartWorkflow = () => {
    console.log('🚀 Démarrage manuel du workflow');
    // Ici vous pouvez déclencher l'ouverture du modal SuperAdminCreationModal
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Debug Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* État de chargement */}
          {isChecking && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-blue-700">Vérification en cours...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erreur:</span>
              </div>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* État du workflow */}
          {state && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">État du workflow:</span>
                <Badge variant={state.is_completed ? "default" : "secondary"}>
                  {state.is_completed ? "Complété" : "En cours"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_super_admin ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Super Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_admin ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_pricing_selected ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_organization ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Organization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_sms_validated ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>SMS Validé</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${state.has_garage ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Garage</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Étape actuelle:</span>
                <Badge variant="outline" className="capitalize">
                  {state.current_step.replace('_', ' ')}
                </Badge>
              </div>

              {/* Détails */}
              <details className="mt-4">
                <summary
                  className="cursor-pointer font-medium text-gray-700"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  Détails techniques
                </summary>
                {showDetails && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(state, null, 2)}
                    </pre>
                  </div>
                )}
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={checkWorkflowState}
              disabled={isChecking}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Loader2 className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              Vérifier État
            </Button>

            {state && !state.has_super_admin && (
              <Button
                onClick={handleStartWorkflow}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Démarrer Workflow
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Instructions:</span>
            </div>
            <ul className="text-sm text-yellow-600 space-y-1">
              <li>• Exécutez d'abord le script SQL dans Supabase</li>
              <li>• Vérifiez que les tables existent</li>
              <li>• Cliquez sur "Démarrer Workflow" pour commencer</li>
              <li>• Le modal SuperAdminCreationModal devrait s'ouvrir</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowDebug; 