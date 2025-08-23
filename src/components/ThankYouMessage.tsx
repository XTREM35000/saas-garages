import React, { useEffect, useState } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { CheckCircle, Crown, Star, Zap } from 'lucide-react';

interface ThankYouMessageProps {
  isOpen: boolean;
  selectedPlan: string;
  superAdminInfo: {
    name: string;
    phone: string;
  };
  onContinue: () => void;
}

const planDetails = {
  free: {
    name: 'Gratuit',
    icon: Star,
    color: 'from-green-400 to-green-600',
    features: ['1 garage seulement', 'Gestion de base', 'Jusqu\'à 3 utilisateurs']
  },
  monthly: {
    name: 'Mensuel',
    icon: Zap,
    color: 'from-[#128C7E] to-[#075E54]',
    features: ['1 organisation', '3 instances maximum', 'Utilisateurs illimités']
  },
  annual: {
    name: 'Annuel',
    icon: Crown,
    color: 'from-purple-500 to-purple-700',
    features: ['Organisations multiples', 'Instances illimitées', 'Support VIP 24/7']
  }
};

export const ThankYouMessage: React.FC<ThankYouMessageProps> = ({
  isOpen,
  selectedPlan,
  superAdminInfo,
  onContinue
}) => {
  const [showContinue, setShowContinue] = useState(false);
  const plan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails.monthly;

  useEffect(() => {
    if (isOpen) {
      // Afficher le bouton continuer après 3 secondes
      const timer = setTimeout(() => {
        setShowContinue(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={() => {}}
      title="🎉 Merci pour votre confiance !"
      description="Votre plan a été sélectionné avec succès"
      size="lg"
    >
      <div className="text-center space-y-6">
        {/* Icône du plan */}
        <div className={`w-24 h-24 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
          <plan.icon className="w-12 h-12 text-white" />
        </div>

        {/* Message de remerciement */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Plan {plan.name} sélectionné !
          </h3>
          <p className="text-gray-600">
            Merci pour votre confiance. Votre compte sera activé dans quelques instants.
          </p>
        </div>

        {/* Détails du plan */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Votre plan inclut :</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Informations du Super Admin */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Super Administrateur de référence :</h4>
          <div className="text-sm text-blue-800">
            <p><strong>Nom :</strong> {superAdminInfo.name}</p>
            <p><strong>Téléphone :</strong> {superAdminInfo.phone}</p>
            <p className="text-xs text-blue-600 mt-1">
              Ce Super Admin supervise tous les paiements et peut vous assister si nécessaire.
            </p>
          </div>
        </div>

        {/* Explication du rôle Admin */}
        <div className="bg-[#128C7E]/5 rounded-xl p-4 border border-[#128C7E]/20">
          <h4 className="font-semibold text-[#128C7E] mb-2">🎯 Prochaine étape : Création de l'Administrateur</h4>
          <div className="text-sm text-[#128C7E] space-y-2">
            <p>L'administrateur que vous allez créer sera responsable de :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gérer l'organisation selon votre plan <strong>{plan.name}</strong></li>
              <li>Configurer les garages et services</li>
              <li>Gérer les utilisateurs et permissions</li>
              <li>Accéder aux rapports et analytics</li>
              <li>Configurer les domaines et sous-domaines</li>
            </ul>
            <p className="text-xs mt-2 font-medium">
              Cet administrateur aura tous les droits de gestion sur votre organisation.
            </p>
          </div>
        </div>

        {/* Bouton continuer */}
        {showContinue && (
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white py-3 px-6 rounded-xl hover:from-[#075E54] hover:to-[#128C7E] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Continuer vers la création d'Administrateur →
          </button>
        )}

        {/* Indicateur de chargement */}
        {!showContinue && (
          <div className="text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin"></div>
              <span>Préparation en cours...</span>
            </div>
          </div>
        )}
      </div>
    </WhatsAppModal>
  );
};

export default ThankYouMessage;
