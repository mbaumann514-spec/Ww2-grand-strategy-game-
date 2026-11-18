import { LAB_DATA_KINDS, normalizeLabDataKind } from "./labIdentity.js";

export const ELEMENT_CATALOG_VERSION = "grassv2-elementcatalog8";

const ELEMENT_CATALOG_PATH = "./assets/elements/catalog.json";

const EMPTY_CATALOG = {
  version: 1,
  kind: LAB_DATA_KINDS.elementCatalog,
  sets: {},
  elements: [],
};

export async function loadElementCatalog() {
  const response = await fetch(ELEMENT_CATALOG_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error(`catalog.json ${response.status}`);
  return normalizeElementCatalog(await response.json());
}

export function normalizeElementCatalog(catalog = {}) {
  const elements = Array.isArray(catalog.elements)
    ? catalog.elements.map(normalizeElementCatalogEntry).filter((entry) => entry.id)
    : [];
  return {
    version: Number.isFinite(Number(catalog.version)) ? Number(catalog.version) : EMPTY_CATALOG.version,
    kind: normalizeLabDataKind(catalog.kind, "elementCatalog"),
    sets: normalizeElementSets(catalog.sets),
    elements,
  };
}

export function fallbackElementCatalog() {
  return normalizeElementCatalog(EMPTY_CATALOG);
}

export function expandElementRefs(catalog, refs = []) {
  const normalized = normalizeElementCatalog(catalog);
  const result = new Set();
  for (const ref of refs) {
    const id = String(ref ?? "");
    if (!id) continue;
    if (Array.isArray(normalized.sets[id])) {
      for (const elementId of normalized.sets[id]) result.add(elementId);
    } else {
      result.add(id);
    }
  }
  return [...result];
}

export function elementCatalogSummary(catalog) {
  const normalized = normalizeElementCatalog(catalog);
  const statusCounts = {};
  for (const element of normalized.elements) {
    statusCounts[element.status] = (statusCounts[element.status] ?? 0) + 1;
  }
  return {
    elementCount: normalized.elements.length,
    setCount: Object.keys(normalized.sets).length,
    statusCounts,
  };
}

function normalizeElementCatalogEntry(entry = {}) {
  return {
    id: String(entry.id ?? ""),
    kind: String(entry.kind ?? "procedural"),
    status: normalizeStatus(entry.status),
    group: String(entry.group ?? "Misc"),
    lab: String(entry.lab ?? "planned"),
    propStore: entry.propStore ? String(entry.propStore) : undefined,
    notes: String(entry.notes ?? ""),
  };
}

function normalizeElementSets(sets = {}) {
  const result = {};
  if (!sets || typeof sets !== "object") return result;
  for (const [setId, values] of Object.entries(sets)) {
    if (!Array.isArray(values)) continue;
    result[setId] = [...new Set(values.map((value) => String(value ?? "")).filter(Boolean))];
  }
  return result;
}

function normalizeStatus(status) {
  return ["wired", "planned", "deprecated"].includes(status) ? status : "planned";
}
