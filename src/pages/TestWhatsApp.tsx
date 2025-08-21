import React, { useState } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { WhatsAppFormField } from '@/components/ui/whatsapp-form-field';
import { WhatsAppCard, WhatsAppCardHeader, WhatsAppCardContent } from '@/components/ui/whatsapp-card';
import { Crown, Star, Zap, CheckCircle } from 'lucide-react';

const TestWhatsApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5 p-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-[#128C7E] mb-4">
            Test Composants WhatsApp
          </h1>
          <p className="text-gray-600 text-xl">
            Page de test pour voir les composants unifiés en action
          </p>
        </div>

        {/* Grille de test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Test WhatsAppButton */}
          <WhatsAppCard shadow="lg" className="overflow-hidden">
            <WhatsAppCardHeader gradient={true}>
              <h3 className="text-2xl font-bold text-white">WhatsAppButton</h3>
              <p className="text-white/90">Boutons avec variantes</p>
            </WhatsAppCardHeader>
            <WhatsAppCardContent>
              <div className="space-y-4">
                <WhatsAppButton variant="primary" size="lg" fullWidth>
                  Bouton Principal
                </WhatsAppButton>
                <WhatsAppButton variant="secondary" size="md" fullWidth>
                  Bouton Secondaire
                </WhatsAppButton>
                <WhatsAppButton variant="success" size="md" fullWidth>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Succès
                </WhatsAppButton>
                <WhatsAppButton variant="outline" size="md" fullWidth>
                  Bouton Contour
                </WhatsAppButton>
              </div>
            </WhatsAppCardContent>
          </WhatsAppCard>

          {/* Test WhatsAppFormField */}
          <WhatsAppCard shadow="lg">
            <WhatsAppCardHeader>
              <h3 className="text-2xl font-bold text-[#128C7E]">WhatsAppFormField</h3>
              <p className="text-gray-600">Champs de formulaire</p>
            </WhatsAppCardHeader>
            <WhatsAppCardContent>
              <div className="space-y-4">
                <WhatsAppFormField
                  label="Nom complet"
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleFieldChange('name', value)}
                  placeholder="Votre nom"
                  required={true}
                  isValid={formData.name.length >= 2}
                />
                <WhatsAppFormField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleFieldChange('email', value)}
                  placeholder="votre@email.com"
                  required={true}
                  isValid={formData.email.includes('@')}
                />
                <WhatsAppFormField
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(value) => handleFieldChange('password', value)}
                  placeholder="Minimum 8 caractères"
                  required={true}
                  isValid={formData.password.length >= 8}
                />
              </div>
            </WhatsAppCardContent>
          </WhatsAppCard>
        </div>

        {/* Bouton pour ouvrir le modal */}
        <div className="text-center">
          <WhatsAppButton
            variant="primary"
            size="xl"
            onClick={() => setIsModalOpen(true)}
            className="px-12 py-6 text-xl"
          >
            <Crown className="w-6 h-6 mr-3" />
            Tester WhatsAppModal
          </WhatsAppButton>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-[#128C7E] mb-4 text-center">
            Instructions de Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🎨 Design & Thème</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Couleurs WhatsApp (#128C7E, #25D366)</li>
                <li>• Gradients et ombres cohérents</li>
                <li>• Animations fluides</li>
                <li>• Typographie harmonieuse</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">📱 Responsive & Mobile</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Design mobile-first</li>
                <li>• Modal draggable vertical</li>
                <li>• Interactions tactiles</li>
                <li>• Breakpoints adaptatifs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsAppModal de test */}
      <WhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test WhatsAppModal"
        description="Modal draggable avec thème WhatsApp"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Modal WhatsApp Unifié
            </h3>
            <p className="text-gray-600">
              Ce modal démontre le thème WhatsApp et le système draggable
            </p>
          </div>

          <div className="flex gap-4">
            <WhatsAppButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Fermer
            </WhatsAppButton>
            <WhatsAppButton
              variant="primary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Confirmer
            </WhatsAppButton>
          </div>
        </div>
      </WhatsAppModal>
    </div>
  );
};

export default TestWhatsApp;
