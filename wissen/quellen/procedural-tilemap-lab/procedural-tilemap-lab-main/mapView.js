import { hashSeed } from "./tileArt.js";
import { LAB_BUILD_TAG, labVersionedUrl } from "./labBuild.js";
import { LEGACY_MAP_SEED_SALT } from "./labIdentity.js";
import {
  canvasVisualSmokeSummary,
  installLabVisualSmokeProbe,
} from "./visualSmoke.js";
import {
  MAP_DEBUG_ELEMENTS,
  MAP_VIEW_BOUNDS,
  clearMapRenderCaches,
  createMapIntegrationSnapshot,
  drawFullMap,
  drawMapPreview,
  getMapStart,
  isMapTilePassable,
  resolveMapDimensions,
} from "./mapRenderer.js";
import { DUNGEON_STAIR_SPRITE_ASSETS } from "./dungeonStairAssets.js";
import {
  PROP_ASSET_VERSION,
  detectPropsPersistence,
  loadLargeRockSpriteAssets,
  loadTreeSpriteAssets,
  subscribePropAssetsChanged,
} from "./propAssets.js";
import {
  PROCEDURAL_PARAMS_VERSION,
  detectProceduralParamsPersistence,
  loadProceduralParams,
  subscribeProceduralParamsChanged,
} from "./proceduralParams.js";
import {
  BIOME_RECIPES_VERSION,
  DUNGEON_TOPOLOGY_IDS,
  applyBiomeRecipeToProceduralParams,
  biomeAllowsLargeRockPlacements,
  fallbackBiomeRecipe,
  loadBiomeRecipes,
  subscribeBiomeRecipesChanged,
} from "./biomeRecipes.js";
import {
  ELEMENT_CATALOG_VERSION,
  elementCatalogSummary,
  expandElementRefs,
  fallbackElementCatalog,
  loadElementCatalog,
} from "./elementCatalog.js";
import {
  FINE_GRASS_BAKES_VERSION,
  findMatchingFineGrassBake,
  fineGrassBakeBiomeFromTerrain,
  fineGrassBakeDescriptor,
  loadFineGrassBakeAssets,
  subscribeFineGrassBakesChanged,
} from "./fineGrassBakes.js";
import {
  normalizeMapExportLayerMode,
  resolveMapExportDrawOptions,
} from "./mapRenderLayers.js";
import { currentLabLanguage, translateLabText } from "./labI18n.js";

const MAP_VIEW_VERSION = LAB_BUILD_TAG;
const LAB_VERSION = `${PROP_ASSET_VERSION}+${PROCEDURAL_PARAMS_VERSION}+${BIOME_RECIPES_VERSION}+${ELEMENT_CATALOG_VERSION}+${FINE_GRASS_BAKES_VERSION}+${MAP_VIEW_VERSION}`;
const TERRAIN_SLIDER_RENDER_DELAY_MS = 400;
const PRIMARY_DUNGEON_TOPOLOGY_IDS = new Set(["auto", "standard", "narrowCorridors", "largeHub"]);
const FIELD_PRESETS_BY_BIOME = Object.freeze({
  grassland: ["baseline", "vegetationReduced", "rocksEmphasis"],
  road: ["trailExperiment"],
  forest: ["forestGrove"],
  mountain: ["mountainPath"],
  dungeon: ["dungeonStone"],
});
const FIELD_PRESET_LABELS = Object.freeze({
  baseline: "baseline",
  vegetationReduced: "vegetation reduced",
  rocksEmphasis: "rocks emphasis",
  dungeonStone: "dungeon stone",
  mountainPath: "mountain path",
  forestGrove: "forest grove",
  trailExperiment: "trail experiment",
});

const mapCanvas = document.querySelector("#mapCanvas");
const seedInput = document.querySelector("#seedInput");
const biomeSelect = document.querySelector("#biomeSelect");
const dungeonTopologySelect = document.querySelector("#dungeonTopologySelect");
const mapSizeModeSelect = document.querySelector("#mapSizeModeSelect");
const mapSizePresetSelect = document.querySelector("#mapSizePresetSelect");
const mapOrientationSelect = document.querySelector("#mapOrientationSelect");
const customMapWidthInput = document.querySelector("#customMapWidthInput");
const customMapHeightInput = document.querySelector("#customMapHeightInput");
const mapSizePresetControl = document.querySelector("#mapSizePresetControl");
const mapOrientationControl = document.querySelector("#mapOrientationControl");
const customMapWidthControl = document.querySelector("#customMapWidthControl");
const customMapHeightControl = document.querySelector("#customMapHeightControl");
const dungeonTopologyControl = document.querySelector("#dungeonTopologyControl");
const fieldPresetSelect = document.querySelector("#fieldPresetSelect");
const presentationEffectsToggle = document.querySelector("#presentationEffectsToggle");
const atmosphereSelect = document.querySelector("#atmosphereSelect");
const vignetteEffectToggle = document.querySelector("#vignetteEffectToggle");
const terraceLayoutSelect = document.querySelector("#terraceLayoutSelect");
const treeDensitySelect = document.querySelector("#treeDensitySelect");
const highTerraceAmountInput = document.querySelector("#highTerraceAmountInput");
const highTerraceHeightInput = document.querySelector("#highTerraceHeightInput");
const highTerraceSpacingInput = document.querySelector("#highTerraceSpacingInput");
const highTerraceAmountControl = highTerraceAmountInput?.closest("label");
const highTerraceHeightControl = highTerraceHeightInput?.closest("label");
const highTerraceSpacingControl = highTerraceSpacingInput?.closest("label");
const highTerraceAmountValue = document.querySelector("#highTerraceAmountValue");
const highTerraceHeightValue = document.querySelector("#highTerraceHeightValue");
const highTerraceSpacingValue = document.querySelector("#highTerraceSpacingValue");
const terraceLayoutControl = document.querySelector("#terraceLayoutControl");
const treeDensityControl = document.querySelector("#treeDensityControl");
const playerOverlayToggle = document.querySelector("#playerOverlayToggle");
const enemyOverlayToggle = document.querySelector("#enemyOverlayToggle");
const fieldGridToggle = document.querySelector("#fieldGridToggle");
const randomizeButton = document.querySelector("#randomizeButton");
const resetActorButton = document.querySelector("#resetActorButton");
const exportLayerModeSelect = document.querySelector("#exportLayerModeSelect");
const exportFullMapButton = document.querySelector("#exportFullMapButton");
const exportFullMapTopButton = document.querySelector("#exportFullMapTopButton");
const integrationBundleScopeSelect = document.querySelector("#integrationBundleScopeSelect");
const integrationBundleEffectsToggle = document.querySelector("#integrationBundleEffectsToggle");
const exportIntegrationBundleButton = document.querySelector("#exportIntegrationBundleButton");
const integrationBundleStatus = document.querySelector("#integrationBundleStatus");
const fieldHumanSummary = document.querySelector("#fieldHumanSummary");
const fieldCameraStatus = document.querySelector("#fieldCameraStatus");
const fieldDebugLegend = document.querySelector("#fieldDebugLegend");
const fieldPerformancePanel = document.querySelector("#fieldPerformancePanel");
const mapWorkspace = document.querySelector("#mapWorkspace");
const fieldDiagnosticDock = document.querySelector("#fieldDiagnosticDock");
const openElementsDockButton = document.querySelector("#openElementsDockButton");
const openPerformanceDockButton = document.querySelector("#openPerformanceDockButton");
const closeDiagnosticDockButton = document.querySelector("#closeDiagnosticDockButton");
const diagnosticDockTitle = document.querySelector("#diagnosticDockTitle");
const elementsDockPanel = document.querySelector("#elementsDockPanel");
const performanceDockPanel = document.querySelector("#performanceDockPanel");
const diagnosticDockResizeHandle = document.querySelector("#diagnosticDockResizeHandle");
const elementDebugCanvas = document.querySelector("#elementDebugCanvas");
const elementDebugHover = document.querySelector("#elementDebugHover");
const debugSelectionSummary = document.querySelector("#debugSelectionSummary");
const copyElementIdButton = document.querySelector("#copyElementIdButton");
const copyAiContextButton = document.querySelector("#copyAiContextButton");
const debugCopyStatus = document.querySelector("#debugCopyStatus");
const fieldRulePrimary = document.querySelector("#fieldRulePrimary");
const fieldRuleBlocker = document.querySelector("#fieldRuleBlocker");
const fieldRulePropA = document.querySelector("#fieldRulePropA");
const fieldRulePropB = document.querySelector("#fieldRulePropB");
const fieldRuleHeight = document.querySelector("#fieldRuleHeight");
const fieldRuleVisual = document.querySelector("#fieldRuleVisual");
const mapResolvedSettings = document.querySelector("#mapResolvedSettings");
const moveButtons = document.querySelectorAll("[data-move]");

let fieldActorPos = getMapStart();
let fieldActorDirection = "down";
let fieldMoveNote = "ready";
let selectedDebugElement = null;
let debugCopyNote = "";
let lastDebugElementCounts = {};
let terrainSliderRenderTimer = null;
let propAssetReloadTimer = null;
let largeRockSpriteAssets = [];
let largeRockSpriteStatus = "sprite props loading";
let treeSpriteAssets = [];
let treeSpriteStatus = "tree props loading";
let unsubscribePropAssetsChanged = null;
let proceduralParams = null;
let proceduralParamsStatus = "procedural params loading";
let proceduralParamsReloadTimer = null;
let unsubscribeProceduralParamsChanged = null;
let biomeRecipes = [fallbackBiomeRecipe()];
const initialQueryParams = new URLSearchParams(window.location.search);
const initialBiomeId = initialQueryParams.get("biome");
let pendingInitialDungeonTopologyId = initialQueryParams.has("topology")
  ? normalizeDungeonTopologyId(initialQueryParams.get("topology"))
  : "";
