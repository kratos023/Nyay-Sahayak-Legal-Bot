import sqlite3
import json
import datetime
import os
import uuid
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.getenv("DB_DIR", ""), "legal_ai_chat.db")

class LegalAIDatabase:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_database()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_database(self):
        conn = self.get_connection()
        try:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_uuid TEXT UNIQUE NOT NULL,
                    user_id TEXT NOT NULL,
                    session_name TEXT NOT NULL,
                    intent_label TEXT DEFAULT 'General Query',
                    message_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER NOT NULL,
                    message_uuid TEXT UNIQUE NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sequence_number INTEGER NOT NULL,
                    FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS document_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER NOT NULL,
                    filename TEXT NOT NULL,
                    file_size INTEGER,
                    original_content TEXT,
                    analysis_content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER NOT NULL,
                    report_name TEXT NOT NULL,
                    user_data JSON,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
                )
            ''')

            # ── NEW: Personal case tracking ────────────────────────────────────
            conn.execute('''
                CREATE TABLE IF NOT EXISTS user_cases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    case_uuid TEXT UNIQUE NOT NULL,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    case_type TEXT DEFAULT 'Civil',
                    court TEXT DEFAULT '',
                    case_number TEXT DEFAULT '',
                    status TEXT DEFAULT 'Active',
                    description TEXT DEFAULT '',
                    filed_date TEXT DEFAULT '',
                    next_hearing TEXT DEFAULT '',
                    priority TEXT DEFAULT 'normal',
                    progress INTEGER DEFAULT 0,
                    tags TEXT DEFAULT '[]',
                    notes TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            ''')

            # ── NEW: Notifications ─────────────────────────────────────────────
            conn.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    link_panel TEXT DEFAULT '',
                    is_read BOOLEAN DEFAULT 0,
                    priority TEXT DEFAULT 'normal',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            ''')

            # Indexes
            conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON chat_sessions(user_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_uuid ON chat_sessions(session_uuid)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_messages_uuid ON messages(message_uuid)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_user_cases_user_id ON user_cases(user_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)')

            conn.commit()
            print("✅ Database initialized")
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
        finally:
            conn.close()

    # ── User Management ───────────────────────────────────────────────────────
    def create_or_update_user(self, user_id: str) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('''
                INSERT OR REPLACE INTO users (user_id, last_active)
                VALUES (?, CURRENT_TIMESTAMP)
            ''', (user_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error creating/updating user: {e}")
            return False
        finally:
            conn.close()

    def get_all_users(self) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('SELECT user_id, created_at, last_active FROM users ORDER BY last_active DESC')
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    # ── Chat Sessions ─────────────────────────────────────────────────────────
    def create_chat_session(self, user_id: str, session_name: str, intent_label: str = "General Query") -> Dict:
        conn = self.get_connection()
        try:
            self.create_or_update_user(user_id)
            session_uuid = str(uuid.uuid4())
            cursor = conn.execute('''
                INSERT INTO chat_sessions (session_uuid, user_id, session_name, intent_label)
                VALUES (?, ?, ?, ?)
            ''', (session_uuid, user_id, session_name, intent_label))
            session_id = cursor.lastrowid
            conn.commit()
            return {'session_id': session_id, 'session_uuid': session_uuid,
                    'user_id': user_id, 'session_name': session_name, 'intent_label': intent_label}
        except Exception as e:
            print(f"Error creating chat session: {e}")
            return None
        finally:
            conn.close()

    def get_active_session(self, user_id: str) -> Optional[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT id, session_uuid, session_name, intent_label, message_count, created_at
                FROM chat_sessions WHERE user_id = ? AND is_active = 1
                ORDER BY updated_at DESC LIMIT 1
            ''', (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def update_chat_session(self, session_id: int, messages: List[Dict], intent_label: str = None) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('DELETE FROM messages WHERE session_id = ?', (session_id,))
            for seq_num, message in enumerate(messages):
                message_uuid = str(uuid.uuid4())
                conn.execute('''
                    INSERT INTO messages (session_id, message_uuid, role, content, sequence_number)
                    VALUES (?, ?, ?, ?, ?)
                ''', (session_id, message_uuid, message['role'], message['content'], seq_num))
            update_query = 'UPDATE chat_sessions SET message_count = ?, updated_at = CURRENT_TIMESTAMP'
            params = [len(messages)]
            if intent_label:
                update_query += ', intent_label = ?'
                params.append(intent_label)
            update_query += ' WHERE id = ?'
            params.append(session_id)
            conn.execute(update_query, params)
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating chat session: {e}")
            return False
        finally:
            conn.close()

    def save_message(self, session_id: int, role: str, content: str, sequence_number: int) -> bool:
        conn = self.get_connection()
        try:
            message_uuid = str(uuid.uuid4())
            conn.execute('''
                INSERT INTO messages (session_id, message_uuid, role, content, sequence_number)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_id, message_uuid, role, content, sequence_number))
            conn.execute('''
                UPDATE chat_sessions SET message_count = message_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (session_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
        finally:
            conn.close()

    def get_chat_sessions(self, user_id: str) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT id, session_uuid, session_name, intent_label, message_count,
                       created_at, updated_at, is_active,
                       datetime(created_at) as created_display,
                       strftime('%d %b %Y, %H:%M', updated_at) as updated_display
                FROM chat_sessions WHERE user_id = ?
                ORDER BY updated_at DESC
            ''', (user_id,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def get_session_messages(self, session_id: int) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT role, content, timestamp, sequence_number FROM messages
                WHERE session_id = ? ORDER BY sequence_number ASC
            ''', (session_id,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def get_recent_messages(self, session_id: int, limit: int = 3) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT role, content FROM messages WHERE session_id = ?
                ORDER BY sequence_number DESC LIMIT ?
            ''', (session_id, limit))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def delete_chat_session(self, session_id: int) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('DELETE FROM chat_sessions WHERE id = ?', (session_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error deleting session: {e}")
            return False
        finally:
            conn.close()

    def deactivate_other_sessions(self, user_id: str, active_session_id: int):
        conn = self.get_connection()
        try:
            conn.execute('''
                UPDATE chat_sessions SET is_active = 0
                WHERE user_id = ? AND id != ?
            ''', (user_id, active_session_id))
            conn.commit()
        except Exception as e:
            print(f"Error deactivating sessions: {e}")
        finally:
            conn.close()

    # ── Document Analysis ─────────────────────────────────────────────────────
    def save_document_analysis(self, session_id: int, filename: str, file_size: int,
                                original_content: str, analysis_content: str) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('''
                INSERT INTO document_analysis (session_id, filename, file_size, original_content, analysis_content)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_id, filename, file_size, original_content, analysis_content))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving document analysis: {e}")
            return False
        finally:
            conn.close()

    def get_document_analysis(self, session_id: int) -> Optional[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT filename, file_size, original_content, analysis_content, created_at
                FROM document_analysis WHERE session_id = ?
                ORDER BY created_at DESC LIMIT 1
            ''', (session_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    # ── Reports ───────────────────────────────────────────────────────────────
    def save_report_generation(self, session_id: int, report_name: str, user_data: Dict) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('INSERT INTO reports (session_id, report_name, user_data) VALUES (?, ?, ?)',
                         (session_id, report_name, json.dumps(user_data)))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving report: {e}")
            return False
        finally:
            conn.close()

    def get_reports(self, session_id: int) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT report_name, user_data, generated_at FROM reports
                WHERE session_id = ? ORDER BY generated_at DESC
            ''', (session_id,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    # ── User Cases (NEW) ──────────────────────────────────────────────────────
    def get_user_cases(self, user_id: str) -> List[Dict]:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM user_cases WHERE user_id = ?
                ORDER BY updated_at DESC
            ''', (user_id,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def create_user_case(self, user_id: str, data: Dict) -> Dict:
        conn = self.get_connection()
        try:
            self.create_or_update_user(user_id)
            case_uuid = str(uuid.uuid4())
            conn.execute('''
                INSERT INTO user_cases
                (case_uuid, user_id, title, case_type, court, case_number, status,
                 description, filed_date, next_hearing, priority, progress, tags, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (case_uuid, user_id,
                  data.get('title', 'New Case'),
                  data.get('case_type', 'Civil'),
                  data.get('court', ''),
                  data.get('case_number', ''),
                  data.get('status', 'Active'),
                  data.get('description', ''),
                  data.get('filed_date', ''),
                  data.get('next_hearing', ''),
                  data.get('priority', 'normal'),
                  data.get('progress', 0),
                  json.dumps(data.get('tags', [])),
                  data.get('notes', '')))
            conn.commit()
            return {'case_uuid': case_uuid, **data}
        except Exception as e:
            print(f"Error creating case: {e}")
            return {}
        finally:
            conn.close()

    def update_user_case(self, case_uuid: str, user_id: str, data: Dict) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('''
                UPDATE user_cases SET
                    title = ?, case_type = ?, court = ?, case_number = ?,
                    status = ?, description = ?, filed_date = ?, next_hearing = ?,
                    priority = ?, progress = ?, tags = ?, notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE case_uuid = ? AND user_id = ?
            ''', (data.get('title'), data.get('case_type'), data.get('court'),
                  data.get('case_number'), data.get('status'), data.get('description'),
                  data.get('filed_date'), data.get('next_hearing'), data.get('priority'),
                  data.get('progress', 0), json.dumps(data.get('tags', [])),
                  data.get('notes'), case_uuid, user_id))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating case: {e}")
            return False
        finally:
            conn.close()

    def delete_user_case(self, case_uuid: str, user_id: str) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('DELETE FROM user_cases WHERE case_uuid = ? AND user_id = ?',
                         (case_uuid, user_id))
            conn.commit()
            return True
        except Exception as e:
            return False
        finally:
            conn.close()

    # ── Notifications (NEW) ───────────────────────────────────────────────────
    def get_notifications(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        conn = self.get_connection()
        try:
            q = '''
                SELECT * FROM notifications
                WHERE user_id = ?
                  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            '''
            if unread_only:
                q += ' AND is_read = 0'
            q += ' ORDER BY created_at DESC LIMIT 50'
            cursor = conn.execute(q, (user_id,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def create_notification(self, user_id: str, type_: str, title: str,
                             message: str, link_panel: str = '', priority: str = 'normal',
                             expires_days: int = 30) -> bool:
        conn = self.get_connection()
        try:
            expires = (datetime.datetime.utcnow() +
                       datetime.timedelta(days=expires_days)).isoformat()
            conn.execute('''
                INSERT INTO notifications (user_id, type, title, message, link_panel, priority, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, type_, title, message, link_panel, priority, expires))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error creating notification: {e}")
            return False
        finally:
            conn.close()

    def mark_notification_read(self, notif_id: int, user_id: str) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
                         (notif_id, user_id))
            conn.commit()
            return True
        except:
            return False
        finally:
            conn.close()

    def mark_all_read(self, user_id: str) -> bool:
        conn = self.get_connection()
        try:
            conn.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', (user_id,))
            conn.commit()
            return True
        except:
            return False
        finally:
            conn.close()

    def get_unread_count(self, user_id: str) -> int:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT COUNT(*) as cnt FROM notifications
                WHERE user_id = ? AND is_read = 0
                  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ''', (user_id,))
            return cursor.fetchone()['cnt']
        finally:
            conn.close()

    # ── Analytics ─────────────────────────────────────────────────────────────
    def get_user_statistics(self, user_id: str) -> Dict:
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT COUNT(*) as total_sessions,
                       SUM(message_count) as total_messages,
                       MAX(updated_at) as last_activity,
                       GROUP_CONCAT(DISTINCT intent_label) as issues_discussed
                FROM chat_sessions WHERE user_id = ?
            ''', (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else {}
        finally:
            conn.close()

    def get_system_statistics(self) -> Dict:
        conn = self.get_connection()
        try:
            stats = {}
            stats['total_users']    = conn.execute('SELECT COUNT(*) as c FROM users').fetchone()['c']
            stats['total_sessions'] = conn.execute('SELECT COUNT(*) as c FROM chat_sessions').fetchone()['c']
            stats['total_messages'] = conn.execute('SELECT COUNT(*) as c FROM messages').fetchone()['c']
            stats['active_sessions']= conn.execute('SELECT COUNT(*) as c FROM chat_sessions WHERE is_active=1').fetchone()['c']
            cursor = conn.execute('''
                SELECT intent_label, COUNT(*) as count FROM chat_sessions
                GROUP BY intent_label ORDER BY count DESC LIMIT 5
            ''')
            stats['common_issues'] = [dict(row) for row in cursor.fetchall()]
            return stats
        finally:
            conn.close()

    def update_session_intent(self, session_id: int, intent_label: str) -> bool:
        """Update only the intent_label of a session — does NOT touch messages."""
        conn = self.get_connection()
        try:
            conn.execute(
                "UPDATE chat_sessions SET intent_label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (intent_label[:50], session_id)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating intent: {e}")
            return False
        finally:
            conn.close()

    def increment_message_count(self, session_id: int) -> bool:
        """Increment message_count by 2 (user + assistant) after saving."""
        conn = self.get_connection()
        try:
            conn.execute(
                "UPDATE chat_sessions SET message_count = message_count + 2, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (session_id,)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error incrementing count: {e}")
            return False
        finally:
            conn.close()

db = LegalAIDatabase()
