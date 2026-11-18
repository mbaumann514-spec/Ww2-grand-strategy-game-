---
name: "mittelalter-hud"
description: "Bei jeder Oberfläche, jedem HUD, Menü, Symbol oder Bild für des Autors Mittelalter-Spiele (Sacrum Imperium, Dorfspiel): Ästhetik der illuminierten Handschrift wahren, Information richtig dosieren."
---

# Mittelalter-HUD: Ästhetik und Dosierung für beide Spiele

Du gestaltest oder prüfst die Oberfläche eines Mittelalter-Spiels des Autors: HUD, Menü, Seite, Symbol, Bild oder Animation. Es gibt zwei Spiele:
- ***Sacrum Imperium***: Grand Strategy, Europa 1336, Hochformat.
- **Dorfspiel** (Arbeitstitel): Dorfaufbau mit Überfällen, Querformat.

Dazu gibt es je Spiel einen eigenen Skill. Lade ihn mit:
- `sacrum-imperium-hud` für *Sacrum Imperium*;
- `dorfspiel-hud` für das Dorfspiel.

**Zuerst lesen, wenn erreichbar:**
- In *Sacrum Imperium*: `docs/HUD_DOSIERUNG.md` (Maßstab für das HUD), `docs/STIL.md` §8 (Stilfibel), `docs/VISION.md`.
- In `zweitspiel/docs/`: `HANDOUT_AESTHETIK.md`.
- Im Dorfspiel-Repository: das Stand-Handout und die eigene `CLAUDE.md`.

Sonst gilt die Kurzfassung unten. Wo eine Projektdatei etwas Neueres sagt, gilt die Datei. Nenne den Unterschied.

---

## 1. Die Ästhetik ist gesetzt

Der Autor, 22.10.2026: Beschriftung, Verzierung und Anmutung sind die der **illuminierten Handschrift**. *„Sei sehr vorsichtig und betrachte die Ursprungsvision der Ästhetik und respektiere sie sehr.“*

> **Schmuck am Rand, Ruhe in den Zahlen.**

- **Wird nie minimalisiert:**
  - Buchrand, Ranken, Drolerien;
  - Goldkanten und Edelsteinrahmen;
  - Wappen;
  - Fraktur-Rubriken;
  - das ¶;
  - die Tiere der Uhr (Kranich = Pause, Schnecke, Storch, Hase, Falke, Schwalbe).
- **Wird weniger:** Wörter, Zeilen und Wiederholungen *in* den Zahlenfeldern.
- **Warum das trägt:** Verzierte Darstellungen werden genauso genau gelesen und Wochen später besser erinnert (Bateman u. a. 2010, A). Schmuck gehört an Rahmen, Köpfe und Ränder, nicht in die Daten (Tufte, C).
- **Zugänglich heißt nicht vereinfacht.** Der Autor: *„minimalistischer, aber die Informationen müssen klar und dieselben sein“*.
- **Die Visionsbilder des Autors sind das oberste Maß.** Sie zeigen:
  - einen Blütenrand;
  - Pergamenttafeln mit Goldkante;
  - tiefblaue Kacheln mit goldenen Symbolen;
  - ein kleines Porträt mit Edelsteinrahmen;
  - eine Wertezeile;
  - eine Schriftrolle mit Herold als Meldung.

  Die Bilder liegen im claude.ai-Projekt und **nie** im Repository; dort sind KI-Bilder und Bilddateien verboten.
- **Entschieden ist auch:**
  - Holzseiten mit Goldkante (*Sacrum Imperium*, vom Autor am 22.10. bestätigt);
  - Pergamentknöpfe mit ¶;
  - die rote Initiale;
  - die drei Rahmenarten.

  **Nichts davon ändern, ohne zu fragen.**

## 2. Die Rangordnung der Buchmaler

Buchmaler hatten dasselbe Problem: viel Inhalt, wenig Fläche, und das Auge muss sofort sehen, was wichtig ist. Ihre Lösung war eine feste **Hierarchie der Verzierung**. Jede Handschrift hielt ihre eigene Leiter ein (HMML nach M. Brown; British Library zum Luttrell-Psalter).

