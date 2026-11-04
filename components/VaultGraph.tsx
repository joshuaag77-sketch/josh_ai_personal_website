"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { slugify } from "@/lib/slug";
import { displayGraph, type VaultGraphData, type VaultNode as GNode } from "@/lib/vault-display";

// night-sky family: hues stay readable in the legend without going carnival
const CLUSTER_COLORS: Record<string, string> = {
  learnings: "#5ea8f7",
  self: "#e8b36a",
  school: "#6fe3e0",
  theme: "#ffe9b0",
  class: "#56657c",
};
const CLUSTER_NAMES: Record<string, string> = {
  theme: "Questions I keep asking",
  school: "Ideas I use",
  learnings: "Things I read and wrote",
  self: "Me",
  class: "From class",
};

// deterministic rng so the galaxy looks the same on every visit
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layout(nodes: GNode[], edges: [number, number][]): THREE.Vector3[] {
  const rnd = mulberry32(22);
  const anchors: Record<string, THREE.Vector3> = {
    learnings: new THREE.Vector3(-14, 4, 0),
    self: new THREE.Vector3(14, -2, 4),
    school: new THREE.Vector3(4, 14, -10),
    class: new THREE.Vector3(10, -14, -10),
  };
  const questions = nodes.filter((n) => n.cluster === "theme");
  const pinned = new Map<number, THREE.Vector3>();
  questions.forEach((q, i) => {
    const y = 1 - ((i + 0.5) / questions.length) * 2;
    const ring = Math.sqrt(1 - y * y);
    const th = i * Math.PI * (3 - Math.sqrt(5));
    pinned.set(q.id, new THREE.Vector3(Math.cos(th) * ring * 34, y * 20, Math.sin(th) * ring * 20));
  });
  const pos = nodes.map((n) => {
    const pin = pinned.get(n.id);
    if (pin) return pin.clone();
    const a = anchors[n.cluster] ?? new THREE.Vector3();
    return new THREE.Vector3(
      a.x + (rnd() - 0.5) * 16,
      a.y + (rnd() - 0.5) * 16,
      a.z + (rnd() - 0.5) * 16
    );
  });
  const f = pos.map(() => new THREE.Vector3());
  for (let iter = 0; iter < 320; iter++) {
    f.forEach((v) => v.set(0, 0, 0));
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const d = new THREE.Vector3().subVectors(pos[i], pos[j]);
        const dist = Math.max(d.length(), 0.5);
        d.normalize().multiplyScalar(90 / (dist * dist));
        f[i].add(d);
        f[j].sub(d);
      }
    }
    for (const [a, b] of edges) {
      const d = new THREE.Vector3().subVectors(pos[b], pos[a]);
      const dist = d.length();
      d.normalize().multiplyScalar((dist - 7) * 0.035);
      f[a].add(d);
      f[b].sub(d);
    }
    for (let i = 0; i < pos.length; i++) {
      if (pinned.has(nodes[i].id)) continue;
      f[i].add(pos[i].clone().multiplyScalar(-0.008));
      pos[i].add(f[i].clampLength(0, 1.6));
      pos[i].clampLength(0, 34); // an unlinked note must not drift out of the map
    }
  }
  return pos;
}

// what a star links to: questions first, then ideas, then coursework
function connections(g: VaultGraphData, n: GNode): GNode[] {
  const order: Record<string, number> = { theme: 0, class: 2 };
  return g.edges
    .flatMap(([a, b]) => (a === n.id ? [b] : b === n.id ? [a] : []))
    .map((i) => g.nodes[i])
    .sort((a, b) => (order[a.cluster] ?? 1) - (order[b.cluster] ?? 1));
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

// four-point diffraction spike for the hub stars
function makeSpikeTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.translate(128, 128);
  for (let i = 0; i < 2; i++) {
    const g = ctx.createLinearGradient(-128, 0, 128, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-128, -1.5, 256, 3);
    ctx.rotate(Math.PI / 2);
  }
  const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  g2.addColorStop(0, "rgba(255,255,255,1)");
  g2.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(-20, -20, 40, 40);
  return new THREE.CanvasTexture(c);
}

