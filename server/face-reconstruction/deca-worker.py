"""Local DECA geometry adapter. Upstream code and licensed assets stay in .runtime.

Uses upstream encoders, FLAME, detail generator and official dense OBJ export
geometry. Three.js supplies display; no PyTorch3D rasterizer or texture synthesis.
The adapter requires real weights and refuses incomplete installations.
"""
import argparse
import base64
import contextlib
import gc
import hashlib
import io
import json
import math
import os
from pathlib import Path
import sys
import time

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps
from skimage.transform import estimate_transform, warp
import torch

from worker import PhotoError, Reconstructor as Baseline, emit
from hairline import estimate_thirds


def project_to_photo(points, camera, inverse_crop):
    """FLAME +Z faces viewer; output image XY with viewer-facing positive depth."""
    points = np.asarray(points, dtype=np.float32)
    projected = points.copy()
    projected[:, :2] += camera[1:]
    projected *= camera[0]
    xy = (projected[:, :2] * [1, -1] + 1) * 112
    xy = np.column_stack([xy, np.ones(len(xy))]) @ inverse_crop.T
    depth_scale = np.linalg.norm(inverse_crop[:2, 0]) * 112
    return np.column_stack([xy[:, :2], projected[:, 2] * depth_scale]).astype(np.float32)


