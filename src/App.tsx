import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import GeneralAuthModal from '@/components/GeneralAuthModal';
import NewInitializationWizard from '@/components/NewInitializationWizard';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';
//import {organizations} from '@/integrations/supabase/types';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import { User } from '@supabase/supabase-js';
// import { Organization, Garage } from '@/types/organization';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Garage } from '@/types/supabase.ts';
import { OrganizationData, ExtendedUser } from '@/types/database';
import { PostgrestSingleResponse } from '@/types/supabase';

// Define ExtendedUser type to extend User with garageData
interface ExtendedUser extends User {
  garageData: Garage | {};
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fonction pour vérifier l'état de l'application
  const checkAppState = async () => {
    try {
      console.log('🚀 Vérification de l\'état de l\'application...');

      // 1. Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('✅ Utilisateur connecté:', session.user.email);
        setUser(session.user);

        // Requête séparée pour les profils et organisations
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Requête pour l'organisation
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select(`
            id,
            name,
            created_at,
            user_id,
            garages (
              id,
              name,
              address,
              phone,
              created_at
            )
          `)
          .eq('user_id', session.user.id)
          .single<OrganizationData>();  // Notez le typage explicite ici

        if (orgError) throw orgError;

        if (orgData) {
          // Créer l'utilisateur étendu avec le premier garage s'il existe
          const extendedUser: ExtendedUser = {
            ...session.user,
            garageData: orgData.garages?.[0] || null
          };

          setUser(extendedUser);
          setOrganization(orgData);
          // Rediriger vers le dashboard
          return;
        }
      }

      // 4. Vérifier s'il y a un Super Admin dans la base
      const { data: superAdmins, error: superAdminError } = await supabase
        .from('super_admins')
        .select('id')
        .limit(1);

      if (superAdminError) {
        console.error('❌ Erreur vérification Super Admin:', superAdminError);
        // En cas d'erreur, afficher le modal Super Admin par défaut
        setShowSuperAdminModal(true);
        return;
      }

      // Workflow corrigé : vérifier s'il existe un Super Admin
      if (superAdmins && superAdmins.length > 0) {
        console.log('✅ Super Admin existant, afficher le workflow d\'onboarding avec pricing');
        // Afficher le workflow d'onboarding qui commencera par la sélection du plan
        setShowOnboarding(true);
      } else {
        console.log('ℹ️ Aucun Super Admin, afficher modal de création Super Admin');
        setShowSuperAdminModal(true);
      }

    } catch (error) {
      console.error('❌ Erreur vérification état app:', error);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'état de l'application au chargement initial
  useEffect(() => {
    if (!showSplash) {
      checkAppState();
    }
  }, [showSplash]);

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

  // Gestionnaire de création du Super Admin
  const handleSuperAdminCreated = () => {
    console.log('✅ Super Admin créé');
    setShowSuperAdminModal(false);
    // Recharger la page pour vérifier l'état
    window.location.reload();
  };

  // Gestionnaire de fin d'onboarding
  const handleOnboardingComplete = () => {
    console.log('✅ Onboarding terminé');
    setShowOnboarding(false);
    // Recharger la page entièrement après l'onboarding
    window.location.reload();
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
          const { data: profile, error: profileOrgError } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', session.user.id)
            .single();

          if (
            !profileOrgError &&
            profile &&
            profile.organizations &&
            Array.isArray(profile.organizations) &&
            profile.organizations.length > 0
          ) {
            setOrganization(profile.organizations[0]);
          } else {
            setOrganization(null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Afficher le SplashScreen en premier
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(false);
          // Après le splash, vérifier l'état de l'application
          checkAppState();
        }}
        duration={3000}
      />
    );
  }

  // Afficher le loader pendant la vérification de l'état
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-[#128C7E] mb-2">Multi-Garage-Connect (MGC)</h2>
          <p className="text-gray-600">Vérification de votre espace...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté et a une organisation, afficher le dashboard
  if (user && organization) {
    return (
      <AuthProvider supabaseClient={supabase}>
        <WorkflowProvider>
          <Router>
            <div className="App">
              <Dashboard
                user={user}
                organization={organization}
                themeColor="#128C7E"
                ownerName={organization?.name || "Owner"}
              />
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </WorkflowProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider supabaseClient={supabase}>
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

          {/* Modal de création Super Admin */}
          {showSuperAdminModal && (
            <SuperAdminCreationModal
              isOpen={showSuperAdminModal}
              onComplete={handleSuperAdminCreated}
              onClose={() => setShowSuperAdminModal(false)}
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
