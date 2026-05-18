# backend/routers/dashboard.py
"""
Personal Legal Dashboard — stats, case tracking, notifications
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import datetime

from utils.database import db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# ── Pydantic models ───────────────────────────────────────────────────────────

class CaseCreate(BaseModel):
    title: str
    case_type: str = "Civil"
    court: str = ""
    case_number: str = ""
    status: str = "Active"
    description: str = ""
    filed_date: str = ""
    next_hearing: str = ""
    priority: str = "normal"
    progress: int = 0
    tags: List[str] = []
    notes: str = ""

class CaseUpdate(CaseCreate):
    pass

class NotifMarkRead(BaseModel):
    notif_id: int


# ── Dashboard summary ─────────────────────────────────────────────────────────

@router.get("/{user_id}")
async def get_dashboard(user_id: str):
    """Full dashboard data in one call."""
    stats    = db.get_user_statistics(user_id)
    sessions = db.get_chat_sessions(user_id)
    cases    = db.get_user_cases(user_id)
    notifs   = db.get_notifications(user_id, unread_only=False)
    unread   = db.get_unread_count(user_id)

    # Upcoming hearings = cases with next_hearing in the next 30 days
    today = datetime.date.today()
    upcoming = []
    for c in cases:
        nh = c.get("next_hearing", "")
        if nh:
            try:
                hearing_date = datetime.date.fromisoformat(nh)
                days_left = (hearing_date - today).days
                if 0 <= days_left <= 30:
                    upcoming.append({**c, "days_left": days_left})
            except ValueError:
                pass
    upcoming.sort(key=lambda x: x["days_left"])

    # Auto-generate hearing reminder notifications
    for c in upcoming[:5]:
        days = c["days_left"]
        if days <= 3:
            db.create_notification(
                user_id=user_id,
                type_="hearing",
                title=f"🔔 Hearing in {days} day{'s' if days != 1 else ''}",
                message=f"{c['title']} — {c['court'] or 'Court'} on {c['next_hearing']}",
                link_panel="dashboard",
                priority="urgent" if days == 0 else "high",
                expires_days=1,
            )

    active_cases = [c for c in cases if c.get("status") == "Active"]

    # Recent chat topics from sessions
    recent_topics = []
    for s in sessions[:5]:
        label = s.get("intent_label", "General Query")
        if label not in recent_topics:
            recent_topics.append(label)

    return {
        "stats": {
            "total_sessions":  stats.get("total_sessions", 0) or 0,
            "total_messages":  stats.get("total_messages", 0) or 0,
            "last_activity":   stats.get("last_activity", ""),
            "active_cases":    len(active_cases),
            "total_cases":     len(cases),
            "upcoming_hearings": len(upcoming),
            "unread_notifications": unread,
            "recent_topics":   recent_topics,
        },
        "upcoming_hearings": upcoming[:5],
        "active_cases": active_cases[:6],
        "recent_sessions": sessions[:5],
        "notifications": notifs[:10],
    }


# ── Cases CRUD ────────────────────────────────────────────────────────────────

@router.get("/{user_id}/cases")
async def list_cases(user_id: str):
    return {"cases": db.get_user_cases(user_id)}


@router.post("/{user_id}/cases")
async def create_case(user_id: str, body: CaseCreate):
    result = db.create_user_case(user_id, body.model_dump())
    if not result:
        raise HTTPException(status_code=500, detail="Could not create case")
    # Welcome notification
    db.create_notification(
        user_id=user_id,
        type_="case",
        title="✅ Case added",
        message=f"'{body.title}' is now tracked in your dashboard.",
        link_panel="dashboard",
        priority="normal",
    )
    return {"case": result}


@router.put("/{user_id}/cases/{case_uuid}")
async def update_case(user_id: str, case_uuid: str, body: CaseUpdate):
    ok = db.update_user_case(case_uuid, user_id, body.model_dump())
    if not ok:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"ok": True}


@router.delete("/{user_id}/cases/{case_uuid}")
async def delete_case(user_id: str, case_uuid: str):
    ok = db.delete_user_case(case_uuid, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"ok": True}


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/{user_id}/notifications")
async def get_notifications(user_id: str, unread_only: bool = False):
    notifs = db.get_notifications(user_id, unread_only)
    unread = db.get_unread_count(user_id)
    return {"notifications": notifs, "unread_count": unread}


@router.post("/{user_id}/notifications/read/{notif_id}")
async def mark_read(user_id: str, notif_id: int):
    db.mark_notification_read(notif_id, user_id)
    return {"ok": True}


@router.post("/{user_id}/notifications/read-all")
async def mark_all_read(user_id: str):
    db.mark_all_read(user_id)
    return {"ok": True}
