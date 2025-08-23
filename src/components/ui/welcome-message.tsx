import React from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeMessageProps {
  name: string;
  role: 'super_admin' | 'admin';
  onContinue: () => void;
  className?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  name,
  role,
  onContinue,
  className = ''
}) => {
  const isSuperAdmin = role === 'super_admin';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        duration: 0.6 
      }}
      className={cn(
        "fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 text-center relative overflow-hidden"
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent transform -skew-x-12 animate-pulse-glow" />
        
        <div className="relative z-10">
          {/* Icône animée */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", damping: 15 }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <div className={cn(
              "w-full h-full rounded-full flex items-center justify-center shadow-lg",
              isSuperAdmin 
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500" 
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            )}>
              {isSuperAdmin ? (
                <Crown className="w-10 h-10 text-yellow-900" />
              ) : (
                <CheckCircle className="w-10 h-10 text-white" />
              )}
            </div>
          </motion.div>

          {/* Message de bienvenue */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            Bienvenue {name} ! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-gray-600 mb-6"
          >
            {isSuperAdmin 
              ? "Vous êtes maintenant le Super Administrateur du système avec tous les privilèges de gestion."
              : "L'administrateur a été créé avec succès et peut maintenant gérer l'organisation."
            }
          </motion.p>

          {/* Indicateur de progression */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSuperAdmin 
                  ? "Étape 1 terminée - Passage à la sélection du plan"
                  : "Étape 2 terminée - Passage à la création de l'organisation"
                }
              </span>
            </div>
          </motion.div>

          {/* Bouton continuer */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={onContinue}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95",
              isSuperAdmin
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            )}
          >
            Continuer
            <Sparkles className="w-4 h-4 inline ml-2" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;
