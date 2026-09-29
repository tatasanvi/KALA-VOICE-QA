// =============================================================================
// Contrôles d'accès (anti-IDOR), appliqués côté serveur
// Un AGENT n'accède qu'aux appels rattachés à sa fiche agent, ou aux
// transcriptions réelles qu'il a lui-même importées. Les autres rôles
// conservent leur périmètre existant (tous les appels).
// =============================================================================
import type { JwtPayload } from './auth.js';
import db from '../db/index.js';

const sqlite = () => (db as any).session.client;

export async function canAccessCall(user: JwtPayload, row: { agent_id?: string; transcription_json?: string }): Promise<boolean> {
  if (user.role !== 'AGENT') return true;

  const ownAgent = await sqlite()
    .prepare('SELECT 1 FROM agents WHERE id = ? AND user_id = ?')
    .get(row.agent_id ?? '', user.userId);
  if (ownAgent) return true;

  try {
    return JSON.parse(row.transcription_json ?? '{}').createdByUserId === user.userId;
  } catch {
    return false;
  }
}

// Un AGENT n'accède qu'à sa propre fiche agent (et donc à son coaching).
// ADMIN et QUALITE_FORMATION conservent l'accès à tous les conseillers.
export async function canAccessAgent(user: JwtPayload, agentId: string): Promise<boolean> {
  if (user.role !== 'AGENT') return true;
  return Boolean(
    await sqlite().prepare('SELECT 1 FROM agents WHERE id = ? AND user_id = ?').get(agentId, user.userId)
  );
}
