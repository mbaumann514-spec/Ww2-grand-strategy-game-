export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const TILE_PAD_X = 16;
export const TILE_PAD_Y = 16;
export const CANVAS_WIDTH = TILE_WIDTH + TILE_PAD_X * 2;
export const CANVAS_HEIGHT = TILE_HEIGHT + TILE_PAD_Y * 2;

export const MATERIALS = {
  grass: {
    label: "Grass",
    base: "#557a42",
    shadow: "#2f4b2f",
    mid: "#678d4d",
    light: "#9fc26a",
    dark: "#263a27",
    speck: "#d2d18a",
  },
  dirt: {
    label: "Dirt",
    base: "#8a643c",
    shadow: "#563922",
    mid: "#9d7648",
    light: "#c39a61",
    dark: "#3c2a1d",
    speck: "#d7b077",
  },
  road: {
    label: "Packed Road",
    base: "#9a7b53",
    shadow: "#5b442c",
    mid: "#ad8d62",
    light: "#d1b37a",
    dark: "#44321f",
    speck: "#e2c891",
  },
  water: {
    label: "Water",
    base: "#356f84",
    shadow: "#1d4356",
    mid: "#4b8fa0",
    light: "#a6d5d2",
    dark: "#173141",
    speck: "#d7f2e8",
  },
  rock: {
    label: "Rock",
    base: "#72746b",
    shadow: "#3e423e",
    mid: "#8b8d82",
    light: "#babaa5",
    dark: "#2d312d",
    speck: "#d6d1b5",
  },
};

export const ROLES = [
  "center",
  "edge-n",
  "edge-e",
  "edge-s",
  "edge-w",
  "corner-ne",
  "corner-se",
  "corner-sw",
  "corner-nw",
  "inner-corner-ne",
  "inner-corner-se",
  "inner-corner-sw",
  "inner-corner-nw",
];

const diamond = [
  [48, 16],
  [80, 32],
  [48, 48],
  [16, 32],
];

export function makeRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(seed, ...parts) {
  let h = seed >>> 0;
  for (const part of parts.join(":")) {
    h = Math.imul(h ^ part.charCodeAt(0), 16777619) >>> 0;
  }
  return h || 1;
}

export function createTileCanvas(options) {
  const zoom = options.zoom ?? 3;
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH * zoom;
  canvas.height = CANVAS_HEIGHT * zoom;
  canvas.style.setProperty("--canvas-w", `${CANVAS_WIDTH * zoom}px`);
  canvas.style.setProperty("--canvas-h", `${CANVAS_HEIGHT * zoom}px`);
  const ctx = canvas.getContext("2d");
  ctx.scale(zoom, zoom);
  drawTile(ctx, options);
  return canvas;
}

export function drawTile(ctx, options) {
  const {
    seed,
    material = "grass",
    overlayMaterial = null,
    role = "center",
    variant = 0,
    rim = true,
    clear = true,
  } = options;

  const baseSeed = hashSeed(seed, material, role, variant, "base");
  const baseRng = makeRng(baseSeed);
  if (clear) ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawSoftShadow(ctx, 0.24);
  withDiamondClip(ctx, () => {
    fillMaterial(ctx, material, baseRng);
    drawMaterialDetails(ctx, material, baseRng, 1);
  });

  if (overlayMaterial && role !== "center") {
    const overlaySeed = hashSeed(seed, overlayMaterial, role, variant, "overlay");
    const overlayRng = makeRng(overlaySeed);
    withRoleClip(ctx, role, () => {
      fillMaterial(ctx, overlayMaterial, overlayRng);
      drawMaterialDetails(ctx, overlayMaterial, overlayRng, 0.82);
      drawTransitionFeather(ctx, overlayMaterial, role, overlayRng);
    });
  }

  drawEdgeHighlights(ctx, material, rim ? 1 : 0.55);
}

