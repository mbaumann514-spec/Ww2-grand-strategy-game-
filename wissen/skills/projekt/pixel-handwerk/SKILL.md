---
name: pixel-handwerk
description: Pixel-art craft for Sacrum Imperium and the battle -- exact checks for imported PixelLab pictures (nubs, strips, holes, stray pixels, near-duplicate colours, closed outline, clipped cells), rules for code-drawn signs and effects (two-tone shading from a shifted stamp, dome lighting, selout, pixel-perfect lines), animation timing, palette ramps, and motion and video rules for teasers and update videos. Use when importing or checking pictures (tools/schlacht_icons.py, tools/schlacht_nah.py, tools/pixellab.mjs), drawing signs or effects in code (tools/schlacht_glyphs.py, Puffs.kt), animating, or cutting a video.
---

# Pixel-Handwerk

Gesammelt am 14. November 2026 aus acht Werkzeugsammlungen, die der Autor gegeben hat ("für dich, mach damit nichts
außer erstmal schauen und einbauen in deine Skills"). Alle MIT-lizenziert; **nichts davon ist im Spiel, kein Code
übernommen, nichts ausgeführt** -- hier stehen die Verfahren, in eigenen Worten. Wird ein Verfahren später in ein
Werkzeug unter `tools/` gebaut, kommt die Quelle in `LICENSES.md` und in den Commit.

| Sammlung | Urheber (MIT) | Was sie uns gibt |
|---|---|---|
| pixel-plugin | Brandon Williams | Handwerksregeln (Aseprite-Fernsteuerung selbst nicht für uns) |
| codixel | mankidev | genaue Prüfungen der Silhouette und der Streupixel, Selout, pixelgenaue Linien, Pferdegangarten |
| pixel-art-studio | Gamezxz | Python-Pipeline wie unsere: Schattierung aus verschobenem Stempel, Zellgrößen, Animationszeiten |
| claude-pxl | crsolver | Sprites als Textraster nach Palettenschlüsseln (fast unser Atlas), Rampen, Kuppel-Licht |
| pixel-art | Huiyan Wan | GIF-Kodierung in zwei Durchgängen, Layoutfallen |
| claude-skill-game-assets-enhancer | Adam Lyttle | Lesbarkeit, Einzelbilder als Abwandlung von Bild 1, "Juice" |
| pixel2motion | Nolan Lai | Bewegungstheorie, Zeiten, Bewegungsprüfungen per Bildsequenz |
| agent-sprite-forge (nur die Änderungsliste) | 0x0funky | Meisterfigur und Posen als „eine Änderung", Line-up, Farbreduktion in OKLab je Farbton, Flackern dämpfen über Bilder, Prüfungen von Gang und Füßen |

**Bindend bleiben die Regeln aus `CLAUDE.md`**: nur PixelLab (und AutoSprite für die Bewegung von PixelLab-Figuren),
keine Bilddatei im Repository, eine Palette, Licht von links oben. Was in den Sammlungen dagegen verstößt -- fremde
Bildgeneratoren (fal.ai, pixelcut, Foto-zu-Sprite), PNGs ins Arbeitsverzeichnis, Glühen und Licht außerhalb der Palette,
nicht-OFL-Schriften, aus fertigen Spielen abgeschaute Effekte, mitgelieferte Programmdateien -- wird **nicht** benutzt.

## 1. Prüfungen für die Norm (das Wertvollste)

Jede ist eine Zeile in einem Prüfbefehl (wie `python3 tools/schlacht_icons.py check`) und wird wie ein Test gelesen.

- **Silhouette** (codixel): *Nase* = deckendes Pixel mit höchstens einem deckenden Nachbarn (oben, unten, links,
  rechts); *Streifen* = Pixel mit genau zwei Nachbarn auf gegenüberliegenden Seiten (ein Pixel breit; erlaubt nur für
  Speer, Lanze, Zügel); *Loch* = leeres Pixel mit drei oder mehr deckenden Nachbarn. Glätten auf der Alphamaske
  **bevor** der Umriss geschlossen wird.
- **Streupixel**: kein deckender Nachbar; Kleinstgruppen unter einer Mindestgröße; ein Pixel, dessen Farbe keiner der
  acht Nachbarn teilt (codixel ersetzt es durch die Mehrheitsfarbe, Toleranz 60, nach Rastern 20).
- **Fast gleiche Farben**: größter Kanalunterschied ≤ 12 -- zusammenlegen.
- **Halbtransparenz**: kein Pixel darf es sein.
- **Grauer Saum** vom alten Hintergrund: Randpixel mit Sättigung ≤ 0,10.
- **Umriss geschlossen**: Anteil dunkler Randpixel (unsere Norm misst es schon, `outlineClosed`).
- **Raster-Verdacht**: Schachbrett-Wert, der von PixelLab gerasterte Ergebnisse meldet.
- **Abgeschnittene Zelle** (pixel-art-studio): ein deckendes Pixel am Zellrand ist ein Fehler (Speerspitze
  abgeschnitten). Zellgröße aus der Reichweite **aller** Bilder einer Bewegung plus mindestens 2 px, ein fester
  Drehpunkt an den Füßen.
- Eigene Vorschläge (nicht aus den Sammlungen, im Verweis so markiert): Kissen-Schatten, Streifenbildung, Treppen-
  Stufen entlang einer Kurve.
- Achtung: ein außen gesetzter Umriss verschiebt jede Koordinate um ein Pixel -- Sitz und Mitte danach messen.

## 2. Im Code gezeichnete Zeichen und Effekte

- **Zwei Töne aus einer Regel** (pixel-art-studio): Fläche als Schattenton füllen, dieselbe Form um ein Pixel nach links
  oben verschoben und beschnitten als Lichtton darüberstempeln. Das ersetzt unsere Randregel in
  `tools/schlacht_glyphs.py` sauber.
- **Kuppel-Licht** für runde Zeichen (claude-pxl): Abstand jedes Pixels zum Rand → Kuppel, Licht von links oben,
  dann in zwei Töne schwellen.
- **Selout** (codixel): Umriss zur Lichtseite heller, sonst dunkel; dazu ein heller Rand an der Lichtkante.
- **Pixelgenaue Linien** (codixel): bei jeder L-Stufe das Eckpixel entfernen -- für Speerschäfte und Lanzen im Code.

- **Ausführlich, mit eigener Probe:** `references/im-code-zeichnen.md` -- Reihenfolge, welche Form welches Licht
  bekommt (Flaches und Dünnes nie als Kuppel; für kleine Zeichen die verschobene Form), die sicheren Fehler, Rampen,
  Selout, kleine Größen, Prüfen.

## 3. Animation

- Zeiten (pixel-art-studio): Hieb ausholen 100–150 ms, Treffer 40–60, halten 80–120.
- Fußrutschen prüfen: der Weg je Schrittzyklus muss der Schrittlänge gleich sein; Bilder schreiten mit dem Weg fort,
  nicht mit der Uhr (game-assets-enhancer).
- Unruhe prüfen (codixel): ändern sich in einer ruhigen Fläche mehr als etwa 20 % der Pixel je Bild, ist es zu schnell.
- Pferd (codixel): Schritt im Viertakt, jeder Fuß rund 60 % des Zyklus am Boden; Trab in diagonalen Paaren, rund 40 %.
- Einzelbilder als Abwandlung von **Bild 1**, nie Bild aus Bild; nur die bewegten Glieder nennen (game-assets-enhancer)
  -- die Vorgabe für AutoSprite und PixelLab.
- Landung: kurzes Stauchen (~0,78 breit × 1,12 hoch, ~0,07 s), Staub knapp unter der Aufsetzlinie.

## 4. Palette

- Rampen ausdrücklich in `tools/palette.json` festlegen; Schatten ist ein Schritt die Rampe hinunter, nie eine neue
  Farbe (claude-pxl). Farbtonverschiebung je Schritt mäßig, 8–14°. Feste Plätze je Stoff machen Seitenfarben und
  Wappenvarianten zu einem Schlüsseltausch.

## 4b. Aus einer Meisterfigur arbeiten (agent-sprite-forge)

- Eine angenommene Figur ist die Meisterin; jede Pose und Ansicht ist „die Meisterin mit einer Änderung", übernommen
  werden nur die geänderten Zellen. PixelLab- und AutoSprite-Aufträge nennen nur, was sich ändert.
- Allein erzeugte Figuren kamen 10–25 % größer zurück; neben der Meisterin erzeugt behielten sie Größe und Pixelmaß.
  Ein **Line-up** stellt alle auf eine Bodenlinie und meldet die Höhen.
- Farben in **OKLab** verringern, mit einem Platz für jeden Farbton (sonst frisst die Häufigkeit den kleinen roten
  Helmbusch) -- unsere Norm schneidet bisher nach Häufigkeit.
- Über mehrere Bilder: ein Pixel behält seine alte Farbe, solange sie noch 80 % des Anteils der neuen hat (dämpft
  Flackern um ein Drittel bis die Hälfte).
- Gang: zwei Halbzyklen mit fast gleicher Silhouette (IoU ≥ 0,95) sind ein Fehler; der Fußpunkt ist die Unterkante
  der untersten stabilen Zeile; Schlag mit Trefferpause, Schläge auf Spiellänge kürzen (Hieb ~0,7 s, Treffer bei 40 %).
- Prüfbefehle enden mit einer klaren Zeile pass/warn/fail; WARN und FAIL werden wörtlich gemeldet.

## 5. Bewegung, Lesbarkeit, Videos

- Ablauf einer Einblendung 20/50/30 (Ausholen, Hauptbewegung, Ausklingen); Antwort auf Tippen 150–300 ms, Einblendung
  300–800 ms, Intro 1,2–2 s; Teile versetzt um 10–20 % ihrer Dauer, nie gleichzeitig; nüchterne Kurven für den
  Handschrift-Ton. Die Zahlen gehören in die JSON-Wertdateien (pixel2motion).
- **Schlussbild-Vertrag**: das letzte Bild einer Animation gleicht dem stehenden Bild Pixel für Pixel (mit `--film`
  gegen einen Screenshot prüfbar).
- **Stocken und Springen** messen: alle ~10 ms die "Tinte" zählen (RGB-Mittel < 120); ein Schritt ≤ max(2, 5 % des
  Medians) ist Stillstand, > 3 × Median ein Sprung; Stillstand gefolgt von Sprung fällt durch (Staubwolken,
  Marschwege, Aufbau-Einblendungen).
- Hintergrund immer ruhiger als das Spielfeld; nichts Antippbares als Kulisse; Unschärfe-Probe: Bildschirm
  verwischen, der Blickpunkt muss noch herausstehen.
- Videos: MP4 libx264, CRF ~16, yuv420p, faststart; **skalieren nur ganzzahlig mit nearest**, nie lanczos (verschmiert
  Pixel). Kleine Vorschau als GIF in zwei Durchgängen (Palette bauen, mit Bayer-Rastern anwenden).

## Verweise

Die ausführlichen Zusammenfassungen, je Verfahren mit Herkunft und wie es auf unsere Skripte passt:
`references/zeichnen-pruefen-animieren.md` (die ersten vier Sammlungen) und
`references/bewegung-lesbarkeit-video.md` (die nächsten drei) und `references/sprite-forge-aenderungsliste.md`
(agent-sprite-forge, nur aus seiner Änderungsliste; sein Bildweg über fremde Generatoren ist für uns verboten). Die entpackten Sammlungen selbst liegen nur im
Scratchpad und sind nicht im Repository.
