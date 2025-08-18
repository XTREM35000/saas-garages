const fs = require('fs');
const path = require('path');

function addPlusToFilenames() {
  const directory = process.cwd();
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Erreur lors de la lecture du dossier:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const parsed = path.parse(file);
        
        // Vérifier si le fichier a une extension
        if (parsed.ext) {
          const newName = `${parsed.name}_plus${parsed.ext}`;
          const newPath = path.join(directory, newName);

          fs.rename(filePath, newPath, (err) => {
            if (err) {
              console.error(`Erreur lors du renommage de ${file}:`, err);
            } else {
              console.log(`Renommé: ${file} → ${newName}`);
            }
          });
        } else {
          console.log(`Fichier sans extension ignoré: ${file}`);
        }
      }
    });
  });
}

addPlusToFilenames();