| Stufe | Buchmalerei | Rolle in der Oberfläche |
|---|---|---|
| 1 | Initiale mit Szene, volle Bordüre, Gold, Edelsteine | Herrscher, große Ereignisse, Kapitel- oder Rangaufstieg. Sonst nichts. |
| 2 | Goldbuchstabe auf blau-rosa Grund | Was jetzt eine Entscheidung braucht, z. B. ein Zähler |
| 3 | Rubrik in Zinnober | Seitentitel in großer Fraktur (`#ec6a45`). In kleiner Schrift nur in `#ff9575` (4,5:1), so wie in *Sacrum Imperium* die neue Aufgabe unter der Kopfleiste („Now: …“) und der Name des Kartenmodus. Weitere Orte für kleine Rubrik entscheidet der Autor. |
| 4 | Fleuronnée-Initiale | Reiter, Abschnittsbeginn |
| 5 | ¶ im Wechsel rot und blau | Listenpunkte, Menüzeilen. **Die Farbe trägt keine Bedeutung**, sie gibt nur den Rhythmus. |
| 6 | Zeilenfüller | Leere Plätze statt leerer Fläche |
| 7 | Bas-de-page, Drolerien | Stimmung, **nie** Pflichtinformation |

**Bordürendichte nach Wichtigkeit:** Die Hauptansicht trägt den Rand. Gewöhnliche Seiten tragen die Holzseite mit Goldkante. Volle Pracht bleibt Stufe 1 vorbehalten.

## 3. Stilfibel kurz

**Drei Ebenen:**

| Ebene | Was | Umriss | Farbe |
|---|---|---|---|
| Grund | Boden, Wasser, Wald, Felder | keiner | gedämpft |
| Dinge | Häuser, Burgen, Figuren, Heere, Wappen, Symbole | 1 Bildpixel `#1f1b16`, rundum geschlossen | **voll**, in Handschriftfarben |
| Oberfläche | Leisten, Seiten, Knöpfe, Schrift | Holz oder Goldkante | Pergament und Holz |

**Palette:**
- Eine Palette für alles: `tools/palette.json`. Jedes PixelLab-Bild wird beim Import darauf abgebildet.

**Farbrollen:**

| Rolle | Farbe |
|---|---|
| Text auf Holz | `#f2e4bc` |
| Gold (Kanten, Auswahl, Pfeil) | `#c9a25a` |
| Rubrik in großer Fraktur (Titel) | `#ec6a45` |
| Rubrik in kleiner Schrift | `#ff9575` |
| Gewinn | `#9edb75` |
| Verlust | `#ff9a80` (in *Sacrum Imperium* seit 23.10. aufgehellt, vorher `#f58066`) |
| Holz | `#5e3d24` / `#4d321d` |

**Was die Farben dürfen:**
- Gelb, Grün und Rot tragen Bedeutung. Kein Baum und kein Dach zeigt sie kräftiger.
- **Farbe trägt nie allein:** Immer steht +/− dabei. Die Pixelschrift hat kein ▲/▼; Pfeile wären ein neues Zeichen.
- Blau und Orange sind als Einstellung möglich (etwa 8 % der Männer sehen Rot und Grün schwach).

**Kontrast** (WCAG, B):
- Kleiner Text braucht 4,5:1, große Schrift 3:1.
- Nachgerechnet auf `#5e3d24`:

  | Farbe | Kontrast |
  |---|---|
  | Text `#f2e4bc` | 7,7 |
  | Grün | 5,9 |
  | Verlust `#ff9a80` | 4,7 |
  | Rubrik klein `#ff9575` | 4,5 |
  | Gold `#c9a25a` | 4,1 |
  | Rubrik groß `#ec6a45` | 3,1 |

- Das alte Rot `#f58066` (3,8) war für kleine Schrift zu schwach. Der Autor hat am 22.10. „Rot heller + immer Vorzeichen“ gewählt; `ContrastTest` prüft das in *Sacrum Imperium*.
- Gold und die blasse Tinte (`INK_FAINT`, 2,6) liegen in kleiner Schrift unter 4,5. Aufhellen ändert jede Seite; das entscheidet der Autor.
- Rubrik `#ec6a45` nur in großer Fraktur.

**Pixel:**
- Nur in ganzen Vielfachen und ungefiltert zeichnen.
- Auf einem Bildschirm haben alle Dinge dieselbe Pixelgröße.
- Symbole gibt es in 24, 32 und 48 Pixeln.
- Jede Tippfläche ist mindestens 48 dp groß, mit 8 dp Abstand.

