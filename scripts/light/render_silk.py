"""Silk render: a dancer as a solid figure of flowing blue fabric and smoke.

Pass 1: per source frame, rembg mask + Farneback flow at work resolution.
Pass 2: time-stretched (flow-interpolated) output frames. Each frame:
  body  = soft mask shaded by distance-to-edge (volume) plus a bright rim,
  fiber = noise streaks advected with the motion (fabric texture),
  trail = previous frame's light carried along an extended velocity field
          and decayed, so the figure sheds smoke as it moves,
  glow + saturated blue LUT on a navy floor.
Loop: tail crossfaded into head.

usage: python render_silk.py <video> <out_dir> [crop=x,y,w,h] [stretch=2.0] [bg=r,g,b]
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove
import imageio_ffmpeg

video, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
crop = tuple(int(v) for v in sys.argv[3].split(",")) if len(sys.argv) > 3 and sys.argv[3] != "-" else None
STRETCH = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
BG = tuple(int(v) for v in sys.argv[5].split(",")) if len(sys.argv) > 5 else (2, 9, 16)
out_dir.mkdir(parents=True, exist_ok=True)

WORK_H = 960
PAD = 0.18            # horizontal padding (fraction of width) so smoke has room
TRAIL_DECAY = 0.935
TRAIL_PUSH = 1.8    # how far smoke rides past the body's own motion
XFADE = 40            # loop crossfade frames
rng = np.random.default_rng(3)

cap = cv2.VideoCapture(str(video))
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS) or 25
if crop:
    cx, cy, cw, ch = crop
else:
    cw, ch = int(cap.get(3)), int(cap.get(4)); cx = cy = 0
body_w = int(round(WORK_H * cw / ch / 2) * 2)
pad = int(round(body_w * PAD / 2) * 2)
W, H = body_w + 2 * pad, WORK_H
print(f"{total} frames, work {W}x{H}, stretch {STRETCH}", flush=True)

# ---------- pass 1: masks and flow (cached per source + crop) ----------
cache = video.parent / f"{video.stem}-{W}x{H}-{'_'.join(map(str, crop or ()))}.npz"
masks, grays = [], []
if cache.exists():
    z = np.load(cache)
    masks, flows = list(z["masks"]), list(z["flows"])
    total = 0
    print("loaded cache", cache.name, flush=True)
else:
    seg = new_session("u2net_human_seg")
for fi in range(total):
    ok, bgr = cap.read()
    if not ok:
        break
    fr = cv2.resize(bgr[cy:cy + ch, cx:cx + cw], (body_w, H), interpolation=cv2.INTER_AREA)
    m = remove(Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)), session=seg, only_mask=True)
    m = np.asarray(m, np.uint8)
    masks.append(cv2.copyMakeBorder(m, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=0))
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    grays.append(cv2.copyMakeBorder(g, 0, 0, pad, pad, cv2.BORDER_REPLICATE))
    if fi % 20 == 0:
        print(f"mask {fi}/{total}", flush=True)
n = len(masks)

if grays:
    flows = []
    for i in range(n - 1):
        # flow from the masked silhouette: background lighting changes can't leak in
        a = (masks[i] // 2 + grays[i] // 2)
        b = (masks[i + 1] // 2 + grays[i + 1] // 2)
        flows.append(cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 4, 31, 3, 7, 1.5, 0))
    flows.append(flows[-1])
    np.savez(cache, masks=np.stack(masks), flows=np.stack(flows).astype(np.float16))
    print("flow done, cached", flush=True)
flows = [f.astype(np.float32) for f in flows]

ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)


def warp(img, dx, dy):
    return cv2.remap(img, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


def body_field(m8):
    m = m8.astype(np.float32) / 255
    m = cv2.GaussianBlur(m, (0, 0), 1.2)
    inside = (m > 0.5).astype(np.uint8)
    dt = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
    vol = np.clip(dt / 34.0, 0, 1) ** 0.6
    rim = m * (1 - np.clip(dt / 5.0, 0, 1))
    # limb direction: along the body, perpendicular to the distance gradient
    dts = cv2.GaussianBlur(dt, (0, 0), 6)
    gx = cv2.Sobel(dts, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(dts, cv2.CV_32F, 0, 1, ksize=3)
    # orientation in doubled-angle form: the sign flip at each limb's centerline
    # cancels out, so fibers never crack along the middle of an arm
    ang = np.arctan2(gx, -gy)
    w = np.sqrt(gx * gx + gy * gy)
    c2 = cv2.GaussianBlur(np.cos(2 * ang) * w, (0, 0), 9)
    s2 = cv2.GaussianBlur(np.sin(2 * ang) * w, (0, 0), 9)
    th = 0.5 * np.arctan2(s2, c2)
    return m * (0.2 + 0.5 * vol) + 0.4 * rim, m, np.cos(th), np.sin(th)


def lic(noise, tx, ty, steps=9, step=2.2):
    """Line-integral convolution: smear noise along (tx, ty) into long fibers."""
    acc = noise.copy()
    for sgn in (1, -1):
        px, py = xs.copy(), ys.copy()
        for _ in range(steps):
            px += sgn * tx * step
            py += sgn * ty * step
            acc += cv2.remap(noise, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return acc / (2 * steps + 1)


def curl_field(k):
    """Divergence-free swirl from a slowly drifting scalar potential."""
    t = k * 0.012
    p = (np.sin(xs * 0.011 + t * 1.3) * np.cos(ys * 0.009 - t)
         + 0.6 * np.sin(xs * 0.023 - ys * 0.017 + t * 2.1)
         + 0.35 * np.cos(xs * 0.041 + ys * 0.033 - t * 2.9))
    py_, px_ = np.gradient(p.astype(np.float32))
    return py_ * 90.0, -px_ * 90.0


# fabric fibers: long vertical streak noise, advected with the dancer
def fresh_fiber():
    z = rng.standard_normal((H, W)).astype(np.float32)
    z = cv2.GaussianBlur(z, (0, 0), sigmaX=0.9, sigmaY=7.0)
    return z / (z.std() + 1e-6)


fiber = fresh_fiber()

stops = np.array([
    [0.00, *BG],
    [0.10, BG[0] + 2, BG[1] + 8, BG[2] + 26],
    [0.20, 6, 46, 130],
    [0.34, 0, 74, 214],
    [0.55, 0, 120, 255],
    [0.78, 40, 175, 255],
    [0.93, 130, 215, 255],
    [1.00, 200, 238, 255],
], np.float32)
xl = np.linspace(0, 1, 256)
lut = np.stack([np.interp(xl, stops[:, 0], stops[:, i + 1]) for i in range(3)], -1).astype(np.uint8)

n_out = int((n - 1) * STRETCH)
trail = np.zeros((H, W), np.float32)
frames = []
for k in range(n_out):
    s = k / STRETCH
    i = min(int(s), n - 2)
    f = s - i
    fl = flows[i]
    b0, m0, tx0, ty0 = body_field(warp(masks[i], -fl[..., 0] * f, -fl[..., 1] * f))
    b1, m1, tx1, ty1 = body_field(warp(masks[i + 1], fl[..., 0] * (1 - f), fl[..., 1] * (1 - f)))
    body = b0 * (1 - f) + b1 * f
    mask = m0 * (1 - f) + m1 * f
    # blend orientations in doubled-angle space too (a line, not an arrow)
    a0, a1 = np.arctan2(ty0, tx0), np.arctan2(ty1, tx1)
    th = 0.5 * np.arctan2(np.sin(2 * a0) * (1 - f) + np.sin(2 * a1) * f,
                          np.cos(2 * a0) * (1 - f) + np.cos(2 * a1) * f)
    tx, ty = np.cos(th), np.sin(th)

    # velocity per output frame, extended past the body so smoke keeps moving
    v = fl / STRETCH
    wsum = cv2.GaussianBlur(mask, (0, 0), 22) + 1e-3
    vx = cv2.GaussianBlur(v[..., 0] * mask, (0, 0), 22) / wsum
    vy = cv2.GaussianBlur(v[..., 1] * mask, (0, 0), 22) / wsum
    # curl swirl so smoke curls off the figure and never sits still
    cx_, cy_ = curl_field(k)
    sx, sy = vx * TRAIL_PUSH + cx_, vy * TRAIL_PUSH + cy_ - 0.12
    speed = np.clip(np.sqrt(vx * vx + vy * vy) / 1.5, 0, 1)

    # fabric: noise carried with the motion, then smeared along the limbs
    fiber = warp(fiber, -vx, -vy) * 0.96 + fresh_fiber() * 0.28
    fiber /= fiber.std() + 1e-6
    folds = lic(fiber, tx, ty)
    folds = (folds - folds.mean()) / (folds.std() + 1e-6)
    # high contrast: dark gaps between bright ridges, like light on silk
    ridge = np.clip(0.5 + 0.38 * folds, 0, 1) ** 1.6
    # ragged edge: the silhouette tears into wisps instead of a sticker outline
    edge_noise = cv2.GaussianBlur(fiber, (0, 0), 2.5)
    soft = cv2.GaussianBlur(mask, (0, 0), 3.5)
    ragged = np.clip((soft - 0.42 + 0.22 * edge_noise) / 0.25, 0, 1)
    lit = body * ragged * (0.25 + 1.35 * ridge)

    # smoke: earlier light rides the swirl, emitted hardest at the torn edges
    trail = warp(trail, -sx, -sy) * TRAIL_DECAY
    trail = cv2.GaussianBlur(trail, (0, 0), 0.9)
    # smoke comes off what moves; a still head should not pile up a column
    edge = (np.clip(soft - ragged, 0, 1) + 0.35 * lit) * (0.15 + 0.85 * speed)
    trail = np.maximum(trail, edge * 0.9 * (0.4 + ridge))
    trail[trail < 0.02] = 0

    c = np.maximum(lit, trail * 0.7)
    c = np.clip(c - 0.012, 0, None)  # no faint haze: the frame edge must stay pure navy
    glow = cv2.GaussianBlur(c, (0, 0), 6) * 0.3 + cv2.GaussianBlur(c, (0, 0), 24) * 0.18
    vdisp = 1 - np.exp(-(c + glow) * 2.0)
    frames.append(lut[np.clip(vdisp * 255, 0, 255).astype(np.uint8)])
    if k % 40 == 0:
        print(f"render {k}/{n_out}", flush=True)

# seamless loop: blend the tail over the head
loop = frames[XFADE:]
for j in range(XFADE):
    a = (j + 1) / (XFADE + 1)
    loop[-XFADE + j] = (frames[-XFADE + j].astype(np.float32) * (1 - a) + frames[j].astype(np.float32) * a).astype(np.uint8)

writer = imageio_ffmpeg.write_frames(
    str(out_dir / "hero-loop.mp4"), (W, H), fps=fps, codec="libx264",
    output_params=["-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],
)
writer.send(None)
for fr in loop:
    writer.send(np.ascontiguousarray(fr))
writer.close()
Image.fromarray(loop[len(loop) // 3]).save(out_dir / "poster.jpg", quality=88)
for t in (0.1, 0.35, 0.6, 0.85):
    Image.fromarray(loop[int(len(loop) * t)]).save(out_dir / f"check-{int(t * 100)}.jpg", quality=85)
print("done", out_dir, len(loop), "frames", f"{len(loop) / fps:.1f}s", flush=True)
