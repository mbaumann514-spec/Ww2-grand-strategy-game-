import { hashSeed, makeRng } from "./tileArt.js";
import { LAB_DATA_KINDS } from "./labIdentity.js";
import { normalizeMapSizeRequest, resolveMapSize } from "./mapSize.js";

const DEFAULT_LOCAL_WIDTH = 54;
const DEFAULT_LOCAL_HEIGHT = 34;
let LOCAL_WIDTH = DEFAULT_LOCAL_WIDTH;
let LOCAL_HEIGHT = DEFAULT_LOCAL_HEIGHT;
const DUNGEON_LAYOUT_VERSION = 1;
const DUNGEON_SHAPE_VERSION = "cave-v2";
const DUNGEON_SEMANTIC_VERSION = "dungeon-semantic-v0.1";
const DUNGEON_ARCHETYPE_SELECTOR_VERSION = "dungeon-archetype-v0.1";
const DUNGEON_MATERIAL_STYLE_ID = "cave-stone";
const DUNGEON_ROOM_THEME_SET_ID = "cave-v1";
const DUNGEON_DECOR_PACK_ID = "none-v1";
const DUNGEON_LIGHTING_PROFILE_ID = "none-v1";
const DUNGEON_BORDER_THICKNESS = 2;
const MAX_THIN_WALL_REPAIR_PASSES = 24;
const DUNGEON_DOOR_SIDES = ["north", "east", "south", "west"];
const DUNGEON_STAIR_DISTANCE_PROFILES = {
  far: { id: "far", targetRank: 0.86, minRank: 0.64, maxRank: 1 },
  medium: { id: "medium", targetRank: 0.55, minRank: 0.34, maxRank: 0.76 },
  near: { id: "near", targetRank: 0.32, minRank: 0.16, maxRank: 0.52 },
};
const DUNGEON_ARCHETYPE_SELECTOR_PROFILE = {
  id: "defaultDungeonArchetypesV01",
  largeHubChance: 0.1,
  monsterHouseMinThreatTier: 15,
  largeHubMonsterHouseChance: 1 / 6,
};
const DUNGEON_SIZE_PROFILES = {
  fixed54x34: {
    id: "fixed54x34",
    width: DEFAULT_LOCAL_WIDTH,
    height: DEFAULT_LOCAL_HEIGHT,
  },
  narrowVariableV01: {
    id: "narrowVariableV01",
    minLongSide: 54,
    softLongSide: 69,
    maxLongSide: 84,
    minShortSide: 34,
    maxShortSide: 53,
  },
  largeHubVariableV01: {
    id: "largeHubVariableV01",
    minSide: 72,
    preferredMinSide: 80,
    preferredMaxSide: 88,
    maxSide: 96,
    maxSideDelta: 12,
  },
};

const DUNGEON_TOPOLOGY_PROFILES = {
  standard: {
    id: "standard",
    rngSalt: "stone-dungeon-cave-v2-standard",
    connectionStrategy: "nearest",
    cavernBase: 8,
    cavernRange: 4,
    placementAttempts: 420,
    startRadiusX: 6,
    startRadiusY: 4,
    radiusXBase: 4,
    radiusXRange: 5,
    radiusYBase: 3,
    radiusYRange: 4,
    overlapMargin: -1,
    connectorRadiusBase: 2,
    connectorExtraRadiusChance: 0.28,
    connectorWobbleChance: 0.46,
    connectorSidePocketChance: 0.14,
    extraLinkBase: 2,
    extraLinkRange: 3,
    cavernEdgeNoise: 0.28,
    cavernPocketChance: 0.2,
  },
  narrowCorridors: {
    id: "narrowCorridors",
    rngSalt: "stone-dungeon-cave-v2.7-narrow-doorway-semantics",
    generationMode: "doorwayGrowth",
    mainPathBase: 12,
    mainPathRange: 5,
    branchBase: 10,
    branchRange: 6,
    loopBase: 1,
    loopRange: 2,
    layoutAttempts: 48,
    roomGrowthAttempts: 48,
    minRoomCount: 22,
    minBoundsWidth: 36,
    minBoundsHeight: 22,
    minBoundsAreaRatio: 0.45,
    minStairsPathLength: 42,
    maxRoomDegree: 2,
    maxJunctionDegree: 3,
    junctionRoomCount: 3,
    loopMinPathDistance: 14,
  },
  largeHub: {
    id: "largeHub",
    rngSalt: "stone-dungeon-cave-v2-large-hub-v2-variable",
    generationMode: "largeHub",
    generationVariant: "largeHubV2HubStartSpokes",
    hubMinWidth: 30,
    hubMaxWidth: 46,
    hubMinHeight: 28,
    hubMaxHeight: 42,
    maxRoomDegree: 3,
    maxHubDegree: 5,
  },
};

const DUNGEON_NARROW_FALLBACK_PROFILE = {
  generationMode: "roomFirst",
  doorwayRouting: true,
  roomBase: 13,
  roomRange: 4,
  roomPlacementAttempts: 720,
  startRoomWidth: 5,
  startRoomHeight: 4,
  roomWidthBase: 4,
  roomWidthRange: 4,
  roomHeightBase: 3,
  roomHeightRange: 3,
  roomOverlapMargin: 1,
  centerExclusionDistance: 5,
  mainPathRatio: 0.68,
  extraLinkBase: 0,
  extraLinkRange: 2,
  maxRoomDegree: 2,
  maxJunctionDegree: 3,
  junctionRoomCount: 4,
  roomCornerCutChance: 0.36,
  roomPillarChance: 0.24,
};

const DUNGEON_LARGE_HUB_VARIANTS = [
  { id: "largeHubV2HubStartSpokes", weight: 4 },
  { id: "largeHubV2PerimeterLoop", weight: 3 },
  { id: "largeHubV2SplitBranches", weight: 3 },
  { id: "largeHubV2RemoteExit", weight: 2 },
];

const DUNGEON_NARROW_GROWTH_VARIANTS = [
  {
    id: "balancedSpine",
    weight: 4,
    overrides: {},
  },
  {
    id: "deadEndComb",
    weight: 3,
    overrides: {
      branchBase: 13,
      branchRange: 6,
      minRoomCount: 24,
      loopBase: 1,
      loopRange: 1,
    },
  },
  {
    id: "chokeGauntlet",
    weight: 3,
    overrides: {
      mainPathBase: 13,
      mainPathRange: 5,
      branchBase: 9,
      branchRange: 5,
      minRoomCount: 22,
    },
  },
  {
    id: "braidedLoops",
    weight: 2,
    overrides: {
      branchBase: 9,
      branchRange: 5,
      loopBase: 2,
      loopRange: 1,
      minRoomCount: 22,
    },
  },
];

export function createDungeonLocalMap(seed, layout = createDungeonLayout(seed)) {
  return {
    width: layout.width,
    height: layout.height,
    terrain: "dungeon",
    origin: { x: 0, y: 0 },
    tiles: layout.tiles.map((tile) => ({
      tile: tile.type === "wall" ? "dungeonWall" : tile.type === "rubble" ? "dungeonRubble" : tile.type,
      blocksMovement: tile.type === "wall" || tile.type === "rubble",
      explored: true,
    })),
    dungeon: {
      depth: layout.depth ?? 1,
      maxDepth: 6,
      threat: layout.threatTier ?? 1,
      topologyId: layout.topologyId,
      requestedTopologyId: layout.requestedTopologyId,
      generationVariant: layout.generationVariant,
      sizeProfileId: layout.sizeProfileId,
      mapSizeMode: layout.mapSizeMode,
      mapSizePresetId: layout.mapSizePresetId,
      requestedOrientation: layout.requestedOrientation,
      stairDistanceProfile: layout.stairDistanceProfile,
      shapeVersion: layout.shapeVersion,
      semanticVersion: layout.semanticVersion,
      archetypeSelectorVersion: layout.archetypeSelectorVersion,
      archetypeSelection: cloneDungeonArchetypeSelection(layout.archetypeSelection),
      floorIntent: cloneDungeonFloorIntent(layout.floorIntent),
      materialStyleId: layout.materialStyleId,
      stairsUp: { ...layout.stairsUp },
      stairsDown: { ...layout.stairsDown },
      placementSlots: cloneDungeonPlacementSlots(layout.placementSlots),
      qualityReport: cloneDungeonQualityReport(layout.qualityReport),
      lightSources: cloneLightSources(layout.lightSources),
      cleared: false,
    },
  };
}

export function createDungeonLayout(seed, options = {}) {
  const archetypeSelection = selectSizeCompatibleDungeonArchetype(seed, options);
  const baseTopology = dungeonTopologyProfile(archetypeSelection.selectedTopologyId);
  const size = pickDungeonSize(seed, baseTopology, options);
  const rng = makeRng(hashSeed(seed, baseTopology.rngSalt));
  const runtimeTopology = {
    ...applyDungeonSizeScaling(createDungeonRuntimeTopology(baseTopology, rng), size),
    requestedTopologyId: archetypeSelection.requestedTopologyId,
    archetypeSelection,
    threatTier: archetypeSelection.threatTier,
  };
  return withActiveDungeonSize(size.width, size.height, () => {
    if (runtimeTopology.generationMode === "largeHub") return createLargeHubDungeonLayout(rng, runtimeTopology);
    if (runtimeTopology.generationMode === "doorwayGrowth") return createDoorwayGrowthDungeonLayout(rng, runtimeTopology);
    if (runtimeTopology.generationMode === "roomFirst") return createRoomFirstDungeonLayout(rng, runtimeTopology);
    return createCaveDungeonLayout(rng, runtimeTopology);
  });
}

export function resolveDungeonSize(seed, options = {}) {
  const archetypeSelection = selectSizeCompatibleDungeonArchetype(seed, options);
  const topology = dungeonTopologyProfile(archetypeSelection.selectedTopologyId);
  return pickDungeonSize(seed, topology, options);
}

function selectSizeCompatibleDungeonArchetype(seed, options) {
  const selection = selectDungeonArchetype(seed, options);
  const request = normalizeMapSizeRequest(options);
  const customTooSmallForLargeHub = request.mapSizeMode === "custom"
    && (request.customMapWidth < 72 || request.customMapHeight < 72);
  if (selection.mode !== "auto" || selection.selectedTopologyId !== "largeHub" || !customTooSmallForLargeHub) {
    return selection;
  }
  return {
    ...selection,
    selectedTopologyId: "narrowCorridors",
    monsterHouseEligible: false,
    encounterModifierId: "none",
    sizeCompatibilityFallback: "narrowCorridors",
  };
}

export function selectDungeonArchetype(seed, options = {}) {
  const requestedTopologyId = normalizeDungeonRequestedTopologyId(options.topologyId);
  const threatTier = normalizeDungeonThreatTier(options.threatTier ?? options.threat ?? options.depth ?? 1);
  if (requestedTopologyId !== "auto") {
    return createDungeonArchetypeSelection({
      mode: "explicit",
      requestedTopologyId,
      selectedTopologyId: requestedTopologyId,
      threatTier,
      encounterModifierId: normalizeDungeonEncounterModifierId(options.encounterModifierId),
    });
  }

  const profile = DUNGEON_ARCHETYPE_SELECTOR_PROFILE;
  const rng = makeRng(hashSeed(seed, `${profile.id}:threat-${threatTier}`));
  const selectedTopologyId = rng() < profile.largeHubChance ? "largeHub" : "narrowCorridors";
  const monsterHouseEligible = selectedTopologyId === "largeHub" && threatTier >= profile.monsterHouseMinThreatTier;
  const encounterModifierId = monsterHouseEligible && rng() < profile.largeHubMonsterHouseChance
    ? "monsterHouse"
    : "none";
  return createDungeonArchetypeSelection({
    mode: "auto",
    requestedTopologyId,
    selectedTopologyId,
    threatTier,
    encounterModifierId,
    monsterHouseEligible,
  });
}

function createDungeonArchetypeSelection({
  mode,
  requestedTopologyId,
  selectedTopologyId,
  threatTier,
  encounterModifierId,
  monsterHouseEligible = false,
}) {
  const profile = DUNGEON_ARCHETYPE_SELECTOR_PROFILE;
  return {
    version: DUNGEON_ARCHETYPE_SELECTOR_VERSION,
    profileId: profile.id,
    mode,
    requestedTopologyId,
    selectedTopologyId,
    threatTier,
    largeHubChance: profile.largeHubChance,
    monsterHouseMinThreatTier: profile.monsterHouseMinThreatTier,
    largeHubMonsterHouseChance: profile.largeHubMonsterHouseChance,
    monsterHouseEligible,
    encounterModifierId,
  };
}

function normalizeDungeonRequestedTopologyId(value) {
  if (value === "auto" || value === undefined || value === null || value === "") return "auto";
  return DUNGEON_TOPOLOGY_PROFILES[value] ? value : "auto";
}

function normalizeDungeonThreatTier(value) {
  return clamp(Math.floor(Number.isFinite(Number(value)) ? Number(value) : 1), 1, 999);
}

function normalizeDungeonEncounterModifierId(value) {
  return value === "monsterHouse" ? "monsterHouse" : "none";
}

function createDungeonRuntimeTopology(topology, rng) {
  if (topology.id === "largeHub" && topology.generationMode === "largeHub") {
    const variant = pickDungeonLargeHubVariant(rng);
    return {
      ...topology,
      generationVariant: variant.id,
    };
  }
  if (topology.id !== "narrowCorridors" || topology.generationMode !== "doorwayGrowth") return topology;
  const variant = pickDungeonNarrowGrowthVariant(rng);
  return {
    ...topology,
    ...variant.overrides,
    generationVariant: variant.id,
  };
}

function pickDungeonLargeHubVariant(rng) {
  const totalWeight = DUNGEON_LARGE_HUB_VARIANTS.reduce((sum, variant) => sum + variant.weight, 0);
  let roll = rng() * totalWeight;
  for (const variant of DUNGEON_LARGE_HUB_VARIANTS) {
    roll -= variant.weight;
    if (roll <= 0) return variant;
  }
  return DUNGEON_LARGE_HUB_VARIANTS[0];
}

function pickDungeonNarrowGrowthVariant(rng) {
  const totalWeight = DUNGEON_NARROW_GROWTH_VARIANTS.reduce((sum, variant) => sum + variant.weight, 0);
  let roll = rng() * totalWeight;
  for (const variant of DUNGEON_NARROW_GROWTH_VARIANTS) {
    roll -= variant.weight;
    if (roll <= 0) return variant;
  }
  return DUNGEON_NARROW_GROWTH_VARIANTS[0];
}

function pickDungeonSize(seed, topology, options = {}) {
  const mapSizeRequest = normalizeMapSizeRequest(options);
  if (mapSizeRequest.mapSizeMode !== "legacy") {
    const resolved = resolveMapSize(seed, {
      ...mapSizeRequest,
      mapSizeProfile: topology.id === "largeHub" ? "largeHub" : "field",
    });
    return {
      sizeProfileId: `map-${resolved.sizeProfileId}`,
      mapSizeMode: resolved.sizeMode,
      mapSizePresetId: resolved.presetId,
      requestedOrientation: resolved.requestedOrientation,
      width: resolved.width,
      height: resolved.height,
      orientation: resolved.orientation,
    };
  }
  const sizeProfileId = normalizeDungeonSizeProfileId(topology, options.sizeProfileId);
  if (sizeProfileId === "fixed54x34") {
    return {
      sizeProfileId,
      mapSizeMode: "legacy",
      mapSizePresetId: "standard",
      requestedOrientation: "auto",
      width: DUNGEON_SIZE_PROFILES.fixed54x34.width,
      height: DUNGEON_SIZE_PROFILES.fixed54x34.height,
      orientation: "landscape",
    };
  }

  if (sizeProfileId === "largeHubVariableV01") {
    const profile = DUNGEON_SIZE_PROFILES.largeHubVariableV01;
    const rng = makeRng(hashSeed(seed, `${topology.rngSalt}:dungeon-large-hub-size-v0.1`));
    const size = pickDungeonLargeHubVariableSize(rng, profile);
    return {
      sizeProfileId,
      mapSizeMode: "legacy",
      mapSizePresetId: "standard",
      requestedOrientation: "auto",
      width: size.width,
      height: size.height,
      orientation: size.width >= size.height ? "landscape" : "portrait",
    };
  }

  const profile = DUNGEON_SIZE_PROFILES.narrowVariableV01;
  const rng = makeRng(hashSeed(seed, `${topology.rngSalt}:dungeon-size-v0.1`));
  const landscape = rng() < 0.5;
  const longSide = pickDungeonVariableLongSide(rng, profile);
  const shortSide = pickDungeonVariableShortSide(rng, profile, longSide);
  return {
    sizeProfileId,
    mapSizeMode: "legacy",
    mapSizePresetId: "standard",
    requestedOrientation: "auto",
    width: landscape ? longSide : shortSide,
    height: landscape ? shortSide : longSide,
    orientation: landscape ? "landscape" : "portrait",
  };
}

