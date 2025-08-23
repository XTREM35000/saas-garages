# 🚀 Workflow Onboarding Complet - GarageConnect SaaS

## 📋 Vue d'ensemble

Ce document décrit le workflow d'onboarding complet pour le SaaS **GarageConnect**, incluant la création de Super Admin, Administrateur, Organisation, gestion des domaines dynamiques et configuration des garages.

## 🎯 Objectifs

1. **Super Admin** : Création du premier administrateur système
2. **Pricing Plan** : Sélection du plan d'abonnement
3. **Administrateur** : Création de l'administrateur de l'organisation
4. **Organisation** : Configuration de l'organisation avec slug et domaine
5. **SMS Validation** : Validation de sécurité par SMS
6. **Garage Setup** : Configuration du premier garage
7. **Domaines Dynamiques** : Gestion des sous-domaines et domaines personnalisés

---

## 🔧 Architecture Technique

### Tables de Base de Données

#### 1. `auth.users` (Supabase Auth)
- Gestion des comptes utilisateurs
- Authentification et autorisation

#### 2. `public.users`
- Profils utilisateurs étendus
- Informations personnelles et préférences

#### 3. `public.profiles`
- Métadonnées utilisateur
- Avatars et informations publiques

#### 4. `public.super_admins`
- Super administrateurs système
- Accès complet à toutes les organisations

#### 5. `public.organizations`
- Organisations clientes
- Plans d'abonnement et quotas

#### 6. `public.organization_users`
- Relation utilisateurs ↔ organisations
- Rôles et permissions

#### 7. `public.garages`
- Garages des organisations
- Géolocalisation et informations de contact

### Fonctions RPC

#### `create_super_admin`
```sql
CREATE OR REPLACE FUNCTION public.create_super_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT
) RETURNS JSON
```

#### `create_admin`
```sql
CREATE OR REPLACE FUNCTION public.create_admin(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_organization_id UUID
) RETURNS JSON
```

#### `create_organization`
```sql
CREATE OR REPLACE FUNCTION public.create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_subscription_type TEXT,
  p_admin_id UUID
) RETURNS JSON
```

#### `create_garage`
```sql
CREATE OR REPLACE FUNCTION public.create_garage(
  p_organization_id UUID,
  p_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_postal_code TEXT,
  p_country TEXT,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_phone TEXT,
  p_email TEXT,
  p_description TEXT
) RETURNS JSON
```

---

## 🚦 Étapes du Workflow

### Étape 1: Super Administrateur

#### Objectif
Créer le premier administrateur système avec des privilèges complets.

#### Processus
1. **Vérification** : Contrôler si un Super Admin existe déjà
2. **Création** : Formulaire de création avec validation
3. **Insertion** : Créer l'utilisateur dans `auth.users`
4. **Profil** : Créer les entrées dans `public.users` et `public.profiles`
5. **Privilèges** : Ajouter dans `public.super_admins`

#### Validation
- Email unique et valide
- Mot de passe fort (8+ caractères, majuscule, minuscule, chiffre)
- Prénom et nom requis
- Téléphone optionnel mais validé

#### Succès
- Message animé de bienvenue
- Progression automatique vers Pricing Plan
- Déblocage de toutes les étapes sauf Pricing

### Étape 2: Sélection du Plan

#### Objectif
Permettre au Super Admin de choisir le plan d'abonnement.

#### Plans Disponibles

##### 🆓 Gratuit
- 1 Garage
- 10 Clients maximum
- Support email
- Sous-domaine automatique

##### 💼 Pro (29€/mois)
- 5 Garages
- Clients illimités
- Support prioritaire
- Rapports avancés
- Sous-domaine automatique

##### 🏢 Enterprise (99€/mois)
- Garages illimités
- Clients illimités
- Support 24/7
- API personnalisée
- Domaine personnalisé

#### Processus
1. **Affichage** : Présentation des plans avec comparaison
2. **Sélection** : Choix du plan par l'utilisateur
3. **Validation** : Vérification des quotas et limitations
4. **Stockage** : Sauvegarde du choix dans l'organisation

#### Succès
- Message de remerciement animé
- Progression vers création Administrateur
- Déblocage de toutes les étapes sauf Admin

### Étape 3: Création de l'Administrateur

#### Objectif
Créer un administrateur pour gérer l'organisation et les garages.

#### Particularités
- **Modal jumeau** de celui du Super Admin
- **RPC dédié** : `create_admin`
- **3 tables seulement** : `auth.users`, `public.users`, `public.profiles`
- **Pas de CRUD** dans `super_admins`

#### Processus
1. **Formulaire** : Mêmes champs que Super Admin
2. **Validation** : Règles identiques
3. **Création** : Appel RPC `create_admin`
4. **Association** : Lier à l'organisation

#### Succès
- Message de confirmation animé
- Progression vers Organisation
- Déblocage de toutes les étapes sauf Organisation

