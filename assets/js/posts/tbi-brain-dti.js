// Diffusion MRI (DTI) view for the TBI brain figure: data-mode="dti" on a .tbi-brain element.
// Loaded by tbi-brain-core.js only for an instance that needs it. Draws population-averaged white-matter tracts
// (HCP-842 tractography atlas, Yeh et al. 2018, via the CC BY 4.0 "Atlas of 80 Bundles", Garyfallidis et al. 2018)
// inside the same MNI-space brain, with three lenses:
//   direction  standard DTI colour code (red left-right, green front-back, blue up-down)
//   findings   where group studies of mild TBI most often report altered diffusion (literature-derived illustration)
//   strain     the toy rotational model from tbi-brain-sim.js, coloured along each tract (not a measurement)
// See assets/data/tbi/README.md ("Diffusion MRI tracts") for sources and processing.

const TRACTS_JSON = new URL("../../data/tbi/brain/tracts.json", import.meta.url);
const TRACTS_BIN = new URL("../../data/tbi/brain/tracts.bin", import.meta.url);
const TRACTS_HI = new URL("../../data/tbi/brain/tracts-hi.bin", import.meta.url);

/* ------------------------------------------------------------------ knowledge */
// tier: 3 most consistent, 2 often reported, 1 occasionally reported, 0 rarely or not reported.
// Counts are the number of publications reporting an anisotropy abnormality in the matching ICBM-DTI-81 region in
// Eierud et al. 2014 (NeuroImage: Clinical 4:283-294, Table 2). Other figures as cited in each entry.
const TIER_NAMES = ["Rarely reported", "Occasionally reported", "Often reported", "Most consistent"];
const TIER_CLASS = ["tbi-dti-tier-0", "tbi-dti-tier-1", "tbi-dti-tier-2", "tbi-dti-tier-3"]; // literal for PurgeCSS
const TRACT_INFO = {
  1: {
    name: "Corpus callosum: genu",
    short: "CC genu",
    tier: 2,
    what: "The front of the corpus callosum, the bridge between the two hemispheres. Its fibres arc forward (the forceps minor) to join the left and right prefrontal cortex.",
    tbi: "Tied for the most often reported region in Eierud et al.'s tally (6 publications). Niogi et al. (2008) found it affected in 21% of 34 adults with persistent symptoms. Yet Aoki et al.'s meta-analysis found no significant pooled change in the genu, which is why it sits one step below the splenium here.",
  },
  2: {
    name: "Corpus callosum: body",
    short: "CC body",
    tier: 1,
    what: "The long middle stretch of the corpus callosum, linking the motor, sensory and parietal cortex of one hemisphere with the other.",
    tbi: "Aoki et al.'s meta-analysis found FA only marginally lower here (p = 0.099); Eierud et al. counted 1 publication.",
  },
  3: {
    name: "Corpus callosum: splenium",
    short: "CC splenium",
    tier: 3,
    what: "The thick back end of the corpus callosum. Its fibres (the forceps major) join the two parietal, temporal and occipital lobes, including the visual cortex.",
    tbi: "The most consistent finding. Aoki et al. pooled 13 studies and found lower FA in the corpus callosum as a whole (280 patients, 244 controls), with the clearest effect in the splenium: FA lower, mean diffusivity higher. Eierud et al. counted 5 publications.",
  },
  4: {
    name: "Corticospinal tract",
    short: "Corticospinal",
    tier: 1,
    what: "From the motor cortex down through the internal capsule and the brainstem to the spinal cord: the main route for voluntary movement.",
    tbi: "Rarely singled out in mild TBI: Eierud et al. counted 1 publication for the corticospinal label in the brainstem. Where it passes through the internal capsule it falls under the next entry.",
  },
  5: {
    name: "Corona radiata and internal capsule",
    short: "Corona radiata",
    tier: 2,
    what: "The fan of projection fibres between the cortex and the deep grey matter and brainstem, funnelling through the internal capsule. Drawn here with the fronto- and parieto-pontine fibres; the same region also carries thalamic radiations not shown.",
    tbi: "Among the most often reported: 6 publications for the anterior corona radiata, 5 for the posterior limb of the internal capsule and 3 for the superior corona radiata (Eierud et al.). Niogi et al. (2008) found the anterior corona radiata affected in 41% of patients, their most common site, and Inglese et al. (2005) reported lower FA in the internal capsule.",
  },
  6: {
    name: "Cingulum",
    short: "Cingulum",
    tier: 2,
    what: "A long bundle inside the cingulate gyrus, just above the corpus callosum, curving down into the temporal lobe; part of the circuitry for attention, emotion and memory.",
    tbi: "Eierud et al. counted 4 publications for its cingulate part (none for its hippocampal part); Niogi et al. (2008) found it affected in 18% of patients.",
  },
  7: {
    name: "Fornix",
    short: "Fornix",
    tier: 1,
    what: "The main output of the hippocampus, arching under the corpus callosum to the hypothalamus; important for forming memories.",
    tbi: "Occasionally reported: 1 publication each for its body and its crus in Eierud et al.'s tally. It is thin, and hard to measure without partial-volume effects from the fluid around it.",
  },
  8: {
    name: "Uncinate fasciculus",
    short: "Uncinate",
    tier: 2,
    what: "A hook-shaped bundle joining the orbitofrontal cortex to the front of the temporal lobe, the two places that bruise most often against the skull base. Linked to emotion, social behaviour and memory.",
    tbi: "Eierud et al. counted 4 publications; Niogi et al. (2008) found it affected in 29% of patients, their second most common site.",
  },
  9: {
    name: "Inferior longitudinal fasciculus",
    short: "ILF",
    tier: 1,
    what: "Runs along the underside of the temporal lobe to the occipital lobe; used in recognising objects, faces and words.",
    tbi: "Niogi et al. (2008) found it affected in 21% of patients; Eierud et al. counted 2 publications for the region it shares with the next tract (the sagittal stratum).",
  },
  10: {
    name: "Inferior fronto-occipital fasciculus",
    short: "IFOF",
    tier: 1,
    what: "One of the longest bundles in the brain, from the frontal lobe through the temporal stem to the occipital lobe.",
    tbi: "Eierud et al. counted 2 publications for the sagittal stratum, which it shares with the inferior longitudinal fasciculus.",
  },
  11: {
    name: "Superior longitudinal and arcuate fasciculi",
    short: "SLF / arcuate",
    tier: 1,
    what: "Arch along the side of each hemisphere joining frontal and parietal cortex and, as the arcuate, the language areas of the frontal and temporal lobes; attention, working memory and language.",
    tbi: "Eierud et al. counted 2 publications.",
  },
  12: {
    name: "Cerebellar peduncles",
    short: "Cerebellar",
    tier: 0,
    what: "The three stalks that tie the cerebellum to the brainstem, carrying the signals for coordination and balance.",
    tbi: "Rarely reported in mild TBI: 1 publication each for the middle and superior peduncles and none for the inferior in Eierud et al.'s tally.",
  },
};
const ORDER = [3, 1, 2, 5, 8, 6, 9, 10, 11, 7, 4, 12];
const CC = new Set([1, 2, 3]);
const LENSES = [
  ["direction", "Fibre direction"],
  ["findings", "Mild TBI findings"],
  ["strain", "Rotational strain (toy)"],
];
const MOTIONS = ["hook", "uppercut", "whiplash"];

