#!/usr/bin/env python3
"""Builds the map of 1 September 1939 and writes data/map/europe_1939.json (GENERATED).

    python3 tools/karte/bau_karte.py [--preview out.png]

What goes in
  * Natural Earth 1:10m, release 5.1.2, public domain: the first-level administrative units
    (the lines of every border on the map), the populated places (which town a region grows
    round) and the lakes. Fetched into tools/cache/ne/, which is not in git.
  * tools/karte/regeln_1939.py: who held what on 1 September 1939, the cuts where a border of
    1939 crosses a unit of today, the towns and their names of 1939. Ours.
  * tools/karte/quelle/: three files taken over from the sister game (see its README): the
    ground as an 8 km raster of twelve colours (Natural Earth II), the rivers, the terrain grid.

What comes out
  One JSON file: regions with their polygons already cut into triangles, the borders between
  them, lakes, rivers and the ground. Positions are in tenths of a kilometre from the window's
  south-west corner, x east and y north, in Miller's cylindrical projection (middle meridian
  57.5 E, R 6371 km) -- the sister game's projection, so its ground raster fits cell for cell.

Needs: python3 with shapely >= 2.1, numpy, mapbox-earcut, and pillow for --preview.
"""
import json
import math
import os
import sys
import unicodedata
import urllib.request

import numpy as np
import shapely
from shapely.geometry import LineString, MultiPoint, Point, box, shape
from shapely.ops import linemerge, polygonize, split, unary_union
from shapely.strtree import STRtree
import mapbox_earcut as earcut

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import regeln_1939 as R  # noqa: E402

CACHE = os.path.join(ROOT, "tools", "cache", "ne")
QUELLE = os.path.join(HERE, "quelle")
OUT = os.path.join(ROOT, "data", "map", "europe_1939.json")
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/"
NE_FILES = ["ne_10m_admin_1_states_provinces", "ne_10m_populated_places", "ne_10m_lakes"]

RAD = 6371.0
LON0 = 57.5
# The sister game's world: kilometres from the south-west corner of ITS topology's box.
SISTER_MIN_X = -12195.935
SISTER_MIN_Y = 1374.998

W = R.WINDOW


def fx(lon):
    return RAD * math.radians(lon - LON0)


def fy(lat):
    return RAD * 1.25 * math.log(math.tan(math.pi / 4 + 0.4 * math.radians(lat)))


X0, Y0 = fx(W["west"]), fy(W["south"])
WIDTH, HEIGHT = fx(W["east"]) - X0, fy(W["north"]) - Y0


def project(coords):
    out = np.empty_like(coords)
    out[:, 0] = RAD * np.radians(coords[:, 0] - LON0) - X0
    out[:, 1] = RAD * 1.25 * np.log(np.tan(np.pi / 4 + 0.4 * np.radians(coords[:, 1]))) - Y0
    return out


def pt(lon, lat):
    return (fx(lon) - X0, fy(lat) - Y0)


def unproject(x, y):
    lon = math.degrees((x + X0) / RAD) + LON0
    lat = math.degrees((math.atan(math.exp((y + Y0) / RAD / 1.25)) - math.pi / 4) / 0.4)
    return lon, lat


def stretch(lat):
    """How much longer a kilometre is drawn at this latitude than it is on the ground (Miller stretches the north)."""
    phi = math.radians(lat)
    return math.sqrt(1.0 / (math.cos(phi) * math.cos(0.8 * phi)))


def gap_at(tag, lon, lat):
    """The spacing of regions there, in the map's own (stretched) kilometres."""
    return R.spacing(tag, lon, lat) * stretch(lat)


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name in NE_FILES:
        path = os.path.join(CACHE, name + ".geojson")
        if not os.path.exists(path):
            print("fetching", name, flush=True)
            urllib.request.urlretrieve(NE_URL + name + ".geojson", path)


def load(name):
    with open(os.path.join(CACHE, name + ".geojson"), encoding="utf-8") as f:
        return json.load(f)["features"]


def parts(geom):
    """The polygons of a geometry, whatever it is."""
    if geom is None or geom.is_empty:
        return []
    if geom.geom_type == "Polygon":
        return [geom]
    if geom.geom_type in ("MultiPolygon", "GeometryCollection"):
        out = []
        for g in geom.geoms:
            out.extend(parts(g))
        return out
    return []


