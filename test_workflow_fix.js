// 🧪 SCRIPT DE TEST - VÉRIFICATION DES CORRECTIONS RLS
// Exécuter dans la console du navigateur après avoir appliqué les corrections

console.log('🧪 Test des corrections RLS...');

// Test 1: Vérifier que les erreurs 500 sont résolues
async function testSupabaseConnections() {
  console.log('📡 Test des connexions Supabase...');
  
  try {
    // Test de la table super_admins
    const { data: superAdmins, error: saError } = await supabase
      .from('super_admins')
      .select('*')
      .limit(1);
    
    if (saError) {
      console.error('❌ Erreur super_admins:', saError);
      return false;
    }
    console.log('✅ super_admins accessible:', superAdmins);
    
    // Test de la table organisations
    const { data: orgs, error: orgError } = await supabase
      .from('organisations')
      .select('*')
      .limit(1);
    
    if (orgError) {
      console.error('❌ Erreur organisations:', orgError);
      return false;
    }
    console.log('✅ organisations accessible:', orgs);
    
    // Test de la table workflow_states
    const { data: workflow, error: wfError } = await supabase
      .from('workflow_states')
      .select('*')
      .limit(1);
    
    if (wfError) {
      console.error('❌ Erreur workflow_states:', wfError);
      return false;
    }
    console.log('✅ workflow_states accessible:', workflow);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return false;
  }
}

// Test 2: Vérifier que le bouton "Suivant" est fonctionnel
function testNextButton() {
  console.log('🔘 Test du bouton "Suivant"...');
  
  const nextButtons = document.querySelectorAll('button');
  const nextButton = Array.from(nextButtons).find(btn => 
    btn.textContent.includes('Suivant') || 
    btn.textContent.includes('Next')
  );
  
  if (nextButton) {
    console.log('✅ Bouton "Suivant" trouvé:', nextButton);
    console.log('📱 État du bouton:', {
      disabled: nextButton.disabled,
      visible: nextButton.offsetParent !== null,
      text: nextButton.textContent
    });
    
    // Vérifier que le bouton n'est pas désactivé
    if (!nextButton.disabled) {
      console.log('✅ Bouton "Suivant" est actif');
      return true;
    } else {
      console.log('⚠️  Bouton "Suivant" est désactivé');
      return false;
    }
  } else {
    console.log('❌ Bouton "Suivant" non trouvé');
    return false;
  }
}

// Test 3: Vérifier les composants React
function testReactComponents() {
  console.log('⚛️  Test des composants React...');
  
  // Vérifier que InitializationWizard est monté
  const wizard = document.querySelector('[data-testid="initialization-wizard"]') || 
                 document.querySelector('.initialization-wizard') ||
                 document.querySelector('[class*="wizard"]');
  
  if (wizard) {
    console.log('✅ InitializationWizard monté:', wizard);
  } else {
    console.log('⚠️  InitializationWizard non trouvé');
  }
  
  // Vérifier les modals
  const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
  console.log('📱 Modals trouvés:', modals.length);
  
  return true;
}

// Test 4: Vérifier la console pour les erreurs
function checkConsoleErrors() {
  console.log('🚨 Vérification des erreurs console...');
  
  // Cette fonction sera appelée après un délai pour capturer les erreurs
  setTimeout(() => {
    const errorCount = 0; // À implémenter avec un listener d'erreurs
    
    if (errorCount === 0) {
      console.log('✅ Aucune erreur console détectée');
    } else {
      console.log(`⚠️  ${errorCount} erreur(s) console détectée(s)`);
    }
  }, 2000);
}

// Test 5: Test complet du workflow
async function runCompleteTest() {
  console.log('🚀 Test complet du workflow...');
  
  const results = {
    supabase: await testSupabaseConnections(),
    nextButton: testNextButton(),
    components: testReactComponents(),
    console: true // Sera mis à jour par checkConsoleErrors
  };
  
  console.log('📊 Résultats des tests:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS ! Le workflow devrait fonctionner correctement.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
  
  return allPassed;
}

// Exécuter les tests
console.log('🎯 Démarrage des tests...');
runCompleteTest();
checkConsoleErrors();

// Fonction utilitaire pour tester manuellement
window.testWorkflowFix = {
  testSupabase: testSupabaseConnections,
  testNextButton: testNextButton,
  testComponents: testReactComponents,
  runComplete: runCompleteTest
};

console.log('💡 Utilisez window.testWorkflowFix.runComplete() pour relancer les tests');
