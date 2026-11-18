---
name: render
description: Capture and review a screen of the libGDX front end with no device attached — the screenshot harness flags, the crop tool, and what to look for in the picture. Use whenever a change touches core/ or any interface panel.
---

# Looking at the interface without a device

```bash
xvfb-run ./gradlew :lwjgl3:run --args="--screenshot /tmp/shot.png \
  --country fra --turns 12 --select fra_paris --estates --width 1280 --height 960"
node tools/crop.mjs /tmp/shot.png /tmp/crop.png 0 0 640 480   # the part under review
```

Then **read the image back**. A render that was captured and not looked at has
verified nothing.

## The flags

| Flag | What it does |
|---|---|
| `--screenshot PATH` | turns the launcher into the capture harness |
| `--country ID` | take that realm, so the panels have a subject |
| `--turns N` | jump the simulation forward before capturing |
| `--speed 1..4` + `--warmup N` | let the clock actually run, to check pacing |
| `--mode NAME` | a map mode by its enum name, lower case |
| `--select ID` | select a province, since a screenshot cannot tap |
| `--subjects`, `--estates` | open those panels |
| `--decide N\|auto` | answer the waiting prompt, then capture |
| `--width`, `--height` | default 1280×960, an iPad's proportions |

## What to look at

- **Collisions.** Every panel this project has grown has, at least once, been
  drawn underneath a button or over a label. Look at the whole frame, not the
  new part.
- **Empty boxes** in text mean a glyph the built-in font lacks: everything must
  go through `plainText`.
- **Solid grey or solid ink** where a wash was meant means a missing
  `blendOn()` before a translucent `ShapeRenderer` pass.
- **A panel the right size for its contents.** A sheet cut for the worst case
  reads as something that failed to load.
- **Phone width.** The target is an older iPhone at 60 fps; a layout that only
  works at 1280 wide is not finished.