/* ------------------------------------------------------------------ data */
let dataPromise = null;
export function loadTracts(withHi) {
  if (!dataPromise) {
    const bin = (u) => fetch(u).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))));
    dataPromise = Promise.all([
      fetch(TRACTS_JSON).then((r) => r.json()),
      bin(TRACTS_BIN),
      withHi ? bin(TRACTS_HI).catch(() => null) : Promise.resolve(null),
    ]);
  }
  return dataPromise;
}

const arr = (buf, s) => new { uint8: Uint8Array, int8: Int8Array, int16: Int16Array }[s.dtype](buf, s.offset, s.length);

// Decode one level of detail into flat arrays (centred three.js coordinates, mm).
function decodeLevel(m, part, buf, centre, out) {
  const lens = arr(buf, part.lens),
    tract = arr(buf, part.tract),
    start = arr(buf, part.start),
    delta = arr(buf, part.delta);
  let d = 0;
  for (let s = 0; s < part.count; s++) {
    let x = start[s * 3] * m.scaleStart,
      y = start[s * 3 + 1] * m.scaleStart,
      z = start[s * 3 + 2] * m.scaleStart;
    const pts = [x - centre[0], y - centre[1], z - centre[2]];
    for (let k = 1; k < lens[s]; k++, d += 3) {
      x += delta[d] * m.scaleDelta;
      y += delta[d + 1] * m.scaleDelta;
      z += delta[d + 2] * m.scaleDelta;
      pts.push(x - centre[0], y - centre[1], z - centre[2]);
    }
    out.push({ tract: tract[s], pts });
  }
}

