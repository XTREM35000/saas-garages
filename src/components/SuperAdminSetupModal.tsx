// src/components/ui/super-admin-setup-modal.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Eye, EyeOff, Shield, Key, AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminData, AdminMode } from "@/types/admin";
import { AnimatedLogo } from "./AnimatedLogo";
import "../styles/whatsapp-theme.css";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { EmailField } from "@/components/ui/email-field";
import { PhoneField } from '@/components/ui/phone-field';
import { PasswordField } from "@/components/ui/password-field";

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
      // 1. Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.value,
        password: formData.password.value,
        options: {
          data: {
            name: formData.name.value,
            phone: formData.phone.value,
            is_superadmin: true
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création de l'utilisateur");

      // 2. Créer le profil dans public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email.value,
          phone: formData.phone.value,
          is_superadmin: true,
          first_name: formData.name.value.split(' ')[0],
          last_name: formData.name.value.split(' ').slice(1).join(' '),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 3. Créer l'entrée super_admin (avec gestion d'erreur améliorée)
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          user_id: authData.user.id,
          email: formData.email.value,
          is_active: true
        });

      if (superAdminError) {
        console.error("Erreur création super_admin:", superAdminError);
        // Continuer même si cette insertion échoue (peut être géré par un trigger)
        toast.warning("Super-admin créé mais insertion dans la table dédiée échouée");
      }

      // 4. Marquer l'étape comme complétée
      await completeStep('super_admin_check');

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header avec logo animé */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
            <div className="flex justify-center mb-4">
              <AnimatedLogo size={60} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Configuration Super-Admin
            </h2>
            <p className="text-green-100 text-sm">
              Création du compte administrateur principal
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom complet */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                Nom complet
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name.value}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Prénom Nom"
                className={`${formData.name.error ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {formData.name.error && (
                <p className="text-red-500 text-sm mt-1">{formData.name.error}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-600" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email.value}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="admin@exemple.com"
                className={`${formData.email.error ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {formData.email.error && (
                <p className="text-red-500 text-sm mt-1">{formData.email.error}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-green-600" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone.value}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                className={`${formData.phone.error ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {formData.phone.error && (
                <p className="text-red-500 text-sm mt-1">{formData.phone.error}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-green-600" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password.value}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  placeholder="••••••••"
                  className={`pr-10 ${formData.password.error ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={onToggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password.error && (
                <p className="text-red-500 text-sm mt-1">{formData.password.error}</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {submitButtonText}
                </span>
              )}
            </Button>

            {/* Informations de sécurité */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Sécurité renforcée</p>
                  <p>Ce compte aura des privilèges d'administration complets sur l'ensemble de la plateforme.</p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuperAdminSetupModal;
