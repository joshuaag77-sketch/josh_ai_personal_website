"use client";

import { useEffect, useState } from "react";
import s from "./MhsFactory.module.css";

// Five factory machines. Before MHS: five vendor interfaces and custom integrations.
// With MHS: each machine gets an MHS software driver, and one AI agent works through the same interface for all of them.
// The workflow at the bottom is an illustrative future application, not something Anthropic has demonstrated.

type Machine = { id: string; name: string; cap: string; reads: string; limit: string; vendor: string; vendorVar: string };
const MACHINES: Machine[] = [
  { id: "mill", name: "CNC mill", cap: "cuts metal", reads: "spindle load · position", limit: "spindle ≤ 12,000 rpm", vendor: "G-code · serial", vendorVar: "--vendorA" },
  { id: "arm", name: "Robot arm", cap: "moves parts", reads: "joint angles · gripper force", limit: "≤ 0.3 m/s near people", vendor: "vendor SDK", vendorVar: "--vendorB" },
  { id: "scan", name: "3D scanner", cap: "measures shape", reads: "point cloud · deviation", limit: "laser class 2 only", vendor: "proprietary app", vendorVar: "--vendorC" },
  { id: "weld", name: "Laser welder", cap: "joins metal", reads: "power · seam temp", limit: "power ≤ 4 kW · door closed", vendor: "PLC tags", vendorVar: "--vendorD" },
  { id: "cam", name: "Inspection camera", cap: "checks quality", reads: "image · defect score", limit: "read-only", vendor: "REST API", vendorVar: "--vendorE" },
];
// Illustrative workflow: which machine each step uses
const FLOW: { label: string; m: number }[] = [
  { label: "scan", m: 2 }, { label: "mill", m: 0 }, { label: "move", m: 1 }, { label: "weld", m: 3 }, { label: "inspect", m: 4 }, { label: "adjust", m: 0 },
];


const EVIDENCE = [
  { n: "8", u: "HOURS", w: "From unintegrated equipment to a completed dose-response curve, including an autonomous rerun. A vendor-built automated setup typically takes weeks.", s: "Carnegie Mellon" },
  { n: "99.3", u: "%", w: "695 of 700 blind trials recovered by the script Claude wrote, up from 58% early on. Recovery fell from about 150 s during development to roughly 1 to 14 s depending on the disturbance.", s: "QuEra Computing" },
  { n: "7", u: "PROGRAMS", w: "A microscopy rig that needed seven separate programs, launched one after another, now runs from a single dashboard. Adding a new camera took minutes.", s: "HHMI Janelia" },
  { n: "9,143", u: "DISPENSES", w: "The refined model predicted multi-dispense precision about 12% more accurately than the manufacturer's technical specification on held-out experiments.", s: "Tetsuwan Scientific" },
  { n: "140 → 10", u: "µL/s", w: "The agent adapted pipetting speed on its own for water versus a thick protein solution. Then it kept retrying a step in a foaming vessel.", s: "Genentech" },
];

const W = 1000, H = 560;
const X = [110, 305, 500, 695, 890]; // machine centers
const MY = 92; // machine card center y
const DY = 262; // driver box y
const AY = 452; // agent box center y

function Icon({ id }: { id: string }) {
  // Simple line icons, drawn in a 64x48 box centered at 0,0
  switch (id) {
    case "mill":
      return (<g className={s.stroke}><rect x="-26" y="6" width="52" height="14" rx="2" /><path d="M-8 -22 h16 v18 h-16 z M0 -4 v10" /><path d="M-26 -22 h8 M18 -22 h8 M-22 -22 v28 M22 -22 v28" /></g>);
    case "arm":
      return (<g className={s.stroke}><path d="M-22 20 h44" /><path d="M-10 20 v-14 l16 -16 l14 6" /><circle cx="-10" cy="6" r="3.5" /><circle cx="6" cy="-10" r="3.5" /><path d="M20 -4 l6 -8 M20 -4 l8 2" /></g>);
    case "scan":
      return (<g className={s.stroke}><rect x="-26" y="-14" width="26" height="28" rx="3" /><circle cx="-13" cy="0" r="6" /><path d="M2 -10 l24 -8 M2 0 h24 M2 10 l24 8" strokeDasharray="3 3" /></g>);
    case "weld":
      return (<g className={s.stroke}><path d="M-6 -22 h12 l4 16 h-20 z" /><path d="M0 -6 v14" /><path d="M-24 20 h48" /><path d="M-8 14 l-4 -6 M8 14 l4 -6 M0 20 v-4" /></g>);
    case "cam":
      return (<g className={s.stroke}><rect x="-22" y="-12" width="44" height="28" rx="4" /><circle cx="0" cy="2" r="8" /><circle cx="0" cy="2" r="3" /><path d="M-8 -12 l4 -6 h8 l4 6" /></g>);
    default: return null;
  }
}