def slug(name):
    text = unicodedata.normalize("NFKD", name.replace("ö", "oe").replace("ü", "ue").replace("ä", "ae").replace("ø", "o").replace("æ", "ae").replace("ł", "l").replace("ß", "ss").replace("đ", "d"))
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    out = "".join(c if c.isalnum() else "_" for c in text)
    while "__" in out:
        out = out.replace("__", "_")
    return out.strip("_")


# ------------------------------------------------------------------------------------------
# 1. The pieces: every unit of today, clipped to the window, cut where 1939 cuts it, and owned.
# ------------------------------------------------------------------------------------------

def build_pieces():
    window = box(W["west"], W["south"], W["east"], W["north"])
    cuts = {}
    for cut in R.CUTS:
        for unit in cut["units"]:
            cuts.setdefault(unit, []).append(cut)
    pieces = []          # (owner, polygon)
    dropped = 0
    for feature in load("ne_10m_admin_1_states_provinces"):
        p = feature["properties"]
        a3, name = p["adm0_a3"], p["name"] or ""
        if a3 not in R.SIMPLE and a3 not in ("POL", "LTU", "BLR", "UKR", "MDA", "BGR", "HRV", "GRC", "MAR", "FIN", "RUS", "SVN"):
            continue
        geom = shapely.make_valid(shape(feature["geometry"]))
        if not geom.intersects(window):
            continue
        geom = shapely.transform(geom.intersection(window), project)
        geom = shapely.set_precision(geom, 0.05)
        polys = parts(geom)
        lines = [LineString([pt(*c) for c in cut["line"]]) for cut in cuts.get((a3, name), [])]
        hints = [(tag, Point(pt(*at))) for cut in cuts.get((a3, name), []) for tag, at in cut.get("pieces", [])]
        for line in lines:
            polys = [q for poly in polys for q in parts(split(poly, line))]
        for poly in polys:
            if poly.area < 25 and a3 not in ("MLT", "GIB"):
                dropped += 1
                continue
            if hints:
                inside = [tag for tag, at in hints if poly.contains(at)]
                if len(set(inside)) > 1:
                    print("  cut piece of", name, "holds hints of", set(inside))
                tag = inside[0] if inside else min(hints, key=lambda h: poly.distance(h[1]))[0]
            else:
                c = poly.representative_point()
                lon, lat = unproject(c.x, c.y)
                tag = R.owner(a3, name, lon, lat)
            if tag is None:
                continue
            pieces.append((tag, poly))
    print(len(pieces), "pieces;", dropped, "islets under 25 km2 left out", flush=True)
    return pieces


# ------------------------------------------------------------------------------------------
# 2. The towns the regions grow round.
# ------------------------------------------------------------------------------------------

