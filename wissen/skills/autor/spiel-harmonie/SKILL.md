---
name: "spiel-harmonie"
description: "Bei jeder Mechanik, jedem Bildschirm, Ereignis, Text, Klang oder Kaufangebot in des Autors Spielen: wie ein Mensch mit Auge für Schönheit hinschauen und spielen; Bugs, schlechte Ästhetik und unnatürliche Mechaniken erkennen, Zeichen, HUD und Perspektive prüfen; aus griechischer und christlicher Philosophie und Psychologie begründen, heilen und alles schöner machen."
---

# Harmonie und Stimmigkeit – das Auge der Seele

## Wozu

Ein Mensch mit Auge für Schönheit sieht ein Bild und spürt sofort, ob etwas nicht stimmt. Wenn er hinschaut, kann er ganz klar sagen, **wo** es sich falsch anfühlt. Danach kann er sagen, **warum**.

Dieser Skill lässt Claude genau so schauen und spielen: erst sehen, dann fühlen, dann urteilen, dann heilen, dann wieder sehen, bis das Auge ruht. So findet er drei Arten von Missklang, die sich für eine empfindsame Seele alle „falsch“ anfühlen:
- **schlechte Ästhetik:** Bilder, Farben, Tafeln;
- **Fehler (Bugs):** was die eigene Ordnung des Werks bricht;
- **unnatürliche Mechaniken:** Regeln, die sich künstlich, willkürlich oder unfair anfühlen.

Und er hört nicht beim Heilen auf: Wenn nichts mehr stört, fragt er, was das Werk **schöner** machen würde (*Vom Richtigen zum Schönen*).

Anlass war ein Tester, der Sacrum Imperium „visuell überladen“ fand, mit „wenig Harmonie“. Die Stilfibel (`docs/STIL.md` §8) regelt das Bild. Dieser Skill ist das Auge, das prüft, ob es wirklich schön geworden ist. Er gilt auch für Mechaniken, Zahlen, Ereignisse, Texte, Tempo, Klang, Menüs und Kaufangebote.

Er gilt für Sacrum Imperium (Hochformat) und für das Dorfspiel (Querformat).

**Vorrang:** Bei Einzelheiten gehen vor:
- die Entscheidungen des Autors;
- `CLAUDE.md`, `docs/VISION.md`, `docs/STIL.md`, `docs/HUD_DOSIERUNG.md`, `docs/BUGS.md`;
- die Skills `mittelalter-hud`, `mittelalter-pixelgrafik`, `sacrum-imperium-hud`, `dorfspiel-hud`, `sacrum-imperium-spielerbindung`, `aufbauspiel-monetarisierung`.

Dieser Skill ersetzt keine dieser Regeln.

## Der Ästhet und die Werkstatt: wer was tut

Der Skill ist um einen Agenten herum gebaut: den **Ästheten** (`.claude/agents/aesthet.md`, im Dorfspiel `zweitspiel/.claude/agents/aesthet.md`), einen Menschen mit feinem Auge und empfindsamer Seele für Harmonie. Er ist das Auge, die Hauptsitzung ist die Werkstatt.

| Wer | Tut was |
|---|---|
| **Hauptsitzung (Werkstatt)** | besorgt das Material (Renders, Filme, Spielprotokolle, Headless-Läufe), ruft den Ästheten, heilt nach seinem Befund, ruft ihn wieder, schreibt den Commit |
| **Ästhet** | schaut und spielt unbefangen, fühlt, urteilt, gibt den Befund mit Belegen und die Steigerung, und sagt, ob das Auge ruht. Er ändert nie selbst etwas. |

So wird der Ästhet gerufen:
1. **Nur Material und Frage, nicht die Absicht.** Der Auftrag nennt, was er ansehen oder spielen soll (Dateipfade, Harness-Befehle, Seed) und welcher Teil des Spiels betroffen ist. Er sagt nicht, was das Paket erreichen wollte und was die Werkstatt selbst schon für gelungen hält. Nur so bleibt sein Auge frisch.
2. **Ein Gegenstand je Ruf**, bei einer Gesamtschau die ganze Liste.
3. **Sein Befund wird nicht geglättet.** Die Werkstatt heilt, was er findet, oder benennt im Commit und im Bericht an den Autor, warum nicht.
4. **Wieder rufen** nach der Heilung, mit den neuen Bildern und ohne den alten Befund. Er soll ja frisch sehen. Höchstens drei Runden.
5. **Neben den anderen Prüfern:** Der Historiker prüft, ob es *wahr* ist, der Anwalt, ob es *erlaubt* ist, der Spieler, ob es *Spaß macht*, der Ästhet, ob es *stimmt und schön ist*. Ihre Befunde widersprechen sich selten. Tun sie es doch, entscheidet der Autor.

Ist kein Agent verfügbar (etwa in einem Chat ohne Repository), übernimmt Claude die Rolle selbst nach diesem Skill. Dann vermerkt er ausdrücklich: *nicht unbefangen geprüft*.

## Warum das wie eine Seele funktioniert

Die Kirchenlehrer beschreiben das Erkennen von Schönheit als Vorgang der Seele. Dieser Vorgang ist der Ablauf des Skills.

- **Thomas von Aquin:** Schön ist, was beim Anschauen gefällt (*Summa* I q.5 a.4). Schönheit gehört zu den Sinnen, die am meisten erkennen: Auge und Ohr. Schön ist, worin das Verlangen beim Anschauen **zur Ruhe kommt** (I-II q.27 a.1 ad 3). Daher das Ziel des Skills: Das Auge ruht.
- **Augustinus:** Die Seele trägt ein inneres Maß in sich, gegen das sie alles Gesehene misst (*De vera religione* 30–31, *De musica* VI). Deshalb spürt sie den Fehler, bevor sie ihn benennen kann. Und sie spürt ihn, weil er wirklich da ist: Etwas gefällt, weil es schön ist, nicht umgekehrt (*De vera religione* 32,59). Thomas sagt dasselbe (*In De divinis nominibus* c. 4): Wir lieben etwas, weil es schön ist.
- **Bonaventura** nennt drei Schritte (*Itinerarium mentis in Deum* II,4–6): **apprehensio**, das Aufnehmen; **oblectatio**, das Gefallen oder Missfallen; **diiudicatio**, das Urteil über den Grund.

Schönheit ist also objektiv, aber sie wird zuerst **gefühlt** und erst dann begründet. Ein Befund beginnt deshalb mit dem Gefühl und endet mit einem benannten Grund. Ein Gefühl ohne Grund ist noch kein Befund. Ein Grund ohne Gefühl ist oft nur Regelreiterei.

### Die drei Wurzeln

Der Skill baut ein Spiel, keine Kirche. Er nimmt aus drei Quellen, was über Schönheit und über den Menschen wahr ist, und wendet es auf Bildschirme und Regeln an:

| Wurzel | Was sie lehrt | Wofür im Skill |
|---|---|---|
| **Philosophie** (Pythagoras, Platon, Aristoteles, Plotin) | Schönheit ist Maß, Ordnung, Einheit und das rechte Verhältnis; eine Handlung ist schön, wenn ihre Teile *wegen* einander geschehen. | Proportion, Überschaubarkeit, Einheit, die Gesetze der lebendigen Welt |
| **Katholische Lehre** (Augustinus, Dionysius, Bonaventura, Thomas von Aquin, Johannes Paul II., Ratzinger) | Schönheit ist wirklich und gehört mit dem Wahren und Guten zusammen. Sie wird zuerst gefühlt und dann erkannt; das Verlangen kommt in ihr zur Ruhe. Es gibt wahre Schönheit, die zur Sache führt, und falsche, die nur verführt. | der Ablauf (sehen, fühlen, urteilen), Ganzheit, Klarheit, Zusammenklang, wahre und falsche Schönheit |
| **Psychologie** (Wahrnehmung, Gestalt, Motivation, Spiel) | Warum das Auge so urteilt: Es gruppiert nach Nähe und Ähnlichkeit, trennt Figur und Grund, liebt, was sich leicht erfassen lässt, aber nicht, was zu einfach ist. Spielen macht Freude, wenn es Können, freie Wahl und Verbundenheit nährt. | die Proben, die Wörterbücher, die Messungen, die Spielproben |

Die Psychologie bestätigt die alte Lehre in vielem: Ordnung, Symmetrie und Klarheit werden leichter verarbeitet und gefallen deshalb verlässlich (Reber, Schwarz und Winkielman 2004). Sie ergänzt sie dort, wo die Alten wenig sagen: bei Bildschirmen, Zahlen, Regeln und Spielfreude.

### Was die Psychologie beiträgt

**Wahrnehmung (Gestaltgesetze, Wertheimer 1923).** Das Auge ordnet, bevor es denkt:
- **Figur und Grund:** Was wichtig ist, muss sich vom Grund lösen. Verschmelzen Figur und Hintergrund (gleiche Farbe, gleiches Muster), wird das Bild unruhig.
- **Nähe:** Was nah beieinander liegt, gehört zusammen. Ein Wert, der näher an der falschen Zahl steht, wird falsch gelesen.
- **Ähnlichkeit:** Was gleich aussieht, hat dieselbe Rolle. Zwei Knöpfe mit gleicher Rolle und verschiedenem Aussehen stören, zwei verschiedene mit gleichem Aussehen täuschen.
- **Geschlossenheit und gute Fortsetzung:** Das Auge folgt Linien und schließt Formen. Eine Kante, die fast fluchtet, wirkt wie ein Fehler.
- **Prägnanz:** Das Einfachste setzt sich durch. Was sich nicht einfach fassen lässt, ermüdet.

**Rechte Komplexität (Berlyne 1971).** Zu einfach ist langweilig, zu verwickelt ist anstrengend; gefallen tut die Mitte, und sie verschiebt sich mit der Erfahrung des Spielers. Das ist die Mitte des Aristoteles in heutiger Sprache.

**Kognitive Last (Sweller).** Der Kopf hält nur wenig auf einmal. Was der Spieler sich merken muss, statt es zu sehen, kostet Kraft, die dem Spiel fehlt.

**Spielfreude (Selbstbestimmungstheorie: Ryan, Rigby und Przybylski 2006).** Ein Spiel macht dauerhaft Freude, wenn es drei Bedürfnisse nährt:
- **Können** (Kompetenz): Ich werde besser und sehe es.
- **Freie Wahl** (Autonomie): Meine Entscheidungen zählen, und es gibt mehr als einen guten Weg.
- **Verbundenheit:** Ich gehöre zu etwas: einer Dynastie, einem Dorf, einer Geschichte.

Wird eines davon verletzt, fühlt es sich „unfair“, „egal“ oder „leer“ an. **Flow** (Csikszentmihalyi) entsteht, wenn Herausforderung und Können sich die Waage halten.

## Was Schönheit bedeutet: die Überlieferung der Griechen und der Christen

Die griechische Philosophie und die christliche Lehre sagen über die Schönheit fast dasselbe. Die Kirchenväter haben die Griechen gelesen, geprüft und fortgeführt. Was folgt, ist der gemeinsame Kern, Lehre für Lehre. Zu jeder gehört, was sie für ein Spiel bedeutet.

### Die Griechen

1. **Schönes und Gutes sind eins (*kalon*).** Das griechische Wort *kalon* heißt zugleich „schön“ und „edel, gut“. Platon fragt im *Hippias Maior* nach dem Schönen selbst und endet: *„Schwer ist das Schöne“* (304e).
   *Im Spiel:* Eine Mechanik kann nicht schön sein, wenn sie dem Spieler schadet. Eine hübsch gemachte Falle ist nicht schön.
2. **Die verborgene Harmonie ist stärker als die sichtbare** (Heraklit, Fragment B 54).
   *Im Spiel:* Die tiefste Schönheit liegt in den Systemen unter der Oberfläche, etwa wenn Handel, Ernte und Krieg ineinandergreifen. Der Spieler entdeckt sie nach und nach. Eine Oberfläche, die alles auf einmal zeigt, nimmt ihm die Entdeckung.
3. **Harmonie ist Zahl** (Pythagoreer). Oktave 1:2, Quinte 2:3, Quarte 3:4: Einfache Verhältnisse klingen zusammen.
   *Im Spiel:* Maße, Kosten und Zeiten in einfachen, wiederkehrenden Verhältnissen (Prüfstein 2).
4. **Die Schönheit ist das Sichtbarste und das Liebenswerteste** (Platon, *Phaidros* 250d). Von allem Hohen lässt sich nur die Schönheit mit den Augen fassen. Darum weckt sie die Sehnsucht.
   *Im Spiel:* Schönheit ist die Tür ins Spiel. Der erste Blick, das Titelbild und die erste Minute müssen schön sein, sonst kommt keiner zur Tiefe.
