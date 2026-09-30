// =============================================================================
// KALA VOICE QA — Routes Quality, Agents, Teams, Campaigns, Dashboard, Audit
// =============================================================================
import type { Request, Response } from 'express';
import { Router } from '../utils/asyncRouter.js';
import { requireAuth, requireRole, STAFF_UP, ALL_ROLES, ADMIN_ONLY } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';
import { canAccessCall, canAccessAgent } from '../middleware/callAccess.js';

const sqlite = () => (db as any).session.client;

const toQualityEvaluation = (e: any) => ({
  id: e.id, callId: e.call_id, agentId: e.agent_id, evaluatorId: e.evaluator_id,
  evaluatorName: e.evaluator_name, formTitle: e.form_title, overallScore: e.overall_score,
  aiSuggestedScore: e.ai_suggested_score, status: e.status,
  items: JSON.parse(e.items_json ?? '[]'), strengths: JSON.parse(e.strengths_json ?? '[]'),
  weaknesses: JSON.parse(e.weaknesses_json ?? '[]'),
  potentialErrors: JSON.parse(e.potential_errors_json ?? '[]'),
  unmetCriteriaCount: e.unmet_criteria_count,
  recommendations: JSON.parse(e.recommendations_json ?? '[]'),
  evaluatorFinalNotes: e.evaluator_final_notes, evaluatedAt: e.evaluated_at,
  validatedAt: e.validated_at ?? undefined,
});

const toAgent = (a: any) => ({
  id: a.id, userId: a.user_id, name: a.name, email: a.email, avatarUrl: a.avatar_url,
  teamId: a.team_id, teamName: a.team_name, campaignId: a.campaign_id,
  campaignName: a.campaign_name, hireDate: a.hire_date, seniority: a.seniority,
  status: a.status, callsAnalyzedCount: a.calls_analyzed_count,
  averageQualityScore: a.average_quality_score,
  monthlyScores: JSON.parse(a.monthly_scores_json ?? '[]'),
  strengths: JSON.parse(a.strengths_json ?? '[]'),
  improvementAxes: JSON.parse(a.improvement_axes_json ?? '[]'),
  assignedCoachingPlanId: a.assigned_coaching_plan_id,
  completedTrainingsCount: a.completed_trainings_count, complianceRate: a.compliance_rate,
});

const toCoachingPlan = (p: any) => ({
  id: p.id, agentId: p.agent_id, agentName: p.agent_name,
  trainerId: p.trainer_id, trainerName: p.trainer_name, createdAt: p.created_at,
  targetCompletionDate: p.target_completion_date, status: p.status,
  overallObjectiveSummary: p.overall_objective_summary,
  strengthsSummary: JSON.parse(p.strengths_summary_json ?? '[]'),
  improvementAxesSummary: JSON.parse(p.improvement_axes_summary_json ?? '[]'),
  objectives: JSON.parse(p.objectives_json ?? '[]'), trainerNotes: p.trainer_notes,
  nextSessionDate: p.next_session_date ?? undefined, progressionPercentage: p.progression_percentage,
});

const toTrainingModule = (m: any) => ({
  id: m.id, code: m.code, title: m.title, category: m.category,
  durationMinutes: m.duration_minutes, description: m.description,
  targetCompetencies: JSON.parse(m.target_competencies_json ?? '[]'),
  interactiveSimulationsCount: m.interactive_simulations_count,
  difficultyLevel: m.difficulty_level,
});

const toTrainingSession = (s: any) => ({
  id: s.id, agentId: s.agent_id, agentName: s.agent_name,
  trainerId: s.trainer_id, trainerName: s.trainer_name,
  moduleId: s.module_id, moduleTitle: s.module_title, scheduledDate: s.scheduled_date,
  status: s.status, scoreObtained: s.score_obtained,
  preTrainingQualityScore: s.pre_training_quality_score,
  postTrainingQualityScore: s.post_training_quality_score, upliftPercentage: s.uplift_percentage,
  trainerFeedback: s.trainer_feedback,
  simulationExercises: JSON.parse(s.simulation_exercises_json ?? '[]'),
});

