"""Cloth render: a dancer swirling real fabric, as a figure of blue light.

The fabric carries the look, so brightness comes from the footage itself:
white cloth glows, the skin-toned body stays a darker core.
Pass 1 (cached): isnet-general-use mask OR a whiteness key (thin translucent
cloth the model drops), a light field from per-pixel whiteness, Farneback flow.
Pass 2: flow-interpolated time stretch, a short silk trail, glow, cyan-blue LUT.

usage: python render_cloth.py <video> <out_dir> <crop=x,y,w,h> <first,last> [stretch] [bg=r,g,b]
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove
import imageio_ffmpeg

video, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
cx, cy, cw, ch = (int(v) for v in sys.argv[3].split(","))
first, last = (int(v) for v in sys.argv[4].split(","))
STRETCH = float(sys.argv[5]) if len(sys.argv) > 5 else 1.25
BG = tuple(int(v) for v in sys.argv[6].split(",")) if len(sys.argv) > 6 else (8, 29, 43)
out_dir.mkdir(parents=True, exist_ok=True)

WORK_H = 960
PAD = 0.22
TRAIL_DECAY = 0.82
XFADE = 36

cap = cv2.VideoCapture(str(video))
fps = cap.get(cv2.CAP_PROP_FPS) or 25
body_w = int(round(WORK_H * cw / ch / 2) * 2)
pad = int(round(body_w * PAD / 2) * 2)
W, H = body_w + 2 * pad, WORK_H

cache = video.parent / f"{video.stem}-cloth2-{W}x{H}-{cx}_{cy}_{cw}_{ch}-{first}_{last}.npz"
if cache.exists():
    z = np.load(cache)
    mincs, sats, masks = z["minc"], z["sat"], z["mask"]
    flows = list(z["flows"].astype(np.float32))
    print("loaded cache", cache.name, flush=True)
else:
    seg = new_session("isnet-general-use")
    mincs, sats, masks, grays = [], [], [], []
    cap.set(cv2.CAP_PROP_POS_FRAMES, first)
    border = lambda a, v: cv2.copyMakeBorder(a, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=v)
    for fi in range(first, last):
        ok, bgr = cap.read()
        if not ok:
            break
        fr = cv2.resize(bgr[cy:cy + ch, cx:cx + cw], (body_w, H), interpolation=cv2.INTER_AREA)
        m = np.asarray(remove(Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)), session=seg, only_mask=True))
        mincs.append(border(fr.min(2), 0))
        sats.append(border(fr.max(2) - fr.min(2), 255))
        masks.append(border(m, 0))
        grays.append(cv2.copyMakeBorder(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), 0, 0, pad, pad, cv2.BORDER_REPLICATE))
        if (fi - first) % 20 == 0:
            print(f"mask {fi - first}/{last - first}", flush=True)
    flows = [cv2.calcOpticalFlowFarneback(grays[i], grays[i + 1], None, 0.5, 4, 25, 3, 7, 1.5, 0)
             for i in range(len(grays) - 1)]
    flows.append(flows[-1])
    mincs, sats, masks = np.stack(mincs), np.stack(sats), np.stack(masks)
    np.savez(cache, minc=mincs, sat=sats, mask=masks, flows=np.stack(flows).astype(np.float16))
    print("cached", cache.name, flush=True)

ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
# fade cloth that runs off the source frame instead of cutting it with a hard edge
xin = np.clip(np.minimum(xs - pad, pad + body_w - 1 - xs) / 50.0, 0, 1)
edge_fade = (xin * xin * (3 - 2 * xin)).astype(np.float32)


def light_of(i):
    """Only white, colorless cloth glows; skin falls to a dark core."""
    minc = mincs[i].astype(np.float32) / 255
    sat = sats[i].astype(np.float32) / 255
    m = masks[i].astype(np.float32) / 255
    cloth = np.clip((minc - 0.40) / 0.40, 0, 1) * np.clip(1 - (sat - 0.04) / 0.10, 0, 1)
    alpha = np.maximum(m, cloth)
    light = alpha * cloth ** 1.45
    light = np.maximum(light, m * 0.075)
    return cv2.GaussianBlur(light, (0, 0), 1.1) * edge_fade


lights = [light_of(i) for i in range(len(mincs))]
n = len(lights)


def warp(img, dx, dy):
    return cv2.remap(img, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


stops = np.array([
    [0.00, *BG],
    [0.10, BG[0] + 2, BG[1] + 10, BG[2] + 30],
    [0.22, 8, 64, 170],
    [0.40, 22, 128, 232],
    [0.60, 60, 172, 248],
    [0.80, 110, 200, 255],
    [1.00, 170, 225, 255],
], np.float32)
xl = np.linspace(0, 1, 256)
lut = np.stack([np.interp(xl, stops[:, 0], stops[:, i + 1]) for i in range(3)], -1).astype(np.uint8)

# loop between the two most alike poses at least ~7s apart, so the seam
# crossfade blends near-identical frames instead of ghosting two bodies
small = np.stack([cv2.resize(l, (W // 8, H // 8), interpolation=cv2.INTER_AREA) for l in lights])
MIN_SPAN = int(7.0 * fps)
best = (1e9, 0, n - 1)
for a0 in range(0, n - MIN_SPAN, 2):
    d = np.abs(small[a0 + MIN_SPAN:] - small[a0]).mean(axis=(1, 2))
    j = int(d.argmin())
    if d[j] < best[0]:
        best = (float(d[j]), a0, a0 + MIN_SPAN + j)
_, L0, L1 = best
print(f"loop source frames {L0}..{L1} (pose diff {best[0]:.4f})", flush=True)

TRAIL_DECAY = 0.9
WARM = 30  # pre-roll so the trail is already full on the first kept frame
n_out = int((L1 - L0) * STRETCH)
trail = np.zeros((H, W), np.float32)
frames = []
def light_at(s):
    s = min(max(s, 0), n - 1.001)
    i = min(int(s), n - 2)
    f = s - i
    fl = flows[i]
    a = warp(lights[i], -fl[..., 0] * f, -fl[..., 1] * f)
    b = warp(lights[i + 1], fl[..., 0] * (1 - f), fl[..., 1] * (1 - f))
    return a * (1 - f) + b * f, fl


SPAN = L1 - L0
BLEND = XFADE / STRETCH  # source frames over which the tail becomes the head's pre-roll
# two laps, keep the second: its first frame inherits the trail left by the
# first lap's ending, which is exactly the trail its own last frame carries
for k in range(-n_out, n_out):
    s = L0 + (k % n_out) / STRETCH
    light, fl = light_at(s)
    # the tail morphs into the frames just before L0, so the last frame of the
    # loop is one ordinary step away from the first
    w = (s - (L1 - BLEND)) / BLEND
    if w > 0:
        w = min(w, 1.0)
        w = w * w * (3 - 2 * w)
        light = light * (1 - w) + light_at(s - SPAN)[0] * w

    v = fl / STRETCH
    trail = warp(trail, -v[..., 0] * 1.6, -v[..., 1] * 1.6 + 0.2) * TRAIL_DECAY
    trail = cv2.GaussianBlur(trail, (0, 0), 1.0)
    trail = np.maximum(trail, light * 0.7)
    c = np.maximum(light, trail * 0.6)
    c = np.clip(c - 0.015, 0, None)
    glow = cv2.GaussianBlur(c, (0, 0), 5) * 0.32 + cv2.GaussianBlur(c, (0, 0), 22) * 0.2
    vdisp = 1 - np.exp(-(c + glow) * 1.95)
    if k >= 0:
        frames.append(lut[np.clip(vdisp * 255, 0, 255).astype(np.uint8)])
    if k % 50 == 0:
        print(f"render {k}/{n_out}", flush=True)

loop = frames

writer = imageio_ffmpeg.write_frames(
    str(out_dir / "hero-loop.mp4"), (W, H), fps=fps, codec="libx264",
    output_params=["-crf", "20", "-preset", "slow", "-movflags", "+faststart"],
)
writer.send(None)
for fr in loop:
    writer.send(np.ascontiguousarray(fr))
writer.close()
Image.fromarray(loop[len(loop) // 3]).save(out_dir / "poster.jpg", quality=88)
print("done", out_dir, len(loop), "frames", f"{len(loop) / fps:.1f}s", flush=True)
