import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { DraggableFormModal } from '@/components/ui/draggable-form-modal';
import { EnhancedAuthForm } from '@/components/EnhancedAuthForm';

interface InitializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
}

export const InitializationModal: React.FC<InitializationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const handleSuccess = (userData: any) => {
    // Appeler le callback de succès
    onSuccess(userData);
  };

  const handleError = (error: string) => {
    // Appeler le callback d'erreur
    onError(error);
  };

  return (
    <DraggableFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration Initialisation"
      description="Première configuration du système - Création du Super Administrateur"
      theme="whatsapp"
      draggable={true}
      showSuperAdminIndicator={true}
      className="min-h-[140vh]"
    >
      <div className="space-y-8">
        {/* En-tête avec informations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-yellow-900" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue dans votre espace de gestion
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Créez votre compte Super Administrateur pour commencer à configurer votre système de gestion multi-garages.
              Vous pourrez ensuite créer des organisations, des administrateurs et configurer vos garages.
            </p>
          </div>
        </motion.div>

        {/* Avantages du Super Admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-[#128C7E]/5 to-[#25D366]/5 rounded-2xl p-6 border border-[#128C7E]/20"
        >
          <h4 className="text-lg font-semibold text-[#128C7E] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Privilèges Super Administrateur
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Gestion complète</div>
                <div className="text-sm text-gray-600">Accès à toutes les fonctionnalités du système</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Organisations multiples</div>
                <div className="text-sm text-gray-600">Créer et gérer plusieurs organisations</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Administrateurs</div>
                <div className="text-sm text-gray-600">Nommer des administrateurs pour chaque organisation</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Configuration système</div>
                <div className="text-sm text-gray-600">Paramétrer les options globales et la sécurité</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulaire d'authentification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <EnhancedAuthForm
            showSuperAdminIndicator={true}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </motion.div>

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Sécurité et confidentialité</div>
              <p>
                Vos informations sont protégées par un chiffrement de niveau bancaire.
                Nous ne partageons jamais vos données avec des tiers et respectons strictement le RGPD.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DraggableFormModal>
  );
};
