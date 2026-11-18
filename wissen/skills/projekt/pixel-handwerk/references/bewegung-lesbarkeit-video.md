# Technique digest 2: pixel-art, game-assets-enhancer, pixel2motion

Read as text only; nothing from these folders was run, imported or copied into a project. All three
are MIT. The MIT notice matters only if we copy code or text, and we copy neither: what follows is
ideas, written in our own words.

## 1. The three toolkits

**pixel-art** (Huiyan Wan, MIT 2026; `plugins/pixel-art/SKILL.md`). A Claude skill that has the
model write "pixel" illustrations for READMEs straight as SVG: each pixel is a 7 px `<rect>`, a
character is about 8-10 px wide and 8-12 px tall from a row-by-row body template, and it uses 3-5
colours per figure. It has recipes for speech bubbles and arrows, and a list of layout traps it has
run into. For animation it fades elements in with CSS opacity, steps by staggered delays,
screenshots the result in headless Chrome at a fixed fps and encodes a GIF with ffmpeg in two passes
(palettegen, then paletteuse with Bayer dithering). **Conflicts:** hand-authored sprites break
"every sprite from PixelLab" and the figure norm. Its template characters are cartoon chibis with
fixed skin and hair hexes that are not on our palette. It also uses emoji in text and wants
Node/puppeteer for capture. Only its layout traps and its GIF and fade advice carry over.

**game-assets-enhancer** (Adam Lyttle, MIT 2026; `SKILL.md`). A four-phase recipe for giving a plain
game better art. Phase 0 audits the code and writes a sprite manifest. Phase 1 writes a style guide
with lighting rules. Phase 2 generates every object as its own sprite through fal.ai (the
nano-banana-pro model, with edits that use a "style anchor" as reference), then removes the
background (pixelcut), trims and normalises each one. Phase 3 rebuilds the scene as parallax layers
with deterministic slot-and-hash placement, then adds a "juice" pass. Phase 4 sets layout
conventions and verification steps. **Conflicts:** the whole generation pipeline is a forbidden
generator (fal.ai and nano-banana, and a third-party background remover). Its default style (thick
brown outlines, painterly cartoon, warm undertone in every colour) is not our flat two-tone
manuscript look. Its parallax stack is aimed at side-scrollers. The process rules, the readability
and lighting rules, and the verification steps have nothing to do with the generator, though, and
are the most useful part of this batch.

**pixel2motion** (Nolan Lai, MIT 2026; `SKILL.md`, `references/`, `scripts/`). It turns a raster
logo into minimal smooth SVG, then into a choreographed logo animation in standalone HTML, using
Disney's 12 principles. Each part of the logo becomes its own animated element. Easing and timing
come from three "personality" words through tables. The animation is checked with deterministic
`?t=<ms>` frame capture (Playwright), an easing probe, an ink-pixel continuity sweep and a "Final
Frame Contract" (the last frame must equal the verified still). It exports to MP4/WebM through
ffmpeg. **Conflicts:** the deliverable is web SVG/CSS/HTML, which is not our stack. Its raster
tracer is aimed at logos and must not be pointed at PixelLab art (pixel art should stay pixels). The
docs folder holds third-party logo GIFs and a QR image: we ignore them and copy none. The motion
theory, and above all its QA ideas, carry over well to libGDX effects and to the update and promo
videos.

## 2. Techniques worth adopting

### Motion: timing and easing (pixel2motion)
- **20 : 50 : 30.** A reveal splits its time into anticipation, action and follow-through at
  20/50/30 (a draw-on reveal uses 10/70/20). Use it for a sign popping in, a seal landing on a
  charter or a title card, so the wind-up and the settle are not forgotten.
- **Anticipation is 20-30 % of the action at any duration.** Examples: a `scale(0.96)` dip, or a 1-2
  px move against the coming direction, before the main motion. A coin or seal that "just starts"
  reads as a glitch.
- **Duration bands by context.** Feedback to a tap: 150-300 ms, ease-out only. In-page reveal:
  300-800 ms. Splash or intro: 1200-2000 ms. Idle loop: a cycle of 1.5-4 s. Shorter travel gets a
  shorter duration, and heavier parts move slower. Put these as named values into `data/screen.json`
  (or its Sacrum Imperium equivalent), never as literals in Kotlin.
- **Easing curves worth naming** (cubic-bezier control points, which port to a small Kotlin Bezier
  easing). Ease-out (0,0,0.2,1) and a strong ease-out (0.16,1,0.3,1) for entrances. A "narrative"
  curve (0.34,0,0.14,1): sharp start, soft landing. Overshoot (0.34,1.56,0.64,1) only where the mood
  allows. Linear only for a constant spin, where easing would pulse. Under 150 ms there is no time
  for an ease-in.
- **Pick a preset, don't invent per element.** For our manuscript tone the
  "trustworthy/professional" preset fits (about 700 ms, no squash, overshoot at most 1.0-1.02) or
  "elegant" (about 1600 ms, fades and wipes rather than bounces). Define one set of easing tokens
  and reuse it for every reveal, loop and tap reaction, so the game moves in one voice.
