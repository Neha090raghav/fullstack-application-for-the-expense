#!/usr/bin/env python3
"""Build a native PowerPoint deck (editable shapes/text, not screenshots)."""

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import nsmap, qn
from pptx.util import Emu, Inches, Pt
from lxml import etree
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "AI-Incident-Copilot-Airport-Middleware.pptx"

# Widescreen 16:9
SW, SH = Inches(13.333), Inches(7.5)

NAVY = RGBColor(0x1F, 0x4E, 0x79)
NAVY_DARK = RGBColor(0x15, 0x36, 0x54)
BLUE = RGBColor(0x2E, 0x75, 0xB6)
BLUE_LT = RGBColor(0xDE, 0xEB, 0xF7)
BLUE_MID = RGBColor(0xB4, 0xC7, 0xE7)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x2F, 0x2F, 0x2F)
GRAY = RGBColor(0x59, 0x59, 0x59)
GRAY_LT = RGBColor(0xF2, 0xF2, 0xF2)
LINE = RGBColor(0xBF, 0xBF, 0xBF)
ORANGE = RGBColor(0xC6, 0x59, 0x11)
ORANGE_LT = RGBColor(0xFD, 0xE9, 0xD9)
GREEN = RGBColor(0x37, 0x5E, 0x37)
GREEN_LT = RGBColor(0xE2, 0xEF, 0xDA)
RED = RGBColor(0xC0, 0x00, 0x00)
RED_LT = RGBColor(0xFD, 0xE2, 0xE2)
FONT = "Calibri"


def _no_line(shape):
    shape.line.fill.background()


def _fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def _line(shape, color, pt=0.75):
    shape.line.color.rgb = color
    shape.line.width = Pt(pt)


def _set_anchor(shape, anchor=MSO_ANCHOR.MIDDLE):
    shape.text_frame.word_wrap = True
    try:
        shape.text_frame.auto_size = None
    except Exception:
        pass
    shape.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
    tf = shape.text_frame._txBody
    bodyPr = tf.find(qn("a:bodyPr"))
    if bodyPr is not None:
        bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])


def add_shape(slide, stype, l, t, w, h, fill=WHITE, line=LINE, line_pt=0.75):
    shp = slide.shapes.add_shape(stype, l, t, w, h)
    _fill(shp, fill)
    if line is None:
        _no_line(shp)
    else:
        _line(shp, line, line_pt)
    shp.shadow.inherit = False
    return shp


def add_tb(slide, l, t, w, h, text, size=14, bold=False, color=BLACK,
           align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=FONT):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.alignment = align
    p.space_before = Pt(0)
    p.space_after = Pt(0)
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font
    bodyPr = tf._txBody.find(qn("a:bodyPr"))
    if bodyPr is not None:
        bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])
    return box


def write_shape(shape, lines, size=13, bold=False, color=BLACK, align=PP_ALIGN.CENTER,
                anchor=MSO_ANCHOR.MIDDLE, font=FONT):
    """lines: str or list of (text, size, bold, color)."""
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.auto_size = None
    if isinstance(lines, str):
        lines = [(lines, size, bold, color)]
    for i, item in enumerate(lines):
        text, sz, b, col = item if isinstance(item, tuple) else (item, size, bold, color)
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_before = Pt(0)
        p.space_after = Pt(2 if i < len(lines) - 1 else 0)
        run = p.add_run()
        run.text = text
        run.font.size = Pt(sz)
        run.font.bold = b
        run.font.color.rgb = col
        run.font.name = font
    bodyPr = tf._txBody.find(qn("a:bodyPr"))
    if bodyPr is not None:
        bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])
    tf.margin_left = Inches(0.08)
    tf.margin_right = Inches(0.08)
    tf.margin_top = Inches(0.04)
    tf.margin_bottom = Inches(0.04)


def write_bullets(shape, items, size=13, color=BLACK, bold_first=False):
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.level = 0
        p.space_before = Pt(3)
        p.space_after = Pt(3)
        pPr = p._p.get_or_add_pPr()
        buFont = etree.SubElement(pPr, qn("a:buFont"))
        buFont.set("typeface", "Arial")
        buChar = etree.SubElement(pPr, qn("a:buChar"))
        buChar.set("char", "•")
        run = p.add_run()
        run.text = item
        run.font.size = Pt(size)
        run.font.bold = bold_first and i == 0
        run.font.color.rgb = color
        run.font.name = FONT
    tf.margin_left = Inches(0.12)
    tf.margin_right = Inches(0.08)


