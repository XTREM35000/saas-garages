import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { SuperAdminService } from '@/services/superAdminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, User, Phone, Lock, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface EnhancedAuthFormProps {
  onSuccess: (userData: { isSuperAdmin: boolean; userId?: string }) => void;
  isLoading?: boolean;
}

export const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({
  onSuccess,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [willBeSuperAdmin, setWillBeSuperAdmin] = useState(false);

  // Vérifier si c'est le premier utilisateur à chaque changement d'email
  React.useEffect(() => {
    const checkFirstUser = async () => {
      if (formData.email && isSignUp) {
        const isFirst = await SuperAdminService.isFirstUser();
        const hasSuper = await SuperAdminService.checkSuperAdminExists();
        setWillBeSuperAdmin(isFirst && !hasSuper);
      }
    };

    const timeoutId = setTimeout(checkFirstUser, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.email, isSignUp]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Email et mot de passe requis');
      return false;
    }

    if (isSignUp && !formData.name) {
      toast.error('Nom requis pour l\'inscription');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Mot de passe trop court (minimum 8 caractères)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Inscription avec gestion automatique Super Admin
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: formData.name,
              phone: formData.phone,
              role: willBeSuperAdmin ? 'super_admin' : 'user'
            }
          }
        });

        if (authError) throw authError;

        if (!authData.user?.id) {
          throw new Error('Erreur lors de la création du compte');
        }

        // Gestion automatique du premier utilisateur comme Super Admin
        const superAdminResult = await SuperAdminService.handleFirstUserRegistration({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });

        if (superAdminResult.isSuperAdmin) {
          toast.success('Compte Super Admin créé avec succès!');
          onSuccess({ isSuperAdmin: true, userId: superAdminResult.userId });
        } else {
          toast.success('Compte créé avec succès!');
          onSuccess({ isSuperAdmin: false, userId: authData.user.id });
        }

      } else {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          // Vérifier si c'est un Super Admin
          const isSuperAdmin = await SuperAdminService.isCurrentUserSuperAdmin();
          toast.success('Connexion réussie!');
          onSuccess({ isSuperAdmin, userId: data.user.id });
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur auth:', error);
      
      let errorMessage = 'Erreur de connexion';
      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message?.includes('duplicate')) {
        errorMessage = 'Un compte avec cet email existe déjà';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          {willBeSuperAdmin ? (
            <Crown className="h-8 w-8 text-primary" />
          ) : (
            <User className="h-8 w-8 text-primary" />
          )}
        </div>
        
        <div>
          <CardTitle className="text-xl font-bold">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          {willBeSuperAdmin && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary font-medium mt-2"
            >
              🎉 Vous deviendrez Super Administrateur !
            </motion.p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom complet"
                disabled={isSubmitting || isLoading}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone (optionnel)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="07 58 96 61 56"
                disabled={isSubmitting || isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 caractères"
                className="pr-10"
                disabled={isSubmitting || isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isSignUp ? 'Création...' : 'Connexion...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {willBeSuperAdmin ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {isSignUp ? 'Créer le compte' : 'Se connecter'}
              </div>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
              disabled={isSubmitting || isLoading}
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};