export function MhsFactory() {
  const [mode, setMode] = useState<"before" | "with">("with");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (mode !== "with" || !playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = setInterval(() => setStep((v) => (v + 1) % FLOW.length), 1400);
    return () => clearInterval(t);
  }, [mode, playing]);

  const hot = mode === "with" ? FLOW[step].m : -1;
  const withMode = mode === "with";

  return (
    <div className={s.wrap}>
      <div className={s.top}>
        <div className={s.eyebrow}>Different machines. One interface an AI can understand.</div>
        <div className={s.toggle} role="tablist" aria-label="Before and with MHS">
          <button type="button" role="tab" aria-selected={!withMode} className={!withMode ? s.on : ""} onClick={() => setMode("before")}>Before MHS</button>
          <button type="button" role="tab" aria-selected={withMode} className={withMode ? s.on : ""} onClick={() => setMode("with")}>With MHS</button>
        </div>
      </div>

      <div className={s.frame}>
        <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={withMode ? "Five factory machines, each with an MHS driver, all connected to one AI agent." : "Five factory machines, each with its own vendor interface and custom integrations."}>
          {/* machines */}
          {MACHINES.map((m, i) => (
            <g key={m.id} transform={`translate(${X[i]} ${MY})`}>
              <rect x="-82" y="-66" width="164" height="132" rx="12" className={`${s.panel} ${hot === i ? s.hotCard : ""}`} />
              <g transform="translate(0 -18)"><Icon id={m.id} /></g>
              <text y="34" textAnchor="middle" className={s.t}>{m.name}</text>
              <text y="52" textAnchor="middle" className={s.ts}>{m.cap}</text>
            </g>
          ))}

          {/* BEFORE: vendor interfaces and custom integrations */}
          <g className={`${s.layer} ${withMode ? s.hide : ""}`}>
            {MACHINES.map((m, i) => (
              <g key={m.id} transform={`translate(${X[i]} ${DY})`}>
                <rect x="-70" y="-24" width="140" height="48" rx={i % 2 ? 24 : 6} className={s.vendorBox} style={{ stroke: `var(${m.vendorVar})` }} />
                <text y="-4" textAnchor="middle" className={s.vendorT} style={{ fill: `var(${m.vendorVar})` }}>VENDOR INTERFACE</text>
                <text y="13" textAnchor="middle" className={s.ts}>{m.vendor}</text>
                <path d={`M0 -66 v42`} className={s.stroke} style={{ stroke: `var(${m.vendorVar})` }} />
              </g>
            ))}
            {/* tangled custom integrations between pairs */}
            {[[0, 1], [1, 2], [2, 3], [3, 4], [0, 3], [1, 4]].map(([a, b], k) => {
              const ax = X[a], bx = X[b]; const y1 = DY + 24; const dip = 330 + (k % 3) * 34;
              return (<path key={k} d={`M${ax} ${y1} C ${ax} ${dip}, ${bx} ${dip}, ${bx} ${y1}`} className={s.vendor} style={{ stroke: `var(${MACHINES[a].vendorVar})` }} />);
            })}
            {[[0, 1, 340], [2, 3, 348], [1, 4, 420]].map(([a, b, y], k) => (
              <g key={k} transform={`translate(${(X[a] + X[b]) / 2} ${y})`}>
                <rect x="-64" y="-11" width="128" height="22" rx="11" className={s.panel} />
                <text y="4" textAnchor="middle" className={s.tm}>CUSTOM INTEGRATION</text>
              </g>
            ))}
            <text x={W / 2} y={AY + 46} textAnchor="middle" className={s.ts}>Five interfaces. Every cross-machine workflow is a one-off integration project, and a new machine means starting again.</text>
          </g>

          {/* WITH: MHS drivers, common interface, one agent */}
          <g className={`${s.layer} ${withMode ? "" : s.hide}`}>
            {MACHINES.map((m, i) => (
              <g key={m.id}>
                {/* machine's existing controller stays; the driver sits above it */}
                <path d={`M${X[i]} ${MY + 66} v74`} className={s.stroke} strokeDasharray="2 3" />
                <text x={X[i] + 6} y={MY + 108} className={s.tm}>existing controller</text>
                <g transform={`translate(${X[i]} ${DY})`}>
                  <rect x="-76" y="-30" width="152" height="60" rx="8" className={s.driver} />
                  <text y="-10" textAnchor="middle" className={s.driverT}>MHS DRIVER</text>
                  <text y="6" textAnchor="middle" className={s.ts}>common interface</text>
                  <text y="20" textAnchor="middle" className={s.ts}>capabilities + safety limits</text>
                </g>
                {/* driver to agent */}
                <path d={`M${X[i]} ${DY + 30} C ${X[i]} ${DY + 90}, ${W / 2} ${AY - 120}, ${W / 2} ${AY - 44}`} className={`${s.link} ${hot === i ? s.linkHot : ""}`} />
                {hot === i && (
                  <circle r="4.5" className={s.pulse}>
                    <animateMotion dur="1.3s" repeatCount="indefinite" path={`M${W / 2} ${AY - 44} C ${W / 2} ${AY - 120}, ${X[i]} ${DY + 90}, ${X[i]} ${DY + 30}`} />
                  </circle>
                )}
              </g>
            ))}
            {/* the reference sheet for whichever machine the workflow is on */}
            <g transform={`translate(150 ${AY})`}>
              <rect x="-110" y="-40" width="220" height="80" rx="10" className={s.panel} />
              <text x="-98" y="-20" className={s.driverT}>REFERENCE SHEET</text>
              <text x="-98" y="-3" className={s.tm}>{MACHINES[hot >= 0 ? hot : 0].name}</text>
              <text x="-98" y="14" className={s.tm}>reads: {MACHINES[hot >= 0 ? hot : 0].reads}</text>
              <text x="-98" y="30" className={s.tm}>limit: {MACHINES[hot >= 0 ? hot : 0].limit}</text>
              <path d={`M110 0 h${W / 2 - 150 - 110 - 150 - 4}`} className={s.link} strokeDasharray="3 3" />
            </g>
            {/* agent */}
            <g transform={`translate(${W / 2} ${AY})`}>
              <rect x="-150" y="-44" width="300" height="88" rx="14" className={s.agent} />
              <text y="-8" textAnchor="middle" className={s.agentT}>AI agent</text>
              <text y="12" textAnchor="middle" className={s.agentS}>discovers each driver · reads its reference sheet</text>
              <text y="28" textAnchor="middle" className={s.agentS}>plans a sequence · commands · observes · adapts</text>
            </g>
            <text x={W / 2} y={AY + 66} textAnchor="middle" className={s.ts}>The machine's own controller still moves the motor. MHS sits above it and gives the AI a standard way to understand and command it.</text>
          </g>
        </svg>

        {withMode && (
          <div className={s.flow}>
            <span className={s.goal}>Goal: <em>"Make this part and inspect it."</em></span>
            <div className={s.steps} onMouseEnter={() => setPlaying(false)} onMouseLeave={() => setPlaying(true)}>
              {FLOW.map((f, i) => (
                <span key={f.label + i} style={{ display: "contents" }}>
                  <button type="button" className={`${s.step} ${i === step ? s.stepOn : ""}`} onClick={() => setStep(i)} style={{ cursor: "pointer" }}>{f.label}</button>
                  {i < FLOW.length - 1 && <span className={s.arrow}>→</span>}
                </span>
              ))}
            </div>
            <span className={s.note}>Illustrative future application. Anthropic has not demonstrated this workflow; the published pilots are in research labs.</span>
          </div>
        )}
      </div>

      <p className={s.caption}>
        {withMode
          ? <><b>With MHS:</b> once a machine has an MHS driver, an agent can discover it, read what it can do and what limits it must obey, and command it through the same interface it uses for every other machine. Cross-machine workflows no longer need to be hard-coded one at a time.</>
          : <><b>Before MHS:</b> each machine speaks its own interface. Getting the scanner to hand a measurement to the mill, or the welder to wait for the camera, is a custom integration, built once, for that workflow, by a specialist.</>}
      </p>

      <div className={s.evidence}>
        <div className={s.eyebrow}>What the first pilots reported, August 2026. Partner-reported, preliminary.</div>
        <div className={s.grid}>
          {EVIDENCE.map((e) => (
            <div key={e.s} className={s.ev}>
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
