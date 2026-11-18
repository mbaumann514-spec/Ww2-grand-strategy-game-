const ZIP_LOCAL_FILE_HEADER = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_STORE_METHOD = 0;
const ZIP_VERSION = 20;
const ZIP_MAX_UINT16 = 0xffff;
const ZIP_MAX_UINT32 = 0xffffffff;

const CRC32_TABLE = createCrc32Table();

export function createZipArchive(entries, { modifiedAt = new Date() } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("ZIP archive requires at least one file");
  }
  if (entries.length > ZIP_MAX_UINT16) throw new Error("ZIP archive contains too many files");

  const seenPaths = new Set();
  const prepared = entries.map((entry) => prepareEntry(entry, seenPaths));
  const timestamp = toDosTimestamp(modifiedAt);
  const localChunks = [];
  const centralChunks = [];
  let localOffset = 0;

  for (const entry of prepared) {
    if (localOffset > ZIP_MAX_UINT32) throw new Error("ZIP archive exceeds the ZIP32 size limit");
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(ZIP_LOCAL_FILE_HEADER, 0);
    localHeader.writeUInt16LE(ZIP_VERSION, 4);
    localHeader.writeUInt16LE(ZIP_UTF8_FLAG, 6);
    localHeader.writeUInt16LE(ZIP_STORE_METHOD, 8);
    localHeader.writeUInt16LE(timestamp.time, 10);
    localHeader.writeUInt16LE(timestamp.date, 12);
    localHeader.writeUInt32LE(entry.crc32, 14);
    localHeader.writeUInt32LE(entry.data.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(entry.name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localChunks.push(localHeader, entry.name, entry.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(ZIP_CENTRAL_DIRECTORY_HEADER, 0);
    centralHeader.writeUInt16LE(ZIP_VERSION, 4);
    centralHeader.writeUInt16LE(ZIP_VERSION, 6);
    centralHeader.writeUInt16LE(ZIP_UTF8_FLAG, 8);
    centralHeader.writeUInt16LE(ZIP_STORE_METHOD, 10);
    centralHeader.writeUInt16LE(timestamp.time, 12);
    centralHeader.writeUInt16LE(timestamp.date, 14);
    centralHeader.writeUInt32LE(entry.crc32, 16);
    centralHeader.writeUInt32LE(entry.data.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(entry.name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralChunks.push(centralHeader, entry.name);

    localOffset += localHeader.length + entry.name.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralChunks);
  if (localOffset + centralDirectory.length > ZIP_MAX_UINT32) {
    throw new Error("ZIP archive exceeds the ZIP32 size limit");
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(ZIP_END_OF_CENTRAL_DIRECTORY, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(prepared.length, 8);
  end.writeUInt16LE(prepared.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDirectory, end]);
}

export function crc32(buffer) {
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  let value = 0xffffffff;
  for (const byte of data) value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function prepareEntry(entry, seenPaths) {
  if (!entry || typeof entry !== "object") throw new Error("invalid ZIP entry");
  const path = normalizeArchivePath(entry.path);
  if (seenPaths.has(path)) throw new Error(`duplicate ZIP path: ${path}`);
  seenPaths.add(path);
  const name = Buffer.from(path, "utf8");
  if (name.length > ZIP_MAX_UINT16) throw new Error(`ZIP path is too long: ${path}`);
  const data = Buffer.isBuffer(entry.data)
    ? entry.data
    : entry.data instanceof Uint8Array
      ? Buffer.from(entry.data)
      : Buffer.from(String(entry.data ?? ""), "utf8");
  if (data.length > ZIP_MAX_UINT32) throw new Error(`ZIP entry is too large: ${path}`);
  return { path, name, data, crc32: crc32(data) };
}

function normalizeArchivePath(value) {
  const path = String(value ?? "");
  if (!path || path.includes("\\") || path.startsWith("/") || path.endsWith("/") || path.includes("\0")) {
    throw new Error(`unsafe ZIP path: ${path}`);
  }
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`unsafe ZIP path: ${path}`);
  }
  return path;
}

function toDosTimestamp(value) {
  const date = value instanceof Date && Number.isFinite(value.getTime()) ? value : new Date();
  const year = Math.max(1980, Math.min(2107, date.getFullYear()));
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
}
