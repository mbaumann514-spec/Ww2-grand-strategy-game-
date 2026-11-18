import {
  LAB_CHANNEL_NAMES,
  LAB_STORAGE_KEYS,
  labChannelNameCandidates,
  labStorageKeyCandidates,
  readMigratedLabStorageItem,
  removeLabStorageItems,
} from "./labIdentity.js";

export const PROCEDURAL_PARAMS_VERSION = "grassv2-proceduralparams36";

const PROCEDURAL_API_BASE = "./api/procedural/grassland-v2";
const PROCEDURAL_PARAMS_STORAGE_KEY = LAB_STORAGE_KEYS.proceduralParamsOverride;
const PROCEDURAL_PARAMS_CHANGED_CHANNEL = LAB_CHANNEL_NAMES.proceduralParamsChanged;
const PROCEDURAL_PARAMS_CHANGED_STORAGE_KEY = LAB_STORAGE_KEYS.proceduralParamsChanged;

export const PROCEDURAL_ELEMENT_DEFINITIONS = [
  {
    id: "high-terrace-top",
    label: "high-terrace-top",
    group: "High terrace",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.55, 1.25, 0.01, 2, 0.92),
      rangeControl("saturation", "Saturation", 0.45, 1.25, 0.01, 2, 0.95),
      rangeControl("edgeNoise", "Edge noise", 0, 1, 0.01, 2, 0.65),
      rangeControl("grassDetail", "Grass detail", 0, 2, 0.01, 2, 1),
    ],
  },
  {
    id: "high-terrace-cliff-face",
    label: "high-terrace-cliff-face",
    group: "High terrace",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.45, 1.2, 0.01, 2, 0.9),
      rangeControl("saturation", "Saturation", 0.35, 1.25, 0.01, 2, 0.9),
      rangeControl("edgeNoise", "Edge noise", 0, 1, 0.01, 2, 0.7),
      rangeControl("soilWarmth", "Soil warmth", 0, 1, 0.01, 2, 0.5),
      rangeControl("strata", "Strata", 0, 2, 0.01, 2, 1),
    ],
  },
  {
    id: "low-terrace-top",
    label: "low-terrace-top",
    group: "Low terrace",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("saturation", "Saturation", 0.45, 1.25, 0.01, 2, 1),
      rangeControl("edgeNoise", "Edge noise", 0, 1, 0.01, 2, 0.52),
      rangeControl("grassDetail", "Grass detail", 0, 2, 0.01, 2, 1),
    ],
  },
  {
    id: "low-terrace-soil-edge",
    label: "low-terrace-soil-edge",
    group: "Low terrace",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("soilWarmth", "Soil warmth", 0, 1, 0.01, 2, 0.5),
      rangeControl("edgeNoise", "Edge noise", 0, 1, 0.01, 2, 0.5),
      rangeControl("grassDetail", "Edge grass", 0, 2, 0.01, 2, 1),
    ],
  },
  {
    id: "dirt-smudge",
    label: "dirt-smudge",
    group: "Ground detail",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1, 0.01, 2, 0.45),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.55),
      rangeControl("noise", "Noise", 0, 1, 0.01, 2, 0.6),
      rangeControl("warmth", "Warmth", 0, 1, 0.01, 2, 0.5),
    ],
  },
  {
    id: "rock-ground",
    label: "rock-ground",
    group: "Mountain",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.58),
      rangeControl("noise", "Noise", 0, 1, 0.01, 2, 0.62),
    ],
  },
  {
    id: "scree",
    label: "scree",
    group: "Mountain",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.82),
      rangeControl("noise", "Noise", 0, 1, 0.01, 2, 0.68),
    ],
  },
  {
    id: "grass-plane-light",
    label: "grass-plane-light",
    group: "Grass",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1, 0.01, 2, 0.42),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.65),
      rangeControl("hueShift", "Hue shift", -20, 20, 1, 0, 0),
    ],
  },
  {
    id: "dense-grass",
    label: "dense-grass",
    group: "Grass",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.5),
      rangeControl("brightness", "Brightness", 0.55, 1.35, 0.01, 2, 1),
      rangeControl("hueShift", "Hue shift", -20, 20, 1, 0, 0),
      rangeControl("detailDensity", "Blade density", 0, 2, 0.01, 2, 1),
    ],
  },
  {
    id: "meadow-bed",
    label: "meadow-bed",
    group: "Grass",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.2, 0.01, 2, 0.75),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.45),
      rangeControl("variation", "Variation", 0, 1, 0.01, 2, 0.7),
      rangeControl("detailDensity", "Detail density", 0, 2, 0.01, 2, 1),
      rangeControl("seedOffset", "Seed offset", -20, 20, 1, 0, 0),
    ],
  },
  {
    id: "fine-grass-strokes",
    label: "fine-grass-strokes",
    group: "Grass",
    controls: [
      rangeControl("forestStrength", "Forest strength", 0, 6, 0.01, 2, 1.85),
      rangeControl("grasslandStrength", "Grassland strength", 0, 6, 0.01, 2, 1.18),
      rangeControl("mountainStrength", "Mountain strength", 0, 6, 0.01, 2, 1.18),
      rangeControl("contrast", "Contrast", 0, 3, 0.01, 2, 1),
      rangeControl("darkBias", "Dark bias", 0, 2, 0.01, 2, 1),
      rangeControl("lightBias", "Light bias", 0, 2, 0.01, 2, 1),
      rangeControl("broadScale", "Broad scale", 8, 120, 1, 0, 30),
      rangeControl("fineScale", "Fine scale", 3, 36, 1, 0, 7),
      rangeControl("renderScale", "Pixel size", 2, 10, 1, 0, 3),
    ],
  },
  {
    id: "dungeon-floor",
    label: "dungeon-floor",
    group: "Dungeon",
    controls: [
      rangeControl("noiseOpacity", "Noise opacity", 0, 1.8, 0.01, 2, 0.82),
      rangeControl("contrast", "Contrast", 0, 3, 0.01, 2, 1.15),
      rangeControl("darkBias", "Dark bias", 0, 2, 0.01, 2, 1.06),
      rangeControl("lightBias", "Light bias", 0, 2, 0.01, 2, 0.82),
      rangeControl("broadScale", "Broad scale", 10, 180, 1, 0, 58),
      rangeControl("fineScale", "Fine scale", 3, 42, 1, 0, 7),
      rangeControl("renderScale", "Pixel size", 2, 10, 1, 0, 3),
    ],
  },
  {
    id: "dungeon-wall",
    label: "dungeon-wall",
    group: "Dungeon",
    controls: [
      rangeControl("noiseOpacity", "Noise opacity", 0, 1.8, 0.01, 2, 0.76),
      rangeControl("contrast", "Contrast", 0, 3, 0.01, 2, 1.22),
      rangeControl("darkBias", "Dark bias", 0, 2, 0.01, 2, 1.18),
      rangeControl("lightBias", "Light bias", 0, 2, 0.01, 2, 0.74),
      rangeControl("broadScale", "Broad scale", 10, 180, 1, 0, 48),
      rangeControl("fineScale", "Fine scale", 3, 42, 1, 0, 6),
      rangeControl("renderScale", "Pixel size", 2, 10, 1, 0, 3),
    ],
  },
  {
    id: "dungeon-floor-wear",
    label: "dungeon-floor-wear",
    group: "Dungeon",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.8, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("variation", "Variation", 0, 1, 0.01, 2, 0.65),
    ],
  },
  {
    id: "dungeon-floor-moisture",
    label: "dungeon-floor-moisture",
    group: "Dungeon",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.8, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.78),
    ],
  },
  {
    id: "dungeon-wall-cracks",
    label: "dungeon-wall-cracks",
    group: "Dungeon",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.8, 0.01, 2, 1),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
    ],
  },
  {
    id: "dungeon-wall-moisture",
    label: "dungeon-wall-moisture",
    group: "Dungeon",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.8, 0.01, 2, 0.85),
      rangeControl("density", "Density", 0, 2, 0.01, 2, 0.85),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("edgeSoftness", "Edge feather", 0, 1, 0.01, 2, 0.78),
    ],
  },
  {
    id: "dungeon-torch-warmth",
    label: "dungeon-torch-warmth",
    group: "Dungeon",
    controls: [
      rangeControl("opacity", "Opacity", 0, 1.8, 0.01, 2, 1),
      rangeControl("size", "Size", 0.4, 2.2, 0.01, 2, 1),
      rangeControl("warmth", "Warmth", 0, 1, 0.01, 2, 0.72),
    ],
  },
];

