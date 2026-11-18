---
name: "mittelalter-anatomie"
description: "Bei jeder Figur, jedem Tier und jeder Animation in des Autors Spielen: Anatomie, Proportionen und natürliche Bewegung sichern und PixelLab-Animationen (Vorlage, Skelett, v3) richtig einsetzen."
---

# Mittelalter-Anatomie: Körper richtig bauen, natürlich bewegen

Du planst, erzeugst, animierst oder prüfst eine Figur, ein Tier, einen Reiter oder eine Bewegung für ein Spiel des Autors (*Sacrum Imperium*, Dorfspiel). Ziel: **Jede Bewegung sieht aus, als hätte sie ein Mensch mit Gewicht, Knochen und Absicht ausgeführt** – auch bei 32 Pixeln.

**Verhältnis zu den anderen Skills:**
- `mittelalter-pixelgrafik` gilt immer mit: Auflösungen (§3), Handwerk (§4), **Haltezeiten in ms (§6)**, Geschichte (§7), Import (§9). Dieser Skill ersetzt nichts davon, er ergänzt Körper und Bewegung.
- `mittelalter-hud`, `spiel-harmonie`: Ästhetik und Gesamtwirkung.
- Wo eine Datei im Repository (`CLAUDE.md`, `docs/STIL.md`, `data/look.json`) Neueres sagt, gilt die Datei. Nenne den Unterschied.

---

## 0. Das Vorzeigebeispiel: der Speerknecht

Der Autor hat am 10.11.2026 den **Speerknecht** als Vorzeigebeispiel für Figuren und Bewegung bestimmt. Jede neue Figur und jede neue Animation wird **neben ihn gelegt** (Nachbar-Test). Ablageort im Atlas: beim Autor erfragen und hier eintragen, falls noch nicht vermerkt.

**Was er zeigt:** ein Fußknecht mit Eisenhut (breite Krempe), gepolstertem dunkelblauem Rock mit hellem Saum, hellen Ärmeln, dunklen Beinlingen und Schuhen und einem langen Speer. Es gibt vier Posen in zwei Größen auf Gras: zwei Kampfstellungen, Stehen von vorn und Stehen mit geschultertem Speer.

**Was daran richtig ist und übernommen wird:**
1. **Kampfstellung mit Gewicht:** breiter Stand, beide Knie über den Füßen gebeugt, Schwerpunkt tief und mittig zwischen den Füßen, Oberkörper aufrecht und leicht eingedreht. Die Figur steht spürbar *auf dem Boden*.
2. **Zweihändiger Griff:** vordere Hand vorn am Schaft, hintere an der Hüfte, Abstand der Hände fest; Ellbogen natürlich gebeugt; der Speer liegt waagrecht, die Spitze zeigt zum Gegner. So wird jeder Speer und jede Stangenwaffe gehalten.
3. **Ruhige Stehpose:** Gewicht auf einem Bein, Speer an der Schulter, Ellbogen gebeugt. Ruhig, nicht steif.
4. **Silhouette:** Hutkrempe und Speer machen die Figur schon als Umriss erkennbar. Jede Figur braucht ein solches Merkmal.
5. **Proportion:** etwa 4,5–5 Köpfe, Arme reichen zur Schritthöhe, Füße flach und groß genug zum Stehen. Das ist der Maßstab für §2.1.
6. **Bodenschatten** mit dem Schatten des Speers: Figur und Waffe sind am Boden verankert.

**Offene Fragen an den Autor (bis zur Antwort nicht raten):**
- Für welches Spiel ist er die Richtschnur, oder für beide?
- Die Schattierung wirkt weicher und reicher als „zwei Töne je Stoff“ (`mittelalter-pixelgrafik` §4.3). Gilt für Figuren der Speerknecht oder die Fibel?
- Die kleine untere Reihe: eigens in kleiner Größe erzeugt oder verkleinert? Verkleinern verstößt gegen „nie umrechnen“ (§2.3).
- Der `historiker` bestätigt einmal Helm, Rock und Speer für 1336.

## 1. Grundsatz: erst der Körper, dann das Kostüm

