// Skizzeo Website · Prototyp 1
// Jahreszahl in der Fußzeile und die kleine Gummiband-Probe auf der Startseite.

(function () {
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

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