def choose_seeds(pieces):
    tree = STRtree([p for _, p in pieces])

    def owner_at(point):
        for i in tree.query(point):
            if pieces[i][1].contains(point):
                return pieces[i][0]
        i = tree.nearest(point)
        return pieces[i][0] if pieces[i][1].distance(point) < 12 else None

    places = []
    seen = set()
    for feature in load("ne_10m_populated_places"):
        p = feature["properties"]
        lon, lat = feature["geometry"]["coordinates"]
        if not (W["west"] < lon < W["east"] and W["south"] < lat < W["north"]) or p["ADM0_A3"] in R.NOT_A_TOWN or p["NAME"] in R.NOT_SEEDS:
            continue
        point = Point(pt(lon, lat))
        tag = owner_at(point)
        if tag is None:
            continue
        places.append(dict(name=p["NAME"], a3=p["ADM0_A3"], pop=p["POP_MAX"] or 0, lon=lon, lat=lat,
                           point=point, tag=tag, capital=p["FEATURECLA"] == "Admin-0 capital"))
        seen.add((p["NAME"], p["ADM0_A3"]))
    for name, (lon, lat) in R.EXTRA_PLACES.items():
        if any(q["name"] == name and abs(q["lon"] - lon) < 0.5 and abs(q["lat"] - lat) < 0.5 for q in places):
            continue
        point = Point(pt(lon, lat))
        tag = owner_at(point)
        if tag is None:
            print("  no land under", name)
            continue
        places.append(dict(name=name, a3="", pop=0, lon=lon, lat=lat, point=point, tag=tag, capital=False))

    biggest = {}
    for q in places:
        key = (q["name"], q["a3"])
        if key not in biggest or q["pop"] > biggest[key]["pop"]:
            biggest[key] = q

    def forced(place):
        if place["name"] not in R.FORCED or biggest[(place["name"], place["a3"])] is not place:
            return False
        only = R.FORCED_IN.get(place["name"])
        return only is None or place["a3"] in only or place["a3"] == ""

    seeds = []
    for place in sorted(places, key=lambda q: (not forced(q), not q["capital"], -q["pop"], q["name"])):
        near = [s for s in seeds if s["tag"] == place["tag"]]
        if forced(place):
            if any(s["point"].distance(place["point"]) < 30 * stretch(place["lat"]) for s in near):
                continue
        else:
            gap = gap_at(place["tag"], place["lon"], place["lat"])
            if place["capital"]:
                gap *= 0.6
            if any(s["point"].distance(place["point"]) < gap for s in near):
                continue
        seeds.append(place)
    missing = [n for n in R.FORCED if not any(s["name"] == n for s in seeds)]
    if missing:
        print("  FORCED but not found:", missing)
    # A state with land and no town on Natural Earth's list still needs one region.
    for tag in sorted({t for t, _ in pieces} - {s["tag"] for s in seeds}):
        biggest = max((p for t, p in pieces if t == tag), key=lambda p: p.area)
        c = biggest.representative_point()
        lon, lat = unproject(c.x, c.y)
        seeds.append(dict(name=R.FALLBACK_NAMES.get(tag, tag), a3="", pop=0, lon=lon, lat=lat, point=c, tag=tag, capital=False))
    for i, s in enumerate(seeds):
        s["index"] = i
        name = s["name"]
        for table in (R.NAMES_FIXED, R.NAMES_1939):
            for key in (name + "@" + str(round(s["lat"])), name + "|" + s["a3"], name):
                if key in table:
                    name = table[key]
                    break
            else:
                continue
            break
        s["name39"] = name.replace("  ", " ")
    return seeds, places


# ------------------------------------------------------------------------------------------
# 3. Regions: each piece to its nearest town; a piece large enough for several is divided.
# ------------------------------------------------------------------------------------------

def grow_regions(pieces, seeds):
    by_tag = {}
    for s in seeds:
        by_tag.setdefault(s["tag"], []).append(s)
    fragments = {}       # seed index -> polygons
    for tag, poly in pieces:
        mine = by_tag[tag]
        c = poly.representative_point()
        lon, lat = unproject(c.x, c.y)
        gap = gap_at(tag, lon, lat)
        inside = [s for s in mine if poly.contains(s["point"])]
        if len(mine) > 1 and (len(inside) >= 2 or poly.area > 0.45 * gap * gap):
            reach = math.hypot(poly.bounds[2] - poly.bounds[0], poly.bounds[3] - poly.bounds[1]) + 2.5 * gap
            near = [s for s in mine if s["point"].distance(c) < reach]
            if len(near) >= 2:
                cells = shapely.voronoi_polygons(MultiPoint([s["point"] for s in near]),
                                                 extend_to=poly.buffer(reach).envelope)
                for cell in cells.geoms:
                    home = [s for s in near if cell.contains(s["point"])]
                    if not home:
                        continue
                    for q in parts(poly.intersection(cell)):
                        if q.area > 0.01:
                            fragments.setdefault(home[0]["index"], []).append(q)
                continue
        nearest = min(mine, key=lambda s: poly.distance(s["point"]) + 0.2 * c.distance(s["point"]))
        fragments.setdefault(nearest["index"], []).append(poly)
    regions = {}
    for index, polys in fragments.items():
        regions[index] = unary_union(polys)
    return regions


def contact(a, b):
    """How much border two shapes share, in kilometres (near enough)."""
    if not a.envelope.buffer(1).intersects(b.envelope):
        return 0.0
    return a.buffer(0.3).intersection(b).area / 0.3


