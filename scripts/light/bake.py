"""Bake a figure video into particle atlases.

Per sampled frame: rembg (u2net_human_seg) cuts the person out, Depth Anything
V2 Small estimates depth, Farneback optical flow links cell k to k+1.
Atlas 1 (figure): R = luminance inside figure, G = depth (near = bright), B = mask.
Atlas 2 (flow):   R,G = flow xy packed around 128, B = magnitude.

usage: python -I bake.py <video> <out_dir> [frames=96] [cell_w=216] [cols=10] [crop=x,y,w,h]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from transformers import pipeline

video, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
n_frames = int(sys.argv[3]) if len(sys.argv) > 3 else 96
cell_w = int(sys.argv[4]) if len(sys.argv) > 4 else 216
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 10
crop = tuple(int(v) for v in sys.argv[6].split(",")) if len(sys.argv) > 6 else None
out_dir.mkdir(parents=True, exist_ok=True)

cap = cv2.VideoCapture(str(video))
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
src_fps = cap.get(cv2.CAP_PROP_FPS) or 25
idx = np.linspace(0, total - 2, n_frames).round().astype(int)

if crop:
    cx, cy, cw, ch = crop
else:
    cw = int(cap.get(3)); ch = int(cap.get(4)); cx = cy = 0
cell_h = round(cell_w * ch / cw)
rows = -(-n_frames // cols)
work_w, work_h = cell_w * 3, cell_h * 3  # model resolution
print(f"{total} frames -> {n_frames} cells {cell_w}x{cell_h}, atlas {cols}x{rows}, crop={crop}")

seg = new_session("u2net_human_seg")
depth = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")

atlas = np.zeros((rows * cell_h, cols * cell_w, 3), np.uint8)
flow_atlas = np.zeros((rows * cell_h, cols * cell_w, 3), np.uint8)
grays, preview = [], []
for k, i in enumerate(idx):
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(i))
    ok, bgr = cap.read()
    if not ok:
        raise SystemExit(f"read failed at {i}")
    rgb = cv2.cvtColor(bgr[cy:cy + ch, cx:cx + cw], cv2.COLOR_BGR2RGB)
    img = Image.fromarray(cv2.resize(rgb, (work_w, work_h), interpolation=cv2.INTER_AREA))

    mask = remove(img, session=seg, only_mask=True).filter(ImageFilter.GaussianBlur(1))
    d = depth(img)["predicted_depth"].squeeze().numpy()
    d = np.array(Image.fromarray(d).resize(img.size, Image.BILINEAR))

    m = np.asarray(mask, np.float32) / 255
    inside = m > 0.5
    if inside.any():
        lo, hi = np.percentile(d[inside], [2, 98])
        dn = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    else:
        dn = np.zeros_like(d)
    luma = np.asarray(img.convert("L"), np.float32) / 255
    # lift the body so dark clothing still carries particles; rim light stays hottest
    lum = np.clip(0.22 + 0.78 * luma ** 0.65, 0, 1) * m

    cell = np.stack([lum, dn * m, m], -1)
    cell = cv2.resize((cell * 255).astype(np.uint8), (cell_w, cell_h), interpolation=cv2.INTER_AREA)
    r, c = divmod(k, cols)
    atlas[r * cell_h:(r + 1) * cell_h, c * cell_w:(c + 1) * cell_w] = cell
    grays.append(cv2.resize(np.asarray(img.convert("L")), (cell_w, cell_h)))
    if k % 24 == 0:
        preview.append(cell)
    print(f"frame {k + 1}/{n_frames}", flush=True)

# optical flow cell k -> k+1, normalized by cell width, packed around 128
FLOW_SCALE = 640.0
for k in range(n_frames):
    a, b = grays[k], grays[min(k + 1, n_frames - 1)]
    fl = cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 3, 21, 3, 7, 1.5, 0)
    fl = cv2.GaussianBlur(fl, (9, 9), 0) / cell_w
    enc = np.clip(128 + fl * FLOW_SCALE, 0, 255).astype(np.uint8)
    mag = np.clip(np.linalg.norm(fl, axis=2) * FLOW_SCALE * 2, 0, 255).astype(np.uint8)
    r, c = divmod(k, cols)
    flow_atlas[r * cell_h:(r + 1) * cell_h, c * cell_w:(c + 1) * cell_w] = np.dstack([enc[..., 0], enc[..., 1], mag])

Image.fromarray(atlas).save(out_dir / "figure-atlas.webp", quality=92, method=6)
Image.fromarray(flow_atlas).save(out_dir / "figure-flow.webp", quality=90, method=6)
Image.fromarray(np.concatenate(preview, 1)).save(out_dir / "preview.png")
(out_dir / "figure-atlas.json").write_text(json.dumps(
    {"frames": n_frames, "cols": cols, "rows": rows, "cellW": cell_w, "cellH": cell_h,
     "fps": n_frames / (total / src_fps), "flowScale": FLOW_SCALE}, indent=2))
print("done", out_dir)
