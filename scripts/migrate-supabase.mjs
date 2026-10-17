/**
 * One-shot: copy public data + storage + auth users from OLD → NEW Supabase.
 * Run with OLD_/NEW_ env vars set.
 */
import { createClient } from "@supabase/supabase-js";

const OLD_URL = process.env.OLD_SUPABASE_URL;
const OLD_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error("Missing OLD_/NEW_ SUPABASE_URL or SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const oldSb = createClient(OLD_URL, OLD_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const newSb = createClient(NEW_URL, NEW_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAGE = 1000;

/** @type {{ name: string, conflict?: string }[]} */
const TABLES = [
  { name: "brands" },
  { name: "categories" },
  { name: "products" },
  { name: "product_variants" },
  { name: "inventory", conflict: "variant_id" },
  { name: "product_images" },
  { name: "product_categories", conflict: "product_id,category_id" },
  { name: "hero_slides" },
  { name: "home_reviews_banner" },
  { name: "home_categories_promo" },
  { name: "home_browse_showcase" },
  { name: "home_browse_showcase_products" },
  { name: "home_after_browse_banner" },
  { name: "storefront_settings" },
  { name: "homepage_section_products" },
  { name: "orders" },
  { name: "order_items" },
  { name: "email_verification_codes" },
];

function rewriteUrls(value) {
  if (value == null) return value;
  if (typeof value === "string") return value.split(OLD_URL).join(NEW_URL);
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteUrls(v);
    return out;
  }
  return value;
}

