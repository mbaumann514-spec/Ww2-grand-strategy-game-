---
name: paket
description: Work one package of a Sacrum Imperium design brief from reading to commit — the order the author asked for, the verification that proves it, and the report he expects at the end. Use when asked to build a section of WIRTSCHAFT.md, DIPLOMATIE.md, KRIEG.md, KAMPFSYSTEM.md, BRIEF.md or REICH.md.
---

# One package, finished

*"Arbeite immer nur ein Paket ab, nicht mehrere gleichzeitig."* This is the
sequence. Do not start the next one because this one is nearly done.

## 1. Read before building

Read the whole section, and the whole document if the section refers outward.
The four briefs interlock: levies are an economy problem, the battle is a war
problem, and the estates are both. If the package needs a change to the
existing simulation, **name the change before making it** — the author's rule:
*"Die bestehende Simulation nicht ohne Not umbauen. Wenn ein Paket eine
Änderung an der Simulation braucht, benenne sie vorher."*

## 2. Build it

- Rules in `sim/`, screens in `core/`. No libGDX in `sim/`, no rules in `core/`.
- Every number the player feels goes in the package's tunable JSON with its
  reasoning beside it, not in Kotlin.
- The player's path and the AI's path are the same functions.
- Follow the file you are editing: its comment density, its naming, its voice.
  Prose comments that say *why*, not *what*.

## 3. Verify by running it

```bash
./gradlew :sim:jvmTest :core:test
./gradlew :sim:headless --args="--years 125 --seed 1"
xvfb-run ./gradlew :lwjgl3:run --args="--screenshot /tmp/shot.png --country fra --turns 12"
```

A rules package is proven by tests **that reconstruct something real** — Crécy,
Poitiers, Azincourt, and then the counter-case that must fail. A screen package
is proven by reading the render back as an image. A balance package is proven
by the headless report, in figures.

If a performance figure in the brief cannot be held, say so; do not quietly
break it.

## 4. Commit

One commit per coherent piece, in the house style: a subject line in the game's
voice, and a body that says what the section asked for, what was measured, and
what deviates. Name the test counts.

## 5. Report to the author, in German

Three things, always, in this order:

1. **Was gebaut wurde** — and the measured result, in numbers.
2. **Wo du unsicher bist** — including every named deviation from the brief.
3. **Was der Autor prüfen soll** — the licence question, the historical claim,
   the render, the figure that looks wrong.

Never report a package finished while part of it is unbuilt. Say which part and
why instead.