1. **Skelett denken, nicht Umriss.** Jede Pose hat Becken, Wirbelsäule, Schultergürtel, Gelenke. Was der Körper nicht kann, darf die Figur nicht tun.
2. **Gewicht zuerst.** Wo ist der Schwerpunkt, worauf steht die Figur? Steht der Schwerpunkt nicht über der Standfläche, muss die Figur gerade fallen, laufen oder sich abstützen.
3. **Eine Absicht je Bewegung.** Hacken heißt: ausholen, treffen, zurück.
4. **Erst die Puppe, dann die Kleidung** (wie `mittelalter-pixelgrafik` §6): Bewegung auf der schlichten Grundfigur prüfen, danach Rüstung, Mantel, Gugel über `transfer_outfit` / `edit_animation`.

## 2. Proportionen

### 2.1 Kanon je Spiel (Vorschlag nach dem Speerknecht; der Autor entscheidet, dann in die `CLAUDE.md`)

| Spiel | Figurhöhe | Kanon |
|---|---|---|
| Dorfspiel | 30–34 px auf 48×48 | etwa 4,5–5 Köpfe wie der Speerknecht |
| *Sacrum Imperium*, Truppen | ~24–28 px auf 32×32 | etwa 4–4,5 Köpfe |
| Berater, Porträts | – | nach Richtschnur Berater-Mönch, nicht ändern |

- **Ein Kanon je Spiel.** Alle Figuren derselben Ebene haben dieselbe Kopfgröße bei gleichem Alter. Ein Ritter ist nicht größer, weil er wichtig ist.
- Kleine Pixelfiguren verkürzen vor allem **Beine und Rumpf**; der Kopf bleibt lesbar groß.

### 2.2 Merkpunkte, die auch stilisiert gelten

- **Schritt** knapp unter halber Höhe. **Knie** mittig zwischen Hüfte und Sohle.
- **Ellbogen auf Gürtelhöhe**, **Handgelenk auf Schritthöhe**. Zu kurze Arme sind der häufigste KI-Fehler.
- **Schultern** bei Männern etwa 2 Kopfbreiten; bei Frauen Schultern ≈ Hüfte.
- **Hals** kurz, aber vorhanden (außer unter Kettenhaube und Gugel).
- **Füße** zeigen nach vorn, leicht nach außen; etwa eine Kopfhöhe lang.
- **Kinder** 3–3,5 Köpfe; **Alte** vorgebeugt, Knie leicht gebeugt, kurze Schritte.
- **Werkzeug und Waffe haben feste Länge** über alle Bilder und Richtungen. Maß einmal festlegen (Speer: wie beim Speerknecht) und im Bericht nennen.

## 3. Gelenke: was geht und was nie geht

| Gelenk | Art | Regel |
|---|---|---|
| Knie | Scharnier | beugt **nur nach hinten**; nie nach vorn durchgedrückt |
| Ellbogen | Scharnier | beugt **nur nach vorn**; Spitze zeigt nach hinten/außen |
| Schulter | Kugel | Arm über Kopf hebt das Schulterblatt mit |
| Hüfte | Kugel | Bein nach hinten nur ~15–20°, nach vorn weit |
| Handgelenk, Knöchel | | kleine Winkel; Fuß beim Stehen flach |
| Wirbelsäule | | gestaffelt; Becken und Schultern drehen **gegeneinander** beim Gehen |
| Hals | | Kopf dreht ~70° je Seite; bleibt ruhig, Blick zum Ziel |

**Knochenlängen sind fest.** In der Seitenansicht bleibt die 2D-Länge fast gleich; in der Aufsicht darf sie durch Verkürzung **kürzer** werden, **nie länger** als in Ruhe.

## 4. Bewegungsgesetze (nach den 12 Prinzipien, für Pixel übersetzt)

1. **Ausholen:** vor jeder kräftigen Aktion eine Gegenbewegung; das Ausholen ist das längste Bild.
2. **Gewichtsverlagerung:** beim Treffer/Stoß aufs vordere Bein, Becken folgt.
3. **Bögen statt Geraden** für Hände, Kopf, Werkzeugspitze (Ausnahme: Speerstoß gerade). Prüfen mit der Zwiebelhaut.
4. **Nachschwingen:** Gugelzipfel, Mantel, Ärmel, Haar, Zügel, Tierschwanz folgen **1–2 Bilder später**.
5. **Langsam rein, langsam raus** über Haltezeiten, nicht über mehr Bilder.
6. **Stauchen nur leise:** höchstens 1 px beim Aufsetzen.
7. **Nebenbewegung** sparsam: Atmen, Kopfwenden.
8. **Übertreiben, was klein ist:** Posen deutlicher als im Leben.
9. **Ruhige Teile bleiben ruhig:** gleiche Pixel in jedem Bild; Flimmern ist ein Fehler.

