# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4caafa13-4f3f-4367-8985-4b012d111331

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4caafa13-4f3f-4367-8985-4b012d111331) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4caafa13-4f3f-4367-8985-4b012d111331) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# SaaS Multi-Garages

## 🚀 Workflow de Démarrage

1. **Initialisation**
   - Vérification de l'authentification
   - Vérification de l'existence d'un Super Admin

2. **Configuration Super Admin**
   - Si aucun Super Admin n'existe
   - Création du premier compte Super Admin
   - Configuration initiale de l'application

3. **Configuration Organisation**
   - Création de l'organisation
   - Configuration des paramètres de base

4. **Configuration Garage**
   - Ajout du premier garage
   - Configuration des services

## 🔧 Structure du Projet

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables
│   ├── modals/          # Modaux du workflow
│   └── layout/          # Composants de mise en page
├── contexts/
│   ├── WorkflowProvider.tsx  # Gestion du workflow
│   └── ThemeProvider.tsx     # Gestion du thème
├── hooks/
│   └── useWorkflowCheck.ts   # Hook de vérification workflow
└── types/
    └── workflow.types.ts     # Types du workflow
```

## 🏁 Pour Démarrer

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```

3. Lancer le projet :
```bash
npm run dev
```
