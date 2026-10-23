// Interactive 3D brain for "The quiet injury" (TBI series, part 1).
// Every element with class "tbi-brain" becomes an independent viewer; data-mode picks what it shows:
//   explore  anatomy and what each region does
//   impact   a toy simulation of coup-contrecoup contusion and rotational shear
//   shear    the same simulation focused on stretched and torn axon bundles (stylised)
// Anatomy is MRI-derived (fsaverage5 pial surface, Destrieux atlas, MNI152, Harvard-Oxford and Juelich atlases);
// see assets/data/tbi/README.md. The mechanics are an illustration, not a finite-element model.
import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";

const DATA_JSON = new URL("../../data/tbi/brain.json", import.meta.url);
const DATA_BIN = new URL("../../data/tbi/brain.bin", import.meta.url);

/* ------------------------------------------------------------------ helpers */

const T = window.TBI || {};
const reduceMotion = T.reduceMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const onVisible =
  T.onVisible ||
  ((el, cb) => {
    if (!("IntersectionObserver" in window)) return cb();
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (io.disconnect(), cb()), { rootMargin: "200px" });
    io.observe(el);
  });
const watchVisibility =
  T.watchVisibility ||
  ((el, cb) => {
    if (!("IntersectionObserver" in window)) return cb(true);
    new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting))).observe(el);
  });
const onThemeChange = T.onThemeChange || ((cb) => new MutationObserver(cb).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }));
const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

const h = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c) el.append(c);
  return el;
};

// Parse any CSS colour into linear-free sRGB floats (the shaders work in display space).
const colourCtx = document.createElement("canvas").getContext("2d");
const parseColour = (css, fallback = "#888") => {
  colourCtx.fillStyle = fallback;
  colourCtx.fillStyle = css || fallback;
  const s = colourCtx.fillStyle;
  if (s.startsWith("#")) {
    const n = parseInt(s.slice(1), 16);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }
  const m = s.match(/[\d.]+/g) || [128, 128, 128];
  return new THREE.Vector3(m[0] / 255, m[1] / 255, m[2] / 255);
};
const cssVar = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();
const mix3 = (a, b, t) => a.clone().lerp(b, t);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (x) => x * x * (3 - 2 * x);

/* ------------------------------------------------------------------ region knowledge */
// Plain-language summaries; sources are listed in the series notes (brain-usage.md / README).
const REGIONS = {
  1: {
    name: "Orbitofrontal cortex",
    where: "The underside of the frontal lobes, resting on the bony, ridged roofs of the eye sockets.",
    does: "Weighs rewards against consequences, holds back impulses, and helps read social situations and regulate emotion.",
    injury:
      "One of the two commonest sites of contusion, because it scrapes over the rough floor of the anterior cranial fossa whichever way the head is struck. Damage is linked to impulsivity, irritability, poor judgement and changes in personality, sometimes with normal scores on standard tests. Loss of smell is common because the olfactory nerves run just beneath it.",
  },
  21: {
    name: "Frontal pole",
    where: "The very front tip of each hemisphere, just behind the forehead.",
    does: "Planning ahead, juggling several goals at once and thinking about the future.",
    injury: "Strikes the frontal bone in blows to the forehead, and in contrecoup when the back of the head is hit. Contributes to problems with planning, motivation and multitasking.",
  },
  2: {
    name: "Prefrontal cortex",
    where: "The front and top of the frontal lobes, above the orbitofrontal cortex.",
    does: "Executive function: holding information in mind, organising, switching between tasks and sustaining attention.",
    injury: "Slowed thinking, distractibility, trouble organising and starting tasks, and apathy are among the most common lasting complaints after TBI.",
  },
  3: {
    name: "Inferior frontal gyrus",
    where: "The lower side of the frontal lobe, just above the lateral fissure.",
    does: "On the left it includes Broca's area, which helps produce speech and grammar; on the right it helps stop actions that are already under way.",
    injury: "Left-sided damage can make speech effortful and halting; word-finding difficulty is common after TBI more generally.",
  },
  4: {
    name: "Motor cortex",
    where: "A strip running over the top of the brain, in front of the central sulcus.",
    does: "Plans and sends movement commands to the opposite side of the body.",
    injury: "Weakness or clumsiness on the opposite side of the body. It is bruised less often than the frontal and temporal poles.",
  },
  5: {
    name: "Somatosensory cortex",
    where: "The strip just behind the central sulcus.",
    does: "Receives touch, temperature, pain and the sense of where the body is, from the opposite side.",
    injury: "Numbness or altered sensation, and difficulty recognising objects by touch.",
  },
  6: {
    name: "Parietal lobe",
    where: "The upper back part of each hemisphere.",
    does: "Combines the senses into a map of space and of the body; spatial attention, reading and arithmetic.",
    injury: "Disorientation, difficulty judging space and distance, and (mostly with right-sided damage) neglect of one side of space.",
  },
  7: {
    name: "Anterior temporal lobe",
    where: "The front of the temporal lobe, sitting in the middle cranial fossa behind the bony sphenoid ridge.",
    does: "Knowledge of words, concepts and people, and emotional and social processing.",
    injury:
      "With the orbitofrontal cortex, the commonest site of contusion, because the temporal poles are wedged against the sphenoid ridge and the floor of the middle fossa. Linked to problems with naming, memory and emotional regulation. Cortical contusions are a recognised risk factor for post-traumatic seizures.",
  },
  8: {
    name: "Lateral and inferior temporal lobe",
    where: "The side and underside of the temporal lobe.",
    does: "Hearing (auditory cortex), understanding language (Wernicke's area on the left), and recognising objects and faces.",
    injury: "Difficulty following speech, especially in noise, and problems recognising faces or objects.",
  },
  9: {
    name: "Parahippocampal gyrus",
    where: "The inner, lower surface of the temporal lobe, next to the hippocampus.",
    does: "The gateway between the hippocampus and the rest of the cortex; memory for places and scenes.",
    injury: "Problems forming new memories and finding one's way.",
  },
  10: {
    name: "Occipital lobe",
    where: "The back of the brain.",
    does: "Vision: the first stages of seeing, then shape, colour and motion.",
    injury: "Blurred or disturbed vision and blind patches in the visual field. A contrecoup site when the forehead is struck.",
  },
  11: {
    name: "Cingulate cortex",
    where: "Arches over the corpus callosum on the inner face of each hemisphere, beside the falx (the stiff membrane between the hemispheres).",
    does: "Attention, motivation, noticing errors, and the emotional side of pain.",
    injury: "Apathy and difficulty sustaining attention. Its position against the falx makes it vulnerable when the hemispheres move.",
  },
  12: {
    name: "Insula",
    where: "Hidden deep inside the lateral fissure, under the frontal and temporal lobes.",
    does: "Sensing the body's internal state (heartbeat, breathing, gut), taste, and emotional awareness.",
    injury: "Changes in emotional awareness and in the sense of one's own body; usually damaged alongside neighbouring frontal and temporal cortex.",
  },
  13: {
    name: "Hippocampus",
    where: "Curled inside the medial temporal lobe, on both sides.",
    does: "Turns experiences into lasting memories of facts and events, and helps with navigation.",
    injury: "Post-traumatic amnesia, and lasting difficulty learning new information. After moderate and severe TBI the hippocampus can shrink over the following months.",
  },
  14: {
    name: "Amygdala",
    where: "An almond-shaped cluster in front of the hippocampus.",
    does: "Detects threat and tags memories with emotional weight.",
    injury: "Changes in fear and emotional responses; the amygdala is implicated in the anxiety and post-traumatic stress symptoms that often follow TBI.",
  },
  15: {
    name: "Thalamus",
    where: "Two egg-shaped masses at the centre of the brain.",
    does: "Relays almost all sensory information to the cortex and helps regulate arousal, sleep and attention.",
    injury: "Fatigue, slowed processing and disturbed sleep. The thalamus is often affected in diffuse injury because so many fibres pass through it.",
  },
  16: {
    name: "Basal ganglia",
    where: "Deep grey-matter nuclei (caudate and putamen) beside the thalamus.",
    does: "Selecting and smoothing movements, forming habits, and motivation.",
    injury: "Slowed movement, tremor or reduced drive; small haemorrhages here can accompany diffuse shearing.",
  },
  17: {
    name: "Corpus callosum",
    where: "The thick white bridge joining the two hemispheres, beneath the falx.",
    does: "About 200 million axons carry information between the left and right hemispheres.",
    injury:
      "A classic site of diffuse axonal injury in rotational impacts: the hemispheres twist relative to each other while the stiff falx holds the midline. Linked to slowed processing speed and poorer coordination between the two sides.",
  },
  18: {
    name: "Brainstem",
    where: "The stalk connecting the brain to the spinal cord, passing through the foramen magnum.",
    does: "Controls breathing, heart rate, and arousal: its reticular activating system keeps us awake and conscious. Most cranial nerves leave from here.",
    injury:
      "Shearing that reaches the upper brainstem is the most severe grade of diffuse axonal injury and is associated with prolonged loss of consciousness and coma, which is what the Glasgow Coma Scale is designed to measure.",
  },
  19: {
    name: "Cerebellum",
    where: "Tucked under the back of the brain, in the posterior cranial fossa.",
    does: "Coordination, balance and timing of movement; it also contributes to thinking.",
    injury: "Unsteadiness and poor coordination. (Dizziness after concussion is common, though often it comes from the inner ear rather than the cerebellum.)",
  },
  20: {
    name: "Ventricles",
    where: "Fluid-filled cavities in the middle of the brain.",
    does: "Make cerebrospinal fluid (CSF), which surrounds the brain so that it floats: roughly 1.4 kg in air, it weighs only tens of grams in CSF.",
    injury: "Floating cushions everyday jolts, but it also leaves the brain free to lag behind the skull when the head is suddenly accelerated. Blood in the ventricles, or swelling that squeezes them, are signs on a CT scan.",
  },
};
const CORTEX_ORDER = [21, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DEEP_ORDER = [17, 18, 15, 13, 14, 16, 19, 20];
const DEEP = new Set(DEEP_ORDER);

const SCENARIOS = {
  front: {
    label: "Forehead",
    blurb: "A blow to the front of the head, or the forehead hitting something hard.",
    site: [0, 0.25, -1],
    lin: [0, 0, 1],
    rot: [0.18, 0, 0],
    cut: "sagittal",
    impactor: true,
  },
  back: {
    label: "Back of head",
    blurb: "The back of the head hits something, as in a fall backwards onto a hard floor.",
    site: [0, 0.1, 1],
    lin: [0, 0, -1],
    rot: [-0.18, 0, 0],
    cut: "sagittal",
    impactor: true,
  },
  side: {
    label: "Side",
    blurb: "A blow to the side of the head, or the temple hitting a door frame or window.",
    site: [-1, 0.15, 0],
    lin: [1, 0, 0],
    rot: [0, 0, -0.22],
    cut: "coronal",
    impactor: true,
  },
  hook: {
    label: "Hook to the jaw",
    blurb: "A glancing blow to the side of the jaw, which spins the head sideways about the neck.",
    site: [-1, -0.9, -0.6],
    lin: [0.25, 0, 0],
    rot: [0, -1, 0],
    cut: "coronal",
    impactor: false,
  },
  uppercut: {
    label: "Uppercut",
    blurb: "A blow under the chin that snaps the head backwards.",
    site: [0, -1, -0.8],
    lin: [0, 0.3, 0],
    rot: [0.85, 0, 0],
    cut: "sagittal",
    impactor: false,
  },
  whiplash: {
    label: "Whiplash",
    blurb: "No blow to the head at all: the body is thrown forward, the head lags and then whips back and forth on the neck.",
    site: [0, -1, 0.4],
    lin: [0, 0, -0.35],
    rot: [0.7, 0, 0],
    cut: "sagittal",
    impactor: false,
    whiplash: true,
  },
};
const SCENARIO_ORDER = ["front", "back", "side", "hook", "uppercut", "whiplash"];

/* ------------------------------------------------------------------ data */

let dataPromise = null;
const loadData = () => {
  if (!dataPromise) {
    dataPromise = Promise.all([fetch(DATA_JSON).then((r) => r.json()), fetch(DATA_BIN).then((r) => r.arrayBuffer())]).then(([m, buf]) => decode(m, buf));
  }
  return dataPromise;
};

const view = (buf, s) => {
  const C = { int16: Int16Array, uint16: Uint16Array, uint32: Uint32Array, uint8: Uint8Array, int8: Int8Array, float32: Float32Array }[s.dtype];
  return new C(buf, s.offset, s.length);
};

function signedVolume(pos, idx) {
  let v = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3,
      b = idx[t + 1] * 3,
      c = idx[t + 2] * 3;
    v +=
      pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) -
      pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) +
      pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
  }
  return v / 6;
}