const initialDungeonSizeProfileId = normalizeDungeonSizeProfileId(initialQueryParams.get("sizeProfile"));
const initialMapSizeMode = normalizeMapSizeMode(
  initialQueryParams.get("sizeMode") || (initialQueryParams.get("sizeProfile") === "fixed54x34" ? "preset" : "random"),
);
const initialMapSizePresetId = normalizeMapSizePresetId(initialQueryParams.get("mapPreset"));
const initialMapOrientation = normalizeMapOrientation(initialQueryParams.get("orientation"));
const initialCustomMapWidth = normalizeMapSide(initialQueryParams.get("mapWidth"), 54);
const initialCustomMapHeight = normalizeMapSide(initialQueryParams.get("mapHeight"), 34);
const initialPresentationEffects = initialQueryParams.get("effects") !== "0";
const initialVignetteEffect = initialQueryParams.get("vignette") !== "0";
const initialExportLayerMode = normalizeMapExportLayerMode(initialQueryParams.get("exportLayers"));
let currentBiomeId = initialBiomeId || "grassland";
let pendingInitialBiomeId = initialBiomeId || "";
let biomeStatus = "biome recipes loading";
let unsubscribeBiomeRecipesChanged = null;
let elementCatalog = fallbackElementCatalog();
let elementCatalogStatus = "element catalog loading";
let fineGrassBakeAssets = [];
let fineGrassBakeStatus = "fine-grass bakes loading";
let fineGrassBakeReloadTimer = null;
let unsubscribeFineGrassBakesChanged = null;
let lastRenderPerformance = null;
let lastMapDiagnostics = null;
let lastDebugMapDiagnostics = null;
let integrationBundleExportAvailable = false;
let integrationBundleExportBusy = false;
let propsPersistence = {
  mode: "checking",
  rollbackAvailable: false,
};
let proceduralPersistence = {
  mode: "checking",
  rollbackAvailable: false,
};
const mapViewStartupPerformance = {
  startedAt: mapViewPerfNow(),
  complete: false,
  totalMs: 0,
  renderCount: 0,
  suppressedRenderRequests: 0,
  renders: [],
  stages: {},
};
globalThis.__mapViewStartupPerformance = mapViewStartupPerformance;
let fieldRenderingSuspended = false;
let fieldRenderPending = false;

const MAP_DOCK_STORAGE = Object.freeze({
  tab: "procedural-tilemap-lab.map-dock.tab",
  width: "procedural-tilemap-lab.map-dock.width",
});
let diagnosticDockOpen = false;
let diagnosticDockTab = readMapDockStorage(MAP_DOCK_STORAGE.tab) === "performance" ? "performance" : "elements";
let diagnosticDockWidth = clampDockWidth(readMapDockStorage(MAP_DOCK_STORAGE.width));

const visibilitySprites = {
  bat: loadSprite("./assets/sprites/cave_bat.png"),
  rat: loadSprite("./assets/sprites/ruin_rat.png"),
};
const dungeonStairSprites = Object.fromEntries(
  Object.entries(DUNGEON_STAIR_SPRITE_ASSETS)
    .map(([direction, asset]) => [direction, loadDungeonStairSprite(asset.path)]),
);

const PRESET_LARGE_ROCK_SCALE = {
  baseline: 1,
  vegetationReduced: 0.72,
  rocksEmphasis: 1.45,
  dungeonStone: 1.45,
  mountainPath: 1.6,
  forestGrove: 0.52,
  trailExperiment: 0.92,
};

function mapViewPerfNow() {
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

function roundMapViewPerfMs(value) {
  return Math.round(value * 100) / 100;
}

function formatPerfMs(value) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 100) return `${Math.round(value)}ms`;
  return `${value.toFixed(value >= 10 ? 1 : 2)}ms`;
}

function formatCacheBytes(bytes) {
  if (!Number.isFinite(bytes)) return "--";
  const mib = bytes / 1024 / 1024;
  if (mib >= 1) return `${mib.toFixed(mib >= 10 ? 1 : 2)}MiB`;
  const kib = bytes / 1024;
  if (kib >= 1) return `${kib.toFixed(kib >= 10 ? 1 : 0)}KiB`;
  return `${Math.round(bytes)}B`;
}

function snapshotPerformance(performanceData, extras = {}) {
  if (!performanceData) return null;
  return {
    ...performanceData,
    ...extras,
    layers: performanceData.layers ? {
      ...performanceData.layers,
      presentation: { ...performanceData.layers.presentation },
      overlays: { ...performanceData.layers.overlays },
    } : null,
    cache: { ...performanceData.cache },
    build: {
      generation: { ...(performanceData.build?.generation ?? {}) },
      base: { ...(performanceData.build?.base ?? {}) },
      terrain: { ...(performanceData.build?.terrain ?? {}) },
      detail: { ...(performanceData.build?.detail ?? {}) },
    },
    draw: { ...performanceData.draw },
  };
}

function loadSprite(src) {
  const image = new Image();
  image.src = src;
  image.addEventListener("load", renderField);
  image.addEventListener("error", renderField);
  return image;
}

function loadDungeonStairSprite(path) {
  const image = new Image();
  image.src = labVersionedUrl(`./${path}`);
  image.addEventListener("load", () => {
    clearMapRenderCaches();
    renderField();
  });
  image.addEventListener("error", renderField);
  return image;
}

async function reloadLargeRockSpriteAssets() {
  try {
    const result = await loadLargeRockSpriteAssets({
      useBrowserShadowOverrides: propsPersistence.mode !== "json",
      onImageChange: (status) => {
        largeRockSpriteStatus = status;
        renderField();
      },
    });
    largeRockSpriteAssets = result.assets;
    largeRockSpriteStatus = result.status;
  } catch (error) {
    largeRockSpriteAssets = [];
    largeRockSpriteStatus = `sprite props error: ${error.message}`;
  }
  renderField();
}

async function reloadTreeSpriteAssets() {
  try {
    const result = await loadTreeSpriteAssets({
      onImageChange: (status) => {
        treeSpriteStatus = status.replace("sprite props", "tree props");
        renderField();
      },
    });
    treeSpriteAssets = result.assets;
    treeSpriteStatus = result.status;
  } catch (error) {
    treeSpriteAssets = [];
    treeSpriteStatus = `tree props error: ${error.message}`;
  }
  renderField();
}

async function reloadProceduralParams() {
  try {
    proceduralParams = await loadProceduralParams({
      useBrowserOverrides: false,
    });
    proceduralParamsStatus = "procedural params ready";
  } catch (error) {
    proceduralParams = null;
    proceduralParamsStatus = `procedural params error: ${error.message}`;
  }
  renderField();
}

async function reloadBiomeRecipes() {
  try {
    const index = await loadBiomeRecipes();
    biomeRecipes = index.recipes;
    currentBiomeId = biomeRecipes.some((recipe) => recipe.id === currentBiomeId)
      ? currentBiomeId
      : index.defaultBiome;
    syncBiomeSelect();
    applyCurrentBiomeRecipeToControls();
    biomeStatus = `${biomeRecipes.length} biome recipes ready`;
  } catch (error) {
    biomeRecipes = [fallbackBiomeRecipe()];
    currentBiomeId = biomeRecipes[0].id;
    syncBiomeSelect();
    applyCurrentBiomeRecipeToControls();
    biomeStatus = `biome recipes error: ${error.message}`;
  }
  renderField();
}

async function reloadElementCatalog() {
  try {
    elementCatalog = await loadElementCatalog();
    const summary = elementCatalogSummary(elementCatalog);
    elementCatalogStatus = `${summary.elementCount} elements / ${summary.setCount} sets`;
  } catch (error) {
    elementCatalog = fallbackElementCatalog();
    elementCatalogStatus = `element catalog error: ${error.message}`;
  }
  renderField();
}

async function reloadFineGrassBakes() {
  try {
    const result = await loadFineGrassBakeAssets({
      onImageChange: (status) => {
        fineGrassBakeStatus = status;
        renderField();
      },
    });
    fineGrassBakeAssets = result.assets;
    fineGrassBakeStatus = result.status;
  } catch (error) {
    fineGrassBakeAssets = [];
    fineGrassBakeStatus = `fine-grass bakes error: ${error.message}`;
  }
  renderField();
}

function syncBiomeSelect() {
  const current = currentBiomeId;
  biomeSelect.replaceChildren();
  for (const recipe of biomeRecipes) {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.label;
    biomeSelect.append(option);
  }
  const pendingInitial = pendingInitialBiomeId && biomeRecipes.some((recipe) => recipe.id === pendingInitialBiomeId)
    ? pendingInitialBiomeId
    : "";
  currentBiomeId = pendingInitial || (biomeRecipes.some((recipe) => recipe.id === current) ? current : biomeRecipes[0]?.id ?? "grassland");
  if (pendingInitial && currentBiomeId === pendingInitial) pendingInitialBiomeId = "";
  biomeSelect.value = currentBiomeId;
}

function selectedBiomeRecipe() {
  return biomeRecipes.find((recipe) => recipe.id === currentBiomeId) ?? biomeRecipes[0] ?? fallbackBiomeRecipe();
}

function syncCurrentBiomeFromSelect() {
  const selectedId = biomeSelect.value;
  if (!selectedId || selectedId === currentBiomeId) return;
  if (!biomeRecipes.some((recipe) => recipe.id === selectedId)) return;
  currentBiomeId = selectedId;
  applyCurrentBiomeRecipeToControls();
}