5. **Die Leiter der Schönheit** (Platon, *Symposion* 210a–212a, Rede der Diotima). Vom schönen Körper steigt man zu allen schönen Körpern, dann zur schönen Seele, zu schönen Ordnungen und Erkenntnissen, bis zum Schönen selbst.
   *Im Spiel:* Die Schönheit eines Spiels muss mit den Stunden **tiefer** werden. Zuerst gefallen die Bilder, dann die Regeln, dann die Geschichte, die man selbst erlebt hat. Ein Spiel, das nach der ersten Stunde nichts Schöneres mehr zu zeigen hat, verliert den Spieler.
6. **Maß und Verhältnis machen schön** (Platon, *Philebos* 64e). Das schönste Band ist das, das sich und das Verbundene zur Einheit macht; das leistet die Proportion (*Timaios* 31c).
   *Im Spiel:* Verhältnisse sind kein Selbstzweck. Sie **binden** die Teile zu einem Ganzen. Eine Zahl, die zu nichts im Verhältnis steht, ist ein loser Stein.
7. **Schmeichelei ist nicht Schönheit** (Platon, *Gorgias* 464b–465c). Die Kosmetik täuscht Schönheit vor, wie die Kochkunst Gesundheit vortäuscht. Sie zielt auf die Lust, nicht auf das Gute.
   *Im Spiel:* Glanz, der nur reizt, ist Schminke. Belohnungseffekte, Glitzer und Dringlichkeit, die nichts Gutes tragen, schmeicheln nur (Prüfstein 12).
8. **Ordnung, Symmetrie, Bestimmtheit** (Aristoteles, *Metaphysik* XIII 3, 1078a36). Dazu die rechte **Größe**: überschaubar, nicht zu klein und nicht zu groß (*Poetik* 7).
   *Im Spiel:* Klare Grenzen, eindeutige Regeln, ein Ganzes, das man fassen kann.
9. **Gliederbau und Farbe** (die Stoiker, bei Cicero, *Tusculanen* IV 31): Schönheit des Körpers ist ein passender Bau der Glieder mit einer gewissen Lieblichkeit der Farbe.
   *Im Spiel:* Erst stimmt der Aufbau, dann die Farbe. Eine schöne Farbe rettet keinen schiefen Aufbau.
10. **Die Einheit leuchtet durch die Teile** (Plotin, *Enneade* I 6,1–3). Gegen die reine Proportionslehre: Auch Einfaches ohne Teile ist schön, das Licht, eine einzelne Farbe, ein Ton. Schön ist, wo eine Form die Vielfalt zur Einheit fügt. Die Seele erkennt darin etwas ihr Verwandtes und freut sich.
    *Im Spiel:* Nicht alles braucht Verzierung. Eine ruhige Fläche, eine einzige Farbe, ein klarer Ton können das Schönste auf dem Bildschirm sein.
11. **Das Auge muss sonnenhaft werden** (Plotin, I 6,9): *„Nie hätte das Auge die Sonne gesehen, wäre es nicht sonnenhaft geworden.“* Wer Schönes sehen will, muss selbst schön werden. Plotin sagt dazu: Hör nicht auf, an deinem eigenen Bild zu meißeln.
    *Im Spiel:* Das Auge des Ästheten wird geübt. Darum gibt es die geeichten Beispiele, und darum wird jedes Urteil des Autors als neues Beispiel aufgenommen.

### Die Christen

12. **Die Schöpfung ist „sehr gut“ (*kala lian*)** (Gen 1,31 in der griechischen Bibel: *kalon* heißt auch hier gut und schön zugleich). Das Buch der Weisheit: Aus der Größe und Schönheit der Geschöpfe wird ihr Schöpfer erkannt (Weish 13,5). Gott hat alles nach Maß, Zahl und Gewicht geordnet (Weish 11,20).
    *Im Spiel:* Die Welt des Spiels ist gut gemacht, wenn ihre Ordnung auf ihren Ursprung verweist: Die Regeln sind aus *einem* Gedanken gemacht.
13. **Schön ist, was seinen Zweck vollkommen erfüllt** (Basilius, *Hexaemeron* III 10). Gott beurteilt die Schönheit seines Werks nicht nach dem Reiz für die Augen. Er billigt jedes Werk, weil es den Zweck erfüllt, für den es geschaffen wurde.
    *Im Spiel:* Ein Knopf, eine Tafel oder eine Regel ist schön, wenn sie ihre Aufgabe vollkommen tut. Ein schönes Element, das seine Aufgabe schlecht erfüllt, ist nicht schön.
14. **Das Schöne und das Passende** (Augustinus, *De pulchro et apto*, *Confessiones* IV 13–15). Schön ist, was in sich stimmt; passend ist, was zu anderem stimmt. Beides gehört zusammen.
    *Im Spiel:* Ein Bild kann in sich schön sein und am falschen Ort stören (Prüfstein 4).
15. **Die Form aller Schönheit ist die Einheit** (Augustinus, Brief 18). Die Welt ist schön wie ein Gedicht, auch durch ihre Gegensätze (*De civitate Dei* XI 18).
    *Im Spiel:* Ein Leitsatz trägt das Spiel; Krisen gehören zum Ganzen (Prüfsteine 9 und 10).
16. **„Spät habe ich dich geliebt, du Schönheit, so alt und so neu“** (Augustinus, *Confessiones* X 27). Die höchste Schönheit ist zugleich alt und immer neu.
    *Im Spiel:* Das Schönste nutzt sich nicht ab. Was beim hundertsten Mal noch frisch ist, ist echt schön; was beim zehnten Mal nervt, war nur neu.
17. **Schönheit ruft** (Dionysius Areopagita, *Von den göttlichen Namen* IV 7). Das griechische *kallos* (Schönheit) hängt er an *kalein* (rufen): Die Schönheit ruft alles zu sich. Sie ist Ursache des Zusammenklangs und des Glanzes in allem.
    *Im Spiel:* Schönheit lädt ein, sie zwingt nicht. Ein Spiel ruft den Spieler zurück, weil es schön ist, nicht weil es ihn festhält. Das ist der Unterschied zwischen Bindung und Sucht.
18. **Unendliches Fortschreiten** (Gregor von Nyssa, *Leben des Mose*, die *Epektasis*). Die Seele, die Schönes geschaut hat, wird nicht satt, sondern verlangt immer weiter.
    *Im Spiel:* Es gibt immer noch etwas zu meistern, zu entdecken, schöner zu machen: eine Dynastie, ein Reich, ein Dorf. Aber das Fortschreiten muss echt sein, nicht künstlich gestreckt.
19. **Freude kommt aus der Proportion, auf drei Weisen** (Bonaventura, *Itinerarium* II 5–6): Das Schöne erfreut als **schön** (*speciosum*) für das Auge, als **süß** (*suave*) für das Empfinden, als **heilsam** (*salubre*) für das Ganze des Menschen.
    *Im Spiel:* Eine dreifache Probe. Ist es schön anzusehen? Fühlt es sich gut an zu tun? Tut es dem Spieler gut? Ein Spiel, das schön und süß, aber nicht heilsam ist, gleicht einem Spielautomaten.
20. **Ganzheit, Verhältnis, Glanz** (Thomas von Aquin, *Summa* I q.39 a.8): *integritas, proportio, claritas*. Schön und gut sind in der Sache eins; das Schöne fügt dem Guten die Beziehung zum Erkennen hinzu: Schön ist, was im Anschauen gefällt (I q.5 a.4 ad 1). Albertus Magnus und Thomas nennen Schönheit den **Glanz der Form** (*splendor formae*).
    *Im Spiel:* Die Grundlage der zwölf Prüfsteine.
21. **Erst die Gestalt, dann der Glanz** (Hans Urs von Balthasar, *Herrlichkeit*). Schönheit ist eine Gestalt, aus der ein Glanz bricht. Ohne Gestalt gibt es keinen Glanz.
    *Im Spiel:* Erst muss das Ganze stimmen (Aufbau, Regel, Ablauf), dann darf es leuchten. Glanz auf einer zerbrochenen Form macht den Bruch nur sichtbarer.

### Was das Christliche hinzufügt

Die Christen übernehmen fast alles von den Griechen. Vier Dinge kommen hinzu, und jedes ist für ein Spiel wichtig:

| Hinzugefügt | Lehre | Im Spiel |
|---|---|---|
| **Die Materie ist gut** | Die Schöpfung ist gut, nicht nur die Idee (Gen 1; gegen Plotins Flucht aus der Materie). | Das Konkrete zählt: der einzelne Pixel, die Fuge unter dem Haus, die Falte im Mantel. Schönheit lebt im Detail, nicht nur im großen Entwurf. |
| **Die Menschwerdung** | Das Schönste zeigt sich in einem Einzelnen, in einem Gesicht. Simone Weil, von Benedikt XVI. zitiert: Schönheit ist der Beweis im Experiment, dass Menschwerdung möglich ist. | Das Allgemeine wird schön, wenn es ein Gesicht bekommt: ein Herrscher mit Namen, ein Dorf mit Familien, eine Schlacht mit Toten, die gezählt werden. |
| **Das Kreuz** | *„Die Entstellung Christi gestaltet dich“* (Augustinus, Sermo 27,6). Auch im Leiden kann Schönheit sein; der Prophet sagt, er hatte keine Gestalt und keine Schönheit (Jes 53,2). | Niederlage, Pest, der Tod eines Herrschers dürfen schwer und dunkel sein und trotzdem schön, wenn sie wahr sind und Sinn tragen. Hässlich ist nur das Sinnlose. |
| **Schönheit verwundet und ruft zur Liebe** | Nikolaos Kabasilas (14. Jh., von Ratzinger 2002 zitiert): Der Mensch wird vom Pfeil der Schönheit getroffen. Benedikt XVI. (2009): Echte Schönheit öffnet die Sehnsucht des Herzens; es gibt eine verführerische, heuchlerische Schönheit, die nur die Begierde neu entfacht. | Die Frage an jeden Glanz: Öffnet er etwas, oder hält er nur fest? |

### Die Proben aus der Überlieferung

Diese Proben kommen zu den übrigen hinzu (Schritt 3):

- **Ruft es?** (Dionysius, *Phaidros*): Lädt der Bildschirm oder die Mechanik ein, oder drängt sie? Würde der Spieler wiederkommen, weil es schön ist, oder nur, weil er nicht loskommt?
- **Schön, süß, heilsam?** (Bonaventura): alle drei, oder nur die ersten zwei?
- **Erfüllt es seinen Zweck vollkommen?** (Basilius): Ist dieses Element schön *in seiner Aufgabe*?
- **Erst Gestalt, dann Glanz?** (Balthasar): Steht das Ganze, bevor es leuchtet?
- **Führt es höher?** (die Leiter des *Symposion*, Bonaventuras *Itinerarium*): Wird die Schönheit mit der Spielzeit tiefer, oder bleibt sie an der Oberfläche?
- **Alt und neu zugleich?** (Augustinus): Ist es beim hundertsten Mal noch frisch?
- **Schminke oder Gesundheit?** (*Gorgias*): Schmeichelt es dem Spieler, oder tut es ihm gut?
- **Hat das Dunkle Sinn?** (das Kreuz, *De civitate Dei* XI 18): Ist das Schwere wahr und bedeutsam oder nur grausam?

## Der Ablauf

### Schritt 0 – Unbefangen bleiben

Wer weiß, was gemeint war, sieht, was er sehen will. Deshalb:
- Zuerst das Bild ansehen, **bevor** Commit, Absicht oder Code gelesen werden.
- Die Schau macht der **Ästhet** (siehe *Der Ästhet und die Werkstatt*). Er bekommt nur die Bilder oder das Spiel und die Frage *„Was fühlt sich hier falsch an, und wo?“*, nicht die Absicht.
- Wer das Bild selbst gebaut hat, bewertet es nicht allein.

### Schritt 1 – Sehen (apprehensio)

Das echte Bild besorgen, nie aus der Erinnerung urteilen:
- Bildschirme über den Skill `render`: Hochformat bei 1080×2400 (Sacrum Imperium), Querformat für das Dorfspiel.
- Bei allem, was sich mit dem Zoom ändert: weite und nahe Ansicht.
- Bei Bewegung: ein paar Bilder aus `--film`.
- Bei einer Mechanik: spielen, nicht lesen (siehe *Die Seele im Spiel*).

Dann auf vier Arten schauen. Ein Maler macht das genauso, um sein Bild mit frischen Augen zu sehen:

| Blick | Was er zeigt |
|---|---|
| **Klein** (Handygröße aus Armlänge) | das Ganze: Gleichgewicht, Hauptsache, Überladung |
| **Blinzeln** (unscharf) | wohin das Auge zuerst geht; was zu laut ist |
| **Grau** (ohne Farbe) | die Helligkeitsordnung: ob das Wichtige auch das Hellste oder Kontrastreichste ist |
| **Spiegel** (seitenverkehrt) | was die Gewöhnung versteckt hat: Schieflagen, falsche Abstände |

