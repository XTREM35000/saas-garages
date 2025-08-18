const fs = require('fs');
const path = require('path');

function removePlusFromFilenames() {
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
        
        // Vérifier si le fichier contient '_plus' avant l'extension
        if (parsed.name.endsWith('_plus') && parsed.ext) {
          const originalName = `${parsed.name.slice(0, -5)}${parsed.ext}`;
          const originalPath = path.join(directory, originalName);

          fs.rename(filePath, originalPath, (err) => {
            if (err) {
              console.error(`Erreur lors du renommage de ${file}:`, err);
            } else {
              console.log(`Renommé: ${file} → ${originalName}`);
            }
          });
        }
      }
    });
  });
}

removePlusFromFilenames();