function normalizeDungeonSizeProfileId(topology, sizeProfileId) {
  if (sizeProfileId === "fixed54x34" && topology.id !== "largeHub") return "fixed54x34";
  if (sizeProfileId === "narrowVariableV01" && topology.id === "narrowCorridors") return "narrowVariableV01";
  if (sizeProfileId === "largeHubVariableV01" && topology.id === "largeHub") return "largeHubVariableV01";
  if (topology.id === "largeHub") return "largeHubVariableV01";
  return topology.id === "narrowCorridors" ? "narrowVariableV01" : "fixed54x34";
}

function pickDungeonLargeHubVariableSize(rng, profile) {
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const width = pickDungeonLargeHubSide(rng, profile);
    const height = pickDungeonLargeHubSide(rng, profile);
    if (Math.abs(width - height) <= profile.maxSideDelta) return { width, height };
  }
  const width = pickDungeonLargeHubSide(rng, profile);
  const delta = rngBetweenInt(rng, -profile.maxSideDelta, profile.maxSideDelta);
  return {
    width,
    height: clamp(width + delta, profile.minSide, profile.maxSide),
  };
}

function pickDungeonLargeHubSide(rng, profile) {
  const choices = [];
  for (let value = profile.minSide; value <= profile.maxSide; value += 1) {
    let weight = 1;
    if (value < profile.preferredMinSide) {
      weight = 0.35 + ((value - profile.minSide) / Math.max(1, profile.preferredMinSide - profile.minSide)) * 0.55;
    } else if (value > profile.preferredMaxSide) {
      weight = Math.max(0.2, 1 - ((value - profile.preferredMaxSide) / Math.max(1, profile.maxSide - profile.preferredMaxSide)) * 0.75);
    }
    choices.push({ value, weight });
  }
  return pickWeightedDungeonValue(rng, choices);
}

function pickDungeonVariableLongSide(rng, profile) {
  const choices = [];
  for (let value = profile.minLongSide; value <= profile.maxLongSide; value += 1) {
    const weight = value <= profile.softLongSide
      ? 1
      : Math.max(0.12, (profile.maxLongSide + 1 - value) / (profile.maxLongSide + 1 - profile.softLongSide));
    choices.push({ value, weight });
  }
  return pickWeightedDungeonValue(rng, choices);
}

function pickDungeonVariableShortSide(rng, profile, longSide) {
  const t = (longSide - profile.minLongSide) / Math.max(1, profile.maxLongSide - profile.minLongSide);
  const bias = 1.12 + t * 1.65;
  const span = profile.maxShortSide - profile.minShortSide + 1;
  return profile.minShortSide + Math.min(span - 1, Math.floor((rng() ** bias) * span));
}

function pickWeightedDungeonValue(rng, choices) {
  const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
  let roll = rng() * totalWeight;
  for (const choice of choices) {
    roll -= choice.weight;
    if (roll <= 0) return choice.value;
  }
  return choices[choices.length - 1].value;
}

function applyDungeonSizeScaling(topology, size) {
  const sized = {
    ...topology,
    sizeProfileId: size.sizeProfileId,
    orientation: size.orientation,
    width: size.width,
    height: size.height,
  };
  if (topology.id !== "narrowCorridors") return sized;

  const sizeScale = Math.sqrt((size.width * size.height) / (DEFAULT_LOCAL_WIDTH * DEFAULT_LOCAL_HEIGHT));
  const pathScale = 1 + (sizeScale - 1) * 0.45;
  const branchScale = 1 + (sizeScale - 1) * 0.55;
  const minRoomScale = 1 + (sizeScale - 1) * 0.35;
  const loopExtra = sizeScale >= 1.35 ? 1 : 0;
  const layoutAttemptBase = topology.generationVariant === "braidedLoops" || topology.generationVariant === "deadEndComb" ? 36 : 18;
  const scaledMinRoomCount = Math.max(topology.minRoomCount, Math.floor(topology.minRoomCount * minRoomScale));
  return {
    ...sized,
    sizeScale,
    mainPathBase: scaleDungeonCount(topology.mainPathBase, pathScale),
    mainPathRange: scaleDungeonCount(topology.mainPathRange, Math.min(pathScale, 1.18)),
    branchBase: scaleDungeonCount(topology.branchBase, branchScale),
    branchRange: scaleDungeonCount(topology.branchRange, Math.min(branchScale, 1.22)),
    minRoomCount: topology.generationVariant === "deadEndComb"
      ? Math.max(22, scaledMinRoomCount - 2)
      : scaledMinRoomCount,
    layoutAttempts: Math.min(40, Math.max(18, Math.round(layoutAttemptBase + sizeScale * 6))),
    roomGrowthAttempts: Math.min(56, Math.max(44, Math.round(38 + sizeScale * 8))),
    loopBase: Math.min(3, topology.loopBase + loopExtra),
    loopRange: Math.min(3, topology.loopRange + (sizeScale >= 1.45 ? 1 : 0)),
    minBoundsWidth: Math.min(size.width - DUNGEON_BORDER_THICKNESS * 2, Math.round(size.width * 0.66)),
    minBoundsHeight: Math.min(size.height - DUNGEON_BORDER_THICKNESS * 2, Math.round(size.height * 0.64)),
    minStairsPathLength: Math.max(topology.minStairsPathLength, Math.round((size.width + size.height) * 0.48)),
  };
}

function scaleDungeonCount(value, scale) {
  return Math.max(value, Math.round(value * scale));
}

function withActiveDungeonSize(width, height, fn) {
  const previousWidth = LOCAL_WIDTH;
  const previousHeight = LOCAL_HEIGHT;
  LOCAL_WIDTH = width;
  LOCAL_HEIGHT = height;
  try {
    return fn();
  } finally {
    LOCAL_WIDTH = previousWidth;
    LOCAL_HEIGHT = previousHeight;
  }
}

function createCaveDungeonLayout(rng, topology) {
  const tiles = createDungeonTileArray();
  const caverns = createDungeonCaverns(rng, topology);
  const corridorSamples = [];
  const corridors = [];

  for (const cavern of caverns) carveDungeonCavern(tiles, cavern, rng, topology);
  connectDungeonCaverns(tiles, caverns, rng, topology, corridors, corridorSamples);

  enforceDungeonBorderWalls(tiles);
  let prunedOpenTiles = pruneDisconnectedDungeonFloors(tiles, caverns[0].center);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, caverns[0].center);

  const stairsUp = nearestOpenDungeonTile(tiles, caverns[0].center) ?? caverns[0].center;
  const exitCavern = farthestDungeonCavern(caverns, stairsUp);
  const stairsDown = nearestOpenDungeonTile(tiles, exitCavern.center, (point) => dungeonManhattan(point, stairsUp) >= 8)
    ?? farthestOpenDungeonTile(tiles, stairsUp)
    ?? exitCavern.center;

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "floor", rng());
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "floor", rng());
  if (!dungeonExitIsConnected(tiles, stairsUp, stairsDown)) {
    carveDungeonConnector(tiles, stairsUp, stairsDown, rng, topology, corridorSamples, { repair: true });
  }

  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, stairsUp);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "stairsUp", 0.2);
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "stairsDown", 0.8);

  return createDungeonLayoutRecord(topology, tiles, caverns, corridors, corridorSamples, stairsUp, stairsDown, prunedOpenTiles);
}

function createRoomFirstDungeonLayout(rng, topology) {
  const tiles = createDungeonTileArray();
  const rooms = createDungeonRectRooms(rng, topology);
  const corridorSamples = [];
  const corridors = [];

  for (const room of rooms) carveDungeonRectRoom(tiles, room, rng, topology);
  connectDungeonRectRooms(tiles, rooms, rng, topology, corridors, corridorSamples);
  addDungeonRoomPillars(tiles, rooms, rng, topology, corridorSamples);

  enforceDungeonBorderWalls(tiles);
  let prunedOpenTiles = pruneDisconnectedDungeonFloors(tiles, rooms[0].center);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, rooms[0].center);

  const stairsUp = nearestOpenDungeonTile(tiles, rooms[0].center) ?? rooms[0].center;
  const exitRoom = farthestDungeonCavern(rooms, stairsUp);
  const stairsDown = nearestOpenDungeonTile(tiles, exitRoom.center, (point) => dungeonManhattan(point, stairsUp) >= 8)
    ?? farthestOpenDungeonTile(tiles, stairsUp)
    ?? exitRoom.center;

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "floor", rng());
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "floor", rng());
  if (!dungeonExitIsConnected(tiles, stairsUp, stairsDown)) {
    carveDungeonRectConnector(tiles, stairsUp, stairsDown, rng, corridorSamples, { repair: true });
  }

  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, stairsUp);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "stairsUp", 0.2);
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "stairsDown", 0.8);

  return createDungeonLayoutRecord(topology, tiles, rooms, corridors, corridorSamples, stairsUp, stairsDown, prunedOpenTiles);
}

function createDoorwayGrowthDungeonLayout(rng, topology) {
  let bestLayout = null;
  let bestScore = -Infinity;
  for (let attempt = 0; attempt < topology.layoutAttempts; attempt += 1) {
    const layout = tryCreateDoorwayGrowthDungeonLayout(rng, topology);
    if (!layout) continue;
    if (dungeonGrowthLayoutMeetsSpread(layout, topology)) return layout;
    const score = scoreDungeonGrowthLayout(layout, topology);
    if (score > bestScore) {
      bestLayout = layout;
      bestScore = score;
    }
  }
  if (bestLayout) return bestLayout;
  return createRoomFirstDungeonLayout(rng, {
    ...DUNGEON_NARROW_FALLBACK_PROFILE,
    id: topology.id,
    generationVariant: topology.generationVariant,
    sizeProfileId: topology.sizeProfileId,
    orientation: topology.orientation,
    width: topology.width,
    height: topology.height,
  });
}

function tryCreateDoorwayGrowthDungeonLayout(rng, topology) {
  const debugGrowth = globalThis.process?.env?.DUNGEON_DEBUG_GROWTH === "1";
  const tiles = createDungeonTileArray();
  const rooms = [];
  const corridors = [];
  const corridorSamples = [];
  const growthPlan = dungeonGrowthStartPlan(rng);
  const start = growthPlan.start;
  const startRoom = createDungeonGrowthRoomNode(
    "start",
    start.x - Math.floor(5 / 2),
    start.y - Math.floor(4 / 2),
    5,
    4,
    "rectSmall",
    topology.maxJunctionDegree,
  );
  rooms.push(startRoom);
  carveDungeonGrowthRoom(tiles, startRoom, rng);

  const mainPathTarget = topology.mainPathBase + Math.floor(rng() * topology.mainPathRange);
  const branchTarget = topology.branchBase + Math.floor(rng() * topology.branchRange);
  let branchCorridors = 0;
  const junctionIndices = selectDungeonGrowthJunctionIndices(mainPathTarget, topology, rng);
  const mainPath = [startRoom];
  for (let index = 1; index < mainPathTarget; index += 1) {
    const templateKind = junctionIndices.has(index) ? "junction" : "normal";
    const sources = [mainPath[mainPath.length - 1], ...mainPath.slice(0, -1).reverse()]
      .filter((room) => dungeonGrowthRoomCapacity(room) > 0);
    let room = null;
    for (const source of sources) {
      room = placeDungeonGrowthRoom(tiles, rooms, source, `main-${index}`, templateKind, "critical", rng, topology, corridors, corridorSamples, {
        target: growthPlan.target,
      });
      if (room) break;
    }
    if (!room) {
      if (debugGrowth) console.log(`doorwayGrowth failed: main path ${index}`);
      if (mainPath.length < 6) return null;
      break;
    }
    room.maxDegree = topology.maxJunctionDegree;
    mainPath.push(room);
    if (index > 1 && branchCorridors < branchTarget && rng() < 0.58 && dungeonGrowthRoomCapacity(room) > 1) {
      const branch = placeDungeonGrowthRoom(tiles, rooms, room, `branch-${branchCorridors}`, "normal", "branch", rng, topology, corridors, corridorSamples);
      if (branch) {
        branchCorridors += 1;
        if (branchCorridors < branchTarget && rng() < 0.28 && dungeonGrowthRoomCapacity(branch) > 0) {
          const chained = placeDungeonGrowthRoom(tiles, rooms, branch, `branch-${branchCorridors}`, "normal", "branch", rng, topology, corridors, corridorSamples);
          if (chained) branchCorridors += 1;
        }
      }
    }
  }

  let branchAttempts = 0;
  while (branchCorridors < branchTarget && branchAttempts < branchTarget * 18) {
    branchAttempts += 1;
    const sources = rooms
      .filter((room) => room.id !== mainPath[mainPath.length - 1].id && dungeonGrowthRoomCapacity(room) > 0)
      .sort((a, b) => dungeonGrowthBranchSourceScore(a, mainPath, rng) - dungeonGrowthBranchSourceScore(b, mainPath, rng));
    const source = sources[0];
    if (!source) break;
    const room = placeDungeonGrowthRoom(tiles, rooms, source, `branch-${branchCorridors}`, "normal", "branch", rng, topology, corridors, corridorSamples);
    if (!room) continue;
    branchCorridors += 1;
    if (branchCorridors < branchTarget && rng() < 0.34 && dungeonGrowthRoomCapacity(room) > 0) {
      const chained = placeDungeonGrowthRoom(tiles, rooms, room, `branch-${branchCorridors}`, "normal", "branch", rng, topology, corridors, corridorSamples);
      if (chained) branchCorridors += 1;
    }
  }
  while (rooms.length < topology.minRoomCount && branchAttempts < branchTarget * 64) {
    branchAttempts += 1;
    const sources = rooms.filter((room) => dungeonGrowthRoomCapacity(room) > 0);
    const source = sources[Math.floor(rng() * Math.max(1, sources.length))];
    if (!source) break;
    const room = placeDungeonGrowthRoom(tiles, rooms, source, `branch-${branchCorridors}`, "normal", "branch", rng, topology, corridors, corridorSamples, {
      relaxed: true,
      forceTemplate: { id: "rectSmall", width: 3, height: 3 },
    });
    if (room) branchCorridors += 1;
  }
  if (rooms.length < topology.minRoomCount) {
    if (debugGrowth) console.log(`doorwayGrowth failed: rooms ${rooms.length}, branches ${branchCorridors}`);
    return null;
  }

  const loopTarget = topology.loopBase + Math.floor(rng() * topology.loopRange);
  const loops = addDungeonGrowthLoops(tiles, rooms, rng, topology, corridors, corridorSamples, loopTarget);
  if (loops < topology.loopBase) {
    if (debugGrowth) console.log(`doorwayGrowth failed: loops ${loops}`);
    return null;
  }

  enforceDungeonBorderWalls(tiles);
  let prunedOpenTiles = pruneDisconnectedDungeonFloors(tiles, rooms[0].center);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, rooms[0].center);

  const stairs = chooseDungeonGrowthStairs(tiles, rooms, corridors, rng, topology);
  const stairsUp = stairs.up;
  const stairsDown = stairs.down;

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "floor", rng());
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "floor", rng());
  if (!dungeonExitIsConnected(tiles, stairsUp, stairsDown)) {
    carveDungeonPolylineConnector(tiles, [stairsUp, stairsDown], rng, corridorSamples, { repair: true });
  }

  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, stairsUp);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "stairsUp", 0.2);
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "stairsDown", 0.8);

  return createDungeonLayoutRecord({
    ...topology,
    stairDistanceProfile: stairs.profile,
  }, tiles, rooms, corridors, corridorSamples, stairsUp, stairsDown, prunedOpenTiles);
}

function createLargeHubDungeonLayout(rng, topology) {
  return createLargeHubVariableDungeonLayout(rng, topology);
}

function createLargeHubVariableDungeonLayout(rng, topology) {
  let bestLayout = null;
  for (let attempt = 0; attempt < 28; attempt += 1) {
    const layout = createLargeHubVariableDungeonLayoutAttempt(rng, topology);
    if (!layout) continue;
    bestLayout = layout;
    const hubRoom = layout.rooms.find((room) => room.templateId === "largeHub");
    const branchCount = layout.corridors.filter((corridor) => corridor.kind === "branch").length;
    const loopCount = layout.corridors.filter((corridor) => corridor.kind === "loop").length;
    const hubDegree = hubRoom?.degree ?? 0;
    if (hubRoom && layout.rooms.length >= 8 && branchCount >= 4 && loopCount >= 1 && hubDegree >= 3 && hubDegree <= 5) return layout;
  }
  return bestLayout ?? createLargeHubVariableDungeonLayoutAttempt(rng, topology, { relaxed: true });
}