Die vier Blicke als ein Bogen (Python mit Pillow; falls es fehlt: `pip install --break-system-packages pillow`). Das Skript gehört in den Scratchpad, nicht ins Repository:

```python
# seelenblick.py  BILD  AUSGABE
import sys
from PIL import Image, ImageFilter, ImageOps
im = Image.open(sys.argv[1]).convert("RGB")
w = 270; h = round(im.height * w / im.width)
klein = im.resize((w, h), Image.LANCZOS)
blick = [klein, klein.filter(ImageFilter.GaussianBlur(w / 90)),
         ImageOps.grayscale(klein).convert("RGB"), ImageOps.mirror(klein)]
bogen = Image.new("RGB", (w * 4 + 30, h), "white")
for i, b in enumerate(blick): bogen.paste(b, (i * (w + 10), 0))
bogen.save(sys.argv[2])
```

Den Bogen mit `Read` ansehen. Danach in die Nähe gehen: Ausschnitte, mit `Image.NEAREST` drei- bis viermal vergrößert, an jeder Stelle, wo ein Ding den Boden oder ein Rahmen das Bild berührt. Dort sitzen die meisten Fehler. Werkzeug: `node tools/crop.mjs` oder Pillow.

Zwei weitere Sonden, wenn das Gefühl etwas ahnt, aber noch nicht zeigen kann:
- **Kantenprobe**, für schnurgerade Nähte, die nicht ins Bild gehören (Kästen, Platten, Rauten): `ImageOps.autocontrast(ImageOps.grayscale(im).filter(ImageFilter.FIND_EDGES), cutoff=2)`. In einer gemalten Welt sind lange gerade Kanten fast immer ein Fehler.
- **Farbprobe**, für Unstimmigkeit in den Farben (siehe *Farbklang* unten):

```python
# farbprobe.py  BILD  [x0 y0 x1 y1]  -- die Farben, nach Fläche geordnet
import sys, colorsys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
if len(sys.argv) == 6: im = im.crop(tuple(map(int, sys.argv[2:6])))
q = im.quantize(colors=12, method=Image.MEDIANCUT); pal = q.getpalette(); n = im.width * im.height
for count, i in sorted(q.getcolors(), reverse=True):
    r, g, b = pal[3*i:3*i+3]; h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    print(f"#{r:02x}{g:02x}{b:02x}  Fläche {100*count/n:5.1f} %  Ton {h*360:3.0f}°  Sättigung {s:.2f}  Helligkeit {v:.2f}")
```

### Schritt 2 – Fühlen (oblectatio)

Bevor irgendetwas erklärt wird:
1. **Erster Eindruck in einem Satz**, in Gefühlswörtern: ruhig, festlich, gedrängt, laut, kalt, billig, würdig, matt …
2. **Der Weg des Blicks:** Wohin geht das Auge zuerst, dann, dann? Ist das die Reihenfolge, die das Spiel will?
3. **Wo es hängen bleibt:** jede Stelle, an der das Auge stockt, zurückzuckt oder nicht weiß, wohin. Jede wird mit Ort beschrieben: „oben rechts“, „das dritte Symbol der linken Leiste“, „Ranke über dem Datum“.
4. **Wo es ruhen möchte und nicht kann.**

Ehrlich bleiben: Wenn nichts stört, wird das gesagt. Keine Befunde erfinden, damit die Liste voll wirkt.

### Schritt 3 – Urteilen (diiudicatio)

Für jede Störstelle der Reihe nach:
- **das Gefühl:** wie es sich anfühlt;
- **der Ort:** wo genau;
- **die Ursache:** was im Bild es auslöst;
- **der Prüfstein:** welcher der zwölf Prüfsteine verletzt ist;
- **die Art:** Ästhetik oder Fehler.

Dabei helfen *Gewicht und Raum*, *Farbklang*, das Wörterbuch der Störgefühle und der Fehlerblick, bei Mechaniken die *Gesetze der lebendigen Welt*, die *Spielproben* und das *Wörterbuch der Spielgefühle*, bei Zeichen und HUD die *Proben für Zeichen, HUD und Perspektive*, und für jedes Werk die *Proben aus der Überlieferung*.

### Schritt 4 – Heilen

- Die **kleinste** Änderung, die das Gefühl auflöst.
- Vorhandene Formen wiederverwenden; keine neue Generierung, wo Vorhandenes reicht.
- Die Regeln aus dem Vorrang einhalten.
- Widerspricht die Heilung einer Entscheidung des Autors, wird sie benannt und er wird gefragt. Nichts wird still geändert.

### Schritt 5 – Wieder sehen, bis das Auge ruht

Neu rendern und die Schritte 1–3 wiederholen, mit frischem Blick (Spiegel und Grau helfen dabei).

Das Auge **ruht**, wenn:
- der Blick zuerst auf die Hauptsache fällt,
- er ruhig weiterwandert,
- nichts ihn festhält, das nicht gemeint ist.

Bei einer Mechanik ruht die Seele, wenn das Spiel **fließt**: Jede Entscheidung zählt, jede Folge hat einen Grund, und nichts reißt aus der Welt.

Höchstens drei Runden. Ruht es dann noch nicht, geht der Rest an den Autor, mit Bildern.

## Gewicht und Raum: die Gesetze der Welt

Die Seele kennt die Welt, bevor sie ein Bild sieht. Sie weiß, dass Dinge schwer sind, dass eine Sonne scheint und dass vorn vor hinten liegt. Darum merkt sie sofort, wenn ein Bild dagegen verstößt, auch wenn jedes Ding für sich schön gezeichnet ist.

Die Weisheit sagt, Gott habe alles nach **Maß, Zahl und Gewicht** geordnet (Weish 11,20). Augustinus: Jeder Körper strebt durch sein Gewicht an seinen Ort (*Confessiones* XIII,9). Ein Ding ohne Gewicht hat keinen Ort, und das Auge spürt es.

Bei jeder Szene mit Dingen auf einem Grund (Dorf, Karte, Schlacht, Provinzansicht) jedes Ding einzeln prüfen:

1. **Schwerkraft: steht es?** Der Fuß, die Schwelle oder die Wurzel berührt den Grund.
   - Ein Schatten hängt **ohne Lücke** am Fuß.
   - Unter dem Haus ist eine dunkle Fuge (Kontaktschatten) von ein bis zwei Bildpixeln.
   - Ein Schatten mit Abstand zum Ding lässt es schweben.
2. **Verwurzelung: gehört es zum Boden?** Der Boden antwortet auf das Ding: Erde rund um die Schwelle, ein Pfad zur Tür, Gras, das an der Wand hochwächst, eine unregelmäßige Kante.
   - Ein Ding mit eigener, mitgebrachter Bodenplatte wirkt aufgeklebt, wenn deren Ton oder Körnung vom Boden abweicht oder wenn ihr Rand gerade ist.
3. **Kein Kasten:** Kein Ding verrät das Rechteck oder die Raute, in die es gesetzt wurde.
   - Platzierungsraster, Grundrissrauten und Auswahlrahmen liegen **unter** dem Ding, nicht darüber, und sind nur beim Bauen sichtbar.
   - Der Hintergrund eines Sprites muss vollständig freigestellt sein. Ein Rest bildet einen Halo oder eine Naht.
4. **Eine Sonne:** Alle Schatten fallen in dieselbe Richtung und sind gleich lang und gleich dunkel. Das Licht kommt von links oben (Stilfibel 8.0). Wirft das eine Ding einen Schatten und das andere keinen, ist es nicht dieselbe Welt.
5. **Ein Blickwinkel:** Alle Dinge sind aus demselben Winkel gesehen, mit derselben Dachneigung und derselben Draufsicht. Ein Ding, das von oben gezeigt wird, neben einem, das von der Seite gezeigt wird, sieht wie eine Collage aus (ausführlich: *Perspektive: eine Welt, ein Blick*).
6. **Ein Maßstab:** Der Mensch ist das Maß. Eine Tür ist etwas höher als ein Mann, ein Fenster etwa so hoch wie sein Oberkörper.
   - Eine Bockwindmühle überragt die Häuser deutlich, eine Kirche das Dorf.
   - Die Pixelgröße bleibt überall gleich (Stilfibel 8.4).
7. **Vorn und hinten:** Was weiter unten steht (Fußpunkt), wird später gezeichnet und liegt vorn.
   - Sortiert wird nach dem **Fußpunkt**, nicht nach der Oberkante des Bildes.
   - Steht ein Mensch hinter einem Haus, verdeckt ihn das Dach, statt dass er darauf zu stehen scheint.
   - Dinge, die sich überschneiden, brauchen Abstand, oder die Überschneidung muss stimmen.
8. **Ein Material, eine Machart:** Rauch, Wasser und Funken sind Pixel wie alles andere, nicht weich verwischt. Kein Glitzerstaub ohne Grund.
9. **Figur und Grund:** Was wichtig ist, löst sich von dem, was dahinter liegt. Eine Figur in derselben Farbe oder demselben Muster wie ihr Grund verschmilzt mit ihm.
10. **Nähe und Ähnlichkeit:** Was zusammengehört, steht beieinander und sieht verwandt aus; was eine andere Rolle hat, sieht anders aus.

## Farbklang

Farben sind unstimmig, wenn sie nicht aus derselben Welt kommen oder wenn ihre Lautstärke nicht ihrem Rang entspricht. Mit der Farbprobe (Schritt 1) prüfen:

1. **Helligkeit nach Rang:** Die größte helle Fläche zieht das Auge zuerst an. Ist sie die Oberfläche statt der Welt, gewinnt die Verwaltung gegen das Spiel.
   - Faustregel: Eine Tafel über der Welt ist nicht deutlich heller als die hellsten Stellen der Welt. Sie nimmt nicht mehr als etwa ein Viertel des Bildes ein.
2. **Sättigung nach Rang:** Linien, Rahmen und Schmuck sind nicht gesättigter als die Welt und ihre Bedeutungsfarben.
   - Die Stilfibel gibt Landfarben höchstens S 0,55. Ein Rahmen mit S 0,8 schreit.
3. **Eine Temperatur:** Eine warme Welt (Erde, Stroh, Holz, Pergament) verträgt nur gebrochene, warme Gegenfarben: Lapis statt Bildschirmblau, Zinnober statt Signalrot.
   - Eine einzelne kalte, reine Farbe ist ein Fremdkörper.
   - Ein einzelnes metallisches Grau zwischen warmen Symbolen ist ein Fremdkörper.
4. **Eine Farbfamilie je Rolle:** Alle Rahmen einer Art haben dieselben Linien in derselben Reihenfolge (Stilfibel 8.6). Zwei Tafeln mit verschiedenen Rahmen lassen die Oberfläche zerfallen.
5. **Saubere Pixel:** Linien haben keine Zwischentöne an der Kante. Mischfarben zwischen Linie und Grund heißen, dass nicht ganzzahlig gezeichnet wurde. Das wird matt und billig; es ist ein Fehler.
6. **Schwarz sparsam:** Der Umriss `#1f1b16` gehört den Dingen. Große Flächen in Umrissfarbe, etwa ein leerer Fortschrittsbalken, sind Löcher im Bild. Sie brauchen einen dunklen Ton der Tafel selbst.
7. **Herkunft prüfen:** Jede Farbe der Oberfläche steht in der Palette (`tools/palette.json`, `PaperPalette.kt`) und hat dort eine Rolle. Eine Farbe ohne Rolle wird gestrichen oder einer Rolle zugeordnet.

## Wörterbuch der Störgefühle

Was eine empfindsame Seele spürt, was meist dahintersteckt und wie es oft heilt:

