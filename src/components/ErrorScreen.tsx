import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetriesReached?: boolean;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  onRetry,
  retryCount = 0,
  maxRetriesReached = false
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const getErrorSeverity = () => {
    if (maxRetriesReached) return 'critical';
    if (retryCount >= 2) return 'high';
    if (retryCount >= 1) return 'medium';
    return 'low';
  };

  const severity = getErrorSeverity();

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'from-red-100 to-red-200 border-red-300';
      case 'high': return 'from-orange-100 to-orange-200 border-orange-300';
      case 'medium': return 'from-yellow-100 to-yellow-200 border-yellow-300';
      default: return 'from-blue-100 to-blue-200 border-blue-300';
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getSeverityColor()} flex items-center justify-center z-50`}>
      <div className="max-w-md mx-auto p-8 text-center">
        {/* Icône d'erreur */}
        <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 ${getIconColor()}`}>
          <AlertTriangle className="w-10 h-10" />
        </div>

        {/* Titre */}
        <h1 className={`text-2xl font-bold mb-4 ${getIconColor()}`}>
          {maxRetriesReached ? 'Erreur Critique' : 'Problème Technique'}
        </h1>

        {/* Description de l'erreur */}
        <div className="bg-white/80 rounded-lg p-4 mb-6">
          <p className="text-gray-800 text-sm font-medium mb-2">Détails de l'erreur :</p>
          <p className="text-gray-600 text-sm break-words">{error}</p>
          
          {retryCount > 0 && (
            <p className="text-gray-500 text-xs mt-2">
              Tentatives échouées: {retryCount}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Retry si pas de limite atteinte */}
          {!maxRetriesReached && onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className={`w-full ${
                severity === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                severity === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                severity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={false}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer ({3 - retryCount} tentatives restantes)
            </Button>
          )}

          {/* Rechargement de la page */}
          <Button
            onClick={handleReload}
            variant="outline"
            className="w-full border-gray-400 text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Recharger la page
          </Button>

          {/* Informations de débogage si erreur critique */}
          {maxRetriesReached && (
            <div className="mt-6 p-4 bg-white/90 rounded-lg text-left">
              <div className="flex items-center space-x-2 mb-2">
                <Bug className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Informations de débogage</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• URL: {window.location.href}</p>
                <p>• Navigateur: {navigator.userAgent.split(' ')[0]}</p>
                <p>• Heure: {new Date().toLocaleString()}</p>
                <p>• Tentatives: {retryCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Conseils de dépannage */}
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2 font-medium">Suggestions:</p>
          <ul className="text-xs space-y-1 text-left">
            <li>• Vérifiez votre connexion internet</li>
            <li>• Rechargez la page</li>
            {maxRetriesReached && (
              <>
                <li>• Contactez l'assistance technique</li>
                <li>• Vérifiez l'état des services</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;