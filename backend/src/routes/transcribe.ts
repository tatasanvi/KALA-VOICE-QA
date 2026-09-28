// =============================================================================
// KALA VOICE QA — Route Express : Transcription via Groq Whisper
//
// Utilisée en développement local (proxy Vite → Express :8000).
// En production Vercel, c'est la serverless function /api/transcribe.js
// qui prend le relais (même logique, même réponse JSON).
//
// Variable d'environnement requise :
//   GROQ_API_KEY — clé obtenue sur https://console.groq.com (gratuit)
// =============================================================================
import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';

const router = Router();

const GROQ_MODEL    = 'whisper-large-v3-turbo';
const GROQ_API_URL  = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_BYTES     = 25 * 1024 * 1024;
const AUDIO_EXT     = /\.(wav|mp3|m4a|ogg|flac|webm|aac|opus)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('audio/') || AUDIO_EXT.test(file.originalname);
    cb(null, ok);
  },
});

// ── Calcul WER/CER (même normalisation que le mémoire) ───────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, "'").replace(/-/g, '').replace(/‐/g, '')
    .replace(/\d/g, ' ')
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string[], b: string[]): number {
  const m = a.length, n = b.length;
  let d = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const p = [...d];
    d[0] = i;
    for (let j = 1; j <= n; j++) {
      d[j] = Math.min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));
    }
  }
  return d[n];
}

function computeWerCer(reference: string, hypothesis: string) {
  const ref = normalize(reference);
  const hyp = normalize(hypothesis);
  if (!ref) return { wer: null, cer: null, reference_normalized: ref, hypothesis_normalized: hyp };
  const wer = levenshtein(ref.split(' '), hyp.split(' ')) / ref.split(' ').length;
  const cer = levenshtein([...ref], [...hyp]) / ref.length;
  return { wer, cer, reference_normalized: ref, hypothesis_normalized: hyp };
}

// POST /api/transcribe ─────────────────────────────────────────────────────────
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    res.status(503).json({
      error: "GROQ_API_KEY manquante. Ajoutez-la dans le fichier .env.local à la racine du projet.",
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Aucun fichier audio reçu.' });
    return;
  }

  // ── Envoi à l'API Groq Whisper ────────────────────────────────────────────
  const startTime = Date.now();
  const groqForm  = new FormData();
  groqForm.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
  groqForm.append('model',   GROQ_MODEL);
  groqForm.append('language', 'fr');
  groqForm.append('response_format', 'verbose_json');
  groqForm.append('timestamp_granularities[]', 'segment');

  let groqRes: globalThis.Response;
  try {
    groqRes = await fetch(GROQ_API_URL, {
      method:  'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body:    groqForm,
    });
  } catch (err) {
    res.status(502).json({ error: "Impossible de joindre l'API Groq. Vérifiez votre connexion Internet." });
    return;
  }

  if (!groqRes.ok) {
    let detail = `Groq a retourné une erreur ${groqRes.status}.`;
    try {
      const body: any = await groqRes.json();
      detail = body?.error?.message ?? detail;
    } catch { /* ignore */ }
    res.status(groqRes.status >= 400 ? groqRes.status : 502).json({ error: detail });
    return;
  }

  const groqData: any = await groqRes.json();
  const processingTime = (Date.now() - startTime) / 1000;

  const text     = (groqData.text ?? '').trim();
  const duration = groqData.duration ?? 0;
  const segments = (groqData.segments ?? [])
    .map((s: any) => ({ start: s.start ?? null, end: s.end ?? null, text: (s.text ?? '').trim() }))
    .filter((s: any) => s.text);

  const result: any = {
    text,
    segments,
    duration:         Math.round(duration * 100) / 100,
    processing_time:  Math.round(processingTime * 100) / 100,
    model:            `${GROQ_MODEL} (Groq)`,
    wer:              null,
    cer:              null,
    reference_normalized:  null,
    hypothesis_normalized: null,
    denoised:   null,
    wer_delta:  null,
  };

  const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
  if (reference) Object.assign(result, computeWerCer(reference, text));

  res.json(result);
});

export default router;
