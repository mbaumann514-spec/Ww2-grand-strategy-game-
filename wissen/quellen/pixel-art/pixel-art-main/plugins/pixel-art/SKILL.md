---
name: pixel-art
description: Generate pixel art SVG illustrations for READMEs, docs, or slides. Use when user says "画像素图", "pixel art", "make an SVG illustration", "README hero image", or wants a cute visual.
argument-hint: [description of what to draw]
allowed-tools: Write, Edit, Read, Bash(open *)
---

# Pixel Art SVG Generator

Create a pixel art SVG illustration: $ARGUMENTS

## Design Principles

### Pixel Grid
- Each "pixel" is a `<rect>` with width/height of 7px
- Grid spacing: 7px (no gaps between pixels)
- Characters are typically 8-10 pixels wide, 8-12 pixels tall
- Use `<g transform="translate(x,y)">` to position and reuse character groups

### Color Palette
Keep it simple — 3-5 colors per character:
- **Skin**: `#FFDAB9` (light), `#E8967A` / `#D4956A` (blush/shadow)
- **Eyes**: `#333`
- **Hair**: `#8B5E3C` (brown), `#2C2C2C` (black), `#FFD700` (blonde), `#C0392B` (red)
- **Clothes**: use project's brand color (e.g. `#4A9EDA` for blue, `#74AA63` for green)
- **Shoes/pants**: `#444`
- **Accessories**: `#555` (glasses frames), `#FFD700` (crown)

### Character Template (7px grid)
```
Row 0 (hair top):     4 pixels centered
Row 1 (hair):         6 pixels wide
Row 2 (face top):     6 pixels — all skin
Row 3 (eyes):         6 pixels — skin, eye, skin, skin, eye, skin
Row 4 (mouth):        6 pixels — skin, skin, mouth, mouth, skin, skin
Row 5 (body top):     8 pixels — hand, 6 shirt, hand
Row 6 (body):         6 pixels — all shirt
Row 7 (legs):         2+2 pixels — with gap in middle
```

### Scene Composition

#### Chat Dialogue Layout (like our hero image)
- Two characters on left/right sides, vertically centered
- Chat bubbles between them, alternating left/right
- Bubble tails point toward the speaking character
- Arrows between bubbles show direction of communication
- Use `orient="auto"` markers for arrow heads
- Bottom: tagline or decoration

#### Single Character with Label
- Character centered
- Label text below
- Optional: speech bubble above

#### Group Scene
- Characters spaced evenly
- Optional: ground line, background elements
- Keep viewBox tight — no wasted space

### SVG Structure
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" font-family="monospace">
  <defs>
    <!-- Arrow markers if needed -->
  </defs>

  <rect width="W" height="H" fill="#fafbfc" rx="12"/>  <!-- Background -->

  <!-- Characters via <g transform="translate(...)"> -->
  <!-- Dialogue bubbles: <rect> + <polygon> tail + <text> -->
  <!-- Arrows: <line> with marker-end -->
  <!-- Labels: <text> with text-anchor="middle" -->
</svg>
```

### Chat Bubble Recipe
```xml
<!-- Blue bubble (left character speaks) -->
<rect x="110" y="29" width="280" height="26" fill="#e8f4fd" stroke="#4a9eda" stroke-width="1.5" rx="8"/>
<!-- Tail pointing left toward character -->
<polygon points="108,41 99,47 108,46" fill="#e8f4fd" stroke="#4a9eda" stroke-width="1.5"/>
<rect x="107" y="40" width="3" height="7" fill="#e8f4fd"/>  <!-- covers stroke at junction -->
<text x="123" y="46" font-size="13px">📄 Message here</text>

<!-- Orange bubble (right character responds) -->
<rect x="490" y="71" width="280" height="26" fill="#fdf2e8" stroke="#da8a4a" stroke-width="1.5" rx="8"/>
<!-- Tail pointing right toward character -->
<polygon points="772,83 781,89 772,88" fill="#fdf2e8" stroke="#da8a4a" stroke-width="1.5"/>
<rect x="770" y="82" width="3" height="7" fill="#fdf2e8"/>
<text x="503" y="88" font-size="13px">🤔 Response here</text>
```

### Arrow Recipe
```xml
<defs>
  <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="#4a9eda"/>
  </marker>
