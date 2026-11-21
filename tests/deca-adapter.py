"""Dependency/projection checks, NOT a trained-model or likeness test."""
import importlib.util
from pathlib import Path
import sys
import tempfile

import numpy as np
import torch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'server/face-reconstruction'))
sys.path.insert(0, str(ROOT / '.runtime/deca/upstream'))
spec = importlib.util.spec_from_file_location('deca_worker', ROOT / 'server/face-reconstruction/deca-worker.py')
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)

# Known camera and crop: increasing FLAME Y moves UP the photograph, +Z remains
# toward the Three.js camera. XY and depth must use the SAME pixel scale.
inverse_crop = np.array([[2, 0, 100], [0, 2, 50], [0, 0, 1]], dtype=np.float32)
points = worker.project_to_photo([[0, 0, 0], [0, .1, .1]], np.array([2, .1, -.2]), inverse_crop)
np.testing.assert_allclose(points, [[368.8, 363.6, 0], [368.8, 318.8, 44.8]], atol=1e-4)

# Use official neutral topology only to test UV export orientation. This mesh
# is never returned by the API or shown to the user as reconstruction.
from decalib.utils import util
vertices, faces = [], []
for line in (ROOT / '.runtime/deca/upstream/data/head_template.obj').read_text().splitlines():
    parts = line.split()
    if not parts: continue
    if parts[0] == 'v': vertices.append([float(value) for value in parts[1:4]])
    if parts[0] == 'f': faces.append([int(value.split('/')[0]) - 1 for value in parts[1:4]])
vertices = np.asarray(vertices, dtype=np.float32)
faces = np.asarray(faces, dtype=np.int64)
normals = util.vertex_normals(torch.from_numpy(vertices)[None], torch.from_numpy(faces)[None])[0].numpy()
template = np.load(ROOT / '.runtime/deca/upstream/data/texture_data_256.npy', allow_pickle=True, encoding='latin1').item()
dense, _, dense_faces = util.upsample_mesh(vertices, normals, faces, np.zeros((256, 256)), np.zeros((256, 256, 3)), template)
assert dense.shape == (59315, 3) and np.isfinite(dense).all()
np.testing.assert_allclose(dense, (vertices[template['valid_pixel_3d_faces']] * template['valid_pixel_b_coords'][..., None]).sum(1), atol=1e-7)
assert dense_faces.shape == (117380, 3)
ordered = dense_faces.astype(int)
face_normals = np.cross(dense[ordered[:, 1]] - dense[ordered[:, 0]], dense[ordered[:, 2]] - dense[ordered[:, 0]])
expected = (normals[template['valid_pixel_3d_faces']] * template['valid_pixel_b_coords'][..., None]).sum(1)
dots = (face_normals * expected[ordered].mean(1)).sum(1)
assert np.mean(dots[np.abs(dots) > 1e-12] > 0) > .99, 'dense faces must face outward'
with tempfile.TemporaryDirectory() as export:
    target = Path(export) / 'mesh.obj'
    util.write_obj(str(target), dense, ordered, inverse_face_order=True)
    exported = [[int(value) - 1 for value in line.split()[1:]] for line in target.read_text().splitlines() if line.startswith('f ')]
    np.testing.assert_array_equal(exported, ordered)

# Missing trained/FLAME files must stop initialization before any random
# parameters can be returned as successful reconstruction.
with tempfile.TemporaryDirectory() as missing:
    try:
        worker.DecaReconstructor(missing)
        raise AssertionError('Incomplete models were accepted')
    except FileNotFoundError:
        pass

from decalib.models.encoders import ResnetEncoder
from decalib.models.decoders import Generator
from decalib.models.FLAME import FLAME
import chumpy

# Architecture compatibility only; no image and no predicted geometry.
coarse = ResnetEncoder(outsize=236)
detail = ResnetEncoder(outsize=128)
generator = Generator(latent_dim=181, out_channels=1)
assert coarse.layers[-1].out_features == 236
assert detail.layers[-1].out_features == 128
assert generator.l1[0].in_features == 181
print(f'Dependency, projection, UV interpolation and missing-model rejection passed. torch={torch.__version__}; CUDA={torch.cuda.is_available()}')
print('Real DECA initialization/inference/likeness NOT tested: licensed FLAME and checkpoint required.')
