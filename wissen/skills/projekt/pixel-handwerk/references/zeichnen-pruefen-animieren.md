# Pixel-art toolkits: a technique digest for code-drawn pixel art

Four MIT-licensed toolkits were read as text (docs, and the core source for its algorithms only).
Nothing was run or imported. Every passage below is a paraphrase. If an idea is ported into our
Python tools, the commit and `LICENSES.md` name the project and its MIT copyright holder. MIT
requires the notice only when substantial code is copied, but naming it costs nothing.

Our yardsticks: no image file in the repo, text atlases written by `tools/*.py`, one palette
(`tools/palette.json`), figures from PixelLab only, a norm-check command, 36x36 code glyphs
(`#` lit, `+` shade, `o` outline, `r` side rim), light from the upper left, flat two-tone shading,
and a manuscript look.

---

## 1. The four toolkits

**pixel-plugin** (`pixel-plugin-main`), MIT, (c) 2025 Brandon Williams. A Claude Code plugin with
four skills (creator, animator, professional, exporter) and five slash commands. It drives a
locally installed **Aseprite** through an MCP server (`pixel-mcp`, about 40 tools: draw pixels,
quantize, auto-shade, dither, frames, tags, export). The server ships as **prebuilt binaries**
(ELF, Mach-O and PE for five platforms) behind a shell wrapper, and it needs a paid Aseprite. Its
value to us is the docs: a dithering-pattern library (checker, 25/75 %, Bayer 2/4/8 matrices,
hatching, stippling), shading and anti-aliasing rules, frame-rate tables and walk/run phase
lists. Conflicts: binaries we may not run; a proprietary editor; an "auto shading" tool whose
styles include "pillow"; retro console palettes; error-diffusion dithering. Read it, don't use it.

**codixel** (`codixel-main`), MIT, (c) 2026 mankidev. One `SKILL.md` and one JavaScript core
(`core/pixel.js`, about 90 KB): buffers, quantizer, background removal, a **bone rig** that binds
pixels to bones, spine bending, procedural scenery (rock height fields, trees, water, sky) and
effects (flame, smoke, explosion, beams). Its main workflow is to take a reference image, remove
the background, pixelate and quantize it, clean it, then rig and animate it. The docs are strong
on discipline: each tone patch needs a reason, banded shading with dither only at band seams,
pixel-perfect lines, and measured motion speed. The core has the best **exact cleanup checks** of
the four (`cleanup`, `smoothMask`, `edgeCheck`, `pixelPerfect`, `selout`, `rimLight`, `colorCount`,
`partAreas`). Conflicts: (a) the reference-pixelation workflow would make figures that do not
come from PixelLab; (b) the docs say its effects are "taken from finished games", so their
provenance is unclear under our rule against anything from other games; (c) its `images/` folder
holds PNG/GIF demos. The algorithms are generic and can be reimplemented. The effects should not
be ported.

**pixel-art-studio** (`pixel-art-studio-main`), MIT, (c) 2026 Gamezxz. A Python/Pillow skill
(`scripts/pixelstudio.py`, `study.py`, `pixelpipe.py`, `lpc.py`). Its loop: write a build script
that draws every pixel, render a preview, critique it against a fixed checklist, and repeat. It
is the closest match to our way of working: Python, deterministic (seeded noise only), the build
script as the source and the PNG only as output. It contains a `stats()` report (colors used,
semi-alpha count, isolated pixels, near-duplicate colors), a style analyser (dither score,
dark-edge share, hue-bucketed ramps), an import cleanup pipeline (grid recovery, alpha hardening,
despeckle, color dedupe, dehalo, palette lock) and an animation timing table. Conflicts: its
"hybrid pipeline" invites any image model (it names several besides PixelLab); outputs are PNGs
written into `./pixel-art/<slug>/` in the working tree; built-in third-party palettes (PICO-8,
Endesga 32, ...); the LPC layout (fine) next to the warning that real LPC art is CC-BY-SA/GPL
(never ours). Its "learning" mode writes into the skill folder.

