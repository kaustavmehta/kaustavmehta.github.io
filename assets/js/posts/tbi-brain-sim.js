// The toy mechanics behind the TBI brain figure (tbi-brain-core.js). Runs in a Web Worker
// (tbi-brain-worker.js) when available, so a strike never blocks scrolling; otherwise on the main thread.
// This is an illustration built from simple physical ideas, not a finite-element model.
import { Vector3 } from "../vendor/three.module.min.js";

export const SCENARIOS = {
  front: {
    label: "Forehead",
    phrase: "a blow to the forehead",
    blurb: "A blow to the front of the head, or the forehead hitting something hard.",
    site: [0, 0.25, -1],
    lin: [0, 0, 1],
    rot: [0.18, 0, 0],
    cut: "sagittal",
    impactor: true,
  },
  back: {
    label: "Back of head",
    phrase: "a blow to the back of the head",
    blurb: "The back of the head hits something, as in a fall backwards onto a hard floor.",
    site: [0, 0.1, 1],
    lin: [0, 0, -1],
    rot: [-0.18, 0, 0],
    cut: "sagittal",
    impactor: true,
  },
  side: {
    label: "Side",
    phrase: "a blow to the side of the head",
    blurb: "A blow to the side of the head, or the temple hitting a door frame or window.",
    site: [-1, 0.15, 0],
    lin: [1, 0, 0],
    rot: [0, 0, -0.22],
    cut: "coronal",
    impactor: true,
  },
  hook: {
    label: "Hook to the jaw",
    phrase: "a hook to the jaw",
    blurb: "A glancing blow to the side of the jaw, which spins the head sideways about the neck.",
    site: [-1, -0.9, -0.6],
    lin: [0.25, 0, 0],
    rot: [0, -1, 0],
    cut: "coronal",
    impactor: false,
  },
  uppercut: {
    label: "Uppercut",
    phrase: "an uppercut",
    blurb: "A blow under the chin that snaps the head backwards.",
    site: [0, -1, -0.8],
    lin: [0, 0.3, 0],
    rot: [0.85, 0, 0],
    cut: "sagittal",
    impactor: false,
  },
  whiplash: {
    label: "Whiplash",
    phrase: "whiplash with no blow to the head",
    blurb: "No blow to the head at all: the body is thrown forward, the head lags and then whips back and forth on the neck.",
    site: [0, -1, 0.4],
    lin: [0, 0, -0.35],
    rot: [0.7, 0, 0],
    cut: "sagittal",
    impactor: false,
    whiplash: true,
  },
};
export const SCENARIO_ORDER = ["front", "back", "side", "hook", "uppercut", "whiplash"];

/* ------------------------------------------------------------------ the toy mechanics */
// Brain = rigid body on a damped spring inside the skull (a few mm of CSF), plus a "deep core" that lags
// the brain's outer layers in rotation (a stand-in for shear between structures of different stiffness).
// Everything is in the skull's frame: the skull's acceleration appears as an opposite pseudo-force.
export const SIM = {
  dt: 0.075, // ms
  duration: 90, // ms
  frameEvery: 4, // record every 0.3 ms
  keyEvery: 5, // heat snapshot every 5 frames (1.5 ms)
  t0: 6, // pulse start (ms)
  pulse: 8, // ms, half-sine
  k: 0.11, // tethering spring (1/ms^2)  -> period ~19 ms
  c: 0.05,
  kRot: 0.07,
  cRot: 0.1,
  kCore: 0.16,
  cCore: 0.16,
  coreFromShell: 0.15,
  kContact: 0.01, // per contacting vertex
  cContact: 0.0002,
  invI: 1 / 2200, // 1 / (I/m), mm^-2
  sag: -1.1, // mm: buoyant in CSF, the brain still settles a little onto the skull base
  suction: 0.22,
  crush: 2.5,
  scrape: 4.5,
  linPerSev: 0.11, // mm/ms^2 per severity step (~11 g)
  rotPerSev: 0.0008, // rad/ms^2 per severity step
};

