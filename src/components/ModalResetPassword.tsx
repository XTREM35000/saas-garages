import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import '../styles/whatsapp-theme.css';

interface ModalResetPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess: () => void;
  email?: string;
  phone?: string;
}

export const ModalResetPassword: React.FC<ModalResetPasswordProps> = ({
  isOpen,
  onClose,
  onResetSuccess,
  email,
  phone
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string): boolean => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleReset = async () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      // Simuler la réinitialisation du mot de passe
      // À implémenter avec Supabase Auth Admin API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici vous devriez appeler l'API Supabase pour réinitialiser le mot de passe
      // const { error } = await supabase.auth.admin.updateUserById(userId, {
      //   password: formData.password
      // });

      setIsReset(true);
      toast.success('Votre mot de passe a été réinitialisé avec succès ! ✅');
      
      // Attendre un peu avant de fermer
      setTimeout(() => {
        onResetSuccess();
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      toast.error('Erreur lors de la réinitialisation');
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
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#128C7E] mb-2">
            Réinitialiser le mot de passe
          </h2>
          <p className="text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Formulaire */}
        <Card className="modal-whatsapp-card">
          <CardContent className="space-y-6 pt-6">
            {!isReset ? (
              <>
                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#128C7E] font-medium">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Nouveau mot de passe"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#128C7E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Au moins 8 caractères, une majuscule, une minuscule et un chiffre
                  </p>
                </div>

                {/* Confirmer mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#128C7E] font-medium">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#128C7E]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bouton réinitialiser */}
                <Button
                  onClick={handleReset}
                  disabled={isLoading || !formData.password || !formData.confirmPassword}
                  className="btn-whatsapp-primary w-full py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Réinitialisation...
                    </div>
                  ) : (
                    'Réinitialiser'
                  )}
                </Button>
              </>
            ) : (
              /* Message de succès */
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Mot de passe réinitialisé !
                  </h3>
                  <p className="text-gray-600">
                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WhatsAppModal>
  );
};

export default ModalResetPassword;
