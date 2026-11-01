"""Particle atlas from render_cloth.py's cache, so the live particles match the film.
Atlas 1: R = light, G = depth proxy (blurred light), B = mask. Atlas 2: flow packed.
usage: python bake_cloth.py <cache.npz> <out_dir> <L0,L1> [frames=96] [cell_w=180] [cols=10] [src_fps=25]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

cache, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
L0, L1 = (int(v) for v in sys.argv[3].split(","))
n_frames = int(sys.argv[4]) if len(sys.argv) > 4 else 96
cell_w = int(sys.argv[5]) if len(sys.argv) > 5 else 180
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 10
src_fps = float(sys.argv[7]) if len(sys.argv) > 7 else 25.0
PAD = 0.22  # must match render_cloth.py
out_dir.mkdir(parents=True, exist_ok=True)

z = np.load(cache)
mincs, sats, masks = z["minc"], z["sat"], z["mask"]
_, H, W = mincs.shape
body_w = round(W / (1 + 2 * PAD) / 2) * 2
pad = (W - body_w) // 2
cell_h = round(cell_w * H / body_w)
rows = -(-n_frames // cols)
total = L1 - L0
idx = L0 + np.linspace(0, total - 1, n_frames).round().astype(int)


def light_of(i):
    """Same formula as render_cloth.py, cropped to the unpadded body region."""
    minc = mincs[i].astype(np.float32) / 255
    sat = sats[i].astype(np.float32) / 255
    m = masks[i].astype(np.float32) / 255
    cloth = np.clip((minc - 0.40) / 0.40, 0, 1) * np.clip(1 - (sat - 0.04) / 0.10, 0, 1)
    light = np.maximum(np.maximum(m, cloth) * cloth ** 1.5, m * 0.06)
    return cv2.GaussianBlur(light, (0, 0), 1.1)[:, pad:pad + body_w]


atlas = np.zeros((rows * cell_h, cols * cell_w, 3), np.uint8)
flow_atlas = np.zeros_like(atlas)
grays = []
for k, i in enumerate(idx):
    lt = light_of(i)
    m = np.clip(cv2.GaussianBlur(lt, (0, 0), 2) * 5, 0, 1)
    d = cv2.GaussianBlur(lt, (0, 0), 10)
    d = d / max(d.max(), 1e-6)
    lum = np.clip(0.2 + 0.8 * lt ** 0.8, 0, 1) * m
    cell = cv2.resize((np.stack([lum, d * m, m], -1) * 255).astype(np.uint8), (cell_w, cell_h), interpolation=cv2.INTER_AREA)
    r, c = divmod(k, cols)
    atlas[r * cell_h:(r + 1) * cell_h, c * cell_w:(c + 1) * cell_w] = cell
    grays.append(cv2.resize((lt * 255).astype(np.uint8), (cell_w, cell_h), interpolation=cv2.INTER_AREA))

FLOW_SCALE = 640.0
for k in range(n_frames):
    fl = cv2.calcOpticalFlowFarneback(grays[k], grays[min(k + 1, n_frames - 1)], None, 0.5, 3, 21, 3, 7, 1.5, 0)
    fl = cv2.GaussianBlur(fl, (9, 9), 0) / cell_w
    enc = np.clip(128 + fl * FLOW_SCALE, 0, 255).astype(np.uint8)
    mag = np.clip(np.linalg.norm(fl, axis=2) * FLOW_SCALE * 2, 0, 255).astype(np.uint8)
    r, c = divmod(k, cols)
    flow_atlas[r * cell_h:(r + 1) * cell_h, c * cell_w:(c + 1) * cell_w] = np.dstack([enc[..., 0], enc[..., 1], mag])

Image.fromarray(atlas).save(out_dir / "figure-atlas.webp", quality=92, method=6)
Image.fromarray(flow_atlas).save(out_dir / "figure-flow.webp", quality=90, method=6)
(out_dir / "figure-atlas.json").write_text(json.dumps(
    {"frames": n_frames, "cols": cols, "rows": rows, "cellW": cell_w, "cellH": cell_h,
     "fps": n_frames / (total / src_fps), "flowScale": FLOW_SCALE}, indent=2))
print("done", out_dir, f"cell {cell_w}x{cell_h}")