**Schrift:**
- Jersey 10 für allen Text.
- Jacquard 12 (Fraktur) nur für Titel.
- Beide stehen unter SIL OFL. Keine dritte Schrift, keine Kursive, nichts unter 11 dp.
- Leichter Schatten, ein Pixel nach rechts unten.

**Drei Rahmenarten, mehr nicht:**
1. der Buchrand, einmal;
2. die Holzseite mit Goldkante für alles, was sich öffnet;
3. die Pergamentkarte für ein Element.

Kein Kasten um eine Zahl.

**Ruhe:**
- Mindestens ein Drittel Boden bleibt zwischen Bäumen sichtbar.
- Keine Objekte im Wasser außer denen, die die Simulation braucht.
- Bewegung nur dort, wo etwas geschieht.
- Kein Bild steht zweimal gleich nebeneinander.

## 4. Detailgrad: mehr Pixel, gleicher Look

Das Dorfspiel zeigt mehr Detail als *Sacrum Imperium*, folgt aber derselben Ästhetik. Was das heißt:

- **Pixelmaßstab bleibt.** Mehr Detail heißt mehr Pixel je Ding, nie größere oder halbe Pixel.
- **Silhouette vor Detail.** Firaxis zu *Civilization VI*: Weil man die Welt meist von weitem sieht, zählen Form und klare Silhouette (B). Jedes Ding muss klein als Umriss erkennbar sein. Detail belohnt das Heranzoomen, es ist nicht die Hauptsache.
- **Detail in die Dinge, Ruhe im Grund.** Mehr Detail im Grund macht das Bild „überladen“. Das bemängelte der Tester bei *Sacrum Imperium* am 13.10.
- **Die Oberfläche konkurriert nicht mit der Welt.** Paradox' Ziel für *Victoria 3* war prunkvoll, aber nicht schwer, und die Karte darf nicht konkurrieren (B). Je reicher die Welt, desto ruhiger die Zahlenfelder.
- **Was gleich bleibt:**
  - Palette;
  - Licht von links oben;
  - ein Pixel Umriss;
  - flache Flächen mit zwei Tönen, keine Verläufe, kein Rauschen;
  - eine Geste je Figur;
  - Schriften und Rahmen.
- **Was je Spiel festgelegt wird** (der Autor entscheidet, in der `CLAUDE.md` des Spiels notieren):
  - Farben je Figur (*Sacrum Imperium*: etwa 15);
  - Bildgrößen;
  - Bilder je Animation (Dorfspiel: 30 fps, 12–16 Bilder je Laufzyklus).

## 5. Dosierung: vier Schichten

| Schicht | Was | Budget |
|---|---|---|
| 0 – Blick | was man ständig braucht | etwa **4** Werte (Arbeitsgedächtnis ≈ 4 Einheiten, Cowan 2001, A) |
| 1 – Antippen | ein Blatt zum Ding; die Welt bleibt sichtbar | eine Zeile mit 3 Symbolwerten, 2 Knöpfe |
| 2 – Seite | Holzseite | je Zeile höchstens **3** Elemente; Symbol + Zahl + Farbe statt Satz |
| 3 – Erklärung | langer Druck | ein Satz von höchstens ~12 Wörtern, darunter die Aufschlüsselung |

- **Jede Information hat genau einen Stammplatz.** Sie wird tiefer gelegt, nie weggenommen. Dieselbe Zahl steht nie zweimal (Sweller, A).
- **Feste Plätze:** Werte stehen immer an derselben Stelle, in derselben Reihenfolge, in derselben Farbe. Nie nach Kontext umsortieren, denn Experten lernen die Position mit (Chase & Simon, A).
- **Höchstens zwei Ebenen Aufklappen**, tiefer nur über Erklärungen, die man zurückblättern kann (NN/g, B).
- **Zahlen zeigen sich, wenn sie etwas zu sagen haben.** Ein ausgeblendeter Wert rückt nach vorn, solange er im roten Bereich ist.
- **Änderungen sichtbar machen.** Wer von einer Seite zurückkommt, sieht kurz „+12“ oder „−40“. Begründung: Änderungsblindheit (Simons & Levin 1997, A).
- **Meldungen in zwei Stufen** (Wickens 2007: drei Stufen waren nicht besser als zwei, A):
  - **Hält an:** Eine Entscheidung ist nötig oder etwas Unumkehrbares ist geschehen.
  - **Chronik:** alles andere, gesammelt („Letzter Monat: Geburten 2 · Bauten 3“).
  - Jede Art lässt sich dauerhaft stummschalten (EU5 1.1, B).
