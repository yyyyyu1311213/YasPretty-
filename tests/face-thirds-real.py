"""Local research regression, not an accuracy benchmark. Run setup-face-parsing.py --qa first."""
import base64
import io
import json
import os
from pathlib import Path
import sys
from urllib.request import Request, urlopen
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'server/face-reconstruction'))
from worker import Reconstructor
import hairline

fixtures = ROOT / '.qa/hairline'
with Image.open(fixtures / '1.jpg') as sample:
    cropped = io.BytesIO()
    sample.crop((0, int(sample.height * .30), sample.width, sample.height)).save(cropped, 'JPEG')

cases = [(name, (fixtures / (name + '.jpg')).read_bytes(), status)
         for name, status in [('1','estimated'),('1112','not_visible'),('1309','not_visible'),('1321','estimated')]]
cases.append(('cropped', cropped.getvalue(), 'reject'))
base = os.getenv('YAS_QA_FACE_API', 'http://127.0.0.1:8788/api/face-reconstruction')
for suffix in ['', '/deca']:
    for name, photo, status in cases:
        req = Request(base + suffix, data=photo, headers={'Content-Type':'application/octet-stream', 'X-Face-Consent':'local-research-v1'})
        with urlopen(req, timeout=70) as response:
            result = json.load(response)['result']
        thirds = result['thirds']
        assert thirds['status'] in ({'not_visible','pose_quality'} if status == 'reject' else {status}), (name, result['engine'], thirds)
        if status == 'estimated':
            assert abs(sum(thirds['shares'])-1) < .001
        else:
            assert 'shares' not in thirds

baseline = os.getenv('YAS_3DDFA_RUNTIME', str(ROOT / '.runtime/3ddfa'))
engine = Reconstructor(Path(baseline) / 'models')
hairline.MODEL = ROOT / '.qa/nonexistent-for-hairline-test.onnx'
hairline._session.cache_clear()
v = engine.reconstruct(base64.b64encode(cases[0][1]))
assert v['thirds'] == {'status':'unavailable'} and len(v['landmarks']) == 68
print('Both engines: visible samples estimated, hat/fringe/crop rejected; missing model preserves reconstruction.')