function createLargeHubVariableDungeonLayoutAttempt(rng, topology, options = {}) {
  const tiles = createDungeonTileArray();
  const rooms = [];
  const corridors = [];
  const corridorSamples = [];
  const roomsById = new Map();
  const occupiedRooms = [];
  const minSide = Math.min(LOCAL_WIDTH, LOCAL_HEIGHT);
  const roomSize = clamp(Math.round(minSide * 0.085), 6, 8);
  const hubWidth = clamp(
    Math.round(LOCAL_WIDTH * (0.39 + rng() * 0.1)),
    topology.hubMinWidth,
    Math.min(topology.hubMaxWidth, LOCAL_WIDTH - 28),
  );
  const hubHeight = clamp(
    Math.round(LOCAL_HEIGHT * (0.36 + rng() * 0.1)),
    topology.hubMinHeight,
    Math.min(topology.hubMaxHeight, LOCAL_HEIGHT - 28),
  );
  const hubX = clamp(
    Math.round((LOCAL_WIDTH - hubWidth) * (0.23 + rng() * 0.2)),
    DUNGEON_BORDER_THICKNESS + roomSize + 3,
    LOCAL_WIDTH - hubWidth - roomSize - 5,
  );
  const hubY = clamp(
    Math.round((LOCAL_HEIGHT - hubHeight) * (0.2 + rng() * 0.24)),
    DUNGEON_BORDER_THICKNESS + roomSize,
    LOCAL_HEIGHT - hubHeight - roomSize - 4,
  );
  const hub = createDungeonGrowthRoomNode("hub", hubX, hubY, hubWidth, hubHeight, "largeHub", topology.maxHubDegree);
  const hubStart = rng() < 0.8;
  const variant = topology.generationVariant ?? "largeHubV2HubStartSpokes";
  const sideOrder = largeHubVariantSideOrder(variant, rng);
  const exitSide = sideOrder[0];
  const startSide = sideOrder.find((side) => side !== exitSide && side !== oppositeDungeonDoorSide(exitSide)) ?? sideOrder[1];

  addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, hub, rng);
  const start = createLargeHubSatelliteRoom("start", hub, startSide, rng, topology, occupiedRooms, {
    roomSize,
    lane: rng() < 0.5 ? 0.25 : 0.75,
    templateKind: "retreat",
    distance: rngBetweenInt(rng, 4, 8),
  });
  const gate = createLargeHubSatelliteRoom("exit-gate", hub, exitSide, rng, topology, occupiedRooms, {
    roomSize,
    lane: 0.32 + rng() * 0.36,
    templateKind: "junction",
    distance: rngBetweenInt(rng, 4, 8),
  });
  if (!start || !gate) return null;
  addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, start, rng);
  addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, gate, rng);

  const exit = createLargeHubSatelliteRoom("exit", gate, exitSide, rng, topology, occupiedRooms, {
    roomSize,
    templateKind: "exit",
    distance: rngBetweenInt(rng, roomSize + 4, roomSize + 12),
  }) ?? createLargeHubSatelliteRoom("exit", hub, exitSide, rng, topology, occupiedRooms, {
    roomSize,
    lane: rng() < 0.5 ? 0.16 : 0.84,
    templateKind: "exit",
    distance: rngBetweenInt(rng, roomSize + 12, roomSize + 20),
  });
  if (!exit) return null;
  addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, exit, rng);

  if (!hubStart) connectLargeHubRoomsAuto(tiles, roomsById, "start", "hub", "critical", rng, corridors, corridorSamples);
  else connectLargeHubRoomsAuto(tiles, roomsById, "hub", "start", "branch", rng, corridors, corridorSamples);
  connectLargeHubRoomsAuto(tiles, roomsById, "hub", "exit-gate", "critical", rng, corridors, corridorSamples);
  connectLargeHubRoomsAuto(tiles, roomsById, "exit-gate", "exit", "critical", rng, corridors, corridorSamples);

  const branchTarget = rngBetweenInt(rng, 5, variant === "largeHubV2RemoteExit" ? 7 : 6);
  const directHubBranchTarget = clamp(rngBetweenInt(rng, 1, 3), 0, Math.max(0, topology.maxHubDegree - (hub.degree ?? 0)));
  let directHubBranches = 0;
  for (let index = 0; index < branchTarget; index += 1) {
    const result = addLargeHubBranchRoom({
      tiles,
      rooms,
      roomsById,
      occupiedRooms,
      hub,
      index,
      roomSize,
      topology,
      rng,
      corridors,
      corridorSamples,
      preferHub: directHubBranches < directHubBranchTarget,
    });
    if (result?.sourceId === "hub") directHubBranches += 1;
  }

  const loopAdded = addLargeHubLoopCorridor(tiles, rooms, roomsById, rng, corridors, corridorSamples);
  if (!loopAdded && !options.relaxed) return null;

  enforceDungeonBorderWalls(tiles);
  let prunedOpenTiles = pruneDisconnectedDungeonFloors(tiles, roomsById.get("start").center);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, roomsById.get("start").center);

  const stairsUpRoom = hubStart ? roomsById.get("hub") : roomsById.get("start");
  const stairsUp = dungeonRoomStairPoint(tiles, stairsUpRoom, rng) ?? stairsUpRoom.center;
  const stairsDown = dungeonRoomStairPoint(tiles, roomsById.get("exit"), rng) ?? roomsById.get("exit").center;
  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "floor", rng());
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "floor", rng());
  if (!dungeonExitIsConnected(tiles, stairsUp, stairsDown)) {
    carveDungeonPolylineConnector(tiles, [stairsUp, stairsDown], rng, corridorSamples, { repair: true });
  }

  enforceDungeonBorderWalls(tiles);
  prunedOpenTiles += pruneDisconnectedDungeonFloors(tiles, stairsUp);
  repairDungeonThinWalls(tiles, rng);
  enforceDungeonBorderWalls(tiles);

  setDungeonTile(tiles, stairsUp.x, stairsUp.y, "stairsUp", 0.2);
  setDungeonTile(tiles, stairsDown.x, stairsDown.y, "stairsDown", 0.8);

  return createDungeonLayoutRecord({
    ...topology,
    stairDistanceProfile: hubStart ? "medium" : "far",
  }, tiles, rooms, corridors, corridorSamples, stairsUp, stairsDown, prunedOpenTiles);
}

function addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, room, rng) {
  rooms.push(room);
  roomsById.set(room.id, room);
  occupiedRooms.push(room);
  if (room.templateId === "largeHub") carveDungeonLargeHubRoom(tiles, room, rng);
  else carveDungeonGrowthRoom(tiles, room, rng);
}

function createLargeHubSatelliteRoom(id, anchor, side, rng, topology, occupiedRooms, options = {}) {
  const roomSize = options.roomSize ?? 7;
  const template = createLargeHubSatelliteTemplate(rng, options.templateKind, roomSize);
  const lane = options.lane ?? (0.18 + rng() * 0.64);
  const distance = options.distance ?? rngBetweenInt(rng, 4, 10);
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const jitter = rngBetweenInt(rng, -3, 3);
    const attemptDistance = distance + Math.floor(attempt / 4) * 2 + rngBetweenInt(rng, 0, 2);
    const point = largeHubSatelliteTopLeft(anchor, side, template.width, template.height, lane, attemptDistance, jitter);
    const room = createDungeonGrowthRoomNode(id, point.x, point.y, template.width, template.height, template.id, template.maxDegree ?? topology.maxRoomDegree);
    if (!largeHubSatelliteRoomFits(room, occupiedRooms, options.relaxed || attempt > 12 ? 0 : 2)) continue;
    return room;
  }
  return null;
}

function createLargeHubSatelliteTemplate(rng, kind, roomSize) {
  if (kind === "junction") return { id: "crossTiny", width: 5, height: 5, maxDegree: 3 };
  if (kind === "exit" || kind === "retreat") {
    return {
      id: rng() < 0.22 ? "chamfered" : "rectSmall",
      width: roomSize + rngBetweenInt(rng, 0, 2),
      height: roomSize + rngBetweenInt(rng, -1, 1),
    };
  }
  if (kind === "reward" || rng() < 0.28) {
    const horizontal = rng() < 0.5;
    return {
      id: "rectLong",
      width: horizontal ? roomSize + 2 : roomSize - 1,
      height: horizontal ? roomSize - 1 : roomSize + 2,
    };
  }
  return {
    id: rng() < 0.2 ? "chamfered" : "rectSmall",
    width: roomSize + rngBetweenInt(rng, -1, 1),
    height: roomSize + rngBetweenInt(rng, -1, 1),
  };
}

function largeHubSatelliteTopLeft(anchor, side, width, height, lane, distance, jitter) {
  let x;
  let y;
  if (anchor.templateId === "largeHub") {
    if (side === "west" || side === "east") {
      x = side === "west" ? anchor.x - distance - width : anchor.x + anchor.width + distance;
      y = Math.round(anchor.y + (anchor.height - height) * lane) + jitter;
    } else {
      x = Math.round(anchor.x + (anchor.width - width) * lane) + jitter;
      y = side === "north" ? anchor.y - distance - height : anchor.y + anchor.height + distance;
    }
  } else if (side === "west" || side === "east") {
    x = side === "west" ? anchor.x - distance - width : anchor.x + anchor.width + distance;
    y = anchor.center.y - Math.floor(height / 2) + jitter;
  } else {
    x = anchor.center.x - Math.floor(width / 2) + jitter;
    y = side === "north" ? anchor.y - distance - height : anchor.y + anchor.height + distance;
  }
  return {
    x: clamp(x, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - width),
    y: clamp(y, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - height),
  };
}

function largeHubSatelliteRoomFits(room, occupiedRooms, margin) {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (!dungeonPointInsideCarveBounds(x, y)) return false;
    }
  }
  return !occupiedRooms.some((occupied) => dungeonRectRoomsOverlap(room, occupied, margin));
}

function largeHubVariantSideOrder(variant, rng) {
  if (variant === "largeHubV2PerimeterLoop") return shuffleDungeonList(["north", "east", "south", "west"], rng);
  if (variant === "largeHubV2SplitBranches") return shuffleDungeonList(["south", "west", "north", "east"], rng);
  if (variant === "largeHubV2RemoteExit") return shuffleDungeonList(["east", "north", "west", "south"], rng);
  return shuffleDungeonList(["west", "south", "east", "north"], rng);
}

function pickLargeHubBranchSource(rooms, rng) {
  const candidates = rooms
    .filter((room) => room.id !== "exit" && room.templateId !== "largeHub" && dungeonGrowthRoomCapacity(room) > 0)
    .map((room) => ({
      room,
      score: (room.degree ?? 0) * 3 + (room.id === "exit-gate" ? -1 : 0) + rng(),
    }))
    .sort((a, b) => a.score - b.score);
  return candidates[0]?.room ?? null;
}

function pickLargeHubAnyBranchSource(rooms, rng) {
  const candidates = rooms
    .filter((room) => room.id !== "exit" && dungeonGrowthRoomCapacity(room) > 0)
    .map((room) => ({
      room,
      score: (room.templateId === "largeHub" ? 5 : 0) + (room.degree ?? 0) * 2 + rng(),
    }))
    .sort((a, b) => a.score - b.score);
  return candidates[0]?.room ?? null;
}

function createLargeHubFreeBranchRoom(id, rng, topology, occupiedRooms, roomSize) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const template = createLargeHubSatelliteTemplate(rng, attempt % 3 === 0 ? "reward" : "branch", roomSize);
    const x = rngBetweenInt(rng, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - template.width);
    const y = rngBetweenInt(rng, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - template.height);
    const room = createDungeonGrowthRoomNode(id, x, y, template.width, template.height, template.id, topology.maxRoomDegree);
    if (!largeHubSatelliteRoomFits(room, occupiedRooms, attempt > 80 ? 0 : 2)) continue;
    return room;
  }
  return null;
}

function addLargeHubBranchRoom(context) {
  const {
    tiles,
    rooms,
    roomsById,
    occupiedRooms,
    hub,
    index,
    roomSize,
    topology,
    rng,
    corridors,
    corridorSamples,
    preferHub,
  } = context;
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const hubAvailable = dungeonGrowthRoomCapacity(hub) > 0;
    const useHub = hubAvailable && (preferHub || attempt > 18 || rng() < 0.28);
    const source = useHub ? hub : pickLargeHubBranchSource(rooms, rng);
    if (!source) continue;
    const side = pickLargeHubExpansionSide(source, hub, rng);
    const room = createLargeHubSatelliteRoom(`branch-${index}`, source, side, rng, topology, occupiedRooms, {
      roomSize: Math.max(5, roomSize - (attempt > 18 ? 1 : 0)),
      templateKind: index % 3 === 0 ? "reward" : "branch",
      distance: rngBetweenInt(rng, 3, attempt > 18 ? 7 : 10),
      relaxed: attempt > 18,
    });
    if (!room) continue;
    addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, room, rng);
    connectLargeHubRoomsAuto(tiles, roomsById, source.id, room.id, "branch", rng, corridors, corridorSamples);
    return { sourceId: source.id };
  }
  const fallbackSource = pickLargeHubAnyBranchSource(rooms, rng);
  const fallbackRoom = fallbackSource
    ? createLargeHubFreeBranchRoom(`branch-${index}`, rng, topology, occupiedRooms, Math.max(5, roomSize - 1))
    : null;
  if (fallbackSource && fallbackRoom) {
    addLargeHubRoom(tiles, rooms, roomsById, occupiedRooms, fallbackRoom, rng);
    connectLargeHubRoomsAuto(tiles, roomsById, fallbackSource.id, fallbackRoom.id, "branch", rng, corridors, corridorSamples);
    return { sourceId: fallbackSource.id };
  }
  return null;
}

function pickLargeHubExpansionSide(source, hub, rng) {
  const preferred = source.templateId === "largeHub"
    ? shuffleDungeonList(DUNGEON_DOOR_SIDES.filter((side) => !source.usedDoorSides?.has(side)), rng)
    : preferredDungeonDoorSides(source, hub).reverse();
  return preferred.find((side) => !source.usedDoorSides?.has(side))
    ?? DUNGEON_DOOR_SIDES.find((side) => !source.usedDoorSides?.has(side))
    ?? preferred[0]
    ?? "east";
}

function connectLargeHubRoomsAuto(tiles, roomsById, fromId, toId, kind, rng, corridors, corridorSamples) {
  const fromRoom = roomsById.get(fromId);
  const toRoom = roomsById.get(toId);
  const fromSide = pickLargeHubDoorSideToward(fromRoom, toRoom);
  const toSide = pickLargeHubDoorSideToward(toRoom, fromRoom);
  connectLargeHubRooms(tiles, roomsById, fromId, toId, kind, fromSide, toSide, rng, corridors, corridorSamples);
}

function pickLargeHubDoorSideToward(room, targetRoom) {
  const preferred = preferredDungeonDoorSides(room, targetRoom);
  return preferred.find((side) => !room.usedDoorSides?.has(side))
    ?? DUNGEON_DOOR_SIDES.find((side) => !room.usedDoorSides?.has(side))
    ?? preferred[0]
    ?? "east";
}

function addLargeHubLoopCorridor(tiles, rooms, roomsById, rng, corridors, corridorSamples) {
  const candidates = [];
  for (let a = 0; a < rooms.length; a += 1) {
    for (let b = a + 1; b < rooms.length; b += 1) {
      const fromRoom = rooms[a];
      const toRoom = rooms[b];
      if (fromRoom.templateId === "largeHub" || toRoom.templateId === "largeHub") continue;
      if (dungeonGrowthRoomCapacity(fromRoom) <= 0 || dungeonGrowthRoomCapacity(toRoom) <= 0) continue;
      if (dungeonCavernHasCorridor(corridors, fromRoom.id, toRoom.id)) continue;
      const graphDistance = dungeonRoomGraphDistance(corridors, fromRoom.id, toRoom.id);
      if (graphDistance < 3) continue;
      candidates.push({
        fromRoom,
        toRoom,
        score: graphDistance * 10 + dungeonManhattan(fromRoom.center, toRoom.center) + rng(),
      });
    }
  }
  const pair = candidates.sort((a, b) => b.score - a.score)[0];
  if (!pair) return false;
  connectLargeHubRoomsAuto(tiles, roomsById, pair.fromRoom.id, pair.toRoom.id, "loop", rng, corridors, corridorSamples);
  return true;
}

function carveDungeonLargeHubRoom(tiles, room, rng) {
  carveDungeonGrowthRoom(tiles, room, rng);
}

function connectLargeHubRooms(tiles, roomsById, fromId, toId, kind, fromSide, toSide, rng, corridors, corridorSamples) {
  const fromRoom = roomsById.get(fromId);
  const toRoom = roomsById.get(toId);
  const fromDoor = dungeonGrowthDoorPoint(fromRoom, fromSide, rng);
  const toDoor = dungeonGrowthDoorPoint(toRoom, toSide, rng);
  const bend = fromSide === "north" || fromSide === "south"
    ? { x: fromDoor.x, y: toDoor.y }
    : { x: toDoor.x, y: fromDoor.y };
  const points = dungeonNormalizePolylinePoints([fromDoor, bend, toDoor]);
  carveDungeonPolylineConnector(tiles, points, rng, corridorSamples, { [kind]: true, doorway: true });
  reserveDungeonGrowthConnection(fromRoom, toRoom, fromSide, toSide);
  corridors.push(createDungeonCorridorRecord(fromRoom, toRoom, kind, corridors.length, {
    from: fromDoor,
    to: toDoor,
    fromSide,
    toSide,
    points,
  }));
}

