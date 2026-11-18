---
name: "spielgefuehl-belohnung-flow"
description: Bei jedem Effekt, jeder Belohnung, jedem Übergang, jeder Level-Kurve und jedem Sitzungsende in Shelf Town und anderen Casual-Spielen Befunde der Hirnforschung zu Belohnung und Flow fair und messbar anwenden.
---

# Spielgefühl: Belohnung und Flow

## Wofür

Dieser Skill gilt für jede Entscheidung, die bestimmt, wie sich das Spielen anfühlt: Effekte, Klänge, Belohnungen, Übergänge, Level-Kurven, Freischaltungen, Sitzungsanfang und Sitzungsende. Er übersetzt gut belegte Befunde aus Hirnforschung und Psychologie in konkrete Werte.

**Zuerst lesen, wenn vorhanden:** die Dateien in `docs/` (Konzept, Handout „Spielgefühl und Effekte“), dazu `data/juice.json`, `data/praise.json`, `data/specials.json`, `data/economy.json`, `data/unlocks.json`. Wo eine Datei Genaueres sagt, gilt die Datei. Nenne den Unterschied.

**Grundhaltung:** Ziel ist Freude, die der Spieler gut fände, wenn er wüsste, wie sie gemacht ist. Kein Zwang. Jede Idee muss die Fairness-Prüfung am Ende bestehen. Der Autor entscheidet.

## Die zwölf Prinzipien

Jedes Prinzip nennt: **Befund** (mit Quelle), **Im Spiel**, **Werte**, **Prüfen**.

### 1. Überraschung schlägt Vorhersehbarkeit

- **Befund:** Dopamin-Neuronen reagieren auf Belohnungen, die besser sind als erwartet. Voll erwartete Belohnungen lösen kaum noch eine Antwort aus; bleibt eine erwartete Belohnung aus, sinkt die Aktivität (Schultz, Dayan & Montague 1997).
- **Im Spiel:** Grundbelohnungen sind verlässlich (jeder Sieg bringt Münzen und einen Stern). Darüber liegt eine Schicht kleiner Überraschungen: Ketten, Spezial-Waren, wechselnder Kisteninhalt. Dieselbe Belohnung immer gleich verpackt nutzt sich ab, darum variieren Effekte und Töne.
- **Werte:** im Schnitt 0,5 bis 1 mögliche Kette pro Level; Funkenfarben wechseln; häufige Klänge ±3 % Tonhöhe; Kisteninhalt zufällig, aber gratis.
- **Prüfen:** Wird eine Belohnung jedes Mal exakt gleich gezeigt? Dann eine Variation einbauen.
- **Grenze:** Zufall nur bei Gratis-Belohnungen, nie gegen Geld.

### 2. Vorfreude ist ein eigener Gipfel

- **Befund:** Schon die Erwartung einer Belohnung aktiviert das Belohnungssystem; der Nucleus accumbens reagiert stärker, je größer die erwartete Belohnung ist (Knutson u. a. 2001). Bei Musik wird Dopamin sowohl in der Erwartung (Nucleus caudatus) als auch am Höhepunkt (Nucleus accumbens) ausgeschüttet, in zwei getrennten Phasen (Salimpoor u. a. 2011).
- **Im Spiel:** Jede größere Belohnung bekommt einen Aufbau: Die Kiste wackelt, der Ton steigt, eine kurze Pause, dann die Auflösung.
- **Werte:** Aufbau 200 ms (kleine Belohnung), 300 ms (Kiste), 600 ms (Ladeneröffnung); per Tipp abkürzbar; nie länger als 1 Sekunde.
- **Prüfen:** Erscheint eine große Belohnung ohne Aufbau? Aufbau ergänzen.

### 3. Effekte an Leistung koppeln, abgestuft

- **Befund:** In einem vorregistrierten Experiment mit 1.699 Teilnehmenden steigerte Feedback, das vom Erfolg abhängt, Neugier, Kompetenzerleben und Wirksamkeitsgefühl. Bloßes Verstärken der Effekte senkte diese Motive dagegen. Neugier sagte Spielspaß am stärksten voraus und war der einzige Treiber freiwilliger Spielzeit (Kao, Ballou, Gerling, Breitsohl & Deterding, CHI 2024). Schon frühere Arbeiten fanden, dass zu viel wie zu wenig „Saft“ ungünstig ist.
- **Im Spiel:** Die Größe eines Effekts folgt der Leistung: Lob-Stufen, Kombos, Ketten. Kein Feuerwerk fürs bloße Antippen. Jede Wirkung ist klar mit der Aktion verbunden, die sie ausgelöst hat.
- **Werte:** fünf Lob-Stufen (`data/praise.json`); kleine Treffer nur Klang, Funken und Zahl; Wackeln erst ab Stufe 4.
- **Prüfen:** Wäre der Effekt genauso groß, wenn der Spieler nichts Besonderes geleistet hätte? Dann verkleinern.