def tidy(regions, seeds):
    """Stray parts go to the neighbour they touch; regions too small to tap are merged away."""
    forced = {s["index"] for s in seeds if s["name"] in R.FORCED or s["capital"] or s["tag"] == "ENG" and s["name"] == "Gibraltar"}
    tag_of = {s["index"]: s["tag"] for s in seeds}
    for _ in range(3):
        moved = 0
        for index in sorted(regions):
            geom = regions[index]
            comps = parts(geom)
            if len(comps) < 2:
                continue
            seed = seeds[index]["point"]
            main = min(comps, key=lambda c: (c.distance(seed), -c.area))
            keep = [main]
            for comp in comps:
                if comp is main:
                    continue
                best, best_len = None, 2.0
                for other, og in regions.items():
                    if other == index or tag_of[other] != tag_of[index]:
                        continue
                    length = contact(comp, og)
                    if length > best_len:
                        best, best_len = other, length
                if best is None or contact(comp, main) > 2.0:
                    keep.append(comp)
                else:
                    regions[best] = unary_union([regions[best], comp])
                    moved += 1
            regions[index] = unary_union(keep)
        if not moved:
            break
    for index in sorted(regions, key=lambda i: regions[i].area):
        if index in forced or index not in regions:
            continue
        s = seeds[index]
        gap = gap_at(s["tag"], s["lon"], s["lat"])
        if regions[index].area > 0.16 * gap * gap:
            continue
        best, best_len = None, 5.0
        for other, og in regions.items():
            if other == index or tag_of[other] != tag_of[index]:
                continue
            length = contact(regions[index], og)
            if length > best_len:
                best, best_len = other, length
        if best is not None:
            regions[best] = unary_union([regions[best], regions[index]])
            del regions[index]
    return regions


def renode(regions):
    """One clean coverage: every shared border noded the same on both sides, then simplified together."""
    keys = sorted(regions)
    lines = unary_union([regions[k].boundary for k in keys])
    faces = list(polygonize(lines))
    tree = STRtree([regions[k] for k in keys])
    owned = {k: [] for k in keys}
    for face in faces:
        c = face.representative_point()
        for i in tree.query(c):
            if regions[keys[i]].contains(c):
                owned[keys[i]].append(face)
                break
    polys = [unary_union(owned[k]) for k in keys]
    simple = shapely.coverage_simplify(polys, 2.0)
    out = {}
    for k, g in zip(keys, simple):
        g = shapely.make_valid(g)
        if not g.is_empty:
            out[k] = unary_union(parts(g))
    return out


# ------------------------------------------------------------------------------------------
# 4. Borders, and what lies either side of each.
# ------------------------------------------------------------------------------------------

def find_borders(regions):
    keys = sorted(regions)
    tree = STRtree([regions[k] for k in keys])
    merged = linemerge(unary_union([regions[k].boundary for k in keys]))
    lines = list(merged.geoms) if merged.geom_type == "MultiLineString" else [merged]

    def side(point):
        for i in tree.query(point):
            if regions[keys[i]].contains(point):
                return keys[i]
        return -1

    frame = box(0, 0, WIDTH, HEIGHT).exterior
    borders = []
    for line in lines:
        coords = list(line.coords)
        if len(coords) < 2:
            continue
        best = max(range(len(coords) - 1), key=lambda i: math.dist(coords[i], coords[i + 1]))
        (ax, ay), (bx, by) = coords[best], coords[best + 1]
        length = math.dist((ax, ay), (bx, by))
        if length == 0:
            continue
        mx, my = (ax + bx) / 2, (ay + by) / 2
        nx, ny = -(by - ay) / length * 0.25, (bx - ax) / length * 0.25
        a, b = side(Point(mx + nx, my + ny)), side(Point(mx - nx, my - ny))
        if a == b:
            continue
        if a == -1:
            a, b = b, a
        kind = "land"
        if b == -1:
            kind = "edge" if frame.distance(Point(mx, my)) < 0.5 else "coast"
        borders.append(dict(a=a, b=b, kind=kind, km=line.length, coords=coords))
    return borders


# ------------------------------------------------------------------------------------------
# 5. What the sister game's files give: terrain, ground, rivers.
# ------------------------------------------------------------------------------------------

def unrle(row, code):
    out = []
    i = 0
    while i < len(row):
        letter = row[i]
        i += 1
        j = i
        while j < len(row) and row[j].isdigit():
            j += 1
        out.extend([code.index(letter)] * (int(row[i:j]) if j > i else 1))
        i = j
    return out


def rle(letters):
    out = []
    i = 0
    while i < len(letters):
        j = i
        while j < len(letters) and letters[j] == letters[i]:
            j += 1
        out.append(letters[i] + (str(j - i) if j - i > 1 else ""))
        i = j
    return "".join(out)


