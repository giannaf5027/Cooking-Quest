"""
Cuts Gianna's sprite sheets in components/game-assets into the files the games use.

The art has a faint see-through haze around every sprite that shows up as a gray
halo, so pixels with very low alpha get cleared first. Then each sprite is found
as its own blob of pixels instead of using a fixed grid, since the rows aren't
evenly spaced. The output is one cleaned webp per sheet plus atlas.json, which
has the box for every sprite.

Each theme's background.png is a 3x3 grid of kitchen scenes. Those get cut apart
at the dark lines between them into public/game/<theme>/scenes/<scene>.webp.

Run it again after changing the art:  python3 scripts/slice_sprites.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path("components/game-assets")
OUT = Path("public/game")
ALPHA_CUT = 40      # below this the pixel is treated as background haze
MIN_AREA = 500      # ignore specks
SCALE = 0.75        # sheets render at <=140px; 0.75 keeps that near 1:1
QUALITY = 86        # the art is smoothly shaded, so webp beats png ~4x

THEMES = ["blue", "green", "orange", "purple", "red", "yellow", "pink", "black"]
SHEETS = ["cookware1", "cookware2", "ingredients1"]

# Pink ingredients have a heavier haze that glues sprites together, so they need
# a harder cut or the frame numbers stop matching the other themes.
ALPHA_CUT_FOR = {"pink/ingredients1": 120}

# The scenes in background.png, in reading order.
SCENES = ["board", "bowl", "pot", "skillet", "oven", "plate", "sink", "fridge", "pantry"]
SCENE_INSET = 2  # px trimmed inside each panel so no gutter line shows


def frames_for(img: Image.Image, alpha_cut: int = ALPHA_CUT):
    """Return sprite rects in reading order."""
    a = np.asarray(img).copy()
    a[..., 3][a[..., 3] < alpha_cut] = 0
    mask = a[..., 3] > 0

    lab, _ = ndimage.label(mask)
    boxes = []
    for sl in ndimage.find_objects(lab):
        y, x = sl
        if mask[sl].sum() < MIN_AREA:
            continue
        boxes.append([int(x.start), int(y.start), int(x.stop - x.start), int(y.stop - y.start)])

    # Group into rows by vertical overlap, then left-to-right within each row.
    boxes.sort(key=lambda b: b[1])
    median_h = int(np.median([b[3] for b in boxes])) if boxes else 1
    rows, current, row_top = [], [], None
    for b in boxes:
        if row_top is None or b[1] - row_top < median_h * 0.6:
            current.append(b)
            row_top = b[1] if row_top is None else row_top
        else:
            rows.append(sorted(current, key=lambda c: c[0]))
            current, row_top = [b], b[1]
    if current:
        rows.append(sorted(current, key=lambda c: c[0]))

    return [b for row in rows for b in row], Image.fromarray(a)


def panel_spans(profile, parts=3):
    """Pixel ranges of `parts` panels along one axis, split at the dark gutters."""
    dark = profile < np.median(profile) * 0.45
    n = len(profile)
    start = 0
    while start < n and dark[start]:  # outer frame
        start += 1
    spans = []
    for k in range(1, parts):
        guess = round(n * k / parts)
        lo = guess - 30
        center = lo + int(np.argmin(profile[lo : guess + 30]))
        left = right = center
        while left > 0 and dark[left - 1]:
            left -= 1
        while right < n - 1 and dark[right + 1]:
            right += 1
        spans.append((start, left))
        start = right + 1
    end = n
    while end > start and dark[end - 1]:
        end -= 1
    spans.append((start, end))
    return spans


def split_scenes(img: Image.Image):
    """Yield the 3x3 scenes of a background sheet in reading order."""
    lum = np.asarray(img.convert("L"), dtype=float)
    cols = panel_spans(lum.mean(axis=0))
    rows = panel_spans(lum.mean(axis=1))
    for top, bottom in rows:
        for left, right in cols:
            yield img.crop((left + SCENE_INSET, top + SCENE_INSET, right - SCENE_INSET, bottom - SCENE_INSET))


def main():
    atlas = {}
    OUT.mkdir(parents=True, exist_ok=True)

    jobs = [(f"{t}/{s}", SRC / t / f"{s}.png") for t in THEMES for s in SHEETS]

    for key, path in jobs:
        img = Image.open(path).convert("RGBA")
        rects, cleaned = frames_for(img, ALPHA_CUT_FOR.get(key, ALPHA_CUT))
        if SCALE != 1.0:
            cleaned = cleaned.resize(
                (round(cleaned.width * SCALE), round(cleaned.height * SCALE)), Image.LANCZOS
            )
            rects = [[round(v * SCALE) for v in r] for r in rects]

        dest = OUT / f"{key}.webp"
        dest.parent.mkdir(parents=True, exist_ok=True)
        cleaned.save(dest, "WEBP", quality=QUALITY, method=6)
        atlas[key] = {
            "src": f"/game/{key}.webp",
            "w": cleaned.width,
            "h": cleaned.height,
            "frames": rects,
        }
        print(f"  {key:24} {len(rects):3} frames")

    (OUT / "atlas.json").write_text(json.dumps(atlas, separators=(",", ":")))
    print(f"\natlas.json written: {len(atlas)} sheets, {sum(len(v['frames']) for v in atlas.values())} frames")

    for theme in THEMES:
        path = SRC / theme / "background.png"
        if not path.exists():
            continue
        scenes = list(split_scenes(Image.open(path).convert("RGB")))
        for name, scene in zip(SCENES, scenes):
            dest = OUT / theme / "scenes" / f"{name}.webp"
            dest.parent.mkdir(parents=True, exist_ok=True)
            scene.save(dest, "WEBP", quality=QUALITY, method=6)
        print(f"  {theme + '/scenes':24} {len(scenes)} scenes, {scenes[0].width}x{scenes[0].height}")


if __name__ == "__main__":
    main()