- **Stagger, never lockstep.** Parts start 10-20 % of their own duration apart, ordered by a drag
  hierarchy: main mass first, then primary parts, then accents. Keep a whole cascade under about 700
  ms; with many items (a row of signs, a list of provinces) shrink the stagger, not each item's
  duration. Two parts starting and stopping on the same frame is named the most common
  mechanical-motion mistake.
- **Follow-through.** Overshoot slightly (about 1.02 scale or a 2 % rise), then settle with
  ease-out. A fast stop earns a longer settle.
- **Arcs.** A thing travelling to a target (a coin to the treasury, a banner to a province) bows a
  few pixels off the straight line. To do that, give x and y different easings, or move it along a
  curve.
- **Squash belongs to the mood.** Skip deformation for a serious tone. If we squash at all (a sack
  landing), keep the volume: widen as you flatten.
- **Idle loops.** "Breathing" scale of at most 2 % over 3-4 s, ease-in-out. Only one part on a
  screen may pulse at a time. The loop's last state equals its first exactly. Ask whether the tenth
  loop would annoy; if so, halve the amplitude, and stop attention loops after 3-5 cycles if nothing
  is happening.
- **Reveal patterns that suit a manuscript.** A mask wipe in reading direction (left to right) with
  a 2-4 px drift. A draw-on of an outline (ink being written), with the fill fading in over the last
  20 %. A letter cascade for title words: 200-300 ms a letter, 30-60 ms apart, rising about 0.6 em
  while fading in, baselines honest at mid-frames. The same patterns fit update-video captions and
  the promo title.
- **Composition rule.** Give each element one reveal, at most one idle loop and at most one tap
  reaction. A reveal plays once per context, never on every page switch. Animate only transform,
  opacity and clipping.

### Motion QA (pixel2motion), mapped onto our harness
- **Deterministic seek.** Capture frames by seeking a time, never by wall-clock screenshots. Our
  `--film-fps 60` does this already. Capture at the start, the end of anticipation, mid-action, peak
  overshoot, settle and the final frame, **plus brackets around every handoff** (where one effect
  hands over to the next). An evenly spaced strip hides handoff defects.
- **Final Frame Contract.** The last frame of an animation must be pixel-identical to the static
  state, measured by the same pipeline (expect a diff of exactly 0). For us: the still render of a
  sign or page versus the last `--film` frame of its entrance. That gives a cheap regression line.
- **Ink-delta continuity sweep** (exact definition from the script). Sample every ~10 ms. Count
  "ink" pixels, those whose mean RGB is below 120. Take each step's delta and the median of the
  positive deltas. A step is a *flatline* if its delta is at most max(2, 5 % of that median), and a
  *jump* if its delta is over 3x the median. A flatline followed by a jump is the "stall and pop"
  signature and fails. Apply it to a dust or smoke puff's age curve, a draw-on, or a march route
  coming out of the paper.
- **Easing probe.** Read the computed value at 2-3 times and compare it with the designed curve. If
  the values match the linear fraction, the easing silently fell off. In Kotlin, a unit test on our
  easing table does this.
- **Loop seam check.** The frame just before the loop point and the one just after must be
  identical.
