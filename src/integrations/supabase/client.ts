// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
// Version finale pour production
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "https://bmkmiqpasfaprfpfynms.supabase.co";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJta21pcXBhc2ZhcHJmcGZ5bm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjA0MjcsImV4cCI6MjA3MjA5NjQyN30.1pwUGHwZN2Ap6rP9fnufshdzdA9vDFr5nffYnKdQBow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true }
});

// 🎯 TEST DE CONNEXION
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Connexion Supabase:', error ? '❌' : '✅', error?.message);
    return !error;
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    return false;
  }
};

export default supabase;