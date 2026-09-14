// =============================================================================
// KALA VOICE QA — Seed de la Base de Données avec les Données Initiales
// =============================================================================
import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import db from './index.js';
import * as schema from './schema.js';
import { sql } from 'drizzle-orm';

// Créer les tables si elles n'existent pas
function createTables() {
  const sqlite = (db as any).session.client;
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'AGENT',
      department TEXT, phone TEXT, avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, last_login_at TEXT
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, supervisor_id TEXT,
      supervisor_name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      member_count INTEGER NOT NULL DEFAULT 0,
      average_quality_score REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'ENTRANT',
      client_sector TEXT NOT NULL, target_quality_score REAL NOT NULL DEFAULT 80,
      active_agents_count INTEGER NOT NULL DEFAULT 0,
      total_calls_count INTEGER NOT NULL DEFAULT 0,
      compliance_rate REAL NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY, user_id TEXT, name TEXT NOT NULL, email TEXT NOT NULL,
      avatar_url TEXT NOT NULL DEFAULT '', team_id TEXT NOT NULL,
      team_name TEXT NOT NULL, campaign_id TEXT NOT NULL,
      campaign_name TEXT NOT NULL, hire_date TEXT NOT NULL,
      seniority TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIF',
      calls_analyzed_count INTEGER NOT NULL DEFAULT 0,
      average_quality_score REAL NOT NULL DEFAULT 0,
      monthly_scores_json TEXT NOT NULL DEFAULT '[]',
      strengths_json TEXT NOT NULL DEFAULT '[]',
      improvement_axes_json TEXT NOT NULL DEFAULT '[]',
      assigned_coaching_plan_id TEXT,
      completed_trainings_count INTEGER NOT NULL DEFAULT 0,
      compliance_rate REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY, call_number TEXT NOT NULL UNIQUE,
      agent_id TEXT NOT NULL, agent_name TEXT NOT NULL,
      team_id TEXT NOT NULL, campaign_id TEXT NOT NULL,
      campaign_name TEXT NOT NULL, customer_phone_masked TEXT NOT NULL,
      customer_name_masked TEXT NOT NULL, call_date TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      direction TEXT NOT NULL DEFAULT 'ENTRANT',
      call_type TEXT NOT NULL DEFAULT 'SUPPORT_TECHNIQUE',
      audio_metadata_json TEXT NOT NULL DEFAULT '{}',
      transcription_json TEXT NOT NULL DEFAULT '{}',
      analytics_json TEXT NOT NULL DEFAULT '{}',
      quality_evaluation_id TEXT, quality_score REAL,
      is_urgent_review_required INTEGER NOT NULL DEFAULT 0,
      notes TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY, call_id TEXT NOT NULL, agent_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL, evaluator_name TEXT NOT NULL,
      form_title TEXT NOT NULL, overall_score REAL NOT NULL DEFAULT 0,
      ai_suggested_score REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PROPOSITION_IA',
      items_json TEXT NOT NULL DEFAULT '[]',
      strengths_json TEXT NOT NULL DEFAULT '[]',
      weaknesses_json TEXT NOT NULL DEFAULT '[]',
      potential_errors_json TEXT NOT NULL DEFAULT '[]',
      unmet_criteria_count INTEGER NOT NULL DEFAULT 0,
      recommendations_json TEXT NOT NULL DEFAULT '[]',
      evaluator_final_notes TEXT NOT NULL DEFAULT '',
      evaluated_at TEXT NOT NULL, validated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS quality_criteria (
      id TEXT PRIMARY KEY, category TEXT NOT NULL,
      category_label TEXT NOT NULL, label TEXT NOT NULL,
      description TEXT NOT NULL, max_score REAL NOT NULL DEFAULT 5,
      weight REAL NOT NULL DEFAULT 10,
      is_critical INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS coaching_plans (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, agent_name TEXT NOT NULL,
      trainer_id TEXT NOT NULL, trainer_name TEXT NOT NULL,
      created_at TEXT NOT NULL, target_completion_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIF',
      overall_objective_summary TEXT NOT NULL DEFAULT '',
      strengths_summary_json TEXT NOT NULL DEFAULT '[]',
      improvement_axes_summary_json TEXT NOT NULL DEFAULT '[]',
      objectives_json TEXT NOT NULL DEFAULT '[]',
      trainer_notes TEXT NOT NULL DEFAULT '',
      next_session_date TEXT,
      progression_percentage REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS training_modules (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, title TEXT NOT NULL,
      category TEXT NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 60,
      description TEXT NOT NULL DEFAULT '',
      target_competencies_json TEXT NOT NULL DEFAULT '[]',
      interactive_simulations_count INTEGER NOT NULL DEFAULT 0,
      difficulty_level TEXT NOT NULL DEFAULT 'INTERMÉDIAIRE'
    );
    CREATE TABLE IF NOT EXISTS training_sessions (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, agent_name TEXT NOT NULL,
      trainer_id TEXT NOT NULL, trainer_name TEXT NOT NULL,
      module_id TEXT NOT NULL, module_title TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PLANIFIÉE',
      score_obtained REAL, pre_training_quality_score REAL NOT NULL DEFAULT 0,
      post_training_quality_score REAL, uplift_percentage REAL,
      trainer_feedback TEXT NOT NULL DEFAULT '',
      simulation_exercises_json TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS experiment_configs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      audio_preprocessing_method TEXT NOT NULL, asr_model TEXT NOT NULL,
      denoiser_algorithm TEXT NOT NULL, post_processing_applied TEXT NOT NULL,
      estimated_rtf REAL NOT NULL DEFAULT 0,
      average_wer REAL NOT NULL DEFAULT 0,
      average_cer REAL NOT NULL DEFAULT 0,
      snr_improvement_db REAL NOT NULL DEFAULT 0,
      confidence_score_avg REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS benchmark_samples (
      id TEXT PRIMARY KEY, sample_name TEXT NOT NULL,
      audio_duration_seconds REAL NOT NULL DEFAULT 0,
      noise_type TEXT NOT NULL, input_snr_db REAL NOT NULL DEFAULT 0,
      ground_truth_text TEXT NOT NULL,
      results_json TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY, timestamp TEXT NOT NULL,
      user_id TEXT NOT NULL, user_name TEXT NOT NULL,
      user_role TEXT NOT NULL, action TEXT NOT NULL,
      target_resource TEXT NOT NULL, details TEXT NOT NULL,
      ip_address TEXT NOT NULL DEFAULT '127.0.0.1'
    );
  `);
}

// ─── Données Initiales ────────────────────────────────────────────────────────
const SEED_USERS = [
  { id: 'user-admin',      name: 'Alexandre Moreau', email: 'a.moreau@kalavoice.ai',    role: 'ADMIN',      department: 'Direction Informatique & IA',      phone: '+33 1 42 68 00 01', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'user-manager',    name: 'Sophie Laurent',   email: 's.laurent@kalavoice.ai',   role: 'MANAGER',    department: 'Direction des Opérations',         phone: '+33 1 42 68 00 02', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
  { id: 'user-supervisor', name: 'Marc Vasseur',     email: 'm.vasseur@kalavoice.ai',   role: 'SUPERVISOR', department: 'Plateau Télécom',                  phone: '+33 1 42 68 00 03', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'user-qa',         name: 'Claire Delattre',  email: 'c.delattre@kalavoice.ai',  role: 'QA_MANAGER', department: 'Assurance Qualité & Conformité',   phone: '+33 1 42 68 00 04', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150' },
  { id: 'user-trainer',    name: 'Patrick Simon',    email: 'p.simon@kalavoice.ai',     role: 'TRAINER',    department: 'Académie & Formation Métier',      phone: '+33 1 42 68 00 05', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: 'user-agent-1',    name: 'Jean Dupont',      email: 'j.dupont@kalavoice.ai',    role: 'AGENT',      department: 'Équipe Alpha - Service Fibre',     phone: '+33 1 42 68 00 06', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
];

const now = () => new Date().toISOString().substring(0, 10);

async function seed() {
  console.log('🌱 Création des tables...');
  createTables();
  console.log('✅ Tables créées.');

  const sqlite = (db as any).session.client;

  // Vérifier si déjà seedé
  const count = sqlite.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) {
    console.log('⏭️  Base de données déjà initialisée, seed ignoré.');
    return;
  }

  console.log('🌱 Insertion des données initiales...');

  // Users
  const insertUser = sqlite.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department, phone, avatar_url, is_active, created_at, last_login_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);
  for (const u of SEED_USERS) {
    const hash = hashSync('kala2024!', 10);
    insertUser.run(u.id, u.name, u.email, hash, u.role, u.department, u.phone, u.avatarUrl, now(), now());
  }
  console.log(`  ✅ ${SEED_USERS.length} utilisateurs créés (mot de passe: kala2024!)`);

  // Teams
  const insertTeam = sqlite.prepare(`
    INSERT OR IGNORE INTO teams (id, name, supervisor_id, supervisor_name, description, member_count, average_quality_score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTeam.run('team-1', 'Équipe Alpha – Fibre & Mobile',    'user-supervisor', 'Marc Vasseur', 'Équipe dédiée aux abonnés Fibre et forfaits 5G.', 8, 84.2, '2024-01-20');
  insertTeam.run('team-2', 'Équipe Beta – Assurance Sinistres', 'user-supervisor', 'Marc Vasseur', 'Traitement des déclarations de sinistres auto et habitation.', 6, 79.5, '2024-02-01');
  insertTeam.run('team-3', 'Équipe Gamma – Banque Pro',         'user-supervisor', 'Marc Vasseur', 'Gestion des comptes professionnels et PME.', 7, 88.1, '2024-02-15');
  console.log('  ✅ 3 équipes créées.');

  // Campaigns
  const insertCampaign = sqlite.prepare(`
    INSERT OR IGNORE INTO campaigns (id, name, type, client_sector, target_quality_score, active_agents_count, total_calls_count, compliance_rate, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCampaign.run('camp-1', 'Télécom Fibre & Mobile — Rétention',    'ENTRANT', 'Télécommunications', 85, 24, 1420, 94.2, "Campagne de fidélisation et traitement des résiliations d'abonnements.", '2024-01-15');
  insertCampaign.run('camp-2', 'Assurance Auto & Habitation — Sinistres','ENTRANT', 'Assurances',         80, 18, 890,  88.7, 'Réception et qualification des déclarations de sinistres.', '2024-02-01');
  insertCampaign.run('camp-3', 'Banque Pro — Support PME',               'SORTANT', 'Banque & Finance',   88, 15, 640,  91.3, 'Accompagnement des clients professionnels et PME.', '2024-02-15');
  console.log('  ✅ 3 campagnes créées.');

  // Audit initial
  const insertAudit = sqlite.prepare(`
    INSERT OR IGNORE INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, target_resource, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('log-seed-1', new Date().toISOString().replace('T', ' ').substring(0, 19),
    'user-admin', 'Alexandre Moreau', 'ADMIN', 'IMPORT_AUDIO',
    'Système', 'Initialisation de la base de données KALA VOICE QA v1.0', '127.0.0.1');
  console.log('  ✅ Journal d\'audit initialisé.');

  console.log('\n🎉 Base de données KALA initialisée avec succès !');
  console.log('📧 Comptes disponibles :');
  for (const u of SEED_USERS) {
    console.log(`   ${u.role.padEnd(12)} | ${u.email.padEnd(30)} | mot de passe: kala2024!`);
  }
}

seed().catch(console.error).finally(() => process.exit(0));
