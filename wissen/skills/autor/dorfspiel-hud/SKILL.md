---
name: "dorfspiel-hud"
description: "Bei jeder Oberfläche des Dorfspiels (Aufbau mit Überfällen, Querformat): Dorfansicht, Bauen, Überfall, Laden, Goldbarren – fair, rechtssicher, im Stil der illuminierten Handschrift."
---

# Dorfspiel-HUD: Aufbau mit Überfällen, im Querformat

Dieser Skill gilt für das **Dorfspiel** (Arbeitstitel), des Autors mittelalterlichen Dorfaufbau mit Überfällen.
- **Lade immer zuerst `mittelalter-hud`.** Ästhetik, Rangordnung, Stilfibel, Dosierung, PixelLab und Prüfablauf stehen dort und gelten hier ohne Abstriche.
- Dieser Skill ergänzt nur, was beim Aufbauspiel anders ist.

**Zuerst lesen, wenn erreichbar:** im Repository `Medieval-village-building-game-` die `CLAUDE.md`, das Stand-Handout, `docs/HISTORIKER.md` und `data/look.json`. In *Sacrum Imperium* `zweitspiel/docs/RECHT.md` und `HANDOUT_AESTHETIK.md`. Wo eine Datei Neueres sagt, gilt die Datei. Nenne den Unterschied.

## 1. Was das Spiel ist (Stand 29.10.2026)

- **Format:** Querformat, geprüft bei **2400×1080**. Dazu immer ein kleines Gerät (1520×720) und 16:9 (1280×720).
- **Ansicht:** isometrisch, schräg von oben, schärferer Pixelstil mit höherem Detail. Ein Raster von 40×40 Feldern in einer Waldlichtung.
- **Arbeit:** Echte Menschen tun die Arbeit. Jede Ware wird erarbeitet und getragen. Es gibt Jahreszeiten, Ernte und einen Händler.
- **Krieg:** Nachbardörfer überfallen, Beute heimtragen, unterwerfen, Zins.
  - Der Kampf findet auf der Karte des Nachbarn statt.
  - Die KI greift ab etwa dem zweiten Jahr selbst an.
- **Ästhetik** (der Autor):
  - *Harmonie, befriedigender Fortschritt, harmonische Menüführung.*
  - *Gebäude und Wege verschmelzen beim Setzen; nichts sieht aufgeklebt aus.*
  - Animationen mit 30 fps.
- **Heute im HUD:**
  - oben links die Vorräte;
  - oben rechts Jahreszeit und Uhr;
  - unten rechts die Werkzeuge Bauen, Straße, Karte der Nachbarn, Zurück;
  - langer Druck erklärt.
- **Vorbilder:** Clash of Clans und Manor Lords, **nur als Genre**.

## 2. Die rote Linie zuerst: nichts nachahmen

Der `anwalt` hat für dieses Spiel festgehalten (`zweitspiel/docs/RECHT.md`):

- **Kein „Clash“** im Namen.
- **Keine Supercell-Eigennamen:** Elixier, Juwelen, Clan-Burg und ähnliche. Deshalb heißen sie „Goldbarren“.
- **Nicht nachahmen:**
  - Comic-Stil;
  - Icons;
  - Gebäudesilhouetten;
  - die Optik von Manor Lords;
  - **die Anordnung des Angriffsbildschirms (Truppenleiste unten).**

  Sonst drohen UWG § 4 Nr. 3 (Nachahmung) und § 5 (Verwechslung).

**Was daraus folgt:**
- Wir übernehmen **Prinzipien** mit Begründung, z. B. „häufige Handlungen in Daumenreichweite“ oder „Badge nur, wenn etwas wartet“.
- Wir übernehmen **keine Anordnungen**.
- Jede Anordnung wird aus unserer eigenen Begründung abgeleitet (Daumenzonen im Querformat, Handschrift-Grammatik) und sieht eigenständig aus.
- Im Zweifel fragt man den `anwalt` vor dem Bauen.

## 3. Finger im Querformat

- Quer hält man das Handy mit **zwei Händen**. Die Daumen liegen an der **linken und rechten unteren Seite**. Quer heißt zwei Daumen und Kamerasteuerung (Bethesda, *Elder Scrolls: Blades*, GDC 2019, B).
  - Ein Knopf in der Bildschirmmitte war schwer erreichbar und kostete die Spieler Kämpfe (dieselbe Quelle).
