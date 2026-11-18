import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { LAB_BUILD_TAG } from "./labBuild.js";
import { LAB_DATA_KINDS } from "./labIdentity.js";
import { DUNGEON_STAIR_SPRITE_ASSETS } from "./dungeonStairAssets.js";
import { biomeAllowsLargeRockPlacements, biomeUsesSpriteTreePlacements } from "./biomeRecipes.js";
import { createZipArchive } from "./zipArchive.js";

export const INTEGRATION_BUNDLE_VERSION = 2;
export const INTEGRATION_BUNDLE_MAX_REFERENCE_PNG_BYTES = 24 * 1024 * 1024;
export const INTEGRATION_BUNDLE_MAX_REQUEST_BYTES = 48 * 1024 * 1024;
export const INTEGRATION_BUNDLE_SCOPES = Object.freeze(["currentBiome", "allBiomes"]);

const BUNDLE_ROOT = "procedural-tilemap-lab-integration";
const LICENSE_FILES = Object.freeze([
  { path: "LICENSE", role: "source-license" },
  { path: "ASSET-LICENSE.md", role: "asset-license" },
]);
const SOURCE_FILES = Object.freeze([
  "biomeRecipes.js",
  "byteLruCache.js",
  "dungeonTopology.js",
  "dungeonStairAssets.js",
  "dungeonWallGeometry.js",
  "elementCatalog.js",
  "fineGrassBakes.js",
  "labIdentity.js",
  "mapDungeonLayout.js",
  "mapPlacement.js",
  "mapRenderer.js",
  "mapRenderLayers.js",
  "mapSize.js",
  "noiseHash.js",
  "proceduralParams.js",
  "propAssets.js",
  "spriteNormalization.js",
  "tileArt.js",
  "tileShading.js",
]);
const DUNGEON_TOPOLOGY_IDS = new Set([
  "auto",
  "standard",
  "narrowCorridors",
  "largeHub",
]);
const MAP_SIZE_MODES = new Set(["random", "preset", "custom"]);
const MAP_SIZE_PRESETS = new Set(["compact", "standard", "large"]);
const MAP_ORIENTATIONS = new Set(["auto", "landscape", "portrait"]);
const RESOLVED_MAP_ORIENTATIONS = new Set(["landscape", "portrait"]);
const TREE_DENSITIES = new Set(["none", "sparse", "normal"]);
const HIGH_TERRACE_LAYOUTS = new Set(["none", "broadPlateau"]);
const ROAD_STYLES = new Set(["none", "road"]);
const MOUNTAIN_STYLES = new Set(["none", "rocky"]);
const FOREST_STYLES = new Set(["none", "deep"]);
const DUNGEON_STYLES = new Set(["none", "stoneDungeon"]);
const DUNGEON_SIZE_PROFILE_IDS = new Set(["auto", "fixed54x34", "narrowVariableV01", "largeHubVariableV01"]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export class IntegrationBundleError extends Error {
  constructor(message, { statusCode = 400, code = "invalid_bundle_request" } = {}) {
    super(message);
    this.name = "IntegrationBundleError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function buildIntegrationBundle({ rootDir, request, now = new Date() }) {
  if (typeof rootDir !== "string" || !rootDir.trim()) {
    throw new IntegrationBundleError("bundle source root is unavailable", { statusCode: 500 });
  }
  const sourceRoot = resolve(rootDir);
  const normalizedRequest = validateRequest(request);
  const biomeIndex = await readRequiredJson(sourceRoot, "assets/biomes/biomes.json");
  const recipeEntries = validateBiomeIndex(biomeIndex);
  const selectedEntry = recipeEntries.find((entry) => entry.id === normalizedRequest.biomeId);
  if (!selectedEntry) throw new IntegrationBundleError(`unknown biome: ${normalizedRequest.biomeId}`);

  const scopedRecipeEntries = normalizedRequest.scope === "allBiomes" ? recipeEntries : [selectedEntry];
  const recipes = [];
  for (const entry of scopedRecipeEntries) {
    const recipe = await readRequiredJson(sourceRoot, `assets/biomes/${entry.file}`);
    if (recipe?.id !== entry.id) {
      throw dependencyError(`biome recipe id mismatch: ${entry.file}`);
    }
    recipes.push({ entry, recipe });
  }

  const configuration = normalizeConfiguration(normalizedRequest.configuration, {
    biomeId: normalizedRequest.biomeId,
    includePresentationEffects: normalizedRequest.includePresentationEffects,
  });
  const snapshot = normalizeSnapshot(normalizedRequest.snapshot, configuration);
  const referencePng = normalizedRequest.includeReferencePng
    ? decodeReferencePng(normalizedRequest.referencePngBase64)
    : null;

  const payload = [];
  const add = (path, role, data) => payload.push({ path, role, data: toBuffer(data) });
  for (const file of LICENSE_FILES) {
    add(file.path, file.role, await readRequiredFile(sourceRoot, file.path));
  }
  add("config/map-config.json", "map-configuration", prettyJson(configuration));
  add("examples/current-map.snapshot.json", "map-snapshot", prettyJson(snapshot));
  if (referencePng) add("examples/current-map-reference.png", "visual-reference", referencePng);

  for (const file of SOURCE_FILES) {
    add(`source/${file}`, "source", await readRequiredFile(sourceRoot, file));
  }

  const scopedIndex = {
    ...biomeIndex,
    defaultBiome: normalizedRequest.scope === "currentBiome" ? normalizedRequest.biomeId : biomeIndex.defaultBiome,
    recipes: scopedRecipeEntries.map((entry) => ({ ...entry })),
  };
  add("data/biomes/biomes.json", "biome-index", prettyJson(scopedIndex));
  for (const { entry } of recipes) {
    add(`data/biomes/${entry.file}`, "biome-recipe", await readRequiredFile(sourceRoot, `assets/biomes/${entry.file}`));
  }
  add(
    "data/procedural/grassland-v2.params.json",
    "procedural-parameters",
    await readRequiredFile(sourceRoot, "assets/procedural/grassland-v2.params.json"),
  );
  if (normalizedRequest.scope === "allBiomes" || normalizedRequest.biomeId === "dungeon") {
    add(
      "data/procedural/dungeon-v1.profile.json",
      "dungeon-profile",
      await readRequiredFile(sourceRoot, "assets/procedural/dungeon-v1.profile.json"),
    );
    for (const asset of Object.values(DUNGEON_STAIR_SPRITE_ASSETS)) {
      add(asset.path, "dungeon-stair-sprite", await readRequiredFile(sourceRoot, asset.path));
    }
  }
  add(
    "data/elements/catalog.json",
    "element-catalog",
    await readRequiredFile(sourceRoot, "assets/elements/catalog.json"),
  );

  for (const category of requiredPropCategories(recipes.map(({ recipe }) => recipe))) {
    const manifestPath = `assets/props/auto-place/${category}/props.json`;
    const manifest = await readRequiredJson(sourceRoot, manifestPath);
    validatePropManifest(manifest, category);
    add(`assets/props/auto-place/${category}/props.json`, "prop-manifest", prettyJson(manifest));
    for (const asset of manifest.assets) {
      add(
        `assets/props/auto-place/${category}/${asset.file}`,
        "sprite-asset",
        await readRequiredFile(sourceRoot, `assets/props/auto-place/${category}/${asset.file}`),
      );
    }
  }

  payload.sort((left, right) => left.path.localeCompare(right.path, "en"));
  ensureUniquePayloadPaths(payload);
  const generatedAt = validDate(now).toISOString();
  const manifest = {
    version: INTEGRATION_BUNDLE_VERSION,
    kind: LAB_DATA_KINDS.integrationBundle,
    scope: normalizedRequest.scope,
    biomeId: normalizedRequest.biomeId,
    generatedAt,
    labBuildTag: LAB_BUILD_TAG,
    configurationFile: "config/map-config.json",
    snapshotFile: "examples/current-map.snapshot.json",
    referencePngFile: referencePng ? "examples/current-map-reference.png" : null,
    hashAlgorithm: "sha256",
    unhashedFiles: ["bundle-manifest.json"],
    files: payload.map((entry) => ({
      path: entry.path,
      role: entry.role,
      bytes: entry.data.length,
      sha256: sha256(entry.data),
    })),
  };
  const archiveEntries = [
    ...payload.map((entry) => ({ path: `${BUNDLE_ROOT}/${entry.path}`, data: entry.data })),
    { path: `${BUNDLE_ROOT}/bundle-manifest.json`, data: prettyJson(manifest) },
  ];
  const filename = integrationBundleFilename(normalizedRequest, validDate(now));
  return {
    buffer: createZipArchive(archiveEntries, { modifiedAt: validDate(now) }),
    filename,
    manifest,
  };
}

function validateRequest(request) {
  if (!isRecord(request)) throw new IntegrationBundleError("request body must be an object");
  if (request.version !== INTEGRATION_BUNDLE_VERSION) {
    throw new IntegrationBundleError(`unsupported bundle request version: ${String(request.version)}`);
  }
  const scope = String(request.scope ?? "");
  if (!INTEGRATION_BUNDLE_SCOPES.includes(scope)) throw new IntegrationBundleError(`invalid bundle scope: ${scope}`);
  const biomeId = safeToken(request.biomeId, "biomeId");
  const includePresentationEffects = request.includePresentationEffects === true;
  const includeReferencePng = request.includeReferencePng !== false;
  return {
    version: INTEGRATION_BUNDLE_VERSION,
    scope,
    biomeId,
    configuration: request.configuration,
    snapshot: request.snapshot,
    referencePngBase64: request.referencePngBase64,
    includePresentationEffects,
    includeReferencePng,
  };
}

function normalizeConfiguration(value, { biomeId, includePresentationEffects }) {
  if (!isRecord(value)) throw new IntegrationBundleError("configuration must be an object");
  const seed = integerInRange(value.seed, 1, 999999, "configuration.seed");
  const fieldSeed = integerInRange(value.fieldSeed, 0, 0xffffffff, "configuration.fieldSeed");
  const mapSize = isRecord(value.mapSize) ? value.mapSize : {};
  const resolved = isRecord(value.resolvedDimensions) ? value.resolvedDimensions : {};
  const terrain = isRecord(value.terrain) ? value.terrain : {};
  const width = integerInRange(resolved.width, 1, 256, "configuration.resolvedDimensions.width");
  const height = integerInRange(resolved.height, 1, 256, "configuration.resolvedDimensions.height");
  const requestedOrientation = enumValue(mapSize.requestedOrientation, MAP_ORIENTATIONS, "map orientation");
  const orientation = enumValue(resolved.orientation, RESOLVED_MAP_ORIENTATIONS, "resolved map orientation");
  const topologyId = enumValue(value.topologyId ?? "auto", DUNGEON_TOPOLOGY_IDS, "dungeon topology");
  return {
    version: INTEGRATION_BUNDLE_VERSION,
    biomeId,
    seed,
    fieldSeed,
    mapSize: {
      mode: enumValue(mapSize.mode, MAP_SIZE_MODES, "map size mode"),
      presetId: enumValue(mapSize.presetId, MAP_SIZE_PRESETS, "map size preset"),
      requestedOrientation,
      customWidth: integerInRange(mapSize.customWidth, 1, 256, "map custom width"),
      customHeight: integerInRange(mapSize.customHeight, 1, 256, "map custom height"),
    },
    resolvedDimensions: { width, height, orientation },
    topologyId,
    preset: safeToken(value.preset, "configuration.preset"),
    appearance: {
      includePresentationEffects,
      atmosphere: safeToken(value.atmosphere ?? "none", "configuration.atmosphere"),
      vignette: includePresentationEffects && value.vignette === true,
      treeDensity: enumValue(value.treeDensity ?? "none", TREE_DENSITIES, "tree density"),
    },
    terrain: normalizeTerrainConfiguration(terrain),
  };
}

function normalizeTerrainConfiguration(value) {
  return {
    highTerraceAmount: numberInRange(value.highTerraceAmount, 0, 1.8, "high terrace amount"),
    highTerraceHeight: numberInRange(value.highTerraceHeight, 0.7, 1.7, "high terrace height"),
    highTerraceMinDistance: numberInRange(value.highTerraceMinDistance, 0, 2000, "high terrace distance"),
    highTerraceLayout: enumValue(value.highTerraceLayout, HIGH_TERRACE_LAYOUTS, "high terrace layout"),
    roadStyle: enumValue(value.roadStyle, ROAD_STYLES, "road style"),
    mountainStyle: enumValue(value.mountainStyle, MOUNTAIN_STYLES, "mountain style"),
    forestStyle: enumValue(value.forestStyle, FOREST_STYLES, "forest style"),
    dungeonStyle: enumValue(value.dungeonStyle, DUNGEON_STYLES, "dungeon style"),
    dungeonSizeProfileId: enumValue(value.dungeonSizeProfileId, DUNGEON_SIZE_PROFILE_IDS, "dungeon size profile"),
    largeRockScale: numberInRange(value.largeRockScale, 0, 2, "large rock scale"),
  };
}

function normalizeSnapshot(value, configuration) {
  if (!isRecord(value)) throw new IntegrationBundleError("snapshot must be an object");
  if (value.version !== 1 || value.kind !== LAB_DATA_KINDS.integrationMapSnapshot) {
    throw new IntegrationBundleError("snapshot has an unsupported version or kind");
  }
  const width = integerInRange(value.width, 1, 256, "snapshot.width");
  const height = integerInRange(value.height, 1, 256, "snapshot.height");
  if (width !== configuration.resolvedDimensions.width || height !== configuration.resolvedDimensions.height) {
    throw new IntegrationBundleError("snapshot dimensions do not match configuration");
  }
  if (value.seed !== configuration.fieldSeed) throw new IntegrationBundleError("snapshot seed does not match configuration.fieldSeed");
  if (!Array.isArray(value.tiles) || value.tiles.length !== width * height) {
    throw new IntegrationBundleError("snapshot tile count does not match its dimensions");
  }
  for (const tile of value.tiles) {
    if (!isRecord(tile)
      || typeof tile.tile !== "string"
      || tile.tile.length > 64
      || typeof tile.blocksMovement !== "boolean"
      || typeof tile.explored !== "boolean") {
      throw new IntegrationBundleError("snapshot contains an invalid tile");
    }
  }
  if (!Array.isArray(value.enemyPlacements) || value.enemyPlacements.length > 256) {
    throw new IntegrationBundleError("snapshot enemy placements are invalid");
  }
  const occupied = new Set();
  for (const enemy of value.enemyPlacements) {
    if (!isRecord(enemy)
      || typeof enemy.id !== "string"
      || typeof enemy.key !== "string"
      || !Number.isInteger(enemy.worldX)
      || !Number.isInteger(enemy.worldY)
      || enemy.worldX < 0
      || enemy.worldY < 0
      || enemy.worldX >= width
      || enemy.worldY >= height
      || value.tiles[enemy.worldY * width + enemy.worldX].blocksMovement) {
      throw new IntegrationBundleError("snapshot contains an invalid enemy placement");
    }
    const point = `${enemy.worldX},${enemy.worldY}`;
    if (occupied.has(point)) throw new IntegrationBundleError("snapshot contains duplicate enemy placements");
    occupied.add(point);
  }
  const isDungeonSnapshot = value.terrain === "dungeon" && isRecord(value.dungeon);
  if (configuration.biomeId === "dungeon" ? !isDungeonSnapshot : value.terrain !== "plain" || value.dungeon !== undefined) {
    throw new IntegrationBundleError("snapshot terrain does not match configuration.biomeId");
  }
  rejectAbsolutePathStrings(value, "snapshot");
  return JSON.parse(JSON.stringify(value));
}

function decodeReferencePng(value) {
  if (typeof value !== "string" || !value) throw new IntegrationBundleError("reference PNG is required");
  const encoded = value.startsWith("data:image/png;base64,") ? value.slice("data:image/png;base64,".length) : value;
  if (encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new IntegrationBundleError("reference PNG base64 is invalid");
  }
  const data = Buffer.from(encoded, "base64");
  if (data.length < 24 || data.length > INTEGRATION_BUNDLE_MAX_REFERENCE_PNG_BYTES) {
    throw new IntegrationBundleError("reference PNG size is invalid");
  }
  if (!data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new IntegrationBundleError("reference PNG signature is invalid");
  }
  return data;
}

function validateBiomeIndex(index) {
  if (!isRecord(index) || !Array.isArray(index.recipes) || index.recipes.length === 0) {
    throw dependencyError("biome index is invalid");
  }
  const seen = new Set();
  return index.recipes.map((entry) => {
    if (!isRecord(entry)) throw dependencyError("biome index entry is invalid");
    const id = safeToken(entry.id, "biome recipe id", dependencyError);
    const file = String(entry.file ?? "");
    if (basename(file) !== file || !/^[A-Za-z0-9_-]+\.recipe\.json$/.test(file)) {
      throw dependencyError(`unsafe biome recipe file: ${file}`);
    }
    if (seen.has(id)) throw dependencyError(`duplicate biome recipe id: ${id}`);
    seen.add(id);
    return { id, file };
  });
}

function requiredPropCategories(recipes) {
  const categories = new Set();
  for (const recipe of recipes) {
    const required = Array.isArray(recipe.requiredElements) ? recipe.requiredElements : [];
    if (biomeAllowsLargeRockPlacements(recipe.id)
      && ((recipe.propWeights?.rocks ?? 0) > 0 || required.includes("rocks"))) categories.add("rocks");
    if (biomeUsesSpriteTreePlacements(recipe.id)
      && ((recipe.propWeights?.trees ?? 0) > 0 || required.includes("trees"))) categories.add("trees");
  }
  return [...categories].sort();
}

function validatePropManifest(manifest, category) {
  if (!isRecord(manifest) || !Array.isArray(manifest.assets)) {
    throw dependencyError(`invalid ${category} prop manifest`);
  }
  const seen = new Set();
  for (const asset of manifest.assets) {
    if (!isRecord(asset) || typeof asset.id !== "string") throw dependencyError(`invalid ${category} prop asset`);
    const file = String(asset.file ?? "");
    if (basename(file) !== file || !/^[A-Za-z0-9_-]+\.(?:png|jpg|jpeg|webp)$/i.test(file)) {
      throw dependencyError(`unsafe ${category} prop asset file: ${file}`);
    }
    if (seen.has(file)) throw dependencyError(`duplicate ${category} prop asset file: ${file}`);
    seen.add(file);
  }
}

async function readRequiredJson(rootDir, path) {
  const data = await readRequiredFile(rootDir, path);
  try {
    return JSON.parse(data.toString("utf8"));
  } catch {
    throw dependencyError(`required JSON is invalid: ${path}`);
  }
}

async function readRequiredFile(rootDir, path) {
  const target = safeSourcePath(rootDir, path);
  try {
    return await readFile(target);
  } catch (error) {
    if (error?.code === "ENOENT") throw dependencyError(`required bundle dependency is missing: ${path}`);
    throw error;
  }
}

function safeSourcePath(rootDir, path) {
  if (typeof path !== "string" || !path || isAbsolute(path) || path.includes("\\")) {
    throw dependencyError(`unsafe bundle dependency path: ${String(path)}`);
  }
  const target = resolve(rootDir, ...path.split("/"));
  const relativePath = relative(rootDir, target);
  if (!relativePath || relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw dependencyError(`bundle dependency escapes source root: ${path}`);
  }
  return target;
}

function dependencyError(message) {
  return new IntegrationBundleError(message, { statusCode: 409, code: "bundle_dependency_error" });
}

function integrationBundleFilename(request, date) {
  const stamp = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const scope = request.scope === "allBiomes" ? "all-biomes" : `current-${request.biomeId}`;
  return `procedural-tilemap-lab-integration_${scope}_${stamp}.zip`;
}

function rejectAbsolutePathStrings(value, label, seen = new Set()) {
  if (typeof value === "string") {
    if (/^(?:[A-Za-z]:[\\/]|[\\/]{1,2})/.test(value)) {
      throw new IntegrationBundleError(`${label} contains an absolute path`);
    }
    return;
  }
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) rejectAbsolutePathStrings(child, label, seen);
}

function ensureUniquePayloadPaths(entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.path)) throw new Error(`duplicate bundle payload path: ${entry.path}`);
    seen.add(entry.path);
  }
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
}

function validDate(value) {
  return value instanceof Date && Number.isFinite(value.getTime()) ? value : new Date();
}

function integerInRange(value, min, max, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new IntegrationBundleError(`${label} must be an integer from ${min} to ${max}`);
  }
  return number;
}

function numberInRange(value, min, max, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new IntegrationBundleError(`${label} must be a number from ${min} to ${max}`);
  }
  return number;
}

function safeToken(value, label, errorFactory = (message) => new IntegrationBundleError(message)) {
  const token = String(value ?? "");
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(token)) throw errorFactory(`${label} is invalid`);
  return token;
}

function enumValue(value, allowed, label) {
  const normalized = String(value ?? "");
  if (!allowed.has(normalized)) throw new IntegrationBundleError(`${label} is invalid`);
  return normalized;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
