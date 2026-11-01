"""Offline cinematic particle render: the long-exposure light-painting look.

One sequential pass over the source video. Per frame: Farneback flow drives
~400k particles, rembg masks (every 4th frame) gate where they live, particles
splat additively into a persistent float buffer (the long exposure), bloom and
a blue gradient tone map finish the frame. Output: 1080p-ish H.264 loop
(ping-pong, so it loops seamlessly) plus a poster still.

usage: python -I render_cinema.py <video> <out_dir> [crop=x,y,w,h] [particles]
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove
import imageio_ffmpeg

video, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
crop = tuple(int(v) for v in sys.argv[3].split(",")) if len(sys.argv) > 3 else None
N = int(sys.argv[4]) if len(sys.argv) > 4 else 400_000
out_dir.mkdir(parents=True, exist_ok=True)

WORK_H = 540          # sim resolution
OUT_H = 1080          # render resolution
DECAY = 0.92          # exposure persistence
GAIN = 2.2            # how hard silk particles ride the flow
SUBSTEPS = 3          # splats per frame along the path: continuous lines
rng = np.random.default_rng(7)

cap = cv2.VideoCapture(str(video))
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) - 1
fps = cap.get(cv2.CAP_PROP_FPS) or 25
if crop:
    cx, cy, cw, ch = crop
else:
    cw, ch = int(cap.get(3)), int(cap.get(4)); cx = cy = 0
work_w = int(round(WORK_H * cw / ch / 2) * 2)
out_w = int(round(OUT_H * cw / ch / 2) * 2)
scale = OUT_H / WORK_H
print(f"{total} frames, work {work_w}x{WORK_H}, out {out_w}x{OUT_H}, {N} particles", flush=True)

seg = new_session("u2net_human_seg")

# particle state in work coords. Two kinds share the arrays: "sparks"
# (short-lived, barely move, paint the body silhouette crisp every frame)
# and "silk" (long-lived, ride the flow, paint the trails).
pos = np.zeros((N, 2), np.float32)      # x, y
age = rng.uniform(0, 1, N).astype(np.float32)
life = rng.uniform(0.8, 2.4, N).astype(np.float32)
bright = (0.3 + 0.7 * rng.random(N) ** 2).astype(np.float32)
is_spark = rng.random(N) < 0.45
gain = np.where(is_spark, 0.5, GAIN).astype(np.float32)
alive = np.zeros(N, bool)

expo = np.zeros((OUT_H, out_w), np.float32)  # the long exposure

# blue gradient LUT: near-black navy -> electric blue -> ice white
stops = np.array([
    [0.00, 2, 9, 16],
    [0.25, 8, 40, 130],
    [0.55, 30, 110, 240],
    [0.80, 120, 190, 255],
    [1.00, 235, 248, 255],
])
xs = np.linspace(0, 1, 256)
lut = np.stack([np.interp(xs, stops[:, 0], stops[:, i + 1]) for i in range(3)], -1).astype(np.uint8)

writer = imageio_ffmpeg.write_frames(
    str(out_dir / "hero.mp4"), (out_w, OUT_H), fps=fps, codec="libx264",
    output_params=["-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],
)
writer.send(None)
frames_rgb = []

prev_gray = None
mask_small = None
flow = None
for fi in range(total):
    ok, bgr = cap.read()
    if not ok:
        break
    frame = cv2.resize(bgr[cy:cy + ch, cx:cx + cw], (work_w, WORK_H), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    if fi % 4 == 0 or mask_small is None:
        m = remove(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)), session=seg, only_mask=True)
        mask_small = np.asarray(m, np.float32) / 255
    if prev_gray is not None:
        flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, flow, 0.5, 3, 25, 3, 5, 1.2, 0)
    prev_gray = gray
    if flow is None:
        continue

    body = np.flatnonzero((mask_small > 0.5).ravel())
    if body.size:
        # respawn the dead on the body, long lives where the body moves fast
        dead = ~alive | (age > life) | (pos[:, 0] < 1) | (pos[:, 0] > work_w - 2) | (pos[:, 1] < 1) | (pos[:, 1] > WORK_H - 2)
        d = np.flatnonzero(dead)
        if d.size:
            picks = body[rng.integers(0, body.size, d.size)]
            pos[d, 0] = (picks % work_w) + rng.random(d.size)
            pos[d, 1] = (picks // work_w) + rng.random(d.size)
            fmag = np.linalg.norm(flow.reshape(-1, 2)[picks], axis=1)
            spark = is_spark[d]
            life[d] = np.where(
                spark,
                0.08 + rng.random(d.size) * 0.2,
                (0.25 + rng.random(d.size) * 0.9 + np.clip(fmag, 0, 8) * 0.35),
            ).astype(np.float32)
            age[d] = 0
            alive[d] = True

    age += 1 / fps
    flat = expo.ravel()
    for _ in range(SUBSTEPS):
        # advect a fraction of a frame, splat, repeat: continuous strokes
        xi = np.clip(pos[:, 0].astype(np.int32), 0, work_w - 1)
        yi = np.clip(pos[:, 1].astype(np.int32), 0, WORK_H - 1)
        v = flow[yi, xi]
        swirl = 0.15 * np.stack([np.sin(pos[:, 1] * 0.045 + fi * 0.05), np.cos(pos[:, 0] * 0.04 - fi * 0.04)], -1)
        pos += ((v * gain[:, None] + swirl) / SUBSTEPS).astype(np.float32)

        fade = np.clip(1 - age / np.maximum(life, 1e-3), 0, 1) * np.clip(age * fps * 0.5, 0, 1)
        lum = gray[yi, xi].astype(np.float32) / 255
        w = (bright * fade * (0.15 + 0.85 * lum ** 1.3)) * alive
        px = np.clip(pos[:, 0] * scale, 0, out_w - 1.001)
        py = np.clip(pos[:, 1] * scale, 0, OUT_H - 1.001)
        x0 = px.astype(np.int32); y0 = py.astype(np.int32)
        fx = px - x0; fy = py - y0
        for ox, oy, ww in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            idx = (y0 + oy) * out_w + (x0 + ox)
            flat += np.bincount(idx, weights=w * ww * (0.09 / SUBSTEPS), minlength=flat.size).astype(np.float32)

    expo *= DECAY
    expo = cv2.GaussianBlur(expo, (0, 0), 0.7)

    # tone map with bloom
    bloom = cv2.GaussianBlur(expo, (0, 0), 6) * 0.5 + cv2.GaussianBlur(expo, (0, 0), 24) * 0.35
    vdisp = 1 - np.exp(-(expo + bloom) * 2.6)
    frame_rgb = lut[np.clip(vdisp * 255, 0, 255).astype(np.uint8)]
    writer.send(np.ascontiguousarray(frame_rgb))
    frames_rgb.append(cv2.resize(frame_rgb, (out_w // 2, OUT_H // 2)))
    if fi == int(total * 0.4):
        Image.fromarray(frame_rgb).save(out_dir / "poster.jpg", quality=88)
    if fi % 30 == 0:
        print(f"frame {fi}/{total}", flush=True)

writer.close()

# seamless loop: forward then backward, encoded from the half-res cache at full fps
writer2 = imageio_ffmpeg.write_frames(
    str(out_dir / "hero-loop.mp4"), (out_w // 2, OUT_H // 2), fps=fps, codec="libx264",
    output_params=["-crf", "23", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],
)
writer2.send(None)
for f in frames_rgb + frames_rgb[-2:0:-1]:
    writer2.send(np.ascontiguousarray(f))
writer2.close()
print("done", out_dir, flush=True)
