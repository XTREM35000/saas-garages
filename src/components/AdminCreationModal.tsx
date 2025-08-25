import React, { useState, useEffect } from 'react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { PasswordFieldPro } from '@/components/ui/password-field-pro';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from '@/components/ui/avatar-upload';
import '../styles/whatsapp-theme.css';

interface AdminCreationModalProps {
  isOpen: boolean;
  onComplete: (adminData: any) => void;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl: string;
}

export const AdminCreationModal: React.FC<AdminCreationModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatarUrl: ''
  });

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
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
        name: 'A',
        email: 'invalid-email',
        phone: '123',
        password: 'weak',
        avatarUrl: ''
      });
    };

    const handleFillFormSuccess = () => {
      setFormData({
        name: 'Marie Dubois',
        email: 'marie.dubois@example.com',
        phone: '+33 6 98 76 54 32',
        password: 'SecureAdmin123',
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
      case 'name':
        if (!value.trim()) return { isValid: false, error: 'Le nom complet est requis' };
        if (value.length < 3) return { isValid: false, error: 'Le nom doit contenir au moins 3 caractères' };
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

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;

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
      return 'Impossible de créer l\'administrateur : données de référence manquantes.';
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

  const handleSubmit = async () => {
    // Validation des champs
    const fields: (keyof FormData)[] = ['name', 'email', 'phone', 'password'];
    for (const field of fields) {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }

    try {
      // Appel RPC pour créer l'Admin
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('create_admin_complete', {
        p_email: formData.email,
        p_password: formData.password,
        p_name: formData.name,
        p_phone: formData.phone,
        p_avatar_url: formData.avatarUrl || null
      });

      if (rpcError) {
        console.error('❌ Erreur RPC:', rpcError);
        toast.error(getErrorMessage(rpcError));
        return;
      }

      if (rpcData && rpcData.success) {
        console.log('✅ Admin créé avec succès:', rpcData);

        // Afficher le message de succès
        setShowSuccess(true);

        // Attendre 2 secondes puis continuer
        setTimeout(() => {
          setShowSuccess(false);
          // Passer les données complètes pour la progression
          onComplete({
            admin_id: rpcData.admin_id,
            user_id: rpcData.user_id,
            profile_id: rpcData.profile_id,
            admin_name: formData.name,
            success: true
          });
        }, 2000);

        toast.success('Administrateur créé avec succès ! 🎉');
      } else {
        console.error('❌ Erreur création Admin:', rpcData);
        toast.error('Erreur lors de la création de l\'administrateur');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      toast.error('Une erreur inattendue s\'est produite');
    }
  };

  if (showSuccess) {
    return (
      <WhatsAppModal isOpen={isOpen} onClose={onClose}>
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-green-500 text-3xl">✅</div>
          </div>
          <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Administrateur créé !</h3>
          <p className="text-gray-600 mb-6">
            Félicitations ! Votre administrateur a été créé avec succès.
          </p>
          <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-sm text-gray-500 mb-4">Redirection automatique vers la création de l'organisation...</p>
        </div>
      </WhatsAppModal>
    );
  }

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-4xl mx-auto">
        {/* Utilisation du composant AvatarUpload réutilisable */}
        <AvatarUpload
          avatarPreview={avatarPreview}
          onAvatarChange={handleAvatarChange}
          role="Administrateur"
          roleColor="silver"
          title="Création d'un Administrateur"
          subtitle="Configurez un administrateur pour votre organisation"
        />

        <Card className="modal-whatsapp-card">
          <CardContent className="space-y-6 p-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[#128C7E]">Informations personnelles</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#128C7E] font-medium">Nom complet</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="modal-whatsapp-input"
                    placeholder="Prénom et nom de l'administrateur"
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
                  placeholder="Adresse email de l'administrateur"
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
                disabled={!formData.name || !formData.email || !formData.phone || !formData.password}
              >
                Créer l'Administrateur
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

export default AdminCreationModal;

