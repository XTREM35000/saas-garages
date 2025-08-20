import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { AnimatedLogo } from "./AnimatedLogo";

interface SimpleOrganizationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

interface OrganizationData {
  name: string;
  description: string;
  slug: string;
  email: string;
}

const SimpleOrganizationModal: React.FC<SimpleOrganizationModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const { completeStep } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrganizationData>({
    name: "",
    description: "",
    slug: "",
    email: ""
  });

  const [errors, setErrors] = useState<Partial<OrganizationData>>({});

  // Validation des champs
  const validateField = (field: keyof OrganizationData, value: string): string => {
    switch (field) {
      case 'name':
        return value.trim().length < 2 ? "Le nom doit contenir au moins 2 caractères" : "";
      case 'description':
        return value.trim().length < 10 ? "La description doit contenir au moins 10 caractères" : "";
      case 'slug':
        return !/^[a-z0-9-]+$/.test(value) ? "L'identifiant doit contenir uniquement des lettres minuscules, chiffres et tirets" : "";
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Email invalide" : "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: keyof OrganizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const isFormValid = (): boolean => {
    return !errors.name && !errors.description && !errors.slug && !errors.email &&
           formData.name && formData.description && formData.slug && formData.email;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // Créer l'organisation dans Supabase
      const { data, error } = await supabase
        .from('organisations')
        .insert({
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          email: formData.email,
          subscription_type: 'starter',
          owner_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Organisation créée avec succès !");
      
      // Compléter l'étape du workflow
      await completeStep('org_creation');
      
      onComplete();
    } catch (error) {
      console.error("Erreur création organisation:", error);
      toast.error("Erreur lors de la création de l'organisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header avec logo animé */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <AnimatedLogo size={50} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Créer votre organisation
              </h2>
              <p className="text-blue-100 text-sm">
                Configurez votre espace de travail
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-6">
              {/* Nom de l'organisation */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Nom de l'organisation *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Nom de votre organisation"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="flex items-center gap-2 mb-2">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Décrivez votre organisation..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Identifiant unique */}
              <div>
                <Label htmlFor="slug" className="flex items-center gap-2 mb-2">
                  Identifiant unique *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFieldChange("slug", e.target.value.toLowerCase())}
                  placeholder="mon-organisation"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Utilisé dans l'URL de votre espace
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email de contact *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="contact@organisation.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Créer l'organisation
                  </span>
                )}
              </Button>

              {/* Bouton d'annulation */}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Annuler
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleOrganizationModal;
