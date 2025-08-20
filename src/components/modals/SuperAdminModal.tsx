import React, { useState } from "react";
import { User, Shield, Building, AlertCircle } from "lucide-react";
import { BaseModal } from "@/components/ui/base-modal";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ModalButton } from "@/components/ui/modal-button";
import { EmailField } from "@/components/ui/email-field";
import { PhoneField } from "@/components/ui/phone-field";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

interface FormData {
  firstName: { value: string; error: string; isValid: boolean };
  lastName: { value: string; error: string; isValid: boolean };
  email: { value: string; error: string; isValid: boolean };
  phone: { value: string; error: string; isValid: boolean };
  company: { value: string; error: string; isValid: boolean };
  role: { value: string; error: string; isValid: boolean };
  notes: { value: string; error: string; isValid: boolean };
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: { value: "", error: "", isValid: false },
    lastName: { value: "", error: "", isValid: false },
    email: { value: "", error: "", isValid: false },
    phone: { value: "", error: "", isValid: true },
    company: { value: "", error: "", isValid: true },
    role: { value: "super_admin", error: "", isValid: true },
    notes: { value: "", error: "", isValid: true }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: keyof FormData, value: string): { isValid: boolean; error: string } => {
    switch (field) {
      case 'firstName':
        return {
          isValid: value.trim().length >= 2,
          error: value.trim().length < 2 ? "Le prénom doit contenir au moins 2 caractères" : ""
        };
      case 'lastName':
        return {
          isValid: value.trim().length >= 2,
          error: value.trim().length < 2 ? "Le nom doit contenir au moins 2 caractères" : ""
        };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          error: !emailRegex.test(value) ? "Email invalide" : ""
        };
      case 'phone':
        return { isValid: true, error: "" }; // optionnel
      case 'company':
        return { isValid: true, error: "" }; // optionnel
      case 'role':
        return { isValid: true, error: "" };
      case 'notes':
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
    return formData.firstName.isValid && formData.lastName.isValid && formData.email.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const submitData = {
        firstName: formData.firstName.value,
        lastName: formData.lastName.value,
        email: formData.email.value,
        phone: formData.phone.value,
        company: formData.company.value,
        role: formData.role.value,
        notes: formData.notes.value
      };

      console.log("✅ Super-Admin configuré:", submitData);
      onComplete(submitData);
    } catch (error) {
      console.error("❌ Erreur configuration Super-Admin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration Super-Administrateur"
      subtitle="Créez le compte administrateur principal du système"
      maxWidth="max-w-lg"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
      draggable={true}
      dragConstraints={{ top: -400, bottom: 400 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModalFormField
            id="firstName"
            label="Prénom"
            type="text"
            value={formData.firstName.value}
            onChange={(value) => handleFieldChange("firstName", value)}
            placeholder="Votre prénom"
            error={formData.firstName.error}
            isValid={formData.firstName.isValid}
            disabled={isSubmitting}
            required
            icon={<User className="w-4 h-4" />}
          />

          <ModalFormField
            id="lastName"
            label="Nom"
            type="text"
            value={formData.lastName.value}
            onChange={(value) => handleFieldChange("lastName", value)}
            placeholder="Votre nom"
            error={formData.lastName.error}
            isValid={formData.lastName.isValid}
            disabled={isSubmitting}
            required
            icon={<User className="w-4 h-4" />}
          />
        </div>

        {/* Email */}
        <EmailField
          label="Email"
          value={formData.email.value}
          onChange={(value) => handleFieldChange("email", value)}
          error={formData.email.error}
          required
          disabled={isSubmitting}
        />

        {/* Téléphone */}
        <PhoneField
          label="Téléphone (optionnel)"
          value={formData.phone.value}
          onChange={(value) => handleFieldChange("phone", value)}
          error={formData.phone.error}
          disabled={isSubmitting}
        />

        {/* Entreprise */}
        <ModalFormField
          id="company"
          label="Entreprise (optionnel)"
          type="text"
          value={formData.company.value}
          onChange={(value) => handleFieldChange("company", value)}
          placeholder="Nom de votre entreprise"
          error={formData.company.error}
          isValid={formData.company.isValid}
          disabled={isSubmitting}
          icon={<Building className="w-4 h-4" />}
        />

        {/* Notes */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            value={formData.notes.value}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="Informations supplémentaires..."
            disabled={isSubmitting}
            rows={3}
            className={`
              modal-input resize-none
              ${formData.notes.error ? 'border-red-500 focus:ring-red-500' : ''}
              ${formData.notes.isValid && !formData.notes.error ? 'border-green-500 focus:ring-green-500' : ''}
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
          Configurer le Super-Admin
        </ModalButton>

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Administrateur principal</p>
              <p>Ce compte aura des privilèges d'administration complets sur l'ensemble de la plateforme.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};
