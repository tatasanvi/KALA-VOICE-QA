// =============================================================================
// KALA VOICE QA — Vercel Serverless Function : Transcription via Groq Whisper
//
// Remplace le micro-service Python local (asr-service) en appelant l'API Groq
// (plan gratuit). Retourne la même structure JSON que l'ancien service Python.
//
// Variables d'environnement requises sur Vercel :
//   GROQ_API_KEY — clé API obtenue sur https://console.groq.com
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';

function resolveGroqKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  if (process.env.VITE_GROQ_API_KEY) return process.env.VITE_GROQ_API_KEY;
  try {
    for (const filename of ['.env.local', '.env']) {
      const fullPath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const m = content.match(/(?:VITE_)?GROQ_API_KEY=["']?([^"'\r\n]+)/);
        if (m && m[1]) return m[1].trim();
      }
    }
  } catch {
    // ignoré en serverless
  }
  return null;
}

export const config = {
  api: {
    bodyParser: false, // on lit le multipart manuellement
  },
};

// Groq Whisper : modèle rapide, gratuit, excellent en français
const GROQ_MODEL = 'whisper-large-v3-turbo';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_BYTES = 25 * 1024 * 1024; // 25 Mo (limite Groq)

/** Lit le body brut de la requête en Buffer */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** Calcule WER (Word Error Rate) entre référence et hypothèse */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/'/g, "'")
    .replace(/-/g, '')
    .replace(/\d/g, ' ')
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
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

function computeWerCer(reference, hypothesis) {
  const ref = normalize(reference);
  const hyp = normalize(hypothesis);
  if (!ref) return { wer: null, cer: null, reference_normalized: ref, hypothesis_normalized: hyp };
  const refWords = ref.split(' ');
  const hypWords = hyp.split(' ');
  const wer = levenshtein(refWords, hypWords) / refWords.length;
  const cer = levenshtein([...ref], [...hyp]) / ref.length;
  return { wer, cer, reference_normalized: ref, hypothesis_normalized: hyp };
}

