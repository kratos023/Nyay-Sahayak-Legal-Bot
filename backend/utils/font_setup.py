# utils/font_setup.py
"""
Multi-script font setup for NyayShakti PDFs.
Supports all 11 Indian languages: Hindi, Bengali, Telugu, Marathi, Tamil,
Gujarati, Kannada, Malayalam, Punjabi, Odia, and English.
Uses NotoSans* fonts from Google (downloaded on first use).
"""
import os
import requests
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = os.path.dirname(__file__)

# Map: font name alias → (filename, Google Fonts raw URL)
NOTO_FONTS = {
    "NotoSansDevanagari": (
        "NotoSansDevanagari-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf",
    ),
    "NotoSansBengali": (
        "NotoSansBengali-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf",
    ),
    "NotoSansTelugu": (
        "NotoSansTelugu-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf",
    ),
    "NotoSansTamil": (
        "NotoSansTamil-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf",
    ),
    "NotoSansGujarati": (
        "NotoSansGujarati-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf",
    ),
    "NotoSansKannada": (
        "NotoSansKannada-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf",
    ),
    "NotoSansMalayalam": (
        "NotoSansMalayalam-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansMalayalam/NotoSansMalayalam-Regular.ttf",
    ),
    "NotoSansGurmukhi": (
        "NotoSansGurmukhi-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansGurmukhi/NotoSansGurmukhi-Regular.ttf",
    ),
    "NotoSansOriya": (
        "NotoSansOriya-Regular.ttf",
        "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansOriya/NotoSansOriya-Regular.ttf",
    ),
}

# Language → font alias
LANG_FONT_MAP = {
    "English":   "Helvetica",
    "Hindi":     "NotoSansDevanagari",
    "Marathi":   "NotoSansDevanagari",
    "Bengali":   "NotoSansBengali",
    "Telugu":    "NotoSansTelugu",
    "Tamil":     "NotoSansTamil",
    "Gujarati":  "NotoSansGujarati",
    "Kannada":   "NotoSansKannada",
    "Malayalam": "NotoSansMalayalam",
    "Punjabi":   "NotoSansGurmukhi",
    "Odia":      "NotoSansOriya",
}

_registered: set = set()


def _try_download(font_alias: str) -> bool:
    filename, url = NOTO_FONTS[font_alias]
    path = os.path.join(FONT_DIR, filename)
    if os.path.exists(path):
        return True
    try:
        print(f"📥 Downloading {font_alias}…")
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        with open(path, "wb") as f:
            f.write(r.content)
        print(f"✅ Downloaded {filename}")
        return True
    except Exception as e:
        print(f"⚠️  Could not download {font_alias}: {e}")
        return False


def get_font_for_lang(language: str) -> str:
    """Return the registered ReportLab font name for a given language."""
    alias = LANG_FONT_MAP.get(language, "Helvetica")
    if alias == "Helvetica" or alias in _registered:
        return alias

    if alias not in NOTO_FONTS:
        return "Helvetica"

    filename, _ = NOTO_FONTS[alias]
    path = os.path.join(FONT_DIR, filename)

    # Try to download if missing
    if not os.path.exists(path):
        _try_download(alias)

    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(alias, path))
            _registered.add(alias)
            return alias
        except Exception as e:
            print(f"⚠️  Font register failed for {alias}: {e}")

    # Fallback: try Devanagari for Hindi-family
    if language in ("Hindi", "Marathi") and "NotoSansDevanagari" in _registered:
        return "NotoSansDevanagari"

    return "Helvetica"


def setup_fonts():
    """Pre-register Devanagari (most common). Others are lazy-loaded."""
    alias = "NotoSansDevanagari"
    if alias in _registered:
        return True
    filename, _ = NOTO_FONTS[alias]
    path = os.path.join(FONT_DIR, filename)
    if not os.path.exists(path):
        _try_download(alias)
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(alias, path))
            _registered.add(alias)
            print(f"✅ {alias} registered")
            return True
        except Exception as e:
            print(f"⚠️  {alias} register error: {e}")
    return False


# Legacy compatibility
def get_best_font_for_text(text, default_font="Helvetica"):
    return default_font

def get_best_bold_font_for_text(text, default_font="Helvetica-Bold"):
    return default_font

HINDI_FONT_AVAILABLE = setup_fonts()