| Gefühl | Meist die Ursache | Prüfstein | Häufige Heilung |
|---|---|---|---|
| **laut, überladen** | zu viele Elemente gleich stark | Claritas, Ordo | eins führt, die anderen leiser oder kleiner |
| **ich weiß nicht, wohin ich schauen soll** | kein Blickziel; Hauptsache nicht am hellsten | Claritas, Ordo | Kontrast auf die Hauptsache, den Rest dämpfen |
| **das Auge bleibt an X hängen** | X ist heller, gesättigter, schärfer oder umrandeter als sein Rang | Ordo, Unitas | X an seinen Rang angleichen |
| **ein Fremdkörper** | anderer Stil: fehlender Umriss, andere Pixelgröße, Farbe außerhalb der Palette, andere Schrift | Unitas, Decor | an die Fibel angleichen |
| **eng, es drückt** | zu wenig Luft; ein Teil zu groß (Kopfleiste) | Eusynopton, Proportio | Luft nach der Abstandsreihe, das Große kleiner |
| **es kippt, hängt schief** | ungleiche Ränder, Gewicht nur auf einer Seite | Proportio | Ränder angleichen, Gewicht ausbalancieren |
| **unruhig, flimmert** | Rauschen, Verläufe, zu viele Farben, Muster im Grund | Claritas, Temperantia | Flächen mit zwei Tönen, weniger Farben |
| **matschig, unklar** | wenig Kontrast, weiche Kanten, halbe Pixel | Claritas | Kontrast, ganze Pixelvielfache |
| **kalt, leblos** | alles gleich, keine Geste, kein Licht | Unitas in varietate | Licht von links oben, eine Geste, eine Variation |
| **leer, langweilig** | Einheit ohne Vielfalt, keine Spannung | Antithesis | ein Gegensatz, ein Akzent |
| **verschwimmt, verschmilzt** | Figur und Grund in gleicher Farbe oder gleichem Muster | Claritas, Gestalt: Figur und Grund | Figur absetzen: Kontrast, Lücke, Umriss |
| **zerfällt, gehört nicht zusammen** | Teile ohne Bezug zueinander, keine Achsen | Unitas, Ordo | gemeinsame Kanten, ein Raster |
| **billig, Kitsch** | Glanz ohne Grund, Pracht ohne Sinn, Casino-Effekte | Veritas, Temperantia | Glanz nur für echte Leistung, Schmuck an den Rand |
| **es lügt** | Bild, Zahl, Text oder Klang widersprechen sich | Consonantia | die vier auf dieselbe Aussage bringen |
| **es zappelt** | Bewegung ohne Anlass | Ordo, Temperantia | Bewegung nur, wo etwas geschieht |
| **fremd in der Zeit** | Anachronismus: barocke Krone, modernes Wort | Decor | Historiker fragen, angleichen |
| **ich verstehe nicht, warum** | Ursache einer Änderung unsichtbar | Manifestatio | Grund auf langes Drücken zeigen |
| **es schwebt** | Schatten mit Lücke zum Fuß, kein Kontaktschatten, Fuß nicht auf dem Grund | Integritas, Gewicht | Schatten an den Fuß, dunkle Fuge unter dem Ding |
| **wie aufgeklebt** | mitgebrachte Bodenplatte mit anderem Ton oder geradem Rand; Boden antwortet nicht | Unitas, Gewicht | Platte freistellen, Erde und Gras um die Basis in den Boden malen |
| **ein Kasten um das Ding** | Raster, Grundrissraute oder Sprite-Rechteck liegt über dem Bild oder schimmert durch | Integritas, Fehler | Raster unter das Ding, nur beim Bauen; Hintergrund sauber freistellen |
| **eine Collage** | verschiedene Blickwinkel, Lichtrichtungen oder Maßstäbe nebeneinander | Unitas, Proportio | ein Winkel, eine Sonne, der Mensch als Maß |
| **steht auf dem Dach** | Sortierung nach Bildoberkante statt Fußpunkt | Ordo, Fehler | nach Fußpunkt sortieren |
| **die Farben beißen sich** | eine reine, kalte oder übersättigte Farbe in einer warmen, gebrochenen Welt | Consonantia, Decor | Farbe brechen, an die Palette und ihre Rolle binden |
| **die Tafel ist lauter als die Welt** | größte und hellste Fläche ist Oberfläche | Ordo, Claritas | Tafel dunkler, kleiner, ins Holz oder an den Rand |

## Zwei geeichte Beispiele (Dorfspiel, 30. Oktober 2026)

Der Autor hat diese beiden Bilder als falsch erkannt. So soll das Auge urteilen:

**Das Dorf.** Erster Eindruck: hübsche Teile, aber eine Collage; nichts steht wirklich.
- Der Busch **schwebt**: Sein Schatten liegt mit einer Lücke unter ihm.
- Die Häuser sind **aufgeklebt**: kein Kontaktschatten, keine Fuge, ihre Bodenplatte endet in geraden Nähten. Die Kantenprobe zeigt senkrechte und waagrechte Linien unter dem Fachwerkhaus.
- **Ein Kasten durch jedes Haus:** Die Platzierungsraute liegt über dem Bild statt darunter.
- Der Rauch ist weich verwischt, kein Pixel.
- Die Mühle ist kaum höher als die Hütte.
- Ein Bauer scheint auf dem Dach zu stehen, weil nach Oberkante sortiert wird.
- Glitzerstaub auf dem Gras.

**Die Tafeln.** Erster Eindruck: Formular über einem Gemälde; die Farben beißen sich.
- Die Farbprobe: Das Pergament `#eadcb6` (Helligkeit 0,92) nimmt rund 40 % des Bildes ein und ist heller als alles in der Welt (Gras um 0,35). **Die Tafel ist lauter als das Dorf.**
- Blau `#2d5aa6` (S 0,73) und Rot `#b3261e` (S 0,83) sind die gesättigtsten Farben im Bild; das Blau ist die einzige kalte. Das ist Bildschirmblau statt Lapis.
- Die Linien haben Zwischentöne an den Kanten (nicht ganzzahlig gezeichnet).
- Die obere Tafel hat nur die blaue Linie, die untere Blau und Rot.
- Der leere Balken ist eine Fläche in Umrissschwarz.
- Die Münze ist das einzige metallische Grau zwischen warmen Symbolen.

## Zeichen, Blick und Perspektive: die Ästhetik von Spiel und HUD

Ein Spielbildschirm ist kein Gemälde, sondern ein Gemälde, das spricht. Jedes Element sagt dem Spieler etwas: *Hier kannst du tippen. Das gehört dir. Das ist gefährlich. Das hat sich geändert.* Diese Zeichen (englisch *cues*) sind schön, wenn sie klar, einheitlich und ruhig sprechen, und hässlich, wenn sie schreien, lügen oder schweigen.

### Die Handschrift war das erste Interface

Die mittelalterlichen Schreiber hatten für ihre Leser ein vollständiges System von Zeichen, sechshundert Jahre vor dem ersten Bildschirm. Es passt zum Stil beider Spiele und zeigt, wie jedes HUD-Element eine feste Aufgabe hat:

| In der Handschrift | Was es tat | Im HUD |
|---|---|---|
| **Rubrik** (rote Überschrift) | zeigte, wo ein neuer Abschnitt beginnt | Seitentitel, sonst nichts (Stilfibel 8.2: Rubrikrot nur für Titel) |
| **Initialen nach Rang** (große Zierinitiale, kleine Lombarde) | ordneten das Buch: Buch, Kapitel, Absatz | eine Hierarchie der Größen: Seite, Abschnitt, Zeile; nie zwei gleich große Ebenen |
| **Paragraphzeichen ¶**, abwechselnd rot und blau | gliederten Listen, ohne den Text zu zerreißen | Listenpunkte und Trenner: klein, gleichmäßig, im Rhythmus |
| **Kolumnentitel** (oben auf jeder Seite) | sagten, wo man im Buch ist | die Kopfleiste: wer, wann, was |
| **Glosse am Rand** | erklärte ein Wort, ohne den Text zu stören | das lange Drücken: Erklärung nur auf Wunsch |
| **Manicula** (gezeichnete Zeigehand ☞) | wies auf die wichtige Stelle | der Tutorial-Pfeil: eine Hand, ein Ziel, nie zwei zugleich |
| **Drolerien am Rand** | Freude für den Aufmerksamen | kleine Funde am Rand, die nie stören |

### Was ein gutes Zeichen leistet

Jedes Element, mit dem der Spieler etwas tun kann, wird an diesen sechs Fragen gemessen:

1. **Zeigt es, dass man es benutzen kann?** (Donald Norman: *Signifier*.) Ein Knopf sieht aus wie ein Knopf: Rahmen, Licht von links oben, Schatten unten rechts. Was nicht tippbar ist, sieht nicht so aus.
2. **Zeigt es seinen Zustand?** Gewählt, gesperrt, beschäftigt, neu, erledigt. Jeder Zustand hat **ein** festes Zeichen im ganzen Spiel, etwa Goldrand für „gewählt“, Grau für „gesperrt“ und ein roter Punkt für „neu“.
3. **Antwortet es sofort?** Unter **0,1 Sekunden** fühlt sich eine Antwort unmittelbar an, ab etwa einer Sekunde reißt der Faden (Robert Miller 1968; Jakob Nielsen). Jeder Tipp bekommt sofort ein sichtbares Echo: ein Einsinken, ein Aufleuchten, einen Ton.
4. **Sagt es vorher, was es kostet?** Vor einer Entscheidung sieht der Spieler Preis und Folge, nicht erst danach. Eine Gefahr wird **angekündigt**, bevor sie zuschlägt (*telegraphing*): ein Heer sammelt sich sichtbar, bevor es marschiert.
5. **Ist es überall gleich?** Ein Symbol hat eine Bedeutung, und eine Bedeutung hat ein Symbol, auf jeder Seite. Gleiche Rolle, gleiches Aussehen (Gestalt: Ähnlichkeit).
6. **Spricht es doppelt?** Wichtiges wird nie nur durch Farbe gesagt, sondern zusätzlich durch Form, Zeichen oder Lage: Gewinn mit „+“ und Grün, Verlust mit „−“ und Rot. Etwa jeder zwölfte Mann sieht Rot und Grün schlecht.

### Die Aufmerksamkeit lenken

Das Auge bemerkt manche Merkmale, bevor es überhaupt sucht (Anne Treisman: präattentive Merkmale). In dieser Reihenfolge der Stärke:

1. **Bewegung:** das stärkste Signal. Darum bewegt sich nur, was jetzt Aufmerksamkeit verdient, und zwar **eins** zur Zeit.
2. **Farbe und Helligkeit:** ein heller oder gesättigter Fleck in einer ruhigen Fläche.
3. **Größe und Form:** das Große, das Andersgeformte.
4. **Lage:** oben links liest das Auge zuerst; die Mitte ist die Bühne, der Rand das Archiv.

Daraus folgen Regeln:
- **Ein Hauptsignal je Bildschirm.** Wenn drei Dinge blinken, blinkt keins.
- **Das Signal hat den Rang seines Anlasses.** Eine Kriegserklärung darf unterbrechen, ein neuer Preis im Markt nicht. Meldungen haben Stufen: still im Archiv, sichtbar am Rand, unterbrechend in der Mitte; Letzteres nur, wenn der Spieler entscheiden muss.
- **Der Kopf hält wenig auf einmal:** etwa vier Dinge (Nelson Cowan 2001). Mehr als vier gleichrangige Zahlen in einer Zeile werden nicht gelesen, sondern übersprungen.
- **Mehr Wahl kostet mehr Zeit** (Hick 1952): Ein Menü mit drei klaren Wegen ist schneller als eines mit zwölf.
- **Größer und näher ist schneller zu treffen** (Fitts 1954): Häufiges groß und in Daumennähe, Seltenes und Gefährliches kleiner und weiter weg.

### Die Daumenzone

Viele Menschen halten das Telefon in einer Hand und bedienen es mit dem Daumen (Steven Hoober 2013).
- **Hochformat (Sacrum Imperium):** Häufige Handlungen liegen in der unteren Hälfte, in der Reichweite des Daumens. Oben steht, was man nur ansieht: Kopfleiste und Werte.
- **Querformat (Dorfspiel):** Beide Daumen liegen an den unteren Ecken; dort gehören die häufigen Handlungen hin. Die Mitte bleibt frei für das Dorf.
- Gefährliches (Krieg erklären, Partie löschen, Kauf) liegt nie dort, wo der Daumen zufällig landet, und fragt einmal nach.

### Im Spiel oder über dem Spiel

Ein Zeichen kann an vier Orten wohnen (Fagerholt und Lorentzon, *Beyond the HUD*, 2009):

| Art | Was es ist | Beispiel im Mittelalter-Spiel |
|---|---|---|
| **in der Welt** (diegetisch) | Teil der Spielwelt, die Figuren könnten es sehen | Rauch über einer belagerten Stadt, ein Banner über dem Heer, Feuer bei Plünderung, eine Glocke |
| **an der Welt** (räumlich) | in der Welt platziert, aber nicht Teil von ihr | ein Ring um die gewählte Provinz, der Marschweg auf der Karte |
| **auf der Welt** (meta) | ein Effekt über dem ganzen Bild | der Rand färbt sich rot bei einem Überfall |
| **über der Welt** (nicht-diegetisch) | klassisches HUD | Kopfleiste, Tafeln, Knöpfe |

Regel: **So viel wie möglich in der Welt, so wenig wie nötig darüber.** Was die Welt selbst zeigen kann, braucht keine Tafel: Ein brennendes Dorf sagt mehr als „Plünderung: −40“. Eine Tafel kommt dazu, wenn eine Zahl wirklich gebraucht wird.

### Rückmeldung und Spielgefühl

