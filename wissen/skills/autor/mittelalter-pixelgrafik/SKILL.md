---
name: "mittelalter-pixelgrafik"
description: "Bei jedem Bild für des Autors Mittelalter-Spiele (Sacrum Imperium, Dorfspiel, Schlacht): Pixelgrafik in festen Auflösungen, sauberes Handwerk, historisch genau um 1336, PixelLab-Ablauf und Prüfung."
---

# Mittelalter-Pixelgrafik: schöne, genaue Bilder für beide Spiele

Du planst, beschreibst, erzeugst, importierst oder prüfst ein Bild für ein Mittelalter-Spiel des Autors. Das kann ein Gebäude sein, eine Figur, ein Tier, ein Boden, ein Baum, ein Symbol, ein Wappen, ein Porträt, ein Ereignisbild, ein Effekt oder eine Animation.

**Die beiden Spiele:**

| Spiel | Art | Format | Repository |
|---|---|---|---|
| *Sacrum Imperium* | Grand Strategy | hochkant | `grand-strategy-game-` |
| Dorfspiel (Arbeitstitel) | Dorfaufbau mit Überfällen, isometrisch | quer | `medieval-village-building-game-` |

**Die anderen Skills:**
- **Ästhetik, Palette, Schrift und HUD** stehen in `mittelalter-hud`; dieser Skill setzt sie voraus.
- **Spielbezogenes** steht in `sacrum-imperium-hud` und `dorfspiel-hud`.

**Zuerst lesen, wenn erreichbar:**
- `docs/STIL.md` §8 (*Sacrum Imperium*);
- `docs/HISTORIKER.md` und `data/look.json` (Dorfspiel);
- `zweitspiel/docs/HANDOUT_AESTHETIK.md`;
- die `CLAUDE.md` des Spiels.

Wo eine Datei Neueres sagt, gilt die Datei. Nenne den Unterschied.

---

## 1. Das Ziel

**Schön, ruhig, lesbar und richtig für 1336, im Geist der illuminierten Handschrift.**
- Jedes Bild muss neben die Visionsbilder des Autors passen.
- Die Richtschnur sind laut dem Autor (14.10.2026) **der Berater-Mönch und die Herrscherporträts**:
  - wenige Farben;
  - flache Flächen mit zwei Tönen;
  - Licht von links oben;
  - dunkle Kanten nur, wo die Form endet;
  - Gesichter aus wenigen Pixeln;
  - eine Geste je Bild.
- Das Dorfspiel zeigt **mehr Detail**, aber **dieselbe Handschrift**. Mehr Detail heißt mehr Pixel je Ding, nie größere Pixel und nie Verläufe.

**Feste Regeln beider Spiele** (aus den `CLAUDE.md`):
- Nur PixelLab als Generator. Ausnahme seit 12.11.2026: Schlachtfiguren dürfen auch aus der eigenen 3D-Render-Strecke kommen (§3.3).
- Keine Bilddatei im Repository; Bilder kommen als Text-Atlas mit `GENERATED`-Kopf ins Spiel, der Rohbild-Cache bleibt außerhalb von git.
- Eine Palette: `tools/palette.json`.
- Vorlagen nur PD oder CC0.
- Der `historiker` prüft jedes Bild **vorher und nachher**.
- `LICENSES.md` wird im selben Commit gepflegt.
- Ein PixelLab-Konto für beide Spiele: Vorhandenes zuerst nutzen; unter 20 Generierungen den Autor fragen.

## 2. Maßstab: ein Pixelmaß je Bildschirm, nur ganze Zahlen

1. **Ganze Vielfache, ungefiltert (nearest).** Ein Bildpixel wird nie zu anderthalb.
2. **Ein Pixelmaß je Bildschirm.** Alle Dinge, die zusammen gezeigt werden, haben dieselbe Pixelgröße. Ein größeres Ding hat **mehr** Pixel, keine größeren. Gemischte Pixelgrößen („Mixels“) sind der häufigste Fehler (Slynyrd; Community-Konsens).
3. **Nie umrechnen.** Kein Bild wird verkleinert oder vergrößert, um eine andere Größe zu bekommen. **Jede gezeigte Größe wird in dieser Größe erzeugt.** Ein Porträt für Listen ist ein eigenes Bild, kein verkleinertes großes.
4. **Kamera und Figuren auf ganze Bildpixel setzen.** Zoom nur in ganzen Stufen.
   - So machen es beide Spiele schon: *Sacrum Imperium* mit seiner Pixelschrift-Stufe ×3 auf 1080×2400, das Dorfspiel mit `uiScale` 3 und `zoomMin`–`zoomMax` 1–5 in `data/look.json`.
   - Sonst flimmern ungleich breite Pixel beim Schwenken.
5. **Oberfläche und Welt dürfen verschiedene Maße haben** (HUD ×3, Welt ×2 beim Zoom). Innerhalb einer Ebene ist das Maß aber eins.

## 3. Auflösungen je Bildart

**Bestand** heißt: so im Code gemessen (29.10.2026). **Regel** heißt: so wird Neues gemacht. Eine Abweichung von der Regel braucht einen Grund im Commit.

### 3.1 Sacrum Imperium (hochkant 1080×2400, Karte von Europa)

| Bildart | Bestand (Pixel) | Regel für Neues |
|---|---|---|
| Symbole | 24, 32, 48, 64, 128 (die meisten 32) | 24 / 32 / 48. Gezeigt bei 24 dp, Tippfläche ≥ 48 dp. 64 und 128 nur für große Tafeln (Ereignis, Stadt) |
| Wappen | 32×36 | 32×36. Andere Schildmaße nur, wenn alle neu gemacht werden |
| Burgen, Städte, Orte | 64×64 | 64×64; „Karte ganz nah“: 48×48 |
| Truppen auf der Karte | 32×32, 40×40 | 32×32 Fußvolk, 40×40 Reiter und Gerät |
| Ereignisbilder | 96×72 | 96×72; Kopfbild einer großen Seite höchstens 160×120 |
| Porträt-Ebenen | 64×64, Karte 112 (×2 = 224 px auf 1080) | Ebenen in Kartengröße; kleine Porträts für Listen eigens in 32 / 48 erzeugen |
| Berater | 40×48, 24 Posen (6 je Glaube) | 40×48 |
| Grund (Bäume, Gipfel, Felder) | 24×16 bis 32×32 | ohne Umriss; dieselbe Pixelgröße wie die Orte daneben |
| Provinzansicht („Pixel-London“) | Gebäude 32–64 | eine Szene von etwa Bildschirmbreite in Bildpixeln; Gebäude 32–64 |