export function defaultProceduralParamsManifest() {
  return {
    version: 1,
    kind: "grassland-v2-procedural-params",
    elements: Object.fromEntries(
      PROCEDURAL_ELEMENT_DEFINITIONS.map((definition) => [
        definition.id,
        Object.fromEntries(definition.controls.map((control) => [control.key, control.defaultValue])),
      ]),
    ),
  };
}

export async function detectProceduralParamsPersistence() {
  try {
    const response = await fetch(`${PROCEDURAL_API_BASE}/status`, { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const status = await response.json();
    if (!status.ok) throw new Error(status.error ?? "status failed");
    const paramsMode = status.capabilities?.params === true ? "json" : "unavailable";
    const serverVersion = String(status.version ?? "unknown");
    const serverCurrent = serverVersion === PROCEDURAL_PARAMS_VERSION && paramsMode === "json";
    return {
      mode: "json",
      paramsMode,
      serverVersion,
      serverCurrent,
      rollbackAvailable: Boolean(status.rollbackAvailable),
      note: [
        serverCurrent ? "params.json save server ready" : "latest params save server unavailable; restart lab server",
        paramsMode === "json" ? "params API present" : "params save unavailable",
        status.rollbackAvailable ? "rollback available" : "",
      ].filter(Boolean).join(" / "),
    };
  } catch {
    return {
      mode: "unavailable",
      paramsMode: "unavailable",
      serverVersion: "none",
      serverCurrent: false,
      rollbackAvailable: false,
      note: "server API unavailable; Apply disabled",
    };
  }
}

export async function loadProceduralParams(options = {}) {
  const { useBrowserOverrides = false } = options;
  const response = await fetch("./assets/procedural/grassland-v2.params.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`grassland-v2.params.json ${response.status}`);
  const manifest = normalizeProceduralParamsManifest(await response.json());
  if (!useBrowserOverrides) return manifest;
  return normalizeProceduralParamsManifest(mergeProceduralParams(manifest, readProceduralParamsOverride()));
}

export function normalizeProceduralParamsManifest(manifest = {}) {
  const defaults = defaultProceduralParamsManifest();
  const normalized = {
    version: Number.isFinite(Number(manifest.version)) ? Number(manifest.version) : defaults.version,
    kind: typeof manifest.kind === "string" ? manifest.kind : defaults.kind,
    elements: {},
  };
  for (const definition of PROCEDURAL_ELEMENT_DEFINITIONS) {
    const source = manifest.elements?.[definition.id] ?? {};
    const fallback = defaults.elements[definition.id];
    normalized.elements[definition.id] = {};
    for (const control of definition.controls) {
      normalized.elements[definition.id][control.key] = normalizeControlValue(control, source[control.key] ?? fallback[control.key]);
    }
  }
  return normalized;
}

export function validateProceduralParamsManifestForSave(manifest) {
  if (!isRecord(manifest)) throw new Error("params must be an object");
  assertExactKeys(manifest, ["version", "kind", "elements"], "params");
  if (manifest.version !== 1) throw new Error("params.version must be 1");
  if (manifest.kind !== "grassland-v2-procedural-params") {
    throw new Error("params.kind is invalid");
  }
  if (!isRecord(manifest.elements)) throw new Error("params.elements must be an object");

  const expectedElementIds = PROCEDURAL_ELEMENT_DEFINITIONS.map((definition) => definition.id);
  assertExactKeys(manifest.elements, expectedElementIds, "params.elements");
  const elements = {};
  for (const definition of PROCEDURAL_ELEMENT_DEFINITIONS) {
    const source = manifest.elements[definition.id];
    const path = `params.elements.${definition.id}`;
    if (!isRecord(source)) throw new Error(`${path} must be an object`);
    assertExactKeys(source, definition.controls.map((control) => control.key), path);
    elements[definition.id] = {};
    for (const control of definition.controls) {
      const value = source[control.key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`${path}.${control.key} must be a finite number`);
      }
      if (control.type === "range" && (value < control.min || value > control.max)) {
        throw new Error(`${path}.${control.key} must be between ${control.min} and ${control.max}`);
      }
      elements[definition.id][control.key] = value;
    }
  }
  return {
    version: 1,
    kind: "grassland-v2-procedural-params",
    elements,
  };
}

export function cloneProceduralParamsManifest(manifest) {
  return JSON.parse(JSON.stringify(manifest));
}

export function setProceduralParamValue(manifest, elementId, key, value) {
  const definition = proceduralElementDefinition(elementId);
  const control = definition?.controls.find((entry) => entry.key === key);
  if (!control) return manifest;
  const next = cloneProceduralParamsManifest(manifest);
  next.elements[elementId][key] = normalizeControlValue(control, value);
  return next;
}

export function normalizeProceduralControlValue(elementId, key, value) {
  const definition = proceduralElementDefinition(elementId);
  const control = definition?.controls.find((entry) => entry.key === key);
  if (!control) return Number(value);
  return normalizeControlValue(control, value);
}

export function proceduralElementDefinition(elementId) {
  return PROCEDURAL_ELEMENT_DEFINITIONS.find((definition) => definition.id === elementId) ?? null;
}

export function proceduralElementSignature(params, elementId) {
  const definition = proceduralElementDefinition(elementId);
  if (!definition) return `${elementId}:unknown`;
  const elements = params?.elements && typeof params.elements === "object" ? params.elements : params;
  const source = elements?.[elementId] && typeof elements[elementId] === "object" ? elements[elementId] : {};
  return [
    elementId,
    ...definition.controls.map((control) => formatControlSignatureValue(control, source[control.key])),
  ].join(":");
}

export function proceduralElementsSignature(params, elementIds, prefix = "procedural") {
  return [
    prefix,
    ...elementIds.map((elementId) => proceduralElementSignature(params, elementId)),
  ].join("|");
}

export function clearProceduralParamsOverride() {
  try {
    removeLabStorageItems(localStorage, "proceduralParamsOverride");
  } catch {
    // Ignore storage failures.
  }
}

export async function postProceduralParamsApi(path, payload = {}) {
  const response = await fetch(`${PROCEDURAL_API_BASE}/${path}`, {
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

export function notifyProceduralParamsChanged(reason, detail = {}) {
  const message = {
    version: PROCEDURAL_PARAMS_VERSION,
    reason,
    detail,
    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
  };
  try {
    const channel = new BroadcastChannel(PROCEDURAL_PARAMS_CHANGED_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // BroadcastChannel is optional; localStorage below covers ordinary browser tabs.
  }
  try {
    localStorage.setItem(PROCEDURAL_PARAMS_CHANGED_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // If storage is unavailable, same-tab preview still remains valid.
  }
}

export function subscribeProceduralParamsChanged(callback) {
  let lastToken = null;
  const channels = [];

  function handleMessage(message) {
    if (!message || message.token === lastToken) return;
    lastToken = message.token;
    callback(message);
  }

  for (const channelName of labChannelNameCandidates("proceduralParamsChanged")) {
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

  const storageKeys = new Set(labStorageKeyCandidates("proceduralParamsChanged"));
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

function mergeProceduralParams(base, override) {
  if (!override) return base;
  const baseElements = base.elements && typeof base.elements === "object" ? base.elements : {};
  const overrideElements = override.elements && typeof override.elements === "object" ? override.elements : {};
  const elements = {};
  for (const elementId of new Set([...Object.keys(baseElements), ...Object.keys(overrideElements)])) {
    const baseElement = baseElements[elementId] && typeof baseElements[elementId] === "object" ? baseElements[elementId] : {};
    const overrideElement = overrideElements[elementId] && typeof overrideElements[elementId] === "object" ? overrideElements[elementId] : {};
    elements[elementId] = {
      ...baseElement,
      ...overrideElement,
    };
  }
  return {
    ...base,
    ...override,
    elements,
  };
}

function readProceduralParamsOverride() {
  try {
    return JSON.parse(readMigratedLabStorageItem(localStorage, "proceduralParamsOverride") ?? "null");
  } catch {
    return null;
  }
}

function normalizeControlValue(control, value) {
  if (control.type === "range") {
    const number = Number(value);
    return clamp(Number.isFinite(number) ? number : control.defaultValue, control.min, control.max);
  }
  return value;
}

function formatControlSignatureValue(control, value) {
  const normalized = normalizeControlValue(control, value ?? control.defaultValue);
  if (Number.isFinite(Number(normalized))) return Number(normalized).toFixed(control.digits);
  return String(normalized);
}

function rangeControl(key, label, min, max, step, digits, defaultValue) {
  if (!Number.isFinite(Number(defaultValue))) {
    throw new Error(`Missing default for procedural control ${key}`);
  }
  return {
    key,
    label,
    type: "range",
    min,
    max,
    step,
    digits,
    defaultValue: normalizeRangeDefault(defaultValue, min, max, digits),
  };
}

function normalizeRangeDefault(value, min, max, digits) {
  const normalized = clamp(Number(value), min, max);
  return digits === 0 ? Math.round(normalized) : normalized;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function assertExactKeys(value, expectedKeys, path) {
  const expected = new Set(expectedKeys);
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) throw new Error(`${path} contains unknown key: ${key}`);
  }
  for (const key of expectedKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`${path} is missing key: ${key}`);
    }
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
