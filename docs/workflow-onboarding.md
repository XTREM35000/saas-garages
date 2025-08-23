# 🚀 Workflow d'Onboarding GarageConnect

## 📋 Vue d'ensemble

Le workflow d'onboarding de GarageConnect guide les utilisateurs à travers la configuration complète de leur instance SaaS, de la création du Super Administrateur jusqu'à la configuration du premier garage.

## 🔄 Étapes du Workflow

### 1. **super_admin_check** - Vérification Super Admin
- **Objectif** : Vérifier si un Super Administrateur existe déjà
- **Action** : Si aucun Super Admin → afficher modal de création
- **Tables impactées** : `auth.users`, `public.users`, `public.profiles`, `public.super_admins`

### 2. **pricing_selection** - Sélection du Plan
- **Objectif** : Choisir le plan d'abonnement (Free, Pro, Enterprise)
- **Action** : Débloquer l'étape suivante et stocker le choix
- **Impact** : Détermine les fonctionnalités et limites disponibles

### 3. **admin_creation** - Création de l'Administrateur
- **Objectif** : Créer un administrateur pour l'organisation
- **Action** : Modal de création avec validation des champs
- **Tables impactées** : `auth.users`, `public.users`, `public.profiles`

### 4. **org_creation** - Création de l'Organisation
- **Objectif** : Créer l'organisation avec slug et domaine
- **Action** : Génération automatique du slug et sous-domaine
- **Tables impactées** : `public.organizations`, `public.organization_plans`

### 5. **sms_validation** - Validation SMS
- **Objectif** : Valider le numéro de téléphone de l'administrateur
- **Action** : Envoi et vérification du code SMS
- **Sécurité** : Protection contre les abus

### 6. **garage_setup** - Configuration du Garage
- **Objectif** : Configurer le premier garage de l'organisation
- **Action** : Formulaire de configuration avec géolocalisation
- **Tables impactées** : `public.garages`

### 7. **dashboard** - Accès au Dashboard
- **Objectif** : Redirection vers l'interface principale
- **Action** : Ouverture automatique du dashboard

## 🗄️ Structure de Base de Données

### Tables Principales

#### `auth.users` (Supabase Auth)
```sql
- id: uuid (PK)
- email: text (unique)
- phone: text
- created_at: timestamp
- updated_at: timestamp
```

#### `public.users`
```sql
- id: uuid (PK, FK vers auth.users.id)
- display_name: text
- first_name: text
- last_name: text
- phone: text
- role: text (super_admin, admin, user)
- created_at: timestamp
- updated_at: timestamp
```

#### `public.profiles`
```sql
- id: uuid (PK, FK vers public.users.id)
- avatar_url: text
- bio: text
- preferences: jsonb
- created_at: timestamp
- updated_at: timestamp
```

#### `public.super_admins`
```sql
- id: uuid (PK, FK vers public.users.id)
- permissions: jsonb
- created_at: timestamp
- updated_at: timestamp
```

#### `public.organizations`
```sql
- id: uuid (PK)
- name: text
- slug: text (unique)
- domain: text
- custom_domain: text
- plan_type: text (free, pro, enterprise)
- status: text (active, suspended, pending)
- created_at: timestamp
- updated_at: timestamp
```

#### `public.organization_plans`
```sql
- id: uuid (PK)
- organization_id: uuid (FK vers public.organizations.id)
- plan_type: text
- status: text
- start_date: timestamp
- end_date: timestamp
- created_at: timestamp
- updated_at: timestamp
```

#### `public.garages`
```sql
- id: uuid (PK)
- organization_id: uuid (FK vers public.organizations.id)
- name: text
- address: text
- city: text
- postal_code: text
- country: text
- latitude: numeric
- longitude: numeric
- phone: text
- email: text
- status: text (active, inactive)
- created_at: timestamp
- updated_at: timestamp
```

## 🔧 Fonctions RPC (Supabase)

### 1. `create_super_admin`
```sql
CREATE OR REPLACE FUNCTION create_super_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT
) RETURNS JSONB
```

**Actions** :
- Créer l'utilisateur dans `auth.users`
- Insérer dans `public.users`
- Créer le profil dans `public.profiles`
- Ajouter dans `public.super_admins`

### 2. `create_admin`
```sql
CREATE OR REPLACE FUNCTION create_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_organization_id UUID
) RETURNS JSONB
```

**Actions** :
- Créer l'utilisateur dans `auth.users`
- Insérer dans `public.users`
- Créer le profil dans `public.profiles`
- Associer à l'organisation

### 3. `create_organization`
```sql
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_plan_type TEXT,
  p_super_admin_id UUID
) RETURNS JSONB
```

**Actions** :
- Générer le slug unique
- Créer l'organisation
- Associer le plan
- Créer le sous-domaine par défaut

### 4. `is_super_admin`
```sql
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN
```

**Actions** :
- Vérifier si un Super Admin existe

## 🌐 Gestion des Domaines

### Sous-domaines Automatiques
- **Format** : `{slug}.garageconnect.com`
- **Configuration** : Wildcard DNS sur Vercel
- **Génération** : Automatique lors de la création d'organisation

### Domaines Personnalisés (Premium)
- **API** : Intégration Vercel Domains API
- **Validation** : Vérification DNS (CNAME/A record)
- **Activation** : Notification automatique

## 🎨 Interface Utilisateur

### Composants Principaux
1. **WorkflowProgressBar** - Barre de progression visuelle
2. **SuperAdminCreationModal** - Création du Super Admin
3. **PricingModal** - Sélection du plan
4. **AdminCreationModal** - Création de l'administrateur
5. **OrganizationSetupModal** - Configuration de l'organisation
6. **SmsValidationModal** - Validation SMS
7. **GarageSetupModal** - Configuration du garage

### Animations et Transitions
- **Entrée** : Modal descend légèrement pour voir le header
- **Transitions** : Animations fluides entre les étapes
- **Feedback** : Messages de succès/erreur animés

## 🔒 Sécurité

### Validation des Données
- **Email** : Format valide et unicité
- **Mot de passe** : Complexité minimale
- **Téléphone** : Format international
- **Nom** : Caractères autorisés uniquement

### Protection contre les Abus
- **Rate limiting** sur les créations
- **Validation SMS** obligatoire
- **Logs** de toutes les actions

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations
- **Modals** : Plein écran sur mobile
- **Formulaires** : Champs empilés verticalement
- **Navigation** : Menu hamburger sur mobile

## 🧪 Tests

### Port de Test
- **Port** : 8082
- **Configuration** : `vite.config.ts`
- **Nettoyage** : Suppression des fichiers de test après validation

### Scénarios de Test
1. **Workflow complet** : De A à Z
2. **Gestion des erreurs** : Validation des champs
3. **Responsive** : Différentes tailles d'écran
4. **Performance** : Temps de chargement

## 📚 Ressources

### Dépendances
- **React** : 18+
- **TypeScript** : 5+
- **Tailwind CSS** : 3+
- **Supabase** : Latest
- **Vercel** : Domains API

### Documentation
- **API Supabase** : [docs.supabase.com](https://docs.supabase.com)
- **Vercel Domains** : [vercel.com/docs/domains](https://vercel.com/docs/domains)
- **Tailwind CSS** : [tailwindcss.com/docs](https://tailwindcss.com/docs)

