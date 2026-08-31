from PIL import Image, ImageDraw
import math

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

def make_bg(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    top = (255, 154, 200)     # bright pink
    bottom = (255, 105, 180)  # hot pink
    for y in range(size):
        t = y / (size - 1)
        c = lerp(top, bottom, t)
        for x in range(size):
            px[x, y] = c
    return img

def draw_flower(draw, cx, cy, petal_r, core_r, petal_color, core_color, petals=5, rotate=-90):
    for i in range(petals):
        angle = math.radians(rotate + i * (360 / petals))
        dist = petal_r * 0.72
        px = cx + dist * math.cos(angle)
        py = cy + dist * math.sin(angle)
        bbox = [px - petal_r, py - petal_r, px + petal_r, py + petal_r]
        draw.ellipse(bbox, fill=petal_color)
    draw.ellipse([cx - core_r, cy - core_r, cx + core_r, cy + core_r], fill=core_color)

def make_icon(size, maskable, out_path):
    img = make_bg(size)
    draw = ImageDraw.Draw(img, "RGBA")
    cx = cy = size / 2

    scale = 0.30 if maskable else 0.37
    petal_r = size * scale * 0.62
    core_r = size * scale * 0.42

    # soft white halo behind flower for contrast
    halo_r = size * scale * 1.55
    draw.ellipse([cx - halo_r, cy - halo_r, cx + halo_r, cy + halo_r], fill=(255, 255, 255, 60))

    draw_flower(draw, cx, cy, petal_r, core_r, (255, 255, 255, 235), (255, 214, 92, 255))

    # little running streak / swoosh under the flower for the "running" theme
    swoosh_y = cy + size * scale * 1.35
    swoosh_w = size * scale * 1.7
    line_color = (255, 255, 255, 210)
    for i, dx in enumerate([-1, 0, 1]):
        y = swoosh_y + i * (size * 0.028)
        x0 = cx - swoosh_w/2 + i * (size * 0.05)
        x1 = cx + swoosh_w/2 - i * (size * 0.10)
        draw.line([(x0, y), (x1, y)], fill=line_color, width=max(2, int(size*0.018)))

    img.save(out_path, "PNG")

make_icon(512, False, "icon-512.png")
make_icon(192, False, "icon-192.png")
make_icon(512, True, "icon-512-maskable.png")
make_icon(192, True, "icon-192-maskable.png")
print("done")
