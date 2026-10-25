// 3D figures for the umbrella-inversion post (hydronium OH3+ and phosphine PH3, free and inside C60).
// Loaded lazily by inversion-3d.js; needs window.INV from inversion-common.js.
//
//   #inv-umbrella  one molecule flipping through the planar transition state
//   #inv-cage      the guest inside a C60 cage, with the live closest H...C distance
//   #inv-c60       the cage alone: 60 atoms, 12 pentagons, 20 hexagons
//
// What is data: equilibrium bond lengths and angles (INV.GEOMETRY, B97D/aug-cc-pVTZ), the C60 geometry
// (a regular truncated icosahedron scaled to the real cage radius), van der Waals radii (Bondi).
// What is illustration: the inversion path. The X-H bond length is held at its equilibrium value while the central
// atom moves through the H3 plane; the true minimum-energy path also relaxes the bond lengths slightly. The orientation of
// the guest in the cage, and the lone-pair lobes, are schematic.
import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";

const INV = window.INV;
if (!INV) throw new Error("inversion-common.js must be loaded first");

/* ------------------------------------------------------------------ constants */

const MASS = { O: 15.999, P: 30.974, H: 1.008 };
const VDW = { C: 1.7, H: 1.1, O: 1.52, P: 1.8 }; // Bondi radii, angstrom
const GUESTS = {
  oh: { X: "O", label: "OH₃⁺", free: "oh", caged: "ohC60", name: "hydronium" },
  ph: { X: "P", label: "PH₃", free: "ph", caged: "phC60", name: "phosphine" },
};
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const el = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(kids)) if (c) n.append(c);
  return n;
};
const fmt = (v, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace("-", "−");
const signed = (v, d = 2) => (v > 0.5 * 10 ** -d ? "+" : "") + fmt(v, d);

/* ------------------------------------------------------------------ C60 geometry */

const PHI = (1 + Math.sqrt(5)) / 2;
let CAGE = null;
function cageData() {
  if (CAGE) return CAGE;
  const raw = [];
  const seen = new Set();
  const add = (x, y, z) => {
    const k = [x, y, z].map((v) => v.toFixed(4)).join(",");
    if (seen.has(k)) return;
    seen.add(k);
    raw.push([x, y, z]);
  };
  const base = [
    [0, 1, 3 * PHI],
    [1, 2 + PHI, 2 * PHI],
    [PHI, 2, PHI ** 3],
  ];
  for (const [a, b, c] of base) {
    for (const sa of a === 0 ? [1] : [1, -1])
      for (const sb of [1, -1])
        for (const sc of [1, -1]) {
          const v = [a * sa, b * sb, c * sc];
          add(v[0], v[1], v[2]);
          add(v[1], v[2], v[0]);
          add(v[2], v[0], v[1]);
        }
  }
  // Edge length of these coordinates is 2; 0.7165 gives C-C = 1.433 A and a cage radius of 3.55 A.
  const scale = 0.7165;
  let atoms = raw.map((p) => new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale));
  const bonds = [];
  for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) if (atoms[i].distanceTo(atoms[j]) < 1.6) bonds.push([i, j]);
  const nbr = atoms.map(() => []);
  bonds.forEach(([i, j]) => (nbr[i].push(j), nbr[j].push(i)));
  // Faces are the 5- and 6-cycles of the bond graph (a truncated icosahedron has no other short cycles).
  const faces = { 5: [], 6: [] };
  const keys = new Set();
  const walk = (path) => {
    const last = path[path.length - 1];
    if (path.length >= 5 && nbr[last].includes(path[0]) && (path.length === 5 || path.length === 6)) {
      const key = [...path].sort((a, b) => a - b).join("-");
      if (!keys.has(key)) (keys.add(key), faces[path.length].push([...path]));
    }
    if (path.length === 6) return;
    for (const n of nbr[last]) if (!path.includes(n) && n > path[0]) walk([...path, n]);
  };
  atoms.forEach((_, i) => walk([i]));
  // Orient the cage so a three-fold axis (through a hexagon centre) is vertical, matching the C3v guest axis.
  const hexC = new THREE.Vector3();
  faces[6][0].forEach((i) => hexC.add(atoms[i]));
  hexC.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(hexC, new THREE.Vector3(0, 1, 0));
  atoms = atoms.map((a) => a.applyQuaternion(q));
  const centre = (f) => f.reduce((s, i) => s.add(atoms[i]), new THREE.Vector3()).multiplyScalar(1 / f.length);
  // Order each face's vertices round its centre so a triangle fan fills it.
  const order = (f) => {
    const c = centre(f).normalize();
    const u = atoms[f[0]]
      .clone()
      .sub(c.clone().multiplyScalar(atoms[f[0]].dot(c)))
      .normalize();
    const w = c.clone().cross(u);
    return [...f].sort((a, b) => {
      const ang = (i) => Math.atan2(atoms[i].dot(w), atoms[i].dot(u));
      return ang(a) - ang(b);
    });
  };
  faces[5] = faces[5].map(order);
  faces[6] = faces[6].map(order);
  const radius = atoms.reduce((s, a) => s + a.length(), 0) / atoms.length;
  const cc = bonds.reduce((s, [i, j]) => s + atoms[i].distanceTo(atoms[j]), 0) / bonds.length;
  CAGE = { atoms, bonds, faces, radius, cc };
  return CAGE;
}

