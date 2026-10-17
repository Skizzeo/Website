# Skizzeo · Designlinie „Nachtmodell“

Zweite, dunkle Designlinie der Website, entwickelt aus Startseiten-Entwurf A (siehe `../alternative/`).
Inhaltsstand: Übergabepaket Fassung 7 vom 14.10.2026. Stand dieser Fassung: 17.10.2026.

## Öffnen

`index.html` doppelklicken. Die Seite läuft ohne Internet und ohne Server, auch direkt von der Festplatte.
Mit `?still` hinter der Adresse stehen Kamera und Modell still (für Bildschirmfotos).

## Aufbau

Ein durchgehendes 3D-Modell im Skizzen-Look des Programms trägt die ganze Website. Jede Seite wählt
eine Kameraeinstellung, zwischen den Seiten fährt die Kamera weich. Auf Seiten mit Programmbildern
tritt das Modell zurück. Kein Scrollen auf Laptop und Desktop, Seitenwechsel über Kopfzeile,
Kapitelleiste, Zurück/Weiter, Pfeiltasten und Wischen. Auf dem Handy werden es normale kurze Seiten.

| Adresse | Seite | Bühne |
|---|---|---|
| `#start` | Ziehen Sie die Wand. Die Kosten ziehen mit. | 3D, Wand ziehen, Live-Fenster Mengen · Kosten · AVA |
| `#idee` | Gebaut für das Wohnhaus. | 3D gedämpft |
| `#modell` | 01 Modellieren in 3D | Bilder 01, 03, 02 |
| `#zeichnen` | 02 Zeichnen mit Maßen | Bilder 32, 33, 31, 34, 06, 08 |
| `#bauplaner` | 03 Denkt wie ein Bauplaner | 3D mit Beschriftungen, Schnittdetails 07, 23, 25, 37 |
| `#auswertung` | 04 Mengen · Kosten · AVA | Bilder 26, 27, 28, 04 |
| `#sonne` | 05 Sonne und Gelände | 3D, Sonne über den Tag ziehen, Datum wählen |
| `#austausch` | 06 IFC und Erweiterungen | Bilder 29, 21, 22, 20 |
| `#fuer-wen` | Für Praktiker, nicht für CAD-Spezialisten. | 3D gedämpft |
| `#werkbank` | Bauteil-Werkbank (Ausblick) | Werkbank-Prototyp |
| `#verwaltung` | Planen statt verwalten. (heute, KI als Ausblick) | Bilder 14, 09, 10, 35 |
| `#kontakt` | Skizzeo erscheint bald. | 3D gedämpft |
| `#impressum`, `#datenschutz` | Rechtliches (Datenschutz ist Entwurf, Hoster offen) | – |

Größen: Alle Maße wachsen mit dem Bildschirm (16 px Grundschrift bei Full HD, 32 px bei 4K).
Geprüft bei 390 × 844, 1366 × 768, 1920 × 1080 und 3840 × 2160.

## Dateien

- `index.html`: alle Seiten
- `assets/css/site.css`: Gestaltung
- `assets/js/site.js`: Seitenwechsel, Live-Fenster, Sonnenstand, Bildbetrachter, Großansicht
- `assets/js/haus3d.js`: 3D-Modell (gebündelt), Quelltext in `haus3d.src.js`
- `assets/img/`: Programmbilder aus dem Übergabepaket Fassung 7, Werkbank-Bild aus Prototyp 2
- `assets/fonts/`: Inter Tight und JetBrains Mono

Bündeln des 3D-Modells (three.js 0.169, esbuild 0.24):
`npx esbuild haus3d.src.js --bundle --minify --format=iife --global-name=Haus3D --outfile=haus3d.js`

## Quellen und Lizenzen

- three.js 0.169: MIT-Lizenz
- Inter Tight und JetBrains Mono (über Fontsource): SIL Open Font License 1.1
- Programmbilder: Übergabepaket des Auftraggebers
- Fotos fremder Anbieter: keine verwendet

## Inhaltliche Leitplanken

- Mengen und Kosten auf der Startseite sind eine Beispielrechnung mit unverbindlichen Referenzwerten.
- Das 3D-Modell zeigt nur, was vorhanden ist: Flachdach, Öffnungen ohne Rahmen und Glas, zwei Geschosse.
- Werkbank und KI in der Verwaltung stehen nur als Ausblick da.
- Keine Preise, keine Lizenz- oder Stufennamen, keine Mitbewerber.

## Offen

- 4K-Programmbilder des Auftraggebers einsetzen (Bild 04 zeigt noch das frühere helle Mengenfenster, Bild 14 ist nur 840 px breit).
- Datenschutz: Hoster, Speicherdauer und Auftragsverarbeitung eintragen.
- Freigabe der Ausblick-Inhalte durch den Auftraggeber.
