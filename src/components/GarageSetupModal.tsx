import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Building, MapPin, Clock, Phone, Shield, AlertCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/base-modal';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ModalButton } from '@/components/ui/modal-button';
import { PhoneField } from '@/components/ui/phone-field';

interface GarageSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  organizationName?: string;
}

interface FormData {
  name: { value: string; error: string; isValid: boolean };
  address: { value: string; error: string; isValid: boolean };
  phone: { value: string; error: string; isValid: boolean };
  openingHours: { value: string; error: string; isValid: boolean };
  description: { value: string; error: string; isValid: boolean };
}

const GarageSetupModal: React.FC<GarageSetupModalProps> = ({
  isOpen,
  onComplete,
  organizationName = 'Mon Garage'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: { value: '', error: '', isValid: false },
    address: { value: '', error: '', isValid: false },
    phone: { value: '', error: '', isValid: true },
    openingHours: { value: '', error: '', isValid: true },
    description: { value: '', error: '', isValid: true }
  });

  const validateField = (field: keyof FormData, value: string): { isValid: boolean; error: string } => {
    switch (field) {
      case 'name':
        return {
          isValid: value.trim().length >= 2,
          error: value.trim().length < 2 ? "Le nom doit contenir au moins 2 caractères" : ""
        };
      case 'address':
        return {
          isValid: value.trim().length >= 5,
          error: value.trim().length < 5 ? "L'adresse doit contenir au moins 5 caractères" : ""
        };
      case 'phone':
        return { isValid: true, error: "" }; // optionnel
      case 'openingHours':
        return { isValid: true, error: "" }; // optionnel
      case 'description':
        return { isValid: true, error: "" }; // optionnel
      default:
        return { isValid: false, error: "" };
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const validation = validateField(field, value);
    setFormData(prev => ({
      ...prev,
      [field]: { value, error: validation.error, isValid: validation.isValid }
    }));
  };

  const isFormValid = () => {
    return formData.name.isValid && formData.address.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.rpc('setup_garage', {
        garage_name: formData.name.value,
        garage_address: formData.address.value,
        garage_phone: formData.phone.value,
        garage_opening_hours: formData.openingHours.value,
        garage_description: formData.description.value
      });

      if (error) throw error;

      toast.success('Configuration du garage terminée !');
      onComplete();

    } catch (error: any) {
      console.error('❌ Erreur configuration garage:', error);
      toast.error(error.message || 'Erreur lors de la configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onComplete}
      title="Configuration du Garage"
      subtitle="Renseignez les informations de votre établissement"
      maxWidth="max-w-lg"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom du garage */}
        <ModalFormField
          id="name"
          label="Nom du garage"
          type="text"
          value={formData.name.value}
          onChange={(value) => handleFieldChange("name", value)}
          placeholder="Auto Services Plus"
          error={formData.name.error}
          isValid={formData.name.isValid}
          disabled={isSubmitting}
          required
          icon={<Building className="w-4 h-4" />}
        />

        {/* Adresse */}
        <ModalFormField
          id="address"
          label="Adresse"
          type="text"
          value={formData.address.value}
          onChange={(value) => handleFieldChange("address", value)}
          placeholder="123 Rue de la Paix, 75001 Paris"
          error={formData.address.error}
          isValid={formData.address.isValid}
          disabled={isSubmitting}
          required
          icon={<MapPin className="w-4 h-4" />}
        />

        {/* Téléphone */}
        <PhoneField
          label="Téléphone (optionnel)"
          value={formData.phone.value}
          onChange={(value) => handleFieldChange("phone", value)}
          error={formData.phone.error}
          disabled={isSubmitting}
        />

        {/* Horaires d'ouverture */}
        <ModalFormField
          id="openingHours"
          label="Horaires d'ouverture (optionnel)"
          type="text"
          value={formData.openingHours.value}
          onChange={(value) => handleFieldChange("openingHours", value)}
          placeholder="Lun-Ven: 8h-18h, Sam: 8h-12h"
          error={formData.openingHours.error}
          isValid={formData.openingHours.isValid}
          disabled={isSubmitting}
          icon={<Clock className="w-4 h-4" />}
        />

        {/* Description */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Description (optionnel)
          </label>
          <textarea
            id="description"
            value={formData.description.value}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Description de votre garage..."
            disabled={isSubmitting}
            rows={3}
            className={`
              modal-input resize-none
              ${formData.description.error ? 'border-red-500 focus:ring-red-500' : ''}
              ${formData.description.isValid && !formData.description.error ? 'border-green-500 focus:ring-green-500' : ''}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        </div>

        {/* Bouton de soumission */}
        <ModalButton
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          loading={isSubmitting}
          loadingText="Configuration en cours..."
          icon={<Shield className="w-5 h-5" />}
        >
          Configurer le Garage
        </ModalButton>

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Configuration garage</p>
              <p>Ces informations seront utilisées pour configurer votre espace de travail et vos services.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default GarageSetupModal;