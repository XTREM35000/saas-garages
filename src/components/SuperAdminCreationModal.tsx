import React, { useState, useEffect } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { toast } from 'sonner';
import AvatarUpload from '@/components/ui/avatar-upload';
import { createClient } from '@supabase/supabase-js';
import '../styles/whatsapp-theme.css';

interface SuperAdminCreationModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl: string;
}

// Configuration des URLs selon l'environnement
const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://metssugfqsnttghfrsxx.supabase.co/functions/v1';

export const SuperAdminCreationModal: React.FC<SuperAdminCreationModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/create_super_admin_complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        })
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Erreur HTTP ${response.status}`;
        } catch {
          errorMessage = `Erreur réseau ou CORS (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Réponse invalide du serveur");
      }

      if (!data.success) {
        throw new Error(data.error || "Erreur inconnue lors de la création");
      }

      // Succès
      toast.success('Super Admin créé avec succès! 🎉');
      onComplete(data);
      onClose();

    } catch (err: any) {
      console.error("❌ Erreur création super admin:", err);
      setError(err.message || "Erreur inconnue");
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, avatarUrl: result }));
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-4xl mx-auto">


        {/* Utilisation du composant AvatarUpload réutilisable */}
        <AvatarUpload
          avatarPreview={avatarPreview}
          onAvatarChange={handleAvatarChange}
          role="Super Admin"
          roleColor="gold"
          title="Création d'un Super Administrateur"
          subtitle="Configurez le compte principal de votre système"
        />

        <Card className="modal-whatsapp-card">
          <CardContent className="space-y-6 p-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[#128C7E]">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#128C7E] font-medium">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="modal-whatsapp-input"
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#128C7E] font-medium">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="modal-whatsapp-input"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-[#25D366] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[#25D366]">Informations de contact</h3>
              </div>

              <div className="space-y-4">
                <EmailFieldPro
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="Votre adresse email"
                />
                <PhoneFieldPro
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                />
              </div>
            </div>

            {/* Sécurité */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-[#075E54] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[#075E54]">Sécurité</h3>
              </div>

              <PasswordFieldPro
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
              />
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                className="btn-whatsapp-primary"
                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password}
              >
                {isLoading ? 'Création en cours...' : 'Créer le Super Administrateur'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer avec branding Thierry Gogo */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img
                src="/profile01.png"
                alt="Thierry Gogo"
                className="w-10 h-10 rounded-full border-2 border-[#128C7E]"
              />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Thierry Gogo</h4>
                <p className="text-xs text-gray-600">Développeur FullStack (Frontend & Backend)</p>
                <p className="text-xs text-gray-500">FREELANCE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Whatsapp +225 0758966156 / 0103644527</p>
              <p className="text-xs text-gray-500">01 BP 5341 Abidjan 01</p>
              <p className="text-xs text-gray-500">Cocody, RIVIERA 3</p>
            </div>
          </div>
        </div>
      </div>
    </WhatsAppModal>
  );
};