## 5. Die Bewegungen im Einzelnen

Haltezeiten und Bildzahlen stehen in `mittelalter-pixelgrafik` §6. Hier steht, **was der Körper tut**.

### 5.1 Gehen
- Vier Schlüsselposen je Schritt: **Kontakt** (Ferse setzt auf), **Tief** (Körper am tiefsten), **Durchgang** (am höchsten), **Hoch** (Abstoß). Bei 8 Bildern zweimal.
- **Kopfwippen als Dreieck:** tief im Tief-Bild, hoch im Durchgang, 1 px (2 px bei 48 px Figuren).
- **Arme gegengleich zu den Beinen**, Schwung aus der Schulter.
- **Bodengeschwindigkeit passt zum Schritt:** Der Standfuß wandert gleichmäßig gegen die Laufrichtung. **v (px/s) = 2 × Schrittlänge (px) / Zyklusdauer (s)**, z. B. 8 px und 0,8 s → 20 px/s. Im Code eintragen und berichten.
- Lasten: kürzere Schritte, Rumpf zur Last, tragender Arm schwingt nicht.
- Kettenhemd/Plattenrock: etwas kürzere Schritte, weniger Armschwung.
- **Speerträger gehend:** Speer geschultert wie in der Stehpose des Speerknechts, der tragende Arm schwingt nicht, die Speerspitze wippt mit dem Kopf um 1 px mit.

### 5.2 Laufen
- Flugphase in 1–2 Bildern; **Rumpf 10–15° vor, in jedem Bild**, Kopf aufrecht; Arme ~90°, Wippen 2 px.

### 5.3 Stehen, Atmen
- Nur Brust und Schultern heben sich 1 px; Füße, Kopfumriss und Waffe bleiben stehen. Gewicht auf einem Bein.

### 5.4 Arbeit
- **Hacken, Axt, Hammer:** Ausholen über die Schulter, beide Hände am Stiel mit festem Abstand, Knie beugen beim Schlag, Treffer halten.
- **Getreide mit der Sichel, Heu mit der Sense:** Sichel vorgebeugt, linke Hand fasst die Halme; Sense mit breitem Stand, Schwung aus der **Hüftdrehung**, Blatt flach.
- **Säen:** Saattuch über der Schulter, Wurf im Bogen mit Schritt.
- **Heben:** aus den Knien, Rücken gerade.

### 5.5 Kampf
- **Speer (nach dem Speerknecht):** Grundstellung wie Kampfpose 1. Stoß aus dem hinteren Bein und der Hüfte, die Spitze läuft **gerade**, beide Hände bleiben am Schaft, der Handabstand bleibt gleich; das vordere Knie beugt sich stärker, der Rumpf geht mit. Zurück in die Grundstellung.
- **Schwerthieb:** Kraft aus Hüfte und Schulter, Klinge auf Bogen, Schild vor dem Körper.
- **Bogen:** Bogenarm gestreckt, Zughand zum Gesicht, Schultern in einer Linie mit dem Pfeil.
- **Armbrust 1336:** Spannen mit Fuß im Bügel und Gürtelhaken, langsam und sichtbar; im Zweifel `historiker`.
- **Getroffen, Fallen:** weg von der Kraft, Kopf verzögert; erst Knie, dann Rumpf, dann Kopf. Letztes Bild liegt still.

### 5.6 Reiter und Pferd
- **Schritt** 4-Takt, **Trab** 2-Takt diagonal, **Galopp** 3-Takt, **Renngalopp** 4-Takt mit Schwebephase.
- Reiter mit **langen Steigbügeln, Beine fast gestreckt**, Ferse tief; **kein Leichttraben**.
- Reiter und Pferd auf **einer** Leinwand mit **einem** Fußpunkt; Rumpf des Reiters folgt mit 1 Bild Verzögerung.

### 5.7 Tiere im Dorf
- Vierbeiner im 4-Takt. Ochsen: Kopf tief, schwerer Tritt. Schafe: kurze Schritte. Hühner: Kopf bleibt stehen, dann ruckt er nach.

