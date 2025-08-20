// src/components/ui/super-admin-setup-modal.tsx
import React, { useState, useEffect } from "react";
import { User, Shield, AlertCircle } from "lucide-react";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminData, AdminMode } from "@/types/admin";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { BaseModal } from "@/components/ui/base-modal";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ModalButton } from "@/components/ui/modal-button";
import { EmailField } from "@/components/ui/email-field";
import { PhoneField } from "@/components/ui/phone-field";
import { PasswordField } from "@/components/ui/password-field";
import "../styles/whatsapp-theme.css";

const PASSWORD_MIN_LENGTH = 8;

interface SuperAdminSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  mode: AdminMode;
  adminData: AdminData;
  onAdminDataChange: (field: keyof AdminData, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  isLoading: boolean;
}

interface FormData {
  name: { value: string; error: string; isValid: boolean };
  email: { value: string; error: string; isValid: boolean };
  phone: { value: string; error: string; isValid: boolean };
  password: { value: string; error: string; isValid: boolean };
}

const SuperAdminSetupModal: React.FC<SuperAdminSetupModalProps> = ({
  isOpen,
  onComplete,
  mode,
  adminData,
  onAdminDataChange,
  showPassword,
  onToggleShowPassword,
  isLoading
}) => {
  const { completeStep } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: { value: "", error: "", isValid: false },
    email: { value: "", error: "", isValid: false },
    phone: { value: "", error: "", isValid: false },
    password: { value: "", error: "", isValid: false }
  });

  // Initialiser les données du formulaire
  useEffect(() => {
    if (isOpen && adminData) {
      setFormData({
        name: { value: adminData.name || "", error: "", isValid: !!adminData.name },
        email: { value: adminData.email || "", error: "", isValid: !!adminData.email },
        phone: { value: adminData.phone || "", error: "", isValid: !!adminData.phone },
        password: { value: adminData.password || "", error: "", isValid: !!adminData.password }
      });
    }
  }, [isOpen, adminData]);

  const validateField = (field: keyof FormData, value: string): { isValid: boolean; error: string } => {
    switch (field) {
      case 'name':
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
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return {
          isValid: phoneRegex.test(value),
          error: !phoneRegex.test(value) ? "Numéro de téléphone invalide" : ""
        };
      case 'password':
        return {
          isValid: value.length >= PASSWORD_MIN_LENGTH,
          error: value.length < PASSWORD_MIN_LENGTH ? `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères` : ""
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

    // Mettre à jour les données parent
    onAdminDataChange(field as keyof AdminData, value);
  };

  const isFormValid = () => {
    return Object.values(formData).every(field => field.isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.value,
        password: formData.password.value,
        options: {
          data: {
            name: formData.name.value,
            phone: formData.phone.value,
            role: 'super_admin'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user?.id) {
        throw new Error("Impossible de créer l'utilisateur");
      }

      // Créer le profil dans public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.name.value.split(' ')[0] || formData.name.value,
          last_name: formData.name.value.split(' ').slice(1).join(' ') || '',
          email: formData.email.value,
          phone: formData.phone.value,
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Créer le super admin dans public.super_admins
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          user_id: authData.user.id,
          email: formData.email.value,
          name: formData.name.value,
          phone: formData.phone.value,
          est_actif: true,
          created_at: new Date().toISOString()
        });

      if (superAdminError) throw superAdminError;

      toast.success("Super-Admin créé avec succès !");
      onComplete();

    } catch (error: any) {
      console.error("Erreur création Super-Admin:", error);

      let errorMessage = "Erreur lors de la création du Super-Admin";
      if (error.message?.includes('RLS')) {
        errorMessage = "Erreur de sécurité RLS. Contactez l'administrateur.";
      } else if (error.message?.includes('duplicate')) {
        errorMessage = "Un utilisateur avec cet email existe déjà.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitButtonText = isSubmitting ? "Création en cours..." : "Créer le Super-Admin";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onComplete}
      title="Configuration Super-Admin"
      subtitle="Création du compte administrateur principal"
      maxWidth="max-w-md"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
      draggable={true}
      dragConstraints={{ top: -400, bottom: 400 }}
      isFirstModal={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom complet */}
        <ModalFormField
          id="name"
          label="Nom complet"
          type="text"
          value={formData.name.value}
          onChange={(value) => handleFieldChange("name", value)}
          placeholder="Prénom Nom"
          error={formData.name.error}
          isValid={formData.name.isValid}
          disabled={isLoading}
          required
          icon={<User className="w-4 h-4" />}
        />

        {/* Email */}
        <EmailField
          label="Email"
          value={formData.email.value}
          onChange={(value) => handleFieldChange("email", value)}
          error={formData.email.error}
          required
          disabled={isLoading}
        />

        {/* Téléphone */}
        <PhoneField
          label="Téléphone"
          value={formData.phone.value}
          onChange={(value) => handleFieldChange("phone", value)}
          error={formData.phone.error}
          required
          disabled={isLoading}
        />

        {/* Mot de passe */}
        <PasswordField
          label="Mot de passe"
          value={formData.password.value}
          onChange={(value) => handleFieldChange("password", value)}
          required
          disabled={isLoading}
        />

        {/* Bouton de soumission */}
        <ModalButton
          type="submit"
          disabled={!isFormValid() || isSubmitting || isLoading}
          loading={isSubmitting}
          loadingText="Création en cours..."
          icon={<Shield className="w-5 h-5" />}
        >
          {submitButtonText}
        </ModalButton>

        {/* Informations de sécurité */}
        <div className="modal-success-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Sécurité renforcée</p>
              <p>Ce compte aura des privilèges d'administration complets sur l'ensemble de la plateforme.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default SuperAdminSetupModal;
