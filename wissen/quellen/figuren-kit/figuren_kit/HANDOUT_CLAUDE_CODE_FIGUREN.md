# Handout für Claude Code: Schlachtfiguren aus Code. Grundlage: der König von England 1336

Stand 14.11.2026, geschrieben von Claude (Chat) für Claude Code. Lies alles, bevor du etwas tust. Die Entscheidungen stammen vom Autor. Wo dieses Blatt dem Repository widerspricht, gilt das Repository: Nenne den Unterschied und frage nach.

---

## 0. Auftrag

1. **Werkstatt übernehmen:** Das beiliegende Kit (`figuren_kit.zip`) als `tools/figuren/` ins Repository einbauen und aufräumen (§8). Am Verhalten ändert sich dabei nichts.
2. **König fertigstellen:** den König von England 1336 in **4 Richtungen** mit **allen Animationen** rendern (§4, §5), auch mit den noch fehlenden.
3. **Einbauen:** Text-Atlas mit `GENERATED`-Kopf, Schatten-Ebene und Ereignisse, im Nahmodus der Schlacht (§7).
4. **Prüfen und dem Autor zeigen:** Er sagt ja oder nein, du trägst es ins Musterbuch ein (§6).
5. **Danach:** weitere Figuren nach demselben Verfahren, schneller (§9).

Gezeigt und vorläufig angenommen sind die Sätze in **Südost (SE)**. Bilder davon liegen in `referenz/`.

---

## 1. Feste Entscheidungen des Autors

**Allgemein**
- **Figuren aus Code:** Die Figuren der Schlacht entstehen aus einem 3D-Werkstattmodell im Code. Das ist eine Ausnahme von „Bilder nur von PixelLab“. Trage sie in `CLAUDE.md` §2 ein mit dem Wortlaut: *„Figuren der Schlacht dürfen aus einem Werkstattmodell im Code gerendert werden (tools/figuren), mit Historiker vorher und nachher.“*
- **Kein Skelett im Spiel:** Ins Spiel kommen nur fertige Bilder.
- **Höchstens 24 sichtbare Farben je Figur.**
- **4 Richtungen** je Animation, jede eigens gerendert, **nie gespiegelt** (das Licht kommt immer von links oben).

**Stil wie im Spiel (Stilfibel `STIL.md` §8)**
- flache Flächen mit 2 Tönen je Stoff, Stahl mit 3 Tönen plus Glanz
- Umriss `#1f1b16`, Innenkanten einen Ton dunkler
- kein Rauschen, kein Raster

**Maße**
- Figur etwa 85 px hoch, im Nahmodus ganzzahlig ×2 gezeigt
- Zelle 114×114, fester Fußpunkt
- Seitenansicht 8° von oben

**Schatten:** Er wird aus der Pose berechnet und ist eine eigene Ebene.

**Bewegung natürlich wie bei einem geübten Schwertkämpfer**
- Füße stehen fest, das Becken trägt das Gewicht
- das Schwert läuft auf Bögen
- langsames Ausholen, schneller Hieb mit Wischspur
- der Schild zieht nach

Die KCD2-Videos dienen nur als Anschauung. **Nie Animationen kopieren.**

**Geschichte 1336**
- Wappen: England allein (drei goldene Löwen auf Rot). Die Vierung mit Frankreich erst ab 1340.
- Topfhelm mit offenem Lilienreif, ohne Bügel, ohne Mütze, ohne Hermelin.
- Cyclas: vorn kurz, hinten lang, mit Goldborte.
- Kettenhemd und Kettenbeinlinge mit Kniebuckeln, Schienbeinplatten, Ellbogen und Unterarmschienen.
- **Keine Ailetten** (der Autor: „sehen komisch aus“).

**Musterbuch:** Lies vor jeder Figur das Projektdokument „Musterbuch Figuren – Ja und Nein“. Es enthält alle Ablehnungen und Zustimmungen.

---

## 2. Wie eine Figur entsteht (Architektur der Werkstatt)

