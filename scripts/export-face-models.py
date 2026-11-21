"""Convert verified upstream weights once; no photos, network or training involved."""
import hashlib
import importlib.util
import json
import pickle
from pathlib import Path

import numpy as np
import onnxruntime as ort
import torch

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / '.runtime' / '3ddfa'
SOURCE = RUNTIME / 'upstream'
OUTPUT = RUNTIME / 'models'


def module(name, relative):
    spec = importlib.util.spec_from_file_location(name, SOURCE / relative)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


def export(model, weights, shape, filename, outputs, dynamic=None):
    checkpoint = torch.load(SOURCE / weights, map_location='cpu', weights_only=True)
    state = checkpoint.get('state_dict', checkpoint)
    state = {k.removeprefix('module.').replace('fc_param.', 'fc.'): v for k, v in state.items()}
    # The release checkpoint also stores the training-only landmark head.
    state = {k: v for k, v in state.items() if k not in ('fc_lm.weight', 'fc_lm.bias')}
    model.load_state_dict(state, strict=True)
    model.eval()
    sample = torch.randn(*shape)
    destination = OUTPUT / filename
    torch.onnx.export(model, sample, str(destination), input_names=['input'], output_names=outputs,
                      dynamic_axes=dynamic, opset_version=17, dynamo=False)
    session = ort.InferenceSession(str(destination), providers=['CPUExecutionProvider'])
    with torch.inference_mode():
        reference = model(sample)
    reference = reference if isinstance(reference, tuple) else (reference,)
    actual = session.run(None, {'input': sample.numpy()})
    for expected, observed in zip(reference, actual):
        np.testing.assert_allclose(expected.numpy(), observed, rtol=1e-3, atol=1e-4)
    print(f'Export and PyTorch/ONNX parity passed: {filename}', flush=True)


def main():
    source = json.loads((RUNTIME / 'source.json').read_text(encoding='utf-8'))
    for entry in source['files']:
        if hashlib.sha256((SOURCE / entry['path']).read_bytes()).hexdigest() != entry['sha256']:
            raise RuntimeError('Upstream asset integrity check failed')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    torch.set_num_threads(2)
    mobilenet = module('yas_mobilenet', 'models/mobilenet_v1.py').mobilenet(num_classes=62)
    detector = module('yas_faceboxes', 'FaceBoxes/models/faceboxes.py').FaceBoxesNet(phase='test', size=None, num_classes=2)
    export(mobilenet, 'weights/mb1_120x120.pth', (1, 3, 120, 120), 'alignment.onnx', ['parameters'])
    export(detector, 'FaceBoxes/weights/FaceBoxesProd.pth', (1, 3, 720, 1080), 'detector.onnx', ['locations', 'scores'],
           {'input': {2: 'height', 3: 'width'}, 'locations': {1: 'anchors'}, 'scores': {1: 'anchors'}})
    # Only trusted, hash-verified upstream pickles are loaded during setup.
    with (SOURCE / 'configs/bfm_noneck_v3.pkl').open('rb') as handle:
        bfm = pickle.load(handle, encoding='latin1')
    with (SOURCE / 'configs/tri.pkl').open('rb') as handle:
        triangles = pickle.load(handle, encoding='latin1')
    with (SOURCE / 'configs/param_mean_std_62d_120x120.pkl').open('rb') as handle:
        normalization = pickle.load(handle, encoding='latin1')
    np.savez_compressed(OUTPUT / 'geometry.npz',
                        mean=bfm['u'].astype(np.float32), shape=bfm['w_shp'][:, :40].astype(np.float32),
                        expression=bfm['w_exp'][:, :10].astype(np.float32),
                        keypoints=bfm['keypoints'].astype(np.int64), triangles=triangles.T.astype(np.int32),
                        param_mean=normalization['mean'], param_std=normalization['std'])
    records = {name: hashlib.sha256((OUTPUT / name).read_bytes()).hexdigest()
               for name in ['alignment.onnx', 'detector.onnx', 'geometry.npz']}
    (OUTPUT / 'manifest.json').write_text(json.dumps({'engine': '3DDFA_V2', 'sourceCommit': source['commit'],
                                                    'purpose': 'local-academic-only', 'sha256': records}, indent=2), encoding='utf-8')
    print('Local research models prepared; BFM assets remain outside Git.')


if __name__ == '__main__':
    main()
