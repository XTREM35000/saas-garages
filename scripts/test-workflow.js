#!/usr/bin/env node

/**
 * Script de test pour le workflow d'onboarding
 * Usage: node scripts/test-workflow.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données de test
const testData = {
  superAdmin: {
    email: 'test-super-admin@example.com',
    password: 'testpassword123',
    name: 'Test Super Admin',
    phone: '+33123456789'
  },
  admin: {
    email: 'test-admin@example.com',
    password: 'testpassword123',
    name: 'Test Admin'
  },
  plan: {
    id: 'monthly',
    name: 'Plan Mensuel',
    price: '29.99',
    period: 'mois',
    description: 'Plan de test mensuel',
    features: ['Fonctionnalité 1', 'Fonctionnalité 2'],
    limitations: ['Limitation 1'],
    type: 'monthly'
  },
  organization: {
    name: 'Test Organization',
    phone: '+33123456789',
    email: 'contact@test-org.com',
    address: '123 Test Street',
    city: 'Paris',
    postal_code: '75001',
    country: 'France'
  },
  garage: {
    name: 'Test Garage',
    address: '456 Garage Street',
    city: 'Paris',
    postal_code: '75002',
    phone: '+33123456789',
    email: 'contact@test-garage.com',
    manager_name: 'Test Manager'
  }
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}=== ${step} ===${colors.reset}`);
  log(message, 'bright');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Tests du workflow
class WorkflowTestSuite {
  constructor() {
    this.testResults = [];
    this.currentUser = null;
  }

  async runAllTests() {
    log('🚀 Démarrage des tests du workflow d\'onboarding', 'magenta');

    try {
      await this.testDatabaseConnection();
      await this.testWorkflowTables();
      await this.testSuperAdminCreation();
      await this.testAdminCreation();
      await this.testPlanSelection();
      await this.testOrganizationCreation();
      await this.testSmsValidation();
      await this.testGarageCreation();
      await this.testWorkflowCompletion();
      await this.cleanup();

      this.printResults();
    } catch (error) {
      logError(`Erreur lors des tests: ${error.message}`);
      await this.cleanup();
      process.exit(1);
    }
  }

  async testDatabaseConnection() {
    logStep('Test de connexion', 'Vérification de la connexion à Supabase');

    try {
      const { data, error } = await supabase.from('workflow_states').select('count').limit(1);

      if (error) throw error;

      logSuccess('Connexion à la base de données réussie');
      this.testResults.push({ test: 'Database Connection', status: 'PASS' });
    } catch (error) {
      logError(`Échec de la connexion: ${error.message}`);
      this.testResults.push({ test: 'Database Connection', status: 'FAIL', error: error.message });
      throw error;
    }
  }

  async testWorkflowTables() {
    logStep('Test des tables', 'Vérification de l\'existence des tables du workflow');

    const tables = ['workflow_states', 'admin_plans', 'sms_validations'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);

        if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
          throw error;
        }

        if (error && error.code === 'PGRST116') {
          logWarning(`Table ${table} n'existe pas`);
          allTablesExist = false;
        } else {
          logSuccess(`Table ${table} existe`);
        }
      } catch (error) {
        logError(`Erreur lors de la vérification de ${table}: ${error.message}`);
        allTablesExist = false;
      }
    }

    this.testResults.push({
      test: 'Workflow Tables',
      status: allTablesExist ? 'PASS' : 'FAIL'
    });
  }

  async testSuperAdminCreation() {
    logStep('Test Super Admin', 'Création d\'un super admin de test');

    try {
      // Vérifier si un super admin existe déjà
      const { data: existingSuperAdmin } = await supabase.rpc('check_super_admin_exists');

      if (existingSuperAdmin) {
        logInfo('Un super admin existe déjà, test ignoré');
        this.testResults.push({ test: 'Super Admin Creation', status: 'SKIP' });
        return;
      }

      // Créer un super admin
      const { data, error } = await supabase.rpc('create_super_admin', {
        email: testData.superAdmin.email,
        password: testData.superAdmin.password,
        profile_data: {
          name: testData.superAdmin.name,
          phone: testData.superAdmin.phone
        }
      });

      if (error) throw error;

      if (data.success) {
        logSuccess('Super admin créé avec succès');
        this.testResults.push({ test: 'Super Admin Creation', status: 'PASS' });
      } else {
        throw new Error(data.error || 'Échec de la création du super admin');
      }
    } catch (error) {
      logError(`Échec de la création du super admin: ${error.message}`);
      this.testResults.push({
        test: 'Super Admin Creation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testAdminCreation() {
    logStep('Test Admin', 'Création d\'un admin de test');

    try {
      // Créer un admin
      const { data, error } = await supabase.rpc('create_admin', {
        email: testData.admin.email,
        password: testData.admin.password
      });

      if (error) throw error;

      if (data.success) {
        logSuccess('Admin créé avec succès');
        this.currentUser = { id: data.user_id, email: testData.admin.email };
        this.testResults.push({ test: 'Admin Creation', status: 'PASS' });
      } else {
        throw new Error(data.error || 'Échec de la création de l\'admin');
      }
    } catch (error) {
      logError(`Échec de la création de l'admin: ${error.message}`);
      this.testResults.push({
        test: 'Admin Creation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testPlanSelection() {
    logStep('Test Plan', 'Sélection d\'un plan d\'abonnement');

    try {
      if (!this.currentUser) {
        logWarning('Aucun utilisateur connecté, test ignoré');
        this.testResults.push({ test: 'Plan Selection', status: 'SKIP' });
        return;
      }

      // Insérer un plan
      const { error } = await supabase.from('admin_plans').insert({
        admin_id: this.currentUser.id,
        plan_id: testData.plan.id,
        status: 'active'
      });

      if (error) throw error;

      logSuccess('Plan sélectionné avec succès');
      this.testResults.push({ test: 'Plan Selection', status: 'PASS' });
    } catch (error) {
      logError(`Échec de la sélection du plan: ${error.message}`);
      this.testResults.push({
        test: 'Plan Selection',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testOrganizationCreation() {
    logStep('Test Organisation', 'Création d\'une organisation de test');

    try {
      if (!this.currentUser) {
        logWarning('Aucun utilisateur connecté, test ignoré');
        this.testResults.push({ test: 'Organization Creation', status: 'SKIP' });
        return;
      }

      // Créer une organisation
      const { data, error } = await supabase.from('organizations').insert({
        name: testData.organization.name,
        phone: testData.organization.phone,
        email: testData.organization.email,
        address: testData.organization.address,
        city: testData.organization.city,
        postal_code: testData.organization.postal_code,
        country: testData.organization.country,
        admin_id: this.currentUser.id,
        is_active: true
      }).select().single();

      if (error) throw error;

      logSuccess('Organisation créée avec succès');
      this.testResults.push({ test: 'Organization Creation', status: 'PASS' });

      // Sauvegarder l'ID de l'organisation pour les tests suivants
      this.organizationId = data.id;
    } catch (error) {
      logError(`Échec de la création de l'organisation: ${error.message}`);
      this.testResults.push({
        test: 'Organization Creation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testSmsValidation() {
    logStep('Test SMS', 'Test de validation SMS');

    try {
      if (!this.organizationId) {
        logWarning('Aucune organisation créée, test ignoré');
        this.testResults.push({ test: 'SMS Validation', status: 'SKIP' });
        return;
      }

      // Créer une validation SMS
      const { data, error } = await supabase.from('sms_validations').insert({
        organization_id: this.organizationId,
        phone_number: testData.organization.phone,
        validation_code: '123456',
        is_validated: true,
        validated_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      logSuccess('Validation SMS créée avec succès');
      this.testResults.push({ test: 'SMS Validation', status: 'PASS' });
    } catch (error) {
      logError(`Échec de la validation SMS: ${error.message}`);
      this.testResults.push({
        test: 'SMS Validation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testGarageCreation() {
    logStep('Test Garage', 'Création d\'un garage de test');

    try {
      if (!this.organizationId) {
        logWarning('Aucune organisation créée, test ignoré');
        this.testResults.push({ test: 'Garage Creation', status: 'SKIP' });
        return;
      }

      // Créer un garage
      const { data, error } = await supabase.from('garages').insert({
        name: testData.garage.name,
        address: testData.garage.address,
        city: testData.garage.city,
        postal_code: testData.garage.postal_code,
        phone: testData.garage.phone,
        email: testData.garage.email,
        manager_name: testData.garage.manager_name,
        organization_id: this.organizationId,
        is_active: true
      }).select().single();

      if (error) throw error;

      logSuccess('Garage créé avec succès');
      this.testResults.push({ test: 'Garage Creation', status: 'PASS' });
    } catch (error) {
      logError(`Échec de la création du garage: ${error.message}`);
      this.testResults.push({
        test: 'Garage Creation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async testWorkflowCompletion() {
    logStep('Test Completion', 'Test de completion du workflow');

    try {
      if (!this.currentUser) {
        logWarning('Aucun utilisateur connecté, test ignoré');
        this.testResults.push({ test: 'Workflow Completion', status: 'SKIP' });
        return;
      }

      // Créer un état de workflow complet
      const { error } = await supabase.from('workflow_states').upsert({
        user_id: this.currentUser.id,
        current_step: 'completed',
        completed_steps: ['super_admin', 'admin', 'pricing', 'organization', 'sms_validation', 'garage'],
        is_completed: true,
        metadata: {
          adminCredentials: { email: testData.admin.email },
          selectedPlan: testData.plan,
          organizationData: testData.organization,
          smsValidationData: { phone_number: testData.organization.phone },
          garageSetupData: testData.garage
        }
      });

      if (error) throw error;

      logSuccess('Workflow marqué comme complet');
      this.testResults.push({ test: 'Workflow Completion', status: 'PASS' });
    } catch (error) {
      logError(`Échec de la completion du workflow: ${error.message}`);
      this.testResults.push({
        test: 'Workflow Completion',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async cleanup() {
    logStep('Nettoyage', 'Suppression des données de test');

    try {
      // Supprimer les données de test
      if (this.currentUser) {
        await supabase.from('workflow_states').delete().eq('user_id', this.currentUser.id);
        await supabase.from('admin_plans').delete().eq('admin_id', this.currentUser.id);
      }

      if (this.organizationId) {
        await supabase.from('sms_validations').delete().eq('organization_id', this.organizationId);
        await supabase.from('garages').delete().eq('organization_id', this.organizationId);
        await supabase.from('organizations').delete().eq('id', this.organizationId);
      }

      // Supprimer les utilisateurs de test
      if (this.currentUser) {
        await supabase.auth.admin.deleteUser(this.currentUser.id);
      }

      logSuccess('Nettoyage terminé');
    } catch (error) {
      logWarning(`Erreur lors du nettoyage: ${error.message}`);
    }
  }

  printResults() {
    log('\n📊 Résultats des tests', 'magenta');
    log('========================');

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;

    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' :
        result.status === 'FAIL' ? '❌' : '⏭️';
      log(`${status} ${result.test}: ${result.status}`);

      if (result.error) {
        log(`   Erreur: ${result.error}`, 'red');
      }
    });

    log('\n📈 Résumé', 'magenta');
    log(`Tests réussis: ${passed}`, 'green');
    log(`Tests échoués: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`Tests ignorés: ${skipped}`, 'yellow');

    if (failed === 0) {
      log('\n🎉 Tous les tests sont passés !', 'green');
    } else {
      log('\n⚠️ Certains tests ont échoué', 'yellow');
      process.exit(1);
    }
  }
}

// Exécution des tests
async function main() {
  const testSuite = new WorkflowTestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main().catch(error => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { WorkflowTestSuite }; 