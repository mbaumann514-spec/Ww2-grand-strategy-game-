export const MAP_EXPORT_LAYER_MODES = Object.freeze(["current", "base", "baseActors", "debug"]);

export function resolveMapRenderLayers(options = {}) {
  const presentationEnabled = options.presentationEffects !== false;
  const atmosphereMode = typeof options.atmosphere === "string" && options.atmosphere
    ? options.atmosphere
    : "softHaze";
  const presentation = {
    enabled: presentationEnabled,
    atmosphere: presentationEnabled && atmosphereMode !== "none",
    atmosphereMode,
    vignette: presentationEnabled && options.showVignetteEffect !== false,
  };
  const legacyActors = Boolean(options.showActors);
  const showPlayer = options.showPlayer === undefined ? legacyActors : Boolean(options.showPlayer);
  const showEnemies = options.showEnemies === undefined ? legacyActors : Boolean(options.showEnemies);
  const overlays = {
    actors: showPlayer || showEnemies,
    player: showPlayer,
    enemies: showEnemies,
    debugElements: Boolean(options.showDebugElements),
    highlight: Boolean(options.highlightDebugElement),
    grid: Boolean(options.showGrid),
  };
  return {
    presentation,
    overlays,
    signature: [
      presentation.enabled ? "effects-on" : "effects-off",
      presentation.atmosphere ? `atmosphere-${atmosphereMode}` : "atmosphere-off",
      presentation.vignette ? "vignette-on" : "vignette-off",
      overlays.player ? "player-on" : "player-off",
      overlays.enemies ? "enemies-on" : "enemies-off",
      overlays.debugElements ? "elements-on" : "elements-off",
      overlays.highlight ? "highlight-on" : "highlight-off",
      overlays.grid ? "grid-on" : "grid-off",
    ].join(":"),
  };
}

export function normalizeMapExportLayerMode(value) {
  return MAP_EXPORT_LAYER_MODES.includes(value) ? value : "current";
}

export function resolveMapExportDrawOptions(mode, currentOptions = {}) {
  const exportLayerMode = normalizeMapExportLayerMode(mode);
  if (exportLayerMode === "current") return { ...currentOptions, exportLayerMode };

  const options = {
    ...currentOptions,
    exportLayerMode,
    presentationEffects: false,
    showVignetteEffect: false,
    showActors: false,
    showPlayer: false,
    showEnemies: false,
    showGrid: false,
    showDebugElements: false,
    highlightDebugElement: null,
  };
  if (exportLayerMode === "baseActors") {
    options.showActors = true;
    options.showPlayer = true;
    options.showEnemies = true;
  }
  if (exportLayerMode === "debug") {
    options.showGrid = true;
    options.showDebugElements = true;
    options.highlightDebugElement = currentOptions.highlightDebugElement ?? null;
  }
  return options;
}