### 3.2 Dorfspiel (quer 2400×1080, isometrisch)

| Bildart | Bestand (Pixel) | Regel für Neues |
|---|---|---|
| Bodenfeld | Raute **64×32** (`Ground.W/H`), Kacheln 64×64 | 64×32 oben, ohne Umriss; Höhe in Schritten von 2 px |
| Gebäude | Größe 2: 100–128 breit; Größe 3: 128–188 breit (`village.json` `size`) | **Breite höchstens 64 × Größe** (2 → 128, 3 → 192, 4 → 256); Höhe nach Gebäude, meist das 0,8- bis 1,2-Fache der Breite; der Fuß sitzt genau auf der Raute |
| Bäume, Büsche, Steine | Bäume 47–78 × ~90, Busch 44×39 | Bäume etwa 48–80 breit, 90 hoch. Laut Stilfibel gehört Wald zum **Grund**: **kein** Umriss, gedämpft (der umrandete Wald bei Pskow war der Fehler). Ob einzelne Dorfbäume als Dinge Umriss tragen, entscheidet der Autor. Eine Baumart je Hang, nicht gemischt |
| Figuren (Papierpuppe) | Leinwand **48×48**, mit Waffe **64×64** | 48×48, Figur ~30–34 px hoch; Reiter und Helden 64×64; alle Ebenen auf **einer** Leinwand mit **einem** Fußpunkt |
| Straßen | 64×64, 18 Kanten-Masken | 64×64, Masken nach PixelLabs Regel (N/O/S/W) |
| Effekte (Rauch, Staub, Funken) | – | 32–64, 4–6 Bilder |
| Oberfläche, Symbole | aus *Sacrum Imperium* | 24 / 32, Rahmen als 9-Slice mit 8–12 px Ecken |

**Farben je Bild** (Vorschlag; der Autor entscheidet und es kommt in die `CLAUDE.md` des Spiels):

| Bildart | *Sacrum Imperium* | Dorfspiel |
|---|---|---|
| Figur | etwa 15 Farben (Richtschnur Mönch) | 12–20 |
| Gebäude | – | 16–24 |
| Symbol | 4–8 | 4–8 |

Alle Farben stammen aus der Palette.

### 3.3 Schlacht: die Norm 32×32 (12.11.2026)

Der Autor hat am 12.11.2026 die Größe 32×32 gewählt und Claude die Festlegung des Stils übertragen; er kann jede Zeile ändern. **Richtschnur sind die Karten-Truppen `trp_*` in `PixelLabArt.kt`** (vor allem `trp_fuss`, `trp_waffen`, `trp_armbrust`, `trp_ritter`) und der Berater-Mönch. Die alten Schlachtfiguren `kk_*` und `k_*` (64×56, 96×80, 43–75 Farben) sind **keine** Richtschnur und werden ersetzt.

**Maße**

| Was | Norm |
|---|---|
| Leinwand Fußvolk | 32×32 |
| Leinwand Reiter, Gerät und Stangenwaffen im Stoß | 40×40 |
| Fußpunkt | Sohle auf Zeile 29 (von 0 gezählt), waagrecht mittig; die zwei Zeilen darunter bleiben frei für den Bodenschatten |
| Figurhöhe Fußvolk | 27–28 Pixel |
| Proportion | Kopf mit Helm 10 Pixel, Rumpf mit Rock 13, sichtbare Beine 4–5; rund 2,7 Köpfe, wie `trp_fuss` |
| Waffenlängen | fest über alle Bilder und Richtungen; nie am Leinwandrand abgeschnitten (äußerste Zeile und Spalte bleiben leer) |

**Farben: 16 feste Plätze je Figur** (damit Tracht und Wappen im Shader nur eine Farbzeile tauschen)

| Platz | Rolle |
|---|---|
| 0 | durchsichtig |
| 1 | Umriss `#1f1b16` |
| 2–3 | Haut hell, Haut Schatten |
| 4–6 | Stahl dunkel, mittel, Glanz |
| 7–8 | Tuch A hell, Schatten (Seitenfarbe und Tracht) |
| 9–10 | Tuch B hell, Schatten (zweite Tinktur, Futter, Pferdedecke) |
| 11–12 | Leder hell, Schatten |
| 13–14 | Holz hell, Schatten (Schaft, Schild, Bogen) |
| 15 | Akzent (Gold, Zinnober, Federn) |

- Höchstens 15 sichtbare Farben, jede aus `tools/palette.json`, jede mit mindestens 3 Pixeln im Bild.
- Zwei Töne je Stoff, drei nur für Stahl. Keine Verläufe, kein Rastern. Die reichere Schattierung des Speerknecht-Vorzeigebilds gilt bei 32 Pixeln nicht; von ihm gelten Haltung, Griff und Gewicht (`mittelalter-anatomie` §0).
- Umriss außen 1 Pixel `#1f1b16`, rundum geschlossen, in jedem Bild. Innenlinien einen Ton dunkler als die Fläche.
- Licht von links oben in allen Richtungen. Nie spiegeln.

**Richtungen und Bilder**

| Bewegung | Fußvolk | Reiter | Haltezeit |
|---|---|---|---|
| Stehen | 2 | 2 | 400 ms |
| Gehen / Schritt | 6 | 6 | je 133 ms |
| Galopp | – | 6 | je 67 ms |
| Angriff (Stoß, Hieb, Schuss) | 6 | 6 | 100 / 33 / 33 / 67 / 100 / 67 ms |
| Getroffen | 2 | – | je 100 ms |
| Fallen | 6 | 6 | je 100 ms, letztes Bild bleibt |

