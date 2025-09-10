import React from 'react';
import { Loader2, Database, Shield, Cog } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Chargement...', 
  progress 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8">
        {/* Logo animé */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-white" />
          </div>
          
          {/* Icônes satellites animées */}
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -left-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse delay-75">
              <Cog className="w-3 h-3 text-white animate-spin" />
            </div>
          </div>
        </div>

        {/* Spinner principal */}
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg font-medium text-blue-900">{message}</span>
        </div>

        {/* Barre de progression si fournie */}
        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-sm text-blue-700 mt-2">{Math.round(progress)}% complété</p>
          </div>
        )}

        {/* Messages d'état */}
        <div className="max-w-md mx-auto">
          <p className="text-sm text-blue-600">
            Vérification de l'intégrité du système...
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;