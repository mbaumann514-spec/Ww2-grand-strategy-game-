export const DEFAULT_SPRITE_SHADOW = Object.freeze({
  x: 0.5,
  y: 0.9,
  w: 0.82,
  h: 0.2,
  angle: 0,
  alpha: 0.34,
  blur: 2,
  round: 1,
});

export const DEFAULT_SPRITE_ANCHOR = Object.freeze({
  x: 0.5,
  y: 0.9,
});

export const DEFAULT_SPRITE_SCALE = 0.35;
export const MIN_SPRITE_SCALE = 0.08;
export const MAX_SPRITE_SCALE = 0.8;
export const MAX_COLLISION_BOUNDS_SIZE = 8;
export const COLLISION_BOUNDS_MARGIN = 4;

export function normalizeSpriteShadow(shadow = {}) {
  return {
    x: clampFinite(shadow.x, DEFAULT_SPRITE_SHADOW.x, 0, 1),
    y: clampFinite(shadow.y, DEFAULT_SPRITE_SHADOW.y, 0, 1.15),
    w: clampFinite(shadow.w, DEFAULT_SPRITE_SHADOW.w, 0.1, 1.4),
    h: clampFinite(shadow.h, DEFAULT_SPRITE_SHADOW.h, 0.04, 0.7),
    angle: clampFinite(shadow.angle, DEFAULT_SPRITE_SHADOW.angle, -0.8, 0.8),
    alpha: clampFinite(shadow.alpha, DEFAULT_SPRITE_SHADOW.alpha, 0.02, 0.75),
    blur: clampFinite(shadow.blur, DEFAULT_SPRITE_SHADOW.blur, 0, 8),
    round: clampFinite(shadow.round, DEFAULT_SPRITE_SHADOW.round, 0, 1),
  };
}

export function normalizeSpriteAnchor(anchor = {}) {
  return {
    x: clampFinite(anchor.x, DEFAULT_SPRITE_ANCHOR.x, 0, 1),
    y: clampFinite(anchor.y, DEFAULT_SPRITE_ANCHOR.y, 0, 1),
  };
}

export function normalizeSpriteScale(scale) {
  return clampFinite(scale, DEFAULT_SPRITE_SCALE, MIN_SPRITE_SCALE, MAX_SPRITE_SCALE);
}

export function normalizeSpriteFootprint(footprint = {}, fallback = { w: 1, h: 1 }) {
  return {
    w: Math.max(1, Math.min(5, Math.floor(Number(footprint.w) || fallback.w || 1))),
    h: Math.max(1, Math.min(5, Math.floor(Number(footprint.h) || fallback.h || 1))),
  };
}

export function normalizeSpriteCollisionBounds(bounds, footprint = {}, tiles = [], mode = "footprint") {
  const normalizedFootprint = normalizeSpriteFootprint(footprint);
  if (bounds && typeof bounds === "object") {
    const x = Math.floor(Number(bounds.x));
    const y = Math.floor(Number(bounds.y));
    const w = Math.floor(Number(bounds.w));
    const h = Math.floor(Number(bounds.h));
    if ([x, y, w, h].every(Number.isFinite) && w > 0 && h > 0) {
      return clampCollisionBounds({ x, y, w, h }, normalizedFootprint);
    }
  }
  return defaultCollisionBounds(normalizedFootprint, tiles, mode);
}

export function normalizeSpriteCollisionTiles(tiles, footprint = {}, mode = "footprint", bounds = null) {
  const normalizedFootprint = normalizeSpriteFootprint(footprint);
  const collisionBounds = normalizeSpriteCollisionBounds(bounds, normalizedFootprint, tiles, mode);
  const source = Array.isArray(tiles)
    ? tiles
    : mode === "none"
      ? []
      : rectangularCollisionTiles(normalizedFootprint);
  const seen = new Set();
  const result = [];
  for (const tile of source) {
    const x = Math.floor(Number(Array.isArray(tile) ? tile[0] : tile?.x));
    const y = Math.floor(Number(Array.isArray(tile) ? tile[1] : tile?.y));
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (!tileInCollisionBounds(x, y, collisionBounds)) continue;
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ x, y });
  }
  result.sort((a, b) => a.y - b.y || a.x - b.x);
  return result;
}

