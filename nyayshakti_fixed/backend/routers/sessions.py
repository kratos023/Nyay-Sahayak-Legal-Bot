# backend/routers/sessions.py
from fastapi import APIRouter, HTTPException
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.database import db

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/user/{user_id}")
async def get_sessions(user_id: str):
    """Get all chat sessions for a user."""
    try:
        sessions = db.get_chat_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keep old route for backwards compatibility
@router.get("/{user_id}")
async def get_sessions_compat(user_id: str):
    """Backwards-compatible route — redirects to /user/{user_id}."""
    try:
        sessions = db.get_chat_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}/messages")
async def get_messages(session_id: int):
    """Get messages for a specific session."""
    try:
        messages = db.get_session_messages(session_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}")
async def delete_session(session_id: int):
    try:
        # Also delete messages
        conn = db.get_connection()
        try:
            conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            conn.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
            conn.commit()
        finally:
            conn.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/new")
async def new_session(user_id: str):
    """Deactivate all sessions so next message starts fresh."""
    try:
        db.deactivate_other_sessions(user_id, -1)
        # Clear in-memory context too
        from routers.chat import _contexts
        if user_id in _contexts:
            _contexts[user_id].clear()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