def sister_grid(name):
    with open(os.path.join(QUELLE, name), encoding="utf-8") as f:
        g = json.load(f)
    cells = np.array([unrle(row, g["code"]) + [0] * g["width"] for row in g["rows"]], dtype=object)
    grid = np.zeros((g["height"], g["width"]), dtype=np.int16)
    for y, row in enumerate(g["rows"]):
        values = unrle(row, g["code"])
        grid[y, :len(values)] = values[:g["width"]]
    del cells
    # The grid's west edge and top edge in THIS map's kilometres.
    left = g["originX"] + SISTER_MIN_X - X0
    top = g["originY"] + SISTER_MIN_Y - Y0
    return g, grid, left, top


TERRAIN_CLASS = {"farmland": "plains", "plains": "plains", "coastal": "plains", "steppe": "plains",
                 "forest": "forest", "tundra": "tundra", "marsh": "marsh", "desert": "desert",
                 "hills": "hills", "mountains": "mountains", "alpine": "mountains"}


def terrain_shares(regions):
    g, grid, left, top = sister_grid("europe_1335.terrain.json")
    cell = g["cell"]
    legend = g["legend"]
    shares = {}
    for key, geom in regions.items():
        x0, y0, x1, y1 = geom.bounds
        i0, i1 = max(0, int((x0 - left) / cell)), min(g["width"] - 1, int((x1 - left) / cell))
        j0, j1 = max(0, int((top - y1) / cell)), min(g["height"] - 1, int((top - y0) / cell))
        counts = {}
        if i1 >= i0 and j1 >= j0:
            xs, ys = np.meshgrid(left + (np.arange(i0, i1 + 1) + 0.5) * cell, top - (np.arange(j0, j1 + 1) + 0.5) * cell)
            inside = shapely.contains_xy(geom, xs, ys)
            for value in grid[j0:j1 + 1, i0:i1 + 1][inside]:
                kind = TERRAIN_CLASS.get(legend[value])
                if kind:
                    counts[kind] = counts.get(kind, 0) + 1
        total = sum(counts.values())
        shares[key] = {k: round(v / total, 2) for k, v in sorted(counts.items()) if v / total >= 0.05} if total else {"plains": 1.0}
    return shares


def ground_raster():
    g, grid, left, top = sister_grid("europe_1335.ground.json")
    cell = g["cell"]
    i0, i1 = int(math.floor((0 - left) / cell)) - 1, int(math.ceil((WIDTH - left) / cell)) + 1
    j0, j1 = int(math.floor((top - HEIGHT) / cell)) - 1, int(math.ceil((top - 0) / cell)) + 1
    i0, j0 = max(0, i0), max(0, j0)
    i1, j1 = min(g["width"], i1), min(g["height"], j1)
    crop = grid[j0:j1, i0:i1].copy()
    # Water cells take the colour of the land beside them, so the ground can be laid under every
    # land polygon and the coast is the polygon's own line, not the raster's stair.
    for _ in range(40):
        water = crop == 0
        if not water.any():
            break
        best = np.zeros_like(crop)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            shifted = np.roll(crop, (dy, dx), axis=(0, 1))
            best = np.where((best == 0) & (shifted != 0), shifted, best)
        crop = np.where(water, best, crop)
    crop = np.where(crop == 0, 1, crop)
    rows = [rle("".join(g["code"][v] for v in row)) for row in crop]
    return dict(cell=cell, left=round(left + i0 * cell, 1), top=round(top - j0 * cell, 1),
                width=int(crop.shape[1]), height=int(crop.shape[0]), code=g["code"], palette=g["palette"], rows=rows)


def rivers():
    with open(os.path.join(QUELLE, "europe_1335.rivers.json"), encoding="utf-8") as f:
        source = json.load(f)["rivers"]
    out = []
    frame = box(-20, -20, WIDTH + 20, HEIGHT + 20)
    for river in source:
        if river["rank"] > 6:
            continue
        p = river["points"]
        coords = [(p[i] + SISTER_MIN_X - X0, p[i + 1] + SISTER_MIN_Y - Y0) for i in range(0, len(p), 2)]
        line = LineString(coords)
        if not line.intersects(frame):
            continue
        line = line.intersection(frame).simplify(1.2)
        for part in (line.geoms if line.geom_type == "MultiLineString" else [line]):
            if part.geom_type == "LineString" and part.length > 15:
                out.append(dict(rank=river["rank"], line=part))
    return out


