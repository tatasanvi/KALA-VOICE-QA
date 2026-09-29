// =============================================================================
// KALA VOICE QA — Connexion & compatibilité base de données
// SQLite reste utilisé en local ; DATABASE_URL sélectionne PostgreSQL/Supabase.
// =============================================================================
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool, type QueryResultRow } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH ?? join(__dirname, '../../kala.db');
const databaseUrl = process.env.DATABASE_URL?.trim();

const isFirstRun = databaseUrl ? false : !existsSync(DB_PATH);

function convertSql(sql: string): string {
  const replaceInsert = /^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*(VALUES[\s\S]*)$/i.exec(sql);
  if (replaceInsert) {
    const columns = replaceInsert[2].split(',').map((column) => column.trim());
    const updates = columns.filter((column) => column !== 'id')
      .map((column) => `${column} = EXCLUDED.${column}`).join(', ');
    sql = `INSERT INTO ${replaceInsert[1]} (${replaceInsert[2]}) ${replaceInsert[3]} ON CONFLICT (id) DO UPDATE SET ${updates}`;
  }

  const ignoreInsert = /^\s*INSERT\s+OR\s+IGNORE\s+INTO\s/i.test(sql);
  let converted = sql.replace(/^\s*INSERT\s+OR\s+IGNORE\s+INTO\s/i, (prefix) =>
    prefix.replace(/INSERT\s+OR\s+IGNORE/i, 'INSERT')
  );
  let index = 0;
  converted = converted.replace(
    /json_extract\(transcription_json,\s*'\$\.([A-Za-z0-9_]+)'\)/g,
    "(transcription_json::jsonb ->> '$1')",
  );
  converted = converted.replace(/\?/g, () => `$${++index}`);
  if (ignoreInsert) converted = converted.trim().replace(/;?$/, ' ON CONFLICT DO NOTHING');
  return converted;
}

function normalizeRow<T extends QueryResultRow>(row: T | undefined): T | undefined {
  if (!row) return row;
  const normalized = { ...row } as Record<string, unknown>;
  for (const key of ['c', 'count']) {
    if (typeof normalized[key] === 'string' && /^\d+$/.test(normalized[key] as string)) {
      normalized[key] = Number(normalized[key]);
    }
  }
  return normalized as T;
}

class PostgresCompat {
  constructor(private readonly pool: Pool) {}

  exec(sql: string): Promise<void> {
    return this.pool.query(sql).then(() => undefined);
  }

  pragma(_setting: string): void {}

  prepare(sql: string) {
    const normalizedSql = convertSql(sql);
    const pragmaMatch = /^\s*PRAGMA\s+table_info\((\w+)\)\s*;?$/i.exec(sql);
    const query = (params: unknown[]) => pragmaMatch
      ? this.pool.query(
          'SELECT column_name AS name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
          ['public', pragmaMatch[1]],
        )
      : this.pool.query(normalizedSql, params);

    return {
      get: async (...params: unknown[]) => {
        const result = await query(params);
        return normalizeRow(result.rows[0]);
      },
      all: async (...params: unknown[]) => {
        const result = await query(params);
        return result.rows.map((row) => normalizeRow(row));
      },
      run: async (...params: unknown[]) => {
        const result = await query(params);
        return { changes: result.rowCount ?? 0 };
      },
    };
  }
}

let client: any;
if (databaseUrl) {
  const pool = new Pool({ connectionString: databaseUrl, max: 5 });
  client = new PostgresCompat(pool);
} else {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  client = sqlite;
}

export const db = { session: { client } };
export { isFirstRun };
export default db;
