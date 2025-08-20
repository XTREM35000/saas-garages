import React, { useState } from "react";
import { User, Shield, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailField } from "@/components/ui/email-field";
import { DraggableFormModal } from "@/components/ui/modal";
import { AnimatedLogo } from "../AnimatedLogo";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "super_admin",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("✅ Super-Admin configuré:", formData);
      onComplete(formData);
    } catch (error) {
      console.error("❌ Erreur configuration Super-Admin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DraggableFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration Super-Administrateur"
      description="Créez le compte administrateur principal du système"
      className="min-h-[140vh] bg-gradient-to-r from-orange-500 to-red-600"
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header avec logo */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <AnimatedLogo className="size-8 sm:size-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Configuration Super-Admin
          </h2>
          <p className="text-orange-100 text-sm sm:text-base mt-1">
            Administrateur principal du système
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm sm:text-base">
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Votre prénom"
                  required
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm sm:text-base">
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Informations de contact
            </h3>
            
            <div className="space-y-3">
              <div>
                <EmailField
                  label="Email *"
                  value={formData.email}
                  onChange={(value) => handleInputChange("email", value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Entreprise */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              Informations entreprise
            </h3>
            
            <div>
              <Label htmlFor="company" className="text-sm sm:text-base">
                Nom de l'entreprise
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Nom de votre entreprise"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              Notes additionnelles
            </h3>
            
            <div>
              <Label htmlFor="notes" className="text-sm sm:text-base">
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Informations supplémentaires..."
                rows={2}
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sm sm:text-base"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm">Configuration...</span>
                </div>
              ) : (
                "Configurer Super-Admin"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DraggableFormModal>
  );
};