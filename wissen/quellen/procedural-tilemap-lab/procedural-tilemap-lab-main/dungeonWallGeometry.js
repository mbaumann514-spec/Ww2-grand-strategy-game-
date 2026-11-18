import { dungeonTileAt } from "./dungeonTopology.js";

const DEFAULT_DUNGEON_WIDTH = 54;
const DEFAULT_DUNGEON_HEIGHT = 34;
const WALL_GEOMETRY_VERSION = 1;
const VISIBLE_TOP_INNER_DEPTH = 2;

export function createDungeonWallGeometry(layout) {
  const contactRuns = createDungeonWallContactRuns(layout).map((run) => decorateDungeonWallRun(layout, run));
  const faceRuns = contactRuns.filter((run) => run.renderRole === "face");
  const rimRuns = contactRuns.filter((run) => run.renderRole === "rim");
  const topRiskRuns = contactRuns.filter((run) => run.topRisk);
  const visibleTopTiles = createVisibleDungeonWallTopTiles(layout);
  return {
    version: WALL_GEOMETRY_VERSION,
    width: dungeonLayoutWidth(layout),
    height: dungeonLayoutHeight(layout),
    contactRuns,
    faceRuns,
    rimRuns,
    topRiskRuns,
    visibleTopTiles,
    summary: {
      contactRuns: contactRuns.length,
      faceRuns: faceRuns.length,
      rimRuns: rimRuns.length,
      topRiskRuns: topRiskRuns.length,
      visibleTopTiles: visibleTopTiles.length,
    },
  };
}

export function dungeonWallRunLength(run) {
  return run.x0 !== undefined ? run.x1 - run.x0 + 1 : run.y1 - run.y0 + 1;
}

function createDungeonWallContactRuns(layout) {
  const width = dungeonLayoutWidth(layout);
  const height = dungeonLayoutHeight(layout);
  const runs = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (const side of ["north", "south"]) {
      let runStart = null;
      for (let x = 1; x < width - 1; x += 1) {
        const open = dungeonTileIsOpen(layout, x, y);
        const wall = dungeonTileAt(layout.tiles, x, side === "north" ? y - 1 : y + 1)?.type === "wall";
        if (open && wall) {
          if (runStart === null) runStart = x;
        } else if (runStart !== null) {
          runs.push({ side, x0: runStart, x1: x - 1, y });
          runStart = null;
        }
      }
      if (runStart !== null) runs.push({ side, x0: runStart, x1: width - 2, y });
    }
  }

  for (let x = 1; x < width - 1; x += 1) {
    for (const side of ["west", "east"]) {
      let runStart = null;
      for (let y = 1; y < height - 1; y += 1) {
        const open = dungeonTileIsOpen(layout, x, y);
        const wall = dungeonTileAt(layout.tiles, side === "west" ? x - 1 : x + 1, y)?.type === "wall";
        if (open && wall) {
          if (runStart === null) runStart = y;
        } else if (runStart !== null) {
          runs.push({ side, y0: runStart, y1: y - 1, x });
          runStart = null;
        }
      }
      if (runStart !== null) runs.push({ side, y0: runStart, y1: height - 2, x });
    }
  }
  return runs.filter((run) => dungeonWallRunLength(run) >= 2 || run.side === "north" || run.side === "south");
}

function decorateDungeonWallRun(layout, run) {
  const length = dungeonWallRunLength(run);
  const support = dungeonWallRunTopSupport(layout, run, length);
  const topRisk = run.side === "north" && support.ratio < 1;
  const renderRole = run.side === "north" && !topRisk ? "face" : "rim";
  return {
    ...run,
    length,
    renderRole,
    topSupportedTiles: support.supported,
    topSupportRatio: support.ratio,
    topRisk,
  };
}

function dungeonWallRunTopSupport(layout, run, length) {
  if (run.side !== "north") return { supported: length, ratio: 1 };
  const wallY = run.y - 1;
  let supported = 0;
  for (let x = run.x0; x <= run.x1; x += 1) {
    const backedByWall = dungeonWallTile(layout, x, wallY - 1);
    const tiedLeft = dungeonWallTile(layout, x - 1, wallY);
    const tiedRight = dungeonWallTile(layout, x + 1, wallY);
    if (backedByWall || (tiedLeft && tiedRight)) supported += 1;
  }
  return {
    supported,
    ratio: length <= 0 ? 1 : supported / length,
  };
}

function createVisibleDungeonWallTopTiles(layout) {
  const width = dungeonLayoutWidth(layout);
  const height = dungeonLayoutHeight(layout);
  const visible = new Map();
  const queue = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!dungeonWallTile(layout, x, y)) continue;
      const neighbors = dungeonPassableNeighborMask(layout, x, y);
      const nearOpen = neighbors.count > 0 || dungeonDiagonalOpenCount(layout, x, y) > 0;
      if (nearOpen) {
        const tile = { x, y, kind: "edge", distance: 0, neighbors };
        visible.set(dungeonPointKey(x, y), tile);
        queue.push(tile);
      }
    }
  }

  for (let index = 0; index < queue.length; index += 1) {
    const tile = queue[index];
    if (tile.distance >= VISIBLE_TOP_INNER_DEPTH) continue;
    for (const neighbor of dungeonCardinalNeighbors(tile.x, tile.y)) {
      if (!dungeonWallTile(layout, neighbor.x, neighbor.y)) continue;
      const key = dungeonPointKey(neighbor.x, neighbor.y);
      if (visible.has(key)) continue;
      const next = {
        x: neighbor.x,
        y: neighbor.y,
        kind: "inner",
        distance: tile.distance + 1,
        neighbors: dungeonPassableNeighborMask(layout, neighbor.x, neighbor.y),
      };
      visible.set(key, next);
      queue.push(next);
    }
  }

  return [...visible.values()].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

function dungeonCardinalNeighbors(x, y) {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
}

function dungeonPointKey(x, y) {
  return `${x},${y}`;
}

function dungeonPassableNeighborMask(layout, x, y) {
  const west = dungeonTileIsOpen(layout, x - 1, y);
  const east = dungeonTileIsOpen(layout, x + 1, y);
  const north = dungeonTileIsOpen(layout, x, y - 1);
  const south = dungeonTileIsOpen(layout, x, y + 1);
  return {
    west,
    east,
    north,
    south,
    count: Number(west) + Number(east) + Number(north) + Number(south),
  };
}

function dungeonDiagonalOpenCount(layout, x, y) {
  return Number(dungeonTileIsOpen(layout, x - 1, y - 1))
    + Number(dungeonTileIsOpen(layout, x + 1, y - 1))
    + Number(dungeonTileIsOpen(layout, x - 1, y + 1))
    + Number(dungeonTileIsOpen(layout, x + 1, y + 1));
}

function dungeonTileIsOpen(layout, x, y) {
  const tile = dungeonTileAt(layout.tiles, x, y);
  return Boolean(tile && tile.type !== "wall" && tile.type !== "rubble");
}

function dungeonWallTile(layout, x, y) {
  return dungeonTileAt(layout.tiles, x, y)?.type === "wall";
}

function dungeonLayoutWidth(layout) {
  return Number.isFinite(layout?.width) ? layout.width : DEFAULT_DUNGEON_WIDTH;
}

function dungeonLayoutHeight(layout) {
  return Number.isFinite(layout?.height) ? layout.height : DEFAULT_DUNGEON_HEIGHT;
}
