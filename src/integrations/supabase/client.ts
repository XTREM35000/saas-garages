import { createClient } from '@supabase/supabase-js';

// Configuration de base

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHNzdWdmcXNudHRnaGZyc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5NjEsImV4cCI6MjA2ODQyNTk2MX0.Vc0yDgzSe6iAfgUHezVKQMm4qvzMRRjCIrTTndpE1k8'; // Settings → API → anon public
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHNzdWdmcXNudHRnaGZyc3h4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg0OTk2MSwiZXhwIjoyMDY4NDI1OTYxfQ.4tlW9fADzbEjqrTJ4KwAbjm-_YsbFvLAUsopr0UtycA'; // Settings → API → service_role

// 🔥 CLIENT PRINCIPAL (pour les utilisateurs normaux)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// 🔥 CLIENT ADMIN SÉPARÉ (pour les opérations sensibles)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false, // Pas de session pour le service role
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

// Test des deux clients
export const testSupabaseClients = async () => {
  try {
    console.log('🔍 Test des clients Supabase...');

    // Test client normal
    const { data: normalData, error: normalError } = await supabase.auth.getSession();
    if (normalError) console.warn('⚠️ Client normal auth:', normalError.message);

    // Test client admin  
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.getSession();
    if (adminError) console.warn('⚠️ Client admin auth:', adminError.message);

    console.log('✅ Clients créés:', {
      normal: normalData ? 'OK' : 'Erreur',
      admin: adminData ? 'OK' : 'Erreur'
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur test clients:', error.message);
    return false;
  }
};