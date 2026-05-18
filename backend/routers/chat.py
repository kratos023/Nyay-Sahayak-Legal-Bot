# backend/routers/chat.py
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import sys, os, json, time, asyncio
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.ai_client import (
    query_legal_ai, call_translation_api, call_tts_api,
    LANGUAGES, GEMINI_AVAILABLE, client as gemini_client, GEMINI_MODELS,
    get_system_prompt_template, format_ai_response, get_emergency_response, get_quota_response,
    EMERGENCY_KEYWORDS
)
from utils.suggestions import build_suggestions
from utils.context_memory import ContextMemory
from utils.database import db

router = APIRouter(prefix="/chat", tags=["chat"])

# ── Rate limiting (in-memory, per user_id) ───────────────────────────────────
_rate_store: dict[str, list[float]] = {}   # user_id -> list of request timestamps
RATE_LIMIT_REQUESTS = 20    # max requests
RATE_LIMIT_WINDOW   = 60    # per N seconds
RATE_LIMIT_BURST    = 5     # max in any 5-second window (anti-spam)
BURST_WINDOW        = 5

def check_rate_limit(user_id: str) -> tuple[bool, str]:
    """Returns (allowed, error_message). Cleans up old timestamps."""
    now = time.time()
    times = _rate_store.setdefault(user_id, [])

    # Clean old entries
    _rate_store[user_id] = [t for t in times if now - t < RATE_LIMIT_WINDOW]
    times = _rate_store[user_id]

    # Burst check
    recent_burst = [t for t in times if now - t < BURST_WINDOW]
    if len(recent_burst) >= RATE_LIMIT_BURST:
        wait = round(BURST_WINDOW - (now - recent_burst[0]), 1)
        return False, f"Too many messages at once. Please wait {wait}s."

    # Window check
    if len(times) >= RATE_LIMIT_REQUESTS:
        wait = round(RATE_LIMIT_WINDOW - (now - times[0]), 1)
        return False, f"Rate limit reached ({RATE_LIMIT_REQUESTS} messages per minute). Please wait {wait}s."

    _rate_store[user_id].append(now)
    return True, ""

# ── In-memory context store (keyed by user_id) ───────────────────────────────
_contexts: dict[str, ContextMemory] = {}

def get_context(user_id: str) -> ContextMemory:
    if user_id not in _contexts:
        _contexts[user_id] = ContextMemory(max_messages=10)
    return _contexts[user_id]

def _load_db_history_into_context(user_id: str, ctx: ContextMemory):
    """Seed context with last N messages from DB if context is empty."""
    if len(ctx.history) > 0:
        return
    try:
        active = db.get_active_session(user_id)
        if not active:
            return
        msgs = db.get_session_messages(active["id"])
        # Load last 20 messages (10 exchanges) from DB
        for m in msgs[-20:]:
            ctx.add_message(m["role"], m["content"], "English")
    except Exception:
        pass


class ChatRequest(BaseModel):
    user_id: str
    message: str
    input_language: str = "English"
    output_language: str = "English"
    enable_tts: bool = False
    simple_mode: bool = False


class ChatResponse(BaseModel):
    reply: str
    reply_translated: str
    audio_base64: Optional[str] = None
    suggestions: Optional[dict] = None
    input_language: str
    output_language: str