function createDungeonLayoutRecord(topology, tiles, rooms, corridors, corridorSamples, stairsUp, stairsDown, prunedOpenTiles) {
  const semantics = createDungeonGraphSemantics(rooms, corridors, stairsUp, stairsDown, topology);
  const taggedCorridors = corridors.map((corridor) => ({
    ...corridor,
    tacticalTag: semantics.corridorTags.get(corridor.id) ?? dungeonDefaultCorridorTacticalTag(corridor),
  }));
  const roomMetadata = createDungeonRoomMetadata(rooms, stairsUp, stairsDown, taggedCorridors, semantics.roomPurposes);
  const floorIntent = createDungeonFloorIntent(topology);
  const placementSlots = createDungeonPlacementSlots(tiles, roomMetadata, taggedCorridors, stairsUp, stairsDown);
  const qualityReport = createDungeonQualityReport(tiles, roomMetadata, taggedCorridors, corridorSamples, stairsUp, stairsDown, placementSlots);
  return {
    version: DUNGEON_LAYOUT_VERSION,
    shapeVersion: DUNGEON_SHAPE_VERSION,
    semanticVersion: DUNGEON_SEMANTIC_VERSION,
    archetypeSelectorVersion: DUNGEON_ARCHETYPE_SELECTOR_VERSION,
    kind: LAB_DATA_KINDS.dungeonLayout,
    enabled: true,
    width: topology.width ?? LOCAL_WIDTH,
    height: topology.height ?? LOCAL_HEIGHT,
    requestedTopologyId: topology.requestedTopologyId ?? topology.id,
    topologyId: topology.id,
    generationVariant: topology.generationVariant ?? topology.id,
    sizeProfileId: topology.sizeProfileId ?? "fixed54x34",
    orientation: topology.orientation ?? "landscape",
    mapSizeMode: topology.mapSizeMode ?? "legacy",
    mapSizePresetId: topology.mapSizePresetId ?? "standard",
    requestedOrientation: topology.requestedOrientation ?? "auto",
    stairDistanceProfile: topology.stairDistanceProfile ?? "far",
    threatTier: topology.threatTier ?? 1,
    archetypeSelection: cloneDungeonArchetypeSelection(topology.archetypeSelection),
    materialStyleId: DUNGEON_MATERIAL_STYLE_ID,
    roomThemeSetId: DUNGEON_ROOM_THEME_SET_ID,
    decorPackId: DUNGEON_DECOR_PACK_ID,
    lightingProfileId: DUNGEON_LIGHTING_PROFILE_ID,
    floorIntent,
    prunedOpenTiles,
    tiles,
    rooms: roomMetadata,
    corridors: taggedCorridors,
    corridorSamples,
    placementSlots,
    qualityReport,
    torches: [],
    lightSources: [],
    decorations: [],
    stairsUp,
    stairsDown,
  };
}

function dungeonTopologyProfile(topologyId) {
  const normalizedId = DUNGEON_TOPOLOGY_PROFILES[topologyId] ? topologyId : "standard";
  return DUNGEON_TOPOLOGY_PROFILES[normalizedId];
}

export function dungeonTileAt(tiles, x, y) {
  const width = dungeonTilesWidth(tiles);
  const height = dungeonTilesHeight(tiles);
  if (x < 0 || y < 0 || x >= width || y >= height) return null;
  return tiles[indexOf(width, x, y)];
}

function createDungeonTileArray() {
  const tiles = Array.from({ length: LOCAL_WIDTH * LOCAL_HEIGHT }, () => ({ type: "wall", tone: 0 }));
  Object.defineProperties(tiles, {
    width: { value: LOCAL_WIDTH },
    height: { value: LOCAL_HEIGHT },
  });
  return tiles;
}

function dungeonTilesWidth(tiles) {
  return Number.isFinite(tiles?.width) ? tiles.width : LOCAL_WIDTH;
}

function dungeonTilesHeight(tiles) {
  return Number.isFinite(tiles?.height) ? tiles.height : LOCAL_HEIGHT;
}

function createDungeonCaverns(rng, topology) {
  const start = dungeonStartTile();
  const target = topology.cavernBase + Math.floor(rng() * topology.cavernRange);
  const caverns = [
    createDungeonCavernNode("start", start.x, start.y, topology.startRadiusX, topology.startRadiusY),
  ];
  let attempts = 0;
  while (caverns.length < target && attempts < topology.placementAttempts) {
    attempts += 1;
    const radiusX = topology.radiusXBase + Math.floor(rng() * topology.radiusXRange);
    const radiusY = topology.radiusYBase + Math.floor(rng() * topology.radiusYRange);
    const cx = DUNGEON_BORDER_THICKNESS + radiusX
      + Math.floor(rng() * Math.max(1, LOCAL_WIDTH - (DUNGEON_BORDER_THICKNESS + radiusX) * 2));
    const cy = DUNGEON_BORDER_THICKNESS + radiusY
      + Math.floor(rng() * Math.max(1, LOCAL_HEIGHT - (DUNGEON_BORDER_THICKNESS + radiusY) * 2));
    const cavern = createDungeonCavernNode(`cavern-${caverns.length}`, cx, cy, radiusX, radiusY);
    if (caverns.some((other) => dungeonCavernsTooClose(cavern, other, topology.overlapMargin))) continue;
    caverns.push(cavern);
  }

  while (caverns.length < 4) {
    const index = caverns.length;
    const angle = (Math.PI * 2 * index) / 4 + rng() * 0.35;
    const cx = clamp(Math.round(start.x + Math.cos(angle) * (10 + index * 3)), 8, LOCAL_WIDTH - 9);
    const cy = clamp(Math.round(start.y + Math.sin(angle) * (6 + index * 2)), 7, LOCAL_HEIGHT - 8);
    caverns.push(createDungeonCavernNode(`cavern-${index}`, cx, cy, topology.radiusXBase, topology.radiusYBase));
  }

  return caverns
    .sort((a, b) => (a.id === "start" ? -1 : b.id === "start" ? 1 : dungeonManhattan(a.center, start) - dungeonManhattan(b.center, start)))
    .map((cavern, index) => ({
      ...cavern,
      id: index === 0 ? "start" : `cavern-${index}`,
    }));
}

function createDungeonRectRooms(rng, topology) {
  const start = dungeonStartTile();
  const rooms = [
    createDungeonRectRoomNode(
      "start",
      start.x - Math.floor(topology.startRoomWidth / 2),
      start.y - Math.floor(topology.startRoomHeight / 2),
      topology.startRoomWidth,
      topology.startRoomHeight,
    ),
  ];
  const target = topology.roomBase + Math.floor(rng() * topology.roomRange);
  let attempts = 0;

  while (rooms.length < target && attempts < topology.roomPlacementAttempts) {
    attempts += 1;
    const width = topology.roomWidthBase + Math.floor(rng() * topology.roomWidthRange);
    const height = topology.roomHeightBase + Math.floor(rng() * topology.roomHeightRange);
    const x = rngBetweenInt(rng, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - width);
    const y = rngBetweenInt(rng, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - height);
    const room = createDungeonRectRoomNode(`room-${rooms.length}`, x, y, width, height);
    if (dungeonManhattan(room.center, start) < topology.centerExclusionDistance) continue;
    if (rooms.some((other) => dungeonRectRoomsOverlap(room, other, topology.roomOverlapMargin))) continue;
    rooms.push(room);
  }

  return rooms
    .sort((a, b) => (a.id === "start" ? -1 : b.id === "start" ? 1 : dungeonManhattan(a.center, start) - dungeonManhattan(b.center, start)))
    .map((room, index) => ({
      ...room,
      id: index === 0 ? "start" : `room-${index}`,
    }));
}

function createDungeonRectRoomNode(id, x, y, width, height) {
  const safeX = clamp(x, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - width);
  const safeY = clamp(y, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - height);
  const center = {
    x: Math.floor(safeX + width / 2),
    y: Math.floor(safeY + height / 2),
  };
  return {
    id,
    cx: center.x,
    cy: center.y,
    radiusX: Math.max(1, Math.floor(width / 2)),
    radiusY: Math.max(1, Math.floor(height / 2)),
    x: safeX,
    y: safeY,
    width,
    height,
    center,
  };
}

function createDungeonGrowthRoomNode(id, x, y, width, height, templateId, maxDegree) {
  const center = {
    x: Math.floor(x + width / 2),
    y: Math.floor(y + height / 2),
  };
  return {
    id,
    cx: center.x,
    cy: center.y,
    radiusX: Math.max(1, Math.floor(width / 2)),
    radiusY: Math.max(1, Math.floor(height / 2)),
    x,
    y,
    width,
    height,
    center,
    templateId,
    maxDegree,
    degree: 0,
    usedDoorSides: new Set(),
  };
}

function dungeonGrowthStartPlan(rng) {
  const plans = LOCAL_HEIGHT > LOCAL_WIDTH
    ? [
      { start: { x: 0.18, y: 0.16 }, target: { x: 0.82, y: 0.84 } },
      { start: { x: 0.82, y: 0.16 }, target: { x: 0.18, y: 0.84 } },
      { start: { x: 0.18, y: 0.84 }, target: { x: 0.82, y: 0.16 } },
      { start: { x: 0.82, y: 0.84 }, target: { x: 0.18, y: 0.16 } },
    ]
    : [
      { start: { x: 0.14, y: 0.18 }, target: { x: 0.86, y: 0.82 } },
      { start: { x: 0.86, y: 0.18 }, target: { x: 0.14, y: 0.82 } },
      { start: { x: 0.14, y: 0.82 }, target: { x: 0.86, y: 0.18 } },
      { start: { x: 0.86, y: 0.82 }, target: { x: 0.14, y: 0.18 } },
    ];
  const plan = plans[Math.floor(rng() * plans.length)];
  return {
    start: {
      x: dungeonGrowthPlanCoordinate(plan.start.x, LOCAL_WIDTH, 8, rng, 3),
      y: dungeonGrowthPlanCoordinate(plan.start.y, LOCAL_HEIGHT, 7, rng, 2),
    },
    target: {
      x: dungeonGrowthPlanCoordinate(plan.target.x, LOCAL_WIDTH, 8, rng, 3),
      y: dungeonGrowthPlanCoordinate(plan.target.y, LOCAL_HEIGHT, 7, rng, 2),
    },
  };
}

function dungeonGrowthPlanCoordinate(ratio, size, margin, rng, jitter) {
  const safeMargin = Math.min(margin, Math.max(2, Math.floor(size / 4)));
  return clamp(
    Math.round((size - 1) * ratio) + Math.floor(rng() * (jitter * 2 + 1)) - jitter,
    safeMargin,
    size - safeMargin - 1,
  );
}

function selectDungeonGrowthJunctionIndices(mainPathTarget, topology, rng) {
  const candidates = [];
  for (let index = 2; index < mainPathTarget - 2; index += 1) candidates.push(index);
  shuffleDungeonList(candidates, rng);
  return new Set(candidates.slice(0, topology.junctionRoomCount));
}

function placeDungeonGrowthRoom(tiles, rooms, sourceRoom, roomId, templateKind, corridorKind, rng, topology, corridors, corridorSamples, options = {}) {
  if (dungeonGrowthRoomCapacity(sourceRoom) <= 0) return null;
  for (let attempt = 0; attempt < topology.roomGrowthAttempts; attempt += 1) {
    const sides = dungeonGrowthAvailableSides(sourceRoom, rng, options.target);
    for (const side of sides) {
      const template = options.forceTemplate ?? createDungeonGrowthRoomTemplate(templateKind, rng);
      const placement = createDungeonGrowthPlacement(sourceRoom, side, template, roomId, rng, topology);
      if (!placement) continue;
      if (options.relaxed ? !dungeonGrowthRoomFitsRelaxed(tiles, placement.room) : !dungeonGrowthRoomFits(tiles, placement.room)) continue;
      if (!dungeonGrowthConnectorFits(tiles, placement.points)) continue;

      carveDungeonGrowthRoom(tiles, placement.room, rng);
      carveDungeonPolylineConnector(tiles, placement.points, rng, corridorSamples, { [corridorKind]: true, doorway: true });
      reserveDungeonGrowthConnection(sourceRoom, placement.room, side, placement.toDoor.side);
      rooms.push(placement.room);
      corridors.push(createDungeonCorridorRecord(sourceRoom, placement.room, corridorKind, corridors.length, {
        from: placement.fromDoor,
        to: placement.toDoor,
        fromSide: side,
        toSide: placement.toDoor.side,
        points: placement.points,
      }));
      return placement.room;
    }
  }
  return null;
}

function createDungeonGrowthRoomTemplate(kind, rng) {
  if (kind === "junction") {
    return { id: "crossTiny", width: 5, height: 5 };
  }
  const roll = rng();
  if (roll < 0.6) {
    return {
      id: "rectSmall",
      width: 3 + Math.floor(rng() * 3),
      height: 3 + Math.floor(rng() * 2),
    };
  }
  if (roll < 0.85) {
    const vertical = rng() < 0.5;
    return {
      id: "rectLong",
      width: vertical ? 3 + Math.floor(rng() * 2) : 5 + Math.floor(rng() * 2),
      height: vertical ? 5 + Math.floor(rng() * 2) : 3 + Math.floor(rng() * 2),
    };
  }
  return {
    id: "chamfered",
    width: 4 + Math.floor(rng() * 3),
    height: 4 + Math.floor(rng() * 2),
  };
}

function createDungeonGrowthPlacement(sourceRoom, side, template, roomId, rng, topology) {
  const fromDoor = dungeonGrowthDoorPoint(sourceRoom, side, rng);
  const entrySide = oppositeDungeonDoorSide(side);
  const corridorLength = 1 + Math.floor(rng() * 3);
  const lateralShift = Math.floor(rng() * 3) - 1;
  const maxDegree = template.id === "crossTiny" ? topology.maxJunctionDegree : topology.maxRoomDegree;
  let x;
  let y;
  let toDoor;
  let bend;

  if (side === "east" || side === "west") {
    const entryOffset = dungeonGrowthDoorOffset(template.height, rng);
    const entryY = fromDoor.y + lateralShift;
    y = entryY - entryOffset;
    if (side === "east") {
      x = fromDoor.x + corridorLength + 1;
      toDoor = { x, y: entryY, side: entrySide };
      bend = { x: fromDoor.x + corridorLength, y: fromDoor.y };
    } else {
      x = fromDoor.x - corridorLength - template.width;
      toDoor = { x: x + template.width - 1, y: entryY, side: entrySide };
      bend = { x: fromDoor.x - corridorLength, y: fromDoor.y };
    }
    const room = createDungeonGrowthRoomNode(roomId, x, y, template.width, template.height, template.id, maxDegree);
    return {
      room,
      fromDoor,
      toDoor,
      points: dungeonNormalizePolylinePoints([fromDoor, bend, { x: bend.x, y: toDoor.y }, toDoor]),
    };
  }

  const entryOffset = dungeonGrowthDoorOffset(template.width, rng);
  const entryX = fromDoor.x + lateralShift;
  x = entryX - entryOffset;
  if (side === "south") {
    y = fromDoor.y + corridorLength + 1;
    toDoor = { x: entryX, y, side: entrySide };
    bend = { x: fromDoor.x, y: fromDoor.y + corridorLength };
  } else {
    y = fromDoor.y - corridorLength - template.height;
    toDoor = { x: entryX, y: y + template.height - 1, side: entrySide };
    bend = { x: fromDoor.x, y: fromDoor.y - corridorLength };
  }
  const room = createDungeonGrowthRoomNode(roomId, x, y, template.width, template.height, template.id, maxDegree);
  return {
    room,
    fromDoor,
    toDoor,
    points: dungeonNormalizePolylinePoints([fromDoor, bend, { x: toDoor.x, y: bend.y }, toDoor]),
  };
}

function dungeonGrowthDoorOffset(length, rng) {
  if (length <= 2) return 0;
  const min = 1;
  const max = length - 2;
  return clamp(Math.floor(length / 2) + Math.floor(rng() * 3) - 1, min, max);
}

function dungeonGrowthDoorPoint(room, side, rng) {
  if (room.templateId === "crossTiny") {
    const center = room.center;
    if (side === "west") return { x: room.x, y: center.y, side };
    if (side === "east") return { x: room.x + room.width - 1, y: center.y, side };
    if (side === "north") return { x: center.x, y: room.y, side };
    return { x: center.x, y: room.y + room.height - 1, side };
  }
  if (side === "west" || side === "east") {
    const offset = dungeonGrowthDoorOffset(room.height, rng);
    return {
      x: side === "west" ? room.x : room.x + room.width - 1,
      y: room.y + offset,
      side,
    };
  }
  const offset = dungeonGrowthDoorOffset(room.width, rng);
  return {
    x: room.x + offset,
    y: side === "north" ? room.y : room.y + room.height - 1,
    side,
  };
}

