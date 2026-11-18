# What was learned -- for the next chat

Written 15 November 2026 by the chat that built the battle's figures and movement. Practical knowledge, the things
that cost an hour each; the rules themselves are in `CLAUDE.md`, the design in `docs/`.

## The figure workshop (`tools/figuren/`)

- Battle figures are rendered from a voxel model in code (the author, 14 Nov: allowed, historiker before and after).
  `levy.py` builds a troop from its `TROOPS` dict (helm, body, tunic/tunic2 per pale, shield, heater_fess/charge/barry,
  pavise, crown, royal_helm, visor, chanfron ...); `sets.py` gives a weapon family its sets; `levy_run.py full` renders
  every set in 4 directions; `export_atlas.py` writes `data/figuren/<troop>.txt` (GENERATED), `repack_atlas.py` packs it
  into one xz blob (half the size, the same pixels).
- Long thin things (spears, bows, strings, crossbows) are **lines drawn after the render**, depth-tested in the render's
  own camera (`lines_draw`). Since 15 Nov there are also **slabs** (`slabs_draw`): a flat board set in the world, so a
  planted pavise stands while the man moves behind it. Anything attached to the voxel body is posed with the body.
- World units: the man stands at about (64, 0, 64), +z towards the foe, +y up; some 70 units a metre.
- A render takes 30-60 min for foot, about an hour for a rider, one CPU each and 1-1.5 GB of disk while it runs.
- Render queue: `queue2.sh full:KEY ...` (resumable: it skips `data_done_KEY`), `autoexport.sh` exports and commits each
  finished troop. A background task lives at most 2 hours; start the next run when one ends. Two runs side by side fit
  (4 cores); disk is the limit -- delete old frame folders.
- `autoexport.sh` cannot rebase while the working tree has uncommitted changes: commit before a render finishes.
- A quick look at frames without a full render: render chosen frames only (see the pavise test of 15 Nov in the
  history), or read an atlas back into a contact sheet (its format: `palette`, `frame` lines with '@', `blob` lines).

## The battle (`schlacht/`)

- **Picture vs field.** The field (`schlacht/sim`) decides; the picture (`AtlasFigures`, `SchlachtGame`) only shows.
  The field's facing is 0 up the screen with the vector (-sin, cos); reading it as (cos, sin) turned every standing man a
  quarter off (fixed 15 Nov).
- Body positions follow the field through a critically damped spring -- solve it **exactly** per step; an Euler step
  overshoots at long steps.
- A troop loaded in the middle of a frame must not dispose the bound palette texture (it turned whole lines black);
  mark it stale and rebuild at the next begin.
