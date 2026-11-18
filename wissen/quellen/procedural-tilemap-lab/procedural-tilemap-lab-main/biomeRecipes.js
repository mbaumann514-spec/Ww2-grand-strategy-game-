import {
  LAB_CHANNEL_NAMES,
  LAB_DATA_KINDS,
  LAB_STORAGE_KEYS,
  isAcceptedLabDataKind,
  labChannelNameCandidates,
  labStorageKeyCandidates,
  normalizeLabDataKind,
} from "./labIdentity.js";

export const BIOME_RECIPES_VERSION = "grassv2-biomerecipe11";
export function biomeAllowsLargeRockPlacements(biomeId) {
  return biomeId === "mountain";
}

export function biomeUsesSpriteTreePlacements(biomeId) {
  return biomeId === "grassland";
}

const BIOME_INDEX_PATH = "./assets/biomes/biomes.json";
const BIOME_BASE_PATH = "./assets/biomes/";
const BIOME_RECIPES_API_BASE = "./api/biomes";
const BIOME_RECIPES_CHANGED_CHANNEL = LAB_CHANNEL_NAMES.biomeRecipesChanged;
const BIOME_RECIPES_CHANGED_STORAGE_KEY = LAB_STORAGE_KEYS.biomeRecipesChanged;
export const DUNGEON_TOPOLOGY_IDS = new Set(["auto", "standard", "narrowCorridors", "largeHub"]);

const DEFAULT_BIOME_RECIPE = {
  version: 1,
  kind: LAB_DATA_KINDS.biomeRecipe,
  id: "grassland",
  label: "Grassland",
  proceduralProfile: "grassland-v2",
  preset: "baseline",
  atmosphere: "softHaze",
  terrain: {
    highTerraceLayout: "none",
    highTerraceHeight: 1,
    highTerraceMinDistance: 560,
    treeDensity: "sparse",
  },
  propWeights: {
    rocks: 0,
    trees: 1,
  },
  dungeon: {
    topologyId: "auto",
    materialStyleId: "cave-stone",
    roomThemeSetId: "cave-v1",
    decorPackId: "cave-v1",
    lightingProfileId: "torch-v1",
  },
  elementSets: ["grassland-core"],
  requiredElements: [],
  enabledElements: {},
  elementWeights: {},
  elementOverrides: {},
};

const SCALABLE_ELEMENT_KEYS = [
  "opacity",
  "density",
  "detailDensity",
  "grassDetail",
  "strata",
];