function dungeonGrowthAvailableSides(room, rng, target = null) {
  const sides = DUNGEON_DOOR_SIDES.filter((side) => !room.usedDoorSides?.has(side));
  if (!target) return shuffleDungeonList(sides, rng);
  return sides
    .map((side) => {
      const vector = dungeonDoorSideVector(side);
      const toTarget = {
        x: (target.x - room.center.x) / Math.max(1, LOCAL_WIDTH),
        y: (target.y - room.center.y) / Math.max(1, LOCAL_HEIGHT),
      };
      return {
        side,
        score: vector.x * toTarget.x + vector.y * toTarget.y + rng() * 0.08,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.side);
}

function dungeonGrowthRoomCapacity(room) {
  return Math.max(0, (room.maxDegree ?? 2) - (room.degree ?? 0));
}

function dungeonGrowthBranchSourceScore(room, mainPath) {
  const mainIndex = mainPath.findIndex((candidate) => candidate.id === room.id);
  const mainBias = mainIndex >= 0 ? 0 : 6;
  const endPenalty = mainIndex === 0 || mainIndex === mainPath.length - 1 ? 3 : 0;
  const junctionBonus = (room.maxDegree ?? 2) > 2 ? -2 : 0;
  return mainBias + endPenalty + junctionBonus + (room.degree ?? 0) * 0.25 + room.center.y * 0.001;
}

function dungeonGrowthRoomFits(tiles, room) {
  for (let y = room.y - 1; y <= room.y + room.height; y += 1) {
    for (let x = room.x - 1; x <= room.x + room.width; x += 1) {
      if (!dungeonPointInsideCarveBounds(x, y)) return false;
      if (dungeonTileIsOpen(tiles, x, y)) return false;
    }
  }
  return true;
}

function dungeonGrowthRoomFitsRelaxed(tiles, room) {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (!dungeonPointInsideCarveBounds(x, y)) return false;
      if (dungeonTileIsOpen(tiles, x, y)) return false;
    }
  }
  return true;
}

function dungeonGrowthConnectorFits(tiles, points) {
  const cells = dungeonPolylineCells(points);
  for (let index = 0; index < cells.length; index += 1) {
    const point = cells[index];
    if (!dungeonPointInsideCarveBounds(point.x, point.y)) return false;
    if (index > 0 && index < cells.length - 1 && dungeonTileIsOpen(tiles, point.x, point.y)) return false;
  }
  return true;
}

function reserveDungeonGrowthConnection(fromRoom, toRoom, fromSide, toSide) {
  fromRoom.degree = (fromRoom.degree ?? 0) + 1;
  toRoom.degree = (toRoom.degree ?? 0) + 1;
  fromRoom.usedDoorSides ??= new Set();
  toRoom.usedDoorSides ??= new Set();
  fromRoom.usedDoorSides.add(fromSide);
  toRoom.usedDoorSides.add(toSide);
}

function carveDungeonGrowthRoom(tiles, room, rng) {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (!dungeonGrowthRoomContainsTile(room, x, y)) continue;
      setDungeonTile(tiles, x, y, "floor", rng());
    }
  }
  setDungeonTile(tiles, room.center.x, room.center.y, "floor", rng());
}

function dungeonGrowthRoomContainsTile(room, x, y) {
  if (room.templateId === "largeHub") return dungeonLargeHubContainsTile(room, x, y);
  const left = x === room.x;
  const right = x === room.x + room.width - 1;
  const top = y === room.y;
  const bottom = y === room.y + room.height - 1;
  if (room.templateId === "chamfered" && ((left && top) || (right && top) || (left && bottom) || (right && bottom))) return false;
  if (room.templateId === "crossTiny") {
    const dx = Math.abs(x - room.center.x);
    const dy = Math.abs(y - room.center.y);
    return dx <= 1 || dy <= 1;
  }
  return true;
}

function dungeonLargeHubContainsTile(room, x, y) {
  const rx = Math.max(1, (room.width - 1) / 2);
  const ry = Math.max(1, (room.height - 1) / 2);
  const nx = (x - room.center.x) / rx;
  const ny = (y - room.center.y) / ry;
  const edgeNoise = (((x * 31 + y * 17 + room.x * 13 + room.y * 7) % 11) - 5) * 0.008;
  return nx * nx + ny * ny <= 1.03 + edgeNoise;
}

function chooseDungeonGrowthStairs(tiles, rooms, corridors, rng, topology) {
  const candidates = rooms
    .map((room) => ({ room, point: dungeonRoomStairPoint(tiles, room, rng) }))
    .filter((candidate) => candidate.point);
  const pairs = [];
  for (let a = 0; a < candidates.length; a += 1) {
    for (let b = a + 1; b < candidates.length; b += 1) {
      const first = candidates[a];
      const second = candidates[b];
      const graphDistance = dungeonRoomGraphDistance(corridors, first.room.id, second.room.id);
      if (!Number.isFinite(graphDistance)) continue;
      const tileDistance = dungeonManhattan(first.point, second.point);
      const edgeScore = dungeonDistanceFromMapCenter(first.point) + dungeonDistanceFromMapCenter(second.point);
      const distanceScore = graphDistance * 14 + tileDistance * 1.2;
      pairs.push({ first, second, graphDistance, tileDistance, edgeScore, distanceScore });
    }
  }
  const profile = pickDungeonStairDistanceProfile(rng, topology);
  const bestPair = chooseDungeonStairPairByProfile(pairs, profile, rng);
  if (!bestPair) {
    return {
      up: nearestOpenDungeonTile(tiles, rooms[0].center) ?? rooms[0].center,
      down: farthestOpenDungeonTile(tiles, rooms[0].center) ?? rooms[0].center,
      profile: "fallback",
    };
  }
  const swap = rng() < 0.5;
  return {
    up: swap ? bestPair.second.point : bestPair.first.point,
    down: swap ? bestPair.first.point : bestPair.second.point,
    profile,
  };
}

function pickDungeonStairDistanceProfile(rng, topology) {
  if (topology.id !== "narrowCorridors" || topology.sizeProfileId !== "narrowVariableV01") return "far";
  const roll = rng();
  if (roll < 0.16) return "near";
  if (roll < 0.46) return "medium";
  return "far";
}

function chooseDungeonStairPairByProfile(pairs, profileId, rng) {
  if (!pairs.length) return null;
  const profile = DUNGEON_STAIR_DISTANCE_PROFILES[profileId] ?? DUNGEON_STAIR_DISTANCE_PROFILES.far;
  const ranked = pairs
    .slice()
    .sort((a, b) => a.distanceScore - b.distanceScore)
    .map((pair, index, list) => ({
      ...pair,
      distanceRank: list.length <= 1 ? 1 : index / (list.length - 1),
    }));
  const minTileDistance = Math.floor((LOCAL_WIDTH + LOCAL_HEIGHT) * (profileId === "near" ? 0.18 : 0.24));
  const pool = ranked.filter((pair) => (
    pair.distanceRank >= profile.minRank
    && pair.distanceRank <= profile.maxRank
    && pair.graphDistance >= (profileId === "near" ? 3 : 4)
    && pair.tileDistance >= minTileDistance
  ));
  const fallback = ranked.filter((pair) => pair.graphDistance >= 3);
  const candidates = pool.length ? pool : fallback.length ? fallback : ranked;
  return candidates
    .map((pair) => ({
      pair,
      score: -Math.abs(pair.distanceRank - profile.targetRank) * 100
        + pair.edgeScore * 0.08
        + (profileId === "far" ? pair.graphDistance * 1.5 : 0)
        + rng() * 0.01,
    }))
    .sort((a, b) => b.score - a.score)[0]?.pair ?? null;
}

function dungeonRoomStairPoint(tiles, room, rng) {
  const candidates = [];
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (!dungeonGrowthRoomContainsTile(room, x, y)) continue;
      if (!dungeonTileIsOpen(tiles, x, y)) continue;
      candidates.push({
        x,
        y,
        score: dungeonManhattan({ x, y }, room.center) + rng() * 0.01,
      });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  const point = candidates[0];
  return point ? { x: point.x, y: point.y } : null;
}

function dungeonDistanceFromMapCenter(point) {
  return Math.abs(point.x - Math.floor(LOCAL_WIDTH / 2)) + Math.abs(point.y - Math.floor(LOCAL_HEIGHT / 2));
}

function scoreDungeonGrowthLayout(layout, topology) {
  const measure = measureDungeonGrowthLayout(layout);
  const bounds = measure.bounds;
  const stairsPathLength = measure.stairsPathLength;
  const minStairsPathLength = dungeonMinimumStairsPathLength(topology, layout.stairDistanceProfile);
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
  const centerPenalty = Math.abs(center.x - (LOCAL_WIDTH - 1) / 2) + Math.abs(center.y - (LOCAL_HEIGHT - 1) / 2);
  const coverageBonus = Math.min(bounds.width / topology.minBoundsWidth, 1.35)
    + Math.min(bounds.height / topology.minBoundsHeight, 1.35)
    + Math.min(measure.boundsAreaRatio / topology.minBoundsAreaRatio, 1.35);
  const thresholdPenalty = Math.max(0, topology.minBoundsWidth - bounds.width) * 7
    + Math.max(0, topology.minBoundsHeight - bounds.height) * 8
    + Math.max(0, minStairsPathLength - stairsPathLength) * 4
    + Math.max(0, topology.minBoundsAreaRatio - measure.boundsAreaRatio) * 160;
  return coverageBonus * 120
    + stairsPathLength * 2
    + layout.rooms.length * 3
    + layout.corridors.filter((corridor) => corridor.kind === "loop").length * 18
    - centerPenalty * 3
    - thresholdPenalty;
}

function dungeonGrowthLayoutMeetsSpread(layout, topology) {
  const measure = measureDungeonGrowthLayout(layout);
  const minStairsPathLength = dungeonMinimumStairsPathLength(topology, layout.stairDistanceProfile);
  return layout.rooms.length >= topology.minRoomCount
    && measure.bounds.width >= topology.minBoundsWidth
    && measure.bounds.height >= topology.minBoundsHeight
    && measure.boundsAreaRatio >= topology.minBoundsAreaRatio
    && measure.stairsPathLength >= minStairsPathLength;
}

function dungeonMinimumStairsPathLength(topology, stairDistanceProfile = "far") {
  if (topology.id !== "narrowCorridors" || topology.sizeProfileId !== "narrowVariableV01") return topology.minStairsPathLength;
  const mapPerimeterScale = LOCAL_WIDTH + LOCAL_HEIGHT;
  if (stairDistanceProfile === "near") return Math.max(18, Math.floor(mapPerimeterScale * 0.18));
  if (stairDistanceProfile === "medium") return Math.max(24, Math.floor(mapPerimeterScale * 0.25));
  return Math.max(24, Math.floor(mapPerimeterScale * 0.25));
}

function measureDungeonGrowthLayout(layout) {
  const bounds = dungeonOpenTileBounds(layout.tiles);
  return {
    bounds,
    boundsAreaRatio: (bounds.width * bounds.height) / (LOCAL_WIDTH * LOCAL_HEIGHT),
    stairsPathLength: dungeonOpenPathDistance(layout.tiles, layout.stairsUp, layout.stairsDown),
  };
}

function dungeonOpenTileBounds(tiles) {
  let minX = LOCAL_WIDTH;
  let minY = LOCAL_HEIGHT;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  for (let y = 0; y < LOCAL_HEIGHT; y += 1) {
    for (let x = 0; x < LOCAL_WIDTH; x += 1) {
      if (!dungeonTileIsOpen(tiles, x, y)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }
  if (count === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, count: 0 };
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    count,
  };
}

function addDungeonGrowthLoops(tiles, rooms, rng, topology, corridors, corridorSamples, loopTarget) {
  let added = 0;
  let attempts = 0;
  while (added < loopTarget && attempts < loopTarget * 80) {
    attempts += 1;
    const candidate = findDungeonGrowthLoopCandidate(tiles, rooms, rng, topology, corridors);
    if (!candidate) break;
    carveDungeonPolylineConnector(tiles, candidate.points, rng, corridorSamples, { loop: true, doorway: true });
    reserveDungeonGrowthConnection(candidate.fromRoom, candidate.toRoom, candidate.fromDoor.side, candidate.toDoor.side);
    corridors.push(createDungeonCorridorRecord(candidate.fromRoom, candidate.toRoom, "loop", corridors.length, {
      from: candidate.fromDoor,
      to: candidate.toDoor,
      fromSide: candidate.fromDoor.side,
      toSide: candidate.toDoor.side,
      points: candidate.points,
    }));
    added += 1;
  }
  return added;
}

function findDungeonGrowthLoopCandidate(tiles, rooms, rng, topology, corridors) {
  const candidates = [];
  for (let a = 0; a < rooms.length; a += 1) {
    const fromRoom = rooms[a];
    if (dungeonGrowthRoomCapacity(fromRoom) <= 0) continue;
    for (let b = a + 1; b < rooms.length; b += 1) {
      const toRoom = rooms[b];
      if (dungeonGrowthRoomCapacity(toRoom) <= 0) continue;
      if (dungeonCavernHasCorridor(corridors, fromRoom.id, toRoom.id)) continue;
      if (dungeonRoomGraphDistance(corridors, fromRoom.id, toRoom.id) < 4) continue;
      const sidePairs = dungeonGrowthLoopSidePairs(fromRoom, toRoom);
      for (const [fromSide, toSide] of sidePairs) {
        if (fromRoom.usedDoorSides?.has(fromSide) || toRoom.usedDoorSides?.has(toSide)) continue;
        const fromDoor = dungeonGrowthDoorPointToward(fromRoom, fromSide, toRoom.center);
        const toDoor = dungeonGrowthDoorPointToward(toRoom, toSide, fromRoom.center);
        if (!dungeonTileIsOpen(tiles, fromDoor.x, fromDoor.y) || !dungeonTileIsOpen(tiles, toDoor.x, toDoor.y)) continue;
        const points = dungeonGrowthLoopPolyline(fromDoor, toDoor);
        if (!dungeonGrowthConnectorFits(tiles, points)) continue;
        const pathDistance = dungeonOpenPathDistance(tiles, fromDoor, toDoor);
        if (pathDistance < topology.loopMinPathDistance) continue;
        candidates.push({
          fromRoom,
          toRoom,
          fromDoor,
          toDoor,
          points,
          score: pathDistance - dungeonPolylineCells(points).length + rng() * 0.01,
        });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? null;
}

function dungeonGrowthLoopSidePairs(fromRoom, toRoom) {
  const fromSides = preferredDungeonDoorSides(fromRoom, toRoom);
  const toSides = preferredDungeonDoorSides(toRoom, fromRoom);
  const pairs = [];
  for (const fromSide of fromSides) {
    for (const toSide of toSides) {
      if (fromSide === toSide) continue;
      pairs.push([fromSide, toSide]);
    }
  }
  return pairs;
}

function dungeonGrowthDoorPointToward(room, side, target) {
  if (room.templateId === "crossTiny") return dungeonGrowthDoorPoint(room, side, () => 0.5);
  if (side === "west" || side === "east") {
    const minY = room.y + (room.height > 2 ? 1 : 0);
    const maxY = room.y + room.height - 1 - (room.height > 2 ? 1 : 0);
    return {
      x: side === "west" ? room.x : room.x + room.width - 1,
      y: clamp(target.y, minY, maxY),
      side,
    };
  }
  const minX = room.x + (room.width > 2 ? 1 : 0);
  const maxX = room.x + room.width - 1 - (room.width > 2 ? 1 : 0);
  return {
    x: clamp(target.x, minX, maxX),
    y: side === "north" ? room.y : room.y + room.height - 1,
    side,
  };
}

function dungeonGrowthLoopPolyline(fromDoor, toDoor) {
  const fromDir = dungeonDoorSideVector(fromDoor.side);
  const toDir = dungeonDoorSideVector(toDoor.side);
  const fromOut = { x: fromDoor.x + fromDir.x * 2, y: fromDoor.y + fromDir.y * 2 };
  const toOut = { x: toDoor.x + toDir.x * 2, y: toDoor.y + toDir.y * 2 };
  const horizontalFirst = fromDoor.side === "east" || fromDoor.side === "west";
  return horizontalFirst
    ? dungeonNormalizePolylinePoints([fromDoor, fromOut, { x: toOut.x, y: fromOut.y }, toOut, toDoor])
    : dungeonNormalizePolylinePoints([fromDoor, fromOut, { x: fromOut.x, y: toOut.y }, toOut, toDoor]);
}

function dungeonDoorSideVector(side) {
  if (side === "north") return { x: 0, y: -1 };
  if (side === "south") return { x: 0, y: 1 };
  if (side === "west") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function dungeonRoomGraphDistance(corridors, fromRoomId, toRoomId) {
  const queue = [{ id: fromRoomId, distance: 0 }];
  const visited = new Set([fromRoomId]);
  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];
    if (item.id === toRoomId) return item.distance;
    for (const corridor of corridors) {
      const next = corridor.fromRoomId === item.id
        ? corridor.toRoomId
        : corridor.toRoomId === item.id
          ? corridor.fromRoomId
          : null;
      if (!next || visited.has(next)) continue;
      visited.add(next);
      queue.push({ id: next, distance: item.distance + 1 });
    }
  }
  return Infinity;
}

function dungeonOpenPathDistance(tiles, from, to) {
  const targetKey = dungeonPointKey(to);
  const queue = [{ x: from.x, y: from.y, distance: 0 }];
  const visited = new Set([dungeonPointKey(from)]);
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    if (dungeonPointKey(point) === targetKey) return point.distance;
    for (const next of dungeonCardinalNeighbors(point)) {
      const key = dungeonPointKey(next);
      if (visited.has(key) || !dungeonTileIsOpen(tiles, next.x, next.y)) continue;
      visited.add(key);
      queue.push({ ...next, distance: point.distance + 1 });
    }
  }
  return Infinity;
}

function shuffleDungeonList(items, rng) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function dungeonRectRoomsOverlap(a, b, margin = 1) {
  return a.x <= b.x + b.width + margin
    && a.x + a.width + margin >= b.x
    && a.y <= b.y + b.height + margin
    && a.y + a.height + margin >= b.y;
}

function createDungeonCavernNode(id, cx, cy, radiusX, radiusY) {
  const x = clamp(Math.floor(cx - radiusX - 1), DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - 3);
  const y = clamp(Math.floor(cy - radiusY - 1), DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - 3);
  const maxX = clamp(Math.ceil(cx + radiusX + 1), x + 2, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - 1);
  const maxY = clamp(Math.ceil(cy + radiusY + 1), y + 2, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - 1);
  return {
    id,
    cx,
    cy,
    radiusX,
    radiusY,
    x,
    y,
    width: maxX - x + 1,
    height: maxY - y + 1,
    center: { x: cx, y: cy },
  };
}

function dungeonCavernsTooClose(a, b, margin) {
  const dx = Math.abs(a.cx - b.cx);
  const dy = Math.abs(a.cy - b.cy);
  return dx < (a.radiusX + b.radiusX + margin) * 0.74
    && dy < (a.radiusY + b.radiusY + margin) * 0.74;
}

function carveDungeonRectRoom(tiles, room, rng, topology) {
  const cutCorners = room.width >= 5 && room.height >= 4 && rng() < topology.roomCornerCutChance;
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      const left = x === room.x;
      const right = x === room.x + room.width - 1;
      const top = y === room.y;
      const bottom = y === room.y + room.height - 1;
      if (cutCorners && ((left && top) || (right && top) || (left && bottom) || (right && bottom)) && rng() < 0.72) continue;
      setDungeonTile(tiles, x, y, "floor", rng());
    }
  }
  setDungeonTile(tiles, room.center.x, room.center.y, "floor", rng());
}