Spielgefühl (*game feel*, Steve Swink 2008) entsteht aus der Antwort der Welt auf den Finger. „Saft“ (*juice*, Jonasson und Purho 2012) heißt: jede Handlung bekommt eine Antwort aus Bewegung, Licht und Klang.

- **Die Antwort hat das Maß ihres Anlasses.** Ein Tipp auf einen Knopf: ein kurzes Einsinken. Ein gebautes Haus: Staub, ein Ton, das Haus erscheint. Eine gewonnene Schlacht: mehr. Eine Krönung: das Meiste. Wer bei jedem Tipp ein Feuerwerk zündet, hat für die Krönung nichts mehr übrig (Prüfstein 6, Ordo).
- **Zeiten:** Antwort unter 0,1 s; Übergänge 150–300 ms; nichts, was den Spieler warten lässt, nur damit es hübsch aussieht.
- **Bewegung mit Gewicht:** Dinge beschleunigen und bremsen (*ease-out*), wie Körper mit Gewicht; nichts springt linear wie eine Maschine.
- **Saft ist kein Glitzer.** Saft antwortet auf eine Tat; Glitzer schmückt ohne Anlass (*Gorgias*: Schminke).
- **Bild und Klang sagen dasselbe** (Consonantia).

### Lesbarkeit auf dem Handy

- **Kontrast** (WCAG 2.1): Text mindestens **4,5 : 1** gegen seinen Grund, große Schrift und Zeichen, Rahmen und Balken mindestens **3 : 1**. Mit der Kontrastprobe messen.
- **Kleinste Schrift** 11 dp (Stilfibel 8.5).
- **Symbole lesbar bei 24 dp:** Das Symbol als schwarze Silhouette muss noch zu erkennen und von den anderen zu unterscheiden sein (Silhouettenprobe).
- **Farbe nie allein** (siehe oben): Mit der Farbenblindprobe prüfen.

### Perspektive: eine Welt, ein Blick

Ein Bild wirkt wie eine Collage, wenn seine Dinge aus verschiedenen Blickwinkeln gezeichnet sind, auch wenn jedes für sich schön ist. Das Auge spürt sofort, dass es nicht an *einem* Ort steht.

**Die Blickarten, die es gibt:**
- **Draufsicht:** senkrecht von oben, man sieht nur Dächer.
- **Schräge Draufsicht / Dreiviertel:** von schräg oben, man sieht Dach und eine Vorderseite.
- **Isometrisch / dimetrisch:** zwei Seiten und das Dach, Kanten im festen Winkel. In der Pixelkunst meist im Verhältnis 2:1 (zwei Pixel waagrecht, einer senkrecht, etwa 26,6°).
- **Seitenansicht:** von vorn, man sieht kein Dach von oben.

**Die Regeln:**
1. **Ein Spielbildschirm, eine Blickart.** Alle Dinge auf derselben Karte oder im selben Dorf sind in derselben Blickart gezeichnet, mit derselben Augenhöhe: Bei allen Häusern sieht man gleich viel Dach im Verhältnis zur Wand.
2. **Gleiche Dinge, gleiche Winkel.** Dachkanten, Mauerkanten und Grundlinien gleicher Bauten laufen im gleichen Winkel. Ein Haus mit flachem und eins mit steilem Dachwinkel nebeneinander sind zwei Blickwinkel, nicht zwei Dachformen, es sei denn, die Bauten unterscheiden sich wirklich.
3. **Senkrechtes bleibt senkrecht.** Mauern, Türme und Masten stehen lotrecht im Bild.
4. **Schatten folgen derselben Blickart und derselben Sonne** (Gewicht und Raum, Regel 4).
5. **Figuren und Bauten aus derselben Höhe.** Wird ein Haus von schräg oben gezeigt, sieht man auch Menschen von schräg oben: etwas Kopf und Schultern, die Füße auf dem Grund.
6. **Symbole und Oberfläche haben ihre eigene, einheitliche Sicht.** Die Symbole einer Leiste sind alle von vorn **oder** alle in Dreiviertelsicht gezeichnet, nicht gemischt. Eine flache Münze neben einem schräg gezeigten Holzstapel ist ein Bruch.
7. **Porträts** sind alle im selben Winkel und Ausschnitt (Brustbild, Dreiviertel) und in derselben Lichtrichtung.
8. **Die Ansichten des Spiels passen zueinander.** Karte, Provinzansicht und Dorf dürfen verschiedene Blickarten haben, aber jede hat ihre eigene und hält sie überall.

**Woran man Brüche erkennt:** ein Dach, das man fast nur von oben sieht, neben einem, das man fast nur von vorn sieht; Grundlinien, die in verschiedenen Winkeln in den Boden laufen; eine Figur, die „vor“ einer Wand zu schweben scheint; ein Symbol, das aus der Reihe kippt. Bilder aus einem Generator mischen die Blickwinkel besonders oft; jedes neue Bild wird darum gegen seine Nachbarn geprüft, bevor es ins Spiel kommt.

### Ästhetik als Erlebnis

Die Spielgestaltung nennt „Ästhetik“ auch das, was der Spieler *erlebt* (Hunicke, LeBlanc und Zubek, *MDA*, 2004): Sinnesfreude, Fantasie, Erzählung, Herausforderung, Gemeinschaft, Entdeckung, Ausdruck, Zeitvertreib. Jedes Spiel wählt wenige davon als Kern. Für Sacrum Imperium sind es Erzählung, Herausforderung und Entdeckung, für das Dorfspiel Ausdruck, Herausforderung und Gemeinschaft (den Autor fragen, ob das stimmt). **Jedes Zeichen und jede Rückmeldung dient diesem Kern.** Ein Effekt, der zu keinem davon gehört, ist ein Fremdkörper.

### Die Proben für Zeichen, HUD und Perspektive

Die Skripte gehören in den Scratchpad, nicht ins Repository.

- **Fünf-Sekunden-Probe:** Den Bildschirm fünf Sekunden ansehen (oder den Ästheten nur das kleine Bild ansehen lassen), dann wegsehen. Was weiß man? Wo bin ich, was ist wichtig, was soll ich tun? Fehlt eins davon, ist die Rangordnung falsch.
- **Tippprobe:** Auf dem Bildschirm alles markieren, was tippbar aussieht, und dann alles, was tippbar *ist*. Jede Abweichung ist ein Missklang.
- **Zustandsprobe:** Für jedes Element alle Zustände rendern (gewählt, gesperrt, neu, beschäftigt). Hat jeder Zustand ein eigenes, einheitliches Zeichen?
- **Antwortprobe:** Im Film (`--film`) nachsehen, ob jeder Tipp im nächsten Bild sichtbar antwortet.
- **Daumenprobe:** Liegen die häufigsten drei Handlungen in der Daumenzone?
- **Silhouettenprobe:** Alle Symbole einer Leiste schwarz füllen und bei 24 dp nebeneinander ansehen. Sind sie zu unterscheiden?
- **Kontrastprobe** und **Farbenblindprobe** (`lesbarkeit.py`, unten).
- **Perspektivprobe** (`perspektive.py`, unten): die schrägen Kanten gleicher Dinge messen und vergleichen. Liegen die Dachneigungen gleicher Häuser weit auseinander, sind die Blickwinkel gemischt. Ein Winkel *a* und *180° − a* sind dieselbe Neigung, gespiegelt. Das Ergebnis ist ein Hinweis; das Auge entscheidet.

```python
# lesbarkeit.py kontrast FARBE1 FARBE2      -- Kontrastverhältnis nach WCAG (Text 4,5:1, große Schrift und Zeichen 3:1)
# lesbarkeit.py farbenblind BILD AUSGABE    -- das Bild, wie es ein Rot-Grün-Schwacher sieht (Deuteranopie; Machado 2009)
import sys, numpy as np
from PIL import Image
def lin(c): c = np.asarray(c, float) / 255; return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def srgb(c): c = np.clip(c, 0, 1); return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055) * 255
if sys.argv[1] == "kontrast":
    L = [float(lin([int(h.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)]) @ [0.2126, 0.7152, 0.0722]) for h in sys.argv[2:4]]
    hi, lo = max(L), min(L); print(f"{(hi + 0.05) / (lo + 0.05):.2f} : 1")
else:
    M = np.array([[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]])
    a = lin(np.asarray(Image.open(sys.argv[2]).convert("RGB"))) @ M.T
    Image.fromarray(srgb(a).astype(np.uint8)).save(sys.argv[3])
```

```python
# perspektive.py  BILD  x0 y0 x1 y1 [...]  -- die schrägen Kanten eines Dings (Dachneigung, Grundlinien), je Ausschnitt
import sys, numpy as np
from PIL import Image, ImageFilter
img = Image.open(sys.argv[1]).convert("L").filter(ImageFilter.GaussianBlur(2))
im = np.asarray(img, dtype=float); b = list(map(int, sys.argv[2:]))
for i in range(0, len(b), 4):
    x0, y0, x1, y1 = b[i:i+4]; a = im[y0:y1, x0:x1]
    gy, gx = np.gradient(a); mag = np.hypot(gx, gy)
    ang = (np.degrees(np.arctan2(gy, gx)) + 90) % 180          # Kantenrichtung, 0° = waagrecht
    keep = (mag > np.percentile(mag, 85)) & (np.abs(ang - 90) > 12) & (ang > 12) & (ang < 168)
    hist, e = np.histogram(ang[keep], bins=34, range=(5, 175), weights=mag[keep])
    top = [int(t) for t in np.argsort(hist)[::-1][:3]]
    print(f"{x0},{y0}-{x1},{y1}: schräge Kanten bei " + ", ".join(f"{(e[t]+e[t+1])/2:.0f}°" for t in top))
```

### Wörterbuch der Zeichen-Gefühle

| Gefühl | Meist die Ursache | Prüfstein | Häufige Heilung |
|---|---|---|---|
| **eine Collage, schief, verdreht** | gemischte Blickwinkel, verschiedene Dachneigungen, ungleiche Augenhöhe | Unitas, Proportio | eine Blickart, gleiche Winkel, gleiche Augenhöhe |
| **ich weiß nicht, was ich tippen kann** | Tippbares sieht aus wie Schmuck oder umgekehrt | Manifestatio | Knöpfe sehen wie Knöpfe aus, Schmuck nicht |
| **hat es geklappt?** | keine sichtbare Antwort in 0,1 s | Integritas | Echo auf jeden Tipp |
| **das kam aus dem Nichts** | Gefahr ohne Ankündigung | Manifestatio, Gerechtigkeit | Gefahr vorher zeigen |
| **alles blinkt** | mehrere Hauptsignale, Bewegung ohne Rang | Ordo, Claritas | ein Signal, die anderen still |
| **ich überlese das immer** | Wichtiges klein, blass oder am falschen Ort | Ordo | nach Rang: Größe, Kontrast, Lage |
| **Zahlensalat** | mehr als vier gleichrangige Zahlen in einer Zeile | Eusynopton | weniger, gruppiert, nach Rang |
| **Formular statt Welt** | was die Welt zeigen könnte, steht auf einer Tafel | Decor, Consonantia | in die Welt verlegen: Rauch, Banner, Feuer |
| **zu viel Feuerwerk** | große Antwort auf kleine Tat | Ordo, Temperantia | Antwort nach dem Maß des Anlasses |
| **schwer zu treffen** | kleines Ziel, weit weg vom Daumen | Decor | groß, in der Daumenzone |
| **ich sehe den Unterschied nicht** | nur Farbe trägt die Bedeutung; zu wenig Kontrast | Claritas | doppelt sagen, Kontrast messen |

### Geeichte Beispiele für Zeichen und Perspektive (Dorfspiel, 30. Oktober 2026)

**Perspektive im Dorf.** Das Fachwerkhaus ist von schräg oben in Dreiviertelsicht gezeigt, der Schuppen fast von vorn, die Mühle von der Seite. Die Perspektivprobe misst die Dachkanten bei etwa 28° (Schuppen), 48° (Haus) und 58° (Hütte). Das sind drei Blickwinkel in einem Dorf; das Auge spürt die Collage, bevor es sie benennt.

**Zeichen auf den Tafeln.**
- Das „+“ oben rechts ist winzig und sieht nicht tippbar aus (Signifier).
- Der Balken sagt nicht, *wofür* er füllt.
- „5/5“ neben den Figuren erklärt sich nicht.
- Das Gold des Balkens hat gegen das Pergament nur **1,75 : 1** Kontrast (gefordert 3 : 1).
- In der Farbenblindprobe verschmelzen Gras und Erdweg im Dorf zu einem Oliv: Der Weg trägt seine Bedeutung nur über die Farbe.

**Zum Vergleich, gemessen an Sacrum Imperium:** Fließtext `#f2e4bc` auf Holz 7,65 : 1 (gut), Gewinn-Grün 5,92 : 1 (gut), Verlust-Rot `#f58066` 3,76 : 1. Das reicht für große Zahlen, nicht für kleine Schrift. Grün und Rot fallen für Rot-Grün-Schwache zusammen; das „+“ und das „−“ müssen deshalb immer mit dabei stehen.