- Shooters are drawn standing for 0.7 s from each loose (the field lets them shoot on the move).
- Zoom: whole steps at rest (24/48/72/144 px a metre close up, multiples of the ground's texels), eased continuously
  between them in the ratio (`camera.zoomRate`). A notch counts from where the view is going.
- A watched battle (no player side) has a spectator camera that follows the thickest press.
- **Calibration is measured, not guessed.** `:schlacht-sim:test` holds the historical scenes (Patay, Bannockburn ...),
  the master-general duel (11 of 16 needed), the feint (rash host > 12 m), archers breaking before a charge (2-10 of 12).
  Spacing 1.1-1.25 for all broke them; close-order foot 1.2 m with shooters at 1.4 m holds them.
- Pavisiers: carried, set (4 s after 1 s still), shoot only when set, take up (3.5 s) before moving, leave them when
  falling back (`ballistics.pavise*`). Their figures have `plant` and `lift` sets.
- After a JSON-only change: `--rerun --no-build-cache`, and read the XML, not the exit code.

## Licences decided (the `anwalt`, 15 Nov 2026)

- RVO2 (Apache-2.0): port the source to Kotlin with the UNC copyright line and a change note; never its CC-BY-SA docs.
- Social Force Model: from Helbing & Molnár 1995 / Helbing et al. 2005 only; never open jCrowdSimulator's code (LGPL).
- No licence = no use; GPL/AGPL/LGPL = no use (house rule).
- Licence texts of what is used go **into the APK's licence page**, not only into `LICENSES.md`.
- Methods are free, expression is not (§ 69a Abs. 2 UrhG): an unlicensed repository may teach a way of working, rebuilt
  in our own words and code, never copied. Sound effects: synthesise them in code, or one by one from pixabay.com with
  the page noted; never a bundle of someone else's, never an MP3 in the repository.

## Around the work

- Buffer's access token was rejected on 15 Nov and renewed by the author the same day in the environment's settings
  (HTTP 200 again). If it fails again: tell him where to renew it, never ask for the secret in the chat.
- Video tools: `quellen/awesome-claude-video-skills/skills.json` lists some 500 with their licences (MIT 336, Apache 31,
  AGPL 11 -- not for us, none or unclear 122). The list is a map, not a licence: the `anwalt` checks each one taken.
- Every promotional video is checked by `tools/promo/pruefe_video.py` before it goes out (held pictures, black,
  silence, loudness). Ideas taken from the video list for later: step cards ("step 5 of 9") for lessons, a quill
  stroke drawing itself under what is new in a patch, a dated time line in gold on dark for history. Never: other
  people's figures, AI faces, real persons, pictures copied from another game.
- The scratchpad and the container are lost when a session ends: what must last goes into the repository.

## Added later on 15 November 2026 (the battle chat, for the render helper and every later chat)

**The figure workshop, in practice**
- `tools/figuren/render_work.sh WORKDIR KEY ...` renders whole troops (two at once by default, `MAXJ`), riders on the
  larger grid by themselves; `tools/figuren/export_work.sh WORKDIR KEY ...` beside it writes each finished troop's
  atlas, commits it and pushes it at once. Both need a python with numpy, pillow and scipy (`FIGPY`):
  `python3 -m venv ~/figvenv && ~/figvenv/bin/pip install numpy pillow scipy`. Keep WORKDIR outside git.
- A background command lives two hours here: a long queue is killed and must be started again; it resumes (it skips
  every `data_done_KEY`). Disk is the limit (some 5 GB free): `export_work.sh` deletes a troop's frames once exported.
- A quick look without a full render: `newtest.py` (idle frame S and E of foot troops) and `ridertest.py` (a rider's idle
  and charge) -- copies are in the battle chat's scratchpad; they are thirty lines each, rebuilt from `levy_run.py`.
- Weapons and families (`sets.py`): spear with shield (thrust only), `pole` (one spear in both hands: schiltron, pike,
  Swiss), `axe` (cuts, chain of over- and undercut, carried upright), `javelin` (its `shoot` set is the throw; the field
  throws javelins already, `weapons.javelin`), `sparth`/`halberd`/`longsword` (two hands), bow, crossbow (pavise:
  `plant`/`lift` sets), `lance` for riders (`cavalry.py`; `stirrups` long/short/none, `bareback`, `lance_len`,
  `rider_shield`).
- Parts in `levy.py` worth knowing: coif, shelom, lamellar, teardrop and Baltic and adarga shields (`shield_shape`),
  `shield_red`, `shield_pale`, brat, sarro, knife, `aketon_long`, `leine`, beard full/moustache, bolt quiver, dark
  quiver. A troop with `shield='none'` has no buckler (it had one by mistake until 15 Nov).
- `data/figuren/truppen.json` maps a people (the free battle) or an arms prefix (the scenes) to its figures; `variants`
  mixes a levy (four in ten axemen ...); `loose` is when the shot or the thrown dart leaves, in ms.
- The historian's pre-check of five peoples is `wissen/historiker/kulturen_1336_1380.md`; every new figure goes to the
  historian before and after, and his "detail" findings may be named and left.

**Videos and posting**
- The promo folder with all finished videos is in the scratchpad of the session's first working directory
  (`/tmp/claude-0/-home-user-Grand-strategy-game-/<session>/scratchpad/promo`), not the later one; `PROMO_DIR` points
  there. `tools/promo/remake.py` rebuilds a lost video from its queue entry (some 9 min each).
- `daily_buffer.py` (with `--dry` first) schedules the next 60 hours on YouTube and Instagram; `bufplan/skip.txt` in the
  promo folder names channels left out -- TikTok since its account was banned on 15 November (do not retry there).
- Update videos and tutorial trailers are 9:16 (1080x1920), every word and arrow inside SAFE (x 70-880, y 250-1440):
  Instagram, Shorts and TikTok lay their name, caption and buttons over the rest (the author's screenshot). Calm, with
  dissolves (`PACE`, `XFADE`); `tools/promo/pruefe_video.py` checks a video before it goes out.
- The way an update goes out: the campaign chat writes "Update bereit" in `aufgaben/schlacht_und_videos.md`; the
  battle chat makes the video, gives the author the AAB of that commit (the Android workflow's artifact on GitHub),
  and posts the video at once.

**Connections** (the environment's, not a chat's: a chat started in the same environment has them)
- PixelLab and Buffer are reached through the environment's proxy (`api.pixellab.ai`, `api.buffer.com`); no key in any
  file. PixelLab showed 0 of 5000 subscription generations left on 15 November: ask the author before any generation.
- GitHub: the repository tools (`mcp__github__*`), no `gh`. Cloudinary uploads by `tools/promo_upload.sh` (its own limit
  rule: a stop file or 90 % use stops all uploads).
- The other chats: `aufgaben/` is where they speak to one another; nothing else is shared between containers.
