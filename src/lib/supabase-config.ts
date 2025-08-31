// import { Database } from '@/types/database';

const validateConfig = () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('❌ Variables Supabase manquantes dans .env');
  }

  try {
    new URL(url);
  } catch {
    throw new Error('❌ URL Supabase invalide');
  }

  return { url, key };
};

const { url, key } = validateConfig();

export const SUPABASE_CONFIG = {
  url,
  key,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
      debug: import.meta.env.DEV
    },
    // db: {
    //   schema: 'public'
    // }
  }
};

// Validation au démarrage
console.log('🔧 Configuration Supabase:', {
  url: SUPABASE_CONFIG.url,
  hasKey: !!SUPABASE_CONFIG.key
});