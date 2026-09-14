// =============================================================================
// KALA VOICE QA — Schéma Base de Données (Drizzle ORM + SQLite)
// =============================================================================
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Utilisateurs & Auth ──────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role:         text('role').notNull().default('AGENT'), // ADMIN | MANAGER | SUPERVISOR | QA_MANAGER | TRAINER | AGENT
  department:   text('department'),
  phone:        text('phone'),
  avatarUrl:    text('avatar_url'),
  isActive:     integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt:    text('created_at').notNull(),
  lastLoginAt:  text('last_login_at'),
});

// ─── Équipes ──────────────────────────────────────────────────────────────────
export const teams = sqliteTable('teams', {
  id:                  text('id').primaryKey(),
  name:                text('name').notNull(),
  supervisorId:        text('supervisor_id'),
  supervisorName:      text('supervisor_name').notNull(),
  description:         text('description').notNull().default(''),
  memberCount:         integer('member_count').notNull().default(0),
  averageQualityScore: real('average_quality_score').notNull().default(0),
  createdAt:           text('created_at').notNull(),
});

// ─── Campagnes ────────────────────────────────────────────────────────────────
export const campaigns = sqliteTable('campaigns', {
  id:                 text('id').primaryKey(),
  name:               text('name').notNull(),
  type:               text('type').notNull().default('ENTRANT'),       // ENTRANT | SORTANT
  clientSector:       text('client_sector').notNull(),
  targetQualityScore: real('target_quality_score').notNull().default(80),
  activeAgentsCount:  integer('active_agents_count').notNull().default(0),
  totalCallsCount:    integer('total_calls_count').notNull().default(0),
  complianceRate:     real('compliance_rate').notNull().default(0),
  description:        text('description').notNull().default(''),
  createdAt:          text('created_at').notNull(),
});

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agents = sqliteTable('agents', {
  id:                      text('id').primaryKey(),
  userId:                  text('user_id'),
  name:                    text('name').notNull(),
  email:                   text('email').notNull(),
  avatarUrl:               text('avatar_url').notNull().default(''),
  teamId:                  text('team_id').notNull(),
  teamName:                text('team_name').notNull(),
  campaignId:              text('campaign_id').notNull(),
  campaignName:            text('campaign_name').notNull(),
  hireDate:                text('hire_date').notNull(),
  seniority:               text('seniority').notNull(),
  status:                  text('status').notNull().default('ACTIF'),
  callsAnalyzedCount:      integer('calls_analyzed_count').notNull().default(0),
  averageQualityScore:     real('average_quality_score').notNull().default(0),
  monthlyScoresJson:       text('monthly_scores_json').notNull().default('[]'),
  strengthsJson:           text('strengths_json').notNull().default('[]'),
  improvementAxesJson:     text('improvement_axes_json').notNull().default('[]'),
  assignedCoachingPlanId:  text('assigned_coaching_plan_id'),
  completedTrainingsCount: integer('completed_trainings_count').notNull().default(0),
  complianceRate:          real('compliance_rate').notNull().default(0),
});

// ─── Appels ───────────────────────────────────────────────────────────────────
export const calls = sqliteTable('calls', {
  id:                   text('id').primaryKey(),
  callNumber:           text('call_number').notNull().unique(),
  agentId:              text('agent_id').notNull(),
  agentName:            text('agent_name').notNull(),
  teamId:               text('team_id').notNull(),
  campaignId:           text('campaign_id').notNull(),
  campaignName:         text('campaign_name').notNull(),
  customerPhoneMasked:  text('customer_phone_masked').notNull(),
  customerNameMasked:   text('customer_name_masked').notNull(),
  callDate:             text('call_date').notNull(),
  durationSeconds:      integer('duration_seconds').notNull().default(0),
  direction:            text('direction').notNull().default('ENTRANT'),
  callType:             text('call_type').notNull().default('SUPPORT_TECHNIQUE'),
  audioMetadataJson:    text('audio_metadata_json').notNull().default('{}'),
  transcriptionJson:    text('transcription_json').notNull().default('{}'),
  analyticsJson:        text('analytics_json').notNull().default('{}'),
  qualityEvaluationId:  text('quality_evaluation_id'),
  qualityScore:         real('quality_score'),
  isUrgentReviewRequired: integer('is_urgent_review_required', { mode: 'boolean' }).notNull().default(false),
  notes:                text('notes'),
  createdAt:            text('created_at').notNull(),
});

// ─── Évaluations Qualité ──────────────────────────────────────────────────────
export const evaluations = sqliteTable('evaluations', {
  id:                  text('id').primaryKey(),
  callId:              text('call_id').notNull(),
  agentId:             text('agent_id').notNull(),
  evaluatorId:         text('evaluator_id').notNull(),
  evaluatorName:       text('evaluator_name').notNull(),
  formTitle:           text('form_title').notNull(),
  overallScore:        real('overall_score').notNull().default(0),
  aiSuggestedScore:    real('ai_suggested_score').notNull().default(0),
  status:              text('status').notNull().default('PROPOSITION_IA'),
  itemsJson:           text('items_json').notNull().default('[]'),
  strengthsJson:       text('strengths_json').notNull().default('[]'),
  weaknessesJson:      text('weaknesses_json').notNull().default('[]'),
  potentialErrorsJson: text('potential_errors_json').notNull().default('[]'),
  unmetCriteriaCount:  integer('unmet_criteria_count').notNull().default(0),
  recommendationsJson: text('recommendations_json').notNull().default('[]'),
  evaluatorFinalNotes: text('evaluator_final_notes').notNull().default(''),
  evaluatedAt:         text('evaluated_at').notNull(),
  validatedAt:         text('validated_at'),
});