function decode(m, buf) {
  const sc = m.scale;
  const C = m.centre;
  const meshes = {};
  for (const e of m.meshes) {
    const q = view(buf, e.pos);
    const pos = new Float32Array(q.length);
    for (let i = 0; i < q.length; i += 3) {
      pos[i] = q[i] * sc - C[0];
      pos[i + 1] = q[i + 1] * sc - C[1];
      pos[i + 2] = q[i + 2] * sc - C[2];
    }
    let idx = view(buf, e.index);
    idx = idx instanceof Uint16Array ? new Uint16Array(idx) : new Uint32Array(idx);
    // Orientation: everything faces outward except the inner table of the skull, which faces the brain.
    const vol = signedVolume(pos, idx);
    const wantInward = e.kind === "skull_inner";
    if ((vol < 0) !== wantInward) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeVertexNormals();
    const n = e.count;
    const region = new Float32Array(n);
    if (e.region) region.set(view(buf, e.region));
    g.setAttribute("aRegion", new THREE.BufferAttribute(region, 1));
    const sulc = new Float32Array(n).fill(0.35);
    if (e.sulc) {
      const s = view(buf, e.sulc);
      for (let i = 0; i < n; i++) sulc[i] = s[i] / 255;
    }
    g.setAttribute("aSulc", new THREE.BufferAttribute(sulc, 1));
    const rough = new Float32Array(n);
    if (e.rough) {
      const r = view(buf, e.rough);
      for (let i = 0; i < n; i++) rough[i] = r[i] / 255;
    }
    g.setAttribute("aRough", new THREE.BufferAttribute(rough, 1));
    g.computeBoundingSphere();
    const out = { name: e.name, kind: e.kind, count: n, geometry: g, pos };
    if (e.gap) {
      const gq = view(buf, e.gap),
        nq = view(buf, e.normal),
        rq = view(buf, e.rough);
      out.gap = Float32Array.from(gq, (x) => x / 10);
      out.cnormal = Float32Array.from(nq, (x) => x / 127);
      out.crough = Float32Array.from(rq, (x) => x / 255);
    }
    meshes[e.name] = out;
  }
  // Region anchors (for the floating label): vertex nearest each region's centroid, per mesh.
  const anchors = {};
  for (const mesh of Object.values(meshes)) {
    if (!mesh.kind.startsWith("cortex") && mesh.kind !== "sub") continue;
    const reg = mesh.geometry.getAttribute("aRegion").array;
    const sums = {};
    for (let i = 0; i < mesh.count; i++) {
      const r = reg[i];
      if (!r) continue;
      const s = (sums[r] = sums[r] || [0, 0, 0, 0]);
      s[0] += mesh.pos[i * 3];
      s[1] += mesh.pos[i * 3 + 1];
      s[2] += mesh.pos[i * 3 + 2];
      s[3]++;
    }
    for (const [r, s] of Object.entries(sums)) {
      const c = new THREE.Vector3(s[0] / s[3], s[1] / s[3], s[2] / s[3]);
      if (mesh.kind === "sub") {
        (anchors[r] = anchors[r] || []).push({ mesh: mesh.name, p: c });
        continue;
      }
      let best = -1,
        bd = Infinity;
      for (let i = 0; i < mesh.count; i++) {
        if (reg[i] != r) continue;
        const dx = mesh.pos[i * 3] - c.x,
          dy = mesh.pos[i * 3 + 1] - c.y,
          dz = mesh.pos[i * 3 + 2] - c.z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bd) (bd = d), (best = i);
      }
      (anchors[r] = anchors[r] || []).push({ mesh: mesh.name, p: new THREE.Vector3().fromArray(mesh.pos, best * 3) });
    }
  }
  // Fibres
  const fq = view(buf, m.fibres.pos);
  const lens = view(buf, m.fibres.lengths);
  const kinds = view(buf, m.fibres.kind);
  const fibres = [];
  let o = 0;
  for (let f = 0; f < lens.length; f++) {
    const pts = [];
    for (let k = 0; k < lens[f]; k++, o += 3) pts.push(new THREE.Vector3(fq[o] * sc - C[0], fq[o + 1] * sc - C[1], fq[o + 2] * sc - C[2]));
    fibres.push({ pts, kind: kinds[f] });
  }
  const pivot = new THREE.Vector3(m.pivot[0] - C[0], m.pivot[1] - C[1], m.pivot[2] - C[2]);
  const contact = buildContacts(meshes);
  const adjacency = {};
  for (const name of ["cortex_left", "cortex_right", "cerebellum"]) adjacency[name] = buildAdjacency(meshes[name]);
  return { meshes, anchors, fibres, pivot, contact, adjacency };
}

function buildAdjacency(mesh) {
  const n = mesh.count;
  const idx = mesh.geometry.index.array;
  const sets = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t],
      b = idx[t + 1],
      c = idx[t + 2];
    sets[a].add(b).add(c);
    sets[b].add(a).add(c);
    sets[c].add(a).add(b);
  }
  const start = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) start[i + 1] = start[i] + sets[i].size;
  const nb = new Uint32Array(start[n]);
  for (let i = 0; i < n; i++) nb.set([...sets[i]], start[i]);
  return { start, nb };
}

// Contact candidates: surface vertices close enough to the inner skull to touch it.
const CONTACT_MESHES = ["cortex_left", "cortex_right", "cerebellum", "brainstem"];
function buildContacts(meshes) {
  const offsets = {};
  let total = 0;
  for (const name of CONTACT_MESHES) {
    offsets[name] = total;
    total += meshes[name].count;
  }
  const list = [];
  for (const name of CONTACT_MESHES) {
    const m = meshes[name];
    for (let i = 0; i < m.count; i++) if (m.gap[i] < 7.5) list.push([name, i]);
  }
  const N = list.length;
  const r = new Float32Array(N * 3),
    n = new Float32Array(N * 3),
    g = new Float32Array(N),
    rough = new Float32Array(N),
    target = new Uint32Array(N);
  list.forEach(([name, i], k) => {
    const m = meshes[name];
    r.set(m.pos.subarray(i * 3, i * 3 + 3), k * 3);
    n.set(m.cnormal.subarray(i * 3, i * 3 + 3), k * 3);
    g[k] = m.gap[i];
    rough[k] = m.crough[i];
    target[k] = offsets[name] + i;
  });
  return { N, r, n, g, rough, target, offsets, total };
}

/* ------------------------------------------------------------------ the toy mechanics */
// Brain = rigid body on a damped spring inside the skull (a few mm of CSF), plus a "deep core" that lags
// the brain's outer layers in rotation (a stand-in for shear between structures of different stiffness).
// Everything is in the skull's frame: the skull's acceleration appears as an opposite pseudo-force.
const SIM = {
  dt: 0.05, // ms
  duration: 90, // ms
  frameEvery: 5, // record every 0.25 ms
  keyEvery: 6, // heat snapshot every 6 frames
  t0: 6, // pulse start (ms)
  pulse: 8, // ms, half-sine
  k: 0.11, // tethering spring (1/ms^2)  -> period ~19 ms
  c: 0.09,
  kRot: 0.07,
  cRot: 0.1,
  kCore: 0.16,
  cCore: 0.16,
  kContact: 0.0035, // per contacting vertex
  cContact: 0.0006,
  invI: 1 / 2200, // 1 / (I/m), mm^-2
  linPerSev: 0.11, // mm/ms^2 per severity step (~11 g)
  rotPerSev: 0.0011, // rad/ms^2 per severity step
};

