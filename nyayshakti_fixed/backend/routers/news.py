# backend/routers/news.py
import re, time, requests
from fastapi import APIRouter
from typing import Optional

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

router = APIRouter(prefix="/news", tags=["news"])

# Primary + fallback URLs for each source
RSS_SOURCES = [
    {
        "name": "Live Law",
        "icon": "⚖️",
        "urls": [
            "https://www.livelaw.in/rss",
            "https://feeds.feedburner.com/livelaw/fMCP",
            "https://www.livelaw.in/feed/",
        ],
    },
    {
        "name": "Bar & Bench",
        "icon": "🏛️",
        "urls": [
            "https://www.barandbench.com/feed",
            "https://feeds.feedburner.com/barandbench",
            "https://barandbench.com/rss",
        ],
    },
    {
        "name": "Supreme Court Observer",
        "icon": "🔍",
        "urls": [
            "https://www.scobserver.in/feed/",
            "https://scobserver.in/rss",
        ],
    },
    {
        "name": "Indian Kanoon",
        "icon": "📚",
        "urls": [
            "https://indiankanoon.org/feeds/recent/",
        ],
    },
]

_cache: dict = {}
CACHE_TTL = 1800  # 30 min


def fetch_rss(urls: list[str], max_items: int = 6) -> list[dict]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
    }
    for url in urls:
        try:
            resp = requests.get(url, timeout=12, headers=headers)
            if resp.status_code != 200:
                continue
            xml = resp.text
            if "<item" not in xml and "<entry" not in xml:
                continue

            articles = []

            # Try <item> (RSS) first, then <entry> (Atom)
            items = re.findall(r"<item>(.*?)</item>", xml, re.DOTALL)
            if not items:
                items = re.findall(r"<entry>(.*?)</entry>", xml, re.DOTALL)

            for item in items[:max_items]:
                def extract(tag: str) -> str:
                    # CDATA-aware extraction
                    m = re.search(
                        rf"<{tag}[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{tag}>",
                        item, re.DOTALL
                    )
                    return m.group(1).strip() if m else ""

                title   = extract("title")
                link    = extract("link")
                # Atom uses <link href="..."/>
                if not link:
                    m = re.search(r'<link[^>]+href=["\']([^"\']+)["\']', item)
                    if m: link = m.group(1)
                summary = extract("description") or extract("summary") or extract("content")
                date    = extract("pubDate") or extract("published") or extract("dc:date") or ""

                # Strip HTML tags from summary
                summary = re.sub(r"<[^>]+>", "", summary)
                summary = re.sub(r"\s+", " ", summary).strip()[:400]

                if title and len(title) > 5:
                    articles.append({
                        "title":   title[:200],
                        "link":    link or "",
                        "summary": summary,
                        "date":    date[:30],
                    })

            if articles:
                return articles

        except Exception as e:
            print(f"RSS fetch failed {url}: {e}")
            continue

    return []


def translate_articles(articles: list[dict], lang_code: str) -> list[dict]:
    if lang_code == "en" or not articles:
        return articles
    try:
        from utils.ai_client import call_translation_api
        translated = []
        for art in articles:
            title   = call_translation_api(art["title"], "en", lang_code) or art["title"]
            summary = (call_translation_api(art["summary"][:200], "en", lang_code) or art["summary"]) if art["summary"] else ""
            translated.append({**art, "title": title, "summary": summary})
        return translated
    except Exception:
        return articles


@router.get("/feed")
async def get_news(lang: str = "en", source: str = "all"):
    cache_key = f"{lang}:{source}"
    cached = _cache.get(cache_key)
    if cached and (time.time() - cached["ts"]) < CACHE_TTL:
        return cached["data"]

    sources = RSS_SOURCES if source == "all" else [s for s in RSS_SOURCES if s["name"] == source]

    all_articles = []
    for src in sources:
        articles = fetch_rss(src["urls"], max_items=5)
        for a in articles:
            a["source"]      = src["name"]
            a["source_icon"] = src["icon"]
        all_articles.extend(articles)

    if lang != "en":
        all_articles = translate_articles(all_articles, lang)

    # Sort by date descending if possible, else keep as-is
    result = {"articles": all_articles, "count": len(all_articles), "language": lang}
    _cache[cache_key] = {"data": result, "ts": time.time()}
    return result


@router.get("/sources")
async def get_sources():
    return {"sources": [{"name": s["name"], "icon": s["icon"]} for s in RSS_SOURCES]}
