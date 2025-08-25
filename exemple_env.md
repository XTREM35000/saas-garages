# Configuration des Variables d'Environnement

## Variables SUPABASE - PRODUCTION

Pour déployer votre application en production, créez un fichier `.env` avec les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=votre-projet-id

# Optionnel: Configuration supplémentaire
VITE_APP_TITLE=Multi-Garage-Connect
VITE_APP_DESCRIPTION=Système de gestion multi-garages
```

## Comment obtenir vos clés Supabase :

1. **Accédez à votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** ou créez-en un nouveau
3. **Allez dans Settings > API**
4. **Copiez les valeurs suivantes** :
   - `URL` → VITE_SUPABASE_URL
   - `anon public` → VITE_SUPABASE_PUBLISHABLE_KEY
   - `Project ID` → VITE_SUPABASE_PROJECT_ID

## Sécurité :

⚠️ **IMPORTANT** : 
- Ne jamais commiter le fichier `.env` dans votre repository
- Ajoutez `.env` dans votre `.gitignore`
- Utilisez des variables d'environnement sur votre plateforme de déploiement (Vercel, Netlify, etc.)

## Configuration de déploiement :

### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_PROJECT_ID
```

### Netlify
Ajoutez les variables dans `Site settings > Environment variables`

### Docker
```dockerfile
ENV VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
ENV VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ENV VITE_SUPABASE_PROJECT_ID=votre-projet-id
```