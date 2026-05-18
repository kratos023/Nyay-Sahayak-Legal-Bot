# utils/legal_templates.py
import os
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# ── Font helper ───────────────────────────────────────────────────────────────
def _font(lang: str, bold: bool = False) -> str:
    """Return the best ReportLab font name for the given language."""
    try:
        from utils.font_setup import get_font_for_lang
        base = get_font_for_lang(lang)
    except Exception:
        base = "Helvetica"
    if base == "Helvetica":
        return "Helvetica-Bold" if bold else "Helvetica"
    return base   # NotoSans fonts have no bold variant bundled; use same font


# ── Shared helpers ────────────────────────────────────────────────────────────
def safe_int(value, default=0) -> int:
    try:
        if value in (None, "", "None", "null"):
            return default
        return int(str(value).strip().replace(",", "").replace("\u20b9", "").replace("Rs.", ""))
    except (ValueError, TypeError):
        return default


def clean_text(text):
    if not text:
        return ""
    text = str(text)
    bad = '■□▪▫▬▭▮▯▰▱▲△▴▵▶▷█▓▒░'
    for c in bad:
        text = text.replace(c, '')
    return ' '.join(text.split()).strip()


def safe_field(value, default="Not Provided"):
    if value is None:
        return default
    text = clean_text(str(value))
    if not text or text in ["", "None", "null", "/", "//", "Not Provided"]:
        return default
    return text


def _embed_images(story, images: list, styles):
    if not images:
        return
    from reportlab.platypus import Image as RLImage
    import base64, io
    from PIL import Image as PILImage
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("ATTACHED EVIDENCE / PROOF", styles['Heading3']))
    story.append(Spacer(1, 0.1 * inch))
    for idx, img_b64 in enumerate(images, 1):
        try:
            raw = img_b64.split(",")[-1]
            img_bytes = base64.b64decode(raw)
            pil_img = PILImage.open(io.BytesIO(img_bytes))
            img_io = io.BytesIO()
            pil_img.save(img_io, format="PNG")
            img_io.seek(0)
            rl_img = RLImage(img_io, width=5 * inch, height=4 * inch, kind="proportional")
            story.append(rl_img)
            story.append(Paragraph(f"Exhibit {idx}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        except Exception as e:
            story.append(Paragraph(f"[Exhibit {idx}: could not embed image — {e}]", styles['Normal']))


def _make_styles(font: str):
    """Return a styles dict with the given Unicode-capable font."""
    styles = getSampleStyleSheet()
    base = {
        'fontName': font,
        'fontSize': 10,
        'leading': 16,
    }
    styles.add(ParagraphStyle('UBody',    parent=styles['Normal'],   **base, alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle('UNormal',  parent=styles['Normal'],   **base))
    styles.add(ParagraphStyle('UHeading', parent=styles['Heading2'], fontName=font, fontSize=12))
    styles.add(ParagraphStyle('USmall',   parent=styles['Normal'],   fontName=font, fontSize=8, textColor=colors.grey, alignment=TA_JUSTIFY))
    return styles


# ── Legal Notice ──────────────────────────────────────────────────────────────
def generate_legal_notice(notice_data, images=None):
    lang = notice_data.get("_lang", "English") if isinstance(notice_data, dict) else "English"
    font = _font(lang)
    filename = tempfile.mktemp(suffix='.pdf')
    doc = SimpleDocTemplate(filename, pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch,
                            topMargin=0.6*inch, bottomMargin=0.6*inch)
    styles = _make_styles(font)
    story = []

    header_style = ParagraphStyle('Hdr', parent=styles['Heading1'],
                                  fontSize=16, fontName=font,
                                  alignment=TA_CENTER, textColor=colors.HexColor('#DC3232'), spaceAfter=20)
    story.append(Paragraph("LEGAL NOTICE", header_style))
    story.append(Spacer(1, 0.2*inch))

    def row(label, value):
        return [Paragraph(label, styles['UNormal']), Paragraph(safe_field(value), styles['UNormal'])]

    story.append(Paragraph("FROM:", styles['UHeading']))
    t = Table([row("Name:", notice_data.get('sender_name')), row("Address:", notice_data.get('sender_address'))],
              colWidths=[1.5*inch, 5*inch])
    t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    story.append(t); story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("TO:", styles['UHeading']))
    t2 = Table([row("Name:", notice_data.get('recipient_name')), row("Address:", notice_data.get('recipient_address'))],
               colWidths=[1.5*inch, 5*inch])
    t2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    story.append(t2); story.append(Spacer(1, 0.3*inch))

    subj_style = ParagraphStyle('Subj', fontName=font, fontSize=12, spaceAfter=10)
    story.append(Paragraph(f"SUBJECT: {safe_field(notice_data.get('subject'))}", subj_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(safe_field(notice_data.get('content', '')), styles['UBody']))
    story.append(Spacer(1, 0.2*inch))

    amount = safe_int(notice_data.get('amount_claimed', 0))
    days   = safe_int(notice_data.get('days_to_comply', 15), 15)
    if amount > 0:
        story.append(Paragraph(f"You are hereby called upon to pay ₹{amount:,} within {days} days of this notice.", styles['UBody']))

    warn = ParagraphStyle('Warn', fontName=font, fontSize=10, textColor=colors.red, alignment=TA_JUSTIFY)
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        f"Failure to comply within {days} days will compel us to initiate appropriate legal proceedings at your risk and cost.",
        warn))
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("Yours faithfully,", styles['UNormal']))
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(safe_field(notice_data.get('sender_name')), styles['UNormal']))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%d %B, %Y')}", styles['UNormal']))
    story.append(PageBreak())
    story.append(Paragraph(
        "DISCLAIMER: This document is AI-generated for informational purposes. Consult a qualified lawyer before sending.",
        styles['USmall']))
    _embed_images(story, images or [], styles)
    doc.build(story)
    with open(filename, 'rb') as f: pdf = f.read()
    os.unlink(filename)
    return pdf