export async function loadBiomeRecipes() {
  const indexResponse = await fetch(BIOME_INDEX_PATH, { cache: "no-store" });
  if (!indexResponse.ok) throw new Error(`biomes.json ${indexResponse.status}`);
  const index = await indexResponse.json();
  const entries = Array.isArray(index.recipes) ? index.recipes : [];
  const recipes = [];
  for (const entry of entries) {
    const file = String(entry.file ?? "");
    if (!file) continue;
    const response = await fetch(`${BIOME_BASE_PATH}${file}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`${file} ${response.status}`);
    recipes.push(normalizeBiomeRecipe(await response.json()));
  }
  if (recipes.length === 0) recipes.push(normalizeBiomeRecipe(DEFAULT_BIOME_RECIPE));
  const defaultBiome = recipes.some((recipe) => recipe.id === index.defaultBiome)
    ? String(index.defaultBiome)
    : recipes[0].id;
  return {
    version: Number.isFinite(Number(index.version)) ? Number(index.version) : 1,
    kind: normalizeLabDataKind(index.kind, "biomeIndex"),
    defaultBiome,
    recipes,
  };
}

export function normalizeBiomeRecipe(recipe = {}) {
  const terrain = recipe.terrain ?? {};
  const propWeights = recipe.propWeights ?? {};
  const dungeon = recipe.dungeon && typeof recipe.dungeon === "object" ? recipe.dungeon : {};
  return {
    ...DEFAULT_BIOME_RECIPE,
    ...recipe,
    version: Number.isFinite(Number(recipe.version)) ? Number(recipe.version) : DEFAULT_BIOME_RECIPE.version,
    kind: normalizeLabDataKind(recipe.kind, "biomeRecipe"),
    id: String(recipe.id ?? DEFAULT_BIOME_RECIPE.id),
    label: String(recipe.label ?? recipe.id ?? DEFAULT_BIOME_RECIPE.label),
    proceduralProfile: String(recipe.proceduralProfile ?? DEFAULT_BIOME_RECIPE.proceduralProfile),
    preset: normalizePreset(recipe.preset),
    atmosphere: normalizeAtmosphere(recipe.atmosphere),
    terrain: {
      highTerraceLayout: terrain.highTerraceLayout === "broadPlateau" ? "broadPlateau" : "none",
      highTerraceHeight: clampFinite(terrain.highTerraceHeight, DEFAULT_BIOME_RECIPE.terrain.highTerraceHeight, 0.7, 1.7),
      highTerraceMinDistance: clampFinite(terrain.highTerraceMinDistance, DEFAULT_BIOME_RECIPE.terrain.highTerraceMinDistance, 260, 880),
      treeDensity: normalizeTreeDensity(terrain.treeDensity),
    },
    propWeights: {
      rocks: clampFinite(propWeights.rocks, DEFAULT_BIOME_RECIPE.propWeights.rocks, 0, 3),
      trees: clampFinite(propWeights.trees, DEFAULT_BIOME_RECIPE.propWeights.trees, 0, 3),
    },
    dungeon: {
      topologyId: normalizeDungeonTopologyId(dungeon.topologyId),
      materialStyleId: normalizeDungeonMaterialStyleId(dungeon.materialStyleId),
      roomThemeSetId: normalizeDungeonRoomThemeSetId(dungeon.roomThemeSetId),
      decorPackId: normalizeDungeonDecorPackId(dungeon.decorPackId),
      lightingProfileId: normalizeDungeonLightingProfileId(dungeon.lightingProfileId),
    },
    elementSets: normalizeStringArray(recipe.elementSets, DEFAULT_BIOME_RECIPE.elementSets),
    requiredElements: normalizeStringArray(recipe.requiredElements, DEFAULT_BIOME_RECIPE.requiredElements),
    enabledElements: normalizeElementFlags(recipe.enabledElements),
    elementWeights: normalizeElementWeights(recipe.elementWeights),
    elementOverrides: normalizeElementOverrides(recipe.elementOverrides),
  };
}

export function normalizeBiomeRecipeForSave(recipe = {}) {
  if (!isRecord(recipe)) throw new Error("recipe must be an object");
  const id = String(recipe.id ?? "").trim();
  if (!id) throw new Error("recipe id is required");
  if (recipe.kind !== undefined && !isAcceptedLabDataKind(recipe.kind, "biomeRecipe")) {
    throw new Error("recipe.kind is invalid");
  }
  if (recipe.dungeon !== undefined && !isRecord(recipe.dungeon)) {
    throw new Error("recipe.dungeon must be an object");
  }
  const topologyId = recipe.dungeon?.topologyId;
  if (topologyId !== undefined && !DUNGEON_TOPOLOGY_IDS.has(topologyId)) {
    throw new Error(`unknown dungeon topology: ${String(topologyId)}`);
  }
  return normalizeBiomeRecipe({
    ...recipe,
    id,
  });
}

export function applyBiomeRecipeToProceduralParams(params, recipe) {
  if (!params || !recipe) return params;
  const normalizedRecipe = normalizeBiomeRecipe(recipe);
  const next = JSON.parse(JSON.stringify(params));
  for (const [elementId, values] of Object.entries(next.elements ?? {})) {
    if (normalizedRecipe.enabledElements[elementId] === false) {
      disableElementValues(values);
      continue;
    }
    const weight = normalizedRecipe.elementWeights[elementId];
    if (Number.isFinite(weight) && weight !== 1) scaleElementValues(values, weight);
    const overrides = normalizedRecipe.elementOverrides[elementId];
    if (overrides) Object.assign(values, overrides);
  }
  return next;
}

export function fallbackBiomeRecipe() {
  return normalizeBiomeRecipe(DEFAULT_BIOME_RECIPE);
}

function disableElementValues(values) {
  for (const key of SCALABLE_ELEMENT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(values, key)) values[key] = 0;
  }
}

function scaleElementValues(values, weight) {
  for (const key of SCALABLE_ELEMENT_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
    values[key] = Math.max(0, Number(values[key]) * weight);
  }
}

function normalizeElementFlags(flags = {}) {
  const result = {};
  if (!flags || typeof flags !== "object") return result;
  for (const [key, value] of Object.entries(flags)) result[key] = value !== false;
  return result;
}

function normalizeElementWeights(weights = {}) {
  const result = {};
  if (!weights || typeof weights !== "object") return result;
  for (const [key, value] of Object.entries(weights)) {
    result[key] = clampFinite(value, 1, 0, 3);
  }
  return result;
}

function normalizeElementOverrides(overrides = {}) {
  const result = {};
  if (!overrides || typeof overrides !== "object") return result;
  for (const [elementId, values] of Object.entries(overrides)) {
    if (!values || typeof values !== "object") continue;
    const normalizedValues = {};
    for (const [key, value] of Object.entries(values)) {
      const number = Number(value);
      if (Number.isFinite(number)) normalizedValues[key] = number;
    }
    if (Object.keys(normalizedValues).length > 0) result[String(elementId)] = normalizedValues;
  }
  return result;
}

export async function detectBiomeRecipePersistence() {
  try {
    const response = await fetch(`${BIOME_RECIPES_API_BASE}/status`, { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const status = await response.json();
    if (!status.ok) throw new Error(status.error ?? "status failed");
    const recipeMode = status.capabilities?.recipe === true ? "json" : "unavailable";
    const serverVersion = String(status.version ?? "unknown");
    const serverCurrent = serverVersion === BIOME_RECIPES_VERSION && recipeMode === "json";
    return {
      mode: "json",
      recipeMode,
      serverVersion,
      serverCurrent,
      rollbackAvailableById: status.rollbackAvailableById ?? {},
      note: [
        serverCurrent ? "biome recipe save server ready" : "latest biome recipe server unavailable; restart lab server",
        recipeMode === "json" ? "biome recipe API present" : "biome recipe save unavailable",
      ].filter(Boolean).join(" / "),
    };
  } catch {
    return {
      mode: "unavailable",
      recipeMode: "unavailable",
      serverVersion: "none",
      serverCurrent: false,
      rollbackAvailableById: {},
      note: "biome recipe API unavailable; override Apply disabled",
    };
  }
}

export async function postBiomeRecipeApi(path, payload = {}) {
  const response = await fetch(`${BIOME_RECIPES_API_BASE}/${path}`, {
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

export function notifyBiomeRecipesChanged(reason, detail = {}) {
  const message = {
    version: BIOME_RECIPES_VERSION,
    reason,
    detail,
    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
  };
  try {
    const channel = new BroadcastChannel(BIOME_RECIPES_CHANGED_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // BroadcastChannel is optional; localStorage below covers ordinary browser tabs.
  }
  try {
    localStorage.setItem(BIOME_RECIPES_CHANGED_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Ignore storage failures.
  }
}

export function subscribeBiomeRecipesChanged(callback) {
  let lastToken = null;
  const channels = [];

  function handleMessage(message) {
    if (!message || message.token === lastToken) return;
    lastToken = message.token;
    callback(message);
  }

  for (const channelName of labChannelNameCandidates("biomeRecipesChanged")) {
    try {
      const channel = new BroadcastChannel(channelName);
      channel.addEventListener("message", (event) => handleMessage(event.data));
      channels.push(channel);
    } catch {
      // Continue with any channel names supported by the browser.
    }
  }

  const storageKeys = new Set(labStorageKeyCandidates("biomeRecipesChanged"));
  const onStorage = (event) => {
    if (!storageKeys.has(event.key) || !event.newValue) return;
    try {
      handleMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed storage events.
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    for (const channel of channels) channel.close();
    window.removeEventListener("storage", onStorage);
  };
}

function normalizeStringArray(values, fallback = []) {
  const source = Array.isArray(values) ? values : fallback;
  return [...new Set(source.map((value) => String(value ?? "")).filter(Boolean))];
}

function normalizePreset(value) {
  return ["baseline", "vegetationReduced", "rocksEmphasis", "dungeonStone", "mountainPath", "forestGrove", "trailExperiment"].includes(value)
    ? value
    : DEFAULT_BIOME_RECIPE.preset;
}

function normalizeAtmosphere(value) {
  return ["softHaze", "goldenMotes", "coolMist", "lateAfternoon", "overcast", "none"].includes(value)
    ? value
    : DEFAULT_BIOME_RECIPE.atmosphere;
}

function normalizeTreeDensity(value) {
  return ["none", "sparse", "normal"].includes(value)
    ? value
    : DEFAULT_BIOME_RECIPE.terrain.treeDensity;
}

function normalizeDungeonTopologyId(value) {
  return DUNGEON_TOPOLOGY_IDS.has(value) ? value : DEFAULT_BIOME_RECIPE.dungeon.topologyId;
}

function normalizeDungeonMaterialStyleId(value) {
  return value === "cave-stone" ? "cave-stone" : DEFAULT_BIOME_RECIPE.dungeon.materialStyleId;
}

function normalizeDungeonRoomThemeSetId(value) {
  return value === "cave-v1" ? "cave-v1" : DEFAULT_BIOME_RECIPE.dungeon.roomThemeSetId;
}

function normalizeDungeonDecorPackId(value) {
  return value === "cave-v1" ? "cave-v1" : DEFAULT_BIOME_RECIPE.dungeon.decorPackId;
}

function normalizeDungeonLightingProfileId(value) {
  return value === "torch-v1" ? "torch-v1" : DEFAULT_BIOME_RECIPE.dungeon.lightingProfileId;
}

function clampFinite(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