### 2.1 Raster und Einheiten
- Modelleinheit: Die Figur ist etwa 115 Einheiten hoch (1 Einheit ≈ 1,55 cm). Der Boden liegt bei y = 0, die Figur blickt nach +z, ihr linker Arm zeigt nach +x.
- Modellmitte (64, ·, 64). Im Raster wird um `WOFF` = 16 verschoben, weil das Raster 160 Einheiten breit ist (`KGRID=160`). So passen Sturz, Ausfallschritt und lange Klinge hinein.
- Auflösung `KS=1.4` Voxel je Einheit, also 224³ Voxel. Daraus entsteht das Rohbild (224 px). `KF=2` halbiert es zur Spielgröße (112 + 2 Rand = 114 px).

### 2.2 Bausteine (`king.py`, gemeinsam mit `k3d6.py`)
| Baustein | Was |
|---|---|
| `ellipsoid(c, r, mat)` | Ellipsoid |
| `capsule(A, B, r0, r1, mat)` | Röhre von A nach B mit wechselndem Radius (Glieder, Griffe, Grate) |
| `band(A, B, t0, t1, rin, rout, mat)` | Ring um eine Achse (Riemen, Borten) |
| `loft(pts, mat, cut)` | Körper aus Querschnitten entlang der Höhe (Rumpf, Rock, Helm); `cut` schneidet Säume, etwa Zacken oder den Cyclas-Schnitt |
| `sword_at(h, d, long, bmat, blade_only)` | Schwert am Griffpunkt h in Richtung d: Griff, Knauf, Parierstange, flache Klinge. `long` für das Langschwert, `blade_only` für die Wischspur |
| `lions(u, v, H, s)` | Wappenmuster (drei Löwen, zum Herzen gewandt) als Materialkarte auf Rock und Schild |
| `put(mask, mat)` | schreibt Material und eine **Teil-Nummer** (`pid`). An Grenzen zwischen Teilen zeichnet der Renderer später eine Innenkante |

Materialien (`MATS`): steel, mail, leather, gold, blade, wood, gules, or, azure, hole, dark, scab, smear … Jedes hat eine Tonleiter in `PAL` (`k3d6.py`, Funktion `render`).

### 2.3 Räume (Transformationen)
`set_space([SH, ROOT, BODY, UP])` legt fest, in welchem Raum ein Teil gebaut wird. Die Teile werden immer in ruhenden Modellkoordinaten beschrieben, die Transformation rechnet um.
- `SH`: Weltversatz (WOFF).
- `ROOT`: Wurzel, das heißt Erdung (tiefster Fuß auf den Boden), Schub nach vorn oder hinten, Sturz.
- `BODY`: Becken. Es wird beim Ausfallschritt mit dem Becken versetzt und kippt beim Tod um die Knie.
- `UP`: Oberkörper mit Neigung (`lean`) und Drehung (`twist`) um das Becken.
- Beine werden in `ROOT` gebaut, alles darüber (Rock, Arme, Helm, Schwert, Schild) in `UP`.

### 2.4 Pose
Eine Pose ist ein Wörterbuch:
- `hipL/kneeL/ankL/toeL`, `hipR/…`: Beingelenke.
- `shR/elR/wrR`, `shL/elL/wrL`: Arme.
- `grip` + `swd`: Schwertgriff und Klingenrichtung.
- `wrL` + `shn`: Schildhand und Schildrichtung.
- `lean`, `twist`, `root`, `body`.
- `sword=((Knauf), (Richtung))`: Schwert liegt am Boden, nach dem Tod.
- `smear=[(g,d), …]`: Wischspur.
- `loadout='shield'|'long'`.

### 2.5 Inverse Kinematik (`king2.py`)
- **Arme** (`ik`): Die Hand folgt dem Griff. Beim Langschwert greift die linke Hand 5 Einheiten tiefer am Griff. Der Ellbogen richtet sich nach einem Pol-Vektor (`poleR/poleL`).
- **Beine** (`leg_ik`): Der Fuß steht auf seinem Punkt (`fL/fR`), die Hüfte folgt dem Becken (`pel`). Das Knie zeigt nach vorn.