## 6. Perspektive und Richtungen

- **Ansicht passt zum Spiel** und zum Speerknecht (Dorfspiel). Eine Ansicht je Spiel, nie mischen.
- In der Aufsicht: Beine verkürzt; **fernes Bein und ferner Arm** hinter dem Rumpf und einen Ton dunkler.
- **Nordrichtung:** Gesicht verdeckt, Arme sichtbar seitlich. **Diagonalen** sind eigene Posen.
- **Nicht spiegeln, was beleuchtet ist** (Licht von links oben). `mirror_animation` nur für Bilder ohne Lichtrichtung und ohne einseitige Ausrüstung, und nur mit Zustimmung des Autors.

## 7. PixelLab richtig nutzen

Vor Gebrauch die Werkzeugbeschreibung lesen (`search_help(tool="…")`, frei). Stand hier: November 2026.

### 7.1 Welches Werkzeug wofür

| Bewegung | Erste Wahl | Warum |
|---|---|---|
| Gehen, Laufen, Stehen bei gespeicherter Figur | `animate_character` `mode: "skeleton-v3"` + `template_animation_id` | Figur bleibt sich treu; `motion_adjustments` für Charakter |
| dasselbe, billig | `animate_character` `mode: "template"`, `ai_freedom: 0` | 1 Generierung je Richtung bis ~92 px |
| Arbeit, Kampf, Fallen | `animate_character` `mode: "skeleton-v3"` ohne Vorlage, mit `poses` oder `move` | volle Kontrolle; erster Aufruf ohne Posen liefert das Format frei |
| eigene Figur, nicht in PixelLab gespeichert | `estimate_skeleton` → `animate_with_skeleton_v3` | Gelenke selbst setzen |
| schnelle Idee | `mode: "v3"`, `action_description` | streng prüfen |
| über 16 Bilder | `mode: "pixminimax"` | bis 40 Bilder |
| loses Bild, Effekt | `animate_image`, `animate_object` | nicht für Atlas-Figuren |
| Kleidung auf fertige Bewegung | `transfer_outfit`, `edit_animation` | Pose bleibt |

**Neue Figuren im Stil des Speerknechts:** `create_character` mit `mode: "pro"` und `style_character_id` = Speerknecht (falls er als PixelLab-Figur gespeichert ist), sonst `style_image_url` mit seinem Bild. Größe mindestens seine Sprite-Größe.

### 7.2 `motion_adjustments` nach Figur (Startwerte, am Bild prüfen)

| Figur | stride | arm_swing | leg_extension | posture |
|---|---|---|---|---|
| Bauer, Bäuerin | 1,0 | 0,9 | 0,3 | 0 |
| Träger mit Last | 0,8 | 0 | 0,2 | 0 |
| Speerknecht, Fußknecht | 0,9 | 0,6 | 0,4 | 0 |
| Mönch, Priester | 0,8 | 0,4 | 0,3 | 0 |
| Alter Mensch | 0,7 | 0,5 | 0 | 0 |
| Bote | 1,25 | 1,2 | 0,8 | 0 |

### 7.3 Text für v3 und pixminimax
- `action_description` nur die Bewegung, mit Anatomie: „two-handed spear thrust, rear leg drives forward, front knee bends deeper, hands keep their spacing on the shaft, spear point travels straight“.
- `direction_prompts` je Richtung; `end_frame_url`, wenn das Ende zählt.
- `keep_first_frame: true` speichert `frame_count + 1` Bilder: bei Schleifen das doppelte Startbild weglassen.
- Liefert eine Vorlage eine andere Bildzahl als §6 der Pixelfibel, Haltezeit anpassen und nennen.
- Palette mitgeben, wo das Werkzeug sie nimmt.

### 7.4 Skelett selbst setzen
- 18 Gelenke COCO-18; **ARM = Handgelenk**, **LEG = Knöchel**.
- **LEFT/RIGHT sind die Seiten der Figur.**
- x/y als Anteile 0–1, y nach unten; bei nicht quadratischen Bildern in Pixel umrechnen.
- `first_frame_keypoints` immer aus `estimate_skeleton` (0,1 Generierung).
- Posen vom geschätzten Skelett ableiten, **Knochenlängen gleich**, **Standfuß festhalten**.
- `z_index` nahe Glieder höher; `depth` weglassen; `view` passend; Rumpfneigung beim Laufen in jedem Bild.
- Lieber 6–8 klare Schlüsselposen als 15 halbe. Die Kampfposen des Speerknechts lassen sich mit `estimate_skeleton` als Schlüsselposen gewinnen.

