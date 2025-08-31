import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

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
      console.log('🔐 [SuperAdminService] Tentative création Super Admin:', {
        email: userData.email,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ')[1] || ''
      });

      // Vérification préliminaire
      const existingSuper = await this.checkSuperAdminExists();
      if (existingSuper) {
        console.warn('⚠️ Un Super Admin existe déjà');
        return { success: false, error: 'Un Super Admin existe déjà' };
      }

      // Utiliser directement l'API REST de Supabase Auth
      const baseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const serviceKey = import.meta.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

      if (!baseUrl || !serviceKey) {
        throw new Error('Configuration Supabase manquante');
      }

      console.log('📡 Appel API Supabase Auth...');

      // 1. Créer l'utilisateur via l'API REST
      const authResponse = await fetch(`${baseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            firstName: userData.name.split(' ')[0],
            lastName: userData.name.split(' ')[1] || '',
            phone: userData.phone || '',
            avatarUrl: '',
            role: 'superadmin'
          }
        })
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('❌ Erreur API Auth:', errorData);
        throw new Error(errorData.error?.message || 'Erreur création utilisateur');
      }

      const authResult = await authResponse.json();
      const userId = authResult.id;

      if (!userId) {
        throw new Error('Aucun ID utilisateur retourné');
      }

      console.log('✅ Utilisateur créé:', userId);

      // 2. Vérifier que le profil a été créé automatiquement par le trigger
      // Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Vérifier la création du profil et super_admin
      const supabase = createClient(baseUrl, serviceKey);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erreur profil:', profileError);
        throw new Error('Profil non créé automatiquement');
      }

      const { data: superAdmin, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('id', userId)
        .single();

      if (superAdminError || !superAdmin) {
        console.error('❌ Erreur super admin:', superAdminError);
        throw new Error('Super Admin non créé automatiquement');
      }

      console.log('✅ Super Admin créé avec succès:', {
        userId,
        profile: profile.id,
        superAdmin: superAdmin.id
      });

      return { success: true, userId };

    } catch (error) {
      console.error('❌ Erreur création Super Admin:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
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