function selectedBiomeElementNote() {
  const recipe = selectedBiomeRecipe();
  const enabledElementIds = Object.entries(recipe.enabledElements ?? {})
    .filter(([, enabled]) => enabled !== false)
    .map(([id]) => id);
  const ids = expandElementRefs(elementCatalog, [
    ...(recipe.elementSets ?? []),
    ...(recipe.requiredElements ?? []),
    ...enabledElementIds,
    ...Object.keys(recipe.elementWeights ?? {}),
  ]);
  const entries = new Map((elementCatalog.elements ?? []).map((element) => [element.id, element]));
  let wired = 0;
  let planned = 0;
  let unknown = 0;
  for (const id of ids) {
    const entry = entries.get(id);
    if (!entry) unknown += 1;
    else if (entry.status === "wired") wired += 1;
    else planned += 1;
  }
  return `elements wired ${wired} / planned ${planned} / unknown ${unknown}`;
}

function applyCurrentBiomeRecipeToControls() {
  const recipe = selectedBiomeRecipe();
  const isDungeon = recipe.id === "dungeon";
  syncFieldPresetOptions(recipe);
  atmosphereSelect.value = recipe.atmosphere;
  applyDungeonTopologyControlValue(isDungeon
    ? normalizeDungeonTopologyId(pendingInitialDungeonTopologyId || recipe.dungeon?.topologyId)
    : "standard");
  dungeonTopologySelect.disabled = !isDungeon;
  dungeonTopologyControl.hidden = !isDungeon;
  terraceLayoutControl.hidden = isDungeon;
  treeDensityControl.hidden = isDungeon;
  if (isDungeon && pendingInitialDungeonTopologyId) pendingInitialDungeonTopologyId = "";
  terraceLayoutSelect.value = recipe.terrain.highTerraceLayout;
  treeDensitySelect.value = recipe.terrain.treeDensity;
  highTerraceHeightInput.value = String(Math.round(recipe.terrain.highTerraceHeight * 100));
  highTerraceSpacingInput.value = String(Math.round(recipe.terrain.highTerraceMinDistance));
  updateHighTerraceLabels();
  updateMapSizeControls();
}

function syncFieldPresetOptions(recipe) {
  const presetIds = FIELD_PRESETS_BY_BIOME[recipe.id] ?? [recipe.preset];
  fieldPresetSelect.replaceChildren();
  for (const presetId of presetIds) {
    const option = document.createElement("option");
    option.value = presetId;
    option.textContent = labUiText(FIELD_PRESET_LABELS[presetId] ?? presetId);
    fieldPresetSelect.append(option);
  }
  fieldPresetSelect.value = presetIds.includes(recipe.preset) ? recipe.preset : presetIds[0];
  fieldPresetSelect.disabled = presetIds.length === 1;
}

function scheduleLargeRockSpriteReload(reason = "props updated") {
  fieldMoveNote = reason;
  if (propAssetReloadTimer !== null) clearTimeout(propAssetReloadTimer);
  propAssetReloadTimer = setTimeout(() => {
    propAssetReloadTimer = null;
    reloadLargeRockSpriteAssets();
  }, 120);
}

function scheduleProceduralParamsReload(reason = "procedural params updated") {
  fieldMoveNote = reason;
  if (proceduralParamsReloadTimer !== null) clearTimeout(proceduralParamsReloadTimer);
  proceduralParamsReloadTimer = setTimeout(() => {
    proceduralParamsReloadTimer = null;
    reloadProceduralParams();
  }, 120);
}

function scheduleBiomeRecipesReload(reason = "biome recipe updated") {
  fieldMoveNote = reason;
  reloadBiomeRecipes();
}

function scheduleFineGrassBakeReload(reason = "fine-grass bake updated") {
  fieldMoveNote = reason;
  if (fineGrassBakeReloadTimer !== null) clearTimeout(fineGrassBakeReloadTimer);
  fineGrassBakeReloadTimer = setTimeout(() => {
    fineGrassBakeReloadTimer = null;
    reloadFineGrassBakes();
  }, 120);
}

function currentSeed() {
  return Number(seedInput.value) || 1;
}

function currentFieldSeed() {
  return hashSeed(currentSeed(), LEGACY_MAP_SEED_SALT);
}

function currentTerrainOptions() {
  const recipe = selectedBiomeRecipe();
  const highTerraceLayout = terraceLayoutSelect.value === "broadPlateau" ? "broadPlateau" : "none";
  const rockWeight = recipe.propWeights?.rocks ?? 1;
  const isDungeon = recipe.id === "dungeon";
  return {
    ...currentMapSizeRequest(),
    highTerraceAmount: !isDungeon && highTerraceLayout === "broadPlateau" ? 1 : 0,
    highTerraceHeight: Number(highTerraceHeightInput.value) / 100,
    highTerraceMinDistance: Number(highTerraceSpacingInput.value),
    highTerraceLayout: isDungeon ? "none" : highTerraceLayout,
    roadStyle: !isDungeon && fieldPresetSelect.value === "trailExperiment" ? "road" : "none",
    mountainStyle: recipe.id === "mountain" ? "rocky" : "none",
    forestStyle: recipe.id === "forest" ? "deep" : "none",
    dungeonStyle: isDungeon ? "stoneDungeon" : "none",
    dungeonTopologyId: isDungeon ? currentDungeonTopologyId() : "standard",
    dungeonSizeProfileId: isDungeon
      ? dungeonSizeProfileForTopology(currentDungeonTopologyId(), initialDungeonSizeProfileId)
      : "fixed54x34",
    treeDensity: isDungeon ? "none" : treeDensitySelect.value,
    largeRockScale: biomeAllowsLargeRockPlacements(recipe.id)
      ? Math.min(2, Math.max(0, (PRESET_LARGE_ROCK_SCALE[fieldPresetSelect.value] ?? 1) * rockWeight))
      : 0,
    spriteTrees: treeSpriteAssets,
  };
}

function updateHighTerraceLabels() {
  const hasHighTerrace = terraceLayoutSelect.value === "broadPlateau";
  if (highTerraceAmountControl) highTerraceAmountControl.hidden = true;
  if (highTerraceSpacingControl) highTerraceSpacingControl.hidden = true;
  if (highTerraceHeightControl) highTerraceHeightControl.hidden = !hasHighTerrace;
  highTerraceAmountValue.textContent = hasHighTerrace ? "100%" : "0%";
  highTerraceHeightValue.textContent = `${highTerraceHeightInput.value}%`;
  highTerraceSpacingValue.textContent = `${highTerraceSpacingInput.value}px`;
}

function terrainNote() {
  const recipe = selectedBiomeRecipe();
  const terrainOptions = currentTerrainOptions();
  const size = resolveMapDimensions(currentFieldSeed(), terrainOptions);
  const sizeNote = `${size.width}x${size.height} ${terrainOptions.mapSizeMode}/${size.orientation}`;
  if (recipe.id === "dungeon") {
    const topologyId = currentDungeonTopologyId();
    return `dungeon / topology ${topologyId} / size ${sizeNote}`;
  }
  const highNote = terraceLayoutSelect.value === "broadPlateau"
    ? `high broad/${highTerraceHeightInput.value}%`
    : "high none";
  return `${recipe.id} / size ${sizeNote} / ${highNote} / trees ${treeDensitySelect.value}`;
}

function normalizeDungeonTopologyId(value) {
  return DUNGEON_TOPOLOGY_IDS.has(value) ? value : "auto";
}

function currentDungeonTopologyId() {
  return normalizeDungeonTopologyId(dungeonTopologySelect.value);
}

function applyDungeonTopologyControlValue(value) {
  const topologyId = normalizeDungeonTopologyId(value);
  dungeonTopologySelect.value = PRIMARY_DUNGEON_TOPOLOGY_IDS.has(topologyId) ? topologyId : "auto";
}

function normalizeDungeonSizeProfileId(value) {
  if (value === "auto") return "auto";
  if (value === "fixed54x34") return "fixed54x34";
  if (value === "largeHubVariableV01") return "largeHubVariableV01";
  return "narrowVariableV01";
}

function normalizeMapSizeMode(value) {
  return value === "preset" || value === "custom" ? value : "random";
}

function normalizeMapSizePresetId(value) {
  return value === "compact" || value === "large" ? value : "standard";
}

function normalizeMapOrientation(value) {
  return value === "landscape" || value === "portrait" ? value : "auto";
}

function normalizeMapSide(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(34, Math.min(96, Math.round(number))) : fallback;
}

function currentMapSizeRequest() {
  return {
    mapSizeMode: normalizeMapSizeMode(mapSizeModeSelect.value),
    mapSizePresetId: normalizeMapSizePresetId(mapSizePresetSelect.value),
    mapOrientation: normalizeMapOrientation(mapOrientationSelect.value),
    customMapWidth: normalizeMapSide(customMapWidthInput.value, 54),
    customMapHeight: normalizeMapSide(customMapHeightInput.value, 34),
  };
}

function applyInitialMapSizeControls() {
  mapSizeModeSelect.value = initialMapSizeMode;
  mapSizePresetSelect.value = initialMapSizePresetId;
  mapOrientationSelect.value = initialMapOrientation;
  customMapWidthInput.value = String(initialCustomMapWidth);
  customMapHeightInput.value = String(initialCustomMapHeight);
  updateMapSizeControls();
}

function updateMapSizeControls() {
  const mode = normalizeMapSizeMode(mapSizeModeSelect.value);
  mapSizePresetControl.hidden = mode !== "preset";
  mapOrientationControl.hidden = mode === "custom";
  customMapWidthControl.hidden = mode !== "custom";
  customMapHeightControl.hidden = mode !== "custom";
  const isLargeHub = selectedBiomeRecipe().id === "dungeon" && currentDungeonTopologyId() === "largeHub";
  customMapWidthInput.min = isLargeHub ? "72" : "34";
  customMapHeightInput.min = isLargeHub ? "72" : "34";
}

