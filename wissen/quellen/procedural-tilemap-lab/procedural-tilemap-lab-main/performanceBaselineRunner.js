import { LAB_BUILD_TAG } from "./labBuild.js";
import { LEGACY_MAP_SEED_SALT } from "./labIdentity.js";
import { hashSeed } from "./tileArt.js";
import { createDungeonLayout } from "./dungeonTopology.js";
import {
  clearMapRenderCaches,
  drawFullMap,
  drawMapPreview,
} from "./mapRenderer.js";
import {
  applyBiomeRecipeToProceduralParams,
  loadBiomeRecipes,
} from "./biomeRecipes.js";
import { loadProceduralParams } from "./proceduralParams.js";
import {
  loadLargeRockSpriteAssets,
  loadTreeSpriteAssets,
} from "./propAssets.js";
import {
  PERFORMANCE_BASELINE_CASES,
  PERFORMANCE_BASELINE_DEFAULT_REPEATS,
  PERFORMANCE_BASELINE_VERSION,
  normalizePerformanceBaselineRepeats,
  summarizePerformanceBaselineSamples,
} from "./performanceBaseline.js";

const repeatsInput = document.querySelector("#benchmarkRepeats");
const runButton = document.querySelector("#runBenchmarkButton");
const downloadButton = document.querySelector("#downloadBenchmarkButton");
const stateLabel = document.querySelector("#benchmarkState");
const progressLabel = document.querySelector("#benchmarkProgress");
const resultsBody = document.querySelector("#benchmarkResultsBody");
const jsonOutput = document.querySelector("#benchmarkJson");
const previewCanvas = document.querySelector("#benchmarkPreviewCanvas");
const fullMapCanvas = document.querySelector("#benchmarkFullMapCanvas");

let assets = null;
let latestResult = null;
let benchmarkCases = PERFORMANCE_BASELINE_CASES;
let encodePng = true;
let initializationPerformance = null;

runButton.addEventListener("click", () => runBaseline().catch(showFailure));
downloadButton.addEventListener("click", downloadLatestResult);

initialize().catch(showFailure);

async function initialize() {
  const query = new URLSearchParams(location.search);
  repeatsInput.value = String(normalizePerformanceBaselineRepeats(query.get("repeats")));
  encodePng = query.get("png") !== "0";
  const requestedCaseId = query.get("case");
  if (requestedCaseId) {
    const selectedCase = PERFORMANCE_BASELINE_CASES.find((definition) => definition.id === requestedCaseId);
    if (!selectedCase) throw new Error(`unknown benchmark case: ${requestedCaseId}`);
    benchmarkCases = [selectedCase];
  }
  const loaded = await loadBenchmarkAssets();
  assets = loaded.assets;
  await nextFrame();
  clearMapRenderCaches();
  const firstCase = benchmarkCases[0];
  const firstRender = measureDraw(() => drawMapPreview(previewCanvas, drawOptionsForCase(firstCase, firstCase.sourceSeed)));
  clearMapRenderCaches();
  initializationPerformance = {
    assetLoading: loaded.performance,
    firstCaseId: firstCase.id,
    firstRender,
  };
  stateLabel.textContent = "Ready";
  progressLabel.textContent = `${benchmarkCases.length} cases / read-only assets loaded`;
  if (query.get("autorun") === "1") await runBaseline();
}

