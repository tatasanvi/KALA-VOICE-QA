// =============================================================================
// KALA VOICE QA — Migration : Création des Tables SQLite au démarrage
// =============================================================================
import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import db from './index.js';

export function createTables(): void {
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
    CREATE TABLE IF NOT EXISTS revision_requests (
      id TEXT PRIMARY KEY, evaluation_id TEXT NOT NULL, call_id TEXT,
      agent_id TEXT NOT NULL, requested_by_user_id TEXT NOT NULL,
      requested_by_name TEXT NOT NULL, reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'EN_ATTENTE',
      created_at TEXT NOT NULL,
      handled_by_name TEXT, handled_at TEXT, resolution_note TEXT
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

  // Migration des rôles : exécutée à chaque démarrage, sur une base existante comme neuve.
  migrateRoles(sqlite);

  // Seed initial si la table users est vide
  const count = sqlite.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c === 0) {
    console.log('🌱 Initialisation des données par défaut...');
    seedDefaults(sqlite);
    console.log('✅ Données par défaut insérées.');
  }
}

// Migration des rôles : passage de six rôles à trois.
// MANAGER, SUPERVISOR, QA_MANAGER et TRAINER deviennent QUALITE_FORMATION.
function migrateRoles(sqlite: any): void {
  const changed = sqlite.prepare(`
    UPDATE users SET role = 'QUALITE_FORMATION'
    WHERE role IN ('MANAGER', 'SUPERVISOR', 'QA_MANAGER', 'TRAINER')
  `).run().changes;
  sqlite.prepare(`
    UPDATE audit_logs SET user_role = 'QUALITE_FORMATION'
    WHERE user_role IN ('MANAGER', 'SUPERVISOR', 'QA_MANAGER', 'TRAINER')
  `).run();
  // Comptes de démonstration de l'ancienne série (un par ancien rôle), remplacés
  // par les trois comptes ci-dessous.
  const removed = sqlite.prepare(`
    DELETE FROM users WHERE id IN ('user-manager', 'user-supervisor', 'user-qa', 'user-trainer', 'user-agent-1')
  `).run().changes;
  if (changed || removed) {
    console.log(`  ↪ Migration des rôles : ${changed} compte(s) converti(s), ${removed} ancien(s) compte(s) de démonstration retiré(s).`);
  }
}

function seedDefaults(sqlite: any): void {
  const now = new Date().toISOString().substring(0, 10);
  const hash = hashSync('kala2024!', 10);

  const users = [
    { id: 'user-admin', name: 'Alexandre Moreau', email: 'admin@kalavoice.ai',   role: 'ADMIN',             dept: 'Direction Informatique & IA',    phone: '+33 1 42 68 00 01' },
    { id: 'user-staff', name: 'Claire Delattre',  email: 'qualite@kalavoice.ai', role: 'QUALITE_FORMATION', dept: 'Qualité, Formation & Supervision', phone: '+33 1 42 68 00 02' },
    { id: 'user-agent', name: 'Jean Dupont',      email: 'agent@kalavoice.ai',   role: 'AGENT',             dept: 'Conseillers',                     phone: '+33 1 42 68 00 03' },
  ];

  const ins = sqlite.prepare(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department, phone, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`);
  for (const u of users) ins.run(u.id, u.name, u.email, hash, u.role, u.dept, u.phone, now);

  sqlite.prepare(`INSERT OR IGNORE INTO teams (id, name, supervisor_id, supervisor_name, description, member_count, average_quality_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('team-1', 'Équipe Alpha – Fibre & Mobile', 'user-staff', 'Claire Delattre', 'Équipe dédiée fibre et 5G.', 8, 84.2, '2024-01-20');

  sqlite.prepare(`INSERT OR IGNORE INTO campaigns (id, name, type, client_sector, target_quality_score, active_agents_count, total_calls_count, compliance_rate, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('camp-1', 'Télécom Fibre & Mobile — Rétention', 'ENTRANT', 'Télécommunications', 85, 24, 1420, 94.2, "Fidélisation et traitement des résiliations.", '2024-01-15');

  sqlite.prepare(`INSERT OR IGNORE INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, target_resource, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(`log-init-${Date.now()}`, new Date().toISOString().replace('T', ' ').substring(0, 19), 'user-admin', 'Système', 'ADMIN', 'IMPORT_AUDIO', 'Système', 'Base de données KALA VOICE QA initialisée v1.0', '127.0.0.1');
}