// deep-space backdrop: near-black with faint cold color weather, painted once.
// it lives in scene.background, so it can never wash out the foreground.
function makeSpaceBackdrop(): THREE.Texture {
  const rnd = mulberry32(13);
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#030711";
  ctx.fillRect(0, 0, 1024, 1024);
  const tints = ["43,94,186", "56,140,160", "96,78,170", "30,64,140"];
  for (let i = 0; i < 9; i++) {
    const x = rnd() * 1024;
    const y = rnd() * 1024;
    const r = 180 + rnd() * 420;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${tints[i % tints.length]},${0.05 + rnd() * 0.06})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLabelSprite(text: string, color: string, question = false): THREE.Sprite {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = question ? "500 38px Georgia, 'Times New Roman', serif" : "600 34px ui-monospace, monospace";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 28;
  c.width = w;
  c.height = 56;
  const ctx2 = c.getContext("2d")!;
  ctx2.font = font;
  ctx2.shadowColor = "rgba(2,9,16,0.9)";
  ctx2.shadowBlur = 8;
  ctx2.fillStyle = color;
  ctx2.globalAlpha = 0.95;
  ctx2.fillText(text, 14, 40);
  const tex = new THREE.CanvasTexture(c);
  // constant screen size: a label never balloons when its star drifts near the camera
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: false,
    toneMapped: false,
    opacity: 0.85,
  });
  const s = new THREE.Sprite(mat);
  const k = 0.045;
  s.scale.set((w / 56) * k, k, 1);
  return s;
}

