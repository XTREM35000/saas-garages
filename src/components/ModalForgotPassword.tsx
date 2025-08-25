import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import '../styles/whatsapp-theme.css';

interface ModalForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSent: (email: string, phone: string) => void;
}

export const ModalForgotPassword: React.FC<ModalForgotPasswordProps> = ({
  isOpen,
  onClose,
  onEmailSent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    if (!formData.email && !formData.phone) {
      toast.error('Veuillez saisir au moins un email ou un numéro de téléphone');
      return;
    }

    setIsLoading(true);

    try {
      // Vérifier si l'utilisateur existe
      let userExists = false;

      if (formData.email) {
        const { data: userByEmail } = await supabase.auth.admin.listUsers();
        userExists = userByEmail.users.some(user => user.email === formData.email);
      }

      if (!userExists && formData.phone) {
        // Vérifier par téléphone dans la table profiles
        const { data: profileByPhone } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', formData.phone)
          .single();

        userExists = !!profileByPhone;
      }

      if (!userExists) {
        toast.error('Aucun compte trouvé avec ces informations');
        return;
      }

      // Simuler l'envoi d'OTP (à implémenter avec votre service SMS/Email)
      toast.success('Code de vérification envoyé !');

      // Passer aux étapes suivantes
      onEmailSent(formData.email, formData.phone);

    } catch (error) {
      console.error('❌ Erreur récupération mot de passe:', error);
      toast.error('Erreur lors de la récupération');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-[#128C7E]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>

          <h2 className="text-2xl font-bold text-[#128C7E] mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-gray-600">
            Saisissez votre email ou téléphone pour récupérer votre compte
          </p>
        </div>

        {/* Formulaire */}
        <Card className="modal-whatsapp-card">
          <CardContent className="space-y-6 pt-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#128C7E] font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <EmailFieldPro
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="votre@email.com"
              />
            </div>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#128C7E] font-medium flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
              </Label>
              <PhoneFieldPro
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Bouton continuer */}
            <Button
              onClick={handleContinue}
              disabled={isLoading || (!formData.email && !formData.phone)}
              className="btn-whatsapp-primary w-full py-3"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Vérification...
                </div>
              ) : (
                'Continuer'
              )}
            </Button>
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

export default ModalForgotPassword;
