"use client";
// frontend/src/app/admin/page.tsx
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users, MessageSquare, BarChart2, Trash2, Shield,
  ChevronDown, ChevronRight, LogOut, Scale, ArrowLeft,
  Search, RefreshCw, TrendingUp, Calendar, Globe,
  Activity, Download, Eye, EyeOff, UserCheck, UserX,
  Clock, Hash, Filter, X, AlertTriangle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Account {
  id: number; email: string; name: string; role: string;
  user_id: string; created_at: string; last_login: string | null;
  session_count: number; total_messages: number;
}
interface DailyStat  { date: string; message_count: number; session_count: number; }
interface LangStat   { language: string; session_count: number; message_count: number; }
interface Stats {
  system: { total_users: number; total_sessions: number; total_messages: number; active_sessions: number };
  daily: DailyStat[]; total_accounts: number; language_stats: LangStat[];
}
interface Session {
  id: number; session_name: string; message_count: number;
  intent_label: string; updated_display: string; is_active: boolean;
}
interface Msg { role: string; content: string; timestamp: string; }

type Tab    = "users" | "stats" | "activity";
type SortBy = "joined" | "messages" | "name" | "sessions";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) { return n?.toLocaleString("en-IN") ?? "0"; }
function ago(dateStr: string | null) {
  if (!dateStr) return "Never";
  const d = new Date(dateStr), now = Date.now(), diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" });
}
function shortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

