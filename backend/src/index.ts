// =============================================================================
// KALA VOICE QA — Serveur Express Principal
// Backend REST API | Master IA & Big Data
// =============================================================================
import express from 'express';
import cors from 'cors';
import { createTables } from './db/migrate.js';

// Routes
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import callsRouter from './routes/calls.js';
import transcriptionsRouter from './routes/transcriptions.js';
import {
  qualityRouter, criteriaRouter, agentsRouter, teamsRouter,
  campaignsRouter, coachingRouter, trainingRouter,
  dashboardRouter, auditRouter, experimentsRouter
} from './routes/index.js';

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 8000;

// ─── Middleware Globaux ───────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log des requêtes (dev)
app.use((req, _res, next) => {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] ${req.method.padEnd(7)} ${req.path}`);
  next();
});

// ─── Initialisation DB ────────────────────────────────────────────────────────
createTables();

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/users',       usersRouter);
app.use('/api/calls',       callsRouter);
app.use('/api/transcriptions', transcriptionsRouter);
app.use('/api/evaluations', qualityRouter);
app.use('/api/criteria',    criteriaRouter);
app.use('/api/agents',      agentsRouter);
app.use('/api/teams',       teamsRouter);
app.use('/api/campaigns',   campaignsRouter);
app.use('/api/coaching',    coachingRouter);
app.use('/api/training',    trainingRouter);
app.use('/api/dashboard',   dashboardRouter);
app.use('/api/audit',       auditRouter);
app.use('/api/experiments', experimentsRouter);

// ─── Route santé ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'KALA VOICE QA API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint introuvable.' });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       🎙️  KALA VOICE QA — API Backend v1.0.0         ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Serveur démarré sur http://localhost:${PORT}        ║`);
  console.log('║  📡 Endpoints disponibles :                          ║');
  console.log('║     POST /api/auth/login                             ║');
  console.log('║     GET  /api/users  (ADMIN requis)                  ║');
  console.log('║     GET  /api/calls  (tous rôles)                    ║');
  console.log('║     GET  /api/dashboard/metrics                      ║');
  console.log('║     GET  /api/health                                 ║');
  console.log('║  🔑 Mot de passe démo : kala2024!                   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
});

export default app;
