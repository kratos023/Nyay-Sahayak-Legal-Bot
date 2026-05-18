// frontend/src/lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Message {
  role: "user" | "assistant";
  content: string;
  language?: string;
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  reply_translated: string;
  audio_base64?: string;
  suggestions?: Suggestions;
  input_language: string;
  output_language: string;
}

export interface Suggestions {
  topics: string[];
  helplines: [string, string][];
  cases: string[];
  followups: string[];
  show_fir: boolean;
  show_report: boolean;
}

export interface Session {
  id: number;
  session_uuid: string;
  session_name: string;
  intent_label: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  created_display: string;
  updated_display: string;
}

export interface LocationResult {
  location: string;
  places: { label: string; desc: string; url: string }[];
  helplines: { name: string; number: string; color: string }[];
}

// ── NEW: Case tracking ────────────────────────────────────────────────────────
export interface UserCase {
  id?: number;
  case_uuid?: string;
  user_id?: string;
  title: string;
  case_type: string;
  court: string;
  case_number: string;
  status: "Active" | "Closed" | "Disposed" | "Stayed" | "Appeal";
  description: string;
  filed_date: string;
  next_hearing: string;
  priority: "low" | "normal" | "high" | "urgent";
  progress: number;
  tags: string[];
  notes: string;
  days_left?: number;
}

// ── NEW: Notifications ────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  user_id: string;
  type: "hearing" | "deadline" | "news" | "followup" | "case" | "system";
  title: string;
  message: string;
  link_panel: string;
  is_read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
}

// ── NEW: Dashboard ────────────────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    total_sessions: number;
    total_messages: number;
    last_activity: string;
    active_cases: number;
    total_cases: number;
    upcoming_hearings: number;
    unread_notifications: number;
    recent_topics: string[];
  };
  upcoming_hearings: UserCase[];
  active_cases: UserCase[];
  recent_sessions: Session[];
  notifications: Notification[];
}

// ── NEW: Search ───────────────────────────────────────────────────────────────
export interface SearchResult {
  title: string;
  type: "statute" | "case_law" | "constitutional" | "procedure" | "right";
  relevance: "high" | "medium" | "low";
  description: string;
  key_points: string[];
  citation: string;
  practical_tip: string;
}

export interface SearchResponse {
  query: string;
  search_type: string;
  summary: string;
  results: SearchResult[];
  related_searches: string[];
  disclaimer: string;
  ai_note: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export async function sendMessage(payload: {
  user_id: string; message: string;
  input_language: string; output_language: string; enable_tts: boolean;
}): Promise<ChatResponse> {
  const res = await fetch(`${API}/api/chat/message`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLanguages() {
  const res = await fetch(`${API}/api/chat/languages`);
  const data = await res.json();
  return data.languages;
}

export async function getStatus(): Promise<{ gemini_available: boolean }> {
  const res = await fetch(`${API}/api/chat/status`);
  return res.json();
}

export async function clearContext(userId: string): Promise<void> {
  await fetch(`${API}/api/chat/clear-context?user_id=${userId}`, { method: "POST" });
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export async function getSessions(userId: string): Promise<Session[]> {
  try {
    const res = await fetch(`${API}/api/sessions/user/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions ?? [];
  } catch { return []; }
}

export async function getSessionMessages(sessionId: number): Promise<Message[]> {
  try {
    const res = await fetch(`${API}/api/sessions/${sessionId}/messages`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages ?? [];
  } catch { return []; }
}

export async function deleteSession(sessionId: number): Promise<void> {
  await fetch(`${API}/api/sessions/${sessionId}`, { method: "DELETE" });
}

export async function newSession(userId: string): Promise<void> {
  await fetch(`${API}/api/sessions/new?user_id=${userId}`, { method: "POST" });
}

// ── Documents ─────────────────────────────────────────────────────────────────
export async function analyzeDocument(file: File, language: string, userId?: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  if (userId) form.append("user_id", userId);
  const res = await fetch(`${API}/api/documents/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateFIR(userData: Record<string, unknown>): Promise<Blob> {
  const res = await fetch(`${API}/api/documents/fir`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

export async function generateReport(userData: Record<string, unknown>, intentLabel: string): Promise<Blob> {
  const res = await fetch(`${API}/api/documents/report`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_data: userData, intent_label: intentLabel }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

// ── Voice ─────────────────────────────────────────────────────────────────────
export async function transcribeAudio(file: File, language: string): Promise<{ text: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  const res = await fetch(`${API}/api/voice/asr`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function synthesizeSpeech(text: string, language: string) {
  const res = await fetch(`${API}/api/voice/tts`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Locations ─────────────────────────────────────────────────────────────────
export async function searchLocations(location: string): Promise<LocationResult> {
  const res = await fetch(`${API}/api/locations/search`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStates(): Promise<string[]> {
  const res = await fetch(`${API}/api/locations/states`);
  const data = await res.json();
  return data.states ?? [];
}

export async function getCommission(state: string) {
  const res = await fetch(`${API}/api/locations/commission/${encodeURIComponent(state)}`);
  return res.json();
}

// ── Dashboard (NEW) ───────────────────────────────────────────────────────────
export async function getDashboard(userId: string): Promise<DashboardData> {
  const res = await fetch(`${API}/api/dashboard/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCase(userId: string, data: Omit<UserCase, "id" | "case_uuid" | "user_id">): Promise<UserCase> {
  const res = await fetch(`${API}/api/dashboard/${userId}/cases`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.case;
}

export async function updateCase(userId: string, caseUuid: string, data: Partial<UserCase>): Promise<void> {
  await fetch(`${API}/api/dashboard/${userId}/cases/${caseUuid}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCase(userId: string, caseUuid: string): Promise<void> {
  await fetch(`${API}/api/dashboard/${userId}/cases/${caseUuid}`, { method: "DELETE" });
}

export async function getNotifications(userId: string, unreadOnly = false): Promise<{ notifications: Notification[]; unread_count: number }> {
  const res = await fetch(`${API}/api/dashboard/${userId}/notifications?unread_only=${unreadOnly}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function markNotificationRead(userId: string, notifId: number): Promise<void> {
  await fetch(`${API}/api/dashboard/${userId}/notifications/read/${notifId}`, { method: "POST" });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await fetch(`${API}/api/dashboard/${userId}/notifications/read-all`, { method: "POST" });
}

// ── Search (NEW) ──────────────────────────────────────────────────────────────
export async function legalSearch(query: string, searchType = "all", language = "English"): Promise<SearchResponse> {
  const res = await fetch(`${API}/api/search/legal`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, search_type: searchType, language }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSearchSuggestions(q: string): Promise<string[]> {
  const res = await fetch(`${API}/api/search/suggestions?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  return data.suggestions ?? [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getUserId(): string {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("nyay_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("nyay_user_id", id); }
  return id;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
