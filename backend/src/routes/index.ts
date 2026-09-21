// =============================================================================
// KALA VOICE QA — Routes Quality, Agents, Teams, Campaigns, Dashboard, Audit
// =============================================================================
import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, QA_UP, TRAINER_UP, SUPERVISOR_UP, ALL_ROLES, MANAGER_UP } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';
import { canAccessCall } from '../middleware/callAccess.js';

const sqlite = () => (db as any).session.client;

// ─── Quality Evaluations ──────────────────────────────────────────────────────
export const qualityRouter = Router();

qualityRouter.get('/', requireAuth, requireRole(...QA_UP), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM evaluations ORDER BY evaluated_at DESC').all();
  res.json(rows.map((e: any) => ({
    ...e,
    items:          JSON.parse(e.items_json ?? '[]'),
    strengths:      JSON.parse(e.strengths_json ?? '[]'),
    weaknesses:     JSON.parse(e.weaknesses_json ?? '[]'),
    potentialErrors: JSON.parse(e.potential_errors_json ?? '[]'),
    recommendations: JSON.parse(e.recommendations_json ?? '[]'),
  })));
});

qualityRouter.get('/call/:callId', requireAuth, requireRole(...ALL_ROLES), (req, res) => {
  const call = sqlite().prepare('SELECT agent_id, transcription_json FROM calls WHERE id = ?').get(req.params.callId) as any;
  if (call && !canAccessCall(req.user!, call)) { res.status(404).json({ error: 'Évaluation introuvable.' }); return; }
  const row = sqlite().prepare('SELECT * FROM evaluations WHERE call_id = ?').get(req.params.callId) as any;
  if (!row) { res.status(404).json({ error: 'Évaluation introuvable.' }); return; }
  res.json({ ...row, items: JSON.parse(row.items_json ?? '[]'), strengths: JSON.parse(row.strengths_json ?? '[]'), weaknesses: JSON.parse(row.weaknesses_json ?? '[]'), recommendations: JSON.parse(row.recommendations_json ?? '[]') });
});

