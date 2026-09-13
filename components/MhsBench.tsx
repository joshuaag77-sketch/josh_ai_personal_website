"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import s from "./MhsBench.module.css";

// A pinned, scroll-scrubbed bench: one machine and its operator, then three vendors and a cable tangle,
// then an MHS adapter snaps onto each port and unfolds a plain-English label, then one agent runs them all.

const CAPTIONS = [
  { k: "Today", h: "Every machine has its own port and its own operator.", p: "A microscope ships with a vendor program and a port shaped like nothing else in the room. Somebody sits at the knobs. Focus, laser power, stage position. By hand." },
  { k: "Add two more", h: "Three machines, three programs, weeks to make them talk.", p: "The 3D printer and the robot arm each bring their own laptop and their own port. To hand work from one to the next, someone writes a custom translator. Carnegie Mellon's team said that usually takes weeks." },
  { k: "Snap on the adapter", h: "One adapter each. One label, written for a model to read.", p: "An MHS driver does two jobs. It gives the machine a standard plug. And it carries a plain-English label: what this is, which knobs it has, and what is dangerous to turn. The arm's weight. The laser's ceiling. Things that used to live in a paper manual." },
  { k: "Plug in the AI", h: "One AI, every machine, all at once.", p: "It reads each label, then turns the knobs itself, in parallel, inside the limits the label sets. Watch the highlight: as a knob turns, the line it is obeying lights up. Hover or tap a knob to pick one. It is not guessing. It is reading the manual." },
];
const HUD = ["01 / 04 · Today", "02 / 04 · Three vendors", "03 / 04 · MHS drivers on", "04 / 04 · Agent connected"];

const EVIDENCE = [
  { n: "8", u: "HOURS", w: "Four machines on three computers, wired together and running a full drug-dose experiment. Vendor route: several weeks.", s: "Carnegie Mellon" },
  { n: "99.3", u: "%", w: "Laser relock success, 695 of 700 blind trials, up from 58%. Recovery fell from 150 s to about 6 s.", s: "QuEra Computing" },
  { n: "7", u: "→ 1", w: "Seven vendor programs collapsed into one dashboard. Adding a new camera took minutes.", s: "HHMI Janelia" },
  { n: "6", u: "BLOCKED", w: "Induced unsafe states caught by the driver's limits before any motion happened.", s: "Carnegie Mellon" },
  { n: "9,143", u: "DISPENSES", w: "Across 1,508 measured conditions. Precision predictions about 12% tighter than the manufacturer's spec.", s: "Tetsuwan Scientific" },
  { n: "140 → 10", u: "µL/s", w: "Claude tuned pipetting speed per liquid on its own. Then it kept retrying a foaming step. It read the error and missed the physics.", s: "Genentech" },
];

type Spec = { name: string; top: number; lines: [string, string][]; knobMap: [number, string][] };
const SPECS: Spec[] = [
  { name: "microscope", top: 2.85, lines: [["knobs", "focus · laser power · stage X-Y"], ["reads", "image · focus position"], ["safe", "laser ≤ 50 mW"], ["rule", "never move the stage while imaging"]], knobMap: [[3, "focus"], [2, "laser power"], [3, "stage"]] },
  { name: "3D printer", top: 2.75, lines: [["knobs", "nozzle temp · bed temp · feed rate"], ["reads", "temps · layer count"], ["safe", "nozzle ≤ 260 °C · bed ≤ 110 °C"], ["rule", "cool below 50 °C before opening"]], knobMap: [[2, "nozzle temp"], [2, "bed temp"], [3, "feed rate"]] },
  { name: "robot arm", top: 3.55, lines: [["knobs", "joint 1 · joint 2 · gripper"], ["mass", "12 kg · reach 850 mm"], ["safe", "≤ 0.3 m/s within 200 mm of samples"], ["rule", "gripper force 40 N max on glass"]], knobMap: [[2, "joint 1"], [2, "joint 2"], [3, "gripper"]] },
];

const C = {
  stage: 0x0b1120, alloy: 0xcbd5e1, dark: 0x1e293b, knob: 0xf1f5f9, accent: 0xf59e0b, agent: 0x3b82f6,
  laptop: 0x334155, screen: 0x60a5fa, human: 0x94a3b8, cable: 0x475569, port: [0x64748b, 0x8b7e6a, 0x6b8a7e],
};

type Machine = {
  g: THREE.Group; knobs: THREE.Group[]; portOffset: THREE.Vector3; adapterOffset: THREE.Vector3; joints?: THREE.Group[];
  spec: Spec; laptop: THREE.Group; adapter: THREE.Group; adapterBody: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>; ringT: number; wasSeated: boolean;
  label: HTMLDivElement; lineEls: HTMLElement[]; titleEl: HTMLElement;
};
type Hot = { machine: Machine; j: number } | null;
type State = { mx: number[]; mvis: number[]; lapVis: number; cabVis: number; tangle: number; human: number; adapt: number; agent: number; spin: number; lap0: number };