def lakes():
    window = box(W["west"], W["south"], W["east"], W["north"])
    out = []
    for feature in load("ne_10m_lakes"):
        p = feature["properties"]
        # A reservoir of the later twentieth century was a valley in 1939 (Rybinsk filled from 1941,
        # Kuibyshev, Tsimlyansk, Kakhovka and Volgograd after the war).
        if p.get("featurecla") != "Lake":
            continue
        geom = shapely.make_valid(shape(feature["geometry"]))
        if not geom.intersects(window):
            continue
        geom = shapely.transform(geom.intersection(window), project)
        for poly in parts(geom):
            if poly.area >= 250:
                out.append((p.get("name") or "", poly.simplify(1.2)))
    return out


# ------------------------------------------------------------------------------------------
# 6. Writing it down.
# ------------------------------------------------------------------------------------------

def tenths(coords):
    out = []
    for x, y in coords:
        out.append(int(round(x * 10)))
        out.append(int(round(y * 10)))
    return out


def triangulate(poly):
    rings = [list(poly.exterior.coords)[:-1]] + [list(r.coords)[:-1] for r in poly.interiors]
    rings = [r for r in rings if len(r) >= 3]
    verts = np.array([c for r in rings for c in r], dtype=np.float64)
    ends = np.cumsum([len(r) for r in rings]).astype(np.uint32)
    tris = earcut.triangulate_float64(verts, ends)
    return tenths(verts), [int(i) for i in tris]