function connectDungeonRectRooms(tiles, rooms, rng, topology, corridors, corridorSamples) {
  if (topology.doorwayRouting) {
    connectDungeonRectRoomsWithDoorways(tiles, rooms, rng, topology, corridors, corridorSamples);
    return;
  }
  connectDungeonRectRoomsCenterline(tiles, rooms, rng, topology, corridors, corridorSamples);
}

function connectDungeonRectRoomsCenterline(tiles, rooms, rng, topology, corridors, corridorSamples) {
  const mainPathLimit = Math.max(2, rooms.length - 2);
  const mainPathCount = clamp(
    Math.round(rooms.length * (topology.mainPathRatio ?? 0.68)),
    Math.min(5, mainPathLimit),
    mainPathLimit,
  );
  const mainPath = rooms.slice(0, mainPathCount);

  for (let i = 1; i < mainPath.length; i += 1) {
    const from = mainPath[i - 1];
    const to = mainPath[i];
    carveDungeonRectConnector(tiles, from.center, to.center, rng, corridorSamples, { spine: true });
    corridors.push(createDungeonCorridorRecord(from, to, "critical", corridors.length));
  }

  for (let i = mainPathCount; i < rooms.length; i += 1) {
    const branch = rooms[i];
    const parent = nearestDungeonCavern(mainPath, branch);
    carveDungeonRectConnector(tiles, parent.center, branch.center, rng, corridorSamples, { branch: true });
    corridors.push(createDungeonCorridorRecord(parent, branch, "branch", corridors.length));
  }

  const extraLinks = topology.extraLinkBase + Math.floor(rng() * topology.extraLinkRange);
  for (let i = 0; i < extraLinks; i += 1) {
    const from = mainPath[Math.floor(rng() * mainPath.length)];
    const to = rooms[Math.floor(rng() * rooms.length)];
    if (from.id === to.id || dungeonCavernHasCorridor(corridors, from.id, to.id)) continue;
    carveDungeonRectConnector(tiles, from.center, to.center, rng, corridorSamples, { loop: true });
    corridors.push(createDungeonCorridorRecord(from, to, "loop", corridors.length));
  }
}

function connectDungeonRectRoomsWithDoorways(tiles, rooms, rng, topology, corridors, corridorSamples) {
  const mainPathLimit = Math.max(2, rooms.length - 3);
  const mainPathCount = clamp(
    Math.round(rooms.length * (topology.mainPathRatio ?? 0.68)),
    Math.min(5, mainPathLimit),
    mainPathLimit,
  );
  const mainPath = rooms.slice(0, mainPathCount);
  const degreeByRoomId = new Map(rooms.map((room) => [room.id, 0]));
  const doorSidesByRoomId = new Map(rooms.map((room) => [room.id, new Set()]));
  const junctionRoomIds = selectDungeonJunctionRoomIds(mainPath, topology);

  const roomCapacity = (room) => dungeonRoomDegreeLimit(room, topology, junctionRoomIds) - (degreeByRoomId.get(room.id) ?? 0);
  const connectRooms = (from, to, kind) => {
    const fromDoor = pickDungeonRoomDoorway(from, to, doorSidesByRoomId, rng);
    const toDoor = pickDungeonRoomDoorway(to, from, doorSidesByRoomId, rng);
    carveDungeonDoorwayConnector(tiles, fromDoor, toDoor, rng, corridorSamples, { [kind]: true });
    degreeByRoomId.set(from.id, (degreeByRoomId.get(from.id) ?? 0) + 1);
    degreeByRoomId.set(to.id, (degreeByRoomId.get(to.id) ?? 0) + 1);
    corridors.push(createDungeonCorridorRecord(from, to, kind, corridors.length, {
      from: fromDoor,
      to: toDoor,
      fromSide: fromDoor.side,
      toSide: toDoor.side,
    }));
  };

  for (let i = 1; i < mainPath.length; i += 1) {
    connectRooms(mainPath[i - 1], mainPath[i], "critical");
  }

  for (let i = mainPathCount; i < rooms.length; i += 1) {
    const branch = rooms[i];
    const parents = mainPath
      .filter((room) => room.id !== branch.id && roomCapacity(room) > 0)
      .sort((a, b) => dungeonManhattan(a.center, branch.center) - dungeonManhattan(b.center, branch.center));
    const parent = parents[0] ?? nearestDungeonCavern(mainPath, branch);
    connectRooms(parent, branch, "branch");
  }

  const extraLinks = topology.extraLinkBase + Math.floor(rng() * topology.extraLinkRange);
  for (let i = 0; i < extraLinks; i += 1) {
    const candidates = rooms.filter((room) => roomCapacity(room) > 0);
    if (candidates.length < 2) break;
    const from = candidates[Math.floor(rng() * candidates.length)];
    const targets = candidates
      .filter((room) => room.id !== from.id && !dungeonCavernHasCorridor(corridors, from.id, room.id))
      .sort((a, b) => dungeonManhattan(a.center, from.center) - dungeonManhattan(b.center, from.center));
    const to = targets[Math.floor(rng() * Math.min(4, targets.length))];
    if (!to) continue;
    connectRooms(from, to, "loop");
  }
}

function selectDungeonJunctionRoomIds(mainPath, topology) {
  const count = topology.junctionRoomCount ?? 0;
  if (count <= 0 || mainPath.length <= 2) return new Set();
  return new Set(
    mainPath
      .slice(1, -1)
      .sort((a, b) => (b.width * b.height) - (a.width * a.height))
      .slice(0, count)
      .map((room) => room.id),
  );
}

function dungeonRoomDegreeLimit(room, topology, junctionRoomIds) {
  return junctionRoomIds.has(room.id)
    ? topology.maxJunctionDegree ?? 3
    : topology.maxRoomDegree ?? 2;
}

function pickDungeonRoomDoorway(room, targetRoom, doorSidesByRoomId, rng) {
  const usedSides = doorSidesByRoomId.get(room.id) ?? new Set();
  const preferred = preferredDungeonDoorSides(room, targetRoom);
  const side = preferred.find((candidate) => !usedSides.has(candidate))
    ?? DUNGEON_DOOR_SIDES.find((candidate) => !usedSides.has(candidate))
    ?? preferred[0]
    ?? "east";
  usedSides.add(side);
  doorSidesByRoomId.set(room.id, usedSides);
  return dungeonDoorPoint(room, targetRoom.center, side, rng);
}

function preferredDungeonDoorSides(room, targetRoom) {
  const dx = targetRoom.center.x - room.center.x;
  const dy = targetRoom.center.y - room.center.y;
  const horizontal = dx >= 0 ? "east" : "west";
  const vertical = dy >= 0 ? "south" : "north";
  return Math.abs(dx) >= Math.abs(dy)
    ? [horizontal, vertical, oppositeDungeonDoorSide(vertical), oppositeDungeonDoorSide(horizontal)]
    : [vertical, horizontal, oppositeDungeonDoorSide(horizontal), oppositeDungeonDoorSide(vertical)];
}

function dungeonDoorPoint(room, target, side, rng) {
  const jitter = rng() < 0.5 ? 0 : (rng() < 0.5 ? -1 : 1);
  if (side === "west" || side === "east") {
    const minY = room.y + (room.height > 2 ? 1 : 0);
    const maxY = room.y + room.height - 1 - (room.height > 2 ? 1 : 0);
    return {
      x: side === "west" ? room.x : room.x + room.width - 1,
      y: clamp(target.y + jitter, minY, maxY),
      side,
    };
  }
  const minX = room.x + (room.width > 2 ? 1 : 0);
  const maxX = room.x + room.width - 1 - (room.width > 2 ? 1 : 0);
  return {
    x: clamp(target.x + jitter, minX, maxX),
    y: side === "north" ? room.y : room.y + room.height - 1,
    side,
  };
}

function oppositeDungeonDoorSide(side) {
  if (side === "north") return "south";
  if (side === "south") return "north";
  if (side === "west") return "east";
  return "west";
}

function carveDungeonDoorwayConnector(tiles, from, to, rng, samples, flags = {}) {
  const horizontalFirst = from.side === "east" || from.side === "west"
    ? true
    : from.side === "north" || from.side === "south"
      ? false
      : rng() < 0.5;
  carveDungeonRectConnector(tiles, from, to, rng, samples, { ...flags, doorway: true, horizontalFirst });
}

function carveDungeonRectConnector(tiles, from, to, rng, samples, flags = {}) {
  const horizontalFirst = typeof flags.horizontalFirst === "boolean" ? flags.horizontalFirst : rng() < 0.5;
  if (horizontalFirst) {
    carveDungeonHorizontalTunnel(tiles, from.x, to.x, from.y, rng, samples, flags);
    carveDungeonVerticalTunnel(tiles, from.y, to.y, to.x, rng, samples, flags);
  } else {
    carveDungeonVerticalTunnel(tiles, from.y, to.y, from.x, rng, samples, flags);
    carveDungeonHorizontalTunnel(tiles, from.x, to.x, to.y, rng, samples, flags);
  }
}

function carveDungeonPolylineConnector(tiles, points, rng, samples, flags = {}) {
  for (const point of dungeonPolylineCells(points)) {
    setDungeonTile(tiles, point.x, point.y, "floor", rng());
    if (samples) samples.push({ x: point.x, y: point.y, ...flags });
  }
}

function dungeonNormalizePolylinePoints(points) {
  const normalized = [];
  for (const point of points) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    const next = { x: Math.round(point.x), y: Math.round(point.y), ...(point.side ? { side: point.side } : {}) };
    const previous = normalized[normalized.length - 1];
    if (previous && previous.x === next.x && previous.y === next.y) continue;
    normalized.push(next);
  }
  return normalized;
}

function dungeonPolylineCells(points) {
  const cells = [];
  const seen = new Set();
  const addCell = (x, y) => {
    const key = `${x},${y}`;
    if (seen.has(key)) return;
    seen.add(key);
    cells.push({ x, y });
  };
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    if (from.x === to.x) {
      for (let y = Math.min(from.y, to.y); y <= Math.max(from.y, to.y); y += 1) addCell(from.x, y);
    } else if (from.y === to.y) {
      for (let x = Math.min(from.x, to.x); x <= Math.max(from.x, to.x); x += 1) addCell(x, from.y);
    } else {
      const corner = { x: to.x, y: from.y };
      for (const point of dungeonPolylineCells([from, corner, to])) addCell(point.x, point.y);
    }
  }
  if (points.length === 1) addCell(points[0].x, points[0].y);
  return cells;
}

function carveDungeonHorizontalTunnel(tiles, fromX, toX, y, rng, samples, flags = {}) {
  for (let x = Math.min(fromX, toX); x <= Math.max(fromX, toX); x += 1) {
    setDungeonTile(tiles, x, y, "floor", rng());
    if (samples) samples.push({ x, y, ...flags });
  }
}

function carveDungeonVerticalTunnel(tiles, fromY, toY, x, rng, samples, flags = {}) {
  for (let y = Math.min(fromY, toY); y <= Math.max(fromY, toY); y += 1) {
    setDungeonTile(tiles, x, y, "floor", rng());
    if (samples) samples.push({ x, y, ...flags });
  }
}

function addDungeonRoomPillars(tiles, rooms, rng, topology, corridorSamples) {
  const corridorKeys = new Set(corridorSamples.map((point) => dungeonPointKey(point)));
  for (const room of rooms) {
    if (room.width < 7 || room.height < 5 || rng() >= topology.roomPillarChance) continue;
    const x = rngBetweenInt(rng, room.x + 1, room.x + room.width - 3);
    const y = rngBetweenInt(rng, room.y + 1, room.y + room.height - 3);
    if (dungeonManhattan({ x: x + 1, y: y + 1 }, room.center) <= 2) continue;
    if (dungeonRectTouchesSample(corridorKeys, x - 1, y - 1, 4, 4)) continue;
    for (let oy = 0; oy < 2; oy += 1) {
      for (let ox = 0; ox < 2; ox += 1) {
        setDungeonTileRaw(tiles, x + ox, y + oy, "wall", 0);
      }
    }
  }
}

function dungeonRectTouchesSample(sampleKeys, x, y, width, height) {
  for (let ty = y; ty < y + height; ty += 1) {
    for (let tx = x; tx < x + width; tx += 1) {
      if (sampleKeys.has(`${tx},${ty}`)) return true;
    }
  }
  return false;
}

function carveDungeonCavern(tiles, cavern, rng, topology) {
  for (let y = cavern.y; y < cavern.y + cavern.height; y += 1) {
    for (let x = cavern.x; x < cavern.x + cavern.width; x += 1) {
      const dx = (x - cavern.cx) / Math.max(1, cavern.radiusX);
      const dy = (y - cavern.cy) / Math.max(1, cavern.radiusY);
      const distance = dx * dx + dy * dy;
      const edgeNoise = (rng() - 0.5) * topology.cavernEdgeNoise;
      if (distance <= 1 + edgeNoise) setDungeonTile(tiles, x, y, "floor", rng());
    }
  }

  carveDungeonDisc(tiles, cavern.cx, cavern.cy, Math.max(1, Math.min(cavern.radiusX, cavern.radiusY) - 1), rng);

  const pockets = 1 + Math.floor(rng() * 4);
  for (let i = 0; i < pockets; i += 1) {
    if (rng() >= topology.cavernPocketChance) continue;
    const angle = rng() * Math.PI * 2;
    const px = Math.round(cavern.cx + Math.cos(angle) * (cavern.radiusX + 0.6));
    const py = Math.round(cavern.cy + Math.sin(angle) * (cavern.radiusY + 0.4));
    carveDungeonDisc(tiles, px, py, rng() < 0.7 ? 1 : 2, rng);
  }
}

function connectDungeonCaverns(tiles, caverns, rng, topology, corridors, corridorSamples) {
  if (topology.connectionStrategy === "spineBranches") {
    connectDungeonCavernsWithSpineBranches(tiles, caverns, rng, topology, corridors, corridorSamples);
    return;
  }

  for (let i = 1; i < caverns.length; i += 1) {
    const from = nearestPreviousDungeonCavern(caverns, i);
    const to = caverns[i];
    carveDungeonConnector(tiles, from.center, to.center, rng, topology, corridorSamples);
    corridors.push(createDungeonCorridorRecord(from, to, "critical", corridors.length));
  }

  const extraLinks = topology.extraLinkBase + Math.floor(rng() * topology.extraLinkRange);
  for (let i = 0; i < extraLinks; i += 1) {
    const from = caverns[Math.floor(rng() * caverns.length)];
    const to = caverns[Math.floor(rng() * caverns.length)];
    if (from.id === to.id) continue;
    carveDungeonConnector(tiles, from.center, to.center, rng, topology, corridorSamples, { loop: true });
    corridors.push(createDungeonCorridorRecord(from, to, "loop", corridors.length));
  }
}