// ─── Quality Evaluations ──────────────────────────────────────────────────────
export const qualityRouter = Router();

qualityRouter.get('/', requireAuth, requireRole(...STAFF_UP), async (_req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM evaluations ORDER BY evaluated_at DESC').all();
  res.json(rows.map(toQualityEvaluation));
});

// GET /api/evaluations/mine — les évaluations qui concernent l'utilisateur connecté
qualityRouter.get('/mine', requireAuth, requireRole(...ALL_ROLES), async (req, res) => {
  const rows = await sqlite().prepare(`
    SELECT * FROM evaluations
    WHERE agent_id IN (SELECT id FROM agents WHERE user_id = ?)
    ORDER BY evaluated_at DESC
  `).all(req.user!.userId);
  res.json(rows.map(toQualityEvaluation));
});

qualityRouter.get('/agent/:agentId', requireAuth, requireRole(...STAFF_UP), async (req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM evaluations WHERE agent_id = ? ORDER BY evaluated_at DESC')
    .all(req.params.agentId);
  res.json(rows.map(toQualityEvaluation));
});

qualityRouter.get('/call/:callId', requireAuth, requireRole(...ALL_ROLES), async (req, res) => {
  const call = await sqlite().prepare('SELECT agent_id, transcription_json FROM calls WHERE id = ?').get(req.params.callId) as any;
  if (call && !(await canAccessCall(req.user!, call))) { res.status(404).json({ error: 'Évaluation introuvable.' }); return; }
  const row = await sqlite().prepare('SELECT * FROM evaluations WHERE call_id = ?').get(req.params.callId) as any;
  if (!row) { res.status(404).json({ error: 'Évaluation introuvable.' }); return; }
  res.json(toQualityEvaluation(row));
});

