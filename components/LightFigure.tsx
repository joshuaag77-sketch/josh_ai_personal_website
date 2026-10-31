"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type AtlasMeta = {
  frames: number;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  fps: number;
  flowScale: number;
};

const DIR = "/experiments/light/";
const BG = new THREE.Color("#020910");
const PLAYBACK = 0.6; // atlas cells per second = meta.fps * PLAYBACK

const cellSampleGLSL = /* glsl */ `
  vec3 cellSample(sampler2D tex, vec2 grid, float f, vec2 uv) {
    float col = mod(f, grid.x);
    float row = floor(f / grid.x);
    vec2 inset = clamp(uv, 0.004, 0.996);
    vec2 a = (vec2(col, row) + vec2(inset.x, 1.0 - inset.y)) / grid;
    return texture2D(tex, vec2(a.x, 1.0 - a.y)).rgb;
  }
  vec2 flowAt(sampler2D flowTex, vec2 grid, float f, vec2 uv, float flowScale) {
    vec3 fl = cellSample(flowTex, grid, f, uv);
    vec2 v = (fl.rg * 255.0 - 128.0) / flowScale;
    v.y = -v.y;
    return v;
  }
`;

// The body: instanced grains pinned to the figure grid, lightly stretched
// along the local motion. Dense, short, keeps the dancer legible.
const grainVert = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform sampler2D uFlow;
  uniform sampler2D uPortrait;
  uniform vec2 uGrid;
  uniform vec2 uPGrid;
  uniform float uFrame;
  uniform float uFrames;
  uniform float uTime;
  uniform float uHeight;
  uniform float uAspect;
  uniform float uScatter;
  uniform float uMorph;
  uniform float uSize;
  uniform float uFlowScale;
  attribute vec2 aUv;
  attribute vec3 aSeed;
  varying float vLight;
  varying float vSeed;
  varying vec2 vQuad;
  ${"CELL_SAMPLE"}

  void main() {
    float f0 = floor(uFrame);
    float f1 = mod(f0 + 1.0, uFrames);
    vec3 s = mix(cellSample(uAtlas, uGrid, f0, aUv), cellSample(uAtlas, uGrid, f1, aUv), fract(uFrame));
    float mask = smoothstep(0.3, 0.6, s.b);
    vec2 flow = flowAt(uFlow, uGrid, f0, aUv, uFlowScale);
    float mag = length(flow);

    vec3 figure = vec3((aUv.x - 0.5) * uHeight * uAspect, (aUv.y - 0.5) * uHeight, (s.g - 0.5) * uHeight * 0.3);
    figure += (aSeed - 0.5) * uHeight * 0.004;

    vec3 p = cellSample(uPortrait, uPGrid, 0.0, aUv);
    float pMask = smoothstep(0.3, 0.6, p.b);
    vec3 face = vec3((aUv.x - 0.5) * uHeight * 0.52, (aUv.y - 0.5) * uHeight * 0.52 + uHeight * 0.04, (p.g - 0.5) * uHeight * 0.16);

    vec3 dir = normalize(aSeed - 0.5 + vec3(0.0, 0.3, 0.0));
    vec3 loose = figure + dir * uScatter * uHeight * (0.25 + aSeed.y * 1.1);
    float lost = (1.0 - pMask) * uMorph;
    vec3 target = mix(face, face + dir * uHeight * (0.8 + aSeed.x), lost);
    vec3 pos = mix(loose, target, uMorph);

    vec2 axis2 = mag > 0.0008 ? normalize(flow) : vec2(0.25, 1.0 - 2.0 * aSeed.y);
    float len = clamp(mag * 6.0, 0.004, 0.045) * uHeight * (0.7 + aSeed.y * 0.8);
    len *= (1.0 - uMorph * 0.85) * (1.0 + uScatter * 0.8);
    float wid = uSize * (0.55 + aSeed.z * 0.9);

    vec3 axis = normalize(vec3(axis2 * vec2(uHeight * uAspect, uHeight), 0.0));
    vec3 perp = normalize(vec3(-axis.y, axis.x, 0.0));
    pos += axis * position.x * len + perp * position.y * wid;

    float lum = mix(s.r * mask, p.r * pMask, uMorph) * (1.0 - lost);
    lum *= 0.25 + 0.75 * fract(aSeed.x * 13.7 + aSeed.z * 5.3);
    vLight = lum * (1.0 - uScatter * 0.4);
    vSeed = aSeed.z;
    vQuad = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    if (lum < 0.01) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
`;

const grainFrag = /* glsl */ `
  varying float vLight;
  varying float vSeed;
  varying vec2 vQuad;
  void main() {
    float across = exp(-vQuad.y * vQuad.y * 7.0);
    float along = smoothstep(-0.5, 0.1, vQuad.x) * (1.0 - smoothstep(0.35, 0.5, vQuad.x));
    float a = across * along * vLight;
    vec3 deep = vec3(0.04, 0.22, 0.95);
    vec3 ice = vec3(0.72, 0.9, 1.0);
    vec3 col = mix(deep, ice, pow(vLight, 1.6) * (0.55 + 0.45 * vSeed));
    gl_FragColor = vec4(col * a * 0.1, 1.0);
  }
`;

// The silk: free tracer particles advected by the flow field. Each one is a
// bright moving point; the feedback buffer turns its path into a long curved
// light trail, the way a long exposure would.
const simFrag = /* glsl */ `
  uniform sampler2D uState;
  uniform sampler2D uAtlas;
  uniform sampler2D uFlow;
  uniform vec2 uGrid;
  uniform float uFrame;
  uniform float uFrames;
  uniform float uFlowScale;
  uniform float uDt;
  uniform float uTime;
  uniform float uGain;
  varying vec2 vUv;
  ${"CELL_SAMPLE"}

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec4 st = texture2D(uState, vUv); // xy = pos in figure uv, z = age, w = life
    vec2 pos = st.xy;
    float age = st.z + uDt;
    float life = st.w;

    float f0 = floor(uFrame);
    vec2 flow = flowAt(uFlow, uGrid, f0, pos, uFlowScale);
    // ride the motion, with a whisper of swirl so trails curve
    pos += flow * uGain * uDt;
    pos += 0.012 * uDt * vec2(sin(pos.y * 31.0 + uTime * 0.8), cos(pos.x * 27.0 - uTime * 0.6));

    float mask = cellSample(uAtlas, uGrid, f0, pos).b;
    bool dead = age > life || pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0;
    if (dead) {
      vec2 cand = vec2(hash(vUv + uTime), hash(vUv * 1.7 - uTime));
      float m = cellSample(uAtlas, uGrid, f0, cand).b;
      vec2 fl2 = flowAt(uFlow, uGrid, f0, cand, uFlowScale);
      pos = cand;
      age = 0.0;
      // live longer where the body moves: trails bloom off the gesture
      life = m > 0.5 ? (0.6 + hash(vUv * 3.1 + uTime) * 1.2 + length(fl2) * 40.0) : 0.0;
    } else if (mask < 0.25) {
      // drifted off the body: let it finish its arc but die soon
      life = min(life, age + 0.5);
    }
    gl_FragColor = vec4(pos, age, life);
  }
