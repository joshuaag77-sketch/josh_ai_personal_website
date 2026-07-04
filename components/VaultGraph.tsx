"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type GNode = {
  id: number;
  label: string;
  cluster: string;
  summary: string;
};
type GraphData = { generated: string; nodes: GNode[]; edges: [number, number][] };

const CLUSTER_COLORS: Record<string, string> = {
  learnings: "#60a5fa",
  self: "#f59e0b",
  school: "#34d399",
  moc: "#c084fc",
};
const CLUSTER_NAMES: Record<string, string> = {
  learnings: "Learnings",
  self: "Self",
  school: "School",
  moc: "Map of Content",
};

// Simple 3D force layout — 35 nodes, runs in a few ms
function layout(nodes: GNode[], edges: [number, number][]): THREE.Vector3[] {
  const anchors: Record<string, THREE.Vector3> = {
    learnings: new THREE.Vector3(-14, 4, 0),
    self: new THREE.Vector3(14, -2, 4),
    school: new THREE.Vector3(4, 14, -10),
    moc: new THREE.Vector3(0, 0, 0),
  };
  const pos = nodes.map((n) => {
    const a = anchors[n.cluster] ?? new THREE.Vector3();
    return new THREE.Vector3(
      a.x + (Math.random() - 0.5) * 16,
      a.y + (Math.random() - 0.5) * 16,
      a.z + (Math.random() - 0.5) * 16
    );
  });
  const deg = new Array(nodes.length).fill(0);
  edges.forEach(([a, b]) => {
    deg[a]++;
    deg[b]++;
  });
  const f = pos.map(() => new THREE.Vector3());
  for (let iter = 0; iter < 320; iter++) {
    f.forEach((v) => v.set(0, 0, 0));
    // repulsion
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const d = new THREE.Vector3().subVectors(pos[i], pos[j]);
        const dist = Math.max(d.length(), 0.5);
        d.normalize().multiplyScalar(90 / (dist * dist));
        f[i].add(d);
        f[j].sub(d);
      }
    }
    // springs
    for (const [a, b] of edges) {
      const d = new THREE.Vector3().subVectors(pos[b], pos[a]);
      const dist = d.length();
      d.normalize().multiplyScalar((dist - 7) * 0.035);
      f[a].add(d);
      f[b].sub(d);
    }
    // gentle centering
    for (let i = 0; i < pos.length; i++) {
      f[i].add(pos[i].clone().multiplyScalar(-0.008));
      pos[i].add(f[i].clampLength(0, 1.6));
    }
  }
  return pos;
}

function makeGlowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function makeLabelSprite(text: string, color: string): THREE.Sprite {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = "600 34px ui-monospace, monospace";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 28;
  c.width = w;
  c.height = 56;
  const ctx2 = c.getContext("2d")!;
  ctx2.font = font;
  ctx2.fillStyle = color;
  ctx2.globalAlpha = 0.95;
  ctx2.fillText(text, 14, 40);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(w / 34, 56 / 34, 1);
  return s;
}

function fmtDay(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
}