- 8 Richtungen, jede eigens erzeugt. Fußvolk also 22 Bilder × 8 = 176, Reiter 26 × 8 = 208 je Truppentyp.
- Bewegung bei 32 Pixeln: Kopfwippen 1 Pixel; Stoß mit Ausfallschritt von 2–3 Pixeln, Rumpf 1–2 Pixel tiefer, Spitze läuft gerade; Fallen in drei Stufen (Knie, Rumpf, Kopf); ruhige Teile bleiben pixelgleich. Einzelheiten in `mittelalter-anatomie`.

**Zoom und Leistung**

- Nur ganze Stufen ×1 bis ×5, ungefiltert.
- **Zoom-Leiter (der Autor, 12.11.2026):** Jede Stufe baut auf der Stufe davor auf; man zoomt in *dieselbe* Figur hinein, nicht in eine andere.

| Stufe | Satz | Rolle |
|---|---|---|
| ganz fern | Farbstempel | Massen als Blöcke |
| fern und mittel | **32×32** (Reiter 40×40) | die Grundfigur nach dem Vorbild der Basisspiel-Truppen `trp_*`; sie wird zuerst gebaut und animiert |
| nah | **64×64** (Reiter 80×80) | die Detailfigur, aus der Grundfigur abgeleitet |

- **Die Detailfigur entsteht aus der Grundfigur:** Jeder Pixel der Grundfigur wird zu 2×2 Pixeln, dann wird verfeinert (Gesicht, Nieten, Falten, Riemen). Gleich bleiben: Umriss und Silhouette, Proportion, Fußpunkt (×2), die 16 Farbplätze, Richtungen, Bildzahl und Haltezeiten. Erlaubt ist ein dritter Ton je Stoff.
- **Leiter-Probe (Pflicht):** Die Detailfigur wird auf die Hälfte verkleinert (häufigster Farbplatz je 2×2-Block) und mit der Grundfigur verglichen. Mindestens 85 % der Pixel müssen denselben Farbplatz haben, in jedem Bild jeder Bewegung. So springt beim Umschalten nichts.
- **Umschalten:** Der Nah-Satz ersetzt die Grundfigur ab der Zoomstufe, in der er mit ganzer Stufe gezeichnet werden kann (64er-Satz bei ×2 entspricht 32er-Satz bei ×4). Auf einem Bildschirm gilt immer ein Pixelmaß für Figuren, Gerät und Boden.
- **Eine Blickart je Stufe:** Figuren, Wagen, Geschütze und Gerät sind aus demselben Winkel gezeichnet. Ein Wagen von oben neben Soldaten von der Seite ist ein Fehler.
- **Reihenfolge der Arbeit:** erst die Grundfigur mit allen Bewegungen fertig und geprüft, dann die Detailfigur. Nie umgekehrt, und nie die Detailfigur verkleinern, um die Grundfigur zu gewinnen.
- Der Nah-Satz wird nur für die Truppentypen geladen, die in der Schlacht vorkommen. Richtwert Speicher nah: Fußtyp rund 0,7 MB, Reitertyp rund 1,3 MB.
- Alle Figuren liegen in **einem Atlas mit Paletten-Index** (ein Byte je Pixel); Tracht und Wappen sind eine Farbzeile je Soldat, nie eine eigene Textur. Richtwert Speicher: Fußtyp rund 0,2 MB, Reitertyp rund 0,35 MB.

**Herstellung:** PixelLab, ein Render aus der eigenen 3D-Strecke oder die Voxel-Strecke (§3.4). Alle müssen dieselbe Prüfung bestehen und werden im Quelleneintrag benannt.

**Prüfmaße (wie ein Test zu lesen, jedes Bild):**
1. Leinwand 32×32 oder 40×40, Sohle auf Zeile 29 bzw. dem festen Fußpunkt.
2. Höchstens 15 Farben, alle aus den 16 Plätzen, keine Farbe unter 3 Pixeln.
3. Rand zu 100 % `#1f1b16`.
4. Fußlinie in allen Bildern einer Bewegung gleich (außer Fallen); Figurhöhe schwankt höchstens um das Wippen.
5. Kein deckender Pixel in der äußersten Zeile oder Spalte.
6. Nachbar-Test neben `trp_fuss` und `trp_ritter`: gleiche Kopfgröße, gleicher Detailgrad. Für die Detailfigur zusätzlich die Leiter-Probe gegen ihre Grundfigur.
7. `historiker` für 1336: kein Vollharnisch, kein Visierhelm, keine Handbüchse im Grundsatz.

### 3.4 Schlacht: die Voxel-Strecke (13.11.2026)

Der Autor hat am 13.11.2026 entschieden, Schlachtfiguren über ein **Voxelmodell** (Pixel-Klötzchen in 3D) herzustellen, weil er einen Pixelstil mit mehr Detail will. Anlass: Die Umwandlung eines 52-Pixel-Sprites mit einem Bild-zu-3D-Dienst gab Klotzmasse mit Farbbrei, ohne Gesicht und mit zu dickem Speer. Ein 128-Pixel-Bild war dagegen zu fein, zu realistisch und ohne Soldatenausrüstung (Autor, 13.11.2026). Daraus folgt: **Die Eingabe liegt dazwischen, bei etwa 64 Pixeln Höhe im flachen Stil des Vorzeige-Speerknechts `kk_spear2`, und sie muss als Soldat lesbar sein.**

**Die Ausgabe bleibt die Norm aus §3.3:** dieselben Bilder (32×32 / 40×40 und 64×64 / 80×80), dieselben 16 Farbplätze, dieselben Bildzahlen, Richtungen und Prüfmaße, dieselbe Zoom-Leiter. Neu ist nur der Weg dorthin.

