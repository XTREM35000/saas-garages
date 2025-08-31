import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // 🎯 SUPPRIMEZ L'ANCIEN PROJET
      '/functions': {
        target: 'https://bmkmiqpasfaprfpfynms.supabase.co', // ← NOUVEAU PROJET
        changeOrigin: true,
        secure: true
      },
      '/api': {
        target: 'https://bmkmiqpasfaprfpfynms.supabase.co/functions/v1', // ← NOUVEAU
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));