import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Building2, Car, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailAuthInput } from '@/components/ui/email-auth-input';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { generateSlug, isValidSlug } from '@/utils/slugGenerator';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import AnimatedLogo from '@/components/AnimatedLogo';
import HomePageModal from '@/components/HomePageModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ModalForgotPassword from './ModalForgotPassword';
import ModalVerifyEmail from './ModalVerifyEmail';
import ModalVerifyPhone from './ModalVerifyPhone';
import ModalResetPassword from './ModalResetPassword';
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
    organization: '',
    slug: '',
    email: '',
    password: ''
  });

  // États pour les modals de récupération de mot de passe
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showVerifyPhone, setShowVerifyPhone] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Générer automatiquement le slug quand l'organisation change
    if (field === 'organization' && value.length >= 8) {
      const generatedSlug = generateSlug(value);
      if (generatedSlug) {
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
      }
    }
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
    if (!formData.organization || !formData.slug || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      // Construire l'email complet avec le slug
      const fullEmail = `${formData.email}@${formData.slug}.com`;

      // Vérifier que l'organisation existe
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', formData.slug)
        .single();

      if (orgError || !org) {
        toast.error('Organisation non trouvée. Vérifiez le slug ou contactez votre administrateur.');
        return;
      }

      // Authentifier l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: fullEmail,
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

  // Gestionnaires pour la récupération de mot de passe
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleEmailSent = (email: string, phone: string) => {
    setRecoveryData({ email, phone });
    setShowForgotPassword(false);
    setShowVerifyEmail(true);
  };

  const handleEmailVerified = () => {
    setShowVerifyEmail(false);
    setShowVerifyPhone(true);
  };

  const handlePhoneVerified = () => {
    setShowVerifyPhone(false);
    setShowResetPassword(true);
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setRecoveryData({ email: '', phone: '' });
    toast.success('Vous pouvez maintenant vous connecter avec votre nouveau mot de passe');
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-w-4xl mx-auto">
        {/* Header avec Logo Animé et bouton En savoir plus */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div></div> {/* Spacer */}
            <div className="flex justify-center">
              <AnimatedLogo size="large" />
            </div>
            <Button
              onClick={() => setShowHomePage(true)}
              variant="ghost"
              className="text-[#128C7E] hover:text-[#25D366] hover:bg-[#128C7E]/10 px-3 py-2"
            >
              👉 En savoir plus
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-[#128C7E] mb-2">
            Multi-Garage-Connect (MGC)
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
            {/* Organisation */}
            <div className="space-y-2">
              <Label htmlFor="organization" className="text-[#128C7E] font-medium">
                Organisation
              </Label>
              <Input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="Nom de votre organisation"
                className="w-full"
              />
            </div>

            {/* Slug généré automatiquement */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-[#128C7E] font-medium">
                Slug (généré automatiquement)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  readOnly
                  placeholder="Saisissez le nom de l'organisation"
                  className="w-full bg-gray-50"
                />
                {formData.slug && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    @{formData.slug}.com
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formData.organization.length < 8 
                  ? 'Entrez au moins 8 caractères pour générer le slug'
                  : 'Slug généré automatiquement à partir du nom de l\'organisation'
                }
              </p>
            </div>

            {/* Email interne membre */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#128C7E] font-medium">
                Email interne membre
              </Label>
              <EmailAuthInput
                slug={formData.slug}
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="prenom.nom"
              />
              <p className="text-xs text-gray-500">
                {formData.slug ? `Format : prenom.nom@${formData.slug}.com` : 'Entrez d\'abord le slug'}
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
              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <button
                  onClick={handleForgotPassword}
                  className="text-[#128C7E] hover:text-[#25D366] text-sm font-medium transition-colors"
                >
                  👉 Mot de passe oublié ?
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <Button
              onClick={handleAuth}
              disabled={isLoading || !formData.organization || !formData.slug || !formData.email || !formData.password}
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
            Multi-Garage-Connect (MGC) - Solution professionnelle de gestion multi-garages
          </p>
          <p className="mt-1">
            Support : support@garageconnect.com
          </p>
        </div>
      </div>

      {/* Modals de récupération de mot de passe */}
      <ModalForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onEmailSent={handleEmailSent}
      />

      <ModalVerifyEmail
        isOpen={showVerifyEmail}
        onClose={() => setShowVerifyEmail(false)}
        onVerifySuccess={handleEmailVerified}
        email={recoveryData.email}
        phone={recoveryData.phone}
      />

      <ModalVerifyPhone
        isOpen={showVerifyPhone}
        onClose={() => setShowVerifyPhone(false)}
        onVerifySuccess={handlePhoneVerified}
        phone={recoveryData.phone}
      />

      <ModalResetPassword
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onResetSuccess={handleResetSuccess}
        email={recoveryData.email}
        phone={recoveryData.phone}
      />

      {/* Page d'accueil */}
      <HomePageModal
        isOpen={showHomePage}
        onClose={() => setShowHomePage(false)}
      />
    </WhatsAppModal>
  );
};

export default GeneralAuthModal;