function dungeonSizeProfileForTopology(topologyId, requestedSizeProfileId) {
  if (topologyId === "auto") return "auto";
  if (topologyId === "largeHub") return "largeHubVariableV01";
  if (requestedSizeProfileId === "fixed54x34") return "fixed54x34";
  if (topologyId === "narrowCorridors") return "narrowVariableV01";
  return "fixed54x34";
}

function currentRecipeProceduralParams() {
  return applyBiomeRecipeToProceduralParams(proceduralParams, selectedBiomeRecipe());
}

function currentFineGrassBake(terrainOptions, recipeProceduralParams) {
  if (terrainOptions.dungeonStyle === "stoneDungeon") return null;
  const size = resolveMapDimensions(currentFieldSeed(), terrainOptions);
  const descriptor = fineGrassBakeDescriptor({
    seed: currentFieldSeed(),
    biome: fineGrassBakeBiomeFromTerrain(terrainOptions),
    widthTiles: size.width,
    heightTiles: size.height,
    tileSize: MAP_VIEW_BOUNDS.tileSize,
    proceduralParams: recipeProceduralParams,
  });
  return findMatchingFineGrassBake(fineGrassBakeAssets, descriptor);
}

function currentFieldDrawOptions() {
  const terrainOptions = currentTerrainOptions();
  const recipeProceduralParams = currentRecipeProceduralParams();
  const fineGrassBake = currentFineGrassBake(terrainOptions, recipeProceduralParams);
  return {
    seed: currentFieldSeed(),
    preset: fieldPresetSelect.value,
    presentationEffects: presentationEffectsToggle.checked,
    atmosphere: atmosphereSelect.value,
    showVignetteEffect: vignetteEffectToggle.checked,
    ...terrainOptions,
    playerPos: fieldActorPos,
    playerDirection: fieldActorDirection,
    showPlayer: playerOverlayToggle.checked,
    showEnemies: enemyOverlayToggle.checked,
    showGrid: fieldGridToggle.checked,
    showDebugElements: false,
    highlightDebugElement: selectedDebugElement,
    collectDebugElementCounts: true,
    sprites: visibilitySprites,
    spriteRocks: largeRockSpriteAssets,
    spriteTrees: treeSpriteAssets,
    dungeonStairSprites,
    proceduralParams: recipeProceduralParams,
    fineGrassBake,
  };
}

function currentFullMapDrawOptions() {
  return resolveMapExportDrawOptions(exportLayerModeSelect.value, currentFieldDrawOptions());
}

function applyInitialPresentationControls() {
  presentationEffectsToggle.checked = initialPresentationEffects;
  vignetteEffectToggle.checked = initialVignetteEffect;
  exportLayerModeSelect.value = initialExportLayerMode;
  updatePresentationEffectControls();
}

function updatePresentationEffectControls() {
  const enabled = presentationEffectsToggle.checked;
  atmosphereSelect.disabled = !enabled;
  vignetteEffectToggle.disabled = !enabled;
}

function presentationNote(renderLayers) {
  if (!renderLayers?.presentation) return "effects unknown";
  const presentation = renderLayers.presentation;
  if (!presentation.enabled) return "effects off";
  const enabled = [];
  if (presentation.atmosphere) enabled.push(`atmosphere ${presentation.atmosphereMode}`);
  if (presentation.vignette) enabled.push("vignette");
  return enabled.length > 0 ? `effects ${enabled.join("+")}` : "effects none";
}

function updateFieldRuleMeta(drawOptions) {
  if (drawOptions.dungeonStyle === "stoneDungeon") {
    fieldRulePrimary.textContent = "Passable: dungeon floors and stairs";
    fieldRuleBlocker.textContent = "Blocked: walls and rubble";
    fieldRulePropA.textContent = "Structure: rooms and corridors";
    fieldRulePropB.textContent = "No collision: stone wear, dust, and cracks";
    fieldRuleHeight.hidden = true;
    fieldRuleVisual.hidden = true;
    return;
  }
  fieldRulePrimary.textContent = "Passable: grass";
  fieldRuleBlocker.textContent = "Blocked: stone, tree trunks, and large rocks";
  fieldRulePropA.textContent = "Height data: none";
  fieldRulePropB.textContent = "No collision: grass, trails, brush, and rocks";
  fieldRuleHeight.hidden = true;
  fieldRuleVisual.hidden = true;
}

function updateTerrainSliderPreviewNote() {
  updateHighTerraceLabels();
  fieldCameraStatus.textContent = `${LAB_VERSION} / ${terrainNote()} / terrain pending`;
}

function scheduleTerrainSliderRender() {
  updateTerrainSliderPreviewNote();
  if (terrainSliderRenderTimer !== null) clearTimeout(terrainSliderRenderTimer);
  terrainSliderRenderTimer = setTimeout(() => {
    terrainSliderRenderTimer = null;
    fieldMoveNote = "terrain updated";
    renderField();
  }, TERRAIN_SLIDER_RENDER_DELAY_MS);
}

function renderTerrainSliderNow() {
  if (terrainSliderRenderTimer !== null) {
    clearTimeout(terrainSliderRenderTimer);
    terrainSliderRenderTimer = null;
  }
  fieldMoveNote = "terrain updated";
  renderField();
}

function renderField() {
  if (fieldRenderingSuspended) {
    fieldRenderPending = true;
    if (!mapViewStartupPerformance.complete) mapViewStartupPerformance.suppressedRenderRequests += 1;
    return;
  }
  const startedAt = mapViewPerfNow();
  syncCurrentBiomeFromSelect();
  updateHighTerraceLabels();
  const drawOptions = currentFieldDrawOptions();
  updateFieldRuleMeta(drawOptions);
  const fieldInfo = drawMapPreview(mapCanvas, drawOptions);
  const renderMs = roundMapViewPerfMs(mapViewPerfNow() - startedAt);
  lastRenderPerformance = snapshotPerformance(fieldInfo.performance, { outerMs: renderMs });
  if (!mapViewStartupPerformance.complete) {
    mapViewStartupPerformance.renderCount += 1;
    mapViewStartupPerformance.renders.push({
      biome: currentBiomeId,
      outerMs: renderMs,
      cache: { ...lastRenderPerformance.cache },
    });
  }
  const debugMode = diagnosticDockOpen && diagnosticDockTab === "elements" ? "elements dock" : fieldGridToggle.checked ? "grid" : "visual";
  const highlightNote = selectedDebugElement ? `highlight ${selectedDebugElement}` : "highlight none";
  const copyNote = debugCopyNote ? ` / ${debugCopyNote}` : "";
  const fineGrassBakeNote = fieldInfo.fineGrassBake ? "fine-grass bake used" : fineGrassBakeStatus;

  fieldActorPos = fieldInfo.playerPos;
  lastDebugElementCounts = fieldInfo.debugElementCounts ?? {};
  lastMapDiagnostics = {
    width: fieldInfo.mapWidth,
    height: fieldInfo.mapHeight,
    camera: { ...fieldInfo.camera },
    playerPos: { ...fieldInfo.playerPos },
    enemyPlacements: fieldInfo.enemyPlacements.map((enemy) => ({ ...enemy })),
    enemyPassabilityOk: fieldInfo.enemyPlacements.every((enemy) => isMapTilePassable(
      currentFieldSeed(),
      { x: enemy.worldX, y: enemy.worldY },
      drawOptions,
    )),
  };
  const recipe = selectedBiomeRecipe();
  const orientation = fieldInfo.mapWidth >= fieldInfo.mapHeight ? "Landscape" : "Portrait";
  fieldHumanSummary.textContent = `${recipe.label} · ${fieldInfo.mapWidth}×${fieldInfo.mapHeight} · ${orientation} · Seed ${currentSeed()} · ${humanFieldStatus()}`;
  mapResolvedSettings.textContent = `Resolved: ${fieldInfo.mapWidth}×${fieldInfo.mapHeight} · ${orientation}`;
  fieldCameraStatus.textContent = `${LAB_VERSION} / map ${fieldInfo.mapWidth}x${fieldInfo.mapHeight} / actor ${fieldInfo.playerPos.x},${fieldInfo.playerPos.y} / camera ${fieldInfo.camera.x},${fieldInfo.camera.y} / ${debugMode} / ${highlightNote} / ${presentationNote(fieldInfo.renderLayers)} / ${terrainNote()} / ${selectedBiomeElementNote()} / ${fieldMoveNote}${copyNote} / ${largeRockSpriteStatus} / ${treeSpriteStatus} / ${fineGrassBakeNote} / ${proceduralParamsStatus} / ${biomeStatus} / ${elementCatalogStatus} / ${formatPerfMs(renderMs)}`;
  renderElementDebugMap(drawOptions, fieldInfo.playerPos);
  renderDebugSelection();
  renderDebugLegend();
  renderPerformancePanel();
}

function renderElementDebugMap(drawOptions, playerPos) {
  if (!diagnosticDockOpen || diagnosticDockTab !== "elements") return;
  const debugInfo = drawMapPreview(elementDebugCanvas, {
    ...drawOptions,
    playerPos,
    presentationEffects: false,
    showVignetteEffect: false,
    showActors: false,
    showPlayer: false,
    showEnemies: false,
    showGrid: false,
    showDebugElements: true,
    debugElementsOnly: true,
    collectDebugElementCounts: false,
  });
  lastDebugMapDiagnostics = {
    width: debugInfo.mapWidth,
    height: debugInfo.mapHeight,
    camera: { ...debugInfo.camera },
  };
}

