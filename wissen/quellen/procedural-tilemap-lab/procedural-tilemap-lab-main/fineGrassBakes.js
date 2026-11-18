import { hashSeed } from "./tileArt.js";
import {
  LAB_CHANNEL_NAMES,
  LAB_STORAGE_KEYS,
  labChannelNameCandidates,
  labStorageKeyCandidates,
} from "./labIdentity.js";

export const FINE_GRASS_BAKES_VERSION = "grassv2-finegrassbakes2";

const FINE_GRASS_BAKE_MANIFEST_PATH = "./assets/procedural/baked/fine-grass-strokes/manifest.json";
const FINE_GRASS_BAKE_ASSET_BASE = "./assets/procedural/baked/fine-grass-strokes/";
const FINE_GRASS_BAKE_API_BASE = "./api/bakes/fine-grass-strokes";
const FINE_GRASS_BAKES_CHANGED_CHANNEL = LAB_CHANNEL_NAMES.fineGrassBakesChanged;
const FINE_GRASS_BAKES_CHANGED_STORAGE_KEY = LAB_STORAGE_KEYS.fineGrassBakesChanged;

const FINE_GRASS_DEFAULTS = {
  forestStrength: 1.85,
  grasslandStrength: 1.18,
  mountainStrength: 1.18,
  contrast: 1,
  darkBias: 1,
  lightBias: 1,
  broadScale: 30,
  fineScale: 7,
  renderScale: 3,
};

export function fineGrassBakeBiomeFromTerrain(terrainOptions = {}) {
  if (terrainOptions.forestStyle === "deep") return "forest";
  if (terrainOptions.mountainStyle === "rocky") return "mountain";
  return "grassland";
}

export function fineGrassBakeBiomeFromRecipe(recipe = {}) {
  if (recipe.id === "forest") return "forest";
  if (recipe.id === "mountain") return "mountain";
  return "grassland";
}

export function fineGrassBakeDescriptor(options = {}) {
  const seed = Math.round(Number(options.seed) || 1);
  const biome = normalizeBiome(options.biome);
  const widthTiles = Math.max(1, Math.round(Number(options.widthTiles) || 54));
  const heightTiles = Math.max(1, Math.round(Number(options.heightTiles) || 34));
  const tileSize = Math.max(1, Math.round(Number(options.tileSize) || 48));
  const paramsHash = fineGrassParamsHash(options.proceduralParams, biome);
  const key = [
    FINE_GRASS_BAKES_VERSION,
    seed,
    biome,
    `${widthTiles}x${heightTiles}`,
    `tile${tileSize}`,
    paramsHash,
  ].join("-");
  return {
    version: FINE_GRASS_BAKES_VERSION,
    element: "fine-grass-strokes",
    key,
    seed,
    biome,
    widthTiles,
    heightTiles,
    tileSize,
    pixelWidth: widthTiles * tileSize,
    pixelHeight: heightTiles * tileSize,
    paramsHash,
  };
}

export function fineGrassParamsHash(proceduralParams = {}, biome = "grassland") {
  const values = normalizeFineGrassParams(proceduralParams);
  const strength = fineGrassStrengthForBiome(values, biome);
  const signature = [
    normalizeBiome(biome),
    strength.toFixed(2),
    values.contrast.toFixed(2),
    values.darkBias.toFixed(2),
    values.lightBias.toFixed(2),
    values.broadScale.toFixed(0),
    values.fineScale.toFixed(0),
    values.renderScale.toFixed(0),
  ].join(":");
  return (hashSeed("fine-grass-strokes-bake", signature) >>> 0).toString(36);
}

function fineGrassStrengthForBiome(values, biome) {
  if (biome === "forest") return values.forestStrength;
  if (biome === "mountain") return values.mountainStrength;
  return values.grasslandStrength;
}

