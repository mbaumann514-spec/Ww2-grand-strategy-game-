import { hashSeed } from "./tileArt.js";

const noiseSaltCache = new Map();
const fbmNoiseSaltCache = new Map();

export function createNoiseSalt(seed, salt) {
  if (Number.isInteger(salt)) return salt >>> 0;
  const key = `${seed}\u0000${salt}`;
  const cached = noiseSaltCache.get(key);
  if (cached !== undefined) return cached;
  const value = hashSeed(seed, salt);
  noiseSaltCache.set(key, value);
  return value;
}

export function createFbmNoiseSalts(seed, salt, octaves) {
  const count = Math.max(0, Math.floor(Number(octaves) || 0));
  const key = `${seed}\u0000${salt}\u0000${count}`;
  const cached = fbmNoiseSaltCache.get(key);
  if (cached) return cached;
  const salts = Object.freeze(Array.from({ length: count }, (_, octave) => createNoiseSalt(seed, `${salt}-${octave}`)));
  fbmNoiseSaltCache.set(key, salts);
  return salts;
}

export function hashNoiseValue(noiseSalt, x, y) {
  let h = (noiseSalt >>> 0)
    ^ Math.imul(x | 0, 0x27d4eb2d)
    ^ Math.imul(y | 0, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