- **Kamera aus den Daumenwegen:** Ziehen, Kneifen, Antippen in der Mitte.
- **Feste Knöpfe:** an die Seiten.
- Die **Kamera-Aussparung** liegt quer an der Seite. Dort keine Tippziele; der Schmuckrand darf dahinter laufen.
- Die Höhe ist knapp, nur etwa **411 dp bei 2400×1080**. Kopf- und Fußleisten fressen schnell die Welt.
  - Schicht 0 muss schmal bleiben.
  - Blätter und Seiten kommen von der **Seite** und nicht von unten, damit das Dorf in der Mitte sichtbar bleibt.
  - Das ist ein Vorschlag, der Autor entscheidet.
- **UI-Skalierung** als Einstellung. Manor-Lords-Spieler und Clash-of-Clans-Spieler haben sie vermisst und verlangt (B/C).

## 4. Zwei Ansichten, zwei Haltungen

### 4.1 Das Dorf (bauen, wirtschaften)

| Schicht | Was | Vorschlag – der Autor entscheidet |
|---|---|---|
| 0 | Vorräte, Zeit, die beiden Hauptwege | Oben links höchstens **4 Vorräte** in fester Reihenfolge (z. B. Silberpfennige, Holz, Nahrung, Familien), der Rest über langen Druck oder die Vorratsseite. Oben rechts Jahreszeit und Uhr. Unten rechts die Werkzeuge wie heute (Bauen, Straße, Karte der Nachbarn). **Bauen** und **Kriegszug** sind die zwei Grundhandlungen; beide müssen in Daumenreichweite liegen. Achtung: Clash of Clans zeigt sie seit Okt. 2026 als gespiegelte Knöpfe unten links und unten rechts. Diese Anordnung **nicht** kopieren (§2); die eigene Anordnung prüft der `anwalt`. |
| 1 | Antippen eines Gebäudes oder Menschen | Blatt von der Seite: Name, Bild, 3 Symbolwerte (Arbeiter, Erzeugung, Lager), **warum es steht** (keine Straße, kein Holz, keine Leute). |
| 2 | Seiten | Bauliste, Vorräte, Menschen, Händler, Ziele. Holzseite mit Goldkante, höchstens 3 Elemente je Zeile. |
| 3 | Erklärung | langer Druck, mit Aufschlüsselung (Zufluss/Abfluss je Monat) |

- **Zuerst in der Welt zeigen, dann als Zahl.**
  - Was jemand trägt, steht über seinem Kopf. Rauch, Arbeit und Wege zeigen, was geschieht.
  - Das ist Information in der Welt selbst; sie lenkt nicht ab.
  - Zahlen ergänzen nur, was die Welt nicht zeigen kann. *Manor Lords* wurde gelobt für „kontextuelle“ Oberfläche und Fruchtbarkeitsansichten (C) und kritisiert, weil Verbrauch und Dauer von Strafen fehlten (C).
  - Darum: **Verbrauch je Monat und der Grund, warum etwas steht, sind Pflicht.**
- **Eine Bauliste statt Suchen** (Clash of Clans, Okt. 2026, B, als Prinzip):
  - Laufende Bauten stehen oben, kürzeste zuerst.
  - Tippen auf einen Eintrag führt die Kamera zum Gebäude.
  - Tippen auf etwas Gesperrtes führt zum Hindernis und sagt, was fehlt.
  - Das Dorf bleibt hinter dem Menü sichtbar.
- **Nur die Vorräte zeigen, die diese Seite ausgibt** (B).
- **Knöpfe nur, wenn sie gebraucht werden:**
  - „Umbauen“ nur im Baumodus.
  - Der Kriegsknopf trägt ein Zeichen, wenn ein Zug unterwegs ist oder ein Nachbar droht.
- **Jahreszeit:** Vorschlag als **Monatsbild** im Stil der Kalenderseiten der Stundenbücher (Arbeiten der Monate: Säen, Ernten, Holzschlag). So steht die Uhr in der Handschrift-Grammatik.
  - Der `historiker` prüft vorher, was um 1335 in England, Nordfrankreich und dem Reich belegt ist.
  - Keine späten Vorlagen wie die *Très Riches Heures* (um 1410).

### 4.2 Platzieren: Bauen und Straßen