qualityRouter.post('/', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response): Promise<void> => {
  const body = req.body as any;
  const id = body.id ?? `eval-${Date.now()}`;

  await sqlite().prepare(`
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
    await sqlite().prepare('UPDATE calls SET quality_score = ?, quality_evaluation_id = ? WHERE id = ?')
      .run(body.overallScore, id, body.callId);
  }

  if (body.status === 'VALIDÉE_RESPONSABLE' && body.agentId) {
    const aggregates = await sqlite().prepare(`
      SELECT COUNT(*) AS count, AVG(overall_score) AS average
      FROM evaluations WHERE agent_id = ? AND status = 'VALIDÉE_RESPONSABLE'
    `).get(body.agentId) as any;
    const strengths = await sqlite().prepare(`
      SELECT strengths_json FROM evaluations
      WHERE agent_id = ? AND status = 'VALIDÉE_RESPONSABLE' ORDER BY evaluated_at DESC
    `).all(body.agentId) as any[];
    const weaknesses = await sqlite().prepare(`
      SELECT weaknesses_json FROM evaluations
      WHERE agent_id = ? AND status = 'VALIDÉE_RESPONSABLE' ORDER BY evaluated_at DESC
    `).all(body.agentId) as any[];
    const uniqueItems = (rows: any[], column: string) => [...new Set(rows.flatMap(row => {
      try { return JSON.parse(row[column] ?? '[]'); } catch { return []; }
    }).filter((item: unknown) => typeof item === 'string' && item.trim()))];
    await sqlite().prepare(`UPDATE agents SET calls_analyzed_count = ?, average_quality_score = ?,
      strengths_json = ?, improvement_axes_json = ? WHERE id = ?`)
      .run(aggregates.count, aggregates.average ?? 0,
        JSON.stringify(uniqueItems(strengths, 'strengths_json')),
        JSON.stringify(uniqueItems(weaknesses, 'weaknesses_json')), body.agentId);
  }

  await logAudit(req.user!.userId, req.user!.name, req.user!.role, 'VALIDATION_QUALITE',
    `Évaluation ${id}`, `Score: ${body.overallScore}/100 — Statut: ${body.status}`, req.ip);

  res.status(201).json({ id, ...body });
});

// ─── Criteria ─────────────────────────────────────────────────────────────────
export const criteriaRouter = Router();

criteriaRouter.get('/', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  res.json(await sqlite().prepare('SELECT * FROM quality_criteria ORDER BY category').all());
});

criteriaRouter.put('/:id', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const { weight, maxScore, isCritical } = req.body as any;
  await sqlite().prepare('UPDATE quality_criteria SET weight = ?, max_score = ?, is_critical = ? WHERE id = ?')
    .run(weight, maxScore, isCritical ? 1 : 0, req.params.id);
  await logAudit(req.user!.userId, req.user!.name, req.user!.role, 'MODIFICATION_GRILLE',
    `Critère ${req.params.id}`, `Poids modifié à ${weight}%`, req.ip);
  res.json({ message: 'Critère mis à jour.' });
});

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentsRouter = Router();

agentsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), async (req, res) => {
  // Un conseiller ne voit que sa propre fiche ; le personnel voit tout le monde.
  const rows = req.user!.role === 'AGENT'
    ? await sqlite().prepare('SELECT * FROM agents WHERE user_id = ? ORDER BY name').all(req.user!.userId)
    : await sqlite().prepare('SELECT * FROM agents ORDER BY name').all();
  res.json(rows.map(toAgent));
});

agentsRouter.get('/:id', requireAuth, requireRole(...ALL_ROLES), async (req, res) => {
  const a = await sqlite().prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id) as any;
  // 404 hors périmètre : on ne révèle pas l'existence d'une fiche inaccessible.
  if (!a || !(await canAccessAgent(req.user!, req.params.id))) { res.status(404).json({ error: 'Agent introuvable.' }); return; }
  res.json(toAgent(a));
});

// ─── Teams & Campaigns ────────────────────────────────────────────────────────
export const teamsRouter = Router();
teamsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  res.json(await sqlite().prepare('SELECT * FROM teams ORDER BY name').all());
});

teamsRouter.post('/', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const { name, description = '', supervisorId = '', supervisorName = '' } = req.body as any;
  if (!String(name ?? '').trim()) { res.status(400).json({ error: 'Le nom de l’équipe est requis.' }); return; }
  const id = `team-${Date.now()}`;
  const createdAt = new Date().toISOString().slice(0, 10);
  await sqlite().prepare(`INSERT INTO teams (id, name, supervisor_id, supervisor_name, description, member_count, average_quality_score, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, ?)`)
    .run(id, String(name).trim(), supervisorId, supervisorName, String(description).trim(), createdAt);
  res.status(201).json({ id, name: String(name).trim(), supervisor_id: supervisorId, supervisor_name: supervisorName,
    description: String(description).trim(), member_count: 0, average_quality_score: 0, created_at: createdAt });
});

teamsRouter.patch('/agents/:agentId', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const { teamId } = req.body as { teamId?: string };
  const agent = await sqlite().prepare('SELECT id FROM agents WHERE id = ?').get(req.params.agentId) as any;
  if (!agent) { res.status(404).json({ error: 'Conseiller introuvable.' }); return; }
  const team = teamId ? await sqlite().prepare('SELECT id, name FROM teams WHERE id = ?').get(teamId) as any : null;
  if (teamId && !team) { res.status(404).json({ error: 'Équipe introuvable.' }); return; }
  await sqlite().prepare("UPDATE agents SET team_id = ?, team_name = ? WHERE id = ?")
    .run(team?.id ?? 'unassigned', team?.name ?? 'Non attribué', req.params.agentId);
  await sqlite().prepare('UPDATE teams SET member_count = (SELECT COUNT(*) FROM agents WHERE team_id = teams.id)').run();
  res.json({ ok: true, teamId: team?.id ?? 'unassigned', teamName: team?.name ?? 'Non attribué' });
});

export const campaignsRouter = Router();
campaignsRouter.get('/', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  res.json(await sqlite().prepare('SELECT * FROM campaigns ORDER BY name').all());
});

// ─── Coaching Plans ───────────────────────────────────────────────────────────
export const coachingRouter = Router();

coachingRouter.get('/', requireAuth, requireRole(...STAFF_UP), async (_req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM coaching_plans ORDER BY created_at DESC').all();
  res.json(rows.map(toCoachingPlan));
});

coachingRouter.get('/agent/:agentId', requireAuth, requireRole(...ALL_ROLES), async (req, res) => {
  const row = await sqlite().prepare('SELECT * FROM coaching_plans WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.agentId) as any;
  if (!row || !(await canAccessAgent(req.user!, req.params.agentId))) { res.status(404).json({ error: 'Plan introuvable.' }); return; }
  res.json(toCoachingPlan(row));
});

coachingRouter.post('/', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const body = req.body as any;
  const id = body.id ?? `coaching-${Date.now()}`;
  await sqlite().prepare(`
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
  await logAudit(req.user!.userId, req.user!.name, req.user!.role, 'CREATION_COACHING',
    `Plan Agent ${body.agentName}`, 'Plan de coaching mis à jour.', req.ip);
  res.status(201).json({ id, ...body });
});

