"""Estimate visible vertical proportions; no masks or images leave this worker."""
from functools import lru_cache
import hashlib
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort

MODEL = Path(__file__).resolve().parents[2] / '.runtime/face-parsing/resnet18.onnx'
DIGEST = '0d9bd318e46987c3bdbfacae9e2c0f461cae1c6ac6ea6d43bbe541a91727e33f'


@lru_cache(maxsize=1)
def _session():
    if not MODEL.is_file() or hashlib.sha256(MODEL.read_bytes()).hexdigest() != DIGEST:
        return None
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    options.log_severity_level = 3
    return ort.InferenceSession(str(MODEL), options, providers=['CPUExecutionProvider'])


def _measure(rgb, points, yaw, pitch, issues):
    if issues or abs(yaw) > 18 or abs(pitch) > 18:
        return {'status': 'pose_quality'}
    p = np.asarray(points)[:, :2]
    x = p[45] - p[36]
    if not np.isfinite(p).all() or np.linalg.norm(x) < 10:
        return {'status': 'pose_quality'}
    x = x / np.linalg.norm(x)
    y = np.array([-x[1], x[0]])
    brow = (p[21] + p[22]) / 2
    width = (p[16] - p[0]) @ x
    mid, lower, chin = (p[33]-brow) @ y, (p[8]-p[33]) @ y, (p[8]-p[57]) @ y
    if width < 80 or min(mid, lower) < 25 or not .48 < mid/lower < 1.95:
        return {'status': 'pose_quality'}
    if not (0 <= p[[8, 33], 0]).all() or (p[[8, 33], 0] >= rgb.shape[1]).any() or not (0 <= p[[8, 33], 1]).all() or (p[[8, 33], 1] >= rgb.shape[0]).any():
        return {'status': 'pose_quality'}
    session = _session()
    if session is None:
        return {'status': 'unavailable'}
    # Similarity crop puts the forehead at native parsing resolution, independent
    # of original picture framing. Map each probe back to real pixels before use.
    scale = 512 / (width * 1.85)
    transform = np.vstack((x, y)) * scale
    origin = np.array([256., 235.])
    affine = np.column_stack((transform, origin - transform @ brow))
    crop = cv2.warpAffine(rgb, affine, (512, 512))
    norm = (crop.astype(np.float32)/255 - np.array([.485,.456,.406], np.float32)) / np.array([.229,.224,.225], np.float32)
    output = session.run([session.get_outputs()[0].name], {session.get_inputs()[0].name: norm.transpose(2,0,1)[None]})[0][0]
    if output.shape != (19,512,512):
        return {'status': 'unavailable'}
    heights = []
    for lateral in np.linspace(-.24, .24, 9):
        ix = round(origin[0] + lateral * width * scale)
        # Probe upward from above the brows, requiring continuous skin followed
        # by sustained hair. Padding/background, hats and brow occlusion fail.
        distances = np.arange(round(.18*mid*scale), round(1.8*mid*scale))
        rows = (origin[1] - distances).astype(int)
        valid = rows >= 0
        distances, rows = distances[valid], rows[valid]
        labels = output[:, rows, ix].argmax(axis=0)
        hits = np.flatnonzero(labels != 1)
        if not hits.size:
            return {'status': 'not_visible'}
        n = hits[0]
        streak = max(4, round(.06*mid*scale))
        if n + streak > len(labels) or not np.all(labels[n:n+streak] == 17):
            return {'status': 'not_visible'}
        h = distances[n] / scale
        actual = brow + lateral * width * x - (h + streak/scale) * y
        if not (2 <= actual[0] < rgb.shape[1]-2 and 2 <= actual[1] < rgb.shape[0]-2):
            return {'status': 'not_visible'}
        heights.append(h)
    a = np.array(heights)
    # Very low, asymmetric, or nearly horizontal fringe boundaries are ambiguous.
    if (a.min()/mid < .55 or a.max()/mid > 1.65 or np.max(abs(a-a[::-1]))/mid > .27
            or (a[4] - np.mean(a[[0,8]]))/mid < .035 or np.max(abs(np.diff(a)))/mid > .22):
        return {'status': 'not_visible'}
    upper = float(np.median(a[3:6]))
    shares = np.array([upper, mid, lower]) / (upper + mid + lower)
    mouth_width = np.linalg.norm(p[54]-p[48])
    chin_share = float(chin/lower)
    chin_ok = mouth_width > 0 and np.linalg.norm(p[66]-p[62])/mouth_width < .1 and .15 < chin_share < .85
    return {'status': 'estimated', 'shares': np.round(shares,5).tolist(),
            'chinShare': round(chin_share,4) if chin_ok else None}


def estimate_thirds(rgb, points, yaw, pitch, issues):
    try:
        return _measure(rgb, points, yaw, pitch, issues)
    except Exception:
        # Optional parsing failure must not take down either reconstruction engine.
        return {'status': 'unavailable'}
