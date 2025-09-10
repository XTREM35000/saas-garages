import React, { useState, useCallback } from 'react';
import { SystemStatus } from '@/services/systemStatusService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Crown, 
  LogIn, 
  Building2, 
  ShieldCheck,
  Plus,
  ArrowRight,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import des modaux
import OptimizedWorkflowWizard from '@/components/OptimizedWorkflowWizard';
import SuperAdminLoginModal from '@/components/SuperAdminLoginModal';

interface HomePageProps {
  systemStatus: SystemStatus;
  onSystemUpdate: () => void;
}

interface LoginFormData {
  slug: string;
  email: string;
  password: string;
}

const HomePage: React.FC<HomePageProps> = ({ 
  systemStatus,
  onSystemUpdate 
}) => {
  const [loginData, setLoginData] = useState<LoginFormData>({
    slug: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTenantWizard, setShowNewTenantWizard] = useState(false);
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);

  console.log('🏠 [HomePage] Rendu avec status:', systemStatus);

  // Déterminer quels éléments afficher
  const shouldShowLogin = systemStatus.hasTenants;
  const shouldShowNewTenant = systemStatus.hasSuperAdmin;
  const shouldShowSuperAdminAccess = systemStatus.hasSuperAdmin;

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.slug || !loginData.email || !loginData.password) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 [HomePage] Tentative connexion tenant:', loginData.slug);
      
      // Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur trouvé');
      }

      // Vérifier que l'utilisateur appartient à l'organisation avec ce slug
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('slug', loginData.slug)
        .single();

      if (orgError || !orgData) {
        throw new Error('Organisation non trouvée');
      }

      // Vérifier l'appartenance de l'utilisateur à cette organisation
      const { data: userOrgData, error: userOrgError } = await supabase
        .from('user_organization')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('organization_id', orgData.id)
        .single();

      if (userOrgError || !userOrgData) {
        throw new Error('Accès non autorisé à cette organisation');
      }

      console.log('✅ [HomePage] Connexion tenant réussie');
      toast.success(`Connexion réussie ! Bienvenue dans ${orgData.name}`, {
        description: `Rôle: ${userOrgData.role}`
      });

      // Redirection vers le dashboard tenant
      // Ici vous pouvez implémenter la navigation vers le dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('❌ [HomePage] Erreur connexion tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      toast.error('Erreur de connexion', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTenant = () => {
    console.log('➕ [HomePage] Démarrage nouveau tenant');
    setShowNewTenantWizard(true);
  };

  const handleSuperAdminAccess = () => {
    console.log('👑 [HomePage] Ouverture accès Super Admin');
    setShowSuperAdminLogin(true);
  };

  const handleWizardComplete = useCallback(async () => {
    console.log('✅ [HomePage] Workflow terminé');
    setShowNewTenantWizard(false);
    
    toast.success('Configuration terminée avec succès ! 🎉', {
      description: 'Vous pouvez maintenant vous connecter'
    });
    
    // Mettre à jour l'état du système
    await onSystemUpdate();
  }, [onSystemUpdate]);

  const handleSuperAdminLoginSuccess = useCallback(() => {
    console.log('✅ [HomePage] Connexion Super Admin réussie');
    setShowSuperAdminLogin(false);
    
    // Redirection vers dashboard Super Admin
    window.location.href = '/super-admin-dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Gestion Multi-Garages
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Plateforme centralisée pour la gestion de vos garages automobiles
          </p>
        </div>

        {/* Contenu principal selon l'état du système */}
        <div className="max-w-4xl mx-auto">
          <div className={`grid gap-8 ${shouldShowLogin ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-md mx-auto'}`}>
            
            {/* Formulaire de connexion (Scénario 3) */}
            {shouldShowLogin && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <LogIn className="w-5 h-5" />
                    <span>Connexion Tenant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTenantLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="slug" className="text-blue-800 font-medium">
                        Organisation
                      </Label>
                      <Input
                        id="slug"
                        type="text"
                        value={loginData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="nom-de-votre-garage"
                        className="border-blue-300 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-blue-800 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        className="border-blue-300 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-blue-800 font-medium">
                        Mot de passe
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Votre mot de passe"
                        className="border-blue-300 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>Connexion...</>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Se connecter
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Options et actions */}
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-indigo-900">
                  <Users className="w-5 w-5" />
                  <span>Actions Rapides</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nouveau Tenant (Scénarios 2 et 3) */}
                {shouldShowNewTenant && (
                  <Button
                    onClick={handleNewTenant}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Tenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {/* Accès Super Admin */}
                {shouldShowSuperAdminAccess && (
                  <Button
                    onClick={handleSuperAdminAccess}
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Accès Super Admin
                    <ShieldCheck className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {/* Message d'information pour scénario 2 */}
                {!shouldShowLogin && shouldShowNewTenant && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Globe className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Aucun tenant configuré</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Créez votre premier tenant pour commencer à utiliser la plateforme.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informations système (debug) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-8 border border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">État du Système (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-500 overflow-x-auto">
                  {JSON.stringify(systemStatus, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modaux */}
      {showNewTenantWizard && (
        <OptimizedWorkflowWizard
          isOpen={true}
          onComplete={handleWizardComplete}
        />
      )}

      {showSuperAdminLogin && (
        <SuperAdminLoginModal
          isOpen={true}
          onSuccess={handleSuperAdminLoginSuccess}
          onClose={() => setShowSuperAdminLogin(false)}
        />
      )}
    </div>
  );
};

export default HomePage;