import { getAuth } from 'firebase-admin/auth';
import { getProjectId, initAdmin } from '../../lib/firebase-admin.mjs';

/** Defaults for public / customer preview demos — override via env or flags. */
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

/**
 * @param {import('firebase-admin/auth').Auth} auth
 * @param {string} email
 */
async function findByEmail(auth, email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (err?.code === 'auth/user-not-found') return null;
    throw err;
  }
}

async function main() {
  const { dryRun, email, password, displayName } = parseArgs(
    process.argv.slice(2),
  );

  if (!email.includes('@')) {
    throw new Error(`Invalid email: ${email}`);
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters (Firebase Auth).');
  }

  const projectId = getProjectId();
  console.log(`Project:      ${projectId}`);
  console.log(`Email:        ${email}`);
  console.log(`Display name: ${displayName}`);
  console.log(`Mode:         ${dryRun ? 'dry-run' : 'apply'}`);
  console.log('');

  if (dryRun) {
    console.log('Would create/update Auth user and set custom claim { admin: true }.');
    console.log(`Password: ${password}`);
    return;
  }

  initAdmin();
  const auth = getAuth();
  const existing = await findByEmail(auth, email);

  let user;
  if (existing) {
    user = await auth.updateUser(existing.uid, {
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
    console.log(`Updated existing user ${user.uid}`);
  } else {
    user = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
    console.log(`Created user ${user.uid}`);
  }

  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log('Set custom claim: admin = true');
  console.log('');
  console.log('--- Preview admin credentials ---');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------');
  console.log('Sign in on the admin app, then refresh the session if claims were stale.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
