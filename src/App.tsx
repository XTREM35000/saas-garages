import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import GeneralAuthModal from '@/components/GeneralAuthModal';
import NewInitializationWizard from '@/components/NewInitializationWizard';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import './styles/globals.css';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  // Vérifier l'état de l'application au chargement
  useEffect(() => {
    const checkAppState = async () => {
      try {
        console.log('🚀 Vérification de l\'état de l\'application...');

        // 1. Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('✅ Utilisateur connecté:', session.user.email);
          setUser(session.user);

          // 2. Récupérer le profil et l'organisation
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('❌ Erreur profil:', profileError);
            setShowAuthModal(true);
            return;
          }

          if (profile && profile.organizations) {
            console.log('✅ Organisation trouvée:', profile.organizations.name);
            setOrganization(profile.organizations);
            // Rediriger vers le dashboard
            return;
          }
        }

        // 3. Vérifier s'il y a des organisations existantes
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (orgsError) {
          console.error('❌ Erreur vérification organisations:', orgsError);
        }

        if (orgs && orgs.length > 0) {
          console.log('✅ Organisations existantes, afficher auth modal');
          setShowAuthModal(true);
        } else {
          console.log('ℹ️ Aucune organisation, lancer onboarding');
          setShowOnboarding(true);
        }

      } catch (error) {
        console.error('❌ Erreur vérification état app:', error);
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAppState();
  }, []);

  // Gestionnaire d'authentification réussie
  const handleAuthSuccess = (userData: any) => {
    console.log('✅ Authentification réussie:', userData);
    setUser(userData.user);
    setOrganization(userData.organization);
    setShowAuthModal(false);
    // Rediriger vers le dashboard
  };

  // Gestionnaire de nouveau tenant
  const handleNewTenant = () => {
    console.log('🆕 Nouveau tenant demandé');
    setShowAuthModal(false);
    setShowOnboarding(true);
  };

  // Gestionnaire de fin d'onboarding
  const handleOnboardingComplete = () => {
    console.log('✅ Onboarding terminé');
    setShowOnboarding(false);
    // Rediriger vers le dashboard ou l'auth modal selon le cas
    setShowAuthModal(true);
  };

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Changement auth:', event, session?.user?.email);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrganization(null);
          setShowAuthModal(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Vérifier l'organisation
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', session.user.id)
            .single();

          if (profile?.organizations) {
            setOrganization(profile.organizations);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-[#128C7E] mb-2">GarageConnect</h2>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté et a une organisation, afficher le dashboard
  if (user && organization) {
    return (
      <AuthProvider>
        <WorkflowProvider>
          <Router>
            <div className="App">
              <Dashboard user={user} organization={organization} />
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </WorkflowProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <WorkflowProvider>
        <div className="App">
          {/* Modal d'authentification générale */}
          {showAuthModal && (
            <GeneralAuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onNewTenant={handleNewTenant}
              onAuthSuccess={handleAuthSuccess}
            />
          )}

          {/* Workflow d'onboarding pour nouveaux tenants */}
          {showOnboarding && (
            <NewInitializationWizard
              isOpen={showOnboarding}
              onComplete={handleOnboardingComplete}
            />
          )}

          <Toaster position="top-right" richColors />
        </div>
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;