### Étape 4: Création de l'Organisation

#### Objectif
Configurer l'organisation avec slug unique et domaine automatique.

#### Fonctionnalités
- **Slug automatique** : Généré à partir du nom
- **Sous-domaine** : `<slug>.garageconnect.com`
- **Email entreprise** : `prenom.nom@slug.com`
- **Plan associé** : Lier le plan choisi

#### Processus
1. **Nom** : Saisie du nom de l'organisation
2. **Génération** : Création automatique du slug
3. **Vérification** : Contrôle d'unicité du slug
4. **Création** : Appel RPC `create_organization`
5. **Domaine** : Configuration du sous-domaine

#### Exemples de Slug
- `Garage Titoh et Frères` → `titoh-et-freres`
- `Auto Service Plus` → `auto-service-plus`
- `Mécanique Express` → `mecanique-express`

#### Succès
- Message de confirmation avec URL
- Progression vers SMS Validation
- Déblocage de toutes les étapes sauf SMS

### Étape 5: Validation SMS

#### Objectif
Sécuriser l'accès par validation SMS.

#### Processus
1. **Envoi** : SMS avec code de validation
2. **Saisie** : Utilisateur entre le code reçu
3. **Vérification** : Validation du code
4. **Activation** : Compte activé et sécurisé

#### Sécurité
- Code à 6 chiffres
- Expiration après 10 minutes
- Limitation des tentatives
- Logs de sécurité

#### Succès
- Message de sécurité validée
- Progression vers Garage Setup
- Déblocage de toutes les étapes sauf Garage

### Étape 6: Configuration du Garage

#### Objectif
Configurer le premier garage de l'organisation.

#### Informations Requises
- **Nom** : Nom du garage
- **Adresse** : Adresse complète
- **Ville** : Ville du garage
- **Code postal** : Code postal
- **Pays** : Pays (défaut: France)
- **Géolocalisation** : Coordonnées GPS automatiques
- **Contact** : Téléphone et email
- **Description** : Description optionnelle

#### Fonctionnalités
- **Géolocalisation automatique** : Récupération GPS
- **Validation en temps réel** : Vérification des champs
- **Gestion des erreurs** : Messages clairs et visuels
- **Animation de succès** : Confirmation visuelle

#### Processus
1. **Formulaire** : Saisie des informations
2. **Géolocalisation** : Récupération automatique des coordonnées
3. **Validation** : Vérification de tous les champs
4. **Création** : Appel RPC `create_garage`
5. **Confirmation** : Animation de succès

#### Succès
- Animation de garage créé
- Progression vers Dashboard
- Workflow terminé

---

## 🌐 Gestion des Domaines Dynamiques

### Sous-domaines Automatiques (Basic & Pro)

#### Configuration
- **Wildcard DNS** : `*.garageconnect.com` sur Vercel
- **Génération** : Automatique basée sur le slug
- **Format** : `https://<slug>.garageconnect.com`

#### Exemples
- `https://titoh-et-freres.garageconnect.com`
- `https://auto-service-plus.garageconnect.com`
- `https://mecanique-express.garageconnect.com`

### Domaines Personnalisés (Premium)

#### Fonctionnalités
- **Domaine custom** : `titoh-garage.com`
- **API Vercel** : Provisionnement automatique
- **Configuration DNS** : CNAME ou A record
- **SSL automatique** : Certificat Let's Encrypt

#### Processus
1. **Saisie** : Utilisateur entre son domaine
2. **Vérification** : Contrôle de disponibilité
3. **Provisionnement** : Appel API Vercel
4. **Configuration** : Setup DNS automatique
5. **Activation** : Domaine actif et sécurisé

#### API Vercel
```typescript
interface VercelDomainConfig {
  name: string;
  projectId: string;
  redirects?: Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }>;
}
```

---

## 🔄 Gestion des Rechargements de Page

### Logique de Redirection

#### Si Super Admin existe
→ Ouvrir directement **Pricing Plan**

#### Si Admin existe
→ Ouvrir directement **Organisation**

#### Si Organisation existe
→ Ouvrir directement **Garage Setup**

#### Si Garage existe
→ Ouvrir **Auth** si pas de session utilisateur

### Persistance d'État
- **LocalStorage** : Sauvegarde de l'étape courante
- **Session** : Maintien du contexte utilisateur
- **Cookies** : Persistance de l'authentification

---

## 🎨 Style & UX

### Animations
- **Transitions fluides** : Entre les étapes
- **Messages animés** : Succès et erreurs
- **Feedback visuel** : Indicateurs de progression
- **Chargement** : Spinners et skeletons

### Thème
- **Couleurs WhatsApp** : `#128C7E` et `#25D366`
- **Gradients** : Transitions de couleurs
- **Icônes** : Lucide React pour la cohérence
- **Typographie** : Hiérarchie claire et lisible