// ─── Critères Qualité ─────────────────────────────────────────────────────────
export const qualityCriteria = sqliteTable('quality_criteria', {
  id:            text('id').primaryKey(),
  category:      text('category').notNull(),
  categoryLabel: text('category_label').notNull(),
  label:         text('label').notNull(),
  description:   text('description').notNull(),
  maxScore:      real('max_score').notNull().default(5),
  weight:        real('weight').notNull().default(10),
  isCritical:    integer('is_critical', { mode: 'boolean' }).notNull().default(false),
});

// ─── Plans de Coaching ────────────────────────────────────────────────────────
export const coachingPlans = sqliteTable('coaching_plans', {
  id:                       text('id').primaryKey(),
  agentId:                  text('agent_id').notNull(),
  agentName:                text('agent_name').notNull(),
  trainerId:                text('trainer_id').notNull(),
  trainerName:              text('trainer_name').notNull(),
  createdAt:                text('created_at').notNull(),
  targetCompletionDate:     text('target_completion_date').notNull(),
  status:                   text('status').notNull().default('ACTIF'),
  overallObjectiveSummary:  text('overall_objective_summary').notNull().default(''),
  strengthsSummaryJson:     text('strengths_summary_json').notNull().default('[]'),
  improvementAxesSummaryJson: text('improvement_axes_summary_json').notNull().default('[]'),
  objectivesJson:           text('objectives_json').notNull().default('[]'),
  trainerNotes:             text('trainer_notes').notNull().default(''),
  nextSessionDate:          text('next_session_date'),
  progressionPercentage:    real('progression_percentage').notNull().default(0),
});

// ─── Modules de Formation ─────────────────────────────────────────────────────
export const trainingModules = sqliteTable('training_modules', {
  id:                          text('id').primaryKey(),
  code:                        text('code').notNull(),
  title:                       text('title').notNull(),
  category:                    text('category').notNull(),
  durationMinutes:             integer('duration_minutes').notNull().default(60),
  description:                 text('description').notNull().default(''),
  targetCompetenciesJson:      text('target_competencies_json').notNull().default('[]'),
  interactiveSimulationsCount: integer('interactive_simulations_count').notNull().default(0),
  difficultyLevel:             text('difficulty_level').notNull().default('INTERMÉDIAIRE'),
});

// ─── Sessions de Formation ────────────────────────────────────────────────────
export const trainingSessions = sqliteTable('training_sessions', {
  id:                          text('id').primaryKey(),
  agentId:                     text('agent_id').notNull(),
  agentName:                   text('agent_name').notNull(),
  trainerId:                   text('trainer_id').notNull(),
  trainerName:                 text('trainer_name').notNull(),
  moduleId:                    text('module_id').notNull(),
  moduleTitle:                 text('module_title').notNull(),
  scheduledDate:               text('scheduled_date').notNull(),
  status:                      text('status').notNull().default('PLANIFIÉE'),
  scoreObtained:               real('score_obtained'),
  preTrainingQualityScore:     real('pre_training_quality_score').notNull().default(0),
  postTrainingQualityScore:    real('post_training_quality_score'),
  upliftPercentage:            real('uplift_percentage'),
  trainerFeedback:             text('trainer_feedback').notNull().default(''),
  simulationExercisesJson:     text('simulation_exercises_json').notNull().default('[]'),
});

// ─── Expérimentations ASR ─────────────────────────────────────────────────────
export const experimentConfigs = sqliteTable('experiment_configs', {
  id:                      text('id').primaryKey(),
  name:                    text('name').notNull(),
  category:                text('category').notNull(),
  audioPreprocessingMethod: text('audio_preprocessing_method').notNull(),
  asrModel:                text('asr_model').notNull(),
  denoiserAlgorithm:       text('denoiser_algorithm').notNull(),
  postProcessingApplied:   text('post_processing_applied').notNull(),
  estimatedRtf:            real('estimated_rtf').notNull().default(0),
  averageWer:              real('average_wer').notNull().default(0),
  averageCer:              real('average_cer').notNull().default(0),
  snrImprovementDb:        real('snr_improvement_db').notNull().default(0),
  confidenceScoreAvg:      real('confidence_score_avg').notNull().default(0),
});

export const benchmarkSamples = sqliteTable('benchmark_samples', {
  id:                  text('id').primaryKey(),
  sampleName:          text('sample_name').notNull(),
  audioDurationSeconds: real('audio_duration_seconds').notNull().default(0),
  noiseType:           text('noise_type').notNull(),
  inputSnrDb:          real('input_snr_db').notNull().default(0),
  groundTruthText:     text('ground_truth_text').notNull(),
  resultsJson:         text('results_json').notNull().default('[]'),
});

// ─── Journal d'Audit ──────────────────────────────────────────────────────────
export const auditLogs = sqliteTable('audit_logs', {
  id:             text('id').primaryKey(),
  timestamp:      text('timestamp').notNull(),
  userId:         text('user_id').notNull(),
  userName:       text('user_name').notNull(),
  userRole:       text('user_role').notNull(),
  action:         text('action').notNull(),
  targetResource: text('target_resource').notNull(),
  details:        text('details').notNull(),
  ipAddress:      text('ip_address').notNull().default('127.0.0.1'),
});
