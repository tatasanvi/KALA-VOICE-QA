-- Initial PostgreSQL schema for KALA VOICE QA, adapted from the SQLite schema.
CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'AGENT',
      department TEXT, phone TEXT, avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      must_change_password INTEGER NOT NULL DEFAULT 0,
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
