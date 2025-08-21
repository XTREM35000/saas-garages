import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuperAdminData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Service centralisé pour la gestion des Super Admins
 */
export class SuperAdminService {
  
  /**
   * Vérifie si un Super Admin existe déjà dans le système
   */
  static async checkSuperAdminExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ [SuperAdminService] Erreur vérification:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('❌ [SuperAdminService] Erreur inattendue:', error);
      return false;
    }
  }

  /**
   * Crée un Super Admin complet (auth + profil + super_admins)
   * Utilisé lors de la première inscription si aucun Super Admin n'existe
   */
  static async createSuperAdmin(userData: SuperAdminData): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      console.log('🔐 [SuperAdminService] Création Super Admin:', userData.email);

      // Vérifier qu'aucun Super Admin n'existe déjà
      const existingSuper = await this.checkSuperAdminExists();
      if (existingSuper) {
        return { success: false, error: 'Un Super Admin existe déjà' };
      }

      // Utiliser la fonction RPC pour la création complète
      const { data: result, error } = await (supabase as any).rpc('create_super_admin_complete', {
        p_email: userData.email,
        p_password: userData.password,
        p_name: userData.name,
        p_phone: userData.phone || null
      });

      if (error) {
        console.error('❌ [SuperAdminService] Erreur RPC:', error);
        return { success: false, error: error.message };
      }

      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log('✅ [SuperAdminService] Super Admin créé:', result.user_id);
      toast.success('Super Admin créé avec succès!');
      
      return { success: true, userId: result.user_id };

    } catch (error: any) {
      console.error('❌ [SuperAdminService] Erreur création:', error);
      const errorMessage = error.message || 'Erreur lors de la création du Super Admin';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Transforme un utilisateur normal en Super Admin
   * Utilisé si on veut promouvoir un utilisateur existant
   */
  static async promoteToSuperAdmin(userId: string, userData: Partial<SuperAdminData>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('⬆️ [SuperAdminService] Promotion en Super Admin:', userId);

      // Vérifier qu'aucun Super Admin n'existe déjà
      const existingSuper = await this.checkSuperAdminExists();
      if (existingSuper) {
        return { success: false, error: 'Un Super Admin existe déjà' };
      }

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'superadmin',
          is_superadmin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Ajouter dans super_admins
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          user_id: userId,
          email: userData.email || '',
          name: userData.name || '',
          phone: userData.phone,
          est_actif: true,
          created_at: new Date().toISOString()
        });

      if (superAdminError) throw superAdminError;

      console.log('✅ [SuperAdminService] Utilisateur promu en Super Admin');
      toast.success('Promotion réussie!');
      
      return { success: true };

    } catch (error: any) {
      console.error('❌ [SuperAdminService] Erreur promotion:', error);
      const errorMessage = error.message || 'Erreur lors de la promotion';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Vérifie si l'utilisateur connecté est un Super Admin
   */
  static async isCurrentUserSuperAdmin(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('est_actif', true)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Détermine si c'est la première inscription (aucun utilisateur dans le système)
   */
  static async isFirstUser(): Promise<boolean> {
    try {
      // Vérifier s'il y a des utilisateurs dans auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) return false;

      // S'il n'y a aucun utilisateur ou seulement l'utilisateur actuel
      return !authUsers.users || authUsers.users.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Gestion automatique : crée un Super Admin si c'est le premier utilisateur
   */
  static async handleFirstUserRegistration(authData: AuthData): Promise<{ isSuperAdmin: boolean; userId?: string }> {
    try {
      const isFirst = await this.isFirstUser();
      const hasSuper = await this.checkSuperAdminExists();

      // Si c'est le premier utilisateur ET qu'aucun Super Admin n'existe
      if (isFirst && !hasSuper) {
        console.log('🎯 [SuperAdminService] Premier utilisateur détecté, création automatique Super Admin');
        
        const result = await this.createSuperAdmin({
          name: authData.name,
          email: authData.email,
          password: authData.password,
          phone: authData.phone
        });

        if (result.success) {
          return { isSuperAdmin: true, userId: result.userId };
        }
      }

      return { isSuperAdmin: false };
    } catch (error) {
      console.error('❌ [SuperAdminService] Erreur gestion premier utilisateur:', error);
      return { isSuperAdmin: false };
    }
  }
}