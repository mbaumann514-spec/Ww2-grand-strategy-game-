import { hashSeed, makeRng } from "./tileArt.js";

const DEFAULT_ENEMY_TYPES = Object.freeze([
  Object.freeze({ key: "bat", scale: 0.9, shadow: "#9fc7e0" }),
  Object.freeze({ key: "rat", scale: 0.9, shadow: "#d998b0" }),
]);

export function createPassableEnemyPlacements(seed, map, options = {}) {
  if (!isUsableMap(map)) return [];
  const requestedCount = Number(options.count);
  const count = Math.max(0, Math.round(Number.isFinite(requestedCount) ? requestedCount : DEFAULT_ENEMY_TYPES.length));
  if (count === 0) return [];

  const start = normalizePoint(options.start, map);
  const excluded = new Set((options.excludedPoints ?? []).map(pointKey));
  excluded.add(pointKey(start));
  const candidates = [];
  for (let index = 0; index < map.tiles.length; index += 1) {
    const tile = map.tiles[index];
    if (!tile || tile.blocksMovement) continue;
    const point = { x: index % map.width, y: Math.floor(index / map.width) };
    if (excluded.has(pointKey(point))) continue;
    const distance = Math.abs(point.x - start.x) + Math.abs(point.y - start.y);
    if (distance < 4) continue;
    candidates.push({ ...point, distance });
  }

  const rng = makeRng(hashSeed(seed, "passable-enemy-placement-v0.1", map.width, map.height));
  for (const candidate of candidates) candidate.score = enemyCandidateScore(candidate, rng);
  candidates.sort((a, b) => a.score - b.score || a.y - b.y || a.x - b.x);
  const types = Array.isArray(options.types) && options.types.length > 0 ? options.types : DEFAULT_ENEMY_TYPES;
  return candidates.slice(0, count).map((point, index) => {
    const type = types[index % types.length];
    return {
      id: `enemy-${index}`,
      key: type.key,
      worldX: point.x,
      worldY: point.y,
      scale: Number.isFinite(type.scale) ? type.scale : 1,
      shadow: type.shadow ?? "#d8d8d8",
    };
  });
}

function enemyCandidateScore(point, rng) {
  const preferredDistance = 8;
  return Math.abs(point.distance - preferredDistance) * 4 + rng() * 9;
}

function isUsableMap(map) {
  return Number.isInteger(map?.width)
    && Number.isInteger(map?.height)
    && map.width > 0
    && map.height > 0
    && Array.isArray(map.tiles)
    && map.tiles.length === map.width * map.height;
}

function normalizePoint(point, map) {
  return {
    x: Number.isFinite(point?.x) ? Math.round(point.x) : Math.floor(map.width / 2),
    y: Number.isFinite(point?.y) ? Math.round(point.y) : Math.floor(map.height / 2),
  };
}

function pointKey(point) {
  return `${point?.x},${point?.y}`;
}
