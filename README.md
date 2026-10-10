# Skizzeo Website

Statische Website für skizzeo.com, Prototyp 2 (Stand 10.10.2026). Sie ist eine Fortsetzung der bisherigen Einseiten-Ankündigung.

Konzept: Eine ruhige Tafel im Format 16:9 mit freiem Rand ringsum. Die Seiten wechseln über Buttons, Pfeiltasten oder Wischen; auf Monitoren, Laptops und Tablets quer passt jede Seite ohne Scrollen auf die Tafel. Auf Handys wird daraus eine normale, kurze Seite je Abschnitt.

## Seiten

Alle Seiten liegen in `index.html` und haben eigene Adressen:

1. `#start` Ankündigung
2. `#idee` Die Idee
3. `#fuer-wen` Zielgruppen
4. `#modell`, `#ansichten`, `#bauwissen`, `#auswertung`: Programm mit Unterseiten
5. `#ausprobieren` Gummiband-Probe
6. `#werkbank`, `#verwaltung`: Bauteil-Werkbank und Verwaltung
7. `#kontakt` Kontakt und Eckdaten

Dazu `#impressum` und `#datenschutz` (die Datenschutzerklärung ist ein Entwurf mit offenen Stellen zum Hosting).

## Offline ansehen

`index.html` im Browser öffnen (Doppelklick). Alles liegt lokal: Schriften, Bilder, CSS und JavaScript. Es gibt keine externen Abrufe, keine Cookies und kein Tracking.

## Aufbau

- `assets/css/site.css`: gesamte Gestaltung, Farb- und Schrift-Tokens oben in `:root`
- `assets/js/site.js`: Seitenwechsel, Umschalter 3D/Grundriss und die Gummiband-Probe
- `assets/img/`: Bildschirmbilder aus dem Übergabepaket (Bild 04 beschnitten), Werkbank-Bild aus dem Werkbank-Prototyp, Verwaltungsdialog aus Bild 14, Logo als SVG
- `assets/fonts/`: Archivo und IBM Plex Mono (beide SIL Open Font License), lokal eingebunden

## Veröffentlichen

Den gesamten Ordnerinhalt (ohne `README.md`) per FTP in das Wurzelverzeichnis von skizzeo.com laden. Die bisherige `index.html` wird dabei ersetzt.
