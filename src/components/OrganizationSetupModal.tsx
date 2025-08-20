import React, { useState, useEffect } from "react";
import { Building2, MapPin, Globe, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { BaseModal } from "@/components/ui/base-modal";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ModalButton } from "@/components/ui/modal-button";
import { EmailField } from "@/components/ui/email-field";
import "../styles/whatsapp-theme.css";

interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
  className?: string;
}

interface FormData {
  name: { value: string; error: string; isValid: boolean };
  description: { value: string; error: string; isValid: boolean };
  slug: { value: string; error: string; isValid: boolean };
  email: { value: string; error: string; isValid: boolean };
  subscription_type: { value: string; error: string; isValid: boolean };
}

const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  className = ""
}) => {
  const { completeStep } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: { value: "", error: "", isValid: false },
    description: { value: "", error: "", isValid: false },
    slug: { value: "", error: "", isValid: false },
    email: { value: "", error: "", isValid: false },
    subscription_type: { value: "starter", error: "", isValid: true }
  });

  // Validation des champs
  const validateField = (field: keyof FormData, value: string): { isValid: boolean; error: string } => {
    switch (field) {
      case 'name':
        return {
          isValid: value.trim().length >= 2,
          error: value.trim().length < 2 ? "Le nom doit contenir au moins 2 caractères" : ""
        };
      case 'description':
        return {
          isValid: value.trim().length >= 10,
          error: value.trim().length < 10 ? "La description doit contenir au moins 10 caractères" : ""
        };
      case 'slug':
        return {
          isValid: /^[a-z0-9-]+$/.test(value),
          error: !/^[a-z0-9-]+$/.test(value) ? "L'identifiant doit contenir uniquement des lettres minuscules, chiffres et tirets" : ""
        };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          error: !emailRegex.test(value) ? "Email invalide" : ""
        };
      case 'subscription_type':
        return { isValid: true, error: "" };
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer l'organisation
      const { error: orgError } = await supabase.rpc('create_organization', {
        org_name: formData.name.value,
        org_code: formData.description.value,
        org_slug: formData.slug.value,
        org_email: formData.email.value,
        org_subscription_type: formData.subscription_type.value
      });

      if (orgError) throw orgError;

      toast.success("Organisation créée avec succès !");
      await completeStep('org_creation');
      onComplete();

    } catch (error: any) {
      console.error("❌ Erreur création organisation:", error);
      toast.error(error.message || "Erreur lors de la création de l'organisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration d'Organisation"
      subtitle="Créez votre organisation multi-garages"
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
          icon={<Building2 className="w-4 h-4" />}
        />

        {/* Description */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Description
            <span className="text-red-500">*</span>
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
          {formData.description.error && (
            <p className="modal-error">
              {formData.description.error}
            </p>
          )}
        </div>

        {/* Identifiant unique */}
        <ModalFormField
          id="slug"
          label="Identifiant unique"
          type="text"
          value={formData.slug.value}
          onChange={(value) => handleFieldChange("slug", value)}
          placeholder="mon-organisation"
          error={formData.slug.error}
          isValid={formData.slug.isValid}
          disabled={isSubmitting}
          required
          icon={<Globe className="w-4 h-4" />}
        />

        {/* Email de contact */}
        <EmailField
          label="Email de contact"
          value={formData.email.value}
          onChange={(value) => handleFieldChange("email", value)}
          error={formData.email.error}
          required
          disabled={isSubmitting}
        />

        {/* Type d'abonnement */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Type d'abonnement
          </label>
          <select
            value={formData.subscription_type.value}
            onChange={(e) => handleFieldChange("subscription_type", e.target.value)}
            disabled={isSubmitting}
            className="modal-input"
          >
            <option value="starter">Starter - 1 garage</option>
            <option value="professional">Professional - 5 garages</option>
            <option value="enterprise">Enterprise - Illimité</option>
          </select>
        </div>

        {/* Bouton de soumission */}
        <ModalButton
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          loading={isSubmitting}
          loadingText="Création en cours..."
          icon={<CheckCircle className="w-5 h-5" />}
        >
          Créer l'Organisation
        </ModalButton>

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Organisation multi-garages</p>
              <p>Cette organisation pourra gérer plusieurs garages et leurs équipes respectives selon le type d'abonnement choisi.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default OrganizationSetupModal;