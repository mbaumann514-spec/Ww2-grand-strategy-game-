import { hashSeed } from "./tileArt.js";
import { LAB_BUILD_TAG } from "./labBuild.js";
import { LEGACY_MAP_SEED_SALT } from "./labIdentity.js";
import {
  canvasVisualSmokeSummary,
  installLabVisualSmokeProbe,
} from "./visualSmoke.js";
import {
  MAP_VIEW_BOUNDS,
  drawFineGrassBake,
  drawMaterialLabPreview,
} from "./mapRenderer.js";
import {
  PROP_ASSET_VERSION,
  detectPropsPersistence,
  loadLargeRockSpriteAssets,
  loadTreeSpriteAssets,
  notifyPropAssetsChanged,
  normalizeClientAnchor,
  normalizeClientCollisionBounds,
  normalizeClientCollisionTiles,
  normalizeClientFootprint,
  normalizeClientScale,
  normalizeClientShadow,
  postPropsBatchApi,
  postPropsApi,
  propStoreCategories,
  propStoreDefinition,
} from "./propAssets.js";
import {
  PROCEDURAL_ELEMENT_DEFINITIONS,
  PROCEDURAL_PARAMS_VERSION,
  clearProceduralParamsOverride,
  cloneProceduralParamsManifest,
  detectProceduralParamsPersistence,
  loadProceduralParams,
  normalizeProceduralControlValue,
  normalizeProceduralParamsManifest,
  notifyProceduralParamsChanged,
  postProceduralParamsApi,
  proceduralElementDefinition,
  setProceduralParamValue,
} from "./proceduralParams.js";
import {
  BIOME_RECIPES_VERSION,
  applyBiomeRecipeToProceduralParams,
  detectBiomeRecipePersistence,
  fallbackBiomeRecipe,
  loadBiomeRecipes,
  normalizeBiomeRecipe,
  notifyBiomeRecipesChanged,
  postBiomeRecipeApi,
  subscribeBiomeRecipesChanged,
} from "./biomeRecipes.js";
import {
  FINE_GRASS_BAKES_VERSION,
  detectFineGrassBakePersistence,
  fineGrassBakeBiomeFromRecipe,
  fineGrassBakeDescriptor,
  notifyFineGrassBakesChanged,
  postFineGrassBakeApi,
} from "./fineGrassBakes.js";
import {
  fallbackElementCatalog,
  loadElementCatalog,
} from "./elementCatalog.js";
import {
  createFbmNoiseSalts,
  hashNoiseValue,
} from "./noiseHash.js";
import { currentLabLanguage, translateLabText } from "./labI18n.js";

const LAB_VERSION = `${PROP_ASSET_VERSION}+${PROCEDURAL_PARAMS_VERSION}+${BIOME_RECIPES_VERSION}+${FINE_GRASS_BAKES_VERSION}+${LAB_BUILD_TAG}`;
const SPRITE_PROP_CATEGORY_BY_VALUE = Object.fromEntries(
  propStoreCategories().map((category) => [propStoreDefinition(category).propValue, category]),
);

const seedInput = document.querySelector("#seedInput");
const randomizeButton = document.querySelector("#randomizeButton");
const materialSeedControls = document.querySelector("#materialSeedControls");
const materialLatestWarning = document.querySelector("#materialLatestWarning");
const materialLabCanvas = document.querySelector("#materialLabCanvas");
const materialModeSelect = document.querySelector("#materialModeSelect");
const materialSpriteModeButton = document.querySelector("#materialSpriteModeButton");
const materialProceduralModeButton = document.querySelector("#materialProceduralModeButton");
const materialWorkbench = document.querySelector("#materialWorkbench");
const materialPropSelect = document.querySelector("#materialPropSelect");
const materialCategoryFilter = document.querySelector("#materialCategoryFilter");
const materialAssetSearchInput = document.querySelector("#materialAssetSearchInput");
const materialAssetBrowser = document.querySelector("#materialAssetBrowser");
const spriteBrowserControls = document.querySelector("#spriteBrowserControls");
const proceduralBrowserControls = document.querySelector("#proceduralBrowserControls");
const proceduralSearchInput = document.querySelector("#proceduralSearchInput");
const proceduralGroupFilter = document.querySelector("#proceduralGroupFilter");
const proceduralStatusFilter = document.querySelector("#proceduralStatusFilter");
const proceduralElementBrowser = document.querySelector("#proceduralElementBrowser");
const materialBrowserTitle = document.querySelector("#materialBrowserTitle");
const materialBrowserSummary = document.querySelector("#materialBrowserSummary");
const materialShapeSelect = document.querySelector("#materialShapeSelect");
const materialBackgroundSelect = document.querySelector("#materialBackgroundSelect");
const materialPreviewModeSelect = document.querySelector("#materialPreviewModeSelect");
const materialZoomSelect = document.querySelector("#materialZoomSelect");
const materialCanvasViewport = document.querySelector("#materialCanvasViewport");
const materialSelectionTitle = document.querySelector("#materialSelectionTitle");
const materialSelectionMeta = document.querySelector("#materialSelectionMeta");
const materialScopeBadge = document.querySelector("#materialScopeBadge");
const materialGridToggle = document.querySelector("#materialGridToggle");
const materialFootprintToggle = document.querySelector("#materialFootprintToggle");
const materialShadowToggle = document.querySelector("#materialShadowToggle");
const materialFootGrassToggle = document.querySelector("#materialFootGrassToggle");
const materialLabStatus = document.querySelector("#materialLabStatus");
const materialPreviewSummary = document.querySelector("#materialPreviewSummary");
const materialSpriteEditor = document.querySelector("#materialSpriteEditor");
const materialInspectorResizeHandle = document.querySelector("#materialInspectorResizeHandle");
const materialCopyAssetIdButton = document.querySelector("#materialCopyAssetIdButton");
const materialSpriteSelect = document.querySelector("#materialSpriteSelect");
const materialShadowApplyButton = document.querySelector("#materialShadowApplyButton");
const materialCollisionApplyButton = document.querySelector("#materialCollisionApplyButton");
const materialFootprintApplyButton = document.querySelector("#materialFootprintApplyButton");
const materialTransformApplyButton = document.querySelector("#materialTransformApplyButton");
const materialShadowResetButton = document.querySelector("#materialShadowResetButton");
const materialCollisionResetButton = document.querySelector("#materialCollisionResetButton");
const materialFootprintResetButton = document.querySelector("#materialFootprintResetButton");
const materialTransformResetButton = document.querySelector("#materialTransformResetButton");
const materialShadowRollbackButton = document.querySelector("#materialShadowRollbackButton");
const materialShadowSaveStatus = document.querySelector("#materialShadowSaveStatus");
const materialSaveBadge = document.querySelector("#materialSaveBadge");
const materialDraftBadge = document.querySelector("#materialDraftBadge");
const materialRollbackBadge = document.querySelector("#materialRollbackBadge");
const materialShadowJson = document.querySelector("#materialShadowJson");
const materialStateSummary = document.querySelector("#materialStateSummary");
const materialDiffSummary = document.querySelector("#materialDiffSummary");
const materialApplyHistoryList = document.querySelector("#materialApplyHistory");
const materialCollisionSummary = document.querySelector("#materialCollisionSummary");
const materialCollisionGrid = document.querySelector("#materialCollisionGrid");
const materialCollisionExpandLeftButton = document.querySelector("#materialCollisionExpandLeftButton");
const materialCollisionExpandRightButton = document.querySelector("#materialCollisionExpandRightButton");
const materialCollisionExpandUpButton = document.querySelector("#materialCollisionExpandUpButton");
const materialCollisionExpandDownButton = document.querySelector("#materialCollisionExpandDownButton");
const materialCollisionTrimButton = document.querySelector("#materialCollisionTrimButton");
const proceduralEditor = document.querySelector("#proceduralEditor");
const proceduralElementSelect = document.querySelector("#proceduralElementSelect");
const proceduralBiomeSelect = document.querySelector("#proceduralBiomeSelect");
const proceduralScopeSelect = document.querySelector("#proceduralScopeSelect");
const proceduralApplyButton = document.querySelector("#proceduralApplyButton");
const proceduralResetButton = document.querySelector("#proceduralResetButton");
const proceduralRollbackButton = document.querySelector("#proceduralRollbackButton");
const proceduralBakeSection = document.querySelector("#proceduralBakeSection");
const proceduralBakeFineGrassButton = document.querySelector("#proceduralBakeFineGrassButton");
const proceduralBakeStatus = document.querySelector("#proceduralBakeStatus");
const proceduralSaveStatus = document.querySelector("#proceduralSaveStatus");
const proceduralSaveBadge = document.querySelector("#proceduralSaveBadge");
const proceduralDraftBadge = document.querySelector("#proceduralDraftBadge");
const proceduralRollbackBadge = document.querySelector("#proceduralRollbackBadge");
const proceduralStateSummary = document.querySelector("#proceduralStateSummary");
const proceduralDiffSummary = document.querySelector("#proceduralDiffSummary");
const proceduralApplyHistoryList = document.querySelector("#proceduralApplyHistory");
const proceduralControlGrid = document.querySelector("#proceduralControlGrid");
const proceduralParamsJson = document.querySelector("#proceduralParamsJson");
const materialUnsavedSummary = document.querySelector("#materialUnsavedSummary");
const materialSaveFeedback = document.querySelector("#materialSaveFeedback");
const materialUndoSaveButton = document.querySelector("#materialUndoSaveButton");
const materialDiscardChangesButton = document.querySelector("#materialDiscardChangesButton");
const materialReviewChangesButton = document.querySelector("#materialReviewChangesButton");
const materialSaveChangesButton = document.querySelector("#materialSaveChangesButton");
const materialReviewDialog = document.querySelector("#materialReviewDialog");
const materialReviewTitle = document.querySelector("#materialReviewTitle");
const materialReviewList = document.querySelector("#materialReviewList");
const materialReviewSaveButton = document.querySelector("#materialReviewSaveButton");
const materialNavigationDialog = document.querySelector("#materialNavigationDialog");
const materialNavigationMessage = document.querySelector("#materialNavigationMessage");
const materialNavigationCancelButton = document.querySelector("#materialNavigationCancelButton");
const materialNavigationDiscardButton = document.querySelector("#materialNavigationDiscardButton");
const materialNavigationSaveButton = document.querySelector("#materialNavigationSaveButton");
const labNavigationLinks = document.querySelectorAll(".lab-nav a:not([aria-current='page'])");
const spriteToolElements = document.querySelectorAll(".sprite-tool");
const materialShadowInputs = {
  x: {
    input: document.querySelector("#materialShadowXInput"),
    output: document.querySelector("#materialShadowXValue"),
    digits: 2,
  },
  y: {
    input: document.querySelector("#materialShadowYInput"),
    output: document.querySelector("#materialShadowYValue"),
    digits: 2,
  },
  w: {
    input: document.querySelector("#materialShadowWInput"),
    output: document.querySelector("#materialShadowWValue"),
    digits: 2,
  },
  h: {
    input: document.querySelector("#materialShadowHInput"),
    output: document.querySelector("#materialShadowHValue"),
    digits: 2,
  },
  angle: {
    input: document.querySelector("#materialShadowAngleInput"),
    output: document.querySelector("#materialShadowAngleValue"),
    digits: 2,
  },
  alpha: {
    input: document.querySelector("#materialShadowAlphaInput"),
    output: document.querySelector("#materialShadowAlphaValue"),
    digits: 2,
  },
  blur: {
    input: document.querySelector("#materialShadowBlurInput"),
    output: document.querySelector("#materialShadowBlurValue"),
    digits: 1,
  },
  round: {
    input: document.querySelector("#materialShadowRoundInput"),
    output: document.querySelector("#materialShadowRoundValue"),
    digits: 2,
  },
};
const materialFootprintInputs = {
  w: {
    input: document.querySelector("#materialFootprintWInput"),
    output: document.querySelector("#materialFootprintWValue"),
  },
  h: {
    input: document.querySelector("#materialFootprintHInput"),
    output: document.querySelector("#materialFootprintHValue"),
  },
};
const materialTransformInputs = {
  anchorX: {
    input: document.querySelector("#materialAnchorXInput"),
    output: document.querySelector("#materialAnchorXValue"),
    digits: 2,
  },
  anchorY: {
    input: document.querySelector("#materialAnchorYInput"),
    output: document.querySelector("#materialAnchorYValue"),
    digits: 2,
  },
  scale: {
    input: document.querySelector("#materialScaleInput"),
    output: document.querySelector("#materialScaleValue"),
    digits: 2,
  },
};
const materialRangeNumberInputs = new WeakMap();
const MATERIAL_INSPECTOR_WIDTH_STORAGE_KEY = "procedural-tilemap-lab.material-inspector.width";

let largeRockSpriteAssets = [];
let largeRockSpriteStatus = "sprite props loading";
let treeSpriteAssets = [];
let treeSpriteStatus = "tree props loading";
let activeMaterialMode = "spriteProps";
let activeMaterialProp = "spriteLargeRock";
let activeProceduralScope = "global";
let selectedMaterialSpriteIds = {
  rocks: null,
  trees: null,
};
let shadowSaveStatusNote = "save mode checking";
const shadowDraftDirtyIds = new Set();
const collisionDraftDirtyIds = new Set();
const footprintDraftDirtyIds = new Set();
const transformDraftDirtyIds = new Set();
const SPRITE_PROP_APPLY_HISTORY_LIMIT = 8;
const spritePropApplyHistory = [];
let activeSpritePropSaveCategory = null;
let propsPersistence = {
  mode: "checking",
  collisionMode: "checking",
  footprintMode: "checking",
  transformMode: "checking",
  batchMode: "checking",
  serverVersion: "checking",
  serverCurrent: false,
  rollbackAvailable: false,
};
let materialSaveInProgress = false;
let pendingMaterialTransition = null;
let elementCatalog = fallbackElementCatalog();
let materialSaveFeedbackNote = "Edits remain local drafts until you save them.";
let materialInspectorWidth = clampMaterialInspectorWidth(readMaterialInspectorWidth());

let proceduralParams = null;
let proceduralAppliedParams = null;
let selectedProceduralElementId = PROCEDURAL_ELEMENT_DEFINITIONS[0]?.id ?? null;
let proceduralBiomeRecipes = [fallbackBiomeRecipe()];
let proceduralAppliedBiomeRecipes = [fallbackBiomeRecipe()];
let selectedProceduralBiomeId = "grassland";
let unsubscribeBiomeRecipesChanged = null;
const biomeOverrideDirtyElementIds = new Set();
let proceduralSaveStatusNote = "save mode checking";
let biomeRecipeSaveStatusNote = "biome recipe save mode checking";
let fineGrassBakeStatusNote = "fine-grass bake mode checking";
const proceduralDirtyElementIds = new Set();
const PROCEDURAL_APPLY_HISTORY_LIMIT = 8;
const proceduralApplyHistory = [];
let materialLabRenderFrame = 0;
let proceduralDraftRenderFrame = 0;
let proceduralPersistence = {
  mode: "checking",
  paramsMode: "checking",
  serverVersion: "checking",
  serverCurrent: false,
  rollbackAvailable: false,
};
let biomeRecipePersistence = {
  mode: "checking",
  recipeMode: "checking",
  serverVersion: "checking",
  serverCurrent: false,
  rollbackAvailableById: {},
  note: "biome recipe save mode checking",
};
let fineGrassBakePersistence = {
  mode: "checking",
  serverVersion: "checking",
  serverCurrent: false,
  note: "fine-grass bake mode checking",
};

function currentSeed() {
  return Number(seedInput.value) || 1;
}

function currentMaterialSeed() {
  return hashSeed(currentSeed(), "material-lab");
}

function currentMode() {
  return activeMaterialMode === "proceduralElements" ? "proceduralElements" : "spriteProps";
}

function currentPreviewMode() {
  const value = materialPreviewModeSelect?.value;
  return value === "beforeAfter" ? "beforeAfter" : "selectedOnly";
}

function labUiText(source) {
  return translateLabText(source, currentLabLanguage());
}