### 2.6 Rendern (`render` in `k3d6.py`)
- Orthografischer Strahlenwurf, Gier θ je Richtung, Neigung `phi=8°`. Bildursprung über `KOFF`.
- Normalen aus dem geglätteten Volumen.
- Licht im **Bildraum** von links oben, also für jede Richtung gleich.
- `FLAT=1` erzwingt den Spielstil: Stoff 2 Töne, Metall 3 Töne plus Glanz. Stahl spiegelt Himmel und Horizont. Innenkanten an Teilgrenzen sind einen Ton dunkler.
- Das Rohbild hat keinen Außenumriss. Er kommt erst im Pixelschritt.

### 2.7 Pixelschritt (`forge_hibit`, MIT)
1. Palette per k-means aus den Rohbildern eines Satzes, 24 Farben. **Beim Einbau auf `tools/palette.json` abbilden** (§7).
2. Verkleinern per Mehrheitsentscheid je 2×2 Block, ohne Mischfarben.
3. Einzelne verirrte Pixel entfernen.
4. Außenumriss `#1f1b16` setzen.

### 2.8 Schatten (`shadow_mask` in `king.py`)
- Jeder Voxel wird entlang der Sonne auf y = 0 projiziert (Bildraum-Richtung `(-0.30, 0.93, -0.22)`, also von links oben, leicht von hinten) und dann in die Kamera.
- Löcher schließen, 2×2-Mehrheit, Farbe `#181e0e` mit 38 % Deckkraft, harte Kanten.
- Eigene Datei `…_shadow.png`.

---

## 3. Animationen bauen

**Schlüsselposen** werden mit `K_(…)` geschrieben, dazu Stellungen:
- `GUARDF`: Deckung, linker Fuß vorn, Knie gebeugt.
- `LUNGEF`: Ausfallschritt, vorderer Fuß 12 Einheiten vor, Becken tief und vorn.
- `BACKF`: Gewicht hinten.
- `CROUCHF`: tief, für den Block.

**`seq(keys, counts, loadout, fast=(…))`** erzeugt die Bilder zwischen den Schlüsseln:
- Der Griff läuft auf einem Bogen um die Schultern, die Klinge dreht sich mit (`slerp`).
- Normale Abschnitte sind weich (`ease`). `fast`-Abschnitte (der Hieb) laufen linear und bekommen eine **Wischspur**: 3 Klingen-Kopien in `smear`.
- Ein versetzter Fuß hebt sich auf dem Weg. Der Schild folgt mit 20 % Verzögerung.

**Fortbewegung** über `gait(p, amp, flex)`: Beinschwung und Kniebeuge je Phase. Beim Jog gibt es eine Flugphase.

**Tod** über `death()`: getroffen, taumeln, Schwert fallen lassen, auf die Knie, nach vorn kippen. Die Unterschenkel bleiben dabei liegen.

### 3.1 Vorhanden (Südost)
| Satz | Schwert und Schild | Langschwert |
|---|---|---|
| Stand (Atmen) | 4 | 4 (Pflug) |
| Marsch | 8 | 8 (Schwert geschultert) |
| Jog | 8 | 8 |
| Vorrücken in Deckung | 6 | 6 |
| Block | 7 | 7 (Krone) |
| Konter | 10 (Stich, dann Hieb über den Schild) | 6 (Zwerchhau) |
| Stich | 7 | 7 |
| Oberhau | 8 | 9 |
| Unterhau | 8 | in der Kette |
| Schildstoß | 7 | – |
| Schlagkette | – | 13 (vom Tag, Oberhau, Unterhau, Stich) |
| Tod | 8 | 8 |

### 3.2 Noch zu bauen (nach denselben Regeln)
1. **Getroffen** (4 Bilder): Kopf und Rumpf weichen vom Schlag weg, ein halber Schritt zurück, Rückkehr in die Deckung.
2. **Rückzug** (rückwärts gehen in Deckung, 6 Bilder): Schleife, Füße stehen fest im Wechsel.
3. **Tod nach hinten** (8 Bilder): zweite Variante, damit nicht alle gleich fallen.
4. **Langschwert-Tod:** Die ersten zwei Bilder sollen mit **beiden** Händen am Griff sein. Im Moment hält er es dort nur mit einer.
5. **Sieg oder Gruß** (6 Bilder, optional): Schwert gehoben, Pause, zurück.
6. **Angriffs-Ereignisse:** Jede Angriffsanimation nennt das **Trefferbild** (der erste Wischspur-Frame nach dem Ausholen) und den Takt. Das braucht die Simulation.

