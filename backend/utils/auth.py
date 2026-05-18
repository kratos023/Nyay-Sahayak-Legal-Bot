# backend/utils/auth.py

# ── bcrypt/passlib compatibility shim ─────────────────────────────────────────
# passlib 1.7.4 reads bcrypt.__about__.__version__ which was removed in bcrypt 4.x
# This patch restores it before passlib imports so no errors are raised.
import bcrypt as _bcrypt_shim
if not hasattr(_bcrypt_shim, '__about__'):
    _bcrypt_shim.__about__ = type('_about', (), {'__version__': _bcrypt_shim.__version__})()

import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt

# ── Config ────────────────────────────────────────────────────────────────────
_jwt_default = os.urandom(32).hex()  # Random per-process default; set JWT_SECRET in .env for persistence
SECRET_KEY  = os.getenv("JWT_SECRET", _jwt_default)
if not os.getenv("JWT_SECRET"):
    print("⚠️  JWT_SECRET not set — using random key. Sessions will reset on restart. Set JWT_SECRET in .env!")
ALGORITHM   = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7  # 1 week

ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL",    "admin@nyayshakti.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")  # Change in .env!

DB_PATH = os.path.join(os.getenv("DB_DIR", ""), "legal_ai_chat.db")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── DB helpers ────────────────────────────────────────────────────────────────
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_tables():
    """Create accounts table if not exists. Safe to call multiple times."""
    conn = get_conn()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT UNIQUE NOT NULL,
                name          TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role          TEXT NOT NULL DEFAULT 'user',
                user_id       TEXT UNIQUE NOT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login    TIMESTAMP
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email)")
        conn.commit()

        # Seed admin account if it doesn't exist
        existing = conn.execute(
            "SELECT id FROM accounts WHERE email = ?", (ADMIN_EMAIL,)
        ).fetchone()

        if not existing:
            import uuid
            admin_uid = str(uuid.uuid4())
            conn.execute("""
                INSERT INTO accounts (email, name, password_hash, role, user_id)
                VALUES (?, ?, ?, 'admin', ?)
            """, (ADMIN_EMAIL, "Admin", pwd_ctx.hash(ADMIN_PASSWORD), admin_uid))
            # Also add to users table so history works
            conn.execute(
                "INSERT OR IGNORE INTO users (user_id) VALUES (?)", (admin_uid,)
            )
            conn.commit()
            print(f"✅ Admin account created: {ADMIN_EMAIL}")

    except Exception as e:
        print(f"Auth table init error: {e}")
    finally:
        conn.close()


# ── Password ──────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "sub":     user_id,
        "email":   email,
        "role":    role,
        "exp":     expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ── User CRUD ─────────────────────────────────────────────────────────────────
def create_account(email: str, name: str, password: str) -> dict:
    import uuid
    conn = get_conn()
    try:
        # Check duplicate
        if conn.execute("SELECT id FROM accounts WHERE email = ?", (email,)).fetchone():
            return {"error": "Email already registered"}

        user_id = str(uuid.uuid4())
        conn.execute("""
            INSERT INTO accounts (email, name, password_hash, role, user_id)
            VALUES (?, ?, ?, 'user', ?)
        """, (email, name, hash_password(password), user_id))

        # Mirror in users table for chat history linkage
        conn.execute(
            "INSERT OR IGNORE INTO users (user_id) VALUES (?)", (user_id,)
        )
        conn.commit()
        return {"user_id": user_id, "email": email, "name": name, "role": "user"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


def get_account_by_email(email: str) -> Optional[dict]:
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT * FROM accounts WHERE email = ?", (email,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def update_last_login(user_id: str):
    conn = get_conn()
    try:
        conn.execute(
            "UPDATE accounts SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
            (user_id,)
        )
        conn.commit()
    finally:
        conn.close()


# ── Admin queries ─────────────────────────────────────────────────────────────
def get_all_accounts() -> list:
    conn = get_conn()
    try:
        rows = conn.execute("""
            SELECT a.id, a.email, a.name, a.role, a.user_id,
                   a.created_at, a.last_login,
                   COUNT(DISTINCT cs.id) as session_count,
                   COALESCE(SUM(cs.message_count), 0) as total_messages
            FROM accounts a
            LEFT JOIN chat_sessions cs ON cs.user_id = a.user_id
            GROUP BY a.id, a.email, a.name, a.role, a.user_id, a.created_at, a.last_login
            ORDER BY a.created_at DESC
        """).fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[admin] get_all_accounts error: {e}")
        return []
    finally:
        conn.close()


def delete_account(user_id: str) -> bool:
    conn = get_conn()
    try:
        # Remove messages first, then sessions, then account rows
        session_ids = [r[0] for r in conn.execute(
            "SELECT id FROM chat_sessions WHERE user_id = ?", (user_id,)
        ).fetchall()]
        for sid in session_ids:
            conn.execute("DELETE FROM messages WHERE session_id = ?", (sid,))
        conn.execute("DELETE FROM chat_sessions WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM accounts WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"[admin] delete_account error: {e}")
        return False
    finally:
        conn.close()


def get_daily_stats(days: int = 7) -> list:
    conn = get_conn()
    try:
        rows = conn.execute("""
            SELECT DATE(timestamp) as date,
                   COUNT(*) as message_count,
                   COUNT(DISTINCT session_id) as session_count
            FROM messages
            WHERE timestamp >= DATE('now', ? || ' days')
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        """, (f"-{int(days)}",)).fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[admin] get_daily_stats error: {e}")
        return []
    finally:
        conn.close()


def get_language_stats() -> list:
    """Count sessions per intent label (used as topic/language proxy in admin UI)."""
    conn = get_conn()
    try:
        rows = conn.execute("""
            SELECT intent_label as language,
                   COUNT(*) as session_count,
                   SUM(message_count) as message_count
            FROM chat_sessions
            WHERE intent_label IS NOT NULL AND intent_label != ''
            GROUP BY intent_label
            ORDER BY message_count DESC
            LIMIT 20
        """).fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[admin] get_language_stats error: {e}")
        return []
    finally:
        conn.close()
