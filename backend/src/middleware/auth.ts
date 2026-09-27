// =============================================================================
// KALA VOICE QA — Middleware Auth JWT & RBAC
// =============================================================================
import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

// Le secret de signature vient de l'environnement. En production, son absence
// est bloquante : jamais de secret en dur utilisable hors développement.
function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET manquant : définissez-le dans l\'environnement avant de démarrer en production.');
    process.exit(1);
  }

  // Développement seulement : secret aléatoire régénéré à chaque démarrage.
  // Les sessions ouvertes avant un redémarrage deviennent donc invalides.
  const generated = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  JWT_SECRET absent : secret de développement aléatoire généré pour cette session.');
  console.warn('    Définissez JWT_SECRET dans backend/.env pour garder vos sessions entre deux redémarrages.');
  return generated;
}

export const JWT_SECRET = resolveJwtSecret();
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

// Trois rôles : ADMIN, QUALITE_FORMATION (qualité, formation et supervision), AGENT.
export const ROLES = ['ADMIN', 'QUALITE_FORMATION', 'AGENT'] as const;
export const ADMIN_ONLY = ['ADMIN'];
export const STAFF_UP   = ['ADMIN', 'QUALITE_FORMATION'];
export const ALL_ROLES  = ['ADMIN', 'QUALITE_FORMATION', 'AGENT'];