qualityRouter.post('/', requireAuth, requireRole(...QA_UP), (req: Request, res: Response): void => {
  const body = req.body as any;
  const id = body.id ?? `eval-${Date.now()}`;

  sqlite().prepare(`
    INSERT OR REPLACE INTO evaluations (id, call_id, agent_id, evaluator_id, evaluator_name, form_title, overall_score,
      ai_suggested_score, status, items_json, strengths_json, weaknesses_json, potential_errors_json,
      unmet_criteria_count, recommendations_json, evaluator_final_notes, evaluated_at, validated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.callId, body.agentId, req.user!.userId, req.user!.name, body.formTitle ?? 'Grille QA Standard',
    body.overallScore ?? 0, body.aiSuggestedScore ?? 0, body.status ?? 'PROPOSITION_IA',
    JSON.stringify(body.items ?? []), JSON.stringify(body.strengths ?? []),
    JSON.stringify(body.weaknesses ?? []), JSON.stringify(body.potentialErrors ?? []),
    body.unmetCriteriaCount ?? 0, JSON.stringify(body.recommendations ?? []),
    body.evaluatorFinalNotes ?? '', body.evaluatedAt ?? new Date().toISOString().replace('T', ' ').substring(0, 16),
    body.validatedAt ?? null);

  // Mettre à jour le score de l'appel
  if (body.callId) {
    sqlite().prepare('UPDATE calls SET quality_score = ?, quality_evaluation_id = ? WHERE id = ?')
      .run(body.overallScore, id, body.callId);
  }

  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'VALIDATION_QUALITE',
    `Évaluation ${id}`, `Score: ${body.overallScore}/100 — Statut: ${body.status}`, req.ip);

  res.status(201).json({ id, ...body });
});

// ─── Criteria ─────────────────────────────────────────────────────────────────
export const criteriaRouter = Router();

criteriaRouter.get('/', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  res.json(sqlite().prepare('SELECT * FROM quality_criteria ORDER BY category').all());
});

criteriaRouter.put('/:id', requireAuth, requireRole(...QA_UP), (req: Request, res: Response) => {
  const { weight, maxScore, isCritical } = req.body as any;
  sqlite().prepare('UPDATE quality_criteria SET weight = ?, max_score = ?, is_critical = ? WHERE id = ?')
    .run(weight, maxScore, isCritical ? 1 : 0, req.params.id);
  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'MODIFICATION_GRILLE',
    `Critère ${req.params.id}`, `Poids modifié à ${weight}%`, req.ip);
  res.json({ message: 'Critère mis à jour.' });
});

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentsRouter = Router();

agentsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM agents ORDER BY name').all();
  res.json(rows.map((a: any) => ({
    ...a,
    monthlyScores:   JSON.parse(a.monthly_scores_json ?? '[]'),
    strengths:       JSON.parse(a.strengths_json ?? '[]'),
    improvementAxes: JSON.parse(a.improvement_axes_json ?? '[]'),
  })));
});

agentsRouter.get('/:id', requireAuth, requireRole(...ALL_ROLES), (req, res) => {
  const a = sqlite().prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id) as any;
  if (!a) { res.status(404).json({ error: 'Agent introuvable.' }); return; }
  res.json({ ...a, monthlyScores: JSON.parse(a.monthly_scores_json ?? '[]'), strengths: JSON.parse(a.strengths_json ?? '[]'), improvementAxes: JSON.parse(a.improvement_axes_json ?? '[]') });
});

// ─── Teams & Campaigns ────────────────────────────────────────────────────────
export const teamsRouter = Router();
teamsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  res.json(sqlite().prepare('SELECT * FROM teams ORDER BY name').all());
});

export const campaignsRouter = Router();
campaignsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  res.json(sqlite().prepare('SELECT * FROM campaigns ORDER BY name').all());
});

// ─── Coaching Plans ───────────────────────────────────────────────────────────
export const coachingRouter = Router();

coachingRouter.get('/', requireAuth, requireRole(...TRAINER_UP), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM coaching_plans ORDER BY created_at DESC').all();
  res.json(rows.map((p: any) => ({
    ...p,
    objectives:       JSON.parse(p.objectives_json ?? '[]'),
    strengthsSummary: JSON.parse(p.strengths_summary_json ?? '[]'),
    improvementAxesSummary: JSON.parse(p.improvement_axes_summary_json ?? '[]'),
  })));
});

coachingRouter.get('/agent/:agentId', requireAuth, requireRole(...ALL_ROLES), (req, res) => {
  const row = sqlite().prepare('SELECT * FROM coaching_plans WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.agentId) as any;
  if (!row) { res.status(404).json({ error: 'Plan introuvable.' }); return; }
  res.json({ ...row, objectives: JSON.parse(row.objectives_json ?? '[]'), strengthsSummary: JSON.parse(row.strengths_summary_json ?? '[]') });
});

coachingRouter.post('/', requireAuth, requireRole(...TRAINER_UP), (req: Request, res: Response) => {
  const body = req.body as any;
  const id = body.id ?? `coaching-${Date.now()}`;
  sqlite().prepare(`
    INSERT OR REPLACE INTO coaching_plans (id, agent_id, agent_name, trainer_id, trainer_name, created_at,
      target_completion_date, status, overall_objective_summary, strengths_summary_json,
      improvement_axes_summary_json, objectives_json, trainer_notes, next_session_date, progression_percentage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.agentId, body.agentName, req.user!.userId, req.user!.name,
    body.createdAt ?? new Date().toISOString().substring(0, 10),
    body.targetCompletionDate, body.status ?? 'ACTIF', body.overallObjectiveSummary ?? '',
    JSON.stringify(body.strengthsSummary ?? []), JSON.stringify(body.improvementAxesSummary ?? []),
    JSON.stringify(body.objectives ?? []), body.trainerNotes ?? '',
    body.nextSessionDate ?? null, body.progressionPercentage ?? 0);
  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'CREATION_COACHING',
    `Plan Agent ${body.agentName}`, 'Plan de coaching mis à jour.', req.ip);
  res.status(201).json({ id, ...body });
});

// ─── Training ─────────────────────────────────────────────────────────────────
export const trainingRouter = Router();

trainingRouter.get('/modules', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM training_modules ORDER BY title').all();
  res.json(rows.map((m: any) => ({ ...m, targetCompetencies: JSON.parse(m.target_competencies_json ?? '[]') })));
});

