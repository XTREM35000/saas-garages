import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
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

// Define DatabaseProfile type if not already imported
type DatabaseProfile = {
  id: string;
  // Add other fields from your 'profiles' table as needed
  [key: string]: any;
};

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<OrganizationWithGarages | null>(null);

  const checkAppState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // ✅ Typage explicite sur la table "profiles"
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single<DatabaseProfile>();

        if (profileError) throw profileError;

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

        setOrganization(orgData as OrganizationWithGarages);
      }

      // ✅ Vérifier Super Admin
      const { data: superAdmins, error: superAdminError } = await supabase
        .from('super_admins')
        .select('id')
        .limit(1);

      if (superAdminError) {
        setShowSuperAdminModal(true);
        return;
      }

      if (superAdmins && superAdmins.length > 0) {
        setShowOnboarding(true);
      } else {
        setShowSuperAdminModal(true);
      }

    } catch (error) {
      console.error('Erreur checkAppState:', error);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Splash
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={2000} />;
  }

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (user && organization) {
    return (
      <AuthProvider supabaseClient={supabase}>
        <WorkflowProvider>
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
            <Toaster position="top-right" richColors />
          </Router>
        </WorkflowProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider supabaseClient={supabase}>
      <WorkflowProvider>
        {showAuthModal && (
          <GeneralAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onNewTenant={() => setShowOnboarding(true)}
            onAuthSuccess={(data) => {
              setUser(data.user);
              setOrganization(data.organization);
              setShowAuthModal(false);
            }}
          />
        )}

        {showSuperAdminModal && (
          <SuperAdminCreationModal
            isOpen={showSuperAdminModal}
            onComplete={() => window.location.reload()}
            onClose={() => setShowSuperAdminModal(false)}
          />
        )}

        {showOnboarding && (
          <NewInitializationWizard
            isOpen={showOnboarding}
            onComplete={() => window.location.reload()}
          />
        )}
        <Toaster position="top-right" richColors />
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;