function humanFieldStatus() {
  if (fieldMoveNote.startsWith("blocked")) return "Move blocked";
  return "Updated";
}

function mapViewVisualSmokeSnapshot() {
  const canvas = canvasVisualSmokeSummary(mapCanvas);
  return {
    ok: canvas.ok && Boolean(lastRenderPerformance) && Boolean(lastMapDiagnostics?.enemyPassabilityOk),
    page: "map-view",
    version: LAB_VERSION,
    canvas,
    statusText: fieldCameraStatus.textContent,
    controls: {
      biome: biomeSelect.value,
      preset: fieldPresetSelect.value,
      topology: currentDungeonTopologyId(),
      sizeProfile: currentTerrainOptions().dungeonSizeProfileId,
      mapSize: currentMapSizeRequest(),
      presentationEffects: presentationEffectsToggle.checked,
      atmosphere: atmosphereSelect.value,
      vignette: vignetteEffectToggle.checked,
      exportLayers: exportLayerModeSelect.value,
      trees: treeDensitySelect.value,
      player: playerOverlayToggle.checked,
      playerDirection: fieldActorDirection,
      playerMarker: "silver-direction-chevron",
      enemies: enemyOverlayToggle.checked,
      grid: fieldGridToggle.checked,
      elements: diagnosticDockOpen && diagnosticDockTab === "elements",
    },
    dock: {
      open: diagnosticDockOpen,
      tab: diagnosticDockTab,
      width: diagnosticDockWidth,
    },
    rules: {
      primary: fieldRulePrimary.textContent,
      blocker: fieldRuleBlocker.textContent,
      visual: fieldRuleVisual.textContent,
    },
    performance: lastRenderPerformance,
    map: lastMapDiagnostics,
    debugMap: lastDebugMapDiagnostics,
    selectedElement: selectedDebugElement,
    selectedAiContext: selectedDebugElementDefinition() ? selectedAiContextText() : "",
  };
}

globalThis.__mapViewDiagnostics = {
  capturePresentationComparison() {
    const currentOptions = currentFieldDrawOptions();
    const effectCanvas = document.createElement("canvas");
    const baseCanvas = document.createElement("canvas");
    const effectInfo = drawMapPreview(effectCanvas, {
      ...currentOptions,
      presentationEffects: true,
      showVignetteEffect: true,
    });
    const baseInfo = drawMapPreview(baseCanvas, {
      ...currentOptions,
      presentationEffects: false,
    });
    const vignetteCanvas = document.createElement("canvas");
    const noVignetteCanvas = document.createElement("canvas");
    const vignetteInfo = drawMapPreview(vignetteCanvas, {
      ...currentOptions,
      presentationEffects: true,
      atmosphere: "none",
      showVignetteEffect: true,
    });
    const noVignetteInfo = drawMapPreview(noVignetteCanvas, {
      ...currentOptions,
      presentationEffects: true,
      atmosphere: "none",
      showVignetteEffect: false,
    });
    const effectChecksum = canvasSampleChecksum(effectCanvas);
    const baseChecksum = canvasSampleChecksum(baseCanvas);
    const vignetteChecksum = canvasSampleChecksum(vignetteCanvas);
    const noVignetteChecksum = canvasSampleChecksum(noVignetteCanvas);
    return {
      ok: effectChecksum !== baseChecksum
        && effectInfo.renderLayers.presentation.enabled
        && !baseInfo.renderLayers.presentation.enabled
        && vignetteChecksum !== noVignetteChecksum
        && vignetteInfo.renderLayers.presentation.vignette
        && !noVignetteInfo.renderLayers.presentation.vignette
        && baseInfo.performance.cache.base.hit
        && baseInfo.performance.cache.terrain.hit,
      effectChecksum,
      baseChecksum,
      effectLayers: effectInfo.renderLayers,
      baseLayers: baseInfo.renderLayers,
      vignetteOnly: {
        vignetteChecksum,
        noVignetteChecksum,
        different: vignetteChecksum !== noVignetteChecksum,
        vignetteLayers: vignetteInfo.renderLayers,
        noVignetteLayers: noVignetteInfo.renderLayers,
      },
      baseCacheReused: {
        base: baseInfo.performance.cache.base.hit,
        terrain: baseInfo.performance.cache.terrain.hit,
      },
    };
  },
  async captureFullMap() {
    const canvas = document.createElement("canvas");
    const fieldInfo = drawFullMap(canvas, currentFullMapDrawOptions());
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return {
      ok: Boolean(blob)
        && canvas.width === fieldInfo.mapWidth * MAP_VIEW_BOUNDS.tileSize
        && canvas.height === fieldInfo.mapHeight * MAP_VIEW_BOUNDS.tileSize
        && !fieldInfo.renderLayers.presentation.vignette,
      mapWidth: fieldInfo.mapWidth,
      mapHeight: fieldInfo.mapHeight,
      pixelWidth: canvas.width,
      pixelHeight: canvas.height,
      pngBytes: blob?.size ?? 0,
      cameraOnlyVignetteExcluded: !fieldInfo.renderLayers.presentation.vignette,
      renderLayers: fieldInfo.renderLayers,
      exportLayerMode: exportLayerModeSelect.value,
      enemyPlacements: fieldInfo.enemyPlacements.map((enemy) => ({ ...enemy })),
    };
  },
};

function canvasSampleChecksum(canvas) {
  const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 257) {
    hash ^= data[index];
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function detectIntegrationBundleExport() {
  setIntegrationBundleStatus("Checking bundle export…", "checking");
  try {
    const response = await fetch("./api/integration-bundle/status", { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const status = await response.json();
    if (!status.ok || !status.capabilities?.export || status.version !== 2) {
      throw new Error("unsupported server capability");
    }
    integrationBundleExportAvailable = true;
    exportIntegrationBundleButton.disabled = false;
    setIntegrationBundleStatus("Ready · AI adaptation bundle", "ready");
  } catch {
    integrationBundleExportAvailable = false;
    exportIntegrationBundleButton.disabled = true;
    setIntegrationBundleStatus("Unavailable · start the latest local lab server", "unavailable");
  }
}

async function exportIntegrationBundle() {
  if (!integrationBundleExportAvailable || integrationBundleExportBusy) return;
  syncCurrentBiomeFromSelect();
  if (terrainSliderRenderTimer !== null) {
    clearTimeout(terrainSliderRenderTimer);
    terrainSliderRenderTimer = null;
    updateHighTerraceLabels();
  }

  integrationBundleExportBusy = true;
  exportIntegrationBundleButton.disabled = true;
  setIntegrationBundleStatus("Exporting bundle…", "working");
  try {
    const includePresentationEffects = integrationBundleEffectsToggle.checked;
    const drawOptions = {
      ...currentFieldDrawOptions(),
      presentationEffects: includePresentationEffects,
      showVignetteEffect: includePresentationEffects && vignetteEffectToggle.checked,
      showActors: false,
      showPlayer: false,
      showEnemies: false,
      showGrid: false,
      showDebugElements: false,
      highlightDebugElement: null,
    };
    const canvas = document.createElement("canvas");
    const fieldInfo = drawFullMap(canvas, drawOptions);
    const referencePng = await canvasToPngBlob(canvas);
    if (!referencePng) throw new Error("reference PNG encoding failed");
    const snapshot = createMapIntegrationSnapshot(currentFieldSeed(), drawOptions);
    const request = {
      version: 2,
      scope: integrationBundleScopeSelect.value,
      biomeId: selectedBiomeRecipe().id,
      configuration: currentIntegrationBundleConfiguration(fieldInfo, drawOptions),
      includePresentationEffects,
      includeReferencePng: true,
      referencePngBase64: await blobToBase64(referencePng),
      snapshot,
    };
    const response = await fetch("./api/integration-bundle/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await integrationBundleResponseError(response));
    const bundleBlob = await response.blob();
    const filename = integrationBundleResponseFilename(response.headers.get("content-disposition"));
    downloadBlob(bundleBlob, filename);
    setIntegrationBundleStatus(`Ready · exported ${filename}`, "ready");
  } finally {
    integrationBundleExportBusy = false;
    exportIntegrationBundleButton.disabled = !integrationBundleExportAvailable;
  }
}

function currentIntegrationBundleConfiguration(fieldInfo, drawOptions) {
  const mapSize = currentMapSizeRequest();
  return {
    seed: currentSeed(),
    fieldSeed: currentFieldSeed(),
    mapSize: {
      mode: mapSize.mapSizeMode,
      presetId: mapSize.mapSizePresetId,
      requestedOrientation: mapSize.mapOrientation,
      customWidth: mapSize.customMapWidth,
      customHeight: mapSize.customMapHeight,
    },
    resolvedDimensions: {
      width: fieldInfo.mapWidth,
      height: fieldInfo.mapHeight,
      orientation: fieldInfo.mapWidth >= fieldInfo.mapHeight ? "landscape" : "portrait",
    },
    topologyId: drawOptions.dungeonTopologyId,
    preset: fieldPresetSelect.value,
    atmosphere: atmosphereSelect.value,
    vignette: vignetteEffectToggle.checked,
    treeDensity: drawOptions.treeDensity,
    terrain: {
      highTerraceAmount: drawOptions.highTerraceAmount,
      highTerraceHeight: drawOptions.highTerraceHeight,
      highTerraceMinDistance: drawOptions.highTerraceMinDistance,
      highTerraceLayout: drawOptions.highTerraceLayout,
      roadStyle: drawOptions.roadStyle,
      mountainStyle: drawOptions.mountainStyle,
      forestStyle: drawOptions.forestStyle,
      dungeonStyle: drawOptions.dungeonStyle,
      dungeonSizeProfileId: drawOptions.dungeonSizeProfileId,
      largeRockScale: drawOptions.largeRockScale,
    },
  };
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const encoded = String(reader.result ?? "").split(",", 2)[1];
      if (encoded) resolve(encoded);
      else reject(new Error("reference PNG encoding failed"));
    }, { once: true });
    reader.addEventListener("error", () => reject(reader.error ?? new Error("reference PNG read failed")), { once: true });
    reader.readAsDataURL(blob);
  });
}

