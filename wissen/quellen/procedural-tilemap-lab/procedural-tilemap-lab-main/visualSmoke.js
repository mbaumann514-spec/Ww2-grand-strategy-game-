const DEFAULT_SAMPLE_STEP = 16;
const DEFAULT_MIN_ALPHA_COVERAGE = 0.04;
const DEFAULT_MIN_DISTINCT_COLORS = 8;
const DEFAULT_MIN_LUMA_RANGE = 8;

export function canvasVisualSmokeSummary(canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== "function") {
    return failedCanvasSummary("missing-canvas");
  }

  const width = Number(canvas.width) || 0;
  const height = Number(canvas.height) || 0;
  if (width <= 0 || height <= 0) return failedCanvasSummary("empty-size", { width, height });

  const step = Math.max(1, Math.round(options.sampleStep ?? DEFAULT_SAMPLE_STEP));
  const minAlphaCoverage = options.minAlphaCoverage ?? DEFAULT_MIN_ALPHA_COVERAGE;
  const minDistinctColors = options.minDistinctColors ?? DEFAULT_MIN_DISTINCT_COLORS;
  const minLumaRange = options.minLumaRange ?? DEFAULT_MIN_LUMA_RANGE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) ?? canvas.getContext("2d");
  if (!ctx) return failedCanvasSummary("missing-2d-context", { width, height, sampleStep: step });

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height).data;
  } catch (error) {
    return failedCanvasSummary(`read-failed: ${error.message}`, { width, height, sampleStep: step });
  }

  let samples = 0;
  let visibleSamples = 0;
  let alphaTotal = 0;
  let minLuma = Infinity;
  let maxLuma = -Infinity;
  let checksum = 2166136261;
  const colors = new Set();

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const red = imageData[index];
      const green = imageData[index + 1];
      const blue = imageData[index + 2];
      const alpha = imageData[index + 3];
      samples += 1;
      alphaTotal += alpha;
      checksum = fnv1aByte(checksum, red);
      checksum = fnv1aByte(checksum, green);
      checksum = fnv1aByte(checksum, blue);
      checksum = fnv1aByte(checksum, alpha);

      if (alpha === 0) continue;
      visibleSamples += 1;
      const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      minLuma = Math.min(minLuma, luma);
      maxLuma = Math.max(maxLuma, luma);
      colors.add(coarseColorKey(red, green, blue, alpha));
    }
  }

  const alphaCoverage = samples > 0 ? visibleSamples / samples : 0;
  const lumaRange = visibleSamples > 0 ? maxLuma - minLuma : 0;
  const meanAlpha = samples > 0 ? alphaTotal / samples : 0;
  const ok = alphaCoverage >= minAlphaCoverage
    && colors.size >= minDistinctColors
    && lumaRange >= minLumaRange;

  return {
    ok,
    reason: ok ? "ok" : failedReason({ alphaCoverage, distinctColors: colors.size, lumaRange }, {
      minAlphaCoverage,
      minDistinctColors,
      minLumaRange,
    }),
    width,
    height,
    sampleStep: step,
    samples,
    visibleSamples,
    alphaCoverage: roundMetric(alphaCoverage),
    meanAlpha: roundMetric(meanAlpha),
    distinctColors: colors.size,
    lumaRange: roundMetric(lumaRange),
    checksum: checksumHex(checksum),
  };
}

export function installLabVisualSmokeProbe(createSnapshot) {
  const api = {
    version: "visual-smoke1",
    capture() {
      try {
        const snapshot = createSnapshot();
        return {
          ok: Boolean(snapshot?.ok),
          ...snapshot,
        };
      } catch (error) {
        return {
          ok: false,
          page: "unknown",
          reason: `capture-failed: ${error.message}`,
        };
      }
    },
  };
  globalThis.__LAB_VISUAL_SMOKE__ = api;
  return api;
}

function failedCanvasSummary(reason, extras = {}) {
  return {
    ok: false,
    reason,
    width: 0,
    height: 0,
    sampleStep: DEFAULT_SAMPLE_STEP,
    samples: 0,
    visibleSamples: 0,
    alphaCoverage: 0,
    meanAlpha: 0,
    distinctColors: 0,
    lumaRange: 0,
    checksum: "00000000",
    ...extras,
  };
}

function failedReason(metrics, thresholds) {
  if (metrics.alphaCoverage < thresholds.minAlphaCoverage) return "low-alpha-coverage";
  if (metrics.distinctColors < thresholds.minDistinctColors) return "low-color-variety";
  if (metrics.lumaRange < thresholds.minLumaRange) return "low-luma-range";
  return "unknown";
}

function coarseColorKey(red, green, blue, alpha) {
  return `${red >> 4}:${green >> 4}:${blue >> 4}:${alpha >> 4}`;
}

function fnv1aByte(hash, value) {
  hash ^= value;
  return Math.imul(hash, 16777619) >>> 0;
}

function checksumHex(value) {
  return value.toString(16).padStart(8, "0");
}

function roundMetric(value) {
  return Math.round(value * 10000) / 10000;
}
