# Script PowerShell pour corriger les problèmes de la table super_admins
# Exécute le script SQL de correction dans Supabase

Write-Host "🔧 Correction de la table super_admins..." -ForegroundColor Yellow

# Vérifier si le fichier SQL existe
$sqlFile = "sql/fix_super_admin_table.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Fichier SQL non trouvé: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Fichier SQL trouvé: $sqlFile" -ForegroundColor Green

# Lire le contenu du fichier SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "📋 Contenu du script SQL:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Instructions pour appliquer les corrections:" -ForegroundColor Yellow
Write-Host "1. Ouvrez le Supabase Dashboard" -ForegroundColor White
Write-Host "2. Allez dans SQL Editor" -ForegroundColor White
Write-Host "3. Copiez le contenu du fichier sql/fix_super_admin_table.sql" -ForegroundColor White
Write-Host "4. Collez-le dans l'éditeur SQL" -ForegroundColor White
Write-Host "5. Cliquez sur 'Run' pour exécuter le script" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Après l'exécution, vous pouvez vérifier avec le script de diagnostic:" -ForegroundColor Cyan
Write-Host "   sql/diagnostic_super_admin.sql" -ForegroundColor White
Write-Host ""

# Option pour ouvrir le fichier dans l'éditeur par défaut
$openFile = Read-Host "Voulez-vous ouvrir le fichier SQL dans l'éditeur par défaut? (y/n)"
if ($openFile -eq "y" -or $openFile -eq "Y") {
    Start-Process $sqlFile
    Write-Host "✅ Fichier ouvert dans l'éditeur" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Exécutez le script SQL dans Supabase" -ForegroundColor White
Write-Host "2. Testez la connexion Super Admin dans l'application" -ForegroundColor White
Write-Host "3. Si le problème persiste, vérifiez les logs de Supabase" -ForegroundColor White
Write-Host ""

Write-Host "✅ Script de correction prêt!" -ForegroundColor Green 