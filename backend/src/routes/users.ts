// =============================================================================
// KALA VOICE QA — Routes Users CRUD + Gestion des Rôles
// =============================================================================
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import { requireAuth, requireRole, ADMIN_ROLES } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import db from '../db/index.js';

const router = Router();
const adminOnly = requireRole(...ADMIN_ROLES);

const toUser = (u: any) => ({
  id: u.id, name: u.name, email: u.email, role: u.role,
  department: u.department, phone: u.phone, avatarUrl: u.avatar_url,
  isActive: Boolean(u.is_active), createdAt: u.created_at, lastLoginAt: u.last_login_at
});

const sqlite = () => (db as any).session.client;

// GET /api/users
router.get('/', requireAuth, adminOnly, (_req: Request, res: Response): void => {
  const rows = sqlite().prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json(rows.map(toUser));
});

// GET /api/users/:id
router.get('/:id', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const row = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }
  res.json(toUser(row));
});

// POST /api/users  — Créer un compte
router.post('/', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const { name, email, password, role, department, phone, isActive } = req.body as any;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Champs requis : name, email, password, role.' });
    return;
  }

  const existing = sqlite().prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    return;
  }

  const id = `user-${Date.now()}`;
  const passwordHash = hashSync(password ?? 'kala2024!', 10);
  const createdAt = new Date().toISOString().substring(0, 10);

  sqlite().prepare(`
    INSERT INTO users (id, name, email, password_hash, role, department, phone, avatar_url, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
  `).run(id, name.trim(), email.toLowerCase().trim(), passwordHash, role, department ?? '', phone ?? '', isActive ? 1 : 0, createdAt);

  const newUser = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'CREATION_UTILISATEUR', `Utilisateur ${name}`,
    `Compte créé : ${email} | Rôle : ${role} | Dépt : ${department}`, req.ip);

  res.status(201).json(toUser(newUser));
});

// PUT /api/users/:id  — Modifier un compte
router.put('/:id', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const { id } = req.params;
  const prev = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!prev) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }

  // Empêcher de modifier son propre rôle/compte via cette route
  const { name, email, role, department, phone, isActive, password } = req.body as any;

  const updates: string[] = [];
  const changes: string[] = [];

  if (name   && name   !== prev.name)               { updates.push(`name = '${name.trim()}'`);   changes.push(`Nom: ${prev.name} → ${name}`); }
  if (email  && email  !== prev.email)              { updates.push(`email = '${email.toLowerCase().trim()}'`); changes.push(`Email: ${prev.email} → ${email}`); }
  if (role   && role   !== prev.role)               { updates.push(`role = '${role}'`);           changes.push(`Rôle: ${prev.role} → ${role}`); }
  if (department !== undefined && department !== prev.department) { updates.push(`department = '${department}'`); }
  if (phone  !== undefined && phone  !== prev.phone) { updates.push(`phone = '${phone}'`); }
  if (isActive !== undefined && Boolean(isActive) !== Boolean(prev.is_active)) {
    updates.push(`is_active = ${isActive ? 1 : 0}`);
    changes.push(`Statut: ${Boolean(prev.is_active) ? 'Actif' : 'Inactif'} → ${isActive ? 'Actif' : 'Inactif'}`);
  }
  if (password) {
    updates.push(`password_hash = '${hashSync(password, 10)}'`);
    changes.push('Mot de passe modifié');
  }

  if (updates.length === 0) {
    res.json(toUser(prev));
    return;
  }

  sqlite().prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(id);

  const updated = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'MODIFICATION_UTILISATEUR', `Utilisateur ${prev.name}`,
    changes.length ? changes.join(' | ') : 'Informations mises à jour', req.ip);

  res.json(toUser(updated));
});

// PATCH /api/users/:id/role  — Changer uniquement le rôle
router.patch('/:id/role', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { role } = req.body as { role?: string };
  const valid = ['ADMIN','MANAGER','SUPERVISOR','QA_MANAGER','TRAINER','AGENT'];

  if (!role || !valid.includes(role)) {
    res.status(400).json({ error: `Rôle invalide. Valeurs acceptées: ${valid.join(', ')}` });
    return;
  }

  const user = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }

  const prevRole = user.role;
  sqlite().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'CHANGEMENT_ROLE', `Utilisateur ${user.name}`,
    `Rôle modifié : ${prevRole} → ${role}`, req.ip);

  res.json({ ...toUser(user), role });
});

// PATCH /api/users/:id/toggle-active  — Activer / Désactiver
router.patch('/:id/toggle-active', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (id === req.user!.userId) {
    res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte.' });
    return;
  }

  const user = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }

  const newActive = user.is_active ? 0 : 1;
  sqlite().prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newActive, id);

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'MODIFICATION_UTILISATEUR', `Utilisateur ${user.name}`,
    `Compte ${newActive ? 'activé' : 'désactivé'}`, req.ip);

  res.json({ ...toUser(user), isActive: Boolean(newActive) });
});

// DELETE /api/users/:id
router.delete('/:id', requireAuth, adminOnly, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (id === req.user!.userId) {
    res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    return;
  }

  const user = sqlite().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }

  sqlite().prepare('DELETE FROM users WHERE id = ?').run(id);

  logAudit(req.user!.userId, req.user!.name, req.user!.role,
    'SUPPRESSION_UTILISATEUR', `Utilisateur ${user.name}`,
    `Compte supprimé : ${user.email} | Rôle : ${user.role}`, req.ip);

  res.status(204).end();
});

export default router;
