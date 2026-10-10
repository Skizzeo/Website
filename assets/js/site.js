// Skizzeo Website · Prototyp 2
// Seitenwechsel über Buttons (Hash-Adressen wie #idee), Blättern mit Pfeiltasten und
// Wischen, Umschalter 3D | Grundriss und die kleine Gummiband-Probe.

(function () {
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Seiten ---------- */
  var board = document.getElementById('board');
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var folge = pages.filter(function (p) { return !p.hasAttribute('data-aside'); });
  var navLinks = document.querySelectorAll('.nav a[data-nav]');
  var legalLinks = document.querySelectorAll('.legal-links a');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var countNr = document.getElementById('count-nr');
  var countAll = document.getElementById('count-all');
  var countTitle = document.getElementById('count-title');
  var tafel = window.matchMedia('(min-width: 1000px) and (min-height: 580px) and (min-aspect-ratio: 5/4)');
  var titelBasis = 'Skizzeo';
  var aktuell = null;

  countAll.textContent = pad(folge.length);

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function finde(id) {
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return pages[i];
    return null;
  }

  function zeige(id, richtung, fokus) {
    var seite = finde(id) || folge[0];
    if (!tafel.matches) window.scrollTo(0, 0);
    if (seite === aktuell) return;
    var alt = aktuell;
    if (!richtung && alt) {
      richtung = folge.indexOf(seite) < folge.indexOf(alt) ? 'prev' : 'next';
    }
    board.setAttribute('data-dir', richtung || 'next');

    pages.forEach(function (p) { p.classList.toggle('is-active', p === seite); });
    aktuell = seite;
    board.setAttribute('data-current', seite.id);
    board.setAttribute('data-tone', seite.getAttribute('data-tone') || 'paper');

    var gruppe = seite.getAttribute('data-nav');
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-nav') === gruppe) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    legalLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + seite.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    var i = folge.indexOf(seite);
    board.classList.toggle('no-pager', i < 0);
    if (i >= 0) {
      countNr.textContent = pad(i + 1);
      countTitle.textContent = seite.getAttribute('data-title');
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === folge.length - 1;
    }

    var t = seite.getAttribute('data-title');
    document.title = seite.id === 'start'
      ? 'Skizzeo – Die neue Ära der 3D-Gebäudemodellierung'
      : t + ' – ' + titelBasis;

    seite.scrollTop = 0;
    if (fokus) seite.focus({ preventScroll: true });
  }

  function gehe(id, richtung) {
    if (location.hash === '#' + id) { zeige(id, richtung, true); return; }
    naechsteRichtung = richtung;
    location.hash = id;
  }

  function blaettern(schritt) {
    var i = folge.indexOf(aktuell);
    if (i < 0) i = 0;
    var j = i + schritt;
    if (j < 0 || j >= folge.length) return;
    gehe(folge[j].id, schritt > 0 ? 'next' : 'prev');
  }

  var naechsteRichtung = null;
  window.addEventListener('hashchange', function () {
    zeige(location.hash.slice(1), naechsteRichtung, true);
    naechsteRichtung = null;
    // Der Browser springt sonst nachträglich zum Anker unter die feste Kopfzeile
    if (!tafel.matches) requestAnimationFrame(function () { window.scrollTo(0, 0); });
  });

  prevBtn.addEventListener('click', function () { blaettern(-1); });
  nextBtn.addEventListener('click', function () { blaettern(1); });

  // Pfeiltasten blättern, außer wenn ein Bedienelement die Taste selbst nutzt
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var ziel = e.target;
    if (ziel && (ziel.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName))) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { blaettern(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { blaettern(-1); e.preventDefault(); }
  });

  // Wischen auf Touch-Bildschirmen im Tafel-Modus
  var wisch = null;
  board.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch' || !tafel.matches || e.target.closest('.plan')) { wisch = null; return; }
    wisch = { x: e.clientX, y: e.clientY };
  });
  board.addEventListener('pointerup', function (e) {
    if (!wisch) return;
    var dx = e.clientX - wisch.x, dy = e.clientY - wisch.y;
    wisch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) blaettern(dx < 0 ? 1 : -1);
  });

  zeige(location.hash.slice(1), 'next', false);
  if (location.hash && !tafel.matches) {
    window.addEventListener('load', function () { window.scrollTo(0, 0); });
  }

  /* ---------- Umschalter 3D | Grundriss ---------- */
  document.querySelectorAll('.toggle').forEach(function (gruppe) {
    var fig = gruppe.closest('figure');
    var bilder = fig.querySelectorAll('.swap img');
    var caption = fig.querySelector('figcaption');
    gruppe.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-show]');
      if (!btn) return;
      var wahl = btn.getAttribute('data-show');
      gruppe.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      bilder.forEach(function (img) { img.classList.toggle('off', img.getAttribute('data-view') !== wahl); });
      caption.textContent = caption.getAttribute('data-caption-' + wahl);
    });
    bilder.forEach(function (img, n) { if (n > 0) img.classList.add('off'); });
  });

  /* ---------- Gummiband-Probe ---------- */
  var plan = document.getElementById('plan');
  if (!plan) return;

  // Maßstab und Beispielwerte (gerundet, unverbindlich)
  var PX_PER_M = 40;          // 1 m im Plan
  var X0 = 60;                // linke Außenkante
  var BREITE = 8;             // m, fest
  var WAND = 15;              // px, Wanddicke im Plan
  var MIN = 7, MAX = 14, RASTER = 0.05;
  var GESCHOSSHOEHE = 2.855;  // m, wie im Programm
  var GESCHOSSE = 2;
  var EP_WAND = 170;          // €/m² Mauerwerk + WDVS
  var EP_BETON = 226;         // €/m³ Stahlbeton
  var DICKE = 0.22;           // m, Sohlplatte und Decken

  var svg = plan.querySelector('svg');
  var outer = document.getElementById('p-outer');
  var inner = document.getElementById('p-inner');
  var hit = document.getElementById('p-hit');
  var band = document.getElementById('p-band');
  var hint = document.getElementById('p-hint');
  var dhLine = document.getElementById('p-dh-line');
  var dhEnd = document.getElementById('p-dh-end');
  var dhText = document.getElementById('p-dh-text');
  var out = {
    mass: document.getElementById('o-mass'),
    flaeche: document.getElementById('o-flaeche'),
    wand: document.getElementById('o-wand'),
    wandkosten: document.getElementById('o-wandkosten'),
    beton: document.getElementById('o-beton'),
    summe: document.getElementById('o-summe')
  };

  var de2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var de0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  var laenge = 10;

  function setText(el, txt) {
    if (el.textContent === txt) return;
    el.textContent = txt;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  function render() {
    var w = laenge * PX_PER_M;
    var xr = X0 + w;
    outer.setAttribute('width', w);
    inner.setAttribute('width', w - 2 * WAND);
    hit.setAttribute('x', xr - 14);
    band.setAttribute('x', xr - 3);
    hint.setAttribute('x', Math.min(xr + 18, 640));
    hint.style.display = xr > 600 ? 'none' : '';
    dhLine.setAttribute('x2', xr);
    dhEnd.setAttribute('x1', xr);
    dhEnd.setAttribute('x2', xr);
    dhText.setAttribute('x', X0 + w / 2);
    dhText.textContent = de2.format(laenge);

    var flaeche = laenge * BREITE;
    var wand = 2 * (laenge + BREITE) * GESCHOSSHOEHE * GESCHOSSE;
    var wandKosten = wand * EP_WAND;
    var betonKosten = flaeche * DICKE * (GESCHOSSE + 1) * EP_BETON;

    setText(out.mass, de2.format(laenge) + ' × ' + de2.format(BREITE) + ' m');
    setText(out.flaeche, de2.format(flaeche) + ' m²');
    setText(out.wand, de2.format(wand) + ' m²');
    setText(out.wandkosten, de0.format(wandKosten) + ' €');
    setText(out.beton, de0.format(betonKosten) + ' €');
    setText(out.summe, de0.format(wandKosten + betonKosten) + ' €');

    hit.setAttribute('aria-valuenow', laenge.toFixed(2));
    hit.setAttribute('aria-valuetext', de2.format(laenge) + ' Meter');
  }

  function setLaenge(m) {
    m = Math.round(m / RASTER) * RASTER;
    laenge = Math.max(MIN, Math.min(MAX, m));
    render();
  }

  function toSvgX(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x;
  }

  var dragging = false;
  function start(evt) {
    dragging = true;
    plan.classList.add('dragging');
    hit.setPointerCapture(evt.pointerId);
    evt.preventDefault();
  }
  function move(evt) {
    if (!dragging) return;
    setLaenge((toSvgX(evt) - X0) / PX_PER_M);
  }
  function stop() {
    dragging = false;
    plan.classList.remove('dragging');
  }

  hit.addEventListener('pointerdown', start);
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerup', stop);
  hit.addEventListener('pointercancel', stop);
  hit.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 1 : 0.25;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setLaenge(laenge + step); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setLaenge(laenge - step); e.preventDefault(); }
    if (e.key === 'Home') { setLaenge(MIN); e.preventDefault(); }
    if (e.key === 'End') { setLaenge(MAX); e.preventDefault(); }
  });

  render();
})();
