"use client";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Scale, Calendar, FileText, MessageSquare,
  TrendingUp, Plus, Trash2, Edit3, Check, X, ChevronRight,
  AlertCircle, Clock, Bell, BookOpen, Activity
} from "lucide-react";
import GlassMorphCard from "./GlassMorphCard";
import { showToast } from "./FloatingToasts";
import {
  getDashboard, createCase, updateCase, deleteCase,
  type DashboardData, type UserCase
} from "@/lib/api";

interface Props {
  userId: string;
  onClose: () => void;
  onOpenChat: () => void;
}

const CASE_TYPES = ["Civil", "Criminal", "Family", "Consumer", "Labour", "Property", "Constitutional", "Other"];
const STATUSES   = ["Active", "Closed", "Disposed", "Stayed", "Appeal"];
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const PRIORITY_COLOR: Record<string, string> = {
  low:    "text-slate-400 bg-slate-900/40 border-slate-700/40",
  normal: "text-blue-400 bg-blue-900/30 border-blue-700/30",
  high:   "text-amber-400 bg-amber-900/30 border-amber-700/30",
  urgent: "text-red-400 bg-red-900/30 border-red-700/40",
};

const STATUS_COLOR: Record<string, string> = {
  Active:   "text-green-400 bg-green-900/30",
  Closed:   "text-slate-400 bg-slate-900/30",
  Disposed: "text-purple-400 bg-purple-900/30",
  Stayed:   "text-amber-400 bg-amber-900/30",
  Appeal:   "text-blue-400 bg-blue-900/30",
};

const TYPE_ICON: Record<string, string> = {
  Civil: "⚖️", Criminal: "🚨", Family: "👨‍👩‍👧", Consumer: "🛒",
  Labour: "👷", Property: "🏠", Constitutional: "📜", Other: "📁",
};

const EMPTY_CASE: Omit<UserCase, "id" | "case_uuid" | "user_id"> = {
  title: "", case_type: "Civil", court: "", case_number: "",
  status: "Active", description: "", filed_date: "", next_hearing: "",
  priority: "normal", progress: 0, tags: [], notes: "",
};

