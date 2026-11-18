---
name: "sacrum-imperium-hud"
description: "Bei jeder Arbeit am HUD, an Menüs, Seiten, Symbolen oder Kartenmodi von Sacrum Imperium (hochkant): Stand nach H1–H4 kennen, HUD_DOSIERUNG befolgen, H5/H6 sauber vorbereiten."
---

# Sacrum Imperium: das HUD

Dieser Skill gilt für die Oberfläche von ***Sacrum Imperium***, des Autors Grand-Strategy-Spiel (Europa 1336–1510, Android, **nur Hochformat**).

- **Lade zuerst `mittelalter-hud`.** Ästhetik, Rangordnung der Buchmaler, Stilfibel, Dosierung, PixelLab und Prüfablauf stehen dort und gelten hier ganz.
- Dieser Skill sagt, was in *Sacrum Imperium* schon gebaut ist, was der Autor entschieden hat, was offen ist und wie man daran arbeitet.

**Maßstab im Repository** `grand-strategy-game-`:
- `docs/HUD_DOSIERUNG.md` (Fassung 2) ist laut `CLAUDE.md` der Maßstab für das HUD.
- Dazu `docs/STIL.md` §8 (Stilfibel) und `docs/VISION.md`.
- Der Stand steht in den Commits `H1`–`H4` und in `docs/ROADMAP.md`.

Wo das Repository Neueres sagt als dieser Skill, gilt das Repository. Nenne den Unterschied.

## 1. Der Leitsatz und die Grenze

- Der Autor, 22.10.2026: *„Optimiere die UI, das HUD: keine Textüberlagerung, Minimalisierung, aber Verständlichkeit und Simplizität.“*
- Und: *„minimalistischer, aber die Informationen müssen klar und dieselben sein.“*
- Und: *„Sei sehr vorsichtig und betrachte die Ursprungsvision der Ästhetik und respektiere sie sehr.“*

> **Schmuck am Rand, Ruhe in den Zahlen. Dieselbe Information, weniger Zeilen.**

**Unantastbar:**
- der Buchrand mit Drolerien und laufenden Tieren (Eichhörnchen, Maus);
- Holzseiten mit Goldkante (vom Autor am 22.10. bestätigt);
- Pergamentknöpfe mit ¶;
- das rote S als Initiale;
- die Uhr: Kranich = Pause, Schnecke, Storch, Hase, Falke, Schwalbe;
- Jersey 10 und Jacquard 12;
- die drei Rahmenarten;
- der Edelsteinrahmen des Porträts.

**Die Visionsbilder** liegen im claude.ai-Projekt (Kartenbild, London-Bild, Porträts). Sie dürfen **nie** ins Repository, denn KI-Bilder und Bilddateien sind dort verboten. Vergleichen geht nur, wenn der Autor ein Bild in die Unterhaltung lädt; sonst gilt die Beschreibung in `STIL.md` §1.

## 2. Was gebaut ist (Stand 29.10.2026)

| Paket | Commit | Was der Spieler sieht | Entscheidung des Autors |
|---|---|---|---|
| H1 Provinzblatt | `4d0b8d6`, `7da7ba0` | siehe unten | siehe unten |
| H2 Kopfleiste | `8bd3a63`, `6784616` | siehe unten | siehe unten |
| Rot und Vorzeichen | `8aac31f` | siehe unten | siehe unten |
| H3 Kartenmodi | `5211f33` | siehe unten | siehe unten |
| H4 Meldungen und langer Druck | `66734fb` | siehe unten | Plan am 24.10. freigegeben |

**H1 – Provinzblatt in zwei Höhen**
- **Was man sieht:**
  - **Vorschau:** Name in Fraktur, Besitzer (und dessen Lehnsherr), Menschen · Entwicklung · Unruhe, die Heere, eine Erhebung, Knöpfe.
  - **Volle Höhe:** mit der Lasche **„^ more“ / „v less“**. Die Lasche ist doppelt so breit wie die anderen Holzlaschen, damit man sie nicht verwechselt. Wischen geht auch.
  - Höchstens 3 Werte je Zeile. Paris braucht 8 statt 12 Zeilen.
  - Der lange Druck sagt den alten Satz mit den Zahlen der Provinz (`Symbols.label`, „satz:“).
  - Unruhe ist gold bis ein Drittel vor der Erhebung, danach rot.