## Der Fehlerblick: Bugs, die man sieht

Ein Fehler ist ein gebrochenes Versprechen der eigenen Ordnung des Werks. Darum fühlt er sich für das Auge falsch an, oft noch bevor man weiß, dass es ein Fehler ist.

Beim Schauen gezielt nach diesen Fehlern suchen:

- **Überlappung:** Text auf Text, Symbol auf Rand, Name unter der Oberfläche.
- **Abgeschnitten:** Wörter, Zeilen, Seiten, Bilder am Rand.
- **Kästchen statt Zeichen:** Gedankenstrich, Anführungszeichen, Auslassungspunkte (Text nicht durch `plainText`).
- **Verwaschene oder ungleiche Pixel:** nicht ganzzahlig skaliert, gefiltert statt nearest.
- **Fehlendes Bild:** leere Fläche, Platzhalter, ein Rahmen ohne Inhalt.
- **Falsche Ebene:** etwas liegt vor dem, was vorn sein müsste; ein Durchscheinendes ist deckend (`blendOn()` vergessen).
- **Nicht bündig:** Kanten, die fast, aber nicht genau fluchten; ein Pixel Versatz.
- **Doppelt:** dasselbe Element oder dieselbe Meldung zweimal.
- **Zu kleines Tippziel:** unter 48 dp.
- **Widerspruch zur Lage:** Zahl und Bild passen nicht zusammen; ein christliches Ereignis in einem muslimischen Reich; ein Toter, der handelt; ein Knopf ohne Wirkung.
- **Flackern oder Sprung** zwischen zwei Bildern eines Films.
- **Sichtbares Gerüst:** Platzierungsraute, Auswahlrahmen oder Sprite-Rechteck über dem Bild; Halo oder Naht aus nicht freigestelltem Hintergrund.
- **Falsche Tiefe:** Sortierung nach Oberkante statt Fußpunkt; ein Ding scheint vor oder auf etwas zu stehen, das vor ihm liegt.
- **Losgelöster Schatten:** Lücke zwischen Ding und Schatten; Schatten in einer anderen Richtung als die übrigen.
- **Weiche Kanten an Linien:** Zwischentöne zwischen Linie und Grund (nicht ganzzahlig gezeichnet).
- **Ungleiche Rahmen:** zwei Tafeln derselben Art mit verschiedenen Linien.

Was der Harness ohnehin meldet (`overlaps`, `cut lines`, Tippziele unter 48 dp, Namen unter der Oberfläche), wird mitgelesen. Das Auge sucht, was er nicht misst.

Ein gefundener Fehler wird nach `docs/BUGS.md` behandelt: zuerst nachstellen (Seed oder `--press`), dann nach Schwere einordnen, an der Ursache beheben und mit einer Zeile in `tools/qa/regressions.txt` festhalten.

## Die Seele im Spiel: Mechaniken, die sich falsch anfühlen

Ein Spieler mit feinem Gespür merkt nach wenigen Minuten, wenn eine Mechanik „komisch“, „künstlich“ oder „unfair“ ist. Er kann es selten erklären, aber er hat fast immer recht. Dieser Teil lässt Claude so spielen und urteilen.

### Warum sich eine Mechanik natürlich anfühlt

- **Die Kunst ahmt die Natur nach** (*ars imitatur naturam*: Aristoteles, *Physik* II,2; Thomas, *Summa* I q.117 a.1). Eine Mechanik fühlt sich natürlich an, wenn sie so wirkt wie das, was sie darstellt. Getreide wächst über einen Sommer, ein Heer marschiert so weit, wie Menschen gehen können, ein Verrat wird nicht vergessen.
- **„Wegen“, nicht „nach“** (Aristoteles, *Poetik* 9–10). Eine gute Handlung besteht aus Dingen, die *wegen* einander geschehen, nicht bloß *nacheinander*. Eine Mechanik, deren Folgen nur zufällig hintereinander kommen, fühlt sich willkürlich an. Folgen die Ereignisse aus den Entscheidungen des Spielers, fühlt sie sich wie Schicksal an.
- **Das Wahrscheinliche** (*Poetik* 25). Ein glaubhaftes Unmögliches ist besser als ein unglaubhaftes Mögliches. Die Welt muss nicht genau sein, aber glaubhaft. Was der Spieler nicht glaubt, zerreißt die Welt, auch wenn es „historisch belegt“ ist. Dann braucht es eine Erklärung im Spiel.
- **Gerechtigkeit des Tauschs** (Thomas, *Summa* II-II q.61 und q.77, der gerechte Preis). Aufwand und Lohn, Preis und Wert, Wagnis und Gewinn stehen im Gleichgewicht. Wo der Spieler mehr gibt, als er bekommt, oder etwas umsonst bekommt, fühlt er Betrug oder Leere.
- **Die rechte Mitte** (Aristoteles, *Nikomachische Ethik* II,6). Weder zu schwer noch zu leicht, weder zu schnell noch zu träge. Die Mitte ist kein Durchschnitt; sie wird für diesen Spieler und diese Sitzung gesucht. Die heutige Psychologie nennt das *Flow*: Herausforderung und Können halten sich die Waage (Csikszentmihalyi).
- **Wort und Tat stimmen überein** (Consonantia). Sagt die Geschichte „Friede“ und belohnt die Mechanik den Krieg, entsteht ein Bruch zwischen Erzählung und Spiel. Die Spielkritik nennt ihn *ludonarrative Dissonanz* (Hocking 2007).

### Zuerst spielen, nicht lesen

Eine Mechanik wird nie aus dem Code beurteilt, sondern aus dem Spielen. Im Code steht, was gemeint war; im Spiel zeigt sich, was geschieht.

Quellen für Sacrum Imperium:
- `--play N` (Monate, ein Spieler, der den Rat entscheiden lässt);
- `--tutorial-walk`, mit `--wander` und `--impatient`;
- der Headless-Lauf und der Skill `balance` für Jahrzehnte;
- der `spieler`-Agent als unbefangenes Auge (Schritt 0);
- `--monkey` und `--soak` für das, was ein Mensch nie absichtlich täte.

Für das Dorfspiel gelten seine eigenen Werkzeuge. Fehlen sie, gibt es zuerst ein Protokoll, das jede Entscheidung, jede Zahl, jedes Ereignis und jede Wartezeit mit Zeitstempel aufschreibt.

### Die vier Blicke auf eine Mechanik

Wie beim Bild gibt es vier Blicke, die die Gewöhnung durchbrechen:

| Blick | Bei einer Mechanik | Was er zeigt |
|---|---|---|
| **Klein** | Eine Sitzung von fünf Minuten in drei Sätzen nacherzählen. | Gab es eine Geschichte, eine Entscheidung, ein Ende? Oder nur Verwaltung? |
| **Blinzeln** | Nur die Kurven über lange Zeit ansehen: Kasse, Menschen, Land, Ereignisse je Monat. | Läuft etwas davon? Bleibt etwas tot? Gibt es Sprünge, Stillstand, Spiralen? |
| **Grau** | Bilder und Texte weglassen, nur die Regel betrachten. | Bleibt eine echte Entscheidung übrig, oder trägt nur die Verpackung? |
| **Spiegel** | Die andere Seite spielen: den Gegner, die KI, den Vasallen, den Überfallenen. | Fühlt es sich von dort fair und glaubhaft an? Täte ein Mensch an seiner Stelle dasselbe? |

### Die Gesetze der lebendigen Welt

So wie Dinge im Bild Gewicht haben, haben Vorgänge im Spiel Gesetze. Ein feines Gespür merkt jeden Bruch.

1. **Ursache und Wirkung im Maß.** Eine große Wirkung hat eine große Ursache. Ein Festmahl stürzt kein Reich, eine verlorene Schlacht vernichtet es nicht allein. Eine Wirkung entspricht ihrer Ursache.
2. **Trägheit.** Dinge brauchen Zeit und ändern sich nicht sprunghaft. Bevölkerung, Ruf, Treue und Wohlstand wachsen und schwinden allmählich. Ein Sprung von voll auf leer braucht einen sichtbaren Anlass (Pest, Plünderung, Verrat).
3. **Erhaltung.** Nichts entsteht aus dem Nichts, nichts verschwindet ins Nichts. Gold, Menschen, Getreide und Truppen kommen woher und gehen wohin. Ein Heer, das entlassen wird, wird wieder zu Bauern. Eine Abgabe, die bezahlt ist, wird nicht ein zweites Mal verlangt.
4. **Eine Zeit.** Alle Zeitmaße passen zusammen. Wenn ein Heer zwei Wochen von Paris nach Rouen braucht, kann ein Bote nicht in einem Tag nach Rom reiten und eine Kirche nicht in einem Monat stehen. Menschen altern, Mütter tragen neun Monate.
5. **Ein Maßstab.** Die Zahlen passen zur Welt. Ein Dorf mit zehn Familien stellt keine 500 Krieger. Eine Kasse, die Jahrhunderte unbegrenzt wächst, gehört zu keinem Fürsten von 1336.
6. **Menschen handeln wie Menschen.** Herrscher, KI und Vasallen haben Motive, Gedächtnis, Furcht und Grenzen. Niemand erklärt bankrott den Krieg ohne Grund. Kein Gefangener führt ein Heer. Ein Toter handelt nicht mehr.
7. **Folgen bleiben.** Die Welt erinnert sich. Ein Bündnisbruch, eine Schonung, ein gebrochener Eid haben Folgen, die man später wieder trifft. Aber auch hier gilt: Was sich nie erholt, ist ebenso falsch wie das, was sofort vergessen ist.
8. **Wunden heilen, Krisen enden.** Nach einem Rückschlag gibt es einen Weg zurück, und er braucht Zeit. Keine Todesspirale ohne Ausweg, aber auch kein Gummiband, das den Führenden ohne Grund bremst.
9. **Jede Regel gilt für alle.** Der Spieler und die KI handeln über dieselben Wege (`CLAUDE.md` §3). Was die KI darf, darf der Spieler, und umgekehrt. Eine Bevorzugung, die man merkt, ist Betrug.
10. **Können, freie Wahl, Verbundenheit.** Wird der Spieler besser, und sieht er es? Zählen seine Entscheidungen, und gibt es mehr als einen guten Weg? Gehört er zu etwas, einer Dynastie, einem Dorf, einer Geschichte? Eine Regel, die eines davon aushungert, fühlt sich unfair, egal oder leer an.
11. **Geschichte als Grenze.** Nichts geschieht, was um 1336 für diese Kultur unmöglich oder unerhört war, es sei denn, das Spiel erzählt, warum. Ein christliches Ereignis trifft kein muslimisches Reich. Der Historiker prüft.

### Die Spielproben

Die Seele fühlt beim Spielen; die Proben machen sichtbar, was sie fühlt. Je Mechanik die passenden auswählen:

- **Erzählprobe:** Den Verlauf nacherzählen. Klingt er wie eine Chronik („weil der König …, rief der Graf …“) oder wie eine Tabelle („Wert A stieg, dann sank B“)? Eine Chronik ist gut, eine Tabelle ein Missklang.
- **Warum-Probe:** Bei jeder spürbaren Änderung fragen: Warum? Kann der Spieler die Antwort im Spiel finden, mit einem Tipp oder langem Drücken? Wenn nicht: Manifestatio.
- **Zehnte-Mal-Probe:** Dieselbe Handlung zehnmal tun. Wird sie beim zehnten Mal Arbeit, Warten oder Klickerei? Ein Ereignis, das sich wiederholt, ist eine Schleife.
- **Grenzprobe:** Die Extreme spielen: Null, das Maximum, sehr reich, sehr arm, ohne Erben, 100 Jahre ohne Krieg, alles verloren. Wo die Welt an den Rändern zerbricht, liegen die meisten Fehler.
- **Gierprobe:** Gibt es eine Wahl, die fast immer die beste ist? Dann ist die Entscheidung keine. Eine dominante Strategie macht die anderen Wege tot (Sid Meier: Ein Spiel ist eine Folge interessanter Entscheidungen).
- **Verlustprobe:** Verlieren. Weiß der Spieler, warum? Hätte er es kommen sehen können? Fühlt es sich wie seine Schuld an oder wie Würfelglück? Kann er wieder aufstehen?
- **Tippzählung:** Wie viele Tipps braucht eine Handlung, die oft vorkommt? Häufiges muss kurz sein, Seltenes darf lang sein.
- **Taktprobe:** Die Zeitachse einer langen Partie ansehen. Wie viele Entscheidungen und Ereignisse gibt es je Spielminute? Wo sind Lärm (drei auf einmal) und Stille (Minuten ohne etwas)? Die Pausen zwischen echten Entscheidungen sollen kurz sein.
- **Spiegelprobe:** Dasselbe von der anderen Seite spielen (der überfallene Nachbar, der Vasall, die KI). Ist es dort noch fair und glaubhaft?
- **1336-Probe:** Den Historiker fragen: Hätte ein Mensch von 1336 das so getan, erlebt oder hingenommen?
- **Geldprobe** (bei Käufen, Werbung, Wartezeit): Wird Frust erzeugt, um ihn zu verkaufen? Dann ist es eine Falle, keine Bequemlichkeit (Prüfstein 12; Skills `sacrum-imperium-spielerbindung`, `aufbauspiel-monetarisierung`).