def chrome(slide, title, page, total=5, show_title=True):
    """Top bar, SOURCE INTEGRATE stamp, footer — on every slide."""
    add_shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, SW, Inches(0.42), NAVY, None)
    add_tb(slide, Inches(0.35), Inches(0.05), Inches(7.4), Inches(0.32),
           "Airport Technology  |  Internal Proposal", 12, False, WHITE, PP_ALIGN.LEFT, MSO_ANCHOR.MIDDLE)
    # Top-right corner label on every slide
    add_tb(slide, Inches(8.85), Inches(0.05), Inches(4.15), Inches(0.32),
           "SOURCE INTEGRATE", 13, True, WHITE, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE)

    if show_title:
        add_tb(slide, Inches(0.4), Inches(0.55), Inches(12.5), Inches(0.42),
               title, 26, True, NAVY, PP_ALIGN.LEFT, MSO_ANCHOR.MIDDLE)
        add_shape(slide, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(0.98),
                  Inches(2.1), Inches(0.045), BLUE, None)

    add_shape(slide, MSO_SHAPE.RECTANGLE, 0, Inches(7.22), SW, Inches(0.28), GRAY_LT, None)
    add_tb(slide, Inches(0.4), Inches(7.22), Inches(8.5), Inches(0.28),
           "Confidential  |  Human-in-the-loop concept  |  Not an implemented system",
           10, False, GRAY, PP_ALIGN.LEFT, MSO_ANCHOR.MIDDLE)
    add_tb(slide, Inches(10.4), Inches(7.22), Inches(2.5), Inches(0.28),
           f"Slide {page} of {total}", 10, False, GRAY, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE)


def arrow_right(slide, l, t, w=Inches(0.28), h=Inches(0.22)):
    shp = add_shape(slide, MSO_SHAPE.RIGHT_ARROW, l, t, w, h, BLUE, None)
    return shp


def arrow_down(slide, l, t, w=Inches(0.22), h=Inches(0.22)):
    return add_shape(slide, MSO_SHAPE.DOWN_ARROW, l, t, w, h, BLUE, None)


def box(slide, l, t, w, h, title, subtitle=None, fill=WHITE, title_size=13, title_color=NAVY):
    shp = add_shape(slide, MSO_SHAPE.RECTANGLE, l, t, w, h, fill, LINE, 1)
    if subtitle:
        write_shape(shp, [
            (title, title_size, True, title_color),
            (subtitle, 11, False, GRAY),
        ], align=PP_ALIGN.CENTER)
    else:
        write_shape(shp, title, title_size, True, title_color, PP_ALIGN.CENTER)
    return shp


def chevron_row(slide, items, top, left=Inches(0.4), width=Inches(12.5), height=Inches(0.72), fills=None):
    n = len(items)
    gap = Inches(0.06)
    w = int((width - gap * (n - 1)) / n)
    shapes = []
    for i, text in enumerate(items):
        x = left + i * (w + gap)
        stype = MSO_SHAPE.CHEVRON if i < n - 1 else MSO_SHAPE.RECTANGLE
        fill = (fills[i] if fills else BLUE_LT)
        shp = add_shape(slide, stype, x, top, w, height, fill, BLUE, 1)
        if stype == MSO_SHAPE.CHEVRON:
            shp.adjustments[0] = 0.16
            shp.text_frame.margin_right = Inches(0.22)
        write_shape(shp, text, 12, True, NAVY, PP_ALIGN.CENTER)
        shapes.append(shp)
    return shapes


# ---------------------------------------------------------------------------
# Slides
# ---------------------------------------------------------------------------

