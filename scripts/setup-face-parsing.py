"""Prepare optional model and, only with --qa, four local research test photos."""
import argparse
import hashlib
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
MODEL_URL = 'https://huggingface.co/jbrownkramer/face-parsing/resolve/4be031c61a22e801ab389ab9ccf954781772fd42/resnet18.onnx'
SHA256 = '0d9bd318e46987c3bdbfacae9e2c0f461cae1c6ac6ea6d43bbe541a91727e33f'
SAMPLES = 'https://raw.githubusercontent.com/yakhyo/face-parsing/4f0632b17a3e729a7871683aab7c89b6a595da9f/assets/images'


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--qa', action='store_true')
    qa = args.parse_args().qa
    model = ROOT / '.runtime/face-parsing/resnet18.onnx'
    if not model.exists() or hashlib.sha256(model.read_bytes()).hexdigest() != SHA256:
        with urlopen(MODEL_URL, timeout=90) as response:
            data = response.read(53_205_365)
        if hashlib.sha256(data).hexdigest() != SHA256:
            raise ValueError('Optional model digest mismatch')
        model.parent.mkdir(parents=True, exist_ok=True)
        model.write_bytes(data)
    if qa:
        directory = ROOT / '.qa/hairline'
        directory.mkdir(parents=True, exist_ok=True)
        for name in ('1', '1112', '1309', '1321'):
            destination = directory / (name + '.jpg')
            with urlopen(f'{SAMPLES}/{name}.jpg', timeout=30) as response:
                destination.write_bytes(response.read())
    print('Face parsing assets ready for local research.')


if __name__ == '__main__':
    main()
