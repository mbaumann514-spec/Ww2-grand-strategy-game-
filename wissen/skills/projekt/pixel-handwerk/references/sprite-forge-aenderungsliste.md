# agent-sprite-forge: what its change log teaches (read 14 November 2026)

Source: the CHANGELOG, LICENSE (MIT, 0x0funky), pytest.ini and .gitignore of "agent-sprite-forge", handed over by the
author without its code. Only the change log has content; it describes the tools in prose with measured numbers. Read
as reference, in our own words; nothing run, nothing taken over.

## Conflicts with our rules
Its art route is image generation first through other providers (OpenAI, Gemini, xAI/Grok, BytePlus, fal.ai) and
image-to-video for motion; code art is its last resort. Forbidden for us (PixelLab only, AutoSprite only to animate
PixelLab figures). What is worth keeping is how it cleans and checks pictures once they exist.

## Methods worth keeping

**A master, and every pose made from it.** One sprite the author likes is the reference of the whole cast; every
further pose or view is made "as the master with one change", and only the changed cells are taken (their sword pose:
217 cells changed, 91 % of the master kept). For us: PixelLab and AutoSprite briefs name only what changes against the
accepted figure, never re-describe the figure; the import keeps the master's pixels where the new frame agrees.

**A cast drawn beside the master, not alone.** A figure drawn alone came back a tenth to a quarter taller; drawn beside
the master in one picture it kept pixel size and height. A *line-up* puts every figure on one ground line and reports
the heights. For us: a line-up sheet as a step of `tools/schlacht_icons.py sheet` / the norm, with heights against a
target, and PixelLab generations with an accepted figure as the reference image.

**Reading a generated "pixel art" picture back onto its grid.** Find the picture's own cell size and phase, one colour
per cell, so a 1254-px picture becomes a true 1x sprite (theirs: 88,410 colours → 48, no soft pixel; a plain resize kept
1,033 colours). For us: when a PixelLab result comes back larger than the target, find its lattice instead of scaling.

**Small mechanical fixes, named.** Lock to the palette; close the outline by rule, with the line drawn *outside* a bare
lit cell; remove islands; fill single holes; drop key-coloured, key-tinted and near-key pixels left from a background;
put the sprite's own head back where a frame smeared it. Most of these are in our norm already or listed in the main
skill; the head-lock (restore a stable part from the master in every frame) is new and fits animated frames.

**Colour reduction that keeps every hue.** k-means in OKLab, not RGB, so that a small hue (a red plume) keeps a place;
below 16 colours hue counts more than lightness, and every kept colour is one the picture had. For us: our norm cuts to
20 by frequency, which can swallow a small accent -- reduce in OKLab with a per-hue guarantee instead.

**Proportions kept.** Generated blocks are often a tenth to a fifth taller than wide; one pixel a block flattens the
figure that much. They double the rows that show least (the outline stays one cell thick, nothing redrawn).

**Flicker over frames.** Palette per character learned from the source; *temporal hysteresis*: a pixel keeps its
previous colour while that colour still holds 80 % of the winner's share. It removed 32-46 % of noise flips. For us:
when frames from AutoSprite are brought to the palette, map them with hysteresis against the frame before.

**Motion checks.** Half-cycle duplicates: a walk whose two half-cycles have near-identical silhouettes (IoU ≥ 0.95) is a
fault. Feet: the anchor is the bottom edge of the lowest stable row, not a percentile (their feet hung 2-3 px low).
Foot drift measured in pixels (0 px planted-foot drift after a ground constraint). Static-body shimmer measured.

**Timing.** Generated one-shots play in slow motion; they retime them to game length by finding onset, holds and
settle (attack 4.1 s → 0.7 s with the hit at 40 %, jump 0.9 s, hurt 0.5 s, cast 0.9 s), with a hit-stop at the strike.
Exact frame times: 12.5 fps gives 80 ms frames; ticks at 60 Hz in whole milliseconds without drift. Walks advance with
distance, not time.

**Engineering habits.** Every tool prints one JSON line and exits 0 ok, 1 error/refused, 3 no route, 4 "published but
QA failed" -- so a caller can tell a report worth reading from nothing written; QA results with fixed statuses
(pass/warn/fail/skipped), WARN and FAIL reported verbatim, never summarised as "all passed". Outputs into a new folder,
never overwriting. For us: our check commands' last line should say pass/warn/fail in the same plain way.