`;

const tracerVert = /* glsl */ `
  uniform sampler2D uState;
  uniform sampler2D uAtlas;
  uniform vec2 uGrid;
  uniform float uFrame;
  uniform float uFrames;
  uniform float uHeight;
  uniform float uAspect;
  uniform float uMorph;
  uniform float uScatter;
  uniform float uPx;
  attribute vec2 aIndex;
  varying float vA;
  ${"CELL_SAMPLE"}

  void main() {
    vec4 st = texture2D(uState, aIndex);
    vec2 pos = st.xy;
    float age = st.z;
    float life = max(st.w, 0.001);
    float f0 = floor(uFrame);
    vec3 s = cellSample(uAtlas, uGrid, f0, pos);

    vec3 world = vec3((pos.x - 0.5) * uHeight * uAspect, (pos.y - 0.5) * uHeight, (s.g - 0.5) * uHeight * 0.3);
    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;

    float fade = smoothstep(0.0, 0.12, age / life) * (1.0 - smoothstep(0.75, 1.0, age / life));
    vA = fade * (0.35 + 0.65 * s.r) * (1.0 - uMorph) * (1.0 - uScatter * 0.3);
    gl_PointSize = uPx * (life > 0.01 ? 1.0 : 0.0);
    if (vA < 0.01) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
`;

const tracerFrag = /* glsl */ `
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float g = exp(-d * 18.0);
    gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * g * vA * 0.5, 1.0);
  }
