// =============================================================================
// KALA VOICE QA — Middleware Auth JWT & RBAC
// =============================================================================
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET ?? 'kala-voice-qa-secret-dev-2024';
export const JWT_EXPIRES = '8h'; // Session de travail journalière

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   string;
  name:   string;
}

// Étendre Request Express avec l'utilisateur décodé
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Guard JWT ────────────────────────────────────────────────────────────────
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Token manquant — authentification requise.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré — veuillez vous reconnecter.' });
  }
};

// ─── Guard RBAC ───────────────────────────────────────────────────────────────
export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Accès refusé. Rôle requis : ${roles.join(' ou ')}. Votre rôle : ${req.user.role}.`
      });
      return;
    }
    next();
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const ADMIN_ROLES  = ['ADMIN'];
export const MANAGER_UP   = ['ADMIN', 'MANAGER'];
export const SUPERVISOR_UP = ['ADMIN', 'MANAGER', 'SUPERVISOR'];
export const QA_UP        = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'QA_MANAGER'];
export const TRAINER_UP   = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'QA_MANAGER', 'TRAINER'];
export const ALL_ROLES    = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'QA_MANAGER', 'TRAINER', 'AGENT'];
