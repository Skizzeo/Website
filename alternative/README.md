# Skizzeo Website · Alternative Designlinie (Startseiten-Entwürfe)

Stand 15.10.2026, abgeglichen mit Übergabepaket Fassung 7 vom 14.10.2026. Drei Konzepte für eine zweite, eigenständige Designlinie neben Prototyp 2.
Alle drei sind dunkel und nehmen das Farbthema der Programmoberfläche auf. Jede Startseite ist
echtes HTML und läuft offline per Doppelklick, ohne externe Abrufe.

| Datei | Idee |
|---|---|
| `konzept-a-nachtmodell.html` | Echtzeit-3D-Modell als Bühne: Haus mit Fenster- und Türöffnungen, Flachdach mit Gefälle und Regenfallrohren, Dachterrasse, Geländeplatte, Sonnenbahn mit Schatten. Die markierte Wand lässt sich mit der Maus ziehen, Mengen und Kosten laufen im Live-Fenster mit. Kapitel unten statt Scrollen. |
| `konzept-b-werkstatt.html` | Ruhige Tafel mit Rand, darauf ein Kachelraster (Bento): Botschaft mit Zielgruppen, Programmbild, Kosten live, Bemaßung nach DIN, Sonne und Schatten, Erweiterungen und Werkbank. Alles auf einem Bildschirm. |
| `konzept-c-planpapier.html` | Geteilter Bildschirm wie im Programm: links Planpapier mit schraffiertem Grundriss samt Fenstern, Türaufschlägen, Raumstempeln, Maßketten und Nordpfeil, rechts das dunkle Mengenfenster mit VOB-Umschalter und aufgeklapptem Rechenweg, verbunden über die markierte Wand. Seitenwechsel im Schriftfeld. |

Standbilder für die Abstimmung: `?still` an die Adresse hängen (keine Kamerabewegung, keine Zählanimation).

## Farben (aus den Bildschirmbildern und dem Werkbank-Prototyp abgenommen)

- Paneele `#1f252d`, tiefer Grund `#141920`, Rahmen `#38414c`
- Schrift altweiß `#e7e5de`, zweite Ordnung `#a0a5ac`
- Akzent Orange-Gelb `#f2b33d`, Gummiband violett `#8f63f0`
- 3D-Boden olivgrün `#3b4236`, Modellflächen `#e0dbca`, Planpapier `#f3f1ea`

## Quellen und Lizenzen

- Schriften (alle SIL Open Font License 1.1, über Fontsource): Inter Tight, Space Grotesk, Instrument Serif, JetBrains Mono
- three.js r169 (MIT-Lizenz), gebündelt in `assets/js/haus3d.js`; lesbarer Quelltext in `assets/js/haus3d.src.js` (neu bündeln mit esbuild als IIFE, globaler Name `Haus3D`)
- Programmbilder aus dem Übergabepaket (Bild 04 beschnitten, Bild 32 und 17 als Ausschnitte aus Fassung 7)
- Architekturfotos: keine. Fotodienste (Unsplash, Pexels, Wikimedia) waren aus der Arbeitsumgebung gesperrt. Das 3D-Haus in Konzept A und der Grundriss in Konzept C sind selbst erzeugt. Fensterelemente (Rahmen, Glas), geneigte Dächer und Bemaßung in Schnitten zeigen die Entwürfe bewusst nicht, weil das Programm sie laut Fassung 7 noch nicht hat.
- Alle Zahlen in den Live-Fenstern sind Beispielwerte mit unverbindlichen Referenzpreisen.
