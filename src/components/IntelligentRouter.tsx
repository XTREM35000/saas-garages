import React, { useState, useEffect } from 'react';
import { SystemStatusService, SystemStatus } from '@/services/systemStatusService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import des composants selon les états
import SuperAdminOnlyModal from '@/components/SuperAdminOnlyModal';
import HomePage from '@/components/HomePage';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

export interface IntelligentRouterProps {
  onSystemReady?: (status: SystemStatus) => void;
  onError?: (error: Error) => void;
}

export const IntelligentRouter: React.FC<IntelligentRouterProps> = ({
  onSystemReady,
  onError
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkSystemStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [IntelligentRouter] Vérification état système...');
      
      const status = await SystemStatusService.checkSystemStatus();
      
      setSystemStatus(status);
      onSystemReady?.(status);
      
      console.log('✅ [IntelligentRouter] Système prêt:', status);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [IntelligentRouter] Erreur:', err);
      
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      toast.error('Erreur lors de la vérification du système', {
        description: errorMessage
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification initiale
  useEffect(() => {
    checkSystemStatus();
  }, []);

  // Fonction de retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkSystemStatus();
  };

  // Gestion des cas d'erreur critique
  if (error && retryCount >= 3) {
    return (
      <ErrorScreen 
        error={error}
        onRetry={handleRetry}
        maxRetriesReached={true}
      />
    );
  }

  // Écran de chargement
  if (isLoading || !systemStatus) {
    return <LoadingScreen message="Vérification du système..." />;
  }

  // Écran d'erreur avec possibilité de retry
  if (error) {
    return (
      <ErrorScreen 
        error={error}
        onRetry={handleRetry}
        retryCount={retryCount}
      />
    );
  }

  // Routing intelligent selon l'état du système
  console.log('🎯 [IntelligentRouter] Routing pour état:', systemStatus);

  // Scénario 1: Base de données vide (Premier lancement)
  if (systemStatus.isEmpty) {
    console.log('📋 [IntelligentRouter] Scénario 1: DB vide - Affichage modal Super Admin');
    return (
      <SuperAdminOnlyModal 
        onSuccess={() => {
          console.log('✅ [IntelligentRouter] Super Admin créé - Rechargement état');
          checkSystemStatus(); // Recharger l'état après création
        }}
        onError={(err) => {
          console.error('❌ [IntelligentRouter] Erreur création Super Admin:', err);
          setError(err);
        }}
      />
    );
  }

  // Scénarios 2 et 3: Afficher la page d'accueil avec les bonnes options
  return (
    <HomePage 
      systemStatus={systemStatus}
      onSystemUpdate={checkSystemStatus} // Permettre à HomePage de déclencher une mise à jour
    />
  );
};

export default IntelligentRouter;