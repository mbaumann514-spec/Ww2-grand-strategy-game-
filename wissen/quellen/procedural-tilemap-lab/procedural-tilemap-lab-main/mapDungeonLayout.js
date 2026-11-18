import { createDungeonLayout } from "./dungeonTopology.js";

export function createMapDungeonLayout(seed, terrainOptions = {}) {
  return createDungeonLayout(seed, {
    topologyId: terrainOptions.dungeonTopologyId,
    sizeProfileId: terrainOptions.dungeonSizeProfileId,
    mapSizeMode: terrainOptions.mapSizeMode,
    mapSizePresetId: terrainOptions.mapSizePresetId,
    mapOrientation: terrainOptions.mapOrientation,
    customMapWidth: terrainOptions.customMapWidth,
    customMapHeight: terrainOptions.customMapHeight,
  });
}
