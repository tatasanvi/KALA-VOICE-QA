// =============================================================================
// Route Transcriptions — proxy vers le service ASR local (Whisper-small)
// Le fichier audio reste en mémoire le temps de la requête : il n'est pas conservé.
// =============================================================================
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import http from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();
const sqlite = () => (db as any).session.client;

// Choix RGPD par défaut, cohérent avec le scénario « traitement en flux » du mémoire :
// l'audio n'existe qu'en mémoire le temps de la requête, puis il est jeté. Seule la
// transcription (texte, segments, métriques mesurées) est enregistrée comme appel.
// L'audio n'est écrit sur disque que si l'option `keep_audio=true` est explicitement demandée.
const AUDIO_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../storage/audio');

const pad = (n: number) => String(n).padStart(2, '0');
function newCallNumber(d: Date): string {
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `TR-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const ASR_URL = process.env.ASR_URL ?? 'http://127.0.0.1:8500/transcribe';
const MAX_BYTES = 25 * 1024 * 1024;
const AUDIO_EXT = /\.(wav|mp3|m4a|ogg|flac|webm|aac|opus)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio/') || AUDIO_EXT.test(file.originalname);
    if (isAudio) cb(null, true);
    else cb(new Error('UNSUPPORTED_FORMAT'));
  },
});

const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Fichier trop volumineux (25 Mo maximum).' });
    } else if (err instanceof Error && err.message === 'UNSUPPORTED_FORMAT') {
      res.status(415).json({ error: 'Format non supporté : seuls les fichiers audio sont acceptés.' });
    } else {
      res.status(400).json({ error: 'Envoi du fichier invalide.' });
    }
  });
};

// Appel HTTP interne sans délai maximal : sur CPU, un appel de plusieurs minutes
// peut dépasser les 300 s d'attente par défaut du fetch de Node.
async function postToAsr(form: FormData): Promise<{ status: number; body: any }> {
  const encoded = new globalThis.Response(form);
  const payload = Buffer.from(await encoded.arrayBuffer());
  const url = new URL(ASR_URL);
  return new Promise((resolve, reject) => {
    const r = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': encoded.headers.get('content-type') ?? '', 'Content-Length': payload.length },
    }, (resp) => {
      const chunks: Buffer[] = [];
      resp.on('data', (c) => chunks.push(c));
      resp.on('end', () => {
        let parsed: any = null;
        try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* réponse non JSON */ }
        resolve({ status: resp.statusCode ?? 502, body: parsed });
      });
    });
    r.setTimeout(0);
    r.on('error', reject);
    r.end(payload);
  });
}

// POST /api/transcriptions — transcription du signal brut ; débruitage uniquement en comparaison facultative
router.post('/', requireAuth, handleUpload, async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'Aucun fichier audio reçu.' });
    return;
  }

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }), req.file.originalname);
  if (typeof req.body?.reference === 'string' && req.body.reference.trim()) {
    form.append('reference', req.body.reference);
  }
  if (req.body?.compare_dfn3 === 'true') {
    // Option comparative (voie B, DeepFilterNet3) : désactivée par défaut.
    form.append('compare_dfn3', 'true');
  }

  let asr: { status: number; body: any };
  try {
    asr = await postToAsr(form);
  } catch (err: any) {
    const notStarted = err?.code === 'ECONNREFUSED' || err?.code === 'ECONNRESET';
    res.status(503).json({ error: notStarted ? 'Service de transcription non démarré.' : 'Service de transcription injoignable.' });
    return;
  }

  const body = asr.body;
  if (asr.status >= 400 || !body) {
    const detail = body && typeof body.detail === 'string' ? body.detail : 'Échec de la transcription.';
    res.status(asr.status >= 400 ? asr.status : 502).json({ error: detail });
    return;
  }

  // ─── Enregistrement de l'appel réel ─────────────────────────────────────────
  const now = new Date();
  const id = `call-real-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  const callNumber = newCallNumber(now);
  const keepAudio = req.body?.keep_audio === 'true';

  let audioPath: string | null = null;
  if (keepAudio) {
    mkdirSync(AUDIO_DIR, { recursive: true });
    audioPath = join(AUDIO_DIR, `${id}${extname(req.file.originalname).toLowerCase() || '.bin'}`);
    writeFileSync(audioPath, req.file.buffer);
  }

  const audioMetadata = {
    filename: req.file.originalname,
    fileSizeBytes: req.file.size,
    durationSeconds: body.duration,
    audioStored: keepAudio,
  };
  // Uniquement des valeurs renvoyées par le service ASR : WER/CER à null sans référence.
  const transcription = {
    source: 'REAL_ASR',
    createdByUserId: req.user!.userId,
    createdByName: req.user!.name,
    asrModelUsed: body.model,
    rawText: body.text,
    segments: body.segments,
    processingTimeSeconds: body.processing_time,
    wer: body.wer ?? null,
    cer: body.cer ?? null,
    referenceNormalized: body.reference_normalized ?? null,
    hypothesisNormalized: body.hypothesis_normalized ?? null,
    denoised: body.denoised ?? null,
    werDelta: body.wer_delta ?? null,
    createdAt: now.toISOString(),
  };

  sqlite().prepare(`
    INSERT INTO calls (id, call_number, agent_id, agent_name, team_id, campaign_id, campaign_name,
      customer_phone_masked, customer_name_masked, call_date, duration_seconds, direction, call_type,
      audio_metadata_json, transcription_json, analytics_json, quality_evaluation_id, quality_score,
      is_urgent_review_required, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, ?, ?)
  `).run(
    id, callNumber, '', 'Non assigné', '', '', 'Non renseignée', 'Non renseigné', 'Non renseigné',
    now.toISOString().substring(0, 10), Math.round(body.duration ?? 0), 'ENTRANT', 'NON_QUALIFIE',
    JSON.stringify(audioMetadata), JSON.stringify(transcription), '{}',
    keepAudio ? 'Audio conservé sur demande explicite' : 'Audio non conservé (traitement en flux)',
    now.toISOString(),
  );

  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TRANSCRIPTION_AUDIO', `Appel ${callNumber}`,
    `Transcription enregistrée (${req.file.size} octets, ${body.model}, audio ${keepAudio ? 'conservé' : 'non conservé'})`, req.ip);

  res.json({ ...body, callId: id, callNumber, audioStored: keepAudio });
});

export default router;
