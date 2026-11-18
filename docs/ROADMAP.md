# Roadmap

What is built, what was measured, and what comes next. One package at a time.

## Paket 1 — the map, the war, a first game to play (18 November 2026)

**Built**
- The map of 1 September 1939 (`tools/karte/`, `data/map/europe_1939.json`): 462 regions in 32 states from Natural
  Earth, with the Corridor and Danzig, East Prussia, the Protectorate, Upper Silesia as divided in 1922, the Riga
  line, Finland with Viipuri and Petsamo, Rumania at its widest, the Rapallo border, the Dodecanese, Libya, the
  mandates. Ground, rivers and terrain from the sister game's files.
- The rules (`sim/`): divisions of six kinds; marches with terrain, rivers, rail, mud and winter; battles of
  organisation and strength with a width, fortified lines, digging in, surprise, overextension; supply and
  encirclement; industry, manpower, fuel and oil deals; the sea as zones ruled by fleets and aircraft in reach, with
  passages and landings; factions, guarantees, local wars, ultimatums, capitulation, the armistice of 1940; the plan
  of history; the computer's play; saves.
- The game (`core/`, `lwjgl3/`): title page with the choice of 18 states, the map with military map symbols at three
  distances, orders by tap (select, March, destination), the region's sheet, the pages Industry and States
  (decisions of the plan, declarations of war), notices, ultimatum and end pages, "About this game" and "Where it
  comes from", English and German, a save written safely, the screenshot harness with its two checks.
- The reviewers' pre-checks (`docs/pruefer/`).

**Measured** (the computer alone, `:sim:headless`, seeds 1 to 6, 18 November 2026)
- Poland capitulates between 20 and 24 September 1939 in five runs, on 11 November in one (historically 6 October).
- France falls in all six: September 1940, November 1940, March 1941, October 1941 (twice), December 1941
  (historically 22 June 1940).
- The war in the east is then over in 1942: three times the Soviet Union capitulates (April to August 1942), three
  times Germany (May to October 1942; once to Britain). Historically May 1945. **This is too fast either way.**
- A simulated day costs 1.5 to 2.8 ms on the desk (a frame is 16.7 ms).
- 13 tests, no failures.

**Deviations and what is thin** — each is a decision until the author says otherwise
- The name, the upright format and the absence of troop pictures are assumptions (CLAUDE.md §1).
- Only English and German; the sister game's eight languages are not in yet.
- No Android module yet, so nothing to install on a phone: the next package.
- Navies and air forces are one number a state, not pieces; there is no United States, no lend-lease, no research,
  no generals, no partisans, no weather beyond mud and winter.
- Borders drawn approximately (named in `tools/karte/regeln_1939.py` as DEVIATION): the Grenzmark, Soldau, the Wilno
  land beyond Vilnius county, Memel's county, Fiume, Zara, the Rif, the First Vienna Award's strip (Kassa is drawn
  Slovak), Zaolzie, Salla.
- Regions inside a state are grown round towns with straight borders where Natural Earth has no line; towns' sizes of
  today weigh a state's industry and people among its regions *(filled in)*.
- "Axis" names Germany's side from the first day, though the pact is of September 1940.
- Army quality, generals' caution, mobilisation and the sea's fleet stations are our own judgement *(filled in)*.
- Region names are the English forms of 1939 in both languages.

## Next, in this order

1. **Android**: the launcher module and a workflow that builds the APK on a button press, so the author can play on
   his phone.
2. **Balance of the long war**: the east must take years, not months (depth of the Soviet Union, reserves, the
   winter of 1941, German manpower); France should fall in the summer of 1940 more often.
3. **The west comes back**: the United States (off the map, arriving in Britain), landings by the computer, Italy's
   change of side, liberation of a capitulated ally's land.
4. **A first lesson** for a new player (what to tap, in a year of Poland), and a fronts order so a player does not
   move every division by hand.
5. Fleets and air forces as pieces; research; the remaining languages; music and sound.
