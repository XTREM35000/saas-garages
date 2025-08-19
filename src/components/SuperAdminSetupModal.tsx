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
const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

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
  const [error, setError] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: { value: "", error: "", isValid: false },
    password: { value: "", error: "", isValid: false },
    name: { value: "", error: "", isValid: false },
    phone: { value: "", error: "", isValid: false }
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const validation = validateField(field, value);
    setFormData(prev => ({ ...prev, [field]: { value, ...validation } }));
    onAdminDataChange(field, value);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    switch (field) {
      case "email":
        const isClassicEmail = value.includes("@") && value.length > 3;
        const isSpecialCase = !value.includes("@") && value.length >= 2;
        return { error: isClassicEmail || isSpecialCase ? "" : "Format email invalide", isValid: isClassicEmail || isSpecialCase };
      case "password":
        return { error: value.length >= PASSWORD_MIN_LENGTH ? "" : `Minimum ${PASSWORD_MIN_LENGTH} caractères`, isValid: value.length >= PASSWORD_MIN_LENGTH };
      case "name":
        return { error: value.length >= 2 ? "" : "Nom trop court", isValid: value.length >= 2 };
      // case "phone":
      //   const valid = value === "" || PHONE_REGEX.test(value);
      //   return { error: valid ? "" : "Numéro de téléphone invalide", isValid: valid };
      // default:
      //   return { error: "", isValid: false };
    }
  };

  const isFormValid = () => {
    const { email, password, name } = formData;
    return (email.isValid && password.isValid && name.isValid);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional
    const cleanPhone = phone.replace(/\s/g, '');
    return /^\+\d{8,}$/.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Formatage du numéro de téléphone
      const formattedPhone = formData.phone.value.startsWith('+')
        ? formData.phone.value
        : `+${formData.phone.value.replace(/\D/g, '')}`;

      // 2. Création du compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.value,
        password: formData.password.value,
        phone: formattedPhone, // Ajout du téléphone formaté
      });

      if (authError) throw authError;

      // 3. Création du profil avec is_superadmin à true
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: formData.email.value,
          phone: formattedPhone,
          is_superadmin: true, // Explicitement défini
          first_name: formData.name.value.split(' ')[0],
          last_name: formData.name.value.split(' ').slice(1).join(' '),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 4. Création de l'entrée super_admin
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          user_id: authData.user!.id,
          email: formData.email.value,
          created_at: new Date().toISOString()
        });

      if (superAdminError) throw superAdminError;

      setShowSuccessMessage(true);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur création super admin:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: { value: "", error: "", isValid: false },
        password: { value: "", error: "", isValid: false },
        name: { value: "", error: "", isValid: false },
        phone: { value: "", error: "", isValid: false }
      });
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  const modalTitle = mode === "super-admin" ? "Création Super Admin" : "Création Admin Standard";
  const submitButtonText = mode === "super-admin" ? "Créer Super Admin" : "Créer Admin Standard";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Draggable modal */}
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: -window.innerHeight / 2 + 100, bottom: window.innerHeight / 2 - 100 }}
              dragElastic={0.2}
              className="w-full max-w-md bg-white rounded-2xl shadow-lg touch-none"
            >
              {/* Barre de drag */}
              <div className="p-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 mx-auto mb-2 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-t-2xl text-white">
                <AnimatedLogo mainIcon={Shield} secondaryIcon={Key} mainColor="text-white" secondaryColor="text-yellow-200" />
                <h2 className="mt-2 text-xl font-bold">{modalTitle}</h2>
                <p className="text-sm text-white/80">Ce compte aura accès à toutes les organisations</p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col mb-2">
                    <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" /> Nom complet
                    </Label>
                    <Input
                      id="name"
                      value={formData.name.value}
                      onChange={e => handleFieldChange("name", e.target.value)}
                      disabled={isLoading}
                      placeholder="Entrez votre nom complet"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" /> Adresse email
                    </Label>
                    <EmailField
                      id="email"
                      value={formData.email.value}
                      onChange={val => handleFieldChange("email", val)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <PhoneField
                      label="Numéro de téléphone"
                      value={formData.phone.value}
                      onChange={(value) => handleFieldChange('phone', value)}
                      error={formData.phone.error}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4" /> Mot de passe
                    </Label>
                    <PasswordField
                      value={formData.password.value}
                      onChange={val => handleFieldChange("password", val)}
                      onValidationChange={(isValid) => {
                        setFormData(prev => ({ ...prev, password: { ...prev.password, isValid } }));
                      }}
                      showStrengthIndicator
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!isFormValid() || isLoading}>
                    {isLoading ? "Création en cours..." : <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> {submitButtonText}</span>}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuperAdminSetupModal;