### 7.5 Kosten (Stand Nov. 2026)
- template 1 je Richtung bis ~92 px; skeleton-v3 2–4 je Richtung; eigenes Skelett 3 Bilder = 2, 4–14 = 3, 15 = 4; v3 ceil(B×H×Bilder/65536) je Richtung; `edit_animation` 10–25.
- **Unter 20 übrigen Generierungen den Autor fragen.** Erst **eine Richtung** erzeugen und prüfen, dann die übrigen über `animation_group_id`.

## 8. Fehlerkatalog

| Fehler | Woran man es sieht | Abhilfe |
|---|---|---|
| Knie oder Ellbogen falsch herum | Bein knickt nach vorn | Skelett-Modus, Pose korrigieren |
| Gliedmaßen tauschen | Waffe springt die Hand | Seiten prüfen, neu |
| Rutschende Füße | Standfuß wandert ungleichmäßig | Standfuß festhalten, Geschwindigkeit nach Formel |
| Schwebende Figur | kein Fuß am Boden | Fußlinie prüfen |
| Körper pumpt | Größe schwankt | Knochen prüfen, `ai_freedom` senken |
| Gestaltwechsel | Farben, Kleidung, Gesicht ändern sich | skeleton-v3, Palette |
| Waffe wechselt Länge oder Hand, Handabstand springt | Speer mal lang, mal kurz | Maß wie Speerknecht, neu |
| Teile verschwinden | Helm, Gürtel fehlen in Bildern | Ausbessern oder verwerfen |
| Pixelzittern | ruhige Teile flimmern | Ruhepixel aus Bild 0 |
| Schleifensprung | Ende passt nicht zum Anfang | doppeltes Startbild entfernen |
| Gespiegeltes Licht | Lichtkante rechts | Richtung neu erzeugen |
| Steife Puppe | alles gleichzeitig | Nachschwingen ergänzen |
| Zu kurze Arme | Hand endet an der Hüfte | Proportion §2.2 |
| Weniger Gewicht als der Speerknecht | Knie gestreckt, Stand eng, wirkt schwebend | Stand verbreitern, Knie beugen |

## 9. Prüfen, bevor etwas ins Spiel kommt

1. **Abspielen in Spielgeschwindigkeit** im Harness, Zoom an beiden Enden.
2. **Nachbar-Test mit dem Speerknecht:** gleiche Kopfgröße, gleiches Gewicht im Stand, gleiche Lichtrichtung, gleiche Pixelgröße, gleicher Detailgrad.
3. **Zwiebelhaut:** Bögen sauber, ruhige Teile deckungsgleich.
4. **Fußlinie und Höhe je Bild** konstant (außer Sprung/Fall, Wippen).
5. **Knochen und Gelenke** bei eigenen Skeletten rechnerisch prüfen.
6. **Silhouette jedes Bildes** schwarz gefüllt lesbar.
7. **Papierpuppe:** schlimmste Kombination über alle Bilder.
8. Prüfer: `historiker` (Haltung, Griff, Gerät für 1336), `spieler` (lebendig, erkennbar).

Hilfsskript, unter `tools/qa/anatomie_pruefung.py` anlegen, falls es fehlt (Pillow):