async function integrationBundleResponseError(response) {
  try {
    const body = await response.json();
    return body.error ?? `server returned ${response.status}`;
  } catch {
    return `server returned ${response.status}`;
  }
}

function integrationBundleResponseFilename(contentDisposition) {
  const match = String(contentDisposition ?? "").match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? `procedural-tilemap-lab-integration_${timestampForFilename(new Date())}.zip`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function setIntegrationBundleStatus(message, state) {
  integrationBundleStatus.textContent = message;
  integrationBundleStatus.dataset.state = state;
}

function handleIntegrationBundleExportError(error) {
  setIntegrationBundleStatus(`Export failed · ${error.message}`, "error");
}

async function exportFullMapPng() {
  syncCurrentBiomeFromSelect();
  if (terrainSliderRenderTimer !== null) {
    clearTimeout(terrainSliderRenderTimer);
    terrainSliderRenderTimer = null;
    updateHighTerraceLabels();
  }

  setFullMapExportDisabled(true);
  const startedAt = mapViewPerfNow();
  const canvas = document.createElement("canvas");
  const fieldInfo = drawFullMap(canvas, currentFullMapDrawOptions());
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const exportMs = roundMapViewPerfMs(mapViewPerfNow() - startedAt);
  if (!blob) {
    fieldMoveNote = "full PNG export failed";
    setFullMapExportDisabled(false);
    renderField();
    return;
  }

  const filename = fullMapPngFilename(fieldInfo);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);

  fieldMoveNote = `exported ${fieldInfo.mapWidth}x${fieldInfo.mapHeight} PNG ${filename} / ${formatPerfMs(exportMs)}`;
  setFullMapExportDisabled(false);
  renderField();
}

function handleFullMapExportError(error) {
  fieldMoveNote = `full PNG export failed: ${error.message}`;
  setFullMapExportDisabled(false);
  renderField();
}

function setFullMapExportDisabled(disabled) {
  exportFullMapButton.disabled = disabled;
  exportFullMapTopButton.disabled = disabled;
}

function fullMapPngFilename(fieldInfo) {
  const debugMode = fieldInfo.renderLayers.overlays.debugElements
    ? "elements"
    : fieldInfo.renderLayers.overlays.grid ? "grid" : "visual";
  const presentation = fieldInfo.renderLayers.presentation;
  const parts = [
    "procedural-tilemap-lab-full",
    `seed-${currentSeed()}`,
    `field-${currentFieldSeed()}`,
    selectedBiomeRecipe().id,
    fieldPresetSelect.value,
    atmosphereSelect.value,
    `effects-${presentation.enabled ? "on" : "off"}`,
    `vignette-${presentation.vignette ? "on" : "off"}`,
    `layers-${exportLayerModeSelect.value}`,
    terraceLayoutSelect.value,
    `trees-${treeDensitySelect.value}`,
    terraceLayoutSelect.value === "broadPlateau" ? `high-broad-${highTerraceHeightInput.value}` : "high-none",
    debugMode,
    `${fieldInfo.mapWidth}x${fieldInfo.mapHeight}`,
    timestampForFilename(new Date()),
  ];
  return `${parts.map(filenameToken).filter(Boolean).join("_")}.png`;
}

function filenameToken(value) {
  return String(value).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "");
}

function timestampForFilename(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function resetFieldActor(note = "ready") {
  const terrainOptions = currentTerrainOptions();
  fieldActorPos = terrainOptions.dungeonStyle === "stoneDungeon"
    ? null
    : getMapStart({ seed: currentFieldSeed(), ...terrainOptions });
  fieldActorDirection = "down";
  fieldMoveNote = note;
}

function moveFieldActor(dx, dy) {
  fieldActorDirection = playerDirectionFromDelta(dx, dy);
  const next = {
    x: fieldActorPos.x + dx,
    y: fieldActorPos.y + dy,
  };
  if (!isMapTilePassable(currentFieldSeed(), next, {
    ...currentTerrainOptions(),
    spriteRocks: largeRockSpriteAssets,
    spriteTrees: treeSpriteAssets,
  })) {
    fieldMoveNote = "blocked";
    renderField();
    return;
  }
  fieldActorPos = next;
  fieldMoveNote = "moving";
  renderField();
}

function playerDirectionFromDelta(dx, dy) {
  if (dy < 0) return "up";
  if (dy > 0) return "down";
  if (dx < 0) return "left";
  return "right";
}

function shouldIgnoreMoveKey(event) {
  const tag = event.target?.tagName?.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea" || event.altKey || event.ctrlKey || event.metaKey;
}

function readMapDockStorage(key) {
  try {
    return globalThis.localStorage?.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeMapDockStorage(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {}
}

function clampDockWidth(value) {
  if (value === "" || value === null || value === undefined) return 420;
  const width = Number(value);
  return Number.isFinite(width) ? Math.min(640, Math.max(340, Math.round(width))) : 420;
}

function applyDiagnosticDockState() {
  mapWorkspace.style.setProperty("--diagnostic-dock-width", `${diagnosticDockWidth}px`);
  diagnosticDockResizeHandle.setAttribute("aria-valuenow", String(diagnosticDockWidth));
  mapWorkspace.classList.toggle("is-dock-closed", !diagnosticDockOpen);
  fieldDiagnosticDock.setAttribute("aria-hidden", diagnosticDockOpen ? "false" : "true");
  openElementsDockButton.setAttribute("aria-expanded", String(diagnosticDockOpen && diagnosticDockTab === "elements"));
  openPerformanceDockButton.setAttribute("aria-expanded", String(diagnosticDockOpen && diagnosticDockTab === "performance"));

  const elementsSelected = diagnosticDockTab === "elements";
  diagnosticDockTitle.textContent = elementsSelected ? "Elements" : "Performance";
  elementsDockPanel.hidden = !elementsSelected;
  performanceDockPanel.hidden = elementsSelected;
}

function setDiagnosticDockWidth(value, { persist = false } = {}) {
  diagnosticDockWidth = clampDockWidth(value);
  applyDiagnosticDockState();
  if (persist) writeMapDockStorage(MAP_DOCK_STORAGE.width, String(diagnosticDockWidth));
}

function beginDiagnosticDockResize(event) {
  if (event.button !== 0) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = diagnosticDockWidth;
  document.body.classList.add("is-resizing-panel");
  const move = (moveEvent) => setDiagnosticDockWidth(startWidth + startX - moveEvent.clientX);
  const end = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", end);
    document.removeEventListener("pointercancel", end);
    document.body.classList.remove("is-resizing-panel");
    writeMapDockStorage(MAP_DOCK_STORAGE.width, String(diagnosticDockWidth));
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", end);
  document.addEventListener("pointercancel", end);
}

function handleDiagnosticDockResizeKey(event) {
  if (event.key === "Home") {
    event.preventDefault();
    event.stopPropagation();
    setDiagnosticDockWidth(420, { persist: true });
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  event.stopPropagation();
  setDiagnosticDockWidth(diagnosticDockWidth + (event.key === "ArrowLeft" ? 20 : -20), { persist: true });
}

function openDiagnosticDock(tab) {
  diagnosticDockOpen = true;
  diagnosticDockTab = tab === "performance" ? "performance" : "elements";
  writeMapDockStorage(MAP_DOCK_STORAGE.tab, diagnosticDockTab);
  applyDiagnosticDockState();
  if (diagnosticDockTab === "elements" && !fieldRenderingSuspended) {
    renderElementDebugMap(currentFieldDrawOptions(), fieldActorPos);
    renderDebugSelection();
    renderDebugLegend();
  } else {
    renderPerformancePanel();
  }
}

function closeDiagnosticDock() {
  diagnosticDockOpen = false;
  applyDiagnosticDockState();
}

function toggleDiagnosticDock(tab) {
  const nextTab = tab === "performance" ? "performance" : "elements";
  if (diagnosticDockOpen && diagnosticDockTab === nextTab) {
    closeDiagnosticDock();
    return;
  }
  openDiagnosticDock(nextTab);
}

function handleElementDebugCanvasClick(event) {
  const rect = elementDebugCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const x = Math.min(elementDebugCanvas.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) * elementDebugCanvas.width / rect.width)));
  const y = Math.min(elementDebugCanvas.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) * elementDebugCanvas.height / rect.height)));
  const pixel = elementDebugCanvas.getContext("2d").getImageData(x, y, 1, 1).data;
  const element = nearestDebugElement(pixel);
  if (element) toggleDebugHighlight(element.id);
}

function nearestDebugElement(pixel) {
  if (!pixel || pixel[3] === 0 || pixel[0] + pixel[1] + pixel[2] < 18) return null;
  let nearest = null;
  let nearestScore = Number.POSITIVE_INFINITY;
  for (const element of MAP_DEBUG_ELEMENTS) {
    const color = debugHexRgb(element.color);
    if (!color) continue;
    const alpha = Math.max(0.12, Number(element.alpha) || 0.5);
    const expected = color.map((part) => part * alpha + 8 * (1 - alpha));
    const score = expected.reduce((sum, part, index) => sum + (part - pixel[index]) ** 2, 0);
    if (score < nearestScore) {
      nearest = element;
      nearestScore = score;
    }
  }
  return nearestScore < 32_000 ? nearest : null;
}