### 4. Neues hält wach

- **Befund:** Neue Reize aktivieren das Belohnungssystem des Mittelhirns (Substantia nigra und VTA) stärker als bekannte (Bunzeck & Düzel 2006). Neugier treibt freiwillige Spielzeit (Kao u. a. 2024).
- **Im Spiel:** Alle 3 bis 10 Level kommt etwas Neues dazu. Neugier wird geweckt: Schatten der nächsten Schicht, verdeckte Kisten, der Umriss des nächsten Ladens.
- **Werte:** In den ersten 100 Leveln nie mehr als 10 Level ohne Neuerung.
- **Prüfen:** Freischaltungen aus `data/unlocks.json` gegen die Level-Nummern legen; Lücken über 10 Level melden.

### 5. Nähe zum Ziel beschleunigt

- **Befund:** Menschen strengen sich umso mehr an, je näher sie einem Ziel sind (Zielgradient; Kivetz, Urminsky & Zheng 2006).
- **Im Spiel:** Fortschritt ist immer sichtbar und in kleine Etappen geteilt: Level-Balken, „noch 2 Sterne“ bis zur nächsten Renovierung, Pass-Stufe. Zwei gleiche Waren auf einem Regal leuchten leicht („fast geschafft“).
- **Werte:** Das nächste Ziel ist nie weiter als 1 bis 3 Level entfernt. Bei kleinen Resten „noch X“ statt „X von Y“ anzeigen.

### 6. Geschenkter Vorsprung

- **Befund:** Waschkarten mit 10 Feldern, von denen 2 schon gestempelt waren, wurden zu 34 % eingelöst; Karten mit 8 leeren Feldern nur zu 19 %, bei gleichem Aufwand (Nunes & Drèze 2006).
- **Im Spiel:** Neue Fortschrittsleisten beginnen nicht bei null: Pass-Stufe 1 ist geschenkt, ein neues Album startet mit 2 Postkarten, eine neue Renovierung mit der ersten Aufgabe als Geschenk.
- **Werte:** 10 bis 20 % Startfortschritt. Ehrlich: Geschenkter Fortschritt verfällt nie.

### 7. Unterbrochenes will man fortsetzen

- **Befund:** Menschen neigen dazu, unterbrochene Aufgaben wieder aufzunehmen (Ovsiankina-Effekt). Der bekanntere Zeigarnik-Effekt (bessere Erinnerung an Unerledigtes) ist in neueren Auswertungen nur schwach belegt; darauf nicht bauen.
- **Im Spiel:** Eine Sitzung endet mit einem sichtbaren, fast erreichten nächsten Ziel: eine halb renovierte Fassade, der Pass kurz vor der nächsten Stufe.
- **Werte:** Der Stadt-Bildschirm zeigt immer das nächste Ziel mit Balken. Nie mit Verlust drohen.

### 8. Höhepunkt und Ende prägen die Erinnerung

- **Befund:** Menschen beurteilen ein Erlebnis vor allem nach seinem stärksten Moment und seinem Ende (Spitze-Ende-Regel; Kahneman, Fredrickson, Schreiber & Redelmeier 1993).
- **Im Spiel:** Jedes Level endet mit dem Ladenschluss-Finale. Der Verlust-Bildschirm ist weich und zeigt ehrlich, wie knapp es war. Nach einem schweren Level folgt ein leichtes. Eine Sitzung endet idealerweise mit einer Renovierung oder Belohnung.
- **Werte:** Finale 2 bis 4 Sekunden; Verlust-Klang kurz und verspielt, nie traurig.

### 9. Flow: klare Ziele, sofortiges Feedback, passende Schwierigkeit