- **Der lange Druck** ist nur für Erklärungen da (Feral, *Rome: Total War* mobil, B).
  - Er ist eine versteckte Geste: versteckte Navigation wurde in 44–56 % der Aufgaben genutzt, sichtbare in 89 % (NN/g). Nur 31 % benutzten einen Hilfeknopf (Andersen 2012).
  - Darum lehrt der Berater ihn in der ersten Minute.
  - Die Erklärung erscheint **über** dem Finger.
  - Begriffe darin sind antippbar, Zurück geht eine Karte zurück. Das ist CKs verschachtelte Erklärung, übertragen auf Touch.
- **Wörter:** Spieler lesen kaum mehr als etwa 8 Wörter auf einmal (Faustregel von Brode nach George Fan, C). Keine ganzen Sätze in Zahlenfeldern.
- **Symbole:**
  - Symbol mit Wort wird besser verstanden als Symbol allein (NN/g, B).
  - Wo ein Symbol nicht in 5 Sekunden klar ist, steht ein Wort darunter, oder es wird ersetzt (§8).
  - Jedes Symbol hat seinen Satz in `data/symbols.json`; ein Test erzwingt das.
- **Rote Punkte** nur, wo sich der Besuch lohnt. Nie für Käufe, nie falsch (Supercell 2026, B; Rise of Kingdoms als Gegenbeispiel, C).
- **Tutorial:**
  - Kontextbezogen, denn das bringt in komplexen Spielen rund 29 % mehr Spielzeit; sperrende Tutorials brachten nichts (Andersen 2012, A).
  - Der Berater zeigt mit einem goldenen Pixelpfeil.
  - Ein Schritt geht erst nach der Tat weiter, der Spieler bleibt aber frei.

## 6. Finger und Bildschirm

Hoober (2013/2017, A):
- 49 % halten das Handy mit einer Hand.
- Etwa 75 % der Berührungen kommen vom Daumen.
- In der Mitte trifft man am genauesten (≈7 mm Streuung), an den Rändern am ungenauesten (≈12 mm).

Daraus folgt:
- Ziele am Rand größer machen.
- Häufiges in die Daumenzone, Seltenes in Untermenüs.
- **Unumkehrbares weg von Häufigem**, mit Rückfrage oder Rückgängig (Balatro: Karten aus Versehen verkauft, C).
- Tippen zeigt, Halten erklärt, und **nichts Zerstörerisches liegt dort, wo häufige Gesten enden**.
- Sichere Bereiche (Notch, Gestenleiste) bleiben frei von Tippzielen. Der Schmuckrand darf dahinter laufen.
- „Zurück“ schließt zuerst, was offen ist.

## 7. Menüs

- Das Titelbild ist das Frontispiz: Bild, Initiale, Titel.
- **„Weiter“ ist der größte Knopf**, mit Wappen, Reich bzw. Dorf und Datum darauf. Kurze Sitzungen machen ihn zur häufigsten Handlung.
- **Spielstände** mit Wappen vorn, Name, Datum und „vor x h“, neueste zuerst. Löschen nur über langes Drücken mit Rückfrage.
- **Einstellungen:**
  - Das Wort steht links, der Wert rechtsbündig in Gold.
  - Höchstens etwa fünf Einträge je Ebene (Apple HIG, B).
- **„Spiel schließen“ und „Zum Titel“** stehen abgesetzt unter einer Zierlinie.
- Die Pergamentknöpfe mit ¶ bleiben.

## 8. Neue Symbole und Bilder mit PixelLab

Der Autor, 22.10.2026: Wo Symbole nicht eindeutig sind, darf die Symbolsprache mit PixelLab verbessert werden.