function debugHexRgb(value) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(value));
  if (!match) return null;
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16));
}

const MOVE_KEYS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  W: [0, -1],
  S: [0, 1],
  A: [-1, 0],
  D: [1, 0],
};

seedInput.addEventListener("input", () => {
  resetFieldActor("ready");
  renderField();
});
biomeSelect.addEventListener("change", () => {
  currentBiomeId = biomeSelect.value;
  applyCurrentBiomeRecipeToControls();
  resetFieldActor("biome changed");
  renderTerrainSliderNow();
});
fieldPresetSelect.addEventListener("change", renderTerrainSliderNow);
dungeonTopologySelect.addEventListener("change", () => {
  updateMapSizeControls();
  resetFieldActor("topology changed");
  renderTerrainSliderNow();
});
mapSizeModeSelect.addEventListener("change", () => {
  updateMapSizeControls();
  resetFieldActor("map size changed");
  renderTerrainSliderNow();
});
mapSizePresetSelect.addEventListener("change", () => {
  resetFieldActor("map size changed");
  renderTerrainSliderNow();
});
mapOrientationSelect.addEventListener("change", () => {
  resetFieldActor("orientation changed");
  renderTerrainSliderNow();
});
for (const input of [customMapWidthInput, customMapHeightInput]) {
  input.addEventListener("change", () => {
    resetFieldActor("custom size changed");
    renderTerrainSliderNow();
  });
}
atmosphereSelect.addEventListener("change", renderField);
presentationEffectsToggle.addEventListener("change", () => {
  updatePresentationEffectControls();
  renderField();
});
vignetteEffectToggle.addEventListener("change", renderField);
terraceLayoutSelect.addEventListener("change", renderTerrainSliderNow);
treeDensitySelect.addEventListener("change", renderTerrainSliderNow);
highTerraceAmountInput.addEventListener("input", scheduleTerrainSliderRender);
highTerraceHeightInput.addEventListener("input", scheduleTerrainSliderRender);
highTerraceSpacingInput.addEventListener("input", scheduleTerrainSliderRender);
highTerraceAmountInput.addEventListener("change", renderTerrainSliderNow);
highTerraceHeightInput.addEventListener("change", renderTerrainSliderNow);
highTerraceSpacingInput.addEventListener("change", renderTerrainSliderNow);
playerOverlayToggle.addEventListener("change", renderField);
enemyOverlayToggle.addEventListener("change", renderField);
fieldGridToggle.addEventListener("change", renderField);
randomizeButton.addEventListener("click", () => {
  seedInput.value = String(1 + Math.floor(Math.random() * 999999));
  resetFieldActor("ready");
  renderField();
});
resetActorButton.addEventListener("click", () => {
  resetFieldActor("ready");
  renderField();
});
exportFullMapButton.addEventListener("click", () => {
  exportFullMapPng().catch(handleFullMapExportError);
});
exportFullMapTopButton.addEventListener("click", () => {
  exportFullMapPng().catch(handleFullMapExportError);
});
exportIntegrationBundleButton.addEventListener("click", () => {
  exportIntegrationBundle().catch(handleIntegrationBundleExportError);
});
openElementsDockButton.addEventListener("click", () => toggleDiagnosticDock("elements"));
openPerformanceDockButton.addEventListener("click", () => toggleDiagnosticDock("performance"));
closeDiagnosticDockButton.addEventListener("click", closeDiagnosticDock);
diagnosticDockResizeHandle.addEventListener("pointerdown", beginDiagnosticDockResize);
diagnosticDockResizeHandle.addEventListener("keydown", handleDiagnosticDockResizeKey);
diagnosticDockResizeHandle.addEventListener("dblclick", () => setDiagnosticDockWidth(420, { persist: true }));
elementDebugCanvas.addEventListener("click", handleElementDebugCanvasClick);
elementDebugCanvas.addEventListener("pointermove", handleElementDebugCanvasHover);
elementDebugCanvas.addEventListener("pointerleave", clearElementDebugCanvasHover);
copyElementIdButton.addEventListener("click", copySelectedElementId);
copyAiContextButton.addEventListener("click", copySelectedAiContext);
globalThis.addEventListener("lab-language-change", () => {
  clearElementDebugCanvasHover();
  if (diagnosticDockOpen && diagnosticDockTab === "elements") {
    renderDebugSelection();
    renderDebugLegend();
  }
});

for (const button of moveButtons) {
  button.addEventListener("click", () => {
    const [dx, dy] = button.dataset.move.split(",").map(Number);
    moveFieldActor(dx, dy);
  });
}

window.addEventListener("keydown", (event) => {
  if (shouldIgnoreMoveKey(event)) return;
  if (event.key === "e" || event.key === "E") {
    event.preventDefault();
    toggleDiagnosticDock("elements");
    return;
  }
  if (event.key === "g" || event.key === "G") {
    event.preventDefault();
    fieldGridToggle.checked = !fieldGridToggle.checked;
    renderField();
    return;
  }
  const move = MOVE_KEYS[event.key];
  if (!move) return;
  event.preventDefault();
  moveFieldActor(move[0], move[1]);
});

function renderPerformancePanel() {
  if (!fieldPerformancePanel) return;
  fieldPerformancePanel.replaceChildren();

  const title = document.createElement("div");
  title.className = "performance-panel-title";
  const heading = document.createElement("strong");
  heading.textContent = "Preview performance";
  const state = document.createElement("span");
  state.textContent = lastRenderPerformance ? "measured" : "pending";
  title.append(heading, state);

  const note = document.createElement("p");
  note.className = "performance-panel-note";
  note.textContent = "Latest preview update. Cache misses include map generation; movement and repeated views may reuse caches.";
  fieldPerformancePanel.append(title, note);
  appendPerformanceSection(fieldPerformancePanel, "Latest preview update", lastRenderPerformance);
}

function appendPerformanceSection(parent, titleText, performanceData) {
  const section = document.createElement("section");
  section.className = "performance-section";

  const title = document.createElement("div");
  title.className = "performance-section-title";
  title.textContent = titleText;
  section.append(title);

  if (!performanceData) {
    const empty = document.createElement("p");
    empty.className = "performance-empty";
    empty.textContent = "No measurement yet.";
    section.append(empty);
    parent.append(section);
    return;
  }

  appendPerformanceRow(section, "preview total", formatPerfMs(performanceData.outerMs));
  appendPerformanceRow(section, "renderer total", formatPerfMs(performanceData.totalMs));
  appendPerformanceRow(section, "base cache", cachePerfText(performanceData.cache?.base));
  appendPerformanceRow(section, "terrain cache", cachePerfText(performanceData.cache?.terrain));
  appendPerformanceRow(section, "atmo cache", cachePerfText(performanceData.cache?.atmosphere));
  appendPerformanceRow(section, "effects", presentationNote(performanceData.layers));
  appendPerformanceRow(section, "base draw", formatPerfMs(performanceData.draw?.baseLayer));
  appendPerformanceRow(section, "terrain draw", formatPerfMs(performanceData.draw?.terrainLayer));
  appendPerformanceRow(section, "atmo draw", formatPerfMs(performanceData.draw?.atmosphere));
  appendPerformanceRow(section, "vignette", formatPerfMs(performanceData.draw?.vignette));
  appendPerformanceRow(section, "debug", formatPerfMs(performanceData.draw?.debugOverlay));
  appendPerformanceRow(section, "highlight", formatPerfMs(performanceData.draw?.highlight));
  appendPerformanceRow(section, "actors", formatPerfMs(performanceData.draw?.actors));
  appendPerformanceRow(section, "grid", formatPerfMs(performanceData.draw?.grid));
  for (const [key, value] of topPerformanceEntries(performanceData.build?.base, 5)) {
    appendPerformanceRow(section, `base ${key}`, formatPerfMs(value));
  }

  parent.append(section);
}

function appendPerformanceRow(parent, label, value) {
  const row = document.createElement("div");
  row.className = "performance-row";
  const labelNode = document.createElement("span");
  labelNode.textContent = label;
  const valueNode = document.createElement("code");
  valueNode.textContent = value;
  row.append(labelNode, valueNode);
  parent.append(row);
}

function cachePerfText(cacheInfo) {
  if (!cacheInfo) return "--";
  const state = cacheInfo.disabled ? "off" : cacheInfo.mode === "none" ? "none" : cacheInfo.hit ? "hit" : "build";
  const mode = cacheInfo.mode && cacheInfo.mode !== "none" ? ` ${cacheInfo.mode}` : "";
  const entries = Number.isFinite(cacheInfo.entries) ? ` ${cacheInfo.entries}e` : "";
  const budget = Number.isFinite(cacheInfo.maxBytes) && cacheInfo.maxBytes > 0
    ? `/${formatCacheBytes(cacheInfo.maxBytes)}`
    : "";
  const bytes = Number.isFinite(cacheInfo.bytes) ? ` ${formatCacheBytes(cacheInfo.bytes)}${budget}${entries}` : "";
  return `${state}${mode} ${formatPerfMs(cacheInfo.ms)}${bytes}`;
}