def slide_1(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    chrome(s, "", 1, show_title=False)

    add_tb(s, Inches(0.7), Inches(1.55), Inches(11.9), Inches(0.32),
           "Proposed concept for middleware operations", 14, False, BLUE,
           PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)

    add_tb(s, Inches(0.7), Inches(1.95), Inches(11.9), Inches(1.15),
           "AI Incident Copilot for Airport Middleware", 36, True, NAVY,
           PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)

    add_tb(s, Inches(1.4), Inches(3.15), Inches(10.5), Inches(0.4),
           "From incident detection to intelligent investigation and recommendation",
           18, False, GRAY, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)

    add_shape(s, MSO_SHAPE.RECTANGLE, Inches(5.4), Inches(3.6), Inches(2.5), Inches(0.04), BLUE, None)

    # Three-step flow
    y, h = Inches(4.15), Inches(1.35)
    w = Inches(2.9)
    xs = [Inches(1.55), Inches(5.2), Inches(8.85)]
    fills = [ORANGE_LT, BLUE_LT, GREEN_LT]
    titles = ["Alert", "AI Analysis", "Engineer"]
    subs = ["Incident detected", "Correlate and recommend", "Validate and act"]
    tcols = [ORANGE, NAVY, GREEN]
    for x, fill, title, sub, tc in zip(xs, fills, titles, subs, tcols):
        box(s, x, y, w, h, title, sub, fill, 18, tc)
    arrow_right(s, Inches(4.55), Inches(4.7), Inches(0.5), Inches(0.28))
    arrow_right(s, Inches(8.2), Inches(4.7), Inches(0.5), Inches(0.28))

    add_tb(s, Inches(0.7), Inches(5.75), Inches(11.9), Inches(0.4),
           "AI recommends.  The engineer decides.  No autonomous production changes.",
           14, False, GRAY, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)


def slide_2(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    chrome(s, "The Current Incident Investigation Process", 2)

    add_tb(s, Inches(0.4), Inches(1.15), Inches(12.5), Inches(0.28),
           "Today the engineer stitches this together by hand:", 14, False, GRAY)

    chevron_row(s, [
        "1  Incident alert",
        "2  Engineer starts investigation",
        "3  Check MQ",
        "4  Check ACE",
    ], Inches(1.5))

    chevron_row(s, [
        "5  Check logs",
        "6  Review previous incidents",
        "7  Identify pattern",
        "8  Decide what to do",
    ], Inches(2.38))

    # Key message
    msg = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(3.35),
                    Inches(12.5), Inches(0.7), BLUE_LT, BLUE, 1)
    write_shape(msg, [
        ("The required information is available, but engineers must manually connect the dots across multiple sources.",
         16, True, NAVY),
    ], align=PP_ALIGN.LEFT)
    msg.text_frame.margin_left = Inches(0.22)

    # Two distinction boxes
    left = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(4.25),
                     Inches(6.05), Inches(2.65), WHITE, LINE, 1)
    right = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(6.85), Inches(4.25),
                      Inches(6.05), Inches(2.65), WHITE, LINE, 1)

    head_l = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(4.25),
                       Inches(6.05), Inches(0.42), NAVY, None)
    write_shape(head_l, "AIP Sentinel  (existing)", 14, True, WHITE)
    add_tb(s, Inches(0.6), Inches(4.8), Inches(5.65), Inches(1.85),
           "Detection and alerting.\n\nTells the team that something is wrong so investigation can start.",
           15, False, BLACK, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)

    head_r = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(6.85), Inches(4.25),
                       Inches(6.05), Inches(0.42), BLUE, None)
    write_shape(head_r, "AI Incident Copilot  (proposed addition)", 14, True, WHITE)
    add_tb(s, Inches(7.05), Inches(4.8), Inches(5.65), Inches(1.85),
           "Investigation intelligence layer.\n\nDoes not replace Sentinel.  Prepares the investigation so the engineer can decide faster.",
           15, False, BLACK, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)


