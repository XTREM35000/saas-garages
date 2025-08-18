const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

// Configuration des exclusions
const DOSSERS_IGNORES = new Set([
  'node_modules',
  '.git',
  'dist',
  'docs' // Ajout du dossier docs à ignorer
]);

const EXTENSIONS_IGNOREES = new Set([
  '.md' // Exclusion des fichiers Markdown
]);

// Création de l'interface pour les questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function synchroniserDossiers() {
  try {
    // 1. Demande interactive des chemins
    const source = await demanderChemin("Entrez le chemin COMPLET du dossier source: ");
    const cible = await demanderChemin("Entrez le chemin COMPLET du dossier cible: ");

    // 2. Validation des chemins
    if (!fs.existsSync(source)) throw new Error("❌ Le dossier source n'existe pas");
    if (path.resolve(source) === path.resolve(cible)) throw new Error("❌ Source et cible identiques !");

    console.log("\nDébut de la synchronisation...");
    await copierDossier(source, cible);
    console.log("\n✅ Synchronisation réussie !");

  } catch (erreur) {
    console.error("\n❌ Erreur:", erreur.message);
  } finally {
    rl.close();
  }
}

async function demanderChemin(question) {
  return new Promise((resolve) => {
    rl.question(question, (reponse) => {
      resolve(path.resolve(reponse.trim()));
    });
  });
}

async function copierDossier(source, cible) {
  // Création du dossier cible si inexistant
  if (!fs.existsSync(cible)) {
    fs.mkdirSync(cible, { recursive: true });
  }

  const elements = fs.readdirSync(source);

  for (const element of elements) {
    const cheminSource = path.join(source, element);
    const cheminCible = path.join(cible, element);
    const stats = fs.statSync(cheminSource);

    // Exclusion des dossiers indésirables
    if (stats.isDirectory()) {
      if (DOSSERS_IGNORES.has(element)) {
        console.log(`[IGNORÉ] Dossier exclu: ${element}`);
        continue;
      }
      await copierDossier(cheminSource, cheminCible);
    } else {
      // Exclusion des fichiers indésirables
      const extension = path.extname(element);
      if (EXTENSIONS_IGNOREES.has(extension)) {
        console.log(`[IGNORÉ] Fichier exclu: ${element}`);
        continue;
      }

      // Gestion des conflits de noms
      if (fs.existsSync(cheminCible)) {
        const nouveauNom = `${path.parse(element).name}_copie${extension}`;
        const nouveauChemin = path.join(cible, nouveauNom);
        fs.copyFileSync(cheminSource, nouveauChemin);
        console.log(`[COPIE] ${element} → ${nouveauNom} (conflit résolu)`);
      } else {
        fs.copyFileSync(cheminSource, cheminCible);
        console.log(`[COPIE] ${element}`);
      }
    }
  }
}

// Lancement du programme
synchroniserDossiers();