**claude-pxl** (`claude-pxl-main`), MIT, (c) 2026 crsolver. A TypeScript/Node DSL (`.px.js`
files) in which sprites are **grid strings of one-character palette keys** plus ops (rect, circ,
line, poly, dither, grad, noise, shade/light along ramps, stamp, scatter, tilemap), with a live
browser viewer, sheet/JSON export and an `ascii` command that prints an asset with x/y rulers.
It has the cleanest **ramp-indexed shading model** (`ramps("kDdu")` defines ramps; `shade`/`light`
step a key along its ramp inside a region). It also has normal maps from shape (`bump`: dome,
bevel, luma, using a chamfer distance transform), a Terraria-style light grid, and glow. The
grid-string format is nearly our text-atlas format. Conflicts: lighting and color-mode glow
multiply RGB and leave the palette (the docs say so); a built-in 3x5 bitmap font (our rule is SIL
OFL fonts only); Node tooling. Its ideas port well to Python.

---

## 2. Techniques worth adopting

### (a) Drawing primitives and shading in code

- **Shifted-shape cel shading** (pixel-art-studio). Fill the whole silhouette in the dark tone,
  then draw the same shape in the lit tone shifted one or two pixels toward the light, clipped to
  the silhouette. The shadow crescent then appears on the lower right by itself. *Glyphs:* fill
  with `+`, restamp the shape at (-1,-1) clipped as `#`. This gives an upper-left-lit two-tone
  shape in one rule, so no glyph needs hand shading.
- **Shading as a ramp step, not a new color** (claude-pxl `shade/light`, `shade:` layers).
  Palette keys belong to ordered ramps; to shade means to move a key one step down its ramp
  inside a region; a cast shadow is a polygon layer that steps everything under it down once.
  *Us:* give `palette.json` explicit ramps (`["outline", "shade", "lit", "highlight"]` per
  material). The code-drawn far battle figures and the importer can then shade by index, and no
  color can leave the palette.
- **Selective outline in two tones** (codixel `selout`). An outside outline pixel takes the "lit"
  outline color when the sprite lies on its far side from the light (that is, it sits on the
  upper-left edge), and the dark color elsewhere. Both colors come from the sprite's own ramp,
  not black. *Glyphs:* the `o` ring could take a lighter `o` variant on the top and left edges,
  which is softer and closer to a manuscript ink line than a uniform dark ring. Try it as an
  option on a few signs.
- **Rim light on the lit edge** (codixel `rimLight`). Every sprite pixel whose neighbour toward
  the light is transparent moves one ramp step lighter. Apply it before the outline, otherwise
  the rim lands on the outline. *Glyphs:* this is exactly where a `#` edge reads well; our `r`
  (side color) rim is a different, team-colored use of the same edge set.
- **Light-side outline repaint** (pixel-art-studio). After an inside outline (selout), repaint
  the outline pixels on the top and left edges in the material's mid tone so the form pops.
  This is the inside-outline version of the two points above.
- **Pixel-perfect lines** (codixel `pixelPerfect`). In a one-pixel line mask, delete the corner
  pixel of every L-shaped step: a pixel with exactly one horizontal and one vertical neighbour,
  where the diagonal between them and the pixels beyond are empty. Diagonals then run corner to
  corner. Bresenham never doubles; hand-placed pixels do. *Glyphs/far figures:* run it on spear
  shafts, lance lines, banner poles and bow strings drawn in code.
- **Line color fixed, one ramp step from its surround** (codixel). A seam or crease that takes
  "one step darker than whatever is below" changes color at every band edge and reads as dashes.
  Give each line one fixed key.
- **Anti-aliasing rules** (all three docs agree). Use none at 16 px and below. At 32 px, only on
  the two or three worst curves. One AA pixel per stair step, never two stacked. AA only between
  two color regions, never against transparency (it haloes on any other background). Fix the
  step rhythm before reaching for AA. *Us:* our flat two-tone look and 36x36 glyphs should carry
  **no AA**; a norm check can forbid colors that are not on a ramp.