function readMaterialInspectorWidth() {
  try {
    return globalThis.localStorage?.getItem(MATERIAL_INSPECTOR_WIDTH_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function clampMaterialInspectorWidth(value) {
  if (value === "" || value === null || value === undefined) return 390;
  const width = Number(value);
  return Number.isFinite(width) ? Math.min(560, Math.max(340, Math.round(width))) : 390;
}

function setMaterialInspectorWidth(value, { persist = false } = {}) {
  materialInspectorWidth = clampMaterialInspectorWidth(value);
  materialWorkbench.style.setProperty("--material-inspector-width", `${materialInspectorWidth}px`);
  materialInspectorResizeHandle.setAttribute("aria-valuenow", String(materialInspectorWidth));
  if (!persist) return;
  try {
    globalThis.localStorage?.setItem(MATERIAL_INSPECTOR_WIDTH_STORAGE_KEY, String(materialInspectorWidth));
  } catch {}
}

function beginMaterialInspectorResize(event) {
  if (event.button !== 0 || globalThis.matchMedia?.("(max-width: 1180px)").matches) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = materialInspectorWidth;
  document.body.classList.add("is-resizing-panel");
  const move = (moveEvent) => setMaterialInspectorWidth(startWidth + startX - moveEvent.clientX);
  const end = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", end);
    document.removeEventListener("pointercancel", end);
    document.body.classList.remove("is-resizing-panel");
    setMaterialInspectorWidth(materialInspectorWidth, { persist: true });
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", end);
  document.addEventListener("pointercancel", end);
}

function handleMaterialInspectorResizeKey(event) {
  if (event.key === "Home") {
    event.preventDefault();
    event.stopPropagation();
    setMaterialInspectorWidth(390, { persist: true });
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  event.stopPropagation();
  setMaterialInspectorWidth(materialInspectorWidth + (event.key === "ArrowLeft" ? 20 : -20), { persist: true });
}

function collisionPersistsToJson() {
  return propsPersistence.mode === "json" && propsPersistence.collisionMode === "json" && propsPersistence.serverCurrent === true;
}

function footprintPersistsToJson() {
  return propsPersistence.mode === "json" && propsPersistence.footprintMode === "json" && propsPersistence.serverCurrent === true;
}

function transformPersistsToJson() {
  return propsPersistence.mode === "json" && propsPersistence.transformMode === "json" && propsPersistence.serverCurrent === true;
}

function proceduralPersistsToJson() {
  return proceduralPersistence.mode === "json" && proceduralPersistence.paramsMode === "json" && proceduralPersistence.serverCurrent === true;
}

function biomeRecipePersistsToJson() {
  return biomeRecipePersistence.mode === "json" && biomeRecipePersistence.recipeMode === "json" && biomeRecipePersistence.serverCurrent === true;
}

function proceduralEditScope() {
  return activeProceduralScope === "biome" ? "biome" : "global";
}

function activeProceduralDirtyElementIds() {
  return proceduralEditScope() === "biome" ? biomeOverrideDirtyElementIds : proceduralDirtyElementIds;
}

function activeProceduralPersistsToJson() {
  return proceduralEditScope() === "biome" ? biomeRecipePersistsToJson() : proceduralPersistsToJson();
}

function collisionSaveModeLabel() {
  return collisionPersistsToJson() ? "props.json" : "unavailable";
}

function footprintSaveModeLabel() {
  return footprintPersistsToJson() ? "props.json" : "unavailable";
}

function transformSaveModeLabel() {
  return transformPersistsToJson() ? "props.json" : "unavailable";
}

async function reloadLargeRockSpriteAssets() {
  try {
    const result = await loadLargeRockSpriteAssets({
      previousSelectedId: selectedMaterialSpriteIds.rocks,
      onImageChange: (status) => {
        largeRockSpriteStatus = status;
        syncMaterialSpriteEditor();
        renderMaterialLab();
      },
    });
    largeRockSpriteAssets = result.assets;
    selectedMaterialSpriteIds.rocks = result.selectedId;
    largeRockSpriteStatus = result.status;
    shadowDraftDirtyIds.clear();
    collisionDraftDirtyIds.clear();
    footprintDraftDirtyIds.clear();
    transformDraftDirtyIds.clear();
  } catch (error) {
    largeRockSpriteAssets = [];
    selectedMaterialSpriteIds.rocks = null;
    shadowDraftDirtyIds.clear();
    collisionDraftDirtyIds.clear();
    footprintDraftDirtyIds.clear();
    transformDraftDirtyIds.clear();
    largeRockSpriteStatus = `sprite props error: ${error.message}`;
  }
  syncMaterialSpriteEditor();
  renderMaterialLab();
}

async function reloadTreeSpriteAssets() {
  try {
    const result = await loadTreeSpriteAssets({
      previousSelectedId: selectedMaterialSpriteIds.trees,
      onImageChange: (status) => {
        treeSpriteStatus = status;
        syncMaterialSpriteEditor();
        renderMaterialLab();
      },
    });
    treeSpriteAssets = result.assets;
    selectedMaterialSpriteIds.trees = result.selectedId;
    treeSpriteStatus = result.status;
    shadowDraftDirtyIds.clear();
    collisionDraftDirtyIds.clear();
    footprintDraftDirtyIds.clear();
    transformDraftDirtyIds.clear();
  } catch (error) {
    treeSpriteAssets = [];
    selectedMaterialSpriteIds.trees = null;
    shadowDraftDirtyIds.clear();
    collisionDraftDirtyIds.clear();
    footprintDraftDirtyIds.clear();
    transformDraftDirtyIds.clear();
    treeSpriteStatus = `tree props error: ${error.message}`;
  }
  syncMaterialSpriteEditor();
  renderMaterialLab();
}

async function reloadProceduralParams() {
  try {
    proceduralParams = await loadProceduralParams({
      useBrowserOverrides: false,
    });
    proceduralAppliedParams = cloneProceduralParamsManifest(proceduralParams);
    proceduralDirtyElementIds.clear();
  } catch (error) {
    proceduralParams = null;
    proceduralAppliedParams = null;
    proceduralDirtyElementIds.clear();
    proceduralSaveStatusNote = `params error: ${error.message}`;
  }
  syncProceduralEditor();
  renderMaterialLab();
}

async function reloadBiomeRecipes() {
  try {
    const index = await loadBiomeRecipes();
    proceduralBiomeRecipes = index.recipes;
    proceduralAppliedBiomeRecipes = index.recipes.map((recipe) => JSON.parse(JSON.stringify(recipe)));
    selectedProceduralBiomeId = proceduralBiomeRecipes.some((recipe) => recipe.id === selectedProceduralBiomeId)
      ? selectedProceduralBiomeId
      : index.defaultBiome;
    biomeOverrideDirtyElementIds.clear();
  } catch (error) {
    const fallback = fallbackBiomeRecipe();
    proceduralBiomeRecipes = [fallback];
    proceduralAppliedBiomeRecipes = [JSON.parse(JSON.stringify(fallback))];
    selectedProceduralBiomeId = fallback.id;
    biomeOverrideDirtyElementIds.clear();
    biomeRecipeSaveStatusNote = `biome recipe error: ${error.message}`;
  }
  syncProceduralEditor();
  renderMaterialLab();
}

async function reloadElementCatalog() {
  try {
    elementCatalog = await loadElementCatalog();
  } catch {
    elementCatalog = fallbackElementCatalog();
  }
  renderMaterialBrowser();
}

function renderMaterialLab() {
  cancelScheduledMaterialLabRender();
  cancelScheduledProceduralDraftPreview();
  syncModeUi();
  if (currentMode() === "proceduralElements") {
    renderProceduralMode();
    renderMaterialBrowser();
    updateMaterialWorkspaceChrome();
    return;
  }
  renderSpritePropMode();
  renderMaterialBrowser();
  updateMaterialWorkspaceChrome();
}

function materialLabVisualSmokeSnapshot() {
  const mode = currentMode();
  const canvas = canvasVisualSmokeSummary(materialLabCanvas);
  const asset = selectedMaterialSpriteAsset();
  const definition = selectedProceduralDefinition();
  return {
    ok: canvas.ok && materialLabStatus.textContent.includes(mode === "proceduralElements" ? "procedural elements" : "sprite props"),
    page: "material-lab",
    version: LAB_VERSION,
    mode,
    previewMode: currentPreviewMode(),
    canvas,
    statusText: materialLabStatus.textContent,
    sprite: {
      prop: activeMaterialProp,
      category: currentSpriteCategory(),
      assetId: asset?.id ?? null,
      assetLabel: asset?.label ?? null,
      editorVisible: !materialSpriteEditor.hidden,
      stateSummary: materialStateSummary.textContent,
      diffSummary: materialDiffSummary.textContent,
    },
    procedural: {
      element: definition?.id ?? null,
      biome: proceduralBiomeSelect.value,
      scope: proceduralEditScope(),
      editorVisible: !proceduralEditor.hidden,
      stateSummary: proceduralStateSummary.textContent,
      diffSummary: proceduralDiffSummary.textContent,
    },
  };
}

function scheduleMaterialLabRender() {
  if (materialLabRenderFrame) return;
  materialLabRenderFrame = requestLabFrame(() => {
    materialLabRenderFrame = 0;
    renderMaterialLab();
  });
}

function cancelScheduledMaterialLabRender() {
  if (!materialLabRenderFrame) return;
  cancelLabFrame(materialLabRenderFrame);
  materialLabRenderFrame = 0;
}

function syncMaterialPropOptions() {
  const current = activeMaterialProp || "spriteLargeRock";
  materialPropSelect.replaceChildren();
  for (const category of propStoreCategories()) {
    const store = propStoreDefinition(category);
    const option = document.createElement("option");
    option.value = store.propValue;
    option.textContent = store.label;
    materialPropSelect.append(option);
  }
  activeMaterialProp = [...materialPropSelect.options].some((option) => option.value === current)
    ? current
    : "spriteLargeRock";
  materialPropSelect.value = activeMaterialProp;
}

function syncModeUi() {
  const proceduralMode = currentMode() === "proceduralElements";
  materialModeSelect.value = currentMode();
  materialSpriteModeButton.setAttribute("aria-selected", proceduralMode ? "false" : "true");
  materialProceduralModeButton.setAttribute("aria-selected", proceduralMode ? "true" : "false");
  materialSpriteModeButton.tabIndex = proceduralMode ? -1 : 0;
  materialProceduralModeButton.tabIndex = proceduralMode ? 0 : -1;
  materialWorkbench.setAttribute("aria-labelledby", proceduralMode ? "materialProceduralModeButton" : "materialSpriteModeButton");
  spriteBrowserControls.hidden = proceduralMode;
  proceduralBrowserControls.hidden = !proceduralMode;
  for (const element of spriteToolElements) element.hidden = proceduralMode;
  materialSpriteEditor.hidden = proceduralMode || !isSpriteManifestProp();
  proceduralEditor.hidden = !proceduralMode;
  materialSeedControls.hidden = !proceduralMode;
  proceduralScopeSelect.value = activeProceduralScope;
  materialPropSelect.value = activeMaterialProp;
}

function renderMaterialBrowser() {
  if (currentMode() === "proceduralElements") {
    renderProceduralElementBrowser();
    return;
  }
  renderSpriteAssetBrowser();
}

function renderSpriteAssetBrowser() {
  const search = materialAssetSearchInput.value.trim().toLowerCase();
  const categoryFilter = materialCategoryFilter.value;
  const shapeFilter = materialShapeSelect.value;
  const entries = propStoreCategories().flatMap((category) => {
    const store = propStoreDefinition(category);
    const assets = category === "trees" ? treeSpriteAssets : largeRockSpriteAssets;
    return assets.map((asset) => ({ ...asset, category, store }));
  }).filter((entry) => {
    if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
    if (shapeFilter !== "all" && String(entry.shape ?? "") !== shapeFilter) return false;
    if (search && !`${entry.id} ${entry.label ?? ""}`.toLowerCase().includes(search)) return false;
    return true;
  });

  materialBrowserTitle.textContent = "Prop library";
  materialBrowserSummary.textContent = currentLabLanguage() === "ja"
    ? `${entries.length}件（岩${largeRockSpriteAssets.length}・樹木${treeSpriteAssets.length}）`
    : `${entries.length} visible / rocks ${largeRockSpriteAssets.length} / trees ${treeSpriteAssets.length}`;
  materialAssetBrowser.replaceChildren();
  if (entries.length === 0) {
    materialAssetBrowser.append(materialBrowserEmpty("No sprite assets match these filters."));
    return;
  }
  for (const entry of entries) {
    const selected = currentSpriteCategory() === entry.category
      && selectedMaterialSpriteIds[entry.category] === entry.id
      && isSpriteManifestProp();
    const dirty = spriteAssetHasDraft(entry.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "material-browser-item";
    button.dataset.assetId = entry.id;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", selected ? "true" : "false");
    if (selected) button.classList.add("is-selected");
    if (dirty) button.classList.add("is-dirty");

    const thumb = document.createElement("span");
    thumb.className = "material-browser-thumb";
    const image = document.createElement("img");
    image.src = `${entry.store.basePath}${entry.file}`;
    image.alt = "";
    thumb.append(image);
    const copy = document.createElement("span");
    copy.className = "material-browser-copy";
    const label = document.createElement("strong");
    const englishLabel = entry.label ?? entry.id;
    label.textContent = labUiText(englishLabel);
    const meta = document.createElement("small");
    meta.textContent = currentLabLanguage() === "ja"
      ? `${englishLabel} · ${entry.id}`
      : `${entry.category} / ${entry.id}`;
    meta.title = entry.id;
    copy.append(label, meta);
    const states = document.createElement("span");
    states.className = "material-browser-states";
    const sourceType = document.createElement("span");
    sourceType.className = "material-browser-state is-source-type";
    sourceType.textContent = labUiText("Sprite");
    states.append(sourceType);
    if (dirty) states.append(materialBrowserDraftState());
    button.append(thumb, copy, states);
    button.addEventListener("click", () => selectSpriteBrowserAsset(entry.category, entry.id));
    materialAssetBrowser.append(button);
  }
}

function renderProceduralElementBrowser() {
  const entries = proceduralBrowserEntries();
  syncProceduralGroupFilter(entries);
  const search = proceduralSearchInput.value.trim().toLowerCase();
  const groupFilter = proceduralGroupFilter.value;
  const statusFilter = proceduralStatusFilter.value;
  const visible = entries.filter((entry) => {
    if (groupFilter !== "all" && entry.group !== groupFilter) return false;
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (search && !`${entry.id} ${entry.label}`.toLowerCase().includes(search)) return false;
    return true;
  });
  materialBrowserTitle.textContent = "Element catalog";
  materialBrowserSummary.textContent = `${visible.length} visible / ${entries.filter((entry) => entry.status === "wired").length} wired / ${entries.filter((entry) => entry.status === "planned").length} planned`;
  proceduralElementBrowser.replaceChildren();
  if (visible.length === 0) {
    proceduralElementBrowser.append(materialBrowserEmpty("No procedural elements match these filters."));
    return;
  }
  const dirtySet = activeProceduralDirtyElementIds();
  for (const entry of visible) {
    const definition = proceduralElementDefinition(entry.id);
    const selected = definition && selectedProceduralElementId === entry.id;
    const dirty = dirtySet.has(entry.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "material-browser-item";
    button.dataset.elementId = entry.id;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.disabled = !definition;
    if (selected) button.classList.add("is-selected");
    if (dirty) button.classList.add("is-dirty");
    const thumb = document.createElement("span");
    thumb.className = "material-browser-thumb";
    thumb.textContent = entry.group.slice(0, 3).toUpperCase();
    const copy = document.createElement("span");
    copy.className = "material-browser-copy";
    const label = document.createElement("strong");
    label.textContent = entry.label;
    const meta = document.createElement("small");
    meta.textContent = `${entry.group} / ${entry.lab}`;
    copy.append(label, meta);
    const state = document.createElement("span");
    state.className = "material-browser-state";
    state.textContent = dirty ? "Unsaved" : definition ? "Wired" : entry.status === "planned" ? "Planned" : "Code only";
    button.append(thumb, copy, state);
    if (definition) {
      button.addEventListener("click", () => {
        selectedProceduralElementId = entry.id;
        proceduralElementSelect.value = entry.id;
        syncProceduralEditor();
        renderMaterialLab();
      });
    }
    proceduralElementBrowser.append(button);
  }
}

function proceduralBrowserEntries() {
  const catalogEntries = elementCatalog.elements
    .filter((entry) => entry.kind === "procedural")
    .map((entry) => ({
      ...entry,
      label: proceduralElementDefinition(entry.id)?.label ?? entry.id,
    }));
  const known = new Set(catalogEntries.map((entry) => entry.id));
  for (const definition of PROCEDURAL_ELEMENT_DEFINITIONS) {
    if (known.has(definition.id)) continue;
    catalogEntries.push({
      id: definition.id,
      label: definition.label,
      group: definition.group,
      status: "wired",
      lab: "procedural-elements",
      kind: "procedural",
    });
  }
  return catalogEntries.sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

function syncProceduralGroupFilter(entries) {
  const current = proceduralGroupFilter.value || "all";
  const groups = [...new Set(entries.map((entry) => entry.group))].sort((a, b) => a.localeCompare(b));
  const signature = [...proceduralGroupFilter.options].map((option) => option.value).join("|");
  const nextSignature = ["all", ...groups].join("|");
  if (signature === nextSignature) return;
  proceduralGroupFilter.replaceChildren(new Option("All groups", "all"));
  for (const group of groups) proceduralGroupFilter.append(new Option(group, group));
  proceduralGroupFilter.value = groups.includes(current) ? current : "all";
}

function materialBrowserEmpty(message) {
  const empty = document.createElement("div");
  empty.className = "material-browser-empty";
  empty.textContent = message;
  return empty;
}

function materialBrowserDraftState() {
  const state = document.createElement("span");
  state.className = "material-browser-state is-draft-state";
  state.textContent = labUiText("Unsaved");
  return state;
}

function updateMaterialBrowserDraftMarkers() {
  if (currentMode() === "proceduralElements") {
    const dirtySet = activeProceduralDirtyElementIds();
    for (const item of proceduralElementBrowser.querySelectorAll(".material-browser-item")) {
      const dirty = dirtySet.has(item.dataset.elementId);
      item.classList.toggle("is-dirty", dirty);
      const state = item.querySelector(".material-browser-state");
      if (dirty && state) state.textContent = "Unsaved";
    }
    return;
  }
  for (const item of materialAssetBrowser.querySelectorAll(".material-browser-item")) {
    const dirty = spriteAssetHasDraft(item.dataset.assetId);
    item.classList.toggle("is-dirty", dirty);
    const states = item.querySelector(".material-browser-states");
    const draftState = item.querySelector(".material-browser-state.is-draft-state");
    if (dirty && states && !draftState) states.append(materialBrowserDraftState());
    if (!dirty) draftState?.remove();
  }
}

function updateMaterialWorkspaceChrome() {
  const proceduralMode = currentMode() === "proceduralElements";
  if (proceduralMode) {
    const definition = selectedProceduralDefinition();
    const state = currentProceduralEditorState(definition);
    materialSelectionTitle.textContent = definition?.label ?? "Select an element";
    materialSelectionMeta.textContent = definition
      ? `${definition.group} / ${state.targetLabel} / ${state.selectedDirty ? "unsaved draft" : "saved values"}`
      : "Choose a wired element from the browser.";
    setStatusBadge(materialScopeBadge, state.scope === "biome" ? `Environment: ${state.targetLabel}` : "Global defaults", state.hasDraft ? "is-draft" : "is-muted");
  } else {
    const asset = selectedMaterialSpriteAsset();
    if (!isSpriteManifestProp()) {
      materialSelectionTitle.textContent = labUiText("Generated large rock");
      materialSelectionMeta.textContent = "Code-generated preview; there is no editable sprite manifest for this source.";
      setStatusBadge(materialScopeBadge, "Read-only preview", "is-muted");
    } else {
      materialSelectionTitle.textContent = asset ? labUiText(asset.label ?? asset.id) : labUiText("Select a sprite asset");
      materialSelectionMeta.textContent = asset
        ? `${currentSpriteCategory()} / ${asset.id} / ${spriteAssetHasDraft(asset.id) ? "unsaved draft" : "saved values"}`
        : "Choose a sprite asset from the browser.";
      setStatusBadge(materialScopeBadge, currentSpriteCategory() === "trees" ? "Trees" : "Rocks", spriteAssetHasDraft(asset?.id) ? "is-draft" : "is-muted");
    }
  }
  applyMaterialZoom();
  updateMaterialSaveBar();
}

function applyMaterialZoom() {
  if (!materialLabCanvas || !materialZoomSelect) return;
  const zoom = materialZoomSelect.value;
  if (zoom === "fit") {
    materialLabCanvas.style.width = "100%";
    return;
  }
  const scale = Number(zoom) || 1;
  materialLabCanvas.style.width = `${Math.round(materialLabCanvas.width * scale)}px`;
}

function renderSpritePropMode() {
  const startedAt = Date.now();
  syncMaterialSpriteEditor();
  const previewMode = currentPreviewMode();
  const info = previewMode === "beforeAfter" && isSpriteManifestProp()
    ? drawSpritePropBeforeAfterPreview(materialLabCanvas)
    : drawMaterialLabPreview(materialLabCanvas, spriteMaterialPreviewOptions(previewMode));
  const renderMs = Date.now() - startedAt;
  const shapeCount = new Set(info.samples.map((sample) => sample.shapeKind)).size;
  const propNote = info.prop === "spriteLargeRock"
    ? ` / ${largeRockSpriteStatus}`
    : info.prop === "spriteTrees"
      ? ` / ${treeSpriteStatus}`
      : "";
  const previewNote = previewMode === "beforeAfter" ? " / before-after" : previewMode === "selectedOnly" ? " / selected-only" : "";
  materialLabStatus.textContent = `${LAB_VERSION} / sprite props / ${info.prop} / ${info.shape} / ${info.background}${previewNote} / ${shapeCount} shape groups / ${info.samples.length} samples${propNote} / ${renderMs}ms`;
  const background = materialBackgroundSelect.options[materialBackgroundSelect.selectedIndex]?.textContent ?? info.background;
  const asset = selectedMaterialSpriteAsset();
  const assetLabel = asset ? labUiText(asset.label ?? asset.id) : labUiText("No sprite prop selected");
  const viewLabel = labUiText(previewMode === "beforeAfter" ? "Compare changes" : "Selected material");
  materialPreviewSummary.textContent = currentLabLanguage() === "ja"
    ? `${viewLabel}｜${assetLabel}｜背景：${background}｜表示時間：${renderMs} ms`
    : `${viewLabel} · ${assetLabel} · ${background} · ${renderMs} ms`;
}

function spriteMaterialPreviewOptions(previewMode = currentPreviewMode(), source = "current") {
  return {
    seed: currentMaterialSeed(),
    prop: activeMaterialProp,
    shape: materialShapeSelect.value,
    background: materialBackgroundSelect.value,
    showGrid: materialGridToggle.checked,
    showFootprint: materialFootprintToggle.checked,
    showShadow: materialShadowToggle.checked,
    showFootGrass: materialFootGrassToggle.checked,
    spriteRocks: spritePreviewAssets("rocks", true, source),
    spriteTrees: spritePreviewAssets("trees", true, source),
    selectedSpriteRockId: selectedMaterialSpriteIds.rocks,
    selectedSpriteTreeId: selectedMaterialSpriteIds.trees,
  };
}

function spritePreviewAssets(category, selectedOnly, source) {
  const assets = category === "trees" ? treeSpriteAssets : largeRockSpriteAssets;
  const selectedId = selectedMaterialSpriteIds[category];
  const scoped = selectedOnly && selectedId
    ? assets.filter((asset) => asset.id === selectedId)
    : assets;
  if (source !== "applied") return scoped;
  return scoped.map(spriteAppliedPreviewAsset);
}

function spriteAppliedPreviewAsset(asset) {
  if (!asset) return asset;
  const footprint = normalizeClientFootprint(asset.appliedFootprint);
  const collisionBounds = normalizeClientCollisionBounds(asset.appliedCollisionBounds, footprint, asset.appliedCollisionTiles, asset.appliedCollision);
  const collisionTiles = normalizeClientCollisionTiles(asset.appliedCollisionTiles, footprint, asset.appliedCollision, collisionBounds);
  return {
    ...asset,
    shadow: normalizeClientShadow(asset.appliedShadow),
    footprint,
    collision: asset.appliedCollision ?? asset.collision,
    collisionBounds,
    collisionTiles,
    anchor: normalizeClientAnchor(asset.appliedAnchor),
    scale: normalizeClientScale(asset.appliedScale),
  };
}

function drawSpritePropBeforeAfterPreview(canvas) {
  const before = drawSpritePreviewToTempCanvas("applied");
  const after = drawSpritePreviewToTempCanvas("current");
  drawBeforeAfterSplit(canvas, before.canvas, after.canvas, "Applied", "Draft");
  return {
    ...after.info,
    samples: after.info.samples,
  };
}

function drawSpritePreviewToTempCanvas(source) {
  const canvas = document.createElement("canvas");
  canvas.width = materialLabCanvas.width;
  canvas.height = materialLabCanvas.height;
  const info = drawMaterialLabPreview(canvas, spriteMaterialPreviewOptions("beforeAfter", source));
  return { canvas, info };
}

function renderProceduralMode() {
  const startedAt = Date.now();
  syncProceduralEditor();
  drawMaterialProceduralPreview(materialLabCanvas);
  const renderMs = Date.now() - startedAt;
  const dirtySet = activeProceduralDirtyElementIds();
  const dirtyNote = dirtySet.size > 0 ? ` / dirty ${[...dirtySet].join(",")}` : "";
  const scopeNote = proceduralEditScope() === "biome" ? `biome:${selectedProceduralRecipe().id}` : "global";
  const previewMode = currentPreviewMode();
  const previewNote = previewMode === "beforeAfter" ? " / before-after" : "";
  materialLabStatus.textContent = `${LAB_VERSION} / procedural elements / ${scopeNote} / ${selectedProceduralElementId ?? "none"} / ${materialBackgroundSelect.value}${previewNote}${dirtyNote} / ${renderMs}ms`;
  updateProceduralPreviewSummary(renderMs);
}

function renderProceduralDraftPreview() {
  cancelScheduledProceduralDraftPreview();
  const startedAt = Date.now();
  drawMaterialProceduralPreview(materialLabCanvas);
  const renderMs = Date.now() - startedAt;
  const dirtySet = activeProceduralDirtyElementIds();
  const dirtyNote = dirtySet.size > 0 ? ` / dirty ${[...dirtySet].join(",")}` : "";
  const scopeNote = proceduralEditScope() === "biome" ? `biome:${selectedProceduralRecipe().id}` : "global";
  const previewMode = currentPreviewMode();
  const previewNote = previewMode === "beforeAfter" ? " / before-after" : "";
  materialLabStatus.textContent = `${LAB_VERSION} / procedural elements / ${scopeNote} / ${selectedProceduralElementId ?? "none"} / ${materialBackgroundSelect.value}${previewNote}${dirtyNote} / ${renderMs}ms`;
  updateProceduralPreviewSummary(renderMs);
}

function updateProceduralPreviewSummary(renderMs) {
  const background = materialBackgroundSelect.options[materialBackgroundSelect.selectedIndex]?.textContent ?? materialBackgroundSelect.value;
  const definition = selectedProceduralDefinition();
  const scope = proceduralEditScope() === "biome" ? selectedProceduralRecipe().label : "Global defaults";
  const label = definition?.label ?? "No procedural element selected";
  materialPreviewSummary.textContent = currentLabLanguage() === "ja"
    ? `${background}｜適用範囲：${labUiText(scope)}｜素材：${labUiText(label)}｜表示時間：${renderMs} ms`
    : `${background} · scope ${scope} · ${label} · ${renderMs} ms`;
}

function scheduleProceduralDraftPreview() {
  if (proceduralDraftRenderFrame) return;
  proceduralDraftRenderFrame = requestLabFrame(() => {
    proceduralDraftRenderFrame = 0;
    renderProceduralDraftPreview();
  });
}

function cancelScheduledProceduralDraftPreview() {
  if (!proceduralDraftRenderFrame) return;
  cancelLabFrame(proceduralDraftRenderFrame);
  proceduralDraftRenderFrame = 0;
}

function requestLabFrame(callback) {
  if (typeof globalThis.requestAnimationFrame === "function") return globalThis.requestAnimationFrame(callback);
  return globalThis.setTimeout(callback, 16);
}

function cancelLabFrame(frame) {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frame);
    return;
  }
  globalThis.clearTimeout(frame);
}

function isSpriteManifestProp() {
  return Boolean(SPRITE_PROP_CATEGORY_BY_VALUE[activeMaterialProp]);
}

function currentSpriteCategory() {
  return SPRITE_PROP_CATEGORY_BY_VALUE[activeMaterialProp] ?? "rocks";
}

function currentSpriteAssets() {
  return currentSpriteCategory() === "trees" ? treeSpriteAssets : largeRockSpriteAssets;
}

function selectedMaterialSpriteAsset() {
  const assets = currentSpriteAssets();
  const selectedId = selectedMaterialSpriteIds[currentSpriteCategory()];
  return assets.find((asset) => asset.id === selectedId) ?? assets[0] ?? null;
}

function currentSpritePropEditorState(asset = selectedMaterialSpriteAsset()) {
  const dirtyCategories = asset ? spritePropDirtyCategories(asset) : [];
  const saving = activeSpritePropSaveCategory !== null;
  const canApplyByCategory = {
    shadow: Boolean(asset && !saving && shadowDraftDirtyIds.has(asset.id) && propsPersistence.serverCurrent === true),
    footprint: Boolean(asset && !saving && footprintDraftDirtyIds.has(asset.id) && footprintPersistsToJson()),
    collision: Boolean(asset && !saving && collisionDraftDirtyIds.has(asset.id) && collisionPersistsToJson() && !footprintDraftDirtyIds.has(asset.id)),
    transform: Boolean(asset && !saving && transformDraftDirtyIds.has(asset.id) && transformPersistsToJson()),
  };
  const hasDraft = dirtyCategories.length > 0;
  const canApply = Object.values(canApplyByCategory).some(Boolean);
  const canRollback = Boolean(asset && !saving && propsPersistence.mode === "json" && propsPersistence.rollbackAvailable);
  const checking = propsPersistence.mode === "checking";
  let state = "loading";
  if (asset && hasDraft) state = canApply ? "draft" : "draft-blocked";
  else if (asset && canRollback) state = "rollback-ready";
  else if (asset && checking) state = "checking";
  else if (asset && propsPersistence.serverCurrent !== true) state = "unavailable";
  else if (asset) state = "applied";
  return {
    state,
    asset,
    assetId: asset?.id ?? null,
    assetLabel: asset?.label ?? asset?.id ?? "none",
    category: currentSpriteCategory(),
    dirtyCategories,
    dirtyCount: dirtyCategories.length,
    hasDraft,
    canApply,
    canApplyByCategory,
    canRollback,
    checking,
    rollbackAvailable: Boolean(propsPersistence.rollbackAvailable),
    saveMode: propsPersistence.serverCurrent === true ? "props.json" : "unavailable",
    serverVersion: propsPersistence.serverVersion,
    expectedVersion: PROP_ASSET_VERSION,
    collisionBlockedByFootprint: Boolean(asset && collisionDraftDirtyIds.has(asset.id) && footprintDraftDirtyIds.has(asset.id)),
    activeSaveCategory: activeSpritePropSaveCategory,
  };
}

function spritePropDirtyCategories(asset) {
  if (!asset) return [];
  return [
    shadowDraftDirtyIds.has(asset.id) ? "shadow" : null,
    footprintDraftDirtyIds.has(asset.id) ? "footprint" : null,
    collisionDraftDirtyIds.has(asset.id) ? "collision" : null,
    transformDraftDirtyIds.has(asset.id) ? "transform" : null,
  ].filter(Boolean);
}

function spriteAssetHasDraft(assetId) {
  if (!assetId) return false;
  return shadowDraftDirtyIds.has(assetId)
    || collisionDraftDirtyIds.has(assetId)
    || footprintDraftDirtyIds.has(assetId)
    || transformDraftDirtyIds.has(assetId);
}

function currentSpriteDirtyAssets() {
  if (!isSpriteManifestProp()) return [];
  return currentSpriteAssets().filter((asset) => spriteAssetHasDraft(asset.id));
}

function currentDraftState() {
  if (currentMode() === "proceduralElements") {
    const state = currentProceduralEditorState();
    return {
      mode: "proceduralElements",
      count: state.dirtyCount,
      hasDraft: state.hasDraft,
      canSave: state.canApply && !materialSaveInProgress,
      canRollback: state.canRollback && !materialSaveInProgress,
      unit: state.dirtyCount === 1 ? "element" : "elements",
      target: state.targetLabel,
    };
  }
  const dirtyAssets = currentSpriteDirtyAssets();
  return {
    mode: "spriteProps",
    count: dirtyAssets.length,
    hasDraft: dirtyAssets.length > 0,
    canSave: dirtyAssets.length > 0 && propsPersistence.serverCurrent === true && !materialSaveInProgress,
    canRollback: Boolean(propsPersistence.rollbackAvailable && propsPersistence.mode === "json" && !materialSaveInProgress),
    unit: dirtyAssets.length === 1 ? "asset" : "assets",
    target: currentSpriteCategory(),
  };
}

function hasAnyMaterialDraft() {
  return shadowDraftDirtyIds.size > 0
    || collisionDraftDirtyIds.size > 0
    || footprintDraftDirtyIds.size > 0
    || transformDraftDirtyIds.size > 0
    || proceduralDirtyElementIds.size > 0
    || biomeOverrideDirtyElementIds.size > 0;
}

function syncSpritePropActionButtons(asset = selectedMaterialSpriteAsset(), state = currentSpritePropEditorState(asset)) {
  const hasAsset = Boolean(asset);
  materialShadowApplyButton.disabled = !hasAsset || !state.canApplyByCategory.shadow;
  materialFootprintApplyButton.disabled = !hasAsset || !state.canApplyByCategory.footprint;
  materialCollisionApplyButton.disabled = !hasAsset || !state.canApplyByCategory.collision;
  materialTransformApplyButton.disabled = !hasAsset || !state.canApplyByCategory.transform;
  materialShadowResetButton.disabled = !hasAsset;
  materialCollisionResetButton.disabled = !hasAsset;
  materialFootprintResetButton.disabled = !hasAsset;
  materialTransformResetButton.disabled = !hasAsset;
  materialShadowRollbackButton.disabled = !state.canRollback;
}

function spritePropDiffEntries(asset, categories = spritePropDirtyCategories(asset)) {
  if (!asset) return [];
  return categories.flatMap((category) => spritePropDiffEntriesForCategory(asset, category));
}

function spritePropDiffEntriesForCategory(asset, category) {
  if (!asset) return [];
  if (category === "shadow") return spriteShadowDiffEntries(asset);
  if (category === "footprint") return spriteObjectDiffEntries("footprint", "Footprint", normalizeClientFootprint(asset.appliedFootprint), normalizedFootprint(asset), [
    ["w", "Width"],
    ["h", "Height"],
  ]);
  if (category === "transform") {
    const beforeAnchor = normalizeClientAnchor(asset.appliedAnchor);
    const afterAnchor = normalizeClientAnchor(asset.anchor);
    return [
      ...spriteObjectDiffEntries("transform", "Transform", beforeAnchor, afterAnchor, [
        ["x", "Anchor X"],
        ["y", "Anchor Y"],
      ]),
      ...spriteScalarDiffEntry("transform", "Scale", normalizeClientScale(asset.appliedScale), normalizeClientScale(asset.scale), 2),
    ];
  }
  if (category === "collision") return spriteCollisionDiffEntries(asset);
  return [];
}

function spriteShadowDiffEntries(asset) {
  const before = normalizeClientShadow(asset.appliedShadow);
  const after = normalizeClientShadow(asset.shadow);
  return spriteObjectDiffEntries("shadow", "Shadow", before, after, Object.entries(materialShadowInputs).map(([key, control]) => [key, shadowControlLabel(key), control.digits]));
}

function spriteObjectDiffEntries(category, groupLabel, before, after, fields) {
  return fields.flatMap(([key, label, digits]) => {
    if (spriteValuesMatch(before?.[key], after?.[key])) return [];
    return [{
      category,
      label,
      before: before?.[key],
      after: after?.[key],
      digits,
      groupLabel,
    }];
  });
}

function spriteScalarDiffEntry(category, label, before, after, digits = 2) {
  if (spriteValuesMatch(before, after)) return [];
  return [{ category, label, before, after, digits, groupLabel: "Transform" }];
}

function spriteCollisionDiffEntries(asset) {
  const beforeFootprint = normalizeClientFootprint(asset.appliedFootprint);
  const beforeBounds = normalizeClientCollisionBounds(asset.appliedCollisionBounds, beforeFootprint, asset.appliedCollisionTiles, asset.appliedCollision);
  const afterBounds = normalizedSpriteCollisionBounds(asset);
  const beforeTiles = normalizeClientCollisionTiles(asset.appliedCollisionTiles, beforeFootprint, asset.appliedCollision, beforeBounds);
  const afterTiles = normalizedSpriteCollision(asset);
  const entries = [];
  const beforeBoundsText = spriteBoundsText(beforeBounds);
  const afterBoundsText = spriteBoundsText(afterBounds);
  if (beforeBoundsText !== afterBoundsText) {
    entries.push({
      category: "collision",
      label: "Bounds",
      before: beforeBoundsText,
      after: afterBoundsText,
      groupLabel: "Collision",
    });
  }
  const beforeKeys = beforeTiles.map(tileKey).sort();
  const afterKeys = afterTiles.map(tileKey).sort();
  if (beforeKeys.join("|") !== afterKeys.join("|")) {
    entries.push({
      category: "collision",
      label: "Blocked tiles",
      before: `${beforeKeys.length} [${beforeKeys.slice(0, 8).join(" ")}${beforeKeys.length > 8 ? " ..." : ""}]`,
      after: `${afterKeys.length} [${afterKeys.slice(0, 8).join(" ")}${afterKeys.length > 8 ? " ..." : ""}]`,
      groupLabel: "Collision",
    });
  }
  return entries;
}

function spriteValuesMatch(before, after) {
  if (Number.isFinite(Number(before)) && Number.isFinite(Number(after))) {
    return Math.abs(Number(before) - Number(after)) < 0.000001;
  }
  return JSON.stringify(before) === JSON.stringify(after);
}

function shadowControlLabel(key) {
  return {
    x: "X",
    y: "Y",
    w: "X width",
    h: "Y width",
    angle: "Angle",
    alpha: "Alpha",
    blur: "Blur",
    round: "Round",
  }[key] ?? key;
}

function spriteBoundsText(bounds) {
  return `${bounds.x},${bounds.y} ${bounds.w}x${bounds.h}`;
}

function formatSpriteDiffValue(value, digits = 2) {
  if (value === undefined) return "unset";
  if (value === null) return "null";
  if (Number.isFinite(Number(value))) return Number(value).toFixed(digits);
  return String(value);
}

function formatSpriteDiffEntry(entry, includeCategory = false) {
  const label = includeCategory ? `${entry.groupLabel}.${entry.label}` : entry.label;
  return `${label}: ${formatSpriteDiffValue(entry.before, entry.digits)} -> ${formatSpriteDiffValue(entry.after, entry.digits)}`;
}

function spriteStateSummaryText(state) {
  const stateLabel = {
    "applied": "Applied",
    "checking": "Checking save server",
    "draft": "Draft",
    "draft-blocked": "Draft / save unavailable",
    "loading": "Loading",
    "rollback-ready": "Applied / rollback ready",
    "unavailable": "Save unavailable",
  }[state.state] ?? state.state;
  const dirtyLabel = state.hasDraft ? state.dirtyCategories.join(", ") : "clean";
  const saveLabel = state.saveMode === "unavailable" ? "save unavailable" : state.saveMode;
  const collisionNote = state.collisionBlockedByFootprint ? " / collision waits for footprint apply" : "";
  return `${stateLabel} / ${state.category} / ${state.assetLabel} / ${dirtyLabel} / ${saveLabel}${collisionNote}`;
}

function spriteDiffSummaryText(entries, state) {
  if (!state.asset) return "No sprite prop selected";
  if (entries.length === 0) return state.hasDraft ? "No computed diff for current draft" : "No selected diff";
  const preview = entries.slice(0, 4).map((entry) => formatSpriteDiffEntry(entry, true)).join("; ");
  const more = entries.length > 4 ? `; +${entries.length - 4} more` : "";
  return `Draft diff: ${preview}${more}`;
}

function renderSpritePropStatePanel(state = currentSpritePropEditorState()) {
  const diffEntries = spritePropDiffEntries(state.asset, state.dirtyCategories);
  if (materialStateSummary) renderSpriteStateSummary(state);
  if (materialDiffSummary) materialDiffSummary.textContent = spriteDiffSummaryText(diffEntries, state);
  if (!materialApplyHistoryList) return;
  materialApplyHistoryList.replaceChildren();
  if (spritePropApplyHistory.length === 0) {
    const item = document.createElement("li");
    item.className = "is-empty";
    item.textContent = "No apply history this session";
    materialApplyHistoryList.append(item);
    return;
  }
  for (const entry of spritePropApplyHistory) {
    const item = document.createElement("li");
    item.textContent = spritePropApplyHistoryText(entry);
    materialApplyHistoryList.append(item);
  }
}

function renderSpriteStateSummary(state) {
  const summary = spriteStateSummaryText(state);
  materialStateSummary.replaceChildren();
  materialStateSummary.dataset.summary = summary;
  const stateLabel = {
    "applied": "Applied",
    "checking": "Checking save server",
    "draft": "Draft",
    "draft-blocked": "Draft / save unavailable",
    "loading": "Loading",
    "rollback-ready": "Applied / rollback ready",
    "unavailable": "Save unavailable",
  }[state.state] ?? state.state;
  const fields = [
    ["State", stateLabel],
    ["Category", state.category],
    ["Asset", state.asset ? (currentLabLanguage() === "ja" ? labUiText(state.assetLabel) : state.assetLabel) : "None"],
    ["Unsaved changes", state.hasDraft ? state.dirtyCategories.join(", ") : "None"],
    ["Save target", state.saveMode === "unavailable" ? "Save unavailable" : state.saveMode],
  ];
  if (state.collisionBlockedByFootprint) fields.push(["Note", "collision waits for footprint apply"]);
  for (const [label, value] of fields) {
    const item = document.createElement("span");
    const key = document.createElement("strong");
    key.textContent = `${labUiText(label)}:`;
    item.append(key, ` ${labUiText(value)}`);
    materialStateSummary.append(item);
  }
}

function recordSpritePropApplyHistory({ action = "apply", state, appliedCategory = null, diffEntries = [], rollbackAvailable = false }) {
  spritePropApplyHistory.unshift({
    timeLabel: formatHistoryTime(new Date()),
    action,
    category: state.category,
    assetLabel: state.assetLabel,
    appliedCategory,
    dirtyCategories: state.dirtyCategories,
    diffCount: diffEntries.length,
    diffPreview: diffEntries.slice(0, 3).map((entry) => formatSpriteDiffEntry(entry, true)),
    rollbackAvailable: Boolean(rollbackAvailable),
  });
  while (spritePropApplyHistory.length > SPRITE_PROP_APPLY_HISTORY_LIMIT) spritePropApplyHistory.pop();
}

function spritePropApplyHistoryText(entry) {
  const actionLabel = entry.action === "rollback" ? "Rollback" : "Apply";
  const target = entry.appliedCategory ?? entry.dirtyCategories.join(", ") ?? "props";
  const changeLabel = `${entry.diffCount} change${entry.diffCount === 1 ? "" : "s"}`;
  const rollbackLabel = entry.rollbackAvailable ? " / rollback available" : "";
  const preview = entry.diffPreview.length > 0 ? ` / ${entry.diffPreview.join("; ")}` : "";
  return `${entry.timeLabel} ${actionLabel} ${entry.category}/${entry.assetLabel} / ${target} / ${changeLabel}${rollbackLabel}${preview}`;
}

function setRangeControlDirtyState(input, dirty, label, before, after, digits = 2) {
  const container = input?.closest?.(".range-control");
  if (!container) return;
  container.classList.toggle("is-dirty", Boolean(dirty));
  container.title = dirty
    ? `${label}: ${formatSpriteDiffValue(before, digits)} -> ${formatSpriteDiffValue(after, digits)}`
    : "";
}

function bindMaterialRangeNumberInput(rangeInput, explicitLabel = "") {
  if (!rangeInput || materialRangeNumberInputs.has(rangeInput)) return materialRangeNumberInputs.get(rangeInput) ?? null;
  const heading = rangeInput.closest(".range-control")?.querySelector(":scope > span");
  const label = explicitLabel || heading?.firstChild?.textContent?.trim() || "Parameter";
  const pair = document.createElement("span");
  pair.className = "range-input-pair";
  rangeInput.before(pair);
  pair.append(rangeInput);

  const numberInput = document.createElement("input");
  numberInput.className = "range-number-input";
  numberInput.type = "number";
  numberInput.min = rangeInput.min;
  numberInput.max = rangeInput.max;
  numberInput.step = rangeInput.step;
  numberInput.value = rangeInput.value;
  rangeInput.setAttribute("aria-label", `${label} slider`);
  numberInput.setAttribute("aria-label", `${label} numeric value`);
  pair.append(numberInput);
  materialRangeNumberInputs.set(rangeInput, numberInput);

  rangeInput.addEventListener("input", () => {
    numberInput.value = rangeInput.value;
  });
  numberInput.addEventListener("input", () => {
    if (numberInput.value === "" || !Number.isFinite(Number(numberInput.value))) return;
    rangeInput.value = numberInput.value;
    numberInput.value = rangeInput.value;
    rangeInput.dispatchEvent(new Event("input", { bubbles: true }));
  });
  numberInput.addEventListener("blur", () => {
    numberInput.value = rangeInput.value;
  });
  return numberInput;
}

function syncMaterialRangeNumberInput(rangeInput) {
  const numberInput = materialRangeNumberInputs.get(rangeInput);
  if (numberInput) numberInput.value = rangeInput.value;
}

function setMaterialRangeControlDisabled(rangeInput, disabled) {
  rangeInput.disabled = disabled;
  const numberInput = materialRangeNumberInputs.get(rangeInput);
  if (numberInput) numberInput.disabled = disabled;
}

function syncMaterialSpriteEditor() {
  const shouldShow = currentMode() === "spriteProps" && isSpriteManifestProp();
  materialSpriteEditor.hidden = !shouldShow;
  if (!shouldShow) return;

  const existingOptions = [...materialSpriteSelect.options].map((option) => option.value).join("|");
  const assets = currentSpriteAssets();
  const category = currentSpriteCategory();
  const nextOptions = assets.map((asset) => asset.id).join("|");
  if (existingOptions !== nextOptions) {
    materialSpriteSelect.replaceChildren();
    for (const asset of assets) {
      const option = document.createElement("option");
      option.value = asset.id;
      option.textContent = asset.label ?? asset.id;
      materialSpriteSelect.append(option);
    }
  }

  if (!selectedMaterialSpriteIds[category] || !assets.some((asset) => asset.id === selectedMaterialSpriteIds[category])) {
    selectedMaterialSpriteIds[category] = assets[0]?.id ?? null;
  }
  if (selectedMaterialSpriteIds[category]) materialSpriteSelect.value = selectedMaterialSpriteIds[category];

  const asset = selectedMaterialSpriteAsset();
  const hasAsset = Boolean(asset);
  const state = currentSpritePropEditorState(asset);
  materialSpriteSelect.disabled = !hasAsset;
  materialCopyAssetIdButton.disabled = !hasAsset;
  materialCopyAssetIdButton.title = hasAsset ? asset.id : "";
  syncSpritePropActionButtons(asset, state);
  for (const button of collisionBoundsButtons()) button.disabled = !hasAsset;
  updateShadowPersistenceUi();
  for (const control of Object.values(materialShadowInputs)) setMaterialRangeControlDisabled(control.input, !hasAsset);
  for (const control of Object.values(materialFootprintInputs)) setMaterialRangeControlDisabled(control.input, !hasAsset);
  for (const control of Object.values(materialTransformInputs)) setMaterialRangeControlDisabled(control.input, !hasAsset);

  if (!asset) {
    materialShadowJson.value = "";
    materialCollisionSummary.textContent = "footprint -- / blocked --";
    materialCollisionGrid.replaceChildren();
    renderSpritePropStatePanel(state);
    return;
  }
  updateShadowControls(asset);
  updateFootprintControls(asset);
  updateCollisionControls(asset);
  updateTransformControls(asset);
}

function updateShadowControls(asset) {
  const shadow = normalizeClientShadow(asset.shadow);
  const appliedShadow = normalizeClientShadow(asset.appliedShadow);
  asset.shadow = shadow;
  const isDraft = shadowDraftDirtyIds.has(asset.id);
  for (const [key, control] of Object.entries(materialShadowInputs)) {
    const value = shadow[key];
    control.input.value = String(value);
    syncMaterialRangeNumberInput(control.input);
    control.output.textContent = value.toFixed(control.digits);
    setRangeControlDirtyState(
      control.input,
      isDraft && !spriteValuesMatch(appliedShadow[key], value),
      shadowControlLabel(key),
      appliedShadow[key],
      value,
      control.digits,
    );
  }
  updateSpritePropJson(asset);
  materialShadowApplyButton.disabled = !isDraft || propsPersistence.serverCurrent !== true;
  updateShadowPersistenceUi();
}

function updateSpritePropJson(asset) {
  const shadow = normalizeClientShadow(asset.shadow);
  const anchor = normalizeClientAnchor(asset.anchor);
  const scale = normalizeClientScale(asset.scale);
  const collisionBounds = normalizedSpriteCollisionBounds(asset);
  const collisionTiles = normalizedSpriteCollision(asset);
  const state = currentSpritePropEditorState(asset);
  const draftDiff = spritePropDiffEntries(asset, state.dirtyCategories).map((entry) => ({
    category: entry.category,
    label: entry.label,
    before: entry.before,
    after: entry.after,
  }));
  materialShadowJson.value = JSON.stringify({
    id: asset.id,
    file: asset.file,
    state: state.state,
    stateModel: {
      hasDraft: state.hasDraft,
      dirtyCount: state.dirtyCount,
      dirtyCategories: state.dirtyCategories,
      canApply: state.canApply,
      canApplyByCategory: state.canApplyByCategory,
      canRollback: state.canRollback,
      collisionBlockedByFootprint: state.collisionBlockedByFootprint,
    },
    saveMode: state.saveMode,
    collisionSaveMode: collisionSaveModeLabel(),
    footprintSaveMode: footprintSaveModeLabel(),
    transformSaveMode: transformSaveModeLabel(),
    rollbackAvailable: state.rollbackAvailable,
    draftDiff,
    draft: {
      shadow: state.dirtyCategories.includes("shadow"),
      collision: state.dirtyCategories.includes("collision"),
      footprint: state.dirtyCategories.includes("footprint"),
      transform: state.dirtyCategories.includes("transform"),
    },
    footprint: normalizedFootprint(asset),
    anchor,
    scale,
    shadow,
    collisionBounds,
    collisionTiles,
  }, null, 2);
  syncSpritePropActionButtons(asset, state);
  updateMaterialStatusBadges(state);
  renderSpritePropStatePanel(state);
}

function updateCollisionControls(asset) {
  const footprint = normalizedFootprint(asset);
  const collisionBounds = normalizedSpriteCollisionBounds(asset);
  const collisionTiles = normalizedSpriteCollision(asset);
  const blocked = new Set(collisionTiles.map(tileKey));
  const appliedFootprint = normalizeClientFootprint(asset.appliedFootprint);
  const appliedBounds = normalizeClientCollisionBounds(asset.appliedCollisionBounds, appliedFootprint, asset.appliedCollisionTiles, asset.appliedCollision);
  const appliedBlocked = new Set(normalizeClientCollisionTiles(asset.appliedCollisionTiles, appliedFootprint, asset.appliedCollision, appliedBounds).map(tileKey));
  const isDraft = collisionDraftDirtyIds.has(asset.id);
  materialCollisionGrid.replaceChildren();
  materialCollisionGrid.style.setProperty("--collision-cols", String(collisionBounds.w));
  materialCollisionSummary.textContent = `footprint ${footprint.w}x${footprint.h} / edit ${collisionBounds.x},${collisionBounds.y} ${collisionBounds.w}x${collisionBounds.h} / blocked ${collisionTiles.length}`;

  for (let y = collisionBounds.y; y < collisionBounds.y + collisionBounds.h; y += 1) {
    for (let x = collisionBounds.x; x < collisionBounds.x + collisionBounds.w; x += 1) {
      const key = `${x},${y}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "material-collision-tile";
      button.textContent = blocked.has(key) ? "BLOCK" : `${x},${y}`;
      button.title = `collision ${x},${y}`;
      button.dataset.collisionX = String(x);
      button.dataset.collisionY = String(y);
      button.setAttribute("aria-pressed", blocked.has(key) ? "true" : "false");
      if (tileInFootprint(x, y, footprint)) button.classList.add("is-footprint");
      if (blocked.has(key)) button.classList.add("is-blocked");
      if (isDraft && blocked.has(key) !== appliedBlocked.has(key)) button.classList.add("is-dirty");
      button.addEventListener("click", () => {
        toggleSelectedSpriteCollisionTile(x, y);
      });
      materialCollisionGrid.append(button);
    }
  }

  materialCollisionApplyButton.disabled = !isDraft || !collisionPersistsToJson() || footprintDraftDirtyIds.has(asset.id);
  materialCollisionResetButton.disabled = false;
  updateSpritePropJson(asset);
  updateShadowPersistenceUi();
}

function updateFootprintControls(asset) {
  const footprint = normalizedFootprint(asset);
  const appliedFootprint = normalizeClientFootprint(asset.appliedFootprint);
  asset.footprint = footprint;
  const isDraft = footprintDraftDirtyIds.has(asset.id);
  materialFootprintInputs.w.input.value = String(footprint.w);
  syncMaterialRangeNumberInput(materialFootprintInputs.w.input);
  materialFootprintInputs.w.output.textContent = String(footprint.w);
  materialFootprintInputs.h.input.value = String(footprint.h);
  syncMaterialRangeNumberInput(materialFootprintInputs.h.input);
  materialFootprintInputs.h.output.textContent = String(footprint.h);
  setRangeControlDirtyState(materialFootprintInputs.w.input, isDraft && !spriteValuesMatch(appliedFootprint.w, footprint.w), "Footprint width", appliedFootprint.w, footprint.w, 0);
  setRangeControlDirtyState(materialFootprintInputs.h.input, isDraft && !spriteValuesMatch(appliedFootprint.h, footprint.h), "Footprint height", appliedFootprint.h, footprint.h, 0);
  materialFootprintApplyButton.disabled = !isDraft || !footprintPersistsToJson();
  materialFootprintResetButton.disabled = false;
  updateSpritePropJson(asset);
  updateShadowPersistenceUi();
}

function updateTransformControls(asset) {
  const anchor = normalizeClientAnchor(asset.anchor);
  const scale = normalizeClientScale(asset.scale);
  const appliedAnchor = normalizeClientAnchor(asset.appliedAnchor);
  const appliedScale = normalizeClientScale(asset.appliedScale);
  asset.anchor = anchor;
  asset.scale = scale;
  const isDraft = transformDraftDirtyIds.has(asset.id);
  materialTransformInputs.anchorX.input.value = String(anchor.x);
  syncMaterialRangeNumberInput(materialTransformInputs.anchorX.input);
  materialTransformInputs.anchorX.output.textContent = anchor.x.toFixed(materialTransformInputs.anchorX.digits);
  materialTransformInputs.anchorY.input.value = String(anchor.y);
  syncMaterialRangeNumberInput(materialTransformInputs.anchorY.input);
  materialTransformInputs.anchorY.output.textContent = anchor.y.toFixed(materialTransformInputs.anchorY.digits);
  materialTransformInputs.scale.input.value = String(scale);
  syncMaterialRangeNumberInput(materialTransformInputs.scale.input);
  materialTransformInputs.scale.output.textContent = scale.toFixed(materialTransformInputs.scale.digits);
  setRangeControlDirtyState(materialTransformInputs.anchorX.input, isDraft && !spriteValuesMatch(appliedAnchor.x, anchor.x), "Anchor X", appliedAnchor.x, anchor.x, materialTransformInputs.anchorX.digits);
  setRangeControlDirtyState(materialTransformInputs.anchorY.input, isDraft && !spriteValuesMatch(appliedAnchor.y, anchor.y), "Anchor Y", appliedAnchor.y, anchor.y, materialTransformInputs.anchorY.digits);
  setRangeControlDirtyState(materialTransformInputs.scale.input, isDraft && !spriteValuesMatch(appliedScale, scale), "Scale", appliedScale, scale, materialTransformInputs.scale.digits);
  materialTransformApplyButton.disabled = !isDraft || !transformPersistsToJson();
  materialTransformResetButton.disabled = false;
  updateSpritePropJson(asset);
  updateShadowPersistenceUi();
}

function normalizedSpriteCollision(asset) {
  return normalizeClientCollisionTiles(asset.collisionTiles, asset.footprint, asset.collision, normalizedSpriteCollisionBounds(asset));
}

function normalizedSpriteCollisionBounds(asset) {
  return normalizeClientCollisionBounds(asset.collisionBounds, asset.footprint, asset.collisionTiles, asset.collision);
}

function normalizedFootprint(asset) {
  return normalizeClientFootprint(asset.footprint);
}

function cloneCollisionTiles(tiles) {
  return tiles.map((tile) => ({ x: tile.x, y: tile.y }));
}

function tileKey(tile) {
  return `${tile.x},${tile.y}`;
}

function tileInFootprint(x, y, footprint) {
  return x >= 0 && y >= 0 && x < footprint.w && y < footprint.h;
}

function collisionBoundsButtons() {
  return [
    materialCollisionExpandLeftButton,
    materialCollisionExpandRightButton,
    materialCollisionExpandUpButton,
    materialCollisionExpandDownButton,
    materialCollisionTrimButton,
  ];
}

function updateShadowPersistenceUi(state = currentSpritePropEditorState()) {
  materialShadowSaveStatus.textContent = shadowSaveStatusNote;
  syncSpritePropActionButtons(state.asset, state);
  updateMaterialLatestWarning();
  updateMaterialStatusBadges(state);
  renderSpritePropStatePanel(state);
}

function updateMaterialStatusBadges(state = currentSpritePropEditorState()) {
  if (!materialSaveBadge || !materialDraftBadge || !materialRollbackBadge) return;
  setStatusBadge(
    materialSaveBadge,
    state.checking
      ? "Checking"
      : propsPersistence.serverCurrent === true
        ? "Can save to props.json"
        : "Save unavailable",
    state.checking ? "is-muted" : propsPersistence.serverCurrent === true ? "is-ok" : "is-danger",
  );
  setStatusBadge(materialDraftBadge, state.hasDraft ? `Draft ${state.dirtyCount}` : "Applied", state.hasDraft ? "is-draft" : "is-ok");
  setStatusBadge(materialRollbackBadge, state.rollbackAvailable ? "Rollback available" : "No reversible change", state.rollbackAvailable ? "is-draft" : "is-muted");
}

function setStatusBadge(element, text, stateClass) {
  element.textContent = text;
  element.className = `status-badge ${stateClass}`;
}

function updateMaterialLatestWarning() {
  if (!materialLatestWarning) return;
  const proceduralMode = currentMode() === "proceduralElements";
  const biomeScope = proceduralMode && proceduralEditScope() === "biome";
  const activePersistence = biomeScope ? biomeRecipePersistence : proceduralMode ? proceduralPersistence : propsPersistence;
  const expectedVersion = biomeScope ? BIOME_RECIPES_VERSION : proceduralMode ? PROCEDURAL_PARAMS_VERSION : PROP_ASSET_VERSION;
  const isChecking = activePersistence.mode === "checking";
  const isLatest = activePersistence.serverCurrent === true;
  materialLatestWarning.hidden = isChecking || isLatest;
  materialLatestWarning.title = isLatest
    ? ""
    : `保存サーバーが最新ではありません: server=${activePersistence.serverVersion ?? "none"} / expected=${expectedVersion}`;
}

function setSelectedSpriteShadowValue(key, value) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.shadow = normalizeClientShadow({
    ...asset.shadow,
    [key]: value,
  });
  shadowDraftDirtyIds.add(asset.id);
  updateShadowControls(asset);
  scheduleMaterialLabRender();
}

function toggleSelectedSpriteCollisionTile(x, y) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const tiles = normalizedSpriteCollision(asset);
  const key = `${x},${y}`;
  const next = tiles.filter((tile) => tileKey(tile) !== key);
  if (next.length === tiles.length) next.push({ x, y });
  asset.collision = "custom";
  asset.collisionBounds = normalizedSpriteCollisionBounds(asset);
  asset.collisionTiles = normalizeClientCollisionTiles(next, asset.footprint, asset.collision, asset.collisionBounds);
  collisionDraftDirtyIds.add(asset.id);
  updateCollisionControls(asset);
  renderMaterialLab();
}

function expandSelectedSpriteCollisionBounds(direction) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const bounds = normalizedSpriteCollisionBounds(asset);
  const next = { ...bounds };
  if (direction === "left") {
    next.x -= 1;
    next.w += 1;
  } else if (direction === "right") {
    next.w += 1;
  } else if (direction === "up") {
    next.y -= 1;
    next.h += 1;
  } else if (direction === "down") {
    next.h += 1;
  }
  setSelectedSpriteCollisionBounds(next, true);
}

function trimSelectedSpriteCollisionBounds() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const footprint = normalizedFootprint(asset);
  const collisionTiles = normalizedSpriteCollision(asset);
  const xs = [0, footprint.w - 1, ...collisionTiles.map((tile) => tile.x)];
  const ys = [0, footprint.h - 1, ...collisionTiles.map((tile) => tile.y)];
  setSelectedSpriteCollisionBounds({
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs) + 1,
    h: Math.max(...ys) - Math.min(...ys) + 1,
  }, true);
}

function setSelectedSpriteCollisionBounds(bounds, markDirty) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.collision = "custom";
  asset.collisionBounds = normalizeClientCollisionBounds(bounds, asset.footprint, asset.collisionTiles, asset.collision);
  asset.collisionTiles = normalizeClientCollisionTiles(asset.collisionTiles, asset.footprint, asset.collision, asset.collisionBounds);
  if (markDirty) collisionDraftDirtyIds.add(asset.id);
  updateCollisionControls(asset);
  renderMaterialLab();
}

function setSelectedSpriteFootprintValue(key, value) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const current = normalizedFootprint(asset);
  const next = normalizeClientFootprint({
    ...current,
    [key]: value,
  });
  if (next.w === current.w && next.h === current.h) return;
  asset.footprint = next;
  reconcileCollisionForFootprint(asset);
  footprintDraftDirtyIds.add(asset.id);
  updateFootprintControls(asset);
  updateCollisionControls(asset);
  scheduleMaterialLabRender();
}

function reconcileCollisionForFootprint(asset) {
  const footprint = normalizedFootprint(asset);
  if (String(asset.collision ?? "footprint") !== "custom") {
    asset.collision = "footprint";
    asset.collisionBounds = normalizeClientCollisionBounds(null, footprint, [], asset.collision);
    asset.collisionTiles = normalizeClientCollisionTiles(null, footprint, asset.collision, asset.collisionBounds);
    return;
  }
  asset.collisionBounds = collisionBoundsCoveringFootprint(asset);
  asset.collisionTiles = normalizeClientCollisionTiles(asset.collisionTiles, footprint, asset.collision, asset.collisionBounds);
}

function collisionBoundsCoveringFootprint(asset) {
  const footprint = normalizedFootprint(asset);
  const currentBounds = normalizeClientCollisionBounds(asset.collisionBounds, footprint, asset.collisionTiles, asset.collision);
  const collisionTiles = normalizeClientCollisionTiles(asset.collisionTiles, footprint, asset.collision, currentBounds);
  const xs = [0, footprint.w - 1, currentBounds.x, currentBounds.x + currentBounds.w - 1, ...collisionTiles.map((tile) => tile.x)];
  const ys = [0, footprint.h - 1, currentBounds.y, currentBounds.y + currentBounds.h - 1, ...collisionTiles.map((tile) => tile.y)];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return normalizeClientCollisionBounds({
    x,
    y,
    w: Math.max(...xs) - x + 1,
    h: Math.max(...ys) - y + 1,
  }, footprint, collisionTiles, asset.collision);
}

function setSelectedSpriteTransformValue(key, value) {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  if (key === "anchorX") {
    asset.anchor = normalizeClientAnchor({
      ...asset.anchor,
      x: value,
    });
  } else if (key === "anchorY") {
    asset.anchor = normalizeClientAnchor({
      ...asset.anchor,
      y: value,
    });
  } else if (key === "scale") {
    asset.scale = normalizeClientScale(value);
  }
  transformDraftDirtyIds.add(asset.id);
  updateTransformControls(asset);
  scheduleMaterialLabRender();
}

async function applySelectedSpriteShadow() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.shadow = normalizeClientShadow(asset.shadow);
  if (propsPersistence.serverCurrent !== true) {
    shadowSaveStatusNote = "shadow save unavailable; start the latest lab server";
    shadowDraftDirtyIds.add(asset.id);
    updateShadowControls(asset);
    renderMaterialLab();
    return;
  }
  const applyState = currentSpritePropEditorState(asset);
  const diffEntries = spritePropDiffEntriesForCategory(asset, "shadow");
  activeSpritePropSaveCategory = "shadow";
  materialShadowApplyButton.disabled = true;
  shadowSaveStatusNote = "saving props.json";
  updateShadowPersistenceUi();

  try {
    const result = await postPropsApi("shadow", {
      id: asset.id,
      shadow: asset.shadow,
    }, currentSpriteCategory());
    const savedShadow = normalizeClientShadow(result.shadow ?? asset.shadow);
    asset.shadow = { ...savedShadow };
    asset.baseShadow = { ...savedShadow };
    asset.appliedShadow = { ...savedShadow };
    propsPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    shadowSaveStatusNote = propsPersistence.rollbackAvailable
      ? `props.json saved: ${asset.id} / rollback available`
      : `props.json saved: ${asset.id}`;
    recordSpritePropApplyHistory({
      state: applyState,
      appliedCategory: "shadow",
      diffEntries,
      rollbackAvailable: propsPersistence.rollbackAvailable,
    });
    shadowDraftDirtyIds.delete(asset.id);
    notifyPropAssetsChanged("shadow-applied", {
      id: asset.id,
      shadow: savedShadow,
    });
  } catch (error) {
    shadowSaveStatusNote = `props.json save failed: ${error.message}`;
    shadowDraftDirtyIds.add(asset.id);
  }
  activeSpritePropSaveCategory = null;
  updateShadowControls(asset);
  renderMaterialLab();
}

function resetSelectedSpriteShadow() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const resetShadow = asset.appliedShadow;
  asset.shadow = normalizeClientShadow(resetShadow);
  shadowSaveStatusNote = `draft reset to props.json: ${asset.id}`;
  shadowDraftDirtyIds.delete(asset.id);
  updateShadowControls(asset);
  renderMaterialLab();
}

async function applySelectedSpriteCollision() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.collision = "custom";
  asset.collisionBounds = normalizedSpriteCollisionBounds(asset);
  asset.collisionTiles = normalizedSpriteCollision(asset);
  if (!collisionPersistsToJson()) {
    shadowSaveStatusNote = "collision save unavailable; start the lab server from start-lab-server.bat";
    collisionDraftDirtyIds.add(asset.id);
    updateCollisionControls(asset);
    renderMaterialLab();
    return;
  }
  const applyState = currentSpritePropEditorState(asset);
  const diffEntries = spritePropDiffEntriesForCategory(asset, "collision");
  activeSpritePropSaveCategory = "collision";
  materialCollisionApplyButton.disabled = true;
  shadowSaveStatusNote = "saving props.json collision";
  updateShadowPersistenceUi();

  try {
    const result = await postPropsApi("collision", {
      id: asset.id,
      collisionBounds: asset.collisionBounds,
      collisionTiles: asset.collisionTiles,
    }, currentSpriteCategory());
    const savedCollisionBounds = normalizeClientCollisionBounds(result.collisionBounds ?? asset.collisionBounds, asset.footprint, result.collisionTiles ?? asset.collisionTiles, "custom");
    const savedCollisionTiles = normalizeClientCollisionTiles(result.collisionTiles ?? asset.collisionTiles, asset.footprint, "custom", savedCollisionBounds);
    asset.collision = result.collision ?? "custom";
    asset.baseCollision = asset.collision;
    asset.appliedCollision = asset.collision;
    asset.collisionBounds = { ...savedCollisionBounds };
    asset.collisionTiles = cloneCollisionTiles(savedCollisionTiles);
    asset.baseCollisionBounds = { ...savedCollisionBounds };
    asset.baseCollisionTiles = cloneCollisionTiles(savedCollisionTiles);
    asset.appliedCollisionBounds = { ...savedCollisionBounds };
    asset.appliedCollisionTiles = cloneCollisionTiles(savedCollisionTiles);
    propsPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    shadowSaveStatusNote = propsPersistence.rollbackAvailable
      ? `props.json saved collision: ${asset.id} / rollback available`
      : `props.json saved collision: ${asset.id}`;
    recordSpritePropApplyHistory({
      state: applyState,
      appliedCategory: "collision",
      diffEntries,
      rollbackAvailable: propsPersistence.rollbackAvailable,
    });
    collisionDraftDirtyIds.delete(asset.id);
    notifyPropAssetsChanged("collision-applied", {
      id: asset.id,
      collisionBounds: savedCollisionBounds,
      collisionTiles: savedCollisionTiles,
    });
  } catch (error) {
    if (String(error.message).includes("unknown api")) propsPersistence.collisionMode = "unavailable";
    shadowSaveStatusNote = `props.json collision save failed: ${error.message}`;
    collisionDraftDirtyIds.add(asset.id);
  }
  activeSpritePropSaveCategory = null;
  updateCollisionControls(asset);
  renderMaterialLab();
}

async function applySelectedSpriteFootprint() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.footprint = normalizedFootprint(asset);
  reconcileCollisionForFootprint(asset);
  if (!footprintPersistsToJson()) {
    shadowSaveStatusNote = "footprint save unavailable; start the latest lab server";
    footprintDraftDirtyIds.add(asset.id);
    updateFootprintControls(asset);
    updateCollisionControls(asset);
    renderMaterialLab();
    return;
  }
  const applyState = currentSpritePropEditorState(asset);
  const diffEntries = spritePropDiffEntriesForCategory(asset, "footprint");
  activeSpritePropSaveCategory = "footprint";
  materialFootprintApplyButton.disabled = true;
  shadowSaveStatusNote = "saving props.json footprint";
  updateShadowPersistenceUi();

  try {
    const result = await postPropsApi("footprint", {
      id: asset.id,
      footprint: asset.footprint,
    }, currentSpriteCategory());
    const savedFootprint = normalizeClientFootprint(result.footprint ?? asset.footprint);
    const savedCollisionBounds = normalizeClientCollisionBounds(result.collisionBounds ?? asset.appliedCollisionBounds, savedFootprint, result.collisionTiles ?? asset.appliedCollisionTiles, result.collision ?? asset.collision);
    const savedCollisionTiles = normalizeClientCollisionTiles(result.collisionTiles ?? asset.appliedCollisionTiles, savedFootprint, result.collision ?? asset.collision, savedCollisionBounds);
    asset.footprint = { ...savedFootprint };
    asset.baseFootprint = { ...savedFootprint };
    asset.appliedFootprint = { ...savedFootprint };
    asset.baseCollisionBounds = { ...savedCollisionBounds };
    asset.baseCollisionTiles = cloneCollisionTiles(savedCollisionTiles);
    asset.appliedCollisionBounds = { ...savedCollisionBounds };
    asset.appliedCollisionTiles = cloneCollisionTiles(savedCollisionTiles);
    if (!collisionDraftDirtyIds.has(asset.id)) {
      asset.collision = result.collision ?? asset.collision;
      asset.baseCollision = asset.collision;
      asset.appliedCollision = asset.collision;
      asset.collisionBounds = { ...savedCollisionBounds };
      asset.collisionTiles = cloneCollisionTiles(savedCollisionTiles);
    } else {
      asset.baseCollision = result.collision ?? asset.baseCollision;
      asset.appliedCollision = result.collision ?? asset.appliedCollision;
      reconcileCollisionForFootprint(asset);
    }
    propsPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    shadowSaveStatusNote = propsPersistence.rollbackAvailable
      ? `props.json saved footprint: ${asset.id} / rollback available`
      : `props.json saved footprint: ${asset.id}`;
    recordSpritePropApplyHistory({
      state: applyState,
      appliedCategory: "footprint",
      diffEntries,
      rollbackAvailable: propsPersistence.rollbackAvailable,
    });
    footprintDraftDirtyIds.delete(asset.id);
    notifyPropAssetsChanged("footprint-applied", {
      id: asset.id,
      footprint: savedFootprint,
    });
  } catch (error) {
    if (String(error.message).includes("unknown api")) propsPersistence.footprintMode = "unavailable";
    shadowSaveStatusNote = `props.json footprint save failed: ${error.message}`;
    footprintDraftDirtyIds.add(asset.id);
  }
  activeSpritePropSaveCategory = null;
  updateFootprintControls(asset);
  updateCollisionControls(asset);
  renderMaterialLab();
}

async function applySelectedSpriteTransform() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.anchor = normalizeClientAnchor(asset.anchor);
  asset.scale = normalizeClientScale(asset.scale);
  if (!transformPersistsToJson()) {
    shadowSaveStatusNote = "transform save unavailable; start the latest lab server";
    transformDraftDirtyIds.add(asset.id);
    updateTransformControls(asset);
    renderMaterialLab();
    return;
  }
  const applyState = currentSpritePropEditorState(asset);
  const diffEntries = spritePropDiffEntriesForCategory(asset, "transform");
  activeSpritePropSaveCategory = "transform";
  materialTransformApplyButton.disabled = true;
  shadowSaveStatusNote = "saving props.json transform";
  updateShadowPersistenceUi();

  try {
    const result = await postPropsApi("transform", {
      id: asset.id,
      anchor: asset.anchor,
      scale: asset.scale,
    }, currentSpriteCategory());
    const savedAnchor = normalizeClientAnchor(result.anchor ?? asset.anchor);
    const savedScale = normalizeClientScale(result.scale ?? asset.scale);
    asset.anchor = { ...savedAnchor };
    asset.baseAnchor = { ...savedAnchor };
    asset.appliedAnchor = { ...savedAnchor };
    asset.scale = savedScale;
    asset.baseScale = savedScale;
    asset.appliedScale = savedScale;
    propsPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    shadowSaveStatusNote = propsPersistence.rollbackAvailable
      ? `props.json saved transform: ${asset.id} / rollback available`
      : `props.json saved transform: ${asset.id}`;
    recordSpritePropApplyHistory({
      state: applyState,
      appliedCategory: "transform",
      diffEntries,
      rollbackAvailable: propsPersistence.rollbackAvailable,
    });
    transformDraftDirtyIds.delete(asset.id);
    notifyPropAssetsChanged("transform-applied", {
      id: asset.id,
      anchor: savedAnchor,
      scale: savedScale,
    });
  } catch (error) {
    if (String(error.message).includes("unknown api")) propsPersistence.transformMode = "unavailable";
    shadowSaveStatusNote = `props.json transform save failed: ${error.message}`;
    transformDraftDirtyIds.add(asset.id);
  }
  activeSpritePropSaveCategory = null;
  updateTransformControls(asset);
  renderMaterialLab();
}

function resetSelectedSpriteTransform() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.anchor = normalizeClientAnchor(asset.appliedAnchor);
  asset.scale = normalizeClientScale(asset.appliedScale);
  shadowSaveStatusNote = `transform draft reset to props.json: ${asset.id}`;
  transformDraftDirtyIds.delete(asset.id);
  updateTransformControls(asset);
  renderMaterialLab();
}

function resetSelectedSpriteFootprint() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  asset.footprint = normalizeClientFootprint(asset.appliedFootprint);
  if (!collisionDraftDirtyIds.has(asset.id)) {
    asset.collision = asset.appliedCollision ?? asset.collision;
    asset.collisionBounds = normalizeClientCollisionBounds(asset.appliedCollisionBounds, asset.footprint, asset.appliedCollisionTiles, asset.collision);
    asset.collisionTiles = normalizeClientCollisionTiles(asset.appliedCollisionTiles, asset.footprint, asset.collision, asset.collisionBounds);
  } else {
    reconcileCollisionForFootprint(asset);
  }
  shadowSaveStatusNote = `footprint draft reset to props.json: ${asset.id}`;
  footprintDraftDirtyIds.delete(asset.id);
  updateFootprintControls(asset);
  updateCollisionControls(asset);
  renderMaterialLab();
}

function resetSelectedSpriteCollision() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  const resetTiles = asset.appliedCollisionTiles;
  const resetBounds = asset.appliedCollisionBounds;
  asset.collision = asset.appliedCollision ?? "custom";
  asset.collisionBounds = normalizeClientCollisionBounds(resetBounds, asset.footprint, resetTiles, asset.collision);
  asset.collisionTiles = normalizeClientCollisionTiles(resetTiles, asset.footprint, asset.collision, asset.collisionBounds);
  shadowSaveStatusNote = `collision draft reset to props.json: ${asset.id}`;
  collisionDraftDirtyIds.delete(asset.id);
  updateCollisionControls(asset);
  renderMaterialLab();
}

async function rollbackLastShadowApply() {
  if (propsPersistence.mode !== "json" || !propsPersistence.rollbackAvailable) return;
  const rollbackState = currentSpritePropEditorState();
  activeSpritePropSaveCategory = "rollback";
  materialShadowRollbackButton.disabled = true;
  shadowSaveStatusNote = "rolling back props.json";
  updateShadowPersistenceUi();
  try {
    const category = currentSpriteCategory();
    await postPropsApi("rollback", {}, category);
    propsPersistence.rollbackAvailable = false;
    shadowSaveStatusNote = "props.json rolled back";
    recordSpritePropApplyHistory({
      action: "rollback",
      state: rollbackState,
      appliedCategory: "props.json",
      rollbackAvailable: false,
    });
    if (category === "trees") await reloadTreeSpriteAssets();
    else await reloadLargeRockSpriteAssets();
    notifyPropAssetsChanged("props-rollback");
  } catch (error) {
    propsPersistence.rollbackAvailable = true;
    shadowSaveStatusNote = `rollback failed: ${error.message}`;
  }
  activeSpritePropSaveCategory = null;
  updateShadowPersistenceUi();
  renderMaterialLab();
}

function spriteBatchPayload(asset) {
  const footprint = normalizedFootprint(asset);
  const collision = String(asset.collision ?? "footprint");
  const collisionBounds = normalizeClientCollisionBounds(asset.collisionBounds, footprint, asset.collisionTiles, collision);
  const collisionTiles = normalizeClientCollisionTiles(asset.collisionTiles, footprint, collision, collisionBounds);
  return {
    id: asset.id,
    shadow: normalizeClientShadow(asset.shadow),
    footprint,
    collision,
    collisionBounds,
    collisionTiles,
    anchor: normalizeClientAnchor(asset.anchor),
    scale: normalizeClientScale(asset.scale),
  };
}

async function saveCurrentMaterialDraft() {
  const before = currentDraftState();
  if (!before.hasDraft || materialSaveInProgress) return !before.hasDraft;
  materialSaveInProgress = true;
  materialSaveFeedbackNote = `Saving ${before.count} ${before.unit}...`;
  updateMaterialSaveBar();
  let saved = false;
  try {
    if (before.mode === "spriteProps") {
      saved = await saveCurrentSpriteDraftBatch();
    } else {
      await applySelectedProceduralParams();
      saved = !currentProceduralEditorState().hasDraft;
      if (!saved) {
        materialSaveFeedbackNote = proceduralEditScope() === "biome"
          ? biomeRecipeSaveStatusNote
          : proceduralSaveStatusNote;
      }
    }
  } catch (error) {
    materialSaveFeedbackNote = `Save failed: ${error.message}`;
    saved = false;
  } finally {
    materialSaveInProgress = false;
  }
  if (saved) materialSaveFeedbackNote = `Saved ${before.count} ${before.unit}. Undo is available for this ${before.target} scope.`;
  updateMaterialSaveBar();
  renderMaterialBrowser();
  updateMaterialWorkspaceChrome();
  return saved;
}

async function saveCurrentSpriteDraftBatch() {
  const category = currentSpriteCategory();
  const dirtyAssets = currentSpriteDirtyAssets();
  if (dirtyAssets.length === 0) return true;
  if (propsPersistence.serverCurrent !== true || propsPersistence.batchMode !== "json") {
    shadowSaveStatusNote = "atomic batch save unavailable; start the latest lab server";
    materialSaveFeedbackNote = shadowSaveStatusNote;
    updateShadowPersistenceUi();
    return false;
  }
  const states = dirtyAssets.map((asset) => ({
    asset,
    state: currentSpritePropEditorState(asset),
    diffEntries: spritePropDiffEntries(asset),
  }));
  activeSpritePropSaveCategory = "batch";
  shadowSaveStatusNote = `saving ${dirtyAssets.length} assets atomically`;
  updateShadowPersistenceUi();
  try {
    const result = await postPropsBatchApi(dirtyAssets.map(spriteBatchPayload), category);
    const savedById = new Map((result.assets ?? []).map((asset) => [asset.id, asset]));
    for (const entry of states) {
      applySavedSpriteAsset(entry.asset, savedById.get(entry.asset.id) ?? spriteBatchPayload(entry.asset));
      recordSpritePropApplyHistory({
        state: entry.state,
        appliedCategory: "batch",
        diffEntries: entry.diffEntries,
        rollbackAvailable: Boolean(result.rollbackAvailable),
      });
    }
    propsPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    shadowSaveStatusNote = `saved ${dirtyAssets.length} ${category} assets atomically / rollback available`;
    notifyPropAssetsChanged("batch-applied", {
      category,
      ids: dirtyAssets.map((asset) => asset.id),
    });
    return true;
  } catch (error) {
    shadowSaveStatusNote = `atomic batch save failed: ${error.message}`;
    materialSaveFeedbackNote = shadowSaveStatusNote;
    return false;
  } finally {
    activeSpritePropSaveCategory = null;
    syncMaterialSpriteEditor();
    renderMaterialLab();
  }
}

function applySavedSpriteAsset(asset, saved) {
  const footprint = normalizeClientFootprint(saved.footprint);
  const collision = String(saved.collision ?? "footprint");
  const collisionBounds = normalizeClientCollisionBounds(saved.collisionBounds, footprint, saved.collisionTiles, collision);
  const collisionTiles = normalizeClientCollisionTiles(saved.collisionTiles, footprint, collision, collisionBounds);
  const shadow = normalizeClientShadow(saved.shadow);
  const anchor = normalizeClientAnchor(saved.anchor);
  const scale = normalizeClientScale(saved.scale);
  Object.assign(asset, {
    shadow: { ...shadow },
    baseShadow: { ...shadow },
    appliedShadow: { ...shadow },
    footprint: { ...footprint },
    baseFootprint: { ...footprint },
    appliedFootprint: { ...footprint },
    collision,
    baseCollision: collision,
    appliedCollision: collision,
    collisionBounds: { ...collisionBounds },
    baseCollisionBounds: { ...collisionBounds },
    appliedCollisionBounds: { ...collisionBounds },
    collisionTiles: cloneCollisionTiles(collisionTiles),
    baseCollisionTiles: cloneCollisionTiles(collisionTiles),
    appliedCollisionTiles: cloneCollisionTiles(collisionTiles),
    anchor: { ...anchor },
    baseAnchor: { ...anchor },
    appliedAnchor: { ...anchor },
    scale,
    baseScale: scale,
    appliedScale: scale,
  });
  shadowDraftDirtyIds.delete(asset.id);
  collisionDraftDirtyIds.delete(asset.id);
  footprintDraftDirtyIds.delete(asset.id);
  transformDraftDirtyIds.delete(asset.id);
}

function discardCurrentMaterialDraft() {
  const state = currentDraftState();
  if (!state.hasDraft || materialSaveInProgress) return;
  if (state.mode === "spriteProps") {
    for (const asset of currentSpriteDirtyAssets()) resetSpriteAssetToApplied(asset);
    shadowSaveStatusNote = `discarded unsaved ${state.target} changes`;
  } else if (proceduralEditScope() === "biome") {
    const appliedRecipe = selectedProceduralAppliedRecipe();
    proceduralBiomeRecipes = proceduralBiomeRecipes.map((recipe) => (
      recipe.id === selectedProceduralBiomeId ? JSON.parse(JSON.stringify(appliedRecipe)) : recipe
    ));
    biomeOverrideDirtyElementIds.clear();
    biomeRecipeSaveStatusNote = `discarded unsaved ${selectedProceduralBiomeId} overrides`;
  } else {
    proceduralParams = cloneProceduralParamsManifest(proceduralAppliedParams ?? proceduralParams);
    proceduralDirtyElementIds.clear();
    proceduralSaveStatusNote = "discarded unsaved global parameter changes";
  }
  materialSaveFeedbackNote = `Discarded ${state.count} unsaved ${state.unit}.`;
  renderMaterialLab();
}

function resetSpriteAssetToApplied(asset) {
  asset.shadow = normalizeClientShadow(asset.appliedShadow);
  asset.footprint = normalizeClientFootprint(asset.appliedFootprint);
  asset.collision = asset.appliedCollision ?? "footprint";
  asset.collisionBounds = normalizeClientCollisionBounds(asset.appliedCollisionBounds, asset.footprint, asset.appliedCollisionTiles, asset.collision);
  asset.collisionTiles = normalizeClientCollisionTiles(asset.appliedCollisionTiles, asset.footprint, asset.collision, asset.collisionBounds);
  asset.anchor = normalizeClientAnchor(asset.appliedAnchor);
  asset.scale = normalizeClientScale(asset.appliedScale);
  shadowDraftDirtyIds.delete(asset.id);
  collisionDraftDirtyIds.delete(asset.id);
  footprintDraftDirtyIds.delete(asset.id);
  transformDraftDirtyIds.delete(asset.id);
}

function updateMaterialSaveBar() {
  const state = currentDraftState();
  materialUnsavedSummary.textContent = state.hasDraft
    ? `Unsaved changes: ${state.count} ${state.unit}`
    : "No unsaved changes";
  materialSaveFeedback.textContent = materialSaveFeedbackNote;
  materialDiscardChangesButton.disabled = !state.hasDraft || materialSaveInProgress;
  materialReviewChangesButton.disabled = !state.hasDraft || materialSaveInProgress;
  materialSaveChangesButton.disabled = !state.canSave;
  materialSaveChangesButton.textContent = materialSaveInProgress
    ? "Saving..."
    : state.hasDraft
      ? `Save ${state.count} ${state.unit}`
      : "Save changes";
  materialUndoSaveButton.disabled = !state.canRollback;
  materialReviewSaveButton.disabled = !state.canSave;
  materialNavigationSaveButton.disabled = !state.canSave;
}

function openMaterialReview() {
  const state = currentDraftState();
  if (!state.hasDraft) return;
  materialReviewTitle.textContent = `${state.count} unsaved ${state.unit}`;
  materialReviewList.replaceChildren();
  if (state.mode === "spriteProps") {
    for (const asset of currentSpriteDirtyAssets()) {
      materialReviewList.append(materialReviewGroup(
        `${currentSpriteCategory()} / ${asset.label ?? asset.id}`,
        spritePropDiffEntries(asset).map((entry) => formatSpriteDiffEntry(entry, true)),
      ));
    }
  } else {
    const editorState = currentProceduralEditorState();
    for (const elementId of editorState.dirtyIds) {
      const definition = proceduralElementDefinition(elementId);
      materialReviewList.append(materialReviewGroup(
        `${editorState.targetLabel} / ${definition?.label ?? elementId}`,
        proceduralDiffEntriesForElement(elementId, editorState).map((entry) => formatProceduralDiffEntry(entry)),
      ));
    }
  }
  materialReviewDialog.showModal();
}

function materialReviewGroup(title, entries) {
  const group = document.createElement("div");
  group.className = "material-review-group";
  const heading = document.createElement("strong");
  heading.textContent = title;
  group.append(heading);
  for (const text of entries.length > 0 ? entries : ["Draft state changed; no scalar diff was produced."]) {
    const row = document.createElement("span");
    row.textContent = text;
    group.append(row);
  }
  return group;
}

async function undoCurrentMaterialSave() {
  if (materialSaveInProgress) return;
  materialSaveInProgress = true;
  updateMaterialSaveBar();
  try {
    if (currentMode() === "proceduralElements") await rollbackProceduralParams();
    else await rollbackLastShadowApply();
    materialSaveFeedbackNote = "The last save in this scope was rolled back.";
  } finally {
    materialSaveInProgress = false;
    renderMaterialLab();
  }
}

function selectSpriteBrowserAsset(category, assetId) {
  const nextProp = propStoreDefinition(category).propValue;
  if (activeMaterialProp === nextProp) {
    selectedMaterialSpriteIds[category] = assetId;
    materialSpriteSelect.value = assetId;
    syncMaterialSpriteEditor();
    renderMaterialLab();
    return;
  }
  requestMaterialTransition(`Switch from ${currentSpriteCategory()} to ${category}?`, async () => {
    activeMaterialProp = nextProp;
    materialPropSelect.value = activeMaterialProp;
    selectedMaterialSpriteIds[category] = assetId;
    materialCategoryFilter.value = category;
    propsPersistence = await detectPropsPersistence(category);
    shadowSaveStatusNote = propsPersistence.note;
    renderMaterialLab();
  });
}

function requestMaterialMode(nextMode) {
  if (nextMode === currentMode()) return;
  requestMaterialTransition(`Switch to ${nextMode === "proceduralElements" ? "Procedural Elements" : "Props"}?`, () => {
    activeMaterialMode = nextMode;
    materialModeSelect.value = nextMode;
    renderMaterialLab();
  });
}

function requestProceduralScope(nextScope) {
  if (nextScope === proceduralEditScope()) return;
  requestMaterialTransition(`Switch to ${nextScope === "biome" ? "Environment override" : "Global defaults"}?`, () => {
    activeProceduralScope = nextScope;
    proceduralScopeSelect.value = nextScope;
    renderMaterialLab();
  });
}

function requestProceduralBiome(nextBiomeId) {
  if (nextBiomeId === selectedProceduralBiomeId) return;
  requestMaterialTransition(`Switch biome scope to ${nextBiomeId}?`, () => {
    selectedProceduralBiomeId = nextBiomeId;
    proceduralBiomeSelect.value = nextBiomeId;
    renderMaterialLab();
  });
}

function requestMaterialTransition(message, transition) {
  if (!currentDraftState().hasDraft) {
    try {
      const result = transition();
      Promise.resolve(result).catch((error) => {
        materialSaveFeedbackNote = `Navigation failed: ${error.message}`;
        renderMaterialLab();
      });
    } catch (error) {
      materialSaveFeedbackNote = `Navigation failed: ${error.message}`;
      renderMaterialLab();
    }
    return;
  }
  pendingMaterialTransition = transition;
  materialNavigationMessage.textContent = `${message} Save or discard the current draft first.`;
  updateMaterialSaveBar();
  materialNavigationDialog.showModal();
}

async function continuePendingMaterialTransition(strategy) {
  const transition = pendingMaterialTransition;
  if (!transition) {
    materialNavigationDialog.close();
    return;
  }
  if (strategy === "save") {
    const saved = await saveCurrentMaterialDraft();
    if (!saved) return;
  } else if (strategy === "discard") {
    discardCurrentMaterialDraft();
  } else {
    pendingMaterialTransition = null;
    materialNavigationDialog.close();
    return;
  }
  pendingMaterialTransition = null;
  materialNavigationDialog.close();
  await transition();
}

function selectedProceduralDefinition() {
  return proceduralElementDefinition(selectedProceduralElementId) ?? PROCEDURAL_ELEMENT_DEFINITIONS[0] ?? null;
}

function selectedProceduralRecipe() {
  return proceduralBiomeRecipes.find((recipe) => recipe.id === selectedProceduralBiomeId)
    ?? proceduralBiomeRecipes[0]
    ?? fallbackBiomeRecipe();
}

function selectedProceduralAppliedRecipe() {
  return proceduralAppliedBiomeRecipes.find((recipe) => recipe.id === selectedProceduralBiomeId)
    ?? selectedProceduralRecipe();
}

function selectedProceduralValues() {
  const definition = selectedProceduralDefinition();
  if (!definition || !proceduralParams) return null;
  if (proceduralEditScope() === "biome") {
    return applyBiomeRecipeToProceduralParams(proceduralParams, selectedProceduralRecipe()).elements[definition.id] ?? null;
  }
  return proceduralParams.elements[definition.id] ?? null;
}

function selectedProceduralAppliedValues() {
  const definition = selectedProceduralDefinition();
  if (!definition) return null;
  const appliedParams = proceduralAppliedParams ?? proceduralParams;
  if (!appliedParams) return null;
  if (proceduralEditScope() === "biome") {
    return applyBiomeRecipeToProceduralParams(appliedParams, selectedProceduralAppliedRecipe()).elements[definition.id] ?? null;
  }
  return appliedParams.elements[definition.id] ?? null;
}

function selectedProceduralBaseValues() {
  const definition = selectedProceduralDefinition();
  if (!definition || !proceduralParams) return null;
  return proceduralParams.elements[definition.id] ?? null;
}

function selectedProceduralOverrideValues() {
  const definition = selectedProceduralDefinition();
  if (!definition) return {};
  return selectedProceduralRecipe().elementOverrides?.[definition.id] ?? {};
}

function selectedProceduralAppliedOverrideValues() {
  const definition = selectedProceduralDefinition();
  if (!definition) return {};
  return selectedProceduralAppliedRecipe().elementOverrides?.[definition.id] ?? {};
}

function proceduralRecipeById(recipes, recipeId) {
  return recipes.find((recipe) => recipe.id === recipeId)
    ?? recipes[0]
    ?? fallbackBiomeRecipe();
}

function proceduralSaveModeLabel(scope = proceduralEditScope(), recipe = selectedProceduralRecipe()) {
  if (scope === "biome") return biomeRecipePersistsToJson() ? `${recipe.id}.recipe.json` : "unavailable";
  return proceduralPersistsToJson() ? "params.json" : "unavailable";
}

function currentProceduralEditorState(definition = selectedProceduralDefinition()) {
  const scope = proceduralEditScope();
  const biomeScope = scope === "biome";
  const recipe = biomeScope ? selectedProceduralRecipe() : null;
  const dirtySet = activeProceduralDirtyElementIds();
  const persists = activeProceduralPersistsToJson();
  const persistence = biomeScope ? biomeRecipePersistence : proceduralPersistence;
  const checking = persistence.mode === "checking";
  const rollbackAvailable = biomeScope
    ? Boolean(biomeRecipePersistence.rollbackAvailableById?.[recipe.id])
    : Boolean(proceduralPersistence.rollbackAvailable);
  const values = definition ? selectedProceduralValues() : null;
  const hasElement = Boolean(definition && values);
  let state = "loading";
  if (hasElement && dirtySet.size > 0) state = persists ? "draft" : "draft-blocked";
  else if (hasElement && rollbackAvailable) state = "rollback-ready";
  else if (hasElement && checking) state = "checking";
  else if (hasElement && !persists) state = "unavailable";
  else if (hasElement) state = "applied";

  return {
    state,
    scope,
    targetId: biomeScope ? recipe.id : "global",
    targetLabel: biomeScope ? recipe.label : "Global defaults",
    selectedElementId: definition?.id ?? null,
    selectedElementLabel: definition?.label ?? "none",
    dirtyIds: [...dirtySet],
    dirtyCount: dirtySet.size,
    hasDraft: dirtySet.size > 0,
    selectedDirty: definition ? dirtySet.has(definition.id) : false,
    hasElement,
    persists,
    checking,
    rollbackAvailable,
    canApply: hasElement && dirtySet.size > 0 && persists,
    canRollback: hasElement && rollbackAvailable && persists,
    saveMode: proceduralSaveModeLabel(scope, recipe ?? selectedProceduralRecipe()),
    serverVersion: biomeScope ? biomeRecipePersistence.serverVersion : proceduralPersistence.serverVersion,
    expectedVersion: biomeScope ? BIOME_RECIPES_VERSION : PROCEDURAL_PARAMS_VERSION,
    applyScope: biomeScope ? "current-biome-overrides" : "all-dirty-elements",
  };
}

function proceduralValuesForElement(elementId, scope, recipeId, paramsManifest, recipeList) {
  const definition = proceduralElementDefinition(elementId);
  if (!definition || !paramsManifest) return null;
  if (scope === "biome") {
    const recipe = proceduralRecipeById(recipeList, recipeId);
    return applyBiomeRecipeToProceduralParams(paramsManifest, recipe).elements[elementId] ?? null;
  }
  return paramsManifest.elements[elementId] ?? null;
}

function proceduralDiffEntriesForElement(elementId, state = currentProceduralEditorState()) {
  const definition = proceduralElementDefinition(elementId);
  if (!definition) return [];
  const baseParams = state.scope === "biome" ? (proceduralAppliedParams ?? proceduralParams) : proceduralAppliedParams;
  const beforeValues = proceduralValuesForElement(
    elementId,
    state.scope,
    state.targetId,
    baseParams,
    state.scope === "biome" ? proceduralAppliedBiomeRecipes : proceduralBiomeRecipes,
  );
  const afterValues = proceduralValuesForElement(
    elementId,
    state.scope,
    state.targetId,
    state.scope === "biome" ? baseParams : proceduralParams,
    state.scope === "biome" ? proceduralBiomeRecipes : proceduralBiomeRecipes,
  );
  if (!beforeValues || !afterValues) return [];
  return definition.controls
    .filter((control) => !proceduralControlValuesMatch(beforeValues[control.key], afterValues[control.key]))
    .map((control) => ({
      elementId,
      elementLabel: definition.label,
      key: control.key,
      label: control.label,
      control,
      before: beforeValues[control.key],
      after: afterValues[control.key],
    }));
}

function proceduralControlValuesMatch(before, after) {
  if (Number.isFinite(Number(before)) && Number.isFinite(Number(after))) {
    return Math.abs(Number(before) - Number(after)) < 0.000001;
  }
  return JSON.stringify(before) === JSON.stringify(after);
}

function selectedProceduralDiffEntries(state = currentProceduralEditorState()) {
  if (!state.selectedElementId) return [];
  return proceduralDiffEntriesForElement(state.selectedElementId, state);
}

function activeProceduralDiffEntries(state = currentProceduralEditorState()) {
  const elementIds = state.dirtyIds.length > 0
    ? state.dirtyIds
    : [state.selectedElementId].filter(Boolean);
  return elementIds.flatMap((elementId) => proceduralDiffEntriesForElement(elementId, state));
}

function formatProceduralDiffValue(value, control) {
  if (value === undefined) return "unset";
  if (value === null) return "null";
  if (Number.isFinite(Number(value))) return Number(value).toFixed(control?.digits ?? 3);
  return String(value);
}

function formatProceduralDiffEntry(entry, includeElement = false) {
  const name = includeElement ? `${entry.elementLabel}.${entry.label}` : entry.label;
  return `${name}: ${formatProceduralDiffValue(entry.before, entry.control)} -> ${formatProceduralDiffValue(entry.after, entry.control)}`;
}

function proceduralStateSummaryText(state) {
  const stateLabel = {
    "applied": "Applied",
    "checking": "Checking save server",
    "draft": "Draft",
    "draft-blocked": "Draft / save unavailable",
    "loading": "Loading",
    "rollback-ready": "Applied / rollback ready",
    "unavailable": "Save unavailable",
  }[state.state] ?? state.state;
  const saveLabel = state.saveMode === "unavailable" ? labUiText("save unavailable") : state.saveMode;
  const dirtyLabel = state.hasDraft
    ? currentLabLanguage() === "ja" ? `${state.dirtyCount}件に未保存の変更あり` : `${state.dirtyCount} dirty element${state.dirtyCount === 1 ? "" : "s"}`
    : labUiText("clean");
  const translatedState = labUiText(stateLabel);
  const translatedTarget = labUiText(state.targetLabel);
  const translatedElement = labUiText(state.selectedElementLabel);
  return currentLabLanguage() === "ja"
    ? `状態：${translatedState}｜適用範囲：${translatedTarget}｜対象：${translatedElement}｜変更：${dirtyLabel}｜保存先：${saveLabel}`
    : `State: ${translatedState} · Scope: ${translatedTarget} · Target: ${translatedElement} · Changes: ${dirtyLabel} · Save target: ${saveLabel}`;
}

function proceduralSaveStatusText(state) {
  const sourceNote = proceduralEditScope() === "biome" ? biomeRecipeSaveStatusNote : proceduralSaveStatusNote;
  if (state.checking) return labUiText("Checking save server");
  if (!state.persists || /(?:failed|error|unavailable)/i.test(sourceNote)) return labUiText(sourceNote);
  if (currentLabLanguage() === "ja") {
    return state.rollbackAvailable
      ? `保存先：${state.saveMode}｜直前の保存へ戻せます`
      : `保存先：${state.saveMode}`;
  }
  return state.rollbackAvailable
    ? `Save target: ${state.saveMode} · Undo last save is available`
    : `Save target: ${state.saveMode}`;
}

function proceduralDiffSummaryText(entries, state) {
  if (!state.hasElement) return "No procedural element selected";
  if (entries.length === 0) return state.hasDraft ? "No diff on selected element; draft exists elsewhere" : "No selected diff";
  const preview = entries.slice(0, 4).map((entry) => formatProceduralDiffEntry(entry)).join("; ");
  const more = entries.length > 4 ? `; +${entries.length - 4} more` : "";
  return `Selected diff: ${preview}${more}`;
}

function renderProceduralStatePanel(state = currentProceduralEditorState()) {
  if (proceduralStateSummary) proceduralStateSummary.textContent = proceduralStateSummaryText(state);
  if (proceduralDiffSummary) proceduralDiffSummary.textContent = proceduralDiffSummaryText(selectedProceduralDiffEntries(state), state);
  if (!proceduralApplyHistoryList) return;
  proceduralApplyHistoryList.replaceChildren();
  if (proceduralApplyHistory.length === 0) {
    const item = document.createElement("li");
    item.className = "is-empty";
    item.textContent = "No apply history this session";
    proceduralApplyHistoryList.append(item);
    return;
  }
  for (const entry of proceduralApplyHistory) {
    const item = document.createElement("li");
    item.textContent = proceduralApplyHistoryText(entry);
    proceduralApplyHistoryList.append(item);
  }
}

function recordProceduralApplyHistory({ action = "apply", state, diffEntries = [], rollbackAvailable = false }) {
  proceduralApplyHistory.unshift({
    timeLabel: formatHistoryTime(new Date()),
    action,
    scope: state.scope,
    targetLabel: state.targetLabel,
    selectedElementLabel: state.selectedElementLabel,
    dirtyIds: state.dirtyIds,
    diffCount: diffEntries.length,
    diffPreview: diffEntries.slice(0, 3).map((entry) => formatProceduralDiffEntry(entry, true)),
    rollbackAvailable: Boolean(rollbackAvailable),
  });
  while (proceduralApplyHistory.length > PROCEDURAL_APPLY_HISTORY_LIMIT) proceduralApplyHistory.pop();
}

function proceduralApplyHistoryText(entry) {
  const actionLabel = entry.action === "rollback" ? "Rollback" : "Apply";
  const elementLabel = entry.dirtyIds.length > 0
    ? `${entry.dirtyIds.length} element${entry.dirtyIds.length === 1 ? "" : "s"}`
    : entry.selectedElementLabel;
  const changeLabel = `${entry.diffCount} change${entry.diffCount === 1 ? "" : "s"}`;
  const rollbackLabel = entry.rollbackAvailable ? " / rollback available" : "";
  const preview = entry.diffPreview.length > 0 ? ` / ${entry.diffPreview.join("; ")}` : "";
  return `${entry.timeLabel} ${actionLabel} ${entry.targetLabel} / ${elementLabel} / ${changeLabel}${rollbackLabel}${preview}`;
}

function formatHistoryTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function proceduralJsonSnapshot(definition, values, state = currentProceduralEditorState(definition)) {
  const selectedDiff = selectedProceduralDiffEntries(state).map((entry) => ({
    key: entry.key,
    label: entry.label,
    before: entry.before,
    after: entry.after,
  }));
  return {
    id: definition.id,
    label: definition.label,
    group: definition.group,
    scope: state.scope,
    biome: state.scope === "biome" ? selectedProceduralRecipe().id : null,
    state: state.state,
    stateModel: {
      selectedState: state.selectedDirty ? "draft-preview" : state.state,
      hasDraft: state.hasDraft,
      dirtyCount: state.dirtyCount,
      canApply: state.canApply,
      canRollback: state.canRollback,
    },
    saveMode: state.saveMode,
    serverVersion: state.serverVersion,
    expectedVersion: state.expectedVersion,
    rollbackAvailable: state.rollbackAvailable,
    dirtyElements: state.dirtyIds,
    applyScope: state.applyScope,
    selectedDiff,
    overrides: state.scope === "biome" ? selectedProceduralOverrideValues() : undefined,
    inheritedFromGlobal: state.scope === "biome" ? selectedProceduralBaseValues() : undefined,
    values,
  };
}

function updateProceduralJsonPreview(definition = selectedProceduralDefinition(), values = selectedProceduralValues(), state = currentProceduralEditorState(definition)) {
  renderProceduralStatePanel(state);
  if (!definition || !values) {
    proceduralParamsJson.value = "";
    return;
  }
  proceduralParamsJson.value = JSON.stringify(proceduralJsonSnapshot(definition, values, state), null, 2);
}

function syncProceduralEditor() {
  proceduralEditor.hidden = currentMode() !== "proceduralElements";
  updateMaterialLatestWarning();
  if (proceduralEditor.hidden) return;

  const existingOptions = [...proceduralElementSelect.options].map((option) => option.value).join("|");
  const nextOptions = PROCEDURAL_ELEMENT_DEFINITIONS.map((definition) => definition.id).join("|");
  if (existingOptions !== nextOptions) {
    proceduralElementSelect.replaceChildren();
    for (const definition of PROCEDURAL_ELEMENT_DEFINITIONS) {
      const option = document.createElement("option");
      option.value = definition.id;
      option.textContent = definition.label;
      proceduralElementSelect.append(option);
    }
  }

  if (!selectedProceduralElementId || !proceduralElementDefinition(selectedProceduralElementId)) {
    selectedProceduralElementId = PROCEDURAL_ELEMENT_DEFINITIONS[0]?.id ?? null;
  }
  if (selectedProceduralElementId) proceduralElementSelect.value = selectedProceduralElementId;
  syncProceduralBiomeSelect();
  updateProceduralControls();
}

function syncProceduralBiomeSelect() {
  if (!proceduralBiomeSelect) return;
  const existingOptions = [...proceduralBiomeSelect.options].map((option) => option.value).join("|");
  const nextOptions = proceduralBiomeRecipes.map((recipe) => recipe.id).join("|");
  if (existingOptions !== nextOptions) {
    proceduralBiomeSelect.replaceChildren();
    for (const recipe of proceduralBiomeRecipes) {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.label;
      proceduralBiomeSelect.append(option);
    }
  }
  if (!proceduralBiomeRecipes.some((recipe) => recipe.id === selectedProceduralBiomeId)) {
    selectedProceduralBiomeId = proceduralBiomeRecipes[0]?.id ?? "grassland";
  }
  proceduralBiomeSelect.value = selectedProceduralBiomeId;
}

function updateProceduralControls() {
  const definition = selectedProceduralDefinition();
  const values = selectedProceduralValues();
  const hasElement = Boolean(definition && values);
  const state = currentProceduralEditorState(definition);
  proceduralElementSelect.disabled = !hasElement;
  if (proceduralBiomeSelect) proceduralBiomeSelect.disabled = !hasElement;
  if (proceduralScopeSelect) proceduralScopeSelect.disabled = !hasElement;
  proceduralApplyButton.disabled = !state.canApply;
  proceduralResetButton.disabled = !hasElement;
  updateFineGrassBakeUi(definition);
  proceduralControlGrid.replaceChildren();
  updateProceduralPersistenceUi();

  if (!hasElement) {
    updateProceduralJsonPreview(definition, values, state);
    return;
  }

  const overrideValues = selectedProceduralOverrideValues();
  const diffByKey = new Map(selectedProceduralDiffEntries(state).map((entry) => [entry.key, entry]));
  for (const control of definition.controls) {
    const value = values[control.key];
    const label = document.createElement("div");
    label.className = "range-control";
    label.dataset.proceduralControlKey = control.key;
    const row = document.createElement("span");
    const text = document.createElement("span");
    const inherited = proceduralEditScope() === "biome" && !Object.prototype.hasOwnProperty.call(overrideValues, control.key);
    text.textContent = proceduralEditScope() === "biome"
      ? `${control.label} ${inherited ? "[inherited]" : "[override]"}`
      : control.label;
    const output = document.createElement("output");
    output.textContent = formatControlValue(control, value);
    row.append(text, output);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(value);
    input.addEventListener("input", () => {
      setSelectedProceduralControlValue(control.key, Number(input.value));
    });
    label.append(row, input);
    bindMaterialRangeNumberInput(input, control.label);
    const diff = diffByKey.get(control.key);
    if (diff) {
      label.classList.add("is-dirty");
      label.title = formatProceduralDiffEntry(diff);
    }
    proceduralControlGrid.append(label);
  }

  updateProceduralJsonPreview(definition, values, state);
  proceduralApplyButton.textContent = proceduralEditScope() === "biome" ? "Apply environment override" : "Apply all params";
  proceduralResetButton.textContent = proceduralEditScope() === "biome" ? "Reset override" : "Reset params";
  proceduralRollbackButton.textContent = proceduralEditScope() === "biome" ? "Rollback recipe" : "Rollback params";
  proceduralApplyButton.disabled = !state.canApply;
  updateFineGrassBakeUi(definition);
  updateProceduralStatusBadgesScoped(state);
}

function updateFineGrassBakeUi(definition = selectedProceduralDefinition()) {
  const isFineGrass = currentMode() === "proceduralElements" && definition?.id === "fine-grass-strokes" && proceduralParams;
  if (proceduralBakeSection) proceduralBakeSection.hidden = !isFineGrass;
  if (proceduralBakeStatus) {
    const recipe = selectedProceduralRecipe();
    proceduralBakeStatus.textContent = isFineGrass
      ? `${fineGrassBakeStatusNote} / target ${recipe.id} / ${fineGrassBakeBiomeFromRecipe(recipe)} / ${MAP_VIEW_BOUNDS.width}x${MAP_VIEW_BOUNDS.height}`
      : fineGrassBakeStatusNote;
  }
  if (proceduralBakeFineGrassButton) {
    proceduralBakeFineGrassButton.disabled = !isFineGrass
      || fineGrassBakePersistence.serverCurrent !== true
      || currentProceduralEditorState(definition).hasDraft
      || materialSaveInProgress;
    proceduralBakeFineGrassButton.title = currentProceduralEditorState(definition).hasDraft
      ? "Save or discard the current draft before baking."
      : "";
  }
}

function updateProceduralPersistenceUi() {
  const state = currentProceduralEditorState();
  proceduralSaveStatus.textContent = proceduralSaveStatusText(state);
  proceduralRollbackButton.disabled = !state.canRollback;
  updateMaterialLatestWarning();
  updateProceduralStatusBadgesScoped(state);
  renderProceduralStatePanel(state);
}

function updateProceduralStatusBadges() {
  updateProceduralStatusBadgesScoped();
}

function updateProceduralStatusBadgesScoped(state = currentProceduralEditorState()) {
  if (!proceduralSaveBadge || !proceduralDraftBadge || !proceduralRollbackBadge) return;
  setStatusBadge(
    proceduralSaveBadge,
    state.checking ? "checking" : state.persists ? "save ready" : "save unavailable",
    state.checking ? "is-muted" : state.persists ? "is-ok" : "is-danger",
  );
  setStatusBadge(
    proceduralDraftBadge,
    state.hasDraft ? `draft ${state.dirtyCount}` : "applied",
    state.hasDraft ? "is-draft" : "is-ok",
  );
  setStatusBadge(
    proceduralRollbackBadge,
    state.rollbackAvailable ? "rollback available" : "no rollback",
    state.rollbackAvailable ? "is-draft" : "is-muted",
  );
}

function updateProceduralDraftUi() {
  const definition = selectedProceduralDefinition();
  const values = selectedProceduralValues();
  if (!definition || !values) return;
  const state = currentProceduralEditorState(definition);
  const diffByKey = new Map(selectedProceduralDiffEntries(state).map((entry) => [entry.key, entry]));
  for (const control of definition.controls) {
    const row = proceduralControlGrid.querySelector(`[data-procedural-control-key="${control.key}"]`);
    const output = row?.querySelector("output");
    const input = row?.querySelector('input[type="range"]');
    const labelText = row?.firstElementChild?.firstElementChild;
    const value = values[control.key];
    const diff = diffByKey.get(control.key);
    row?.classList.toggle("is-dirty", Boolean(diff));
    if (row) row.title = diff ? formatProceduralDiffEntry(diff) : "";
    if (labelText && proceduralEditScope() === "biome") {
      const overrideValues = selectedProceduralOverrideValues();
      const inherited = !Object.prototype.hasOwnProperty.call(overrideValues, control.key);
      labelText.textContent = `${control.label} ${inherited ? "[inherited]" : "[override]"}`;
    } else if (labelText) {
      labelText.textContent = control.label;
    }
    if (output) output.textContent = formatControlValue(control, value);
    if (input && input.value !== String(value)) input.value = String(value);
    if (input) syncMaterialRangeNumberInput(input);
  }
  updateProceduralJsonPreview(definition, values, state);
  proceduralApplyButton.disabled = !state.canApply;
  updateProceduralStatusBadgesScoped(state);
  updateMaterialBrowserDraftMarkers();
  updateMaterialWorkspaceChrome();
}

function setSelectedProceduralControlValue(key, value) {
  const definition = selectedProceduralDefinition();
  if (!definition || !proceduralParams) return;
  if (proceduralEditScope() === "biome") {
    const controlValue = normalizeProceduralControlValue(definition.id, key, value);
    proceduralBiomeRecipes = proceduralBiomeRecipes.map((recipe) => {
      if (recipe.id !== selectedProceduralBiomeId) return recipe;
      const next = JSON.parse(JSON.stringify(recipe));
      next.elementOverrides ??= {};
      next.elementOverrides[definition.id] ??= {};
      next.elementOverrides[definition.id][key] = controlValue;
      return normalizeBiomeRecipe(next);
    });
    biomeOverrideDirtyElementIds.add(definition.id);
    updateProceduralDraftUi();
    scheduleProceduralDraftPreview();
    return;
  }
  proceduralParams = setProceduralParamValue(proceduralParams, definition.id, key, value);
  proceduralDirtyElementIds.add(definition.id);
  updateProceduralDraftUi();
  scheduleProceduralDraftPreview();
}

async function applySelectedProceduralParams() {
  const definition = selectedProceduralDefinition();
  if (!definition || !proceduralParams) return;
  if (proceduralEditScope() === "biome") {
    await applySelectedBiomeOverrides(definition);
    return;
  }
  if (!proceduralPersistsToJson()) {
    proceduralSaveStatusNote = "params save unavailable; start the latest lab server";
    proceduralDirtyElementIds.add(definition.id);
    updateProceduralControls();
    renderMaterialLab();
    return;
  }
  const applyState = currentProceduralEditorState(definition);
  const diffEntries = activeProceduralDiffEntries(applyState);
  proceduralApplyButton.disabled = true;
  proceduralSaveStatusNote = "saving params.json";
  updateProceduralPersistenceUi();

  try {
    const result = await postProceduralParamsApi("params", {
      params: proceduralParams,
    });
    proceduralParams = normalizeProceduralParamsManifest(result.params ?? proceduralParams);
    proceduralAppliedParams = cloneProceduralParamsManifest(proceduralParams);
    clearProceduralParamsOverride();
    proceduralPersistence.rollbackAvailable = Boolean(result.rollbackAvailable);
    proceduralSaveStatusNote = proceduralPersistence.rollbackAvailable
      ? `params.json saved: ${definition.id} / rollback available`
      : `params.json saved: ${definition.id}`;
    recordProceduralApplyHistory({
      state: applyState,
      diffEntries,
      rollbackAvailable: proceduralPersistence.rollbackAvailable,
    });
    proceduralDirtyElementIds.clear();
    notifyProceduralParamsChanged("params-applied", {
      id: definition.id,
    });
  } catch (error) {
    proceduralSaveStatusNote = `params.json save failed: ${error.message}`;
    proceduralDirtyElementIds.add(definition.id);
  }
  updateProceduralControls();
  renderMaterialLab();
}

async function bakeSelectedFineGrassLayer() {
  const definition = selectedProceduralDefinition();
  if (definition?.id !== "fine-grass-strokes" || !proceduralParams) return;
  if (currentProceduralEditorState(definition).hasDraft) {
    fineGrassBakeStatusNote = "save or discard the current draft before baking";
    updateFineGrassBakeUi(definition);
    return;
  }
  if (fineGrassBakePersistence.serverCurrent !== true) {
    fineGrassBakeStatusNote = "fine-grass bake unavailable; start the latest lab server";
    updateFineGrassBakeUi(definition);
    return;
  }

  const recipe = selectedProceduralRecipe();
  const recipeProceduralParams = applyBiomeRecipeToProceduralParams(proceduralParams, recipe);
  const fieldSeed = hashSeed(currentSeed(), LEGACY_MAP_SEED_SALT);
  const biome = fineGrassBakeBiomeFromRecipe(recipe);
  const descriptor = fineGrassBakeDescriptor({
    seed: fieldSeed,
    biome,
    widthTiles: MAP_VIEW_BOUNDS.width,
    heightTiles: MAP_VIEW_BOUNDS.height,
    tileSize: MAP_VIEW_BOUNDS.tileSize,
    proceduralParams: recipeProceduralParams,
  });
  const canvas = document.createElement("canvas");
  proceduralBakeFineGrassButton.disabled = true;
  fineGrassBakeStatusNote = `baking ${recipe.id} ${descriptor.widthTiles}x${descriptor.heightTiles}`;
  updateFineGrassBakeUi(definition);

  try {
    drawFineGrassBake(canvas, {
      seed: fieldSeed,
      preset: recipe.preset,
      biome,
      proceduralParams: recipeProceduralParams,
    });
    const pngBase64 = await canvasToPngBase64(canvas);
    const result = await postFineGrassBakeApi("bake", {
      entry: {
        ...descriptor,
        rawSeed: currentSeed(),
        recipeId: recipe.id,
        preset: recipe.preset,
      },
      pngBase64,
    });
    const hasDraft = activeProceduralDirtyElementIds().has("fine-grass-strokes");
    fineGrassBakeStatusNote = `baked ${result.entry?.file ?? descriptor.key}${hasDraft ? " / apply params or recipe for Map View match" : ""}`;
    notifyFineGrassBakesChanged("bake-applied", {
      key: descriptor.key,
      biome,
      recipeId: recipe.id,
    });
  } catch (error) {
    fineGrassBakeStatusNote = `fine-grass bake failed: ${error.message}`;
  }
  updateFineGrassBakeUi(definition);
  renderMaterialLab();
}

function canvasToPngBase64(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("canvas PNG encode failed"));
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const text = String(reader.result ?? "");
        resolve(text.replace(/^data:image\/png;base64,/, ""));
      });
      reader.addEventListener("error", () => reject(new Error("PNG read failed")));
      reader.readAsDataURL(blob);
    }, "image/png");
  });
}

async function applySelectedBiomeOverrides(definition) {
  if (!biomeRecipePersistsToJson()) {
    biomeRecipeSaveStatusNote = "biome recipe save unavailable; start the latest lab server";
    biomeOverrideDirtyElementIds.add(definition.id);
    updateProceduralControls();
    renderMaterialLab();
    return;
  }
  const recipe = selectedProceduralRecipe();
  const applyState = currentProceduralEditorState(definition);
  const diffEntries = activeProceduralDiffEntries(applyState);
  proceduralApplyButton.disabled = true;
  biomeRecipeSaveStatusNote = `saving ${recipe.id}.recipe.json`;
  updateProceduralPersistenceUi();

  try {
    const result = await postBiomeRecipeApi(`${recipe.id}/recipe`, {
      recipe,
    });
    const savedRecipe = normalizeBiomeRecipe(result.recipe ?? recipe);
    proceduralBiomeRecipes = proceduralBiomeRecipes.map((entry) => (entry.id === savedRecipe.id ? savedRecipe : entry));
    proceduralAppliedBiomeRecipes = proceduralAppliedBiomeRecipes.map((entry) => (entry.id === savedRecipe.id ? JSON.parse(JSON.stringify(savedRecipe)) : entry));
    biomeRecipePersistence.rollbackAvailableById = {
      ...biomeRecipePersistence.rollbackAvailableById,
      [savedRecipe.id]: Boolean(result.rollbackAvailable),
    };
    biomeRecipeSaveStatusNote = result.rollbackAvailable
      ? `${savedRecipe.id}.recipe.json saved: ${definition.id} / rollback available`
      : `${savedRecipe.id}.recipe.json saved: ${definition.id}`;
    recordProceduralApplyHistory({
      state: applyState,
      diffEntries,
      rollbackAvailable: Boolean(result.rollbackAvailable),
    });
    biomeOverrideDirtyElementIds.clear();
    notifyBiomeRecipesChanged("recipe-applied", {
      id: savedRecipe.id,
      elementId: definition.id,
    });
  } catch (error) {
    biomeRecipeSaveStatusNote = `recipe save failed: ${error.message}`;
    biomeOverrideDirtyElementIds.add(definition.id);
  }
  updateProceduralControls();
  renderMaterialLab();
}

function resetSelectedProceduralParams() {
  const definition = selectedProceduralDefinition();
  if (!definition || !proceduralParams || !proceduralAppliedParams) return;
  if (proceduralEditScope() === "biome") {
    proceduralBiomeRecipes = proceduralBiomeRecipes.map((recipe) => {
      if (recipe.id !== selectedProceduralBiomeId) return recipe;
      const next = JSON.parse(JSON.stringify(recipe));
      if (next.elementOverrides?.[definition.id]) {
        delete next.elementOverrides[definition.id];
        if (Object.keys(next.elementOverrides).length === 0) next.elementOverrides = {};
      }
      return normalizeBiomeRecipe(next);
    });
    biomeOverrideDirtyElementIds.add(definition.id);
    biomeRecipeSaveStatusNote = `override reset draft: ${selectedProceduralBiomeId}/${definition.id}`;
    updateProceduralControls();
    renderMaterialLab();
    return;
  }
  proceduralParams = cloneProceduralParamsManifest(proceduralParams);
  proceduralParams.elements[definition.id] = { ...proceduralAppliedParams.elements[definition.id] };
  proceduralDirtyElementIds.delete(definition.id);
  proceduralSaveStatusNote = `draft reset: ${definition.id}`;
  updateProceduralControls();
  renderMaterialLab();
}

async function rollbackProceduralParams() {
  if (proceduralEditScope() === "biome") {
    await rollbackBiomeRecipe();
    return;
  }
  if (!proceduralPersistsToJson() || !proceduralPersistence.rollbackAvailable) return;
  const rollbackState = currentProceduralEditorState();
  proceduralRollbackButton.disabled = true;
  proceduralSaveStatusNote = "rolling back params.json";
  updateProceduralPersistenceUi();
  try {
    await postProceduralParamsApi("rollback");
    proceduralPersistence.rollbackAvailable = false;
    proceduralSaveStatusNote = "params.json rolled back";
    recordProceduralApplyHistory({
      action: "rollback",
      state: rollbackState,
      rollbackAvailable: false,
    });
    await reloadProceduralParams();
    notifyProceduralParamsChanged("params-rollback");
  } catch (error) {
    proceduralPersistence.rollbackAvailable = true;
    proceduralSaveStatusNote = `rollback failed: ${error.message}`;
  }
  updateProceduralPersistenceUi();
  renderMaterialLab();
}

async function rollbackBiomeRecipe() {
  const recipe = selectedProceduralRecipe();
  if (!biomeRecipePersistsToJson() || !biomeRecipePersistence.rollbackAvailableById?.[recipe.id]) return;
  const rollbackState = currentProceduralEditorState();
  proceduralRollbackButton.disabled = true;
  biomeRecipeSaveStatusNote = `rolling back ${recipe.id}.recipe.json`;
  updateProceduralPersistenceUi();
  try {
    await postBiomeRecipeApi(`${recipe.id}/rollback`);
    biomeRecipePersistence.rollbackAvailableById = {
      ...biomeRecipePersistence.rollbackAvailableById,
      [recipe.id]: false,
    };
    biomeRecipeSaveStatusNote = `${recipe.id}.recipe.json rolled back`;
    recordProceduralApplyHistory({
      action: "rollback",
      state: rollbackState,
      rollbackAvailable: false,
    });
    await reloadBiomeRecipes();
    notifyBiomeRecipesChanged("recipe-rollback", {
      id: recipe.id,
    });
  } catch (error) {
    biomeRecipePersistence.rollbackAvailableById = {
      ...biomeRecipePersistence.rollbackAvailableById,
      [recipe.id]: true,
    };
    biomeRecipeSaveStatusNote = `recipe rollback failed: ${error.message}`;
  }
  updateProceduralPersistenceUi();
  renderMaterialLab();
}

function drawMaterialProceduralPreview(canvas) {
  if (currentPreviewMode() === "beforeAfter") {
    drawProceduralBeforeAfterPreview(canvas);
    return;
  }
  drawProceduralPreview(canvas);
}

function drawProceduralBeforeAfterPreview(canvas) {
  const definition = selectedProceduralDefinition();
  const beforeValues = selectedProceduralAppliedValues();
  const afterValues = selectedProceduralValues();
  if (!definition || !beforeValues || !afterValues) {
    drawProceduralPreview(canvas);
    return;
  }

  const beforeCanvas = drawProceduralPreviewToTempCanvas(beforeValues, "applied");
  const afterCanvas = drawProceduralPreviewToTempCanvas(afterValues, activeProceduralDirtyElementIds().has(definition.id) ? "draft-preview" : "current");
  drawBeforeAfterSplit(canvas, beforeCanvas, afterCanvas, "Applied", "Draft");
}

function drawProceduralPreviewToTempCanvas(values, stateLabel) {
  const canvas = document.createElement("canvas");
  canvas.width = materialLabCanvas.width;
  canvas.height = materialLabCanvas.height;
  drawProceduralPreview(canvas, { values, stateLabel });
  return canvas;
}

function drawProceduralPreview(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  drawProceduralBackground(ctx, width, height, materialBackgroundSelect.value);
  const definition = selectedProceduralDefinition();
  const values = options.values ?? selectedProceduralValues();
  if (!definition || !values) {
    ctx.fillStyle = "#d6d0b8";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText("procedural params loading", 42, 62);
    return;
  }

  const rng = makePreviewRng(proceduralPreviewSeed(definition, values));
  ctx.save();
  if (definition.id === "high-terrace-top") drawHighTerraceTopPreview(ctx, width, height, values, rng);
  else if (definition.id === "high-terrace-cliff-face") drawHighTerraceCliffPreview(ctx, width, height, values, rng);
  else if (definition.id === "low-terrace-top") drawLowTerraceTopPreview(ctx, width, height, values, rng);
  else if (definition.id === "low-terrace-soil-edge") drawLowTerraceSoilEdgePreview(ctx, width, height, values, rng);
  else if (definition.id === "dirt-smudge") drawDirtSmudgePreview(ctx, width, height, values, rng);
  else if (definition.id === "grass-plane-light") drawGrassPlaneLightPreview(ctx, width, height, values, rng);
  else if (definition.id === "dense-grass") drawDenseGrassPreview(ctx, width, height, values, rng);
  else if (definition.id === "fine-grass-strokes") drawFineGrassStrokesPreview(ctx, width, height, values, rng, proceduralPreviewSeed(definition, values));
  else if (definition.id === "dungeon-floor") drawDungeonFloorPreview(ctx, width, height, values, rng, proceduralPreviewSeed(definition, values));
  else if (definition.id === "dungeon-wall") drawDungeonWallPreview(ctx, width, height, values, rng, proceduralPreviewSeed(definition, values));
  else if (definition.id === "dungeon-floor-wear") drawDungeonFloorWearPreview(ctx, width, height, values, rng);
  else if (definition.id === "dungeon-floor-moisture") drawDungeonFloorMoisturePreview(ctx, width, height, values, rng);
  else if (definition.id === "dungeon-wall-cracks") drawDungeonWallCracksPreview(ctx, width, height, values, rng);
  else if (definition.id === "dungeon-wall-moisture") drawDungeonWallMoisturePreview(ctx, width, height, values, rng);
  else if (definition.id === "dungeon-torch-warmth") drawDungeonTorchWarmthPreview(ctx, width, height, values, rng);
  else drawMeadowBedPreview(ctx, width, height, values, rng);
  ctx.restore();

  ctx.fillStyle = "rgba(15, 18, 13, 0.66)";
  ctx.fillRect(20, height - 76, width - 40, 48);
  ctx.fillStyle = "#ece8d8";
  ctx.font = "16px Segoe UI, sans-serif";
  ctx.fillText(definition.label, 42, height - 46);
  ctx.fillStyle = "#b5b09c";
  ctx.font = "13px Segoe UI, sans-serif";
  const stateLabel = options.stateLabel ?? (activeProceduralDirtyElementIds().has(definition.id) ? "draft-preview" : "applied");
  ctx.fillText(`basis preview only / ${stateLabel}`, 42, height - 24);
}

function drawBeforeAfterSplit(targetCanvas, beforeCanvas, afterCanvas, beforeLabel, afterLabel) {
  const ctx = targetCanvas.getContext("2d");
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const split = Math.floor(width / 2);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(beforeCanvas, 0, 0, split, height, 0, 0, split, height);
  ctx.drawImage(afterCanvas, split, 0, width - split, height, split, 0, width - split, height);
  ctx.save();
  ctx.strokeStyle = "rgba(255, 230, 164, 0.78)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(split + 0.5, 0);
  ctx.lineTo(split + 0.5, height);
  ctx.stroke();
  drawSplitPreviewBadge(ctx, beforeLabel, 24, 24);
  drawSplitPreviewBadge(ctx, afterLabel, split + 24, 24);
  ctx.restore();
}

function drawSplitPreviewBadge(ctx, text, x, y) {
  ctx.save();
  ctx.font = "700 13px Segoe UI, sans-serif";
  const width = Math.ceil(ctx.measureText(text).width) + 20;
  ctx.fillStyle = "rgba(14, 16, 12, 0.78)";
  ctx.fillRect(x, y, width, 26);
  ctx.strokeStyle = "rgba(255, 230, 164, 0.34)";
  ctx.strokeRect(x + 0.5, y + 0.5, width, 26);
  ctx.fillStyle = "#ffe6a4";
  ctx.fillText(text, x + 10, y + 18);
  ctx.restore();
}

function drawProceduralBackground(ctx, width, height, background) {
  const colors = {
    grass: ["#385a35", "#233a27"],
    dirt: ["#5a4930", "#35291d"],
    neutral: ["#33362f", "#1f221d"],
    checker: ["#2a2d27", "#181b17"],
  };
  if (background === "checker") {
    const size = 48;
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? colors.checker[0] : colors.checker[1];
        ctx.fillRect(x, y, size, size);
      }
    }
    return;
  }
  const [top, bottom] = colors[background] ?? colors.grass;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawHighTerraceTopPreview(ctx, width, height, values, rng) {
  const opacity = clamp(valueOf(values, "opacity", 1), 0, 1);
  const brightness = valueOf(values, "brightness", 1);
  const saturation = valueOf(values, "saturation", 1);
  const edgeNoise = valueOf(values, "edgeNoise", 0.5);
  const grassDetail = valueOf(values, "grassDetail", 1);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = colorFromHsl(104, 32 * saturation, 38 * brightness);
  drawNoisyBlob(ctx, width * 0.5, height * 0.42, width * 0.32, height * 0.2, edgeNoise, rng);
  ctx.fill();
  ctx.strokeStyle = colorFromHsl(96, 26 * saturation, 28 * brightness);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.lineCap = "round";
  const detailCount = Math.max(0, Math.round(44 * grassDetail));
  for (let i = 0; i < detailCount; i += 1) {
    const x = width * (0.24 + rng() * 0.52);
    const y = height * (0.28 + rng() * 0.27);
    const length = 5 + rng() * 14;
    ctx.strokeStyle = rng() > 0.45
      ? colorFromHsl(85, 36 * saturation, 58 * brightness, 0.32)
      : colorFromHsl(112, 30 * saturation, 22 * brightness, 0.28);
    ctx.lineWidth = 0.8 + rng() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 8, y - length);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHighTerraceCliffPreview(ctx, width, height, values, rng) {
  const opacity = clamp(valueOf(values, "opacity", 1), 0, 1);
  const brightness = valueOf(values, "brightness", 1);
  const saturation = valueOf(values, "saturation", 1);
  const edgeNoise = valueOf(values, "edgeNoise", 0.5);
  const warmth = valueOf(values, "soilWarmth", 0.5);
  const strata = valueOf(values, "strata", 1);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = colorFromHsl(34 + warmth * 14, 22 * saturation, 30 * brightness);
  drawNoisyBlob(ctx, width * 0.5, height * 0.48, width * 0.34, height * 0.18, edgeNoise, rng);
  ctx.fill();
  ctx.strokeStyle = colorFromHsl(34 + warmth * 14, 20 * saturation, 21 * brightness);
  ctx.lineWidth = 7;
  ctx.stroke();
  for (let i = 0; i < Math.round(20 * strata); i += 1) {
    const x = width * (0.25 + rng() * 0.5);
    const y = height * (0.34 + rng() * 0.28);
    ctx.strokeStyle = `rgba(34, 28, 20, ${0.18 + rng() * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 28, y + 18 + rng() * 42);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLowTerraceTopPreview(ctx, width, height, values, rng) {
  const opacity = clamp(valueOf(values, "opacity", 1), 0, 1);
  const brightness = valueOf(values, "brightness", 1);
  const saturation = valueOf(values, "saturation", 1);
  const edgeNoise = valueOf(values, "edgeNoise", 0.5);
  const grassDetail = valueOf(values, "grassDetail", 1);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = colorFromHsl(98, 30 * saturation, 34 * brightness, 0.76);
  drawNoisyBlob(ctx, width * 0.5, height * 0.42, width * 0.32, height * 0.16, 0.28 + edgeNoise * 0.18, rng);
  ctx.fill();
  ctx.strokeStyle = colorFromHsl(96, 28 * saturation, 27 * brightness, 0.34);
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineCap = "round";
  const detailCount = Math.max(0, Math.round(62 * grassDetail));
  for (let i = 0; i < detailCount; i += 1) {
    const x = width * (0.24 + rng() * 0.52);
    const y = height * (0.31 + rng() * 0.23);
    const length = 4 + rng() * 12;
    ctx.strokeStyle = rng() > 0.45
      ? colorFromHsl(85, 36 * saturation, 58 * brightness, 0.32)
      : colorFromHsl(112, 30 * saturation, 22 * brightness, 0.28);
    ctx.lineWidth = 0.8 + rng() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 8, y - length);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLowTerraceSoilEdgePreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const brightness = valueOf(values, "brightness", 1);
  const warmth = valueOf(values, "soilWarmth", 0.5);
  const edgeNoise = valueOf(values, "edgeNoise", 0.5);
  const grassDetail = valueOf(values, "grassDetail", 1);
  const cx = width * 0.5;
  const cy = height * 0.42;
  const rx = width * 0.32;
  const ry = height * 0.16;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = colorFromHsl(98, 30, 34, 0.46);
  drawNoisyBlob(ctx, cx, cy, rx, ry, 0.34, rng);
  ctx.fill();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const points = Math.max(10, Math.round(12 + edgeNoise * 10));
  const top = [];
  const bottom = [];
  for (let i = 0; i <= points; i += 1) {
    const t = i / points;
    const theta = Math.PI * (0.1 + t * 0.8);
    const noise = (rng() - 0.5) * edgeNoise;
    const x = cx + Math.cos(theta) * rx * (0.94 + noise * 0.06);
    const y = cy + Math.sin(theta) * ry * (0.92 + noise * 0.08);
    const depth = (18 + Math.sin(t * Math.PI) * 24) * (0.82 + edgeNoise * 0.32);
    top.push({ x: x + noise * 8, y: y + noise * 4 });
    bottom.push({ x: x + (rng() - 0.5) * 10 * edgeNoise, y: y + depth + (rng() - 0.5) * 8 * edgeNoise });
  }

  ctx.globalAlpha = clamp(0.36 * opacity, 0, 1);
  ctx.fillStyle = colorFromHsl(28 + warmth * 18, 28, 30 * brightness);
  drawPreviewBandPath(ctx, top, bottom);
  ctx.fill();

  ctx.globalAlpha = clamp(0.2 * opacity, 0, 1);
  ctx.fillStyle = colorFromHsl(28 + warmth * 18, 24, 18 * brightness);
  drawPreviewBandPath(ctx, top, bottom.map((point) => ({ x: point.x, y: point.y + 7 })));
  ctx.fill();

  ctx.globalAlpha = clamp(0.24 * opacity, 0, 1);
  ctx.strokeStyle = colorFromHsl(26 + warmth * 16, 28, 16 * brightness);
  ctx.lineWidth = 4;
  drawPreviewPointLine(ctx, bottom);

  const strataCount = Math.max(1, Math.round(1 + edgeNoise * 3));
  for (let layer = 0; layer < strataCount; layer += 1) {
    const f = (layer + 1) / (strataCount + 2);
    const line = top.map((point, index) => ({
      x: point.x + (bottom[index].x - point.x) * f + (rng() - 0.5) * 3 * edgeNoise,
      y: point.y + (bottom[index].y - point.y) * f + (rng() - 0.5) * 2,
    }));
    ctx.globalAlpha = clamp((0.13 + rng() * 0.08) * opacity, 0, 1);
    ctx.strokeStyle = colorFromHsl(rng() > 0.5 ? 38 + warmth * 12 : 27 + warmth * 16, 24, rng() > 0.5 ? 48 * brightness : 22 * brightness);
    ctx.lineWidth = 0.7 + rng() * 0.7;
    drawPreviewPointLine(ctx, line);
  }

  ctx.globalAlpha = clamp(0.28 * grassDetail * opacity, 0, 1);
  ctx.strokeStyle = colorFromHsl(82, 34, 56 * brightness);
  ctx.lineWidth = 1.5;
  drawPreviewPointLine(ctx, top.map((point) => ({ x: point.x, y: point.y - 2 })));

  const grassCount = Math.max(0, Math.round(86 * grassDetail));
  for (let i = 0; i < grassCount; i += 1) {
    const point = top[Math.floor(rng() * top.length)];
    const x = point.x + (rng() - 0.5) * 14;
    const y = point.y + (rng() - 0.5) * 6;
    ctx.globalAlpha = clamp((0.22 + rng() * 0.28) * opacity, 0, 1);
    ctx.strokeStyle = rng() > 0.48 ? colorFromHsl(82, 38, 58 * brightness) : colorFromHsl(112, 28, 23 * brightness);
    ctx.lineWidth = 0.8 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x + (rng() - 0.5) * 10, y - (5 + rng() * 16));
    ctx.stroke();
  }
  ctx.restore();
}

function drawPreviewBandPath(ctx, top, bottom) {
  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  for (let i = 1; i < top.length; i += 1) ctx.lineTo(top[i].x, top[i].y);
  for (let i = bottom.length - 1; i >= 0; i -= 1) ctx.lineTo(bottom[i].x, bottom[i].y);
  ctx.closePath();
}

function drawPreviewPointLine(ctx, points) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i += 1) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y);
    else ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawDirtSmudgePreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const softness = valueOf(values, "edgeSoftness", 0.5);
  const noise = valueOf(values, "noise", 0.5);
  const warmth = valueOf(values, "warmth", 0.5);
  const count = Math.max(1, Math.round(22 * density));
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = colorFromHsl(30 + warmth * 18, 22 + warmth * 14, 26 + warmth * 8, (0.08 + noise * 0.18) * opacity);
    fillPreviewFeatheredBlob(ctx, rng, width * (0.18 + rng() * 0.64), height * (0.2 + rng() * 0.52), (28 + rng() * 66) * size, (10 + rng() * 32) * size, 0.24 + noise * 0.28, softness);
  }
}

function drawGrassPlaneLightPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const brightness = valueOf(values, "brightness", 1);
  const softness = valueOf(values, "edgeSoftness", 0.5);
  const hueShift = valueOf(values, "hueShift", 0);
  const count = Math.max(1, Math.round(12 * density));
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = colorFromHsl(86 + hueShift, 34, 44 * brightness, (0.16 + rng() * 0.14) * opacity);
    fillPreviewFeatheredBlob(ctx, rng, width * (0.16 + rng() * 0.68), height * (0.18 + rng() * 0.52), (72 + rng() * 120) * size, (24 + rng() * 50) * size, 0.22 + softness * 0.16, softness);
  }
}

function drawDenseGrassPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const edgeSoftness = valueOf(values, "edgeSoftness", 0.5);
  const brightness = valueOf(values, "brightness", 1);
  const hueShift = valueOf(values, "hueShift", 0);
  const detailDensity = valueOf(values, "detailDensity", 1);
  const count = Math.max(1, Math.round(7 * density));
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = colorFromHsl(118 + hueShift, 34, 20 * brightness, (0.2 + rng() * 0.18) * opacity);
    fillPreviewFeatheredBlob(ctx, rng, width * (0.16 + rng() * 0.68), height * (0.22 + rng() * 0.48), (58 + rng() * 112) * size, (28 + rng() * 58) * size, 0.28 + edgeSoftness * 0.18, edgeSoftness);
  }
  ctx.lineCap = "round";
  const bladeCount = Math.max(0, Math.round(180 * density * detailDensity));
  for (let i = 0; i < bladeCount; i += 1) {
    const x = width * (0.12 + rng() * 0.76);
    const y = height * (0.18 + rng() * 0.58);
    ctx.globalAlpha = clamp((0.22 + rng() * 0.42) * opacity, 0, 1);
    ctx.strokeStyle = rng() > 0.56
      ? colorFromHsl(82 + hueShift, 38, 58 * brightness, 0.7)
      : colorFromHsl(118 + hueShift, 32, 24 * brightness, 0.72);
    ctx.lineWidth = 0.9 + rng() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (rng() - 0.5) * 8, y - (5 + rng() * 10), x + (rng() - 0.5) * 14, y - (10 + rng() * 18));
    ctx.stroke();
  }
}

function drawMeadowBedPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const edgeSoftness = valueOf(values, "edgeSoftness", 0.45);
  const variation = valueOf(values, "variation", 0.5);
  const detailDensity = valueOf(values, "detailDensity", 1);
  const count = Math.max(1, Math.round(18 * density));
  for (let i = 0; i < count; i += 1) {
    const hue = 92 + (rng() - 0.5) * 28 * variation;
    ctx.fillStyle = colorFromHsl(hue, 36, 34 + rng() * 12, (0.18 + rng() * 0.22) * opacity);
    fillPreviewFeatheredBlob(ctx, rng, width * (0.16 + rng() * 0.68), height * (0.18 + rng() * 0.52), (42 + rng() * 82) * size, (18 + rng() * 38) * size, variation, edgeSoftness);
  }
  ctx.lineCap = "round";
  const detailCount = Math.max(0, Math.round(90 * detailDensity * density));
  for (let i = 0; i < detailCount; i += 1) {
    const x = width * (0.16 + rng() * 0.68);
    const y = height * (0.18 + rng() * 0.52);
    ctx.strokeStyle = colorFromHsl(92 + (rng() - 0.5) * 34 * variation, 38, 56 + rng() * 16, (0.22 + rng() * 0.18) * opacity);
    ctx.lineWidth = 0.8 + rng() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 12, y - (5 + rng() * 14));
    ctx.stroke();
  }
}