async function loadBenchmarkAssets() {
  const totalStartedAt = performance.now();
  const stages = {};
  const sourcesStartedAt = performance.now();
  const [recipeIndex, proceduralParams, rocks, trees] = await Promise.all([
    measureAsyncStep(stages, "biomeRecipesMs", () => loadBiomeRecipes()),
    measureAsyncStep(stages, "proceduralParamsMs", () => loadProceduralParams()),
    measureAsyncStep(stages, "rockAssetsMs", () => loadLargeRockSpriteAssets({ syncManifest: false })),
    measureAsyncStep(stages, "treeAssetsMs", () => loadTreeSpriteAssets({ syncManifest: false })),
  ]);
  stages.sourcesTotalMs = roundMs(performance.now() - sourcesStartedAt);
  const imagesStartedAt = performance.now();
  await Promise.all([
    ...rocks.assets.map(waitForImageAsset),
    ...trees.assets.map(waitForImageAsset),
  ]);
  stages.imageReadyMs = roundMs(performance.now() - imagesStartedAt);
  stages.totalMs = roundMs(performance.now() - totalStartedAt);
  return {
    assets: {
      recipes: new Map(recipeIndex.recipes.map((recipe) => [recipe.id, recipe])),
      proceduralParams,
      rocks: rocks.assets,
      trees: trees.assets,
    },
    performance: stages,
  };
}

async function runBaseline() {
  if (!assets) throw new Error("benchmark assets are not ready");
  const repeats = normalizePerformanceBaselineRepeats(repeatsInput.value);
  repeatsInput.value = String(repeats);
  runButton.disabled = true;
  downloadButton.disabled = true;
  latestResult = null;
  document.documentElement.dataset.benchmarkState = "running";
  stateLabel.textContent = "Running";
  resultsBody.replaceChildren(resultMessageRow("Benchmark running."));

  const startedAtMs = performance.now();
  const cases = [];
  for (let caseIndex = 0; caseIndex < benchmarkCases.length; caseIndex += 1) {
    const definition = benchmarkCases[caseIndex];
    const samples = [];
    progressLabel.textContent = `${definition.label} / warm-up / case ${caseIndex + 1} of ${benchmarkCases.length}`;
    await nextFrame();
    await warmCase(definition);
    for (let repeat = 1; repeat <= repeats; repeat += 1) {
      progressLabel.textContent = `${definition.label} / ${repeat} of ${repeats} / case ${caseIndex + 1} of ${benchmarkCases.length}`;
      await nextFrame();
      samples.push(await measureCase(definition, repeat));
    }
    cases.push({
      definition,
      actualDimensions: samples[0].dimensions,
      samples,
      summary: summarizePerformanceBaselineSamples(samples),
    });
  }

  latestResult = {
    version: PERFORMANCE_BASELINE_VERSION,
    labBuildTag: LAB_BUILD_TAG,
    generatedAt: new Date().toISOString(),
    durationMs: roundMs(performance.now() - startedAtMs),
    config: {
      repeats,
      caseFilter: benchmarkCases.length === PERFORMANCE_BASELINE_CASES.length ? null : benchmarkCases[0].id,
      pngEncoding: encodePng ? "enabled" : "disabled by diagnostic option",
      warmup: "one unrecorded preview, full-map draw, and PNG encode per case",
      coldCache: "map renderer output caches cleared before cold preview and full-map draw",
      presentation: "recipe atmosphere on; actor, grid, debug, and highlight overlays off",
      seedChange: "source seed + 1 without clearing the previous seed cache",
      assetLoading: "versioned JSON and images loaded read-only before measurement",
      fineGrassBake: "disabled so primary and seed-change cases use the same procedural path",
    },
    environment: benchmarkEnvironment(),
    initialization: {
      boot: { ...(globalThis.__labBootPerformance ?? {}) },
      navigation: navigationPerformanceSnapshot(),
      ...initializationPerformance,
    },
    cases,
  };

  renderResult(latestResult);
  globalThis.__performanceBaselineResult = latestResult;
  document.documentElement.dataset.benchmarkState = "complete";
  stateLabel.textContent = "Complete";
  progressLabel.textContent = `${cases.length} cases x ${repeats} repeats complete`;
  runButton.disabled = false;
  downloadButton.disabled = false;
}

