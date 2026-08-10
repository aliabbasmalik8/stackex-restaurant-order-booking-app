import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

/**
 * Normalize URLs some tools use (`postgresql+psycopg://`) for node-pg.
 * @param {string} url
 */
export function normalizeDatabaseUrl(url) {
  return url.replace(/^postgresql\+psycopg:/, 'postgresql:');
}

export function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      'DATABASE_URL is required in scripts/.env (e.g. postgres://user:pass@localhost:5432/order-booking)',
    );
  }
  return normalizeDatabaseUrl(raw);
}

/** @returns {import('pg').Pool} */
export function createPool() {
  return new Pool({ connectionString: getDatabaseUrl() });
}