| Schritt | Norm |
|---|---|
| Eingabe | Sprite nach der Norm in §3.5 (Leinwand 64×64, Figur 54–56 Pixel hoch), **eine Ansicht von vorn**, Arme und Beine frei vom Körper. Flache Töne, wenig Gesichtsdetail, kein Bart, keine feine Textur. Eine Generierung je Truppentyp (Standardmodus), Stilbild: der Speerknecht `kk_spear2`. Seiten und Rückseite werden nach Regeln aus der Vorderansicht ergänzt. |
| Soldat lesbar | Jede Figur trägt **sichtbar Kriegsgerät**: Eisenhut oder Kesselhaube, gepolsterter Waffenrock (Gambeson) oder Kettenhemd (Kapuze oder Ärmel sichtbar), Waffe mit Eisenspitze. Kein Bauernkittel mit Spazierstock. Das ist die Richtschnur der Basisspiel-Truppen `trp_fuss` und `trp_waffen`. |
| Farben vorab | Die Eingabe wird **vor dem Bau** auf die 16 festen Plätze aus §3.3 abgebildet; das Voxelmodell enthält nur diese Farben. So bleibt der Tausch von Tracht und Wappen im Shader möglich. |
| Raster | Voxelhöhe ungefähr gleich der Eingabehöhe (rund 64). |
| Aufbau | Körper per Raumschnitt aus den Silhouetten der 8 Ansichten, Farbe aus der nächsten Ansicht; danach Ergänzung von Hand: Gesicht, Hutkrempe, Gürtel, Saum. **Der Speer und andere dünne Waffen werden immer neu gebaut** (fester Querschnitt, feste Länge), nie aus Pixeln gewonnen. |
| Teile | Kopf mit Hut, Rumpf mit Rock, zwei Arme, zwei Beine, Waffe sind getrennte starre Voxelteile mit Gelenkpunkt. |
| Bewegung | Skelett in Blender; freie CC0-Animationen (z. B. Quaternius) oder eigene Posen nach `mittelalter-anatomie`. Gehen, Stoß, Fallen nach den Bildtabellen in §3.3. Kein Skelett im Spiel, nur fertige Bilder. |
| Render | Orthografisch, ohne Kantenglättung, in Endgröße (32/40 und 64/80), Kamerawinkel wie die Basisspiel-Truppen `trp_*`. Toon-Schattierung mit 2–3 Stufen, Licht fest links oben an die Kamera gebunden, nie gespiegelt. |
| Nachziehen | Nach dem Render: Palette auf die 16 Plätze, Umriss `#1f1b16`, Flimmerglättung (ruhige Teile pixelgleich). Verschwinden Hutkrempe oder Speer beim Verkleinern, werden sie als 1-Pixel-Linie oder -Fläche nachgesetzt. |

- **Proportion:** Das 3D-Master hat die Proportion der Norm (rund 2,7 Köpfe), sonst besteht der Nachbar-Test gegen `trp_fuss` nicht. Wählt der Autor die Speerknecht-Proportion (rund 4,5 Köpfe), ändern sich Kopf- und Figurhöhe in §3.3 für alle Truppen. **Entscheidung des Autors, bis dahin gilt 2,7.**
- **Zusätzliche Prüfung:** in allen 8 Richtungen und allen Bildern kein verschwindender Teil (Hut, Waffe, Schild); beim Gehen rutscht der Standfuß nicht; die Zahl der sichtbaren Voxel-Kanten (Klötzchenoptik) ist nach dem Verkleinern nicht mehr erkennbar.
- **Quelleneintrag** nennt: Voxel-Strecke, Eingabesprite (Werkzeug, Größe, Zahl der Generierungen), Animationsquelle samt Lizenz.
- **Kosten:** Eine Eingabe-Generierung je Truppentyp. Weitere nur nach Freigabe des Autors.

### 3.5 Schlacht: Truppen-Sprites, Schritt 1 (13.11.2026)

Schritt 1 der Figurenstrecke: Für die schon fertigen einfachen Truppen der Kulturen im Spiel (Platten `kk_*`, gezeichnete Nahfiguren `CloseFigures`, Daten `schlacht_voelker.json`, `schlacht_truppen.json`) entsteht mit PixelLab je Truppe **ein detailliertes Sprite in einer Pose**. Das Spielobjekt ist die Grundlage (Stilbild und Vorlage), nicht ersetzt. Dieses Sprite ist die Eingabe der Voxel-Strecke (§3.4). Die Ausgabenorm §3.3 bleibt unberührt.

**Größe**

| Maß | Norm |
|---|---|
| Leinwand | **64×64**, Fußvolk. Reiter und Gerät: eigene Norm später, bis dahin 96×80 wie `kk_reiter*`. |
| Figurhöhe | **54–56 Pixel** von Hutspitze oder Helmkamm bis Sohle. Fußpunkt: Sohlen auf **Zeile 59**, Mitte der Figur auf Spalte 31/32. |
| Rand | Äußerste Zeile und Spalte leer (wie §3.3 Punkt 5); mindestens 4 leere Pixel unter den Füßen. Kein Bodenschatten im Bild, er wird im Spiel gezeichnet. |
| Breite | Körper höchstens 24 Pixel breit; Waffe und Schild dürfen bis Spalte 6 und 57 reichen. |
| Proportion | Die des Spielobjekts (`kk_spear2`: Kopf mit Hut rund 14–16 Pixel, also etwa 3,5 Köpfe). Die Entscheidung des Autors zu 2,7 oder 3,5–4 Köpfen (§3.4) bleibt offen und betrifft erst die Ableitung nach §3.3. |

**Pixel**

- Ein Pixelmaß: kein Bildteil in halber oder doppelter Größe, nicht skaliert, nicht gefiltert, keine Kantenglättung (§2). Eigene Generierung in 64×64, nie größer erzeugt und verkleinert.
- Licht von links oben, Umriss außen 1 Pixel `#1f1b16`, geschlossen, auch an den Füßen. Innenlinien einen Ton dunkler als die Fläche, nicht schwarz.
- Keine verwaisten Pixel, keine Verläufe, kein Rauschen, kein Dithering außer der Kettenhemd-Fläche (siehe Detail).

**Farben**

- Die 16 festen Farbplätze aus §3.3; höchstens 15 sichtbar, jede Farbe mindestens 3 Pixel. Zwei Töne je Stoff, drei für Stahl.
- **Farbklassen sauber getrennt**, damit das Trachten-System sie nach Farbe sortieren kann (`schlacht_trachten.json`): Stoff, Stahl, Leder und Holz, Haut, Rest. Kein Ton darf zwei Klassen zugleich sein (kein graubrauner Mischton zwischen Stahl und Leder).
- Farbe, Hautton und Stoffart wie das Spielobjekt der Kultur; keine eigene Umfärbung.