/* ------------------------------------------------------------------ guest geometry */

// Pose of an AB3 pyramid for the schematic inversion coordinate s in [-1, 1]:
// the central atom sits at s * h_eq above the H3 plane; the H atoms stay on a circle whose radius
// follows from keeping the X-H bond length r fixed (so the H3 circle opens to radius r at s = 0).
// anchor "plane": the H3 plane stays at y = 0; "com": the centre of mass stays at the origin.
function guestPose(key, s, anchor) {
  const g = INV.GEOMETRY[key];
  const X = key.startsWith("oh") ? "O" : "P";
  const h = INV.pyramidHeight(g.r, g.angle);
  const x = s * h;
  const R = Math.sqrt(Math.max(0, g.r * g.r - x * x));
  let shift = 0;
  if (anchor === "com") shift = -(MASS[X] * x) / (MASS[X] + 3 * MASS.H);
  const H = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i * TAU) / 3;
    return new THREE.Vector3(R * Math.cos(a), shift, R * Math.sin(a));
  });
  const apex = new THREE.Vector3(0, x + shift, 0);
  const hh = R * Math.sqrt(3);
  const angle = (2 * Math.asin(clamp(hh / (2 * g.r), 0, 1)) * 180) / Math.PI;
  return { X: apex, H, height: x, planeY: shift, angle, R, r: g.r, h, sym: X };
}

/* ------------------------------------------------------------------ theme palette */

function palette() {
  const col = (name, fb) => {
    const c = new THREE.Color();
    try {
      c.setStyle(INV.cssVar(name) || fb);
    } catch (e) {
      c.setStyle(fb);
    }
    return c;
  };
  const dark = INV.isDark();
  return {
    dark,
    O: col("--inv-atom-o", "#e0473c"),
    P: col("--inv-atom-p", "#f08a24"),
    H: col("--inv-atom-h", "#eef0f2"),
    C: col("--inv-atom-c", "#4b5058"),
    accent: col("--inv-accent", "#b509ac"),
    free: col("--inv-free", "#4a6fa5"),
    hVdw: new THREE.Color(dark ? "#f2f5fa" : "#fafbfd"),
    plane: new THREE.Color(dark ? "#9db6d8" : "#4a6fa5"),
  };
}

/* ------------------------------------------------------------------ stage (renderer, camera, loop) */

function createStage(root, opts) {
  const wrap = el("div", { class: "inv-3d-stage" });
  const canvas = el("canvas", { class: "inv-3d-canvas", role: "img", tabindex: "0" });
  wrap.append(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  const dir = (opts.dir || new THREE.Vector3(0.55, 0.38, 1)).clone().normalize();
  camera.position.copy(dir).multiplyScalar(12);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd0ff, 0.5);
  fill.position.set(-4, -2, -3);
  scene.add(fill);

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.8;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;
  canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page

  const stage = {
    wrap,
    canvas,
    renderer,
    scene,
    camera,
    controls,
    radius: opts.radius || 3,
    visible: true,
    raf: 0,
    last: 0,
    autoRotate: !INV.reduceMotion,
    autoUntil: 0,
    idleTimer: 0,
    onFrame: null, // (dt) => void, called before each render
    isBusy: () => false, // extra animation that needs a continuous loop
    onRender: null,
    dead: false,
  };
  const armAuto = () => {
    stage.autoUntil = performance.now() + 30000; // spin for at most 30 s, then rest until touched again
  };
  armAuto();
  controls.autoRotateSpeed = opts.spin ?? 1.6;

  stage.fit = () => {
    const w = wrap.clientWidth || 300;
    const hgt = wrap.clientHeight || 300;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    const vf = (camera.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const dist = (stage.radius * 1.12) / Math.sin(Math.min(vf, hf) / 2);
    const d = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(d, dist);
    camera.near = dist * 0.1;
    camera.far = dist * 4;
    camera.updateProjectionMatrix();
    stage.invalidate();
  };
  const spinning = () => stage.autoRotate && !INV.reduceMotion && performance.now() < stage.autoUntil;
  const frame = (now) => {
    stage.raf = 0;
    if (stage.dead) return;
    const dt = Math.min(0.1, stage.last ? (now - stage.last) / 1000 : 0.016);
    stage.last = now;
    controls.autoRotate = spinning();
    controls.update(dt);
    if (stage.onFrame) stage.onFrame(dt);
    if (stage.onRender) stage.onRender();
    renderer.render(scene, camera);
    if (stage.visible && !document.hidden && (controls.autoRotate || stage.isBusy())) stage.raf = requestAnimationFrame(frame);
    else stage.last = 0;
  };
  stage.invalidate = () => {
    if (!stage.raf && !stage.dead && stage.visible && !document.hidden) stage.raf = requestAnimationFrame(frame);
  };
  controls.addEventListener("change", stage.invalidate);
  controls.addEventListener("start", () => {
    stage.autoRotate = false;
    clearTimeout(stage.idleTimer);
    wrap.classList.add("is-touched");
  });
  controls.addEventListener("end", () => {
    clearTimeout(stage.idleTimer);
    stage.idleTimer = setTimeout(() => {
      stage.autoRotate = !INV.reduceMotion;
      armAuto();
      stage.invalidate();
    }, 4000);
  });
  const ro = new ResizeObserver(() => stage.fit());
  ro.observe(wrap);
  INV.watchVisibility(wrap, (v) => {
    stage.visible = v;
    if (v) stage.invalidate();
  });
  const onVis = () => !document.hidden && stage.invalidate();
  document.addEventListener("visibilitychange", onVis);
  canvas.addEventListener("webglcontextlost", (e) => e.preventDefault());
  canvas.addEventListener("webglcontextrestored", stage.invalidate);
  INV.onThemeChange(() => stage.onTheme && stage.onTheme());

  stage.dispose = () => {
    stage.dead = true;
    cancelAnimationFrame(stage.raf);
    clearTimeout(stage.idleTimer);
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    controls.dispose();
    scene.traverse((o) => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      const m = o.material;
      if (m) [].concat(m).forEach((x) => !x.userData.shared && x.dispose());
    });
    renderer.dispose();
    renderer.forceContextLoss();
  };
  return stage;
}