- **Dithering rules** (pixel-art-studio, codixel, plugin). Dither only in a narrow strip (two to
  three pixels) where two bands meet, never across a whole area, never on sprites under about 24
  px, and never on moving parts (it shimmers). Bayer 4x4 for seams; the plugin lists the matrices
  (2x2 `0 2 / 3 1`; 4x4 and 8x8 by recursive expansion). *Us:* the manuscript look wants
  hatching rather than dots: the plugin's single-direction and cross **hatching** patterns
  (every fourth column dark) suit parchment, sky or a shaded wall in a code-drawn scene far
  better than Bayer.
- **Implied detail at small size** (pixel-art-studio). Two dark pixels side by side make a belt;
  one light pixel under the eye makes a cheek; if a feature needs more than three colors at
  16 px, cut it. 45-degree diagonals (1:1 steps) are the cleanest.
- **Shape from distance to edge** (claude-pxl `bump` dome/bevel). A chamfer distance transform
  (step 1 orthogonal, sqrt 2 diagonal) of the mask gives each pixel's depth. A circular profile
  over it gives a dome; a ramp over the first `w` pixels gives a bevel. Lighting the slope from
  the upper left then splits lit from shaded. *Glyphs:* compute the dot product of the normal
  with (-1,-1) and threshold it at 0 to get `#` versus `+` automatically for round signs
  (shields, helmets, coins). Use `bevel` for flat plaques and buttons.
- **Flat versus round** (codixel). Never dome-light a flat thing (banner, parchment, cloth, a
  leaf): it goes puffy. Its tones come from its own pattern, folds and overlaps. *Us:* banners
  and parchment in code get fold bands, not normal shading.
- **No filler noise; every mark has a cause** (claude-pxl, codixel "Order"). No random speckle
  on plaster or walls; marks follow structure (courses, joints, rain streaks under ledges, wear
  along boards). Noise only where the material is itself granular (gravel, sand), and sparse.
  Fits a manuscript look exactly.
- **Symmetry: write half, mirror, then break it** (claude-pxl `mx`, `mx:"c"` for an odd width
  with a shared centre column; pixel-art-studio). *Glyphs:* author half of a symmetric sign in
  the script, mirror it, then let the light break the symmetry (lit left, shaded right).
- **Material recipes** (pixel-art-studio). Metal: high-contrast ramp, a hard one-pixel specular
  line on the lit edge with the darkest tone right beside it, no dither. Wood: grain strokes every
  three to five pixels, hue toward orange. Stone: flat base with a few short crack contours.

### (b) Cleanup and automatic checks (for the norm)

Exact definitions as found; "N" means 4-neighbours (up, down, left, right), "N8" adds diagonals.
These can go almost unchanged into the norm's check command, with a pass or fail per sprite.

1. **Isolated (alpha-orphan) pixel** (pixel-art-studio `stats`). An opaque pixel with no opaque
   N. Allowed only when whitelisted (glint, spark). *Norm:* fail with coordinates.
2. **Small components** (pixel-art-studio `despeckle`). 4-connected opaque components smaller
   than `min_cluster` (2 removes single pixels; 3 or 4 for noisy sources). *Import:* run it
   after alpha hardening. *Check:* count components; a figure should be one component
   (plus whitelisted detached parts such as a thrown spear).
3. **Color orphan** (codixel `cleanup`). An opaque pixel whose color appears in none of its N8,
   whose opaque N exist, and whose majority N color lies within a tolerance (default 60 in RGB
   Euclidean distance) gets replaced by that majority color. A pixel far from its neighbours
   (an eye, a highlight) is kept. After dithering, use a tolerance of 20 or less. *Import:* a
   better cleanup than despeckle for PixelLab speckle inside the figure.
4. **Silhouette defects** (codixel `edgeCheck`). Exact rules: **nub**, an opaque pixel with at
   most one opaque N; **strip**, an opaque pixel with exactly two opaque N on opposite sides (a
   one-pixel-wide run); **hole**, an empty interior pixel with at least three opaque N. *Norm:*
   holes must be zero (they are outline leaks); strips are legitimate for spears and reins, so
   allow them only inside a declared thin-part mask.