**Detail** (mehr als die Platten `kk_*`, weniger als ein 128-Pixel-Bild; der Zuwachs kommt aus Form, nicht aus mehr Farben)

| Teil | Höchstens |
|---|---|
| Gesicht | 5–8 Pixel: Augen je 1 Pixel dunkel, Nase 1–2 Pixel Schatten, kein Mund, kein Bart, keine Brauen. Hautton in 2 Tönen. |
| Kopfbedeckung | Silhouette und Krempe klar (Krempe 1–2 Pixel Kante), Kopfband oder Riemen als 1-Pixel-Linie, bis zu 3 Nietglanzpunkte. |
| Kettenhemd | Eine Fläche mit regelmäßigem 2×2-Schachbrett aus zwei Tönen; nicht mehr als eine solche Fläche je Figur. Sonst flache Töne. |
| Rock, Mantel | Faltenlinien höchstens 3, je als Schattenband von 2 Pixel Breite. Saum und Gürtel als eigene Streifen. |
| Hände | Kleiner Block von 3×3 Pixel in Hautton. Keine Finger. |
| Gürtel, Schnalle | Gürtel 2 Pixel hoch, Schnalle 2×2 in Gold. |
| Waffe | Schaft 1 Pixel breit (Ausnahme Pike: 2), feste Länge wie beim Spielobjekt, Spitze oder Klinge 3–4 Pixel breit und 5–7 Pixel lang. |
| Schild | Umriss 1 Pixel, Buckel als 3×3 in Stahl, höchstens ein Zierband. |
| Kleinzeug | Tasche, Schwertgriff, Wendeschuh-Lasche je höchstens ein Block von 3×3. |

Jedes Detail außer Augen, Schaft, Krempe, Riemen und Nietglanz ist mindestens 2×2 Pixel groß.

**Pose**

- **Eine** Pose: stehend, von vorn, Gewicht auf beiden Füßen, Arme leicht vom Körper (Lücke von mindestens 1 Pixel zwischen Arm und Rumpf), Beine leicht auseinander (Lücke zwischen den Füßen mindestens 2 Pixel).
- Waffe in der Hand wie die Stehpose des Speerknechts: Speer senkrecht neben dem Körper, Bogen mit dem Bogenarm leicht gesenkt, Armbrust vor dem Körper getragen, Schwert in der Scheide. Nie über dem Kopf, nie waagrecht.
- Soldat lesbar (§3.4): Kopfschutz, Körperschutz und Waffe mit Eisen sind in der Silhouette zu erkennen.

**Prüfung (jede Truppe, vor dem Einbau)**

1. Maße: Leinwand 64×64, Figur 54–56 hoch, Sohlen Zeile 59, Rand leer, höchstens 15 Farben, jede ≥ 3 Pixel.
2. Silhouette-Test: schwarz gefüllt als Soldat mit Kopfschutz und Waffe lesbar.
3. Treue-Probe: Kopf, Mantel, Beine, Schild und Waffe stimmen mit den Angaben der Kultur in `schlacht_voelker.json` und der Truppenart in `schlacht_truppen.json` überein; Hautton wie das Spielobjekt.
4. Nachbar-Test: neben dem Spielobjekt und `kk_spear2` gleiche Kopfgröße, gleiche Lichtrichtung, gleiche Pixelgröße; mehr Detail als das Spielobjekt, aber nicht mehr Farben.
5. Klassen-Probe: Stoff, Stahl, Leder, Haut lassen sich nach Farbe trennen.
6. `historiker` vorher (Beschreibung) und nachher (Bild); Ergänztes markieren.

**Abweichungen:** Ist ein Detail zu klein für die Norm, wird es weggelassen, nicht vergrößert. Fällt das Sprite durch Punkt 3 oder 5, nur diese Truppe neu erzeugen, nicht den Stapel.

---

## 4. Handwerk: die Regeln für ein schönes Pixelbild

Nach Slynyrd (Pixelblog), Pedro Medeiros (Pixel Grimoire), Cure (PixelJoint) und Lospec, abgestimmt auf die Stilfibel:

1. **Silhouette zuerst.** Das Bild ganz schwarz gefüllt muss in Spielgröße noch lesbar sein, auch jedes Animationsbild. Ein Haus muss sich von einer Mühle schon im Umriss unterscheiden.
2. **Licht immer von links oben.**
   - **Ein beleuchtetes Bild nicht spiegeln:** Gespiegelt kommt das Licht von rechts. Supercell und Game Developer sagen deshalb: drehen und neu machen, nicht spiegeln (B).
   - Was gespiegelt werden darf, ist hell und dunkel ohne Richtung (z. B. ein Strauch von oben). Sonst die andere Richtung erzeugen.
   - **Gilt auch für die heutigen gespiegelten Bäume des Dorfspiels:** prüfen und benennen.
3. **Flach schattieren, zwei Töne je Stoff** (Licht- und Schattenton).
   - Ebene Flächen haben eine Farbe, Rundungen eine kurze Leiter.
   - Glanz nur auf Metall und Gold.
   - **Kein „Kissen-Schatten“** (jeder Rand dunkel, ohne Licht) – der benannte Anfängerfehler (Medeiros).
4. **Farbleitern mit Farbtonverschiebung:**
   - Schatten etwas kühler, Licht etwas wärmer, höchstens ~20° je Stufe (Slynyrd).
   - Die Sättigung ist in der Mitte am höchsten.
   - Hell und grell zugleich sticht ins Auge.
   - Die Handschriftfarben (Gold, Zinnober, Azur) sind voll, aber nicht grell.
5. **Umriss:**
   - Dinge haben außen 1 px `#1f1b16`, geschlossen, auch an den Füßen.
   - **Innenlinien einen Ton dunkler als die Fläche** (Selout), nicht schwarz.
   - Der Grund hat keinen Umriss.
   - Bilder in einem Rahmen (Ereignis, Porträt) haben keinen eigenen Umriss.
   - Ein fester dunkler Außenumriss ist richtig, weil der Hintergrund wechselt (Lospec).
