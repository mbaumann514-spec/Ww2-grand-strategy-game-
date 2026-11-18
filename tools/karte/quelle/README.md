# quelle/ -- three files taken over from the sister game

Copied on 18 November 2026 from the repository of *Sacrum Imperium* (its commit `a0be23d`, `data/geo/`), read-only
there, unchanged here. They are the author's own work made from Natural Earth, which is public domain:

| File | What it is | Made there by | From |
|---|---|---|---|
| `europe_1335.ground.json` | the ground as an 8 km raster of twelve colours | `tools/build_ground_raster.py` | Natural Earth II with Shaded Relief and Water 2.0.0, by Tom Patterson, public domain |
| `europe_1335.rivers.json` | river lines with Natural Earth's `scalerank` | `tools/fluesse.mjs` | Natural Earth 1:10m rivers and lake centerlines 5.1.1, public domain |
| `europe_1335.terrain.json` | the kind of ground on a 16 km grid | `tools/build_map.mjs` | the sister game's own terrain research inside its map; Natural Earth's named landscapes outside it |

`tools/karte/bau_karte.py` reads them: the ground is laid under this map's own land, the rivers are drawn and decide
which borders are river crossings, the terrain grid gives each region its share of plains, forest, hills, mountains,
marsh, desert and tundra. The sister game's coast of 1336 (the Po delta, the Jade, the reservoirs taken out) does not
matter here: this map's coast is Natural Earth's own, and only the colours of the land are used.

Nothing else of the sister game's map is used: its provinces are those of 1336 and do not fit the borders of 1939.