### Responsive
- **Mobile First** : Design adaptatif
- **Breakpoints** : sm, md, lg, xl
- **Touch** : Interactions tactiles optimisées
- **Accessibilité** : ARIA labels et navigation clavier

---

## 🚀 Optimisation & Performance

### Code Splitting
- **Lazy Loading** : Composants chargés à la demande
- **Dynamic Imports** : Import() pour les modals
- **Bundle Analysis** : Monitoring de la taille des chunks

### Caching
- **React Query** : Cache des données API
- **LocalStorage** : Persistance des préférences
- **Service Worker** : Cache des ressources statiques

### Monitoring
- **Error Boundaries** : Capture des erreurs React
- **Logging** : Traçage des actions utilisateur
- **Analytics** : Métriques de performance

---

## 📚 Documentation des Composants

### NewInitializationWizard
Composant principal orchestrant le workflow d'onboarding.

#### Props
```typescript
interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}
```

#### États
- `currentStep`: Étape actuelle du workflow
- `completedSteps`: Étapes terminées
- `isLoading`: État de chargement
- `error`: Erreur éventuelle

### WorkflowProgressBar
Barre de progression visuelle du workflow.

#### Props
```typescript
interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}
```

### SuperAdminCreationModal
Modal de création du Super Administrateur.

#### Props
```typescript
interface SuperAdminCreationModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onClose: () => void;
}
```

### AdminCreationModal
Modal de création de l'Administrateur.

#### Props
```typescript
interface AdminCreationModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onClose: () => void;
}
```

### OrganizationSetupModal
Modal de configuration de l'organisation.

#### Props
```typescript
interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: (orgData: any) => void;
  selectedPlan: string;
}
```

### GarageSetupModal
Modal de configuration du garage.

#### Props
```typescript
interface GarageSetupModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  organizationName: string;
}
```

---

## 🔒 Sécurité

### Authentification
- **Supabase Auth** : Gestion sécurisée des sessions
- **JWT Tokens** : Tokens d'accès sécurisés
- **Refresh Tokens** : Renouvellement automatique
- **Logout** : Déconnexion sécurisée

### Autorisation
- **RLS Policies** : Row Level Security
- **Rôles** : Super Admin, Admin, User
- **Permissions** : Contrôle d'accès granulaire
- **Audit** : Logs des actions sensibles

### Validation
- **Frontend** : Validation en temps réel
- **Backend** : Validation côté serveur
- **Sanitization** : Nettoyage des entrées
- **Rate Limiting** : Protection contre les abus

---

## 🧪 Tests

### Tests Unitaires
- **Composants** : Rendu et interactions
- **Hooks** : Logique métier
- **Utilitaires** : Fonctions helper
- **Types** : Validation TypeScript

### Tests d'Intégration
- **Workflow** : Parcours complet
- **API** : Appels RPC
- **Base de données** : Opérations CRUD
- **Authentification** : Flux de connexion

### Tests E2E
- **Parcours utilisateur** : Scénarios complets
- **Responsive** : Différents appareils
- **Performance** : Temps de chargement
- **Accessibilité** : Navigation clavier et lecteurs d'écran

---

## 📋 Checklist de Déploiement

### Prérequis
- [ ] Base de données Supabase configurée
- [ ] Tables créées avec RLS activé
- [ ] Fonctions RPC déployées
- [ ] Variables d'environnement configurées
- [ ] API Vercel configurée (domaines personnalisés)

### Déploiement
- [ ] Migrations appliquées
- [ ] Composants compilés sans erreur
- [ ] Tests passés
- [ ] Build de production réussi
- [ ] Déploiement sur Vercel/Netlify

### Post-déploiement
- [ ] Vérification du workflow complet
- [ ] Test des domaines dynamiques
- [ ] Validation de la sécurité
- [ ] Monitoring des performances
- [ ] Documentation utilisateur

---

## 🎯 Prochaines Étapes

### Phase 2: Fonctionnalités Avancées
- **Multi-tenancy** : Isolation complète des organisations
- **API REST** : Endpoints pour intégrations tierces
- **Webhooks** : Notifications en temps réel
- **Analytics** : Tableaux de bord avancés

### Phase 3: Écosystème
- **Marketplace** : Applications tierces
- **Intégrations** : ERP, CRM, outils comptables
- **Mobile** : Applications iOS et Android
- **Offline** : Synchronisation hors ligne

---

## 📞 Support & Maintenance

### Documentation
- **README** : Guide d'installation
- **API Docs** : Documentation des endpoints
- **Troubleshooting** : Solutions aux problèmes courants
- **Changelog** : Historique des versions

### Support
- **Email** : support@garageconnect.com
- **Chat** : Support en ligne intégré
- **Tickets** : Système de suivi des incidents
- **FAQ** : Questions fréquemment posées

---

*Document créé le : ${new Date().toLocaleDateString('fr-FR')}*
*Version : 1.0.0*
*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
