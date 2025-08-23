# Script PowerShell pour appliquer la correction du workflow_states
# Date: 2025-01-27

Write-Host "🔧 Application de la correction workflow_states..." -ForegroundColor Green

# Configuration Supabase
$SUPABASE_URL = "https://metssugfqsnttghfrsxx.supabase.co"
$SUPABASE_ANON_KEY = "VOTRE_SUPABASE_ANON_KEY" # À remplacer par votre vraie clé

# SQL pour ajouter la contrainte unique
$SQL_FIX = @"
-- Ajouter une contrainte unique sur user_id
ALTER TABLE public.workflow_states 
ADD CONSTRAINT workflow_states_user_id_unique UNIQUE (user_id);

-- Vérifier que la contrainte a été ajoutée
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'workflow_states' 
    AND tc.constraint_type = 'UNIQUE';
"@

Write-Host "📝 SQL à exécuter :" -ForegroundColor Yellow
Write-Host $SQL_FIX -ForegroundColor Cyan

Write-Host "`n🚀 Instructions d'application :" -ForegroundColor Green
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Naviguez vers Database > SQL Editor" -ForegroundColor White
Write-Host "3. Copiez-collez le SQL ci-dessus" -ForegroundColor White
Write-Host "4. Exécutez la requête" -ForegroundColor White
Write-Host "5. Vérifiez que la contrainte unique a été ajoutée" -ForegroundColor White

Write-Host "`n✅ Après application, testez le workflow :" -ForegroundColor Green
Write-Host "- Rechargez la page d'initialisation" -ForegroundColor White
Write-Host "- Vérifiez qu'il n'y a plus d'erreurs 400" -ForegroundColor White
Write-Host "- Confirmez la progression automatique vers pricing_selection" -ForegroundColor White

Write-Host "`n📚 Documentation : docs/GUIDE_CORRECTION_WORKFLOW_STATES.md" -ForegroundColor Blue