/* ------------------------------------------------------------------ shared geometry */

const shared = {};
const sharedGeo = (name, make) => {
  if (!shared[name]) {
    shared[name] = make();
    shared[name].userData.shared = true;
  }
  return shared[name];
};
const sphereGeo = () => sharedGeo("sphere", () => new THREE.SphereGeometry(1, 40, 28));
const lowSphereGeo = () => sharedGeo("lowSphere", () => new THREE.SphereGeometry(1, 20, 14));
const stickGeo = () => sharedGeo("stick", () => new THREE.CylinderGeometry(1, 1, 1, 14, 1, true));
const lobeGeo = () =>
  sharedGeo("lobe", () => {
    // Teardrop: a point at the nucleus, swelling to a round far end (axis +y, length 1, max radius 0.5).
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      pts.push(new THREE.Vector2(Math.max(0, 0.5 * Math.sin(Math.PI * Math.pow(t, 1.5)) * 1.12), t));
    }
    return new THREE.LatheGeometry(pts, 36);
  });

const Y = new THREE.Vector3(0, 1, 0);
const placeStick = (mesh, a, b, radius) => {
  const d = b.clone().sub(a);
  const len = d.length();
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(Y, d.divideScalar(len || 1));
  mesh.scale.set(radius, len, radius);
};

const stdMat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.02, ...extra });

/* ------------------------------------------------------------------ the guest molecule (ball and stick) */

function buildGuest(parent, o = {}) {
  const k = o.scale || 1;
  const g = new THREE.Group();
  parent.add(g);
  const mats = {
    X: stdMat(0xffffff),
    H: stdMat(0xffffff),
    bondX: stdMat(0xffffff),
    bondH: stdMat(0xffffff),
    vdw: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    vdwX: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    plane: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
    tri: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }),
    lobe: new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.4, roughness: 0.5, depthWrite: false, side: THREE.DoubleSide }),
  };
  const rX = 0.4 * k;
  const rH = 0.25 * k;
  const rB = 0.075 * k;
  const X = new THREE.Mesh(sphereGeo(), mats.X);
  g.add(X);
  const Hs = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(sphereGeo(), mats.H);
    g.add(m);
    return m;
  });
  const sticks = [0, 1, 2].map(() => {
    const a = new THREE.Mesh(stickGeo(), mats.bondX);
    const b = new THREE.Mesh(stickGeo(), mats.bondH);
    g.add(a, b);
    return [a, b];
  });
  const vdwH = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(lowSphereGeo(), mats.vdw);
    m.visible = false;
    m.renderOrder = 3;
    g.add(m);
    return m;
  });
  const vdwX = new THREE.Mesh(lowSphereGeo(), mats.vdwX);
  vdwX.visible = false;
  g.add(vdwX);
  let disc = null;
  let tri = null;
  let lobes = null;
  if (o.plane) {
    disc = new THREE.Mesh(
      sharedGeo("disc", () => new THREE.CircleGeometry(1, 72).rotateX(-Math.PI / 2)),
      mats.plane
    );
    disc.renderOrder = 1;
    g.add(disc);
    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
    tri = new THREE.LineLoop(triGeo, mats.tri);
    g.add(tri);
  }
  if (o.lobes) {
    lobes = [0, 1].map((i) => {
      const m = new THREE.Mesh(lobeGeo(), mats.lobe);
      m.renderOrder = 2;
      if (i === 1) m.rotation.x = Math.PI;
      g.add(m);
      return m;
    });
  }
  const api = {
    group: g,
    mats,
    showVdw: false,
    pose: null,
    lobeInfo: null,
    setColors(p, sym) {
      mats.X.color.copy(sym === "O" ? p.O : p.P);
      mats.H.color.copy(p.H);
      mats.bondX.color.copy(sym === "O" ? p.O : p.P);
      mats.bondH.color.copy(p.H).lerp(p.dark ? p.C : new THREE.Color(0x9aa0aa), 0.25);
      mats.vdw.color.copy(p.hVdw);
      mats.vdwX.color.copy(sym === "O" ? p.O : p.P);
      mats.plane.color.copy(p.plane);
      mats.tri.color.copy(p.plane);
      mats.lobe.color.copy(sym === "O" ? p.O : p.P);
      mats.lobe.emissive = mats.lobe.color.clone().multiplyScalar(0.25);
    },
    update(pose) {
      api.pose = pose;
      X.position.copy(pose.X);
      X.visible = !api.showVdw;
      vdwX.visible = api.showVdw;
      vdwX.position.copy(pose.X);
      vdwX.scale.setScalar(VDW[pose.sym]);
      X.scale.setScalar(rX * (pose.sym === "P" ? 1.3 : 1));
      pose.H.forEach((h, i) => {
        Hs[i].position.copy(h);
        Hs[i].visible = !api.showVdw;
        sticks[i].forEach((m) => (m.visible = !api.showVdw));
        Hs[i].scale.setScalar(rH);
        vdwH[i].position.copy(h);
        vdwH[i].scale.setScalar(VDW.H);
        vdwH[i].visible = api.showVdw;
        const mid = pose.X.clone().lerp(h, 0.5);
        placeStick(sticks[i][0], pose.X, mid, rB);
        placeStick(sticks[i][1], mid, h, rB);
      });
      if (disc) {
        disc.position.set(0, pose.planeY, 0);
        disc.scale.setScalar(pose.r * 1.3);
        const arr = tri.geometry.attributes.position.array;
        pose.H.forEach((h, i) => arr.set([h.x, h.y, h.z], i * 3));
        tri.geometry.attributes.position.needsUpdate = true;
        tri.geometry.computeBoundingSphere();
      }
      if (lobes) {
        // Two lobes with weights that trade places as the umbrella flips: all on one side when pyramidal, equal (a p-like
        // dumbbell) when planar. This is the textbook picture, drawn schematically; it is not a computed orbital.
        const s = pose.height / pose.h;
        const w = [(1 + s) / 2, (1 - s) / 2];
        const len = pose.sym === "O" ? 1.15 : 1.7;
        lobes.forEach((m, i) => {
          const f = Math.pow(clamp(w[i], 0, 1), 0.75);
          m.visible = f > 0.04;
          m.position.copy(pose.X);
          m.scale.set(len * 0.62 * f, len * f, len * 0.62 * f);
        });
        const up = w[0] >= w[1];
        api.lobeInfo = {
          tip: pose.X.clone().add(new THREE.Vector3(0, (up ? 1 : -1) * len * Math.pow(clamp(up ? w[0] : w[1], 0, 1), 0.75) * 0.78, 0)),
          weight: Math.max(w[0], w[1]),
        };
      }
    },
    setLobes(v) {
      if (lobes) lobes.forEach((m) => (m.userData.off = !v));
      api.lobesOn = v;
    },
  };
  return api;
}