const INTENT_COLORS: Record<string, string> = {
  "Criminal Law":       "bg-red-900/50 text-red-300 border-red-800/40",
  "Family Law":         "bg-pink-900/50 text-pink-300 border-pink-800/40",
  "Consumer Rights":    "bg-blue-900/50 text-blue-300 border-blue-800/40",
  "Property Law":       "bg-orange-900/50 text-orange-300 border-orange-800/40",
  "Labour Law":         "bg-purple-900/50 text-purple-300 border-purple-800/40",
  "Constitutional":     "bg-teal-900/50 text-teal-300 border-teal-800/40",
  "General Query":      "bg-gray-800/60 text-gray-400 border-gray-700/40",
};
function intentBadge(label: string) {
  const cls = INTENT_COLORS[label] ?? "bg-gray-800/60 text-gray-400 border-gray-700/40";
  return `text-[0.6rem] font-medium px-1.5 py-0.5 rounded border ${cls}`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, sub }:
  { label:string; value:number|string; icon:React.ElementType; color:string; sub?:string }) {
  return (
    <div className="rounded-2xl p-4 space-y-3 border"
      style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-widest" style={{ color:"var(--text-3)" }}>{label}</p>
        <Icon size={14} className={color} />
      </div>
      <p className="text-2xl font-bold" style={{ color:"var(--text)" }}>{typeof value === "number" ? fmt(value) : value}</p>
      {sub && <p className="text-[0.65rem]" style={{ color:"var(--text-3)" }}>{sub}</p>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab]                       = useState<Tab>("users");
  const [accounts, setAccounts]             = useState<Account[]>([]);
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [search, setSearch]                 = useState("");
  const [roleFilter, setRoleFilter]         = useState<"all"|"user"|"admin">("all");
  const [expanded, setExpanded]             = useState<string | null>(null);
  const [sessions, setSessions]             = useState<Record<string, Session[]>>({});
  const [messages, setMessages]             = useState<Record<number, Msg[]>>({});
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [sortBy, setSortBy]                 = useState<SortBy>("joined");
  const [previewMsg, setPreviewMsg]         = useState<{ name:string; msgs:Msg[] } | null>(null);
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null);
  const [activityRange, setActivityRange]   = useState<7|14|30>(14);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    loadData();
  }, [user]);

  async function apiFetch(path: string) {
    const res = await fetch(`${API}/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function loadData(quiet = false) {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const [u, s] = await Promise.all([apiFetch("/admin/users"), apiFetch("/admin/stats")]);
      setAccounts(u.users); setStats(s);
    } catch (e) { console.error(e); }
    setLoading(false); setRefreshing(false);
  }

  async function loadSessions(userId: string) {
    if (sessions[userId]) return;
    const data = await apiFetch(`/admin/users/${userId}/chats`).catch(() => null);
    if (data) setSessions(prev => ({ ...prev, [userId]: data.sessions }));
  }

  async function loadMessages(sessionId: number, userId: string) {
    if (messages[sessionId]) return;
    const data = await apiFetch(`/admin/users/${userId}/chats/${sessionId}/messages`).catch(() => null);
    if (data) setMessages(prev => ({ ...prev, [sessionId]: data.messages }));
  }

  async function deleteUser(userId: string) {
    await fetch(`${API}/api/admin/users/${userId}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
    setAccounts(prev => prev.filter(a => a.user_id !== userId));
    setDeleteConfirm(null);
  }

  async function deleteChat(sessionId: number) {
    await fetch(`${API}/api/admin/chats/${sessionId}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
    setSessions(prev => { const u={...prev}; for (const k in u) u[k]=u[k].filter(s=>s.id!==sessionId); return u; });
  }

  function toggleUser(userId: string) {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId); loadSessions(userId);
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = accounts.filter(a =>
      (roleFilter === "all" || a.role === roleFilter) &&
      (a.name.toLowerCase().includes(search.toLowerCase()) ||
       a.email.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === "messages") list = [...list].sort((a,b) => b.total_messages - a.total_messages);
    else if (sortBy === "sessions") list = [...list].sort((a,b) => b.session_count - a.session_count);
    else if (sortBy === "name")  list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [accounts, search, sortBy, roleFilter]);

  const activityData  = stats?.daily.slice(0, activityRange) ?? [];
  const maxMsgs       = Math.max(...activityData.map(d => d.message_count), 1);
  const totalActivity = activityData.reduce((n,d) => n + d.message_count, 0);
  const maxLang       = Math.max(...(stats?.language_stats.map(l => l.message_count) ?? []), 1);

  function exportCSV() {
    const rows = [["Name","Email","Role","Sessions","Messages","Joined","Last Login"]];
    accounts.forEach(a => rows.push([a.name,a.email,a.role,String(a.session_count),String(a.total_messages),a.created_at,a.last_login||"Never"]));
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "nyayshakti-users.csv"; a.click();
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background:"var(--bg)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background:"linear-gradient(135deg,#c9920a,#7c5a06)" }}>
          <Scale size={18} className="text-amber-100" />
        </div>
        <p className="text-sm animate-pulse" style={{ color:"var(--text-3)" }}>Loading admin panel…</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background:"var(--bg)", color:"var(--text)" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b z-20"
        style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#c9920a,#7c5a06)" }}>
            <Scale size={14} className="text-amber-100" />
          </div>
          <span className="font-display text-base" style={{ color:"var(--gold-light)" }}>Nyay-Sahayak</span>
          <span className="text-[0.6rem] px-1.5 py-0.5 rounded font-semibold tracking-wider"
            style={{ background:"rgba(201,146,10,0.15)", border:"1px solid rgba(201,146,10,0.3)", color:"#f0b429" }}>
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => loadData(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40"
            style={{ color:"var(--text-3)" }}>
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color:"var(--text-2)" }}>
            <ArrowLeft size={13} /> App
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

          {/* ── KPI Row ─────────────────────────────────────────────────── */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total Users"    value={stats.total_accounts}         icon={Users}         color="text-blue-400"   sub={`${accounts.filter(a=>a.role==="admin").length} admin`} />
              <KpiCard label="Total Sessions" value={stats.system.total_sessions}  icon={MessageSquare} color="text-purple-400" sub={`${stats.system.active_sessions} active`} />
              <KpiCard label="Total Messages" value={stats.system.total_messages}  icon={TrendingUp}    color="text-green-400"  sub="all time" />
              <KpiCard label="Avg Msgs/User"  value={stats.total_accounts ? Math.round(stats.system.total_messages / stats.total_accounts) : 0} icon={Activity} color="text-amber-400" sub="per user" />
            </div>
          )}

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className="flex gap-0 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            {([
              { id:"users",    label:"Users",          icon:Users    },
              { id:"activity", label:"Activity",       icon:Calendar },
              { id:"stats",    label:"Language Stats", icon:Globe    },
            ] as const).map(({ id, label, icon:Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all"
                style={{
                  color: tab===id ? "var(--gold-light)" : "var(--text-3)",
                  borderBottom: tab===id ? "2px solid var(--gold)" : "2px solid transparent",
                }}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>

          {/* ══ USERS TAB ═══════════════════════════════════════════════════ */}
          {tab === "users" && (
            <div className="space-y-3">

              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-48">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-3)" }}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Search name or email…"
                    className="w-full pl-8 pr-4 py-2 rounded-xl text-sm focus:outline-none border"
                    style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.08)", color:"var(--text)" }}/>
                </div>
                <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as typeof roleFilter)}
                  className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.08)", color:"var(--text)" }}>
                  <option value="all">All roles</option>
                  <option value="user">Users only</option>
                  <option value="admin">Admins only</option>
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value as SortBy)}
                  className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.08)", color:"var(--text)" }}>
                  <option value="joined">Newest first</option>
                  <option value="messages">Most messages</option>
                  <option value="sessions">Most sessions</option>
                  <option value="name">Name A–Z</option>
                </select>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors"
                  style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.08)", color:"var(--text-2)" }}>
                  <Download size={12}/> Export CSV
                </button>
                <span className="text-xs ml-auto" style={{ color:"var(--text-3)" }}>
                  {filtered.length} of {accounts.length} users
                </span>
              </div>

              {/* User cards */}
              <div className="space-y-2">
                {filtered.map(acc => {
                  const isExpanded = expanded === acc.user_id;
                  const isActive   = acc.last_login && (Date.now() - new Date(acc.last_login).getTime()) < 7*86400000;
                  return (
                    <div key={acc.user_id} className="rounded-2xl border overflow-hidden transition-all"
                      style={{ background:"var(--bg-2)", borderColor: isExpanded ? "rgba(201,146,10,0.25)" : "rgba(255,255,255,0.06)" }}>

                      {/* Row */}
                      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => toggleUser(acc.user_id)}>

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                            ${acc.role==="admin" ? "bg-gradient-to-br from-yellow-600 to-yellow-900 text-yellow-100"
                                                 : "bg-gradient-to-br from-blue-700 to-blue-900 text-blue-100"}`}>
                            {acc.name[0]?.toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2
                            ${isActive ? "bg-green-500" : "bg-gray-600"}`}
                            style={{ borderColor:"var(--bg-2)" }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>{acc.name}</p>
                            {acc.role === "admin" && (
                              <span className="text-[0.58rem] px-1.5 py-0.5 rounded font-semibold tracking-wider"
                                style={{ background:"rgba(201,146,10,0.15)", border:"1px solid rgba(201,146,10,0.3)", color:"#f0b429" }}>
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>{acc.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[0.65rem] flex items-center gap-1" style={{ color:"var(--text-3)" }}>
                              <Calendar size={9}/> {shortDate(acc.created_at)}
                            </span>
                            <span className="text-[0.65rem] flex items-center gap-1" style={{ color: isActive ? "#34d399" : "var(--text-3)" }}>
                              <Clock size={9}/> {ago(acc.last_login)}
                            </span>
                          </div>
                        </div>

                        {/* Stats pills */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-center px-3 py-1.5 rounded-xl"
                            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-sm font-bold" style={{ color:"var(--text)" }}>{acc.session_count}</p>
                            <p className="text-[0.6rem]" style={{ color:"var(--text-3)" }}>chats</p>
                          </div>
                          <div className="text-center px-3 py-1.5 rounded-xl"
                            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-sm font-bold" style={{ color:"var(--text)" }}>{acc.total_messages}</p>
                            <p className="text-[0.6rem]" style={{ color:"var(--text-3)" }}>msgs</p>
                          </div>
                          <div className="flex items-center gap-1 ml-1">
                            {acc.role !== "admin" && (
                              <button
                                onClick={e => { e.stopPropagation(); setDeleteConfirm(acc.user_id); }}
                                className="p-1.5 rounded-lg transition-all hover:bg-red-950/40 hover:text-red-400"
                                style={{ color:"var(--text-3)" }} title="Delete user">
                                <Trash2 size={12}/>
                              </button>
                            )}
                            <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                              style={{ color:"var(--text-3)" }}/>
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded: Sessions ── */}
                      {isExpanded && (
                        <div className="border-t px-5 py-4 space-y-2"
                          style={{ background:"var(--bg-3)", borderColor:"rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[0.65rem] uppercase tracking-widest" style={{ color:"var(--text-3)" }}>
                              Chat Sessions ({sessions[acc.user_id]?.length ?? "…"})
                            </p>
                            {sessions[acc.user_id]?.length > 0 && (
                              <button
                                onClick={() => {
                                  const msgs = Object.values(messages).flat();
                                  setPreviewMsg({ name: acc.name, msgs });
                                }}
                                className="text-[0.65rem] flex items-center gap-1 transition-colors"
                                style={{ color:"var(--text-3)" }}>
                                <Eye size={10}/> Preview all
                              </button>
                            )}
                          </div>

                          {!sessions[acc.user_id] && (
                            <p className="text-xs animate-pulse" style={{ color:"var(--text-3)" }}>Loading…</p>
                          )}
                          {sessions[acc.user_id]?.length === 0 && (
                            <p className="text-xs" style={{ color:"var(--text-3)" }}>No sessions yet</p>
                          )}

                          {sessions[acc.user_id]?.map(sess => (
                            <div key={sess.id} className="rounded-xl border overflow-hidden"
                              style={{ borderColor:"rgba(255,255,255,0.05)" }}>

                              <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/[0.03]"
                                onClick={() => {
                                  const next = expandedSession === sess.id ? null : sess.id;
                                  setExpandedSession(next);
                                  if (next) loadMessages(sess.id, acc.user_id);
                                }}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sess.is_active ? "bg-green-500" : "bg-gray-600"}`}/>
                                  <p className="text-xs truncate" style={{ color:"var(--text-2)" }}>{sess.session_name}</p>
                                  {sess.intent_label && (
                                    <span className={intentBadge(sess.intent_label)}>{sess.intent_label}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0" style={{ color:"var(--text-3)" }}>
                                  <span className="text-[0.65rem]">{sess.message_count} msgs</span>
                                  <span className="text-[0.65rem]">{sess.updated_display}</span>
                                  <button onClick={e=>{e.stopPropagation();deleteChat(sess.id);}}
                                    className="p-1 rounded hover:text-red-400 transition-colors">
                                    <Trash2 size={10}/>
                                  </button>
                                  <ChevronDown size={10} className={`transition-transform ${expandedSession===sess.id?"rotate-0":"-rotate-90"}`}/>
                                </div>
                              </div>

                              {/* Messages */}
                              {expandedSession === sess.id && (
                                <div className="border-t px-4 py-3 space-y-2 max-h-64 overflow-y-auto"
                                  style={{ background:"var(--bg)", borderColor:"rgba(255,255,255,0.05)" }}>
                                  {!messages[sess.id] && <p className="text-xs animate-pulse" style={{color:"var(--text-3)"}}>Loading…</p>}
                                  {messages[sess.id]?.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.role==="user"?"flex-row-reverse":""}`}>
                                      <span className={`text-[0.58rem] px-1.5 py-0.5 rounded-full flex-shrink-0 h-fit font-semibold
                                        ${msg.role==="user"
                                          ? "bg-blue-900/50 text-blue-300 border border-blue-800/40"
                                          : "bg-amber-900/40 text-amber-400 border border-amber-800/30"}`}>
                                        {msg.role==="user"?"User":"AI"}
                                      </span>
                                      <p className="text-[0.73rem] leading-relaxed line-clamp-4 flex-1"
                                        style={{ color:"var(--text-2)" }}>
                                        {msg.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-14 text-sm" style={{ color:"var(--text-3)" }}>
                    No users match your filters
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ACTIVITY TAB ════════════════════════════════════════════════ */}
          {tab === "activity" && stats && (
            <div className="space-y-4">

              {/* Bar chart card */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between"
                  style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>Daily Messages</p>
                    <p className="text-[0.68rem] mt-0.5" style={{ color:"var(--text-3)" }}>
                      {fmt(totalActivity)} messages in last {activityRange} days
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {([7,14,30] as const).map(r => (
                      <button key={r} onClick={() => setActivityRange(r)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: activityRange===r ? "rgba(201,146,10,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${activityRange===r ? "rgba(201,146,10,0.4)" : "rgba(255,255,255,0.06)"}`,
                          color: activityRange===r ? "#f0b429" : "var(--text-3)",
                        }}>
                        {r}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-5">
                  {activityData.length === 0
                    ? <p className="text-center py-8 text-sm" style={{ color:"var(--text-3)" }}>No activity yet</p>
                    : (
                      <div className="space-y-2">
                        {activityData.map(d => (
                          <div key={d.date} className="flex items-center gap-3">
                            <span className="text-[0.68rem] w-16 text-right flex-shrink-0" style={{ color:"var(--text-3)" }}>
                              {shortDate(d.date)}
                            </span>
                            <div className="flex-1 h-6 rounded-lg overflow-hidden"
                              style={{ background:"rgba(255,255,255,0.04)" }}>
                              <div className="h-full rounded-lg transition-all"
                                style={{
                                  width: `${Math.max((d.message_count/maxMsgs)*100, d.message_count>0?2:0)}%`,
                                  background: "linear-gradient(90deg,#92400e,#f59e0b)",
                                }}/>
                            </div>
                            <div className="text-right flex-shrink-0 w-20">
                              <span className="text-[0.68rem] font-mono" style={{ color:"var(--text-2)" }}>
                                {d.message_count} msg
                              </span>
                              <span className="text-[0.58rem] ml-1.5" style={{ color:"var(--text-3)" }}>
                                {d.session_count} sess
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Summary table */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="px-5 py-3 border-b"
                  style={{ borderColor:"rgba(255,255,255,0.05)", background:"var(--bg-3)" }}>
                  <div className="grid grid-cols-3 text-[0.65rem] uppercase tracking-widest" style={{ color:"var(--text-3)" }}>
                    <span>Date</span>
                    <span className="text-right">Messages</span>
                    <span className="text-right">Sessions</span>
                  </div>
                </div>
                <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                  {stats.daily.map(d => (
                    <div key={d.date} className="grid grid-cols-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm" style={{ color:"var(--text-2)" }}>{d.date}</span>
                      <span className="text-sm text-right font-mono" style={{ color:"var(--text)" }}>{d.message_count}</span>
                      <span className="text-sm text-right font-mono" style={{ color:"var(--text)" }}>{d.session_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ LANGUAGE STATS TAB ══════════════════════════════════════════ */}
          {tab === "stats" && stats && (
            <div className="space-y-4">

              {/* Language breakdown */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>Legal Topic Distribution</p>
                  <p className="text-[0.68rem] mt-0.5" style={{ color:"var(--text-3)" }}>
                    Based on {fmt(stats.system.total_sessions)} sessions
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {stats.language_stats.length === 0
                    ? <p className="text-center py-6 text-sm" style={{ color:"var(--text-3)" }}>No data yet</p>
                    : stats.language_stats.map((l, i) => {
                        const pct = Math.round((l.message_count / maxLang) * 100);
                        const colors = [
                          "from-blue-800 to-blue-500", "from-purple-800 to-purple-500",
                          "from-teal-800 to-teal-500",  "from-orange-800 to-orange-500",
                          "from-pink-800 to-pink-500",  "from-green-800 to-green-500",
                          "from-indigo-800 to-indigo-500",
                        ];
                        return (
                          <div key={l.language} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium" style={{ color:"var(--text)" }}>{l.language || "General Query"}</span>
                              <div className="flex items-center gap-3" style={{ color:"var(--text-3)" }}>
                                <span>{l.session_count} sessions</span>
                                <span className="font-mono font-semibold" style={{ color:"var(--text-2)" }}>{l.message_count} msgs</span>
                                <span className="w-8 text-right">{pct}%</span>
                              </div>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden"
                              style={{ background:"rgba(255,255,255,0.05)" }}>
                              <div className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all`}
                                style={{ width:`${pct}%` }}/>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </div>

              {/* Top users table */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ background:"var(--bg-2)", borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="px-5 py-3 border-b" style={{ background:"var(--bg-3)", borderColor:"rgba(255,255,255,0.05)" }}>
                  <p className="text-[0.65rem] uppercase tracking-widest" style={{ color:"var(--text-3)" }}>
                    Top 10 Most Active Users
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                  {[...accounts].sort((a,b) => b.total_messages - a.total_messages).slice(0,10).map((acc, i) => (
                    <div key={acc.user_id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-[0.65rem] font-bold w-5 text-center flex-shrink-0"
                        style={{ color: i < 3 ? "#f0b429" : "var(--text-3)" }}>
                        {i+1}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        bg-gradient-to-br from-blue-700 to-blue-900 text-blue-100">
                        {acc.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color:"var(--text)" }}>{acc.name}</p>
                        <p className="text-[0.65rem] truncate" style={{ color:"var(--text-3)" }}>{acc.email}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div>
                          <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>{acc.total_messages}</p>
                          <p className="text-[0.6rem]" style={{ color:"var(--text-3)" }}>msgs</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>{acc.session_count}</p>
                          <p className="text-[0.6rem]" style={{ color:"var(--text-3)" }}>chats</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Delete confirm modal ────────────────────────────────────────── */}
      {deleteConfirm && (() => {
        const acc = accounts.find(a => a.user_id === deleteConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 border"
              style={{ background:"var(--bg-2)", borderColor:"rgba(239,68,68,0.3)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(239,68,68,0.15)" }}>
                  <AlertTriangle size={18} className="text-red-400"/>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>Delete User</p>
                  <p className="text-xs" style={{ color:"var(--text-3)" }}>This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm" style={{ color:"var(--text-2)" }}>
                Delete <strong style={{ color:"var(--text)" }}>{acc?.name}</strong> and all their chats, sessions and data?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl text-sm border transition-colors"
                  style={{ borderColor:"rgba(255,255,255,0.1)", color:"var(--text-2)" }}>
                  Cancel
                </button>
                <button onClick={() => deleteUser(deleteConfirm)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
