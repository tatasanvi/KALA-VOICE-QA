// =============================================================================
// KALA VOICE QA — Route Auth : Login / Me / Logout
// =============================================================================
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const { compareSync } = bcrypt;
import { requireAuth, signToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis.' });
    return;
  }

  const sqlite = (db as any).session.client;
  const user = sqlite.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email.toLowerCase().trim()) as any;

  if (!user || !compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Identifiants incorrects ou compte inactif.' });
    return;
  }

  // Mettre à jour last_login_at
  sqlite.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
    .run(new Date().toISOString().replace('T', ' ').substring(0, 19), user.id);

  const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

  logAudit(user.id, user.name, user.role, 'CHANGEMENT_ROLE', 'Session', `Connexion réussie depuis ${req.ip}`, req.ip);

  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, department: user.department,
      phone: user.phone, avatarUrl: user.avatar_url,
      isActive: Boolean(user.is_active), createdAt: user.created_at
    }
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  const sqlite = (db as any).session.client;
  const user = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any;

  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable.' });
    return;
  }

  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    department: user.department, phone: user.phone, avatarUrl: user.avatar_url,
    isActive: Boolean(user.is_active), createdAt: user.created_at, lastLoginAt: user.last_login_at
  });
});

// POST /api/auth/logout  (côté serveur, on peut blacklister le token — ici on log juste)
router.post('/logout', requireAuth, (req: Request, res: Response): void => {
  logAudit(req.user!.userId, req.user!.name, req.user!.role, 'CHANGEMENT_ROLE', 'Session', 'Déconnexion.', req.ip);
  res.json({ message: 'Déconnexion enregistrée.' });
});

export default router;