- **Entscheidung des Autors:** Vorschauzeile Menschen · Entwicklung · Unruhe.

**H2 – Kopfleiste wie das Visionsbild**
- **Was man sieht:**
  - Das Porträt nimmt höchstens ein Viertel der Breite, in ganzen Vielfachen: 224 px auf 1080, 112 px auf 720. Ein Tipp öffnet die Familie.
  - **Zeile 1:** Wappen halb so hoch wie das Porträt (außerhalb), Reich und Datum, Medaillons der laufenden Situationen.
  - **Zeile 2:** Gold, Legitimität, Stabilität, Prestige, Frömmigkeit, je Symbol und Zahl, Gold mit Vorzeichen.
  - **Menschen** erscheinen 8 s lang, wenn sie sich um mindestens 2 % bewegt haben.
  - Eine neue Aufgabe steht 10 s in Rubrik unter der Leiste („Now: …“), danach nur noch im Medaillon.
  - **Höhe** offen: 15,8 % (1080×2400), 17,6 % (360 dp breit), 20,9 % (16:9). Kleine Handys starten eingeklappt.
- **Entscheidung des Autors:** Weg A („wie das Visionsbild“, 22.10.); die fünf Werte; Menschen nur bei Änderung.

**Rot und Vorzeichen**
- **Was man sieht:**
  - Verlust `BAD = #ff9a80` (4,7:1 auf Holz).
  - `RUBRIC_TEXT = #ff9575` (4,5:1) für kleine Rubrik.
  - Die große Fraktur bleibt `#ec6a45` (3,1:1, reicht für große Schrift).
  - Alle Zahlen tragen +/−.
  - `ContrastTest` prüft alle Textfarben auf beiden Hölzern.
- **Entscheidung des Autors:** „Beides: Rot heller + immer Vorzeichen“.

**H3 – Kartenmodi in sechs Familien zu je drei**
- **Was man sieht:**

  | Familie | Kacheln |
  |---|---|
  | Rule | Realms, Plain, Allegiance |
  | Land | Land, Regions, Control |
  | Peoples and faith | Cultures, Peoples, Faith |
  | Wealth | Development, Goods, Trade |
  | Empire and leagues | Empire, Kingship, Leagues |
  | Abroad | Foes, Sickness, Pilgrimage |

  - Jede Kachel zeigt Symbol und ein Wort. Der Familienname steht als kleine Rubrik darüber.
  - Der lange Druck nennt den vollen Namen.
  - `MapModeFamiliesTest` wacht darüber.
- **Entscheidung des Autors:** „Symbol + ein Wort“ und die sechs Familien (22./23.10.).

**H4 – Meldungen und langer Druck**
- **Meldungen** (`NewsDesk`):
  - Krise und eigene große Nachricht kommen sofort; mehrere gleicher Art als eine Zeile.
  - Eigenes Kleines kommt am Monatsersten gesammelt („Last month: Births 2 · Building 3“).
  - Fremdes geht nur in Log und Chronik.
  - Zwei Tipps schalten eine Art stumm; die HUD-Seite listet das.
- **Nach dem Schließen einer Seite:** Geänderte Werte steigen 1,6 s lang als „+90“/„−40“ über ihrer Zahl auf, ein Besitzerwechsel blinkt zweimal.
- **Langer Druck:**
  - Die Erklärung erscheint über dem Finger, in der Kopfleiste daneben.
  - Die ganze Zelle eines Werts antwortet.
  - Der Berater lehrt das Halten an der Krone.
- **Rote Zähler:** keine. Es gibt keinen roten Zähler und kein Kauf-Abzeichen im Spiel.
- **Vom Autor angenommen, nicht gebaut:** verschachtelte Erklärungen.

**Schon älter und weiter gültig:**
- Kopfleiste, Spalte und Uhr einklappbar (Holzlaschen „^“/„v“).
- „…“ statt „+“ unten in der Spalte.
- `HudSettings`:
  - Spalten;
  - Reihenfolge;
  - Symbolgröße;
  - die Werte jeweils „immer“, „bei Änderung (~)“ oder „aus“;
  - Kopfleiste und Uhr beim Start.
- `UiSettings`:
  - Wort neben Symbolen;
  - Blau/Orange (`clearColours`);
  - Dauer des langen Drucks;
  - Karte folgt dem Heer.