async function warmCase(definition) {
  const options = drawOptionsForCase(definition, definition.sourceSeed);
  clearMapRenderCaches();
  await nextFrame();
  drawMapPreview(previewCanvas, options);
  await nextFrame();
  drawMapPreview(previewCanvas, options);
  await nextFrame();
  drawFullMap(fullMapCanvas, options);
  if (encodePng) await canvasPngBlob(fullMapCanvas);
  clearMapRenderCaches();
  await nextFrame();
}

async function measureCase(definition, repeat) {
  const options = drawOptionsForCase(definition, definition.sourceSeed);
  const changedOptions = drawOptionsForCase(definition, definition.sourceSeed + 1);
  const layoutMs = definition.biome === "dungeon" ? measureDungeonLayout(definition, options.seed) : null;

  clearMapRenderCaches();
  await nextFrame();
  const previewCold = measureDraw(() => drawMapPreview(previewCanvas, options));
  assertDimensions(definition, previewCold.info);
  await nextFrame();
  const previewWarm = measureDraw(() => drawMapPreview(previewCanvas, options));
  await nextFrame();
  const seedChange = measureDraw(() => drawMapPreview(previewCanvas, changedOptions));

  clearMapRenderCaches();
  await nextFrame();
  const fullMap = measureDraw(() => drawFullMap(fullMapCanvas, options));
  assertDimensions(definition, fullMap.info);
  let png = null;
  if (encodePng) {
    const encodeStartedAt = performance.now();
    const blob = await canvasPngBlob(fullMapCanvas);
    const encodeMs = roundMs(performance.now() - encodeStartedAt);
    png = {
      encodeMs,
      exportTotalMs: roundMs(fullMap.outerMs + encodeMs),
      bytes: blob.size,
    };
  }

  return {
    repeat,
    sourceSeed: definition.sourceSeed,
    fieldSeed: options.seed,
    dimensions: { width: fullMap.info.mapWidth, height: fullMap.info.mapHeight },
    layoutMs,
    previewCold,
    previewWarm,
    seedChange,
    fullMap,
    png,
  };
}

function drawOptionsForCase(definition, sourceSeed) {
  const recipe = assets.recipes.get(definition.biome);
  if (!recipe) throw new Error(`missing biome recipe: ${definition.biome}`);
  const isDungeon = definition.biome === "dungeon";
  const fieldSeed = hashSeed(sourceSeed, LEGACY_MAP_SEED_SALT);
  const proceduralParams = applyBiomeRecipeToProceduralParams(assets.proceduralParams, recipe);
  return {
    seed: fieldSeed,
    preset: recipe.preset,
    atmosphere: recipe.atmosphere,
    highTerraceAmount: !isDungeon && recipe.terrain.highTerraceLayout === "broadPlateau" ? 1 : 0,
    highTerraceHeight: recipe.terrain.highTerraceHeight,
    highTerraceMinDistance: recipe.terrain.highTerraceMinDistance,
    highTerraceLayout: isDungeon ? "none" : recipe.terrain.highTerraceLayout,
    roadStyle: definition.biome === "road" ? "road" : "none",
    mountainStyle: definition.biome === "mountain" ? "rocky" : "none",
    forestStyle: definition.biome === "forest" ? "deep" : "none",
    dungeonStyle: isDungeon ? "stoneDungeon" : "none",
    dungeonTopologyId: definition.topologyId ?? "standard",
    dungeonSizeProfileId: definition.sizeProfileId ?? "fixed54x34",
    treeDensity: isDungeon ? "none" : recipe.terrain.treeDensity,
    largeRockScale: definition.largeRockScale * (recipe.propWeights?.rocks ?? 1),
    spriteRocks: assets.rocks,
    spriteTrees: assets.trees,
    proceduralParams,
    fineGrassBake: null,
    showActors: false,
    showGrid: false,
    showDebugElements: false,
    highlightDebugElement: null,
  };
}