- **Path smoothness audit** (for code-drawn outlines, our 36x36 signs' vector sources if any). Warn
  when two joined segments' tangents differ by more than 8 degrees, or when a segment is shorter
  than 25 % of the median segment length.
- **Overlay IoU** (from `render_overlay.py`). Foreground is R+G+B < 720. Report IoU =
  intersection/union and src-only and render-only pixel counts as a diagnostic, never as a fixed
  pass/fail gate. Use it for a code-drawn sign against its reference silhouette.
- **Iteration budget.** At most 10 fit iterations, each numbered and kept. Then pick the best of
  them by a stated ranking. This keeps sign-tuning from rabbit-holing.

### Readability, lighting and process (game-assets-enhancer)
- **Manifest first.** Before any generation, list every visual element on one line each, grouped by
  layer. That list drives the job and fits our "reuse what the atlas has, generate only what nothing
  can stand in for" rule. It also gives the honest count of generations to ask the author about.
- **Style anchor.** Approve one hero figure first and judge every later one against it. This is
  exactly our `figur_02` rule. Its method of making animation frames, each an edit **of frame 1**
  rather than of the previous frame so the figure does not drift, is a useful brief for AutoSprite
  and PixelLab frame requests. So is naming only the limbs that move. Normalise the cycle on one
  canvas, bottom-anchored (our "seat"), and step frames by **distance travelled**, not wall time, so
  feet do not skate.
- **One sprite = one object; moving parts separate.** A wheel, flag or held weapon is its own plate,
  and the parent figure is made without it. No text plates baked into art: one code-drawn label
  carries the words.
- **Reuse beats regeneration.** Mirror and recolour one plate instead of generating a near-twin;
  identical pieces read as design, near-duplicates as sloppiness.
- **One light direction for everything.** Lit planes face the light, cool shadow shapes sit
  opposite, a thin rim on the lit edge. Distinct shadow and highlight shapes, not one flat mid-tone.
  This matches our upper-left, two-tone rule and gives words to check a PixelLab import against.
- **Background calmer than the playfield.** If the backdrop competes, dim the backdrop; never
  brighten the subject. Aerial perspective: farther layers paler, hazier, less saturated. A cheap
  per-layer tint in code does it.
- **The background must never look like something you act on.** Shapes the player reacts to (an army
  counter, a tappable sign) must not appear as scenery at any size. That suits our map ornament and
  the ivy border.
- **Semantic colour is fixed.** Danger, success, time and celebration each keep one colour across
  the game.
- **Deterministic scenery.** hash(layer, slot) picks the variant, a ±30-40 % jitter, a ±10 % size
  wobble and an occasional skip. Neighbouring slots must not repeat a variant. Same seed, same
  scenery, no storage: it fits our determinism rule for battle-field or town dressing.
- **Squint test.** Blur a screenshot. The focal point must still be the brightest, most contrasted
  area.
- **Layer-by-layer stills.** Screenshot each layer added in turn to check seams and scale, then
  record a moving capture: stills cannot judge drift or easing.
- **Juice.** Something landing falls with ease-in and stops dead on contact. It squashes briefly
  (about 0.78 wide and 1.12 tall, bottom-anchored, about 0.07 s), then springs back. The dust burst
  is anchored slightly *below* the contact seam, because the burst fans upward. Tap reaction: within
  one frame a snap, then a jitter, then a brightness flash, then recovery; register on touch-down.
  Settled debris freezes for good: nothing in the background fidgets.
- **Hazy pieces.** A soft-edged prop should be made as an isolated silhouette that does not touch
  the canvas sides. If haze reaches the edge it survives cut-out as a translucent rectangle. Its
  fallback for that case: fade near-white pixels out, alpha × (242 − min(r,g,b)) / 30 clamped, and
  feather the outer ~9 % of the left and right edges. That is a usable import-script step if a
  PixelLab smoke or cloud plate ever comes back like that.
- **Time bases live in state.** An animation start time held as a local in draw code resets on every
  redraw. In libGDX: keep it in the object, not in `render()`.

### Video and capture (pixel-art, pixel2motion)
- **Two-pass GIF** (pixel-art). Pass 1 builds a palette (palettegen, 128 colours, stats_mode=full).
  Pass 2 applies it (paletteuse, Bayer dither, bayer_scale 5). Single-pass encoding bands. 8 fps
  suffices for fades, 4 fps for step changes. For pixel art this yields tiny files. A good fit for a
  WhatsApp preview of an update.
- **Video export** (pixel2motion). libx264, preset slow, CRF 16, yuv420p, `+faststart`. VP9 with
  alpha (yuva420p, CRF 18) when a transparent overlay is needed. **But** it scales with lanczos. For
  our pixel frames, scale by an integer with `flags=neighbor`, or the pixels smear.
- **Opacity-only fades for staggered reveals** (pixel-art). It avoids fights with the positioning
  transform. In libGDX: fade a caption's alpha rather than scaling a group whose origin moves.

### Layout traps (pixel-art), applicable to captions and signs
- Monospace 13 px is about 7.8 px a character, and an emoji about 14 px: measure text before sizing
  its box.
- Right-hand text in a banner: anchor it at the end, about 20 px inside the edge, so it grows
  leftwards and never runs out.
- A label placed "above" a round icon can land inside the circle; put it clearly above or below.
- After renaming anything, search for **every** occurrence, including small subtitles.

## 3. Not for us, and why
- **fal.ai, nano-banana-pro, pixelcut background removal** (game-assets-enhancer): forbidden
  generators and an outside service. The rule allows PixelLab, plus AutoSprite only for animating
  PixelLab figures.
- **Hand-written pixel characters in SVG** (pixel-art): sprites come from PixelLab only. Code
  drawing is allowed only for the zoomed-out battle tiers and small UI signs, and even there our own
  36x36 silhouette rules apply, not its chibi template or its off-palette hexes.
- **Raster-to-vector tracing** (pixel2motion `raster_logo_trace.py`, ribbon fitting): our art is
  pixel atlases; vectorising PixelLab output would leave the norm and the palette. The split-fill
  draw-on for self-crossing strokes is overkill for us.
- **HTML/CSS/SVG deliverables, Playwright, puppeteer, NODE_PATH reuse**: not our stack. The Kotlin
  harness already gives deterministic frames.
- **raw.githubusercontent links, README GIF embedding, cache-busters**: public links break the
  "private" rule.
- **The painterly-cartoon default, warm undertone in every colour, mandatory dominant hill layers,
  the side-scroller parallax stack, foreground "whip" props**: the style and genre are wrong for a
  portrait manuscript map. Aerial perspective as an idea stays.
- **Bouncy overshoot presets, sparkles and confetti, squash above 10 %**: they do not fit the
  manuscript tone. Keep the "professional" or "elegant" bands.
- **The docs folder's third-party logos, GIFs and QR image**: other people's marks. Not looked at as
  material and not to be reused.