</defs>
<!-- Right arrow (→): x1 < x2 -->
<line x1="392" y1="42" x2="465" y2="42" stroke="#4a9eda" stroke-width="2" marker-end="url(#ar)"/>
<!-- Left arrow (←): x1 > x2 -->
<line x1="488" y1="84" x2="420" y2="84" stroke="#da8a4a" stroke-width="2" marker-end="url(#ar-o)"/>
```

## Workflow

### Step 1: Understand the Request
- What characters/objects to draw?
- What's the scene? (dialogue, portrait, group, diagram)
- What colors/brand to match?
- What size? (compact for badge, wide for README hero)

### Step 2: Generate SVG
- Write to a temp file or project directory
- Open with `open <file.svg>` for preview
- Keep viewBox tight — measure actual content bounds

### Step 3: Iterate with User
- User provides feedback on screenshot
- Common fixes: overlap, arrow direction, spacing, sizing
- Use `Edit` for small tweaks, `Write` for major redesigns
- Typical: 2-4 iterations to get it right

### Step 4: Finalize
- Ensure no personal info in the SVG
- Clean up: remove unused defs, tighten viewBox
- Suggest adding to README: `![Alt text](filename.svg)`

## Common Pitfalls
- **Arrow direction**: `orient="auto"` follows line direction. Line going right→left = arrowhead points left
- **Bubble overlap**: keep 38-44px vertical spacing between rows
- **Text overflow**: monospace 13px ≈ 7.8px/char, emoji ≈ 14px. Measure before setting bubble width
- **Character overlap with bubbles**: keep character x-zone and bubble x-zone separated by ≥10px
- **viewBox too large**: match viewBox to actual content, add ~10px padding
- **Tail stroke artifact**: always add a small `<rect>` at the bubble-tail junction to cover the stroke line
- **Text inside circular icons (clocks, badges)**: a label at `y=6` (above the group) lands *inside* the circle if the circle is centered at `(28, 28)` with `r=24` — its top is at world `y=4`. Either move the label well above the icon (negative `y` in the local group), put it below the icon as a subtitle, or rely on the existing label-below-station pattern instead of stacking a second label inside the icon.
- **Right-edge banner cutoff**: when a banner has both a left-aligned title and a right-aligned stat ("(13 files · ~2.9k lines · idempotent BQ upsert)"), don't position the right text by `x=` start — at default `text-anchor="start"` a long string runs off the rounded banner end. Use `text-anchor="end"` and anchor `x` to a point ~20px inside the right edge of the banner. Then the text grows leftward and stays inside the box regardless of font metrics.
- **Stale labels after taxonomy changes**: when the project's labelling changes (e.g. "Path A–C / Path D" → "Path 1 / Path 2"), grep the SVG for *all* occurrences before declaring done — labels appear in both the visible text *and* the small grey subtitle below the title. The subtitle is easy to miss because it's not what you focus on while editing.

## Animating a pixel-art SVG for a README

GitHub renders SVG inside README via `<img>` tags, which means **CSS-animated SVG and SMIL do NOT play in the rendered README** — they appear frozen on the first frame. The working pattern is to author the animation in CSS-animated SVG, then render it to a GIF that GitHub *will* play in the README.

**Reference implementation**: [`wan-huiyan/agent-review-panel` on the `feat/pixel-art-banner` branch](https://github.com/wan-huiyan/agent-review-panel/tree/feat/pixel-art-banner/docs) — `pixel-flow-animated.svg` + `capture-gif.cjs` + the resulting `pixel-flow.gif`.

### Authoring the animation (CSS-only, opacity-based)

Use **opacity-only keyframes** (`fadeIn`, `pulse`) to avoid SVG-transform conflicts with positioning groups. Each animated element gets a class with a staggered `animation-delay`:

```svg
<style>
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .anim { opacity: 0; }                                   /* start hidden */
  .p1-character { animation: fadeIn 0.4s ease-out 0.6s forwards; }
  .p1-bubble1   { animation: fadeIn 0.4s ease-out 1.1s forwards; }
  .p1-arrow     { animation: fadeIn 0.3s ease-out 2.0s forwards; }
  /* ... step through panels with explicit delays ... */
