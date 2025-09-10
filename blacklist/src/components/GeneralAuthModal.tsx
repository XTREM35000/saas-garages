import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Building2, Car, Wrench, Zap, Settings } from 'lucide-react';
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
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminLoginModal from './SuperAdminLoginModal';
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
  const [showSuperAdminDashboard, setShowSuperAdminDashboard] = useState(false);
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    phone: ''
  });

  // Ouvrir automatiquement le HomePageModal quand le GeneralAuthModal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setShowHomePage(true);
    }
  }, [isOpen]);

  // Vérification initiale
  useEffect(() => {
    const checkAdminExists = async () => {
      if (!isOpen) return;

      try {
        console.log('🔍 Vérification existence admin...');

        const { data: exists, error } = await supabase
          .rpc('check_admin_exists');

        if (error) throw error;

        // Si un admin existe, ne pas montrer HomePage
        if (exists) {
          console.log('✅ Admin existe déjà → Afficher login direct');
          setShowHomePage(false);
        } else {
          console.log('⚠️ Pas d\'admin → Afficher HomePage');
          setShowHomePage(true);
        }

      } catch (error) {
        console.error('❌ Erreur vérification admin:', error);
        toast.error('Erreur lors de la vérification du système');
      }
    };

    checkAdminExists();
  }, [isOpen]);

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
      // ✅ Typage explicite sur "organizations" avec jointure garages
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select(`
                  id,
                  name,
                  created_at,
                  garages (
                    id,
                    name,
                    address,
                    phone,
                    created_at
                  )
                `)
        // Adjust the filter to match your schema, e.g., filter by owner or member
        // .eq('user_id', session.user.id)
        .single();

      if (orgError || !orgData) {
        // Handle the error or missing data appropriately
        throw orgError || new Error("Organization not found");
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
      if (profile.organisation_id !== orgData.id) {
        toast.error('Accès non autorisé à cette organisation');
        return;
      }

      toast.success('Connexion réussie ! 🎉');
      onAuthSuccess({ user: authData.user, profile, organization: orgData });

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

  // Modifions aussi la fonction qui ouvre HomePage manuellement
  const handleShowHomePage = async () => {
    try {
      const { data: exists, error } = await supabase
        .rpc('check_admin_exists');

      if (error) throw error;

      if (exists) {
        toast.info('Un administrateur existe déjà dans le système');
        return;
      }

      setShowHomePage(true);
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la vérification');
    }
  };

  // Nouvelle fonction pour gérer le clic sur "Nouveau Tenant"
  const handleNewTenant = async () => {
    try {
      console.log('🔍 Vérification existence admin...');
      setIsLoading(true);

      // Vérifier si un admin existe déjà
      const { data: hasAdmin, error: adminError } = await supabase
        .rpc('check_admin_exists');

      if (adminError) throw adminError;

      if (hasAdmin) {
        console.log('✅ Admin existe déjà → Continuer vers pricing');
        // Au lieu d'afficher juste un message, on continue vers pricing
        onClose(); // Fermer le modal d'auth
        onNewTenant(); // Déclencher le workflow
      } else {
        console.log('➡️ Pas d\'admin → Démarrer workflow');
        onClose();
        onNewTenant();
      }

    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div></div> {/* Spacer */}
            <div className="flex justify-center">
              <AnimatedLogo size={64} />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleShowHomePage} // Utiliser la nouvelle fonction
                variant="ghost"
                className="text-[#128C7E] hover:text-[#25D366] hover:bg-[#128C7E]/10 px-3 py-2"
              >
                👉 En savoir plus
              </Button>
              <Button
                onClick={() => {
                  if (isSuperAdminAuthenticated) {
                    setShowSuperAdminDashboard(true);
                  } else {
                    setShowSuperAdminLogin(true);
                  }
                }}
                variant="ghost"
                className="text-[#128C7E] hover:text-[#25D366] hover:bg-[#128C7E]/10 px-3 py-2"
              >
                <Settings className="w-4 h-4 mr-1" />
                Paramètres
              </Button>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#128C7E] mb-2">
            Multi-Garage-Connect (MGC)
          </h1>
          <p className="text-lg text-gray-600">
            Plateforme de gestion multi-garages professionnelle
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span
              className="text-xl cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                setFormData({
                  organization: 'A',
                  slug: 'invalid',
                  email: 'test',
                  password: '123'
                });
              }}
            >😠</span>
            <span
              className="text-xl cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                setFormData({
                  organization: 'Garage Titoh',
                  slug: 'garage-titoh',
                  email: 'admin',
                  password: 'SecurePass123'
                });
              }}
            >😊</span>
          </div>
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
              onClick={handleNewTenant}
              disabled={isLoading}
              variant="outline"
              className="w-full py-3 text-lg border-2 border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#128C7E] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Vérification...
                </div>
              ) : (
                <>
                  <Building2 className="w-5 h-5 mr-2" />
                  Nouveau Tenant ?
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer informatif avec branding Thierry Gogo */}
        <div className="mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-4 p-4 bg-gray-50 rounded-lg">
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
          <div className="text-center text-sm text-gray-500">
            <p>
              Multi-Garage-Connect (MGC) - Solution professionnelle de gestion multi-garages
            </p>
            <p className="mt-1">
              Support : support@garageconnect.com
            </p>
          </div>
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

      {/* Modal de login Super Admin */}
      <SuperAdminLoginModal
        isOpen={showSuperAdminLogin}
        onClose={() => setShowSuperAdminLogin(false)}
        onLoginSuccess={() => {
          setIsSuperAdminAuthenticated(true);
          setShowSuperAdminDashboard(true);
        }}
      />

      {/* Tableau de bord Super Admin */}
      <SuperAdminDashboard
        isOpen={showSuperAdminDashboard}
        onClose={() => setShowSuperAdminDashboard(false)}
      />
    </WhatsAppModal>
  );
};

export default GeneralAuthModal;
