import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { WhatsAppFormField } from '@/components/ui/whatsapp-form-field';
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
    phone: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: 'super_admin'
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone,
              role: 'super_admin',
              is_active: true
            }
          ]);

        if (profileError) {
          console.warn('Erreur création profil:', profileError);
        }

        toast.success('Super Administrateur créé avec succès ! 🎉');

        // Appeler le callback de succès
        onComplete({
          user: authData.user,
          profile: {
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            role: 'super_admin'
          }
        });
      }
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

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
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

          <WhatsAppFormField
            label="Adresse email"
            type="email"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
            placeholder="votre@email.com"
            required={true}
            error={fieldErrors.email}
            isValid={!fieldErrors.email && formData.email.includes('@')}
          />

          <WhatsAppFormField
            label="Numéro de téléphone"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleFieldChange('phone', value)}
            placeholder="+33 6 12 34 56 78"
            required={false}
          />

          <WhatsAppFormField
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(value) => handleFieldChange('password', value)}
            placeholder="Minimum 8 caractères"
            required={true}
            error={fieldErrors.password}
            isValid={!fieldErrors.password && formData.password.length >= 8}
          />

          {/* Bouton de soumission */}
          <div className="pt-3">
            <WhatsAppButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              fullWidth={true}
              disabled={isSubmitting}
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
