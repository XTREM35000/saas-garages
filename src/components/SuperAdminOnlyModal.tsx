import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Loader2, Shield, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuperAdminOnlyModalProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface SuperAdminFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const SuperAdminOnlyModal: React.FC<SuperAdminOnlyModalProps> = ({
  onSuccess,
  onError
}) => {
  const [formData, setFormData] = useState<SuperAdminFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof SuperAdminFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const { email, password, confirmPassword } = formData;
    
    if (!email || !password || !confirmPassword) {
      toast.error('Tous les champs sont obligatoires');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { firstName, lastName, phone } = formData;
    
    if (!firstName || !lastName) {
      toast.error('Le nom et prénom sont obligatoires');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔐 [SuperAdminOnly] Création Super Admin...');
      
      // Créer le compte utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'super_admin',
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        throw new Error(`Erreur création compte: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // Créer le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: 'super_admin',
          full_name: `${formData.firstName} ${formData.lastName}`
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // Ne pas bloquer si le profil existe déjà (trigger pourrait l'avoir créé)
        if (!profileError.message.includes('duplicate key')) {
          throw new Error(`Erreur création profil: ${profileError.message}`);
        }
      }

      console.log('✅ [SuperAdminOnly] Super Admin créé avec succès');
      
      toast.success('Super Admin créé avec succès! 🎉', {
        description: 'Vous pouvez maintenant configurer votre système'
      });
      
      // Délai pour permettre aux triggers de s'exécuter
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (error) {
      console.error('❌ [SuperAdminOnly] Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      onError(errorMessage);
      toast.error('Erreur lors de la création', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-blue-900">
            Configuration Initiale
          </DialogTitle>
          <DialogDescription className="text-blue-700 mt-2">
            Créez le compte Super Administrateur pour initialiser le système
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Indicateur d'étape */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                <Key className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Sécurité</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Profil</span>
            </div>
          </div>

          {/* Étape 1: Sécurité */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-blue-900 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@exemple.com"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-blue-900 font-medium">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-blue-900 font-medium">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Ressaisissez le mot de passe"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                Suivant
              </Button>
            </div>
          )}

          {/* Étape 2: Profil */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-blue-900 font-medium">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Jean"
                    className="border-blue-300 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-blue-900 font-medium">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Dupont"
                    className="border-blue-300 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-blue-900 font-medium">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-4">
                <Button 
                  onClick={handlePrevStep}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  Précédent
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Créer Super Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminOnlyModal;