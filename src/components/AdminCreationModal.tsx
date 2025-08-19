
import React, { useState, useEffect } from "react";
// import { Mail } from 'react-feather';import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Eye, EyeOff, Shield, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminData } from "@/types/admin";
import { AnimatedLogo } from "./AnimatedLogo";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { EmailField } from "@/components/ui/email-field";
import { PhoneField } from "@/components/ui/phone-field";

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
  const [isSubmitting, setIsSubmitting] = useState(true);

  const [formData, setFormData] = useState({
    email: { value: "", error: "", isValid: false },
    password: { value: "", error: "", isValid: false },
    name: { value: "", error: "", isValid: false },
    phone: { value: "", error: "", isValid: true } // optionnel
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const validation = validateField(field, value);
    setFormData(prev => ({ ...prev, [field]: { value, ...validation } }));
    onAdminDataChange(field as keyof AdminData, value);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    switch (field) {
      case "email":
        const validEmail = value.includes("@") && value.length > 3;
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
    setError("");
    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.value,
        password: formData.password.value,
        options: { data: { name: formData.name.value, role: "admin" } }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Utilisateur non créé");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        user_id: authData.user.id,
        email: formData.email.value,
        full_name: formData.name.value,
        role: "admin"
      });
      if (profileError) throw profileError;

      toast.success("Administrateur créé avec succès!");
      await completeStep("admin_creation"); // enchaîne dans le workflow
      onComplete();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
      toast.error(err.message || "Erreur lors de la création");
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
        phone: { value: "", error: "", isValid: true }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
          />

          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-lg"
            >
              <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-t-2xl text-white">
                <AnimatedLogo mainIcon={User} secondaryIcon={Shield} mainColor="text-white" secondaryColor="text-yellow-200" />
                <h2 className="mt-2 text-xl font-bold">Création Administrateur</h2>
                <p className="text-sm text-white/80">Cet administrateur gérera une organisation cliente</p>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" /> Nom complet
                    </Label>
                    <Input
                      id="name"
                      value={formData.name.value}
                      onChange={e => handleFieldChange("name", e.target.value)}
                      disabled={isLoading}
                      placeholder="Nom complet"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" /> Email
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
                      label="Téléphone (optionnel)"
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password.value}
                        onChange={e => handleFieldChange("password", e.target.value)}
                        placeholder={`Minimum ${PASSWORD_MIN_LENGTH} caractères`}
                      />
                      <button
                        type="button"
                        onClick={onToggleShowPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!isFormValid() || isLoading}>
                    {isSubmitting ? "Création en cours..." : "Créer Administrateur"}
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

export default AdminSetupModal;