- `keepAboveSheet` rückt die angetippte Provinz über das Blatt.
- Spielstände zeigen „France, Aug 1337 – 21 h ago“, neueste zuerst.

## 3. Was offen ist

**Pakete:**
- **H5 – Menüs** (`HUD_DOSIERUNG.md` 8.8):
  - Titelseite mit „Continue“ als größtem Knopf unten, mit Wappen, Reich und Datum.
  - Wappen vor jedem Spielstand (`playerCountryId`).
  - Löschen nur mit langem Druck und Rückfrage.
  - Einstellungen: Wort links, Wert rechtsbündig in Gold.
  - „Close the game“ und „To the title page“ abgesetzt unter einer Zierlinie.
  - Pergamentknöpfe mit ¶ bleiben, keine neue Grafik.
- **H6 – Symbole mit PixelLab** (`HUD_DOSIERUNG.md` 8.9). Vom Autor grundsätzlich erlaubt. Jede Generierung braucht seine Freigabe, mit Kontingent und Motiv. Kandidaten (Motive sind Vorschläge, der `historiker` legt fest):

  | Wo | Problem | Motiv-Vorschlag |
  |---|---|---|
  | Kronleiste | **Turm (Stabilität)** und **Fahne (Prestige)** fielen beim `spieler` im Fünf-Sekunden-Test durch: gelesen als „Verteidigung“ und „Krieg“ | Stabilität etwa als Waage im Gleichgewicht oder als gefügtes Mauerwerk; Prestige etwa als Lorbeer oder Krone mit Strahlen. Der `historiker` prüft. |
  | Kartenmodus | Kingship hat kein Symbol (`hut_krone` ist eine Porträtkrone) | große Krone über zwei kleinen |
  | Provinzblatt | Zoll und Preise stehen als Wort | Zollkette am Fluss; Krämerwaage |
  | Tutorial | Halte-Symbol am Pfeil statt des einfachen Pfeils | Hand mit Finger, golden |

  Laut H3 hat von den 18 Kartenmodi nur Kingship kein Symbol. Leagues, Foes und Sickness tragen Bilder aus dem Atlas; ob sie den Fünf-Sekunden-Test bestehen, prüft der `spieler`, bevor man etwas ersetzt.

**Benannte Fehler und Reste:**
- **B167 und B168** (fremdes Blatt auf 16:9, Außenbildschirm von Faltgeräten) sind seit `983dc67` behoben und laufen als Wiederholung in `tools/qa/regressions.txt`.
- **16:9:** Die offene Kopfleiste erreicht 20,9 % statt 15 %. Mit zwei fingerhohen Zeilen geht es nicht tiefer; kleine Handys starten deshalb eingeklappt.
- **Kontrast:** `INK` (Gold, 4,1:1) und `INK_FAINT` (2,6:1) stehen auf manchen Seiten als kleine Schrift unter 4,5. Aufhellen ändert das Aussehen jeder Seite; das entscheidet der Autor.
- **▲/▼:** Die Pixelschrift hat kein ▲/▼. Vorzeichen +/− stehen überall, Pfeile wären ein neues Zeichen in der Schrift.
- **Wörter**, die der `historiker` angemerkt hat; der Autor entscheidet:
  - „morale“ (18. Jh.);
  - „Gold“, wo man in Silber rechnete;
  - „Integration“ statt etwa „Obedience“;
  - „The Golden Horde“ (Name der 1560er; 1336 eher Ulus Jochi, the Horde, Qipchaq);
  - die Schatzseite nennt Zölle „staple“.
- **Gezeigt, aber nicht gelehrt:** Das Wischen am Blatt.
- **Die Zahl „+275“** steht ohne „/mo“. Die Notiz beim Tipp und der Berater sagen es.

## 4. Feste Regeln dieses HUD

**Format und Größen:**
- **Nur Hochformat.** Geprüft wird bei **1080×2400** (420 dpi), dazu 720×1520 (360 dp) und 720×1280 (16:9).
- Zur Matrix gehören auch Faltgerät außen und innen, Billighandy, S24, Xperia 21:9, Pixel Pro und Ultra (`tools/qa/nightly.sh`).
- Die **Kopfleiste** nimmt offen höchstens 15 % ein; wo das nicht geht, ist sie beim Start eingeklappt.
- Höchstens 3 Elemente je Zeile. Die Uhr ist **ein** Bedienelement mit sechs Stellungen und keine Ausnahme von der Regel, sondern ein Regler.
- Jedes Tippziel mindestens 48 dp. Nichts überlappt (der Autor: *„HUD darf sich nicht überlappen, das sieht billig aus“*).