export function spriteCollisionBoundsCoveringFootprint(footprint = {}, bounds = {}, tiles = []) {
  const normalizedFootprint = normalizeSpriteFootprint(footprint);
  const normalizedBounds = normalizeSpriteCollisionBounds(bounds, normalizedFootprint, tiles, "custom");
  const parsedTiles = Array.isArray(tiles)
    ? tiles
        .map((tile) => ({
          x: Math.floor(Number(Array.isArray(tile) ? tile[0] : tile?.x)),
          y: Math.floor(Number(Array.isArray(tile) ? tile[1] : tile?.y)),
        }))
        .filter((tile) => Number.isFinite(tile.x) && Number.isFinite(tile.y))
    : [];
  const xs = [0, normalizedFootprint.w - 1, normalizedBounds.x, normalizedBounds.x + normalizedBounds.w - 1, ...parsedTiles.map((tile) => tile.x)];
  const ys = [0, normalizedFootprint.h - 1, normalizedBounds.y, normalizedBounds.y + normalizedBounds.h - 1, ...parsedTiles.map((tile) => tile.y)];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return normalizeSpriteCollisionBounds({
    x,
    y,
    w: Math.max(...xs) - x + 1,
    h: Math.max(...ys) - y + 1,
  }, normalizedFootprint, parsedTiles, "custom");
}

function defaultCollisionBounds(footprint, tiles = [], mode = "footprint") {
  const parsedTiles = Array.isArray(tiles)
    ? tiles
        .map((tile) => ({
          x: Math.floor(Number(Array.isArray(tile) ? tile[0] : tile?.x)),
          y: Math.floor(Number(Array.isArray(tile) ? tile[1] : tile?.y)),
        }))
        .filter((tile) => Number.isFinite(tile.x) && Number.isFinite(tile.y))
    : [];
  const xs = [0, footprint.w - 1, ...parsedTiles.map((tile) => tile.x)];
  const ys = [0, footprint.h - 1, ...parsedTiles.map((tile) => tile.y)];
  const pad = parsedTiles.length > 0 || mode === "custom" ? 0 : 1;
  return clampCollisionBounds({
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + 1 + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + 1 + pad * 2,
  }, footprint);
}

function clampCollisionBounds(bounds, footprint) {
  const minX = -COLLISION_BOUNDS_MARGIN;
  const minY = -COLLISION_BOUNDS_MARGIN;
  const maxRight = footprint.w + COLLISION_BOUNDS_MARGIN;
  const maxBottom = footprint.h + COLLISION_BOUNDS_MARGIN;
  let x = Math.max(minX, Math.min(bounds.x, maxRight - 1));
  let y = Math.max(minY, Math.min(bounds.y, maxBottom - 1));
  let right = Math.max(x + 1, Math.min(bounds.x + bounds.w, maxRight));
  let bottom = Math.max(y + 1, Math.min(bounds.y + bounds.h, maxBottom));
  if (right - x > MAX_COLLISION_BOUNDS_SIZE) {
    if (bounds.x < 0) x = Math.max(minX, right - MAX_COLLISION_BOUNDS_SIZE);
    else right = x + MAX_COLLISION_BOUNDS_SIZE;
  }
  if (bottom - y > MAX_COLLISION_BOUNDS_SIZE) {
    if (bounds.y < 0) y = Math.max(minY, bottom - MAX_COLLISION_BOUNDS_SIZE);
    else bottom = y + MAX_COLLISION_BOUNDS_SIZE;
  }
  right = Math.min(right, maxRight);
  bottom = Math.min(bottom, maxBottom);
  return {
    x,
    y,
    w: Math.max(1, right - x),
    h: Math.max(1, bottom - y),
  };
}

function tileInCollisionBounds(x, y, bounds) {
  return x >= bounds.x && y >= bounds.y && x < bounds.x + bounds.w && y < bounds.y + bounds.h;
}

function rectangularCollisionTiles(footprint) {
  const tiles = [];
  for (let y = 0; y < footprint.h; y += 1) {
    for (let x = 0; x < footprint.w; x += 1) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

function clampFinite(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
