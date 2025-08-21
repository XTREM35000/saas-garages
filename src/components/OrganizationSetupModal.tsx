import React, { useState, useEffect } from "react";
import { Building2, MapPin, Globe, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { BaseModal } from "@/components/ui/base-modal";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ModalButton } from "@/components/ui/modal-button";
import { EmailFieldPro } from "@/components/ui/email-field-pro";
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
  plan_type: { value: string; error: string; isValid: boolean };
  custom_domain: { value: string; error: string; isValid: boolean };
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
    plan_type: { value: "free_trial", error: "", isValid: true },
    custom_domain: { value: "", error: "", isValid: true }
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
      case 'plan_type':
        return { isValid: ['free_trial','mensuel_standard','mensuel_pro','annuel_pro'].includes(value), error: "" };
      case 'custom_domain':
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

      // Provisionner l'organisation (slug + sous-domaine, plan, domaine custom éventuel)
      const { data: result, error: orgError } = await (supabase as any).rpc('provision_organization', {
        p_name: formData.name.value,
        p_email: formData.email.value,
        p_plan: formData.plan_type.value,
        p_slug: formData.slug.value,
        p_custom_domain: formData.custom_domain.value || null
      });

      if (orgError) throw orgError;
      if (!result?.success) throw new Error(result?.error || 'Provisioning échoué');

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
        <EmailFieldPro
          label="Email de contact"
          value={formData.email.value}
          onChange={(value) => handleFieldChange("email", value)}
          error={formData.email.error}
          required
          disabled={isSubmitting}
        />

        {/* Plan */}
        <div className="space-y-2">
          <label className="modal-label flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Plan d'abonnement
          </label>
          <select
            value={formData.plan_type.value}
            onChange={(e) => handleFieldChange("plan_type", e.target.value)}
            disabled={isSubmitting}
            className="modal-input"
          >
            <option value="free_trial">Free Trial (1 semaine)</option>
            <option value="mensuel_standard">Mensuel Standard</option>
            <option value="mensuel_pro">Mensuel Pro</option>
            <option value="annuel_pro">Annuel Pro</option>
          </select>
        </div>

        {/* Domaine personnalisé (option premium) */}
        <ModalFormField
          id="custom_domain"
          label="Domaine personnalisé (option premium)"
          type="text"
          value={formData.custom_domain.value}
          onChange={(value) => handleFieldChange("custom_domain", value)}
          placeholder="ex: titoh-garage.com"
          error={formData.custom_domain.error}
          isValid={formData.custom_domain.isValid}
          disabled={isSubmitting}
          icon={<Globe className="w-4 h-4" />}
        />

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
