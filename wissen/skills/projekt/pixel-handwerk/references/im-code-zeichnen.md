# Im Code zeichnen: was die Sammlungen lehren (gelesen am 14. November 2026)

Gelesen als Lernstoff: codixel (SKILL.md, core/pixel.js), pixel-art-studio (references/techniques, sharp_edges,
patterns), claude-pxl (SKILL.md, lighting.md, src/core/normals.ts). Alle MIT. Nichts ausgeführt, nichts übernommen,
in eigenen Worten. Gilt für das, was bei uns im Code gezeichnet werden darf: die Zeichen (`tools/schlacht_glyphs.py`),
Effekte (`Puffs.kt`) und die herausgezoomten Stufen der Schlacht (CLAUDE.md, 11. November 2026).

## Die Reihenfolge (pixel-art-studio)
1. Silhouette in einer Farbe -- liest sie sich als flache Form nicht, jetzt ändern, nie beim Auge anfangen.
2. Große Farbflächen je Stoff, ohne Schatten.
3. Licht (oben links) und Schatten: ein Schattenband, ein Lichtband je Stoff.
4. Umriss -- eine Art für das ganze Projekt, immer 1 px.
5. Einzelheiten und Kantenglättung zuletzt; braucht eine Einzelheit mehr als drei Farben, fällt sie weg.

## Licht: welche Form welches Licht bekommt (codixel)
- **Rundes mit Volumen** (Körper, Kopf, Pferdehals, Fass, Stein, Schildbuckel): Höhe aus dem Abstand zum Rand
  (Kuppel), Licht aus der Neigung, dann in flache Bänder schwellen.
- **Flaches und Dünnes** (Fahne, Tuch, Blatt, Papier, Schild als Fläche, Schaft, Sehne): **nie** als Kuppel -- es wird
  aufgeblasen und plastikhaft. Seine Töne kommen aus seinem eigenen Bau: Falten, Nähte, Kanten, ein Ende heller als
  das andere.
- **Kantiges** (Klinge, Brett, Balken): abgeschrägte Kante über 1–2 px, flache Oberseite.
- **Selbst erprobt, 14. November 2026:** Kuppel-Licht auf den zwölf Schlachtzeichen -- die Fahne blähte sich, 3 px
  breite Schäfte wurden fast ganz Schattenton, das Ganze dunkler und unruhiger (mehr Streupixel) als die schlichte
  Randregel. Für so kleine, schmale Formen ist **die verschobene Form** besser: die Silhouette im Schattenton, dieselbe
  Form um 1 px nach oben links versetzt und auf die Silhouette beschnitten im Lichtton darüber (pixel-art-studio).
  Das gibt Schattensicheln unten rechts von selbst und klappt bei jeder konvexen Form.

## Die Fehler, die man sicher macht (pixel-art-studio „sharp edges", codixel)
- **Kissen-Schatten:** alle Ränder gleich dunkel -- der Schatten folgt dem Licht, nicht dem Umriss. Probe: liegt der
  dunkelste Ton überall am Umriss? Dann neu.
- **Bänder parallel zum Umriss,** je 1 px -- eine Treppe. Bandbreiten verändern, Bänder quer über die Form legen.
- **Jeder Tonfleck braucht einen Grund, den man benennen kann** (Licht, Falte, Naht, Schatten eines Teils darüber).
  Flecken ohne Grund sind Rauschen und fliegen raus.
- **Kurven** steigen gleichmäßig (Läufe 1,1,2,3, nie 1,3,1); erst die Form richten, dann glätten. Diagonalen von Ecke zu
  Ecke, kein Eckpixel in der Stufe (pixelgenau). 45° sieht am saubersten aus.
- **Kantenglättung** nur zwischen zwei Farbflächen, ein Pixel je Stufe, nie zwei; gegen durchsichtig keine; unter
  16 px gar keine.
- **Raster (Dither)** nur als Saum zwischen zwei Bändern und nur bei großen Flächen; nie auf kleinen oder bewegten
  Figuren (flimmert).
- **Kleine Kreise** mit dem Mittelpunktverfahren oder von Hand, nicht mit `ellipse` unter etwa 12 px (schief).
- **Ein außen gesetzter Umriss** verschiebt alles um 1 px und braucht 1 px freien Rand.
- **Flood-Fill** läuft durch rein diagonale Lücken.

## Farben
- Rampe 3–5 Töne: Schatten kühler, Licht wärmer, 10–25° je Stufe, Sättigung in der Mitte am höchsten, Helligkeit
  15–25 % auseinander (enger = Matsch). Mehrere Stoffe dürfen ihren dunkelsten Ton teilen (spart Plätze, ist zugleich
  der Selout-Ton). Echte Stoffe sind gedämpfter als gefühlt gewählte Farben.
- Bei uns gilt die eine Palette (`tools/palette.json`): die Rampe wird aus ihr gewählt, nicht frei gerechnet.

## Umriss und Rand (codixel, pixel-art-studio)
- Selout: Umriss zur Lichtseite im Mittelton des Stoffs, sonst dunkel; Randlicht (die zum Licht weisenden Randpixel
  eine Stufe heller) **vor** dem Selout setzen, sonst landet es auf dem Umriss.
- Bei Zweifel drei Fassungen nebeneinander zeigen: ohne Umriss, mit Selout, mit Randlicht und Selout -- der Autor
  wählt.

## Kleine Größen
- Andeuten statt zeichnen: 2×1 dunkle Pixel = Gürtel, 2 senkrechte = Mund. Zeichen 16–32 px: 4–6 Farben, Lesbarkeit
  allein aus der Silhouette (Schwert = lange Diagonale), ein Lichtfleck an der Lichtecke, fertig.
- Kleinste Größe wählen, die das Motiv trägt; was man in 1× nicht sieht, schadet.
- Teile, die sich wiederholen (Blätter, Finger, Speere im Bündel), leicht verschieden in Winkel und Größe; gespiegelt
  nur mit gebrochener Symmetrie (und bei uns nie, wenn das Licht dadurch von rechts käme).

## Prüfen (codixel)
- Nach jedem Schritt zählen, **wie viele Pixel er geändert hat und wo** -- null Änderungen oder Änderungen am falschen
  Teil heißen: der Schritt hat nicht gewirkt, auch wenn der Code ohne Fehler lief.
- Messen, nicht nur schauen: keine Nasen, Streifen, Löcher in der Silhouette; die Rampe weitgehend genutzt, keine
  Farbe über der Hälfte der Fläche; Teile, die sich wiederholen, innerhalb von etwa 15 % gleich groß.
- Jedes Bild selbst zurücklesen (Read), als ein Bogen mit allen Fassungen, bevor es jemand sieht.
- Bauskript ist die Quelle, das Bild nur Ergebnis: Änderungen gehen ins Skript.
