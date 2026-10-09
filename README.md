# Skizzeo Website

Statische Website für skizzeo.com, Prototyp 1 (Stand 09.10.2026). Sie ist eine Fortsetzung der bisherigen Einseiten-Ankündigung.

## Seiten

- `index.html`: Startseite mit Ankündigung, Idee, gekoppeltem Modell und Auswertung, Gummiband-Probe und Zielgruppen
- `einblick.html`: Einblick ins Programm (Ansichten, Bauwissen, Auswertung, Bauteil-Werkbank, Verwaltung, Eckdaten, Kontakt)
- `impressum.html`, `datenschutz.html`: Rechtliches; die Datenschutzerklärung ist ein Entwurf mit offenen Stellen zum Hosting

## Offline ansehen

`index.html` im Browser öffnen (Doppelklick). Alles liegt lokal: Schriften, Bilder, CSS und JavaScript. Es gibt keine externen Abrufe, keine Cookies und kein Tracking.

## Aufbau

- `assets/css/site.css`: gesamte Gestaltung, Farb- und Schrift-Tokens oben in `:root`
- `assets/js/site.js`: Jahreszahl und die Gummiband-Probe auf der Startseite
- `assets/img/`: Bildschirmbilder aus dem Übergabepaket (Bild 04 beschnitten), Werkbank-Bild aus dem Werkbank-Prototyp, Logo als SVG
- `assets/fonts/`: Archivo und IBM Plex Mono (beide SIL Open Font License), lokal eingebunden

## Veröffentlichen

Den gesamten Ordnerinhalt (ohne `README.md`) per FTP in das Wurzelverzeichnis von skizzeo.com laden. Die bisherige `index.html` wird dabei ersetzt.
