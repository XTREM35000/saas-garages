import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Loader2, Shield, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

const SuperAdminLoginModal: React.FC<SuperAdminLoginModalProps> = ({
  isOpen,
  onSuccess,
  onClose
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 [SuperAdminLogin] Tentative connexion Super Admin...');

      // Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur trouvé');
      }

      // Vérifier que l'utilisateur est bien un Super Admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .eq('role', 'super_admin')
        .single();

      if (profileError || !profileData) {
        // Déconnecter immédiatement si pas Super Admin
        await supabase.auth.signOut();
        throw new Error('Accès non autorisé - Super Admin requis');
      }

      console.log('✅ [SuperAdminLogin] Connexion Super Admin réussie');
      
      toast.success('Connexion Super Admin réussie ! 👑', {
        description: 'Accès aux fonctionnalités d\'administration'
      });

      onSuccess();

    } catch (error) {
      console.error('❌ [SuperAdminLogin] Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      toast.error('Erreur de connexion', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-purple-900">
                  Accès Super Admin
                </DialogTitle>
                <p className="text-sm text-purple-700 mt-1">
                  Connexion sécurisée
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-purple-600 hover:bg-purple-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* Badge de sécurité */}
          <div className="flex items-center justify-center space-x-2 mb-6 p-3 bg-white/50 rounded-lg border border-purple-200">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Connexion Sécurisée</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-purple-900 font-medium">
                Email Super Admin
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="admin@systeme.com"
                className="border-purple-300 focus:border-purple-500"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="admin-password" className="text-purple-900 font-medium">
                Mot de passe
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mot de passe sécurisé"
                className="border-purple-300 focus:border-purple-500"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Accéder au Dashboard
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Annuler
              </Button>
            </div>
          </form>

          {/* Informations de sécurité */}
          <div className="mt-6 p-3 bg-white/30 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-800 text-center">
              🔒 Connexion chiffrée • Accès limité aux Super Administrateurs
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminLoginModal;