import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { CreationForm } from '@/components/ui/integrated-form';
import { WhatsAppFormField } from '@/components/ui/whatsapp-form-field';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminCreationFormProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onClose: () => void;
}

export const AdminCreationForm: React.FC<AdminCreationFormProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    avatarFile: null as File | null,
    avatarPreview: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Validation en temps réel
  useEffect(() => {
    validateFormRealTime();
  }, [isPhoneValid]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Valider le formulaire en temps réel
    validateFormRealTime();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarFile: file, avatarPreview: preview }));
    }
  };

  const validateFormRealTime = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.password.trim()) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.phone.trim() || !isPhoneValid) {
      errors.phone = 'Téléphone invalide';
    }

    setFieldErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const validateForm = () => {
    return validateFormRealTime();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = null;
      if (formData.avatarFile) {
        const fileExt = formData.avatarFile.name.split('.').pop();
        const filePath = `admin/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, formData.avatarFile, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl.publicUrl;
      }

      // Utilisation de la fonction RPC pour créer l'administrateur
      const { data: result, error } = await supabase.rpc('create_admin_complete', {
        p_email: formData.email,
        p_password: formData.password,
        p_name: formData.name,
        p_phone: formData.phone || null,
        p_avatar_url: avatarUrl
      });

      if (error) throw error;
      if (!result?.success) {
        throw new Error(result?.error || 'Erreur création administrateur');
      }

      toast.success('Administrateur créé avec succès ! 🎉');
      onComplete(result);
    } catch (error: any) {
      console.error('Erreur création administrateur:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'administrateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreationForm
      isOpen={isOpen}
      onClose={onClose}
      title="Création de l'Administrateur"
      description="Configuration de l'équipe - Création d'un administrateur"
      onSubmit={handleSubmit}
      submitText="Créer l'Administrateur"
      isSubmitting={isSubmitting}
      canSubmit={isFormValid}
    >
      {/* En-tête avec informations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Configuration de l'Équipe
          </h3>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Créez un administrateur qui pourra gérer l'organisation et les garages.
          </p>
        </div>
      </motion.div>

      {/* Avantages de l'administrateur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Privilèges Administrateur</div>
            <ul className="space-y-1 text-xs">
              <li>• Gestion de l'organisation</li>
              <li>• Création et gestion des garages</li>
              <li>• Gestion des utilisateurs et des permissions</li>
              <li>• Accès aux fonctionnalités d'administration</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Photo de profil */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Photo de profil</label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border">
              {formData.avatarPreview ? (
                <img src={formData.avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Aperçu</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Nom complet */}
        <WhatsAppFormField
          label="Nom complet"
          type="text"
          value={formData.name}
          onChange={(value) => handleFieldChange('name', value)}
          placeholder="Votre nom complet"
          required={true}
          error={fieldErrors.name}
          isValid={!fieldErrors.name && formData.name.length > 0}
        />

        {/* Email */}
        <EmailFieldPro
          label="Adresse email"
          value={formData.email}
          onChange={(val) => handleFieldChange('email', val)}
          error={fieldErrors.email}
          required
        />

        {/* Téléphone */}
        <PhoneFieldPro
          label="Numéro de téléphone"
          value={formData.phone}
          onChange={(val) => handleFieldChange('phone', val)}
          required
          onValidationChange={setIsPhoneValid}
        />

        {/* Mot de passe */}
        <PasswordFieldPro
          label="Mot de passe"
          value={formData.password}
          onChange={(val) => handleFieldChange('password', val)}
          required
          error={fieldErrors.password}
        />
      </motion.form>

      {/* Informations de sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">Sécurité et confidentialité</div>
            <p>
              Les informations de l'administrateur sont protégées et sécurisées.
              L'administrateur aura accès aux fonctionnalités selon les permissions définies.
            </p>
          </div>
        </div>
      </motion.div>
    </CreationForm>
  );
};

export default AdminCreationForm;
