import { supabase } from '@/lib/supabase';
import { parsePhoneNumber, formatPhoneForDisplay, formatPhoneForStorage } from './phoneUtils';

// Interface pour les données de migration
interface PhoneMigrationData {
  id: string;
  phone: string;
  phone_country_code: string;
  phone_formatted: string;
  phone_display: string;
}

// Fonction pour migrer les numéros de téléphone existants
export const migrateExistingPhoneNumbers = async () => {
  try {
    console.log('Début de la migration des numéros de téléphone...');

    // Migrer les numéros de téléphone des users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, phone')
      .not('phone', 'is', null)
      .neq('phone', '');

    if (usersError) {
      console.error('Erreur lors de la récupération des users:', usersError);
      return;
    }

    if (users && users.length > 0) {
      console.log(`Migration de ${users.length} numéros de téléphone users...`);
      
      for (const user of users) {
        if (user.phone) {
          const parsed = parsePhoneNumber(user.phone);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({
              phone_country_code: parsed.countryCode,
              phone_formatted: parsed.formattedStorage,
              phone_display: parsed.formattedDisplay
            })
            .eq('id', user.id);

          if (updateError) {
            console.error(`Erreur lors de la mise à jour du user ${user.id}:`, updateError);
          }
        }
      }
    }

    // Migrer les numéros de téléphone des super_admins (sans trigger)
    const { data: superAdmins, error: superAdminsError } = await supabase
      .from('super_admins')
      .select('id, phone')
      .not('phone', 'is', null)
      .neq('phone', '');

    if (superAdminsError) {
      console.error('Erreur lors de la récupération des super_admins:', superAdminsError);
      return;
    }

    if (superAdmins && superAdmins.length > 0) {
      console.log(`Migration de ${superAdmins.length} numéros de téléphone super_admins...`);
      
      for (const admin of superAdmins) {
        if (admin.phone) {
          const parsed = parsePhoneNumber(admin.phone);
          
          // Utiliser une requête SQL directe pour éviter le trigger
          const { error: updateError } = await supabase.rpc('update_super_admin_phone', {
            admin_id: admin.id,
            phone_country_code: parsed.countryCode,
            phone_formatted: parsed.formattedStorage,
            phone_display: parsed.formattedDisplay
          });

          if (updateError) {
            console.error(`Erreur lors de la mise à jour du super_admin ${admin.id}:`, updateError);
          }
        }
      }
    }

    console.log('Migration des numéros de téléphone terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
};

// Fonction pour mettre à jour un numéro de téléphone spécifique
export const updatePhoneNumber = async (
  table: 'users' | 'super_admins' | 'organizations' | 'garages',
  id: string,
  phone: string,
  countryCode: string = 'FR'
) => {
  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    
    const updateData = {
      phone_country_code: parsed.countryCode,
      phone_formatted: parsed.formattedStorage,
      phone_display: parsed.formattedDisplay
    };

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la mise à jour du numéro de téléphone dans ${table}:`, error);
      throw error;
    }

    return { success: true, parsed };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro de téléphone:', error);
    throw error;
  }
};

// Fonction pour récupérer un numéro de téléphone formaté
export const getFormattedPhoneNumber = async (
  table: 'users' | 'super_admins' | 'organizations' | 'garages',
  id: string
) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('phone, phone_country_code, phone_formatted, phone_display')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du numéro de téléphone de ${table}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du numéro de téléphone:', error);
    throw error;
  }
};

// Fonction pour valider et nettoyer un numéro de téléphone avant sauvegarde
export const preparePhoneForSave = (phone: string, countryCode: string = 'FR') => {
  const parsed = parsePhoneNumber(phone, countryCode);
  
  return {
    phone: parsed.formattedDisplay, // Pour l'affichage
    phone_country_code: parsed.countryCode,
    phone_formatted: parsed.formattedStorage, // Pour le stockage
    phone_display: parsed.formattedDisplay,
    isValid: parsed.isValid
  };
};
