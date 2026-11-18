import {
  normalizeSpriteAnchor as normalizeClientAnchor,
  normalizeSpriteCollisionBounds as normalizeClientCollisionBounds,
  normalizeSpriteCollisionTiles as normalizeClientCollisionTiles,
  normalizeSpriteFootprint as normalizeClientFootprint,
  normalizeSpriteScale as normalizeClientScale,
  normalizeSpriteShadow as normalizeClientShadow,
} from "./spriteNormalization.js";
import {
  LAB_CHANNEL_NAMES,
  LAB_STORAGE_KEYS,
  labChannelNameCandidates,
  labStorageKeyCandidates,
  readMigratedLabStorageItem,
} from "./labIdentity.js";

export {
  normalizeClientAnchor,
  normalizeClientCollisionBounds,
  normalizeClientCollisionTiles,
  normalizeClientFootprint,
  normalizeClientScale,
  normalizeClientShadow,
};

export const PROP_ASSET_VERSION = "grassv2-propregistry3";
export const PROP_ASSET_BATCH_VERSION = 1;

export const PROP_STORE_DEFINITIONS = {
  rocks: {
    id: "rocks",
    placement: "auto-place",
    label: "sprite rocks",
    statusLabel: "rock props",
    propValue: "spriteLargeRock",
    manifestPath: "./assets/props/auto-place/rocks/props.json",
    basePath: "./assets/props/auto-place/rocks/",
    apiBase: "./api/props/auto-place/rocks",
    fallbackFootprint: { w: 2, h: 2 },
  },
  trees: {
    id: "trees",
    placement: "auto-place",
    label: "sprite trees",
    statusLabel: "tree props",
    propValue: "spriteTrees",
    manifestPath: "./assets/props/auto-place/trees/props.json",
    basePath: "./assets/props/auto-place/trees/",
    apiBase: "./api/props/auto-place/trees",
    fallbackFootprint: { w: 2, h: 2 },
  },
};
const PROP_ASSETS_CHANGED_CHANNEL = LAB_CHANNEL_NAMES.propAssetsChanged;
const PROP_ASSETS_CHANGED_STORAGE_KEY = LAB_STORAGE_KEYS.propAssetsChanged;
export async function detectPropsPersistence(category = "rocks") {
  try {
    const response = await fetch(`${propsApiBase(category)}/status`, { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const status = await response.json();
    if (!status.ok) throw new Error(status.error ?? "status failed");
    const collisionMode = status.capabilities?.collision === true ? "json" : "unavailable";
    const footprintMode = status.capabilities?.footprint === true ? "json" : "unavailable";
    const transformMode = status.capabilities?.transform === true ? "json" : "unavailable";
    const batchMode = status.capabilities?.batch === true ? "json" : "unavailable";
    const serverVersion = String(status.version ?? "unknown");
    const serverCurrent = serverVersion === PROP_ASSET_VERSION
      && collisionMode === "json"
      && footprintMode === "json"
      && transformMode === "json"
      && batchMode === "json";
    const note = [
      serverCurrent ? "JSON save server ready" : "latest save server unavailable; restart lab server",
      collisionMode === "json" ? "collision API present" : "collision save unavailable",
      footprintMode === "json" ? "footprint API present" : "footprint save unavailable",
      transformMode === "json" ? "transform API present" : "transform save unavailable",
      batchMode === "json" ? "atomic batch API present" : "batch save unavailable",
      status.rollbackAvailable ? "rollback available" : "",
    ].filter(Boolean).join(" / ");
    return {
      mode: "json",
      collisionMode,
      footprintMode,
      transformMode,
      batchMode,
      serverVersion,
      serverCurrent,
      rollbackAvailable: Boolean(status.rollbackAvailable),
      note,
    };
  } catch {
    return {
      mode: "browser",
      collisionMode: "unavailable",
      footprintMode: "unavailable",
      transformMode: "unavailable",
      batchMode: "unavailable",
      serverVersion: "none",
      serverCurrent: false,
      rollbackAvailable: false,
      note: "server API unavailable; Apply disabled",
    };
  }
}

export async function loadLargeRockSpriteAssets(options = {}) {
  return loadSpritePropAssets("rocks", options);
}

export async function loadTreeSpriteAssets(options = {}) {
  return loadSpritePropAssets("trees", options);
}

export async function loadSpritePropAssets(category = "rocks", options = {}) {
  const store = propStoreDefinition(category);
  const {
    previousSelectedId = null,
    useBrowserOverrides = false,
    useBrowserShadowOverrides = useBrowserOverrides,
    syncManifest = true,
    onImageChange = () => {},
  } = options;
  if (syncManifest) await syncSpritePropManifest(category);
  const loaded = await fetchPropManifest(store);
  const { manifest, basePath } = loaded;
  const shadowOverrides = useBrowserShadowOverrides ? readShadowOverrides() : {};
  const assets = (manifest.assets ?? []).map((entry) => {
    const shadow = normalizeClientShadow({
      ...entry.shadow,
      ...shadowOverrides[entry.id],
    });
    const baseAnchor = normalizeClientAnchor(entry.anchor);
    const baseScale = normalizeClientScale(entry.scale);
    const baseFootprint = normalizeClientFootprint(entry.footprint, store.fallbackFootprint);
    const baseCollisionBounds = normalizeClientCollisionBounds(entry.collisionBounds, baseFootprint, entry.collisionTiles, entry.collision);
    const baseCollisionTiles = normalizeClientCollisionTiles(entry.collisionTiles, baseFootprint, entry.collision, baseCollisionBounds);
    const baseCollision = String(entry.collision ?? "footprint");
    const asset = {
      ...entry,
      baseFootprint: { ...baseFootprint },
      appliedFootprint: { ...baseFootprint },
      footprint: { ...baseFootprint },
      baseAnchor: { ...baseAnchor },
      appliedAnchor: { ...baseAnchor },
      anchor: { ...baseAnchor },
      baseScale,
      appliedScale: baseScale,
      scale: baseScale,
      baseShadow: normalizeClientShadow(entry.shadow),
      appliedShadow: { ...shadow },
      shadow: { ...shadow },
      baseCollision,
      appliedCollision: baseCollision,
      collision: baseCollision,
      baseCollisionTiles: cloneTiles(baseCollisionTiles),
      baseCollisionBounds: { ...baseCollisionBounds },
      appliedCollisionTiles: cloneTiles(baseCollisionTiles),
      appliedCollisionBounds: { ...baseCollisionBounds },
      collisionTiles: cloneTiles(baseCollisionTiles),
      collisionBounds: { ...baseCollisionBounds },
      image: null,
      status: "loading",
    };
    asset.image = loadPropImage(`${basePath}${entry.file}`, asset, assetsStatusChange);
    return asset;
  });
  const selectedId = assets.some((asset) => asset.id === previousSelectedId)
    ? previousSelectedId
    : assets[0]?.id ?? null;
  return {
    assets,
    selectedId,
    status: `${assets.length} ${store.statusLabel} loading`,
  };

  function assetsStatusChange() {
    onImageChange(spriteAssetStatus(assets, store.statusLabel), assets);
  }
}

export function spriteAssetStatus(assets, label = "sprite props") {
  return `${assets.filter((asset) => asset.status === "ready").length}/${assets.length} ${label} ready`;
}

export async function postPropsApi(path, payload = {}, category = "rocks") {
  const response = await fetch(`${propsApiBase(category)}/${path}`, {
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

export async function postPropsBatchApi(assets, category = "rocks") {
  return postPropsApi("batch", {
    version: PROP_ASSET_BATCH_VERSION,
    assets,
  }, category);
}

export async function syncSpritePropManifest(category = "rocks") {
  try {
    await fetch(`${propsApiBase(category)}/sync`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{}",
    });
  } catch {
    // Direct static hosting cannot inspect folders; props.json remains the fallback contract.
  }
}

async function fetchPropManifest(store) {
  const response = await fetch(store.manifestPath, { cache: "no-store" });
  if (response.ok) {
    return {
      manifest: await response.json(),
      basePath: store.basePath,
    };
  }
  throw new Error(`props.json ${response.status}`);
}

export function notifyPropAssetsChanged(reason, detail = {}) {
  const message = {
    version: PROP_ASSET_VERSION,
    reason,
    detail,
    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
  };
  try {
    const channel = new BroadcastChannel(PROP_ASSETS_CHANGED_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // BroadcastChannel is optional; localStorage below covers ordinary browser tabs.
  }
  try {
    localStorage.setItem(PROP_ASSETS_CHANGED_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // If storage is unavailable, same-tab preview still remains valid.
  }
}

export function subscribePropAssetsChanged(callback) {
  let lastToken = null;
  const channels = [];

  function handleMessage(message) {
    if (!message || message.token === lastToken) return;
    lastToken = message.token;
    callback(message);
  }

  for (const channelName of labChannelNameCandidates("propAssetsChanged")) {
    try {
      const channel = new BroadcastChannel(channelName);
      channel.addEventListener("message", (event) => {
        handleMessage(event.data);
      });
      channels.push(channel);
    } catch {
      // Continue with any channel names supported by the browser.
    }
  }

  const storageKeys = new Set(labStorageKeyCandidates("propAssetsChanged"));
  function handleStorage(event) {
    if (!storageKeys.has(event.key) || !event.newValue) return;
    try {
      handleMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed cross-tab notifications.
    }
  }
  globalThis.addEventListener("storage", handleStorage);

  return () => {
    for (const channel of channels) channel.close();
    globalThis.removeEventListener("storage", handleStorage);
  };
}

function loadPropImage(src, asset, onChange) {
  const image = new Image();
  image.src = src;
  image.addEventListener("load", () => {
    asset.status = "ready";
    onChange();
  });
  image.addEventListener("error", () => {
    asset.status = "error";
    onChange();
  });
  return image;
}

function readShadowOverrides() {
  try {
    return JSON.parse(readMigratedLabStorageItem(localStorage, "propShadowOverrides") ?? "{}");
  } catch {
    return {};
  }
}

function cloneTiles(tiles) {
  return tiles.map((tile) => ({ x: tile.x, y: tile.y }));
}

function propsApiBase(category) {
  return propStoreDefinition(category).apiBase;
}

export function propStoreDefinition(category = "rocks") {
  return PROP_STORE_DEFINITIONS[category] ?? PROP_STORE_DEFINITIONS.rocks;
}

export function propStoreCategories() {
  return Object.keys(PROP_STORE_DEFINITIONS);
}
