import { promises as fs } from "node:fs";
import path from "node:path";
import {
  createDemoDatabase,
  DEMO_ADMIN_ID,
  type DemoDatabase,
} from "./seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "demo-db.json");
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

let writeChain: Promise<unknown> = Promise.resolve();

function hasActionableDonation(db: DemoDatabase) {
  const now = Date.now();
  return db.donations.some(
    (donation) =>
      (donation.status === "available" || donation.status === "assigned") &&
      new Date(donation.pickupDeadline).getTime() > now,
  );
}

async function save(db: DemoDatabase) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // A unique temporary name avoids two concurrent saves (for example two
  // React Server Component renders in the same process) clobbering each other.
  const temporaryPath = `${DB_PATH}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2)}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(temporaryPath, DB_PATH);
}

let loadInFlight: Promise<DemoDatabase> | null = null;

async function loadFromDisk(): Promise<DemoDatabase> {
  try {
    const contents = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(contents) as DemoDatabase;

    if (!Array.isArray(parsed.profiles) || !Array.isArray(parsed.donations)) {
      throw new Error("Malformed demo database");
    }

    // Older demo workspaces predate the account-state flag.
    parsed.profiles = parsed.profiles.map((profile) => ({
      ...profile,
      isActive: profile.isActive ?? true,
    }));

    // Older demo workspaces also predate the seeded administrator.
    let upgraded = false;
    if (!parsed.profiles.some((profile) => profile.id === DEMO_ADMIN_ID)) {
      const admin = createDemoDatabase().profiles.find(
        (profile) => profile.id === DEMO_ADMIN_ID,
      );
      if (admin) {
        parsed.profiles.push(admin);
        upgraded = true;
      }
    }

    const age = Date.now() - new Date(parsed.seededAt).getTime();
    if (age > MAX_AGE_MS && !hasActionableDonation(parsed)) {
      const fresh = createDemoDatabase();
      await save(fresh);
      return fresh;
    }

    if (upgraded) await save(parsed);

    return parsed;
  } catch {
    const fresh = createDemoDatabase();
    await save(fresh);
    return fresh;
  }
}

/**
 * Deduplicates concurrent first reads. Without this, several server components
 * rendering at once can all decide the workspace is missing and race to create
 * it.
 */
function load(): Promise<DemoDatabase> {
  if (!loadInFlight) {
    loadInFlight = loadFromDisk().finally(() => {
      loadInFlight = null;
    });
  }

  return loadInFlight;
}

/** Read the demo workspace. Writes use an atomic rename so this is safe. */
export function readDemoDatabase() {
  return load();
}

/**
 * Serialise mutations for the file-backed demo workspace. This is intentionally
 * simple — the demo runs in a single Next.js server process. Production data
 * lives in Supabase and uses database-level transactions instead.
 */
export function mutateDemoDatabase<T>(
  mutator: (db: DemoDatabase) => T | Promise<T>,
): Promise<T> {
  const next = writeChain.then(async () => {
    const db = await load();
    const result = await mutator(db);
    await save(db);
    return result;
  });

  writeChain = next.catch(() => undefined);
  return next;
}
