// =============================================================================
// Contrôle d'accès à un appel (anti-IDOR), appliqué côté serveur
// Un AGENT n'accède qu'aux appels rattachés à sa fiche agent, ou aux
// transcriptions réelles qu'il a lui-même importées. Les autres rôles
// conservent leur périmètre existant (tous les appels).
// =============================================================================
import type { JwtPayload } from './auth.js';
import db from '../db/index.js';

const sqlite = () => (db as any).session.client;

export function canAccessCall(user: JwtPayload, row: { agent_id?: string; transcription_json?: string }): boolean {
  if (user.role !== 'AGENT') return true;

  const ownAgent = sqlite()
    .prepare('SELECT 1 FROM agents WHERE id = ? AND user_id = ?')
    .get(row.agent_id ?? '', user.userId);
  if (ownAgent) return true;

  try {
    return JSON.parse(row.transcription_json ?? '{}').createdByUserId === user.userId;
  } catch {
    return false;
  }
}
