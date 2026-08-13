#!/usr/bin/env node
/**
 * Seed branches + categories + products from scripts/seed-data.json.
 * Skips synthetic category slug `all`.
 * Resolves categoryId slugs → UUIDs. Branches are seeded independently (not on products).
 *
 * Usage:
 *   node sync-data/upload-seed-data/upload.mjs
 *   node sync-data/upload-seed-data/upload.mjs --dry-run
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from '../../lib/pg.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SEED = resolve(__dirname, '../../seed-data.json');

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
    seedPath: resolve(
      values['seed-data-path'] ??
        process.env.SEED_DATA_PATH ??
        DEFAULT_SEED,
    ),
  };
}

/**
 * @param {unknown} value
 * @param {string} fallback
 */
function str(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

/**
 * @param {unknown} value
 * @param {number | null} fallback
 */
function num(value, fallback = null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function main() {
  const { dryRun, seedPath } = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(readFileSync(seedPath, 'utf8'));
  const collections = raw?.collections ?? {};
  const branches = Array.isArray(collections.branches)
    ? collections.branches
    : [];
  const categories = Array.isArray(collections.menu_categories)
    ? collections.menu_categories
    : [];
  const products = Array.isArray(collections.menu_items)
    ? collections.menu_items
    : [];

  const categoryRows = categories.filter((c) => c?.id && c.id !== 'all');

  console.log(`Seed file:   ${seedPath}`);
  console.log(`Branches:    ${branches.length}`);
  console.log(`Categories:  ${categoryRows.length} (skipped synthetic "all")`);
  console.log(`Products:    ${products.length}`);
  console.log(`Mode:        ${dryRun ? 'dry-run' : 'apply'}`);
  console.log('');

  if (dryRun) {
    for (const b of branches) {
      console.log(
        `  branch slug=${b.id} name=${b.name} lat=${b.lat ?? '—'} lng=${b.lng ?? '—'} radiusKm=${b.deliveryRadiusKm ?? '—'}`,
      );
    }
    for (const c of categoryRows) {
      console.log(`  category slug=${c.id} label=${c.label}`);
    }
    for (const p of products) {
      console.log(
        `  product slug=${p.id} categoryId=${p.categoryId}`,
      );
    }
    return;
  }

  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /** @type {Map<string, string>} */
    const branchSlugToId = new Map();
    /** @type {Map<string, string>} */
    const categorySlugToId = new Map();

    for (const b of branches) {
      const slug = str(b.id);
      const result = await client.query(
        `INSERT INTO "branch" (
           slug, name, name_arabic, address, address_arabic,
           eta_minutes, lat, lng, delivery_radius_km, active, sort_order
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           name_arabic = EXCLUDED.name_arabic,
           address = EXCLUDED.address,
           address_arabic = EXCLUDED.address_arabic,
           eta_minutes = EXCLUDED.eta_minutes,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           delivery_radius_km = EXCLUDED.delivery_radius_km,
           active = EXCLUDED.active,
           sort_order = EXCLUDED.sort_order,
           updated_at = now()
         RETURNING id`,
        [
          slug,
          str(b.name),
          str(b.name_arabic),
          str(b.address),
          str(b.address_arabic),
          num(b.etaMinutes, 15) ?? 15,
          num(b.lat, null),
          num(b.lng, null),
          num(b.deliveryRadiusKm, null),
          b.active !== false,
          num(b.sortOrder, 0) ?? 0,
        ],
      );
      branchSlugToId.set(slug, result.rows[0].id);
      console.log(`Upserted branch ${slug}`);
    }

    for (const c of categoryRows) {
      const slug = str(c.id);
      const result = await client.query(
        `INSERT INTO "category" (slug, label, label_arabic, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET
           label = EXCLUDED.label,
           label_arabic = EXCLUDED.label_arabic,
           sort_order = EXCLUDED.sort_order,
           updated_at = now()
         RETURNING id`,
        [
          slug,
          str(c.label),
          str(c.label_arabic),
          num(c.sortOrder, 0) ?? 0,
        ],
      );
      categorySlugToId.set(slug, result.rows[0].id);
      console.log(`Upserted category ${slug}`);
    }

    for (const p of products) {
      const slug = str(p.id);
      const categorySlug = str(p.categoryId);
      const categoryId = categorySlugToId.get(categorySlug);
      if (!categoryId) {
        throw new Error(
          `Product ${slug}: unknown categoryId "${categorySlug}"`,
        );
      }

      await client.query(
        `INSERT INTO "product" (
           slug, name, name_arabic, description, description_arabic,
           long_description, long_description_arabic,
           featured_subtitle, featured_subtitle_arabic,
           price, category_id, image, featured,
           badge, badge_arabic, calories, available, sort_order, modifiers
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb
         )
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           name_arabic = EXCLUDED.name_arabic,
           description = EXCLUDED.description,
           description_arabic = EXCLUDED.description_arabic,
           long_description = EXCLUDED.long_description,
           long_description_arabic = EXCLUDED.long_description_arabic,
           featured_subtitle = EXCLUDED.featured_subtitle,
           featured_subtitle_arabic = EXCLUDED.featured_subtitle_arabic,
           price = EXCLUDED.price,
           category_id = EXCLUDED.category_id,
           image = EXCLUDED.image,
           featured = EXCLUDED.featured,
           badge = EXCLUDED.badge,
           badge_arabic = EXCLUDED.badge_arabic,
           calories = EXCLUDED.calories,
           available = EXCLUDED.available,
           sort_order = EXCLUDED.sort_order,
           modifiers = EXCLUDED.modifiers,
           updated_at = now()`,
        [
          slug,
          str(p.name),
          str(p.name_arabic),
          str(p.description),
          str(p.description_arabic),
          str(p.longDescription),
          str(p.longDescription_arabic),
          p.featuredSubtitle != null ? str(p.featuredSubtitle) : null,
          p.featuredSubtitle_arabic != null
            ? str(p.featuredSubtitle_arabic)
            : null,
          num(p.price, 0) ?? 0,
          categoryId,
          str(p.image),
          Boolean(p.featured),
          p.badge != null ? str(p.badge) : null,
          p.badge_arabic != null ? str(p.badge_arabic) : null,
          num(p.calories, null),
          p.available !== false,
          num(p.sortOrder, 0) ?? 0,
          JSON.stringify(Array.isArray(p.modifiers) ? p.modifiers : []),
        ],
      );
      console.log(`Upserted product ${slug}`);
    }

    await client.query('COMMIT');
    console.log('');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
