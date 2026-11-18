# wissen/ -- what every chat may reach

The author, 15 November 2026: *"Packe alle die Repos auch von gestern mit all deinem Wissen in einen Ordner, wo jeder
Chat drauf zugreifen kann, wenn er es braucht, der Zugriff auf das Repo hat. Auch mit allen Agenten und allen Skills,
und kommt was dazu, packe es da auch rein."*

So this folder is the shared shelf of every chat that works on this repository. **Whatever the author gives later --
a repository, a paper, a tool, a skill -- goes in here too**, by the same rules.

| Folder | What | The truth lives |
|---|---|---|
| `WISSEN.md` | what was learned working on the game: the figure workshop, the renders, the battle, the licences, the traps | here |
| `quellen/` | the source text of the repositories the author gave, those whose licence allows it, with their licence files | upstream (see the table below) |
| `agenten/` | copies of the reviewers: historiker, anwalt, spieler, aesthet | `.claude/agents/` |
| `skills/projekt/` | copies of the repository's skills (render, paket, balance, zeitraffer, pixel-handwerk) | `.claude/skills/` |
| `skills/autor/` | copies of the author's own skills (HUD, pixel art, anatomy, harmony, monetisation, ...) | his account's synced skills |

`tools/wissen_sammeln.sh` refreshes the copies of the agents and skills; run it after one of them changes and commit.
The originals stay the truth -- edit those, not the copies.

## The rules for anything in here

- **No image file** (CLAUDE.md §2): only text is kept -- code, docs, data, licence files. A tool's pictures stay out. **One exception, the author's order of 15 Nov 2026:** the preview images of `quellen/awesome-claude-video-skills/assets/previews/` stay, as reference pictures, because only permissively licensed projects' images are in it and `NOTICE.md` names each one's licence and source. They never go into the game.
- **No personal data**: the copies carry "the author" for his name; the script checks for names and e-mail addresses.
- **The licence decides** (the `anwalt` reads it, every time): MIT, Apache, BSD and the author's own material are
  kept; GPL, AGPL, LGPL and anything without a licence are only listed, never kept or copied from.
- **Kept here is not in the game.** Whoever takes a piece into the game ports it into our own Kotlin, keeps the
  original's copyright line, adds the row to `LICENSES.md` in the same commit, and the licence text goes into the
  game's licence page.

## The repositories, and what may be done with them

| Kept in `quellen/` | Licence | For | `anwalt` |
|---|---|---|---|
| rvo2 | Apache-2.0 (src); its docs CC-BY-SA, not to be copied | ORCA: men stepping aside in a crowd (ported: `schlacht/sim/.../Orca.kt`) | port allowed, 15 Nov 2026 |
| jbump | Apache-2.0 (port of bump.lua, MIT) | box collisions | allowed, not needed |
| dyn4j | BSD-3-Clause | rigid-body physics | allowed, too heavy for foot |
| gdx-ai | Apache-2.0 | steering, behaviour trees, pathfinding (libGDX) | allowed in `core`, not in `sim` |
| ashley | Apache-2.0 | entity-component system for libGDX | allowed |
| wave-function-collapse | MIT | ground patterns from rules (map terrain) | allowed |
| auto-tile-gdx | MIT | edge and corner tiles where grounds meet | allowed |
| procedural-tilemap-lab | MIT (code); its images partly OpenAI-made, not kept | biome recipes, placement, height shading | code allowed, images never |
| pixelorama | MIT | a pixel-art editor (Godot) | allowed; a drawing program |
| pixel-art-studio-a, -b, claude-pxl, pixel-plugin, pixel-art, pixel2motion, codixel, game-assets-enhancer-skill | MIT | pixel-art tools, prompts and skills | allowed as reference |
| platform-engine | MIT | a small 2D engine | allowed as reference |
| figuren-kit | the author's own; `vendor/` MIT | the first prototype of the figure workshop | ours |
| kleiderkammer | the author's own (PixelLab results; images not kept) | the earlier clothing layers -- superseded (CLAUDE.md, 10 Nov) | ours |
| awesome-claude-video-skills (list) | CC0-1.0 (selection and own text); listed projects each their own licence; preview images kept (author's order, 15 Nov 2026) | a map of some 500 video tools (`skills.json` carries each one's licence) for `tools/promo/` | allowed as reference, 15 Nov 2026; every listed project checked on its own before use |

| Only listed, not kept | Licence | Why |
|---|---|---|
| LibreSprite | GPL-2.0 | GPL |
| mcpbytes-pixel-sprite | AGPL-3.0 | GPL family |
| Tiled (editor) | GPL (editor); libtiled BSD-2 | the editor is GPL; nothing to gain for a code-drawn map |
| jCrowdSimulator (and its sample shapefiles) | LGPL-3.0 | GPL family; the shapefiles likely from OpenStreetMap, which is forbidden. The Social Force Model may be built from Helbing's papers alone, without opening its code. |
| Simple-Physics-Engine | none | no licence, no use (§§ 69a, 69c UrhG) |
| long-ago, libgdx-ashley-box2d-example | none found | no licence, no use |
| video-edit-skill | none found (no LICENSE, no licence field, no header; GitHub checked 15 Nov 2026) | no licence, no use. Its methods (cut rules, 9:16 safe zones, the workflow) may be rebuilt in our own words in `tools/promo/` ("Vorbild: video-edit-skill (Methode, kein Code)"); its fonts only fresh from Google Fonts with their real OFL; its Pixabay sound effects not taken (synthesise them, or fetch each from pixabay.com with its page noted); HyperFrames (Apache-2.0) usable as a tool, never its `publish` or login (HeyGen's servers), telemetry off; faster-whisper MIT |
