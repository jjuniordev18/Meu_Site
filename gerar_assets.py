import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONTS = r"C:\Windows\Fonts"
SEGOE = FONTS + r"\segoeui.ttf"
SEGOE_BOLD = FONTS + r"\segoeuib.ttf"
GEORGIA_BOLD = FONTS + r"\georgiab.ttf"

DARK = (27, 30, 41, 255)
BLUE = (39, 121, 167, 255)
TEAL = (73, 197, 182, 255)


def draw_node_graphic(draw, cx, cy, size, line_w, node_r):
    half = size / 2
    corners = [(-half, -half), (half, -half), (-half, half), (half, half)]
    for dx, dy in corners:
        draw.line([(cx, cy), (cx + dx, cy + dy)], fill=BLUE, width=line_w)
    draw.ellipse(
        [cx - node_r, cy - node_r, cx + node_r, cy + node_r],
        fill=TEAL,
    )
    cr = max(2, int(node_r * 0.45))
    for dx, dy in corners:
        x, y = cx + dx, cy + dy
        draw.ellipse(
            [x - cr, y - cr, x + cr, y + cr],
            fill=DARK,
            outline=TEAL,
            width=max(1, int(node_r * 0.18)),
        )


def make_favicons():
    S = 8
    px = 64 * S
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = 14 * S
    draw.rounded_rectangle([0, 0, px - 1, px - 1], radius=radius, fill=DARK)
    lw = 2 * S
    draw.line([(32 * S, 32 * S), (12 * S, 16 * S)], fill=BLUE, width=lw)
    draw.line([(32 * S, 32 * S), (52 * S, 16 * S)], fill=BLUE, width=lw)
    draw.line([(32 * S, 32 * S), (16 * S, 48 * S)], fill=BLUE, width=lw)
    draw.line([(32 * S, 32 * S), (48 * S, 48 * S)], fill=BLUE, width=lw)
    r7 = 7 * S
    draw.ellipse(
        [32 * S - r7, 32 * S - r7, 32 * S + r7, 32 * S + r7],
        fill=TEAL,
    )
    r3 = 3 * S
    for cx, cy in [(12, 16), (52, 16), (16, 48), (48, 48)]:
        x, y = cx * S, cy * S
        draw.ellipse([x - r3, y - r3, x + r3, y + r3], fill=DARK, outline=TEAL, width=max(1, int(S * 0.4)))

    sizes = [(16, "favicon-16x16.png"), (32, "favicon-32x32.png"), (48, "favicon-48x48.png"), (180, "apple-touch-icon.png"), (192, "favicon-192x192.png")]
    for size, name in sizes:
        img.resize((size, size), Image.LANCZOS).convert("RGBA").save(name, "PNG")
    print("favicons ok")


def make_og_image():
    W, H = 1200, 630
    SS = 2
    W2, H2 = W * SS, H * SS

    bg = Image.open("edenmoon-earth-8463724_1920.webp").convert("RGB")
    scale = W2 / bg.width
    bg = bg.resize((W2, int(bg.height * scale)), Image.LANCZOS)
    top = (bg.height - H2) // 2
    bg = bg.crop((0, top, W2, top + H2))

    overlay = Image.new("RGB", (W2, H2), DARK)
    bg = Image.blend(bg, overlay, 0.78)
    # subtle left-to-right darkening for text legibility
    grad = Image.new("L", (W2, H2), 0)
    gd = ImageDraw.Draw(grad)
    for x in range(W2):
        t = min(1.0, x / (W2 * 0.75))
        v = int(120 * t)
        gd.line([(x, 0), (x, H2)], fill=v)
    dark = Image.new("RGB", (W2, H2), (0, 0, 0))
    bg = Image.composite(dark, bg, grad)
    bg = bg.filter(ImageFilter.GaussianBlur(SS * 0.4))

    draw = ImageDraw.Draw(bg)
    label_f = ImageFont.truetype(SEGOE, 22 * SS)
    head_f = ImageFont.truetype(SEGOE_BOLD, 66 * SS)
    sub_f = ImageFont.truetype(SEGOE, 26 * SS)

    margin = 90 * SS
    # node motif
    draw_node_graphic(draw, margin + 26 * SS, 150 * SS, 34 * SS, 4 * SS, 7 * SS)
    draw.line([(margin + 26 * SS, 150 * SS), (margin + 60 * SS, 150 * SS)], fill=TEAL, width=3 * SS)

    # label
    label = "JOSUÉ M. GOMES JR"
    lw = 0
    ls = 6 * SS
    for ch in label:
        lw += draw.textlength(ch, font=label_f) + ls
    lw -= ls
    lx = margin + 70 * SS
    ly = 132 * SS
    for ch in label:
        draw.text((lx, ly), ch, font=label_f, fill=TEAL)
        lx += draw.textlength(ch, font=label_f) + ls

    # headline
    head = "Redes que não"
    head2 = "podem falhar."
    draw.text((margin, 190 * SS), head, font=head_f, fill=(255, 255, 255, 255))
    draw.text((margin, 265 * SS), head2, font=head_f, fill=TEAL)

    # subline
    sub = "Telecom & Engenharia de Software · 20+ anos em ambientes críticos"
    draw.text((margin, 385 * SS), sub, font=sub_f, fill=(214, 221, 231, 255))

    # bottom brand
    brand_f = ImageFont.truetype(SEGOE_BOLD, 24 * SS)
    draw.text((margin, H2 - 80 * SS), "jjunior.dev", font=brand_f, fill=(255, 255, 255, 255))
    dot = "."
    dw = draw.textlength("jjunior.dev", font=brand_f) - draw.textlength("dev", font=brand_f)
    draw.text((margin + dw, H2 - 80 * SS), dot, font=brand_f, fill=TEAL)

    bg = bg.resize((W, H), Image.LANCZOS)
    bg.save("og-image.png", "PNG")
    bg.save("og-image.jpg", "JPEG", quality=90)
    print("og-image ok")


make_favicons()
make_og_image()