function drawFineGrassStrokesPreview(ctx, width, height, values, rng, seed) {
  const margin = 42;
  const gap = 16;
  const panelWidth = (width - margin * 2 - gap * 2) / 3;
  const panelHeight = height - 168;
  const y = 48;
  const panels = [
    { biome: "grassland", label: "grassland", x: margin, baseGrass: 1 },
    { biome: "forest", label: "forest", x: margin + panelWidth + gap, baseGrass: 0.58 },
    { biome: "mountain", label: "mountain", x: margin + (panelWidth + gap) * 2, baseGrass: 1 },
  ];

  for (const panel of panels) {
    ctx.save();
    ctx.fillStyle = "rgba(22, 36, 21, 0.42)";
    ctx.fillRect(panel.x, y, panelWidth, panelHeight);
    drawFineGrassNoisePreviewArea(ctx, panel.x, y, panelWidth, panelHeight, values, seed, panel.biome, panel.baseGrass);
    ctx.fillStyle = "rgba(10, 14, 10, 0.54)";
    ctx.fillRect(panel.x + 10, y + panelHeight - 34, panelWidth - 20, 24);
    ctx.fillStyle = "#e8e0c3";
    ctx.font = "13px Segoe UI, sans-serif";
    ctx.fillText(panel.label, panel.x + 20, y + panelHeight - 17);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "#8da05f";
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i += 1) {
    const x = margin + rng() * (width - margin * 2);
    const bladeY = 58 + rng() * (height - 190);
    ctx.beginPath();
    ctx.moveTo(x, bladeY + 9);
    ctx.lineTo(x + (rng() - 0.5) * 8, bladeY - (8 + rng() * 14));
    ctx.stroke();
  }
  ctx.restore();
}

