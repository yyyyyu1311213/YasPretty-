from __future__ import annotations

import json
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "doodles" / "reference-cutouts"
OUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "catalog": Path(r"D:\Temp\codex-clipboard-3d9191ef-4c92-48db-a4cf-8a2ccb929eff.png"),
    "tools": Path(r"D:\Temp\codex-clipboard-cc9d913f-c56c-4130-b41b-b40d01cc754b.jpg"),
    "mood": Path(r"D:\Temp\codex-clipboard-73c9e911-c472-44a9-a44e-ca922312d6b1.png"),
    "ornaments": Path(r"D:\Temp\codex-clipboard-f5b59b6c-f12c-49d8-a7ae-821f12a4ac48.png"),
}

BOXES = {
    "catalog": [
        ("lipstick", (90, 53, 161, 143)),
        ("lip-liner", (178, 51, 278, 143)),
        ("lip-tint", (293, 52, 378, 143)),
        ("lips", (394, 53, 494, 143)),
        ("foundation", (88, 163, 163, 263)),
        ("powder", (181, 164, 275, 263)),
        ("brush", (297, 163, 376, 263)),
        ("base-swatch", (394, 172, 492, 257)),
        ("mascara", (88, 275, 164, 375)),
        ("eyeshadow", (181, 280, 276, 375)),
        ("eyeliner", (296, 274, 378, 376)),
        ("eye-look", (394, 280, 495, 373)),
        ("star", (87, 397, 174, 474)),
        ("flower", (180, 395, 280, 475)),
        ("heart", (297, 396, 382, 473)),
        ("y-logo", (402, 392, 497, 474)),
    ],
    "tools": [
        ("brush", (76, 48, 330, 377)),
        ("mirror", (362, 42, 704, 382)),
        ("powder-puff", (691, 42, 1003, 372)),
        ("blotting-paper", (64, 392, 323, 671)),
        ("eyelash-curler", (381, 388, 645, 680)),
        ("sponge", (701, 389, 1000, 681)),
        ("bottle", (83, 677, 288, 1017)),
        ("lipstick", (399, 675, 645, 1017)),
        ("perfume", (734, 678, 1011, 1017)),
    ],
    "mood": [
        ("rose", (58, 37, 313, 383)),
        ("branch", (382, 28, 650, 389)),
        ("coffee", (700, 40, 991, 365)),
        ("open-book", (30, 418, 350, 661)),
        ("ribbon", (360, 405, 694, 664)),
        ("candle", (735, 397, 1003, 686)),
        ("vase", (50, 671, 304, 1007)),
        ("window", (366, 672, 663, 1007)),
        ("scarf", (683, 680, 1012, 1016)),
    ],
    "ornaments": [
        ("sparkles", (53, 137, 223, 322)),
        ("heart", (287, 143, 472, 333)),
        ("bow", (523, 120, 758, 354)),
        ("pearl-necklace", (764, 126, 1008, 337)),
        ("brush-stroke", (25, 402, 265, 602)),
        ("swoosh", (270, 414, 510, 621)),
        ("blush-blobs", (523, 405, 751, 632)),
        ("powder-cloud", (766, 397, 1014, 638)),
        ("dots", (56, 662, 260, 863)),
        ("scribble", (264, 679, 520, 900)),
        ("flower", (526, 649, 789, 920)),
        ("rings", (765, 648, 1010, 916)),
    ],
}

# The supplied tool and mood sheets carry a pale watermark in the upper-left.
# These masks remove only the watermark area while keeping the nearby artwork.
MASKS = {
    "tools-brush": [(0, 0, 125, 135), (125, 0, 175, 58)],
    "mood-rose": [(0, 0, 108, 120), (108, 0, 176, 55)],
}


def median_background(image: Image.Image) -> tuple[float, float, float]:
    rgb = image.convert("RGB")
    pixels = []
    for x in range(rgb.width):
        pixels.extend((rgb.getpixel((x, 0)), rgb.getpixel((x, rgb.height - 1))))
    for y in range(1, rgb.height - 1):
        pixels.extend((rgb.getpixel((0, y)), rgb.getpixel((rgb.width - 1, y))))
    channels = list(zip(*pixels))
    return tuple(sorted(channel)[len(channel) // 2] for channel in channels)


def cutout(source: Image.Image, box: tuple[int, int, int, int], mask_rects: list[tuple[int, int, int, int]] | None = None) -> Image.Image:
    crop = source.crop(box).convert("RGBA")
    bg = median_background(source)
    alpha = Image.new("L", crop.size)
    source_rgb = crop.convert("RGB")
    pixels = []
    for pixel in source_rgb.getdata():
        distance = math.sqrt(sum((float(pixel[i]) - bg[i]) ** 2 for i in range(3)))
        value = max(0, min(255, int((distance - 4.0) * 9.0)))
        pixels.append(value)
    alpha.putdata(pixels)
    for rect in mask_rects or []:
        ImageDraw.Draw(alpha).rectangle(rect, fill=0)
    crop.putalpha(alpha)
    bbox = alpha.point(lambda value: 255 if value >= 8 else 0).getbbox()
    if bbox is None:
        bbox = (0, 0, crop.width, crop.height)
    padding = 14
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(crop.width, bbox[2] + padding)
    bottom = min(crop.height, bbox[3] + padding)
    return crop.crop((left, top, right, bottom))


def label_font(size: int):
    for candidate in (
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeui.ttf"),
    ):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


entries = []
for group, source_path in SOURCES.items():
    source = Image.open(source_path)
    for name, box in BOXES[group]:
        image = cutout(source, box, MASKS.get(f"{group}-{name}"))
        target = OUT / f"{group}-{name}.png"
        image.save(target, format="PNG", optimize=True)
        entries.append({
            "id": f"{group}-{name}",
            "file": target.relative_to(ROOT).as_posix(),
            "source": source_path.name,
            "crop": list(box),
            "width": image.width,
            "height": image.height,
            "channels": 4,
            "authorizationStatus": "pending-user-provided-reference",
        })


thumb_width = 180
thumb_height = 160
label_height = 30
columns = 4
rows = math.ceil(len(entries) / columns)
sheet = Image.new("RGBA", (columns * thumb_width, rows * (thumb_height + label_height)), (248, 243, 240, 255))
draw = ImageDraw.Draw(sheet)
font = label_font(13)
for index, entry in enumerate(entries):
    image = Image.open(ROOT / entry["file"]).convert("RGBA")
    image.thumbnail((thumb_width - 18, thumb_height - 18), Image.Resampling.LANCZOS)
    left = (index % columns) * thumb_width + (thumb_width - image.width) // 2
    top = (index // columns) * (thumb_height + label_height) + (thumb_height - image.height) // 2
    sheet.alpha_composite(image, (left, top))
    label = entry["id"]
    draw.text(((index % columns) * thumb_width + 8, (index // columns) * (thumb_height + label_height) + thumb_height + 7), label, fill=(91, 74, 67, 255), font=font)

sheet_path = OUT / "contact-sheet.png"
sheet.save(sheet_path, format="PNG", optimize=True)

cn_tz = timezone(timedelta(hours=8))
manifest = {
    "generatedAt": datetime.now(cn_tz).isoformat(),
    "folder": OUT.relative_to(ROOT).as_posix(),
    "sourceNote": "Cutouts made from four user-provided reference sheets. Source permission and reuse status remain pending.",
    "count": len(entries),
    "contactSheet": sheet_path.relative_to(ROOT).as_posix(),
    "assets": entries,
}
(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"count": len(entries), "folder": manifest["folder"], "contactSheet": manifest["contactSheet"]}, ensure_ascii=False, indent=2))
