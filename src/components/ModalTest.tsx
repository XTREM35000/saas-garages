import React, { useState } from 'react';
import { BaseModal } from './ui/base-modal';
import { ModalFormField } from './ui/modal-form-field';
import { ModalButton } from './ui/modal-button';
import { Button } from './ui/button';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';

export const ModalTest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test des Modaux Améliorés
        </h1>
        <p className="text-gray-600 mb-8">
          Cliquez sur le bouton ci-dessous pour tester le modal
        </p>

        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Ouvrir le Modal de Test
        </Button>

        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Test Modal"
          subtitle="Démonstration des améliorations"
          headerGradient="from-blue-500 to-blue-600"
          logoSize={50}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <ModalFormField
              id="name"
              label="Nom complet"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Votre nom"
              required
              icon={<User className="w-4 h-4" />}
            />

            <ModalFormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              placeholder="votre@email.com"
              required
              icon={<Mail className="w-4 h-4" />}
            />

            <ModalFormField
              id="phone"
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
              placeholder="06 12 34 56 78"
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Test des fonctionnalités</p>
                  <p>Ce modal démontre le positionnement automatique, le scroll contrôlé et la charte graphique.</p>
                </div>
              </div>
            </div>

            <ModalButton
              type="submit"
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Soumettre le Test
            </ModalButton>
          </form>
        </BaseModal>
      </div>
    </div>
  );
};
