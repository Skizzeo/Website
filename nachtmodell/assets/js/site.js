// Skizzeo · Designlinie „Nachtmodell“
// Seitenwechsel über Hash-Adressen (#idee), Blättern mit Pfeiltasten und Wischen,
// ein durchgehendes 3D-Modell mit Kameraeinstellung je Seite, Live-Fenster mit
// Beispielrechnung, Sonnenstand zum Ziehen, Bildbetrachter und Großansicht.

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var still = /[?&]still\b/.test(location.search);
  var nf = function (n, d) { d = d || 0; return n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  all('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  var tafel = window.matchMedia('(min-width: 901px) and (min-aspect-ratio: 11/10)');
  var pagesEl = $('pages');
  var pages = all('.page');
  var folge = pages.filter(function (p) { return !p.hasAttribute('data-aside'); });
  var navLinks = all('.nav a[data-nav]');
  var legalLinks = all('.legal-links a');
  var chapterLinks = all('.chapters a');
  var foot = $('foot');
  var aktuell = null;

  /* ---------- Kameraeinstellungen je Seite ---------- */
  var VIEWS = {
    hero:      { az: 0.66, el: 0.46, dist: 62, shiftX: 0.15, spin: 0.12, sun: true, sel: true, drag: 'wall' },
    oben:      { az: 0.0, el: 1.46, dist: 58, shiftX: 0.15, spin: 0, sun: false, sel: true, drag: 'wall' },
    vorne:     { az: 0.0, el: 0.05, dist: 64, shiftX: 0.15, shiftY: 0.05, spin: 0, sun: false, sel: true, drag: 'wall' },
    seite:     { az: 1.5708, el: 0.05, dist: 64, shiftX: 0.15, shiftY: 0.05, spin: 0, sun: false, sel: true, drag: 'wall' },
    ambient:   { az: 2.3, el: 0.4, dist: 66, shiftX: 0.0, spin: 0, rotate: 0.035, sun: false, sel: false, drag: 'none' },
    bauplaner: { az: 0.86, el: 0.62, dist: 55, shiftX: 0.14, shiftY: 0.03, spin: 0.06, sun: false, sel: false, drag: 'none' },
    sonne:     { az: 0.42, el: 0.5, dist: 70, shiftX: 0.12, shiftY: 0.02, spin: 0, sun: true, sel: false, north: true, drag: 'sun' },
    wer:       { az: -0.9, el: 0.32, dist: 70, shiftX: 0.22, shiftY: -0.16, spin: 0, rotate: 0.03, sun: false, sel: false, drag: 'none' },
    kontakt:   { az: 0.4, el: 0.95, dist: 66, shiftX: -0.02, spin: 0, rotate: 0.04, sun: false, sel: false, drag: 'none' }
  };
  function adapt(v) {
    var o = {}; for (var k in v) o[k] = v[k];
    if (!tafel.matches) { o.shiftX = 0; o.shiftY = 0.06; o.dist = v.dist * (window.innerWidth < window.innerHeight ? 1.45 : 1.1); }
    return o;
  }

  /* ---------- 3D-Modell ---------- */
  var haus = null, sceneOffTimer = 0, sonneSichtbar = true;
  var tagsAktiv = [];
  var live = { card: 'kosten', s: null, ref: null };

  if (window.Haus3D) {
    try {
      haus = Haus3D.init($('stage'), {
        depth: 8.6, baseDepth: 8.0, still: still, view: adapt(VIEWS.hero),
        onChange: function (s, ref) { live.s = s; live.ref = ref; renderLive(true); },
        onSun: function () { renderSun(); },
        onFrame: function (p) {
          for (var i = 0; i < tagsAktiv.length; i++) {
            var el = tagsAktiv[i], pt = p[el.getAttribute('data-anchor')];
            if (!pt) continue;
            if (!sonneSichtbar && el.classList.contains('sun')) { el.classList.add('hidden'); continue; }
            el.style.left = pt.x.toFixed(1) + 'px';
            el.style.top = pt.y.toFixed(1) + 'px';
            el.classList.toggle('hidden', pt.behind);
          }
        }
      });
    } catch (e) {
      if (window.console) console.warn('3D-Modell nicht verfügbar:', e && e.message);
      // Ohne WebGL bleibt die Seite vollständig lesbar, nur ohne Modell
      document.body.classList.add('no-3d');
      haus = null;
    }
  }

  function szene(seite) {
    var mode = seite.getAttribute('data-scene') || 'off';
    document.body.setAttribute('data-scene', mode);
    clearTimeout(sceneOffTimer);
    if (!haus) return;
    if (mode === 'off') {
      sceneOffTimer = setTimeout(function () { haus.setActive(false); }, still ? 0 : 900);
    } else {
      haus.setActive(true);
      var name = seite.getAttribute('data-view') || 'hero';
      if (seite.id === 'start') name = camWahl;
      sonneSichtbar = VIEWS[name].sun;
      haus.setView(adapt(VIEWS[name]), 1300);
    }
    tagsAktiv = tafel.matches ? all('.tag[data-anchor]', seite) : [];
  }

  /* ---------- Seiten ---------- */
  $('count-all').textContent = pad(folge.length);

  function zeige(id, richtung, fokus) {
    var seite = pages.filter(function (p) { return p.id === id; })[0] || folge[0];
    if (!tafel.matches) window.scrollTo(0, 0);
    if (seite === aktuell) return;
    var alt = aktuell;
    if (!richtung && alt) richtung = folge.indexOf(seite) < folge.indexOf(alt) ? 'prev' : 'next';
    pagesEl.setAttribute('data-dir', richtung || 'next');

    pages.forEach(function (p) { p.classList.toggle('is-active', p === seite); p.setAttribute('aria-hidden', String(p !== seite)); });
    aktuell = seite;
    szene(seite);

    var gruppe = seite.getAttribute('data-nav');
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-nav') === gruppe) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    legalLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + seite.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    // Kapitelleiste: auf der Startseite als Einstieg, auf den Programmseiten als Fortschritt
    var kap = +(seite.getAttribute('data-chapter') || 0);
    foot.setAttribute('data-chapters', (kap || seite.id === 'start') ? 'on' : 'off');
    chapterLinks.forEach(function (a, i) {
      if (i + 1 === kap) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      a.classList.toggle('done', kap > 0 && i + 1 < kap);
    });

    var i = folge.indexOf(seite);
    $('count-nr').textContent = i >= 0 ? pad(i + 1) : '–';
    $('count-title').textContent = seite.getAttribute('data-title');
    $('prev').disabled = i === 0;
    $('next').disabled = i === folge.length - 1;

    document.title = seite.id === 'start'
      ? 'Skizzeo – Ziehen Sie die Wand. Die Kosten ziehen mit.'
      : seite.getAttribute('data-title') + ' – Skizzeo';

    all('[data-viewer]', seite).forEach(fitViewer);
    if (fokus) seite.focus({ preventScroll: true });
    menu(false);
  }

  var naechsteRichtung = null;
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

  window.addEventListener('hashchange', function () {
    zeige(location.hash.slice(1), naechsteRichtung, true);
    naechsteRichtung = null;
    if (!tafel.matches) requestAnimationFrame(function () { window.scrollTo(0, 0); });
  });
  $('prev').addEventListener('click', function () { blaettern(-1); });
  $('next').addEventListener('click', function () { blaettern(1); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lightbox(false); menu(false); return; }
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (lb.classList.contains('open')) return;
    var z = e.target;
    if (z && (z.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(z.tagName))) return;
    if (z && z.getAttribute && z.getAttribute('role') === 'tab') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { blaettern(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { blaettern(-1); e.preventDefault(); }
  });

  // Wischen auf Touch-Bildschirmen im Tafel-Modus (nicht auf dem Modell, dort wird gezogen)
  var wisch = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch' || !tafel.matches || e.target.id === 'stage' || e.target.closest('input')) { wisch = null; return; }
    wisch = { x: e.clientX, y: e.clientY };
  });
  document.addEventListener('pointerup', function (e) {
    if (!wisch) return;
    var dx = e.clientX - wisch.x, dy = e.clientY - wisch.y;
    wisch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) blaettern(dx < 0 ? 1 : -1);
  });

  // Menü auf dem Handy
  var nav = $('nav'), menuBtn = $('menu-btn');
  function menu(auf) {
    nav.classList.toggle('open', auf);
    menuBtn.setAttribute('aria-expanded', String(auf));
  }
  menuBtn.addEventListener('click', function () { menu(!nav.classList.contains('open')); });

  /* ---------- Startseite: Blick wählen ---------- */
  var camWahl = 'hero';
  all('.views button').forEach(function (b) {
    b.addEventListener('click', function () {
      camWahl = b.getAttribute('data-cam');
      all('.views button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      sonneSichtbar = VIEWS[camWahl].sun;
      if (haus) haus.setView(adapt(VIEWS[camWahl]), 1200);
    });
  });

  /* ---------- Live-Fenster: Mengen, Kosten, AVA ---------- */
  var KARTEN = {
    mengen: {
      sum: 'Außenwandfläche, 2 Geschosse · VOB',
      rows: function (s) { return [
        ['Außenwände Gasbeton 17,5 · VOB', nf(s.awVol, 2) + ' m³', 1],
        ['Dämmung WDVS', nf(s.wdvs, 2) + ' m²', 1],
        ['Sohlplatte', nf(s.sohle, 2) + ' m²', 1],
        ['Fenster und Türen · Laibungen', s.oeff + ' · ' + nf(s.laib, 1) + ' m', 0],
        ['Flachdach mit Gefälledämmung', nf(s.dach, 2) + ' m²', 1]
      ]; },
      total: function (s) { return nf(s.wdvs, 1) + ' m²'; },
      delta: function (s, r) { var d = s.wdvs - r.wdvs; return (d >= 0 ? '+ ' : '− ') + nf(Math.abs(d), 2) + ' m²'; }
    },
    kosten: {
      sum: 'Kostenschätzung netto · DIN 276',
      rows: function (s) { return [
        ['Rohbau · Mauerwerk, Sohle, Decken', nf(s.rohbau) + ' €', 1],
        ['Fassade · Dämmung WDVS', nf(s.fassade) + ' €', 1],
        ['Flachdach mit Gefälledämmung', nf(s.dachK) + ' €', 1],
        ['Dachterrasse', nf(s.terr) + ' €', 0],
        ['Baustelle und Erdarbeiten', nf(s.baustelle) + ' €', 1]
      ]; },
      total: function (s) { return nf(s.sum) + ' €'; },
      delta: function (s, r) { var d = s.sum - r.sum; return (d >= 0 ? '+ ' : '− ') + nf(Math.abs(d)) + ' €'; }
    },
    ava: {
      sum: 'Summe der Lose netto',
      rows: function (s) { return [
        ['Los Rohbau · Baustelleneinrichtung', nf(6400) + ' €', 0],
        ['Los Rohbau · Erdarbeiten', nf(s.baustelle - 6400) + ' €', 1],
        ['Los Rohbau · Beton- und Mauerarbeiten', nf(s.rohbau) + ' €', 1],
        ['Los WDVS', nf(s.fassade) + ' €', 1],
        ['Los Dach · Flachdach und Dachterrasse', nf(s.dachK + s.terr) + ' €', 1]
      ]; },
      total: function (s) { return nf(s.sum) + ' €'; },
      delta: function (s, r) { var d = s.sum - r.sum; return (d >= 0 ? '+ ' : '− ') + nf(Math.abs(d)) + ' €'; }
    }
  };
  var liveRows = $('live-rows');
  function renderLive(geaendert) {
    if (!live.s || !KARTEN) return;
    var k = KARTEN[live.card], s = live.s, r = live.ref;
    var html = '';
    k.rows(s).forEach(function (row, i) {
      html += '<div class="row' + (i === 0 ? ' hot' : '') + (geaendert && row[2] ? ' flash' : '') + '"><span>' + row[0] + '</span><span>' + row[1] + '</span></div>';
    });
    liveRows.innerHTML = html;
    $('live-sumlabel').textContent = k.sum;
    $('live-sum').textContent = k.total(s);
    $('live-delta').textContent = k.delta(s, r);
    var ds = s.depth - r.depth;
    all('[data-out="shift"]').forEach(function (el) { el.textContent = (ds >= 0 ? '+' : '−') + nf(Math.abs(ds), 2) + ' m'; });
  }
  all('.live .tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      live.card = b.getAttribute('data-card');
      all('.live .tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      renderLive(false);
    });
  });
  if (!haus) {
    // Beispielwerte, falls das Modell nicht laufen kann
    live.s = { depth: 8.6, awVol: 0, wdvs: 0, sohle: 0, oeff: 8, laib: 31.4, dach: 0, rohbau: 0, fassade: 0, dachK: 0, terr: 0, baustelle: 6400, sum: 0 };
    live.ref = live.s;
  }
  renderLive(false);

  /* ---------- Sonnenstand ---------- */
  var DATEN = [
    { m: 3, d: 21, dst: false, label: '21.03.', lang: '21. März' },
    { m: 6, d: 21, dst: true, label: '21.06.', lang: '21. Juni' },
    { m: 9, d: 23, dst: true, label: '23.09.', lang: '23. September' },
    { m: 12, d: 21, dst: false, label: '21.12.', lang: '21. Dezember' }
  ];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var sunDatum = DATEN[1];
  var RICHTUNG = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  var range = $('sun-range');
  function uhr(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + ':' + pad(m % 60); }
  function renderSun() {
    if (!haus) return;
    var s = haus.sunInfo(), zone = s.dst ? 'MESZ' : 'MEZ';
    $('sun-clock').innerHTML = uhr(s.clock) + '<small>' + zone + '</small>';
    $('sun-date').textContent = sunDatum.lang;
    $('sun-rise').textContent = 'Aufgang ' + uhr(s.rise);
    $('sun-set').textContent = 'Untergang ' + uhr(s.set);
    $('sun-elev').textContent = nf(Math.max(0, s.elevation), 0) + '°';
    var az = (s.azimuth % 360 + 360) % 360;
    $('sun-azim').textContent = nf(az, 0) + '° ' + RICHTUNG[Math.round(az / 22.5) % 16];
    range.min = Math.ceil(s.rise * 60 + 10);
    range.max = Math.floor(s.set * 60 - 10);
    range.value = Math.round(s.clock * 60);
    all('[data-out="sunlabel"]').forEach(function (el) { el.textContent = sunDatum.label + ' · ' + uhr(s.clock) + ' ' + zone; });
  }
  range.addEventListener('input', function () {
    if (!haus) return;
    haus.setSun(range.value / 60);
    renderSun();
  });
  all('.sunpanel .dates button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!haus) return;
      var k = b.getAttribute('data-date'), uhrzeit = null;
      if (k === 'now') {
        var teile = {};
        new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })
          .formatToParts(new Date()).forEach(function (t) { teile[t.type] = +t.value; });
        var dst = ((teile.hour - new Date().getUTCHours() + 24) % 24) === 2;
        sunDatum = { m: teile.month, d: teile.day, dst: dst, label: pad(teile.day) + '.' + pad(teile.month) + '.', lang: teile.day + '. ' + MONATE[teile.month - 1] };
        uhrzeit = (teile.hour % 24) + teile.minute / 60;
      } else {
        sunDatum = DATEN[+k];
        uhrzeit = haus.sunInfo().clock - (haus.sunInfo().dst ? 1 : 0) + (sunDatum.dst ? 1 : 0);
      }
      haus.setSun(uhrzeit, sunDatum);
      // Nach einem Datumswechsel nicht direkt am Horizont stehen bleiben
      var info = haus.sunInfo();
      if (k !== 'now') haus.setSun(Math.max(info.rise + 1, Math.min(info.set - 1, info.clock)));
      all('.sunpanel .dates button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderSun();
    });
  });
  renderSun();

  /* ---------- Bildbetrachter ---------- */
  function fitViewer(fig) {
    if (!tafel.matches) return;
    var frame = fig.querySelector('.frame');
    var W = frame.clientWidth, H = frame.clientHeight;
    if (!W || !H) return;
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    all('img', frame).forEach(function (img) {
      var w = +img.getAttribute('width'), h = +img.getAttribute('height');
      var padd = img.classList.contains('paper') ? 2.4 * rem : 0;
      // nie größer als die Bildfläche, und nicht mehr als 1,2-fach über der Originalgröße bei 16 px
      var k = Math.min((W - padd - 2) / w, (H - padd - 2) / h, 1.2 * rem / 16);
      img.style.width = Math.round(w * k + padd) + 'px';
      img.style.height = Math.round(h * k + padd) + 'px';
    });
  }
  all('[data-viewer]').forEach(function (fig) {
    var bilder = all('.frame img', fig), tabs = fig.querySelector('.tabs'), cap = fig.querySelector('.cap');
    function wahl(n) {
      bilder.forEach(function (img, i) { img.classList.toggle('on', i === n); });
      all('button', tabs).forEach(function (b, i) { b.setAttribute('aria-selected', String(i === n)); b.tabIndex = i === n ? 0 : -1; });
      cap.textContent = bilder[n].getAttribute('data-cap');
    }
    bilder.forEach(function (img, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = img.getAttribute('data-tab');
      b.addEventListener('click', function () { wahl(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + bilder.length) % bilder.length;
          wahl(n); tabs.children[n].focus(); e.preventDefault();
        }
      });
      tabs.appendChild(b);
      img.addEventListener('click', function () { lightbox(true, img.getAttribute('src'), img.getAttribute('data-cap'), img.classList.contains('paper'), img.alt); });
      img.removeAttribute('loading');
    });
    wahl(0);
  });
  window.addEventListener('resize', function () { if (aktuell) all('[data-viewer]', aktuell).forEach(fitViewer); });
  window.addEventListener('load', function () { if (aktuell) all('[data-viewer]', aktuell).forEach(fitViewer); });

  /* ---------- Großansicht ---------- */
  var lb = $('lightbox'), lbImg = $('lb-img'), lbCap = $('lb-cap'), lbZurueck = null;
  lb.hidden = false;
  function lightbox(auf, src, text, paper, alt) {
    if (auf) {
      lbZurueck = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = text || '';
      lbImg.classList.toggle('paper', !!paper);
      lb.classList.add('open');
      $('lb-close').focus();
    } else if (lb.classList.contains('open')) {
      lb.classList.remove('open');
      if (lbZurueck) lbZurueck.focus();
    }
  }
  $('lb-close').addEventListener('click', function () { lightbox(false); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lightbox(false); });
  all('[data-zoom]').forEach(function (b) {
    b.addEventListener('click', function () { lightbox(true, b.getAttribute('data-zoom'), b.getAttribute('data-cap'), b.hasAttribute('data-paper'), b.getAttribute('data-cap')); });
  });

  /* ---------- Start ---------- */
  tafel.addEventListener('change', function () { if (aktuell) { var a = aktuell; aktuell = null; zeige(a.id, 'next', false); } });
  zeige(location.hash.slice(1), 'next', false);
  if (location.hash && !tafel.matches) window.addEventListener('load', function () { window.scrollTo(0, 0); });
})();