function simulate(data, scenarioKey, severity) {
  const S = SCENARIOS[scenarioKey];
  const { contact } = data;
  const { N, r, n, g, rough, target, total } = contact;
  const heat = new Float32Array(total);
  const dt = SIM.dt;
  const steps = Math.round(SIM.duration / dt);
  const lin = new THREE.Vector3(...S.lin);
  const rot = new THREE.Vector3(...S.rot);
  const A = SIM.linPerSev * severity;
  const Al = SIM.rotPerSev * severity;
  const pivot = data.pivot;
  // state
  const u = new THREE.Vector3(),
    v = new THREE.Vector3(),
    th = new THREE.Vector3(),
    w = new THREE.Vector3(),
    ph = new THREE.Vector3(),
    pw = new THREE.Vector3();
  // skull (display only): position and rotation about the neck pivot, with a soft "neck" restoring them
  const sp = new THREE.Vector3(),
    sv = new THREE.Vector3(),
    sr = new THREE.Vector3(),
    sw = new THREE.Vector3();
  const frames = [];
  const keys = [];
  const F = new THREE.Vector3(),
    Tq = new THREE.Vector3(),
    aS = new THREE.Vector3(),
    alS = new THREE.Vector3(),
    tmp = new THREE.Vector3();
  let maxPhi = 0,
    maxPen = 0,
    contactNow = 0;
  const pulseAt = (t) => {
    if (S.whiplash) {
      // body thrown forward: head lags (extension) then rebounds (flexion), over a longer window
      const tt = t - SIM.t0;
      const D = 34;
      if (tt < 0 || tt > D) return [0, 0];
      const s = Math.sin((Math.PI * tt) / D);
      return [s, Math.sin((2 * Math.PI * tt) / D) * 1.15];
    }
    const tt = t - SIM.t0;
    if (tt < 0 || tt > SIM.pulse) return [0, 0];
    const s = Math.sin((Math.PI * tt) / SIM.pulse);
    return [s, s];
  };
  for (let step = 0; step <= steps; step++) {
    const t = step * dt;
    const [pl, pr] = pulseAt(t);
    aS.copy(lin).multiplyScalar(A * pl);
    alS.copy(rot).multiplyScalar(Al * pr);
    // rotation about the neck pivot also accelerates the brain's centre: alpha x (c - pivot)
    tmp.copy(pivot).negate();
    aS.add(alS.clone().cross(tmp));
    // contact forces
    F.set(0, 0, 0);
    Tq.set(0, 0, 0);
    contactNow = 0;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const rx = r[i3],
        ry = r[i3 + 1],
        rz = r[i3 + 2];
      const nx = n[i3],
        ny = n[i3 + 1],
        nz = n[i3 + 2];
      const dx = u.x + th.y * rz - th.z * ry;
      const dy = u.y + th.z * rx - th.x * rz;
      const dz = u.z + th.x * ry - th.y * rx;
      const p = dx * nx + dy * ny + dz * nz - g[i];
      if (p < -0.5) continue;
      const vx = v.x + w.y * rz - w.z * ry;
      const vy = v.y + w.z * rx - w.x * rz;
      const vz = v.z + w.x * ry - w.y * rx;
      const vn = vx * nx + vy * ny + vz * nz;
      const tx = vx - vn * nx,
        ty = vy - vn * ny,
        tz = vz - vn * nz;
      const vt = Math.sqrt(tx * tx + ty * ty + tz * tz);
      const prox = Math.min(1, 1 + p / 0.5);
      // scraping along a rough floor (skull base) while close to it
      let dh = rough[i] * rough[i] * prox * vt * 0.9;
      if (p > 0) {
        contactNow++;
        const f = SIM.kContact * p + SIM.cContact * Math.max(vn, 0);
        F.x -= f * nx;
        F.y -= f * ny;
        F.z -= f * nz;
        // torque r x (-f n)
        Tq.x -= f * (ry * nz - rz * ny);
        Tq.y -= f * (rz * nx - rx * nz);
        Tq.z -= f * (rx * ny - ry * nx);
        dh += p * p * 1.6 + p * Math.max(vn, 0) * 3;
        if (p > maxPen) maxPen = p;
      }
      heat[target[i]] += dh * dt;
    }
    // integrate brain translation and rotation (semi-implicit Euler)
    const ax = -aS.x - SIM.k * u.x - SIM.c * v.x + F.x;
    const ay = -aS.y - SIM.k * u.y - SIM.c * v.y + F.y;
    const az = -aS.z - SIM.k * u.z - SIM.c * v.z + F.z;
    v.x += ax * dt;
    v.y += ay * dt;
    v.z += az * dt;
    u.addScaledVector(v, dt);
    const bx = -alS.x - SIM.kRot * th.x - SIM.cRot * w.x + Tq.x * SIM.invI;
    const by = -alS.y - SIM.kRot * th.y - SIM.cRot * w.y + Tq.y * SIM.invI;
    const bz = -alS.z - SIM.kRot * th.z - SIM.cRot * w.z + Tq.z * SIM.invI;
    w.x += bx * dt;
    w.y += by * dt;
    w.z += bz * dt;
    th.addScaledVector(w, dt);
    // deep core lags the brain's outer layers: driven by their total angular acceleration
    const cx = -(alS.x + bx) - SIM.kCore * ph.x - SIM.cCore * pw.x;
    const cy = -(alS.y + by) - SIM.kCore * ph.y - SIM.cCore * pw.y;
    const cz = -(alS.z + bz) - SIM.kCore * ph.z - SIM.cCore * pw.z;
    pw.x += cx * dt;
    pw.y += cy * dt;
    pw.z += cz * dt;
    ph.addScaledVector(pw, dt);
    maxPhi = Math.max(maxPhi, ph.length());
    // skull display motion: real heads move centimetres; we keep it small and pull it back with a soft neck
    sv.addScaledVector(aS, dt).addScaledVector(sp, -0.004 * dt).multiplyScalar(1 - 0.03 * dt);
    sp.addScaledVector(sv, dt);
    sw.addScaledVector(alS, dt).addScaledVector(sr, -0.006 * dt).multiplyScalar(1 - 0.04 * dt);
    sr.addScaledVector(sw, dt);
    if (step % SIM.frameEvery === 0) {
      frames.push({
        t,
        u: u.clone(),
        th: th.clone(),
        ph: ph.clone(),
        sp: sp.clone(),
        sr: sr.clone(),
        maxPhi,
        maxPen,
        contact: contactNow,
        load: Math.max(Math.abs(pl), Math.abs(pr)),
      });
      if ((frames.length - 1) % SIM.keyEvery === 0) keys.push(heat.slice());
    }
  }
  keys.push(heat.slice());
  return { scenario: scenarioKey, severity, frames, keys, maxPhi, maxPen, axis: rot.clone().normalize(), linDir: lin.clone().normalize() };
}

// Turn accumulated "heat" into a 0..1 bruise value, smoothed over the surface so bruises read as patches.
const HEAT_SCALE = 0.11;
function heatToBruise(data, raw, out) {
  const { offsets, total } = data.contact;
  for (let i = 0; i < total; i++) out[i] = 1 - Math.exp(-raw[i] * HEAT_SCALE);
  const tmp = new Float32Array(total);
  for (const name of ["cortex_left", "cortex_right", "cerebellum"]) {
    const { start, nb } = data.adjacency[name];
    const off = offsets[name];
    const n = start.length - 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let k = start[i]; k < start[i + 1]; k++) s += out[off + nb[k]];
        const m = s / Math.max(1, start[i + 1] - start[i]);
        tmp[off + i] = Math.max(out[off + i] * 0.55 + m * 0.45, m * 0.9);
      }
      out.set(tmp.subarray(off, off + n), off);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ shaders */

const NOISE = /* glsl */ `
float hash3(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i+vec3(0,0,0)),hash3(i+vec3(1,0,0)),f.x), mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x), mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y), f.z);
}
// punctate dots (microhaemorrhages): density 0..1
float specks(vec3 p, float density, float size){
  vec3 c = floor(p / size);
  float best = 1e3; float on = 0.0;
  for (int i=0;i<2;i++) for (int j=0;j<2;j++) for (int k=0;k<2;k++){
    vec3 cc = c + vec3(float(i),float(j),float(k)) - 0.5;
    cc = floor(cc + 0.5);
    float hsh = hash3(cc*1.31+7.0);
    vec3 pt = (cc + vec3(hash3(cc+1.7), hash3(cc+3.1), hash3(cc+5.3))) * size;
    float d = length(p - pt) / size;
    if (hsh < density && d < best) { best = d; on = 1.0; }
  }
  return on * (1.0 - smoothstep(0.18, 0.3, best));
}`;

const TISSUE_VERT = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
attribute float aRegion; attribute float aSulc; attribute float aHeat; attribute float aShear;
varying vec3 vN; varying vec3 vV; varying vec3 vPos; varying float vRegion; varying float vSulc; varying float vHeat; varying float vShear;
void main(){
  vRegion = aRegion; vSulc = aSulc; vHeat = aHeat; vShear = aShear; vPos = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;

const TISSUE_FRAG = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>
uniform vec3 uGyrus; uniform vec3 uSulcus; uniform vec3 uCut; uniform vec3 uTheme; uniform vec3 uInjury; uniform vec3 uRim; uniform vec3 uSSS;
uniform vec3 uTint; uniform float uTintMix; uniform float uSel; uniform float uHov; uniform float uGhost; uniform float uOpacity;
uniform float uFolia; uniform vec3 uFoliaC; uniform float uShearAll; uniform float uDark; uniform float uSulcAmt;
varying vec3 vN; varying vec3 vV; varying vec3 vPos; varying float vRegion; varying float vSulc; varying float vHeat; varying float vShear;
${NOISE}
void main(){
  #include <clipping_planes_fragment>
  float sel = 1.0 - step(0.5, abs(vRegion - uSel));
  float hov = 1.0 - step(0.5, abs(vRegion - uHov));
  if (!gl_FrontFacing) {
    // cut face of a clipped structure
    vec3 cc = mix(uCut, uTheme, sel*0.45);
    gl_FragColor = vec4(cc * (0.92 + 0.08*vnoise(vPos*0.6)), uGhost > 0.5 ? 0.5 : 1.0);
    return;
  }
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  float s = smoothstep(0.2, 0.85, vSulc) * uSulcAmt;
  vec3 base = mix(uGyrus, uSulcus, s);
  base = mix(base, uTint, uTintMix);
  if (uFolia > 0.5) {
    float f = sin(length(vPos - uFoliaC) * 1.7 + vnoise(vPos*0.15)*2.0);
    base *= 0.8 + 0.2 * smoothstep(-0.7, 0.9, f);
  }
  base *= 0.95 + 0.05 * vnoise(vPos * 0.45);
  base = mix(base, uTheme, sel * 0.62 + hov * 0.28);
  // contusion: mottled, coalescing haemorrhage
  float m = vnoise(vPos * 0.5) * 0.6 + vnoise(vPos * 1.6) * 0.4;
  float heat = clamp(vHeat, 0.0, 1.0);
  float bruise = smoothstep(0.12, 0.6, heat + (m - 0.5) * 0.55 * heat);
  vec3 bruiseCol = mix(uInjury, uInjury * vec3(0.55, 0.25, 0.35), smoothstep(0.55, 1.0, heat) * 0.7);
  base = mix(base, bruiseCol, bruise * 0.92);
  // diffuse axonal injury: punctate microhaemorrhages
  float shear = clamp(vShear + uShearAll, 0.0, 1.0);
  float dots = specks(vPos, shear * 0.55, 2.6);
  base = mix(base, uInjury * 0.9, dots);
  // lighting in view space
  vec3 L1 = normalize(vec3(-0.45, 0.7, 0.55));
  vec3 L2 = normalize(vec3(0.75, -0.1, 0.35));
  float d1 = dot(n, L1);
  float wrap = max(0.0, (d1 + 0.45) / 1.45);
  float d2 = max(0.0, dot(n, L2));
  float hemi = 0.5 + 0.5 * n.y;
  vec3 col = base * (0.30 + 0.12 * hemi + 0.66 * wrap + 0.16 * d2);
  col += uSSS * wrap * (1.0 - wrap) * 0.55 * (1.0 - bruise);
  col *= 1.0 - 0.22 * s;
  vec3 hv = normalize(L1 + v);
  col += vec3(pow(max(dot(n, hv), 0.0), 36.0) * 0.11 * (1.0 - s));
  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  col += uRim * fr * (0.35 + 0.35 * uDark);
  float a = uOpacity;
  if (uGhost > 0.5) {
    a = clamp(0.035 + 0.42 * fr + sel * 0.45 + bruise * 0.5 + dots * 0.6, 0.0, 1.0) * uOpacity;
    col = mix(col, uRim, fr * 0.4 * (1.0 - bruise));
  }
  gl_FragColor = vec4(col, a);
}`;

const GLASS_VERT = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
attribute float aRough;
varying vec3 vN; varying vec3 vV; varying vec3 vPos; varying float vRough;
void main(){
  vPos = position; vRough = aRough;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;

const GLASS_FRAG = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>
uniform vec3 uGlass; uniform vec3 uEdge; uniform vec3 uBone; uniform vec3 uInjury; uniform float uOpacity; uniform float uInner;
uniform vec3 uHit; uniform float uRing; uniform float uRingA; uniform float uSolid; uniform float uDark;
varying vec3 vN; varying vec3 vV; varying vec3 vPos; varying float vRough;
${NOISE}
void main(){
  #include <clipping_planes_fragment>
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  if (!gl_FrontFacing) n = -n;
  float ndv = abs(dot(n, v));
  float fr = pow(1.0 - ndv, 2.4);
  float ring = uRingA * exp(-pow((distance(vPos, uHit) - uRing) / 4.0, 2.0));
  if (uSolid > 0.5) {
    // cutaway: opaque bone. Back faces are the cut section through the bone.
    if (!gl_FrontFacing) { gl_FragColor = vec4(uBone * (0.9 + 0.1 * vnoise(vPos * 0.8)), 1.0); return; }
    vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
    float rough = vRough * (0.6 + 0.4 * vnoise(vPos * 0.45));
    vec3 base = mix(uEdge, uBone * 0.82, uInner);
    base = mix(base, uBone * 0.62, rough * uInner * 0.7);
    vec3 col = base * (0.45 + 0.55 * max(0.0, (dot(n, L) + 0.3) / 1.3));
    col += uInjury * ring;
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
  vec3 hv = normalize(L + v);
  float spec = pow(max(dot(n, hv), 0.0), 70.0) * 0.55;
  vec3 col = mix(uGlass, uEdge, fr);
  float a;
  if (uInner > 0.5) {
    // inner table: only the skull base (rough fossae and ridges) shows, frosted
    float r = smoothstep(0.25, 0.9, vRough) * (0.75 + 0.25 * vnoise(vPos * 0.5));
    col = mix(uGlass, uBone, 0.7);
    a = r * 0.32 * uOpacity + ring * 0.4;
  } else {
    a = (0.025 + 0.5 * fr) * uOpacity + spec * uOpacity + ring * 0.6;
  }
  col += vec3(spec) + uInjury * ring;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}`;

const FIBRE_VERT = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
attribute vec3 aCentre; attribute float aFid; attribute float aT;
uniform sampler2D uState; uniform float uNF; uniform vec3 uPhi; uniform float uRadius; uniform float uTime;
varying vec3 vN; varying vec3 vV; varying float vStrain; varying float vDamage; varying float vGap; varying float vKind;
vec3 rotateAA(vec3 p, vec3 aa){
  float ang = length(aa); if (ang < 1e-6) return p;
  vec3 k = aa / ang; float c = cos(ang), s = sin(ang);
  return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c);
}
void main(){
  vec4 st = texture2D(uState, vec2((aFid + 0.5) / uNF, 0.5));
  float strain = st.r; float dmg = st.g; float tb = st.b; vKind = st.a;
  vStrain = strain; vDamage = dmg; vGap = abs(aT - tb);
  float depth = clamp(1.0 - length(aCentre) / 72.0, 0.0, 1.0);
  vec3 c = rotateAA(aCentre, uPhi * depth);
  vec3 nn = rotateAA(normal, uPhi * depth);
  float bead = dmg * pow(0.5 + 0.5 * sin(aT * 70.0 + aFid), 8.0);
  float r = uRadius * (1.0 + 0.6 * strain * (1.0 - dmg) + 2.4 * bead);
  // torn ends retract a little
  vec3 p = c + nn * r;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * nn);
  vV = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;

