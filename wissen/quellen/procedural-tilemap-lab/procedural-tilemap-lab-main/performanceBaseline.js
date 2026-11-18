export const PERFORMANCE_BASELINE_VERSION = "performance-baseline-v0.1";
export const PERFORMANCE_BASELINE_DEFAULT_REPEATS = 3;
export const PERFORMANCE_BASELINE_MAX_REPEATS = 9;

export const PERFORMANCE_BASELINE_CASES = Object.freeze([
  Object.freeze({
    id: "grassland-fixed",
    label: "Grassland / current fixed",
    biome: "grassland",
    sizeClass: "current-fixed",
    sourceSeed: 150615,
    expectedDimensions: Object.freeze({ width: 54, height: 34 }),
    largeRockScale: 1,
  }),
  Object.freeze({
    id: "road-fixed",
    label: "Road / current fixed",
    biome: "road",
    sizeClass: "current-fixed",
    sourceSeed: 150615,
    expectedDimensions: Object.freeze({ width: 54, height: 34 }),
    largeRockScale: 0.92,
  }),
  Object.freeze({
    id: "forest-fixed",
    label: "Forest / current fixed",
    biome: "forest",
    sizeClass: "current-fixed",
    sourceSeed: 150615,
    expectedDimensions: Object.freeze({ width: 54, height: 34 }),
    largeRockScale: 0.52,
  }),
  Object.freeze({
    id: "mountain-fixed",
    label: "Mountain / current fixed",
    biome: "mountain",
    sizeClass: "current-fixed",
    sourceSeed: 150615,
    expectedDimensions: Object.freeze({ width: 54, height: 34 }),
    largeRockScale: 1.6,
  }),
  Object.freeze({
    id: "dungeon-small",
    label: "Dungeon / small fixed",
    biome: "dungeon",
    sizeClass: "small",
    sourceSeed: 150615,
    topologyId: "standard",
    sizeProfileId: "fixed54x34",
    expectedDimensions: Object.freeze({ width: 54, height: 34 }),
    largeRockScale: 0,
  }),
  Object.freeze({
    id: "dungeon-medium",
    label: "Dungeon / medium variable",
    biome: "dungeon",
    sizeClass: "medium",
    sourceSeed: 150615,
    topologyId: "narrowCorridors",
    sizeProfileId: "narrowVariableV01",
    expectedDimensions: Object.freeze({ width: 72, height: 36 }),
    largeRockScale: 0,
  }),
  Object.freeze({
    id: "dungeon-large",
    label: "Dungeon / large variable",
    biome: "dungeon",
    sizeClass: "large",
    sourceSeed: 150615,
    topologyId: "largeHub",
    sizeProfileId: "largeHubVariableV01",
    expectedDimensions: Object.freeze({ width: 90, height: 89 }),
    largeRockScale: 0,
  }),
]);

const SUMMARY_METRICS = Object.freeze([
  ["layoutMs", (sample) => sample.layoutMs],
  ["previewColdOuterMs", (sample) => sample.previewCold?.outerMs],
  ["previewColdInnerMs", (sample) => sample.previewCold?.performance?.totalMs],
  ["previewColdGenerationMs", (sample) => sumNumericValues(sample.previewCold?.performance?.build?.generation)],
  ["previewWarmOuterMs", (sample) => sample.previewWarm?.outerMs],
  ["seedChangeOuterMs", (sample) => sample.seedChange?.outerMs],
  ["fullMapOuterMs", (sample) => sample.fullMap?.outerMs],
  ["fullMapGenerationMs", (sample) => sumNumericValues(sample.fullMap?.performance?.build?.generation)],
  ["pngEncodeMs", (sample) => sample.png?.encodeMs],
  ["exportTotalMs", (sample) => sample.png?.exportTotalMs],
  ["pngBytes", (sample) => sample.png?.bytes],
]);

export function normalizePerformanceBaselineRepeats(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return PERFORMANCE_BASELINE_DEFAULT_REPEATS;
  }
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) return PERFORMANCE_BASELINE_DEFAULT_REPEATS;
  return Math.min(PERFORMANCE_BASELINE_MAX_REPEATS, Math.max(1, parsed));
}

export function summarizePerformanceBaselineSamples(samples = []) {
  return Object.fromEntries(
    SUMMARY_METRICS.map(([key, read]) => [
      key,
      summarizeNumbers(samples.map(read).filter(Number.isFinite)),
    ]),
  );
}

export function summarizeNumbers(values = []) {
  const sorted = values.filter(Number.isFinite).map(Number).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  return {
    count: sorted.length,
    min: roundSummaryValue(sorted[0]),
    median: roundSummaryValue(percentile(sorted, 0.5)),
    p95: roundSummaryValue(percentile(sorted, 0.95)),
    max: roundSummaryValue(sorted.at(-1)),
  };
}

export function sumNumericValues(values = {}) {
  return Object.values(values ?? {}).filter(Number.isFinite).reduce((sum, value) => sum + Number(value), 0);
}

function percentile(sorted, ratio) {
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * ratio;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function roundSummaryValue(value) {
  return Math.round(value * 100) / 100;
}