/* ------------------------------------------------------------------ the C60 cage */

function buildCage(parent) {
  const { atoms, bonds, faces } = cageData();
  const g = new THREE.Group();
  parent.add(g);
  // Clip plane through the centre, facing away from the camera, to "cut away" the near half. A far constant disables it.
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6);
  const mats = {
    atom: stdMat(0xffffff, { clippingPlanes: [clip], clipShadows: false }),
    bond: stdMat(0xffffff, { clippingPlanes: [clip] }),
    vdw: new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, clippingPlanes: [clip] }),
    vdwBack: new THREE.MeshBasicMaterial({ side: THREE.BackSide, clippingPlanes: [clip] }),
    pent: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [clip] }),
    hex: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [clip] }),
  };
  const dummy = new THREE.Object3D();
  const atomMesh = new THREE.InstancedMesh(lowSphereGeo(), mats.atom, atoms.length);
  const vdwMesh = new THREE.InstancedMesh(sphereGeo(), mats.vdw, atoms.length);
  atoms.forEach((a, i) => {
    dummy.position.copy(a);
    dummy.scale.setScalar(0.13);
    dummy.updateMatrix();
    atomMesh.setMatrixAt(i, dummy.matrix);
    dummy.scale.setScalar(VDW.C);
    dummy.updateMatrix();
    vdwMesh.setMatrixAt(i, dummy.matrix);
  });
  // Cut spheres would look hollow; their inside faces are drawn flat and darker so the cut reads as solid.
  const vdwBack = new THREE.InstancedMesh(sphereGeo(), mats.vdwBack, atoms.length);
  vdwBack.instanceMatrix = vdwMesh.instanceMatrix;
  vdwBack.visible = false;
  vdwMesh.visible = false;
  const bondMesh = new THREE.InstancedMesh(stickGeo(), mats.bond, bonds.length);
  bonds.forEach(([i, j], n) => {
    const tmp = new THREE.Mesh();
    placeStick(tmp, atoms[i], atoms[j], 0.04);
    tmp.updateMatrix();
    bondMesh.setMatrixAt(n, tmp.matrix);
  });
  g.add(bondMesh, atomMesh, vdwMesh, vdwBack);
  const faceMesh = (list, mat) => {
    const pos = [];
    const idx = [];
    list.forEach((f) => {
      const c = f.reduce((s, i) => s.add(atoms[i]), new THREE.Vector3()).multiplyScalar(1 / f.length);
      const base = pos.length / 3;
      // Push the face slightly out to the sphere so the flat polygon sits on the cage, not inside it.
      pos.push(c.x * 1.012, c.y * 1.012, c.z * 1.012);
      f.forEach((i) => pos.push(atoms[i].x * 1.012, atoms[i].y * 1.012, atoms[i].z * 1.012));
      for (let k = 0; k < f.length; k++) idx.push(base, base + 1 + k, base + 1 + ((k + 1) % f.length));
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    m.renderOrder = 2;
    g.add(m);
    return m;
  };
  const pent = faceMesh(faces[5], mats.pent);
  const hex = faceMesh(faces[6], mats.hex);
  const api = {
    group: g,
    mats,
    pent,
    hex,
    atomMesh,
    bondMesh,
    vdwMesh,
    clip,
    setColors(p) {
      mats.atom.color.copy(p.C);
      mats.bond.color.copy(p.C);
      mats.vdw.color.copy(p.C).lerp(new THREE.Color(0xdde2ea), p.dark ? 0.1 : 0.55);
      mats.vdwBack.color.copy(mats.vdw.color).multiplyScalar(p.dark ? 0.7 : 0.72);
      mats.pent.color.copy(p.accent);
      mats.hex.color.copy(p.free);
    },
    setStyle(style) {
      const sf = style === "space";
      vdwMesh.visible = sf;
      vdwBack.visible = sf;
      bondMesh.visible = !sf;
      atomMesh.visible = !sf;
      pent.visible = style === "pent";
    },
    cut(on, camera) {
      if (!on) return void (clip.constant = 1e6);
      const d = camera.position.clone().normalize();
      clip.normal.copy(d).negate();
      clip.constant = 0.35;
    },
  };
  return api;
}

/* ------------------------------------------------------------------ widget chrome */

function toggleGroup(label, options, value, onChange, cls = "") {
  const wrap = el("div", { class: `inv-3d-group ${cls}`, role: "group", "aria-label": label });
  const btns = options.map(([id, text, title]) => {
    const b = el("button", { type: "button", class: "inv-btn", "aria-pressed": String(id === value), html: text, title });
    b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      onChange(id);
    });
    return b;
  });
  wrap.append(el("span", { class: "inv-3d-group-label", text: label }), ...btns);
  return {
    wrap,
    set(id) {
      btns.forEach((x, i) => x.setAttribute("aria-pressed", String(options[i][0] === id)));
    },
  };
}
function toggleButton(html, pressed, onChange, title) {
  const b = el("button", { type: "button", class: "inv-btn", "aria-pressed": String(!!pressed), html, title });
  b.addEventListener("click", () => {
    const v = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(v));
    onChange(v);
  });
  return b;
}
function slider(label, onInput) {
  const id = `inv-s-${Math.random().toString(36).slice(2, 8)}`;
  const input = el("input", { type: "range", id, min: "-100", max: "100", step: "1", value: "-100", "aria-valuetext": "" });
  input.addEventListener("input", () => {
    let v = Number(input.value);
    if (Math.abs(v) <= 3) ((v = 0), (input.value = "0")); // snap onto the planar transition state
    onInput(-v / 100); // left end = the pyramid (s = +1), right end = its mirror image
  });
  const scale = el("div", { class: "inv-3d-scale", "aria-hidden": "true" }, [
    el("span", { text: "pyramid" }),
    el("span", { class: "inv-3d-ts", text: "planar = transition state" }),
    el("span", { text: "inverted pyramid" }),
  ]);
  const wrap = el("div", { class: "inv-3d-slider" }, [
    el("label", { for: id, class: "inv-3d-slider-label", text: label }),
    el("div", { class: "inv-3d-slider-track" }, [input, scale]),
  ]);
  return { wrap, input, scale };
}