5. **Silhouette smoothing** (codixel `smoothMask`, up to four passes until stable). Erode with
   N (keep a pixel only if it and its four N are set), then keep only original pixels that
   touch the eroded core (an opening). Remove pixels with at most one N, or with only a
   left-right or only an up-down pair. Fill empty pixels with at least three N. Clean each
   overlapping part's mask separately, or the cleanup cuts gaps where parts overlap. *Import:*
   run it on the alpha mask before the outline is closed.
6. **Near-duplicate colors** (pixel-art-studio). Two used colors whose largest channel
   difference is 12 or less count as duplicates; dedupe merges each into the most used one
   (tolerance 10, 12 to 16 for aggressive). *Norm:* after mapping to `palette.json` this should be
   impossible, so make it a check on the palette itself (no two entries within 12).
7. **Color budget and use** (pixel-art-studio budgets; codixel `colorCount`). Small props and
   icons 4 to 6 colors; characters 8 to 12; big sprites 12 to 16; tall 48 to 64 px heroic figures
   14 to 20. Codixel's extra rule: most of each ramp should actually be used, and no single color
   should cover more than half the object. *Norm:* we already cap at 20; add "no color over 50 %
   of opaque pixels" as a flatness warning and "ramp coverage" as information.
8. **Semi-alpha** (pixel-art-studio). Count pixels with 0 < alpha < 255; it must be zero
   (`harden_alpha` snaps at threshold 128, or quantizes to a few steps for painterly edges).
   *Norm:* fail if above zero.
9. **Halo** (pixel-art-studio `dehalo`, opt-in). An opaque edge pixel (touching transparency in
   N) whose HSV saturation is at most 0.10 and whose value lies between 0.15 and 0.85 (a grey
   fringe from a former background) gets the average of its opaque N. *Import:* use it on PixelLab
   and AutoSprite frames before palette mapping, or report the count as a warning.
10. **Outline closure / dark edge share** (pixel-art-studio `study`). The share of silhouette-edge
    pixels (opaque with a transparent N or the border) whose luminance (0.299R + 0.587G +
    0.114B) is under 0.25. *Norm:* closure means 100 % of edge pixels belong to the outline set.
    Also test N8: a transparent pixel diagonal to an interior (non-outline) pixel is a corner
    leak. claude-pxl's `outline8` and codixel's `corners` option fill diagonals. Choose 4- or
    8-connected outlines once and check that choice; flood fill leaks through diagonal-only gaps.
11. **Dither score** (pixel-art-studio `study`). The share of fully opaque 2x2 blocks that form
    a checker (a == d, b == c, a != b). *Norm:* our flat style expects about 0 %; a PixelLab
    result above a few percent is flagged for a look.
12. **Pillow shading** (named by all; the checklist test). Pillow means the darkest tone hugs
    the outline all the way round. *Proposed metric (ours, built on their definition):* among
    interior pixels adjacent to the outline, take the share in the darkest shade on the
    **upper-left** half versus the lower-right half. With light from the upper left the lit side
    should be mostly light tones; a ratio near 1 means pillow.
13. **Banding** (pixel-art-studio). Shade bands one pixel wide that run parallel to the outline
    make a staircase. *Proposed metric (ours):* compute each pixel's distance to the edge; if
    rings 1, 2, 3 are each made mostly of a single, different ramp step, the shading is banding.
14. **Jaggies** (pixel-art-studio). Along a curve the run lengths should change monotonically
    (1,1,2,3), not jump (1,3,1). Doubled corners are what pixel-perfect removes. *Check:* walk
    the outline contour, collect horizontal and vertical run lengths per octant, and flag any
    run that is shorter than both its neighbours while one of them is at least 3 (a 1,3,1
    pattern); see also item 4 of (a).
15. **Silhouette and value readability** (pixel-art-studio checklist, plugin). Render the mask in
    one dark color on a light ground and check it still reads as the subject. The subject's
    midtones must differ in **value** from the background's (hue carries mood, value carries
    reading). *Norm:* write a one-color silhouette atlas preview, and compute the luminance gap
    between the figure's outline and lit tone and the battle ground tones.
