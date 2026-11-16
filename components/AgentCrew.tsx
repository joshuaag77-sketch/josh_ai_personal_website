"use client";

import { useEffect, useRef, useState } from "react";
import s from "./AgentCrew.module.css";

// One night of errands, replayed. Three agent lanes plus the human.
// kind: "step" = agent work, "talk" = agent talking to another system's agent,
// "gate" = only the human can do it, "wall" = agent got stuck, "human" = Josh steps in, "done" = outcome.
type Kind = "step" | "talk" | "gate" | "wall" | "human" | "done";
type Ev = { lane: 0 | 1 | 2; kind: Kind; text: string; time?: string };

const LANES = [
  { name: "Ordering agent", sub: "drives the browser" },
  { name: "Support agent", sub: "runs on a schedule" },
  { name: "Paperwork agent", sub: "reads the manual" },
];

const EVENTS: Ev[] = [
  { lane: 0, kind: "human", time: "12:33 AM", text: "Me: pizza for 60, Huntsman, 11:30" },
  { lane: 0, kind: "step", text: "Opens Papa John's, confirms store and address" },
  { lane: 0, kind: "human", text: "Me: 20 pizzas feels like a lot. Rebuilds as 16" },
  { lane: 0, kind: "step", text: "Finds a bundle deal: about $137 under menu" },
  { lane: 0, kind: "gate", text: "I type the card and tip" },
  { lane: 0, kind: "done", text: "Ordered: $221.68, delivery at lunch" },
  { lane: 1, kind: "step", time: "9:00 AM", text: "Opens BILL's support chat" },
  { lane: 1, kind: "talk", text: "Explains the accidental trial to BILL's bot" },
  { lane: 1, kind: "talk", text: "Asks for a human, never agrees to pay" },
  { lane: 1, kind: "done", time: "9:25 AM", text: "$52.92 waived" },
  { lane: 2, kind: "step", text: "Reads the club's reimbursement manual" },
  { lane: 2, kind: "step", text: "Pulls the receipt, fills the form, one PDF" },
  { lane: 2, kind: "step", text: "Checks against October's filing: 3 fixes" },
  { lane: 2, kind: "wall", text: "BILL wants an SSN. Agent: no legit way around it" },
  { lane: 2, kind: "human", text: "Me: there has to be a way. Keep digging" },
  { lane: 2, kind: "step", text: "Finds it in a finance slide deck: use the WGA EIN" },
  { lane: 2, kind: "gate", text: "I type the EIN and my bank details" },
  { lane: 2, kind: "done", text: "Expense filed, set up to get paid" },
];

const KIND_LABEL: Record<Kind, string> = {
  step: "agent", talk: "agent ↔ their bot", gate: "only me", wall: "stuck", human: "me", done: "done",
};

export function AgentCrew() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(EVENTS.length - 1); return; }
    const t = setInterval(() => setI((v) => (v + 1) % (EVENTS.length + 2)), 1500);
    return () => clearInterval(t);
  }, [playing]);

  const cur = Math.min(i, EVENTS.length - 1);
  const ev = EVENTS[cur];
  const root = useRef<HTMLDivElement>(null);

  // Keep the active step visible inside its lane without moving the page.
  useEffect(() => {
    const chip = root.current?.querySelector<HTMLElement>(`[data-idx="${cur}"]`);
    const track = chip?.parentElement;
    if (!chip || !track) return;
    const left = chip.offsetLeft - track.offsetLeft - (track.clientWidth - chip.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [cur]);

  return (
    <div className={s.wrap} ref={root}>
      <div className={s.top}>
        <div className={s.eyebrow}>One request. Three agents. Two gates only I could open.</div>
        <button type="button" className={s.btn} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className={s.frame}>
        {LANES.map((lane, li) => {
          const evs = EVENTS.map((e, idx) => ({ e, idx })).filter((x) => x.e.lane === li);
          return (
            <div key={lane.name} className={`${s.lane} ${ev.lane === li ? s.laneOn : ""}`}>
              <div className={s.head}>
                <span className={s.dot} />
                <div>
                  <div className={s.name}>{lane.name}</div>
                  <div className={s.sub}>{lane.sub}</div>
                </div>
              </div>
              <div className={s.track}>
                {evs.map(({ e, idx }) => (
                  <button
                    type="button"
                    key={idx}
                    data-idx={idx}
                    onClick={() => { setPlaying(false); setI(idx); }}
                    className={`${s.chip} ${s[e.kind]} ${idx <= cur ? s.seen : ""} ${idx === cur ? s.now : ""}`}
                    title={e.text}
                  >
                    <span className={s.kind}>{e.time ? `${e.time} · ` : ""}{KIND_LABEL[e.kind]}</span>
                    <span className={s.txt}>{e.text}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={s.log} aria-live="polite">
        <span className={`${s.badge} ${s[ev.kind]}`}>{KIND_LABEL[ev.kind]}</span>
        <span>{ev.time ? <b>{ev.time} </b> : null}{ev.text}</span>
      </div>
      <p className={s.caption}>
        Blue is an agent working. Purple is my agent talking to <b>their</b> support bot. Amber is a gate only I could open.
        Red is where the agent quit, until I told it to keep going. Click any step to stop on it.
      </p>
    </div>
  );
}