function drawDungeonFloorPreview(ctx, width, height, values, rng, seed) {
  const x = 58;
  const y = 52;
  const previewWidth = width - 116;
  const previewHeight = height - 148;
  ctx.save();
  ctx.fillStyle = "#272b2a";
  ctx.fillRect(x, y, previewWidth, previewHeight);
  for (let ty = y; ty < y + previewHeight; ty += 42) {
    for (let tx = x; tx < x + previewWidth; tx += 54) {
      const tone = rng();
      ctx.globalAlpha = 0.12 + tone * 0.08;
      ctx.fillStyle = tone > 0.52 ? "#5e5849" : "#151719";
      ctx.fillRect(tx + rng() * 6, ty + rng() * 6, 42 + rng() * 10, 28 + rng() * 10);
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#090b0d";
      ctx.strokeRect(tx + 2, ty + 2, 48, 34);
    }
  }
  drawDungeonNoisePreviewArea(ctx, x, y, previewWidth, previewHeight, values, seed, "floor");
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#111315";
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    const sx = x + 24 + rng() * (previewWidth - 48);
    const sy = y + 24 + rng() * (previewHeight - 48);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 16 + rng() * 38, sy + (rng() - 0.5) * 22);
    if (rng() > 0.5) ctx.lineTo(sx + 28 + rng() * 42, sy + 8 + (rng() - 0.5) * 22);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDungeonWallPreview(ctx, width, height, values, rng, seed) {
  const x = 56;
  const y = 44;
  const previewWidth = width - 112;
  const previewHeight = height - 140;
  const topHeight = Math.round(previewHeight * 0.34);
  const faceY = y + topHeight - 4;
  ctx.save();
  ctx.fillStyle = "#06090a";
  ctx.fillRect(x, y, previewWidth, previewHeight);

  ctx.fillStyle = "#101616";
  ctx.fillRect(x + 16, y + 8, previewWidth - 32, topHeight);
  ctx.fillStyle = "#1f2927";
  for (let i = 0; i < 44; i += 1) {
    const cx = x + 20 + rng() * (previewWidth - 40);
    const cy = y + 12 + rng() * Math.max(1, topHeight - 14);
    ctx.globalAlpha = 0.18 + rng() * 0.18;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8 + rng() * 18, 5 + rng() * 12, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const faceGradient = ctx.createLinearGradient(0, faceY, 0, y + previewHeight - 20);
  faceGradient.addColorStop(0, "#5f6656");
  faceGradient.addColorStop(0.38, "#3a443e");
  faceGradient.addColorStop(0.78, "#1b211f");
  faceGradient.addColorStop(1, "#070908");
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = faceGradient;
  ctx.beginPath();
  ctx.moveTo(x + 24, faceY + 5);
  ctx.bezierCurveTo(x + previewWidth * 0.32, faceY - 12, x + previewWidth * 0.5, faceY + 20, x + previewWidth - 30, faceY + 2);
  ctx.lineTo(x + previewWidth - 52, y + previewHeight - 34);
  ctx.bezierCurveTo(x + previewWidth * 0.55, y + previewHeight - 18, x + previewWidth * 0.28, y + previewHeight - 44, x + 42, y + previewHeight - 30);
  ctx.closePath();
  ctx.fill();
  ctx.clip();
  drawDungeonNoisePreviewArea(ctx, x + 20, faceY - 6, previewWidth - 40, previewHeight - topHeight + 12, values, seed, "wall");
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#070908";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i += 1) {
    const sx = x + 40 + rng() * (previewWidth - 80);
    const sy = faceY + 18 + rng() * (previewHeight - topHeight - 36);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (rng() - 0.5) * 32, sy + 26 + rng() * 48);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDungeonFloorWearPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const variation = valueOf(values, "variation", 0.65);
  drawDungeonLayerPreviewBase(ctx, width, height, "floor");
  ctx.save();
  const x = 58;
  const y = 52;
  const previewWidth = width - 116;
  const previewHeight = height - 148;
  const patchCount = Math.floor(10 * density);
  for (let i = 0; i < patchCount; i += 1) {
    const px = x + 28 + rng() * Math.max(1, previewWidth - 56);
    const py = y + 24 + rng() * Math.max(1, previewHeight - 48);
    ctx.globalAlpha = clamp((0.09 + rng() * 0.1) * opacity, 0, 0.26);
    ctx.fillStyle = rng() > 0.48 ? "#725a3f" : "#111317";
    ctx.beginPath();
    ctx.ellipse(px, py, (30 + rng() * 70) * size, (8 + rng() * 28) * size, (rng() - 0.5) * Math.PI * variation, 0, Math.PI * 2);
    ctx.fill();
  }
  const chipCount = Math.floor(70 * density);
  for (let i = 0; i < chipCount; i += 1) {
    ctx.globalAlpha = clamp((0.08 + rng() * 0.15) * opacity, 0, 0.28);
    ctx.fillStyle = rng() > 0.5 ? "#9c9274" : "#17191d";
    const px = x + rng() * previewWidth;
    const py = y + rng() * previewHeight;
    ctx.beginPath();
    ctx.ellipse(px, py, (1.8 + rng() * 5) * size, (0.8 + rng() * 2.4) * size, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDungeonFloorMoisturePreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  const edgeSoftness = valueOf(values, "edgeSoftness", 0.78);
  drawDungeonLayerPreviewBase(ctx, width, height, "floor");
  drawDungeonMoisturePreviewPatches(ctx, 58, 52, width - 116, height - 148, rng, {
    opacity,
    density,
    size,
    edgeSoftness,
    colors: ["#2d4b45", "#4b5b36", "#203d39"],
  });
}

function drawDungeonWallCracksPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const density = valueOf(values, "density", 1);
  const size = valueOf(values, "size", 1);
  drawDungeonLayerPreviewBase(ctx, width, height, "wall");
  ctx.save();
  const x = 78;
  const y = 96;
  const previewWidth = width - 156;
  const previewHeight = height - 210;
  const count = Math.floor(28 * density);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < count; i += 1) {
    const sx = x + rng() * previewWidth;
    const sy = y + rng() * previewHeight * 0.35;
    const steps = 3 + Math.floor(rng() * 4);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let step = 1; step <= steps; step += 1) {
      ctx.lineTo(sx + (rng() - 0.5) * 34 * size, sy + step * (14 + rng() * 13) * size);
    }
    ctx.globalAlpha = clamp((0.12 + rng() * 0.08) * opacity, 0, 0.28);
    ctx.strokeStyle = "#050706";
    ctx.lineWidth = (0.8 + rng() * 1.4) * size;
    ctx.stroke();
    if (rng() > 0.48) {
      ctx.globalAlpha = clamp((0.035 + rng() * 0.035) * opacity, 0, 0.11);
      ctx.strokeStyle = "#bdb48a";
      ctx.lineWidth = 0.7 * size;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawDungeonWallMoisturePreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 0.85);
  const density = valueOf(values, "density", 0.85);
  const size = valueOf(values, "size", 1);
  const edgeSoftness = valueOf(values, "edgeSoftness", 0.78);
  drawDungeonLayerPreviewBase(ctx, width, height, "wall");
  drawDungeonMoisturePreviewPatches(ctx, 72, 82, width - 144, height - 184, rng, {
    opacity,
    density,
    size,
    edgeSoftness,
    colors: ["#203b36", "#46563a", "#172a28"],
  });
}

