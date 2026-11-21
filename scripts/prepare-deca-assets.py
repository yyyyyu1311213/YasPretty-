"""Import officially obtained model files; never requests account credentials."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / '.runtime/deca/models'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--flame', type=Path, help='Official FLAME2020.zip or generic_model.pkl')
    parser.add_argument('--checkpoint', type=Path, help='Official DECA deca_model.tar')
    parser.add_argument('--baseline', type=Path, default=ROOT / '.runtime/3ddfa/models')
    args = parser.parse_args()
    MODELS.mkdir(parents=True, exist_ok=True)
    if args.flame:
        source = args.flame.resolve(strict=True)
        target = MODELS / 'generic_model.pkl'
        if source.suffix.lower() == '.zip':
            with zipfile.ZipFile(source) as archive:
                entries = [entry for entry in archive.infolist() if Path(entry.filename).name == 'generic_model.pkl']
                if len(entries) != 1: raise ValueError('Expected exactly one generic_model.pkl in FLAME2020.zip')
                if entries[0].file_size > 1024 * 1024 * 1024: raise ValueError('Unexpected model size')
                with archive.open(entries[0]) as incoming, target.open('wb') as outgoing:
                    shutil.copyfileobj(incoming, outgoing)
        elif source.name == 'generic_model.pkl':
            if source != target: shutil.copyfile(source, target)
        else: raise ValueError('Use FLAME2020.zip or generic_model.pkl')
    if args.checkpoint and args.checkpoint.resolve() != MODELS / 'deca_model.tar':
        shutil.copyfile(args.checkpoint, MODELS / 'deca_model.tar')
    detector = args.baseline / 'detector.onnx'
    if detector.exists():
        baseline = json.loads((args.baseline / 'manifest.json').read_text(encoding='utf-8'))
        if hashlib.sha256(detector.read_bytes()).hexdigest() != baseline['sha256']['detector.onnx']:
            raise ValueError('Baseline detector checksum mismatch')
        shutil.copyfile(detector, MODELS / 'detector.onnx')
    names = ['generic_model.pkl', 'deca_model.tar', 'detector.onnx']
    missing = [name for name in names if not (MODELS / name).is_file()]
    if missing:
        print('Not ready. Missing: ' + ', '.join(missing))
        return 1
    manifest = {'engine': 'DECA', 'purpose': 'local-noncommercial-research',
                'sourceCommit': 'a11554ae2a2b0f3998cf1fa94dd4db03babb34a2',
                'flameSource': 'https://flame.is.tue.mpg.de/',
                'checkpointSource': 'https://drive.google.com/file/d/1rp8kdyLPvErw2dTmqtjISRVvQLj6Yzje/view',
                'sha256': {name: hashlib.sha256((MODELS / name).read_bytes()).hexdigest() for name in names}}
    target = MODELS / 'manifest.json'
    target.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    try:
        checked = subprocess.run([sys.executable, str(ROOT / 'server/face-reconstruction/deca-worker.py'),
                                  '--models', str(MODELS), '--check'], cwd=ROOT, timeout=120)
    except Exception:
        target.unlink(missing_ok=True)
        raise
    if checked.returncode != 0:
        target.unlink(missing_ok=True)
        print('Model initialization failed. DECA remains unavailable.')
        return 1
    print('Real DECA model initialization passed. Restart the comparison server.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
