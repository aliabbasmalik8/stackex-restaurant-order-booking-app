#!/usr/bin/env node
/**
 * Create/update a Postgres admin user (is_super_admin = true).
 * Password hashed with bcryptjs (10 rounds) — same as Nest AuthService.
 *
 * Usage:
 *   node auth/create-admin/create.mjs
 *   node auth/create-admin/create.mjs --email=admin@example.com --password=Secret123
 *   node auth/create-admin/create.mjs --dry-run
 */
import { hash } from 'bcryptjs';
import { createPool } from '../../lib/pg.mjs';

const DEFAULTS = {
  email: 'admin@example.com',
  password: 'PreviewAdmin123!',
  displayName: 'Preview Admin',
};

function parseArgs(argv) {
  const flags = new Set();
  /** @type {Record<string, string>} */
  const values = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--') || arg === '--') continue;
    const body = arg.slice(2);
    const eq = body.indexOf('=');
    if (eq >= 0) {
      values[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      values[body] = next;
      i++;
      continue;
    }
    flags.add(body);
  }

  return {
    dryRun: flags.has('dry-run'),
    email: (values.email ?? process.env.ADMIN_EMAIL ?? DEFAULTS.email).trim(),
    password: values.password ?? process.env.ADMIN_PASSWORD ?? DEFAULTS.password,
    displayName: (
      values['display-name'] ??
      process.env.ADMIN_DISPLAY_NAME ??
      DEFAULTS.displayName
    ).trim(),
  };
}

async function main() {
  const { dryRun, email, password, displayName } = parseArgs(
    process.argv.slice(2),
  );

  if (!email.includes('@')) {
    throw new Error(`Invalid email: ${email}`);
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  console.log(`Email:        ${email}`);
  console.log(`Display name: ${displayName}`);
  console.log(`Mode:         ${dryRun ? 'dry-run' : 'apply'}`);
  console.log('');

  if (dryRun) {
    console.log(
      'Would upsert user with is_super_admin=true and bcrypt password hash.',
    );
    console.log(`Password: ${password}`);
    return;
  }

  const passwordHash = await hash(password, 10);
  const pool = createPool();
  try {
    const existing = await pool.query(
      `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE "user"
         SET name = $2,
             password = $3,
             is_super_admin = true,
             is_active = true
         WHERE id = $1`,
        [existing.rows[0].id, displayName, passwordHash],
      );
      console.log(`Updated existing admin ${existing.rows[0].id}`);
    } else {
      const inserted = await pool.query(
        `INSERT INTO "user" (name, email, password, is_super_admin, is_active)
         VALUES ($1, $2, $3, true, true)
         RETURNING id`,
        [displayName, email, passwordHash],
      );
      console.log(`Created admin ${inserted.rows[0].id}`);
    }

    console.log('');
    console.log('--- Admin credentials ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------------');
    console.log('POST /api/users/login with these credentials.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
