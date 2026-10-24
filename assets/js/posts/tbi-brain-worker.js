// Web Worker for the TBI brain figure: runs the toy mechanics off the main thread.
import { Vector3 } from "../vendor/three.module.min.js";
import { simulate } from "./tbi-brain-sim.js";

let data = null;
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") {
    data = { contact: m.contact, pivot: new Vector3(m.pivot.x, m.pivot.y, m.pivot.z) };
    return;
  }
  if (m.type === "run" && data) {
    const res = simulate(data, m.scenario, m.severity);
    const plain = (v) => ({ x: v.x, y: v.y, z: v.z });
    res.frames = res.frames.map((f) => ({ ...f, u: plain(f.u), th: plain(f.th), ph: plain(f.ph), sp: plain(f.sp), sr: plain(f.sr) }));
    res.axis = plain(res.axis);
    res.linDir = plain(res.linDir);
    self.postMessage(
      { id: m.id, res },
      res.keys.map((k) => k.buffer)
    );
  }
};