export default async function handler(req, res) {
  // CORS pour le dev local (Vite tourne sur :5173, Vercel CLI sur :3000)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée.' });
    return;
  }

  const GROQ_API_KEY = resolveGroqKey();
  if (!GROQ_API_KEY) {
    res.status(503).json({
      error: "Variable d'environnement GROQ_API_KEY manquante. Configurez-la dans Vercel → Settings → Environment Variables.",
    });
    return;
  }

  // ── Lecture du body multipart ─────────────────────────────────────────────
  let rawBody;
  try {
    rawBody = await readBody(req);
  } catch (err) {
    res.status(400).json({ error: 'Impossible de lire le corps de la requête.' });
    return;
  }

  if (rawBody.length > MAX_BYTES) {
    res.status(413).json({ error: 'Fichier trop volumineux (25 Mo maximum).' });
    return;
  }

  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    res.status(400).json({ error: 'La requête doit être multipart/form-data.' });
    return;
  }

  // ── Extraction du fichier audio et des champs texte du multipart ──────────
  // On extrait manuellement en se basant sur le boundary.
  const boundaryMatch = contentType.match(/boundary=([^;]+)/);
  if (!boundaryMatch) {
    res.status(400).json({ error: 'Boundary multipart introuvable.' });
    return;
  }
  const boundary = boundaryMatch[1].trim();

  let audioBuffer = null;
  let audioFilename = 'audio.wav';
  let audioMime = 'audio/wav';
  let reference = null;

  const parts = splitMultipart(rawBody, boundary);
  for (const part of parts) {
    const { headers, body } = part;
    const disposition = headers['content-disposition'] ?? '';
    const nameMatch = disposition.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    if (fieldName === 'file') {
      const fnMatch = disposition.match(/filename="([^"]+)"/);
      audioFilename = fnMatch ? fnMatch[1] : 'audio.wav';
      audioMime = headers['content-type'] ?? 'audio/wav';
      audioBuffer = body;
    } else if (fieldName === 'reference') {
      reference = body.toString('utf8').trim();
    }
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    res.status(400).json({ error: 'Aucun fichier audio reçu.' });
    return;
  }

  // ── Appel à l'API Groq Whisper ────────────────────────────────────────────
  const startTime = Date.now();

  // On recrée un FormData natif (Node 18+ ou via global fetch de Vercel)
  const groqForm = new FormData();
  groqForm.append(
    'file',
    new Blob([audioBuffer], { type: audioMime }),
    audioFilename,
  );
  groqForm.append('model', GROQ_MODEL);
  groqForm.append('language', 'fr');
  groqForm.append('response_format', 'verbose_json');
  groqForm.append('timestamp_granularities[]', 'segment');

  let groqRes;
  try {
    groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: groqForm,
    });
  } catch (err) {
    res.status(502).json({ error: "Impossible de joindre l'API Groq." });
    return;
  }

  if (!groqRes.ok) {
    let detail = `Groq a retourné une erreur ${groqRes.status}.`;
    try {
      const errBody = await groqRes.json();
      detail = errBody?.error?.message ?? detail;
    } catch { /* ignore */ }
    res.status(groqRes.status >= 400 ? groqRes.status : 502).json({ error: detail });
    return;
  }

  const groqData = await groqRes.json();
  const processingTime = (Date.now() - startTime) / 1000;

  // ── Mise en forme de la réponse (même format que l'ancien service Python) ──
  const text = (groqData.text ?? '').trim();
  const duration = groqData.duration ?? 0;

  const segments = (groqData.segments ?? []).map((s) => ({
    start: s.start ?? null,
    end: s.end ?? null,
    text: (s.text ?? '').trim(),
  })).filter((s) => s.text);

  const result = {
    text,
    segments,
    duration: Math.round(duration * 100) / 100,
    processing_time: Math.round(processingTime * 100) / 100,
    model: `${GROQ_MODEL} (Groq)`,
    wer: null,
    cer: null,
    reference_normalized: null,
    hypothesis_normalized: null,
    denoised: null,
    wer_delta: null,
  };

  if (reference && reference.length > 0) {
    const metrics = computeWerCer(reference, text);
    Object.assign(result, metrics);
  }

  res.status(200).json(result);
}

// ── Utilitaire : découpe un buffer multipart en parties ──────────────────────
function splitMultipart(buffer, boundary) {
  const enc = new TextEncoder();
  const sep = Buffer.from(`--${boundary}`);
  const parts = [];
  let pos = 0;

  while (pos < buffer.length) {
    const sepIdx = indexOf(buffer, sep, pos);
    if (sepIdx === -1) break;
    pos = sepIdx + sep.length;

    // Fin de multipart
    if (buffer[pos] === 0x2d && buffer[pos + 1] === 0x2d) break;

    // Saut de ligne après le boundary
    if (buffer[pos] === 0x0d) pos++;
    if (buffer[pos] === 0x0a) pos++;

    // Parsing des headers de la partie
    const crlfcrlf = Buffer.from('\r\n\r\n');
    const headersEnd = indexOf(buffer, crlfcrlf, pos);
    if (headersEnd === -1) break;

    const headersRaw = buffer.slice(pos, headersEnd).toString('utf8');
    pos = headersEnd + 4;

    const headers = {};
    for (const line of headersRaw.split('\r\n')) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      headers[line.slice(0, colon).toLowerCase().trim()] = line.slice(colon + 1).trim();
    }

    // Corps de la partie (jusqu'au prochain boundary)
    const nextSep = indexOf(buffer, sep, pos);
    const bodyEnd = nextSep === -1 ? buffer.length : nextSep - 2; // -2 pour le \r\n avant --boundary
    const body = buffer.slice(pos, bodyEnd);
    parts.push({ headers, body });
    pos = nextSep === -1 ? buffer.length : nextSep;
  }

  return parts;
}

function indexOf(buf, search, from = 0) {
  for (let i = from; i <= buf.length - search.length; i++) {
    let found = true;
    for (let j = 0; j < search.length; j++) {
      if (buf[i + j] !== search[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}
