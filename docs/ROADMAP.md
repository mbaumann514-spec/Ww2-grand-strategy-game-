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

## Paket 2 — the battle after its precedent, and the map put right (18 November 2026)

**Asked for** by the author: *"das Combat soll ähnlich wie Hearts of Iron sein, studier das"*, and the whole of the
sister game's `wissen/` copied here (done, see `CLAUDE.md`).

**Built**
- The battle (`docs/GEFECHT.md`): fire against men and against armour, what a division can take under cover while
  it holds and while it drives, plate against guns, frontage by ground with reserves, works that cover the defender
  and are turned from a flank, pockets. The computer judges an attack by a day of the battle as it would go.
- The Sitzkrieg as data (`standstill`): the computer does not attack in the west before 10 May 1940.
- After the historian's after-check (`docs/pruefer/`, verdict "fix first"): no region crosses a border of today, so
  the lines of 1939-45 are region borders (Viipuri is the land ceded in 1940, northern Bukovina and Bessarabia are
  their own regions, Wilno, southern Dobruja); the First Vienna Award is cut (Kassa Hungarian); plans name land by
  `lands`; the Treaty of Craiova; the French reserve and the Red Army start as unready as they were; Tetuan for
  Tangier; names of 1939 for a dozen towns; forts moved to where they stood.
- After the aesthete's review: three bugs mended (the title page on small phones, a question's "No" falling through
  to the button under it, harness runs overwriting the saved war); the player's armies are paper with a band of his
  colour; names give way to armies; the selection is one gold line; the map cannot be zoomed out past its edge.

- After the player's review ("fun to take Poland; no way in, battles unseen, no warning"): a note on the first morning
  that says what to tap; an alarm when the enemy takes the player's land and a word when he takes land; the whole
  way of a march drawn; a battle's sign over everything; armies' signs that step aside instead of lying on each
  other; strength and readiness named; a held finger explains factories, points and works and what a division
  costs; a notice when a decision waits and when a division is raised; every production line gets an even share;
  notices fade also while the clock stands; slower clock speeds; states' names on the map from afar.

**Measured** (the computer alone, seeds 1 to 4; with the even industry, seeds 1 and 2: Poland 27 and 30 September
1939, France 4 and 30 August 1940, Germany capitulates in December 1942 and in April 1944)
- Poland capitulates 26 to 30 September 1939 (historically 6 October).
- The Winter War ends with a peace in the first days of January 1940 (historically 13 March).
- France falls 27 July, 6 August and 23 August 1940 in three runs, 10 May 1941 in one (historically 22 June 1940).
- The east: the Soviet Union capitulates in 1942 in three runs (March, March, September); in one Germany does
  (October 1942). **The Red Army of 1941-42 is too weak against armour and the war still far too short.**
- A simulated day costs 1.5 to 3.4 ms. 14 tests, no failures.

**Deviations named by the historian and left for now**
- The Second Vienna Award's line is not cut (the regions of Oradea and Cluj stand for it); Zaolzie, Petseri, Abrene
  and Salla are drawn with their neighbours; Tangier with the Spanish zone; Danzig German from the first morning.
- When Germany attacks the Soviet Union its allies are drawn in, Bulgaria among them, which never fought the Soviets.
- Finland's entry in 1941 is logged as joining the Axis; it was a co-belligerent.
- Spelling is not yet by one rule (Lodz and Lwow beside Rzeszów and Győr; Liège, Luxembourg). `air`, `navy`, army
  quality and the Soviet strength of September 1939 are filled in, not sourced.
- From the player's review, still open: the list of states does not scroll (it ends after about eleven); towns keep
  their English names in the German game (Munich, Warsaw); the title page has no picture and the menu no help; on a
  360 dp phone the head takes too much of the screen; nothing new appears when zoomed in close; there is no goal on
  the screen beyond the end of the war.
- Declaring war still sits on every row of the States page; the aesthete wants it behind the state's own sheet with
  what follows from it. The far view still shows armies as many small squares.

## Next, in this order

1. **Android**: the launcher module and a workflow that builds the APK on a button press, so the author can play on
   his phone.
2. **Balance of the long war**: the east must take years, not months (Soviet anti-tank guns and tanks from 1941,
   reserves, the winter of 1941, German manpower).
3. **The west comes back**: the United States (off the map, arriving in Britain), landings by the computer, Italy's
   change of side, liberation of a capitulated ally's land.
4. **A first lesson** for a new player (what to tap, in a year of Poland), and a fronts order so a player does not
   move every division by hand.
5. Fleets and air forces as pieces; research; the remaining languages; music and sound.