const FIBRE_FRAG = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>
uniform vec3 uFibre; uniform vec3 uFibre2; uniform vec3 uStrainCol; uniform vec3 uInjury; uniform float uOpacity;
varying vec3 vN; varying vec3 vV; varying float vStrain; varying float vDamage; varying float vGap; varying float vKind;
void main(){
  #include <clipping_planes_fragment>
  if (vDamage > 0.5 && vGap < 0.035) discard;
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  vec3 base = mix(uFibre, uFibre2, step(0.5, vKind) * 0.5 + step(1.5, vKind) * 0.5);
  base = mix(base, uStrainCol, smoothstep(0.25, 0.95, vStrain) * (1.0 - vDamage));
  base = mix(base, uInjury, vDamage);
  float l = 0.45 + 0.55 * max(0.0, dot(n, normalize(vec3(-0.4, 0.7, 0.6))));
  float fr = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  vec3 col = base * l + base * fr * 0.35;
  gl_FragColor = vec4(col, uOpacity);
}`;

/* ------------------------------------------------------------------ palettes */

function readPalette(el) {
  const dark = isDark();
  const theme = parseColour(cssVar("--global-theme-color", el), dark ? "#a8c4e0" : "#50708f");
  const injury = parseColour(cssVar("--tbi-injury", el), dark ? "#ff6b5c" : "#d9483b");
  const text = parseColour(cssVar("--global-text-color", el), dark ? "#fff" : "#1a1a1a");
  const bg = parseColour(cssVar("--global-bg-color", el), dark ? "#0b0e0f" : "#fafaf8");
  if (dark) {
    return {
      dark,
      theme,
      injury,
      text,
      bg,
      gyrus: parseColour("#d9c3bd"),
      sulcus: parseColour("#7f6467"),
      cut: parseColour("#e9dfd3"),
      rim: mix3(theme, parseColour("#ffffff"), 0.2),
      sss: parseColour("#c4554a"),
      glass: parseColour("#9fb6c9"),
      edge: parseColour("#dbe8f4"),
      bone: parseColour("#d8ccb6"),
      fibre: mix3(theme, parseColour("#ffffff"), 0.35),
      fibre2: theme.clone(),
      strain: parseColour("#f0b05a"),
      csf: parseColour("#7fb7d8"),
    };
  }
  return {
    dark,
    theme,
    injury,
    text,
    bg,
    gyrus: parseColour("#ecd8d2"),
    sulcus: parseColour("#a98581"),
    cut: parseColour("#f3ebe0"),
    rim: mix3(theme, parseColour("#ffffff"), 0.45),
    sss: parseColour("#d0685c"),
    glass: parseColour("#c9d6e2"),
    edge: parseColour("#6f879d"),
    bone: parseColour("#e2d6c1"),
    fibre: mix3(theme, parseColour("#000000"), 0.1),
    fibre2: mix3(theme, parseColour("#ffffff"), 0.15),
    strain: parseColour("#d08c2c"),
    csf: parseColour("#3a8fb7"),
  };
}

const TINTS = {
  13: "#d9a77a", // hippocampus
  14: "#d79a8a",
  15: "#c7a3b4",
  16: "#b8a7c9",
  17: "#f2ece2",
  18: "#d6bdb3",
  19: "#d8b8b0",
  20: "#7fb7d8",
};

/* ------------------------------------------------------------------ viewer */

let instanceCount = 0;

class BrainView {
  constructor(el) {
    this.el = el;
    this.mode = ["explore", "impact", "shear"].includes(el.dataset.mode) ? el.dataset.mode : "explore";
    this.id = `tbi-brain-${++instanceCount}`;
    this.selected = 0;
    this.hovered = 0;
    this.skullOn = el.dataset.skull !== "off";
    this.ghost = this.mode === "shear";
    this.cut = el.dataset.cutaway === "on";
    this.scenario = SCENARIOS[el.dataset.scenario] ? el.dataset.scenario : this.mode === "shear" ? "hook" : "front";
    this.severity = clamp(parseInt(el.dataset.severity || "6", 10) || 6, 1, 10);
    this.result = null;
    this.playT = 0;
    this.playing = false;
    this.visible = false;
    this.dirty = true;
    this.buildDom();
  }

  /* ---------------- DOM */
  buildDom() {
    const el = this.el;
    el.classList.add("tbi-brain-root");
    el.innerHTML = "";
    const mode = this.mode;
    this.canvasWrap = h("div", { class: "tbi-brain-stage" });
    this.loading = h("div", { class: "tbi-brain-loading", text: "Loading the brain model…" });
    this.canvasWrap.append(this.loading);
    this.tag = h("div", { class: "tbi-brain-tag", "aria-hidden": "true" });
    this.canvasWrap.append(this.tag);
    this.hint = h("div", {
      class: "tbi-brain-hint",
      text: mode === "explore" ? "Drag to turn · tap a region" : "Drag to turn · choose a blow, then Strike",
    });
    this.canvasWrap.append(this.hint);
    const zoom = h("div", { class: "tbi-brain-zoom", role: "group", "aria-label": "Zoom" }, [
      h("button", { type: "button", class: "tbi-brain-iconbtn", "aria-label": "Zoom in", text: "+", onclick: () => this.zoom(0.82) }),
      h("button", { type: "button", class: "tbi-brain-iconbtn", "aria-label": "Zoom out", text: "−", onclick: () => this.zoom(1.22) }),
      h("button", { type: "button", class: "tbi-brain-iconbtn", "aria-label": "Reset view", html: "&#8635;", onclick: () => this.resetView(true) }),
    ]);
    this.canvasWrap.append(zoom);

    const side = h("div", { class: "tbi-brain-side" });
    // view toggles
    this.btnSkull = h("button", { type: "button", class: "tbi-btn", "aria-pressed": String(this.skullOn), text: "Skull", onclick: () => this.setSkull(!this.skullOn) });
    this.btnGhost = h("button", { type: "button", class: "tbi-btn", "aria-pressed": String(this.ghost), text: "See-through", onclick: () => this.setGhost(!this.ghost) });
    this.btnCut = h("button", { type: "button", class: "tbi-btn", "aria-pressed": String(this.cut), text: "Cutaway", onclick: () => this.setCut(!this.cut) });
    const toolbar = h("div", { class: "tbi-brain-toolbar", role: "group", "aria-label": "View options" }, [this.btnSkull, this.btnGhost, this.btnCut]);

    if (mode === "explore") {
      this.select = h("select", { class: "tbi-brain-select-input", id: `${this.id}-select`, onchange: (e) => this.selectRegion(+e.target.value, true) });
      this.select.append(h("option", { value: "0", text: "Choose a region…" }));
      const g1 = h("optgroup", { label: "Cortex (the surface)" });
      CORTEX_ORDER.forEach((r) => g1.append(h("option", { value: r, text: REGIONS[r].name })));
      const g2 = h("optgroup", { label: "Deep structures" });
      DEEP_ORDER.forEach((r) => g2.append(h("option", { value: r, text: REGIONS[r].name })));
      this.select.append(g1, g2);
      side.append(
        toolbar,
        h("label", { class: "tbi-brain-select", for: `${this.id}-select` }, [h("span", { class: "tbi-brain-label", text: "Region" }), this.select])
      );
    } else {
      this.dirBtns = {};
      const dirs = h("div", { class: "tbi-brain-dirs", role: "group", "aria-label": "Where the force comes from" });
      const list = mode === "shear" ? ["hook", "uppercut", "whiplash", "front", "side"] : SCENARIO_ORDER;
      list.forEach((k) => {
        const b = h("button", {
          type: "button",
          class: "tbi-btn",
          "aria-pressed": String(k === this.scenario),
          text: SCENARIOS[k].label,
          onclick: () => this.setScenario(k),
        });
        this.dirBtns[k] = b;
        dirs.append(b);
      });
      this.blurb = h("p", { class: "tbi-brain-blurb", text: SCENARIOS[this.scenario].blurb });
      this.sevOut = h("output", { class: "tbi-brain-sevout", text: String(this.severity) });
      this.sev = h("input", {
        type: "range",
        min: "1",
        max: "10",
        step: "1",
        value: String(this.severity),
        "aria-label": "Severity of the blow, 1 to 10 (unitless)",
        oninput: (e) => {
          this.severity = +e.target.value;
          this.sevOut.textContent = String(this.severity);
        },
      });
      const sevRow = h("label", { class: "tbi-range tbi-brain-sev" }, [h("span", { text: "Gentle" }), this.sev, h("span", { text: "Severe" }), this.sevOut]);
      this.strikeBtn = h("button", { type: "button", class: "tbi-btn tbi-brain-strike", text: mode === "shear" ? "Rotate" : "Strike", onclick: () => this.strike() });
      this.resetBtn = h("button", { type: "button", class: "tbi-btn", text: "Reset", onclick: () => this.resetSim() });
      this.readout = h("div", { class: "tbi-brain-readout", "aria-live": "polite" });
      side.append(
        h("div", { class: "tbi-brain-label", text: mode === "shear" ? "Kind of motion" : "Where the blow lands" }),
        dirs,
        this.blurb,
        h("div", { class: "tbi-brain-label", text: "Severity (illustrative, unitless)" }),
        sevRow,
        h("div", { class: "tbi-brain-actions" }, [this.strikeBtn, this.resetBtn]),
        this.readout,
        toolbar
      );
      // timeline over the canvas
      this.playBtn = h("button", { type: "button", class: "tbi-brain-iconbtn", "aria-label": "Play", html: "&#9654;", onclick: () => this.togglePlay() });
      this.scrub = h("input", {
        type: "range",
        min: "0",
        max: "1000",
        value: "0",
        step: "1",
        "aria-label": "Time since the start of the event",
        oninput: (e) => {
          this.playing = false;
          this.updatePlayBtn();
          this.setTime((+e.target.value / 1000) * SIM.duration);
        },
      });
      this.timeOut = h("span", { class: "tbi-brain-time", text: "0 ms" });
      this.timeline = h("div", { class: "tbi-brain-timeline", hidden: true }, [this.playBtn, this.scrub, this.timeOut]);
      this.canvasWrap.append(this.timeline);
    }
    this.info = h("div", { class: "tbi-brain-info", "aria-live": "polite" });
    side.append(this.info);

    const legend = h("div", { class: "tbi-legend tbi-brain-legend" });
    if (mode !== "explore") {
      legend.append(
        h("span", {}, [h("span", { class: "tbi-swatch tbi-brain-sw-bruise" }), "Bruising (contusion)"]),
        h("span", {}, [h("span", { class: "tbi-swatch tbi-brain-sw-dots" }), "Shearing (diffuse axonal injury)"])
      );
      if (mode === "shear") legend.append(h("span", {}, [h("span", { class: "tbi-swatch tbi-brain-sw-fibre" }), "Axon bundles (stylised)"]));
    } else {
      legend.append(h("span", {}, [h("span", { class: "tbi-swatch tbi-brain-sw-sel" }), "Selected region"]), h("span", {}, [h("span", { class: "tbi-swatch tbi-brain-sw-skull" }), "Skull base (anterior and middle fossae)"]));
    }
    const main = h("div", { class: "tbi-brain-main" }, [this.canvasWrap, legend]);
    el.append(main, side);
    this.renderInfo();
    if (mode !== "explore") this.renderReadout();
  }

  /* ---------------- init */
  async init() {
    if (this.started) return;
    this.started = true;
    let renderer;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", { antialias: true, alpha: true }) || canvas.getContext("webgl", { antialias: true, alpha: true });
      if (!gl) throw new Error("no webgl");
      renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      this.fail("This interactive 3D model needs WebGL, which this browser or device has turned off. The text around it describes what it shows.");
      return;
    }
    let data;
    try {
      data = await loadData();
    } catch (e) {
      this.fail("The brain model could not be loaded. Try reloading the page.");
      return;
    }
    this.data = data;
    this.renderer = renderer;
    renderer.localClippingEnabled = true;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = "tbi-brain-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("tabindex", "0");
    this.canvas = canvas;
    this.canvasWrap.prepend(canvas);
    this.loading.remove();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3000);
    this.head = new THREE.Group(); // skull frame (moves during an impact)
    this.brain = new THREE.Group(); // brain relative to skull
    this.head.add(this.brain);
    this.scene.add(this.head);
    this.clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    this.clipping = [];
    this.buildMeshes();
    if (this.mode === "shear") this.buildFibres();
    if (this.mode !== "explore") this.buildImpactor();

    const controls = new OrbitControls(this.camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 180;
    controls.maxDistance = 900;
    controls.addEventListener("start", () => {
      this.autoRotate = false;
      this.cancelTween();
    });
    controls.addEventListener("change", () => (this.dirty = true));
    this.controls = controls;
    // One-finger vertical drags keep scrolling the page; horizontal drags turn the brain.
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        this.zoom(e.deltaY > 0 ? 1.08 : 0.92);
      },
      { passive: false }
    );
    this.bindPointer();
    this.bindKeys();

    this.applyPalette();
    onThemeChange(() => {
      this.applyPalette();
      this.dirty = true;
    });
    this.resetView(false);
    this.autoRotate = this.mode === "explore" && !reduceMotion;
    this.resize();
    new ResizeObserver(() => this.resize()).observe(this.canvasWrap);
    watchVisibility(this.el, (v) => {
      this.visible = v;
      if (v) this.loop();
    });
    document.addEventListener("visibilitychange", () => !document.hidden && this.visible && this.loop());
    this.visible = true;
    this.updateAria();
    this.applyCut();
    this.loop();
  }

  fail(msg) {
    this.loading.textContent = msg;
    this.loading.classList.add("is-error");
    this.el.classList.add("is-fallback");
  }

  /* ---------------- meshes */
  tissueMaterial(opts = {}) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: TISSUE_VERT,
      fragmentShader: TISSUE_FRAG,
      uniforms: {
        uGyrus: { value: new THREE.Vector3() },
        uSulcus: { value: new THREE.Vector3() },
        uCut: { value: new THREE.Vector3() },
        uTheme: { value: new THREE.Vector3() },
        uInjury: { value: new THREE.Vector3() },
        uRim: { value: new THREE.Vector3() },
        uSSS: { value: new THREE.Vector3() },
        uTint: { value: new THREE.Vector3() },
        uTintMix: { value: opts.tintMix || 0 },
        uSel: { value: -1 },
        uHov: { value: -1 },
        uGhost: { value: 0 },
        uOpacity: { value: 1 },
        uFolia: { value: opts.folia ? 1 : 0 },
        uFoliaC: { value: opts.foliaC || new THREE.Vector3() },
        uShearAll: { value: 0 },
        uDark: { value: 0 },
        uSulcAmt: { value: opts.sulcAmt ?? 1 },
      },
      clipping: true,
      side: THREE.DoubleSide,
    });
    mat.userData.tint = opts.tint;
    return mat;
  }

  buildMeshes() {
    const { meshes } = this.data;
    this.tissue = [];
    this.pickables = [];
    const heatTotal = this.data.contact.total;
    this.heat = new Float32Array(heatTotal);
    this.shearV = new Float32Array(heatTotal);
    const makeGeom = (m) => {
      const g = new THREE.BufferGeometry();
      for (const k of ["position", "normal", "aRegion", "aSulc"]) g.setAttribute(k, m.geometry.getAttribute(k));
      g.setIndex(m.geometry.index);
      g.boundingSphere = m.geometry.boundingSphere;
      const off = this.data.contact.offsets[m.name];
      const heat = off !== undefined ? new THREE.BufferAttribute(this.heat.subarray(off, off + m.count), 1) : new THREE.BufferAttribute(new Float32Array(m.count), 1);
      const shear = off !== undefined ? new THREE.BufferAttribute(this.shearV.subarray(off, off + m.count), 1) : new THREE.BufferAttribute(new Float32Array(m.count), 1);
      heat.setUsage(THREE.DynamicDrawUsage);
      shear.setUsage(THREE.DynamicDrawUsage);
      g.setAttribute("aHeat", heat);
      g.setAttribute("aShear", shear);
      return g;
    };
    this.meshByName = {};
    for (const name of ["cortex_left", "cortex_right"]) {
      const mat = this.tissueMaterial();
      const mesh = new THREE.Mesh(makeGeom(meshes[name]), mat);
      mesh.renderOrder = 2;
      mesh.userData = { name, cortex: true };
      this.brain.add(mesh);
      this.tissue.push(mesh);
      this.pickables.push(mesh);
      this.meshByName[name] = mesh;
    }
    const cerebC = new THREE.Vector3(0, -38 - 15.41, 52 - 17.77);
    for (const name of ["corpus_callosum", "thalamus", "basal_ganglia", "hippocampus", "amygdala", "ventricles", "brainstem", "cerebellum"]) {
      const m = meshes[name];
      const rid = m.geometry.getAttribute("aRegion").array[0];
      const mat = this.tissueMaterial({ tint: TINTS[rid], tintMix: name === "cerebellum" ? 0.15 : name === "brainstem" ? 0.35 : 0.55, folia: name === "cerebellum", foliaC: cerebC, sulcAmt: 0 });
      const mesh = new THREE.Mesh(makeGeom(m), mat);
      mesh.userData = { name, region: rid, deep: name !== "cerebellum" && name !== "brainstem" };
      mesh.renderOrder = 1;
      this.brain.add(mesh);
      this.tissue.push(mesh);
      this.pickables.push(mesh);
      this.meshByName[name] = mesh;
    }
    // skull: outer glass (back faces then front faces), and the inner table (skull base) underneath
    const glass = (inner, side) =>
      new THREE.ShaderMaterial({
        vertexShader: GLASS_VERT,
        fragmentShader: GLASS_FRAG,
        uniforms: {
          uGlass: { value: new THREE.Vector3() },
          uEdge: { value: new THREE.Vector3() },
          uBone: { value: new THREE.Vector3() },
          uInjury: { value: new THREE.Vector3() },
          uOpacity: { value: 1 },
          uInner: { value: inner ? 1 : 0 },
          uHit: { value: new THREE.Vector3(0, 0, -200) },
          uRing: { value: 0 },
          uRingA: { value: 0 },
          uSolid: { value: 0 },
          uDark: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side,
        clipping: true,
      });
    this.skull = new THREE.Group();
    const outerG = meshes.skull_outer.geometry;
    const innerG = meshes.skull_inner.geometry;
    this.skullInner = new THREE.Mesh(innerG, glass(true, THREE.DoubleSide));
    this.skullInner.renderOrder = 6;
    this.skullBack = new THREE.Mesh(outerG, glass(false, THREE.BackSide));
    this.skullBack.renderOrder = 7;
    this.skullFront = new THREE.Mesh(outerG, glass(false, THREE.FrontSide));
    this.skullFront.renderOrder = 8;
    this.skull.add(this.skullInner, this.skullBack, this.skullFront);
    this.head.add(this.skull);
    this.skullMats = [this.skullInner.material, this.skullBack.material, this.skullFront.material];
    this.setSkull(this.skullOn, true);
    this.setGhost(this.ghost, true);
  }

  buildFibres() {
    const fibres = this.data.fibres;
    const radial = 5;
    let nv = 0;
    fibres.forEach((f) => (nv += f.pts.length * radial));
    const pos = new Float32Array(nv * 3),
      nor = new Float32Array(nv * 3),
      cen = new Float32Array(nv * 3),
      fid = new Float32Array(nv),
      tt = new Float32Array(nv);
    const idx = [];
    let v = 0;
    const tan = new THREE.Vector3(),
      a = new THREE.Vector3(),
      b = new THREE.Vector3(),
      up = new THREE.Vector3();
    fibres.forEach((f, fi) => {
      const P = f.pts;
      const r = f.kind === 0 ? 0.45 : 0.6;
      const base = v;
      for (let k = 0; k < P.length; k++) {
        tan.subVectors(P[Math.min(k + 1, P.length - 1)], P[Math.max(k - 1, 0)]).normalize();
        up.set(0, 1, 0);
        if (Math.abs(tan.dot(up)) > 0.9) up.set(1, 0, 0);
        a.crossVectors(tan, up).normalize();
        b.crossVectors(tan, a).normalize();
        for (let j = 0; j < radial; j++) {
          const ang = (j / radial) * Math.PI * 2;
          const nx = a.x * Math.cos(ang) + b.x * Math.sin(ang),
            ny = a.y * Math.cos(ang) + b.y * Math.sin(ang),
            nz = a.z * Math.cos(ang) + b.z * Math.sin(ang);
          nor.set([nx, ny, nz], v * 3);
          pos.set([P[k].x + nx * r, P[k].y + ny * r, P[k].z + nz * r], v * 3);
          cen.set([P[k].x, P[k].y, P[k].z], v * 3);
          fid[v] = fi;
          tt[v] = k / (P.length - 1);
          v++;
        }
      }
      for (let k = 0; k < P.length - 1; k++)
        for (let j = 0; j < radial; j++) {
          const i0 = base + k * radial + j,
            i1 = base + k * radial + ((j + 1) % radial),
            i2 = i0 + radial,
            i3 = i1 + radial;
          idx.push(i0, i2, i1, i1, i2, i3);
        }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("aCentre", new THREE.BufferAttribute(cen, 3));
    g.setAttribute("aFid", new THREE.BufferAttribute(fid, 1));
    g.setAttribute("aT", new THREE.BufferAttribute(tt, 1));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const NF = fibres.length;
    this.fibreState = new Uint8Array(NF * 4);
    // per-fibre: threshold jitter, break point, sensitivity by site
    const rng = mulberry32(11);
    this.fibreInfo = fibres.map((f) => ({
      kind: f.kind,
      jitter: 0.78 + rng() * 0.44,
      tb: 0.3 + rng() * 0.4,
      mid: f.pts[Math.floor(f.pts.length / 2)],
    }));
    this.fibreInfo.forEach((fi, i) => {
      this.fibreState[i * 4 + 2] = Math.round(fi.tb * 255);
      this.fibreState[i * 4 + 3] = fi.kind * 100;
    });
    this.fibreTex = new THREE.DataTexture(this.fibreState, NF, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.fibreTex.needsUpdate = true;
    const mat = new THREE.ShaderMaterial({
      vertexShader: FIBRE_VERT,
      fragmentShader: FIBRE_FRAG,
      uniforms: {
        uState: { value: this.fibreTex },
        uNF: { value: NF },
        uPhi: { value: new THREE.Vector3() },
        uRadius: { value: 0.5 },
        uTime: { value: 0 },
        uFibre: { value: new THREE.Vector3() },
        uFibre2: { value: new THREE.Vector3() },
        uStrainCol: { value: new THREE.Vector3() },
        uInjury: { value: new THREE.Vector3() },
        uOpacity: { value: 1 },
      },
      clipping: true,
    });
    // the shader rebuilds the tube from aCentre + normal * radius
    this.fibres = new THREE.Mesh(g, mat);
    this.fibres.renderOrder = 1;
    this.brain.add(this.fibres);
  }

  buildImpactor() {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    this.impactor = new THREE.Mesh(new THREE.SphereGeometry(22, 32, 20), mat);
    this.impactor.visible = false;
    this.scene.add(this.impactor);
    // curved arrow showing rotation
    const arc = new THREE.Group();
    const arcMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(118, 2.2, 8, 64, Math.PI * 0.75), arcMat);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(7, 18, 16), arcMat);
    const end = Math.PI * 0.75;
    cone.position.set(Math.cos(end) * 118, Math.sin(end) * 118, 0);
    cone.rotation.z = end;
    arc.add(torus, cone);
    arc.visible = false;
    this.arcMat = arcMat;
    this.arc = arc;
    this.scene.add(arc);
  }

  /* ---------------- palette */
  applyPalette() {
    const P = (this.palette = readPalette(this.el));
    for (const m of this.tissue) {
      const u = m.material.uniforms;
      u.uGyrus.value.copy(P.gyrus);
      u.uSulcus.value.copy(P.sulcus);
      u.uCut.value.copy(P.cut);
      u.uTheme.value.copy(P.theme);
      u.uInjury.value.copy(P.injury);
      u.uRim.value.copy(P.rim);
      u.uSSS.value.copy(P.sss);
      u.uDark.value = P.dark ? 1 : 0;
      const t = m.material.userData.tint;
      if (t) u.uTint.value.copy(m.userData.region === 20 ? P.csf : mix3(parseColour(t), P.gyrus, P.dark ? 0.25 : 0));
    }
    for (const mat of this.skullMats) {
      const u = mat.uniforms;
      u.uGlass.value.copy(P.glass);
      u.uEdge.value.copy(P.edge);
      u.uBone.value.copy(P.bone);
      u.uInjury.value.copy(P.injury);
      u.uDark.value = P.dark ? 1 : 0;
    }
    if (this.fibres) {
      const u = this.fibres.material.uniforms;
      u.uFibre.value.copy(P.fibre);
      u.uFibre2.value.copy(P.fibre2);
      u.uStrainCol.value.copy(P.strain);
      u.uInjury.value.copy(P.injury);
    }
    if (this.impactor) {
      this.impactor.material.color.setRGB(P.text.x, P.text.y, P.text.z);
      this.arcMat.color.setRGB(P.injury.x, P.injury.y, P.injury.z);
    }
    this.dirty = true;
  }

  /* ---------------- view state */
  setSkull(on, silent) {
    this.skullOn = on;
    this.btnSkull.setAttribute("aria-pressed", String(on));
    if (this.skull) this.skull.visible = on;
    if (!silent) this.updateAria();
    this.dirty = true;
  }

  setGhost(on, silent) {
    this.ghost = on;
    this.btnGhost.setAttribute("aria-pressed", String(on));
    if (this.tissue) {
      for (const m of this.tissue) {
        const cortexLike = m.userData.cortex || m.userData.name === "cerebellum";
        const g = on && cortexLike;
        m.material.uniforms.uGhost.value = g ? 1 : 0;
        m.material.transparent = g || m.userData.region === 20;
        m.material.depthWrite = !g && m.userData.region !== 20;
        m.material.uniforms.uOpacity.value = m.userData.region === 20 ? 0.6 : 1;
        m.renderOrder = g ? 4 : m.userData.region === 20 ? 3 : m.userData.cortex ? 2 : 1;
        m.material.needsUpdate = true;
      }
    }
    if (!silent) this.updateAria();
    this.dirty = true;
  }

  setCut(on) {
    this.cut = on;
    this.btnCut.setAttribute("aria-pressed", String(on));
    this.applyCut(true);
  }

  cutPlaneKind() {
    if (this.mode === "explore") return "sagittal";
    return SCENARIOS[this.scenario].cut;
  }

  applyCut(animate) {
    if (!this.scene) return;
    const kind = this.cutPlaneKind();
    const camPos = this.camera.position.clone().sub(this.controls.target);
    let goal = null;
    if (this.cut) {
      if (kind === "sagittal") {
        // remove the hemisphere facing the camera
        const s = camPos.x >= 0 ? 1 : -1;
        this.clipPlane.set(new THREE.Vector3(-s, 0, 0), -0.5 * s);
        this.meshByName.cortex_right.visible = s < 0;
        this.meshByName.cortex_left.visible = s > 0;
        goal = new THREE.Vector3(s * 1, 0.08, -0.1);
      } else {
        // coronal cut through the temporal poles and middle cranial fossae, seen from the front
        this.clipPlane.set(new THREE.Vector3(0, 0, 1), 9);
        this.meshByName.cortex_right.visible = true;
        this.meshByName.cortex_left.visible = true;
        goal = new THREE.Vector3(0, 0.12, -1);
      }
    } else {
      this.meshByName.cortex_right.visible = true;
      this.meshByName.cortex_left.visible = true;
    }
    const planes = this.cut ? [this.clipPlane] : [];
    const clipCortex = this.cut && kind === "coronal";
    for (const m of this.tissue) m.material.clippingPlanes = m.userData.cortex && !clipCortex ? [] : planes;
    for (const mat of this.skullMats) {
      mat.clippingPlanes = planes;
      mat.uniforms.uSolid.value = this.cut ? 1 : 0;
      mat.transparent = !this.cut;
      mat.depthWrite = this.cut;
      mat.side = this.cut ? THREE.DoubleSide : mat === this.skullBack.material ? THREE.BackSide : mat === this.skullFront.material ? THREE.FrontSide : THREE.DoubleSide;
      mat.needsUpdate = true;
    }
    if (this.cut) this.skullBack.visible = false;
    else this.skullBack.visible = true;
    if (this.fibres) this.fibres.material.clippingPlanes = [];
    if (goal && animate) this.tweenTo(goal.normalize(), this.camera.position.distanceTo(this.controls.target));
    this.updateAria();
    this.dirty = true;
  }

  defaultDir() {
    if (this.mode === "impact") return new THREE.Vector3(-1, 0.22, -0.42).normalize();
    if (this.mode === "shear") return new THREE.Vector3(-0.75, 0.42, -0.6).normalize();
    return new THREE.Vector3(-0.8, 0.35, -0.62).normalize();
  }

  resetView(animate) {
    const dir = this.defaultDir();
    const dist = this.fitDistance();
    this.controls.target.set(0, -6, 0);
    if (animate) this.tweenTo(dir, dist);
    else {
      this.camera.position.copy(dir.multiplyScalar(dist)).add(this.controls.target);
      this.controls.update();
    }
    this.dirty = true;
  }

  fitDistance() {
    const aspect = this.width && this.height ? this.width / this.height : 1.4;
    const r = 112; // radius of the skull, mm
    const fov = (this.camera.fov * Math.PI) / 180;
    const dV = r / Math.sin(fov / 2);
    const dH = r / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));
    return Math.max(dV, dH) * 0.98;
  }

  zoom(f) {
    const off = this.camera.position.clone().sub(this.controls.target);
    const d = clamp(off.length() * f, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).add(off.setLength(d));
    this.autoRotate = false;
    this.dirty = true;
  }

  tweenTo(dir, dist) {
    const from = this.camera.position.clone().sub(this.controls.target);
    const fromLen = from.length();
    const fromDir = from.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(fromDir, dir.clone().normalize());
    if (reduceMotion) {
      this.camera.position.copy(dir.clone().normalize().multiplyScalar(dist)).add(this.controls.target);
      this.dirty = true;
      return;
    }
    this.tween = { start: performance.now(), dur: 900, fromDir, q, fromLen, dist };
    this.autoRotate = false;
  }

  cancelTween() {
    this.tween = null;
  }

  stepTween(now) {
    const tw = this.tween;
    if (!tw) return;
    const k = clamp((now - tw.start) / tw.dur, 0, 1);
    const e = smooth(k);
    const q = new THREE.Quaternion().slerp(tw.q, e);
    const dir = tw.fromDir.clone().applyQuaternion(q);
    const len = tw.fromLen + (tw.dist - tw.fromLen) * e;
    this.camera.position.copy(dir.multiplyScalar(len)).add(this.controls.target);
    this.dirty = true;
    if (k >= 1) this.tween = null;
  }

  resize() {
    if (!this.renderer) return;
    const r = this.canvasWrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)),
      hgt = Math.max(1, Math.round(r.height));
    if (w === this.width && hgt === this.height) return;
    const first = !this.width;
    this.width = w;
    this.height = hgt;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 600 ? 1.75 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, hgt, false);
    this.camera.aspect = w / hgt;
    this.camera.updateProjectionMatrix();
    if (first) this.resetView(false);
    this.dirty = true;
  }

  /* ---------------- picking */
  bindPointer() {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down = null;
    const pick = (e) => {
      const r = this.canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, this.camera);
      const objs = this.pickables.filter((m) => m.visible && (!this.ghost || !m.userData.cortex || DEEP.has(this.selected) === false || true));
      const hits = ray.intersectObjects(objs, false);
      for (const hit of hits) {
        const m = hit.object;
        if (this.cut && m.material.clippingPlanes.length) {
          const p = hit.point.clone();
          this.head.worldToLocal(p);
          if (this.clipPlane.distanceToPoint(p) < 0) continue;
        }
        if (this.ghost && m.userData.cortex) {
          // in see-through mode, prefer deep structures behind the translucent cortex
          const deeper = hits.find((x) => !x.object.userData.cortex && x.object.visible);
          if (deeper) return deeper.object.userData.region;
        }
        if (m.userData.region) return m.userData.region;
        const reg = m.geometry.getAttribute("aRegion").array;
        const f = hit.face;
        const votes = [reg[f.a], reg[f.b], reg[f.c]];
        return votes[0] === votes[1] || votes[0] === votes[2] ? votes[0] : votes[1];
      }
      return 0;
    };
    this.canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || e.buttons) return;
      const r = pick(e);
      if (r !== this.hovered) {
        this.hovered = r;
        this.canvas.style.cursor = r ? "pointer" : "grab";
        this.dirty = true;
      }
    });
    this.canvas.addEventListener("pointerleave", () => {
      this.hovered = 0;
      this.dirty = true;
    });
    this.canvas.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY, t: performance.now() }));
    this.canvas.addEventListener("pointerup", (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return;
      const r = pick(e);
      this.selectRegion(r === this.selected ? 0 : r, false);
    });
  }

  bindKeys() {
    this.canvas.addEventListener("keydown", (e) => {
      const step = 0.12;
      const off = this.camera.position.clone().sub(this.controls.target);
      const sph = new THREE.Spherical().setFromVector3(off);
      let handled = true;
      if (e.key === "ArrowLeft") sph.theta -= step;
      else if (e.key === "ArrowRight") sph.theta += step;
      else if (e.key === "ArrowUp") sph.phi = clamp(sph.phi - step, 0.1, Math.PI - 0.1);
      else if (e.key === "ArrowDown") sph.phi = clamp(sph.phi + step, 0.1, Math.PI - 0.1);
      else if (e.key === "+" || e.key === "=") return this.zoom(0.88), e.preventDefault();
      else if (e.key === "-" || e.key === "_") return this.zoom(1.12), e.preventDefault();
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      this.autoRotate = false;
      this.camera.position.setFromSpherical(sph).add(this.controls.target);
      this.dirty = true;
    });
  }

  selectRegion(r, fromSelect) {
    this.selected = r || 0;
    if (this.select && !fromSelect) this.select.value = String(this.selected);
    if (DEEP.has(this.selected) && this.selected !== 19 && !this.ghost && !this.cut) this.setGhost(true);
    this.autoRotate = false;
    this.renderInfo();
    this.updateAria();
    this.dirty = true;
  }

  renderInfo() {
    const r = REGIONS[this.selected];
    this.info.innerHTML = "";
    if (!r) {
      if (this.mode === "explore") {
        this.info.append(
          h("p", {
            class: "tbi-brain-empty",
            text: "Tap or click any part of the brain, or choose from the list, to see what it does and how an injury there tends to show up. Turn on See-through or Cutaway to reach the deep structures.",
          })
        );
      } else {
        this.info.append(h("p", { class: "tbi-brain-empty", text: "After a strike, tap a bruised region to read what it does." }));
      }
      return;
    }
    const kids = [
      h("div", { class: "tbi-brain-info-name", text: r.name }),
      h("p", { class: "tbi-brain-info-where", text: r.where }),
      h("div", { class: "tbi-brain-label", text: "What it does" }),
      h("p", { text: r.does }),
      h("div", { class: "tbi-brain-label", text: "When it is injured" }),
      h("p", { text: r.injury }),
    ];
    this.info.append(...kids);
  }

  /* ---------------- impact */
  setScenario(k) {
    this.scenario = k;
    for (const [key, b] of Object.entries(this.dirBtns)) b.setAttribute("aria-pressed", String(key === k));
    this.blurb.textContent = SCENARIOS[k].blurb;
    if (this.cut) this.applyCut(true);
  }

  resetSim() {
    this.result = null;
    this.playing = false;
    this.heat.fill(0);
    this.shearV.fill(0);
    this.markHeat();
    for (const m of this.tissue) m.material.uniforms.uShearAll.value = 0;
    if (this.fibreState) {
      for (let i = 0; i < this.fibreInfo.length; i++) (this.fibreState[i * 4] = 0), (this.fibreState[i * 4 + 1] = 0);
      this.fibreTex.needsUpdate = true;
      this.fibres.material.uniforms.uPhi.value.set(0, 0, 0);
    }
    this.head.position.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
    this.brain.position.set(0, 0, 0);
    this.brain.rotation.set(0, 0, 0);
    if (this.impactor) (this.impactor.visible = false), (this.arc.visible = false);
    for (const m of this.skullMats) m.uniforms.uRingA.value = 0;
    this.timeline.hidden = true;
    this.renderReadout();
    this.updateAria();
    this.dirty = true;
  }

  strike() {
    if (!this.data) return;
    this.resetSim();
    const res = simulate(this.data, this.scenario, this.severity);
    this.result = res;
    // bruise snapshots, shear sensitivity
    res.bruiseKeys = [];
    const final = heatToBruise(this.data, res.keys[res.keys.length - 1], new Float32Array(this.data.contact.total));
    res.final = final;
    this.prepareShear(res);
    res.summary = this.summarise(res);
    this.timeline.hidden = false;
    const S = SCENARIOS[this.scenario];
    // impact site on the outer skull
    const dir = new THREE.Vector3(...S.site).normalize();
    const pos = this.data.meshes.skull_outer.pos;
    let best = -Infinity;
    const hit = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
      const d = pos[i] * dir.x + pos[i + 1] * dir.y + pos[i + 2] * dir.z;
      if (d > best) (best = d), hit.set(pos[i], pos[i + 1], pos[i + 2]);
    }
    if (!S.impactor) hit.copy(dir).multiplyScalar(best + 12);
    res.hit = hit;
    for (const m of this.skullMats) m.uniforms.uHit.value.copy(hit);
    if (reduceMotion) {
      this.setTime(SIM.duration);
      this.playing = false;
    } else {
      this.playStart = performance.now();
      this.playT = 0;
      this.playing = true;
    }
    this.updatePlayBtn();
    this.autoRotate = false;
    this.dirty = true;
  }

  prepareShear(res) {
    // sensitivity per site: grey-white junction < corpus callosum < brainstem (the order of Adams' DAI grades)
    const axis = res.axis.lengthSq() > 0 ? res.axis : new THREE.Vector3(1, 0, 0);
    const W = [1.0, 0.72, 0.5];
    const PHI0 = 0.0125; // core-lag rotation (rad) at which a typical grey-white fibre reaches threshold
    const lever = (p) => clamp(new THREE.Vector3().crossVectors(axis, p).length() / 70, 0.25, 1.2);
    res.phiScale = 1 / PHI0;
    if (this.fibreInfo) res.fibreSens = this.fibreInfo.map((f) => (W[f.kind] * (f.kind === 0 ? lever(f.mid) : 0.8 + 0.2 * lever(f.mid))) / f.jitter);
    // cortical speckles (grey-white junction) per contact-mesh vertex
    const { meshes, contact } = this.data;
    res.vertSens = new Float32Array(contact.total);
    const rng = mulberry32(5);
    for (const name of CONTACT_MESHES) {
      const m = meshes[name];
      const off = contact.offsets[name];
      const p = new THREE.Vector3();
      for (let i = 0; i < m.count; i++) {
        p.fromArray(m.pos, i * 3);
        res.vertSens[off + i] = name.startsWith("cortex") ? W[0] * lever(p) * (0.75 + 0.5 * rng()) : name === "brainstem" ? W[2] : W[0] * 0.8 * lever(p);
      }
    }
    // structure-level shear (corpus callosum, brainstem)
    res.ccSens = W[1];
    res.bsSens = W[2];
  }

  summarise(res) {
    const { meshes, contact } = this.data;
    const S = SCENARIOS[res.scenario];
    const site = new THREE.Vector3(...S.site).normalize();
    const out = [];
    for (const name of ["cortex_left", "cortex_right", "cerebellum"]) {
      const m = meshes[name];
      const off = contact.offsets[name];
      const reg = m.geometry.getAttribute("aRegion").array;
      const acc = {};
      for (let i = 0; i < m.count; i++) {
        const b = res.final[off + i];
        if (b < 0.3) continue;
        const r = name === "cerebellum" ? 19 : reg[i];
        if (!r) continue;
        const a = (acc[r] = acc[r] || { n: 0, sum: 0, p: new THREE.Vector3() });
        a.n++;
        a.sum += b;
        a.p.x += m.pos[i * 3] * b;
        a.p.y += m.pos[i * 3 + 1] * b;
        a.p.z += m.pos[i * 3 + 2] * b;
      }
      for (const [r, a] of Object.entries(acc)) {
        if (a.n < 6) continue;
        a.p.divideScalar(a.sum);
        const side = name === "cortex_left" ? "left" : name === "cortex_right" ? "right" : "";
        const where = a.p.clone().normalize().dot(site);
        out.push({ region: +r, side, score: a.sum, where });
      }
    }
    out.sort((a, b) => b.score - a.score);
    const phi = res.maxPhi * res.phiScale;
    const levels = { gwj: phi * 1.0 >= 1, cc: phi * res.ccSens >= 1, bs: phi * res.bsSens >= 1 };
    return { bruised: out, phi, levels, pen: res.maxPen };
  }

  togglePlay() {
    if (!this.result) return;
    if (this.playing) this.playing = false;
    else {
      if (this.playT >= SIM.duration - 0.01) this.playT = 0;
      this.playStart = performance.now() - this.playT * this.msPerSimMs();
      this.playing = true;
    }
    this.updatePlayBtn();
    this.dirty = true;
  }

  msPerSimMs() {
    return 6500 / SIM.duration; // ~70x slow motion
  }

  updatePlayBtn() {
    if (!this.playBtn) return;
    this.playBtn.innerHTML = this.playing ? "&#10074;&#10074;" : "&#9654;";
    this.playBtn.setAttribute("aria-label", this.playing ? "Pause" : "Play");
  }

  markHeat() {
    for (const m of this.tissue) {
      m.geometry.getAttribute("aHeat").needsUpdate = true;
      m.geometry.getAttribute("aShear").needsUpdate = true;
    }
  }

  setTime(t) {
    const res = this.result;
    if (!res) return;
    t = clamp(t, 0, SIM.duration);
    this.playT = t;
    const fi = Math.min(res.frames.length - 1, Math.round(t / (SIM.dt * SIM.frameEvery)));
    const f = res.frames[fi];
    // poses
    const pivot = this.data.pivot;
    const S = SCENARIOS[res.scenario];
    const vis = 2.2; // head motion is shrunk for display; brain-in-skull motion is shown at model scale
    this.head.position.copy(f.sp).multiplyScalar(0.18 * vis);
    const rq = new THREE.Quaternion().setFromAxisAngle(f.sr.clone().normalize(), Math.min(f.sr.length() * vis, 0.6));
    if (f.sr.lengthSq() < 1e-12) rq.identity();
    this.head.quaternion.copy(rq);
    // rotate about the neck pivot: p' = R (p - pivot) + pivot
    const pv = pivot.clone().applyQuaternion(rq);
    this.head.position.add(pivot.clone().sub(pv));
    this.brain.position.copy(f.u);
    const bq = new THREE.Quaternion();
    if (f.th.lengthSq() > 1e-12) bq.setFromAxisAngle(f.th.clone().normalize(), f.th.length());
    this.brain.quaternion.copy(bq);
    // bruises so far: interpolate between snapshots, then add instantaneous contact glow
    const kf = fi / SIM.keyEvery;
    const k0 = Math.floor(kf);
    const key = res.keys[Math.min(k0 + 1, res.keys.length - 1)];
    if (this._lastKey !== key) {
      this._lastKey = key;
      heatToBruise(this.data, key, this.heat);
      this._baseHeat = this.heat.slice();
    } else this.heat.set(this._baseHeat);
    if (fi === res.frames.length - 1) this.heat.set(res.final);
    // live contact flash
    const { N, r, n, g, target } = this.data.contact;
    const u = f.u,
      th = f.th;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const dx = u.x + th.y * r[i3 + 2] - th.z * r[i3 + 1];
      const dy = u.y + th.z * r[i3] - th.x * r[i3 + 2];
      const dz = u.z + th.x * r[i3 + 1] - th.y * r[i3];
      const p = dx * n[i3] + dy * n[i3 + 1] + dz * n[i3 + 2] - g[i];
      if (p > -0.3) this.heat[target[i]] = Math.max(this.heat[target[i]], clamp((p + 0.3) * 0.9, 0, 0.75));
    }
    // shear so far
    const phi = f.maxPhi * res.phiScale;
    for (let i = 0; i < this.shearV.length; i++) this.shearV[i] = clamp(phi * res.vertSens[i] - 1, 0, 1) * 1.6;
    const cc = clamp(phi * res.ccSens - 1, 0, 1) * 1.4;
    const bs = clamp(phi * res.bsSens - 1, 0, 1) * 1.4;
    for (const m of this.tissue) {
      const nm = m.userData.name;
      m.material.uniforms.uShearAll.value = nm === "corpus_callosum" ? cc : nm === "brainstem" ? bs : nm === "thalamus" || nm === "basal_ganglia" ? cc * 0.5 : 0;
    }
    this.markHeat();
    // fibres
    if (this.fibreState) {
      const nowPhi = f.ph.length() * res.phiScale;
      res.fibreSens.forEach((s, i) => {
        const strain = clamp(nowPhi * s, 0, 1.6);
        const dmg = phi * s >= 1 ? 1 : 0;
        this.fibreState[i * 4] = Math.round(clamp(strain / 1.0, 0, 1) * 255);
        this.fibreState[i * 4 + 1] = dmg * 255;
      });
      this.fibreTex.needsUpdate = true;
      this.fibres.material.uniforms.uPhi.value.copy(f.ph).multiplyScalar(4); // deformation exaggerated x4
    }
    // impactor and rotation arrow
    const pulseT = (t - SIM.t0) / SIM.pulse;
    if (this.impactor) {
      const site = new THREE.Vector3(...S.site).normalize();
      if (S.impactor) {
        this.impactor.visible = true;
        const approach = clamp(1 - (t + 0.0) / SIM.t0, 0, 1);
        const after = clamp((t - SIM.t0 - SIM.pulse) / 30, 0, 1);
        const gap = 22 + approach * 120 + after * 60;
        this.impactor.position.copy(res.hit).add(this.head.position).addScaledVector(site, gap);
        this.impactor.material.opacity = (this.palette.dark ? 0.32 : 0.22) * (1 - after);
      }
      const rotOn = !S.impactor;
      this.arc.visible = rotOn;
      if (rotOn) {
        const axis = res.axis;
        this.arc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
        this.arc.position.set(0, 0, 0);
        const env = clamp(t / SIM.t0, 0, 1) * (1 - clamp((t - SIM.t0 - (S.whiplash ? 34 : SIM.pulse)) / 25, 0, 1));
        this.arcMat.opacity = 0.75 * env;
        this.arc.rotation.z += 0; // orientation fixed; spin handled below
        const spin = new THREE.Quaternion().setFromAxisAngle(axis, -Math.PI * 0.35 + clamp(pulseT, 0, 1) * 0.6);
        this.arc.quaternion.premultiply(spin);
      }
    }
    const ring = clamp((t - SIM.t0) / 14, 0, 1);
    for (const m of this.skullMats) {
      m.uniforms.uRing.value = ring * 60;
      m.uniforms.uRingA.value = S.impactor && t > SIM.t0 ? (1 - ring) * 0.9 : 0;
    }
    if (this.scrub) this.scrub.value = String(Math.round((t / SIM.duration) * 1000));
    if (this.timeOut) this.timeOut.textContent = `${t.toFixed(t < 10 ? 1 : 0)} ms`;
    if (t >= SIM.duration - 1e-6 || fi === res.frames.length - 1) {
      if (!this._summaryShown) {
        this._summaryShown = true;
        this.renderReadout(res.summary);
        this.updateAria();
      }
    } else {
      this._summaryShown = false;
      this.renderReadout(null, f, res);
    }
    this.dirty = true;
  }

  renderReadout(sum, frame, res) {
    if (!this.readout) return;
    const ro = this.readout;
    ro.innerHTML = "";
    const bar = (label, val, ticks, cls) => {
      const track = h("div", { class: "tbi-brain-bar" }, [h("div", { class: `tbi-brain-bar-fill ${cls}`, style: `width:${clamp(val, 0, 1) * 100}%` })]);
      (ticks || []).forEach(([x, name]) => track.append(h("span", { class: "tbi-brain-tick", style: `left:${x * 100}%`, title: name, "data-label": name })));
      return h("div", { class: "tbi-brain-barrow" }, [h("div", { class: "tbi-brain-barlabel", text: label }), track]);
    };
    const W = [1.0, 0.72, 0.5];
    const SHEAR_MAX = 1 / W[2] + 0.3;
    const ticks = [
      [1 / W[0] / SHEAR_MAX, "grey–white junction"],
      [1 / W[1] / SHEAR_MAX, "corpus callosum"],
      [1 / W[2] / SHEAR_MAX, "brainstem"],
    ];
    if (!sum && !frame) {
      ro.append(h("p", { class: "tbi-brain-status", html: `<strong>Skull:</strong> intact` }), h("p", { class: "tbi-brain-empty", text: "Choose where the force comes from and how hard, then press " + (this.mode === "shear" ? "Rotate." : "Strike.") }));
      ro.append(bar("Compression against bone", 0, null, "is-bruise"), bar("Rotational shear", 0, ticks, "is-shear"));
      return;
    }
    if (frame) {
      const phase = frame.t < SIM.t0 ? "Before the blow" : frame.load > 0.02 ? "Skull accelerating" : frame.contact > 0 ? "Brain striking the skull" : "Brain moving in its fluid";
      ro.append(h("p", { class: "tbi-brain-status", html: `<strong>Skull:</strong> intact · <span class="tbi-brain-phase">${phase}</span>` }));
      ro.append(bar("Compression against bone", Math.min(1, frame.maxPen / 2.2), null, "is-bruise"), bar("Rotational shear", (frame.maxPhi * res.phiScale) / SHEAR_MAX, ticks, "is-shear"));
      return;
    }
    const nm = (b) => `${b.side ? b.side + " " : ""}${REGIONS[b.region].name.toLowerCase()}`;
    const S = SCENARIOS[this.result.scenario];
    const linearish = S.impactor;
    const bl = sum.bruised.slice(0, 6).map((b) => {
      let tag = "";
      if (linearish) tag = b.where > 0.35 ? " (impact side)" : b.where < -0.35 ? " (opposite side)" : "";
      return `<li><button type="button" class="tbi-brain-linkbtn" data-region="${b.region}">${nm(b)}</button>${tag}</li>`;
    });
    ro.append(h("p", { class: "tbi-brain-status", html: `<strong>Skull:</strong> intact, no fracture` }));
    if (bl.length) ro.append(h("div", { class: "tbi-brain-label", text: "Bruised (contusions)" }), h("ul", { class: "tbi-brain-list", html: bl.join("") }));
    else ro.append(h("p", { class: "tbi-brain-empty", text: "No contusions: the brain moved, but not far or fast enough to bruise against the bone." }));
    const L = sum.levels;
    const shearTxt = L.bs
      ? "grey–white junction, corpus callosum and brainstem"
      : L.cc
        ? "grey–white junction and corpus callosum"
        : L.gwj
          ? "grey–white junction"
          : "";
    ro.append(h("div", { class: "tbi-brain-label", text: "Sheared axons (diffuse axonal injury)" }), h("p", { class: "tbi-brain-shear", text: shearTxt ? `Reached the ${shearTxt}.` : "Below the toy threshold." }));
    ro.append(bar("Compression against bone", Math.min(1, sum.pen / 2.2), null, "is-bruise"), bar("Rotational shear", sum.phi / SHEAR_MAX, ticks, "is-shear"));
    if (this.fibreInfo) {
      const torn = this.result.fibreSens.filter((s) => sum.phi * s >= 1).length;
      ro.append(h("p", { class: "tbi-brain-count", text: `${torn} of ${this.fibreInfo.length} stylised axon bundles torn.` }));
    }
    ro.querySelectorAll(".tbi-brain-linkbtn").forEach((b) => b.addEventListener("click", () => this.selectRegion(+b.dataset.region)));
  }

  updateAria() {
    if (!this.canvas) return;
    let label;
    const views = [this.skullOn ? "inside a translucent skull" : "with the skull hidden", this.ghost ? "cortex see-through" : "", this.cut ? `cut away (${this.cutPlaneKind()} section)` : ""].filter(Boolean).join(", ");
    if (this.mode === "explore") {
      label = `Interactive 3D model of a human brain built from MRI-derived anatomy, ${views}. `;
      label += this.selected ? `Selected: ${REGIONS[this.selected].name}. ${REGIONS[this.selected].does}` : "No region selected; use the region list or click the model.";
    } else {
      const S = SCENARIOS[this.scenario];
      label = `Interactive 3D simulation of a brain inside the skull, ${views}. `;
      const sum = this.result && this.result.summary;
      if (sum && this._summaryShown) {
        const names = sum.bruised.slice(0, 5).map((b) => `${b.side ? b.side + " " : ""}${REGIONS[b.region].name}`);
        label += `After a ${S.label.toLowerCase()} at severity ${this.result.severity} of 10, the skull is intact. `;
        label += names.length ? `Contusions at the ${names.join(", ")}. ` : "No contusions. ";
        label += sum.levels.gwj ? `Shearing reached the ${sum.levels.bs ? "brainstem" : sum.levels.cc ? "corpus callosum" : "grey-white junction"}.` : "No shearing above threshold.";
      } else label += `Selected motion: ${S.label}. Press ${this.mode === "shear" ? "Rotate" : "Strike"} to run.`;
    }
    this.canvas.setAttribute("aria-label", label);
  }

  /* ---------------- loop */
  loop() {
    if (this._raf) return;
    const frame = (now) => {
      this._raf = 0;
      if (!this.visible || document.hidden) return;
      this.stepTween(now);
      if (this.autoRotate) {
        const off = this.camera.position.clone().sub(this.controls.target);
        off.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.0016);
        this.camera.position.copy(this.controls.target).add(off);
        this.dirty = true;
      }
      if (this.playing && this.result) {
        const t = (now - this.playStart) / this.msPerSimMs();
        if (t >= SIM.duration) {
          this.playing = false;
          this.updatePlayBtn();
        }
        this.setTime(Math.min(t, SIM.duration));
      }
      if (this.controls.update()) this.dirty = true;
      const S = this.tissue[0].material.uniforms;
      const sel = this.selected || -1;
      const hov = this.hovered || -1;
      if (S.uSel.value !== sel || S.uHov.value !== hov) {
        for (const m of this.tissue) {
          m.material.uniforms.uSel.value = sel;
          m.material.uniforms.uHov.value = hov;
        }
        this.dirty = true;
      }
      if (this.dirty) {
        this.dirty = false;
        this.renderer.render(this.scene, this.camera);
        this.updateTag();
      }
      this._raf = requestAnimationFrame(frame);
    };
    this._raf = requestAnimationFrame(frame);
  }

  updateTag() {
    const r = this.hovered || this.selected;
    const list = r && this.data.anchors[r];
    if (!list) {
      this.tag.classList.remove("is-on");
      return;
    }
    // choose the anchor on the hemisphere facing the camera
    const cam = this.camera.position.clone();
    this.brain.worldToLocal(cam);
    let best = null,
      bd = Infinity;
    for (const a of list) {
      const mesh = this.meshByName[a.mesh];
      if (mesh && !mesh.visible) continue;
      const d = a.p.distanceTo(cam);
      if (d < bd) (bd = d), (best = a);
    }
    if (!best) {
      this.tag.classList.remove("is-on");
      return;
    }
    const p = best.p.clone();
    this.brain.localToWorld(p);
    p.project(this.camera);
    const x = (p.x * 0.5 + 0.5) * this.width;
    const y = (-p.y * 0.5 + 0.5) * this.height;
    this.tag.textContent = REGIONS[r].name;
    this.tag.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    this.tag.classList.add("is-on");
    this.tag.classList.toggle("is-hover", r === this.hovered && r !== this.selected);
  }
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ boot */
function boot() {
  document.querySelectorAll(".tbi-brain").forEach((el) => {
    if (el.__tbiBrain) return;
    const v = new BrainView(el);
    el.__tbiBrain = v;
    onVisible(el, () => v.init(), 0.05);
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
