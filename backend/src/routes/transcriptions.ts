// =============================================================================
// Route Transcriptions — proxy vers le service ASR local (Whisper-small)
// Le fichier audio reste en mémoire le temps de la requête : il n'est pas conservé.
// =============================================================================
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import http from 'node:http';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

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

// POST /api/transcriptions — transcription du signal brut, sans débruitage
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

  if (req.user) {
    logAudit(req.user.userId, req.user.name, req.user.role, 'TRANSCRIPTION_AUDIO', '/api/transcriptions',
      `Fichier transcrit (${req.file.size} octets, ${body.model})`, req.ip);
  }
  res.json(body);
});

export default router;