### Wörterbuch der Spielgefühle

| Gefühl beim Spielen | Meist die Ursache | Gesetz / Prüfstein | Häufige Heilung |
|---|---|---|---|
| **unnatürlich, künstlich** | Wirkung ohne Maß oder ohne Zeit; Sprünge | Ursache und Wirkung, Trägheit | Wirkung an die Ursache binden, Übergänge über Zeit |
| **willkürlich** | Folgen nur *nach*, nicht *wegen*; Zufall entscheidet Großes | Poetik 9–10, Manifestatio | Folgen aus Entscheidungen ableiten; Zufall nur im Kleinen, sichtbar |
| **unfair** | KI hat andere Regeln; Strafe ohne Warnung; das Gefühl von Können wird verletzt | Jede Regel für alle, Verlustprobe | gleiche Wege; Warnung vor dem Schlag |
| **egal, bedeutungslos** | Entscheidung ohne spürbare Folge; dominante Wahl; freie Wahl verletzt | Integritas, Gierprobe | Folgen sichtbar machen; Wahl mit echtem Preis |
| **Arbeit, Grind** | dieselbe Handlung zu oft, ohne neue Entscheidung | Zehnte-Mal-Probe | bündeln, automatisieren, oder seltener mit mehr Gewicht |
| **Klickerei** | viele Tipps für Häufiges | Tippzählung | kürzere Wege, ein Tipp für alle |
| **Wartezimmer** | Zeit ohne Entscheidung | Taktprobe | Warten füllen oder kürzen; nie künstlich verlängern |
| **Lärm, Überforderung** | zu viel gleichzeitig | Antithesis, Taktprobe | über Tage verteilen (`CADENCE`), Wichtiges zuerst |
| **Tabelle statt Welt** | Zahlen ohne Gesicht, kein Erzählen | Erzählprobe, Consonantia | Zahl an Person, Ort oder Ereignis binden |
| **es lügt** | Oberfläche sagt X, Simulation tut Y | Consonantia | angleichen; der Text folgt der Regel |
| **zieht davon / Schlaraffenland** | positive Rückkopplung ohne Bremse; Kasse wächst ohne Ende | Erhaltung, Maßstab | Kosten mit Größe, Ausgabezwang, Zerfall |
| **Gummiband** | Führender wird ohne erzählten Grund gebremst | Folgen bleiben | Bremsen aus der Welt (Neid, Koalition, Verwaltung), erzählt |
| **Sackgasse, Todesspirale** | keine Erholung nach Verlust | Wunden heilen | Weg zurück, mit Zeit und Preis |
| **Puppentheater** | KI handelt ohne Motiv oder gegen sich selbst | Menschen handeln wie Menschen | Motive, Gedächtnis, Furcht; Spiegelprobe |
| **Schleife, Déjà-vu** | dasselbe Ereignis immer wieder | Zehnte-Mal-Probe | Sperrzeit, Ketten mit Ende, Varianten |
| **Zeitbruch** | Zeitmaße passen nicht zueinander | Eine Zeit | alle Zeiten an einem Maß ausrichten |
| **Geschichtsbruch** | Unmögliches für Ort, Zeit oder Kultur | Geschichte als Grenze | Bedingung prüfen, Historiker |
| **gefangen** | Lektion oder Fenster lässt nicht los | Integritas, Fehler | immer ein Weg zurück |
| **gedrängt, abgezockt** | Frust als Verkaufsgrund | Veritas pulchri, Geldprobe | Kauf nur als Bequemlichkeit, nie als Ausweg aus gemachtem Frust |

### Geeichte Beispiele aus Sacrum Imperium

Diese Fehler wurden im Spiel wirklich gefunden. So soll sich das Gespür anfühlen:

| Was geschah | Was sich falsch anfühlte | Gesetz |
|---|---|---|
| Ohne Erben wurde ein erfundener Höfling, oft ein Mönch, König – und starb nie. | „Puppentheater“, „unnatürlich“ | Menschen handeln wie Menschen; Eine Zeit |
| Der Schwarze Tod brach in allen Hauptstädten zugleich aus. | „künstlich“ | Trägheit, Geschichte als Grenze |
| Ein Friede in einem Krieg entließ die Heere aller Kriege. | „es lügt“ | Erhaltung, Ursache und Wirkung |
| Ein gefangener König führte Heere. | „Puppentheater“ | Menschen handeln wie Menschen |
| Die Müdigkeit der Aufgebote erholte sich nie. | „Sackgasse“ | Wunden heilen |
| Die Eingliederung wurde doppelt bezahlt. | „unfair“ | Erhaltung, Gerechtigkeit des Tauschs |
| Christliche Ereignisse trafen muslimische Reiche. | „Geschichtsbruch“ | Geschichte als Grenze |
| Eine Mutter gebar zweimal in elf Monaten (B149). | „Zeitbruch“ | Eine Zeit |
| Die KI-Krone hortete bis 1816 fast 450.000 in der Kasse. | „Schlaraffenland“ | Maßstab, Erhaltung |
| Die Chronik nannte den Krieg von 1337 viermal (B145). | „Schleife“ | Zehnte-Mal-Probe |

## Wenn es weder Bild noch Mechanik ist

Die Seele schaut auch hier, nur mit anderen Sinnen:

- **Text:** innerlich laut lesen. Wo holpert es? Wo ist ein Wort zu modern, zu lang, doppelt? Klingt es wie eine Chronik von 1336 oder wie eine App?
- **Klang:** passt er zum Augenblick? Ist er lauter als sein Anlass? Ermüdet er beim zehnten Mal?
- **Ereignis oder Ereigniskette:** Hat sie Anfang, Mitte und Ende? Geschieht jedes Glied *wegen* des vorigen? Kommt die Krise zur rechten Zeit, und folgt ihr Ruhe?
- **Kaufangebot:** Fühlt es sich an wie ein ehrlicher Händler, der einen respektiert, oder wie einer, der drängt?

## Vom Richtigen zum Schönen: alles besser machen

Wenn nichts mehr stört, ist ein Werk richtig, aber noch nicht unbedingt schön. Der Skill hört nicht beim Heilen auf, sondern fragt danach, was das Werk **schöner** machen würde. Schönheit hat Stufen; das Ziel ist die Vollendung (*perfectio*: Thomas, *Summa* I q.73 a.1).

Nach der letzten Runde, wenn das Auge ruht, die sechs Fragen der Steigerung stellen:

1. **Glanz:** Welche **eine** Stelle sollte leuchten und tut es noch nicht (erst wenn die Gestalt steht)? Ein Augenblick des Triumphs, eine Krönung, die erste Ernte.
2. **Leben:** Wo fehlt kleines Leben mit Grund? Rauch aus einem Schornstein, Vögel über dem Feld, eine Figur, die bei der Arbeit ist. Das Leben folgt den Gesetzen; Bewegung gibt es nur, wo etwas geschieht.
3. **Bedeutung:** Wo könnte eine Zahl eine Geschichte werden? Statt „+5 Gold“ der Name des Markts, statt „−200 Mann“ die Schlacht.
4. **Freude im Detail:** Wo darf ein kleiner Fund belohnen, der nur dem Aufmerksamen auffällt, wie die Drolerien am Rand einer Handschrift? Er bleibt am Rand und stört nie.
5. **Ganzheit:** Was fehlt, damit dieser Teil mit dem Rest des Spiels eins wird? Ein gemeinsames Motiv, ein Wiederklang aus einem anderen Bildschirm, ein Ton, der wiederkommt.
6. **Tiefe:** Was zeigt dieser Teil nach zehn Stunden, das er in der ersten nicht zeigt? Die Leiter der Schönheit führt vom Bild zur Regel zur erlebten Geschichte.

Für die Steigerung gilt:
- Höchstens drei Vorschläge, nach Wirkung geordnet und je mit Aufwand.
- Jeder Vorschlag besteht die zwölf Prüfsteine und die Gesetze; Steigerung ist nie Überladung.
- Vorhandenes geht vor Neuem. Generierungen nur mit der Freigabe des Autors.
- Ein Paket nach dem anderen (`CLAUDE.md`).

## Wann der Skill läuft

- **Nach jedem Paket**, das ändert, was ein Spieler sieht, hört oder tut: der Ästhet prüft, was das Paket berührt, neben dem `spieler`-Agenten.
- **Vor jeder Abnahme** durch den Autor: die Schau des Ästheten, mit unbefangenem Auge.
- **Als Gesamtschau**, wenn der Autor darum bittet: Der Ästhet prüft jeden Bildschirm, jede Hauptmechanik und eine lange Partie. Daraus wird eine Liste aller Missklänge über das ganze Spiel, nach Gewicht geordnet, mit Paketen für Claude Code, eins nach dem anderen.
- **Bei jedem Bild, jeder Regel oder jedem Text von außen**, etwa von PixelLab oder aus dem anderen Chat, bevor es ins Spiel kommt.
- **Wenn der Autor ein Bildschirmfoto schickt** und sagt, etwas fühle sich falsch an: der Ästhet zuerst, dann die Werkstatt.

## Die zwölf Prüfsteine

Sie sind der Grund hinter dem Gefühl. Im Urteil (Schritt 3) wird jede Störstelle einem Prüfstein zugeordnet. Jeder Prüfstein nennt seine Herkunft, die Frage, was er im Spiel bedeutet, und den typischen Missklang.

### 1. Integritas – Ganzheit
*Thomas, Summa I q.39 a.8; Aristoteles, Poetik 8*

- **Frage:** Fehlt etwas, das das Ganze verlangt? Und gibt es etwas, dessen Fehlen niemand bemerken würde?
- **Im Spiel:** Jede Mechanik hat Ursache, Entscheidung, Folge und Rückmeldung.
  - Eine Mechanik ohne Rückmeldung ist verstümmelt.
  - Eine Mechanik ohne Entscheidung ist Zierrat.
  - Das Grundspiel ist ohne DLC ganz.
- **Missklang:** halbfertige Systeme sind sichtbar; Knöpfe tun nichts Spürbares; Werte beeinflussen nichts.
- **Probe (Teilprobe):** Denk dir das Element weg. Merkt der Spieler es nicht, wird es gestrichen oder bekommt Folgen.

### 2. Proportio – Verhältnis
*Pythagoras; Platon, Philebos 64e; Weisheit 11,20: „nach Maß, Zahl und Gewicht“*

- **Frage:** Stehen Größen, Zahlen und Zeiten in einfachen, wiederkehrenden Verhältnissen?
- **Im Spiel:**
  - Maße kommen aus einer Reihe mit einfachen Verhältnissen (1:2, 2:3, 3:4). Die Symbole 24/32/48 bilden schon Quarte, Quinte und Oktave.
  - Für Abstände wird die Reihe 8/12/16/24/32/48 dp vorgeschlagen; mit dem Autor abstimmen.
  - Zahlen, die der Spieler vergleicht, haben gleiche Größenordnungen.
  - Kosten und Nutzen folgen über die Stufen festen Verhältnissen.
- **Missklang:** willkürliche Abstände (13, 17, 22 dp); eine Ressource in Tausendern neben einer in Zehnteln; Stufe 3 kostet ohne Grund das Siebenfache von Stufe 2.
- **Achtung:** Der Goldene Schnitt ist kein Gesetz und empirisch schwach belegt. Nie als Begründung verwenden.

### 3. Consonantia – Zusammenklang
*Thomas; Boethius: Harmonie von Welt, Mensch und Musik*

- **Frage:** Sagen Bild, Text, Zahl, Klang und Mechanik dasselbe?
- **Im Spiel:** Bei einer Hungersnot sind Miniatur, Ton, Zahlen und Klang ernst. Bei einem Fest sind alle vier hell.
- **Missklang:** eine fröhliche Fanfare bei der Pest; Belohnungsglanz für eine grausame Tat; ein mächtiger Titel mit winziger Wirkung.

### 4. Decor – Angemessenheit
*Augustinus, De pulchro et apto (Confessiones IV,13–15): das Schöne und das Passende; Thomas, Summa I q.91 a.3: eine Säge aus Glas taugt nicht, so schön Glas ist*