Zeige jeden neuen Satz zuerst in SE und frag nach ja oder nein. Erst dann rendere die anderen Richtungen.

---

## 4. Die 4 Richtungen
- **Erst im Schlachtcode nachsehen**, wie viele Blickrichtungen die Nahfiguren nutzen (`CloseFigures`, die `kk_*`-Platten, die Laufrichtung der Truppe). Nimm genau diese 4.
- Wenn frei: **Diagonalen** SE (θ = 45), SW (−45), NE (135), NW (−135). SE ist abgenommen. Diagonale Ansichten zeigen Gesicht und Seite zugleich und lesen sich in Pixeln am besten.
- Jede Richtung wird gerendert, **nicht gespiegelt**. Das Licht bleibt im Bildraum links oben.
- **Prüfen:** Rückansichten (NE, NW) zeigen den Rücken der Cyclas (lang), die Schildrückseite (Holz) und die Scheide. Die Wischspur muss auch dort lesbar sein.

---

## 5. Laufen lassen

```bash
# im Ordner tools/figuren, Python 3 mit numpy, scipy, Pillow
KGRID=160 KS=1.4 KF=2 KLO=shield KOUT=out python3 -I -u king2.py   # Schwert und Schild, alle Sätze
KGRID=160 KS=1.4 KF=2 KLO=long   KOUT=out python3 -I -u king2.py   # Langschwert
KONLY=idle,block ...                                               # nur bestimmte Sätze
KGROUND=pfad/boden.png python3 -I king2_scene.py shield            # GIF auf dem Spielboden + Übersicht
```

- Heute rendert `king2.py` nur θ = 45. Für 4 Richtungen eine Schleife über die Richtungen einbauen. **Je Pose einmal bauen, dann alle 4 Richtungen rendern**, das spart die Hälfte der Zeit.
- **Laufzeit:** etwa 10 s Bauen und 2–3 s Rendern je Bild und Richtung. Rund 160 Bilder × 4 Richtungen ergeben etwa 1–2 Stunden auf 2 Kernen. Im Hintergrund laufen lassen, beide Ausrüstungen parallel.
- Der Speicher bleibt unter 1,5 GB je Prozess.
- Die Warnung `clipped` heißt: Ein Teil ragt aus dem Raster. Dann `KGRID` erhöhen oder die Pose anpassen.

---

## 6. Prüfung und Abnahme (vor dem Einbau)
1. Je Satz und Richtung ein Kontaktbogen (`king2_scene.py`): alle Bilder mit Schatten, ×2.
2. Je Satz ein GIF auf dem echten Spielboden (Bildschirmfoto des Nahmodus als `KGROUND`).
3. **Selbst ansehen**, bevor du es zeigst:
   - Steht der Fuß auf seinem Schatten, oder schwebt er?
   - Rutscht ein Fuß?
   - Geht die Klinge durch Schild oder Körper?
   - Ist das Wappen lesbar?
   - Sind es höchstens 24 Farben, ist der Umriss geschlossen?
   - Gibt es eine `clipped`-Warnung?
4. Prüfer:
   - historiker: 1336, vorher und nachher
   - aesthet: bekommt nur Bilder, nicht die Absicht
   - spieler: liest man den Schlag, wirkt es lebendig?
5. **dem Autor zeigen. Ja oder nein je Satz.** Jedes Nein und jedes Ja mit Grund ins Musterbuch eintragen (Projekt und `docs/`).

---

## 7. Einbau ins Spiel
- **Palette:** Jede Farbe auf `tools/palette.json` bringen (nächster Ton in OKLab, Reihenfolge der Leitern erhalten). Danach erneut prüfen: höchstens 24 sichtbare Farben.
- **Atlas:** Ein Skript in `tools/` schreibt einen Text-Atlas mit `GENERATED`-Kopf, keine Bilddatei im Repository.
  - Name: `koenig_england_1336/<ausrüstung>/<satz>/<richtung>/<bild>`.
  - Je Bild: Pixel als Index in die Palette, Fußpunkt (Anker), Haltezeit in ms. Bei Angriffen dazu das Ereignis `hit` mit dem Bildindex.
  - Schatten als eigene Ebene (eine Farbe mit Deckkraft).