trainingRouter.get('/sessions', requireAuth, requireRole(...TRAINER_UP), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM training_sessions ORDER BY scheduled_date DESC').all();
  res.json(rows.map((s: any) => ({ ...s, simulationExercises: JSON.parse(s.simulation_exercises_json ?? '[]') })));
});

trainingRouter.post('/sessions', requireAuth, requireRole(...TRAINER_UP), (req: Request, res: Response) => {
  const body = req.body as any;
  const id = body.id ?? `session-${Date.now()}`;
  sqlite().prepare(`
    INSERT INTO training_sessions (id, agent_id, agent_name, trainer_id, trainer_name, module_id, module_title,
      scheduled_date, status, score_obtained, pre_training_quality_score, post_training_quality_score,
      uplift_percentage, trainer_feedback, simulation_exercises_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.agentId, body.agentName, req.user!.userId, req.user!.name,
    body.moduleId, body.moduleTitle, body.scheduledDate, body.status ?? 'PLANIFIÉE',
    body.scoreObtained ?? null, body.preTrainingQualityScore ?? 0,
    body.postTrainingQualityScore ?? null, body.upliftPercentage ?? null,
    body.trainerFeedback ?? '', JSON.stringify(body.simulationExercises ?? []));
  res.status(201).json({ id, ...body });
});

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export const dashboardRouter = Router();

dashboardRouter.get('/metrics', requireAuth, requireRole(...SUPERVISOR_UP), (_req, res) => {
  const s = sqlite();
  const totalCalls        = (s.prepare('SELECT COUNT(*) as c FROM calls').get() as any).c;
  const analyzedCalls     = (s.prepare("SELECT COUNT(*) as c FROM calls WHERE analytics_json != '{}'").get() as any).c;
  const transcriptions    = (s.prepare("SELECT COUNT(*) as c FROM calls WHERE transcription_json != '{}'").get() as any).c;
  const avgQuality        = (s.prepare('SELECT AVG(quality_score) as a FROM calls WHERE quality_score IS NOT NULL').get() as any).a ?? 0;
  const urgentCount       = (s.prepare('SELECT COUNT(*) as c FROM calls WHERE is_urgent_review_required = 1').get() as any).c;
  const totalAgents       = (s.prepare('SELECT COUNT(*) as c FROM agents').get() as any).c;
  const totalTeams        = (s.prepare('SELECT COUNT(*) as c FROM teams').get() as any).c;
  const coachingNeeded    = (s.prepare("SELECT COUNT(*) as c FROM agents WHERE average_quality_score < 75").get() as any).c;
  const avgProgression    = (s.prepare('SELECT AVG(progression_percentage) as a FROM coaching_plans WHERE status = ?').get('ACTIF') as any).a ?? 0;
  const complianceRate    = (s.prepare('SELECT AVG(compliance_rate) as a FROM campaigns').get() as any).a ?? 0;

  res.json({
    totalCalls, analyzedCalls, transcriptionsCompleted: transcriptions,
    averageQualityScore: Math.round(avgQuality * 10) / 10,
    complianceRate: Math.round(complianceRate * 10) / 10,
    totalAgentsCount: totalAgents, totalTeamsCount: totalTeams,
    urgentReviewCallsCount: urgentCount, coachingNeededAgentsCount: coachingNeeded,
    averageProgressionPercentage: Math.round(avgProgression),
  });
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditRouter = Router();

auditRouter.get('/', requireAuth, requireRole(...MANAGER_UP), (req, res) => {
  const { limit = '100' } = req.query as { limit?: string };
  const rows = sqlite().prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(parseInt(limit));
  res.json(rows);
});

// ─── Experiment Configs ───────────────────────────────────────────────────────
export const experimentsRouter = Router();

experimentsRouter.get('/configs', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  res.json(sqlite().prepare('SELECT * FROM experiment_configs').all());
});

experimentsRouter.get('/samples', requireAuth, requireRole(...ALL_ROLES), (_req, res) => {
  const rows = sqlite().prepare('SELECT * FROM benchmark_samples').all();
  res.json(rows.map((s: any) => ({ ...s, results: JSON.parse(s.results_json ?? '[]') })));
});
