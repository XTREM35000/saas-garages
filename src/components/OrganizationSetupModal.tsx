import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkflow } from "@/contexts/WorkflowProvider";
import { AnimatedLogo } from "./AnimatedLogo";
import "../styles/whatsapp-theme.css";

interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
  className?: string;
}

interface OrganizationData {
  name: string;
  description: string;
  slug: string;
  email: string;
  subscription_type?: string;
}

const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  className = ""
}) => {
  const { completeStep } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<OrganizationData>({
    name: "",
    description: "",
    slug: "",
    email: "",
    subscription_type: "starter"
  });

  const [errors, setErrors] = useState<Partial<OrganizationData>>({});

  const steps = [
    {
      id: "basic",
      title: "Informations de base",
      description: "Nom et description de l'organisation",
      icon: Building2
    },
    {
      id: "details",
      title: "Détails",
      description: "Identifiant et type d'abonnement",
      icon: Globe
    },
    {
      id: "contact",
      title: "Contact",
      description: "Email de contact",
      icon: Mail
    },
    {
      id: "review",
      title: "Vérification",
      description: "Vérifiez vos informations",
      icon: CheckCircle
    }
  ];

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

  const canProceedToNext = (): boolean => {
    const currentStepData = steps[currentStep];
    if (currentStepData.id === "basic") {
      return !errors.name && !errors.description && formData.name && formData.description;
    } else if (currentStepData.id === "details") {
      return !errors.slug && formData.slug;
    } else if (currentStepData.id === "contact") {
      return !errors.email && formData.email;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) return;

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
          subscription_type: formData.subscription_type,
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

  // Gestion du drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Seuil pour fermer le modal
    if (Math.abs(info.offset.y) > 100) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  // Rendu du contenu de l'étape
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "basic":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-600" />
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

            <div>
              <Label htmlFor="description" className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-green-600" />
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Décrivez votre organisation..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Adresse *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="123 Rue de la Paix"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="flex items-center gap-2 mb-2">
                  Ville *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  placeholder="Paris"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="postalCode" className="flex items-center gap-2 mb-2">
                  Code postal *
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                  placeholder="75001"
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="flex items-center gap-2 mb-2">
                Pays
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                placeholder="France"
              />
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-green-600" />
                Téléphone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-600" />
                Email *
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

            <div>
              <Label htmlFor="website" className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-green-600" />
                Site web (optionnel)
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleFieldChange("website", e.target.value)}
                placeholder="https://www.organisation.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Vérification terminée</p>
                  <p>Toutes les informations sont correctes. Cliquez sur "Créer l'organisation" pour finaliser.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Récapitulatif :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Nom :</p>
                  <p className="text-gray-600">{formData.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Ville :</p>
                  <p className="text-gray-600">{formData.city}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Téléphone :</p>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Email :</p>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
            ref={modalRef}
            drag="y"
            dragConstraints={{ top: -150, bottom: 150 }}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ y: dragY }}
            className={`relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden touch-pan-y ${className}`}
          >
            {/* Header avec logo animé */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <AnimatedLogo size={50} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Configuration de l'Organisation
              </h2>
              <p className="text-blue-100 text-sm">
                Étape {currentStep + 1} sur {steps.length} : {steps[currentStep].title}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progression
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedToNext() || isSubmitting}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Création...
                      </span>
                    ) : (
                      "Créer l'organisation"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Indicateur de drag */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganizationSetupModal;