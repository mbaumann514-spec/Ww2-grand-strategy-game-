import { hashSeed, makeRng } from "./tileArt.js";

export const DEFAULT_MAP_SIZE = Object.freeze({ width: 54, height: 34 });
export const MAP_SIZE_LIMITS = Object.freeze({ min: 34, max: 96 });
export const MAP_SIZE_MODES = Object.freeze(["legacy", "random", "preset", "custom"]);
export const MAP_ORIENTATIONS = Object.freeze(["auto", "landscape", "portrait"]);
export const MAP_SIZE_PRESETS = Object.freeze({
  compact: Object.freeze({ id: "compact", longSide: 48, shortSide: 34 }),
  standard: Object.freeze({ id: "standard", longSide: 54, shortSide: 34 }),
  large: Object.freeze({ id: "large", longSide: 72, shortSide: 46 }),
});

const LARGE_HUB_PRESETS = Object.freeze({
  compact: Object.freeze({ id: "compact", longSide: 78, shortSide: 72 }),
  standard: Object.freeze({ id: "standard", longSide: 88, shortSide: 80 }),
  large: Object.freeze({ id: "large", longSide: 96, shortSide: 84 }),
});

export function normalizeMapSizeRequest(options = {}) {
  const mapSizeMode = MAP_SIZE_MODES.includes(options.mapSizeMode) ? options.mapSizeMode : "legacy";
  const mapSizePresetId = MAP_SIZE_PRESETS[options.mapSizePresetId] ? options.mapSizePresetId : "standard";
  const mapOrientation = MAP_ORIENTATIONS.includes(options.mapOrientation) ? options.mapOrientation : "auto";
  return {
    mapSizeMode,
    mapSizePresetId,
    mapOrientation,
    customMapWidth: normalizeCustomSide(options.customMapWidth, DEFAULT_MAP_SIZE.width),
    customMapHeight: normalizeCustomSide(options.customMapHeight, DEFAULT_MAP_SIZE.height),
  };
}

export function resolveMapSize(seed, options = {}) {
  const request = normalizeMapSizeRequest(options);
  const profile = options.mapSizeProfile === "largeHub" ? "largeHub" : "field";
  if (request.mapSizeMode === "legacy") {
    return {
      width: DEFAULT_MAP_SIZE.width,
      height: DEFAULT_MAP_SIZE.height,
      sizeProfileId: "fixed54x34",
      sizeMode: "legacy",
      presetId: "standard",
      requestedOrientation: "auto",
      orientation: "landscape",
      constrained: false,
    };
  }
  if (request.mapSizeMode === "custom") return resolveCustomMapSize(request, profile);

  const rng = makeRng(hashSeed(seed, "common-map-size-v0.1", profile));
  const requestedOrientation = request.mapOrientation;
  const orientation = requestedOrientation === "auto"
    ? (rng() < 0.5 ? "landscape" : "portrait")
    : requestedOrientation;

  if (request.mapSizeMode === "preset") {
    const presets = profile === "largeHub" ? LARGE_HUB_PRESETS : MAP_SIZE_PRESETS;
    const preset = presets[request.mapSizePresetId];
    return createResolvedMapSize(request, orientation, preset.longSide, preset.shortSide, `preset-${preset.id}`);
  }

  if (profile === "largeHub") {
    const longSide = weightedInteger(rng, 78, 96, 88);
    const delta = 6 + Math.floor(rng() * 7);
    const shortSide = clampInteger(longSide - delta, 72, 90);
    return createResolvedMapSize(request, orientation, longSide, shortSide, "random-large-hub-v0.1");
  }

  const longSide = weightedInteger(rng, 54, 84, 69);
  const longProgress = (longSide - 54) / 30;
  const shortBias = 1.12 + longProgress * 1.65;
  const shortSide = 34 + Math.min(19, Math.floor((rng() ** shortBias) * 20));
  return createResolvedMapSize(request, orientation, longSide, shortSide, "random-v0.1");
}

export function mapSizeRequestKey(options = {}) {
  const request = normalizeMapSizeRequest(options);
  return [
    request.mapSizeMode,
    request.mapSizePresetId,
    request.mapOrientation,
    request.customMapWidth,
    request.customMapHeight,
  ].join(":");
}

function resolveCustomMapSize(request, profile) {
  const minimum = profile === "largeHub" ? 72 : MAP_SIZE_LIMITS.min;
  const width = clampInteger(request.customMapWidth, minimum, MAP_SIZE_LIMITS.max);
  const height = clampInteger(request.customMapHeight, minimum, MAP_SIZE_LIMITS.max);
  return {
    width,
    height,
    sizeProfileId: "custom",
    sizeMode: request.mapSizeMode,
    presetId: request.mapSizePresetId,
    requestedOrientation: request.mapOrientation,
    orientation: width >= height ? "landscape" : "portrait",
    constrained: width !== request.customMapWidth || height !== request.customMapHeight,
  };
}

function createResolvedMapSize(request, orientation, longSide, shortSide, sizeProfileId) {
  return {
    width: orientation === "portrait" ? shortSide : longSide,
    height: orientation === "portrait" ? longSide : shortSide,
    sizeProfileId,
    sizeMode: request.mapSizeMode,
    presetId: request.mapSizePresetId,
    requestedOrientation: request.mapOrientation,
    orientation,
    constrained: false,
  };
}

function weightedInteger(rng, min, max, softMax) {
  const choices = [];
  for (let value = min; value <= max; value += 1) {
    const weight = value <= softMax
      ? 1
      : Math.max(0.12, (max + 1 - value) / Math.max(1, max + 1 - softMax));
    choices.push({ value, weight });
  }
  const total = choices.reduce((sum, choice) => sum + choice.weight, 0);
  let roll = rng() * total;
  for (const choice of choices) {
    roll -= choice.weight;
    if (roll <= 0) return choice.value;
  }
  return choices[choices.length - 1].value;
}

function normalizeCustomSide(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function clampInteger(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
