import { getFirestore } from 'firebase-admin/firestore';
import { getProjectId, initAdmin, scriptsRoot } from '../../lib/firebase-admin.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Default collections for this template (also derived from seed file when present). */
const FALLBACK_COLLECTIONS = [
  'branches',
  'menu_categories',
  'menu_items',
  'orders',
];

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--') && a !== '--'));
  return {
    dryRun: flags.has('--dry-run'),
    yes: flags.has('--yes'),
  };
}

function collectionsFromSeed() {
  const seedPath = resolve(
    scriptsRoot,
    process.env.SEED_DATA_PATH?.trim() || '../firebase/seed-data.json',
  );
  if (!existsSync(seedPath)) return FALLBACK_COLLECTIONS;
  try {
    const raw = JSON.parse(readFileSync(seedPath, 'utf8'));
    const keys = Object.keys(raw?.collections ?? {});
    return keys.length > 0 ? keys : FALLBACK_COLLECTIONS;
  } catch {
    return FALLBACK_COLLECTIONS;
  }
}

/**
 * Delete all docs in a collection (batched).
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} collectionName
 * @param {boolean} dryRun
 */
async function clearCollection(db, collectionName, dryRun) {
  const snap = await db.collection(collectionName).get();
  if (snap.empty) {
    console.log(`  ${collectionName}: already empty`);
    return 0;
  }

  if (dryRun) {
    console.log(`  [dry-run] ${collectionName}: would delete ${snap.size} doc(s)`);
    return snap.size;
  }

  let deleted = 0;
  let batch = db.batch();
  let ops = 0;

  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    ops += 1;
    deleted += 1;
    if (ops >= 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();

  console.log(`  ${collectionName}: deleted ${deleted} doc(s)`);
  return deleted;
}

async function main() {
  const { dryRun, yes } = parseArgs(process.argv.slice(2));
  const projectId = getProjectId();
  const collections = collectionsFromSeed();

  console.log(`Project:      ${projectId}`);
  console.log(`Collections:  ${collections.join(', ')}`);
  console.log(`Mode:         ${dryRun ? 'dry-run' : 'DELETE'}`);

  if (!dryRun && !yes) {
    throw new Error(
      'Refusing to clear without --yes (or use --dry-run). Example:\n' +
        '  pnpm clear:firestore -- --yes',
    );
  }

  if (!dryRun) initAdmin();
  else {
    // Still init so we can count docs for dry-run
    initAdmin();
  }

  const db = getFirestore();
  let total = 0;

  console.log('');
  for (const name of collections) {
    total += await clearCollection(db, name, dryRun);
  }

  console.log(
    `\nDone. ${total} document(s)${dryRun ? ' would be deleted' : ' deleted'}.`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