- **Ziehen, dann bestätigen** (B, mehrere Entwickler):
  - Ein Fußabdruck rastet im Raster ein.
  - Er ist **gültig oder ungültig** in Grün oder Rot **plus Zeichen ✓/✗**, denn Farbe trägt nie allein.
  - Bestätigen mit ✓, Abbrechen mit ✗, dazu Drehen.
- **Die Vorschau zeigt schon das Verschmelzen.** Gebäude und Weg setzen sich sichtbar in den Boden, nichts wirkt aufgeklebt (der Autor). Ein Fußabdruck als bloßer Kasten widerspricht der Ästhetik.
- **Falsch Gesetztes blockiert nichts.** Es geht beim Verlassen des Baumodus ins Lager, statt das Speichern zu sperren. Was im Weg steht, leuchtet auf (Clash of Clans 2021, B, als Prinzip).
- **Straßen zieht man mit dem Finger.**
  - Rückgängig ist immer einen Tipp entfernt.
  - Abreißen nur mit Rückfrage, weit weg vom Bauknopf.
- **Befriedigender Fortschritt:**
  - Das Gebäude wächst sichtbar aus dem Boden, Bauleute tragen das Holz hin.
  - Fertig heißt: ein kurzer Moment, kein Feuerwerk.
  - **Rangaufstieg** (Dorf → Kirchdorf → Marktdorf → kleine Stadt) ist Stufe 1 der Rangordnung: volle Bordüre, Initiale mit Szene. Sonst nichts bekommt diese Pracht.

### 4.3 Der Überfall

Das Dorfspiel ist nicht Clash of Clans: Der Haufen **marschiert Tage**, der Kampf findet auf der Karte des Nachbarn statt, die Beute wird **getragen**. Das HUD folgt dem Spiel, nicht dem Vorbild.

- **Vor dem Zug: in Ruhe erkunden.**
  - Was hat der Nachbar an Vorräten, Verteidigung und Leuten?
  - Klare Wahl: „Ziehen“ oder „Zurück“.
  - Erkunden kostet nichts.
  - Offline gegen die KI gibt es keinen Zeitdruck.
- **Im Kampf zeigt das HUD nur:**
  - das Ziel;
  - wie viele Leute noch stehen;
  - was schon getragen wird;
  - einen **„Rückzug“ mit Rückfrage**.

  Alles aus der Dorfansicht verschwindet.
- **Nichts vorausgewählt.** Ein zufälliger Tipp auf die Karte schickt nie Leute los (Clash of Clans 2018, B, als Prinzip).
- **Wo man ansetzen darf, ist vor dem ersten Tipp sichtbar.** Ein abgelehnter Tipp sagt sofort, warum (C).
- **Die Zeit hilft dem Finger:** Ist eine Gruppe ausgewählt, verlangsamt sich die Zeit, damit man in Ruhe zielt (*Bad North*, C).
- **Wo die Truppen stehen:** **nicht** als Leiste unten (rote Linie, §2). Vorschlag aus den Daumenzonen im Querformat:
  - die Haufen als **Bannerreihe an einer Seite** in Daumenreichweite, je ein Banner mit Wappen und Zahl;
  - Befehle am anderen Daumen.

  Der `anwalt` prüft die Anordnung vor dem Bau, der Autor entscheidet.
- **Leute sind Dorfbewohner.**
  - Ein Gefallener fehlt seiner Familie. Das HUD sagt das ruhig, nach dem Kampf, in der Chronik, mit Namen.
  - Kein Schockeffekt, keine Zahlenwand.
- **Heimkehr:** Beute wird getragen und kommt sichtbar an. Die Bilanz erscheint als Pergamentkarte: Gewonnen, Verloren, Zins ab Herbst.

### 4.4 Meldungen

- **Hält an:**
  - ein Nachbar greift an (Warnung mit Tagen bis zur Ankunft);
  - Hunger;
  - der eigene Zug ist angekommen.
- **Chronik, gesammelt:**
  - Zins eingetroffen;
  - Händler da;
  - Geburten, Zuzug;
  - Bauten fertig.
- Jede Art lässt sich stummschalten.

## 5. Goldbarren und Laden: fair, so wie der Autor es entschieden hat

**Entscheidung des Autors (29.10.2026, zweimal geschickt):** Goldbarren wie die Juwelen bei Clash of Clans, kaufbar, um Ausbauzeit zu überspringen, **aber fair**. Das ist sein Recht. Dieser Skill überstimmt ihn nicht. Er regelt, wie die Oberfläche das fair macht.

