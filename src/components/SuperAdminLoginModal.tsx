import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { EmailFieldPro } from '@/components/ui/email-field-pro';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { WorkflowModalProps } from '@/types/workflow.types';

interface SuperAdmin {
  id: string;
  created_at: string;
}

interface Profile {
  id: string;
  role: string;
  email: string;
  created_at: string;
}

interface SuperAdminLoginModalProps extends Partial<WorkflowModalProps> {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (data: { user: any; profile: any }) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

const SuperAdminLoginModal: React.FC<SuperAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onComplete
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const testConnection = async () => {
    try {
      console.log('🔍 Test connexion Supabase...');

      // Test 1: Configuration
      // console.log('📋 Config:', {
      //   url: supabase.supabaseUrl,
      //   hasKey: !!supabase.supabaseKey
      // });

      // Test 2: Session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session:', {
        hasSession: !!sessionData.session,
        error: sessionError?.message || null
      });

      // Test 3: Temporairement désactivé
      console.log('🗄️ DB Test: Temporairement désactivé');

      return !sessionError;
    } catch (err) {
      console.error('❌ Erreur test connexion:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Tentative de connexion
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error('❌ Erreur connexion:', signInError);
        throw new Error(
          signInError.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect'
            : 'Erreur de connexion'
        );
      }

      if (!signInData?.user) {
        throw new Error('Utilisateur non trouvé');
      }

      // 2. VÉRIFICATION RÉELLE DU RÔLE SUPER_ADMIN
      console.log('🔍 Vérification rôle super_admin...');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .eq('role', 'super_admin')
        .single();

      if (profileError || !profileData) {
        console.error('❌ Accès refusé - Pas super_admin:', profileError);

        // Déconnexion pour sécurité
        await supabase.auth.signOut();

        throw new Error('Accès réservé aux Super Administrateurs');
      }

      console.log('✅ Super Admin confirmé:', profileData);

      // 3. Succès
      const userData = {
        user: signInData.user,
        profile: profileData
      };

      toast.success('Connexion Super Admin réussie ! 🎉');
      handleSuccess(userData);
      onClose();

    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', password: '' });
      setShowPassword(false);
      onClose();
    }
  };

  const handleSuccess = async (data: { user: any; profile: any }) => {
    await onLoginSuccess(data);
    onComplete?.(); // Appel optionnel de onComplete
  };

  // Gestion du drag vertical
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    // Empêcher le drag horizontal excessif
    if (Math.abs(info.offset.x) > 50) {
      return;
    }

    // Limiter le drag vertical
    const maxDragY = 200;
    const clampedY = Math.max(-maxDragY, Math.min(maxDragY, info.offset.y));
    setDragY(clampedY);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);

    // Empêcher la fermeture accidentelle lors du drag horizontal
    if (Math.abs(info.offset.x) > 100) {
      // Reset position sans fermer
      setDragY(0);
      return;
    }

    // Fermer seulement si le drag vertical est suffisant ET vers le bas avec une vitesse importante
    if (info.offset.y > 200 && info.velocity.y > 500) {
      handleClose();
    } else {
      // Reset position avec animation fluide
      setDragY(0);
    }
  };

  // Gestion de la touche Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '' });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: dragY,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 300,
              y: { type: "spring", damping: 25, stiffness: 300 }
            }
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: { duration: 0.2 }
          }}
          drag="y"
          dragConstraints={{ top: -100, bottom: 300 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className={cn(
            "w-full max-w-md bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden",
            isDragging && "cursor-grabbing"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec bouton de fermeture */}
          <div className="relative p-6 pb-0">
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Accès Sécurisé
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Authentification requise pour accéder au tableau de bord Super Admin
              </p>
            </div>
          </div>

          <Card className="m-6 mt-4">
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Accès restreint</p>
                    <p>Seuls les Super Admins peuvent accéder à cette section.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <EmailFieldPro
                  label="Email Super Admin"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  disabled={isLoading}
                  required
                  placeholder="admin"
                />

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Vérification en cours...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  Pour la démo : utilisez un email contenant "admin" et un mot de passe de 6+ caractères
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer avec branding Thierry Gogo */}
          <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-lg">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuperAdminLoginModal;