function measureDungeonLayout(definition, seed) {
  const startedAt = performance.now();
  createDungeonLayout(seed, {
    topologyId: definition.topologyId,
    sizeProfileId: definition.sizeProfileId,
  });
  return roundMs(performance.now() - startedAt);
}

function measureDraw(draw) {
  const startedAt = performance.now();
  const info = draw();
  return {
    outerMs: roundMs(performance.now() - startedAt),
    info: {
      mapWidth: info.mapWidth,
      mapHeight: info.mapHeight,
      pixelWidth: info.pixelWidth,
      pixelHeight: info.pixelHeight,
    },
    performance: structuredClone(info.performance),
  };
}

function assertDimensions(definition, info) {
  const expected = definition.expectedDimensions;
  if (info.mapWidth !== expected.width || info.mapHeight !== expected.height) {
    throw new Error(`${definition.id} dimensions changed: expected ${expected.width}x${expected.height}, got ${info.mapWidth}x${info.mapHeight}`);
  }
}

function renderResult(result) {
  resultsBody.replaceChildren(...result.cases.map((entry) => {
    const row = document.createElement("tr");
    const summary = entry.summary;
    for (const value of [
      entry.definition.label,
      `${entry.actualDimensions.width}x${entry.actualDimensions.height}`,
      formatMedian(summary.layoutMs),
      formatMedian(summary.previewColdOuterMs),
      formatMedian(summary.previewWarmOuterMs),
      formatMedian(summary.seedChangeOuterMs),
      formatMedian(summary.fullMapOuterMs),
      formatMedian(summary.pngEncodeMs),
      formatMedian(summary.exportTotalMs),
    ]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  }));
  jsonOutput.textContent = JSON.stringify(result, null, 2);
}

function resultMessageRow(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 9;
  cell.textContent = message;
  row.append(cell);
  return row;
}

function benchmarkEnvironment() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemoryGiB: navigator.deviceMemory ?? null,
    devicePixelRatio: window.devicePixelRatio,
    crossOriginIsolated: globalThis.crossOriginIsolated,
  };
}

function waitForImageAsset(asset) {
  const image = asset.image;
  if (!image) return Promise.resolve();
  if (image.complete) {
    asset.status = image.naturalWidth > 0 ? "ready" : "error";
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const finish = (status) => {
      asset.status = status;
      resolve();
    };
    image.addEventListener("load", () => finish("ready"), { once: true });
    image.addEventListener("error", () => finish("error"), { once: true });
  });
}

function canvasPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG encode returned no blob"));
    }, "image/png");
  });
}

async function measureAsyncStep(target, key, run) {
  const startedAt = performance.now();
  try {
    return await run();
  } finally {
    target[key] = roundMs(performance.now() - startedAt);
  }
}

function navigationPerformanceSnapshot() {
  const navigation = performance.getEntriesByType("navigation")[0];
  if (!navigation) return null;
  return Object.fromEntries(
    [
      "responseEnd",
      "domInteractive",
      "domContentLoadedEventEnd",
      "loadEventEnd",
      "duration",
    ].map((key) => [key, roundMs(navigation[key])]),
  );
}

function downloadLatestResult() {
  if (!latestResult) return;
  const blob = new Blob([`${JSON.stringify(latestResult, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${PERFORMANCE_BASELINE_VERSION}-${timestampForFilename(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function showFailure(error) {
  console.error("[performance baseline]", error);
  document.documentElement.dataset.benchmarkState = "failed";
  stateLabel.textContent = "Failed";
  progressLabel.textContent = error.message;
  runButton.disabled = false;
}

function formatMedian(summary) {
  return summary ? `${summary.median.toFixed(summary.median >= 10 ? 1 : 2)}ms` : "--";
}

function roundMs(value) {
  return Math.round(value * 100) / 100;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function timestampForFilename(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

if (!repeatsInput.value) repeatsInput.value = String(PERFORMANCE_BASELINE_DEFAULT_REPEATS);