**Das Risiko kurz:**
- Bezahl-Abkürzungen stehen im eigenen Fairness-Test von *Sacrum Imperium* unter „immer rot“. Ob der Test hier gilt, entscheidet der Autor.
- Die EU-Verbraucherbehörden (CPC, Grundsätze vom 21.3.2025) verlangen:
  - den Euro-Preis neben jedem Spielwährungspreis;
  - keinen Druck;
  - Vorsicht bei Minderjährigen.
- Die Verbraucherorganisation BEUC hat 2024 Clash of Clans unter den Spielen genannt, deren Spielwährung die Kosten verschleiert.
- Der echte Kauf bleibt aus, bis Google Play Billing eingebaut ist und ein echter Anwalt geprüft hat (`anwalt`).

**Regeln für die Oberfläche:**
1. **Der kostenlose Weg steht zuerst und groß.** Am Bauplatz sieht man zuerst Bauleute, Holz und die Zeit bis fertig. „Mit Goldbarren fertigstellen“ ist ein **kleinerer, zweiter Knopf**.
2. **Jede Ausgabe von Goldbarren wird bestätigt.**
   - Kein Knopf, der Barren ausgibt, liegt neben einem häufigen Knopf.
   - Kein Knopf wechselt den Platz.
   - Bei Clash Royale führte ein vertauschter Knopf zu ungewollten Ausgaben; der Entwickler entschuldigte sich (B).
3. **Kaufen nur im Laden**, und den öffnet man selbst:
   - kein Pop-up beim Start;
   - kein Angebot nach einem Kampf oder nach Werbung;
   - keine Kaufaufforderung im Spielfluss oder an Kinder.
4. **Im Laden steht der Euro-Preis immer sichtbar.** Bei jedem Barren-Preis im Spiel ist der Gegenwert im Laden nachvollziehbar. Pakete sind einfach, keine verschachtelten Währungen.
5. **Kein Countdown, kein „nur heute“, kein falscher roter Punkt.** Der Laden-Punkt erscheint nur, wenn dort wirklich etwas Kostenloses wartet.
   - Supercell entschuldigte sich 2026 für einen „FREE“-Punkt ohne Inhalt und nannte ihn kritisch (B).
   - *Rise of Kingdoms* zeigte täglich einen falschen Punkt (C).
6. **Barren verdient man sichtbar und stetig:** Ziele, Zins, Erfolge. Die Zielseite zeigt, wo die nächsten herkommen.
7. **Nicht im Kampf einsetzbar.** Keine Lootboxen. Nichts Zufälliges gegen Geld.
8. **Bauzeiten bleiben kurz**, so dass niemand zahlen *muss* (Vorschlag des Stand-Handouts). Clash of Clans hat 2025 selbst Wartezeiten gestrichen (B). Werden Zeiten so lang, dass der Kauf nötig wirkt, ist das Druck: Bauzeiten senken, nicht den Laden lauter machen.
9. **Historische Begründung im Text:** „zusätzliche Bauleute bezahlen“. Der Satz beim langen Druck sagt genau das.

## 6. Mehr Detail, gleiche Handschrift

Siehe `mittelalter-hud` §4. Für das Dorfspiel heißt das:
- **Silhouette zuerst.**
  - Langhaus, Mühle, Hof und Musterplatz sind ganz herausgezoomt an der Form unterscheidbar.
  - Soldaten sind an Helm und Waffe unterscheidbar.
  - Die Papierpuppe darf Detail haben, die Umrissform muss bleiben.
- **Der Boden ist gemalt und ruhig.** Detail sitzt in Gebäuden, Menschen und Arbeit.
  - Getretene Wege und Jahreszeiten-Tönung sind Grund und tragen keinen Umriss.
  - Mindestens ein Drittel ruhiger Boden bleibt.
- **Die Oberfläche ist ruhiger als die Welt.** Je lebendiger das Dorf, desto stiller die Zahlenfelder.
  - Holzseiten mit Goldkante;
  - Pergamentkarten;
  - Fraktur nur für Titel;
  - kein Kasten um Zahlen.
