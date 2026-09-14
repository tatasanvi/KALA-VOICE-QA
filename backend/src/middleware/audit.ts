// =============================================================================
// KALA VOICE QA — Middleware Audit & Traçabilité Automatique
// =============================================================================
import { Request, Response, NextFunction } from 'express';
import db from '../db/index.js';

export function logAudit(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  targetResource: string,
  details: string,
  ip: string = '127.0.0.1'
): void {
  try {
    const sqlite = (db as any).session.client;
    sqlite.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, target_resource, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId, userName, userRole, action, targetResource, details, ip
    );
  } catch (err) {
    console.error('[Audit] Erreur écriture journal:', err);
  }
}

// Middleware de journalisation automatique des mutations (POST/PUT/DELETE/PATCH)
export const auditMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (req.user && mutationMethods.includes(req.method)) {
    const action = req.method === 'POST'   ? 'IMPORT_AUDIO'
                 : req.method === 'DELETE' ? 'SUPPRESSION_UTILISATEUR'
                 : 'MODIFICATION_UTILISATEUR';
    logAudit(
      req.user.userId,
      req.user.name,
      req.user.role,
      action,
      req.path,
      `${req.method} ${req.path}`,
      req.ip ?? '127.0.0.1'
    );
  }
  next();
};
