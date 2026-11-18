export const LAB_NAME = "Procedural Tilemap Lab";
export const LAB_SLUG = "procedural-tilemap-lab";
export const LAB_SHUTDOWN_TOKEN = LAB_SLUG;

export const LAB_DATA_KINDS = Object.freeze({
  biomeIndex: `${LAB_SLUG}/biome-index`,
  biomeRecipe: `${LAB_SLUG}/biome-recipe`,
  dungeonLayout: `${LAB_SLUG}/dungeon-layout`,
  elementCatalog: `${LAB_SLUG}/element-catalog`,
  integrationBundle: `${LAB_SLUG}/ai-integration-bundle`,
  integrationMapSnapshot: `${LAB_SLUG}/integration-map-snapshot`,
  localAreaShape: `${LAB_SLUG}/local-area-shape`,
  proceduralProfile: `${LAB_SLUG}/procedural-profile`,
});

const LEGACY_LAB_DATA_KINDS = Object.freeze({
  biomeIndex: Object.freeze(["sri-field-biome-index"]),
  biomeRecipe: Object.freeze(["sri-field-biome-recipe"]),
  dungeonLayout: Object.freeze(["sri-dungeon-layout"]),
  elementCatalog: Object.freeze(["sri-field-element-catalog"]),
  localAreaShape: Object.freeze(["sri-local-area-shape"]),
  proceduralProfile: Object.freeze(["sri-procedural-profile"]),
});

export const LAB_STORAGE_KEYS = Object.freeze({
  biomeRecipesChanged: `${LAB_SLUG}:biome-recipes:changed:v1`,
  fineGrassBakesChanged: `${LAB_SLUG}:fine-grass-bakes:changed:v1`,
  proceduralParamsChanged: `${LAB_SLUG}:procedural-params:changed:v1`,
  proceduralParamsOverride: `${LAB_SLUG}:procedural-params:override:v1`,
  propAssetsChanged: `${LAB_SLUG}:prop-assets:changed:v1`,
  propShadowOverrides: `${LAB_SLUG}:prop-shadow-overrides:v1`,
});

const LEGACY_LAB_STORAGE_KEYS = Object.freeze({
  biomeRecipesChanged: Object.freeze(["sri-biome-recipes-changed-v1"]),
  fineGrassBakesChanged: Object.freeze(["sri-fine-grass-bakes-changed-v1"]),
  proceduralParamsChanged: Object.freeze(["sri-procedural-params-changed-v1"]),
  proceduralParamsOverride: Object.freeze(["sri-grassland-v2-procedural-params-v1"]),
  propAssetsChanged: Object.freeze(["sri-prop-assets-changed-v1"]),
  propShadowOverrides: Object.freeze(["sri-prop-shadow-overrides-v1"]),
});

export const LAB_CHANNEL_NAMES = Object.freeze({
  biomeRecipesChanged: `${LAB_SLUG}:biome-recipes:changed`,
  fineGrassBakesChanged: `${LAB_SLUG}:fine-grass-bakes:changed`,
  proceduralParamsChanged: `${LAB_SLUG}:procedural-params:changed`,
  propAssetsChanged: `${LAB_SLUG}:prop-assets:changed`,
});

const LEGACY_LAB_CHANNEL_NAMES = Object.freeze({
  biomeRecipesChanged: Object.freeze(["sri-biome-recipes-changed"]),
  fineGrassBakesChanged: Object.freeze(["sri-fine-grass-bakes-changed"]),
  proceduralParamsChanged: Object.freeze(["sri-procedural-params-changed"]),
  propAssetsChanged: Object.freeze(["sri-prop-assets-changed"]),
});

export const LEGACY_MAP_SEED_SALT = "sri-field";

const LEGACY_LAB_SHUTDOWN_TOKENS = Object.freeze(["procedural-tile-atlas-lab"]);

export function normalizeLabDataKind(value, key) {
  const canonical = requiredIdentityValue(LAB_DATA_KINDS, key, "data kind");
  if (value === undefined || value === null || value === "") return canonical;
  if (!isAcceptedLabDataKind(value, key)) {
    throw new Error(`invalid lab data kind for ${String(key)}: ${String(value)}`);
  }
  return canonical;
}

export function isAcceptedLabDataKind(value, key) {
  const canonical = requiredIdentityValue(LAB_DATA_KINDS, key, "data kind");
  return value === canonical || legacyIdentityValues(LEGACY_LAB_DATA_KINDS, key).includes(value);
}

export function labStorageKeyCandidates(key) {
  return [
    requiredIdentityValue(LAB_STORAGE_KEYS, key, "storage key"),
    ...legacyIdentityValues(LEGACY_LAB_STORAGE_KEYS, key),
  ];
}

export function labChannelNameCandidates(key) {
  return [
    requiredIdentityValue(LAB_CHANNEL_NAMES, key, "channel name"),
    ...legacyIdentityValues(LEGACY_LAB_CHANNEL_NAMES, key),
  ];
}

export function readMigratedLabStorageItem(storage, key) {
  const [currentKey, ...legacyKeys] = labStorageKeyCandidates(key);
  const currentValue = storage.getItem(currentKey);
  if (currentValue !== null) return currentValue;
  for (const legacyKey of legacyKeys) {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue === null) continue;
    try {
      storage.setItem(currentKey, legacyValue);
      storage.removeItem(legacyKey);
    } catch {
      // Reading the legacy value remains useful when storage migration is blocked.
    }
    return legacyValue;
  }
  return null;
}

export function removeLabStorageItems(storage, key) {
  for (const storageKey of labStorageKeyCandidates(key)) {
    storage.removeItem(storageKey);
  }
}

export function isAcceptedLabShutdownToken(value) {
  return value === LAB_SHUTDOWN_TOKEN || LEGACY_LAB_SHUTDOWN_TOKENS.includes(value);
}

function requiredIdentityValue(record, key, label) {
  const value = record[key];
  if (!value) throw new Error(`unknown lab ${label}: ${String(key)}`);
  return value;
}

function legacyIdentityValues(record, key) {
  return record[key] ?? [];
}
