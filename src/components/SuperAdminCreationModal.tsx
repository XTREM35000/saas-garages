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

export const SuperAdminCreationModal: React.FC<SuperAdminCreationModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        avatarUrl: ''
      });
      setCurrentStep(1);
      setShowSuccess(false);
      setAvatarPreview(null);
    }
  }, [isOpen]);

  // Event listeners pour les pictos de test
  useEffect(() => {
    const handleFillFormError = () => {
      setFormData({
        firstName: 'A',
        lastName: 'B',
        email: 'invalid-email',
        phone: '123',
        password: 'weak',
        avatarUrl: ''
      });
    };

    const handleFillFormSuccess = () => {
      setFormData({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33 6 12 34 56 78',
        password: 'SecurePass123',
        avatarUrl: ''
      });
    };

    window.addEventListener('fillFormError', handleFillFormError);
    window.addEventListener('fillFormSuccess', handleFillFormSuccess);

    return () => {
      window.removeEventListener('fillFormError', handleFillFormError);
      window.removeEventListener('fillFormSuccess', handleFillFormSuccess);
    };
  }, []);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, avatarUrl: result }));
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const validateField = (field: string, value: string): { isValid: boolean; error?: string } => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return { isValid: false, error: 'Le prénom est requis' };
        if (value.length < 2) return { isValid: false, error: 'Le prénom doit contenir au moins 2 caractères' };
        break;
      case 'lastName':
        if (!value.trim()) return { isValid: false, error: 'Le nom est requis' };
        if (value.length < 2) return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
        break;
      case 'email':
        if (!value.trim()) return { isValid: false, error: 'L\'email est requis' };
        // Validation simplifiée : contient @ et un point après
        if (!value.includes('@') || !value.includes('.')) return { isValid: false, error: 'Format d\'email invalide' };
        break;
      case 'phone':
        if (!value.trim()) return { isValid: false, error: 'Le téléphone est requis' };
        // Validation simplifiée : au moins 8 chiffres
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 8) return { isValid: false, error: 'Format de téléphone invalide' };
        break;
      case 'password':
        if (!value.trim()) return { isValid: false, error: 'Le mot de passe est requis' };
        if (value.length < 8) return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return { isValid: false, error: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' };
        break;
    }
    return { isValid: true };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const createSuperAdmin = async (formData: FormData) => {
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

      if (!baseUrl || !serviceKey) {
        throw new Error('Configuration Supabase manquante');
      }

      console.log('🔐 Création Super Admin via API REST:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // 1. Créer l'utilisateur via l'API REST de Supabase Auth
      const authResponse = await fetch(`${baseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || '',
            avatarUrl: formData.avatarUrl || '',
            role: 'superadmin'
          }
        })
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('❌ Erreur API Auth:', errorData);
        throw {
          status: authResponse.status,
          message: errorData.error?.message || 'Erreur création utilisateur',
          code: errorData.error?.status || 'auth_error',
          details: errorData
        };
      }

      const authResult = await authResponse.json();
      const userId = authResult.id;

      if (!userId) {
        throw {
          status: 400,
          message: 'Aucun ID utilisateur retourné',
          code: 'user_creation_failed'
        };
      }

      console.log('✅ Utilisateur créé:', userId);

      // 2. Attendre que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Vérifier la création du profil et super_admin
      const supabase = createClient(baseUrl, serviceKey);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erreur profil:', profileError);
        throw {
          status: 400,
          message: 'Profil non créé automatiquement',
          code: 'profile_creation_failed',
          details: profileError
        };
      }

      const { data: superAdmin, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('id', userId)
        .single();

      if (superAdminError || !superAdmin) {
        console.error('❌ Erreur super admin:', superAdminError);
        throw {
          status: 400,
          message: 'Super Admin non créé automatiquement',
          code: 'super_admin_creation_failed',
          details: superAdminError
        };
      }

      console.log('✅ Super Admin créé avec succès:', {
        userId,
        profile: profile.id,
        superAdmin: superAdmin.id
      });

      return {
        data: {
          user: {
            id: userId,
            email: formData.email,
            role: 'superadmin'
          }
        }
      };

    } catch (error) {
      console.error('❌ Erreur création super admin:', error);
      return { error };
    }
  }
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;

    // Erreurs spécifiques de l'API Auth
    if (error?.message?.includes('User already registered')) {
      return 'Cet email est déjà utilisé.';
    }
    if (error?.message?.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (error?.message?.includes('Invalid email')) {
      return 'Format d\'email invalide.';
    }

    // Gestion des erreurs Supabase
    if (error?.code === '23505') {
      if (error.message.includes('email')) {
        return 'Cette adresse email est déjà utilisée par un autre utilisateur.';
      }
      if (error.message.includes('phone')) {
        return 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.';
      }
      return 'Une donnée similaire existe déjà dans le système.';
    }

    if (error?.code === '23503') {
      return 'Impossible de créer le Super Admin : données de référence manquantes.';
    }

    if (error?.code === '42501') {
      return 'Permission refusée. Contactez votre administrateur système.';
    }

    if (error?.code === '23514') {
      return 'Les données fournies ne respectent pas les contraintes de validation.';
    }

    if (error?.code === '42P01') {
      return 'Erreur de configuration de la base de données.';
    }

    if (error?.code === '08000') {
      return 'Erreur de connexion à la base de données.';
    }

    if (error?.code === '57014') {
      return 'Opération annulée par l\'utilisateur.';
    }

    // Erreurs HTTP
    if (error?.status === 400) {
      return 'Requête invalide. Vérifiez les données saisies.';
    }

    if (error?.status === 401) {
      return 'Non autorisé. Veuillez vous reconnecter.';
    }

    if (error?.status === 403) {
      return 'Accès interdit. Permissions insuffisantes.';
    }

    if (error?.status === 404) {
      return 'Service non trouvé. Contactez le support.';
    }

    if (error?.status === 500) {
      return 'Erreur serveur interne. Réessayez plus tard.';
    }

    if (error?.status === 503) {
      return 'Service temporairement indisponible.';
    }

    // Erreurs réseau
    if (error?.message?.includes('fetch')) {
      return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
    }

    if (error?.message?.includes('timeout')) {
      return 'Délai d\'attente dépassé. Réessayez.';
    }

    // Erreurs de validation
    if (error?.message?.includes('validation')) {
      return 'Données invalides. Vérifiez les informations saisies.';
    }

    // Erreur par défaut
    return error?.message || 'Une erreur inattendue s\'est produite. Contactez le support.';
  };

  if (showSuccess) {
    return (
      <WhatsAppModal isOpen={isOpen} onClose={onClose}>
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-green-500 text-3xl">✅</div>
          </div>
          <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Super Administrateur créé !</h3>
          <p className="text-gray-600 mb-6">
            Félicitations ! Votre Super Administrateur a été créé avec succès.
          </p>
          <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto"></div>
        </div>
      </WhatsAppModal>
    );
  }

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();

    // Validate all fields before submitting
    const fields: (keyof FormData)[] = ['firstName', 'lastName', 'email', 'phone', 'password'];
    for (const field of fields) {
      const { isValid, error } = validateField(field, formData[field]);
      if (!isValid) {
        toast.error(error || 'Champ invalide');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/functions/create-super-admin-with-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          avatarUrl: formData.avatarUrl
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      toast.success('Super Admin créé avec succès !');
      onComplete(result.data);
      onClose();

    } catch (error: any) {
      console.error('❌ Erreur création super admin:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }
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