`;

const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Feedback: last frame slightly blurred, zoomed a breath, dimmed. Moving
// tracers paint their history into this buffer as silky trails.
const fadeFrag = /* glsl */ `
  uniform sampler2D uPrev;
  uniform float uDecay;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * 0.998 + 0.5;
    vec3 c = texture2D(uPrev, uv).rgb * 4.0;
    c += texture2D(uPrev, uv + vec2(uTexel.x, 0.0)).rgb;
    c += texture2D(uPrev, uv - vec2(uTexel.x, 0.0)).rgb;
    c += texture2D(uPrev, uv + vec2(0.0, uTexel.y)).rgb;
    c += texture2D(uPrev, uv - vec2(0.0, uTexel.y)).rgb;
    gl_FragColor = vec4(c / 8.0 * uDecay, 1.0);
  }
`;

const showFrag = /* glsl */ `
  uniform sampler2D uTrail;
  uniform vec3 uBg;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uTrail, vUv).rgb;
    c = 1.0 - exp(-c * 2.6);
    c = pow(c, vec3(1.1));
    float vig = smoothstep(1.3, 0.3, length(vUv - 0.5) * 1.5);
    gl_FragColor = vec4(uBg * (0.6 + 0.4 * vig) + c, 1.0);
  }
`;

const withSample = (src: string) => src.replace("CELL_SAMPLE", cellSampleGLSL);

export function LightFigure() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(0);
  const [failed, setFailed] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const [stillMode, setStillMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    let disposed = false;
    let raf = 0;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion) {
      pausedRef.current = true;
      setPaused(true);
      setStillMode(true);
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, small ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    const group = new THREE.Group();
    scene.add(group);

    const quadScene = new THREE.Scene();
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    quadScene.add(quad);

    const rtOpts: THREE.RenderTargetOptions = { type: THREE.HalfFloatType, depthBuffer: false };
    let rtA = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    let rtB = new THREE.WebGLRenderTarget(1, 1, rtOpts);

    // tracer sim state
    const simN = small ? 96 : 160;
    const simOpts: THREE.RenderTargetOptions = {
      type: THREE.FloatType,
      depthBuffer: false,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    };
    let simA = new THREE.WebGLRenderTarget(simN, simN, simOpts);
    let simB = new THREE.WebGLRenderTarget(simN, simN, simOpts);

    const fadeMat = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: fadeFrag,
      uniforms: { uPrev: { value: null }, uDecay: { value: 0.915 }, uTexel: { value: new THREE.Vector2() } },
      depthTest: false,
      depthWrite: false,
    });
    const showMat = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: showFrag,
      uniforms: { uTrail: { value: null }, uBg: { value: BG } },
      depthTest: false,
      depthWrite: false,
    });

    let mesh: THREE.Mesh | null = null;
    let mat: THREE.ShaderMaterial | null = null;
    let tracers: THREE.Points | null = null;
    let tracerMat: THREE.ShaderMaterial | null = null;
    let simMat: THREE.ShaderMaterial | null = null;
    let meta: AtlasMeta | null = null;
    const textures: THREE.Texture[] = [];

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rtA.setSize(Math.round(w * dpr), Math.round(h * dpr));
      rtB.setSize(Math.round(w * dpr), Math.round(h * dpr));
      fadeMat.uniforms.uTexel.value.set(1 / (w * dpr), 1 / (h * dpr));
      const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const wide = w / h > 1.1;
      group.position.x = wide ? viewH * camera.aspect * 0.16 : 0;
      group.position.y = wide ? -viewH * 0.02 : viewH * 0.05;
      if (mat && meta) {
        const cellAspect = meta.cellW / meta.cellH;
        const fitWidth = (viewH * camera.aspect * 0.96) / cellAspect;
        const height = Math.min(viewH * (wide ? 0.88 : 0.8), wide ? Infinity : fitWidth);
        mat.uniforms.uHeight.value = height;
        mat.uniforms.uSize.value = viewH * (small ? 0.0062 : 0.0042);
        if (tracerMat) {
          tracerMat.uniforms.uHeight.value = height;
          tracerMat.uniforms.uPx.value = (small ? 2.4 : 3.2) * dpr * (h / 900);
        }
      }
    };

    const loader = new THREE.TextureLoader();
    const load = (f: string) =>
      loader.loadAsync(DIR + f).then((t) => {
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.colorSpace = THREE.NoColorSpace;
        textures.push(t);
        return t;
      });

    Promise.all([
      fetch(DIR + "figure-atlas.json").then((r) => r.json() as Promise<AtlasMeta>),
      load("figure-atlas.webp"),
      load("figure-flow.webp"),
      load("portrait-atlas.webp"),
    ])
      .then(([m, atlas, flow, portrait]) => {
        if (disposed) return;
        meta = m;

        // body grains
        const gw = small ? 120 : 210;
        const gh = Math.round((gw * m.cellH) / m.cellW);
        const n = gw * gh;
        const uvs = new Float32Array(n * 2);
        const seeds = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          uvs[i * 2] = ((i % gw) + Math.random()) / gw;
          uvs[i * 2 + 1] = (Math.floor(i / gw) + Math.random()) / gh;
          seeds[i * 3] = Math.random();
          seeds[i * 3 + 1] = Math.random();
          seeds[i * 3 + 2] = Math.random();
        }
        const geo = new THREE.InstancedBufferGeometry();
        geo.copy(new THREE.PlaneGeometry(1, 1) as never);
        geo.instanceCount = n;
        geo.setAttribute("aUv", new THREE.InstancedBufferAttribute(uvs, 2));
        geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 3));
        mat = new THREE.ShaderMaterial({
          vertexShader: withSample(grainVert),
          fragmentShader: grainFrag,
          uniforms: {
            uAtlas: { value: atlas },
            uFlow: { value: flow },
            uPortrait: { value: portrait },
            uGrid: { value: new THREE.Vector2(m.cols, m.rows) },
            uPGrid: { value: new THREE.Vector2(4, 1) },
            uFrame: { value: 0 },
            uFrames: { value: m.frames },
            uTime: { value: 0 },
            uHeight: { value: 7 },
            uAspect: { value: m.cellW / m.cellH },
            uScatter: { value: 0 },
            uMorph: { value: 0 },
            uSize: { value: 0.03 },
            uFlowScale: { value: m.flowScale ?? 640 },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        group.add(mesh);

        // tracer sim
        simMat = new THREE.ShaderMaterial({
          vertexShader: quadVert,
          fragmentShader: withSample(simFrag),
          uniforms: {
            uState: { value: null },
            uAtlas: { value: atlas },
            uFlow: { value: flow },
            uGrid: { value: new THREE.Vector2(m.cols, m.rows) },
            uFrame: { value: 0 },
            uFrames: { value: m.frames },
            uFlowScale: { value: m.flowScale ?? 640 },
            uDt: { value: 0.016 },
            uTime: { value: 0 },
            uGain: { value: m.fps * PLAYBACK * 1.6 },
          },
          depthTest: false,
          depthWrite: false,
        });

        // seed initial state
        const init = new Float32Array(simN * simN * 4);
        for (let i = 0; i < simN * simN; i++) {
          init[i * 4] = Math.random();
          init[i * 4 + 1] = Math.random();
          init[i * 4 + 2] = Math.random() * 2;
          init[i * 4 + 3] = 0.6 + Math.random() * 1.6;
        }
        const initTex = new THREE.DataTexture(init, simN, simN, THREE.RGBAFormat, THREE.FloatType);
        initTex.needsUpdate = true;
        const copyMat = new THREE.MeshBasicMaterial({ map: initTex });
        quad.material = copyMat;
        renderer.setRenderTarget(simA);
        renderer.render(quadScene, quadCam);
        copyMat.dispose();
        initTex.dispose();

        // tracer points
        const idx = new Float32Array(simN * simN * 2);
        const pts = new Float32Array(simN * simN * 3);
        for (let i = 0; i < simN * simN; i++) {
          idx[i * 2] = ((i % simN) + 0.5) / simN;
          idx[i * 2 + 1] = (Math.floor(i / simN) + 0.5) / simN;
        }
        const tGeo = new THREE.BufferGeometry();
        tGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
        tGeo.setAttribute("aIndex", new THREE.BufferAttribute(idx, 2));
        tracerMat = new THREE.ShaderMaterial({
          vertexShader: withSample(tracerVert),
          fragmentShader: tracerFrag,
          uniforms: {
            uState: { value: null },
            uAtlas: { value: atlas },
            uGrid: { value: new THREE.Vector2(m.cols, m.rows) },
            uFrame: { value: 0 },
            uFrames: { value: m.frames },
            uHeight: { value: 7 },
            uAspect: { value: m.cellW / m.cellH },
            uMorph: { value: 0 },
            uScatter: { value: 0 },
            uPx: { value: 3 },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        tracers = new THREE.Points(tGeo, tracerMat);
        tracers.frustumCulled = false;
        group.add(tracers);

        resize();
        if (reduceMotion) for (let i = 0; i < 60; i++) step(0.016, true);
        else loop();
      })
      .catch(() => !disposed && setFailed(true));

    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      tilt.tx = (e.clientX / window.innerWidth - 0.5) * 0.45;
      tilt.ty = (e.clientY / window.innerHeight - 0.5) * 0.16;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let scroll = 0;
    const onScroll = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      scroll = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      setPhase(scroll > 0.55 ? 1 : 0);
      // the cinematic video owns the top of the page; the live sim takes
      // over as the scroll starts pulling the figure apart
      const video = videoRef.current;
      const t = Math.min(Math.max((scroll - 0.04) / 0.1, 0), 1);
      const live = t * t * (3 - 2 * t);
      canvas.style.opacity = video ? String(Math.max(live, 0.001)) : "1";
      if (video) {
        video.style.opacity = String(1 - live);
        if (live >= 0.999 && !video.paused) video.pause();
        else if (live < 0.999 && video.paused && !pausedRef.current) video.play().catch(() => undefined);
      }
      if (pausedRef.current && mesh) step(0, true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(section);

    let time = 0;
    let frame = 0;
    function step(dt: number, still: boolean) {
      if (!mat || !meta || !simMat || !tracerMat) return;
      time += dt;
      if (!still) {
        const len = meta.frames - 1;
        const t = (time * meta.fps * PLAYBACK) % (len * 2);
        frame = t < len ? t : len * 2 - t;
      }
      tilt.x += (tilt.tx - tilt.x) * 0.04;
      tilt.y += (tilt.ty - tilt.y) * 0.04;
      group.rotation.y = tilt.x + (still ? 0 : Math.sin(time * 0.13) * 0.07);
      group.rotation.x = tilt.y;

      const morph = THREE.MathUtils.smoothstep(scroll, 0.4, 0.85);
      const scatter = Math.sin(Math.PI * THREE.MathUtils.smoothstep(scroll, 0.1, 0.85)) * 0.9;
      mat.uniforms.uFrame.value = frame;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uScatter.value = scatter;
      mat.uniforms.uMorph.value = morph;
      fadeMat.uniforms.uDecay.value = 0.915 - morph * 0.3;

      // advance the tracer sim
      simMat.uniforms.uState.value = simA.texture;
      simMat.uniforms.uFrame.value = frame;
      simMat.uniforms.uDt.value = still ? 0.016 : dt;
      simMat.uniforms.uTime.value = time;
      quad.material = simMat;
      renderer.setRenderTarget(simB);
      renderer.render(quadScene, quadCam);
      [simA, simB] = [simB, simA];
      tracerMat.uniforms.uState.value = simA.texture;
      tracerMat.uniforms.uFrame.value = frame;
      tracerMat.uniforms.uMorph.value = morph;
      tracerMat.uniforms.uScatter.value = scatter;

      fadeMat.uniforms.uPrev.value = rtA.texture;
      quad.material = fadeMat;
      renderer.setRenderTarget(rtB);
      renderer.clear();
      renderer.render(quadScene, quadCam);
      renderer.render(scene, camera);

      showMat.uniforms.uTrail.value = rtB.texture;
      quad.material = showMat;
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCam);
      [rtA, rtB] = [rtB, rtA];
    }

    let last = performance.now();
    function loop() {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || pausedRef.current) return;
      step(dt, false);
    }

    onScroll();
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      mesh?.geometry.dispose();
      mat?.dispose();
      tracers?.geometry.dispose();
      tracerMat?.dispose();
      simMat?.dispose();
      textures.forEach((t) => t.dispose());
      fadeMat.dispose();
      showMat.dispose();
      quad.geometry.dispose();
      rtA.dispose();
      rtB.dispose();
      simA.dispose();
      simB.dispose();
      renderer.dispose();
    };
  }, []);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    const video = videoRef.current;
    if (video) {
      if (pausedRef.current) video.pause();
      else video.play().catch(() => undefined);
    }
  };

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#020910] text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {videoOk && !stillMode && (
          <video
            ref={videoRef}
            src={DIR + "hero-loop.mp4"}
            poster={DIR + "poster.jpg"}
            autoPlay
            muted
            loop
            playsInline
            onError={() => {
              setVideoOk(false);
              if (canvasRef.current) canvasRef.current.style.opacity = "1";
            }}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[51%] h-[80svh] w-auto max-w-[96vw] -translate-x-1/2 -translate-y-1/2 object-contain md:left-[66%] md:h-[88svh]"
          />
        )}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {failed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.3),transparent_45%)]" />
        )}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 md:justify-center md:pb-0">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-sky-300/80">Josh Agarwal</p>
          <div className="relative max-w-xl">
            <h1
              className={`font-display text-5xl leading-[1.05] transition-all duration-700 md:text-7xl ${
                phase === 0 ? "opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
              }`}
            >
              Most AI never leaves the pilot.
            </h1>
            <div
              className={`absolute left-0 top-0 transition-all duration-700 ${
                phase === 1 ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
              }`}
              aria-hidden={phase !== 1}
            >
              <p className="font-display text-5xl leading-[1.05] md:text-7xl">I work on the part where it does.</p>
              <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
                Pipelines at Kiewit. Hydrogen and carbon capture at Enbridge. Now Wharton, working on how AI actually
                gets used in energy.
              </p>
              <a
                href="/"
                className="mt-8 inline-flex items-center gap-2 bg-sky-500 px-6 py-3 text-sm font-medium text-[#020910] transition hover:bg-sky-400"
              >
                Ask my site anything <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={togglePause}
          className="absolute bottom-6 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#020910]"
          aria-label={paused ? "Play animation" : "Pause animation"}
        >
          {paused ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
          )}
        </button>
      </div>
    </section>
  );
}
