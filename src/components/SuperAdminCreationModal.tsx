import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { WhatsAppFormField } from '@/components/ui/whatsapp-form-field';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuperAdminCreationModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onClose: () => void;
}

export const SuperAdminCreationModal: React.FC<SuperAdminCreationModalProps> = ({
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

  // Validation initiale
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = null;
      if (formData.avatarFile) {
        const fileExt = formData.avatarFile.name.split('.').pop();
        const filePath = `super_admin/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, formData.avatarFile, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl.publicUrl;
      }

      // Utilisation de la fonction RPC d'urgence
      const { data: result, error } = await (supabase as any).rpc('emergency_create_super_admin', {
        p_email: formData.email,
        p_password: formData.password,
        p_name: formData.name,
        p_phone: formData.phone
      });

      if (error) throw error;
      if (!result?.success) {
        throw new Error(result?.error || 'Erreur lors de la création');
      }

      toast.success('Super Administrateur créé avec succès ! 🎉');
      onComplete(result);
    } catch (error: any) {
      console.error('Erreur création Super Admin:', error);
      toast.error(error.message || 'Erreur lors de la création du Super Admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Création du Super Administrateur"
      description="Première configuration du système - Création du compte principal"
      size="xl"
      showSuperAdminIndicator={true}
    >
      <div className="space-y-6">
        {/* En-tête avec informations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-yellow-900" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Configuration Initiale du Système
            </h3>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Vous êtes le premier utilisateur de ce système. Vous deviendrez automatiquement
              le Super Administrateur avec tous les privilèges de gestion.
            </p>
          </div>
        </motion.div>

        {/* Avantages du Super Admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-[#128C7E]/5 to-[#25D366]/5 rounded-xl p-4 border border-[#128C7E]/20"
        >
          <h4 className="text-base font-semibold text-[#128C7E] mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privilèges Super Administrateur
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">Gestion complète</div>
                <div className="text-xs text-gray-600">Accès à toutes les fonctionnalités</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">Organisations multiples</div>
                <div className="text-xs text-gray-600">Créer et gérer plusieurs organisations</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">Administrateurs</div>
                <div className="text-xs text-gray-600">Nommer des administrateurs</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#128C7E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">Configuration système</div>
                <div className="text-xs text-gray-600">Paramétrer les options globales</div>
              </div>
            </div>
          </div>
        </motion.div>


        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >

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

          <EmailFieldPro
            label="Adresse email"
            value={formData.email}
            onChange={(val) => handleFieldChange('email', val)}
            error={fieldErrors.email}
            required
          />

          <PhoneFieldPro
            label="Numéro de téléphone"
            value={formData.phone}
            onChange={(val) => handleFieldChange('phone', val)}
            required
            onValidationChange={setIsPhoneValid}
          />

          <PasswordFieldPro
            label="Mot de passe"
            value={formData.password}
            onChange={(val) => handleFieldChange('password', val)}
            required
            error={fieldErrors.password}
          />

          {/* Bouton de soumission */}
          <div className="pt-3">
            <WhatsAppButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              fullWidth={true}
              disabled={isSubmitting || !isFormValid}
            >
              <Crown className="w-5 h-5 mr-2" />
              Créer le Super Administrateur
            </WhatsAppButton>
          </div>
        </motion.form>

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-1">Sécurité et confidentialité</div>
              <p>
                Vos informations sont protégées par un chiffrement de niveau bancaire.
                Nous ne partageons jamais vos données avec des tiers.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </WhatsAppModal>
  );
};
