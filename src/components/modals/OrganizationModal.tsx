import React, { useState } from 'react';
import { Building, MapPin, Globe, Users, Shield, CheckCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/base-modal';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ModalButton } from '@/components/ui/modal-button';
import { EmailField } from '@/components/ui/email-field';
import { PhoneField } from '@/components/ui/phone-field';
import { toast } from 'sonner';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (organizationData: any) => void;
}

interface FormData {
  name: { value: string; error: string; isValid: boolean };
  address: { value: string; error: string; isValid: boolean };
  phone: { value: string; error: string; isValid: boolean };
  email: { value: string; error: string; isValid: boolean };
  website: { value: string; error: string; isValid: boolean };
  description: { value: string; error: string; isValid: boolean };
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: { value: '', error: '', isValid: false },
    address: { value: '', error: '', isValid: false },
    phone: { value: '', error: '', isValid: false },
    email: { value: '', error: '', isValid: false },
    website: { value: '', error: '', isValid: true },
    description: { value: '', error: '', isValid: true }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return {
          isValid: phoneRegex.test(value),
          error: !phoneRegex.test(value) ? "Numéro de téléphone invalide" : ""
        };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          error: !emailRegex.test(value) ? "Email invalide" : ""
        };
      case 'website':
        if (!value) return { isValid: true, error: "" };
        const urlRegex = /^https?:\/\/.+/;
        return {
          isValid: urlRegex.test(value),
          error: !urlRegex.test(value) ? "URL invalide (doit commencer par http:// ou https://)" : ""
        };
      case 'description':
        return {
          isValid: value.length <= 500,
          error: value.length > 500 ? "La description ne peut pas dépasser 500 caractères" : ""
        };
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
    return Object.values(formData).every(field => field.isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulation d'une création d'organisation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const organizationData = {
        name: formData.name.value,
        address: formData.address.value,
        phone: formData.phone.value,
        email: formData.email.value,
        website: formData.website.value,
        description: formData.description.value
      };

      toast.success("Organisation créée avec succès !");
      onComplete(organizationData);
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création de l'organisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Création d'Organisation"
      subtitle="Configurez votre organisation multi-garages"
      maxWidth="max-w-lg"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom de l'organisation */}
        <ModalFormField
          id="name"
          label="Nom de l'organisation"
          type="text"
          value={formData.name.value}
          onChange={(value) => handleFieldChange("name", value)}
          placeholder="Mon Organisation"
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
          label="Téléphone"
          value={formData.phone.value}
          onChange={(value) => handleFieldChange("phone", value)}
          error={formData.phone.error}
          disabled={isSubmitting}
          required
        />

        {/* Email */}
        <EmailField
          label="Email"
          value={formData.email.value}
          onChange={(value) => handleFieldChange("email", value)}
          error={formData.email.error}
          disabled={isSubmitting}
          required
        />

        {/* Site web */}
        <ModalFormField
          id="website"
          label="Site web (optionnel)"
          type="url"
          value={formData.website.value}
          onChange={(value) => handleFieldChange("website", value)}
          placeholder="https://www.organisation.com"
          error={formData.website.error}
          isValid={formData.website.isValid}
          disabled={isSubmitting}
          icon={<Globe className="w-4 h-4" />}
        />

        {/* Description */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Description (optionnel)
          </label>
          <textarea
            id="description"
            value={formData.description.value}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Description de votre organisation..."
            disabled={isSubmitting}
            rows={3}
            className={`
              modal-input resize-none
              ${formData.description.error ? 'border-red-500 focus:ring-red-500' : ''}
              ${formData.description.isValid && !formData.description.error ? 'border-green-500 focus:ring-green-500' : ''}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{formData.description.value.length}/500 caractères</span>
            {formData.description.error && (
              <span className="text-red-500">{formData.description.error}</span>
            )}
          </div>
        </div>

        {/* Bouton de soumission */}
        <ModalButton
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          loading={isSubmitting}
          loadingText="Création en cours..."
          icon={<Shield className="w-5 h-5" />}
        >
          Créer l'organisation
        </ModalButton>

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Organisation multi-garages</p>
              <p>Cette organisation pourra gérer plusieurs garages et leurs équipes respectives.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};