// ─── Training ─────────────────────────────────────────────────────────────────
export const trainingRouter = Router();

trainingRouter.get('/modules', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM training_modules ORDER BY title').all();
  res.json(rows.map(toTrainingModule));
});

trainingRouter.post('/modules', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const body = req.body as any;
  if (!String(body.title ?? '').trim() || !String(body.code ?? '').trim() || !String(body.category ?? '').trim()) {
    res.status(400).json({ error: 'Le code, le titre et la catégorie du module sont requis.' });
    return;
  }
  const id = body.id ?? `module-${Date.now()}`;
  await sqlite().prepare(`
    INSERT INTO training_modules (id, code, title, category, duration_minutes, description,
      target_competencies_json, interactive_simulations_count, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, String(body.code).trim(), String(body.title).trim(), String(body.category).trim(),
    Math.max(1, Number(body.durationMinutes) || 60), body.description ?? '',
    JSON.stringify(Array.isArray(body.targetCompetencies) ? body.targetCompetencies : []),
    Math.max(0, Number(body.interactiveSimulationsCount) || 0), body.difficultyLevel ?? 'INTERMÉDIAIRE');
  await logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'CREATION_FORMATION', `Module ${body.title}`, `Module ajouté : ${body.code}`, req.ip);
  res.status(201).json({ ...body, id });
});

trainingRouter.put('/modules/:id', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const body = req.body as any;
  const existing = await sqlite().prepare('SELECT id FROM training_modules WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: 'Module introuvable.' }); return; }
  if (!String(body.title ?? '').trim() || !String(body.code ?? '').trim() || !String(body.category ?? '').trim()) {
    res.status(400).json({ error: 'Le code, le titre et la catégorie du module sont requis.' });
    return;
  }
  await sqlite().prepare(`UPDATE training_modules SET code = ?, title = ?, category = ?, duration_minutes = ?,
    description = ?, target_competencies_json = ?, interactive_simulations_count = ?, difficulty_level = ? WHERE id = ?`)
    .run(String(body.code).trim(), String(body.title).trim(), String(body.category).trim(),
      Math.max(1, Number(body.durationMinutes) || 60), body.description ?? '',
      JSON.stringify(Array.isArray(body.targetCompetencies) ? body.targetCompetencies : []),
      Math.max(0, Number(body.interactiveSimulationsCount) || 0),
      body.difficultyLevel ?? 'INTERMÉDIAIRE', req.params.id);
  res.json({ ...body, id: req.params.id });
});

trainingRouter.delete('/modules/:id', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const sessions = await sqlite().prepare('SELECT COUNT(*) as c FROM training_sessions WHERE module_id = ?').get(req.params.id) as any;
  if (sessions.c > 0) {
    res.status(409).json({ error: 'Ce module est associé à des sessions. Modifiez-le ou annulez ses sessions pour le retirer.' });
    return;
  }
  await sqlite().prepare('DELETE FROM training_modules WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

trainingRouter.get('/sessions', requireAuth, requireRole(...STAFF_UP), async (_req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM training_sessions ORDER BY scheduled_date DESC').all();
  res.json(rows.map(toTrainingSession));
});

trainingRouter.post('/sessions', requireAuth, requireRole(...STAFF_UP), async (req: Request, res: Response) => {
  const body = req.body as any;
  const agent = await sqlite().prepare('SELECT id, name FROM agents WHERE id = ?').get(body.agentId) as any;
  const module = await sqlite().prepare('SELECT id, title FROM training_modules WHERE id = ?').get(body.moduleId) as any;
  if (!agent || !module || !body.scheduledDate) {
    res.status(400).json({ error: 'Un conseiller, un module et une date valide sont requis.' });
    return;
  }
  const baseline = await sqlite().prepare(`
    SELECT COUNT(*) AS count, AVG(overall_score) AS average FROM evaluations
    WHERE agent_id = ? AND status = 'VALIDÉE_RESPONSABLE'
  `).get(agent.id) as any;
  const id = body.id ?? `session-${Date.now()}`;
  await sqlite().prepare(`
    INSERT INTO training_sessions (id, agent_id, agent_name, trainer_id, trainer_name, module_id, module_title,
      scheduled_date, status, score_obtained, pre_training_quality_score, post_training_quality_score,
      uplift_percentage, trainer_feedback, simulation_exercises_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, agent.id, agent.name, req.user!.userId, req.user!.name,
    module.id, module.title, body.scheduledDate, 'PLANIFIÉE',
    null, baseline.average ?? agent.average_quality_score ?? 0,
    body.postTrainingQualityScore ?? null, body.upliftPercentage ?? null,
    body.trainerFeedback ?? '', JSON.stringify(body.simulationExercises ?? []));
  res.status(201).json({ id, ...body, agentId: agent.id, agentName: agent.name,
    trainerId: req.user!.userId, trainerName: req.user!.name, moduleId: module.id,
    moduleTitle: module.title, status: 'PLANIFIÉE', preTrainingQualityScore: baseline.average ?? agent.average_quality_score ?? 0 });
});

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export const dashboardRouter = Router();

