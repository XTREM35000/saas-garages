Write-Host "🧹 NETTOYAGE DU PROJET..." -ForegroundColor Green

# Liste des éléments à supprimer
$itemsToRemove = @(
    "node_modules",
    "package-lock.json", 
    ".vite",
    "dist",
    "build",
    ".npm-cache"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Write-Host "Suppression de $item..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Netoyage terminé!" -ForegroundColor Green
Write-Host "Exécutez 'npm install' pour réinstaller les dépendances" -ForegroundColor Cyan