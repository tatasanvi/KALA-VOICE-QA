// =============================================================================
// KALA VOICE QA — Routes Appels (Calls)
// =============================================================================
import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, SUPERVISOR_UP, ALL_ROLES } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';

const router = Router();
const sqlite = () => (db as any).session.client;

const toCall = (c: any) => ({
  ...c,
  audioMetadata:   JSON.parse(c.audio_metadata_json  ?? '{}'),
  transcription:   JSON.parse(c.transcription_json   ?? '{}'),
  analytics:       JSON.parse(c.analytics_json       ?? '{}'),
  isUrgentReviewRequired: Boolean(c.is_urgent_review_required),
  audio_metadata_json: undefined,
  transcription_json: undefined,
  analytics_json: undefined,
  is_urgent_review_required: undefined,
});

// GET /api/calls  — Liste paginée + filtres
router.get('/', requireAuth, requireRole(...ALL_ROLES), (req: Request, res: Response): void => {
  const { page = '1', limit = '20', agentId, campaignId, direction, callType, dateFrom, dateTo } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = '1=1';
  const params: any[] = [];

  // Filtre RBAC : un AGENT ne voit que ses propres appels
  if (req.user!.role === 'AGENT') {
    // Un agent voit ses appels, ainsi que les transcriptions réelles qu'il a lui-même importées.
    where += " AND (agent_id IN (SELECT id FROM agents WHERE user_id = ?) OR json_extract(transcription_json, '$.createdByUserId') = ?)";
    params.push(req.user!.userId, req.user!.userId);
  }
  // source=real : uniquement les appels issus d'une vraie transcription (et non des données de démonstration)
  if ((req.query as any).source === 'real') {
    where += " AND json_extract(transcription_json, '$.source') = 'REAL_ASR'";
  }
  if (agentId)    { where += ' AND agent_id = ?';    params.push(agentId); }
  if (campaignId) { where += ' AND campaign_id = ?'; params.push(campaignId); }
  if (direction)  { where += ' AND direction = ?';   params.push(direction); }
  if (callType)   { where += ' AND call_type = ?';   params.push(callType); }
  if (dateFrom)   { where += ' AND call_date >= ?';  params.push(dateFrom); }
  if (dateTo)     { where += ' AND call_date <= ?';  params.push(dateTo); }

  const total = (sqlite().prepare(`SELECT COUNT(*) as c FROM calls WHERE ${where}`).get(...params) as any).c;
  const rows = sqlite().prepare(`SELECT * FROM calls WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

  res.json({ total, page: parseInt(page), limit: parseInt(limit), data: rows.map(toCall) });
});

// GET /api/calls/:id
router.get('/:id', requireAuth, requireRole(...ALL_ROLES), (req: Request, res: Response): void => {
  const row = sqlite().prepare('SELECT * FROM calls WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Appel introuvable.' }); return; }
  res.json(toCall(row));
});

// POST /api/calls  — Importer un appel
router.post('/', requireAuth, requireRole(...SUPERVISOR_UP), (req: Request, res: Response): void => {
  const body = req.body as any;
  const id = body.id ?? `call-${Date.now()}`;

  sqlite().prepare(`
    INSERT INTO calls (id, call_number, agent_id, agent_name, team_id, campaign_id, campaign_name,
      customer_phone_masked, customer_name_masked, call_date, duration_seconds, direction, call_type,
      audio_metadata_json, transcription_json, analytics_json, quality_evaluation_id, quality_score,
      is_urgent_review_required, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, body.callNumber, body.agentId, body.agentName, body.teamId, body.campaignId, body.campaignName,
    body.customerPhoneMasked, body.customerNameMasked, body.callDate, body.durationSeconds ?? 0,
    body.direction ?? 'ENTRANT', body.callType ?? 'SUPPORT_TECHNIQUE',
    JSON.stringify(body.audioMetadata ?? {}),
    JSON.stringify(body.transcription ?? {}),
    JSON.stringify(body.analytics ?? {}),
    body.qualityEvaluationId ?? null, body.qualityScore ?? null,
    body.isUrgentReviewRequired ? 1 : 0, body.notes ?? null,
    new Date().toISOString().substring(0, 10)
  );

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'IMPORT_AUDIO', `Appel ${body.callNumber}`,
    `Nouvel enregistrement importé : ${body.agentName}`, req.ip);

  const created = sqlite().prepare('SELECT * FROM calls WHERE id = ?').get(id) as any;
  res.status(201).json(toCall(created));
});

// PATCH /api/calls/:callId/segments/:segId  — Corriger un segment de transcription
router.patch('/:callId/segments/:segId', requireAuth, requireRole(...ALL_ROLES), (req: Request, res: Response): void => {
  const { callId, segId } = req.params;
  const { correctedText } = req.body as { correctedText?: string };

  const row = sqlite().prepare('SELECT * FROM calls WHERE id = ?').get(callId) as any;
  if (!row) { res.status(404).json({ error: 'Appel introuvable.' }); return; }

  const transcription = JSON.parse(row.transcription_json ?? '{}');
  const segments: any[] = transcription.segments ?? [];
  const segIdx = segments.findIndex((s: any) => s.id === segId);

  if (segIdx === -1) { res.status(404).json({ error: 'Segment introuvable.' }); return; }

  segments[segIdx] = { ...segments[segIdx], correctedText, hasBeenEdited: true };
  if (transcription.versionNumber === 1) transcription.versionNumber = 2;
  transcription.lastEditedBy = `${req.user!.name} (${req.user!.role})`;
  transcription.lastEditedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  transcription.segments = segments;
  transcription.correctedText = segments.map((s: any) => s.correctedText || s.text).join(' ');

  sqlite().prepare('UPDATE calls SET transcription_json = ? WHERE id = ?')
    .run(JSON.stringify(transcription), callId);

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'CORRECTION_TRANSCRIPTION', `Appel ${row.call_number}`,
    `Segment ${segId} corrigé par ${req.user!.name}`, req.ip);

  res.json({ message: 'Segment corrigé.', transcription });
});

export default router;
