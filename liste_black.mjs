// liste_black.mjs
import fs from "fs";
import path from "path";

const ROOT = "C:/exe/SaaS-Multi-Garages/";
const BLACKLIST_DIR = path.join(ROOT, "blacklist");

// fichiers à déplacer
const filesToMove = [
  "src/contexts/AppContext.tsx",
  "src/contexts/ThemeContext.tsx",
  "src/contexts/AuthContext.tsx",
  "src/components/Wizard.tsx",
  "src/components/WorkflowWizard.tsx",
  "src/components/OnboardingWizard.tsx",
  "src/hooks/useWizard.ts",
  "src/hooks/useOnboarding.ts",
  "src/types/wizard.types.ts",
  "src/types/onboarding.types.ts",
  "src/types/workflow.d.ts",
  "src/components/modals/OnboardingModal.tsx",
  "src/components/modals/WorkflowModal.tsx",
  "src/components/modals/WizardModal.tsx",
  "src/providers/WizardProvider.tsx",
  "src/providers/OnboardingProvider.tsx",
  "src/stores/wizardStore.ts",
  "src/stores/workflowStore.ts",
  "src/stores/onboardingStore.ts",
  "src/utils/wizard.ts",
  "src/utils/workflow.ts",
  "src/utils/onboarding.ts"
];

// crée blacklist/ si inexistant
if (!fs.existsSync(BLACKLIST_DIR)) {
  fs.mkdirSync(BLACKLIST_DIR, { recursive: true });
  console.log("📂 Dossier 'blacklist/' créé.");
}

filesToMove.forEach((relPath) => {
  const sourcePath = path.join(ROOT, relPath);
  const destPath = path.join(BLACKLIST_DIR, relPath);

  if (fs.existsSync(sourcePath)) {
    // créer les sous-dossiers dans blacklist/
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    // déplacer fichier
    fs.renameSync(sourcePath, destPath);
    console.log(`✅ Déplacé : ${relPath}`);
  } else {
    console.log(`⚠️ Introuvable : ${relPath}`);
  }
});

console.log("🚀 Nettoyage terminé !");