async function fetchAll(client, table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const to = from + PAGE - 1;
    const { data, error } = await client.from(table).select("*").range(from, to);
    if (error) throw new Error(`${table} fetch: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

async function clearTable(table, conflict) {
  const existing = await fetchAll(newSb, table);
  if (!existing.length) return;

  if (conflict === "variant_id") {
    const ids = existing.map((r) => r.variant_id);
    const { error } = await newSb.from(table).delete().in("variant_id", ids);
    if (error) throw new Error(`clear ${table}: ${error.message}`);
    return;
  }
  if (conflict === "product_id,category_id") {
    for (const r of existing) {
      const { error } = await newSb
        .from(table)
        .delete()
        .eq("product_id", r.product_id)
        .eq("category_id", r.category_id);
      if (error) throw new Error(`clear ${table}: ${error.message}`);
    }
    return;
  }

  const ids = existing.map((r) => r.id).filter((id) => id != null);
  if (!ids.length) return;
  const { error } = await newSb.from(table).delete().in("id", ids);
  if (error) throw new Error(`clear ${table}: ${error.message}`);
}

async function upsertRows(table, rows, conflict = "id") {
  if (!rows.length) {
    console.log(`  ${table}: 0 rows`);
    return;
  }
  const rewritten = rows.map(rewriteUrls);
  for (let i = 0; i < rewritten.length; i += 200) {
    const chunk = rewritten.slice(i, i + 200);
    const { error } = await newSb.from(table).upsert(chunk, { onConflict: conflict });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
  }
  console.log(`  ${table}: ${rewritten.length} rows`);
}

async function listAllFiles(bucket, prefix = "") {
  const { data, error } = await oldSb.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`);
  const files = [];
  for (const item of data || []) {
    if (!item.name || item.name === ".emptyFolderPlaceholder") continue;
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id == null) {
      files.push(...(await listAllFiles(bucket, path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

async function listAllFilesOn(client, bucket, prefix = "") {
  const { data, error } = await client.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`);
  const files = [];
  for (const item of data || []) {
    if (!item.name || item.name === ".emptyFolderPlaceholder") continue;
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id == null) {
      files.push(...(await listAllFilesOn(client, bucket, path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

async function migrateStorage() {
  const { data: buckets, error } = await oldSb.storage.listBuckets();
  if (error) throw new Error(`listBuckets: ${error.message}`);

  // Only fill missing files when SKIP_EXISTING_STORAGE=1 (default on SKIP_TABLES)
  const skipExisting =
    process.env.SKIP_EXISTING_STORAGE === "1" || process.env.SKIP_TABLES === "1";

  for (const b of buckets || []) {
    const { data: existing } = await newSb.storage.getBucket(b.name);
    if (!existing) {
      const { error: cErr } = await newSb.storage.createBucket(b.name, {
        public: b.public,
        fileSizeLimit: b.file_size_limit ?? undefined,
        allowedMimeTypes: b.allowed_mime_types ?? undefined,
      });
      if (cErr && !/already exists/i.test(cErr.message)) {
        throw new Error(`createBucket ${b.name}: ${cErr.message}`);
      }
    }

    const files = await listAllFiles(b.name);
    let already = new Set();
    if (skipExisting) {
      try {
        already = new Set(await listAllFilesOn(newSb, b.name));
      } catch (e) {
        console.warn(`  list NEW ${b.name} warn: ${e.message}`);
      }
    }
    const todo = skipExisting ? files.filter((p) => !already.has(p)) : files;
    console.log(
      `  storage ${b.name}: ${files.length} old, ${already.size} already on new, ${todo.length} to copy`,
    );
    let ok = 0;
    for (const path of todo) {
      const { data: blob, error: dErr } = await oldSb.storage.from(b.name).download(path);
      if (dErr) {
        console.warn(`    skip download ${b.name}/${path}: ${dErr.message}`);
        continue;
      }
      const buf = Buffer.from(await blob.arrayBuffer());
      const { error: uErr } = await newSb.storage.from(b.name).upload(path, buf, {
        upsert: true,
        contentType: blob.type || undefined,
      });
      if (uErr) console.warn(`    skip upload ${b.name}/${path}: ${uErr.message}`);
      else ok++;
      if (ok % 25 === 0) console.log(`    progress ${ok}/${todo.length}`);
    }
    console.log(`    uploaded ${ok}/${todo.length}`);
  }
}

async function migrateAuth() {
  const { data, error } = await oldSb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`listUsers: ${error.message}`);
  const users = data?.users || [];
  console.log(`  auth users: ${users.length}`);

  for (const u of users) {
    if (!u.email) continue;
    const tempPassword = `TempMigrate_${u.id.slice(0, 8)}_ChangeMe9!`;
    const { error: cErr } = await newSb.auth.admin.createUser({
      id: u.id,
      email: u.email,
      email_confirm: true,
      password: tempPassword,
      user_metadata: u.user_metadata || {},
      app_metadata: u.app_metadata || {},
    });
    if (cErr) {
      if (/already|exists|registered/i.test(cErr.message)) {
        console.log(`    skip (exists) ${u.email}`);
      } else {
        console.warn(`    create ${u.email}: ${cErr.message}`);
      }
      continue;
    }
    console.log(`    created ${u.email}`);
  }
}

async function main() {
  // SKIP_TABLES=1 → only storage + auth (use when row counts already match)
  const skipTables = process.env.SKIP_TABLES === "1";

  if (!skipTables) {
    console.log("1) Clearing NEW tables…");
    await newSb.from("home_browse_showcase").update({ category_id: null }).gte("id", 0);

    for (const t of [...TABLES].reverse()) {
      try {
        await clearTable(t.name, t.conflict);
        console.log(`  cleared ${t.name}`);
      } catch (e) {
        console.warn(`  clear warn ${t.name}: ${e.message}`);
      }
    }

    console.log("2) Copying table data…");
    const categories = await fetchAll(oldSb, "categories");
    await upsertRows(
      "categories",
      categories.map((c) => ({ ...c, parent_id: null })),
    );
    if (categories.some((c) => c.parent_id)) {
      await upsertRows("categories", categories);
    }

    for (const t of TABLES) {
      if (t.name === "categories") continue;
      const rows = await fetchAll(oldSb, t.name);
      await upsertRows(t.name, rows, t.conflict || "id");
    }
  } else {
    console.log("1–2) Skipping tables (SKIP_TABLES=1) — counts already match");
  }

  console.log("3) Migrating storage (upsert, no duplicates)…");
  await migrateStorage();

  console.log("4) Migrating auth users…");
  await migrateAuth();

  // Quick verify
  const { count } = await newSb
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`Done. NEW products count: ${count}`);
  console.log(`NEW URL: ${NEW_URL}`);
  console.log("NOTE: Auth passwords were reset to temporary values — use Forgot password on the site.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