export default function Dashboard({ userId, onClose, onOpenChat }: Props) {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"overview" | "cases" | "hearings">("overview");
  const [showForm, setShowForm]   = useState(false);
  const [editCase, setEditCase]   = useState<UserCase | null>(null);
  const [formData, setFormData]   = useState({ ...EMPTY_CASE });
  const [saving, setSaving]       = useState(false);
  const [allCases, setAllCases]   = useState<UserCase[]>([]);

  const load = useCallback(async () => {
    try {
      const [d, casesRes] = await Promise.all([
        getDashboard(userId),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/dashboard/${userId}/cases`)
          .then(r => r.json()).catch(() => ({ cases: [] }))
      ]);
      setData(d);
      setAllCases(casesRes.cases || []);
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  function openAdd()  { setFormData({ ...EMPTY_CASE }); setEditCase(null); setShowForm(true); }
  function openEdit(c: UserCase) { setFormData({ ...c }); setEditCase(c); setShowForm(true); }

  async function handleSave() {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      if (editCase?.case_uuid) {
        await updateCase(userId, editCase.case_uuid, formData);
      } else {
        await createCase(userId, formData);
      }
      setShowForm(false);
      await load();
      showToast({ type: "success", title: editCase ? "Case updated" : "Case added", duration: 3000 });
    } catch {
      showToast({ type: "error", title: "Failed to save case", message: "Please try again.", duration: 4000 });
    }
    finally { setSaving(false); }
  }

  async function handleDelete(c: UserCase) {
    if (!c.case_uuid) return;
    if (!confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    try {
      await deleteCase(userId, c.case_uuid);
      await load();
      showToast({ type: "success", title: "Case deleted", duration: 3000 });
    } catch {
      showToast({ type: "error", title: "Could not delete case", duration: 3000 });
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm">Loading your dashboard…</p>
      </div>
    </div>
  );

  const s = data?.stats;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20
            border border-amber-500/30 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-[0.95rem]">My Legal Dashboard</h2>
            <p className="text-white/40 text-[0.65rem]">Personal case tracker & analytics</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex gap-1 px-6 py-3 border-b border-white/[0.04]">
        {(["overview", "cases", "hearings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[0.75rem] font-medium capitalize transition-all ${
              tab === t ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-white/50 hover:text-white/80"
            }`}>
            {t === "overview" ? "📊 Overview" : t === "cases" ? "📁 My Cases" : "📅 Hearings"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Scale,         label: "Active Cases",     value: s?.active_cases ?? 0,          color: "text-amber-400",  bg: "from-amber-500/10 to-amber-700/5" },
                { icon: Calendar,      label: "Upcoming Hearings",value: s?.upcoming_hearings ?? 0,      color: "text-blue-400",   bg: "from-blue-500/10 to-blue-700/5" },
                { icon: MessageSquare, label: "Chat Sessions",    value: s?.total_sessions ?? 0,         color: "text-emerald-400",bg: "from-emerald-500/10 to-emerald-700/5" },
                { icon: Bell,          label: "Notifications",    value: s?.unread_notifications ?? 0,   color: "text-rose-400",   bg: "from-rose-500/10 to-rose-700/5" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <GlassMorphCard key={label} className="p-4 rounded-xl">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${bg} mb-3`}>
                    <Icon size={16} className={color} />
                  </div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-[0.7rem] text-white/50 mt-1">{label}</p>
                </GlassMorphCard>
              ))}
            </div>

            {/* Upcoming hearings preview */}
            {(data?.upcoming_hearings?.length ?? 0) > 0 && (
              <GlassMorphCard className="rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" /> Upcoming Hearings
                  </p>
                  <button onClick={() => setTab("hearings")} className="text-[0.7rem] text-amber-400 hover:underline flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {data!.upcoming_hearings.slice(0, 3).map(c => (
                    <div key={c.case_uuid} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <div className={`px-2 py-1 rounded-md text-[0.65rem] font-bold min-w-[3rem] text-center
                        ${(c.days_left ?? 99) <= 1 ? "bg-red-900/40 text-red-300" :
                          (c.days_left ?? 99) <= 3 ? "bg-amber-900/40 text-amber-300" :
                          "bg-blue-900/30 text-blue-300"}`}>
                        {c.days_left === 0 ? "TODAY" : `${c.days_left}d`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8rem] text-white/90 truncate">{c.title}</p>
                        <p className="text-[0.65rem] text-white/50">{c.court || "Court"} · {c.next_hearing}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] ${PRIORITY_COLOR[c.priority]}`}>
                        {c.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassMorphCard>
            )}

            {/* Recent topics */}
            {(s?.recent_topics?.length ?? 0) > 0 && (
              <GlassMorphCard className="rounded-xl p-4">
                <p className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-purple-400" /> Recent Legal Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {s!.recent_topics.map(t => (
                    <button key={t} onClick={onOpenChat}
                      className="px-3 py-1.5 rounded-full text-[0.7rem] bg-purple-900/30 border border-purple-700/30 text-purple-300 hover:bg-purple-800/40 transition-all">
                      {t}
                    </button>
                  ))}
                </div>
              </GlassMorphCard>
            )}

            {/* Recent sessions */}
            {(data?.recent_sessions?.length ?? 0) > 0 && (
              <GlassMorphCard className="rounded-xl p-4">
                <p className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-emerald-400" /> Recent Conversations
                </p>
                <div className="space-y-2">
                  {data!.recent_sessions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all">
                      <div className="w-7 h-7 rounded-lg bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={12} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.78rem] text-white/80 truncate">{s.session_name}</p>
                        <p className="text-[0.62rem] text-white/40">{s.intent_label} · {s.message_count} messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassMorphCard>
            )}

            {/* Empty state */}
            {(data?.active_cases?.length ?? 0) === 0 && (data?.recent_sessions?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-900/20 border border-amber-700/20 flex items-center justify-center">
                  <LayoutDashboard size={24} className="text-amber-400/60" />
                </div>
                <div>
                  <p className="text-white/70 font-medium">Your dashboard is empty</p>
                  <p className="text-white/40 text-sm mt-1">Add your first case or start a chat to see activity here.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setTab("cases"); openAdd(); }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/30 transition-all">
                    + Add Case
                  </button>
                  <button onClick={onOpenChat}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all">
                    Start Chat
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CASES ── */}
        {tab === "cases" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">{allCases.filter(c => c.status === "Active").length} active · {allCases.length} total</p>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/30 transition-all">
                <Plus size={14} /> Add Case
              </button>
            </div>

            {/* Case form */}
            {showForm && (
              <GlassMorphCard className="rounded-xl p-5 border border-amber-500/20">
                <p className="text-white font-semibold mb-4">{editCase ? "Edit Case" : "New Case"}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "Case Title *", key: "title", type: "text", placeholder: "e.g. Property dispute with neighbour" },
                    { label: "Case Number", key: "case_number", type: "text", placeholder: "e.g. CS 123/2024" },
                    { label: "Court / Tribunal", key: "court", type: "text", placeholder: "e.g. Delhi District Court" },
                    { label: "Filed Date", key: "filed_date", type: "date", placeholder: "" },
                    { label: "Next Hearing", key: "next_hearing", type: "date", placeholder: "" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className={key === "title" ? "md:col-span-2" : ""}>
                      <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-1 block">{label}</label>
                      <input type={type} value={formData[key as keyof typeof formData] as string} placeholder={placeholder}
                        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                          placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-all" />
                    </div>
                  ))}
                  {[
                    { label: "Case Type", key: "case_type", opts: CASE_TYPES },
                    { label: "Status", key: "status", opts: STATUSES },
                    { label: "Priority", key: "priority", opts: PRIORITIES },
                  ].map(({ label, key, opts }) => (
                    <div key={key}>
                      <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-1 block">{label}</label>
                      <select value={formData[key as keyof typeof formData] as string}
                        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                          focus:outline-none focus:border-amber-400/50 transition-all">
                        {opts.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-1 block">
                      Progress ({formData.progress}%)
                    </label>
                    <input type="range" min="0" max="100" value={formData.progress}
                      onChange={e => setFormData(p => ({ ...p, progress: Number(e.target.value) }))}
                      className="w-full accent-amber-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-1 block">Notes</label>
                    <textarea value={formData.notes} rows={3}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Case notes, important dates, contacts..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                        placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-all resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSave} disabled={saving || !formData.title.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold text-sm
                      hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <Check size={14} /> {saving ? "Saving…" : "Save Case"}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                </div>
              </GlassMorphCard>
            )}

            {/* Cases list */}
            <div className="space-y-3">
              {allCases.map(c => (
                <GlassMorphCard key={c.case_uuid} hover className="rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-lg">
                      {TYPE_ICON[c.case_type] || "📁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[0.85rem] text-white font-medium leading-tight">{c.title}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-amber-900/20 transition-all">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium ${STATUS_COLOR[c.status] || ""}`}>
                          {c.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] border ${PRIORITY_COLOR[c.priority]}`}>
                          {c.priority}
                        </span>
                        <span className="text-[0.65rem] text-white/40">{c.case_type}</span>
                        {c.court && <span className="text-[0.65rem] text-white/40">· {c.court}</span>}
                        {c.case_number && <span className="text-[0.65rem] text-white/30">#{c.case_number}</span>}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[0.6rem] text-white/40">Progress</span>
                          <span className="text-[0.6rem] text-white/40">{c.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                            style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                      {c.next_hearing && (
                        <p className="text-[0.65rem] text-blue-400 mt-2 flex items-center gap-1">
                          <Calendar size={10} /> Next hearing: {c.next_hearing}
                          {c.days_left !== undefined && ` (${c.days_left === 0 ? "Today!" : `${c.days_left} days`})`}
                        </p>
                      )}
                      {c.notes && <p className="text-[0.65rem] text-white/40 mt-1 line-clamp-2">{c.notes}</p>}
                    </div>
                  </div>
                </GlassMorphCard>
              ))}
            </div>

{allCases.length === 0 && !showForm && (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">No cases tracked yet.</p>
                <button onClick={openAdd} className="mt-3 text-amber-400 text-sm hover:underline">+ Add your first case</button>
              </div>
            )}
          </>
        )}

        {/* ── HEARINGS ── */}
        {tab === "hearings" && (
          <>
            <p className="text-white/50 text-sm">{data?.upcoming_hearings?.length ?? 0} hearings in the next 30 days</p>
            {(data?.upcoming_hearings?.length ?? 0) === 0 ? (
              <div className="text-center py-16">
                <Calendar size={36} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No upcoming hearings.</p>
                <p className="text-white/30 text-xs mt-1">Add a case with a hearing date to see reminders here.</p>
                <button onClick={() => setTab("cases")} className="mt-4 text-amber-400 text-sm hover:underline">
                  Go to My Cases →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {data!.upcoming_hearings.map(c => (
                  <GlassMorphCard key={c.case_uuid} className={`rounded-xl p-4 border ${
                    (c.days_left ?? 99) <= 1 ? "border-red-500/30 bg-red-950/10" :
                    (c.days_left ?? 99) <= 3 ? "border-amber-500/30 bg-amber-950/10" :
                    "border-blue-500/20"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl flex-shrink-0 font-bold ${
                        (c.days_left ?? 99) <= 1 ? "bg-red-900/40 text-red-300" :
                        (c.days_left ?? 99) <= 3 ? "bg-amber-900/40 text-amber-300" :
                        "bg-blue-900/30 text-blue-300"
                      }`}>
                        {c.days_left === 0 ? (
                          <><span className="text-xl">📅</span><span className="text-[0.55rem] mt-0.5">TODAY</span></>
                        ) : (
                          <><span className="text-xl font-bold">{c.days_left}</span><span className="text-[0.55rem]">days</span></>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-[0.88rem]">{c.title}</p>
                        <p className="text-white/50 text-[0.7rem] mt-0.5">{c.court || "Court"}</p>
                        <p className="text-white/60 text-[0.72rem] mt-1 flex items-center gap-1">
                          <Calendar size={10} className="text-blue-400" />
                          {c.next_hearing} · {c.case_type}
                          {c.case_number && ` · #${c.case_number}`}
                        </p>
                        {(c.days_left ?? 99) <= 3 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <AlertCircle size={11} className="text-amber-400" />
                            <span className="text-[0.65rem] text-amber-400 font-medium">
                              {c.days_left === 0 ? "Hearing today! Make sure you're prepared." :
                               c.days_left === 1 ? "Hearing tomorrow — review case documents." :
                               "Hearing soon — prepare your arguments."}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[0.6rem] border flex-shrink-0 ${PRIORITY_COLOR[c.priority]}`}>
                        {c.priority}
                      </span>
                    </div>
                  </GlassMorphCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
