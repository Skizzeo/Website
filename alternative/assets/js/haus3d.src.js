// Skizzeo Alternative · Konzept A
// Echtzeit-Massenmodell im Skizzen-Look des Programms: altweiße Flächen, schwarze Kanten,
// dunkel-olivgrüner Boden. Die markierte Außenwand lässt sich ziehen; Mengen und Kosten
// der Beispielrechnung laufen mit.
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const C = {
  face: 0xe4dfcf,
  faceDark: 0xcfc9b6,
  edge: 0x0d0f10,
  ground: '#3b4236',
  amber: 0xf2b33d,
  band: 0x8f63f0,
};

// Maße in Metern, orientiert an den Beispielen im Übergabepaket
const W = 10.0;         // Breite
const H = 2.855;        // Geschosshöhe
const T = 0.315;        // Wanddicke AW 31,5
const SETBACK = 2.2;    // Rücksprung OG vorne -> Dachterrasse
const CANT = 1.1;       // Vorsprung OG rechts

function boxEdges(geo, lineMat) {
  const e = new THREE.EdgesGeometry(geo, 20);
  const g = new LineSegmentsGeometry().fromEdgesGeometry(e);
  return new LineSegments2(g, lineMat);
}

export function init(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 400);

  const lineMat = new LineMaterial({ color: C.edge, linewidth: 2 });
  const amberLine = new LineMaterial({ color: C.amber, linewidth: 2.6, transparent: true, opacity: 0.95 });
  const bandLine = new LineMaterial({ color: C.band, linewidth: 4 });
  const lineMats = [lineMat, amberLine, bandLine];

  // Licht
  scene.add(new THREE.HemisphereLight(0xf4f1e6, 0x2c3328, 1.55));
  const sun = new THREE.DirectionalLight(0xfff3dc, 2.1);
  sun.position.set(-14, 22, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
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
  ground.position.y = -0.22;
  ground.receiveShadow = true;
  scene.add(ground);
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.38 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.215;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  const faceMat = new THREE.MeshLambertMaterial({ color: C.face });
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0x7d806f });
  const deckMat = new THREE.MeshLambertMaterial({ color: 0xbdb7a4 });
  const house = new THREE.Group();
  scene.add(house);

  let depth = opts.depth ?? 8.0;
  const selection = new THREE.Group();
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

  function build() {
    house.clear();
    selection.clear();
    const d = depth;
    // Gründung: Sohlplatte mit Sockelrücksprung
    solid(W + 0.1, 0.22, d + 0.1, 0, -0.11, 0, plinthMat);
    // EG als Massenkörper
    solid(W, H, d, 0, H / 2, 0);
    // Decke über EG (leicht dunkler, weil Dachterrasse)
    const ogD = d - SETBACK;
    const ogZ = -SETBACK / 2;
    // Dachterrassenbelag auf dem Rücksprung
    solid(W - 2 * 0.25, 0.06, SETBACK - 0.25, 0, H + 0.03, d / 2 - (SETBACK - 0.25) / 2 - 0.25, deckMat, false);
    // Attika um die Dachterrasse
    const at = 0.22, ah = 0.42;
    solid(W, ah, at, 0, H + ah / 2, d / 2 - at / 2);
    solid(at, ah, SETBACK, -W / 2 + at / 2, H + ah / 2, d / 2 - SETBACK / 2);
    solid(at, ah, SETBACK, W / 2 - at / 2, H + ah / 2, d / 2 - SETBACK / 2);
    // OG zurückgesetzt nach vorne, vorspringend nach rechts
    solid(W + CANT, H, ogD, CANT / 2, H + H / 2, ogZ);
    // Attika OG (Flachdach-Abschluss)
    solid(W + CANT, 0.3, ogD, CANT / 2, 2 * H + 0.15, ogZ);

    // markierte Wand: EG vorne (bewegliche Wand), wie im Programm orange hinterlegt
    const wallGeo = new THREE.BoxGeometry(W + 0.04, H + 0.04, T);
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.28, depthWrite: false }));
    wall.position.set(0, H / 2, d / 2 - T / 2 + 0.02);
    selection.add(wall);
    const wl = boxEdges(wallGeo, amberLine); wl.position.copy(wall.position); selection.add(wl);
    // violettes Gummiband am Wandfuß
    const bandG = new LineSegmentsGeometry().setPositions([-W / 2, 0.02, d / 2 + 0.06, W / 2, 0.02, d / 2 + 0.06]);
    selection.add(new LineSegments2(bandG, bandLine));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshBasicMaterial({ color: C.band }));
    knob.position.set(W / 2 - 1.6, 0.04, d / 2 + 0.06);
    selection.add(knob);
    scene.add(selection);

    anchors = {
      wall: new THREE.Vector3(W * 0.12, H * 0.45, d / 2),
      knob: knob.position.clone(),
      terrace: new THREE.Vector3(-W * 0.18, H + 0.08, d / 2 - SETBACK * 0.55),
      og: new THREE.Vector3(W / 2 + CANT, H * 1.6, ogZ + ogD / 2),
    };
  }

  // Beispielrechnung, unverbindlich (Referenzwerte nur zur Veranschaulichung)
  function stats(d = depth) {
    const ogD = d - SETBACK;
    const lenEG = 2 * (W + d), lenOG = 2 * (W + CANT + ogD);
    const awVol = (lenEG + lenOG) * H * 0.175;          // Gasbeton 17,5
    const wdvs = (lenEG + lenOG) * H;                    // Dämmung WDVS, Fläche
    const sohle = (W + 0.1) * (d + 0.1);
    const decken = W * d + (W + CANT) * ogD;
    const terrasse = (W - 0.5) * (SETBACK - 0.25);
    const rohbau = awVol * 265 + sohle * 0.22 * 330 + decken * 0.22 * 360 + lenEG * 0.8 * 0.3 * 300;
    const fassade = wdvs * 118;
    const terr = terrasse * 245;
    const sum = rohbau + fassade + terr;
    return { depth: d, lenEG, awVol, wdvs, sohle, decken, terrasse, rohbau, fassade, terr, sum };
  }

  build();

  // Kamera
  const target = new THREE.Vector3(0.6, 1.2, 0);
  let az = opts.azimuth ?? 0.62, el = opts.elevation ?? 0.36, dist = opts.distance ?? 36;
  let parX = 0, parY = 0;
  function placeCamera() {
    const a = az + parX * 0.08, e = el + parY * 0.04;
    camera.position.set(
      target.x + dist * Math.cos(e) * Math.sin(a),
      target.y + dist * Math.sin(e),
      target.z + dist * Math.cos(e) * Math.cos(a)
    );
    camera.lookAt(target);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Haus in die rechte Bildhälfte schieben
    const shift = opts.shiftX ?? 0;
    camera.setViewOffset(w, h, -w * shift, 0, w, h);
    camera.updateProjectionMatrix();
    lineMats.forEach(m => m.resolution.set(w, h));
  }

  const v = new THREE.Vector3();
  function project(p) {
    v.copy(p).project(camera);
    return { x: (v.x * 0.5 + 0.5) * canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * canvas.clientHeight };
  }

  // Ziehen: Wand nach vorn oder hinten verschieben (Haustiefe 6,5 bis 10,5 m)
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, d: depth }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    parX = ((e.clientX - r.left) / r.width - 0.5);
    parY = ((e.clientY - r.top) / r.height - 0.5);
    if (!drag) return;
    const nd = Math.round(Math.min(10.5, Math.max(6.5, drag.d + (e.clientX - drag.x) / 90)) * 20) / 20;
    if (nd !== depth) { depth = nd; build(); opts.onChange && opts.onChange(stats(), stats(opts.baseDepth ?? 8)); }
  });
  const end = () => { drag = null; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  window.addEventListener('resize', resize);
  resize();
  opts.onChange && opts.onChange(stats(), stats(opts.baseDepth ?? 8));

  let t0 = performance.now();
  function frame(t) {
    if (!opts.still) az = (opts.azimuth ?? 0.62) + Math.sin((t - t0) / 9000) * 0.12;
    placeCamera();
    renderer.render(scene, camera);
    if (opts.onFrame) {
      const out = {};
      for (const k in anchors) out[k] = project(anchors[k]);
      opts.onFrame(out);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { stats };
}