// Eased inversion clock: lingers in the wells, sweeps quickly through the flat geometry (a classical-looking flip).
const swing = (phase) => {
  const k = 1.9;
  return Math.tanh(k * Math.cos(phase)) / Math.tanh(k);
};

function fallback(root, what) {
  root.classList.add("inv-3d-root");
  root.replaceChildren(
    el("p", {
      class: "inv-3d-fallback",
      text: `This interactive 3D view needs WebGL, which is not available here. ${what}`,
    })
  );
}

function pageSetup(root, kicker) {
  root.classList.add("inv-3d-root");
  root.replaceChildren();
  const panel = el("div", { class: "inv-3d inv-panel" });
  panel.append(el("div", { class: "inv-kicker", text: kicker }));
  root.append(panel);
  return panel;
}

const labelOf = (key) => INV.POTENTIALS[key].label;

/* ------------------------------------------------------------------ #inv-umbrella */

function mountUmbrella(root) {
  const panel = pageSetup(root, "Interactive 3D");
  const stage = createStage(root, { radius: 1.65, dir: new THREE.Vector3(0.9, 0.42, 1), spin: 1.8 });
  if (!stage)
    return fallback(root, "The flip passes the central atom through the plane of the three hydrogens, like an umbrella turning inside out.");
  const state = { guest: "oh", s: 1, playing: false, phase: 0, lone: true };
  const guest = buildGuest(stage.scene, { plane: true, lobes: true, scale: 1 });
  guest.group.scale.setScalar(1);
  const tag = el("span", { class: "inv-3d-tag", text: "lone pair" });
  stage.wrap.append(tag, el("span", { class: "inv-3d-hint", text: "drag to rotate", "aria-hidden": "true" }));

  const live = el("div", { class: "inv-sr", "aria-live": "polite", role: "status" });
  const readout = el("div", { class: "inv-readout inv-3d-readout" });
  const sl = slider("Umbrella coordinate", (v) => {
    state.playing = false;
    syncPlay();
    state.s = v;
    refresh(true);
  });
  const molToggle = toggleGroup(
    "Molecule",
    [
      ["oh", "OH₃⁺", "Hydronium"],
      ["ph", "PH₃", "Phosphine"],
    ],
    state.guest,
    (v) => {
      state.guest = v;
      stage.radius = v === "oh" ? 1.65 : 2.1;
      applyColors();
      stage.fit();
      refresh(true);
    }
  );
  const play = el("button", { type: "button", class: "inv-btn inv-3d-play", "aria-pressed": "false" });
  const syncPlay = () => {
    play.setAttribute("aria-pressed", String(state.playing));
    play.textContent = state.playing ? "Pause" : "Play";
    play.setAttribute("aria-label", state.playing ? "Pause the inversion" : "Play the inversion");
  };
  syncPlay();
  play.addEventListener("click", () => {
    state.playing = !state.playing;
    if (state.playing) state.phase = Math.acos(clamp(state.s, -1, 1));
    syncPlay();
    stage.invalidate();
  });
  const loneBtn = toggleButton("Lone pair", true, (v) => {
    state.lone = v;
    refresh();
  });
  const legend = el("div", { class: "inv-legend inv-3d-legend" }, [
    el("span", { html: '<i class="inv-3d-dot" data-k="X"></i><b class="inv-3d-xname">O</b> central atom' }),
    el("span", { html: '<i class="inv-3d-dot" data-k="H"></i>H' }),
    el("span", { html: '<i class="inv-3d-disc"></i>plane of the three H atoms' }),
    el("span", { html: '<i class="inv-3d-lobe"></i>lone pair (schematic lobe)' }),
  ]);
  const note = el("p", {
    class: "inv-3d-note",
    text: "Schematic path: the X–H bond length stays fixed while the central atom moves through the H₃ plane.",
  });
  panel.append(
    stage.wrap,
    el("div", { class: "inv-controls inv-3d-controls" }, [molToggle.wrap, loneBtn, play]),
    sl.wrap,
    readout,
    legend,
    note,
    live
  );

  const colorsFor = () => {
    const p = palette();
    guest.setColors(p, GUESTS[state.guest].X);
    const dot = (k) => (k === "X" ? (state.guest === "oh" ? p.O : p.P) : p.H);
    panel.querySelectorAll(".inv-3d-dot").forEach((d) => (d.style.background = `#${dot(d.dataset.k).getHexString()}`));
    panel.querySelector(".inv-3d-xname").textContent = GUESTS[state.guest].X;
  };
  const applyColors = colorsFor;
  stage.onTheme = () => (colorsFor(), stage.invalidate());
  applyColors();

  let lastText = "";
  let lastAria = 0;
  function refresh(announce) {
    const key = GUESTS[state.guest].free;
    const pose = guestPose(key, state.s, "plane");
    guest.update(pose);
    state.pose = pose;
    sl.input.value = String(-Math.round(state.s * 100));
    const flat = Math.abs(state.s) < 0.04;
    const where = flat ? "planar: the transition state" : state.s > 0 ? "pyramid" : "inverted pyramid";
    const sym = GUESTS[state.guest].X;
    const text =
      `<span class="inv-3d-stat"><span>Height of ${sym} above the H₃ plane</span><b>${signed(pose.height)} Å</b></span>` +
      `<span class="inv-3d-stat"><span>H–${sym}–H angle</span><b>${fmt(pose.angle, 1)}°</b></span>` +
      `<span class="inv-3d-state${flat ? " is-ts" : ""}">${where}</span>`;
    if (text !== lastText) {
      readout.innerHTML = text;
      lastText = text;
    }
    sl.scale.classList.toggle("is-on", flat);
    sl.input.setAttribute("aria-valuetext", `${where}; ${sym} is ${signed(pose.height)} ångström from the H₃ plane`);
    // Lone-pair lobes
    guest.lobesVisible = state.lone;
    toggleLobes();
    const label = `${labelOf(key)} as a ball-and-stick pyramid, ${where}. ${sym}–H bonds ${fmt(pose.r, 3)} ångström, ${sym} ${signed(pose.height)} ångström above the plane of the hydrogens, H–${sym}–H angle ${fmt(pose.angle, 1)} degrees.`;
    stage.canvas.setAttribute("aria-label", label);
    const now = performance.now();
    if (announce || now - lastAria > 4000) {
      if (announce || !state.playing)
        live.textContent = `${labelOf(key)}: ${where}, ${sym} ${signed(pose.height)} ångström from the H₃ plane, H–${sym}–H ${fmt(pose.angle, 1)} degrees.`;
      lastAria = now;
    }
    stage.invalidate();
  }
  function toggleLobes() {
    const lobes = guest.group.children.filter((m) => m.geometry === lobeGeo());
    lobes.forEach((m) => {
      if (!state.lone) m.visible = false;
    });
    tag.classList.toggle("is-hidden", !state.lone || !guest.lobeInfo || guest.lobeInfo.weight < 0.45);
  }
  stage.onFrame = (dt) => {
    if (!state.playing) return;
    state.phase += dt * (TAU / 5.2);
    state.s = swing(state.phase);
    refresh();
  };
  stage.isBusy = () => state.playing;
  const v = new THREE.Vector3();
  stage.onRender = () => {
    // Pin the "lone pair" label to the lobe tip.
    if (!guest.lobeInfo || tag.classList.contains("is-hidden")) return;
    v.copy(guest.lobeInfo.tip).project(stage.camera);
    const w = stage.wrap.clientWidth;
    const h = stage.wrap.clientHeight;
    tag.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(10px, -50%)`;
  };
  stage.fit();
  refresh(false);
  root.__invDispose = stage.dispose;
}

/* ------------------------------------------------------------------ #inv-cage */

function mountCage(root) {
  const panel = pageSetup(root, "Interactive 3D");
  const stage = createStage(root, { radius: 3.75, dir: new THREE.Vector3(0.6, 0.45, 1), spin: 1.2 });
  if (!stage) return fallback(root, "A C₆₀ cage is about 7 Å across; the guest molecule fills a good part of its cavity.");
  const state = { guest: "oh", caged: true, style: "bonds", cut: false, playing: false, phase: 0, s: 1 };
  const cage = buildCage(stage.scene);
  const guest = buildGuest(stage.scene, { scale: 1.55 });
  stage.wrap.append(el("span", { class: "inv-3d-hint", text: "drag to rotate", "aria-hidden": "true" }));
  const live = el("div", { class: "inv-sr", "aria-live": "polite", role: "status" });
  const readout = el("div", { class: "inv-readout inv-3d-readout" });

  const guestToggle = toggleGroup(
    "Guest",
    [
      ["oh", "OH₃⁺"],
      ["ph", "PH₃"],
    ],
    state.guest,
    (v) => {
      state.guest = v;
      colors();
      refresh(true);
    }
  );
  const geomToggle = toggleGroup(
    "Geometry",
    [
      ["free", "Free", "Equilibrium geometry of the isolated molecule"],
      ["caged", "In C₆₀", "Equilibrium geometry inside the cage"],
    ],
    "caged",
    (v) => {
      state.caged = v === "caged";
      refresh(true);
    }
  );
  const styleToggle = toggleGroup(
    "Cage",
    [
      ["bonds", "Bonds"],
      ["pent", "Pentagons"],
      ["space", "Space-filling"],
    ],
    state.style,
    (v) => {
      state.style = v;
      stage.radius = v === "space" ? 5.1 : 3.75; // the van der Waals spheres extend beyond the cage atoms
      stage.fit();
      if (v === "space" && !state.cut) {
        state.cut = true; // look into a bowl of carbon spheres; can still be switched off
        cutBtn.setAttribute("aria-pressed", "true");
      }
      applyStyle();
      refresh(true);
    }
  );
  const cutBtn = toggleButton(
    "Cut away",
    false,
    (v) => {
      state.cut = v;
      stage.invalidate();
    },
    "Hide the half of the cage nearest the camera"
  );
  const play = el("button", { type: "button", class: "inv-btn inv-3d-play", "aria-pressed": "false" });
  const syncPlay = () => {
    play.setAttribute("aria-pressed", String(state.playing));
    play.textContent = state.playing ? "Pause inversion" : "Play inversion";
  };
  syncPlay();
  play.addEventListener("click", () => {
    state.playing = !state.playing;
    if (state.playing) state.phase = Math.acos(clamp(state.s, -1, 1));
    syncPlay();
    stage.invalidate();
  });
  const sl = slider("Umbrella coordinate", (v) => {
    state.playing = false;
    syncPlay();
    state.s = v;
    refresh(true);
  });
  const legend = el("div", { class: "inv-legend inv-3d-legend" }, [
    el("span", { html: '<i class="inv-3d-dot" data-k="X"></i><b class="inv-3d-xname">O</b> central atom' }),
    el("span", { html: '<i class="inv-3d-dot" data-k="H"></i>H' }),
    el("span", { html: '<i class="inv-3d-dot" data-k="C"></i>C (cage)' }),
  ]);
  const note = el("p", {
    class: "inv-3d-note",
    text: "Schematic path with fixed X–H bond length. The guest's axis lies along a threefold axis of the cage and its centre of mass sits at the centre; the true orientation and position are a modelling choice.",
  });
  panel.append(
    stage.wrap,
    el("div", { class: "inv-controls inv-3d-controls" }, [guestToggle.wrap, geomToggle.wrap]),
    el("div", { class: "inv-controls inv-3d-controls" }, [styleToggle.wrap, cutBtn, play]),
    sl.wrap,
    readout,
    legend,
    note,
    live
  );

  const colors = () => {
    const p = palette();
    cage.setColors(p);
    guest.setColors(p, GUESTS[state.guest].X);
    const col = { X: state.guest === "oh" ? p.O : p.P, H: p.H, C: p.C };
    panel.querySelectorAll(".inv-3d-dot").forEach((d) => (d.style.background = `#${col[d.dataset.k].getHexString()}`));
    panel.querySelector(".inv-3d-xname").textContent = GUESTS[state.guest].X;
  };
  stage.onTheme = () => (colors(), stage.invalidate());
  const applyStyle = () => {
    cage.setStyle(state.style);
    guest.showVdw = state.style === "space";
    guest.mats.X.opacity = 1;
  };
  colors();
  applyStyle();
  const atoms = cageData().atoms;
  let lastText = "";
  let lastAria = 0;
  function refresh(announce) {
    const g = GUESTS[state.guest];
    const key = state.caged ? g.caged : g.free;
    const pose = guestPose(key, state.s, "com");
    guest.update(pose);
    sl.input.value = String(-Math.round(state.s * 100));
    // Closest H...C distance from the live coordinates.
    let best = Infinity;
    for (const h of pose.H) for (const a of atoms) best = Math.min(best, h.distanceTo(a));
    const contact = VDW.H + VDW.C;
    const geo = INV.GEOMETRY[key];
    const fg = INV.GEOMETRY[g.free];
    const cg = INV.GEOMETRY[g.caged];
    const flat = Math.abs(state.s) < 0.04;
    const sym = g.X;
    const text =
      `<span class="inv-3d-stat"><span>Closest H···C</span><b class="${best < contact ? "is-tight" : ""}">${fmt(best, 2)} Å</b><em>van der Waals contact ${fmt(contact, 2)} Å</em></span>` +
      `<span class="inv-3d-stat"><span>${sym}–H · H–${sym}–H at equilibrium</span><b>${fmt(geo.r, 3)} Å · ${fmt(geo.angle, 1)}°</b><em>${state.caged ? "in C₆₀" : "free"}; ${state.caged ? "free" : "in C₆₀"}: ${fmt((state.caged ? fg : cg).r, 3)} Å · ${fmt((state.caged ? fg : cg).angle, 1)}°</em></span>` +
      `<span class="inv-3d-state${flat ? " is-ts" : ""}">${flat ? "planar: the transition state" : state.s > 0 ? "pyramid" : "inverted pyramid"}</span>`;
    if (text !== lastText) {
      readout.innerHTML = text;
      lastText = text;
    }
    sl.scale.classList.toggle("is-on", flat);
    sl.input.setAttribute(
      "aria-valuetext",
      `${flat ? "planar" : state.s > 0 ? "pyramid" : "inverted pyramid"}; closest H to C ${fmt(best, 2)} ångström`
    );
    stage.canvas.setAttribute(
      "aria-label",
      `${labelOf(key)} inside a C60 cage, ${state.style === "space" ? "space-filling" : state.style === "pent" ? "pentagons highlighted" : "ball-and-stick"}${state.cut ? ", front half cut away" : ""}. Closest hydrogen to carbon ${fmt(best, 2)} ångström.`
    );
    const now = performance.now();
    if (announce || (!state.playing && now - lastAria > 4000)) {
      live.textContent = `${labelOf(key)}: closest H to C ${fmt(best, 2)} ångström; ${flat ? "planar transition state" : state.s > 0 ? "pyramid" : "inverted pyramid"}.`;
      lastAria = now;
    }
    stage.invalidate();
  }
  stage.onFrame = (dt) => {
    if (state.playing) {
      state.phase += dt * (TAU / 5.2);
      state.s = swing(state.phase);
      refresh();
    }
  };
  stage.onRender = () => cage.cut(state.cut, stage.camera);
  stage.isBusy = () => state.playing;
  stage.fit();
  refresh(false);
  root.__invDispose = stage.dispose;
}

