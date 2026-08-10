#!/usr/bin/env node
/**
 * Truncate catalog tables (category, product). Optional --users.
 *
 * Usage:
 *   node sync-data/clear-db/clear.mjs --yes
 *   node sync-data/clear-db/clear.mjs --yes --users
 *   node sync-data/clear-db/clear.mjs --dry-run
 */
import { createPool } from '../../lib/pg.mjs';

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2)));
  return {
    yes: flags.has('yes'),
    dryRun: flags.has('dry-run'),
    users: flags.has('users'),
  };
}

async function main() {
  const { yes, dryRun, users } = parseArgs(process.argv.slice(2));

  const tables = users
    ? ['product', 'category', 'branch', 'user']
    : ['product', 'category', 'branch'];

  console.log(`Tables: ${tables.join(', ')}`);
  console.log(`Mode:   ${dryRun ? 'dry-run' : 'apply'}`);

  if (dryRun) {
    console.log('Would TRUNCATE … RESTART IDENTITY CASCADE');
    return;
  }

  if (!yes) {
    throw new Error('Refusing to clear without --yes (or use --dry-run)');
  }

  const pool = createPool();
  try {
    await pool.query(
      `TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
    );
    console.log('Cleared.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
