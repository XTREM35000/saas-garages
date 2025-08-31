import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir les URL en chemins de fichiers (nécessaire pour ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const rootDir = '.';
const excludedDirs = ['node_modules', 'dist', 'public', 'nhost', '.vscode', '.nuxt', '.output', '.git', '.bolt', '.next', '.vercel', 'blacklist', 'config', 'scripts', 'sql'];
const excludedFiles = ['.md', '.sql', '.txt']; // Exclure tous les fichiers .md, .sql et .txt
let outputFile = 'project_structure.txt';

// Vérifier si le fichier existe déjà et l'incrémenter
let counter = 1;
while (fs.existsSync(outputFile)) {
  outputFile = `project_structure_${counter++}.txt`;
}

// Fonction récursive pour lister la structure avec indentation
function listDir(dir, indent = '') {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const isDirectory = fs.statSync(fullPath).isDirectory();

    // Exclure les dossiers spécifiés
    if (isDirectory && excludedDirs.includes(item)) continue;

    // Exclure les fichiers avec les extensions spécifiées
    if (!isDirectory && excludedFiles.some(ext => item.endsWith(ext))) continue;

    fs.appendFileSync(outputFile, `${indent}${isDirectory ? '📁' : '📄'} ${item}\n`);

    if (isDirectory) {
      listDir(fullPath, indent + '  ');
    }
  }
}

// Exécuter la fonction
fs.writeFileSync(outputFile, `Structure du projet (exclusions : ${excludedDirs.join(', ')} et fichiers ${excludedFiles.join(', ')})\n========================================\n\n`);
listDir(rootDir);
console.log(`La structure du projet a été enregistrée dans "${outputFile}"`);