- **Befund:** Flow entsteht bei klaren Zielen, unmittelbarem Feedback und einem Gleichgewicht von Herausforderung und Können (Csikszentmihalyi 1990).
- **Im Spiel:** Während eines Levels gibt es keine Unterbrechung: keine Fenster, keine Werbung, keinen Text. Das Ziel ist auf einen Blick klar (Balken, Kunden). Die Schwierigkeit kommt in Wellen; nach 3 Verlusten im selben Level gibt es einen Gratis-Hinweis.
- **Werte:** Antwort auf jeden Tipp unter 100 ms; Level-Start höchstens 1 Sekunde nach dem Tipp auf „Weiter“; Übergänge 150 bis 300 ms; Hinweis nach 8 Sekunden ohne Zug; Erfolgsquoten-Ziele aus dem Konzept.

### 10. Können, freie Wahl, Zugehörigkeit

- **Befund:** Spiele motivieren dauerhaft, wenn sie das Bedürfnis nach Kompetenz, Autonomie und Verbundenheit erfüllen (Ryan, Rigby & Przybylski 2006).
- **Im Spiel:** Kompetenz: sichtbar besser werden, Spezial-Waren nur durch Können. Autonomie: Reihenfolge der Renovierungen wählen, Booster ja oder nein. Verbundenheit: Figuren mit Namen, die eigene Stadt, später Teams.
- **Prüfen:** Nährt eine neue Funktion mindestens eines der drei Bedürfnisse, ohne ein anderes zu verletzen?

### 11. Leicht zu verarbeiten heißt schön

- **Befund:** Was das Gehirn leicht verarbeitet (klar, kontrastreich, symmetrisch), gefällt verlässlich besser (Reber, Schwarz & Winkielman 2004). Das Arbeitsgedächtnis hält etwa vier Einheiten zugleich (Cowan 2001).
- **Im Spiel:** drei Helligkeitsebenen (Hintergrund blass, Regale mittel, Waren am hellsten); höchstens vier gleichrangige Informationen gleichzeitig; eine Bedeutung pro Farbe; unmögliche Züge sind gar nicht möglich.
- **Prüfen:** Screenshot verkleinert und unscharf ansehen: Ist in einer Sekunde klar, worum es geht?

### 12. Alle Sinne gleichzeitig

- **Befund:** Antworten unter etwa 0,1 Sekunden wirken unmittelbar (Miller 1968). Bild, Klang und Vibration, die gemeinsam ankommen, verschmelzen zu einem kräftigen Ereignis; in der Praxis bleibt der Versatz zwischen Klang und Vibration unter 15 ms.
- **Im Spiel:** feste Reihenfolge eines Treffers: Klang und Vibration bei 0 ms, Blitz bei 20 ms, Funken bei 50 ms, Zahl bei 100 ms.

## Spielfluss-Regeln

- Vom App-Start bis zum ersten möglichen Zug höchstens 3 Sekunden; zwischen Leveln höchstens 1 Sekunde.
- „Weiter“ steht immer am selben Ort, in Daumennähe.
- Belohnungs-Bildschirme lassen sich mit einem Tipp beschleunigen.
- Nach einem Level höchstens ein Fenster: Werbung oder Angebot oder Freischaltung, nie mehrere hintereinander.
- Etwa alle 3 bis 5 Minuten ein Etappenziel (Renovierung, Pass-Stufe).
- Natürliche Pausenpunkte sind erlaubt und erwünscht, zum Beispiel nach einer Ladeneröffnung.

## Werte-Spickzettel

| Was | Wert |
| --- | --- |
| Antwort auf Tippen | unter 100 ms |
| Treffer-Reihenfolge | 0 / 20 / 50 / 100 ms |
| Trefferpause | 50 bis 90 ms je nach Stufe |
| Bildschirm-Wackeln | erst ab Stufe 4: 4 px, 80 ms; Super-Effekt 8 px, 100 ms |
| Funken | 20 bis 30 je Treffer, bis 80 bei Stufe 5 |
| Vorfreude-Aufbau | 200 bis 600 ms |
| Übergänge | 150 bis 300 ms |
| Hochzählen | 400 bis 800 ms |
| Kombo-Fenster | 2,5 s |
| Halbton-Leiter | 12 Stufen, Rücksprung nach 2,5 s ohne Treffer |
| Lob-Wort sichtbar | 1,2 s |
| Hinweis bei Untätigkeit | nach 8 s |
| Rückmeldungen pro Sekunde | höchstens 3 bis 5, außer im Finale |
| Blinken | höchstens 3-mal pro Sekunde |