16. **Repeated parts of equal weight** (codixel `partAreas`). Visible areas of repeated parts
    (legs, banner tails, petals) should be within about 15 % of each other, because the part
    drawn last covers the others.
17. **Step did something** (codixel). After each transform (outline, rim, cleanup), count how
    many pixels changed and where. Zero, or changes on the wrong part, means the step failed even
    though the code ran. *Norm:* log a changed-pixel count per import step.
18. **Grid recovery for resampled input** (pixel-art-studio `detect_scale`, `estimate_scale`,
    `block_downscale`). First try exact integer scales (downscale by nearest neighbour,
    upscale again, compare bytes). If none fits, estimate the scale from the median run length
    of similar colors (channels within 24) and take the **modal** color of each block (colors
    bucketed to 5 bits per channel, averaged inside the winning bucket; transparent if most of
    the block is). *Import:* useful if a PixelLab or AutoSprite frame arrives upscaled or
    resampled.
19. **Order of cleanup** (pixel-art-studio `clean`). Flatten, harden alpha, despeckle, dedupe
    colors, dehalo, then lock to the palette. Palette remapping must remap pixels, not replace the
    table (the plugin warns about exactly this mistake).

### (c) Animation

- **Timing table** (pixel-art-studio; the plugin's agrees). Idle: 2 to 4 frames at 200 to 400 ms,
  ping-pong. Walk: 4 frames (6 for a finer cycle) at 100 to 150 ms. Run: 6 to 8 at 60 to 100 ms.
  Attack: 3 to 6 frames with windup 100 to 150, strike 40 to 60, impact hold 80 to 120 and recovery
  100 to 150 ms; the unevenness is what makes the blow land. Hurt: 2 at 60 to 80. Death: 4 to 6 at
  100 to 150. Put the long hold on the pose the eye should keep. *Us:* compare AutoSprite timings
  with this, and set code-drawn far-figure cycles from it (in `data/` JSON, not Kotlin).
- **Walk construction** (pixel-art-studio). Contact (lowest), passing (highest, +1 px), contact
  mirrored, passing mirrored. Stride ±2 px at 32 px, ±4 at full height. The head follows the
  body one frame late.
- **Smear frame** (pixel-art-studio LPC notes). In a slash, the weapon moves about 90 degrees
  over the swing frames, with a one-frame smear or arc on the fastest frame only.
- **Squash and stretch in whole pixels** (pixel-art-studio, plugin). One to two pixels wider and
  shorter, redrawn parametrically, never scaled. Anticipation is one or two frames in the
  opposite direction. Impact is a held contact frame plus a one-pixel shift of the whole sprite,
  or a one-frame palette flash.
- **Oversized action cells and a stable pivot** (pixel-art-studio). Size an attack's cell from
  the union bounding box of all its frames (weapon tip at full reach and trails included) plus a
  margin of at least 2 px. Keep one cell size per action; never recenter single frames; store
  `frame_w/h` and the pivot (feet) per action. *Norm check:* overlay the frames on the pivot,
  verify the feet do not drift, and fail if any opaque pixel touches a cell border (a clipped
  spear tip). This is directly relevant to the spear bearer and the lance drawn in code.
- **Secondary motion lags one frame** (pixel-art-studio). Cape, banner, plume and tail copy the
  body's offset from the previous frame.
- **Moonwalk and pop checks** (pixel-art-studio, codixel). The ground distance a figure covers
  per cycle must equal its stride, or the feet slide. Codixel measures the share of pixels that
  change between frames in each region: a calm area above about 20 % per frame is moving too
  fast, and a single-frame spike is a pop. It also checks the last frame against the first for a
  seamless loop. *Us:* a cheap harness check for battle animations and film loops.
- **Seamless procedural loops** (claude-pxl `phase`, codixel `loopNoise`). Drive cyclic motion
  from phase = frame / frames through sine, so frame N meets frame 0. Make every repeating
  element complete a whole number of cycles per loop. Keep durations on a shared grid (multiples
  of 100 ms) so composed loops stay short (the least common multiple).
- **Real gait data for horses** (codixel). A walk has four beats (left hind, left front, right
  hind, right front), each foot down about 60 % of the cycle; a trot moves diagonal pairs,
  each down about 40 %; a supporting leg is straight and the fetlock sinks; a lifted foreleg
  folds its hoof back under the knee. Choose the gait from the speed. Useful for checking our
  horse skeleton.
- **Bone ownership map** (codixel `Rig.ownerMap`). Before animating, render each pixel tinted
  by the bone that owns it and check shoulders and hips. This applies to the horse-and-rider
  skeleton work.

### (d) Palettes

- **Hue-shifted ramp construction** (pixel-art-studio `ramp`; codixel `hueRamp`). Work in HSV
  or HSL. Darker steps rotate their hue toward blue (240 degrees) and lighter steps toward
  yellow (60 degrees), by an amount that grows toward the ends (pixel-art-studio: 14 degrees
  default, 8 for muted or realistic work, 25 for vivid; codixel's 60 degrees is too strong for
  us). Saturation peaks at the midtone and falls toward the light end; value steps are 15 to
  25 % apart (closer reads as mud at 1x). Keep the base color as the middle step. *Us:* a
  `palette.json` check that each ramp's shade is cooler and its light warmer than its base, and
  that steps are at least 15 % apart in value.
- **Muted for realism** (codixel). Real materials are far less saturated than colors picked by
  feel (about 0.2 to 0.4 saturation for earth, stone, water and sky), and light ends stay well
  away from white. This fits a manuscript palette.
- **Shared darkest step** (pixel-art-studio). Materials can share their darkest tone, which is
  also the outline color; this is the biggest palette saving.
- **Ramp from measured colors** (codixel `hueRampFrom`). Take a circular mean hue weighted by
  saturation, the median saturation and the lightness range of a few sampled colors, then
  rebuild a clean hue-shifted ramp instead of using raw samples. *Us:* derive ramps from a
  public-domain manuscript reference's pigments.
- **Palette swaps by fixed index ranges** (pixel-art-studio, claude-pxl `swap`/`base`). Give each
  material a fixed range of slots (for example 0 to 4 body, 5 to 7 accent), so a side or culture
  variant is a key-for-key swap. *Us:* our `r` side rim and any heraldic tincture field should be
  swap keys, so one plate serves every side.
- **Nearest-color metric** (pixel-art-studio). Weighted RGB distance 30·dR² + 59·dG² + 11·dB²;
  cheap and better than plain RGB for palette mapping. (CIELAB would be better still.)

### (e) Sprite sheets and layers

- **Padding of 1 to 2 px between frames** (pixel-art-studio, claude-pxl `pad`) against texture
  bleeding. *Us:* relevant wherever libGDX samples the atlas texture with filtering or mipmaps.
- **Frame metadata Aseprite-style** (both): per-frame duration and named frame tags with a
  direction (forward, reverse, ping-pong). *Us:* the text atlas can carry the same fields in its
  header (tag, from, to, direction, ms, pivot).
- **Direction order and baseline** (pixel-art-studio LPC). Rows in the order up, left, down,
  right; the feet baseline at a fixed y in the cell (58 in a 64 px cell). Draw each direction on
  its own, not mirrored, when the figure is asymmetric (weapon hand): left and right are true
  mirrors only for symmetric figures. Take the layout convention only, never LPC art.
- **Parts that are not exported** (claude-pxl `_name`). Reusable sub-plates (eye, buckle, shield
  boss) carry a prefix and are only stamped. *Us:* glyph sub-parts in `schlacht_glyphs.py`.
- **Post-processing order** (claude-pxl). Mirror, then swap, flip, rotate, outline (which grows
  the canvas 1 px on each side), then crop. Codixel warns that an outside outline shifts every
  coordinate by one, so pivots measured before the outline are off by one afterwards. *Us:*
  measure the seat and pivot after the outline, or correct by +1.
- **Body-part layers for puppeting** (pixel-art-studio). Legs, torso, head and cape on separate
  layers, animated by shifts; static layers shared (linked) across frames.
- **ASCII view with rulers** (claude-pxl `pxl ascii`). Printing an asset as its palette keys with
  x and y rulers is cheaper and more exact than a picture for pixel fixes. *Us:* the norm check
  can print a failing region of the text atlas with rulers and the offending pixels marked.

### (f) Readability at small sizes and icons

- **The 1x test** (pixel-art-studio, codixel). Judge the sign at true size, on a plain ground,
  next to the zoomed view. If it cannot be named at a glance, it fails. *Us:* render each 36x36
  glyph at 1x and at the phone's dp size in the harness preview.
- **Read by silhouette alone** (pixel-art-studio). Icons of 16 to 32 px use 4 to 6 colors and are
  recognised by outline: sword is a long diagonal, bottle is body and neck, key is ring and teeth.
  One highlight cluster at the light corner, nothing more.
- **One defining silhouette device, plus two or three material cues** (pixel-art-studio
  tall-figure study). Each class reads through one shape (a helmet type, a polearm head, a long
  coat) rather than small internal details. *Us:* the rule for telling the 147 troop signs and
  the far figures apart: spear head, kettle hat, crossbow stock, mail hood, lance pennon.
- **Silhouette breaks beat interior detail** (pixel-art-studio). A weapon over the shoulder or a
  plume reads better than painted detail inside the shape.
- **Clusters, not noise** (pixel-art-studio). Same-color areas of at least three pixels; single
  pixels only as glints.
- **Thin parts keep their width; repeated parts are separated by a gap or crease; joined parts
  must touch** (codixel). At 1x two leaves (or two pikes) that overlap along their length merge
  into one disc.
- **Smallest canvas that holds the design** (pixel-art-studio). Detail invisible at 1x is wasted
  and hurts reading.
- **Integer scale and nearest-neighbour only** (all four). We already draw at whole pixels.

---

## 3. Not for us

- **pixel-mcp binaries and Aseprite** (pixel-plugin): prebuilt executables we may not run; a
  proprietary paid editor; it adds nothing that our Python scripts cannot do.
- **Pixelating reference photos or artwork into figures** (codixel's main workflow): our figures
  come from PixelLab only; code-drawn figures are allowed only at the zoomed-out battle stages.
  Its sample images and "send me a picture" step also risk third-party art.
- **Codixel's effects** (nova smoke, breath, hell fire, beams): the docs say they are taken from
  finished games, which fails our rule against anything from other games. The generic flow-field
  method (a shape profile times rising noise, thresholded, colored in bands) may be rebuilt from
  scratch if ever needed; the specific effects should not be copied.
- **pixel-art-studio's hybrid pipeline with other generators**: only PixelLab (and AutoSprite for
  animating PixelLab figures) is allowed. The cleanup steps are fine; the invitation to other
  models is not.
- **PNG and GIF outputs in the working tree** (pixel-art-studio `./pixel-art/<slug>/`, claude-pxl
  `out/`, codixel saving into the project): no image files in the repo; previews belong in a
  cache outside git.
- **Third-party palettes** (PICO-8, Endesga 32, Sweetie 16, DB16, C64, NES, Game Boy): we have one
  palette of our own.
- **LPC art** (only the layout convention is usable; the art is CC-BY-SA/GPL).
- **claude-pxl's lighting grid and color-mode glow**: they multiply RGB and leave the palette.
  Glow's `ramp` mode, which stays in the palette, is acceptable for torches or a signal fire.
- **claude-pxl's built-in 3x5 font**: fonts must be SIL OFL.
- **Floyd-Steinberg and other error-diffusion dithering, whole-area Bayer dither, random speckle
  noise**: they fight the flat two-tone manuscript look and shimmer when the figures move.
- **Auto-shading with a "pillow" style** (pixel-mcp): pillow shading is the defect we check for.
- **Importing or running any of the code**: the ideas are reimplemented in our own `tools/*.py`,
  and the source project is named.
