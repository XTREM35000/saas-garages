import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, User, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmailField } from '@/components/ui/email-field';
import { PhoneField } from '@/components/ui/phone-field';
import { PasswordField } from '@/components/ui/password-field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedAuthFormProps {
  showSuperAdminIndicator?: boolean;
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface FieldValidation {
  value: string;
  error: string;
  isValid: boolean;
  isTouched: boolean;
}

const PASSWORD_MIN_LENGTH = 8;

export const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({
  showSuperAdminIndicator = false,
  onSuccess,
  onError,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const [fieldStates, setFieldStates] = useState<Record<keyof FormData, FieldValidation>>({
    email: { value: '', error: '', isValid: false, isTouched: false },
    password: { value: '', error: '', isValid: false, isTouched: false },
    name: { value: '', error: '', isValid: false, isTouched: false },
    phone: { value: '', error: '', isValid: false, isTouched: false }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation des champs
  const validateField = (field: keyof FormData, value: string): Partial<FieldValidation> => {
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmail = emailRegex.test(value);
        return {
          error: validEmail ? '' : 'Format email invalide',
          isValid: validEmail
        };

      case 'password':
        const validPassword = value.length >= PASSWORD_MIN_LENGTH;
        return {
          error: validPassword ? '' : `Minimum ${PASSWORD_MIN_LENGTH} caractères`,
          isValid: validPassword
        };

      case 'name':
        const validName = value.length >= 2;
        return {
          error: validName ? '' : 'Nom trop court (minimum 2 caractères)',
          isValid: validName
        };

      case 'phone':
        // Le téléphone est optionnel
        return {
          error: '',
          isValid: true
        };

      default:
        return { error: '', isValid: false };
    }
  };

  // Gestion des changements de champs
  const handleFieldChange = (field: keyof FormData, value: string) => {
    const validation = validateField(field, value);

    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        ...validation,
        isTouched: true
      }
    }));
  };

  // Vérification de la validité du formulaire
  const isFormValid = () => {
    return Object.values(fieldStates).every(field => field.isValid);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || isSubmitting) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: showSuperAdminIndicator ? 'super_admin' : 'admin',
            created_at: new Date().toISOString()
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Créer le profil utilisateur dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone,
              role: showSuperAdminIndicator ? 'super_admin' : 'admin',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.warn('Erreur création profil:', profileError);
          // Continuer même si le profil n'est pas créé
        }

        toast.success(
          showSuperAdminIndicator
            ? 'Super Admin créé avec succès ! 🎉'
            : 'Administrateur créé avec succès ! 🎉'
        );

        // Appeler le callback de succès
        if (onSuccess) {
          onSuccess({
            user: authData.user,
            profile: {
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone,
              role: showSuperAdminIndicator ? 'super_admin' : 'admin'
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Erreur création utilisateur:', error);
      const errorMessage = error.message || 'Erreur lors de la création de l\'utilisateur';
      toast.error(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Animation des champs
  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {/* En-tête avec indicateur Super Admin */}
      {showSuperAdminIndicator && (
        <motion.div
          variants={fieldVariants}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl text-yellow-900"
        >
          <Crown className="w-6 h-6" />
          <span className="font-bold text-lg">Configuration Super Admin</span>
          <Crown className="w-6 h-6" />
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champ Nom */}
        <motion.div variants={fieldVariants}>
          <label className="block text-[#128C7E] font-semibold text-sm mb-2">
            Nom complet *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={cn(
                "w-full p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2",
                fieldStates.name.error && fieldStates.name.isTouched
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[#128C7E]/30 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
              )}
              placeholder="Votre nom complet"
              disabled={isSubmitting}
            />
            {fieldStates.name.isValid && fieldStates.name.isTouched && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {fieldStates.name.error && fieldStates.name.isTouched && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {fieldStates.name.error}
            </p>
          )}
        </motion.div>

        {/* Champ Email */}
        <motion.div variants={fieldVariants}>
          <label className="block text-[#128C7E] font-semibold text-sm mb-2">
            Adresse email *
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={cn(
                "w-full p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2",
                fieldStates.email.error && fieldStates.email.isTouched
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[#128C7E]/30 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
              )}
              placeholder="votre.email@exemple.com"
              disabled={isSubmitting}
            />
            {fieldStates.email.isValid && fieldStates.email.isTouched && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {fieldStates.email.error && fieldStates.email.isTouched && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {fieldStates.email.error}
            </p>
          )}
        </motion.div>

        {/* Champ Téléphone */}
        <motion.div variants={fieldVariants}>
          <label className="block text-[#128C7E] font-semibold text-sm mb-2">
            Numéro de téléphone <span className="text-gray-500">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className="w-full p-4 border border-[#128C7E]/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            placeholder="+33 6 12 34 56 78"
            disabled={isSubmitting}
          />
        </motion.div>

        {/* Champ Mot de passe */}
        <motion.div variants={fieldVariants}>
          <label className="block text-[#128C7E] font-semibold text-sm mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className={cn(
                "w-full p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 pr-12",
                fieldStates.password.error && fieldStates.password.isTouched
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[#128C7E]/30 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
              )}
              placeholder="Minimum 8 caractères"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldStates.password.isValid && fieldStates.password.isTouched && (
              <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {fieldStates.password.error && fieldStates.password.isTouched && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {fieldStates.password.error}
            </p>
          )}
        </motion.div>

        {/* Bouton de soumission */}
        <motion.div variants={fieldVariants} className="pt-4">
          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={cn(
              "w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200",
              isFormValid()
                ? "bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:from-[#075E54] hover:to-[#128C7E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {showSuperAdminIndicator ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                {showSuperAdminIndicator ? 'Créer Super Admin' : 'Créer Administrateur'}
              </div>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Informations de sécurité */}
      <motion.div variants={fieldVariants} className="text-center text-sm text-gray-600">
        <p>Vos données sont sécurisées et ne seront jamais partagées.</p>
      </motion.div>
    </motion.div>
  );
};
