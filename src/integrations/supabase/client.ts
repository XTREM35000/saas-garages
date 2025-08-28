import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Singleton pattern pour éviter les instances multiples
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storageKey: 'supabase-auth'
        }
      }
    );
  }
  return supabaseInstance;
};

// Client admin séparé avec une clé de stockage différente
export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          storageKey: 'supabase-admin-auth'
        }
      }
    );
  }
  return supabaseAdminInstance;
};

// Export des instances pour la rétrocompatibilité
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();