6. **Saubere Pixel:**
   - keine einzelnen verwaisten Pixel;
   - keine ungewollten Ecken (L-Klumpen);
   - Kurven mit gleichmäßig wachsenden Stufen (3-2-1-1-2-3).
7. **Kantenglättung von Hand, sparsam:** Halbtöne nur an Stufenenden, nie an 45°- oder geraden Linien, und das Bild nicht vergrößern. Zu viel davon wirkt unscharf.
8. **Keine Streifen (Banding):** Läufe, die übereinander an derselben Stelle enden, verschieben.
9. **Rastern (Dithering)** nur für Pergament-, Himmel- und Bodentexturen, nie auf den flachen Dingen.
10. **Wenig Farben, große Flächen.** Was mit vier Farben nicht wirkt, rettet keine zwölfte (Cure).
11. **Ein Detailgrad je Szene.** Grob gezeichnete und fein gezeichnete Bilder nebeneinander zerreißen das Bild (Slynyrd). Neues an den Nachbarn im Atlas messen.
12. **Wichtiges übertreiben, Unwichtiges weglassen:**
    - Helm, Werkzeug und Geste groß;
    - Falten und Ziegel nur angedeutet.
13. **Kein Bild zweimal gleich nebeneinander:** Varianten, Abnutzung, leichte Farbstreuung. Spiegeln nur nach Regel 2.

## 5. Isometrie (Dorfspiel)

- **2:1-Linien** überall (zwei Pixel waagrecht, eines senkrecht, ≈ 26,6°), keine echten 30° (Slynyrd, Pixelblog 41).
- **Feld 64×32.** Gebäude sitzen mit ihrer Grundfläche genau auf `Größe × Größe` Feldern; Mauerkanten laufen auf den Rautenkanten.
- **Höhen in Schritten von 2 px.** Gerade Maße.
- **Eine Lichtrichtung für alle Gebäude**, eine Schattenform, eine Schattenlänge. Im Dorfspiel gibt es dafür Pixelschatten in `look.json`.
- **Einsetzen statt Aufkleben** (der Autor): Der Fuß jedes Gebäudes geht in den Boden über (`look.json` `seat`). Bilder ohne Grasplatte erzeugen („no ground plate“), sonst lässt sich der Rand nicht einsetzen. So scheiterten die Steine mit gelbem Graskranz.
- **Drehen statt spiegeln:** Ein Gebäude in zwei Richtungen braucht zwei Bilder.

## 6. Animation (30 fps)

Haltezeiten sind Vielfache von 33 ms. Das Spiel läuft mit 30 fps; die Bilder einer Bewegung wechseln seltener (Slynyrd).

| Bewegung | Bilder | Haltezeit |
|---|---|---|
| Gehen | 8 | je 100 ms (0,8 s Zyklus); 6 Bilder je 133 ms für Menge |
| Stehen, Atmen | 2–4 | 267–400 ms, nur Oberkörper |
| Hacken, Hämmern, Axt | 6 | Ausholen 233 ms, 2 Wischbilder je 33 ms, Treffer 167 ms halten, Zurück 100 ms |
| Säen, Sense | 6 | je 133 ms, ein Bild mit Wurf oder Schnitt |
| Stoß, Hieb | 6 | 100 / 33 / 33 / 67 / 100 / 67 ms |
| Schuss (Bogen, Armbrust) | 6 | Spannen lang, Lösen kurz; die Armbrust lädt sichtbar langsamer |
| Fallen | 6–8 | je 100 ms, letztes Bild bleibt stehen |
| Rauch, Funken, Staub | 4–6 | je 67 ms |

- **Kopfwippen als Dreieck, nicht als Welle** (Slynyrd).
- **Asymmetrische Kleidung nicht spiegeln.**
- **Erst eine farbige Puppe animieren**, dann bekleiden.
- **Papierpuppe:** Alle Ebenen haben dieselbe Leinwand, denselben Fußpunkt, dieselbe Bildzahl und dieselbe Zeit je Bewegung. Die schlimmste Kombination prüfen (Helm + Mantel + Waffe).
- **Silhouette in jedem Bild,** auch im Wischbild. Der Umriss bleibt geschlossen.
- **Bewegung nur, wo etwas geschieht.** Kein Grund-Bild bewegt sich.

## 7. Historisch genau: 1336, und für jede Region richtig

### 7.1 Der Ablauf (Pflicht)

1. **historiker vorher:** Er legt fest, was für Jahrzehnt, Region, Stand und Glauben richtig ist, mit Quelle. Das wird **die Beschreibung**, damit ein Versuch meist reicht.
2. **Dünne Quellen:** Der Autor, 29.9.2026: *„Wenn die Quellen dünn sind, dann denke dir was Kohärentes aus.“* Das Plausibelste, nach dem nächsten belegten Fall, nie gegen Belegtes. **Immer als ergänzt markieren**, in der Quellnotiz, im Dokument und im Commit.
3. **historiker nachher:** das Ergebnis gegen die Beschreibung, bewertet als grob, mittel oder Detail. Bei „grob“ neu erzeugen oder nicht verwenden.

### 7.2 Gute Vorlagen um 1300–1360

| Quelle | Zeit, Ort | Zeigt | Bildrechte |
|---|---|---|---|
| **Luttrell-Psalter** | 1325–45, Lincolnshire | Dorfleben, Arbeit, Pflug, Mühle, Kleidung | Einzelne Dateien auf Commons, **Lizenz je Datei prüfen** |
| **Oldenburger Sachsenspiegel** | **1336**, Rastede | Recht, Bauern, Dorf, Lehnswesen; ideal für Niedersachsen und das Leinetal | CC BY-SA 4.0: **nur zum Ansehen** für den historiker, nicht als PixelLab-Vorlage (Regel: PD/CC0) |
| **Codex Manesse** | um 1304–40, Zürich | Rüstung, Wappen, Turnier, Adel | CC BY-SA: nur zum Ansehen |
| **Holkham-Bilderbibel** | um 1327–35, England | Alltag in Bibelszenen | Rechte vor Gebrauch prüfen |
| **Bodley 264 (Alexanderroman)** | 1338–44 | Randbilder: Hof, Dorf, Spiel | **CC BY-NC**, nicht für ein verkauftes Spiel |
| **Stundenbuch der Jeanne d'Evreux** (Pucelle) | um 1324–28, Paris | Randfiguren, Drolerien | **Met, CC0**: als Vorlage erlaubt |
| Met, Walters, Getty Open Content | verschiedene | Gegenstände, Rüstung, Handschriften | CC0 oder frei: als Vorlage erlaubt |
| Maciejowski-Bibel | um 1240er | | **rund 90 Jahre zu früh**, nur mit Vorsicht |