def slide_3(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    chrome(s, "AI Incident Copilot", 3)

    add_tb(s, Inches(0.4), Inches(1.12), Inches(12.5), Inches(0.28),
           "Inputs the Copilot would use", 13, True, GRAY)

    sources = [
        "Incident\nalert",
        "IBM MQ\ndata",
        "IBM ACE\nlogs",
        "Application\nlogs",
        "Historical\nincidents",
        "Knowledge /\nrunbooks",
    ]
    w, h = Inches(1.9), Inches(0.85)
    gap = Inches(0.18)
    left0 = Inches(0.4)
    for i, label in enumerate(sources):
        x = left0 + i * (w + gap)
        shp = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(1.45), w, h, GRAY_LT, LINE, 1)
        lines = [(a, 12, True, NAVY) for a in label.split("\n")]
        write_shape(shp, lines, align=PP_ALIGN.CENTER)

    arrow_down(s, Inches(6.45), Inches(2.38), Inches(0.28), Inches(0.22))

    band = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(2.68),
                     Inches(12.5), Inches(1.85), BLUE_LT, BLUE, 1)
    add_tb(s, Inches(0.55), Inches(2.75), Inches(12.2), Inches(0.32),
           "AI Incident Copilot   —   proposed intelligence layer", 16, True, NAVY)

    caps = [
        ("1", "Analyze"),
        ("2", "Correlate"),
        ("3", "Find patterns"),
        ("4", "Recommend"),
    ]
    cw = Inches(2.85)
    for i, (n, name) in enumerate(caps):
        x = Inches(0.7) + i * (cw + Inches(0.18))
        shp = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(3.18), cw, Inches(1.12), WHITE, BLUE, 1)
        write_shape(shp, [
            (n, 11, True, BLUE),
            (name, 16, True, NAVY),
        ])

    arrow_down(s, Inches(6.45), Inches(4.6), Inches(0.28), Inches(0.22))

    v = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(4.9),
                  Inches(6.05), Inches(1.05), GREEN_LT, GREEN, 1)
    write_shape(v, [
        ("Engineer validation", 16, True, GREEN),
        ("Review findings, confirm likely cause, choose the action", 12, False, BLACK),
    ])
    arrow_right(s, Inches(6.55), Inches(5.28), Inches(0.38), Inches(0.24))
    a = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(7.05), Inches(4.9),
                  Inches(5.85), Inches(1.05), WHITE, LINE, 1)
    write_shape(a, [
        ("Action / resolution", 16, True, NAVY),
        ("Engineer executes the change — not the AI", 12, False, BLACK),
    ])

    note = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(6.15),
                     Inches(12.5), Inches(0.85), WHITE, NAVY, 1.25)
    write_shape(note, [
        ("The Copilot does not replace the engineer.", 15, True, NAVY),
        ("It reduces investigation effort and helps the engineer reach the right decision faster.", 14, False, BLACK),
    ], align=PP_ALIGN.LEFT)
    note.text_frame.margin_left = Inches(0.22)


def slide_4(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    chrome(s, "Example: AODB Incident Investigation", 4)

    add_tb(s, Inches(0.4), Inches(1.12), Inches(12.5), Inches(0.26),
           "Illustrative path  (generic example)", 13, True, GRAY)

    steps = [
        (WHITE, NAVY, "AODB"),
        (WHITE, NAVY, "FLTU / RNUP\nmessage"),
        (WHITE, NAVY, "IBM MQ"),
        (WHITE, NAVY, "IBM ACE"),
        (RED_LT, RED, "Processing\nerror"),
    ]
    w = Inches(2.05)
    for i, (fill, col, label) in enumerate(steps):
        x = Inches(0.4) + i * Inches(2.5)
        shp = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(1.42), w, Inches(0.85), fill, col if fill == RED_LT else LINE, 1)
        lines = [(a, 13, True, col) for a in label.split("\n")]
        write_shape(shp, lines)
        if i < 4:
            arrow_right(s, x + w + Inches(0.08), Inches(1.7), Inches(0.3), Inches(0.22))

    # Copilot output
    add_tb(s, Inches(0.4), Inches(2.42), Inches(12.5), Inches(0.28),
           "What the Copilot could produce for the engineer", 13, True, GRAY)

    cards = [
        ("Incident", "AODB FLTU/RNUP processing failure", ORANGE, ORANGE_LT),
        ("Correlation", "Message reached MQ successfully. Failure occurred during downstream processing.", BLUE, BLUE_LT),
        ("Pattern", "Similar incidents were previously associated with the ACE processing layer.", NAVY, GRAY_LT),
        ("Recommendation", None, BLUE, WHITE),
    ]
    recs = [
        "Check ACE application logs",
        "Validate message payload",
        "Check affected integration flow",
        "Compare with similar historical incidents",
    ]
    cw = Inches(3.0)
    for i, (title, body, accent, fill) in enumerate(cards):
        x = Inches(0.4) + i * Inches(3.2)
        shp = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(2.75), cw, Inches(2.35), fill, accent, 1)
        bar = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(2.75), cw, Inches(0.32), accent, None)
        write_shape(bar, title, 12, True, WHITE)
        if body:
            add_tb(s, x + Inches(0.12), Inches(3.18), cw - Inches(0.24), Inches(1.75),
                   body, 13, False, BLACK, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)
        else:
            rec_box = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(3.07), cw, Inches(2.03), WHITE, None)
            rec_box.line.fill.background()
            write_bullets(rec_box, recs, 12)

    # Comparison
    l = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(5.28),
                  Inches(6.05), Inches(1.7), GRAY_LT, LINE, 1)
    r = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(6.85), Inches(5.28),
                  Inches(6.05), Inches(1.7), BLUE_LT, BLUE, 1)
    add_tb(s, Inches(0.55), Inches(5.38), Inches(5.75), Inches(0.28),
           "AIP Sentinel", 13, True, GRAY)
    add_tb(s, Inches(0.55), Inches(5.7), Inches(5.75), Inches(1.05),
           "“Something is wrong.”\nDetection and alerting — the starting point.",
           15, True, NAVY)
    add_tb(s, Inches(7.0), Inches(5.38), Inches(5.75), Inches(0.28),
           "AI Incident Copilot", 13, True, NAVY)
    add_tb(s, Inches(7.0), Inches(5.7), Inches(5.75), Inches(1.05),
           "“What happened, what is related, what pattern do we see, and what should the engineer investigate next?”",
           15, True, NAVY)