dashboardRouter.get('/metrics', requireAuth, requireRole(...STAFF_UP), async (_req, res) => {
  const s = sqlite();
  const totalCalls        = (await s.prepare('SELECT COUNT(*) as c FROM calls').get() as any).c;
  const analyzedCalls     = (await s.prepare("SELECT COUNT(*) as c FROM calls WHERE analytics_json != '{}'").get() as any).c;
  const transcriptions    = (await s.prepare("SELECT COUNT(*) as c FROM calls WHERE transcription_json != '{}'").get() as any).c;
  const avgQuality        = (await s.prepare('SELECT AVG(quality_score) as a FROM calls WHERE quality_score IS NOT NULL').get() as any).a ?? 0;
  const urgentCount       = (await s.prepare('SELECT COUNT(*) as c FROM calls WHERE is_urgent_review_required = 1').get() as any).c;
  const totalAgents       = (await s.prepare('SELECT COUNT(*) as c FROM agents').get() as any).c;
  const totalTeams        = (await s.prepare('SELECT COUNT(*) as c FROM teams').get() as any).c;
  const coachingNeeded    = (await s.prepare("SELECT COUNT(*) as c FROM agents WHERE average_quality_score < 75").get() as any).c;
  const avgProgression    = (await s.prepare('SELECT AVG(progression_percentage) as a FROM coaching_plans WHERE status = ?').get('ACTIF') as any).a ?? 0;
  const complianceRate    = (await s.prepare('SELECT AVG(compliance_rate) as a FROM campaigns').get() as any).a ?? 0;

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

auditRouter.get('/', requireAuth, requireRole(...ADMIN_ONLY), async (req, res) => {
  const { limit = '100' } = req.query as { limit?: string };
  const rows = await sqlite().prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(parseInt(limit));
  res.json(rows);
});

// ─── Experiment Configs ───────────────────────────────────────────────────────
export const experimentsRouter = Router();

experimentsRouter.get('/configs', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  res.json(await sqlite().prepare('SELECT * FROM experiment_configs').all());
});

experimentsRouter.get('/samples', requireAuth, requireRole(...ALL_ROLES), async (_req, res) => {
  const rows = await sqlite().prepare('SELECT * FROM benchmark_samples').all();
  res.json(rows.map((s: any) => ({ ...s, results: JSON.parse(s.results_json ?? '[]') })));
});