export function VaultGraph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<GNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [stats, setStats] = useState<{ n: number; e: number; date: string } | null>(null);
  const [heartbeat, setHeartbeat] = useState<{
    gardener?: { lastRun: string };
    brief?: { lastIssue: string; date: string };
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let raf = 0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.016);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
    camera.position.set(0, 6, 46);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x05070f);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const group = new THREE.Group();
    scene.add(group);

    // background stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(900 * 3);
    for (let i = 0; i < 900 * 3; i++) starPos[i] = (Math.random() - 0.5) * 260;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x334155, size: 0.5, sizeAttenuation: true })
    );
    scene.add(stars);

    const glow = makeGlowTexture();
    const nodeMeshes: THREE.Mesh[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);

    fetch("/heartbeat.json")
      .then((r) => r.json())
      .then((h) => {
        if (!disposed) setHeartbeat(h);
      })
      .catch(() => {});

    fetch("/vault-graph.json")
      .then((r) => r.json())
      .then((data: GraphData) => {
        if (disposed) return;
        setStats({ n: data.nodes.length, e: data.edges.length, date: data.generated });
        const positions = layout(data.nodes, data.edges);
        const deg = new Array(data.nodes.length).fill(0);
        data.edges.forEach(([a, b]) => {
          deg[a]++;
          deg[b]++;
        });

        // edges
        const edgePos = new Float32Array(data.edges.length * 6);
        data.edges.forEach(([a, b], i) => {
          positions[a].toArray(edgePos, i * 6);
          positions[b].toArray(edgePos, i * 6 + 3);
        });
        const edgeGeo = new THREE.BufferGeometry();
        edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePos, 3));
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.14,
        });
        group.add(new THREE.LineSegments(edgeGeo, edgeMat));

        // nodes
        data.nodes.forEach((n, i) => {
          const color = new THREE.Color(CLUSTER_COLORS[n.cluster] ?? "#94a3b8");
          const r = 0.5 + Math.min(deg[i], 14) * 0.09;
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(r, 20, 20),
            new THREE.MeshBasicMaterial({ color })
          );
          mesh.position.copy(positions[i]);
          mesh.userData = { node: n };
          group.add(mesh);
          nodeMeshes.push(mesh);

          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: glow,
              color,
              transparent: true,
              opacity: 0.55,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          );
          sprite.scale.setScalar(r * 7);
          sprite.position.copy(positions[i]);
          group.add(sprite);

          // permanent labels for hubs
          if (deg[i] >= 9 || n.cluster === "moc") {
            const label = makeLabelSprite(n.label, CLUSTER_COLORS[n.cluster] ?? "#e2e8f0");
            label.position.copy(positions[i]).add(new THREE.Vector3(0, r + 1.2, 0));
            group.add(label);
          }
        });
      });

    // interaction
    let dragging = false;
    let px = 0,
      py = 0;
    let velX = 0,
      velY = 0.0016;
    let targetZoom = 46;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
    };
    const onUp = () => (dragging = false);
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (dragging) {
        velY = (e.clientX - px) * 0.00022;
        velX = (e.clientY - py) * 0.00022;
        group.rotation.y += (e.clientX - px) * 0.005;
        group.rotation.x += (e.clientY - py) * 0.005;
        px = e.clientX;
        py = e.clientY;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom = Math.min(90, Math.max(14, targetZoom + e.deltaY * 0.04));
    };
    const onClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes, false);
      if (hits.length > 0) setSelected(hits[0].object.userData.node as GNode);
      else setSelected(null);
    };

    mount.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("click", onClick);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!dragging) {
        group.rotation.y += reduceMotion ? 0 : velY;
        group.rotation.x += reduceMotion ? 0 : velX;
        velX *= 0.985;
        velY = velY * 0.985 + (reduceMotion ? 0 : 0.0000232);
      }
      camera.position.z += (targetZoom - camera.position.z) * 0.06;

      // hover highlight
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes, false);
      const hit = hits.length > 0 ? (hits[0].object.userData.node as GNode) : null;
      setHovered(hit ? hit.label : null);
      mount.style.cursor = hit ? "pointer" : dragging ? "grabbing" : "grab";

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#05070f]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* top overlay */}
      <div className="pointer-events-none absolute top-20 left-6 sm:left-10 max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-400/80 mb-2">
          The Vault · live export
        </p>
        <h1 className="display-font text-3xl sm:text-4xl font-semibold text-slate-100 leading-tight">
          Fly through my second brain
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          These are {stats?.n ?? "…"} real notes from my Obsidian knowledge graph — the system my
          posts come from. Drag to look around, scroll to dive, click a star to read it.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(CLUSTER_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              {CLUSTER_NAMES[k]}
            </span>
          ))}
        </div>
      </div>

      {/* hover tooltip */}
      {hovered && !selected && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 font-mono text-xs text-slate-200 backdrop-blur">
          {hovered}
        </div>
      )}

      {/* selected node panel */}
      {selected && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[min(92vw,28rem)] rounded-2xl border border-slate-700/80 bg-slate-900/85 p-5 backdrop-blur-md shadow-2xl">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1"
            style={{ color: CLUSTER_COLORS[selected.cluster] }}
          >
            {CLUSTER_NAMES[selected.cluster] ?? selected.cluster}
          </p>
          <h2 className="display-font text-xl text-slate-100">{selected.label}</h2>
          {selected.summary ? (
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{selected.summary}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-500 italic">
              This one stays in the vault — title only.
            </p>
          )}
          <button
            onClick={() => setSelected(null)}
            className="mt-3 font-mono text-[11px] uppercase tracking-wider text-blue-400 hover:text-blue-300"
          >
            close ×
          </button>
        </div>
      )}

      {/* heartbeat strip */}
      <div className="absolute bottom-0 inset-x-0 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            system live
          </span>
          <span>gardener last tended · jul 2</span>
          <span>brief w27 issued · jul 1</span>
          <span>
            {stats ? `${stats.n} notes · ${stats.e} links` : "loading graph…"}
          </span>
          <span>exported · {stats?.date ?? "…"}</span>
        </div>
      </div>
    </div>
  );
}