export function simulate(data, scenarioKey, severity) {
  const S = SCENARIOS[scenarioKey];
  const { contact } = data;
  const { N, r, n, rough, hw, target, total } = contact;
  // the resting brain sags slightly onto the skull base; contact is measured from that resting position
  const g = new Float32Array(N);
  for (let i = 0; i < N; i++) g[i] = Math.max(contact.g[i], SIM.sag * n[i * 3 + 1] + 0.4);
  const heat = new Float32Array(total);
  const dt = SIM.dt;
  const steps = Math.round(SIM.duration / dt);
  const lin = new Vector3(...S.lin);
  const rot = new Vector3(...S.rot);
  const A = SIM.linPerSev * severity;
  const Al = SIM.rotPerSev * severity;
  const pivot = data.pivot;
  // state
  const u = new Vector3(0, SIM.sag, 0),
    v = new Vector3(),
    th = new Vector3(),
    w = new Vector3(),
    ph = new Vector3(),
    pw = new Vector3();
  // skull (display only): position and rotation about the neck pivot, with a soft "neck" restoring them
  const sp = new Vector3(),
    sv = new Vector3(),
    sr = new Vector3(),
    sw = new Vector3();
  const frames = [];
  const keys = [];
  const F = new Vector3(),
    Tq = new Vector3(),
    aS = new Vector3(),
    alS = new Vector3(),
    tmp = new Vector3();
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
    // broad phase: no vertex moves further than |u| + |theta| * 95 mm this step
    const reach = u.length() + th.length() * 95 + 1.7;
    const during = pl > 0.05;
    for (let i = 0; i < N; i++) {
      if (!during && g[i] > reach) break;
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
      const dn = dx * nx + dy * ny + dz * nz;
      const p = dn - g[i];
      // contrecoup by tension: while the skull is being accelerated, the far side of the brain is pulled
      // away from the bone, and the pressure there drops (cavitation in the classic accounts)
      if (dn < -0.8 && pl > 0.05) heat[target[i]] += SIM.suction * (dn + 0.8) * (dn + 0.8) * pl * dt * hw[i] * (g[i] < 4 ? 1 : 0.3);
      if (p < -2) continue;
      const vx = v.x + w.y * rz - w.z * ry;
      const vy = v.y + w.z * rx - w.x * rz;
      const vz = v.z + w.x * ry - w.y * rx;
      const vn = vx * nx + vy * ny + vz * nz;
      const tx = vx - vn * nx,
        ty = vy - vn * ny,
        tz = vz - vn * nz;
      const vt = Math.sqrt(tx * tx + ty * ty + tz * tz);
      const prox = Math.max(0, Math.min(1, 1 + p / 1.6));
      // scraping along a rough floor (skull base) while close to it
      let dh = rough[i] * rough[i] * prox * prox * vt * SIM.scrape;
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
        dh += SIM.crush * (p * p * 1.6 + p * Math.max(vn, 0) * 3);
        if (p > maxPen) maxPen = p;
      }
      heat[target[i]] += dh * dt * hw[i];
    }
    // integrate brain translation and rotation (semi-implicit Euler)
    const ax = -aS.x - SIM.k * u.x - SIM.c * v.x + F.x;
    const ay = -aS.y - SIM.k * (u.y - SIM.sag) - SIM.c * v.y + F.y;
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
    // (contact torques jolt the outer brain too, but only a fraction of that reaches the core as shear)
    const cx = -(alS.x + SIM.coreFromShell * bx) - SIM.kCore * ph.x - SIM.cCore * pw.x;
    const cy = -(alS.y + SIM.coreFromShell * by) - SIM.kCore * ph.y - SIM.cCore * pw.y;
    const cz = -(alS.z + SIM.coreFromShell * bz) - SIM.kCore * ph.z - SIM.cCore * pw.z;
    pw.x += cx * dt;
    pw.y += cy * dt;
    pw.z += cz * dt;
    ph.addScaledVector(pw, dt);
    maxPhi = Math.max(maxPhi, ph.length());
    // skull display motion: real heads move centimetres; we keep it small and pull it back with a soft neck
    sv.addScaledVector(aS, dt)
      .addScaledVector(sp, -0.004 * dt)
      .multiplyScalar(1 - 0.03 * dt);
    sp.addScaledVector(sv, dt);
    sw.addScaledVector(alS, dt)
      .addScaledVector(sr, -0.006 * dt)
      .multiplyScalar(1 - 0.04 * dt);
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