- Nur PD/CC0 darf als **Bildvorlage** an PixelLab gehen.
- Alles andere dient dem `historiker` zum Ansehen und Beschreiben.
- Die Rechtslage bei Scans gemeinfreier Werke (§ 68 UrhG, seit 2021) klärt der `anwalt`, bevor man davon abweicht.

### 7.3 Häufige Fehler, die 1336 falsch sind

**Rüstung:**
- **Kein Vollharnisch** (erst um 1420).
- Üblich sind 1336: Kettenhemd, gesteppter Waffenrock, Plattenrock unter Stoff.
- Der Topfhelm geht bis etwa 1340, oft über der Beckenhaube getragen.
- Die Beckenhaube bekommt um 1330 die Helmbrünne.
- Das Visier wird erst in der zweiten Jahrhunderthälfte üblich.
- Die Hundsgugel kommt erst ab etwa 1360, Schaller und Armet im 15. Jh.

**Waffen:**
- **Keine Handbüchsen 1336.** Erste grobe Geschütze stehen 1346 bei Crécy.
- Den Langbogen gibt es in England, aber im Leinetal-Dorf ist er gesperrt.
- Die Pike ist für ein Dorf von 1336 gesperrt.

**Dorf und Haus:**
- Bauernhaus mit **offener Herdstelle, ohne Schornstein**.
- **Kein Glas** in Bauernfenstern.
- Keine Fichtenforste: Fichte wächst nur im Hochharz, Forste kommen erst ab dem 18. Jh.

**Pflanzen und Tiere:**
- **Nichts aus Amerika**: keine Kartoffel, kein Mais, keine Tomate, kein Kürbis, kein Truthahn, kein Tabak.

**Kleidung:**
- Bauern tragen knielangen Kittel, Gugel, Kopftuch und Schürze.
- Enge kurze Männerröcke kommen erst um 1350.
- Die Barbette verschwindet bis zur Jahrhundertmitte.

**Wappen:**
- Im Wappen-Editor keine echten Wappen (Lilien, englische Löwen, Reichsadler).
- Tinkturregel: Metall nicht auf Metall, Farbe nicht auf Farbe.

**Bauten nach Region:**
- Dorfspiel: England, Nordfrankreich, Reich (Franken, Niedersachsen); Hallenhaus, Spieker und Thie nach `docs/HISTORIKER.md`.
- *Sacrum Imperium*: Bautraditionen je Kulturkreis (`latin_north`, `it`, `ru`, `me` …).

## 8. PixelLab: Werkzeuge, Grenzen, Sätze

**Werkzeuge** (Stand der API-Doku, Oktober 2026; vor Gebrauch in `api.pixellab.ai/mcp/docs` prüfen):

| Zweck | Werkzeug | Grenzen |
|---|---|---|
| Figur | `create_character` | 16–256 (Standard 48), 4 oder 8 Richtungen, Ansicht top-down oder seitlich. Umriss: einfarbig, selektiv oder ohne. Schattierung von flach bis detailliert. **8 Richtungen im Pro-Modus kosten 10–25 Generierungen**, Standard 1. |
| Animation | `animate_character` | 4–16 Bilder, gerade Zahl; Vorlagen: Gehen 6, Atmen 4 |
| Kleidung, Rüstung als Ebene | transfer-outfit | 32–256; bis 64 px 15 Bilder |
| Gegenstand, Gebäude | `create_map_object` | 32–400 |
| Isometrische Felder und Bausätze | `create_isometric_tile`, `create_tiles_pro`, `create_building_kit`, `create_path_tiles` | 16–128 je nach Werkzeug |
| Bild mit Palette | generate-image-v2 | 16–512, `target_palette` 2–256 Farben, bis 4 Vorlagen + 1 Stilbild |
| Ausbessern | `inpaint_image` | 32–512 |

**Wie man spart:**
- generate-image-v2 liefert bei kleinen Bildern viele auf einmal: bis 32 px 64 Stück, 51–64 px 16 Stück. **Symbole gesammelt erzeugen.**
- Ein **Stilbild aus dem eigenen Atlas** (z. B. ein gelungenes Gebäude als Anker) hält neue Bilder im selben Stil. Das Dorfspiel nutzt `dorf_manor` als Stilanker.
- **Immer in Endgröße erzeugen.** Nie größer erzeugen und verkleinern (Regel 2.3).

**Einstellungen:**
- **Dinge:** einfarbiger Umriss, der beim Import zu `#1f1b16` wird; Schattierung „flat“ oder „basic“; Palette mitgeben.
- **Grund:** „lineless“.

**Der Anfangssatz jeder Beschreibung**, nach Ebene:
- **Ding:** „pixel art, lit from upper left, flat medieval manuscript colours, one-pixel dark outline #1f1b16 all round, transparent background, no text, no ground plate“.
  - Bauten und Figuren: „three-quarter view“; im Dorfspiel die isometrische Aufsicht des Spiels.
  - Symbole und Wappen: „front view“.
- **Grund:** „pixel art, lit from upper left, limited palette of muted earth tones, no outline, soft edges into the ground, transparent background, no text“.
- Danach folgen das Motiv und die Vorgaben des historikers: was es sein soll, was es **nicht** sein darf („no chimney, no glass, no plate armour“), dazu Größe, Richtung und Ansicht.

