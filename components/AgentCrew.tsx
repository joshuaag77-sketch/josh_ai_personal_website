"use client";

import s from "./AgentCrew.module.css";

// One sentence in, three agents out. Dots travel each lane on a loop.
// Lane 1 passes a gate I open (card). Lane 2 talks back and forth with the other side's bot.
// Lane 3 stops at a wall until I push it, then passes a gate I open (bank).

const W = 930, H = 360;
const SRC = { x: 80, y: 180 };
const AG = [
  { y: 70, label: "Orders", out: "16 pizzas, $137 off" },
  { y: 180, label: "Negotiates", out: "$52.92 waived" },
  { y: 290, label: "Files", out: "Reimbursed" },
];
const AX = 300, MX = 520, OX = 700;

function lanePath(y: number) {
  return `M${SRC.x + 26} ${SRC.y} C ${SRC.x + 120} ${SRC.y}, ${AX - 120} ${y}, ${AX - 26} ${y} L ${OX - 10} ${y}`;
}

export function AgentCrew() {
  return (
    <figure className={s.wrap}>
      <div className={s.frame}>
        <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="img"
          aria-label="One request splits into three agents. One orders pizza and passes a card gate I open. One negotiates with the other company's bot and gets a charge waived. One files the expense, stops at a wall until I push it, then passes a bank gate I open.">
          {AG.map((a, i) => (
            <path key={i} id={`lane${i}`} d={lanePath(a.y)} className={s.lane} />
          ))}

          {/* source */}
          <circle cx={SRC.x} cy={SRC.y} r={26} className={s.me} />
          <text x={SRC.x} y={SRC.y + 5} className={s.meT} textAnchor="middle">me</text>
          <text x={SRC.x} y={SRC.y + 50} className={s.small} textAnchor="middle">one sentence</text>

          {/* agents */}
          {AG.map((a, i) => (
            <g key={i}>
              <circle cx={AX} cy={a.y} r={24} className={s.agent} />
              <text x={AX} y={a.y + 48} className={s.label} textAnchor="middle">{a.label}</text>
            </g>
          ))}

          {/* lane 1: gate */}
          <g transform={`translate(${MX} ${AG[0].y})`}>
            <rect x={-14} y={-14} width={28} height={28} rx={6} className={s.gate} />
            <path d="M-5 -1 v-4 a5 5 0 0 1 10 0 v4 M-7 -1 h14 v9 h-14 z" className={s.lock} />
            <text y={38} className={s.small} textAnchor="middle">I enter card</text>
          </g>

          {/* lane 2: their bot, two-way */}
          <g transform={`translate(${MX} ${AG[1].y})`}>
            <rect x={-42} y={-18} width={84} height={36} rx={8} className={s.bot} />
            <text y={5} className={s.botT} textAnchor="middle">their bot</text>
          </g>
          <path d={`M ${AX + 30} ${AG[1].y - 8} L ${MX - 36} ${AG[1].y - 8}`} className={s.talk} />
          <path d={`M ${MX - 36} ${AG[1].y + 8} L ${AX + 30} ${AG[1].y + 8}`} className={`${s.talk} ${s.talkBack}`} />

          {/* lane 3: wall then gate */}
          <line x1={450} y1={AG[2].y - 22} x2={450} y2={AG[2].y + 22} className={s.wall} />
          <text x={450} y={AG[2].y - 30} className={s.wallT} textAnchor="middle">"no way around it"</text>
          <text x={450} y={AG[2].y + 40} className={s.small} textAnchor="middle">I push back</text>
          <g transform={`translate(${MX + 60} ${AG[2].y})`}>
            <rect x={-14} y={-14} width={28} height={28} rx={6} className={s.gate} />
            <path d="M-5 -1 v-4 a5 5 0 0 1 10 0 v4 M-7 -1 h14 v9 h-14 z" className={s.lock} />
            <text y={38} className={s.small} textAnchor="middle">I enter bank</text>
          </g>

          {/* outcomes */}
          {AG.map((a, i) => (
            <g key={i}>
              <circle cx={OX} cy={a.y} r={7} className={s.done} />
              <text x={OX + 16} y={a.y + 5} className={s.out}>{a.out}</text>
            </g>
          ))}

          {/* moving dots */}
          <circle r={6} className={s.dot}>
            <animateMotion dur="6s" repeatCount="indefinite" calcMode="linear"
              keyPoints="0;0.72;0.72;1;1" keyTimes="0;0.4;0.6;0.85;1">
              <mpath href="#lane0" />
            </animateMotion>
          </circle>
          <circle r={6} className={s.dot}>
            <animateMotion dur="6s" begin="0.4s" repeatCount="indefinite" calcMode="linear"
              keyPoints="0;0.6;0.6;1;1" keyTimes="0;0.3;0.7;0.85;1">
              <mpath href="#lane1" />
            </animateMotion>
          </circle>
          <circle r={6} className={s.dot}>
            <animateMotion dur="6s" begin="0.8s" repeatCount="indefinite" calcMode="linear"
              keyPoints="0;0.61;0.61;0.82;0.82;1;1" keyTimes="0;0.3;0.55;0.65;0.72;0.85;1">
              <mpath href="#lane2" />
            </animateMotion>
          </circle>
        </svg>
      </div>
      <figcaption className={s.caption}>
        One sentence, three agents. Amber locks are the only steps I did by hand. The red line is where the agent gave up, until I told it to keep looking.
      </figcaption>
    </figure>
  );
}