/* ------------------------------------------------------------------ shaders */
const LINE_VERT = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
attribute vec3 aTan; attribute float aTract; attribute float aSens;
uniform float uAct[13]; uniform float uTier[13];
uniform float uPass; uniform float uLens; uniform vec3 uPhi; uniform float uPhiNow; uniform float uPhiMax;
uniform float uTime; uniform float uDist; uniform float uDark;
uniform vec3 uNeutral; uniform vec3 uInjury; uniform vec3 uStrain;
varying vec3 vCol; varying float vA;
vec3 rotateAA(vec3 p, vec3 aa){
  float ang = length(aa); if (ang < 1e-6) return p;
  vec3 k = aa / ang; float c = cos(ang), s = sin(ang);
  return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c);
}
void main(){
  int id = int(aTract + 0.5);
  float act = uAct[id];
  // pass 0 draws active tracts (depth-written), pass 1 the faint context
  if ((uPass < 0.5 && act < 0.5) || (uPass > 0.5 && act > 0.5)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float depth = clamp(1.0 - length(position) / 72.0, 0.0, 1.0);
  vec3 p = rotateAA(position, uPhi * depth);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
  vec3 dir = abs(normalize(aTan));
  vec3 col;
  if (uLens < 0.5) {
    // DTI convention: red = left-right (x), green = front-back (three z), blue = up-down (three y)
    col = vec3(dir.x, dir.z, dir.y);
    col = mix(col, vec3(1.0), 0.06 + 0.1 * uDark) * mix(0.92, 1.0, uDark);
  } else if (uLens < 1.5) {
    float tier = uTier[id];
    float pulse = 0.5 + 0.5 * sin(uTime * 1.6 - length(position) * 0.09);
    col = mix(uNeutral, uInjury, tier);
    col += uInjury * step(0.99, tier) * 0.3 * pulse;
  } else {
    float sNow = uPhiNow * aSens;
    float sMax = uPhiMax * aSens;
    col = mix(uNeutral, uStrain, smoothstep(0.3, 0.95, sNow));
    col = mix(col, uInjury, step(1.0, sMax));
  }
  // illuminated lines: diffuse and specular from the tangent (Kajiya-Kay style)
  vec3 T = normalize(normalMatrix * aTan);
  vec3 L = normalize(vec3(-0.35, 0.6, 0.72));
  float tl = dot(T, L), tv = T.z;
  float diff = sqrt(max(0.0, 1.0 - tl * tl));
  float spec = pow(max(0.0, diff * sqrt(max(0.0, 1.0 - tv * tv)) - tl * tv), 28.0);
  float cue = 1.0 - 0.38 * clamp((-mvPosition.z - uDist) / 80.0, 0.0, 1.0);
  vCol = (col * (0.5 + 0.55 * diff) + vec3(spec) * 0.3) * cue;
  vA = uPass < 0.5 ? 0.92 : (0.07 + 0.06 * uDark) * cue;
}`;

const LINE_FRAG = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>
varying vec3 vCol; varying float vA;
void main(){
  #include <clipping_planes_fragment>
  gl_FragColor = vec4(vCol, vA);
}`;

/* ------------------------------------------------------------------ FA explainer */
// Illustrative eigenvalues (units of 10^-3 mm^2/s) for healthy white matter and for the same voxel with damaged axons.
const lambdas = (dmg) => [1.7 - 0.55 * dmg, 0.3 + 0.5 * dmg, 0.3 + 0.5 * dmg];
const faOf = ([a, b, c]) => {
  const num = (a - b) ** 2 + (b - c) ** 2 + (c - a) ** 2;
  const den = a * a + b * b + c * c;
  return Math.sqrt(0.5 * (num / den));
};

class FaDemo {
  constructor(ctx, host) {
    const { h } = ctx;
    this.ctx = ctx;
    this.dmg = 0;
    this.canvas = h("canvas", {
      class: "tbi-dti-fa-canvas",
      role: "img",
      "aria-label": "Water molecules random-walking inside a bundle of axons",
    });
    this.out = h("p", { class: "tbi-dti-fa-out", "aria-live": "polite" });
    this.range = h("input", {
      type: "range",
      min: "0",
      max: "100",
      value: "0",
      "aria-label": "Damage to the axons (illustrative)",
      oninput: (e) => this.set(+e.target.value / 100),
    });
    host.append(
      h("div", { class: "tbi-brain-label", text: "What FA measures" }),
      h("p", {
        class: "tbi-dti-note",
        text: "Water in the brain jiggles about at random. Inside a bundle of axons the membranes and myelin let it wander along the fibres far more easily than across them, so its spread is cigar-shaped. Damaged axons leak and lose that order, the spread gets rounder, and fractional anisotropy (FA) falls: 0 means the same in every direction, 1 means only along one line.",
      }),
      this.canvas,
      h("label", { class: "tbi-range tbi-dti-fa-range" }, [h("span", { text: "Healthy" }), this.range, h("span", { text: "Damaged" })]),
      this.out
    );
    this.parts = Array.from({ length: 46 }, () => ({ x: 0, y: 0, tx: [], ty: [] }));
    this.t0 = 0;
    this.set(0);
  }

  set(d) {
    this.dmg = d;
    const L = lambdas(d);
    const fa = faOf(L);
    this.out.textContent = `FA ${fa.toFixed(2)} · water spreads ${(L[0] / L[1]).toFixed(1)}× more easily along the fibres than across them (illustrative values)`;
    this.canvas.setAttribute(
      "aria-label",
      `Water molecules random-walking inside a bundle of axons. Damage ${Math.round(d * 100)}%: FA ${fa.toFixed(2)}.`
    );
    this.restart();
  }

  restart() {
    this.t0 = performance.now();
    this.last = 0;
    for (const p of this.parts) ((p.x = 0), (p.y = 0), (p.tx.length = 0), (p.ty.length = 0));
    if (this.ctx.reduceMotion) {
      // static end state: sample where the walkers would be after the full interval
      const L = lambdas(this.dmg);
      for (const p of this.parts) {
        const g = gauss2();
        p.x = g[0] * Math.sqrt(L[0]) * 0.55;
        p.y = g[1] * Math.sqrt(L[1]) * 0.55;
      }
    }
    this.dirty = true;
  }

  step(now, pal) {
    const c = this.canvas;
    const w = c.clientWidth;
    if (!w) return;
    const hgt = 130;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(hgt * dpr);
    }
    const reduce = this.ctx.reduceMotion;
    const L = lambdas(this.dmg);
    if (!reduce) {
      if (now - this.t0 > 4200) this.restart();
      const frac = Math.min(0.05, Math.max(0, now - (this.last || now)) / 4200);
      this.last = now;
      for (const p of this.parts) {
        const g = gauss2();
        p.x += g[0] * Math.sqrt(L[0] * frac) * 0.55;
        p.y += g[1] * Math.sqrt(L[1] * frac) * 0.55;
        p.tx.push(p.x);
        p.ty.push(p.y);
        if (p.tx.length > 14) (p.tx.shift(), p.ty.shift());
      }
    } else if (!this.dirty) return;
    this.dirty = false;
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hgt);
    const cx = w / 2,
      cy = hgt / 2,
      S = Math.min(w / 2.6, 80);
    // axon walls, broken as damage rises
    g.strokeStyle = pal.wall;
    g.lineWidth = 1.2;
    for (let k = -4; k <= 4; k++) {
      const y = cy + k * 13 + 0.5;
      g.beginPath();
      const seg = 26;
      for (let x = 4; x < w - 4; x += seg) {
        const gapHash = Math.abs(Math.sin(k * 12.9898 + x * 78.233) * 43758.5453) % 1;
        if (gapHash < this.dmg * 0.75) continue;
        g.moveTo(x, y);
        g.lineTo(Math.min(x + seg - 3, w - 4), y);
      }
      g.stroke();
    }
    // diffusion ellipse (2 standard deviations after the interval)
    g.strokeStyle = pal.theme;
    g.lineWidth = 1.5;
    g.setLineDash([4, 3]);
    g.beginPath();
    g.ellipse(cx, cy, Math.sqrt(L[0]) * 0.55 * 2 * S * 0.5, Math.sqrt(L[1]) * 0.55 * 2 * S * 0.5, 0, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    // walkers
    for (const p of this.parts) {
      if (p.tx.length > 1) {
        g.strokeStyle = pal.trail;
        g.lineWidth = 1;
        g.beginPath();
        for (let i = 0; i < p.tx.length; i++) {
          const X = cx + p.tx[i] * S * 0.5,
            Y = cy + p.ty[i] * S * 0.5;
          i ? g.lineTo(X, Y) : g.moveTo(X, Y);
        }
        g.stroke();
      }
      g.fillStyle = pal.dot;
      g.beginPath();
      g.arc(cx + p.x * S * 0.5, cy + p.y * S * 0.5, 2, 0, Math.PI * 2);
      g.fill();
    }
  }
}