class DecaReconstructor:
    detect = Baseline.detect

    def __init__(self, model_dir):
        root = Path(model_dir).resolve()
        runtime = root.parent
        manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
        for name in ('generic_model.pkl', 'deca_model.tar', 'detector.onnx'):
            if hashlib.sha256((root / name).read_bytes()).hexdigest() != manifest['sha256'][name]:
                raise RuntimeError('Model integrity mismatch')
        source = json.loads((runtime / 'source.json').read_text(encoding='utf-8'))
        upstream = runtime / 'upstream'
        for entry in source['files']:
            if hashlib.sha256((upstream / entry['path']).read_bytes()).hexdigest() != entry['sha256']:
                raise RuntimeError('Source integrity mismatch')
        sys.path.insert(0, str(upstream))
        from decalib.models.encoders import ResnetEncoder
        from decalib.models.decoders import Generator
        from decalib.models.FLAME import FLAME
        from decalib.utils.config import get_cfg_defaults
        from decalib.utils import util

        torch.set_num_threads(2)
        requested = os.environ.get('YAS_DECA_DEVICE', 'auto')
        if requested not in ('auto', 'cpu', 'cuda'):
            raise RuntimeError('Unsupported device')
        self.device = 'cuda' if requested == 'auto' and torch.cuda.is_available() else 'cpu' if requested == 'auto' else requested
        self.util = util
        config = get_cfg_defaults().model
        config.flame_model_path = str(root / 'generic_model.pkl')
        config.use_tex = False
        self.flame = FLAME(config).to(self.device).eval()
        self.coarse = ResnetEncoder(outsize=236).to(self.device).eval()
        self.detail = ResnetEncoder(outsize=128).to(self.device).eval()
        self.generator = Generator(latent_dim=181, out_channels=1, out_scale=.01, sample_mode='bilinear').to(self.device).eval()
        checkpoint = torch.load(root / 'deca_model.tar', map_location='cpu', weights_only=True)
        for module, key in [(self.coarse, 'E_flame'), (self.detail, 'E_detail'), (self.generator, 'D_detail')]:
            module.load_state_dict(checkpoint[key], strict=True)
        self.template = np.load(upstream / 'data/texture_data_256.npy', allow_pickle=True, encoding='latin1').item()
        self.fixed = np.load(upstream / 'data/fixed_displacement_256.npy')
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        self.detector = ort.InferenceSession(str(root / 'detector.onnx'), options, providers=['CPUExecutionProvider'])

    @torch.inference_mode()
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
                rgb = np.asarray(image)
        except PhotoError:
            raise
        except (Image.DecompressionBombError, Image.DecompressionBombWarning):
            raise PhotoError('IMAGE_TOO_LARGE') from None
        except Exception:
            raise PhotoError('INVALID_IMAGE') from None
        del raw
        height, width = rgb.shape[:2]
        boxes, scores = self.detect(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
        if len(boxes) == 0:
            raise PhotoError('NO_FACE')
        if len(boxes) != 1:
            raise PhotoError('MULTIPLE_FACES')
        left, top, right, bottom = boxes[0]
        if min(right - left, bottom - top) < 90:
            raise PhotoError('LOW_RESOLUTION')
        # DECA TestData bbox convention. Detector is shared FaceBoxes, not FAN.
        old_size = (right - left + bottom - top) / 2
        center = [(right + left) / 2, (top + bottom) / 2 + old_size * .12]
        size = int(old_size * 1.25)
        src = np.array([[center[0] - size / 2, center[1] - size / 2],
                        [center[0] - size / 2, center[1] + size / 2],
                        [center[0] + size / 2, center[1] - size / 2]])
        crop = estimate_transform('similarity', src, np.array([[0, 0], [0, 223], [223, 0]]))
        pixels = warp(rgb / 255., crop.inverse, output_shape=(224, 224))
        inputs = torch.from_numpy(pixels.transpose(2, 0, 1).copy()).float()[None].to(self.device)
        code = self.coarse(inputs)
        shape, texture, expression, pose, camera, lighting = torch.split(code, [100, 50, 50, 6, 3, 27], dim=1)
        vertices, landmarks, _ = self.flame(shape_params=shape, expression_params=expression, pose_params=pose)
        detail = self.detail(inputs)
        displacement = self.generator(torch.cat([pose[:, 3:], expression, detail], dim=1))[0, 0].cpu().numpy() + self.fixed
        faces = self.flame.faces_tensor
        normals = self.util.vertex_normals(vertices, faces[None])
        dense, _, triangles = self.util.upsample_mesh(
            vertices[0].cpu().numpy(), normals[0].cpu().numpy(), faces.cpu().numpy(),
            displacement, np.zeros((256, 256, 3), dtype=np.float32), self.template)
        cam = camera[0].cpu().numpy()
        inverse_crop = np.linalg.inv(crop.params)
        projected = project_to_photo(dense, cam, inverse_crop)
        points = project_to_photo(landmarks[0].cpu().numpy(), cam, inverse_crop)
        rotation, _ = cv2.Rodrigues(pose[0, :3].cpu().numpy())
        yaw = math.degrees(math.asin(float(np.clip(-rotation[2, 0], -1, 1))))
        region = rgb[max(0, int(top)):min(height, int(bottom)), max(0, int(left)):min(width, int(right))]
        gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY)
        issues = []
        if gray.mean() < 45: issues.append('人脸区域偏暗')
        if gray.mean() > 220: issues.append('人脸区域偏亮')
        if cv2.Laplacian(gray, cv2.CV_64F).var() < 35: issues.append('照片可能模糊')
        if abs(yaw) > 25: issues.append('侧脸角度较大，比例仅供参考')
        if left < width * .02 or top < height * .02 or right > width * .98 or bottom > height * .98:
            issues.append('人脸接近照片边缘')
        if self.device == 'cuda': torch.cuda.synchronize()
        pitch = math.degrees(math.atan2(rotation[2, 1], rotation[2, 2]))
        thirds = estimate_thirds(rgb, points, yaw, pitch, issues)
        return {'engine': 'DECA', 'width': width, 'height': height, 'thirds': thirds,
                'vertices': np.round(projected, 3).tolist(),
                # Official save_obj inverts, then untextured write_obj reverses again:
                # net order equals the dense template. Photo Y is undone by viewer Y.
                'triangles': triangles.astype(int).tolist(),
                'landmarks': np.round(points, 3).tolist(), 'detectionScore': round(float(scores[0]), 4),
                'yaw': round(yaw, 2), 'qualityIssues': issues, 'device': self.device,
                'inferenceMs': round((time.perf_counter() - started) * 1000, 1)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--models', required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        with contextlib.redirect_stdout(sys.stderr):
            engine = DecaReconstructor(args.models)
    except Exception:
        emit({'id': 'ready', 'ok': False, 'code': 'MODEL_UNAVAILABLE'})
        return 1
    emit({'id': 'ready', 'ok': True, 'result': {'engine': 'DECA', 'device': engine.device}})
    if args.check: return 0
    for line in sys.stdin:
        request = result = identity = None
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
    sys.exit(main())
