import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { FINE_GRASS_BAKES_VERSION } from "./fineGrassBakes.js";

const MIB = 1024 * 1024;
const FINE_GRASS_BAKE_DIR = ["assets", "procedural", "baked", "fine-grass-strokes"];
const FINE_GRASS_BAKE_MANIFEST = [...FINE_GRASS_BAKE_DIR, "manifest.json"];
const PROP_DUPLICATE_CATEGORIES = Object.freeze([
  {
    id: "rocks",
    legacyDir: ["assets", "props", "rocks"],
    canonicalDir: ["assets", "props", "auto-place", "rocks"],
  },
  {
    id: "trees",
    legacyDir: ["assets", "props", "trees"],
    canonicalDir: ["assets", "props", "auto-place", "trees"],
  },
]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export const GENERATED_ASSET_AUDIT_DEFAULTS = Object.freeze({
  currentFineGrassBakeVersion: FINE_GRASS_BAKES_VERSION,
  fineGrassBakeMaxEntries: 24,
  fineGrassBakeMaxBytes: 128 * MIB,
});

export async function auditGeneratedAssets(rootDir, options = {}) {
  const normalizedOptions = normalizeAuditOptions(options);
  const [fineGrassBakes, legacyPropDuplicates] = await Promise.all([
    auditFineGrassBakes(rootDir, normalizedOptions),
    auditLegacyPropDuplicates(rootDir),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    fineGrassBakes,
    legacyPropDuplicates,
  };
}

export async function auditFineGrassBakes(rootDir, options = {}) {
  const normalizedOptions = normalizeAuditOptions(options);
  const bakeDir = join(rootDir, ...FINE_GRASS_BAKE_DIR);
  const manifestPath = join(rootDir, ...FINE_GRASS_BAKE_MANIFEST);
  const manifest = normalizeFineGrassBakeManifest(await readJsonFile(manifestPath, fallbackFineGrassBakeManifest()));
  const imageFiles = await listImageFiles(bakeDir);
  const fileStats = new Map();
  for (const file of imageFiles) {
    const filePath = join(bakeDir, file);
    const info = await stat(filePath);
    fileStats.set(file, {
      file,
      bytes: info.size,
      path: toPosix(relative(rootDir, filePath)),
    });
  }

  const referencedFiles = new Set(manifest.entries.map((entry) => entry.file).filter(Boolean));
  const missingFiles = manifest.entries
    .filter((entry) => entry.file && !fileStats.has(entry.file))
    .map((entry) => bakeEntrySummary(entry));
  const orphanFiles = [...fileStats.values()]
    .filter((file) => !referencedFiles.has(file.file))
    .map((file) => ({ file: file.file, path: file.path, bytes: file.bytes }));
  const entries = manifest.entries.map((entry) => ({
    ...entry,
    fileBytes: fileStats.get(entry.file)?.bytes ?? 0,
  }));
  const staleVersionEntries = entries
    .filter((entry) => entry.version !== normalizedOptions.currentFineGrassBakeVersion && entry.keep !== true)
    .map((entry) => bakeEntrySummary(entry));
  const duplicateGroups = duplicateFineGrassBakeGroups(entries);
  const retirePlan = buildFineGrassBakeRetirePlan({
    entries,
    orphanFiles,
    duplicateGroups,
    staleVersionEntries,
    maxEntries: normalizedOptions.fineGrassBakeMaxEntries,
    maxBytes: normalizedOptions.fineGrassBakeMaxBytes,
  });
  const totalPngBytes = [...fileStats.values()].reduce((sum, file) => sum + file.bytes, 0);
  const referencedPngBytes = entries.reduce((sum, entry) => sum + entry.fileBytes, 0);

  return {
    dir: toPosix(relative(rootDir, bakeDir)),
    manifestPath: toPosix(relative(rootDir, manifestPath)),
    currentVersion: normalizedOptions.currentFineGrassBakeVersion,
    maxEntries: normalizedOptions.fineGrassBakeMaxEntries,
    maxBytes: normalizedOptions.fineGrassBakeMaxBytes,
    entryCount: entries.length,
    fileCount: imageFiles.length,
    totalPngBytes,
    referencedPngBytes,
    orphanPngBytes: orphanFiles.reduce((sum, file) => sum + file.bytes, 0),
    currentVersionEntries: entries.filter((entry) => entry.version === normalizedOptions.currentFineGrassBakeVersion).length,
    staleVersionEntries,
    missingFiles,
    orphanFiles,
    duplicateGroups,
    retirePlan,
  };
}

export async function auditLegacyPropDuplicates(rootDir) {
  const result = [];
  for (const category of PROP_DUPLICATE_CATEGORIES) {
    const legacyDir = join(rootDir, ...category.legacyDir);
    const canonicalDir = join(rootDir, ...category.canonicalDir);
    const [legacyFiles, canonicalFiles] = await Promise.all([
      hashedImageFiles(rootDir, legacyDir),
      hashedImageFiles(rootDir, canonicalDir),
    ]);
    const canonicalByHash = groupBy(canonicalFiles, (file) => file.sha256);
    const duplicates = [];
    for (const legacy of legacyFiles) {
      for (const canonical of canonicalByHash.get(legacy.sha256) ?? []) {
        duplicates.push({
          legacy: legacy.path,
          canonical: canonical.path,
          file: legacy.file,
          bytes: legacy.bytes,
          sha256: legacy.sha256,
        });
      }
    }
    result.push({
      category: category.id,
      legacyDir: toPosix(join(...category.legacyDir)),
      canonicalDir: toPosix(join(...category.canonicalDir)),
      legacyFiles: legacyFiles.length,
      canonicalFiles: canonicalFiles.length,
      duplicateFiles: duplicates.length,
      duplicateBytes: duplicates.reduce((sum, item) => sum + item.bytes, 0),
      duplicates,
    });
  }
  return result;
}

export async function applyFineGrassBakeRetirePlan(rootDir, fineGrassBakes) {
  const plan = fineGrassBakes.retirePlan;
  if (!plan || (plan.entries.length === 0 && plan.files.length === 0)) {
    return { applied: false, entries: 0, files: 0, retiredDir: null };
  }
  const bakeDir = join(rootDir, ...FINE_GRASS_BAKE_DIR);
  const manifestPath = join(rootDir, ...FINE_GRASS_BAKE_MANIFEST);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const retiredDir = join(bakeDir, "retired", stamp);
  assertInside(bakeDir, retiredDir);
  await mkdir(retiredDir, { recursive: true });

  const manifest = normalizeFineGrassBakeManifest(await readJsonFile(manifestPath, fallbackFineGrassBakeManifest()));
  const retireKeys = new Set(plan.entries.map((entry) => entry.key));
  const nextManifest = {
    ...manifest,
    updatedAt: new Date().toISOString(),
    entries: manifest.entries.filter((entry) => !retireKeys.has(entry.key)),
  };

  await writeJson(join(retiredDir, "manifest.before.json"), manifest);
  await writeJson(join(retiredDir, "retire-plan.json"), plan);
  for (const file of plan.files) {
    const source = join(bakeDir, file.file);
    const target = join(retiredDir, file.file);
    assertInside(bakeDir, source);
    assertInside(retiredDir, target);
    await rename(source, target);
  }
  await writeJsonAtomic(manifestPath, nextManifest);
  return {
    applied: true,
    entries: plan.entries.length,
    files: plan.files.length,
    retiredDir: toPosix(relative(rootDir, retiredDir)),
  };
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "--";
  if (bytes >= MIB) return `${(bytes / MIB).toFixed(bytes >= 10 * MIB ? 1 : 2)}MiB`;
  const kib = bytes / 1024;
  if (kib >= 1) return `${kib.toFixed(kib >= 10 ? 1 : 0)}KiB`;
  return `${Math.round(bytes)}B`;
}

function buildFineGrassBakeRetirePlan({ entries, orphanFiles, duplicateGroups, staleVersionEntries, maxEntries, maxBytes }) {
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
  const retireKeys = new Set(staleVersionEntries.map((entry) => entry.key));
  for (const group of duplicateGroups) {
    for (const entry of group.retireCandidates) retireKeys.add(entry.key);
  }

  const remaining = () => entries.filter((entry) => !retireKeys.has(entry.key));
  while (remaining().length > maxEntries || remaining().reduce((sum, entry) => sum + entry.fileBytes, 0) > maxBytes) {
    const oldest = remaining()
      .filter((entry) => entry.keep !== true)
      .sort(sortBakeEntriesOldestFirst)[0];
    if (!oldest) break;
    retireKeys.add(oldest.key);
  }

  const entriesToRetire = [...retireKeys]
    .map((key) => entryByKey.get(key))
    .filter(Boolean)
    .sort(sortBakeEntriesOldestFirst)
    .map((entry) => bakeEntrySummary(entry));
  const keptFiles = new Set(entries.filter((entry) => !retireKeys.has(entry.key)).map((entry) => entry.file));
  const entryFiles = entriesToRetire
    .map((entry) => ({ file: entry.file, bytes: entry.fileBytes ?? 0, reason: "retired-entry" }))
    .filter((file) => file.file && !keptFiles.has(file.file));
  const filesByName = new Map();
  for (const file of [...entryFiles, ...orphanFiles.map((file) => ({ ...file, reason: "orphan-file" }))]) {
    if (!file.file || keptFiles.has(file.file)) continue;
    filesByName.set(file.file, {
      file: file.file,
      bytes: file.bytes ?? 0,
      reason: file.reason,
    });
  }
  return {
    entries: entriesToRetire,
    files: [...filesByName.values()].sort((a, b) => a.file.localeCompare(b.file)),
  };
}

function duplicateFineGrassBakeGroups(entries) {
  const groups = groupBy(entries, (entry) => fineGrassBakeShapeKey(entry));
  return [...groups.entries()]
    .map(([shapeKey, groupEntries]) => {
      const sorted = [...groupEntries].sort(sortBakeEntriesNewestFirst);
      const keep = sorted.find((entry) => entry.keep === true) ?? sorted[0];
      const retireCandidates = sorted
        .filter((entry) => entry.key !== keep.key && entry.keep !== true)
        .map((entry) => bakeEntrySummary(entry));
      return {
        shapeKey,
        entries: sorted.map((entry) => bakeEntrySummary(entry)),
        keep: bakeEntrySummary(keep),
        retireCandidates,
      };
    })
    .filter((group) => group.entries.length > 1)
    .sort((a, b) => a.shapeKey.localeCompare(b.shapeKey));
}

function fineGrassBakeShapeKey(entry) {
  return [
    entry.version,
    entry.element,
    entry.seed,
    entry.biome,
    `${entry.widthTiles}x${entry.heightTiles}`,
    `tile${entry.tileSize}`,
  ].join(":");
}

function bakeEntrySummary(entry) {
  return {
    key: entry.key,
    version: entry.version,
    biome: entry.biome,
    seed: entry.seed,
    widthTiles: entry.widthTiles,
    heightTiles: entry.heightTiles,
    tileSize: entry.tileSize,
    paramsHash: entry.paramsHash,
    file: entry.file,
    fileBytes: entry.fileBytes ?? 0,
    updatedAt: entry.updatedAt,
    keep: entry.keep === true,
  };
}

function normalizeFineGrassBakeManifest(manifest = {}) {
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  return {
    version: Number.isFinite(Number(manifest.version)) ? Number(manifest.version) : 1,
    kind: typeof manifest.kind === "string" ? manifest.kind : "fine-grass-strokes-bakes",
    updatedAt: typeof manifest.updatedAt === "string" ? manifest.updatedAt : null,
    entries: entries.map(normalizeFineGrassBakeEntry).filter(Boolean),
  };
}

function normalizeFineGrassBakeEntry(entry = {}) {
  const key = safeToken(entry.key);
  const file = safeFilename(entry.file);
  if (!key || !file) return null;
  const widthTiles = Math.max(1, Math.round(Number(entry.widthTiles) || 54));
  const heightTiles = Math.max(1, Math.round(Number(entry.heightTiles) || 34));
  const tileSize = Math.max(1, Math.round(Number(entry.tileSize) || 48));
  return {
    version: String(entry.version ?? GENERATED_ASSET_AUDIT_DEFAULTS.currentFineGrassBakeVersion),
    element: "fine-grass-strokes",
    key,
    seed: Math.round(Number(entry.seed) || 1),
    biome: normalizeFineGrassBiome(entry.biome),
    widthTiles,
    heightTiles,
    tileSize,
    pixelWidth: Math.max(1, Math.round(Number(entry.pixelWidth) || widthTiles * tileSize)),
    pixelHeight: Math.max(1, Math.round(Number(entry.pixelHeight) || heightTiles * tileSize)),
    paramsHash: safeToken(entry.paramsHash),
    file,
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : null,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : null,
    source: typeof entry.source === "string" ? entry.source : "material-lab",
    keep: entry.keep === true,
    note: typeof entry.note === "string" ? entry.note : undefined,
  };
}

function normalizeFineGrassBiome(value) {
  if (value === "forest" || value === "mountain") return value;
  return "grassland";
}

function sortBakeEntriesNewestFirst(a, b) {
  return bakeEntryTime(b) - bakeEntryTime(a) || String(a.key).localeCompare(String(b.key));
}

function sortBakeEntriesOldestFirst(a, b) {
  return bakeEntryTime(a) - bakeEntryTime(b) || String(a.key).localeCompare(String(b.key));
}

function bakeEntryTime(entry) {
  const time = Date.parse(entry.updatedAt ?? entry.createdAt ?? "");
  return Number.isFinite(time) ? time : 0;
}

async function hashedImageFiles(rootDir, dir) {
  const files = await listImageFiles(dir);
  const result = [];
  for (const file of files) {
    const filePath = join(dir, file);
    const buffer = await readFile(filePath);
    result.push({
      file,
      path: toPosix(relative(rootDir, filePath)),
      bytes: buffer.length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    });
  }
  return result;
}

async function listImageFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeJsonAtomic(path, value) {
  const tempPath = `${path}.tmp`;
  await writeJson(tempPath, value);
  await rename(tempPath, path);
}

function fallbackFineGrassBakeManifest() {
  return {
    version: 1,
    kind: "fine-grass-strokes-bakes",
    updatedAt: null,
    entries: [],
  };
}

function normalizeAuditOptions(options = {}) {
  return {
    currentFineGrassBakeVersion: String(
      options.currentFineGrassBakeVersion ?? GENERATED_ASSET_AUDIT_DEFAULTS.currentFineGrassBakeVersion,
    ),
    fineGrassBakeMaxEntries: positiveInteger(
      options.fineGrassBakeMaxEntries,
      GENERATED_ASSET_AUDIT_DEFAULTS.fineGrassBakeMaxEntries,
    ),
    fineGrassBakeMaxBytes: positiveInteger(
      options.fineGrassBakeMaxBytes,
      GENERATED_ASSET_AUDIT_DEFAULTS.fineGrassBakeMaxBytes,
    ),
  };
}

function positiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function safeToken(value) {
  return String(value ?? "").replace(/[^A-Za-z0-9_-]/g, "");
}

function safeFilename(value) {
  return basename(String(value ?? "").replace(/[^A-Za-z0-9_.-]/g, ""));
}

function assertInside(parent, target) {
  const rel = relative(resolve(parent), resolve(target));
  if (rel.startsWith("..") || resolve(parent) === resolve(target)) {
    throw new Error(`unsafe generated asset path: ${target}`);
  }
}

function toPosix(path) {
  return path.replace(/\\/g, "/");
}
