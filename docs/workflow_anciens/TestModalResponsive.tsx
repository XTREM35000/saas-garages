import React, { useState } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { useBreakpointDragConstraints } from '@/hooks/useResponsiveDragConstraints';

/**
 * Composant de test pour vérifier le responsive du modal
 */
export const TestModalResponsive: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const constraints = useBreakpointDragConstraints();

  return (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#128C7E] mb-4">
          Test Modal Responsive
        </h1>
        <p className="text-gray-600 mb-6">
          Testez le modal draggable sur différents écrans
        </p>
      </div>

      {/* Informations sur les contraintes actuelles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          Contraintes de Drag Actuelles
        </h3>
        <div className="text-sm text-blue-700">
          <p><strong>Top:</strong> {constraints.top}px</p>
          <p><strong>Bottom:</strong> {constraints.bottom}px</p>
          <p><strong>Écran:</strong> {window.innerWidth} x {window.innerHeight}</p>
        </div>
      </div>

      {/* Bouton pour ouvrir le modal */}
      <div className="text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white px-8 py-4 rounded-xl hover:from-[#075E54] hover:to-[#128C7E] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Ouvrir Modal Test
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">
          Instructions de Test
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Redimensionnez votre navigateur pour tester le responsive</li>
          <li>• Faites glisser le modal vers le haut et le bas</li>
          <li>• Vérifiez que le header reste visible</li>
          <li>• Testez sur mobile (DevTools)</li>
        </ul>
      </div>

      {/* Modal de test */}
      <WhatsAppModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Modal Responsive"
        description="Testez le drag et le responsive sur différents écrans"
        size="xl"
        showSuperAdminIndicator={true}
      >
        <div className="space-y-6">
          {/* Contenu de test avec beaucoup d'éléments */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Modal de Test Responsive
            </h3>
            <p className="text-gray-600">
              Ce modal teste le comportement draggable et responsive
            </p>
          </div>

          {/* Sections de test */}
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                Section de Test {index + 1}
              </h4>
              <p className="text-gray-600 text-sm">
                Cette section permet de tester le scroll et le drag du modal.
                Faites glisser vers le haut pour voir le footer, et vers le bas pour voir le header.
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Tag {index + 1}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Test
                </span>
              </div>
            </div>
          ))}

          {/* Bouton de fermeture */}
          <div className="text-center pt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Fermer le Test
            </button>
          </div>
        </div>
      </WhatsAppModal>
    </div>
  );
};

export default TestModalResponsive;
