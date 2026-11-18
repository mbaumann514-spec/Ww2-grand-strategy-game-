# Finis Pacis (working title) — how to work in this repository

Written for whoever picks this up next, including a fresh session of the same assistant. The rules that do not change
between packages, and the commands that prove a package is finished. `docs/ROADMAP.md` is what is built, what was
measured and what comes next.

This game is the sister of *Sacrum Imperium* and was begun on 18 November 2026 on the author's word: *"Build a ww2
game with the data you have and wissen knowledge from Sacrum Imperium, set it in the ww2 repository; do not change
anything about the Sacrum Imperium repo, just look into it for learning."* The sister game's repository is **read,
never written to**. Its standing rules bind this game until the author says otherwise; they are quoted in its
`CLAUDE.md` and in its `zweitspiel/docs/REGELN.md`, and what follows is how they apply here.

## 1. What it is

A historical grand strategy game about the Second World War in Europe, North Africa and the Middle East, from
1 September 1939, for **Android**, to be **sold on Google Play**. Upright (portrait), reviewed at 1080×2400. The
author is not a professional programmer: he decides what the game is; architecture, verification and every licence
judgement are the assistant's job to raise. *"Nichts was ich nicht später einfach verkaufen kann."*

**Still the author's to decide** (asked in the first report, not yet answered): the name ("Finis Pacis" is the lawyer's
proposal and a working title only); upright or landscape; whether the sister game's money model and fairness test
apply; whether pictures of troops (PixelLab) are wanted beside the map symbols.

## 2. The rules

- **Only public-domain sources.** No GPL, no GADM, no OpenStreetMap, no geoBoundaries, nothing share-alike. The map is
  Natural Earth. `LICENSES.md` lists every source in the same commit that brings it in.
- **No image file in the project.** Everything is drawn in code: the map from data, the armies as military map symbols,
  the font as rows of pixels. No AI-generated picture; PixelLab is not used so far and not without the author's word.
- **Fonts only under the SIL Open Font License** (Jersey 10).
- **No sign, slogan, song or speech of the National Socialist or Fascist regimes, and no emblem of any party or
  ideology** — no swastika, runes, fasces, hammer and sickle or red star, anywhere, the store included. Germany is
  field grey, the Soviet Union a plain red. The crimes of the war are not a mechanic and not hidden: the page "About
  this game" says so, and its text is the lawyer's, not to be reworded without him. No real person is quoted or
  pictured; the player is never addressed as a leader. Never the word "NATO": the signs are "military map symbols".
  `docs/pruefer/anwalt_vorpruefung.md` is the whole decision; `SimTest` holds the data to it.
- **Four reviewers, before and after** (`.claude/agents/`): `historiker` (what is right for 1939–45, with sources,
  before anything is built, and the result against it), `anwalt` (every new source, library, name, text, sign), `spieler`
  (plays every package a player sees), `aesthet` (looks at it with fresh eyes). Their findings are fixed or named in
  the commit. Their reports live in `docs/pruefer/`.
- **History is researched first.** Where the sources are thin the gap is filled with what is most plausible and
  **marked** *(filled in)* in the data, the doc and the commit.
- **Symbols before words; a finger held on a symbol gets one sentence** (`hold.*` in `data/text/`).
- **Written in English, shown in the player's language.** English and German so far; every text a player can see is
  added to both `data/text/en.json` and `de.json` in the same commit (`TextsTest`). The sister game's other languages
  are a later package.
- **Private.** No public repository, release, page or link. **Personal data, never**: no name, e-mail, account, key,
  phone number or address in any file, commit or chat output.
- Nothing taken from another game: no text, art, code, map, region division, unit values or names of mechanics.
  Mechanics are free; their expression is not.
- **One package at a time**, and at its end a report: what was built, what is uncertain, what the author should look
  at, every deviation named.
- Performance: 50 fps and more, never under 30. A day's work may be expensive; a frame's may not.
- Generation steps are reproducible scripts under `tools/`; every generated file says `GENERATED` in its first lines.

