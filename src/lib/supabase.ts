import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`
    ❌ Variables d'environnement Supabase manquantes !
    Vérifiez votre fichier .env :
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
  `);
}

console.log('🔌 Initialisation Supabase avec URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Vérification de la connexion
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 État auth:', event, session?.user?.email);
});