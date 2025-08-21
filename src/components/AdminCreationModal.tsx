import React, { useState, useEffect } from "react";
import { User, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminData } from "@/types/admin";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { BaseModal } from "@/components/ui/base-modal";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ModalButton } from "@/components/ui/modal-button";
import { EmailField } from "@/components/ui/email-field";
import { PhoneField } from "@/components/ui/phone-field";
import { PasswordField } from "@/components/ui/password-field";

const PASSWORD_MIN_LENGTH = 8;

interface AdminSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  adminData: AdminData;
  onAdminDataChange: (field: keyof AdminData, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  isLoading: boolean;
}

const AdminSetupModal: React.FC<AdminSetupModalProps> = ({
  isOpen,
  onComplete,
  adminData,
  onAdminDataChange,
  showPassword,
  onToggleShowPassword,
  isLoading
}) => {
  const { completeStep } = useWorkflow();
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: { value: "", error: "", isValid: false },
    password: { value: "", error: "", isValid: false },
    name: { value: "", error: "", isValid: false },
    phone: { value: "", error: "", isValid: true } // optionnel
  });

  // Initialiser les données du formulaire
  useEffect(() => {
    if (isOpen && adminData) {
      setFormData({
        email: { value: adminData.email || "", error: "", isValid: !!adminData.email },
        password: { value: adminData.password || "", error: "", isValid: !!adminData.password },
        name: { value: adminData.name || "", error: "", isValid: !!adminData.name },
        phone: { value: adminData.phone || "", error: "", isValid: true }
      });
    }
  }, [isOpen, adminData]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const validation = validateField(field, value);
    setFormData(prev => ({ ...prev, [field]: { value, ...validation } }));
    onAdminDataChange(field as keyof AdminData, value);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmail = emailRegex.test(value);
        return { error: validEmail ? "" : "Format email invalide", isValid: validEmail };
      case "password":
        return { error: value.length >= PASSWORD_MIN_LENGTH ? "" : `Minimum ${PASSWORD_MIN_LENGTH} caractères`, isValid: value.length >= PASSWORD_MIN_LENGTH };
      case "name":
        return { error: value.length >= 2 ? "" : "Nom trop court", isValid: value.length >= 2 };
      case "phone":
        return { error: "", isValid: true }; // facultatif
      default:
        return { error: "", isValid: false };
    }
  };

  const isFormValid = () => {
    const { email, password, name } = formData;
    return email.isValid && password.isValid && name.isValid;
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
            role: 'admin'
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
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Créer l'admin dans public.admins
      // Utiliser RPC function pour créer admin complet
      const { data: result, error: rpcError } = await (supabase as any).rpc('create_admin_complete', {
        p_email: formData.email.value,
        p_password: formData.password.value,
        p_name: formData.name.value,
        p_phone: formData.phone.value || null,
        p_pricing_plan: 'starter'
      });

      if (rpcError) throw rpcError;
      if (!result.success) throw new Error(result.error);

      toast.success("Administrateur créé avec succès !");
      onComplete();

    } catch (error: any) {
      console.error("Erreur création Admin:", error);

      let errorMessage = "Erreur lors de la création de l'Administrateur";
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onComplete}
      title="Création d'Administrateur"
      subtitle="Ajoutez un nouvel administrateur à votre organisation"
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
          label="Téléphone (optionnel)"
          value={formData.phone.value}
          onChange={(value) => handleFieldChange("phone", value)}
          error={formData.phone.error}
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

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Erreur</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <ModalButton
          type="submit"
          disabled={!isFormValid() || isSubmitting || isLoading}
          loading={isSubmitting}
          loadingText="Création en cours..."
          icon={<Shield className="w-5 h-5" />}
        >
          Créer l'Administrateur
        </ModalButton>

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Gestion des accès</p>
              <p>Cet administrateur aura accès à la gestion de votre organisation et de ses garages.</p>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default AdminSetupModal;