1. **Erst prüfen, ob ein vorhandenes Bild passt.** *Sacrum Imperium* hat etwa 1.460 Bilder in `PixelLabArt.kt`, das Dorfspiel dazu `DorfArt.kt`.
2. **PixelLab-Konto:** Beide Spiele teilen sich eins. Vorher den Stand nennen; unter 20 Generierungen den Autor fragen. Nur PixelLab, kein anderer Generator.
3. **historiker vorher:** Was ist für Zeit und Ort richtig, mit Quelle? Gibt es eine PD/CC0-Vorlage auf Wikimedia Commons? Das Stundenbuch der Jeanne d'Evreux im Met ist CC0.
4. **Beschreibung nach Ebene**, damit neue Bilder passen:
   - **Ding:** „pixel art, lit from upper left, flat medieval manuscript colours, one-pixel dark outline #1f1b16 all round, transparent background, no text, no ground plate“.
     - Bauten und Figuren: „three-quarter view“ (im Dorfspiel die schräge Aufsicht der Dorfkarte).
     - **Symbole und Wappen: „front view“**, denn schräg gezeichnete Stangen wirkten wie Beine.
   - **Grund:** „pixel art, lit from upper left, limited palette of muted earth tones, no outline, soft edges into the ground, transparent background, no text“.
   - Dann folgen das Motiv und die Vorgaben des historikers.
5. **historiker nachher:** grob, mittel oder Detail. Bei grob wird neu generiert.
6. **Import:**
   - auf die Palette abbilden;
   - Umriss angleichen;
   - Text-Atlas mit `GENERATED`-Kopf über ein Skript in `tools/`;
   - **keine Bilddatei im Repository**;
   - Satz in `symbols.json`;
   - Vorlage in `LICENSES.md`, im selben Commit.
7. **spieler:** Fünf-Sekunden-Test vor und nach dem Tausch.

## 9. Recht in der Oberfläche

- Genre-Vorbilder (Paradox-Spiele, Clash of Clans, Manor Lords) sind nur **Vorbild im Aufbau**. Nie Namen, Texte, Symbole, Bilder, Silhouetten oder Layouts übernehmen (UWG §§ 4 Nr. 3, 5). Den anwalt bei jedem Zweifel.
- Keine Kaufaufforderung an Kinder (BGH „Runes of Magic“).
- Der Preis steht in Euro.
- Keine Countdown-Angebote, kein „nur heute“, kein Kaufangebot direkt nach Werbung.
- Store und Videos zeigen nur echtes Gameplay. Inszeniertes heißt „inszeniert“.
- Niemals persönliche Daten in Oberfläche, Repository, Video oder Chat.
- Impressum höchstens zwei Taps entfernt.

## 10. Vorgehen bei jeder Anfrage

1. **Einordnen:**
   - Welches Spiel, welche Ansicht, welches Format (hoch oder quer)?
   - Welche Schicht (0–3)?
   - Welche Stufe der Rangordnung (§2)?
   - Zusätzlich den Skill des Spiels lesen: `sacrum-imperium-hud` oder `dorfspiel-hud`.
2. **Im Code bestätigen.** Jede Zahl, jedes Symbol und jede Bezeichnung aus einem Screenshot vorher im Code nachsehen. Screenshots lesen sich leicht falsch.
3. **Ästhetik-Prüfung.** Ein Nein bei einer der sechs Fragen heißt: nicht so bauen.
   1. Bleibt jeder Schmuck aus §1 unangetastet?
   2. Sitzt der Schmuck am Rand und nicht in den Zahlen?
   3. Trägt jedes Element die Stufe seines Rangs, nicht mehr?
   4. Stimmen Ebene, Umriss, Palette, Pixelmaßstab, Schrift und Rahmenart (§3)?
   5. Passt es neben die Visionsbilder?
   6. Ist es frei von übernommenen Namen, Bildern oder Layouts (§9)?
4. **Dosierungs-Prüfung:**
   - Dieselbe Information wie vorher?
   - Weniger Zeilen?
   - Höchstens 3 je Zeile, etwa 4 in Schicht 0?
   - Ein Stammplatz je Information?
   - Tippziele mindestens 48 dp?
   - Nichts Zerstörerisches neben Häufigem?
5. **Ergebnis** mit Belegstufe (A Studie · B Plattform, Entwickler, Daten · C Presse oder Einschätzung):
   - Befund;
   - Vorschlag, gekennzeichnet mit **„Vorschlag – der Autor entscheidet“**;
   - was schon da ist (**anpassen statt neu bauen**);
   - was der Autor entscheiden muss;
   - auf Wunsch ein Prompt für Claude Code: ein Paket, erst planen, dann Freigabe.
6. **Prüfen am Bild:**
   - Harness-Bild bei der Bezugsgröße des Spiels und auf zwei kleinen Geräten, zurücklesen;
   - `overlaps: none` und `tap targets under 48 dp: none` wie einen Test lesen (der Autor: *„HUD darf sich nicht überlappen, das sieht billig aus“*);
   - `tools/qa/stilpruefung.py` für neue Bilder;
   - der **spieler** prüft jede sichtbare Änderung, der **historiker** jedes Bild und jede Beschriftung, der **anwalt** jede neue Quelle.