- **Helme nach Zeitalter** (Topfhelm, Beckenhaube, Hundsgugel ab ~1360, Schaller und Armet erst im 15. Jh.). Auch im HUD (Musterplatz, Bannerreihe) zeigt jedes Bild nur, was im Zeitalter belegt ist. Der `historiker` prüft vorher.
- **Wappen-Editor:**
  - Er erzwingt die Tinkturregel: Metall nicht auf Metall, Farbe nicht auf Farbe.
  - Ein Verstoß wird mit einem Satz erklärt statt stumm verboten.
  - Keine echten Wappen wie Lilien, englische Löwen oder Reichsadler (`historiker`).
  - Vorschau auf Schild, Fahne und Waffenrock.
- **Animationen mit 30 fps** nur dort, wo etwas geschieht: Arbeit, Marsch, Kampf, Mühlenflügel, Rauch. Kein Grund-Bild bewegt sich.

## 7. Vorgehen bei jeder Anfrage

1. Lies `mittelalter-hud` und gehe dessen §10 durch: einordnen, im Code bestätigen, Ästhetik-Prüfung, Dosierungs-Prüfung.
2. **Zusätzlich prüfen:**
   - Ist es von Clash of Clans oder Manor Lords **abgeleitet statt nachgeahmt** (§2)? Bei jeder Anordnung, die einem Vorbild ähnelt, den `anwalt` fragen.
   - Passt es zum Querformat: Daumen an den Seiten, Höhe knapp, Kamera-Aussparung frei (§3)?
   - Welche Ansicht: Dorf, Platzieren oder Überfall? Zeigt das HUD in dieser Ansicht nur das Nötige (§4)?
   - Zeigt die Welt es schon (Tragen, Rauch, Wege)? Dann keine zweite Zahl dafür.
   - Berührt es Geld? Dann gelten alle Regeln aus §5. Die Fair-Prüfung des Autors läuft mit, und das Ergebnis steht im Bericht.
3. **Prüfen am Bild:**
   - Harness bei 2400×1080, 1520×720 und 1280×720, Bilder zurücklesen.
   - `overlaps` und Tippziele unter 48 dp lesen wie einen Test.
   - Der `spieler` prüft jede sichtbare Änderung.
4. **Ergebnis:**
   - Befund;
   - Vorschlag mit „der Autor entscheidet“;
   - was schon da ist (anpassen statt neu bauen);
   - Belegstufe A/B/C;
   - auf Wunsch ein Prompt für Claude Code: ein Paket, erst planen, dann Freigabe.

## Quellen (Auswahl)

- Supercell:
  - Clash of Clans, neue Oberfläche (8.10.2026): https://supercell.com/en/games/clashofclans/blog/news/weve-revamped-the-clash-of-clans-user-interface/
  - Nachtrag (15.10.2026): https://supercell.com/en/games/clashofclans/blog/news/a-word-on-the-new-home-village-screen/
  - Nichts vorausgewählt (2018): https://supercell.com/en/games/clashofclans/blog/news/upcoming-quality-of-life-improvements
  - Truppenleiste skalierbar, Lager beim Umbauen (2021): https://supercell.com/en/games/clashofclans/blog/game-updates/quality-of-life-improvements-june21
  - Wartezeiten gestrichen (2025): https://supercell.com/en/games/clashofclans/blog/release-notes/welcome-to-clash-anytime-update
- Clash Royale, vertauschter Knopf: https://devtrackers.gg/clash-royale/p/1fb35f85-they-flipped-the-queue-button-needless-to-say-i-spent-gems-to-open-a-chest-just-wow
- Bethesda, *Blades*, hoch und quer (GDC 2019): https://content1.m.uesp.net/wiki/General:Building_the_Interface_of_The_Elder_Scrolls:_Blades_in_Landscape_and_Portrait
- Manor Lords:
  - Review: https://gameluster.com/manor-lords-early-access-review-hamfisted-hochadel/
  - Spielerstimmen: https://vaporlens.app/app/1363080/manor_lords
- Bad North mobil: https://www.gamezebo.com/reviews/bad-north-jotunn-edition-mobile-review-the-strategy-roguelite-finds-a-comfortable-home-on-the-touchscreen/
- Rise of Kingdoms: https://blog.udonis.co/mobile-marketing/mobile-games/rise-of-kingdoms-analysis
- CPC-Grundsätze zu Spielwährungen (2025): https://www.gleisslutz.com/en/know-how/new-guidelines-game-currencies-digital-consumer-protection-and-expanding-taboo-dark-patterns
- BEUC (2024): https://www.beuc.eu/press-releases/consumer-groups-denounce-video-games-manipulative-spending-tactics
- Townsmen, faires Modell: https://apps.apple.com/us/app/-/id6761844920