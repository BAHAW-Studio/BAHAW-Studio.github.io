"""
Generate BAHAW Studio embroidery designs — no box style
Matches KAPOY NA KO! design: tall condensed gold text, thin line, spaced BAHAW
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

DESIGNS = [
    {
        "filename": "estoryahe-design-nobox.png",
        "lines": ["ESTORYAHE!"],
    },
    {
        "filename": "etchos-design-nobox.png",
        "lines": ["ETCHOS!"],
    },
]

GOLD = (224, 168, 30)

CANVAS_W = 2400
CANVAS_H = 2800

CONDENSED_FONT_PATH = "/System/Library/Fonts/Supplemental/Impact.ttf"
BAHAW_FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf"


def make_design(config):
    img = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    main_font = ImageFont.truetype(CONDENSED_FONT_PATH, 380)
    bahaw_font = ImageFont.truetype(BAHAW_FONT_PATH, 70)

    # Measure main text lines
    line_metrics = []
    for line in config["lines"]:
        bbox = draw.textbbox((0, 0), line, font=main_font)
        line_metrics.append({
            "text": line,
            "w": bbox[2] - bbox[0],
            "h": bbox[3] - bbox[1],
            "top_offset": bbox[1],  # space above baseline
        })

    bahaw_text = "B A H A W"
    bb = draw.textbbox((0, 0), bahaw_text, font=bahaw_font)
    bahaw_w = bb[2] - bb[0]
    bahaw_h = bb[3] - bb[1]

    # Spacing
    line_gap = -10         # tight line spacing like KAPOY NA KO
    sep_gap = 50           # gap after last line before horizontal rule
    line_thickness = 3
    bahaw_gap = 30         # gap between rule and BAHAW

    # Calculate total height
    main_h = sum(m["h"] for m in line_metrics) + line_gap * (len(line_metrics) - 1)
    total_h = main_h + sep_gap + line_thickness + bahaw_gap + bahaw_h

    max_text_w = max(m["w"] for m in line_metrics)

    # Start Y centered
    y = (CANVAS_H - total_h) // 2

    # Draw main text — track actual bottom pixel
    actual_bottom = 0
    for i, m in enumerate(line_metrics):
        x = (CANVAS_W - m["w"]) // 2
        draw.text((x, y), m["text"], fill=GOLD, font=main_font)
        # Get actual rendered bottom
        rendered_bbox = draw.textbbox((x, y), m["text"], font=main_font)
        actual_bottom = max(actual_bottom, rendered_bbox[3])
        y += m["h"] + line_gap

    # Use actual bottom of rendered text, not calculated y
    y = actual_bottom + sep_gap

    # Horizontal line
    line_w = int(max_text_w * 0.7)
    lx1 = (CANVAS_W - line_w) // 2
    lx2 = lx1 + line_w
    draw.line([(lx1, y), (lx2, y)], fill=GOLD, width=line_thickness)
    y += line_thickness + bahaw_gap

    # BAHAW text — white
    bx = (CANVAS_W - bahaw_w) // 2
    draw.text((bx, y), bahaw_text, fill=(255, 255, 255), font=bahaw_font)

    # Trim + pad
    bbox_final = img.getbbox()
    if bbox_final:
        pad = 120
        bbox_final = (
            max(0, bbox_final[0] - pad),
            max(0, bbox_final[1] - pad),
            min(CANVAS_W, bbox_final[2] + pad),
            min(CANVAS_H, bbox_final[3] + pad),
        )
        img = img.crop(bbox_final)

    out_path = os.path.join(OUTPUT_DIR, config["filename"])
    img.save(out_path, "PNG")
    print(f"Saved: {out_path} ({img.size[0]}x{img.size[1]})")


def make_preview(config, bg_color, bg_name):
    design_path = os.path.join(OUTPUT_DIR, config["filename"])
    if not os.path.exists(design_path):
        return
    design = Image.open(design_path)
    preview = Image.new("RGB", (design.width + 200, design.height + 200), bg_color)
    px = (preview.width - design.width) // 2
    py = (preview.height - design.height) // 2
    preview.paste(design, (px, py), design)
    preview_name = config["filename"].replace(".png", f"-preview-{bg_name}.png")
    out = os.path.join(OUTPUT_DIR, preview_name)
    preview.save(out, "PNG")
    print(f"Preview: {out}")


if __name__ == "__main__":
    for d in DESIGNS:
        make_design(d)

    for d in DESIGNS:
        for color, name in [((255, 255, 255), "white"), ((34, 34, 34), "black"), ((27, 42, 74), "navy")]:
            make_preview(d, color, name)

    print("\nDone!")