function connectDungeonCavernsWithSpineBranches(tiles, caverns, rng, topology, corridors, corridorSamples) {
  const mainPathCount = clamp(Math.round(caverns.length * (topology.mainPathRatio ?? 0.65)), 5, caverns.length);
  const mainPath = caverns.slice(0, mainPathCount);
  for (let i = 1; i < mainPath.length; i += 1) {
    const from = mainPath[i - 1];
    const to = mainPath[i];
    carveDungeonConnector(tiles, from.center, to.center, rng, topology, corridorSamples, { spine: true });
    corridors.push(createDungeonCorridorRecord(from, to, "critical", corridors.length));
  }

  for (let i = mainPathCount; i < caverns.length; i += 1) {
    const branch = caverns[i];
    const parent = nearestDungeonCavern(mainPath, branch);
    carveDungeonConnector(tiles, parent.center, branch.center, rng, topology, corridorSamples, { branch: true });
    corridors.push(createDungeonCorridorRecord(parent, branch, "branch", corridors.length));
  }

  const extraLinks = topology.extraLinkBase + Math.floor(rng() * topology.extraLinkRange);
  for (let i = 0; i < extraLinks; i += 1) {
    const from = mainPath[Math.floor(rng() * mainPath.length)];
    const to = caverns[Math.floor(rng() * caverns.length)];
    if (from.id === to.id) continue;
    if (dungeonCavernHasCorridor(corridors, from.id, to.id)) continue;
    carveDungeonConnector(tiles, from.center, to.center, rng, topology, corridorSamples, { loop: true });
    corridors.push(createDungeonCorridorRecord(from, to, "loop", corridors.length));
  }
}

function nearestPreviousDungeonCavern(caverns, index) {
  const target = caverns[index];
  let best = caverns[0];
  let bestDistance = Infinity;
  for (let i = 0; i < index; i += 1) {
    const candidate = caverns[i];
    const distance = dungeonManhattan(candidate.center, target.center);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function nearestDungeonCavern(caverns, target) {
  let best = caverns[0];
  let bestDistance = Infinity;
  for (const candidate of caverns) {
    const distance = dungeonManhattan(candidate.center, target.center);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function dungeonCavernHasCorridor(corridors, a, b) {
  return corridors.some((corridor) => (
    (corridor.fromRoomId === a && corridor.toRoomId === b)
    || (corridor.fromRoomId === b && corridor.toRoomId === a)
  ));
}

function carveDungeonConnector(tiles, from, to, rng, topology, samples, flags = {}) {
  let x = from.x;
  let y = from.y;
  const maxSteps = LOCAL_WIDTH + LOCAL_HEIGHT + dungeonManhattan(from, to) * 3;
  for (let step = 0; step < maxSteps && (x !== to.x || y !== to.y); step += 1) {
    const dx = to.x - x;
    const dy = to.y - y;
    const horizontalFirst = Math.abs(dx) > Math.abs(dy)
      ? rng() < 0.72
      : rng() < 0.28;
    if ((horizontalFirst && dx !== 0) || dy === 0) x += Math.sign(dx);
    else y += Math.sign(dy);

    x = clamp(x, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - 1);
    y = clamp(y, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - 1);
    const radius = topology.connectorRadiusBase + (rng() < topology.connectorExtraRadiusChance ? 1 : 0);
    carveDungeonDisc(tiles, x, y, radius, rng, samples, flags);

    if (rng() < topology.connectorWobbleChance) {
      if (horizontalFirst && dy !== 0) y += Math.sign(dy);
      else if (!horizontalFirst && dx !== 0) x += Math.sign(dx);
      x = clamp(x, DUNGEON_BORDER_THICKNESS, LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS - 1);
      y = clamp(y, DUNGEON_BORDER_THICKNESS, LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS - 1);
      carveDungeonDisc(tiles, x, y, radius, rng, samples, flags);
    }
    if (rng() < topology.connectorSidePocketChance) {
      carveDungeonDisc(tiles, x + (rng() < 0.5 ? -1 : 1), y + (rng() < 0.5 ? -1 : 1), 1, rng, samples, { ...flags, pocket: true });
    }
  }
}

function carveDungeonDisc(tiles, cx, cy, radius, rng, samples = null, flags = {}) {
  for (let oy = -radius; oy <= radius; oy += 1) {
    for (let ox = -radius; ox <= radius; ox += 1) {
      if (ox * ox + oy * oy > (radius + 0.28) * (radius + 0.28)) continue;
      const x = cx + ox;
      const y = cy + oy;
      setDungeonTile(tiles, x, y, "floor", rng());
      if (samples) samples.push({ x, y, ...flags });
    }
  }
}

function repairDungeonThinWalls(tiles, rng) {
  let repaired = 0;
  for (let pass = 0; pass < MAX_THIN_WALL_REPAIR_PASSES; pass += 1) {
    const openings = collectDungeonThinWallOpenings(tiles);
    if (openings.length === 0) break;
    repaired += openings.length;
    for (const point of openings) setDungeonTile(tiles, point.x, point.y, "floor", rng());
    enforceDungeonBorderWalls(tiles);
  }
  return repaired;
}

function collectDungeonThinWallOpenings(tiles) {
  const openings = [];
  const seen = new Set();
  const addOpening = (x, y) => {
    const key = `${x},${y}`;
    if (seen.has(key)) return;
    seen.add(key);
    openings.push({ x, y });
  };

  for (let y = DUNGEON_BORDER_THICKNESS; y < LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS; y += 1) {
    for (let x = DUNGEON_BORDER_THICKNESS; x < LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS; x += 1) {
      const tile = dungeonTileAt(tiles, x, y);
      if (!tile || tile.type !== "wall") continue;
      const north = dungeonTileIsOpen(tiles, x, y - 1);
      const south = dungeonTileIsOpen(tiles, x, y + 1);
      const west = dungeonTileIsOpen(tiles, x - 1, y);
      const east = dungeonTileIsOpen(tiles, x + 1, y);
      const openNeighborCount = Number(north) + Number(south) + Number(west) + Number(east);
      const unsupportedNorthFace = south && !dungeonWallHasTopSupport(tiles, x, y);
      if ((north && south) || (west && east) || openNeighborCount >= 3 || unsupportedNorthFace) addOpening(x, y);
    }
  }
  return openings;
}

function dungeonWallHasTopSupport(tiles, x, y) {
  return dungeonWallTile(tiles, x, y - 1)
    || (dungeonWallTile(tiles, x - 1, y) && dungeonWallTile(tiles, x + 1, y));
}

function enforceDungeonBorderWalls(tiles) {
  for (let y = 0; y < LOCAL_HEIGHT; y += 1) {
    for (let x = 0; x < LOCAL_WIDTH; x += 1) {
      if (x >= DUNGEON_BORDER_THICKNESS
        && y >= DUNGEON_BORDER_THICKNESS
        && x < LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS
        && y < LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS) continue;
      setDungeonTileRaw(tiles, x, y, "wall", 0);
    }
  }
}

function pruneDisconnectedDungeonFloors(tiles, start) {
  const connected = connectedDungeonOpenTileSet(tiles, start);
  let pruned = 0;
  for (let y = DUNGEON_BORDER_THICKNESS; y < LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS; y += 1) {
    for (let x = DUNGEON_BORDER_THICKNESS; x < LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS; x += 1) {
      const tile = dungeonTileAt(tiles, x, y);
      if (!tile || tile.type !== "floor") continue;
      if (connected.has(`${x},${y}`)) continue;
      setDungeonTileRaw(tiles, x, y, "wall", 0);
      pruned += 1;
    }
  }
  return pruned;
}

function connectedDungeonOpenTileSet(tiles, start) {
  const queue = [start];
  const visited = new Set([dungeonPointKey(start)]);
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    for (const next of dungeonCardinalNeighbors(point)) {
      const key = dungeonPointKey(next);
      if (visited.has(key)) continue;
      const tile = dungeonTileAt(tiles, next.x, next.y);
      if (!tile || tile.type === "wall" || tile.type === "rubble") continue;
      visited.add(key);
      queue.push(next);
    }
  }
  return visited;
}

function nearestOpenDungeonTile(tiles, target, predicate = () => true) {
  for (let radius = 0; radius < Math.max(LOCAL_WIDTH, LOCAL_HEIGHT); radius += 1) {
    let best = null;
    for (let y = target.y - radius; y <= target.y + radius; y += 1) {
      for (let x = target.x - radius; x <= target.x + radius; x += 1) {
        if (Math.abs(target.x - x) + Math.abs(target.y - y) > radius) continue;
        if (!dungeonPointInsideCarveBounds(x, y)) continue;
        const point = { x, y };
        if (!predicate(point)) continue;
        const tile = dungeonTileAt(tiles, x, y);
        if (!tile || tile.type !== "floor") continue;
        if (!best || y < best.y || (y === best.y && x < best.x)) best = point;
      }
    }
    if (best) return best;
  }
  return null;
}

function farthestOpenDungeonTile(tiles, start) {
  let best = null;
  for (let y = DUNGEON_BORDER_THICKNESS; y < LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS; y += 1) {
    for (let x = DUNGEON_BORDER_THICKNESS; x < LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS; x += 1) {
      const tile = dungeonTileAt(tiles, x, y);
      if (!tile || tile.type !== "floor") continue;
      const distance = dungeonManhattan(start, { x, y });
      if (!best || distance > best.distance) best = { x, y, distance };
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

function farthestDungeonCavern(caverns, start) {
  return caverns.reduce((best, cavern) => (
    dungeonManhattan(cavern.center, start) > dungeonManhattan(best.center, start) ? cavern : best
  ), caverns[0]);
}

function dungeonExitIsConnected(tiles, stairsUp, stairsDown) {
  return connectedDungeonOpenTileSet(tiles, stairsUp).has(dungeonPointKey(stairsDown));
}

function createDungeonCorridorRecord(fromRoom, toRoom, kind, index, endpoints = {}) {
  return {
    id: `corridor-${index}`,
    kind,
    fromRoomId: fromRoom.id,
    toRoomId: toRoom.id,
    from: endpoints.from ? { x: endpoints.from.x, y: endpoints.from.y } : { ...fromRoom.center },
    to: endpoints.to ? { x: endpoints.to.x, y: endpoints.to.y } : { ...toRoom.center },
    ...(endpoints.fromSide ? { fromSide: endpoints.fromSide } : {}),
    ...(endpoints.toSide ? { toSide: endpoints.toSide } : {}),
    ...(Array.isArray(endpoints.points) ? { points: endpoints.points.map((point) => ({ x: point.x, y: point.y })) } : {}),
  };
}

function createDungeonGraphSemantics(rooms, corridors, stairsUp, stairsDown, topology) {
  const roomPurposes = new Map(rooms.map((room) => [room.id, "ordinary"]));
  const corridorTags = new Map(corridors.map((corridor) => [corridor.id, dungeonDefaultCorridorTacticalTag(corridor)]));
  const degreeByRoomId = new Map(rooms.map((room) => [room.id, 0]));
  const incidentCorridorsByRoomId = new Map(rooms.map((room) => [room.id, []]));
  for (const corridor of corridors) {
    degreeByRoomId.set(corridor.fromRoomId, (degreeByRoomId.get(corridor.fromRoomId) ?? 0) + 1);
    degreeByRoomId.set(corridor.toRoomId, (degreeByRoomId.get(corridor.toRoomId) ?? 0) + 1);
    incidentCorridorsByRoomId.get(corridor.fromRoomId)?.push(corridor);
    incidentCorridorsByRoomId.get(corridor.toRoomId)?.push(corridor);
  }

  const startRoom = dungeonRoomForPoint(rooms, stairsUp);
  const exitRoom = dungeonRoomForPoint(rooms, stairsDown, startRoom?.id);
  const hubRoom = rooms.find((room) => room.templateId === "largeHub");
  if (startRoom && startRoom.id !== hubRoom?.id) roomPurposes.set(startRoom.id, "retreatRoom");
  if (exitRoom) roomPurposes.set(exitRoom.id, "retreatRoom");
  if (hubRoom) roomPurposes.set(hubRoom.id, "dangerRoom");

  for (const corridor of corridors) {
    if (corridor.kind !== "loop") continue;
    corridorTags.set(corridor.id, topology.generationVariant === "braidedLoops" ? "escapeRoute" : "shortcut");
    for (const roomId of [corridor.fromRoomId, corridor.toRoomId]) {
      if (roomPurposes.get(roomId) === "ordinary") roomPurposes.set(roomId, "loopAnchor");
    }
  }

  const roomsById = new Map(rooms.map((room) => [room.id, room]));
  const deadEndRooms = rooms
    .filter((room) => room.id !== startRoom?.id && room.id !== exitRoom?.id && (degreeByRoomId.get(room.id) ?? 0) <= 1)
    .sort((a, b) => dungeonRoomSemanticScore(b, stairsUp, stairsDown) - dungeonRoomSemanticScore(a, stairsUp, stairsDown));
  const deadEndPurposes = topology.generationVariant === "deadEndComb"
    ? ["treasureNook", "ambushPoint", "shrineRoom", "treasureNook", "ambushPoint"]
    : ["treasureNook", "shrineRoom", "ambushPoint"];
  deadEndRooms.forEach((room, index) => {
    roomPurposes.set(room.id, deadEndPurposes[index % deadEndPurposes.length]);
    for (const corridor of incidentCorridorsByRoomId.get(room.id) ?? []) corridorTags.set(corridor.id, "deadEndApproach");
  });

  const junctionRooms = rooms
    .filter((room) => room.id !== startRoom?.id && room.id !== exitRoom?.id && (degreeByRoomId.get(room.id) ?? 0) >= 3)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));
  for (const room of junctionRooms) {
    if (roomPurposes.get(room.id) !== "treasureNook" && roomPurposes.get(room.id) !== "shrineRoom") {
      roomPurposes.set(room.id, "dangerRoom");
    }
  }

  const chokeTarget = topology.generationVariant === "chokeGauntlet" ? 5 : 2;
  const chokeCorridors = corridors
    .filter((corridor) => corridor.kind !== "loop")
    .sort((a, b) => dungeonCorridorIndex(a) - dungeonCorridorIndex(b))
    .slice(0, chokeTarget);
  for (const corridor of chokeCorridors) {
    corridorTags.set(corridor.id, "choke");
    for (const roomId of [corridor.fromRoomId, corridor.toRoomId]) {
      if (roomPurposes.get(roomId) === "ordinary") roomPurposes.set(roomId, "ambushPoint");
    }
  }

  const desiredPurposeRooms = topology.generationVariant === "deadEndComb" ? 6 : 4;
  let purposeCount = [...roomPurposes.values()].filter((purpose) => purpose !== "ordinary").length;
  const fillers = rooms
    .filter((room) => roomPurposes.get(room.id) === "ordinary")
    .sort((a, b) => dungeonRoomSemanticScore(b, stairsUp, stairsDown) - dungeonRoomSemanticScore(a, stairsUp, stairsDown));
  for (const room of fillers) {
    if (purposeCount >= desiredPurposeRooms) break;
    roomPurposes.set(room.id, purposeCount % 2 === 0 ? "dangerRoom" : "ambushPoint");
    purposeCount += 1;
  }

  if (topology.generationVariant === "deadEndComb") {
    for (const corridor of corridors) {
      if (corridor.kind === "branch" && corridorTags.get(corridor.id) === "branchRoute") {
        const fromDegree = degreeByRoomId.get(corridor.fromRoomId) ?? 0;
        const toDegree = degreeByRoomId.get(corridor.toRoomId) ?? 0;
        if (fromDegree <= 2 || toDegree <= 2) corridorTags.set(corridor.id, "deadEndApproach");
      }
    }

    const optionalPurposes = new Set(["treasureNook", "shrineRoom", "ambushPoint"]);
    let optionalPurposeCount = [...roomPurposes.values()].filter((purpose) => optionalPurposes.has(purpose)).length;
    let optionalPurposeIndex = optionalPurposeCount;
    const seenBranchRooms = new Set();
    const branchEndpointRooms = corridors
      .filter((corridor) => corridor.kind === "branch")
      .flatMap((corridor) => [corridor.fromRoomId, corridor.toRoomId])
      .map((roomId) => roomsById.get(roomId))
      .filter((room) => {
        if (!room || seenBranchRooms.has(room.id)) return false;
        seenBranchRooms.add(room.id);
        return room.id !== startRoom?.id
          && room.id !== exitRoom?.id
          && roomPurposes.get(room.id) === "ordinary"
          && (degreeByRoomId.get(room.id) ?? 0) <= 2;
      })
      .sort((a, b) => dungeonRoomSemanticScore(b, stairsUp, stairsDown) - dungeonRoomSemanticScore(a, stairsUp, stairsDown));
    for (const room of branchEndpointRooms) {
      if (optionalPurposeCount >= 4) break;
      roomPurposes.set(room.id, deadEndPurposes[optionalPurposeIndex % deadEndPurposes.length]);
      optionalPurposeCount += 1;
      optionalPurposeIndex += 1;
    }
  }

  return { roomPurposes, corridorTags };
}

function dungeonDefaultCorridorTacticalTag(corridor) {
  if (corridor.kind === "critical") return "mainRoute";
  if (corridor.kind === "loop") return "shortcut";
  return "branchRoute";
}

function dungeonRoomSemanticScore(room, stairsUp, stairsDown) {
  return dungeonManhattan(room.center, stairsUp) + dungeonManhattan(room.center, stairsDown) + (room.width * room.height) * 0.25;
}

function dungeonCorridorIndex(corridor) {
  const match = /(\d+)$/.exec(corridor.id);
  return match ? Number(match[1]) : 0;
}

function createDungeonRoomMetadata(caverns, stairsUp, stairsDown, corridors, roomPurposes = new Map()) {
  const largestRoom = caverns.reduce((largest, cavern) => cavern.width * cavern.height > largest.width * largest.height ? cavern : largest, caverns[0]);
  const startRoom = dungeonRoomForPoint(caverns, stairsUp);
  const exitRoom = dungeonRoomForPoint(caverns, stairsDown, startRoom?.id);
  return caverns.map((cavern) => {
    const center = { ...cavern.center };
    const role = dungeonRoomRole(cavern, startRoom, exitRoom, largestRoom);
    return {
      id: cavern.id,
      x: cavern.x,
      y: cavern.y,
      width: cavern.width,
      height: cavern.height,
      radiusX: cavern.radiusX,
      radiusY: cavern.radiusY,
      rect: {
        x: cavern.x,
        y: cavern.y,
        width: cavern.width,
        height: cavern.height,
      },
      center,
      role,
      purpose: roomPurposes.get(cavern.id) ?? "ordinary",
      tacticalTags: dungeonRoomTacticalTags(cavern.id, role, roomPurposes.get(cavern.id) ?? "ordinary", corridors),
      riskTier: dungeonRoomRiskTier(roomPurposes.get(cavern.id) ?? "ordinary", role),
      rewardTier: dungeonRoomRewardTier(roomPurposes.get(cavern.id) ?? "ordinary", role),
      theme: dungeonRoomTheme(role),
      connections: dungeonRoomConnectionIds(cavern.id, corridors),
    };
  });
}

function createDungeonFloorIntent(topology) {
  const generationVariant = topology.generationVariant ?? topology.id;
  const variantIntent = dungeonVariantIntent(generationVariant);
  const archetypeId = topology.id;
  const encounterModifierId = topology.archetypeSelection?.encounterModifierId ?? "none";
  return {
    archetypeId: archetypeId === "narrowCorridors" ? "narrowCorridors" : archetypeId,
    topologyId: topology.id,
    generationVariant,
    selectorMode: topology.archetypeSelection?.mode ?? "explicit",
    requestedTopologyId: topology.requestedTopologyId ?? topology.id,
    encounterModifierId,
    routeRhythm: variantIntent.routeRhythm,
    exitPacing: topology.stairDistanceProfile ?? "far",
    tacticalEmphasis: variantIntent.tacticalEmphasis,
    rewardStyle: encounterModifierId === "monsterHouse" ? "highRiskArena" : variantIntent.rewardStyle,
  };
}

function dungeonVariantIntent(generationVariant) {
  if (generationVariant.startsWith("largeHubV2")) {
    return { routeRhythm: "hubMainPath", tacticalEmphasis: "openArena", rewardStyle: "sideBranches" };
  }
  if (generationVariant === "deadEndComb") {
    return { routeRhythm: "branchingDeadEnds", tacticalEmphasis: "optionalDetours", rewardStyle: "branchRewards" };
  }
  if (generationVariant === "chokeGauntlet") {
    return { routeRhythm: "constrictedSpine", tacticalEmphasis: "chokepoints", rewardStyle: "guardedProgress" };
  }
  if (generationVariant === "braidedLoops") {
    return { routeRhythm: "loopedSpine", tacticalEmphasis: "escapeRoutes", rewardStyle: "loopAnchors" };
  }
  if (generationVariant === "balancedSpine") {
    return { routeRhythm: "branchingSpine", tacticalEmphasis: "mixed", rewardStyle: "mixedBranches" };
  }
  if (generationVariant === "standard") {
    return { routeRhythm: "openCavern", tacticalEmphasis: "openTraversal", rewardStyle: "low" };
  }
  return { routeRhythm: "legacyComparison", tacticalEmphasis: "mixed", rewardStyle: "minimal" };
}

function dungeonRoomTacticalTags(roomId, role, purpose, corridors) {
  const tags = new Set();
  if (role === "start" || role === "exit" || purpose === "retreatRoom") tags.add("retreat");
  if (role === "hub") {
    tags.add("openArena");
    tags.add("mainRoute");
  }
  if (purpose === "treasureNook") tags.add("deadEndReward");
  if (purpose === "shrineRoom") tags.add("shrine");
  if (purpose === "ambushPoint") tags.add("ambush");
  if (purpose === "dangerRoom") tags.add("danger");
  if (purpose === "loopAnchor") tags.add("loopAccess");

  for (const corridor of corridors) {
    if (corridor.fromRoomId !== roomId && corridor.toRoomId !== roomId) continue;
    if (corridor.tacticalTag === "choke") tags.add("chokepoint");
    if (corridor.tacticalTag === "deadEndApproach") tags.add("deadEndApproach");
    if (corridor.tacticalTag === "shortcut") tags.add("loopAccess");
    if (corridor.tacticalTag === "escapeRoute") tags.add("escapeRoute");
    if (corridor.tacticalTag === "mainRoute") tags.add("mainRoute");
    if (corridor.tacticalTag === "branchRoute") tags.add("branchRoute");
  }

  return [...tags].sort();
}

function dungeonRoomRiskTier(purpose, role) {
  if (role === "start" || role === "exit" || purpose === "retreatRoom") return 0;
  if (purpose === "dangerRoom") return 3;
  if (purpose === "ambushPoint") return 2;
  if (purpose === "treasureNook" || purpose === "loopAnchor") return 1;
  return 0;
}

function dungeonRoomRewardTier(purpose, role) {
  if (role === "start" || role === "exit" || purpose === "retreatRoom") return 0;
  if (purpose === "treasureNook") return 3;
  if (purpose === "shrineRoom") return 2;
  if (purpose === "loopAnchor" || purpose === "ambushPoint" || purpose === "dangerRoom") return 1;
  return 0;
}

function createDungeonPlacementSlots(tiles, rooms, corridors, stairsUp, stairsDown) {
  const slots = [];
  const occupied = new Set([dungeonPointKey(stairsUp), dungeonPointKey(stairsDown)]);
  const startRoom = dungeonRoomForPoint(rooms, stairsUp);
  const exitRoom = dungeonRoomForPoint(rooms, stairsDown, startRoom?.id);
  const stairRoomIds = new Set([startRoom?.id, exitRoom?.id].filter(Boolean));

  addDungeonPlacementSlot(slots, tiles, occupied, "stairsUp", stairsUp, {
    roomId: startRoom?.id ?? null,
    riskTier: 0,
    rewardTier: 0,
    tags: ["stairs"],
    allowOccupied: true,
  });
  addDungeonPlacementSlot(slots, tiles, occupied, "stairsDown", stairsDown, {
    roomId: exitRoom?.id ?? null,
    riskTier: 0,
    rewardTier: 0,
    tags: ["stairs"],
    allowOccupied: true,
  });

  for (const room of rooms) {
    const purpose = room.purpose ?? "ordinary";
    if (purpose === "retreatRoom") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "retreat", room, { riskTier: 0, rewardTier: 0, tags: ["retreat"] });
    } else if (purpose === "treasureNook") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "branchReward", room, { riskTier: 1, rewardTier: 3, tags: ["reward", "branch"] });
    } else if (purpose === "shrineRoom") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "shrine", room, { riskTier: 0, rewardTier: 2, tags: ["shrine", "branch"] });
    } else if (purpose === "ambushPoint") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "ambush", room, { riskTier: 2, rewardTier: 1, tags: ["ambush"] });
    } else if (purpose === "dangerRoom") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "enemyPack", room, { riskTier: 3, rewardTier: 1, tags: ["danger"] });
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "trap", room, {
        riskTier: 2,
        rewardTier: 1,
        tags: ["danger", "trap"],
        preferredPoint: { x: room.center.x + 1, y: room.center.y },
      });
    } else if (purpose === "loopAnchor") {
      addDungeonRoomPlacementSlot(slots, tiles, occupied, "minorLoot", room, { riskTier: 1, rewardTier: 1, tags: ["loop"] });
    }
  }

  for (const corridor of corridors) {
    if (corridor.tacticalTag !== "choke" && corridor.tacticalTag !== "deadEndApproach") continue;
    if (stairRoomIds.has(corridor.fromRoomId) || stairRoomIds.has(corridor.toRoomId)) continue;
    const point = dungeonCorridorSlotPoint(tiles, corridor, occupied);
    if (!point) continue;
    const kind = corridor.tacticalTag === "choke" ? "ambush" : "trap";
    addDungeonPlacementSlot(slots, tiles, occupied, kind, point, {
      corridorId: corridor.id,
      riskTier: kind === "ambush" ? 2 : 1,
      rewardTier: kind === "ambush" ? 1 : 0,
      tags: [corridor.tacticalTag],
    });
  }

  return slots;
}