- **Frage:** Passt die Form zu Zweck, Ort, Zeit und Gerät?
- **Im Spiel:**
  - Zeit: 1336, keine barocke Krone, kein Wort der Neuzeit, die Sprache der Zeit in Namen und Texten.
  - Gerät: Daumen, kurze Sitzungen, die feste Ausrichtung des jeweiligen Spiels.
  - Ein Glanzeffekt wie im Casino kann gut gemacht sein und ist trotzdem falsch.
- **Missklang:** Anachronismen; Desktop-Dichte auf dem Handy; Mobile-Kitsch in einer Chronik.

### 5. Claritas – Klarheit, Leuchten
*Plotin, Enneade I,6; Pseudo-Dionysius; Thomas, Summa I q.39 a.8 (claritas); Psychologie: Figur und Grund*

- **Frage:** Leuchtet das Wesentliche, und tritt der Rest zurück?
- **Im Spiel:** eine Hauptsache je Bildschirm; Gold nur als Akzent; Grün und Rot nur, wo sie Bedeutung tragen; genug Kontrast zum Lesen.
- **Missklang:** drei Dinge gleich laut; Gold überall, sodass nichts mehr leuchtet; Grundgrafik heller als die Bedeutungsfarben.
- **Probe (Blinzelprobe):** Das Bildschirmfoto verkleinert oder unscharf ansehen. Erkennt man in einer Sekunde, worum es geht?

### 6. Ordo – Rangordnung
*Augustinus, De ordine; Dionysius, die Hierarchien*

- **Frage:** Hat jedes Element einen festen Rang, und zeigt die Gestaltung ihn?
- **Im Spiel:** Information in Stufen: Blick, Tipp, Seite, Erklärung (`HUD_DOSIERUNG.md`). Hauptmechaniken stehen vor Nebenmechaniken. Ein Kapitel beginnt mit einer Initiale, Untergeordnetes ist klein.
- **Missklang:** ein Nebenwert so groß wie der Hauptwert; tiefe Information an der Oberfläche; eine wichtige Entscheidung drei Menüs tief.

### 7. Manifestatio – das Sichtbarmachen
*Thomas: Schönheit gehört zum Erkennen (Summa I q.5 a.4 ad 1); Psychologie: Sichtbarkeit und mentale Modelle (Donald Norman, The Design of Everyday Things)*

- **Frage:** Kann der Spieler sehen, warum etwas geschieht?
- **Im Spiel:** Jede Veränderung einer Zahl hat eine lesbare Ursache, auf langes Drücken. Kriegsgründe, Erbfolge und Preise erklären sich selbst.
- **Missklang:** Werte ändern sich ohne erkennbaren Grund; versteckte Zufallswürfe entscheiden Großes.

### 8. Eusynopton – Überschaubarkeit
*Aristoteles, Poetik 7: Schönheit liegt in Größe und Ordnung*

- **Frage:** Ist das Ganze auf einen Blick oder in einer Sitzung fassbar, weder zu klein noch zu groß?
- **Im Spiel:** höchstens drei Elemente nebeneinander (STIL §8.8); eine Sitzung bringt etwa ein abgeschlossenes Ziel; eine Ereigniskette hat Anfang, Mitte und Ende.
- **Missklang:** Listen ohne Ende; Ziele, deren Ende man nicht sieht; eine Kleinmechanik, die keine Zeit hat zu wirken.

### 9. Unitas in varietate – Einheit in der Vielfalt
*Augustinus, Brief 18: die Form aller Schönheit ist die Einheit; Plotin*

- **Frage:** Ist das Neue eine Variation des gemeinsamen Themas oder ein Fremdkörper?
- **Im Spiel:**
  - Ein Leitsatz trägt das ganze Spiel. Er steht in `VISION.md` oder in den Dorfspiel-Unterlagen; fehlt er, den Autor fragen.
  - Neue Systeme benutzen die vorhandenen Formen: Pergamentkarte, Holzseite, Symbolsprache.
  - Kulturen variieren ein Grundmuster, statt einen neuen Stil zu bringen.
- **Missklang:** eine Mechanik aus einem fremden Genre; ein Menü in fremdem Stil. Aber auch zu viel Gleiches: Einheit ohne Vielfalt ist Langeweile, nicht Schönheit.

### 10. Antithesis und Numerus – Gegensatz und Rhythmus
*Augustinus, De civitate Dei XI,18; De musica*

- **Frage:** Wechseln Spannung und Ruhe in einem spürbaren Rhythmus?
- **Im Spiel:**
  - Krisen wie Pest, Krieg oder Thronstreit sind gewollte Dissonanzen, die sich auflösen.
  - Nach einer Krise kommt Zeit für den Aufbau.
  - Ereignisse sind gleichmäßig verteilt (vgl. `CADENCE`).
- **Missklang:** Dauerkrise (Lärm) oder ewiger Friede (Stille); drei Ereignisse am selben Tag und dann monatelang nichts.

### 11. Temperantia ornamenti – Maß im Schmuck
*Bernhard von Clairvaux, Apologia an Wilhelm (um 1125); Psychologie: kognitive Last*

- **Frage:** Dient der Schmuck dem Sinn, oder lenkt er ab?
- **Im Spiel:** Ornament am Rand, Ruhe in den Zahlen (`HUD_DOSIERUNG.md`). Ranken rahmen, sie erklären nichts. Keine Verzierung liegt über Information.
- **Missklang:** was Bernhard eine „ungestalte Gestaltetheit“ nennt: so viel Pracht, dass sie vom Wesentlichen ablenkt. Im Spiel heißt das: Schmuck, der Lesbarkeit kostet.
- **Achtung:** Den Schmuck nicht abschaffen; die illuminierte Ästhetik ist Vision. Pracht am rechten Ort, Stille am rechten Ort.

### 12. Veritas pulchri – wahre und falsche Schönheit
*Ratzinger, Botschaft an das Meeting in Rimini (2002); Johannes Paul II., Brief an die Künstler (1999); Dionysius: Schönheit, die über sich hinausführt*

- **Frage:** Führt die Schönheit zur Sache (Geschichte, Entscheidung, Erkenntnis) oder nur zum Reiz?
- **Im Spiel:** Freude entsteht durch Verstehen und Meistern. Glanz gibt es für echte Leistung. Kaufangebote sind ruhig, ehrlich und im Stil des Spiels.
- **Missklang:** Glitzer, der zum Kauf drängt; künstliche Dringlichkeit; Belohnungsregen ohne Leistung. Das ist verführerische Schönheit, die nicht wahr ist.

## Ausgabe

Kurz, auf Deutsch, auf dem Handy lesbar:

1. **Erster Eindruck:** ein Satz in Gefühlswörtern.
2. **Weg des Blicks:** zuerst → dann → dann.
3. **Was sich falsch anfühlt**, höchstens fünf Punkte, nach Gewicht geordnet: zuerst, was das Ganze bricht, dann Lesbarkeit, dann Feinmaß. Je Punkt: *Gefühl – Ort – Ursache – Prüfstein – kleinste Heilung*.
4. **Fehler**, getrennt aufgeführt, je mit Nachstellung nach `docs/BUGS.md`.
5. **Was schon schön ist:** höchstens drei Punkte, damit es nicht verloren geht.
6. **Nach der Heilung:** der neue erste Eindruck, und ob das Auge jetzt ruht.
7. **Steigerung:** höchstens drei Vorschläge, die das Werk schöner machen würden, je mit Wirkung und Aufwand.

Bei Mechaniken steht zu jedem Befund der **Beleg**: die Szene, der Seed, der `--press`-Weg oder die Kurve aus dem Protokoll. Ein Gefühl, das sich nicht belegen lässt, wird als Vermutung gekennzeichnet.

Für Claude Code geht ein Befund als fertiger Prompt für ein Paket hinaus.

## Grenzen

- Objektiv heißt begründbar, nicht unfehlbar. Auch eine empfindsame Seele irrt. Der Autor nimmt am Bildschirmfoto ab.
- Geschmack ist nicht Schönheit. „Ich mag Blau lieber“ ist kein Befund; „das Blau ist lauter als die Gefahr“ ist einer.
- Seit Hume (1757) und Kant (1790) gilt Schönheit vielen als subjektiv. Die Wahrnehmungspsychologie findet einen gemeinsamen Kern: Ordnung, Symmetrie und Klarheit gefallen verlässlich (Reber, Schwarz und Winkielman 2004). Gewöhnung und Kultur spielen aber mit. Darum zählt der unbefangene Blick.
- Der Goldene Schnitt ist kein Maß.
- Zitate stammen nur aus gemeinfreien Texten oder sind kurz und mit Quelle versehen.

## Quellen

- Pythagoreische Intervalllehre (überliefert bei Boethius, De institutione musica)
- Heraklit, Fragment B 54
- Platon, Hippias Maior 304e; Phaidros 250d; Symposion 210a–212a; Gorgias 464b–465c; Timaios 31c
- Cicero, Tusculanae disputationes IV 31 (stoische Bestimmung der Schönheit)
- Plotin, Enneade I 6,1–3 und 6,9
- Bibel: Gen 1,31; Weish 11,20; Weish 13,5; Jes 53,2
- Basilius von Caesarea, Hexaemeron III 10
- Augustinus, Confessiones X 27; Sermo 27,6
- Gregor von Nyssa, Das Leben des Mose (Epektasis)
- Albertus Magnus, De pulchro et bono (splendor formae)
- Nikolaos Kabasilas, Das Leben in Christus (14. Jh.)
- Hans Urs von Balthasar, Herrlichkeit. Eine theologische Ästhetik (1961–69)
- Jacques Maritain, Art et scolastique (1920)
- Benedikt XVI., Ansprache an die Künstler in der Sixtinischen Kapelle (21.11.2009)
- Platon, Philebos 64e, Timaios
- Aristoteles, Poetik 7–8; Metaphysik XIII 3
- Plotin, Enneade I,6
- Augustinus, De vera religione 30–32; Brief 18; De ordine; De musica VI; De civitate Dei XI,18
- Pseudo-Dionysius Areopagita, Von den göttlichen Namen; Himmlische Hierarchie
- Bernhard von Clairvaux, Apologia ad Guillelmum (um 1125)
- Robert Grosseteste, De luce
- Augustinus, Confessiones XIII,9 (das Gewicht, das jeden Körper an seinen Ort zieht)
- Bonaventura, Itinerarium mentis in Deum II,4–6
- Thomas von Aquin, Summa theologiae I q.5 a.4, I q.39 a.8, I q.91 a.3, I-II q.27 a.1 ad 3; In De divinis nominibus c. 4
- Aristoteles, Physik II,2; Poetik 9–10, 25; Nikomachische Ethik II,6
- Thomas von Aquin, Summa theologiae I q.73 a.1, I q.117 a.1, II-II q.61, II-II q.77
- Mihaly Csikszentmihalyi, Flow (1990)
- Sid Meier, „Interesting decisions“ (GDC 2012)
- Clint Hocking, Ludonarrative Dissonance in Bioshock (2007)
- Joseph Ratzinger, Botschaft an das Meeting in Rimini (24.8.2002)
- Johannes Paul II., Brief an die Künstler (4.4.1999)
- Augustinus, Confessiones IV,13–15 (De pulchro et apto)
- Max Wertheimer, Untersuchungen zur Lehre von der Gestalt II (1923)
- Daniel Berlyne, Aesthetics and Psychobiology (1971)
- John Sweller, Cognitive Load Theory (1988)
- Richard Ryan, Scott Rigby, Andrew Przybylski, The Motivational Pull of Video Games (2006)
- Donald Norman, The Design of Everyday Things (1988)
- Erik Fagerholt und Magnus Lorentzon, Beyond the HUD (Chalmers 2009)
- Steve Swink, Game Feel (2008)
- Martin Jonasson und Petri Purho, Juice it or lose it (GDC Europe 2012)
- Robin Hunicke, Marc LeBlanc, Robert Zubek, MDA: A Formal Approach to Game Design (2004)
- Anne Treisman, A Feature-Integration Theory of Attention (1980)
- Nelson Cowan, The magical number 4 in short-term memory (2001)
- W. E. Hick (1952); Paul Fitts (1954)
- Robert B. Miller, Response time in man-computer conversational transactions (1968)
- Steven Hoober, How Do Users Really Hold Mobile Devices? (UXmatters 2013)
- W3C, Web Content Accessibility Guidelines 2.1, 1.4.3 und 1.4.11
- Gustavo Machado, Manuel Oliveira, Leandro Fernandes, A Physiologically-based Model for Simulation of Color Vision Deficiency (2009)
- Erik Kwakkel, medievalbooks.nl, zur Manicula und zur Ordnung der Handschriftenseite
- Reber, Schwarz und Winkielman, Processing Fluency and Aesthetic Pleasure (2004)