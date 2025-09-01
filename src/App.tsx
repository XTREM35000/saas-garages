// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import './App.css';

function App() {
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSuperAdminExists();
  }, []);

  const checkSuperAdminExists = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Vérification super admin...');
      
      const { data: hasSuperAdmin, error } = await supabase.rpc('check_super_admin_exists');
      
      if (error) {
        console.error('❌ Erreur RPC:', error);
        return;
      }

      console.log('✅ Super admin exists:', hasSuperAdmin);
      
      if (!hasSuperAdmin) {
        setShowSuperAdminModal(true);
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperAdminComplete = async () => {
    console.log('✅ Super admin créé avec succès');
    setShowSuperAdminModal(false);
    // Ici on peut ajouter la suite du workflow
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Vérification du système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSuperAdminModal && (
        <SuperAdminCreationModal
          isOpen={showSuperAdminModal}
          onComplete={handleSuperAdminComplete}
          onClose={() => setShowSuperAdminModal(false)}
        />
      )}
      
      {!showSuperAdminModal && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Configuration terminée !</h1>
            <p className="text-gray-600">Le système est prêt à être utilisé.</p>
          </div>
        </div>
      )}
      
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
      />
    </div>
  );
}

export default App;