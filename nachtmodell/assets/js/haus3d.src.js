// Skizzeo · Designlinie „Nachtmodell“
// Ein durchgehendes Echtzeit-Massenmodell im Skizzen-Look des Programms: altweiße Flächen,
// schwarze Kanten, dunkel-olivgrüner Boden. Jede Seite der Website wählt eine Kameraeinstellung,
// zwischen den Einstellungen fährt die Kamera weich. Die markierte Außenwand lässt sich ziehen,
// die Sonne lässt sich über den Tag ziehen. Mengen und Kosten sind eine unverbindliche Beispielrechnung.
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const C = {
  face: 0xe4dfcf,
  edge: 0x0d0f10,
  amber: 0xf2b33d,
  band: 0x8f63f0,
};

// Maße in Metern, orientiert an den Beispielen im Übergabepaket
const W = 10.0;         // Breite
const H = 2.855;        // Geschosshöhe
const T = 0.315;        // Wanddicke AW 31,5
const SETBACK = 2.2;    // Rücksprung OG vorne -> Dachterrasse
const CANT = 1.1;       // Vorsprung OG links

// Bauort für den Sonnenstand: Norddeutschland, etwa 53° N, 8,5° O
const LAT = 53 * Math.PI / 180;
const LON = 8.5;
const SUN_R = 15;

// Deklination für einen Tag im Jahr (Näherung, genau genug für die Darstellung)
export function declination(dayOfYear) {
  return 23.44 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180;
}

function boxEdges(geo, lineMat) {
  const e = new THREE.EdgesGeometry(geo, 20);
  const g = new LineSegmentsGeometry().fromEdgesGeometry(e);
  return new LineSegments2(g, lineMat);
}

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;

