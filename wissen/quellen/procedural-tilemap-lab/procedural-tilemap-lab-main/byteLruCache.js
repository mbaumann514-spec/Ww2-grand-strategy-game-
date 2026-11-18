export function createByteLruCache(options = {}) {
  const maxBytes = Math.max(0, Math.floor(Number(options.maxBytes) || 0));
  const maxEntries = Number.isFinite(Number(options.maxEntries))
    ? Math.max(1, Math.floor(Number(options.maxEntries)))
    : Infinity;
  return {
    label: String(options.label ?? "cache"),
    maxBytes,
    maxEntries,
    dispose: typeof options.dispose === "function" ? options.dispose : null,
    bytes: 0,
    entries: new Map(),
  };
}

export function hasByteLruCacheEntry(cache, key) {
  return cache.entries.has(key);
}

export function getByteLruCacheEntry(cache, key) {
  if (!cache.entries.has(key)) return null;
  const record = cache.entries.get(key);
  cache.entries.delete(key);
  cache.entries.set(key, record);
  return record.value;
}

export function setByteLruCacheEntry(cache, key, value, byteSize = estimateCacheEntryBytes(value)) {
  if (cache.entries.has(key)) {
    const previous = cache.entries.get(key);
    cache.bytes -= previous.bytes;
    cache.entries.delete(key);
    disposeCacheRecord(cache, previous);
  }

  const bytes = Math.max(0, Math.floor(Number(byteSize) || 0));
  cache.entries.set(key, { value, bytes });
  cache.bytes += bytes;
  evictByteLruCache(cache);
  return value;
}

export function byteLruCacheStats(cache) {
  return {
    label: cache.label,
    entries: cache.entries.size,
    bytes: cache.bytes,
    maxBytes: cache.maxBytes,
    maxEntries: cache.maxEntries,
  };
}

export function clearByteLruCache(cache) {
  for (const record of cache.entries.values()) disposeCacheRecord(cache, record);
  cache.entries.clear();
  cache.bytes = 0;
}

export function estimateCacheEntryBytes(value) {
  if (!value || typeof value !== "object") return 0;
  let bytes = 0;
  if (value.canvas) bytes += canvasByteSize(value.canvas);
  if (value.map) bytes += mapByteSize(value.map);
  return bytes;
}

export function canvasByteSize(canvas) {
  const width = Math.max(0, Math.floor(Number(canvas?.width) || 0));
  const height = Math.max(0, Math.floor(Number(canvas?.height) || 0));
  return width * height * 4;
}

function mapByteSize(map) {
  const tileCount = Array.isArray(map?.tiles)
    ? map.tiles.length
    : Math.max(0, Math.floor(Number(map?.width) || 0)) * Math.max(0, Math.floor(Number(map?.height) || 0));
  return tileCount * 64;
}

function evictByteLruCache(cache) {
  while (cache.entries.size > 1 && (cache.entries.size > cache.maxEntries || cache.bytes > cache.maxBytes)) {
    const oldestKey = cache.entries.keys().next().value;
    const oldest = cache.entries.get(oldestKey);
    cache.bytes -= oldest.bytes;
    cache.entries.delete(oldestKey);
    disposeCacheRecord(cache, oldest);
  }
}

function disposeCacheRecord(cache, record) {
  if (!cache.dispose) return;
  cache.dispose(record.value);
}