## 11. Die Spiele kurz

| | *Sacrum Imperium* | Dorfspiel |
|---|---|---|
| Format | Hochformat, geprüft bei 1080×2400, dazu 720×1520 und 720×1280 | Querformat, geprüft bei 2400×1080 |
| Hauptansicht | Europakarte | Dorf auf 40×40-Raster, schräg von oben |
| Maßstab für das HUD | Skill `sacrum-imperium-hud` und `docs/HUD_DOSIERUNG.md` (H1–H4 gebaut, H5 und H6 offen) | Skill `dorfspiel-hud` |
| Geld | kostenlos, eine Werbung beim Start einer Partie, werbefrei 2,99 €, DLCs; Bezahl-Abkürzungen „immer rot“ | Goldbarren zum Fertigstellen (Entscheidung des Autors), fair gestaltet; siehe `dorfspiel-hud` |

**Grand Strategy hochkant, die Regeln aus *Sacrum Imperium*:**
- **Die Karte ist die Oberfläche.** Reviewer bestrafen Menüs, die sie verdecken: EU5-Baumenü, CK3 auf der Konsole, Civ VI (C).
- Blätter haben eine Vorschauhöhe.
- Die Kopfleiste nimmt höchstens 15 % der Höhe und ist einklappbar.
- Kartenmodi stehen in Familien zu je drei, als Symbol mit Wort.
- Die linke Spalte zeigt Symbole, mehr steht hinter „…“.
- Einzelheiten, Stand und offene Pakete: `sacrum-imperium-hud`.

Antworte auf Deutsch. Spieltexte sind englisch.

## Quellen (Auswahl)

**Grand Strategy (Entwickler):**
- EU5, Tinto Talks #77: https://admin-forum.paradoxplaza.com/forum/developer-diary/tinto-talks-77-20th-of-august-2025.1856053
- CK3, Dev Diary #16: https://admin-forum.paradoxplaza.com/forum/developer-diary/ck3-dev-diary-16-tutorials-and-tooltips-and-encyclopedias-oh-my.1345581
- Victoria 3, Dev Diary #49: https://www.paradoxinteractive.com/games/victoria-3/news/dev-diary-49-graphic-overview
- Victoria 3, Dev Diary #74: https://www.paradoxinteractive.com/games/victoria-3/news/dev-diary-74-ux-improvements
- Feral, Rome Total War auf dem iPad: https://www.feralinteractive.com/en/news/building-rome-the-user-interface-of-rome-total-war-on-ipad/
- Civ VI, Artdirektion (Silhouette): https://www.gamedeveloper.com/art/making-i-civilization-vi-i-both-playable-and-beautiful

**Forschung:**
- Bateman u. a. 2010: https://vis.csail.mit.edu/classes/6.859/readings/pdfs/Bateman-UsefulJunk.pdf
- Cowan 2001: https://pubmed.ncbi.nlm.nih.gov/11515286/
- Simons & Levin 1997: https://home.cs.colorado.edu/~mozer/Teaching/syllabi/3702/readings/SimonsLevin1997.pdf
- Wickens & Colcombe 2007: https://interruptions.net/literature/Wickens-HF07.pdf
- Andersen u. a. 2012: https://grail.cs.washington.edu/projects/game-abtesting/chi2012/
- NN/g:
  - Symbole: https://www.nngroup.com/articles/icon-usability/
  - Progressive Offenlegung: https://nngroup.com/articles/progressive-disclosure/
  - Versteckte Navigation: https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/
- Hoober 2017: https://www.uxmatters.com/mt/archives/2017/07/design-for-fingers-touch-and-people-part-3.php
- WCAG-Kontrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

**Buchmalerei:**
- HMML, Hierarchie der Verzierung: https://hmmlschool.org/lexicon/14584/
- British Library, Luttrell-Psalter: https://searcharchives.bl.uk/catalog/032-002085986
- Smithsonian, Initialen: https://www.smithsonianmag.com/blogs/smithsonian-books/2024/09/26/how-decorated-initials-made-early-book-pages-pop/
- Met, Stundenbuch der Jeanne d'Evreux (CC0): https://www.metmuseum.org/art/collection/search/470309