export function init(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.still });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 400);

  const lineMat = new LineMaterial({ color: C.edge, linewidth: 2 });
  const amberLine = new LineMaterial({ color: C.amber, linewidth: 2.6, transparent: true, opacity: 0.95 });
  const bandLine = new LineMaterial({ color: C.band, linewidth: 4 });
  const thinLine = new LineMaterial({ color: 0x2b2d2a, linewidth: 1.1, transparent: true, opacity: 0.8 });
  const arcLine = new LineMaterial({ color: C.amber, linewidth: 2, transparent: true, opacity: 0.6 });
  const northLine = new LineMaterial({ color: 0xe7e5de, linewidth: 2, transparent: true, opacity: 0.8 });
  const lineMats = [lineMat, amberLine, bandLine, thinLine, arcLine, northLine];

  // Licht
  const hemi = new THREE.HemisphereLight(0xf4f1e6, 0x2c3328, 1.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3dc, 2.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 100 });
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 6;
  scene.add(sun);

  // Boden: olivgrün, weich ausblendend, mit feinem Raster
  const tex = (() => {
    const s = 2048, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    rg.addColorStop(0, 'rgba(66,74,60,1)');
    rg.addColorStop(0.45, 'rgba(56,63,51,0.92)');
    rg.addColorStop(1, 'rgba(56,63,51,0)');
    g.fillStyle = rg; g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = 'source-atop';
    g.strokeStyle = 'rgba(230,226,205,0.07)';
    g.lineWidth = 2;
    const step = s / 80;
    for (let i = 0; i <= 80; i++) {
      g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, s); g.stroke();
      g.beginPath(); g.moveTo(0, i * step); g.lineTo(s, i * step); g.stroke();
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  })();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.49;
  ground.receiveShadow = true;
  scene.add(ground);
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.38 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.485;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  const faceMat = new THREE.MeshLambertMaterial({ color: C.face });
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0x7d806f });
  const deckMat = new THREE.MeshLambertMaterial({ color: 0xbdb7a4 });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x343c40 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x8c8a80 });
  const pipeMat = new THREE.MeshLambertMaterial({ color: 0x8e9294 });
  const grass = new THREE.MeshLambertMaterial({ color: 0x55703c });
  const soil = new THREE.MeshLambertMaterial({ color: 0x5b4535 });
  const terrainMats = [soil, soil, grass, soil, soil, soil];

  const house = new THREE.Group();
  scene.add(house);
  const selection = new THREE.Group();
  scene.add(selection);

  let depth = opts.depth ?? 8.0;
  let anchors = {};

  function solid(w, h, d, x, y, z, mat = faceMat, edges = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    house.add(m);
    if (edges) { const l = boxEdges(geo, lineMat); l.position.copy(m.position); house.add(l); }
    return m;
  }

  // Öffnung in einer Fassade: dunkle Fläche knapp vor der Wand, mit Kanten (ohne Rahmen und Glas)
  function opening(face, u0, u1, y0, y1, plane) {
    const w = u1 - u0, h = y1 - y0, t = 0.04;
    let geo, x, z;
    if (face === 'z') { geo = new THREE.BoxGeometry(w, h, t); x = (u0 + u1) / 2; z = plane; }
    else { geo = new THREE.BoxGeometry(t, h, w); x = plane; z = (u0 + u1) / 2; }
    const m = new THREE.Mesh(geo, darkMat);
    m.position.set(x, (y0 + y1) / 2, z);
    m.receiveShadow = true;
    house.add(m);
    const l = boxEdges(geo, lineMat); l.position.copy(m.position); house.add(l);
  }

  function build() {
    house.clear();
    selection.clear();
    const d = depth;
    const ogD = d - SETBACK, ogZ = -SETBACK / 2, ogX = -CANT / 2, ogW = W + CANT;
    // Geländeplatte mit Rasen
    const tg = new THREE.BoxGeometry(ogW + 5, 0.36, d + 5);
    const terr = new THREE.Mesh(tg, terrainMats);
    terr.position.set(ogX, -0.3, 0.3);
    terr.receiveShadow = true;
    house.add(terr);
    const tl = boxEdges(tg, lineMat); tl.position.copy(terr.position); house.add(tl);
    // Gründung: Sohlplatte mit Sockelrücksprung
    solid(W + 0.1, 0.22, d + 0.1, 0, -0.11, 0, plinthMat);
    // EG als Massenkörper
    solid(W, H, d, 0, H / 2, 0);
    // Dachterrassenbelag auf dem Rücksprung
    solid(W - 2 * 0.25, 0.06, SETBACK - 0.25, 0, H + 0.03, d / 2 - (SETBACK - 0.25) / 2 - 0.25, deckMat, false);
    // Attika um die Dachterrasse
    const at = 0.22, ah = 0.42;
    solid(W, ah, at, 0, H + ah / 2, d / 2 - at / 2);
    solid(at, ah, SETBACK, -W / 2 + at / 2, H + ah / 2, d / 2 - SETBACK / 2);
    solid(at, ah, SETBACK, W / 2 - at / 2, H + ah / 2, d / 2 - SETBACK / 2);
    // Ablauf der Dachterrasse
    solid(0.28, 0.02, 0.28, W / 2 - 0.9, H + 0.07, d / 2 - 0.8, darkMat, false);
    // OG zurückgesetzt nach vorne, vorspringend nach links
    solid(ogW, H, ogD, ogX, H + H / 2, ogZ);
    // Flachdach mit umlaufender Aufkantung
    const rt = 0.25, rh = 0.48, top = 2 * H;
    solid(ogW - 2 * rt, 0.12, ogD - 2 * rt, ogX, top + 0.06, ogZ, roofMat, false);
    solid(ogW, rh, rt, ogX, top + rh / 2, ogZ + ogD / 2 - rt / 2);
    solid(ogW, rh, rt, ogX, top + rh / 2, ogZ - ogD / 2 + rt / 2);
    solid(rt, rh, ogD - 2 * rt, ogX - ogW / 2 + rt / 2, top + rh / 2, ogZ);
    solid(rt, rh, ogD - 2 * rt, ogX + ogW / 2 - rt / 2, top + rh / 2, ogZ);
    // Gefälle: Kehlen und Grate zu zwei Abläufen
    const y = top + 0.125, x0 = ogX - ogW / 2 + rt, x1 = ogX + ogW / 2 - rt, z0 = ogZ - ogD / 2 + rt, z1 = ogZ + ogD / 2 - rt;
    const dA = [ogX - ogW / 4, ogZ], dB = [ogX + ogW / 4, ogZ];
    {
      const pos = [x0, y, z0, dA[0], y, dA[1], x0, y, z1, dA[0], y, dA[1], x1, y, z0, dB[0], y, dB[1], x1, y, z1, dB[0], y, dB[1],
        ogX, y, z0, ogX, y, z1, dA[0], y, dA[1], dB[0], y, dB[1]];
      house.add(new LineSegments2(new LineSegmentsGeometry().setPositions(pos), thinLine));
      [dA, dB].forEach(p => solid(0.3, 0.02, 0.3, p[0], y + 0.01, p[1], darkMat, false));
    }
    // Regenfallrohre außen an der Attika, rechte Fassade
    const pipeZ = [ogZ - ogD / 2 + 0.7, ogZ + ogD / 2 - 0.7];
    pipeZ.forEach(z => {
      const len = top + rh - 0.2;
      const pg = new THREE.CylinderGeometry(0.07, 0.07, len, 16);
      const p = new THREE.Mesh(pg, pipeMat); p.position.set(W / 2 + 0.14, len / 2, z); p.castShadow = true; house.add(p);
      solid(0.22, 0.32, 0.3, W / 2 + 0.16, top + rh - 0.3, z, pipeMat);
      for (let yy = 1.0; yy < len - 0.6; yy += 1.6) solid(0.12, 0.04, 0.2, W / 2 + 0.08, yy, z, pipeMat, false);
    });

    // Fenster und Türen: EG vorne (bewegliche Wand) wandert mit
    const fz = d / 2 + 0.005, rz = W / 2 + 0.005;
    opening('z', -3.7, -2.2, 0.9, 2.285, fz);
    opening('z', -0.55, 0.585, 0.0, 2.135, fz);
    opening('z', 1.5, 3.51, 0.9, 2.285, fz);
    opening('x', -0.63, 0.63, 0.9, 2.285, rz);
    opening('x', -3.0, -1.74, 0.9, 2.285, rz);
    // OG: Fenstertür zur Dachterrasse, Fenster vorne und seitlich
    const oz = d / 2 - SETBACK + 0.005;
    opening('z', -2.6, 0.4, H, H + 2.2, oz);
    opening('z', 1.8, 3.31, H + 0.9, H + 2.285, oz);
    opening('x', ogZ - 0.9, ogZ + 0.36, H + 0.9, H + 2.285, rz);

    // markierte Wand: EG vorne, wie im Programm orange hinterlegt
    const wallGeo = new THREE.BoxGeometry(W + 0.04, H + 0.04, T);
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.26, depthWrite: false }));
    wall.position.set(0, H / 2, d / 2 - T / 2 + 0.03);
    selection.add(wall);
    const wl = boxEdges(wallGeo, amberLine); wl.position.copy(wall.position); selection.add(wl);
    // violettes Gummiband am Wandfuß
    const bandG = new LineSegmentsGeometry().setPositions([-W / 2, 0.02, d / 2 + 0.06, W / 2, 0.02, d / 2 + 0.06]);
    selection.add(new LineSegments2(bandG, bandLine));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshBasicMaterial({ color: C.band }));
    knob.position.set(W / 2 - 1.0, 0.04, d / 2 + 0.06);
    selection.add(knob);

    anchors = Object.assign(anchors, {
      wall: new THREE.Vector3(-W * 0.2, H * 0.72, d / 2),
      knob: knob.position.clone(),
      pipe: new THREE.Vector3(W / 2 + 0.14, H * 1.45, pipeZ[0]),
      pipe2: new THREE.Vector3(W / 2 + 0.16, top + rh - 0.3, pipeZ[1]),
      roof: new THREE.Vector3(dA[0], top + 0.15, dA[1]),
      drain: new THREE.Vector3(dB[0], top + 0.15, dB[1]),
      deck: new THREE.Vector3(-W * 0.15, H + 0.08, d / 2 - SETBACK / 2),
      cant: new THREE.Vector3(-W / 2 - CANT / 2, H, ogZ + ogD * 0.25),
      base: new THREE.Vector3(W / 2 + 0.05, -0.15, d / 2 - 0.4),
      ground: new THREE.Vector3(ogX - ogW / 2 - 1.6, -0.12, d / 2 + 1.8),
      top: new THREE.Vector3(ogX, top + rh, ogZ),
    });
  }

  // Beispielrechnung, unverbindlich (Referenzwerte nur zur Veranschaulichung)
  function stats(d = depth) {
    const ogD = d - SETBACK;
    const lenEG = 2 * (W + d), lenOG = 2 * (W + CANT + ogD);
    const big = 2.01 * 1.385 + 1.5 * 1.385 + 1.135 * 2.135 + 3.0 * 2.2 + 1.51 * 1.385; // > 2,5 m² nach VOB abgezogen (vereinfacht)
    const awVol = ((lenEG + lenOG) * H - big) * 0.175;   // Gasbeton 17,5
    const wdvs = (lenEG + lenOG) * H - big;              // Dämmung WDVS, Fläche
    const sohle = (W + 0.1) * (d + 0.1);
    const decken = W * d + (W + CANT) * ogD;
    const terrasse = (W - 0.5) * (SETBACK - 0.25);
    const dach = (W + CANT - 0.5) * (ogD - 0.5);
    const rohbau = awVol * 265 + sohle * 0.22 * 330 + decken * 0.22 * 360 + lenEG * 0.8 * 0.3 * 300;
    const fassade = wdvs * 118;
    const terr = terrasse * 245;
    const dachK = dach * 168 + 2 * 640;                   // Gefälledämmung, Abdichtung, Fallrohre
    const oeff = 8, laib = 31.4;
    const baustelle = 6400 + sohle * 38;                  // Baustelleneinrichtung und Erdarbeiten
    const sum = rohbau + fassade + terr + dachK + baustelle;
    return { depth: d, lenEG, awVol, wdvs, sohle, decken, terrasse, dach, oeff, laib, baustelle, rohbau, fassade, terr, dachK, sum };
  }

  build();

  // ---------- Nordpfeil auf dem Gelände ----------
  const north = new THREE.Group();
  {
    const cx = -W / 2 - CANT - 2.6, cz = depth / 2 + 1.2, r = 0.9, yy = -0.11;
    const pos = [];
    for (let i = 0; i < 48; i++) {
      const a = i / 48 * Math.PI * 2, b = (i + 1) / 48 * Math.PI * 2;
      pos.push(cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r, cx + Math.cos(b) * r, yy, cz + Math.sin(b) * r);
    }
    pos.push(cx, yy, cz + r, cx, yy, cz - r * 1.5);
    north.add(new LineSegments2(new LineSegmentsGeometry().setPositions(pos), northLine));
    const tri = new THREE.Shape();
    tri.moveTo(0, r * 1.75); tri.lineTo(-0.32, r * 0.95); tri.lineTo(0.32, r * 0.95); tri.closePath();
    const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshBasicMaterial({ color: 0xe7e5de }));
    tm.rotation.x = -Math.PI / 2; tm.position.set(cx, yy + 0.005, cz);
    north.add(tm);
    anchors.north = new THREE.Vector3(cx, yy, cz - r * 1.9);
  }
  scene.add(north);

  // ---------- Sonne ----------
  // Norden = -z, Osten = +x, Süden = +z
  const sunState = { day: 172, decl: declination(172), clock: 9.5, dst: true };
  function solarHour(clock, dst) { return clock - (dst ? 2 : 1) + LON / 15; }
  function sunDir(solar, decl) {
    const h = (solar - 12) * 15 * Math.PI / 180;
    const sinE = Math.sin(LAT) * Math.sin(decl) + Math.cos(LAT) * Math.cos(decl) * Math.cos(h);
    const e = Math.asin(sinE);
    const A = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(LAT) - Math.tan(decl) * Math.cos(LAT)) + Math.PI;
    return { v: new THREE.Vector3(Math.sin(A) * Math.cos(e), Math.sin(e), -Math.cos(A) * Math.cos(e)), elev: e, azim: A };
  }
  // Sonnenauf- und -untergang als Uhrzeit
  function daylight(decl, dst) {
    const c = -Math.tan(LAT) * Math.tan(decl);
    const h0 = Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI / 15;
    const noon = 12 + (dst ? 2 : 1) - LON / 15;
    return { rise: noon - h0, set: noon + h0, noon };
  }
  const sunGroup = new THREE.Group();
  const arc = new LineSegments2(new LineSegmentsGeometry(), arcLine);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16), new THREE.MeshBasicMaterial({ color: 0xf6c45a }));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 16), new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.18, depthWrite: false }));
  sunGroup.add(arc, ball, halo);
  scene.add(sunGroup);

  function rebuildArc() {
    const pts = [];
    for (let t = 0; t <= 24; t += 0.1) {
      const s = sunDir(t, sunState.decl).v;
      if (s.y < -0.02) continue;
      pts.push(s.multiplyScalar(SUN_R));
    }
    const pos = [];
    for (let i = 0; i < pts.length - 1; i += 2) { const p = pts[i], q = pts[i + 1]; pos.push(p.x, p.y, p.z, q.x, q.y, q.z); }
    arc.geometry.dispose();
    arc.geometry = new LineSegmentsGeometry().setPositions(pos);
  }
  function updateSun() {
    const s = sunDir(solarHour(sunState.clock, sunState.dst), sunState.decl);
    const up = Math.max(0, Math.sin(s.elev));
    sun.position.copy(s.v).multiplyScalar(40);
    sun.intensity = s.elev > 0 ? 0.9 + 1.4 * Math.min(1, up * 2.2) : 0;
    // tiefe Sonne wärmer
    sun.color.setHSL(0.11, 0.55 + 0.35 * (1 - Math.min(1, up * 2.5)), 0.86 - 0.12 * (1 - Math.min(1, up * 2.5)));
    ball.position.copy(s.v).multiplyScalar(SUN_R);
    halo.position.copy(ball.position);
    anchors.sun = ball.position.clone();
    sunState.elev = s.elev; sunState.azim = s.azim;
  }
  rebuildArc();
  updateSun();

  function setSun(clock, date) {
    if (date) {
      const doy = Math.round((Date.UTC(2026, date.m - 1, date.d) - Date.UTC(2026, 0, 0)) / 864e5);
      sunState.day = doy;
      sunState.decl = declination(doy);
      sunState.dst = date.dst;
      rebuildArc();
    }
    const dl = daylight(sunState.decl, sunState.dst);
    if (clock != null) sunState.clock = Math.min(dl.set - 0.15, Math.max(dl.rise + 0.15, clock));
    updateSun();
    return sunInfo();
  }
  function sunInfo() {
    const dl = daylight(sunState.decl, sunState.dst);
    return {
      clock: sunState.clock, dst: sunState.dst,
      elevation: sunState.elev * 180 / Math.PI,
      azimuth: sunState.azim * 180 / Math.PI,
      rise: dl.rise, set: dl.set,
    };
  }

  // ---------- Kamera und Einstellungen je Seite ----------
  const target = new THREE.Vector3(0.6, 1.2, 0);
  const base = { az: 0.66, el: 0.46, dist: 62, shiftX: 0.15, shiftY: 0, spin: 0.12 };
  const cur = Object.assign({}, base, opts.view || {});
  let from = Object.assign({}, cur), to = Object.assign({}, cur), t0 = 0, dur = 0;
  let view = Object.assign({ sun: true, sel: true, north: false, drag: 'wall' }, opts.view || {});
  let parX = 0, parY = 0, spinPhase = 0;

  function applyVisibility() {
    sunGroup.visible = !!view.sun;
    selection.visible = !!view.sel;
    north.visible = !!view.north;
    canvas.style.cursor = view.drag === 'none' ? 'default' : 'grab';
  }
  applyVisibility();

  function setView(v, ms = 1100) {
    view = Object.assign({ sun: true, sel: true, north: false, drag: 'wall' }, v);
    from = Object.assign({}, cur);
    to = Object.assign({}, base, v);
    // kürzester Weg um das Haus
    while (to.az - from.az > Math.PI) to.az -= 2 * Math.PI;
    while (from.az - to.az > Math.PI) to.az += 2 * Math.PI;
    t0 = performance.now();
    spinPhase = 0;
    dur = opts.still ? 0 : ms;
    if (!dur) Object.assign(cur, to);
    applyVisibility();
    resize();
  }

  function placeCamera() {
    const a = cur.az + parX * 0.08, e = Math.min(1.5, cur.el + parY * 0.04);
    camera.position.set(
      target.x + cur.dist * Math.cos(e) * Math.sin(a),
      target.y + cur.dist * Math.sin(e),
      target.z + cur.dist * Math.cos(e) * Math.cos(a)
    );
    camera.lookAt(target);
  }

  let cw = 0, ch = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (w !== cw || h !== ch) {
      renderer.setSize(w, h, false);
      lineMats.forEach(m => m.resolution.set(w, h));
      cw = w; ch = h;
    }
    camera.aspect = w / h;
    camera.setViewOffset(w, h, -w * cur.shiftX, -h * cur.shiftY, w, h);
    camera.updateProjectionMatrix();
  }

  const pv = new THREE.Vector3();
  function project(p) {
    pv.copy(p).project(camera);
    return { x: (pv.x * 0.5 + 0.5) * cw, y: (-pv.y * 0.5 + 0.5) * ch, behind: pv.z > 1 };
  }

  // ---------- Ziehen: Wand verschieben oder Sonne durch den Tag führen ----------
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    if (view.drag === 'none') return;
    drag = { x: e.clientX, d: depth, c: sunState.clock };
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    parX = ((e.clientX - r.left) / r.width - 0.5);
    parY = ((e.clientY - r.top) / r.height - 0.5);
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (view.drag === 'wall') {
      const nd = Math.round(Math.min(10.5, Math.max(6.5, drag.d + dx / 90)) * 20) / 20;
      if (nd !== depth) { depth = nd; build(); fireChange(); }
    } else if (view.drag === 'sun') {
      setSun(drag.c + dx / 70);
      opts.onSun && opts.onSun(sunInfo());
    }
  });
  const end = () => { drag = null; canvas.style.cursor = view.drag === 'none' ? 'default' : 'grab'; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!drag) { parX = 0; parY = 0; } });

  function fireChange() { opts.onChange && opts.onChange(stats(), stats(opts.baseDepth ?? 8)); }
  function setDepth(d) { depth = Math.min(10.5, Math.max(6.5, d)); build(); fireChange(); }

  window.addEventListener('resize', resize);
  resize();
  fireChange();

  // ---------- Zeichnen ----------
  let active = true, raf = 0, last = performance.now();
  function frame(t) {
    raf = 0;
    if (!active) return;
    const dt = Math.min(64, t - last); last = t;
    if (dur) {
      const k = Math.min(1, (t - t0) / dur), q = ease(k);
      for (const key of ['az', 'el', 'dist', 'shiftX', 'shiftY']) cur[key] = lerp(from[key], to[key], q);
      if (k >= 1) dur = 0;
      resize();
    }
    if (!opts.still) {
      if (view.rotate) cur.az += view.rotate * dt / 1000;
      else if (!dur && to.spin) { spinPhase += dt / 9000; cur.az = to.az + Math.sin(spinPhase) * to.spin; }
    }
    placeCamera();
    renderer.render(scene, camera);
    if (opts.onFrame) {
      const out = {};
      for (const k in anchors) out[k] = project(anchors[k]);
      opts.onFrame(out);
    }
    raf = requestAnimationFrame(frame);
  }
  function setActive(on) {
    if (on === active) return;
    active = on;
    if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  raf = requestAnimationFrame(frame);

  return { stats, setView, setSun, sunInfo, setActive, setDepth, resize };
}