If a requirement cannot be met without breaking one of these, **say so instead of breaking it.**

## 3. The shape of the code

| Module | What it is |
|---|---|
| `sim/` | Kotlin, JVM only: the rules, the computer's play, saves. **No libGDX.** |
| `core/` | The libGDX game: map, interface, input. |
| `lwjgl3/` | Desktop launcher and the screenshot harness. |
| `android/` | Not there yet (ROADMAP, next). It cannot be built in this environment: Google's Maven is out of reach. |
| `data/` | The map (GENERATED), the rules, the states, the scenario, the seas, the texts, the licence texts. |
| `tools/karte/` | Builds the map of 1 September 1939 from Natural Earth and `regeln_1939.py`. |
| `docs/` | `ROADMAP.md`, and the reviewers' reports in `pruefer/`. |
| `wissen/` | **A copy of the sister game's shelf of knowledge**, whole, as it stood at its commit `a0be23d`, taken on the author's word of 18 November 2026 (*"Nehme alles aus wissen in Sacrum Imperium und kopier das in deinen WW2-Folder"*): what was learned (`WISSEN.md`), the reviewers, the skills, the historian's notes, and the source text of the repositories the author gave, each under the licence its `README.md` names. It carries the sister game's 332 reference preview pictures, the author's one exception to "no image file"; nothing in `wissen/` is ever part of the game. Whoever takes a piece into the game ports it, keeps its copyright line and adds it to `LICENSES.md`. |

- **One clock.** `World.day` counts days from 1 January 1936; everything else is derived.
- **Every number the player feels lives in a commented JSON file** with its reasoning (`data/rules.json`,
  `countries.json`, `scenarios/1939/scenario.json`, `sea.json`); `comment` and `*Comment` keys are stripped when
  loaded. A magic number in Kotlin is a bug. An unknown region id in the data is an error at load.
- **The computer and the player act through the same entry points** of `Game`: `orderMove`, `orderHalt`, `build`,
  `cancelBuild`, `declareWar`, `takeDecision`, `answerUltimatum`. A screen that writes to the world is a bug.
- **Determinism.** Same seed, same orders, same world; a loaded save goes on as the game would have. Chance is a hash
  of seed, day and what is asked (`Game.chance`), never a generator two callers share; nothing iterates a hash map.

## 4. Verification

```bash
gradle :sim:test :core:test                               # the rules and the texts
gradle :sim:headless --args="--years 7 --seed 1 --quiet"  # a war with no screen: the balance instrument
xvfb-run -a -s "-screen 0 1200x2500x24" gradle :lwjgl3:run --args="--screenshot /tmp/x.png --width 1080 --height 2400 --dpi 420 --country GER --days 20 --select breslau --press 'sheet.march;region:lodz'"
~/.venv-map/bin/python tools/karte/bau_karte.py --preview /tmp/karte.png   # rebuild the map (needs shapely, numpy, mapbox-earcut, pillow)
```

- **Read the report, not the exit code**: check `*/build/test-results/test/*.xml` for failures and a fresh time. The
  tests declare `data/` as an input, so a data edit reruns them.
- **The harness is the eye.** Read every picture back; its two lines `tap targets under 48 dp:` and `overlaps:` are
  read like a test. Flags are in `lwjgl3/…/DesktopLauncher.kt`. Small screens too: 720×1520 and 720×1280 at 320 dpi.
- The headless run is read for: states that never fall or fall at once, armies without end, a front that does not
  move, and the microseconds a day costs.
- If Gradle's downloads hang in this environment: the sister game's `zweitspiel/tools/mvnproxy/` is a local mirror.

## 5. Commits

Branch: the one the session is given. Subject: the change, lower case, in the game's voice. Body: why, in prose —
what was asked, what was measured, what deviates. Test counts when they change. **No model identifier** in a commit,
a file or a comment (the first commit carries one in a trailer; history was not rewritten). Never force-push; never
commit build output or an image.
