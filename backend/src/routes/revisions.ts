// =============================================================================
// Demandes de révision (contestation d'une évaluation par le conseiller)
// Le conseiller ne modifie jamais l'évaluation : il déclenche une révision
// humaine, traitée par un rôle superviseur ou au-dessus.
// =============================================================================
import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth, requireRole, QA_UP, ALL_ROLES } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';

const router = Router();
const sqlite = () => (db as any).session.client;

const toRevision = (r: any) => ({
  id: r.id, evaluationId: r.evaluation_id, callId: r.call_id, agentId: r.agent_id,
  requestedByName: r.requested_by_name, reason: r.reason, status: r.status,
  createdAt: r.created_at, handledByName: r.handled_by_name, handledAt: r.handled_at,
  resolutionNote: r.resolution_note,
});

// L'évaluation concerne-t-elle l'utilisateur (sa fiche agent) ?
function evaluationConcernsUser(evaluation: any, userId: string): boolean {
  const agent = sqlite().prepare('SELECT 1 FROM agents WHERE id = ? AND user_id = ?').get(evaluation.agent_id, userId);
  return Boolean(agent);
}

// POST /api/revisions — contester une évaluation qui vous concerne
router.post('/', requireAuth, requireRole(...ALL_ROLES), (req: Request, res: Response): void => {
  const { evaluationId, reason } = req.body as { evaluationId?: string; reason?: string };
  if (!evaluationId || !reason || !reason.trim()) {
    res.status(400).json({ error: 'Évaluation et motif obligatoires.' });
    return;
  }

  const evaluation = sqlite().prepare('SELECT * FROM evaluations WHERE id = ?').get(evaluationId) as any;
  if (!evaluation) { res.status(404).json({ error: 'Évaluation introuvable.' }); return; }

  // Seul l'agent concerné peut contester (les rôles QA et au-dessus peuvent
  // ouvrir une révision à sa place, par exemple après un signalement oral).
  const isConcerned = evaluationConcernsUser(evaluation, req.user!.userId);
  const isQaUp = QA_UP.includes(req.user!.role);
  if (!isConcerned && !isQaUp) {
    res.status(403).json({ error: 'Vous ne pouvez contester qu’une évaluation qui vous concerne.' });
    return;
  }

  const pending = sqlite().prepare("SELECT 1 FROM revision_requests WHERE evaluation_id = ? AND status = 'EN_ATTENTE'").get(evaluationId);
  if (pending) { res.status(409).json({ error: 'Une demande de révision est déjà en attente pour cette évaluation.' }); return; }

  const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  sqlite().prepare(`
    INSERT INTO revision_requests (id, evaluation_id, call_id, agent_id, requested_by_user_id,
      requested_by_name, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE', ?)
  `).run(id, evaluationId, evaluation.call_id, evaluation.agent_id, req.user!.userId, req.user!.name, reason.trim(), now);

  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DEMANDE_REVISION',
    `Évaluation ${evaluationId}`, `Contestation déposée : ${reason.trim().slice(0, 120)}`, req.ip);

  res.status(201).json(toRevision(sqlite().prepare('SELECT * FROM revision_requests WHERE id = ?').get(id)));
});

// GET /api/revisions — superviseur et au-dessus : toutes ; agent : les siennes
router.get('/', requireAuth, requireRole(...ALL_ROLES), (req: Request, res: Response): void => {
  const status = (req.query as any).status as string | undefined;
  let where = '1=1';
  const params: any[] = [];
  if (req.user!.role === 'AGENT') { where += ' AND requested_by_user_id = ?'; params.push(req.user!.userId); }
  if (status) { where += ' AND status = ?'; params.push(status); }
  const rows = sqlite().prepare(`SELECT * FROM revision_requests WHERE ${where} ORDER BY created_at DESC`).all(...params);
  res.json(rows.map(toRevision));
});

// PATCH /api/revisions/:id — traitement par un rôle superviseur ou au-dessus
router.patch('/:id', requireAuth, requireRole(...QA_UP), (req: Request, res: Response): void => {
  const { status, resolutionNote } = req.body as { status?: string; resolutionNote?: string };
  if (!status || !['ACCEPTEE', 'REFUSEE'].includes(status)) {
    res.status(400).json({ error: 'Statut attendu : ACCEPTEE ou REFUSEE.' });
    return;
  }
  const row = sqlite().prepare('SELECT * FROM revision_requests WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Demande introuvable.' }); return; }

  sqlite().prepare('UPDATE revision_requests SET status = ?, handled_by_name = ?, handled_at = ?, resolution_note = ? WHERE id = ?')
    .run(status, req.user!.name, new Date().toISOString(), resolutionNote ?? null, req.params.id);

  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TRAITEMENT_REVISION',
    `Demande ${req.params.id}`, `Demande ${status.toLowerCase()} par ${req.user!.name}`, req.ip);

  res.json(toRevision(sqlite().prepare('SELECT * FROM revision_requests WHERE id = ?').get(req.params.id)));
});

export default router;
