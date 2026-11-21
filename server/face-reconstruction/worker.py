"""Persistent local ONNX worker. Images/results only live in memory for one request.

Pre/post-processing follows cleardusk/3DDFA_V2 (MIT), pinned in source manifest.
The BFM geometry is separately restricted to academic use; never distributed here.
"""
import argparse
import base64
import gc
import hashlib
import io
import json
import math
import sys
import time
import warnings
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps
from hairline import estimate_thirds

Image.MAX_IMAGE_PIXELS = 24000000
warnings.simplefilter('error', Image.DecompressionBombWarning)


class PhotoError(Exception):
    pass


def priors(height, width):
    anchors = []
    for step, sizes in [(32, [32, 64, 128]), (64, [256]), (128, [512])]:
        for y in range(math.ceil(height / step)):
            for x in range(math.ceil(width / step)):
                for size in sizes:
                    offsets = [0, .25, .5, .75] if size == 32 else [0, .5] if size == 64 else [.5]
                    for dy in offsets:
                        for dx in offsets:
                            anchors.append([(x + dx) * step / width, (y + dy) * step / height, size / width, size / height])
    return np.asarray(anchors, dtype=np.float32)


def suppress(boxes, scores):
    order = scores.argsort()[::-1][:5000]
    selected = []
    areas = np.maximum(0, boxes[:, 2] - boxes[:, 0] + 1) * np.maximum(0, boxes[:, 3] - boxes[:, 1] + 1)
    while order.size:
        current = order[0]
        selected.append(current)
        rest = order[1:]
        low = np.maximum(boxes[current, :2], boxes[rest, :2])
        high = np.minimum(boxes[current, 2:], boxes[rest, 2:])
        wh = np.maximum(0, high - low + 1)
        intersection = wh[:, 0] * wh[:, 1]
        overlap = intersection / np.maximum(areas[current] + areas[rest] - intersection, 1e-6)
        order = rest[overlap <= .3]
    return selected


def project(points, roi, depth_origin=None):
    points = points.copy()
    sx, sy, ex, ey = roi
    scale_x, scale_y = (ex - sx) / 120, (ey - sy) / 120
    points[0] = (points[0] - 1) * scale_x + sx
    points[1] = (120 - points[1]) * scale_y + sy
    points[2] = (points[2] - 1) * (scale_x + scale_y) / 2
    points[2] -= np.min(points[2]) if depth_origin is None else depth_origin
    return points.T.astype(np.float32)


