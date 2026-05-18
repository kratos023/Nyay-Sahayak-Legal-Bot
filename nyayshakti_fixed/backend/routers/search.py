# backend/routers/search.py
"""
AI-powered semantic legal search — Indian laws, case law, precedents
Uses Gemini to interpret the query and return structured results.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/search", tags=["search"])

LEGAL_SEARCH_PROMPT = """You are an expert Indian legal research assistant with deep knowledge of:
- Constitution of India
- Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Civil Procedure Code (CPC)
- Consumer Protection Act 2019
- Right to Information Act 2005
- Protection of Women from Domestic Violence Act 2005
- Motor Vehicles Act
- Indian Contract Act
- Companies Act 2013
- Labour Laws (Factories Act, Minimum Wages Act, etc.)
- Environmental laws
- Landmark Supreme Court and High Court judgments

The user searched for: "{query}"
Search type: {search_type}
Language: {language}

Return a JSON response with this EXACT structure (no markdown, pure JSON):
{{
  "summary": "2-3 sentence overview of what this query is about in {language}",
  "results": [
    {{
      "title": "Name of law / section / case",
      "type": "statute|case_law|constitutional|procedure|right",
      "relevance": "high|medium|low",
      "description": "What this covers and why it's relevant (2-3 sentences)",
      "key_points": ["point 1", "point 2", "point 3"],
      "citation": "Exact citation e.g. Section 420 IPC or AIR 2023 SC 1234",
      "practical_tip": "What a citizen can actually do with this information"
    }}
  ],
  "related_searches": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "disclaimer": "Brief disclaimer that this is information, not legal advice",
  "ai_note": "One sentence noting any important caveats or recent law changes"
}}

Return 4-6 highly relevant results. Be accurate, cite real Indian laws and real landmark cases.
"""

@router.post("/legal")
async def legal_search(body: dict):
    query       = body.get("query", "").strip()
    search_type = body.get("search_type", "all")   # all | statute | case_law | rights | procedure
    language    = body.get("language", "English")

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query too long (max 500 chars)")

    try:
        from utils.ai_client import client, GEMINI_AVAILABLE, GEMINI_MODELS
        import json

        if not GEMINI_AVAILABLE or not client:
            return _fallback_results(query, search_type)

        prompt = LEGAL_SEARCH_PROMPT.format(
            query=query, search_type=search_type, language=language
        )

        result = None
        for model in GEMINI_MODELS:
            try:
                resp = client.models.generate_content(model=model, contents=prompt)
                result = resp.text
                break
            except Exception:
                continue

        if not result:
            return _fallback_results(query, search_type)

        # Strip markdown fences if present
        clean = result.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        clean = clean.strip().rstrip("```").strip()

        parsed = json.loads(clean)
        return {"query": query, "search_type": search_type, **parsed}

    except json.JSONDecodeError:
        return _fallback_results(query, search_type)
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _fallback_results(query: str, search_type: str) -> dict:
    """Offline fallback with static pointers when Gemini is unavailable."""
    return {
        "query": query,
        "search_type": search_type,
        "summary": f"Showing general guidance for: {query}",
        "results": [
            {
                "title": "Constitution of India — Fundamental Rights",
                "type": "constitutional",
                "relevance": "high",
                "description": "Articles 12-35 guarantee fundamental rights including equality, freedom of speech, and right to constitutional remedies.",
                "key_points": ["Article 14: Right to equality", "Article 19: Freedom of speech", "Article 21: Right to life and personal liberty"],
                "citation": "Part III, Constitution of India",
                "practical_tip": "File a writ petition in High Court (Article 226) or Supreme Court (Article 32) if fundamental rights are violated.",
            },
            {
                "title": "RTI Act 2005 — Right to Information",
                "type": "statute",
                "relevance": "medium",
                "description": "Citizens can seek information from any public authority within 30 days of filing an RTI application.",
                "key_points": ["File online at rtionline.gov.in", "₹10 application fee", "Appeal to CIC if denied"],
                "citation": "Right to Information Act, 2005",
                "practical_tip": "Use the RTI panel in this app to draft your application automatically.",
            },
        ],
        "related_searches": ["fundamental rights India", "consumer complaint procedure", "how to file RTI"],
        "disclaimer": "This is general legal information, not legal advice. Consult a qualified advocate for your specific situation.",
        "ai_note": "AI service temporarily unavailable. Showing static reference results.",
    }


@router.get("/suggestions")
async def search_suggestions(q: str = ""):
    """Quick autocomplete suggestions for the search bar."""
    COMMON = [
        "tenant eviction rights India",
        "consumer complaint DCDRC",
        "domestic violence protection order",
        "wrongful termination employee rights",
        "property registration documents required",
        "bail conditions India",
        "cheque bounce Section 138 NI Act",
        "cybercrime complaint procedure",
        "divorce mutual consent procedure",
        "inheritance property Hindu law",
        "motor accident compensation MACT",
        "police FIR rights arrested person",
        "rent control act",
        "workplace sexual harassment POSH Act",
        "child custody law India",
    ]
    if not q:
        return {"suggestions": COMMON[:8]}
    q_lower = q.lower()
    matches = [s for s in COMMON if q_lower in s.lower()]
    return {"suggestions": matches[:6] or COMMON[:4]}
