import React, { useState } from 'react';
import { BaseModal } from '@/components/ui/base-modal';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ModalButton } from '@/components/ui/modal-button';
import { Button } from '@/components/ui/button';
import {
  Car,
  Wrench,
  Settings,
  Building,
  Users,
  Shield,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ModalDemo: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démonstration des Modaux Améliorés
          </h1>
          <p className="text-lg text-gray-600">
            Testez les nouvelles fonctionnalités des formulaires modaux du workflow
          </p>
        </div>

        {/* Grille de boutons pour ouvrir les modaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Super Admin Modal */}
          <Button
            onClick={() => openModal('super-admin')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <Shield className="w-8 h-8" />
            <span className="font-semibold">Super Admin</span>
            <span className="text-sm opacity-90">Configuration principale</span>
          </Button>

          {/* Organisation Modal */}
          <Button
            onClick={() => openModal('organization')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Building className="w-8 h-8" />
            <span className="font-semibold">Organisation</span>
            <span className="text-sm opacity-90">Multi-garages</span>
          </Button>

          {/* Garage Modal */}
          <Button
            onClick={() => openModal('garage')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Car className="w-8 h-8" />
            <span className="font-semibold">Garage</span>
            <span className="text-sm opacity-90">Configuration garage</span>
          </Button>

          {/* Admin Modal */}
          <Button
            onClick={() => openModal('admin')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            <Users className="w-8 h-8" />
            <span className="font-semibold">Administrateur</span>
            <span className="text-sm opacity-90">Gestion équipe</span>
          </Button>

          {/* Settings Modal */}
          <Button
            onClick={() => openModal('settings')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            <Settings className="w-8 h-8" />
            <span className="font-semibold">Paramètres</span>
            <span className="text-sm opacity-90">Configuration système</span>
          </Button>

          {/* Long Content Modal */}
          <Button
            onClick={() => openModal('long-content')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            <Wrench className="w-8 h-8" />
            <span className="font-semibold">Contenu Long</span>
            <span className="text-sm opacity-90">Test scroll</span>
          </Button>
        </div>

        {/* Informations sur les améliorations */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Améliorations Implémentées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Positionnement Automatique</h3>
                  <p className="text-gray-600">Le modal se positionne pour afficher tout le header avec un léger écart</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Scroll Contrôlé</h3>
                  <p className="text-gray-600">Le défilement s'arrête au header et footer du modal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Charte Graphique</h3>
                  <p className="text-gray-600">Respect strict de la charte graphique avec dégradés et animations</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Logo Animé</h3>
                  <p className="text-gray-600">Header avec logo animé expressif et couleurs dégradées</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Champs Visibles</h3>
                  <p className="text-gray-600">Champs bien visibles avec validation en temps réel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Bords Arrondis</h3>
                  <p className="text-gray-600">Design moderne avec bords arrondis et ombres</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modaux */}

        {/* Super Admin Modal */}
        <BaseModal
          isOpen={activeModal === 'super-admin'}
          onClose={closeModal}
          title="Configuration Super-Admin"
          subtitle="Création du compte administrateur principal"
          headerGradient="from-green-500 to-green-600"
          logoSize={60}
        >
          <div className="space-y-6">
            <ModalFormField
              id="name"
              label="Nom complet"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Prénom Nom"
              required
              icon={<Users className="w-4 h-4" />}
            />
            <ModalFormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              placeholder="admin@exemple.com"
              required
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <ModalButton
              onClick={closeModal}
              icon={<Shield className="w-5 h-5" />}
            >
              Créer le Super-Admin
            </ModalButton>
          </div>
        </BaseModal>

        {/* Organisation Modal */}
        <BaseModal
          isOpen={activeModal === 'organization'}
          onClose={closeModal}
          title="Création d'Organisation"
          subtitle="Configurez votre organisation multi-garages"
          headerGradient="from-blue-500 to-blue-600"
          logoSize={60}
        >
          <div className="space-y-6">
            <ModalFormField
              id="org-name"
              label="Nom de l'organisation"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Mon Organisation"
              required
              icon={<Building className="w-4 h-4" />}
            />
            <ModalFormField
              id="org-email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              placeholder="contact@organisation.com"
              required
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <ModalButton
              onClick={closeModal}
              icon={<Building className="w-5 h-5" />}
            >
              Créer l'Organisation
            </ModalButton>
          </div>
        </BaseModal>

        {/* Garage Modal */}
        <BaseModal
          isOpen={activeModal === 'garage'}
          onClose={closeModal}
          title="Configuration Garage"
          subtitle="Ajoutez un nouveau garage à votre organisation"
          headerGradient="from-purple-500 to-purple-600"
          logoSize={60}
        >
          <div className="space-y-6">
            <ModalFormField
              id="garage-name"
              label="Nom du garage"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Garage Central"
              required
              icon={<Car className="w-4 h-4" />}
            />
            <ModalFormField
              id="garage-phone"
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
              placeholder="01 23 45 67 89"
              required
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <ModalButton
              onClick={closeModal}
              icon={<Car className="w-5 h-5" />}
            >
              Créer le Garage
            </ModalButton>
          </div>
        </BaseModal>

        {/* Admin Modal */}
        <BaseModal
          isOpen={activeModal === 'admin'}
          onClose={closeModal}
          title="Ajout d'Administrateur"
          subtitle="Gérez les accès de votre équipe"
          headerGradient="from-orange-500 to-orange-600"
          logoSize={60}
        >
          <div className="space-y-6">
            <ModalFormField
              id="admin-name"
              label="Nom de l'administrateur"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Prénom Nom"
              required
              icon={<Users className="w-4 h-4" />}
            />
            <ModalFormField
              id="admin-email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              placeholder="admin@garage.com"
              required
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <ModalButton
              onClick={closeModal}
              icon={<Users className="w-5 h-5" />}
            >
              Ajouter l'Administrateur
            </ModalButton>
          </div>
        </BaseModal>

        {/* Settings Modal */}
        <BaseModal
          isOpen={activeModal === 'settings'}
          onClose={closeModal}
          title="Paramètres Système"
          subtitle="Configurez les options de votre plateforme"
          headerGradient="from-gray-500 to-gray-600"
          logoSize={60}
        >
          <div className="space-y-6">
            <ModalFormField
              id="setting-name"
              label="Nom du paramètre"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Configuration"
              required
              icon={<Settings className="w-4 h-4" />}
            />
            <ModalFormField
              id="setting-value"
              label="Valeur"
              value={formData.description}
              onChange={(value) => handleFieldChange('description', value)}
              placeholder="Valeur du paramètre"
              required
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <ModalButton
              onClick={closeModal}
              icon={<Settings className="w-5 h-5" />}
            >
              Sauvegarder
            </ModalButton>
          </div>
        </BaseModal>

        {/* Long Content Modal - Test de scroll */}
        <BaseModal
          isOpen={activeModal === 'long-content'}
          onClose={closeModal}
          title="Test de Contenu Long"
          subtitle="Démonstration du scroll contrôlé"
          headerGradient="from-red-500 to-red-600"
          logoSize={60}
          maxWidth="max-w-lg"
        >
          <div className="space-y-6">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Section {i + 1}
                </h3>
                <p className="text-gray-600">
                  Ceci est un contenu de test pour démontrer le comportement du scroll dans les modaux.
                  Le scroll doit s'arrêter au header et au footer du modal.
                </p>
                <div className="mt-3">
                  <ModalFormField
                    id={`field-${i}`}
                    label={`Champ ${i + 1}`}
                    value=""
                    onChange={() => {}}
                    placeholder={`Placeholder ${i + 1}`}
                    icon={<Wrench className="w-4 h-4" />}
                  />
                </div>
              </div>
            ))}
            <ModalButton
              onClick={closeModal}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Fermer le Test
            </ModalButton>
          </div>
        </BaseModal>
      </div>
    </div>
  );
};