function drawDungeonTorchWarmthPreview(ctx, width, height, values, rng) {
  const opacity = valueOf(values, "opacity", 1);
  const size = valueOf(values, "size", 1);
  const warmth = valueOf(values, "warmth", 0.72);
  drawDungeonLayerPreviewBase(ctx, width, height, "wall");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const cx = width * 0.5;
  const cy = height * 0.48;
  const radius = 135 * size;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glow.addColorStop(0, `rgba(255,${Math.round(156 + warmth * 54)},${Math.round(70 + warmth * 28)},${0.38 * opacity})`);
  glow.addColorStop(0.36, `rgba(${Math.round(202 + warmth * 42)},${Math.round(96 + warmth * 36)},38,${0.18 * opacity})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 0.84 * opacity;
  ctx.fillStyle = warmth > 0.56 ? "#ff8a2a" : "#e65f28";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 10 * size, 23 * size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.8 * opacity;
  ctx.fillStyle = warmth > 0.56 ? "#ffe09a" : "#ffc56d";
  ctx.beginPath();
  ctx.ellipse(cx + 1, cy - 4, 4.5 * size, 12 * size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDungeonLayerPreviewBase(ctx, width, height, kind) {
  const x = 58;
  const y = 52;
  const previewWidth = width - 116;
  const previewHeight = height - 148;
  ctx.save();
  ctx.fillStyle = kind === "wall" ? "#080b0c" : "#272b2a";
  ctx.fillRect(x, y, previewWidth, previewHeight);
  const grad = ctx.createLinearGradient(0, y, 0, y + previewHeight);
  if (kind === "wall") {
    grad.addColorStop(0, "#5f6656");
    grad.addColorStop(0.48, "#303a35");
    grad.addColorStop(1, "#070908");
  } else {
    grad.addColorStop(0, "#343837");
    grad.addColorStop(0.58, "#25292a");
    grad.addColorStop(1, "#17191c");
  }
  ctx.globalAlpha = 0.86;
  ctx.fillStyle = grad;
  ctx.fillRect(x + 18, y + 18, previewWidth - 36, previewHeight - 36);
  ctx.restore();
}

function drawDungeonMoisturePreviewPatches(ctx, x, y, width, height, rng, options) {
  ctx.save();
  const count = Math.floor(14 * options.density);
  for (let i = 0; i < count; i += 1) {
    const px = x + 24 + rng() * Math.max(1, width - 48);
    const py = y + 24 + rng() * Math.max(1, height - 48);
    const rx = (18 + rng() * 62) * options.size;
    const ry = (8 + rng() * 25) * options.size;
    const color = options.colors[Math.floor(rng() * options.colors.length)];
    const angle = rng() * Math.PI;
    ctx.globalAlpha = clamp((0.07 + rng() * 0.08) * options.opacity * (0.7 + options.edgeSoftness * 0.6), 0, 0.24);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = clamp((0.1 + rng() * 0.12) * options.opacity, 0, 0.32);
    ctx.fillStyle = hexToRgba(color, 0.78);
    ctx.beginPath();
    ctx.ellipse(px, py, rx * (0.35 + options.edgeSoftness * 0.2), ry * 0.42, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDungeonNoisePreviewArea(ctx, x, y, width, height, values, seed, kind) {
  const opacity = valueOf(values, "noiseOpacity", 0.8);
  const contrast = valueOf(values, "contrast", 1);
  if (opacity <= 0.001 || contrast <= 0.001) return;
  const darkBias = valueOf(values, "darkBias", 1);
  const lightBias = valueOf(values, "lightBias", 1);
  const broadScale = Math.round(valueOf(values, "broadScale", 56));
  const fineScale = Math.round(valueOf(values, "fineScale", 7));
  const renderScale = Math.round(valueOf(values, "renderScale", 3));
  const noiseWidth = Math.ceil(width / renderScale);
  const noiseHeight = Math.ceil(height / renderScale);
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseWidth;
  noiseCanvas.height = noiseHeight;
  const noiseCtx = noiseCanvas.getContext("2d");
  const image = noiseCtx.createImageData(noiseWidth, noiseHeight);
  const data = image.data;
  const rng = makePreviewRng(hashSeed(seed, "dungeon-noise-preview", kind, Math.round(opacity * 100), broadScale, fineScale));
  const salt = `dungeon-${kind}-noise-preview-${Math.round(opacity * 100)}-${broadScale}-${fineScale}`;
  const broadSalts = createFbmNoiseSalts(seed, `${salt}-broad`, 3);
  const fineSalts = createFbmNoiseSalts(seed, `${salt}-fine`, 2);
  const alphaScale = clamp(opacity * (kind === "wall" ? 1.45 : 1.35), 0, 6);

  for (let py = 0; py < noiseHeight; py += 1) {
    for (let px = 0; px < noiseWidth; px += 1) {
      const i = (py * noiseWidth + px) * 4;
      const wx = px * renderScale;
      const wy = py * renderScale;
      const broad = previewFbmValueAt(wx / broadScale, wy / broadScale, broadSalts, 0.54, 2.02);
      const fine = previewFbmValueAt(wx / fineScale, wy / fineScale, fineSalts, 0.5, 2.12);
      const grain = rng();
      const rawTone = clamp(broad * 0.48 + fine * 0.52, 0, 1);
      const tone = clamp((rawTone - 0.5) * contrast + 0.5, 0, 1);
      const darkStrength = previewSmoothstep((tone - 0.34) / 0.48);
      const lightStrength = previewSmoothstep((tone - 0.61) / 0.36);
      const speck = grain > 0.8 ? (grain - 0.8) / 0.2 : 0;
      const darkAlpha = (5 + darkStrength * 30 + speck * 18) * alphaScale * contrast * darkBias;
      const lightAlpha = Math.max(0, (lightStrength - darkStrength * 0.2) * (6 + speck * 10) * alphaScale * contrast * lightBias);
      if (darkAlpha < 2 && lightAlpha < 2) {
        data[i + 3] = 0;
        continue;
      }
      if (darkStrength >= lightStrength || grain > 0.88) {
        const color = previewDungeonNoiseColor(kind, true, tone);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = Math.floor(clamp(darkAlpha, 0, kind === "wall" ? 205 : 190));
      } else {
        const color = previewDungeonNoiseColor(kind, false, tone);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = Math.floor(clamp(lightAlpha, 0, kind === "wall" ? 112 : 98));
      }
    }
  }

  noiseCtx.putImageData(image, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(noiseCanvas, 0, 0, noiseWidth, noiseHeight, x, y, width, height);
  ctx.restore();
}

function previewDungeonNoiseColor(kind, dark, tone) {
  if (kind === "wall") {
    return dark
      ? { r: 1 + Math.floor(tone * 12), g: 4 + Math.floor(tone * 15), b: 5 + Math.floor(tone * 15) }
      : { r: 92 + Math.floor(tone * 52), g: 98 + Math.floor(tone * 50), b: 84 + Math.floor(tone * 42) };
  }
  return dark
    ? { r: 5 + Math.floor(tone * 22), g: 6 + Math.floor(tone * 22), b: 5 + Math.floor(tone * 20) }
    : { r: 125 + Math.floor(tone * 64), g: 112 + Math.floor(tone * 58), b: 84 + Math.floor(tone * 42) };
}

function drawFineGrassNoisePreviewArea(ctx, x, y, width, height, values, seed, biome, baseGrass) {
  const strength = valueOf(values, fineGrassPreviewStrengthKey(biome), biome === "forest" ? 1.85 : 1.18);
  const contrast = valueOf(values, "contrast", 1);
  if (strength <= 0.001 || contrast <= 0.001) return;
  const darkBias = valueOf(values, "darkBias", 1);
  const lightBias = valueOf(values, "lightBias", 1);
  const broadScale = Math.round(valueOf(values, "broadScale", 30));
  const fineScale = Math.round(valueOf(values, "fineScale", 7));
  const renderScale = Math.round(valueOf(values, "renderScale", 3));
  const noiseWidth = Math.ceil(width / renderScale);
  const noiseHeight = Math.ceil(height / renderScale);
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseWidth;
  noiseCanvas.height = noiseHeight;
  const noiseCtx = noiseCanvas.getContext("2d");
  const image = noiseCtx.createImageData(noiseWidth, noiseHeight);
  const data = image.data;
  const rng = makePreviewRng(hashSeed(seed, "fine-grass-preview", biome, Math.round(strength * 100), broadScale, fineScale));
  const alphaScale = clamp(baseGrass * strength, 0, 6);
  const salt = `fine-grass-preview-${biome}-${Math.round(strength * 100)}-${broadScale}-${fineScale}`;
  const broadSalts = createFbmNoiseSalts(seed, `${salt}-broad`, 3);
  const fineSalts = createFbmNoiseSalts(seed, `${salt}-fine`, 2);

  for (let py = 0; py < noiseHeight; py += 1) {
    for (let px = 0; px < noiseWidth; px += 1) {
      const i = (py * noiseWidth + px) * 4;
      const wx = px * renderScale;
      const wy = py * renderScale;
      const broad = previewFbmValueAt(wx / broadScale, wy / broadScale, broadSalts, 0.54, 2.02);
      const fine = previewFbmValueAt(wx / fineScale, wy / fineScale, fineSalts, 0.5, 2.12);
      const grain = rng();
      const tone = clamp(broad * 0.48 + fine * 0.52, 0, 1);
      const darkStrength = previewSmoothstep((tone - 0.34) / 0.48);
      const lightStrength = previewSmoothstep((tone - 0.61) / 0.36);
      const speck = grain > 0.8 ? (grain - 0.8) / 0.2 : 0;
      const darkAlpha = (5 + darkStrength * 28 + speck * 16) * alphaScale * contrast * darkBias;
      const lightAlpha = Math.max(0, (lightStrength - darkStrength * 0.22) * (5 + speck * 9) * alphaScale * contrast * lightBias);
      const isMountain = biome === "mountain";
      if (darkStrength >= lightStrength || grain > 0.88) {
        data[i] = isMountain ? 24 + Math.floor(tone * 28) : 6 + Math.floor(tone * 18);
        data[i + 1] = isMountain ? 21 + Math.floor(tone * 26) : 20 + Math.floor(tone * 34);
        data[i + 2] = isMountain ? 15 + Math.floor(tone * 20) : 10 + Math.floor(tone * 22);
        data[i + 3] = Math.floor(clamp(darkAlpha, 0, 180));
      } else {
        data[i] = isMountain ? 104 + Math.floor(tone * 48) : 94 + Math.floor(tone * 54);
        data[i + 1] = isMountain ? 98 + Math.floor(tone * 42) : 122 + Math.floor(tone * 62);
        data[i + 2] = isMountain ? 70 + Math.floor(tone * 32) : 62 + Math.floor(tone * 34);
        data[i + 3] = Math.floor(clamp(lightAlpha, 0, 90));
      }
    }
  }

  noiseCtx.putImageData(image, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(noiseCanvas, 0, 0, noiseWidth, noiseHeight, x, y, width, height);
  ctx.restore();
}

function fineGrassPreviewStrengthKey(biome) {
  if (biome === "forest") return "forestStrength";
  if (biome === "mountain") return "mountainStrength";
  return "grasslandStrength";
}

function previewFbmValueAt(x, y, layerSalts, gain = 0.5, lacunarity = 2) {
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  let amplitudeTotal = 0;
  for (let octave = 0; octave < layerSalts.length; octave += 1) {
    total += previewValueAt(x * frequency, y * frequency, layerSalts[octave]) * amplitude;
    amplitudeTotal += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return amplitudeTotal > 0 ? total / amplitudeTotal : 0;
}

function previewValueAt(x, y, noiseSalt) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = previewSmoothstep(x - ix);
  const fy = previewSmoothstep(y - iy);
  const a = hashNoiseValue(noiseSalt, ix, iy);
  const b = hashNoiseValue(noiseSalt, ix + 1, iy);
  const c = hashNoiseValue(noiseSalt, ix, iy + 1);
  const d = hashNoiseValue(noiseSalt, ix + 1, iy + 1);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
}

function previewSmoothstep(t) {
  const clamped = clamp(t, 0, 1);
  return clamped * clamped * (3 - clamped * 2);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function fillPreviewFeatheredBlob(ctx, rng, cx, cy, rx, ry, shapeNoise, edgeSoftness) {
  const feather = clamp(edgeSoftness, 0, 1);
  const fillStyle = ctx.fillStyle;
  const baseAlpha = ctx.globalAlpha;
  if (feather <= 0.01) {
    drawNoisyBlob(ctx, cx, cy, rx, ry, shapeNoise, previewBlobLocalRng(cx, cy, rx, ry, "core"));
    ctx.fill();
    return;
  }

  const featherWidth = clamp(feather * 0.56, 0.02, 0.88);
  const layerCount = Math.max(8, Math.round(8 + feather * 12));
  const outerScale = 1 + featherWidth * 0.5;
  const innerScale = Math.max(0.28, 1 - featherWidth * 0.5);
  const weightPower = 1.35;
  let weightTotal = 0;
  for (let layer = 0; layer < layerCount; layer += 1) {
    weightTotal += Math.pow((layer + 1) / layerCount, weightPower);
  }
  const alphaBudget = baseAlpha * (1.08 + feather * 0.22);
  ctx.save();
  for (let layer = 0; layer < layerCount; layer += 1) {
    const t = layerCount <= 1 ? 1 : layer / (layerCount - 1);
    const scale = outerScale + (innerScale - outerScale) * t;
    const weight = Math.pow((layer + 1) / layerCount, weightPower);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx * scale, ry * scale);
    ctx.fillStyle = fillStyle;
    ctx.globalAlpha = clamp((alphaBudget * weight) / weightTotal, 0, 1);
    drawNoisyBlob(ctx, 0, 0, 1, 1, shapeNoise + feather * 0.04, previewBlobLocalRng(cx, cy, rx, ry, "core"));
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function previewBlobLocalRng(cx, cy, rx, ry, salt) {
  return makePreviewRng(hashSeed(
    "preview-feather-blob",
    salt,
    Math.round(cx * 10),
    Math.round(cy * 10),
    Math.round(rx * 10),
    Math.round(ry * 10),
  ));
}

function drawNoisyBlob(ctx, cx, cy, rx, ry, noise, rng) {
  const points = 20;
  ctx.beginPath();
  for (let i = 0; i <= points; i += 1) {
    const angle = (Math.PI * 2 * i) / points;
    const wobble = 1 + (rng() - 0.5) * noise * 0.42;
    const x = cx + Math.cos(angle) * rx * wobble;
    const y = cy + Math.sin(angle) * ry * wobble;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function valueOf(values, key, fallback) {
  const value = Number(values?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

function proceduralPreviewSeed(definition, values) {
  return hashSeed(
    currentMaterialSeed(),
    "procedural-preview",
    definition.id,
    proceduralPreviewSeedOffset(values),
  );
}

function proceduralPreviewSeedOffset(values) {
  const value = Number(values?.seedOffset);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function formatControlValue(control, value) {
  return Number(value).toFixed(control.digits);
}

function colorFromHsl(h, s, l, alpha = 1) {
  return `hsla(${Math.round(h)}, ${clamp(s, 0, 100).toFixed(1)}%, ${clamp(l, 0, 100).toFixed(1)}%, ${clamp(alpha, 0, 1)})`;
}

function hexToRgba(hex, alpha = 1) {
  const value = String(hex ?? "").replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return `rgba(255,255,255,${clamp(alpha, 0, 1)})`;
  return `rgba(${r},${g},${b},${clamp(alpha, 0, 1)})`;
}

function makePreviewRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function copySelectedMaterialAssetId() {
  const asset = selectedMaterialSpriteAsset();
  if (!asset) return;
  try {
    await navigator.clipboard.writeText(asset.id);
    materialCopyAssetIdButton.textContent = "Copied";
  } catch {
    materialCopyAssetIdButton.textContent = "Copy failed";
  }
  globalThis.setTimeout(() => {
    materialCopyAssetIdButton.textContent = "Copy asset ID";
  }, 1200);
}

randomizeButton.addEventListener("click", () => {
  seedInput.value = String(1 + Math.floor(Math.random() * 999999));
  renderMaterialLab();
});
seedInput.addEventListener("input", renderMaterialLab);
materialSpriteModeButton.addEventListener("click", () => requestMaterialMode("spriteProps"));
materialProceduralModeButton.addEventListener("click", () => requestMaterialMode("proceduralElements"));
const materialModeTabs = [materialSpriteModeButton, materialProceduralModeButton];
for (const [index, tab] of materialModeTabs.entries()) {
  tab.addEventListener("keydown", (event) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % materialModeTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + materialModeTabs.length) % materialModeTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = materialModeTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    materialModeTabs[nextIndex].focus();
    materialModeTabs[nextIndex].click();
  });
}
materialModeSelect.addEventListener("change", () => {
  const requested = materialModeSelect.value;
  materialModeSelect.value = currentMode();
  requestMaterialMode(requested);
});
materialPropSelect.addEventListener("change", async () => {
  const requested = materialPropSelect.value;
  materialPropSelect.value = activeMaterialProp;
  const category = SPRITE_PROP_CATEGORY_BY_VALUE[requested];
  if (!category) return;
  selectSpriteBrowserAsset(category, selectedMaterialSpriteIds[category]);
});
materialShapeSelect.addEventListener("change", renderMaterialLab);
materialCategoryFilter.addEventListener("change", renderMaterialBrowser);
materialAssetSearchInput.addEventListener("input", renderMaterialBrowser);
proceduralSearchInput.addEventListener("input", renderMaterialBrowser);
proceduralGroupFilter.addEventListener("change", renderMaterialBrowser);
proceduralStatusFilter.addEventListener("change", renderMaterialBrowser);
materialBackgroundSelect.addEventListener("change", renderMaterialLab);
materialPreviewModeSelect.addEventListener("change", renderMaterialLab);
materialZoomSelect.addEventListener("change", applyMaterialZoom);
materialGridToggle.addEventListener("change", renderMaterialLab);
materialFootprintToggle.addEventListener("change", renderMaterialLab);
materialShadowToggle.addEventListener("change", renderMaterialLab);
materialFootGrassToggle.addEventListener("change", renderMaterialLab);
materialSpriteSelect.addEventListener("change", () => {
  selectedMaterialSpriteIds[currentSpriteCategory()] = materialSpriteSelect.value;
  syncMaterialSpriteEditor();
  renderMaterialLab();
});
materialShadowApplyButton.addEventListener("click", applySelectedSpriteShadow);
materialCollisionApplyButton.addEventListener("click", applySelectedSpriteCollision);
materialFootprintApplyButton.addEventListener("click", applySelectedSpriteFootprint);
materialTransformApplyButton.addEventListener("click", applySelectedSpriteTransform);
materialShadowResetButton.addEventListener("click", resetSelectedSpriteShadow);
materialCollisionResetButton.addEventListener("click", resetSelectedSpriteCollision);
materialFootprintResetButton.addEventListener("click", resetSelectedSpriteFootprint);
materialTransformResetButton.addEventListener("click", resetSelectedSpriteTransform);
materialShadowRollbackButton.addEventListener("click", rollbackLastShadowApply);
materialCopyAssetIdButton.addEventListener("click", copySelectedMaterialAssetId);
materialInspectorResizeHandle.addEventListener("pointerdown", beginMaterialInspectorResize);
materialInspectorResizeHandle.addEventListener("keydown", handleMaterialInspectorResizeKey);
materialInspectorResizeHandle.addEventListener("dblclick", () => setMaterialInspectorWidth(390, { persist: true }));
materialCollisionExpandLeftButton.addEventListener("click", () => expandSelectedSpriteCollisionBounds("left"));
materialCollisionExpandRightButton.addEventListener("click", () => expandSelectedSpriteCollisionBounds("right"));
materialCollisionExpandUpButton.addEventListener("click", () => expandSelectedSpriteCollisionBounds("up"));
materialCollisionExpandDownButton.addEventListener("click", () => expandSelectedSpriteCollisionBounds("down"));
materialCollisionTrimButton.addEventListener("click", trimSelectedSpriteCollisionBounds);
for (const [key, control] of Object.entries(materialShadowInputs)) {
  control.input.addEventListener("input", () => {
    setSelectedSpriteShadowValue(key, Number(control.input.value));
  });
}
for (const [key, control] of Object.entries(materialFootprintInputs)) {
  control.input.addEventListener("input", () => {
    setSelectedSpriteFootprintValue(key, Number(control.input.value));
  });
}
for (const [key, control] of Object.entries(materialTransformInputs)) {
  control.input.addEventListener("input", () => {
    setSelectedSpriteTransformValue(key, Number(control.input.value));
  });
}
proceduralElementSelect.addEventListener("change", () => {
  selectedProceduralElementId = proceduralElementSelect.value;
  syncProceduralEditor();
  renderMaterialLab();
});
proceduralBiomeSelect.addEventListener("change", () => {
  const requested = proceduralBiomeSelect.value;
  proceduralBiomeSelect.value = selectedProceduralBiomeId;
  requestProceduralBiome(requested);
});
proceduralScopeSelect.addEventListener("change", () => {
  const requested = proceduralScopeSelect.value;
  proceduralScopeSelect.value = activeProceduralScope;
  requestProceduralScope(requested);
});
proceduralApplyButton.addEventListener("click", applySelectedProceduralParams);
proceduralResetButton.addEventListener("click", resetSelectedProceduralParams);
proceduralRollbackButton.addEventListener("click", rollbackProceduralParams);
proceduralBakeFineGrassButton.addEventListener("click", bakeSelectedFineGrassLayer);
materialSaveChangesButton.addEventListener("click", saveCurrentMaterialDraft);
materialDiscardChangesButton.addEventListener("click", discardCurrentMaterialDraft);
materialReviewChangesButton.addEventListener("click", openMaterialReview);
materialUndoSaveButton.addEventListener("click", undoCurrentMaterialSave);
materialReviewSaveButton.addEventListener("click", async () => {
  const saved = await saveCurrentMaterialDraft();
  if (saved) materialReviewDialog.close();
});
materialNavigationSaveButton.addEventListener("click", () => continuePendingMaterialTransition("save"));
materialNavigationDiscardButton.addEventListener("click", () => continuePendingMaterialTransition("discard"));
materialNavigationCancelButton.addEventListener("click", () => continuePendingMaterialTransition("cancel"));
materialNavigationDialog.addEventListener("cancel", () => {
  pendingMaterialTransition = null;
});
for (const link of labNavigationLinks) {
  link.addEventListener("click", (event) => {
    if (!currentDraftState().hasDraft) return;
    event.preventDefault();
    requestMaterialTransition(`Leave Material Lab for ${link.textContent.trim()}?`, () => {
      globalThis.location.assign(link.href);
    });
  });
}
globalThis.addEventListener("beforeunload", (event) => {
  if (!hasAnyMaterialDraft()) return;
  event.preventDefault();
  event.returnValue = "";
});
globalThis.addEventListener("lab-language-change", () => {
  renderMaterialLab();
});

async function initialize() {
  setMaterialInspectorWidth(materialInspectorWidth);
  for (const controls of [materialShadowInputs, materialFootprintInputs, materialTransformInputs]) {
    for (const control of Object.values(controls)) bindMaterialRangeNumberInput(control.input);
  }
  syncMaterialPropOptions();
  renderMaterialLab();
  propsPersistence = await detectPropsPersistence();
  shadowSaveStatusNote = propsPersistence.note;
  updateShadowPersistenceUi();
  proceduralPersistence = await detectProceduralParamsPersistence();
  proceduralSaveStatusNote = proceduralPersistence.note;
  updateProceduralPersistenceUi();
  biomeRecipePersistence = await detectBiomeRecipePersistence();
  biomeRecipeSaveStatusNote = biomeRecipePersistence.note;
  fineGrassBakePersistence = await detectFineGrassBakePersistence();
  fineGrassBakeStatusNote = fineGrassBakePersistence.note;
  updateFineGrassBakeUi();
  await reloadElementCatalog();
  await reloadLargeRockSpriteAssets();
  await reloadTreeSpriteAssets();
  await reloadProceduralParams();
  await reloadBiomeRecipes();
  unsubscribeBiomeRecipesChanged = subscribeBiomeRecipesChanged(() => {
    reloadBiomeRecipes();
  });
}

installLabVisualSmokeProbe(materialLabVisualSmokeSnapshot);
initialize();