def main():
    fetch()
    pieces = build_pieces()
    seeds, places = choose_seeds(pieces)
    print(len(seeds), "towns chosen", flush=True)
    regions = grow_regions(pieces, seeds)
    regions = tidy(regions, seeds)
    print(len(regions), "regions before the coverage is cleaned", flush=True)
    regions = renode(regions)
    borders = find_borders(regions)
    shares = terrain_shares(regions)
    river_list = rivers()
    major = STRtree([r["line"] for r in river_list if r["rank"] <= 4])
    major_lines = [r["line"] for r in river_list if r["rank"] <= 4]

    used = {}
    ids = {}
    for key in sorted(regions, key=lambda k: (seeds[k]["tag"], -seeds[k]["pop"], seeds[k]["name39"])):
        base = slug(seeds[key]["name39"]) or "region"
        name = base
        if name in used:
            name = base + "_" + seeds[key]["tag"].lower()
        n = 2
        while name in used:
            name = base + "_" + str(n)
            n += 1
        used[name] = key
        ids[key] = name

    neighbours = {k: {} for k in regions}
    coastal = set()
    for b in borders:
        if b["kind"] == "coast":
            coastal.add(b["a"])
        if b["kind"] == "land":
            neighbours[b["a"]][b["b"]] = neighbours[b["a"]].get(b["b"], 0) + b["km"]
            neighbours[b["b"]][b["a"]] = neighbours[b["b"]].get(b["a"], 0) + b["km"]

    urban = {k: 0 for k in regions}
    region_tree = STRtree([regions[k] for k in sorted(regions)])
    order = sorted(regions)
    for place in places:
        for i in region_tree.query(place["point"]):
            if regions[order[i]].contains(place["point"]):
                urban[order[i]] += place["pop"]
                break

    out_regions = []
    index_of = {key: n for n, key in enumerate(sorted(regions, key=lambda k: ids[k]))}
    for key in sorted(regions, key=lambda k: ids[k]):
        s = seeds[key]
        geom = regions[key]
        city = s["point"]
        if not geom.contains(city):
            city = geom.representative_point()
        polys, tris = [], []
        for poly in sorted(parts(geom), key=lambda p: -p.area):
            v, t = triangulate(poly)
            polys.append(v)
            tris.append(t)
        links = []
        for other, km in sorted(neighbours[key].items(), key=lambda kv: ids[kv[0]]):
            if km < 3:
                continue
            oc = seeds[other]["point"] if regions[other].contains(seeds[other]["point"]) else regions[other].representative_point()
            way = LineString([city, oc])
            river = any(major_lines[i].intersects(way) for i in major.query(way))
            links.append(dict(to=ids[other], km=int(round(km / stretch(unproject(city.x, city.y)[1]))), river=river))
        out_regions.append(dict(
            id=ids[key], name=s["name39"], owner=s["tag"],
            city=tenths([(city.x, city.y)]), lon=round(unproject(city.x, city.y)[0], 2), lat=round(unproject(city.x, city.y)[1], 2),
            area=int(round(geom.area / stretch(unproject(city.x, city.y)[1]) ** 2)), coastal=key in coastal,
            urban=int(round(urban[key] / 1000)), terrain=shares[key],
            links=links, polys=polys, tris=tris,
        ))

    out_borders = []
    for b in borders:
        if b["km"] < 1.5:
            continue
        out_borders.append(dict(a=index_of[b["a"]], b=index_of[b["b"]] if b["b"] != -1 else -1,
                                kind=b["kind"], pts=tenths(b["coords"])))

    out_lakes = []
    for name, poly in lakes():
        if poly.is_empty or poly.geom_type != "Polygon":
            continue
        v, t = triangulate(poly)
        out_lakes.append(dict(name=name, pts=v, tris=t))

    doc = dict(
        comment="GENERATED by tools/karte/bau_karte.py from Natural Earth 1:10m 5.1.2 (public domain) and "
                "tools/karte/regeln_1939.py -- do not edit; change the rules and run the tool. The map of "
                "1 September 1939: regions with their polygons cut into triangles, the borders between them, "
                "lakes, rivers and the ground. Positions are tenths of a kilometre from the south-west corner, "
                "x east, y north. See LICENSES.md.",
        projection="+proj=mill +lon_0=57.5 +R=6371000, shifted to the window's south-west corner",
        window=W, width=int(round(WIDTH * 10)), height=int(round(HEIGHT * 10)),
        regions=out_regions, borders=out_borders, lakes=out_lakes,
        rivers=[dict(rank=r["rank"], pts=tenths(r["line"].coords)) for r in river_list],
        ground=ground_raster(),
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    count = {}
    for r in out_regions:
        count[r["owner"]] = count.get(r["owner"], 0) + 1
    print(len(out_regions), "regions,", len(out_borders), "borders,", len(out_lakes), "lakes,", len(doc["rivers"]), "river lines")
    print(" ".join(f"{t}:{n}" for t, n in sorted(count.items(), key=lambda kv: -kv[1])))
    print("wrote", os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, "KB")
    if "--preview" in sys.argv:
        preview(doc, sys.argv[sys.argv.index("--preview") + 1])


def preview(doc, path):
    """A quick picture of the result, for looking at; never part of the project."""
    from PIL import Image, ImageDraw
    import hashlib
    scale = 0.45
    w, h = int(doc["width"] / 10 * scale), int(doc["height"] / 10 * scale)
    image = Image.new("RGB", (w, h), (150, 175, 195))
    draw = ImageDraw.Draw(image)

    def at(x, y):
        return (x / 10 * scale, h - y / 10 * scale)

    def colour(tag):
        d = hashlib.md5(tag.encode()).digest()
        return (110 + d[0] % 120, 110 + d[1] % 120, 110 + d[2] % 120)

    for r in doc["regions"]:
        for pts, tris in zip(r["polys"], r["tris"]):
            for i in range(0, len(tris), 3):
                tri = [at(pts[tris[i + k] * 2], pts[tris[i + k] * 2 + 1]) for k in range(3)]
                draw.polygon(tri, fill=colour(r["owner"]))
    for lake in doc["lakes"]:
        pts, tris = lake["pts"], lake["tris"]
        for i in range(0, len(tris), 3):
            draw.polygon([at(pts[tris[i + k] * 2], pts[tris[i + k] * 2 + 1]) for k in range(3)], fill=(150, 175, 195))
    for river in doc["rivers"]:
        if river["rank"] <= 4:
            p = river["pts"]
            draw.line([at(p[i], p[i + 1]) for i in range(0, len(p), 2)], fill=(90, 120, 170), width=1)
    owner = [r["owner"] for r in doc["regions"]]
    for b in doc["borders"]:
        p = b["pts"]
        line = [at(p[i], p[i + 1]) for i in range(0, len(p), 2)]
        if b["kind"] == "land" and owner[b["a"]] != owner[b["b"]]:
            draw.line(line, fill=(30, 20, 20), width=3)
        else:
            draw.line(line, fill=(70, 60, 60), width=1)
    for r in doc["regions"]:
        x, y = at(*r["city"])
        draw.rectangle([x - 2, y - 2, x + 2, y + 2], fill=(20, 20, 20))
        draw.text((x + 4, y - 5), r["name"], fill=(10, 10, 10))
    image.save(path)
    print("preview", path, image.size)


if __name__ == "__main__":
    main()