# ── Streaming endpoint ───────────────────────────────────────────────────────
@router.post("/stream")
async def stream_message(req: ChatRequest):
    """Server-Sent Events stream for chat responses."""

    # Rate limit check
    allowed, err_msg = check_rate_limit(req.user_id)
    if not allowed:
        async def rate_error():
            yield f"data: {json.dumps({'type': 'error', 'message': err_msg})}\n\n"
        return StreamingResponse(rate_error(), media_type="text/event-stream")

    input_lang_code  = LANGUAGES.get(req.input_language,  {}).get("code", "en")
    output_lang_code = LANGUAGES.get(req.output_language, {}).get("code", "en")

    # Translate input if needed
    english_input = req.message
    if input_lang_code != "en":
        translated = call_translation_api(req.message, input_lang_code, "en")
        if translated:
            english_input = translated

    ctx = get_context(req.user_id)
    _load_db_history_into_context(req.user_id, ctx)
    context_prompt = ctx.get_context_prompt()

    is_emergency = any(kw in english_input.lower() for kw in EMERGENCY_KEYWORDS)

    lang_display = next(
        (name for name, info in LANGUAGES.items() if info["code"] == output_lang_code),
        "English"
    )
    system_prompt = get_system_prompt_template(lang_display)
    if req.simple_mode:
        system_prompt += "\n\n**SIMPLE LANGUAGE MODE:** The user may have low literacy or is not educated in law. Use very simple everyday words. No legal jargon at all. Explain as if talking to a Class 8 student. Short sentences. Real-life examples from Indian village/town life. Never use terms like 'prima facie', 'ipso facto', 'locus standi' — replace with simple equivalents."
    full_prompt   = f"{system_prompt}\n\n{context_prompt}\n{english_input}" if context_prompt else f"{system_prompt}\n\n{english_input}"

    # ── Pre-stream: get/create session and save user message immediately ──
    session_id = None
    try:
        active = db.get_active_session(req.user_id)
        if active:
            session_id = active["id"]
        else:
            session_name = req.message[:50] + "…" if len(req.message) > 50 else req.message
            session_data = db.create_chat_session(req.user_id, session_name, "Legal Query")
            session_id   = session_data["session_id"] if session_data else None
        if session_id:
            seq_start = len(ctx.history)
            db.save_message(session_id, "user", req.message, seq_start)
    except Exception as e:
        print(f"DB session/user-save error: {e}")

    async def generate():
        nonlocal session_id
        full_reply = ""

        if not GEMINI_AVAILABLE or gemini_client is None:
            fallback = get_emergency_response() if is_emergency else get_quota_response()
            yield f"data: {json.dumps({'type': 'chunk', 'text': fallback})}\n\n"
            full_reply = fallback
        else:
            try:
                from google.genai import types as genai_types
                streamed = False
                for model_name in GEMINI_MODELS:
                    try:
                        response_stream = gemini_client.models.generate_content_stream(
                            model=model_name,
                            contents=full_prompt,
                            config=genai_types.GenerateContentConfig(
                                temperature=0.7, max_output_tokens=2000
                            ),
                        )
                        for chunk in response_stream:
                            if chunk.text:
                                full_reply += chunk.text
                                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk.text})}\n\n"
                                await asyncio.sleep(0)  # yield control to event loop
                        streamed = True
                        break
                    except Exception as e:
                        err = str(e)
                        if "429" in err or "RESOURCE_EXHAUSTED" in err:
                            fallback = get_emergency_response() if is_emergency else get_quota_response()
                            yield f"data: {json.dumps({'type': 'chunk', 'text': fallback})}\n\n"
                            full_reply = fallback
                            streamed = True
                            break
                        continue

                if not streamed:
                    fallback = get_quota_response()
                    yield f"data: {json.dumps({'type': 'chunk', 'text': fallback})}\n\n"
                    full_reply = fallback

            except Exception as e:
                fallback = get_emergency_response() if is_emergency else get_quota_response()
                yield f"data: {json.dumps({'type': 'chunk', 'text': fallback})}\n\n"
                full_reply = fallback

        full_reply = format_ai_response(full_reply)

        # Update context
        ctx.add_message("user",      english_input, req.input_language)
        ctx.add_message("assistant", full_reply,    req.output_language)

        # Save to DB — user msg already saved before stream; save AI reply now
        try:
            if session_id and full_reply:
                seq = len(ctx.history)
                db.save_message(session_id, "assistant", full_reply, seq - 1)
        except Exception as e:
            print(f"DB save AI reply error: {e}")

        # Build suggestions (non-blocking — send after stream)
        suggestions = None
        try:
            suggestions = build_suggestions(
                user_query=english_input,
                ai_response=full_reply,
                client=gemini_client if GEMINI_AVAILABLE else None,
                models=GEMINI_MODELS
            )
            if suggestions and session_id:
                topics = (suggestions.get("topics") if isinstance(suggestions, dict) else None)
                if topics:
                    try:
                        db.update_session_intent(session_id, topics[0][:50])
                    except Exception:
                        pass
        except Exception as e:
            print(f"Suggestions error: {e}")

        # TTS
        audio_b64 = None
        if req.enable_tts:
            try:
                audio_bytes = call_tts_api(full_reply[:500], output_lang_code)
                if audio_bytes:
                    import base64
                    audio_b64 = base64.b64encode(audio_bytes).decode()
            except Exception:
                pass

        # Final done event with metadata
        yield f"data: {json.dumps({'type': 'done', 'suggestions': suggestions, 'audio_base64': audio_b64})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        }
    )


# ── Regular (non-streaming) endpoint — kept for compatibility ────────────────
@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    allowed, err_msg = check_rate_limit(req.user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=err_msg)

    input_lang_code  = LANGUAGES.get(req.input_language,  {}).get("code", "en")
    output_lang_code = LANGUAGES.get(req.output_language, {}).get("code", "en")

    english_input = req.message
    if input_lang_code != "en":
        translated = call_translation_api(req.message, input_lang_code, "en")
        if translated:
            english_input = translated

    ctx = get_context(req.user_id)
    _load_db_history_into_context(req.user_id, ctx)
    context_prompt = ctx.get_context_prompt()

    ai_reply = query_legal_ai(english_input, context_prompt, output_lang_code)

    ctx.add_message("user",      english_input, req.input_language)
    ctx.add_message("assistant", ai_reply,      req.output_language)

    audio_b64 = None
    if req.enable_tts:
        audio_bytes = call_tts_api(ai_reply[:500], output_lang_code)
        if audio_bytes:
            import base64
            audio_b64 = base64.b64encode(audio_bytes).decode()

    try:
        active = db.get_active_session(req.user_id)
        session_id = active["id"] if active else None
        if not session_id:
            session_name = req.message[:30] + "…" if len(req.message) > 30 else req.message
            sd = db.create_chat_session(req.user_id, session_name, "Legal Query")
            session_id = sd["session_id"] if sd else None
        if session_id:
            seq = len(ctx.history)
            db.save_message(session_id, "user",      req.message, seq - 2)
            db.save_message(session_id, "assistant", ai_reply,    seq - 1)
    except Exception as e:
        print(f"DB save error: {e}")

    suggestions = None
    try:
        suggestions = build_suggestions(
            user_query=english_input, ai_response=ai_reply,
            client=gemini_client if GEMINI_AVAILABLE else None, models=GEMINI_MODELS
        )
    except Exception:
        pass

    return ChatResponse(
        reply=ai_reply, reply_translated=ai_reply,
        audio_base64=audio_b64, suggestions=suggestions,
        input_language=req.input_language, output_language=req.output_language,
    )


@router.post("/clear-context")
async def clear_context(user_id: str):
    if user_id in _contexts:
        _contexts[user_id].clear()
    return {"status": "cleared"}

@router.get("/languages")
async def get_languages():
    return {"languages": LANGUAGES}

@router.get("/status")
async def get_status():
    return {"gemini_available": GEMINI_AVAILABLE}