**Achtung:** `STIL.md` §8.9 in *Sacrum Imperium* nennt noch „muted earth tones“ für alles. Für Dinge gilt der Satz oben, denn Dinge haben laut §8.1 volle Farbe. Diese Abweichung im Commit benennen, bis die Fibel angepasst ist.

**Rechte:** Die Bilder gehören dem Autor, kommerzielle Nutzung ist erlaubt. Kein Training anderer Modelle damit. Zugriff nur über die offizielle API. Der Schlüssel erscheint nie in einer Datei oder im Chat.

## 9. Import und Prüfung

1. **Palette:**
   - Jede Farbe auf den nächsten Ton der Palette bringen; die Werkzeuge in `tools/` tun das wahrnehmungsgerecht.
   - **Prüfen, dass jede Farbleiter ihre Reihenfolge behält.** Hell bleibt heller als dunkel.
2. **Umriss angleichen** (Stilfibel 8.3):
   - Fehlt einem Ding der Umriss, wird er außen gelegt.
   - Hat ein Grund-Bild einen, nehmen dessen Randpixel die Farbe ihres inneren Nachbarn an.
   - **Angleichen statt neu erzeugen.**
3. **Atlas:**
   - *Sacrum Imperium*: `PixelLabArt.kt`.
   - Dorfspiel: `DorfArt.kt` über `tools/dorf_art.py`, Ebenen über `tools/dorf_layers.py`.
   - Immer mit `GENERATED`-Kopf. Name und Buchstaben eines Bildes sind in beiden Spielen gleich, damit Bilder wandern können.
4. **Quelle eintragen:** in `tools/pixellab_refs.json` bzw. `tools/dorf_art.json` (Werkzeug, Datum, Vorprüfung, Vorlage); `LICENSES.md` im selben Commit.
5. **Messen:**
   - `tools/qa/stilpruefung.py`: Umriss, Farbenzahl, Größe. Die Zeile `stil: N departures` liest man wie einen Test.
   - `tools/stilfibel_bogen.py`: der Übersichtsbogen, um Neues neben Altes zu legen.
6. **Am Bild prüfen:**
   - Harness in Spielgröße (*Sacrum Imperium* 1080×2400, Dorfspiel 2400×1080) und auf einem kleinen Gerät.
   - Bei Zoom beide Enden.
   - Bilder zurücklesen.
   - **Silhouette-Test** (schwarz gefüllt) und **Nachbar-Test** (neben drei vorhandenen Bildern derselben Art: gleicher Detailgrad, gleiche Lichtrichtung, gleiche Pixelgröße).
7. **Prüfer:**
   - der `historiker` nachher;
   - der `spieler`: Gefällt es? Erkennt man, was es ist?
   - der `anwalt` bei jeder neuen Quelle.

## 10. Vorgehen bei jeder Bildanfrage

1. **Einordnen:**
   - Welches Spiel?
   - Welche Bildart und Größe (§3)?
   - Welche Ebene (Grund, Ding oder Oberfläche)?
   - Welche Region und welches Jahrzehnt?
2. **Vorhandenes zuerst:** Im Atlas beider Spiele suchen (rund 1.460 Bilder in *Sacrum Imperium*, über 1.000 im Dorfspiel). Wiederverwenden geht vor Erzeugen. Ein Notbehelf wird als solcher benannt.
3. **Kontingent:** Stand und geplante Zahl der Generierungen nennen. Unter 20 den Autor fragen. 8-Richtungs-Pro-Figuren vorher ankündigen, weil sie teuer sind.
4. **historiker vorher** → Beschreibung mit Anfangssatz (§8) → erzeugen in Endgröße.
5. **Import und Prüfung** (§9) → **historiker nachher** → **spieler**.
6. **Bericht:**
   - was entstand;
   - Größe und Farbenzahl;
   - Generierungen verbraucht und übrig;
   - Quellen;
   - was ergänzt statt belegt ist;
   - jede Abweichung von dieser Fibel, benannt;
   - was der Autor ansehen oder entscheiden soll.

Antworte auf Deutsch. Spieltexte und PixelLab-Beschreibungen sind englisch.

## Quellen (Auswahl)

**Handwerk:**
- Slynyrd, Paletten: https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
- Slynyrd, Isometrie: https://www.slynyrd.com/blog/2022/11/28/pixelblog-41-isometric-pixel-art
- Slynyrd, Animation: https://slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation
- Slynyrd, Gehen: https://slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle
- Slynyrd, Angriff: https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation
- Pedro Medeiros, Pixel Grimoire: https://medium.com/pixel-grimoire/how-to-start-making-pixel-art-4-f57f51dcfa02
- Pedro Medeiros, Pixel Grimoire Teil 7: https://medium.com/pixel-grimoire/how-to-start-making-pixel-art-7-e504bfa4ddf2
- Cure, Pixel Art Tutorial: https://pixeljoint.com/forum/forum_posts.asp?TID=11299
- Lospec, Umrisse: https://lospec.com/articles/pixel-art-outlines-part-2-using-color
- Isometrische Bilder, Licht nicht spiegeln: https://gamedeveloper.com/design/how-to-prepare-isometric-assets-for-your-games

**PixelLab:**
- MCP-Doku: https://api.pixellab.ai/mcp/docs
- Isometrische Kacheln: https://www.pixellab.ai/docs/tools/create-isometric-tile

**Geschichte:**
- Oldenburger Sachsenspiegel: https://kulturerbe.niedersachsen.de/fullscreen/isil_DE-45_urn_nbn_de_gbv_45_1-3571/279/
- Luttrell-Psalter: https://britishlibrary.typepad.co.uk/digitisedmanuscripts/2013/09/the-luscious-luttrell-psalter.html
- Plattenrock: https://en.wikipedia.org/wiki/Coat_of_plates
- Beckenhaube: https://myarmoury.com/feature_spot_bascinet.html
- Bauernhäuser: https://en.wikipedia.org/wiki/Peasant_homes_in_medieval_England
- Met, offene Bilder: https://www.metmuseum.org/policies/image-resources
- Pigmente: https://colour-illuminated.fitzmuseum.cam.ac.uk/explore/illuminators-palette