export async function detectFineGrassBakePersistence() {
  try {
    const response = await fetch(`${FINE_GRASS_BAKE_API_BASE}/status`, { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const status = await response.json();
    if (!status.ok) throw new Error(status.error ?? "status failed");
    const serverVersion = String(status.version ?? "unknown");
    return {
      mode: "json",
      serverVersion,
      serverCurrent: serverVersion === FINE_GRASS_BAKES_VERSION,
      note: serverVersion === FINE_GRASS_BAKES_VERSION
        ? "fine-grass bake server ready"
        : "latest fine-grass bake server unavailable; restart lab server",
    };
  } catch {
    return {
      mode: "unavailable",
      serverVersion: "none",
      serverCurrent: false,
      note: "fine-grass bake API unavailable",
    };
  }
}

export async function loadFineGrassBakeAssets(options = {}) {
  const { onImageChange } = options;
  const response = await fetch(FINE_GRASS_BAKE_MANIFEST_PATH, { cache: "no-store" });
  if (response.status === 404) {
    return { manifest: fallbackManifest(), assets: [], status: "fine-grass bakes none" };
  }
  if (!response.ok) throw new Error(`fine-grass bake manifest ${response.status}`);
  const manifest = normalizeFineGrassBakeManifest(await response.json());
  const assets = manifest.entries.map((entry) => {
    const image = new Image();
    const token = encodeURIComponent(entry.updatedAt ?? entry.createdAt ?? manifest.updatedAt ?? entry.key);
    const asset = {
      ...entry,
      image,
      status: "loading",
    };
    image.addEventListener("load", () => {
      asset.status = "ready";
      onImageChange?.("fine-grass bakes ready");
    });
    image.addEventListener("error", () => {
      asset.status = "error";
      onImageChange?.(`fine-grass bake image error: ${entry.file}`);
    });
    image.src = `${FINE_GRASS_BAKE_ASSET_BASE}${entry.file}?v=${token}`;
    return asset;
  });
  return {
    manifest,
    assets,
    status: assets.length > 0 ? `${assets.length} fine-grass bakes loading` : "fine-grass bakes none",
  };
}

export function findMatchingFineGrassBake(assets = [], descriptor = null) {
  if (!descriptor) return null;
  const asset = assets.find((entry) => entry.key === descriptor.key && entry.status === "ready" && entry.image?.complete);
  if (!asset) return null;
  if (asset.pixelWidth !== descriptor.pixelWidth || asset.pixelHeight !== descriptor.pixelHeight) return null;
  return asset;
}

export async function postFineGrassBakeApi(path, payload = {}) {
  const response = await fetch(`${FINE_GRASS_BAKE_API_BASE}/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error ?? `api ${response.status}`);
  }
  return body;
}

export function notifyFineGrassBakesChanged(reason, detail = {}) {
  const message = {
    version: FINE_GRASS_BAKES_VERSION,
    reason,
    detail,
    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
  };
  try {
    localStorage.setItem(FINE_GRASS_BAKES_CHANGED_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Ignore storage failures.
  }
  try {
    new BroadcastChannel(FINE_GRASS_BAKES_CHANGED_CHANNEL).postMessage(message);
  } catch {
    // Ignore BroadcastChannel failures.
  }
}

export function subscribeFineGrassBakesChanged(callback) {
  const channels = [];
  for (const channelName of labChannelNameCandidates("fineGrassBakesChanged")) {
    try {
      const channel = new BroadcastChannel(channelName);
      channel.addEventListener("message", (event) => callback(event.data));
      channels.push(channel);
    } catch {
      // Continue with any channel names supported by the browser.
    }
  }
  const storageKeys = new Set(labStorageKeyCandidates("fineGrassBakesChanged"));
  const onStorage = (event) => {
    if (!storageKeys.has(event.key) || !event.newValue) return;
    try {
      callback(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed storage messages.
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    for (const channel of channels) channel.close();
    window.removeEventListener("storage", onStorage);
  };
}

export function normalizeFineGrassBakeManifest(manifest = {}) {
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
  const seed = Math.round(Number(entry.seed) || 1);
  const widthTiles = Math.max(1, Math.round(Number(entry.widthTiles) || 54));
  const heightTiles = Math.max(1, Math.round(Number(entry.heightTiles) || 34));
  const tileSize = Math.max(1, Math.round(Number(entry.tileSize) || 48));
  return {
    version: String(entry.version ?? FINE_GRASS_BAKES_VERSION),
    element: "fine-grass-strokes",
    key,
    seed,
    biome: normalizeBiome(entry.biome),
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
  };
}

function normalizeFineGrassParams(proceduralParams = {}) {
  const values = proceduralParams?.elements?.["fine-grass-strokes"] ?? {};
  return {
    forestStrength: finiteNumber(values.forestStrength, FINE_GRASS_DEFAULTS.forestStrength),
    grasslandStrength: finiteNumber(values.grasslandStrength, FINE_GRASS_DEFAULTS.grasslandStrength),
    mountainStrength: finiteNumber(values.mountainStrength, FINE_GRASS_DEFAULTS.mountainStrength),
    contrast: finiteNumber(values.contrast, FINE_GRASS_DEFAULTS.contrast),
    darkBias: finiteNumber(values.darkBias, FINE_GRASS_DEFAULTS.darkBias),
    lightBias: finiteNumber(values.lightBias, FINE_GRASS_DEFAULTS.lightBias),
    broadScale: Math.round(finiteNumber(values.broadScale, FINE_GRASS_DEFAULTS.broadScale)),
    fineScale: Math.round(finiteNumber(values.fineScale, FINE_GRASS_DEFAULTS.fineScale)),
    renderScale: Math.round(finiteNumber(values.renderScale, FINE_GRASS_DEFAULTS.renderScale)),
  };
}

function fallbackManifest() {
  return {
    version: 1,
    kind: "fine-grass-strokes-bakes",
    updatedAt: null,
    entries: [],
  };
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeBiome(value) {
  if (value === "forest" || value === "mountain") return value;
  return "grassland";
}

function safeToken(value) {
  return String(value ?? "").replace(/[^A-Za-z0-9_-]/g, "");
}

function safeFilename(value) {
  return String(value ?? "").replace(/[^A-Za-z0-9_.-]/g, "");
}