class Reconstructor:
    def __init__(self, model_dir):
        root = Path(model_dir)
        manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
        for name, digest in manifest['sha256'].items():
            if hashlib.sha256((root / name).read_bytes()).hexdigest() != digest:
                raise RuntimeError('Model integrity mismatch')
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        self.detector = ort.InferenceSession(str(root / 'detector.onnx'), options, providers=['CPUExecutionProvider'])
        self.alignment = ort.InferenceSession(str(root / 'alignment.onnx'), options, providers=['CPUExecutionProvider'])
        with np.load(root / 'geometry.npz', allow_pickle=False) as data:
            self.geometry = {key: data[key] for key in data.files}

    def detect(self, image):
        h, w = image.shape[:2]
        scale = min(1, 720 / h, 1080 / w)
        small = cv2.resize(image, (int(w * scale), int(h * scale))) if scale < 1 else image
        height, width = small.shape[:2]
        input_image = (small.astype(np.float32) - np.array([104, 117, 123], dtype=np.float32)).transpose(2, 0, 1)[None]
        locations, scores = self.detector.run(None, {'input': input_image})
        anchors = priors(height, width)
        centers = anchors[:, :2] + locations[0, :, :2] * .1 * anchors[:, 2:]
        sizes = anchors[:, 2:] * np.exp(locations[0, :, 2:] * .2)
        boxes = np.concatenate([centers - sizes / 2, centers + sizes / 2], axis=1)
        boxes *= np.array([width, height, width, height], dtype=np.float32) / scale
        scores = scores[0, :, 1]
        chosen = scores > .5
        boxes, scores = boxes[chosen], scores[chosen]
        keep = suppress(boxes, scores)
        return boxes[keep], scores[keep]

    def reconstruct(self, encoded):
        started = time.perf_counter()
        try:
            raw = base64.b64decode(encoded, validate=True)
            if len(raw) > 8 * 1024 * 1024:
                raise PhotoError('IMAGE_TOO_LARGE')
            with Image.open(io.BytesIO(raw)) as source:
                if source.format not in ('JPEG', 'PNG', 'WEBP'):
                    raise PhotoError('INVALID_IMAGE')
                if source.width * source.height > 24000000:
                    raise PhotoError('IMAGE_TOO_LARGE')
                if min(source.size) < 320:
                    raise PhotoError('LOW_RESOLUTION')
                image = ImageOps.exif_transpose(source).convert('RGB')
                image.thumbnail((1600, 1600))
                image = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)
        except PhotoError:
            raise
        except (Image.DecompressionBombError, Image.DecompressionBombWarning):
            raise PhotoError('IMAGE_TOO_LARGE') from None
        except Exception:
            raise PhotoError('INVALID_IMAGE') from None
        del raw
        height, width = image.shape[:2]
        boxes, scores = self.detect(image)
        if not len(boxes):
            raise PhotoError('NO_FACE')
        if len(boxes) != 1:
            raise PhotoError('MULTIPLE_FACES')
        left, top, right, bottom = boxes[0]
        if min(right - left, bottom - top) < 90:
            raise PhotoError('LOW_RESOLUTION')
        old_size = (right - left + bottom - top) / 2
        center = [(right + left) / 2, (bottom + top) / 2 + old_size * .14]
        size = int(old_size * 1.58)
        roi = [center[0] - size / 2, center[1] - size / 2, center[0] + size / 2, center[1] + size / 2]
        sx, sy, ex, ey = [int(round(float(x))) for x in roi]
        crop = np.zeros((ey - sy, ex - sx, 3), dtype=np.uint8)
        x0, y0, x1, y1 = max(0, sx), max(0, sy), min(width, ex), min(height, ey)
        if x1 <= x0 or y1 <= y0:
            raise PhotoError('INVALID_IMAGE')
        crop[y0 - sy:y1 - sy, x0 - sx:x1 - sx] = image[y0:y1, x0:x1]
        input_image = cv2.resize(crop, (120, 120)).astype(np.float32).transpose(2, 0, 1)[None]
        input_image = (input_image - 127.5) / 128
        g = self.geometry
        params = self.alignment.run(None, {'input': input_image})[0].reshape(-1) * g['param_std'].reshape(-1) + g['param_mean'].reshape(-1)
        transform = params[:12].reshape(3, 4)
        shape = g['mean'].reshape(-1, 1) + g['shape'] @ params[12:52, None] + g['expression'] @ params[52:62, None]
        points = transform[:, :3] @ shape.reshape(3, -1, order='F') + transform[:, 3:]
        vertices = project(points, roi)
        sparse = shape[g['keypoints'].reshape(-1)].reshape(3, -1, order='F')
        depth_origin = (np.min(points[2]) - 1) * ((roi[2] - roi[0]) + (roi[3] - roi[1])) / 240
        landmarks = project(transform[:, :3] @ sparse + transform[:, 3:], roi, depth_origin)
        row1 = transform[0, :3] / max(np.linalg.norm(transform[0, :3]), 1e-8)
        yaw = math.degrees(math.asin(float(np.clip(-row1[2], -1, 1))))
        region = image[max(0, int(top)):min(height, int(bottom)), max(0, int(left)):min(width, int(right))]
        gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
        issues = []
        if gray.mean() < 45: issues.append('人脸区域偏暗')
        if gray.mean() > 220: issues.append('人脸区域偏亮')
        if cv2.Laplacian(gray, cv2.CV_64F).var() < 35: issues.append('照片可能模糊')
        if abs(yaw) > 25: issues.append('侧脸角度较大，比例仅供参考')
        # Padding in the 1.58x inference crop is expected; assess the detected face itself.
        if left < width * .02 or top < height * .02 or right > width * .98 or bottom > height * .98:
            issues.append('人脸接近照片边缘')
        row2 = transform[1, :3] / max(np.linalg.norm(transform[1, :3]), 1e-8)
        pitch = math.degrees(math.atan2(row2[2], np.cross(row1, row2)[2]))
        thirds = estimate_thirds(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), landmarks, yaw, pitch, issues)
        return {'engine': '3DDFA_V2', 'width': width, 'height': height, 'thirds': thirds,
                'vertices': np.round(vertices, 3).tolist(), 'triangles': g['triangles'].tolist(),
                'landmarks': np.round(landmarks, 3).tolist(), 'detectionScore': round(float(scores[0]), 4),
                'yaw': round(yaw, 2), 'qualityIssues': issues,
                'inferenceMs': round((time.perf_counter() - started) * 1000, 1)}


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=True, allow_nan=False, separators=(',', ':')) + '\n')
    sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--models', required=True)
    args = parser.parse_args()
    try:
        engine = Reconstructor(args.models)
    except Exception:
        emit({'id': 'ready', 'ok': False, 'code': 'MODEL_UNAVAILABLE'})
        return
    emit({'id': 'ready', 'ok': True, 'result': None})
    # No queue, photo files, response cache, user-data logs or network calls.
    for line in sys.stdin:
        request = None
        result = None
        identity = None
        try:
            request = json.loads(line)
            identity = request['id']
            result = engine.reconstruct(request['image'])
            emit({'id': identity, 'ok': True, 'result': result})
        except PhotoError as error:
            emit({'id': identity, 'ok': False, 'code': str(error)})
        except Exception:
            emit({'id': identity, 'ok': False, 'code': 'RECONSTRUCTION_FAILED'})
        finally:
            request = result = line = None
            gc.collect()


if __name__ == '__main__':
    main()