export function drawPatch(ctx, options) {
  const seed = options.seed ?? 1;
  const rng = makeRng(seed);
  const cols = 12;
  const rows = 8;
  const originX = 430;
  const originY = 38;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, "#1d231a");
  gradient.addColorStop(1, "#10130f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const terrain = [];
  for (let y = 0; y < rows; y += 1) {
    terrain[y] = [];
    for (let x = 0; x < cols; x += 1) {
      const dx = x - 8;
      const dy = y - 2.5;
      const water = dx * dx * 0.8 + dy * dy * 2.2 < 9;
      const road = Math.abs(y - 4 - Math.sin(x * 0.75) * 1.15) < 0.9;
      const rock = x < 3 && y < 3 && rng() > 0.25;
      terrain[y][x] = water ? "water" : rock ? "rock" : road ? "road" : "grass";
    }
  }

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const screenX = originX + (x - y) * (TILE_WIDTH / 2);
      const screenY = originY + (x + y) * (TILE_HEIGHT / 2);
      ctx.save();
      ctx.translate(screenX - CANVAS_WIDTH / 2, screenY - TILE_PAD_Y);
      drawTile(ctx, {
        seed: hashSeed(seed, x, y),
        material: terrain[y][x],
        role: "center",
        variant: x + y * cols,
        rim: terrain[y][x] !== "grass",
        clear: false,
      });
      ctx.restore();
    }
  }
}

function fillMaterial(ctx, materialKey, rng) {
  const material = MATERIALS[materialKey];
  const gradient = ctx.createLinearGradient(22, 17, 72, 50);
  gradient.addColorStop(0, tint(material.mid, 0.1));
  gradient.addColorStop(0.48, material.base);
  gradient.addColorStop(1, material.shadow);
  ctx.fillStyle = gradient;
  fillDiamond(ctx);

  if (materialKey === "water") {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#77c7c0";
    for (let i = 0; i < 5; i += 1) {
      const y = 23 + i * 4 + rng() * 2;
      drawWave(ctx, 28 + rng() * 18, y, 14 + rng() * 14);
    }
    ctx.globalAlpha = 1;
  }
}

function drawMaterialDetails(ctx, materialKey, rng, density) {
  if (materialKey === "grass") drawGrass(ctx, rng, density);
  if (materialKey === "dirt") drawDirt(ctx, rng, density);
  if (materialKey === "road") drawRoad(ctx, rng, density);
  if (materialKey === "water") drawWater(ctx, rng, density);
  if (materialKey === "rock") drawRock(ctx, rng, density);
}

