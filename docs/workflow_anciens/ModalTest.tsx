import React, { useState } from 'react';
import PricingModal from './PricingModal';

const ModalTest: React.FC = () => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    console.log('Plan sélectionné:', planId);
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPricingOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#128C7E] mb-4">
            Test des Composants WhatsApp
          </h1>
          <p className="text-gray-600 text-lg">
            Testez le nouveau PricingModal avec le thème WhatsApp unifié
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test PricingModal */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-[#128C7E] mb-3">
              PricingModal WhatsApp
            </h3>
            <p className="text-gray-600 mb-4">
              Modal avec thème WhatsApp, draggable vertical, et composants unifiés
            </p>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white px-6 py-3 rounded-xl hover:from-[#075E54] hover:to-[#128C7E] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ouvrir PricingModal
            </button>
          </div>

          {/* Informations sur les composants */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-[#128C7E] mb-3">
              Composants Unifiés
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>✅ WhatsAppModal - Modal draggable</li>
              <li>✅ WhatsAppButton - Boutons avec variantes</li>
              <li>✅ WhatsAppCard - Cartes avec animations</li>
              <li>✅ WhatsAppFormField - Champs de formulaire</li>
              <li>✅ Thème WhatsApp cohérent</li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Instructions de Test
          </h3>
          <ul className="text-blue-700 space-y-2">
            <li>• Cliquez sur "Ouvrir PricingModal" pour tester le nouveau modal</li>
            <li>• Essayez de faire glisser le modal vers le haut et le bas</li>
            <li>• Observez le thème WhatsApp unifié (couleurs, gradients)</li>
            <li>• Testez la responsivité sur différentes tailles d'écran</li>
            <li>• Vérifiez les animations et transitions fluides</li>
          </ul>
        </div>
      </div>

      {/* PricingModal */}
      <PricingModal
        isOpen={isPricingOpen}
        onSelectPlan={handlePlanSelect}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
};

export default ModalTest;