# ── Court Petition ────────────────────────────────────────────────────────────
def generate_legal_petition(petition_data, images=None):
    lang = petition_data.get("_lang", "English") if isinstance(petition_data, dict) else "English"
    font = _font(lang)
    filename = tempfile.mktemp(suffix='.pdf')
    doc = SimpleDocTemplate(filename, pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch,
                            topMargin=0.6*inch, bottomMargin=0.6*inch)
    styles = _make_styles(font)
    story = []

    court_style = ParagraphStyle('Court', fontName=font, fontSize=14, alignment=TA_CENTER,
                                 textColor=colors.HexColor('#2E86AB'), spaceAfter=10)
    story.append(Paragraph(safe_field(petition_data.get('court_name', 'IN THE COURT OF ...')), court_style))
    story.append(Spacer(1, 0.2*inch))

    petitioner = safe_field(petition_data.get('petitioner_name'))
    respondent = safe_field(petition_data.get('respondent_name'))
    case_type  = safe_field(petition_data.get('case_type', 'Civil'))
    yr         = datetime.now().strftime('%Y')

    title_style = ParagraphStyle('Title', fontName=font, fontSize=12, alignment=TA_CENTER, spaceAfter=10)
    story.append(Paragraph(f"{case_type} Case No. _________ of {yr}", title_style))
    story.append(Paragraph(f"{petitioner}  ... Petitioner", title_style))
    story.append(Paragraph("Versus", title_style))
    story.append(Paragraph(f"{respondent}  ... Respondent", title_style))
    story.append(Spacer(1, 0.3*inch))

    for heading, key in [
        ("FACTS OF THE CASE:", 'facts_of_case'),
        ("RELIEF SOUGHT:", 'relief_sought'),
        ("PRAYER:", 'prayer'),
    ]:
        story.append(Paragraph(heading, styles['UHeading']))
        story.append(Paragraph(safe_field(petition_data.get(key, '')), styles['UBody']))
        story.append(Spacer(1, 0.2*inch))

    story.append(Spacer(1, 0.5*inch))
    sig = Table([
        [Paragraph(f"Place: {safe_field(petition_data.get('place', '__________'))}", styles['UNormal']), ""],
        [Paragraph(f"Date: {datetime.now().strftime('%d %B, %Y')}", styles['UNormal']),
         Paragraph("Signature of Petitioner", styles['UNormal'])],
        ["", Paragraph(petitioner, styles['UNormal'])],
    ], colWidths=[3*inch, 3*inch])
    story.append(sig)
    story.append(PageBreak())
    story.append(Paragraph(
        "DISCLAIMER: AI-generated draft for informational purposes only. Consult a lawyer before filing.",
        styles['USmall']))
    _embed_images(story, images or [], styles)
    doc.build(story)
    with open(filename, 'rb') as f: pdf = f.read()
    os.unlink(filename)
    return pdf


