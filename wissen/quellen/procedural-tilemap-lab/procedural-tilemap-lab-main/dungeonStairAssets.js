export const DUNGEON_STAIR_SPRITE_VERSION = 1;

export const DUNGEON_STAIR_SPRITE_ASSETS = Object.freeze({
  up: Object.freeze({
    id: "stairsUp",
    path: "assets/terrain/dungeon/stairs_up.png",
    width: 96,
    height: 96,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    shadow: false,
  }),
  down: Object.freeze({
    id: "stairsDown",
    path: "assets/terrain/dungeon/stairs_down.png",
    width: 48,
    height: 48,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    shadow: false,
  }),
});

export function dungeonStairAssetForDirection(direction) {
  return direction === "down" ? DUNGEON_STAIR_SPRITE_ASSETS.down : DUNGEON_STAIR_SPRITE_ASSETS.up;
}

export function dungeonStairSpriteReady(image) {
  return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

export function dungeonStairSpriteSignature(sprites = {}) {
  return ["up", "down"]
    .map((direction) => {
      const image = sprites?.[direction];
      const state = dungeonStairSpriteReady(image)
        ? `${image.naturalWidth}x${image.naturalHeight}`
        : image?.complete ? "error" : "pending";
      return `${direction}:${image?.src ?? "none"}:${state}`;
    })
    .join("|");
}
