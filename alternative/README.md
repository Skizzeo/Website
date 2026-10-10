# Skizzeo Website · Alternative Designlinie (Startseiten-Entwürfe)

Stand 10.10.2026. Drei Konzepte für eine zweite, eigenständige Designlinie neben Prototyp 2.
Alle drei sind dunkel und nehmen das Farbthema der Programmoberfläche auf. Jede Startseite ist
echtes HTML und läuft offline per Doppelklick, ohne externe Abrufe.

| Datei | Idee |
|---|---|
| `konzept-a-nachtmodell.html` | Echtzeit-3D-Modell als Bühne. Die markierte Wand lässt sich mit der Maus ziehen, Mengen und Kosten laufen im Live-Fenster mit. Kapitel unten statt Scrollen. |
| `konzept-b-werkstatt.html` | Ruhige Tafel mit Rand, darauf ein Kachelraster (Bento): Botschaft, Programmbild, Kosten live, Bauwissen, Zielgruppen, Werkbank. Alles auf einem Bildschirm. |
| `konzept-c-planpapier.html` | Geteilter Bildschirm wie im Programm: links Planpapier mit schraffiertem Grundriss, rechts das Auswertungsfenster, verbunden über die markierte Wand. Seitenwechsel im Schriftfeld. |

Standbilder für die Abstimmung: `?still` an die Adresse hängen (keine Kamerabewegung, keine Zählanimation).

## Farben (aus den Bildschirmbildern und dem Werkbank-Prototyp abgenommen)

- Paneele `#1f252d`, tiefer Grund `#141920`, Rahmen `#38414c`
- Schrift altweiß `#e7e5de`, zweite Ordnung `#a0a5ac`
- Akzent Orange-Gelb `#f2b33d`, Gummiband violett `#8f63f0`
- 3D-Boden olivgrün `#3b4236`, Modellflächen `#e0dbca`, Planpapier `#f3f1ea`

## Quellen und Lizenzen

- Schriften (alle SIL Open Font License 1.1, über Fontsource): Inter Tight, Space Grotesk, Instrument Serif, JetBrains Mono
- three.js r169 (MIT-Lizenz), gebündelt in `assets/js/haus3d.js`; lesbarer Quelltext in `assets/js/haus3d.src.js` (neu bündeln mit esbuild als IIFE, globaler Name `Haus3D`)
- Programmbilder aus dem Übergabepaket Fassung 1 (Bild 04 beschnitten, Grundriss- und Schnittausschnitte)
- Architekturfotos: keine. Fotodienste (Unsplash, Pexels, Wikimedia) waren aus der Arbeitsumgebung gesperrt. Das 3D-Haus in Konzept A und der Grundriss in Konzept C sind selbst erzeugt.
- Alle Zahlen in den Live-Fenstern sind Beispielwerte mit unverbindlichen Referenzpreisen.
