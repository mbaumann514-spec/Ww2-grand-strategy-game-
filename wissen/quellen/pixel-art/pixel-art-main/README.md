# pixel-art

Generate pixel art SVG illustrations for READMEs, docs, and slides — with an optional animation pipeline that compiles CSS-staggered SVG into GitHub-renderable GIFs.

[![GitHub release](https://img.shields.io/github/v/release/wan-huiyan/pixel-art)](https://github.com/wan-huiyan/pixel-art/releases)
[![license](https://img.shields.io/github/license/wan-huiyan/pixel-art)](LICENSE)
[![last commit](https://img.shields.io/github/last-commit/wan-huiyan/pixel-art)](https://github.com/wan-huiyan/pixel-art/commits)
[![Claude Code](https://img.shields.io/badge/Claude_Code-skill-orange)](https://claude.com/claude-code)

[![Pixel-art demo — animated pipeline storyboard](https://raw.githubusercontent.com/wan-huiyan/google-trends-browser-fetch/main/docs/pipeline-flow.gif?v=1)](https://raw.githubusercontent.com/wan-huiyan/google-trends-browser-fetch/main/docs/pipeline-pixel-animated.svg?v=1)

*Demo banner generated with this skill — used as the v1.1.0 hero of [`google-trends-browser-fetch`](https://github.com/wan-huiyan/google-trends-browser-fetch). Two-track storyboard, 920×420, 11s build-up, **70 KB** GIF.*

## What this is

A Claude Code skill that produces friendly, readable pixel-art illustrations as **standalone SVG files** — no external rendering services, no AI image API calls. The model writes `<rect>` elements directly on a 7px grid using a small palette, the same way you'd draw sprites by hand.

Use it for:

- **README hero images** — characters in dialogue, multi-step pipelines, before/after comparisons
- **Slide decks** — illustrated callouts, mascot-style intros, process diagrams
- **Social/blog posts** — bite-size visuals that match your project's brand colour
- **Animated banners** — when a static SVG isn't enough, the skill includes a working CSS-SVG → puppeteer → ffmpeg pipeline that produces ~70 KB GIFs that play in GitHub READMEs

## Quick start

```
You: Make a pixel-art banner for my README — me on the left, Claude in
     the middle, a browser icon on the right, with arrows showing
     "you ask → Claude responds → browser fetches data".

Claude: (invokes pixel-art skill)
        → Sketches three pixel characters on a 7px grid
        → Adds chat bubbles, arrow markers, a soft background
        → Writes docs/pipeline.svg
        → Opens the file for you to preview
```

For an **animated** version, ask: *"Now animate it — fade each character in one at a time."* The skill switches to its animation track: writes `pipeline-animated.svg` with CSS-staggered `@keyframes fadeIn`, then renders it to `pipeline.gif` via puppeteer + ffmpeg so it plays in GitHub READMEs.

## Installation

### Claude Code

```bash
# Plugin install (recommended)
/plugin marketplace add wan-huiyan/pixel-art
/plugin install pixel-art@wan-huiyan-pixel-art

# Or clone directly
git clone https://github.com/wan-huiyan/pixel-art.git ~/.claude/skills/pixel-art
```

### Cursor / other LLM hosts

The SKILL.md is platform-agnostic — it tells the model how to write SVG, not which tools to use. Drop the file into your skill discovery path:

```bash
git clone https://github.com/wan-huiyan/pixel-art.git ~/.cursor/skills/pixel-art
```

## What you get

- **Character template** on a 7px pixel grid — 8-character body plan with skin / hair / eye / mouth / clothes layers
- **Scene composition recipes** — chat dialogue (two characters + alternating bubbles), single-character-with-label, group scenes, multi-track pipelines
- **Bubble & arrow primitives** — speech bubbles with proper tail rendering, arrow markers with `orient="auto"` direction handling
- **Common pitfalls list** — the layout traps the skill has hit in real use (text-inside-circles, banner edge cutoff, label-stale-after-rename, character-bubble overlap, viewBox sizing)
- **Animation pipeline** — opacity-based CSS keyframes + a complete puppeteer screenshot loop + ffmpeg two-pass GIF encoder, with notes on FPS choice (8fps for fades, 4fps for step transitions), viewport-must-match-viewBox, and reusing an existing puppeteer install via NODE_PATH

## When to use animation

| You want… | Use |
|---|---|
| A single-frame "this is the architecture" diagram | Static SVG (always renders, scales perfectly, lighter than GIF) |
| Multi-step pipeline reveal, before/after, character introductions | Animated SVG → GIF (the README sees the GIF; click-through opens the live SVG) |
| Heavy motion / particle effects | Look elsewhere — this skill is opinionated toward calm, readable pixel art |

GitHub renders SVG inside README via `<img>` tags, which means CSS-animated SVG and SMIL **do not play** in the rendered README — they appear frozen on the first frame. The animation pipeline solves this by rendering the animated SVG to a GIF that GitHub *will* play, while keeping the SVG as the click-through high-fidelity source.

## How it works

1. **Understand the request** — characters, scene type (dialogue/portrait/group/diagram), brand colours, target size
2. **Generate SVG** — write `<rect>` elements on a 7px grid, one `<g transform="translate(x,y)">` per character
3. **Iterate with the user** — typical 2-4 rounds of "move that, fix the arrow direction, shrink the bubble"
4. **Optional animation** — wrap each scene element in a class, add `@keyframes fadeIn` with staggered `animation-delay`, render to GIF via the included puppeteer script
5. **Embed in README** — for static, just `![alt](file.svg)`. For animated, use the GIF-linked-to-SVG pattern with `?v=N` cache-bust

## Design decisions

- **Why opacity-only animation, not transforms?** SVG `<g transform="translate(x,y)">` groups already use transforms for positioning. Animating `transform: scale()` or `transform: translate()` on the same group composes unpredictably. Opacity is independent of positioning and behaves the way you'd expect.
- **Why 7px grid, not 4 or 8?** 7 is a sweet spot for character readability at typical README zoom (28-56px characters fit in roughly the same vertical space as a paragraph of text), and is small enough to keep file sizes lean. 4 is too small to render facial features; 8 makes characters feel oversized.
- **Why GIF, not WebM or APNG?** GitHub's `<img>` rendering plays GIF reliably. WebM requires `<video>` which README doesn't render. APNG works but is poorly supported by GitHub's image proxy. GIF is the lowest-common-denominator that *just works*.
- **Why ffmpeg two-pass instead of single-pass?** Single-pass `palettegen` + `paletteuse` produces banding on the flat-colour fields pixel art uses. Two-pass with `palettegen=stats_mode=full` analyses the entire frame sequence first, producing a palette tuned to the actual colours used, then re-encodes with `paletteuse=dither=bayer` for sharp pixel edges.

## Limitations

- Does **NOT** generate raster pixel art (PNG/PNG-spritesheet) — output is always SVG. If you need PNG sprites for a game engine, use a dedicated tool like Aseprite.
- Does **NOT** animate via SMIL or APNG — only CSS-keyframes-rendered-to-GIF, because that's what GitHub README plays.
- Does **NOT** support detailed character motion (walking, gesturing, particle effects) — opacity fades only. Adding transform-based motion is a known enhancement (see [issue #N](#)).
- Does **NOT** handle complex scenes with 50+ characters elegantly — the 7px grid is designed for small, readable cast sizes (1-6 characters per scene).
- The GIF rendered from the animated SVG appears at lower visual resolution than the static SVG when displayed in a GitHub README — see [open issue](#) for the in-progress fix.

## Pitfalls to avoid

The SKILL.md ships a longer "Common Pitfalls" list including the architectural ones above plus:

- Text labels positioned at `y=6` (above a group's local origin) land *inside* a circle whose centre is `(28, 28) r=24` — its top is at world `y=4`. Move labels well above icons or use the label-below-station pattern.
- Right-aligned banner stats overflow the rounded banner end if positioned by `x=` start — use `text-anchor="end"` and anchor `x` to ~20px inside the right edge.
- After a label renaming pass (e.g. "Path A–C" → "Path 1"), grep the SVG for *all* old occurrences — labels appear in both the visible text *and* small grey subtitles below the title; the subtitle is easy to miss.

## Animation pipeline cheatsheet

The full instructions are in [`plugins/pixel-art/SKILL.md`](plugins/pixel-art/SKILL.md). One-line summary of the working pipeline:

```bash
# 1. Author CSS-animated SVG with @keyframes fadeIn + staggered delays
# 2. Serve docs/ locally:
python3 -m http.server 3847 &

# 3. Render to GIF (8fps × 11s = 88 frames, ~70KB output for typical pixel art):
NODE_PATH=~/path/to/puppeteer/parent/node_modules \
  node docs/capture-gif.cjs

# 4. Embed in README:
[![alt](raw URL to .gif?v=1)](raw URL to animated.svg?v=1)
```

The NODE_PATH override matters — node CJS resolves modules from the script's directory, not `cwd`, so reusing a puppeteer install from another project requires the override.

## Reference implementation

The README hero on this repo (and on [`wan-huiyan/google-trends-browser-fetch`](https://github.com/wan-huiyan/google-trends-browser-fetch)) was generated by this skill end-to-end. Source files in that repo:

- [`docs/pipeline-pixel-animated.svg`](https://github.com/wan-huiyan/google-trends-browser-fetch/blob/main/docs/pipeline-pixel-animated.svg) — the CSS-animated source
- [`docs/pipeline-flow.gif`](https://github.com/wan-huiyan/google-trends-browser-fetch/blob/main/docs/pipeline-flow.gif) — the rendered output
- [`docs/capture-gif.cjs`](https://github.com/wan-huiyan/google-trends-browser-fetch/blob/main/docs/capture-gif.cjs) — the build script

## Acknowledgements

The animation pipeline pattern (CSS-animated SVG → puppeteer screenshot → ffmpeg two-pass GIF) was adapted from the working setup in [`wan-huiyan/agent-review-panel`](https://github.com/wan-huiyan/agent-review-panel) on the `feat/pixel-art-banner` branch — particularly the FPS choice, the `palettegen` + `paletteuse=dither=bayer` two-pass, and the GIF-linked-to-SVG embed pattern.

The original pixel-art SKILL.md was inherited from a research-skills bundle (`skills-codex`) without explicit upstream attribution. If you recognise the original author, please open an issue and we'll credit them properly.

## License

[MIT](LICENSE) © 2026 Huiyan Wan
