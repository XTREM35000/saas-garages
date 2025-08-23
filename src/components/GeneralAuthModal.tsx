import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Building2, Car, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import AnimatedLogo from '@/components/AnimatedLogo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import '../styles/whatsapp-theme.css';

interface GeneralAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTenant: () => void;
  onAuthSuccess: (userData: any) => void;
}

export const GeneralAuthModal: React.FC<GeneralAuthModalProps> = ({
  isOpen,
  onClose,
  onNewTenant,
  onAuthSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const extractOrganizationFromEmail = (email: string): string | null => {
    const domain = email.split('@')[1];
    if (!domain) return null;
    
    // Extraire le slug de l'organisation depuis le domaine
    // Ex: user@garage-titoh.com → garage-titoh
    const slug = domain.replace('.garageconnect.com', '').replace('.com', '');
    return slug;
  };

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      // Extraire l'organisation depuis l'email
      const orgSlug = extractOrganizationFromEmail(formData.email);
      if (!orgSlug) {
        toast.error('Format d\'email invalide. Utilisez votre email professionnel.');
        return;
      }

      // Vérifier que l'organisation existe
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single();

      if (orgError || !org) {
        toast.error('Organisation non trouvée. Vérifiez votre email ou contactez votre administrateur.');
        return;
      }

      // Authentifier l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        toast.error('Identifiants incorrects. Vérifiez votre email et mot de passe.');
        return;
      }

      // Récupérer le profil utilisateur avec l'organisation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        toast.error('Erreur lors de la récupération du profil');
        return;
      }

      // Vérifier que l'utilisateur appartient bien à cette organisation
      if (profile.organizations?.slug !== orgSlug) {
        toast.error('Accès non autorisé à cette organisation');
        return;
      }

      toast.success('Connexion réussie ! 🎉');
      onAuthSuccess({ user: authData.user, profile, organization: org });

    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      toast.error('Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-w-4xl mx-auto">
        {/* Header avec Logo Animé */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <AnimatedLogo size="large" />
          </div>
          <h1 className="text-4xl font-bold text-[#128C7E] mb-2">
            GarageConnect
          </h1>
          <p className="text-lg text-gray-600">
            Plateforme de gestion multi-garages professionnelle
          </p>
        </div>

        {/* Icônes thématiques */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-3">
              <Car className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Gestion Garage</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Outils Mécano</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Performance</p>
          </div>
        </div>

        {/* Formulaire d'authentification */}
        <Card className="modal-whatsapp-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#128C7E] flex items-center justify-center">
              <Lock className="w-6 h-6 mr-2" />
              Connexion
            </CardTitle>
            <p className="text-gray-600">
              Connectez-vous avec votre email professionnel
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email avec validation domaine */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#128C7E] font-medium">
                Email professionnel
              </Label>
              <EmailFieldPro
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="connexion@votre-garage.com"
              />
              <p className="text-xs text-gray-500">
                Format : utilisateur@garage-slug.com
              </p>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#128C7E] font-medium">
                Mot de passe
              </Label>
              <PasswordFieldPro
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
              />
            </div>

            {/* Bouton de connexion */}
            <Button
              onClick={handleAuth}
              disabled={isLoading || !formData.email || !formData.password}
              className="btn-whatsapp-primary w-full py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Bouton Nouveau Tenant */}
            <Button
              onClick={onNewTenant}
              variant="outline"
              className="w-full py-3 text-lg border-2 border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white transition-all duration-200"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Nouveau Tenant ?
            </Button>
          </CardContent>
        </Card>

        {/* Footer informatif */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            GarageConnect - Solution professionnelle de gestion multi-garages
          </p>
          <p className="mt-1">
            Support : support@garageconnect.com
          </p>
        </div>
      </div>
    </WhatsAppModal>
  );
};

export default GeneralAuthModal;