# ── Affidavit (fully rewritten) ───────────────────────────────────────────────
def generate_affidavit(affidavit_data, images=None):
    """
    Generate a proper, court-ready affidavit PDF.
    Supports all Indian languages via Unicode fonts.
    """
    lang = affidavit_data.get("_lang", "English") if isinstance(affidavit_data, dict) else "English"
    font = _font(lang)
    filename = tempfile.mktemp(suffix='.pdf')
    doc = SimpleDocTemplate(filename, pagesize=A4,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = _make_styles(font)
    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    hdr = ParagraphStyle('AffHdr', fontName=font, fontSize=16,
                         alignment=TA_CENTER, textColor=colors.HexColor('#1a1a5e'),
                         spaceAfter=4, spaceBefore=4)
    sub = ParagraphStyle('AffSub', fontName=font, fontSize=11,
                         alignment=TA_CENTER, textColor=colors.HexColor('#333333'),
                         spaceAfter=14)
    story.append(Paragraph("AFFIDAVIT", hdr))
    purpose = safe_field(affidavit_data.get('purpose', ''))
    if purpose and purpose != "Not Provided":
        story.append(Paragraph(f"(For: {purpose})", sub))
    story.append(Spacer(1, 0.1*inch))

    # Thin divider
    divider = Table([[""]], colWidths=[6.5*inch])
    divider.setStyle(TableStyle([('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#1a1a5e'))]))
    story.append(divider)
    story.append(Spacer(1, 0.2*inch))

    # ── Deponent intro paragraph ─────────────────────────────────────────────
    name    = safe_field(affidavit_data.get('deponent_name'))
    father  = safe_field(affidavit_data.get('father_name', '__________'))
    age     = safe_field(affidavit_data.get('age', '___'))
    gender  = affidavit_data.get('gender', 'Male') or 'Male'
    address = safe_field(affidavit_data.get('address'))
    city    = safe_field(affidavit_data.get('city', '__________'))
    date    = safe_field(affidavit_data.get('date', datetime.now().strftime('%d/%m/%Y')))

    relation = "son" if str(gender).lower().startswith("m") else "daughter/wife"

    intro = (
        f"I, <b>{name}</b>, {relation} of <b>{father}</b>, aged <b>{age}</b> years, "
        f"resident of <b>{address}</b>, do hereby solemnly affirm and declare on oath as under:"
    )
    intro_style = ParagraphStyle('Intro', fontName=font, fontSize=10.5, leading=17, alignment=TA_JUSTIFY)
    story.append(Paragraph(intro, intro_style))
    story.append(Spacer(1, 0.25*inch))

    # ── Numbered statements ──────────────────────────────────────────────────
    raw_statements = safe_field(affidavit_data.get('statements', ''))
    # Split by newlines or numbered lines
    lines = [l.strip() for l in raw_statements.replace('\r\n', '\n').split('\n') if l.strip()]
    if not lines:
        lines = [raw_statements]

    stmt_style = ParagraphStyle('Stmt', fontName=font, fontSize=10, leading=16,
                                alignment=TA_JUSTIFY, leftIndent=20, spaceAfter=6)

    for i, line in enumerate(lines, 1):
        # Remove existing numbering if user added it
        import re
        line = re.sub(r'^[\d]+[\.\)\-\s]+', '', line).strip()
        if line:
            story.append(Paragraph(f"{i}.  {line}", stmt_style))

    story.append(Spacer(1, 0.3*inch))

    # ── Declaration ──────────────────────────────────────────────────────────
    decl = ParagraphStyle('Decl', fontName=font, fontSize=10, leading=16, alignment=TA_JUSTIFY,
                          textColor=colors.HexColor('#111111'))
    story.append(Paragraph(
        "I solemnly declare that the above statements are true and correct to the best of my knowledge "
        "and belief. Nothing material has been concealed therefrom.",
        decl))
    story.append(Spacer(1, 0.5*inch))

    # ── Signature block ──────────────────────────────────────────────────────
    sig_data = [
        [Paragraph(f"Place: {city}", styles['UNormal']),
         Paragraph("DEPONENT", styles['UNormal'])],
        [Paragraph(f"Date: {date}", styles['UNormal']),
         Paragraph("_" * 28, styles['UNormal'])],
        ["",
         Paragraph(f"({name})", styles['UNormal'])],
    ]
    sig_table = Table(sig_data, colWidths=[3.25*inch, 3.25*inch])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 0.5*inch))

    # ── Verification / notary block ──────────────────────────────────────────
    story.append(divider)
    story.append(Spacer(1, 0.15*inch))
    verif_style = ParagraphStyle('Verif', fontName=font, fontSize=10, leading=16)
    story.append(Paragraph("VERIFICATION", ParagraphStyle('VH', fontName=font, fontSize=11,
                                                           textColor=colors.HexColor('#1a1a5e'))))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        f"Verified at <b>{city}</b> on this <b>{date}</b> that the contents of the above "
        "affidavit are true and correct to the best of my knowledge and belief and nothing "
        "has been concealed therefrom.",
        verif_style))
    story.append(Spacer(1, 0.5*inch))

    notary_data = [
        [Paragraph("Deponent", styles['UNormal']),
         Paragraph("Before me:", styles['UNormal'])],
        [Paragraph("_" * 25, styles['UNormal']),
         Paragraph("_" * 25, styles['UNormal'])],
        [Paragraph(f"({name})", styles['UNormal']),
         Paragraph("Notary / Oath Commissioner", styles['UNormal'])],
    ]
    notary_table = Table(notary_data, colWidths=[3.25*inch, 3.25*inch])
    notary_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    story.append(notary_table)

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "DISCLAIMER: This affidavit is AI-generated for reference. Please review with a qualified "
        "lawyer before submission. Stamp paper of appropriate denomination is required.",
        styles['USmall']))

    _embed_images(story, images or [], styles)
    doc.build(story)
    with open(filename, 'rb') as f: pdf = f.read()
    os.unlink(filename)
    return pdf


def get_available_templates():
    return {
        "Legal Notice":    "For sending formal legal notices",
        "Court Petition":  "For filing petitions in court",
        "Affidavit":       "For sworn statements and declarations",
        "Rental Agreement":"For landlord-tenant agreements",
        "Sale Agreement":  "For property sale agreements",
    }


def generate_rental_agreement(agreement_data, images=None):
    from utils.template_extras import generate_rental_agreement as _gen
    return _gen(agreement_data, images=images)


def generate_sale_agreement(agreement_data, images=None):
    from utils.template_extras import generate_sale_agreement as _gen
    return _gen(agreement_data, images=images)