/* ------------------------------------------------------------------ #inv-c60 */

function mountC60(root) {
  const panel = pageSetup(root, "Interactive 3D");
  const stage = createStage(root, { radius: 3.75, dir: new THREE.Vector3(0.35, 0.5, 1), spin: 2.2 });
  if (!stage) return fallback(root, "C₆₀ has 60 carbon atoms, 12 pentagons, 20 hexagons and 90 bonds.");
  const cage = buildCage(stage.scene);
  stage.wrap.append(el("span", { class: "inv-3d-hint", text: "drag to rotate", "aria-hidden": "true" }));
  const state = { pent: true, hex: true };
  const apply = () => {
    cage.pent.visible = state.pent;
    cage.hex.visible = state.hex;
    stage.canvas.setAttribute(
      "aria-label",
      `A C60 fullerene cage: 60 carbon atoms, 12 pentagons and 20 hexagons${state.pent || state.hex ? ", with" + (state.pent ? " pentagons" : "") + (state.pent && state.hex ? " and" : "") + (state.hex ? " hexagons" : "") + " tinted" : ""}.`
    );
    stage.invalidate();
  };
  const pBtn = toggleButton('<i class="inv-3d-swatch" data-k="pent"></i>Pentagons', true, (v) => ((state.pent = v), apply()));
  const hBtn = toggleButton('<i class="inv-3d-swatch" data-k="hex"></i>Hexagons', true, (v) => ((state.hex = v), apply()));
  const counter = el("p", { class: "inv-readout inv-3d-counter", text: "60 carbon atoms · 12 pentagons · 20 hexagons · 90 bonds" });
  panel.append(stage.wrap, el("div", { class: "inv-controls inv-3d-controls" }, [pBtn, hBtn]), counter);
  const colors = () => {
    const p = palette();
    cage.setColors(p);
    cage.mats.pent.opacity = p.dark ? 0.5 : 0.42;
    cage.mats.hex.opacity = p.dark ? 0.18 : 0.14;
    const sw = (k, c) => (panel.querySelector(`.inv-3d-swatch[data-k="${k}"]`).style.background = `#${c.getHexString()}`);
    sw("pent", p.accent);
    sw("hex", p.free);
  };
  stage.onTheme = () => (colors(), stage.invalidate());
  colors();
  cage.setStyle("bonds");
  apply();
  stage.fit();
  root.__invDispose = stage.dispose;
}

/* ------------------------------------------------------------------ entry */

export function mount(kind, root) {
  if (!root || root.__invMounted) return;
  root.__invMounted = true;
  if (kind === "umbrella") mountUmbrella(root);
  else if (kind === "cage") mountCage(root);
  else if (kind === "c60") mountC60(root);
}
export { cageData, guestPose };
