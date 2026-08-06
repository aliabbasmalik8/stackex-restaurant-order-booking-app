import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

const scriptsRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
loadEnv({ path: resolve(scriptsRoot, '.env') });

export { scriptsRoot };

export function resolveCredential() {
  const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonInline) {
    return cert(JSON.parse(jsonInline));
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credPath) {
    const absolute = resolve(scriptsRoot, credPath);
    if (!existsSync(absolute)) {
      throw new Error(
        `Service account file not found: ${absolute}\n` +
          `Set GOOGLE_APPLICATION_CREDENTIALS in scripts/.env`,
      );
    }
    return cert(JSON.parse(readFileSync(absolute, 'utf8')));
  }

  throw new Error(
    'Missing credentials. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON in scripts/.env',
  );
}

export function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is required in scripts/.env');
  }

  return initializeApp({
    credential: resolveCredential(),
    projectId,
  });
}

export function getProjectId() {
  return process.env.FIREBASE_PROJECT_ID?.trim() ?? '(unknown)';
}