```python
import math
from PIL import Image

def lade(pfade):
    return [Image.open(p).convert("RGBA") for p in pfade]

def fusslinie(bild):
    box = bild.getchannel("A").getbbox()
    return box[3] if box else None

def hoehe(bild):
    box = bild.getchannel("A").getbbox()
    return box[3] - box[1] if box else 0

def zwiebelhaut(bilder, ziel, faktor=8):
    grund = Image.new("RGBA", bilder[0].size, (255, 255, 255, 255))
    for b in bilder:
        t = b.copy()
        t.putalpha(t.getchannel("A").point(lambda v: v * 70 // 255))
        grund.alpha_composite(t)
    grund.resize((grund.width * faktor, grund.height * faktor), Image.NEAREST).save(ziel)

KNOCHEN = [("RIGHT SHOULDER", "RIGHT ELBOW"), ("RIGHT ELBOW", "RIGHT ARM"),
           ("LEFT SHOULDER", "LEFT ELBOW"), ("LEFT ELBOW", "LEFT ARM"),
           ("RIGHT HIP", "RIGHT KNEE"), ("RIGHT KNEE", "RIGHT LEG"),
           ("LEFT HIP", "LEFT KNEE"), ("LEFT KNEE", "LEFT LEG"),
           ("NECK", "RIGHT HIP"), ("NECK", "LEFT HIP")]

def punkte(pose, b, h):
    return {g["label"]: (g["x"] * b, g["y"] * h) for g in pose}

def knochen_pruefen(ruhe, posen, b, h, seitlich=True, toleranz=0.08):
    """Seitenansicht: Laenge +-toleranz. Aufsicht: nie laenger als Ruhe + toleranz."""
    r = punkte(ruhe, b, h)
    fehler = []
    for i, pose in enumerate(posen):
        p = punkte(pose, b, h)
        for a, z in KNOCHEN:
            soll = math.dist(r[a], r[z])
            if soll == 0:
                continue
            q = math.dist(p[a], p[z]) / soll
            if q > 1 + toleranz or (seitlich and q < 1 - toleranz):
                fehler.append(f"Bild {i}: {a}-{z} {q:.2f}x")
    return fehler

def gelenke_pruefen(posen, b, h, blick="east"):
    """Seitenansicht: Knie vor der Linie Huefte-Knoechel, Ellbogen hinter Schulter-Handgelenk."""
    vor = 1 if blick == "east" else -1
    fehler = []
    def seite(a, m, z):
        (ax, ay), (mx, my), (zx, zy) = a, m, z
        if zy == ay:
            return 0
        lx = ax + (zx - ax) * (my - ay) / (zy - ay)
        return (mx - lx) * vor
    for i, pose in enumerate(posen):
        p = punkte(pose, b, h)
        for s in ("RIGHT", "LEFT"):
            if seite(p[f"{s} HIP"], p[f"{s} KNEE"], p[f"{s} LEG"]) < -0.5:
                fehler.append(f"Bild {i}: {s} KNEE knickt nach vorn durch")
            if seite(p[f"{s} SHOULDER"], p[f"{s} ELBOW"], p[f"{s} ARM"]) > 0.5:
                fehler.append(f"Bild {i}: {s} ELBOW beugt falsch")
    return fehler
```

Leere Liste = bestanden.

## 10. Vorgehen bei jeder Animationsanfrage

1. **Einordnen:** Spiel, Figur, Stand, Größe, Ansicht, Richtungen, Bewegung, Bildzahl, Haltezeiten.
2. **historiker vorher:** Haltung und Griff für 1336; Ergänztes markieren.
3. **Bewegung planen:** Schlüsselposen in Worten, Schwerpunkt je Pose, was nachschwingt. Den Speerknecht als Maß danebenlegen.
4. **Vorhandenes zuerst**, Kontingent nennen.
5. **Werkzeug wählen** (§7.1), **eine Richtung** erzeugen, prüfen, dann die übrigen.
6. **Import** nach `mittelalter-pixelgrafik` §9; Laufgeschwindigkeit nach Formel §5.1.
7. **Bericht:** Bewegung, Bildzahl, Haltezeiten, Werkzeug und Modus, Generierungen verbraucht/übrig, Prüfergebnisse, Abweichungen vom Speerknecht, was der Autor entscheiden soll.

Antworte auf Deutsch. PixelLab-Beschreibungen und `action_description` sind englisch.

## Quellen (Auswahl)

- Eadweard Muybridge, *The Human Figure in Motion* / *Animals in Motion* (1887, gemeinfrei).
- Richard Williams, *The Animator's Survival Kit*.
- Frank Thomas, Ollie Johnston, *The Illusion of Life*.
- Slynyrd, Gehen: https://slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle
- Slynyrd, Angriff: https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation
- Slynyrd, Animation: https://slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation
- PixelLab MCP-Doku: https://api.pixellab.ai/mcp/docs
- Luttrell-Psalter (1325–45), Lizenz je Datei prüfen.