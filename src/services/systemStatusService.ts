import { supabase } from '@/integrations/supabase/client';

export interface SystemStatus {
  isEmpty: boolean;
  hasSuperAdmin: boolean;
  hasAdmins: boolean;
  hasTenants: boolean;
  hasOrganizations: boolean;
  hasGarages: boolean;
  currentStep: 'super_admin' | 'admin' | 'organization' | 'garage' | 'complete';
}

export class SystemStatusService {
  static async checkSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('🔍 [SystemStatus] Vérification état du système...');

      // Vérifications en parallèle pour optimiser les performances
      const [
        { data: superAdminData, error: superAdminError },
        { data: adminData, error: adminError },
        { data: organizationData, error: organizationError },
        { data: garageData, error: garageError }
      ] = await Promise.all([
        supabase.from('profiles').select('id').eq('role', 'super_admin').limit(1),
        supabase.from('profiles').select('id').eq('role', 'admin').limit(1),
        supabase.from('organizations').select('id').limit(1),
        supabase.from('garages').select('id').limit(1)
      ]);

      // Gestion des erreurs individuelles
      if (superAdminError) console.warn('⚠️ Erreur vérification super admin:', superAdminError);
      if (adminError) console.warn('⚠️ Erreur vérification admin:', adminError);
      if (organizationError) console.warn('⚠️ Erreur vérification organisation:', organizationError);
      if (garageError) console.warn('⚠️ Erreur vérification garage:', garageError);

      const hasSuperAdmin = (superAdminData?.length || 0) > 0;
      const hasAdmins = (adminData?.length || 0) > 0;
      const hasOrganizations = (organizationData?.length || 0) > 0;
      const hasGarages = (garageData?.length || 0) > 0;

      // Déterminer l'état du système
      const isEmpty = !hasSuperAdmin;
      const hasTenants = hasAdmins; // Un admin = un tenant potentiel

      const currentStep = this.determineCurrentStep({
        hasSuperAdmin,
        hasAdmins,
        hasOrganizations,
        hasGarages
      });

      const status: SystemStatus = {
        isEmpty,
        hasSuperAdmin,
        hasAdmins,
        hasTenants,
        hasOrganizations,
        hasGarages,
        currentStep
      };

      console.log('📊 [SystemStatus] État système:', status);
      return status;

    } catch (error) {
      console.error('❌ [SystemStatus] Erreur critique:', error);
      
      // Fallback pour éviter les pages blanches
      return {
        isEmpty: false, // Assume non-empty pour montrer la page de connexion
        hasSuperAdmin: true,
        hasAdmins: true,
        hasTenants: true,
        hasOrganizations: true,
        hasGarages: true,
        currentStep: 'complete'
      };
    }
  }

  private static determineCurrentStep(data: {
    hasSuperAdmin: boolean;
    hasAdmins: boolean;
    hasOrganizations: boolean;
    hasGarages: boolean;
  }): SystemStatus['currentStep'] {
    if (!data.hasSuperAdmin) return 'super_admin';
    if (!data.hasAdmins) return 'admin';
    if (!data.hasOrganizations) return 'organization';
    if (!data.hasGarages) return 'garage';
    return 'complete';
  }

  static async waitForSystemReady(maxAttempts = 10, delay = 1000): Promise<SystemStatus> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const status = await this.checkSystemStatus();
        console.log(`🔄 [SystemStatus] Tentative ${attempt}/${maxAttempts}:`, status);
        return status;
      } catch (error) {
        console.warn(`⚠️ [SystemStatus] Tentative ${attempt} échouée:`, error);
        
        if (attempt === maxAttempts) {
          console.error('❌ [SystemStatus] Toutes les tentatives ont échoué');
          throw error;
        }
        
        // Délai avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Impossible de vérifier l\'état du système');
  }
}