- **Zeichnen in der Schlacht:** zuerst alle Schatten, dann alle Figuren, nach Fußpunkt sortiert. Ganzzahlig ×2, nearest. Ganz nah zeigt der Nahmodus diese Figuren, weiter weg bleiben die einfacheren.
- **Haltezeiten:**

  | Satz | ms je Bild |
  |---|---|
  | Stand | 170 |
  | Marsch | 110 |
  | Jog | 80 |
  | Vorrücken | 120 |
  | Block | 90–140 |
  | Angriffe | Ausholen 150, sonst 75 |
  | Tod | 120, letztes Bild bleibt liegen |

  Die Fortbewegung koppelt an die zurückgelegte Strecke, nicht an die Zeit, sonst rutschen die Füße.
- **Lizenzen:** `vendor/forge_hibit.py` (Agent Sprite Forge, MIT, © 0x0funky) und `vendor/pixelstudio.py` (pixel-art-studio, MIT, © Gamezxz) in `LICENSES.md` eintragen, im selben Commit.

---

## 8. Den Code aufräumen (der Zustand des Kits ist ein Prototyp)
- `k3d6.py` ist aus mehreren Durchläufen zusammengesetzt. Es enthält noch ein älteres `build()` und `POSE` von einem früheren Ritter, das beim Import einmal läuft. **Gebraucht werden daraus nur:** Raster und Arrays (`occ`, `mat`, `pid`), `MATS`/`MI`, `herald`, `render`, `PAL`.
- **Zielaufbau:**
  - `werkstatt.py`: Raster, Bausteine, Räume, Rendern, Schatten, Pixelschritt.
  - `teile/`: Helme, Röcke, Rüstung, Waffen, Schilde als Funktionen mit Parametern.
  - `figuren/koenig_england_1336.py`: das Modell aus Teilen.
  - `animationen/`: Stellungen, Schlüsselposen, Sätze.
  - `export_atlas.py`, `vorschau.py`.
- Umgebungsvariablen durch eine Konfiguration ersetzen.
- **Gleiches Ergebnis nachweisen:** Rendere Stand, Block und Oberhau in SE. Vergleiche Pixel für Pixel mit `referenz/` (Toleranz 0). Erst dann weiter.

---

## 9. Neue Figuren schneller (das Verfahren)
1. **Musterbuch lesen.**
2. **Historiker:** Beschreibung der Truppe für Jahr und Kultur, mit Quelle.
3. **Aus der Teile-Bibliothek zusammensetzen.** Die Teile-Sprache ist die des Spiels: `guise`-Teile aus `schlacht_truppen.json`, also Rüstungen (mail, padded, plate …), Stoff (shirt, cloak …), Feldzeichen, Schilde, Hüte, dazu die Volkskleidung aus `schlacht_voelker.json`. Farben über Farbzeile (Rock, zweite Farbe).
4. **Drei Testposen in SE** (Deckung, Hieb, Marsch) auf einem Bogen zeigen → ja oder nein.
5. **Alle Sätze in SE** → ja oder nein je Satz.
6. **4 Richtungen** → Atlas → Einbau → im Spiel ansehen.
7. **Gemeinsame Animationen wiederverwenden:** Schlüsselposen gehören zur Waffenart (Schild, Langschwert, Speer, Bogen), nicht zur Figur. Eine neue Figur mit derselben Waffe braucht nur ein neues Modell.

---

## 10. Bekannte Schwächen (beheben oder dem Autor nennen)
- Die Löwen auf der Cyclas sind bei 85 px nur angedeutet. Auf dem Schild sind sie lesbar.
- Die Cyclas ist starr. Bei großen Schritten schneiden Knie oder Beine durch den Saum. Möglich wäre, den vorderen Saum beim Schritt mit dem Oberschenkel mitzunehmen.
- Langschwert: Tod mit einer Hand am Griff (§3.2).
- Die Helmkrone ragt bei manchen Stürzen knapp an den Rand. Das Raster ist dafür auf 160 vergrößert, bitte `clipped` beachten.