export function VaultGraph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<GNode | null>(null);
  const [graph, setGraph] = useState<VaultGraphData | null>(null);
  const flyToRef = useRef<(n: GNode) => void>(() => {});
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
    scene.background = makeSpaceBackdrop();
    scene.fog = new THREE.FogExp2(0x030711, 0.011);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 600);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x030711);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.0, 0.45, 0.45);
    composer.addPass(bloom);
    composer.addPass(new OutputPass()); // sRGB conversion: without it the frame washes out pale

    const group = new THREE.Group();
    scene.add(group);
    const dustGroup = new THREE.Group();
    scene.add(dustGroup);

    const rnd = mulberry32(7);

    // far starfield: two depths, slight blue tint spread
    for (const [count, spread, size, color, opacity] of [
      [1400, 420, 0.55, 0x2c3e5e, 0.8],
      [500, 260, 0.9, 0x44618f, 0.9],
    ] as const) {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) arr[i] = (rnd() - 0.5) * spread;
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      scene.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color,
            size,
            sizeAttenuation: true,
            transparent: true,
            opacity,
            depthWrite: false,
          })
        )
      );
    }

    // drifting dust inside the graph volume, rotates at half speed for parallax
    {
      const count = mobile ? 700 : 1600;
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 10 + rnd() * 34;
        const th = rnd() * Math.PI * 2;
        const ph = Math.acos(2 * rnd() - 1);
        arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
        arr[i * 3 + 1] = r * Math.cos(ph) * 0.75;
        arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      dustGroup.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color: 0x3b5a8c,
            size: 0.16,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        )
      );
    }

    const focus: { q: THREE.Quaternion | null } = { q: null };
    const glow = makeGlowTexture();
    const spike = makeSpikeTexture();
    const nodeMeshes: THREE.Mesh[] = [];
    const stars: {
      mesh: THREE.Mesh;
      core: THREE.MeshBasicMaterial;
      halo: THREE.SpriteMaterial;
      base: number;
      phase: number;
      speed: number;
      spike?: THREE.SpriteMaterial;
    }[] = [];
    const spikes: THREE.Sprite[] = [];
    const labels: { mat: THREE.SpriteMaterial; obj: THREE.Object3D; question: boolean }[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);

    // edge pulses: filled in once the graph arrives
    let pulseUpdate: ((dt: number) => void) | null = null;

    fetch("/heartbeat.json")
      .then((r) => r.json())
      .then((h) => {
        if (!disposed) setHeartbeat(h);
      })
      .catch(() => {});

    fetch("/vault-graph.json")
      .then((r) => r.json())
      .then((rawGraph: VaultGraphData) => {
        if (disposed) return;
        const data = displayGraph(rawGraph);
        setGraph(data);
        setStats({
          n: data.nodes.filter((n) => n.cluster !== "theme").length,
          e: data.edges.length,
          date: data.generated,
        });
        const positions = layout(data.nodes, data.edges);
        const deg = new Array(data.nodes.length).fill(0);
        data.edges.forEach(([a, b]) => {
          deg[a]++;
          deg[b]++;
        });

        const isTheme = (i: number) => data.nodes[i].cluster === "theme";
        const isClass = (i: number) => data.nodes[i].cluster === "class";
        const ideaEdges = data.edges.filter(
          ([a, b]) => !isTheme(a) && !isTheme(b) && !isClass(a) && !isClass(b)
        );
        const classEdges = data.edges.filter(
          ([a, b]) => !isTheme(a) && !isTheme(b) && (isClass(a) || isClass(b))
        );
        const themeEdges = data.edges.filter(([a, b]) => isTheme(a) || isTheme(b));
        const buildEdges = (list: [number, number][], color: number, opacity: number) => {
          const arr = new Float32Array(list.length * 6);
          list.forEach(([a, b], i) => {
            positions[a].toArray(arr, i * 6);
            positions[b].toArray(arr, i * 6 + 3);
          });
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
          group.add(
            new THREE.LineSegments(
              geo,
              new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            )
          );
        };
        buildEdges(ideaEdges, 0x3b82f6, 0.16);
        buildEdges(classEdges, 0x3b82f6, 0.04);
        buildEdges(themeEdges, 0xffe9b0, 0.09);

        // stars
        data.nodes.forEach((n, i) => {
          const color = new THREE.Color(CLUSTER_COLORS[n.cluster] ?? "#94a3b8");
          const theme = n.cluster === "theme";
          const cls = n.cluster === "class";
          const r = theme ? 0.3 : cls ? 0.2 : 0.3 + Math.sqrt(Math.min(deg[i], 16)) * 0.14;
          // hot core, pushed past 1.0 so bloom catches it
          const coreMat = new THREE.MeshBasicMaterial({
            color: color.clone().lerp(new THREE.Color("#ffffff"), 0.3).multiplyScalar(1.35),
            toneMapped: false,
            transparent: true,
          });
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 18), coreMat);
          mesh.position.copy(positions[i]);
          mesh.userData = { node: n };
          group.add(mesh);
          nodeMeshes.push(mesh);

          const halo = new THREE.SpriteMaterial({
            map: glow,
            color,
            transparent: true,
            opacity: cls ? 0.12 : theme ? 0.22 : 0.34,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const sprite = new THREE.Sprite(halo);
          sprite.scale.setScalar(r * (theme ? 4 : 5));
          sprite.position.copy(positions[i]);
          group.add(sprite);
          const entry = {
            mesh,
            core: coreMat,
            halo,
            base: halo.opacity,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.1,
          } as (typeof stars)[number];
          stars.push(entry);

          // diffraction spikes on the hubs
          if (!theme && !cls && deg[i] >= 8) {
            const sm = new THREE.SpriteMaterial({
              map: spike,
              color: color.clone().lerp(new THREE.Color("#ffffff"), 0.6),
              transparent: true,
              opacity: 0.32,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
            const sp = new THREE.Sprite(sm);
            sp.scale.setScalar(r * 9);
            sp.position.copy(positions[i]);
            group.add(sp);
            spikes.push(sp);
            entry.spike = sm;
          }

          if (theme || (!cls && deg[i] >= 7)) {
            const label = makeLabelSprite(n.label, CLUSTER_COLORS[n.cluster] ?? "#e2e8f0", theme);
            label.position.copy(positions[i]).add(new THREE.Vector3(0, r + 1.4, 0));
            group.add(label);
            labels.push({ mat: label.material as THREE.SpriteMaterial, obj: label, question: theme });
          }
        });

        // pulses of light running along the links: the vault thinking
        {
          const edges = ideaEdges.length ? ideaEdges : data.edges;
          const count = reduceMotion ? 0 : mobile ? 90 : 220;
          const TRAIL = 3;
          const geo = new THREE.BufferGeometry();
          const arr = new Float32Array(count * TRAIL * 3);
          const alpha = new Float32Array(count * TRAIL);
          geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
          geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
          const mat = new THREE.ShaderMaterial({
            uniforms: { uMap: { value: glow } },
            vertexShader: `
              attribute float aAlpha;
              varying float vA;
              void main() {
                vA = aAlpha;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 560.0 * aAlpha / max(-mv.z, 1.0);
                gl_Position = projectionMatrix * mv;
              }`,
            fragmentShader: `
              uniform sampler2D uMap;
              varying float vA;
              void main() {
                float m = texture2D(uMap, gl_PointCoord).r;
                gl_FragColor = vec4(vec3(0.62, 0.84, 1.0) * m * vA * 2.3, 0.0);
              }`,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const pts = new THREE.Points(geo, mat);
          pts.frustumCulled = false;
          group.add(pts);

          const prnd = mulberry32(5);
          const edge = new Array(count).fill(0).map(() => Math.floor(prnd() * edges.length));
          const t = new Array(count).fill(0).map(() => prnd());
          const speed = new Array(count).fill(0).map(() => 0.12 + prnd() * 0.25);
          const va = new THREE.Vector3();
          pulseUpdate = (dt: number) => {
            for (let i = 0; i < count; i++) {
              t[i] += speed[i] * dt;
              if (t[i] > 1) {
                t[i] = 0;
                edge[i] = Math.floor(Math.random() * edges.length);
              }
              const [a, b] = edges[edge[i]];
              for (let k = 0; k < TRAIL; k++) {
                const tt = Math.max(t[i] - k * 0.035, 0);
                va.copy(positions[a]).lerp(positions[b], tt);
                va.toArray(arr, (i * TRAIL + k) * 3);
                // head bright, trail falling off; fade in/out at the ends
                const env = Math.min(1, Math.min(tt, 1 - tt) * 6 + 0.1);
                alpha[i * TRAIL + k] = (1 - k / TRAIL) * 0.9 * env;
              }
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.aAlpha.needsUpdate = true;
          };
        }

        flyToRef.current = (n: GNode) => {
          setSelected(n);
          const dir = positions[n.id].clone().normalize();
          focus.q = new THREE.Quaternion().setFromUnitVectors(dir, new THREE.Vector3(0, 0, 1));
          targetZoom = Math.min(90, Math.max(14, positions[n.id].length() + 13));
          intro = 1; // skip the flight, go straight to the star
        };
        const focusSlug = new URLSearchParams(window.location.search).get("focus");
        if (focusSlug) {
          const hit = data.nodes.find((n) => slugify(n.label) === focusSlug);
          if (hit) flyToRef.current(hit);
        }
      });

    // interaction
    let dragging = false;
    let px = 0,
      py = 0;
    let velX = 0,
      velY = 0.0016;
    let targetZoom = 56;
    // cinematic fly-in: eased 0 -> 1 over the first seconds
    let intro = reduceMotion ? 1 : 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      intro = 1;
      focus.q = null;
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
      intro = 1;
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
      composer.setSize(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const wp = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // fly-in: drop from deep space while the galaxy swings into place
      if (intro < 1) {
        intro = Math.min(intro + dt / 4.2, 1);
        const e = easeOut(intro);
        camera.position.z = 150 - (150 - targetZoom) * e;
        camera.position.y = 24 - 18 * e;
        group.rotation.y = -0.9 + 0.9 * e;
        group.rotation.x = 0.22 - 0.22 * e;
      } else {
        if (focus.q && !dragging) {
          group.quaternion.slerp(focus.q, 0.07);
          if (group.quaternion.angleTo(focus.q) < 0.01) focus.q = null;
        } else if (!dragging) {
          group.rotation.y += reduceMotion ? 0 : velY;
          group.rotation.x += reduceMotion ? 0 : velX;
          velX *= 0.985;
          velY = velY * 0.985 + (reduceMotion ? 0 : 0.0000232);
        }
        camera.position.z += (targetZoom - camera.position.z) * 0.06;
        // breathing: barely-there vertical drift so idle never feels frozen
        camera.position.y = 6 + (reduceMotion ? 0 : Math.sin(t * 0.21) * 0.9);
      }
      // pointer parallax
      camera.position.x += ((reduceMotion ? 0 : pointer.x * 2.2) - camera.position.x) * 0.03;
      camera.lookAt(0, 0, 0);

      dustGroup.rotation.y = group.rotation.y * 0.45;
      dustGroup.rotation.x = group.rotation.x * 0.45;

      // stars dissolve as they pass the camera instead of blowing out the frame
      for (const st of stars) {
        st.mesh.getWorldPosition(wp);
        const d = wp.distanceTo(camera.position);
        const fade = THREE.MathUtils.smoothstep(d, 11, 22);
        const tw = reduceMotion ? 1 : 0.82 + 0.18 * Math.sin(t * st.speed + st.phase);
        st.halo.opacity = st.base * tw * fade;
        st.core.opacity = fade;
        if (st.spike) st.spike.opacity = 0.32 * fade;
      }
      // questions stay readable from anywhere, they are how you find your way;
      // note titles only name the stars you are near
      for (const lb of labels) {
        lb.obj.getWorldPosition(wp);
        const d = wp.distanceTo(camera.position);
        const near = THREE.MathUtils.smoothstep(d, 12, 20);
        // questions on the far side of the map step back so the near ones read
        lb.mat.opacity = lb.question
          ? 0.9 * near * (1 - 0.65 * THREE.MathUtils.smoothstep(d, 52, 74))
          : 0.8 * near * (1 - THREE.MathUtils.smoothstep(d, 34, 50));
      }
      if (!reduceMotion) {
        for (const sp of spikes) {
          sp.material.rotation = Math.sin(t * 0.1) * 0.06;
        }
        pulseUpdate?.(dt);
      }

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes, false);
      const hit = hits.length > 0 ? (hits[0].object.userData.node as GNode) : null;
      setHovered(hit ? hit.label : null);
      mount.style.cursor = hit ? "pointer" : dragging ? "grabbing" : "grab";

      composer.render();
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      composer.dispose();
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#030711]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* top overlay */}
      <div className="pointer-events-none absolute top-20 left-6 sm:left-10 max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-400/80 mb-2">
          The Vault · live export
        </p>
        <h1 className="display-font text-3xl sm:text-4xl font-semibold text-slate-100 leading-tight">
          Fly through what I&apos;m trying to understand
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          These are {stats?.n ?? "…"} real notes, filed under the questions I keep coming back to.
          Drag to look around, scroll to dive, click a star to see what it connects to.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.keys(CLUSTER_NAMES).map((k) => [k, CLUSTER_COLORS[k]]).map(([k, c]) => (
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
            {selected.cluster === "theme"
              ? "A question I keep asking"
              : (CLUSTER_NAMES[selected.cluster] ?? selected.cluster)}
          </p>
          <h2 className="display-font text-xl text-slate-100">{selected.label}</h2>
          {selected.summary && (
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{selected.summary}</p>
          )}
          {graph && (
            <ul className="mt-3 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
              {connections(graph, selected).map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => flyToRef.current(n)}
                    className={`rounded-full border px-2.5 py-1 text-left text-xs transition hover:border-slate-400 hover:text-slate-100 ${
                      n.cluster === "theme" ? "border-amber-200/40 text-amber-100" : "border-slate-700 text-slate-300"
                    }`}
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
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
          <span>gardener last tended · {heartbeat?.gardener?.lastRun ?? "…"}</span>
          <span>brief {heartbeat?.brief?.lastIssue?.toLowerCase() ?? "…"} issued · {heartbeat?.brief?.date ?? "…"}</span>
          <span>
            {stats ? `${stats.n} notes · ${stats.e} links` : "loading graph…"}
          </span>
          <span>exported · {stats?.date ?? "…"}</span>
        </div>
      </div>
    </div>
  );
}