function addDungeonRoomPlacementSlot(slots, tiles, occupied, kind, room, options = {}) {
  const point = dungeonRoomSlotPoint(tiles, room, occupied, options.preferredPoint ?? room.center);
  if (!point) return;
  addDungeonPlacementSlot(slots, tiles, occupied, kind, point, {
    ...options,
    roomId: room.id,
  });
}

function addDungeonPlacementSlot(slots, tiles, occupied, kind, point, options = {}) {
  if (!point || !dungeonTileIsOpen(tiles, point.x, point.y)) return;
  const key = dungeonPointKey(point);
  if (!options.allowOccupied && occupied.has(key)) return;
  const slot = {
    id: `slot-${String(slots.length).padStart(2, "0")}-${kind}`,
    kind,
    point: { x: point.x, y: point.y },
    roomId: options.roomId ?? null,
    corridorId: options.corridorId ?? null,
    riskTier: clamp(Math.round(options.riskTier ?? 0), 0, 3),
    rewardTier: clamp(Math.round(options.rewardTier ?? 0), 0, 3),
    blocking: false,
    tags: Array.isArray(options.tags) ? [...new Set(options.tags)].sort() : [],
  };
  slots.push(slot);
  occupied.add(key);
}

function dungeonRoomSlotPoint(tiles, room, occupied, preferredPoint) {
  const candidates = [];
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (!dungeonTileIsOpen(tiles, x, y)) continue;
      const point = { x, y };
      if (occupied.has(dungeonPointKey(point))) continue;
      candidates.push(point);
    }
  }
  return candidates
    .sort((a, b) => dungeonManhattan(a, preferredPoint) - dungeonManhattan(b, preferredPoint))[0]
    ?? null;
}

function dungeonCorridorSlotPoint(tiles, corridor, occupied) {
  const points = Array.isArray(corridor.points) && corridor.points.length >= 2
    ? dungeonPolylineCells(corridor.points)
    : dungeonPolylineCells([corridor.from, corridor.to]);
  const midpoint = points[Math.floor(points.length / 2)] ?? corridor.from;
  return points
    .filter((point) => dungeonTileIsOpen(tiles, point.x, point.y) && !occupied.has(dungeonPointKey(point)))
    .sort((a, b) => dungeonManhattan(a, midpoint) - dungeonManhattan(b, midpoint))[0]
    ?? null;
}

function createDungeonQualityReport(tiles, rooms, corridors, corridorSamples, stairsUp, stairsDown, placementSlots) {
  const width = dungeonTilesWidth(tiles);
  const height = dungeonTilesHeight(tiles);
  const tileCount = width * height;
  const degreeByRoomId = new Map(rooms.map((room) => [room.id, 0]));
  const roomPurposeCounts = {};
  const tacticalTagCounts = {};
  for (const room of rooms) roomPurposeCounts[room.purpose] = (roomPurposeCounts[room.purpose] ?? 0) + 1;
  for (const corridor of corridors) {
    degreeByRoomId.set(corridor.fromRoomId, (degreeByRoomId.get(corridor.fromRoomId) ?? 0) + 1);
    degreeByRoomId.set(corridor.toRoomId, (degreeByRoomId.get(corridor.toRoomId) ?? 0) + 1);
    tacticalTagCounts[corridor.tacticalTag] = (tacticalTagCounts[corridor.tacticalTag] ?? 0) + 1;
  }

  let openTileCount = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (dungeonTileIsOpen(tiles, x, y)) openTileCount += 1;
    }
  }

  return {
    roomCount: rooms.length,
    branchCount: corridors.filter((corridor) => corridor.kind === "branch").length,
    loopCount: corridors.filter((corridor) => corridor.kind === "loop").length,
    purposeRoomCount: rooms.filter((room) => room.purpose !== "ordinary").length,
    placementSlotCount: placementSlots.length,
    chokePointCount: tacticalTagCounts.choke ?? 0,
    stairsPathLength: dungeonOpenPathDistance(tiles, stairsUp, stairsDown),
    deadEndRoomCount: [...degreeByRoomId.values()].filter((degree) => degree <= 1).length,
    openTileRatio: openTileCount / tileCount,
    largestRoomArea: Math.max(...rooms.map((room) => room.width * room.height)),
    corridorSampleCount: corridorSamples.length,
    roomPurposeCounts,
    tacticalTagCounts,
  };
}

function dungeonRoomRole(room, startRoom, exitRoom, largestRoom) {
  if (room.templateId === "largeHub") return "hub";
  if (startRoom && room.id === startRoom.id) return "start";
  if (exitRoom && room.id === exitRoom.id) return "exit";
  if (largestRoom && room.id === largestRoom.id && room.width * room.height >= 84) return "hub";
  return "chamber";
}

function dungeonPointInRoom(point, room) {
  return point.x >= room.x
    && point.y >= room.y
    && point.x < room.x + room.width
    && point.y < room.y + room.height;
}

function dungeonRoomForPoint(rooms, point, excludeRoomId = null) {
  const candidates = rooms.filter((room) => room.id !== excludeRoomId);
  const containing = candidates
    .filter((room) => dungeonPointInRoom(point, room))
    .sort((a, b) => dungeonManhattan(a.center, point) - dungeonManhattan(b.center, point));
  if (containing.length > 0) return containing[0];
  return candidates
    .slice()
    .sort((a, b) => dungeonManhattan(a.center, point) - dungeonManhattan(b.center, point))[0]
    ?? rooms[0]
    ?? null;
}

function dungeonRoomTheme(role) {
  if (role === "exit") return "dark";
  return "plain";
}

function dungeonRoomConnectionIds(roomId, corridors) {
  return corridors
    .filter((corridor) => corridor.fromRoomId === roomId || corridor.toRoomId === roomId)
    .map((corridor) => corridor.id);
}

function dungeonStartTile() {
  return {
    x: Math.floor(LOCAL_WIDTH / 2),
    y: Math.floor(LOCAL_HEIGHT / 2),
  };
}

function cloneLightSources(lightSources = []) {
  return lightSources.map((light) => ({ ...light }));
}

function cloneDungeonArchetypeSelection(selection = null) {
  return selection ? { ...selection } : null;
}

function cloneDungeonFloorIntent(floorIntent = null) {
  return floorIntent ? { ...floorIntent } : null;
}

function cloneDungeonPlacementSlots(placementSlots = []) {
  return placementSlots.map((slot) => ({
    ...slot,
    point: { ...slot.point },
    tags: Array.isArray(slot.tags) ? [...slot.tags] : [],
  }));
}

function cloneDungeonQualityReport(qualityReport = null) {
  return qualityReport
    ? {
      ...qualityReport,
      roomPurposeCounts: { ...(qualityReport.roomPurposeCounts ?? {}) },
      tacticalTagCounts: { ...(qualityReport.tacticalTagCounts ?? {}) },
    }
    : null;
}

function dungeonCardinalNeighbors(point) {
  return [
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
  ];
}

function dungeonPointKey(point) {
  return `${point.x},${point.y}`;
}

function dungeonManhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function dungeonWallTile(tiles, x, y) {
  return dungeonTileAt(tiles, x, y)?.type === "wall";
}

function dungeonTileIsOpen(tiles, x, y) {
  const tile = dungeonTileAt(tiles, x, y);
  return Boolean(tile && tile.type !== "wall" && tile.type !== "rubble");
}

function setDungeonTile(tiles, x, y, type, tone = 0) {
  if (!dungeonPointInsideCarveBounds(x, y)) return;
  setDungeonTileRaw(tiles, x, y, type, tone);
}

function setDungeonTileRaw(tiles, x, y, type, tone = 0) {
  if (x < 0 || y < 0 || x >= LOCAL_WIDTH || y >= LOCAL_HEIGHT) return;
  tiles[indexOf(LOCAL_WIDTH, x, y)] = { type, tone };
}

function dungeonPointInsideCarveBounds(x, y) {
  return x >= DUNGEON_BORDER_THICKNESS
    && y >= DUNGEON_BORDER_THICKNESS
    && x < LOCAL_WIDTH - DUNGEON_BORDER_THICKNESS
    && y < LOCAL_HEIGHT - DUNGEON_BORDER_THICKNESS;
}

function indexOf(width, x, y) {
  return y * width + x;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rngBetweenInt(rng, min, maxInclusive) {
  return min + Math.floor(rng() * (maxInclusive - min + 1));
}