**Karte und Blätter:**
- **Die Karte ist die Oberfläche.** Blätter haben eine Vorschauhöhe; eine Tafel liegt nie über dem Land, das man antippen soll (B115).
- Kein Reichsname auf fremdem Land, unter dem Efeu oder unter einer offenen Seite (B160–B164).

**Information:**
- Jede Information hat **einen** Stammplatz. Schatz und Stabilität stehen nie doppelt.
- Symbole kommen aus `data/symbols.json`; jedes hat seinen Satz (`SymbolTextsTest`). Halten ist **nur** für Erklärungen.
- Werte zeigen sich, wenn sie etwas zu sagen haben: „bei Änderung“, „+90“ nach einer Seite, Gold und Rot bei Gefahr.
- Meldungen kommen in zwei Stufen und sind stummschaltbar (`NewsDesk`).

**Geld:**
- Kein Kauf im Spielfluss.
- Es gibt nur eine Werbung, beim Start einer neuen Partie, und „Remove the ads“ für 2,99 €.
- Kein roter Punkt für Käufe, kein Countdown (`docs/MONETARISIERUNG.md`, Fair-Prüfung).

**Fremdes Material:**
- Paradox-Spiele sind nur Vorbild im Aufbau. Keine Namen, Texte, Symbole oder Layouts übernehmen.

## 5. Vorgehen

1. **`mittelalter-hud` §10 durchgehen:** einordnen, im Code bestätigen, Ästhetik-Prüfung, Dosierungs-Prüfung.
2. **Stand prüfen:** `git log` seit dem letzten H-Paket. Gibt es das schon, dann **anpassen statt neu bauen**.
3. **Bei einem Auftrag aus `HUD_DOSIERUNG.md`** gelten dessen drei Regeln:
   - Was aus einem Screenshot stammt, im Code bestätigen.
   - Vorschläge nur nach Wahl des Autors bauen.
   - Vorhandenes anpassen.
4. **Ein Paket nach dem anderen.** Erst den Plan zeigen und auf Freigabe warten, dann bauen. Eine Änderung an der Simulation vorher benennen; die H-Pakete brauchten bisher keine.
5. **Prüfen**, bevor man „fertig“ sagt:
   - Harness bei den drei Größen, Bilder zurücklesen. Wie einen Test lesen:
     - `overlaps`;
     - `tap targets`;
     - `cut lines`;
     - `header covers`;
     - `header height`;
     - `sheet lines unshown`;
     - `names off their land`;
     - `names under the interface`.
   - Tutorial-Walks (Meißen, Moskau) bei allen drei Größen, auch `--wander` und `--impatient`.
   - `ContrastTest`, `SymbolTextsTest`, `MapModeFamiliesTest`; `:core:test` und `:sim:jvmTest` ohne Pipe lesen.
   - Der **spieler** prüft jedes Bild, der **historiker** jedes neue Wort, der **anwalt** jede neue Quelle.
6. **Bericht nach `CLAUDE.md` §4:**
   - was gebaut wurde;
   - gemessen vorher und nachher (Zeilen, Höhe in %);
   - was unsicher ist;
   - jede Abweichung benannt;
   - was der Autor entscheiden soll.

**Prompt-Vorlage für ein neues HUD-Paket:**

```
Paket <H5/H6/…>: <Ziel> nach docs/HUD_DOSIERUNG.md <Abschnitt>.
Bestätige jede Zahl, jedes Symbol und jeden Namen im Code; was es
schon gibt, passe an. Vorschläge im Handout baust du nur, wo ich
gewählt habe: <Wahl>. Erst den Plan, dann warte auf meine Freigabe.
Prüfe bei 1080x2400, 720x1520 und 720x1280: overlaps, tap targets,
header height, sheet lines unshown, die Tutorial-Walks; spieler,
historiker, anwalt wie in CLAUDE.md. Bericht nach CLAUDE.md §4.
```

Antworte auf Deutsch. Spieltexte sind englisch.