const K: State[] = [
  { mx: [0, 2.5, -2.5], mvis: [1, 0, 0], lapVis: 1, cabVis: 1, tangle: 0, human: 1, adapt: 0, agent: 0, spin: 0, lap0: 1 },
  { mx: [-1, 0, 1], mvis: [1, 1, 1], lapVis: 1, cabVis: 1, tangle: 1, human: 0, adapt: 0, agent: 0, spin: 0, lap0: 0 },
  { mx: [-1, 0, 1], mvis: [1, 1, 1], lapVis: 0, cabVis: 0, tangle: 0, human: 0, adapt: 1, agent: 0, spin: 0, lap0: 0 },
  { mx: [-1, 0, 1], mvis: [1, 1, 1], lapVis: 0, cabVis: 0, tangle: 0, human: 0, adapt: 1, agent: 1, spin: 1, lap0: 0 },
];
// Camera: a box to fit per beat (center, half width, half height) and a view direction. Distance is solved from the aspect so nothing crops.
const F = [
  { cx: 0.35, cy: 1.15, hw: 2.4, hh: 1.9, dir: new THREE.Vector3(0.45, 0.3, 1) },
  { cx: 0, cy: 1.35, hw: 0, hh: 2.7, dir: new THREE.Vector3(0.04, 0.34, 1) },
  { cx: 0, cy: 2.3, hw: 0, hh: 3.5, dir: new THREE.Vector3(0, 0.3, 1) },
  { cx: 0, cy: 2.5, hw: 0, hh: 3.7, dir: new THREE.Vector3(-0.04, 0.38, 1) },
];
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function MhsBench() {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLElement | null)[]>([]);
  const [hud, setHud] = useState(HUD[0]);
  const [err, setErr] = useState<string | null>(null);
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const playRaf = useRef(0);

  useEffect(() => {
    const pin = pinRef.current, stage = stageRef.current, canvas = canvasRef.current, labelsEl = labelsRef.current;
    if (!pin || !stage || !canvas || !labelsEl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const disposers: (() => void)[] = [];
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setClearColor(C.stage, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const fog = new THREE.Fog(C.stage, 16, 30); scene.fog = fog;
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

      scene.add(new THREE.HemisphereLight(0xdce6f5, 0x0f172a, 0.8));
      const key = new THREE.DirectionalLight(0xfff6ea, 1.0); key.position.set(5, 9, 6); key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 10; key.shadow.camera.bottom = -10; key.shadow.bias = -0.0005;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xb8c8d8, 0.35); fill.position.set(-6, 4, -3); scene.add(fill);
      const agentLight = new THREE.PointLight(C.agent, 0, 16, 2); agentLight.position.set(0, 4.6, 0); scene.add(agentLight);

      const root = new THREE.Group(); scene.add(root);
      const bench = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x111a2e, roughness: 0.95 }));
      bench.position.y = -0.15; bench.receiveShadow = true; root.add(bench);
      const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x172033); grid.position.y = 0.01; root.add(grid);

      const M = (color: number, extra?: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...(extra || {}) });
      const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };

      function knob(parent: THREE.Object3D, x: number, y: number, z: number, rot: [number, number, number], r0: number) {
        const r = r0 * 1.35;
        const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rot[0], rot[1], rot[2]);
        const body = mesh(new THREE.CylinderGeometry(r, r, 0.14, 24), M(C.knob, { roughness: 0.4 }));
        const tick = mesh(new THREE.BoxGeometry(0.035, 0.02, r * 0.9), M(C.dark)); tick.position.set(0, 0.08, r * 0.45);
        body.add(tick); g.add(body);
        const hit = new THREE.Mesh(new THREE.SphereGeometry(r * 2.4, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
        hit.userData.knob = g; g.add(hit); parent.add(g);
        g.userData.spin = 0; g.userData.hit = hit;
        return g;
      }
      function port(parent: THREE.Object3D, kind: number, x: number, y: number, z: number, color: number) {
        const geo = kind === 0 ? new THREE.BoxGeometry(0.5, 0.28, 0.18) : kind === 1 ? new THREE.CylinderGeometry(0.24, 0.24, 0.18, 6) : new THREE.CylinderGeometry(0.26, 0.26, 0.18, 3);
        const p = mesh(geo, M(color, { roughness: 0.35, metalness: 0.4 }), x, y, z);
        if (kind !== 0) p.rotation.x = Math.PI / 2;
        const hole = mesh(kind === 0 ? new THREE.BoxGeometry(0.3, 0.12, 0.1) : new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), M(0x0b0f0d, { roughness: 1 }));
        if (kind === 0) hole.position.z = 0.06; else hole.position.y = 0.06;
        p.add(hole); parent.add(p); return p;
      }

      type Built = { g: THREE.Group; knobs: THREE.Group[]; portOffset: THREE.Vector3; adapterOffset: THREE.Vector3; joints?: THREE.Group[] };
      function microscope(): Built {
        const g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(1.6, 0.25, 1.2), M(C.alloy), 0, 0.125, 0));
        g.add(mesh(new THREE.BoxGeometry(0.35, 1.6, 0.35), M(C.dark), -0.45, 1.05, -0.3));
        g.add(mesh(new THREE.BoxGeometry(1.0, 0.25, 0.3), M(C.dark), -0.05, 1.75, -0.3));
        g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.2, 24), M(C.alloy, { metalness: 0.4, roughness: 0.35 }), 0.3, 1.3, -0.05));
        g.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.25, 24), M(0x1e262a, { metalness: 0.6, roughness: 0.3 }), 0.3, 0.6, -0.05));
        g.add(mesh(new THREE.BoxGeometry(0.9, 0.08, 0.7), M(0xa8b3c2), 0.3, 0.4, -0.05));
        const eye = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), M(C.dark), 0.3, 2.1, 0.25); eye.rotation.x = Math.PI / 3.2; g.add(eye);
        const knobs = [knob(g, -0.45, 1.05, 0.0, [Math.PI / 2, 0, 0], 0.16), knob(g, 0.55, 0.25, 0.62, [Math.PI / 2, 0, 0], 0.11), knob(g, -0.2, 0.25, 0.62, [Math.PI / 2, 0, 0], 0.11)];
        const p = port(g, 0, -0.8, 0.45, -0.2, C.port[0]); p.rotation.y = -Math.PI / 2;
        return { g, knobs, portOffset: new THREE.Vector3(-0.98, 0.45, -0.2), adapterOffset: new THREE.Vector3(-1.05, 0.45, -0.2) };
      }
      function printer(): Built {
        const g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(1.7, 0.2, 1.5), M(C.dark), 0, 0.1, 0));
        const rail = M(C.alloy, { metalness: 0.5, roughness: 0.3 });
        ([[-0.75, -0.65], [0.75, -0.65], [-0.75, 0.65], [0.75, 0.65]] as [number, number][]).forEach(([x, z]) => g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 12), rail, x, 1.15, z)));
        g.add(mesh(new THREE.BoxGeometry(1.7, 0.1, 1.5), M(C.dark), 0, 2.1, 0));
        g.add(mesh(new THREE.BoxGeometry(1.6, 0.08, 0.12), rail, 0, 1.5, 0.1));
        g.add(mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), M(0x94a3b8), 0.2, 1.35, 0.1));
        const nozzle = mesh(new THREE.ConeGeometry(0.06, 0.16, 12), M(0xc8a87a, { metalness: 0.7 }), 0.2, 1.12, 0.1); nozzle.rotation.x = Math.PI; g.add(nozzle);
        g.add(mesh(new THREE.BoxGeometry(1.2, 0.05, 1.1), M(0x334155), 0, 0.23, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 20), M(C.accent, { roughness: 0.7 }), 0.2, 0.5, 0.1));
        const knobs = [knob(g, -0.5, 0.2, 0.78, [Math.PI / 2, 0, 0], 0.11), knob(g, -0.15, 0.2, 0.78, [Math.PI / 2, 0, 0], 0.11), knob(g, 0.2, 0.2, 0.78, [Math.PI / 2, 0, 0], 0.11)];
        const p = port(g, 1, 0.95, 0.5, -0.4, C.port[1]); p.rotation.set(0, 0, Math.PI / 2);
        return { g, knobs, portOffset: new THREE.Vector3(1.05, 0.5, -0.4), adapterOffset: new THREE.Vector3(1.15, 0.5, -0.4) };
      }
      function robotArm(): Built {
        const g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.3, 32), M(C.dark), 0, 0.15, 0));
        const j0 = new THREE.Group(); j0.position.set(0, 0.3, 0); g.add(j0);
        j0.add(mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.5, 24), M(C.alloy), 0, 0.25, 0));
        const j1 = new THREE.Group(); j1.position.set(0, 0.5, 0); j1.rotation.z = -0.55; j0.add(j1);
        j1.add(mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), M(C.alloy), 0, 0.75, 0));
        const j2 = new THREE.Group(); j2.position.set(0, 1.5, 0); j2.rotation.z = 1.2; j1.add(j2);
        j2.add(mesh(new THREE.BoxGeometry(0.24, 1.3, 0.24), M(C.alloy), 0, 0.65, 0));
        const wrist = new THREE.Group(); wrist.position.set(0, 1.3, 0); j2.add(wrist);
        wrist.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16), M(C.dark), 0, 0.12, 0));
        const fa = mesh(new THREE.BoxGeometry(0.06, 0.3, 0.12), M(C.dark), -0.1, 0.4, 0); const fb = fa.clone(); fb.position.x = 0.1; wrist.add(fa); wrist.add(fb);
        [j0, j1, j2].forEach((j, i) => { const ring = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.36, 20), M(C.accent, { roughness: 0.6 }), 0, i === 0 ? 0.5 : 0, 0); ring.rotation.x = Math.PI / 2; j.add(ring); });
        const knobs = [knob(g, -0.35, 0.3, 0.55, [Math.PI / 2, 0, 0], 0.11), knob(g, 0, 0.3, 0.6, [Math.PI / 2, 0, 0], 0.11), knob(g, 0.35, 0.3, 0.55, [Math.PI / 2, 0, 0], 0.11)];
        const p = port(g, 2, 0.75, 0.15, -0.55, C.port[2]); p.rotation.set(0, 0, Math.PI / 2);
        return { g, knobs, portOffset: new THREE.Vector3(0.85, 0.15, -0.55), adapterOffset: new THREE.Vector3(0.98, 0.15, -0.55), joints: [j0, j1, j2] };
      }

      const machines: Machine[] = [microscope, printer, robotArm].map((build, i) => {
        const b = build(); root.add(b.g);
        const lap = new THREE.Group();
        lap.add(mesh(new THREE.BoxGeometry(1.0, 0.05, 0.7), M(C.laptop), 0, 0.025, 0));
        const scr = mesh(new THREE.BoxGeometry(1.0, 0.65, 0.04), M(C.laptop), 0, 0.35, -0.33); scr.rotation.x = -0.25; lap.add(scr);
        const glow = mesh(new THREE.PlaneGeometry(0.88, 0.52), new THREE.MeshStandardMaterial({ color: C.screen, emissive: C.screen, emissiveIntensity: 0.6, roughness: 1 }), 0, 0.36, -0.3); glow.rotation.x = -0.25; lap.add(glow);
        root.add(lap);
        const ad = new THREE.Group();
        const body = mesh(new THREE.BoxGeometry(0.62, 0.36, 0.36), M(C.accent, { emissive: C.accent, emissiveIntensity: 0.25, roughness: 0.45 })) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
        ad.add(body); ad.add(mesh(new THREE.BoxGeometry(0.22, 0.06, 0.12), M(0x0b0f0d, { roughness: 1 }), 0, 0.19, 0));
        ad.add(mesh(new THREE.BoxGeometry(0.5, 0.02, 0.02), M(0xfff3dd, { emissive: 0xfff3dd, emissiveIntensity: 0.9 }), 0, 0.06, 0.19));
        ad.scale.setScalar(0.0001); root.add(ad);
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 40), new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0, side: THREE.DoubleSide }));
        ring.rotation.x = Math.PI / 2; root.add(ring);
        const el = document.createElement("div"); el.className = s.label;
        el.innerHTML = `<div class="${s.lt}">${SPECS[i].name} · MHS</div>` + SPECS[i].lines.map((l) => `<span class="${s.ln}"><b>${l[0]}</b> ${l[1]}</span>`).join("");
        labelsEl.appendChild(el);
        return {
          ...b, spec: SPECS[i], laptop: lap, adapter: ad, adapterBody: body, ring, ringT: 9, wasSeated: false,
          label: el, lineEls: Array.from(el.querySelectorAll<HTMLElement>(`.${s.ln}`)), titleEl: el.querySelector<HTMLElement>(`.${s.lt}`) as HTMLElement,
        };
      });

      const human = new THREE.Group();
      human.add(mesh(new THREE.CapsuleGeometry(0.2, 0.9, 6, 12), M(C.human), 0, 0.85, 0));
      human.add(mesh(new THREE.SphereGeometry(0.19, 16, 12), M(0xc9bba8), 0, 1.62, 0));
      const armL = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), M(C.human), -0.22, 1.05, -0.2); armL.rotation.x = 1.1; human.add(armL);
      human.position.set(-0.2, 0, 1.9); root.add(human);

      const agent = new THREE.Group();
      const orb = mesh(new THREE.SphereGeometry(0.3, 32, 24), new THREE.MeshStandardMaterial({ color: C.agent, emissive: C.agent, emissiveIntensity: 1.0, roughness: 0.3 }));
      orb.castShadow = false; agent.add(orb);
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.46, 48), new THREE.MeshBasicMaterial({ color: C.agent, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
      halo.rotation.x = Math.PI / 2; agent.add(halo);
      agent.position.set(0, 4.6, 0); agent.scale.setScalar(0.0001); root.add(agent);
      const lineMat = new THREE.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0 });
      const links = machines.map(() => { const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const l = new THREE.Line(geo, lineMat); root.add(l); return l; });
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffe7bf, transparent: true, opacity: 0 });
      const pulses = machines.map((_, i) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), pulseMat); p.userData.t = i * 0.33; root.add(p); return p; });

      const cableMat = M(C.cable, { roughness: 0.9, transparent: true });
      const tangleMat = M(0x475569, { roughness: 0.9, transparent: true });
      type Cable = THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
      const cables: Cable[] = [];
      function makeCable(a: THREE.Vector3, b: THREE.Vector3, sag: number, mat: THREE.MeshStandardMaterial): Cable {
        const mid = a.clone().lerp(b, 0.5); mid.y = Math.min(a.y, b.y) * 0.4 + 0.08; mid.x += sag;
        const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.03, 8, false), mat);
        root.add(c); return c;
      }
      function buildCables() {
        cables.forEach((c) => { root.remove(c); c.geometry.dispose(); }); cables.length = 0;
        machines.forEach((m, i) => {
          const a = m.g.position.clone().add(m.portOffset); const b = m.laptop.position.clone().add(new THREE.Vector3(0, 0.05, 0.2));
          const c = makeCable(a, b, i === 1 ? 0 : i === 0 ? -0.4 : 0.4, cableMat); c.userData.m = i; c.userData.tangle = false; cables.push(c);
        });
        const l0 = machines[0].laptop.position, l1 = machines[1].laptop.position, l2 = machines[2].laptop.position;
        [
          makeCable(l0.clone().add(new THREE.Vector3(0.4, 0.05, 0.1)), l2.clone().add(new THREE.Vector3(-0.4, 0.05, 0.1)), 0, tangleMat),
          makeCable(l1.clone().add(new THREE.Vector3(-0.3, 0.05, 0.2)), machines[0].g.position.clone().add(new THREE.Vector3(0.6, 0.3, 0.9)), 0.6, tangleMat),
          makeCable(l1.clone().add(new THREE.Vector3(0.3, 0.05, 0.2)), machines[2].g.position.clone().add(new THREE.Vector3(-0.6, 0.3, 0.9)), -0.6, tangleMat),
        ].forEach((c) => { c.userData.tangle = true; c.userData.m = -1; cables.push(c); });
      }

      let spreadX = 3.4;
      const mixNum = (a: number, b: number, t: number) => a + (b - a) * t;
      function stateAt(p: number): State {
        const i = Math.min(2, Math.floor(p)), t = smooth(Math.min(1, Math.max(0, p - i)));
        const a = K[i], b = K[i + 1];
        return {
          mx: a.mx.map((v, j) => mixNum(v, b.mx[j], t)), mvis: a.mvis.map((v, j) => mixNum(v, b.mvis[j], t)),
          lapVis: mixNum(a.lapVis, b.lapVis, t), cabVis: mixNum(a.cabVis, b.cabVis, t), tangle: mixNum(a.tangle, b.tangle, t), human: mixNum(a.human, b.human, t),
          adapt: mixNum(a.adapt, b.adapt, t), agent: mixNum(a.agent, b.agent, t), spin: mixNum(a.spin, b.spin, t), lap0: mixNum(a.lap0, b.lap0, t),
        };
      }
      function frameAt(p: number) {
        const i = Math.min(2, Math.floor(p)), t = smooth(Math.min(1, Math.max(0, p - i)));
        const a = F[i], b = F[i + 1]; const wide = spreadX + 2.3; const ahw = a.hw || wide, bhw = b.hw || wide;
        return { cx: mixNum(a.cx, b.cx, t), cy: mixNum(a.cy, b.cy, t), hw: mixNum(ahw, bhw, t), hh: mixNum(a.hh, b.hh, t), dir: a.dir.clone().lerp(b.dir, t).normalize() };
      }

      const S = stateAt(0);
      let progress = 0, beatNow = 0;
      const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
      machines.forEach((m, i) => { m.laptop.rotation.y = i === 0 ? -0.5 : i === 2 ? 0.5 : 0; });
      const lapBase = (i: number) => new THREE.Vector3(K[1].mx[i] * spreadX + (i === 0 ? 1.6 : i === 2 ? -1.6 : 0), 0.03, i === 1 ? 2.3 : 2.0);
      const lap0Single = new THREE.Vector3(1.9, 0.03, 1.8);

      function applyBeat(b: number) {
        beatNow = b; setBeat(b); setHud(HUD[b]);
        machines.forEach((m) => { m.label.style.opacity = b >= 2 ? "" : "0"; });
      }
      function readScroll() {
        if (!pin || !stage) return;
        const rect = pin.getBoundingClientRect();
        const total = pin.offsetHeight - stage.offsetHeight;
        const y = Math.min(Math.max(-rect.top, 0), total);
        progress = total > 0 ? (y / total) * 3 : 0;
        const b = Math.min(3, Math.round(progress)); if (b !== beatNow) applyBeat(b);
        capRefs.current.forEach((el, i) => { if (!el) return; const o = Math.max(0, 1 - Math.abs(progress - i) * 1.6); el.style.opacity = String(o); el.style.transform = `translateY(${(1 - o) * 8}px)`; });
        railRefs.current.forEach((el, i) => { if (el) el.style.setProperty("--f", String(Math.min(1, Math.max(0, i === 0 ? 1 : progress - (i - 1))))); });
      }
      window.addEventListener("scroll", readScroll, { passive: true }); window.addEventListener("resize", readScroll);
      disposers.push(() => { window.removeEventListener("scroll", readScroll); window.removeEventListener("resize", readScroll); });
      readScroll();

      // drag to rotate
      let dragging = false, lastX = 0, rotY = 0, rotTarget = 0, idle = 0;
      const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; idle = 0; };
      const onMove = (e: PointerEvent) => { if (!dragging) return; rotTarget += (e.clientX - lastX) * 0.006; lastX = e.clientX; idle = 0; };
      const onUp = () => { dragging = false; };
      canvas.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
      disposers.push(() => { canvas.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); });

      // hover / tap knobs, with an automatic tour when nobody is pointing
      const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(-9, -9);
      const hitMeshes: THREE.Object3D[] = []; machines.forEach((m) => m.knobs.forEach((k) => hitMeshes.push(k.userData.hit as THREE.Object3D)));
      let hot: Hot = null, pinned: THREE.Group | null = null, tourT = 0, tourI = 0, ptrMoved = 0;
      const setPtr = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1; };
      const onPtrMove = (e: PointerEvent) => { setPtr(e); ptrMoved = 0; };
      const onPtrLeave = () => { ptr.set(-9, -9); };
      const onPtrDown = (e: PointerEvent) => { setPtr(e); if (beatNow === 3) { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(hitMeshes, false)[0]; pinned = h ? (h.object.userData.knob as THREE.Group) : null; ptrMoved = 0; } };
      canvas.addEventListener("pointermove", onPtrMove); canvas.addEventListener("pointerleave", onPtrLeave); canvas.addEventListener("pointerdown", onPtrDown);
      disposers.push(() => { canvas.removeEventListener("pointermove", onPtrMove); canvas.removeEventListener("pointerleave", onPtrLeave); canvas.removeEventListener("pointerdown", onPtrDown); });
      const findKnob = (g: THREE.Group): Hot => { let out: Hot = null; machines.forEach((m) => { const j = m.knobs.indexOf(g); if (j >= 0) out = { machine: m, j }; }); return out; };
      const knobMat = (h: NonNullable<Hot>) => (h.machine.knobs[h.j].children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      function setHot(next: Hot) {
        if (hot && next && next.machine === hot.machine && next.j === hot.j) return;
        if (hot) { hot.machine.lineEls.forEach((l) => l.classList.remove(s.hot)); hot.machine.titleEl.textContent = `${hot.machine.spec.name} · MHS`; knobMat(hot).emissive.setHex(0x000000); }
        hot = next;
        if (hot) { const [idx, kn] = hot.machine.spec.knobMap[hot.j]; hot.machine.lineEls[0].classList.add(s.hot); hot.machine.lineEls[idx].classList.add(s.hot); hot.machine.titleEl.textContent = `${hot.machine.spec.name} · turning ${kn}`; const mat = knobMat(hot); mat.emissive.setHex(C.accent); mat.emissiveIntensity = 0.8; }
      }

      let lastLayoutX: number | null = null;
      function resize() { const w = stage!.clientWidth, h = stage!.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); spreadX = camera.aspect < 0.85 ? 2.6 : 3.4; lastLayoutX = null; }
      const ro = new ResizeObserver(resize); ro.observe(stage); resize();
      disposers.push(() => ro.disconnect());

      const tmp = new THREE.Vector3();
      const project = (v: THREE.Vector3) => { tmp.copy(v).project(camera); return { x: ((tmp.x + 1) / 2) * stage!.clientWidth, y: ((1 - tmp.y) / 2) * stage!.clientHeight, z: tmp.z }; };

      let last = performance.now(); let raf = 0; let alive = true;
      function frame(now: number) {
        if (!alive) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const k = reduced ? 1 : 1 - Math.pow(0.0005, dt);
        const T = stateAt(progress);
        for (let i = 0; i < 3; i++) { S.mx[i] = lerp(S.mx[i], T.mx[i], k); S.mvis[i] = lerp(S.mvis[i], T.mvis[i], k); }
        (["lapVis", "cabVis", "tangle", "human", "adapt", "agent", "spin", "lap0"] as const).forEach((key) => { S[key] = lerp(S[key], T[key], k); });

        const f = frameAt(progress);
        const d = Math.max(f.hw / (tanHalf * camera.aspect), f.hh / tanHalf) * 1.06;
        const look = new THREE.Vector3(f.cx, f.cy, 0); const pos = look.clone().add(f.dir.multiplyScalar(d));
        if (camPos.lengthSq() === 0) { camPos.copy(pos); camLook.copy(look); }
        const ck = reduced ? 1 : 1 - Math.pow(0.01, dt);
        camPos.lerp(pos, ck); camLook.lerp(look, ck);
        camera.position.copy(camPos); camera.lookAt(camLook);
        fog.near = d * 1.15; fog.far = d * 2.2;

        let layoutX = 0;
        const W = stage!.clientWidth, H = stage!.clientHeight, narrow = W < 560;
        machines.forEach((m, i) => {
          m.g.position.x = S.mx[i] * spreadX; m.g.scale.setScalar(0.0001 + S.mvis[i]); m.g.visible = S.mvis[i] > 0.02;
          const target = i === 0 ? lap0Single.clone().lerp(lapBase(0), 1 - S.lap0) : lapBase(i);
          m.laptop.position.copy(target); layoutX += m.g.position.x + m.laptop.position.x;
          const lv = S.lapVis * S.mvis[i]; m.laptop.visible = lv > 0.02; m.laptop.scale.setScalar(0.0001 + lv);
          const a = S.adapt; const snap = a < 0.999 ? (1 - Math.pow(1 - a, 3)) * (1 + 0.25 * Math.sin(a * Math.PI)) : 1;
          m.adapter.position.copy(m.g.position).add(m.adapterOffset); m.adapter.position.y += (1 - a) * 1.6;
          m.adapter.scale.setScalar(0.0001 + snap * S.mvis[i]); m.adapter.visible = a > 0.01;
          m.adapterBody.material.emissiveIntensity = 0.25 + 0.5 * S.agent + (hot && hot.machine === m ? 0.4 : 0);
          const seated = a > 0.92; if (seated && !m.wasSeated) m.ringT = 0; m.wasSeated = seated;
          m.ringT += dt; const rt = Math.min(1, m.ringT / 0.7);
          m.ring.position.copy(m.adapter.position); m.ring.position.y -= 0.15; m.ring.scale.setScalar(0.4 + rt * 2.2); m.ring.material.opacity = (1 - rt) * 0.8 * S.mvis[i]; m.ring.visible = rt < 1;
          m.knobs.forEach((kn, j) => { kn.userData.spin += dt * S.spin * (0.9 + j * 0.5) * (j % 2 ? -1 : 1); kn.children[0].rotation.y = kn.userData.spin; });
          if (m.joints) { const t = now / 1000; m.joints[0].rotation.y = Math.sin(t * 0.6) * 0.7 * S.spin; m.joints[1].rotation.z = -0.55 + Math.sin(t * 0.8) * 0.25 * S.spin; m.joints[2].rotation.z = 1.2 + Math.cos(t * 0.9) * 0.3 * S.spin; }
          const anchor = new THREE.Vector3(0, m.spec.top, 0).applyMatrix4(m.g.matrixWorld);
          const p = project(anchor); const lw = m.label.offsetWidth || 186, lh = m.label.offsetHeight || 90;
          const lx = Math.min(W - lw / 2 - 8, Math.max(lw / 2 + 8, p.x)); const ly = Math.min(H - lh - 140, Math.max(8, p.y - lh - 8));
          m.label.style.left = `${lx}px`; m.label.style.top = `${ly}px`;
          const narrowOk = !narrow || (beatNow === 3 ? !!(hot && hot.machine === m) : Math.floor(now / 2400) % 3 === i);
          m.label.style.opacity = S.adapt > 0.6 && S.mvis[i] > 0.9 && p.z < 1 && narrowOk ? "" : "0";
        });
        if (lastLayoutX === null || Math.abs(layoutX - lastLayoutX) > 0.002) { buildCables(); lastLayoutX = layoutX; }
        cables.forEach((c) => { const v = c.userData.tangle ? S.tangle : S.cabVis * S.mvis[c.userData.m as number]; c.material.opacity = v; c.visible = v > 0.02; });
        human.scale.setScalar(0.0001 + S.human); human.visible = S.human > 0.02;

        agent.scale.setScalar(0.0001 + S.agent); agent.visible = S.agent > 0.02;
        agent.position.y = 4.6 + Math.sin(now / 900) * 0.12 * S.agent; halo.rotation.z += dt * 0.4;
        agentLight.intensity = 2.0 * S.agent; lineMat.opacity = 0.8 * S.agent; pulseMat.opacity = S.agent;
        machines.forEach((m, i) => {
          const a = agent.position.clone().add(new THREE.Vector3(0, -0.3, 0)); const bFull = m.adapter.position.clone().add(new THREE.Vector3(0, 0.2, 0));
          const b = a.clone().lerp(bFull, smooth(S.agent));
          const posAttr = links[i].geometry.attributes.position as THREE.BufferAttribute; posAttr.setXYZ(0, a.x, a.y, a.z); posAttr.setXYZ(1, b.x, b.y, b.z); posAttr.needsUpdate = true; links[i].visible = S.agent > 0.02;
          const pu = pulses[i]; pu.userData.t = (pu.userData.t + dt * 0.55 * S.spin) % 1; pu.position.lerpVectors(a, bFull, pu.userData.t); pu.visible = S.agent > 0.9;
        });

        idle += dt; if (!reduced && !dragging && idle > 2.5) rotTarget += dt * 0.035;
        rotY = lerp(rotY, rotTarget, reduced ? 1 : k); root.rotation.y = rotY;

        if (beatNow === 3) {
          let next: Hot = null; ptrMoved += dt;
          if (ptr.x > -2 && ptrMoved < 3) { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(hitMeshes, false)[0]; if (h) next = findKnob(h.object.userData.knob as THREE.Group); }
          if (!next && pinned) next = findKnob(pinned);
          if (!next) { tourT += dt; if (tourT > 2.2 || !hot) { tourT = 0; const all: NonNullable<Hot>[] = []; machines.forEach((m) => m.knobs.forEach((_, j) => all.push({ machine: m, j }))); tourI = (tourI + 1) % all.length; next = all[tourI]; } else next = hot; }
          setHot(next); canvas!.style.cursor = ptr.x > -2 && ptrMoved < 3 && next && !pinned ? "pointer" : "grab";
        } else if (hot) { setHot(null); pinned = null; canvas!.style.cursor = "grab"; }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      disposers.push(() => { alive = false; cancelAnimationFrame(raf); renderer.dispose(); labelsEl.innerHTML = ""; });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
    return () => { disposers.forEach((d) => d()); };
  }, []);

  // Play: glide the page through the pinned section over 16 s. Any wheel or touch cancels it.
  useEffect(() => {
    const stop = () => { if (playingRef.current) { playingRef.current = false; setPlaying(false); cancelAnimationFrame(playRaf.current); } };
    window.addEventListener("wheel", stop, { passive: true }); window.addEventListener("touchstart", stop, { passive: true });
    return () => { window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); };
  }, []);
  function togglePlay() {
    const pin = pinRef.current, stage = stageRef.current; if (!pin || !stage) return;
    if (playingRef.current) { playingRef.current = false; setPlaying(false); cancelAnimationFrame(playRaf.current); return; }
    playingRef.current = true; setPlaying(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = window.scrollY + pin.getBoundingClientRect().top; const total = pin.offsetHeight - stage.offsetHeight;
    const t0 = performance.now(), dur = reduced ? 1 : 16000;
    const tick = (now: number) => {
      if (!playingRef.current) return;
      const u = Math.min(1, (now - t0) / dur); window.scrollTo(0, top + total * u);
      if (u < 1) playRaf.current = requestAnimationFrame(tick); else { playingRef.current = false; setPlaying(false); }
    };
    playRaf.current = requestAnimationFrame(tick);
  }

  return (
    <div className={s.bleed}>
      <p className={s.cue}><i />Scroll to run the bench · drag to look around</p>
      <div className={s.pin} ref={pinRef}>
        <div className={s.stage} ref={stageRef}>
          <canvas ref={canvasRef} aria-label="Three lab machines on a bench. Scrolling adds adapters and an AI that runs them." role="img" />
          <div className={s.vignette} />
          <div className={s.labels} ref={labelsRef} />
          <div className={s.hud}>
            <div className={s.row}><i className={s.led} /><span className={`${s.t} ${err ? s.err : ""}`}>{err ? `scene error: ${err}` : hud}</span></div>
            <div className={s.rail}>{[0, 1, 2, 3].map((i) => <i key={i} ref={(el) => { railRefs.current[i] = el; }} />)}</div>
          </div>
          <button type="button" className={`${s.play} ${playing ? s.playOn : ""}`} onClick={togglePlay} aria-label="Play the four steps">{playing ? "■ Stop" : "▶ Play the four steps"}</button>
          <div className={s.caps}>
            {CAPTIONS.map((c, i) => (
              <div key={i} className={s.cap} ref={(el) => { capRefs.current[i] = el; }} style={{ opacity: i === 0 ? 1 : 0 }}>
                <div className={s.k}>{c.k}</div>
                <h2>{c.h}</h2>
                <p>{i === 3 ? <>It reads each label, then turns the knobs itself, in parallel, inside the limits the label sets. Watch the highlight: as a knob turns, the line it is obeying lights up. <b>Hover or tap a knob</b> to pick one. It is not guessing. It is reading the manual.</> : c.p}</p>
              </div>
            ))}
          </div>
          <div className={s.hint}>{beat === 3 ? "hover or tap a knob · drag to rotate" : "drag to rotate"}</div>
        </div>
      </div>

      <div className={s.evidence}>
        <div className={s.eyebrow}>What the first six pilots reported, August 2026</div>
        <div className={s.grid}>
          {EVIDENCE.map((e) => (
            <div key={e.s + e.n} className={s.ev}>
              <div className={s.n}>{e.n}<small>{e.u}</small></div>
              <div className={s.w}>{e.w}</div>
              <div className={s.s}>{e.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
