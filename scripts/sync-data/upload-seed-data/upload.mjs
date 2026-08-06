import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getFirestore } from 'firebase-admin/firestore';
import {
  getProjectId,
  initAdmin,
  scriptsRoot,
} from '../../lib/firebase-admin.mjs';

const PLACEHOLDER_USER_ID = 'REPLACE_WITH_AUTH_UID';

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--') && a !== '--'));
  return {
    dryRun: flags.has('--dry-run'),
    merge: !flags.has('--overwrite'),
  };
}

function loadSeed(path) {
  if (!existsSync(path)) {
    throw new Error(`Seed file not found: ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (!raw?.collections || typeof raw.collections !== 'object') {
    throw new Error('Invalid seed file: expected { "collections": { ... } }');
  }
  return raw;
}

function rewriteUserIds(doc, seedUserId) {
  if (!seedUserId) return doc;
  if (doc.userId === PLACEHOLDER_USER_ID || doc.userId == null) {
    return { ...doc, userId: seedUserId };
  }
  return doc;
}

async function main() {
  const { dryRun, merge } = parseArgs(process.argv.slice(2));
  const projectId = getProjectId();
  const seedUserId = process.env.SEED_USER_ID?.trim();
  const seedPath = resolve(
    scriptsRoot,
    process.env.SEED_DATA_PATH?.trim() || '../firebase/seed-data.json',
  );

  console.log(`Project:  ${projectId}`);
  console.log(`Seed:     ${seedPath}`);
  console.log(`Mode:     ${dryRun ? 'dry-run' : merge ? 'merge' : 'overwrite'}`);
  if (seedUserId) console.log(`SEED_USER_ID → rewrite placeholders to ${seedUserId}`);

  const seed = loadSeed(seedPath);
  const entries = Object.entries(seed.collections);

  if (entries.length === 0) {
    console.log('No collections in seed file — nothing to do.');
    return;
  }

  if (!dryRun) initAdmin();
  const db = dryRun ? null : getFirestore();

  let written = 0;

  for (const [collectionName, docs] of entries) {
    if (!Array.isArray(docs)) {
      console.warn(`Skipping ${collectionName}: expected an array of documents`);
      continue;
    }

    console.log(`\n→ ${collectionName} (${docs.length} docs)`);

    for (const raw of docs) {
      if (!raw?.id || typeof raw.id !== 'string') {
        console.warn('  skip doc without string id');
        continue;
      }

      const prepared = rewriteUserIds(raw, seedUserId);
      const { id, ...data } = prepared;

      if (dryRun) {
        console.log(`  [dry-run] ${collectionName}/${id}`);
        written += 1;
        continue;
      }

      await db.collection(collectionName).doc(id).set(data, { merge });
      console.log(`  wrote ${collectionName}/${id}`);
      written += 1;
    }
  }

  console.log(`\nDone. ${written} document(s)${dryRun ? ' (dry-run)' : ''}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
