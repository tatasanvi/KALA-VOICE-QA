// =============================================================================
// Route Transcriptions — proxy vers le service ASR local (Whisper-small)
// Le fichier audio reste en mémoire le temps de la requête : il n'est pas conservé.
// =============================================================================
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
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

  let asrRes: globalThis.Response;
  try {
    asrRes = await fetch(ASR_URL, { method: 'POST', body: form });
  } catch {
    res.status(503).json({ error: 'Service de transcription non démarré.' });
    return;
  }

  const body = await asrRes.json().catch(() => null);
  if (!asrRes.ok || !body) {
    const detail = body && typeof body.detail === 'string' ? body.detail : 'Échec de la transcription.';
    res.status(asrRes.status >= 400 ? asrRes.status : 502).json({ error: detail });
    return;
  }

  if (req.user) {
    logAudit(req.user.userId, req.user.name, req.user.role, 'TRANSCRIPTION_AUDIO', '/api/transcriptions',
      `Fichier transcrit (${req.file.size} octets, ${body.model})`, req.ip);
  }
  res.json(body);
});

export default router;