</style>
```

The `forwards` fill keeps each element visible after fade-in, so the final frame is the complete scene. Use opacity, not `transform: scale()` or `translate()` — transforms compose with the SVG group's own positioning and produce surprises.

### Rendering to GIF (puppeteer + ffmpeg, two-pass)

```javascript
// docs/capture-gif.cjs — must be .cjs for ESM projects
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

const FPS = 8;          // 8fps for fade-in animations; 4fps only if you have step-only transitions (>0.5s each)
const DURATION = 11;    // seconds — match your longest animation-delay + ~1.5s hold
const TOTAL_FRAMES = FPS * DURATION;
const INTERVAL_MS = 1000 / FPS;

// 1. Serve the SVG locally (file:// URLs don't reliably trigger CSS animation in headless Chrome)
//    `python3 -m http.server 3847` in the docs/ folder
// 2. Launch puppeteer headless, screenshot every INTERVAL_MS
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 920, height: 420 });    // MUST match SVG viewBox exactly — otherwise white margins
await page.goto('http://localhost:3847/your-animated.svg', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 200));             // settle paint before t=0
for (let i = 0; i < TOTAL_FRAMES; i++) {
  await page.screenshot({ path: `frame${String(i).padStart(4,'0')}.png` });
  if (i < TOTAL_FRAMES - 1) await new Promise(r => setTimeout(r, INTERVAL_MS));
}

// 3. Two-pass ffmpeg: palette generation, then encode with bayer dithering
execSync(`ffmpeg -y -framerate ${FPS} -i "frame%04d.png" \
  -vf "palettegen=max_colors=128:stats_mode=full" palette.png`);
execSync(`ffmpeg -y -framerate ${FPS} -i "frame%04d.png" -i palette.png \
  -lavfi "paletteuse=dither=bayer:bayer_scale=5" output.gif`);
```

The two-pass `palettegen` + `paletteuse=dither=bayer` keeps the GIF small while preserving the flat colours pixel art needs. Single-pass `ffmpeg` produces ugly banding.

**Real-world size:** an 11s × 8fps × 920×420 pixel-art scene rendered to **~70 KB**. Pixel art's flat palette compresses spectacularly well; even at 8fps with smooth fades, GIF size rarely exceeds 200 KB. Don't reach for WebM or APNG unless you've measured GIF and it's actually too big.

### Reusing puppeteer from another project (avoid 150 MB re-install)

If you already have puppeteer installed in another local project (e.g. `~/Documents/some-other-project/node_modules/puppeteer`), reuse it instead of running `npm install` again — puppeteer ships with a Chromium binary download that's slow and large.

**Gotcha:** node's CJS module resolution looks at the *script file's* directory's `node_modules`, **not** `process.cwd()`. So `cd ~/some-other-project && node /path/to/script.cjs` will still throw `Cannot find module 'puppeteer'`. Override with `NODE_PATH`:

```bash
NODE_PATH=~/Documents/some-other-project/node_modules \
  node ~/your-skill-repo/docs/capture-gif.cjs
```

This tells node to also search that directory for required modules. Works for any cross-project dependency reuse, not just puppeteer.

### Embedding in README (cache-busted, clickable)

```markdown
[![Skill flow — animated](https://raw.githubusercontent.com/OWNER/REPO/main/docs/flow.gif?v=3)](https://raw.githubusercontent.com/OWNER/REPO/main/docs/flow-animated.svg?v=3)
```

- **`raw.githubusercontent.com` URL** — required because relative paths and image-proxy URLs serve SVG with a Content-Type that prevents inline rendering of SMIL/CSS animation. The raw URL serves the GIF correctly.
- **`?v=N` cache-buster** — increment when the asset changes; GitHub's edge cache otherwise serves the old version for 5+ minutes.
- **Linked to the live SVG** — clicking the GIF opens the animated SVG in a new tab, where browsers *do* play CSS animation. So the README shows the GIF (animated), and curious users get the higher-fidelity SVG on click.

### When to skip animation
Static pixel-art works fine and renders crisply at any zoom level. Reach for the GIF pipeline only when the scene benefits from temporal storytelling (multi-step pipelines, before/after, panel-by-panel reveal). For a single-frame "this is the architecture" diagram, ship the static SVG.