## Ablauf bei jeder Anfrage

1. **Einordnen:** Geht es um die Sekunde (ein Zug), die Minute (ein Level) oder den Tag (Stadt, Events, Sitzungen)?
2. **Prinzipien wählen:** meist zwei bis vier aus der Liste.
3. **Werte festlegen:** konkrete Zahlen, immer in `data/*.json`, nie im Code.
4. **Fairness-Prüfung** (unten).
5. **Messbar machen:** welches Analytics-Ereignis, welche Kennzahl (D1, D7, Sitzungen pro Tag, Abbruch je Level, Zeit bis „Weiter“), welcher A/B-Test über Remote Config.
6. **Selbst ansehen:** Screenshot oder kurzes Video aufnehmen und fragen: Wohin geht das Auge zuerst? Fühlt sich der Moment verdient an? Ist es zu viel?
7. **Ausgabe:** Befund, Vorschlag mit Werten, Ergebnis der Fairness-Prüfung, Messplan. Bei Grenzfällen entscheidet der Autor.

## Fairness-Prüfung

**Zwei Fragen vor jeder Idee:** Würde der Spieler zustimmen, wenn er wüsste, wie es gebaut ist? Macht es mehr Spaß oder nur mehr Wollen?

**Immer verboten:**

- Zufall gegen Geld (Lootboxen, bezahlte Kartenpakete).
- Vorgetäuschte Beinahe-Gewinne. Beinahe-Gewinne aktivieren dieselben Hirnregionen wie Gewinne und steigern den Wunsch weiterzuspielen (Clark u. a. 2009). Darum werden sie nie künstlich erzeugt; echte knappe Ergebnisse dürfen ehrlich gezeigt werden.
- Strafen fürs Fernbleiben, verfallende Serien, Serien zurückkaufen.
- Erfundene Knappheit, Countdowns, die neu starten, erfundene Vorher-Preise.
- Größere Effekte für Käufe als für Können.
- Effekte, die eine Belohnung größer aussehen lassen, als sie ist.
- Blinken öfter als dreimal pro Sekunde; jede Bewegung ohne die Einstellung „Weniger Bewegung“.
- Level, die nur mit Kauf lösbar sind.

## Quellen

- Schultz, W., Dayan, P. & Montague, P. R. (1997). A neural substrate of prediction and reward. Science, 275, 1593–1599.
- Knutson, B., Adams, C. M., Fong, G. W. & Hommer, D. (2001). Anticipation of increasing monetary reward selectively recruits nucleus accumbens. Journal of Neuroscience, 21(16).
- Salimpoor, V. N., Benovoy, M., Larcher, K., Dagher, A. & Zatorre, R. J. (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. Nature Neuroscience, 14, 257–262.
- Kao, D., Ballou, N., Gerling, K., Breitsohl, H. & Deterding, S. (2024). How does juicy game feedback motivate? Testing curiosity, competence, and effectance. CHI 2024.
- Bunzeck, N. & Düzel, E. (2006). Absolute coding of stimulus novelty in the human substantia nigra/VTA. Neuron, 51, 369–379.
- Kivetz, R., Urminsky, O. & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. Journal of Marketing Research, 43, 39–58.
- Nunes, J. C. & Drèze, X. (2006). The endowed progress effect. Journal of Consumer Research, 32(4), 504–512.
- Kahneman, D., Fredrickson, B. L., Schreiber, C. A. & Redelmeier, D. A. (1993). When more pain is preferred to less: Adding a better end. Psychological Science, 4, 401–405.
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience.
- Ryan, R. M., Rigby, C. S. & Przybylski, A. (2006). The motivational pull of video games. Motivation and Emotion, 30, 344–360.
- Reber, R., Schwarz, N. & Winkielman, P. (2004). Processing fluency and aesthetic pleasure. Personality and Social Psychology Review, 8, 364–382.
- Cowan, N. (2001). The magical number 4 in short-term memory. Behavioral and Brain Sciences, 24, 87–114.
- Miller, R. B. (1968). Response time in man-computer conversational transactions.
- Clark, L., Lawrence, A. J., Astley-Jones, F. & Gray, N. (2009). Gambling near-misses enhance motivation to gamble and recruit win-related brain circuitry. Neuron, 61, 481–490.
- W3C, WCAG 2.1, Erfolgskriterium 2.3.1 (höchstens drei Blitze pro Sekunde).