function gauss2() {
  const u = Math.max(1e-9, Math.random()),
    v = Math.random();
  const r = Math.sqrt(-2 * Math.log(u));
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
}

/* ------------------------------------------------------------------ the view */
class DtiView {
  constructor(view, raw, ctx) {
    this.view = view;
    this.ctx = ctx;
    this.lens = ["direction", "findings", "strain"].includes(view.el.dataset.lens) ? view.el.dataset.lens : "findings";
    this.selected = 0;
    this.scenario = MOTIONS.includes(view.el.dataset.scenario) ? view.el.dataset.scenario : "hook";
    this.severity = view.severity;
    this.result = null;
    this.playT = 0;
    this.playing = false;
    this.buildGeometry(raw);
    this.buildDom();
    this.applyLens();
  }

  buildGeometry([m, base, hi]) {
    const { THREE } = this.ctx;
    const centre = this.view.data.manifest.centre;
    const lines = [];
    decodeLevel(m, m.base, base, centre, lines);
    if (hi) decodeLevel(m, m.hi, hi, centre, lines);
    let nv = 0,
      ns = 0;
    for (const l of lines) ((nv += l.pts.length / 3), (ns += l.pts.length / 3 - 1));
    const pos = new Float32Array(nv * 3),
      tan = new Float32Array(nv * 3),
      tid = new Float32Array(nv),
      idx = new Uint32Array(ns * 2);
    this.strands = []; // per streamline: tract, first vertex, count
    let v = 0,
      e = 0;
    for (const l of lines) {
      const P = l.pts,
        n = P.length / 3;
      this.strands.push({ tract: l.tract, v0: v, n });
      for (let k = 0; k < n; k++) {
        const a = Math.max(0, k - 1) * 3,
          b = Math.min(n - 1, k + 1) * 3;
        let tx = P[b] - P[a],
          ty = P[b + 1] - P[a + 1],
          tz = P[b + 2] - P[a + 2];
        const len = Math.hypot(tx, ty, tz) || 1;
        tan[(v + k) * 3] = tx / len;
        tan[(v + k) * 3 + 1] = ty / len;
        tan[(v + k) * 3 + 2] = tz / len;
        pos[(v + k) * 3] = P[k * 3];
        pos[(v + k) * 3 + 1] = P[k * 3 + 1];
        pos[(v + k) * 3 + 2] = P[k * 3 + 2];
        tid[v + k] = l.tract;
        if (k < n - 1) ((idx[e++] = v + k), (idx[e++] = v + k + 1));
      }
      v += n;
    }
    this.pos = pos;
    this.sens = new Float32Array(nv);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aTan", new THREE.BufferAttribute(tan, 3));
    g.setAttribute("aTract", new THREE.BufferAttribute(tid, 1));
    this.sensAttr = new THREE.BufferAttribute(this.sens, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("aSens", this.sensAttr);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    this.counts = {};
    for (const s of this.strands) this.counts[s.tract] = (this.counts[s.tract] || 0) + 1;
    const uniforms = () => ({
      uAct: { value: new Array(13).fill(1) },
      uTier: { value: new Array(13).fill(0) },
      uPass: { value: 0 },
      uLens: { value: 0 },
      uPhi: { value: new THREE.Vector3() },
      uPhiNow: { value: 0 },
      uPhiMax: { value: 0 },
      uTime: { value: 0 },
      uDist: { value: 400 },
      uDark: { value: 0 },
      uNeutral: { value: new THREE.Vector3() },
      uInjury: { value: new THREE.Vector3() },
      uStrain: { value: new THREE.Vector3() },
    });
    const mk = (pass) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms: uniforms(),
        transparent: true,
        depthWrite: pass === 0,
        clipping: true,
      });
      mat.uniforms.uPass.value = pass;
      const obj = new THREE.LineSegments(g, mat);
      obj.renderOrder = pass === 0 ? 3 : 3.5;
      obj.frustumCulled = false;
      return obj;
    };
    this.lines = [mk(0), mk(1)];
    this.mats = this.lines.map((o) => o.material);
    for (const o of this.lines) this.view.brain.add(o);
    // deep structure meshes would hide the tracts that run through them; keep the cortex and cerebellum (see-through)
    for (const name of ["corpus_callosum", "thalamus", "basal_ganglia", "hippocampus", "amygdala", "ventricles", "brainstem"]) {
      const mesh = this.view.meshByName[name];
      if (mesh) mesh.visible = false;
    }
  }

  /* ---------------- DOM */
  buildDom() {
    const { h } = this.ctx;
    const view = this.view;
    const host = view.dtiSide;
    // lens switch
    this.lensBtns = {};
    const lensGroup = h("div", { class: "tbi-brain-dirs tbi-dti-lenses", role: "group", "aria-label": "Colour the tracts by" });
    for (const [k, label] of LENSES) {
      const b = h("button", { type: "button", class: "tbi-btn", "aria-pressed": "false", text: label, onclick: () => this.setLens(k) });
      this.lensBtns[k] = b;
      lensGroup.append(b);
    }
    // tract chips
    this.tractBtns = {};
    const chips = h("div", { class: "tbi-dti-chips", role: "group", "aria-label": "Highlight a tract" });
    const all = h("button", {
      type: "button",
      class: "tbi-btn tbi-dti-chip",
      "aria-pressed": "true",
      text: "All tracts",
      onclick: () => this.select(0),
    });
    this.tractBtns[0] = all;
    chips.append(all);
    for (const t of ORDER) {
      const I = TRACT_INFO[t];
      const b = h(
        "button",
        {
          type: "button",
          class: "tbi-btn tbi-dti-chip",
          "aria-pressed": "false",
          "aria-label": I.name,
          onclick: () => this.select(this.selected === t ? 0 : t),
        },
        [h("span", { class: `tbi-dti-dot ${TIER_CLASS[I.tier]}`, "aria-hidden": "true" }), I.short]
      );
      this.tractBtns[t] = b;
      chips.append(b);
    }
    // strain controls
    this.motionBtns = {};
    const motions = h("div", { class: "tbi-brain-dirs", role: "group", "aria-label": "Kind of motion" });
    for (const k of MOTIONS) {
      const b = h("button", {
        type: "button",
        class: "tbi-btn",
        "aria-pressed": String(k === this.scenario),
        text: this.ctx.SCENARIOS[k].label,
        onclick: () => this.setScenario(k),
      });
      this.motionBtns[k] = b;
      motions.append(b);
    }
    this.sevOut = h("output", { class: "tbi-brain-sevout", text: String(this.severity) });
    const sev = h("input", {
      type: "range",
      min: "1",
      max: "10",
      step: "1",
      value: String(this.severity),
      "aria-label": "Severity of the rotation, 1 to 10 (unitless)",
      oninput: (e) => {
        this.severity = +e.target.value;
        this.sevOut.textContent = String(this.severity);
      },
    });
    this.rotateBtn = h("button", { type: "button", class: "tbi-btn tbi-brain-strike", text: "Rotate", onclick: () => this.strike() });
    this.readout = h("div", { class: "tbi-brain-readout", "aria-live": "polite" });
    this.strainBox = h("div", { class: "tbi-dti-strain" }, [
      h("div", { class: "tbi-brain-label", text: "Kind of motion" }),
      motions,
      h("div", { class: "tbi-brain-label", text: "Severity (illustrative, unitless)" }),
      h("label", { class: "tbi-range tbi-brain-sev" }, [h("span", { text: "Gentle" }), sev, h("span", { text: "Severe" }), this.sevOut]),
      h("div", { class: "tbi-brain-actions" }, [
        this.rotateBtn,
        h("button", { type: "button", class: "tbi-btn", text: "Reset", onclick: () => this.resetStrain() }),
      ]),
      this.readout,
    ]);
    this.info = h("div", { class: "tbi-brain-info tbi-dti-info", "aria-live": "polite" });
    this.faBox = h("div", { class: "tbi-dti-fa" });
    this.fa = new FaDemo(this.ctx, this.faBox);
    this.caveat = h("p", {
      class: "tbi-dti-caveat",
      text: "Atlas tracts from the averaged diffusion MRI of 842 healthy young adults, not a patient's scan. Colours in the findings view summarise group studies; they are not a diagnostic test for any one person.",
    });
    host.append(
      h("div", { class: "tbi-brain-label", text: "Colour the tracts by" }),
      lensGroup,
      h("div", { class: "tbi-brain-label", text: "Tracts" }),
      chips,
      this.strainBox,
      this.info,
      this.caveat
    );
    // the FA explainer sits under the canvas, where the main column has room
    view.legend.after(this.faBox);
    // timeline over the canvas for the strain lens
    this.playBtn = h("button", {
      type: "button",
      class: "tbi-brain-iconbtn",
      "aria-label": "Play",
      html: "&#9654;",
      onclick: () => this.togglePlay(),
    });
    this.scrub = h("input", {
      type: "range",
      min: "0",
      max: "1000",
      value: "0",
      step: "1",
      "aria-label": "Time since the start of the motion",
      oninput: (e) => {
        this.playing = false;
        this.updatePlayBtn();
        this.setTime((+e.target.value / 1000) * this.ctx.SIM.duration);
      },
    });
    this.timeOut = h("span", { class: "tbi-brain-time", text: "0 ms" });
    this.timeline = h("div", { class: "tbi-brain-timeline", hidden: true }, [this.playBtn, this.scrub, this.timeOut]);
    view.canvasWrap.append(this.timeline);
    this.renderReadout();
  }

  renderLegend() {
    const { h } = this.ctx;
    const lg = this.view.legend;
    lg.innerHTML = "";
    const item = (cls, text) => h("span", {}, [h("span", { class: `tbi-swatch ${cls}` }), text]);
    if (this.lens === "direction") {
      lg.append(
        item("tbi-dti-sw-lr", "Left–right"),
        item("tbi-dti-sw-ap", "Front–back"),
        item("tbi-dti-sw-si", "Up–down"),
        h("span", { class: "tbi-dti-legend-note", text: "Population-averaged tractography (HCP-842 atlas)" })
      );
    } else if (this.lens === "findings") {
      lg.append(
        item("tbi-dti-sw-t3", TIER_NAMES[3]),
        item("tbi-dti-sw-t2", TIER_NAMES[2]),
        item("tbi-dti-sw-t1", TIER_NAMES[1]),
        item("tbi-dti-sw-t0", TIER_NAMES[0]),
        h("span", { class: "tbi-dti-legend-note", text: "Literature-derived illustration of group findings, not a scan" })
      );
    } else {
      lg.append(
        item("tbi-dti-sw-t0", "Little strain"),
        item("tbi-dti-sw-strain", "Stretching"),
        item("tbi-dti-sw-t3", "Past the toy threshold"),
        h("span", { class: "tbi-dti-legend-note", text: "Toy model, not a simulation" })
      );
    }
  }

  setLens(k) {
    this.lens = k;
    this.applyLens();
  }

  applyLens() {
    for (const [k, b] of Object.entries(this.lensBtns)) b.setAttribute("aria-pressed", String(k === this.lens));
    const L = { direction: 0, findings: 1, strain: 2 }[this.lens];
    for (const m of this.mats) m.uniforms.uLens.value = L;
    this.view.el.classList.toggle("is-dti-findings", this.lens === "findings");
    this.strainBox.hidden = this.lens !== "strain";
    this.faBox.hidden = this.lens === "strain";
    this.timeline.hidden = this.lens !== "strain" || !this.result;
    if (this.lens !== "strain") this.playing = false;
    this.renderLegend();
    this.renderInfo();
    this.applyActive();
    this.view.updateAria();
    this.view.dirty = true;
  }

  select(t) {
    this.selected = t;
    for (const [k, b] of Object.entries(this.tractBtns)) b.setAttribute("aria-pressed", String(+k === t));
    this.view.autoRotate = false;
    this.applyActive();
    this.renderInfo();
    this.view.updateAria();
    this.view.dirty = true;
  }

  applyActive() {
    const act = new Array(13).fill(1);
    if (this.selected) for (let i = 0; i < 13; i++) act[i] = i === this.selected ? 1 : 0;
    const tier = new Array(13).fill(0);
    for (const [t, I] of Object.entries(TRACT_INFO)) tier[t] = [0, 0.4, 0.72, 1][I.tier];
    for (const m of this.mats) {
      m.uniforms.uAct.value = act;
      m.uniforms.uTier.value = tier;
    }
  }

  renderInfo() {
    const { h } = this.ctx;
    const info = this.info;
    info.innerHTML = "";
    const I = TRACT_INFO[this.selected];
    if (I) {
      info.append(
        h("div", { class: "tbi-brain-info-name", text: I.name }),
        h("p", { class: "tbi-brain-info-where", text: I.what }),
        h("div", { class: "tbi-brain-label" }, [
          "In studies of mild TBI ",
          h("span", { class: `tbi-dti-badge ${TIER_CLASS[I.tier]}`, text: TIER_NAMES[I.tier] }),
        ]),
        h("p", { text: I.tbi })
      );
      if (this.lens === "strain" && this.result && this.result.summary) {
        const s = this.result.summary.byTract[this.selected];
        if (s)
          info.append(h("p", { class: "tbi-brain-count", text: `In this toy rotation: ${s.pct}% of the drawn streamlines passed the threshold.` }));
      }
      return;
    }
    if (this.lens === "direction") {
      info.append(
        h("p", {
          text: "Each line is a streamline: a path traced by following, step by step, the direction in which water diffuses most easily. The paths come from a template that averages the diffusion MRI of 842 young adults in the Human Connectome Project; neuroanatomists then sorted them into named tracts (Yeh et al. 2018). Colour shows the local direction, using the standard DTI code: red runs left–right, green front–back and blue up–down. The corpus callosum is red because it crosses between the hemispheres; the corticospinal tract is blue because it runs down to the spinal cord.",
        })
      );
    } else if (this.lens === "findings") {
      info.append(
        h("p", {
          text: "Diffusion studies compare groups of people with mild TBI against matched controls. Altered diffusion turns up most often in the corpus callosum, the corona radiata and internal capsule, and the long frontal and temporal tracts; the colour here follows how consistently each tract has been reported (Aoki et al. 2012; Eierud et al. 2014; Niogi et al. 2008).",
        }),
        h("p", {
          text: "These are group averages that overlap heavily with healthy people, and they shift with time: some studies in the first two weeks find FA higher than normal, later ones mostly lower (Eierud et al.). In TRACK-TBI, patients whose CT and MRI were clear showed no significant DTI difference from controls (Yuh et al. 2014), and radiology guidance is that DTI is not yet a test for an individual patient (Wintermark et al. 2015).",
        }),
        h("p", { class: "tbi-brain-empty", text: "Choose a tract to read what it does and what was found." })
      );
    } else {
      info.append(
        h("p", {
          text: "The same toy rotation as the shear figure, now along real tracts. While the head turns, the deep core of the brain lags the outer brain; fibres stretch amber, and turn red where they pass the toy's threshold. As in the shear figure, the grey–white junction fails first, then the corpus callosum, then the brainstem, the order of Adams' grades of diffuse axonal injury. The motion is drawn four times exaggerated.",
        })
      );
    }
  }

  /* ---------------- strain lens */
  setScenario(k) {
    this.scenario = k;
    for (const [key, b] of Object.entries(this.motionBtns)) b.setAttribute("aria-pressed", String(key === k));
  }

  computeSensitivity(axis) {
    // per point, as in the toy's shear model: grey-white junction W0 x lever arm; corpus callosum W1; brainstem W2.
    const { SHEAR_W: W, clamp } = this.ctx;
    const P = this.pos;
    const ax = axis.x,
      ay = axis.y,
      az = axis.z;
    const maxS = new Float32Array(this.strands.length);
    // individual axons differ, as in the shear figure: most need well over the onset level before they fail
    let seed = 842;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    this.strands.forEach((s, si) => {
      let mx = 0;
      const jitter = 0.8 + 2.4 * Math.pow(rnd(), 1.6);
      for (let k = 0; k < s.n; k++) {
        const i = s.v0 + k;
        const x = P[i * 3],
          y = P[i * 3 + 1],
          z = P[i * 3 + 2];
        const cx = ay * z - az * y,
          cy = az * x - ax * z,
          cz = ax * y - ay * x;
        const lever = clamp(Math.hypot(cx, cy, cz) / 70, 0.25, 1.2);
        const r = Math.hypot(x, y, z);
        let w;
        // brainstem: below the thalamus, near the midline (three y is MNI z minus the centre offset)
        const mniZ = y + this.view.data.manifest.centre[1];
        if (s.tract === 12 || (mniZ < -12 && Math.abs(x) < 16)) w = W[2];
        else if (CC.has(s.tract) && Math.abs(x) < 22) w = W[1];
        else w = W[0] * lever * clamp((r - 20) / 50, 0.32, 1);
        w /= jitter;
        this.sens[i] = w;
        // a callosal streamline counts as torn by its crossing (the corpus callosum), not by its cortical ends
        if (w > mx && (!CC.has(s.tract) || Math.abs(x) < 22)) mx = w;
      }
      maxS[si] = mx;
    });
    this.sensAttr.needsUpdate = true;
    return maxS;
  }

  async strike() {
    if (this.busy) return;
    this.busy = true;
    this.rotateBtn.disabled = true;
    this.rotateBtn.textContent = "Simulating…";
    let res;
    try {
      res = await this.ctx.runSimulation(this.view.data, this.scenario, this.severity);
    } finally {
      this.busy = false;
      this.rotateBtn.disabled = false;
      this.rotateBtn.textContent = "Rotate";
    }
    res.phiScale = 1 / this.ctx.PHI0;
    const maxS = this.computeSensitivity(res.axis);
    const phi = res.maxPhi * res.phiScale;
    const byTract = {};
    this.strands.forEach((s, i) => {
      const b = (byTract[s.tract] = byTract[s.tract] || { n: 0, torn: 0 });
      b.n++;
      if (phi * maxS[i] >= 1) b.torn++;
    });
    for (const b of Object.values(byTract)) b.pct = Math.round((100 * b.torn) / b.n);
    res.summary = { phi, byTract };
    this.result = res;
    this._summaryShown = false;
    this.renderReadout();
    this.timeline.hidden = false;
    this.view.autoRotate = false;
    if (this.ctx.reduceMotion) this.setTime(this.ctx.SIM.duration);
    else {
      this.playT = 0;
      this.playing = true;
      this._last = 0;
      this.setTime(0);
    }
    this.updatePlayBtn();
  }

  resetStrain() {
    this.result = null;
    this.playing = false;
    this._summaryShown = false;
    for (const m of this.mats) {
      m.uniforms.uPhi.value.set(0, 0, 0);
      m.uniforms.uPhiNow.value = 0;
      m.uniforms.uPhiMax.value = 0;
    }
    this.timeline.hidden = true;
    this.renderReadout();
    this.renderInfo();
    this.view.updateAria();
    this.view.dirty = true;
  }

  setTime(t) {
    const res = this.result;
    if (!res) return;
    const { SIM, clamp } = this.ctx;
    t = clamp(t, 0, SIM.duration);
    this.playT = t;
    const fi = Math.min(res.frames.length - 1, Math.round(t / (SIM.dt * SIM.frameEvery)));
    const f = res.frames[fi];
    for (const m of this.mats) {
      m.uniforms.uPhi.value.copy(f.ph).multiplyScalar(4);
      m.uniforms.uPhiNow.value = f.ph.length() * res.phiScale;
      m.uniforms.uPhiMax.value = f.maxPhi * res.phiScale;
    }
    this.scrub.value = String(Math.round((t / SIM.duration) * 1000));
    this.timeOut.textContent = `${t.toFixed(t < 10 ? 1 : 0)} ms`;
    const end = fi === res.frames.length - 1;
    if (end && !this._summaryShown) {
      this._summaryShown = true;
      this.renderReadout(res.summary);
      this.renderInfo();
      this.view.updateAria();
    } else if (!end && this._summaryShown) {
      this._summaryShown = false;
      this.renderReadout();
    }
    this.view.dirty = true;
  }

  togglePlay() {
    if (!this.result) return;
    if (this.playing) this.playing = false;
    else {
      if (this.playT >= this.ctx.SIM.duration - 0.01) this.playT = 0;
      this.playing = true;
      this._last = 0;
    }
    this.updatePlayBtn();
  }

  updatePlayBtn() {
    this.playBtn.innerHTML = this.playing ? "&#10074;&#10074;" : "&#9654;";
    this.playBtn.setAttribute("aria-label", this.playing ? "Pause" : "Play");
  }

  renderReadout(sum) {
    const { h } = this.ctx;
    const ro = this.readout;
    ro.innerHTML = "";
    if (!sum) {
      ro.append(
        h("p", {
          class: "tbi-brain-empty",
          text: this.result ? "Rotating…" : "Choose a motion and a severity, then press Rotate.",
        })
      );
      return;
    }
    const rows = ORDER.map((t) => ({ t, ...(sum.byTract[t] || { pct: 0 }) })).filter((r) => r.pct > 0);
    rows.sort((a, b) => b.pct - a.pct);
    if (!rows.length) {
      ro.append(h("p", { class: "tbi-brain-shear", text: "No tract passed the toy threshold. Try a harder rotation." }));
      return;
    }
    ro.append(h("div", { class: "tbi-brain-label", text: "Streamlines past the toy threshold" }));
    for (const r of rows.slice(0, 7)) {
      ro.append(
        h("div", { class: "tbi-brain-barrow" }, [
          h("div", { class: "tbi-brain-barlabel", text: `${TRACT_INFO[r.t].name} · ${r.pct}%` }),
          h("div", { class: "tbi-brain-bar" }, [h("div", { class: "tbi-brain-bar-fill is-bruise", style: `width:${r.pct}%` })]),
        ])
      );
    }
  }

  /* ---------------- hooks called by the core viewer */
  applyPalette(P) {
    const { parseColour, mix3 } = this.ctx;
    const neutral = P.dark ? mix3(P.theme, parseColour("#ffffff"), 0.25) : mix3(P.theme, parseColour("#000000"), 0.05);
    for (const m of this.mats) {
      m.uniforms.uNeutral.value.copy(neutral);
      m.uniforms.uInjury.value.copy(P.injury);
      m.uniforms.uStrain.value.copy(P.strain);
      m.uniforms.uDark.value = P.dark ? 1 : 0;
      m.blending = this.ctx.THREE.NormalBlending;
    }
    const css = (v) => `rgb(${Math.round(v.x * 255)},${Math.round(v.y * 255)},${Math.round(v.z * 255)})`;
    this.faPal = {
      wall: P.dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)",
      theme: css(P.theme),
      dot: css(P.dark ? mix3(P.theme, parseColour("#ffffff"), 0.4) : P.theme),
      trail: P.dark ? "rgba(168,196,224,0.35)" : "rgba(80,112,143,0.3)",
    };
    if (this.fa) this.fa.dirty = true;
  }

  setClipping(planes) {
    for (const m of this.mats) m.clippingPlanes = planes;
  }

  tick(now) {
    let dirty = false;
    const cam = this.view.camera;
    const dist = cam.position.distanceTo(this.view.controls.target);
    for (const m of this.mats) m.uniforms.uDist.value = dist;
    if (this.lens === "findings" && !this.ctx.reduceMotion) {
      for (const m of this.mats) m.uniforms.uTime.value = now / 1000;
      dirty = true;
    }
    if (this.playing && this.result) {
      const step = Math.min(50, now - (this._last || now));
      const t = this.playT + step / (6500 / this.ctx.SIM.duration);
      if (t >= this.ctx.SIM.duration) {
        this.playing = false;
        this.updatePlayBtn();
      }
      this.setTime(Math.min(t, this.ctx.SIM.duration));
      dirty = true;
    }
    this._last = now;
    if (this.faPal && !this.faBox.hidden) this.fa.step(now, this.faPal);
    return dirty;
  }

  aria(views) {
    let label = `Interactive 3D model of the brain's white-matter tracts from population-averaged diffusion MRI tractography, ${views}. `;
    const I = TRACT_INFO[this.selected];
    if (this.lens === "direction") label += "Coloured by fibre direction: red left to right, green front to back, blue up and down. ";
    else if (this.lens === "findings")
      label +=
        "Coloured by how consistently group studies of mild TBI report altered diffusion: the splenium of the corpus callosum most consistently; the genu, corona radiata and internal capsule, uncinate fasciculus and cingulum often. An illustration of group findings, not a scan. ";
    else {
      label += "Coloured by strain in a toy model of a rotational blow. ";
      const s = this.result && this._summaryShown && this.result.summary;
      if (s) {
        const top = ORDER.map((t) => [t, (s.byTract[t] || { pct: 0 }).pct])
          .filter((r) => r[1] > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([t, p]) => `${TRACT_INFO[t].name} ${p}%`);
        label += top.length ? `Streamlines past the toy threshold: ${top.join(", ")}. ` : "No tract passed the toy threshold. ";
      }
    }
    label += I ? `Highlighted: ${I.name}. ${I.what}` : "All tracts shown.";
    return label;
  }
}

export function create(view, raw, ctx) {
  return new DtiView(view, raw, ctx);
}
