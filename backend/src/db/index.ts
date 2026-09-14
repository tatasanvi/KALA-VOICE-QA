// =============================================================================
// KALA VOICE QA — Connexion & Initialisation de la Base de Données
// =============================================================================
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../kala.db');

const isFirstRun = !existsSync(DB_PATH);

const sqlite = new Database(DB_PATH);
// Performances SQLite
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export { isFirstRun };
export default db;
