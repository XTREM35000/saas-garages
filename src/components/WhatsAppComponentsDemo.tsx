import React, { useState } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { WhatsAppFormField } from '@/components/ui/whatsapp-form-field';
import { WhatsAppCard, WhatsAppCardHeader, WhatsAppCardContent, WhatsAppCardFooter } from '@/components/ui/whatsapp-card';
import { Crown, Star, Zap, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const WhatsAppComponentsDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5 p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-[#128C7E] mb-4">
            Composants WhatsApp Unifiés
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Démonstration de tous les composants UI unifiés avec le thème WhatsApp,
            animations fluides et design responsive mobile-first
          </p>
        </div>

        {/* Grille des composants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* WhatsAppButton Demo */}
          <WhatsAppCard shadow="lg" className="overflow-hidden">
            <WhatsAppCardHeader gradient={true}>
              <h3 className="text-2xl font-bold text-white">WhatsAppButton</h3>
              <p className="text-white/90">Boutons avec variantes et animations</p>
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
                <WhatsAppButton variant="danger" size="sm" fullWidth>
                  Danger
                </WhatsAppButton>
              </div>
            </WhatsAppCardContent>
          </WhatsAppCard>

          {/* WhatsAppFormField Demo */}
          <WhatsAppCard shadow="lg">
            <WhatsAppCardHeader>
              <h3 className="text-2xl font-bold text-[#128C7E]">WhatsAppFormField</h3>
              <p className="text-gray-600">Champs de formulaire avec validation</p>
            </WhatsAppCardHeader>
            <WhatsAppCardContent>
              <div className="space-y-4">
                <WhatsAppFormField
                  label="Nom complet"
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleFieldChange('name', value)}
                  placeholder="Votre nom complet"
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
                <WhatsAppFormField
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => handleFieldChange('phone', value)}
                  placeholder="+33 6 12 34 56 78"
                  required={false}
                />
              </div>
            </WhatsAppCardContent>
          </WhatsAppCard>
        </div>

        {/* WhatsAppCard Demo */}
        <div className="mb-12">
          <WhatsAppCard shadow="xl" className="overflow-hidden">
            <WhatsAppCardHeader gradient={true}>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-2">WhatsAppCard</h3>
                <p className="text-white/90">Cartes avec animations et thème WhatsApp</p>
              </div>
            </WhatsAppCardHeader>
            <WhatsAppCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WhatsAppCard shadow="md" hover={true} className="text-center">
                  <WhatsAppCardContent>
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Gratuit</h4>
                    <p className="text-gray-600 text-sm">Plan de base avec fonctionnalités essentielles</p>
                  </WhatsAppCardContent>
                </WhatsAppCard>

                <WhatsAppCard shadow="md" hover={true} className="text-center border-2 border-[#128C7E]">
                  <WhatsAppCardContent>
                    <div className="w-16 h-16 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Mensuel</h4>
                    <p className="text-gray-600 text-sm">Plan populaire avec toutes les fonctionnalités</p>
                  </WhatsAppCardContent>
                </WhatsAppCard>

                <WhatsAppCard shadow="md" hover={true} className="text-center">
                  <WhatsAppCardContent>
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Annuel</h4>
                    <p className="text-gray-600 text-sm">Plan premium avec support VIP et API</p>
                  </WhatsAppCardContent>
                </WhatsAppCard>
              </div>
            </WhatsAppCardContent>
            <WhatsAppCardFooter>
              <div className="flex justify-center">
                <WhatsAppButton variant="primary" size="lg">
                  Voir tous les plans
                </WhatsAppButton>
              </div>
            </WhatsAppCardFooter>
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
            Fonctionnalités à Tester
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🎨 Design & Thème</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Couleurs WhatsApp (#128C7E, #25D366)</li>
                <li>• Gradients et ombres cohérents</li>
                <li>• Animations fluides avec Framer Motion</li>
                <li>• Typographie et espacement harmonieux</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">📱 Responsive & Mobile</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Design mobile-first</li>
                <li>• Modaux draggables verticalement</li>
                <li>• Interactions tactiles optimisées</li>
                <li>• Breakpoints adaptatifs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsAppModal Demo */}
      <WhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Démonstration WhatsAppModal"
        description="Modal draggable vertical avec thème WhatsApp unifié"
        size="xl"
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
              Ce modal démontre toutes les fonctionnalités du système unifié
            </p>
          </div>

          <WhatsAppFormField
            label="Nom d'utilisateur"
            type="text"
            value={formData.name}
            onChange={(value) => handleFieldChange('name', value)}
            placeholder="Entrez votre nom"
            required={true}
          />

          <WhatsAppFormField
            label="Email professionnel"
            type="email"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
            placeholder="votre@entreprise.com"
            required={true}
          />

          <div className="flex gap-4">
            <WhatsAppButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Annuler
            </WhatsAppButton>
            <WhatsAppButton
              variant="primary"
              onClick={handleSubmit}
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

export default WhatsAppComponentsDemo;
