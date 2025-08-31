//src\App.tsx
//
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import GeneralAuthModal from '@/components/GeneralAuthModal';
import NewInitializationWizard from '@/components/NewInitializationWizard';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { OrganizationWithGarages } from '@/types/organization';
import { useAuthSession } from '@/hooks/useAuthSession';

// Define DatabaseProfile type if not already imported
type DatabaseProfile = {
  id: string;
  // Add other fields from your 'profiles' table as needed
  [key: string]: any;
};

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<OrganizationWithGarages | null>(null);
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthSession();

  const startInitialization = () => {
    console.log('🚀 Démarrage du workflow d\'initialisation');
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    console.log('✅ Configuration initiale terminée');
    setShowWizard(false);
    toast.success('Configuration initiale terminée ! 🎉');
    checkAppState(); // Recharger l'état de l'application
  };

  const checkAppState = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setShowAuthModal(true);
        return;
      }

      setUser(session.user);

      // Vérifier le profil et l'organisation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.organizations?.length > 0) {
        setOrganization(profile.organizations[0]);
      } else {
        // Pas d'organisation → démarrer le workflow
        startInitialization();
      }

    } catch (error) {
      console.error('❌ Erreur checkAppState:', error);
      toast.error('Erreur lors de la vérification du système');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification initiale modifiée
  useEffect(() => {
    const checkInitialSetup = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Vérification configuration initiale...');

        const { data: workflowState, error } = await supabase.rpc('check_workflow_state');

        if (error) throw error;

        console.log('🔄 État workflow détaillé:', workflowState);

        // Vérification plus précise
        const needsWizard = !workflowState.has_super_admin ||
          !workflowState.has_admin ||
          !workflowState.has_organization ||
          !workflowState.has_sms_validated ||
          !workflowState.has_garage;

        if (needsWizard) {
          console.log(`⚠️ Configuration incomplète → Wizard (${workflowState.current_step})`);
          setShowWizard(true);
        } else {
          console.log('✅ Configuration complète');
          setShowWizard(false);
        }

      } catch (error) {
        console.error('❌ Erreur vérification:', error);
        toast.error('Erreur lors de la vérification du système');
      } finally {
        setIsLoading(false);
      }
    };

    // N'effectuer la vérification que si on a une session et pas déjà en cours
    if (isAuthenticated && !isLoading) {
      checkInitialSetup();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!showSplash) {
      checkAppState();
    }
  }, [showSplash]);

  // ⚡️ écoute auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrganization(null);
          setShowAuthModal(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          const { data: profile } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', session.user.id)
            .single();

          if (profile && (profile as any).organizations?.length > 0) {
            setOrganization((profile as any).organizations[0]);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Rendu conditionnel
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={2000} />;
  }

  if (isLoading || isAuthLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthProvider supabaseClient={supabase}>
      <WorkflowProvider>
        {/* Afficher le modal d'auth si nécessaire */}
        {showAuthModal && (
          <GeneralAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onNewTenant={startInitialization}
            onAuthSuccess={(data) => {
              setUser(data.user);
              setOrganization(data.organization);
              setShowAuthModal(false);
            }}
          />
        )}

        {/* N'afficher le wizard que si explicitement nécessaire */}
        {showWizard && (
          <NewInitializationWizard
            isOpen={showWizard}
            onComplete={handleWizardComplete}
          />
        )}

        {/* Le reste de votre application */}
        {!showWizard && !showAuthModal && user && organization && (
          <Router>
            <Dashboard
              user={{ ...user, garageData: null }}
              organization={{
                ...organization,
                ownerName: organization?.name || "Owner",
                themeColor: "#128C7E"
              }}
              themeColor="#128C7E"
              ownerName={organization?.name || "Owner"}
            />
          </Router>
        )}

        <Toaster position="top-right" richColors />
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;