function drawGrass(ctx, rng, density) {
  for (let i = 0; i < 26 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    const len = 2.5 + rng() * 5;
    const lean = (rng() - 0.5) * 3;
    ctx.strokeStyle = rng() > 0.72 ? MATERIALS.grass.light : MATERIALS.grass.dark;
    ctx.globalAlpha = 0.5 + rng() * 0.35;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + lean, p.y - len);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 8 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    ctx.fillStyle = rng() > 0.5 ? "#354f2e" : "#7fa35a";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 4 + rng() * 5, 1.6 + rng() * 2, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawDirt(ctx, rng, density) {
  for (let i = 0; i < 30 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    ctx.fillStyle = rng() > 0.55 ? MATERIALS.dirt.light : MATERIALS.dirt.dark;
    ctx.globalAlpha = 0.18 + rng() * 0.28;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 0.8 + rng() * 2.2, 0.5 + rng() * 1.4, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 7 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    ctx.strokeStyle = "#4b3020";
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - 2 - rng() * 3, p.y);
    ctx.quadraticCurveTo(p.x, p.y + (rng() - 0.5) * 4, p.x + 3 + rng() * 4, p.y + (rng() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRoad(ctx, rng, density) {
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#dcc48f";
  ctx.beginPath();
  ctx.ellipse(48, 33, 25, 7, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 18 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    if (Math.abs(p.y - 33) > 9) continue;
    ctx.fillStyle = rng() > 0.55 ? "#694a2e" : "#d0ad72";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 1 + rng() * 2.5, 0.8 + rng(), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWater(ctx, rng, density) {
  for (let i = 0; i < 7 * density; i += 1) {
    ctx.strokeStyle = rng() > 0.55 ? MATERIALS.water.light : "#5fb0b6";
    ctx.globalAlpha = 0.25 + rng() * 0.35;
    ctx.lineWidth = 0.9;
    drawWave(ctx, 24 + rng() * 34, 22 + rng() * 21, 10 + rng() * 16);
  }
  ctx.globalAlpha = 1;
}

function drawRock(ctx, rng, density) {
  for (let i = 0; i < 10 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    const r = 3 + rng() * 7;
    ctx.fillStyle = rng() > 0.5 ? "#85877e" : "#545a52";
    ctx.globalAlpha = 0.28 + rng() * 0.22;
    ctx.beginPath();
    ctx.moveTo(p.x - r, p.y);
    ctx.lineTo(p.x - r * 0.25, p.y - r * 0.45);
    ctx.lineTo(p.x + r * 0.75, p.y - r * 0.1);
    ctx.lineTo(p.x + r * 0.35, p.y + r * 0.45);
    ctx.closePath();
    ctx.fill();
  }
  for (let i = 0; i < 9 * density; i += 1) {
    const p = randomPointInDiamond(rng);
    ctx.strokeStyle = rng() > 0.5 ? "#282c2b" : "#b4b1a0";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y - 1);
    ctx.lineTo(p.x - 1, p.y + 1 + rng() * 3);
    ctx.lineTo(p.x + 5, p.y - 1 + rng() * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawTransitionFeather(ctx, materialKey, role, rng) {
  const material = MATERIALS[materialKey];
  ctx.strokeStyle = material.light;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const p = randomPointInDiamond(rng);
    if (!pointNearRoleBoundary(p, role)) continue;
    ctx.beginPath();
    ctx.moveTo(p.x - 2, p.y + (rng() - 0.5) * 2);
    ctx.lineTo(p.x + 3 + rng() * 3, p.y + (rng() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawEdgeHighlights(ctx, materialKey, alpha) {
  const material = MATERIALS[materialKey];
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = material.dark;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(80, 32);
  ctx.lineTo(48, 48);
  ctx.lineTo(16, 32);
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.56;
  ctx.strokeStyle = material.light;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(16, 32);
  ctx.lineTo(48, 16);
  ctx.lineTo(80, 32);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSoftShadow(ctx, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(48, 44, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function withDiamondClip(ctx, fn) {
  ctx.save();
  pathDiamond(ctx);
  ctx.clip();
  fn();
  ctx.restore();
}

function withRoleClip(ctx, role, fn) {
  ctx.save();
  pathRole(ctx, role);
  ctx.clip();
  fn();
  ctx.restore();
}

function pathDiamond(ctx) {
  ctx.beginPath();
  ctx.moveTo(diamond[0][0], diamond[0][1]);
  for (let i = 1; i < diamond.length; i += 1) ctx.lineTo(diamond[i][0], diamond[i][1]);
  ctx.closePath();
}

function fillDiamond(ctx) {
  pathDiamond(ctx);
  ctx.fill();
}

function pathRole(ctx, role) {
  const top = { x: 48, y: 16 };
  const right = { x: 80, y: 32 };
  const bottom = { x: 48, y: 48 };
  const left = { x: 16, y: 32 };
  const center = { x: 48, y: 32 };
  const midN = { x: 48, y: 24 };
  const midE = { x: 64, y: 32 };
  const midS = { x: 48, y: 40 };
  const midW = { x: 32, y: 32 };

  const polygons = {
    "edge-n": [top, right, center, left],
    "edge-e": [right, bottom, center, top],
    "edge-s": [bottom, left, center, right],
    "edge-w": [left, top, center, bottom],
    "corner-ne": [top, right, center],
    "corner-se": [right, bottom, center],
    "corner-sw": [bottom, left, center],
    "corner-nw": [left, top, center],
    "inner-corner-ne": [top, right, bottom, left, midW, midN],
    "inner-corner-se": [top, right, bottom, left, midN, midE],
    "inner-corner-sw": [top, right, bottom, left, midE, midS],
    "inner-corner-nw": [top, right, bottom, left, midS, midW],
  };

  const poly = polygons[role] ?? [top, right, bottom, left];
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i += 1) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
}

function randomPointInDiamond(rng) {
  for (let i = 0; i < 32; i += 1) {
    const x = 17 + rng() * 62;
    const y = 17 + rng() * 30;
    const u = Math.abs((x - 48) / 32);
    const v = Math.abs((y - 32) / 16);
    if (u + v <= 0.96) return { x, y };
  }
  return { x: 48, y: 32 };
}

function pointNearRoleBoundary(point, role) {
  if (role.includes("n")) return point.y < 32;
  if (role.includes("s")) return point.y > 32;
  if (role.includes("e")) return point.x > 48;
  if (role.includes("w")) return point.x < 48;
  return true;
}

function drawWave(ctx, x, y, width) {
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.bezierCurveTo(x - width / 4, y - 2, x, y + 2, x + width / 2, y);
  ctx.stroke();
}

function tint(hex, amount) {
  const raw = hex.replace("#", "");
  const n = Number.parseInt(raw, 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amount));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amount));
  const b = Math.min(255, (n & 255) + Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}