function topPerformanceEntries(source, limit) {
  if (!source) return [];
  return Object.entries(source)
    .filter((entry) => Number.isFinite(entry[1]) && entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function renderDebugLegend() {
  fieldDebugLegend.replaceChildren();

  const title = document.createElement("div");
  title.className = "debug-legend-title";
  const heading = document.createElement("strong");
  heading.textContent = "Element legend";
  const state = document.createElement("span");
  state.textContent = selectedDebugElement
    ? labUiText("1 selected")
    : currentLabLanguage() === "ja" ? `${MAP_DEBUG_ELEMENTS.length}種類` : `${MAP_DEBUG_ELEMENTS.length} elements`;
  title.append(heading, state);

  const hint = document.createElement("p");
  hint.textContent = labUiText("Select a row or click the debug map to highlight the same element in both views.");

  const list = document.createElement("div");
  list.className = "debug-legend-list";
  list.classList.toggle("has-selection", Boolean(selectedDebugElement));
  for (const element of MAP_DEBUG_ELEMENTS) {
    const row = document.createElement("div");
    row.className = "debug-legend-row";
    row.tabIndex = 0;
    row.role = "button";
    row.style.setProperty("--debug-color", element.color);
    row.dataset.debugElement = element.id;
    row.setAttribute("aria-pressed", selectedDebugElement === element.id ? "true" : "false");
    if (selectedDebugElement === element.id) row.classList.add("is-selected");
    row.addEventListener("click", () => {
      toggleDebugHighlight(element.id);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleDebugHighlight(element.id);
    });

    const swatch = document.createElement("span");
    swatch.className = "debug-swatch";
    swatch.style.backgroundColor = element.color;

    const name = document.createElement("strong");
    name.className = "debug-copy-name";
    const englishName = debugElementLabel(element);
    name.textContent = labUiText(englishName);

    const code = document.createElement("code");
    code.textContent = currentLabLanguage() === "ja" ? `${englishName} · ${element.id}` : element.id;

    const count = document.createElement("span");
    count.className = "debug-placement-count";
    const placementCount = formatPlacementCount(lastDebugElementCounts[element.id]);
    count.textContent = currentLabLanguage() === "ja" ? `×${placementCount}` : `${placementCount}×`;
    count.title = "Current map placement count";

    const note = document.createElement("span");
    note.className = "debug-legend-note";
    note.textContent = element.note;

    row.append(swatch, name, code, count, note);
    list.append(row);
  }

  fieldDebugLegend.append(title, hint, list);
}

function labUiText(source) {
  return translateLabText(source, currentLabLanguage());
}

function toggleDebugHighlight(elementId) {
  selectedDebugElement = selectedDebugElement === elementId ? null : elementId;
  debugCopyNote = "";
  renderField();
}

function debugElementLabel(element) {
  return String(element?.label || element?.id || "Unknown")
    .split("-")
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : "")
    .join(" ");
}

function formatPlacementCount(value) {
  const count = Math.max(0, Math.round(Number(value) || 0));
  return new Intl.NumberFormat("en-US").format(count);
}

function selectedDebugElementDefinition() {
  return MAP_DEBUG_ELEMENTS.find((element) => element.id === selectedDebugElement) ?? null;
}

function renderDebugSelection() {
  const element = selectedDebugElementDefinition();
  copyElementIdButton.disabled = !element;
  copyAiContextButton.disabled = !element;
  debugCopyStatus.textContent = debugCopyNote;
  if (!element) {
    debugSelectionSummary.textContent = labUiText("None selected");
    return;
  }
  const count = formatPlacementCount(lastDebugElementCounts[element.id]);
  const englishName = debugElementLabel(element);
  const primaryName = labUiText(englishName);
  const identity = currentLabLanguage() === "ja" ? `${primaryName} · ${englishName} · ${element.id}` : `${englishName} · ${element.id}`;
  debugSelectionSummary.textContent = `${identity} · ${count} placements`;
}

function debugElementFromPointer(event) {
  const rect = elementDebugCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const x = Math.min(elementDebugCanvas.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) * elementDebugCanvas.width / rect.width)));
  const y = Math.min(elementDebugCanvas.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) * elementDebugCanvas.height / rect.height)));
  const pixel = elementDebugCanvas.getContext("2d").getImageData(x, y, 1, 1).data;
  return nearestDebugElement(pixel);
}

function handleElementDebugCanvasHover(event) {
  const element = debugElementFromPointer(event);
  if (!element) {
    clearElementDebugCanvasHover();
    return;
  }
  const englishName = debugElementLabel(element);
  elementDebugHover.textContent = currentLabLanguage() === "ja"
    ? `${labUiText(englishName)} · ${englishName} · ${element.id}`
    : `${englishName} · ${element.id}`;
  elementDebugHover.hidden = false;
}

function clearElementDebugCanvasHover() {
  elementDebugHover.hidden = true;
  elementDebugHover.textContent = "";
}

function copySelectedElementId() {
  const element = selectedDebugElementDefinition();
  if (!element) return;
  copyDebugText(element.id, "Copied element ID");
}

function copySelectedAiContext() {
  const element = selectedDebugElementDefinition();
  if (!element) return;
  copyDebugText(selectedAiContextText(), "Copied AI context");
}

function selectedAiContextText() {
  const element = selectedDebugElementDefinition();
  if (!element) return "";
  const recipe = selectedBiomeRecipe();
  const width = lastMapDiagnostics?.width ?? "--";
  const height = lastMapDiagnostics?.height ?? "--";
  return [
    `Environment: ${recipe.label} (${recipe.id})`,
    `Seed: ${currentSeed()}`,
    `Map size: ${width}x${height}`,
    `Element ID: ${element.id}`,
    `Element label: ${debugElementLabel(element)}`,
    `Placement count: ${formatPlacementCount(lastDebugElementCounts[element.id])}`,
  ].join("\n");
}

function copyDebugText(text, successMessage) {
  const fallbackCopied = writeClipboardTextFallback(text);
  if (fallbackCopied) {
    debugCopyNote = successMessage;
    renderDebugSelection();
    return;
  }

  if (!globalThis.navigator?.clipboard?.writeText) {
    debugCopyNote = "Copy failed";
    renderDebugSelection();
    return;
  }

  globalThis.navigator.clipboard.writeText(text).then(
    () => {
      debugCopyNote = successMessage;
      renderDebugSelection();
    },
    () => {
      debugCopyNote = "Copy failed";
      renderDebugSelection();
    },
  );
}

function writeClipboardTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

async function initialize() {
  fieldRenderingSuspended = true;
  fieldRenderPending = true;
  try {
    applyDiagnosticDockState();
    applyInitialMapSizeControls();
    applyInitialPresentationControls();
    syncBiomeSelect();
    const [, , nextPropsPersistence, nextProceduralPersistence] = await Promise.all([
      measureMapViewStartupStep("biomeRecipesMs", reloadBiomeRecipes),
      measureMapViewStartupStep("elementCatalogMs", reloadElementCatalog),
      measureMapViewStartupStep("propsPersistenceMs", detectPropsPersistence),
      measureMapViewStartupStep("proceduralPersistenceMs", detectProceduralParamsPersistence),
      measureMapViewStartupStep("integrationBundleStatusMs", detectIntegrationBundleExport),
    ]);
    propsPersistence = nextPropsPersistence;
    proceduralPersistence = nextProceduralPersistence;

    await Promise.all([
      measureMapViewStartupStep("largeRockAssetsMs", reloadLargeRockSpriteAssets),
      measureMapViewStartupStep("treeAssetsMs", reloadTreeSpriteAssets),
      measureMapViewStartupStep("proceduralParamsMs", reloadProceduralParams),
      measureMapViewStartupStep("fineGrassBakesMs", reloadFineGrassBakes),
    ]);
    await measureMapViewStartupStep("imageReadyMs", waitForMapViewStartupImages);
    resetFieldActor("ready");

    unsubscribePropAssetsChanged = subscribePropAssetsChanged((message) => {
      const reason = message?.reason ? `props ${message.reason}` : "props updated";
      scheduleLargeRockSpriteReload(reason);
      reloadTreeSpriteAssets();
    });
    unsubscribeProceduralParamsChanged = subscribeProceduralParamsChanged((message) => {
      const reason = message?.reason ? `params ${message.reason}` : "procedural params updated";
      scheduleProceduralParamsReload(reason);
    });
    unsubscribeBiomeRecipesChanged = subscribeBiomeRecipesChanged((message) => {
      const reason = message?.reason ? `biome ${message.reason}` : "biome recipe updated";
      scheduleBiomeRecipesReload(reason);
    });
    unsubscribeFineGrassBakesChanged = subscribeFineGrassBakesChanged((message) => {
      const reason = message?.reason ? `fine-grass ${message.reason}` : "fine-grass bake updated";
      scheduleFineGrassBakeReload(reason);
    });
  } finally {
    fieldRenderingSuspended = false;
    if (fieldRenderPending) {
      fieldRenderPending = false;
      renderField();
    }
  }
  mapViewStartupPerformance.totalMs = roundMapViewPerfMs(mapViewPerfNow() - mapViewStartupPerformance.startedAt);
  mapViewStartupPerformance.complete = true;
}

async function measureMapViewStartupStep(key, run) {
  const startedAt = mapViewPerfNow();
  try {
    return await run();
  } finally {
    mapViewStartupPerformance.stages[key] = roundMapViewPerfMs(mapViewPerfNow() - startedAt);
  }
}

function waitForMapViewStartupImages() {
  return Promise.all([
    ...Object.values(visibilitySprites).map((image) => waitForMapViewImage({ image })),
    ...Object.values(dungeonStairSprites).map((image) => waitForMapViewImage({ image })),
    ...largeRockSpriteAssets.map(waitForMapViewImage),
    ...treeSpriteAssets.map(waitForMapViewImage),
    ...fineGrassBakeAssets.map(waitForMapViewImage),
  ]);
}

function waitForMapViewImage(asset) {
  const image = asset?.image;
  if (!image || image.complete) return Promise.resolve();
  return new Promise((resolveImage) => {
    const finish = () => resolveImage();
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

installLabVisualSmokeProbe(mapViewVisualSmokeSnapshot);
initialize();