def slide_5(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    chrome(s, "Future Vision", 5)

    add_tb(s, Inches(0.4), Inches(1.12), Inches(12.5), Inches(0.28),
           "A staged path — engineer remains in control at every phase", 14, False, GRAY)

    phases = [
        ("Phase 1", "Assist", "AI analyzes incidents and recommends next steps."),
        ("Phase 2", "Learn", "Use engineer feedback and resolved incidents to improve recommendations."),
        ("Phase 3", "Predict", "Identify recurring patterns and possible risks earlier."),
        ("Phase 4", "Controlled automation", "Potential automation only for approved, low-risk actions, with proper validation."),
    ]
    w = Inches(2.95)
    for i, (ph, name, desc) in enumerate(phases):
        x = Inches(0.4) + i * Inches(3.2)
        # progress bar thickness grows
        add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(1.5), w, Inches(0.08), BLUE if i < 3 else NAVY, None)
        card = add_shape(s, MSO_SHAPE.RECTANGLE, x, Inches(1.58), w, Inches(2.55), WHITE, LINE, 1)
        add_tb(s, x + Inches(0.12), Inches(1.7), w - Inches(0.24), Inches(0.28),
               ph.upper(), 11, True, BLUE)
        add_tb(s, x + Inches(0.12), Inches(2.0), w - Inches(0.24), Inches(0.7),
               name, 18, True, NAVY)
        add_tb(s, x + Inches(0.12), Inches(2.7), w - Inches(0.24), Inches(1.2),
               desc, 13, False, BLACK)
        if i < 3:
            arrow_right(s, x + w + Inches(0.04), Inches(2.7), Inches(0.22), Inches(0.18))

    benefit = add_shape(s, MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(4.35),
                        Inches(12.5), Inches(0.95), BLUE_LT, BLUE, 1)
    write_shape(benefit, [
        ("Key benefit", 12, True, BLUE),
        ("Reduce incident investigation time while keeping the engineer in control.", 18, True, NAVY),
    ], align=PP_ALIGN.LEFT)
    benefit.text_frame.margin_left = Inches(0.25)

    add_shape(s, MSO_SHAPE.RECTANGLE, Inches(5.15), Inches(5.5), Inches(3.0), Inches(0.04), LINE, None)
    add_tb(s, Inches(0.4), Inches(5.65), Inches(12.5), Inches(0.55),
           "Thank You", 32, True, NAVY, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    add_tb(s, Inches(0.4), Inches(6.2), Inches(12.5), Inches(0.35),
           "Questions and discussion welcome", 14, False, GRAY, PP_ALIGN.CENTER)


def build():
    prs = Presentation()
    prs.slide_width = SW
    prs.slide_height = SH
    # blank layout
    slide_1(prs)
    slide_2(prs)
    slide_3(prs)
    slide_4(prs)
    slide_5(prs)
    prs.save(OUT)
    print("wrote", OUT)
    return OUT


if __name__ == "__main__":
    build()
