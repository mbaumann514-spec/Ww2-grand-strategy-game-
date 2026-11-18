# tools/karte — the map of 1 September 1939

`bau_karte.py` builds `data/map/europe_1939.json` (GENERATED) from Natural Earth 1:10m 5.1.2 (public domain; fetched
into `tools/cache/ne/`, outside git), the rules in `regeln_1939.py` (ours: who held what, the cuts, the towns, the
names of 1939) and the three files in `quelle/` (the sister game's ground, rivers and terrain grid).

    python3 -m venv ~/.venv-map && ~/.venv-map/bin/pip install shapely numpy mapbox-earcut pillow
    ~/.venv-map/bin/python tools/karte/bau_karte.py --preview /tmp/karte.png

It takes some twenty seconds. A region's id is its town's name of 1939 in plain letters; the scenario and the sea
file name regions by id, and the game refuses to load a file that names one the map does not have, so after changing
the rules run `gradle :sim:test`.
