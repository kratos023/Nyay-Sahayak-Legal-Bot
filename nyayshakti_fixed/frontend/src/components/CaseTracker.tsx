"use client";
import { useState, useEffect } from "react";
import {
  X, Plus, ExternalLink, Trash2, Edit3, Save, ChevronDown,
  Calendar, FileText, MessageSquare, Smartphone, Copy, Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { createCase, updateCase, deleteCase, type UserCase } from "@/lib/api";

interface Props { onClose: () => void; }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CASE_TYPES = ["Civil", "Criminal", "Family", "Labour", "Consumer", "Revenue", "RTI", "Writ", "Appeal", "Other"];
const STATUSES   = ["Active", "Closed", "Disposed", "Stayed", "Appeal"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const STATUS_BG: Record<string, string> = {
  Active: "rgba(16,185,129,0.15)", Closed: "rgba(107,114,128,0.15)",
  Disposed: "rgba(59,130,246,0.15)", Stayed: "rgba(245,158,11,0.15)", Appeal: "rgba(168,85,247,0.15)",
};
const STATUS_FG: Record<string, string> = {
  Active: "#10b981", Closed: "#9ca3af", Disposed: "#60a5fa", Stayed: "#f59e0b", Appeal: "#a855f7",
};
const PRIORITY_COLOR: Record<string, string> = {
  low: "#6b7280", normal: "#60a5fa", high: "#f59e0b", urgent: "#ef4444",
};

const HIGH_COURTS = [
  { name: "eCourts — All District Courts", url: "https://services.ecourts.gov.in/ecourtindia_v6/" },
  { name: "Supreme Court of India",        url: "https://main.sci.gov.in/case-status" },
  { name: "Delhi High Court",              url: "https://delhihighcourt.nic.in/" },
  { name: "Bombay High Court",             url: "https://bombayhighcourt.nic.in/" },
  { name: "Madras High Court",             url: "https://hcmadras.tn.nic.in/" },
  { name: "Calcutta High Court",           url: "https://calcuttahighcourt.gov.in/" },
  { name: "Karnataka High Court",          url: "https://hck.kar.nic.in/" },
  { name: "Allahabad High Court",          url: "https://allahabadhighcourt.in/" },
  { name: "Punjab & Haryana High Court",   url: "https://highcourtchd.gov.in/" },
  { name: "Kerala High Court",             url: "https://highcourt.kerala.gov.in/" },
  { name: "Telangana High Court",          url: "https://hct.gov.in/" },
  { name: "NJDG — National Data Grid",     url: "https://njdg.ecourts.gov.in/" },
];

type Tab = "diary" | "sms" | "courts";

const EMPTY: Omit<UserCase, "id" | "case_uuid" | "user_id" | "days_left"> = {
  title: "", case_type: "Civil", court: "", case_number: "",
  status: "Active", description: "", filed_date: "", next_hearing: "",
  priority: "normal", progress: 0, tags: [], notes: "",
};

function daysUntil(d: string) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return Math.ceil((dt.getTime() - Date.now()) / 86_400_000);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-semibold"
      style={{ background: STATUS_BG[status] ?? "rgba(255,255,255,0.08)", color: STATUS_FG[status] ?? "#fff" }}>
      {status}
    </span>
  );
}

export default function CaseTracker({ onClose }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [tab, setTab]             = useState<Tab>("diary");
  const [cases, setCases]         = useState<UserCase[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editCase, setEditCase]   = useState<UserCase | null>(null);
  const [form, setForm]           = useState({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCnr, setCopiedCnr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/dashboard/${user.user_id}/cases`)
      .then(r => r.json())
      .then(d => setCases(d.cases ?? []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [user]);

  function openAdd() { setEditCase(null); setForm({ ...EMPTY }); setShowForm(true); }
  function openEdit(c: UserCase) {
    setEditCase(c);
    setForm({ title: c.title, case_type: c.case_type, court: c.court, case_number: c.case_number,
      status: c.status, description: c.description, filed_date: c.filed_date, next_hearing: c.next_hearing,
      priority: c.priority, progress: c.progress, tags: c.tags, notes: c.notes });
    setShowForm(true);
  }

  async function handleSave() {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editCase?.case_uuid) {
        await updateCase(user.user_id, editCase.case_uuid, form);
        setCases(cs => cs.map(c => c.case_uuid === editCase.case_uuid ? { ...c, ...form } : c));
      } else {
        const created = await createCase(user.user_id, form);
        setCases(cs => [created, ...cs]);
      }
      setShowForm(false);
    } catch {}
    setSaving(false);
  }

  async function handleDelete(c: UserCase) {
    if (!user || !c.case_uuid) return;
    setDeletingId(c.case_uuid);
    try {
      await deleteCase(user.user_id, c.case_uuid);
      setCases(cs => cs.filter(x => x.case_uuid !== c.case_uuid));
    } catch {}
    setDeletingId(null);
  }

  function copyAndOpenEcourts(raw: string) {
    const cnr = raw.replace(/[-\s]/g, "").toUpperCase();
    navigator.clipboard.writeText(cnr).catch(() => {});
    setCopiedCnr(cnr);
    setTimeout(() => setCopiedCnr(null), 2500);
    window.open("https://services.ecourts.gov.in/ecourtindia_v6/", "_blank");
  }

  const upcoming = cases
    .filter(c => { const d = daysUntil(c.next_hearing); return d !== null && d >= 0 && d <= 30; })
    .sort((a, b) => new Date(a.next_hearing).getTime() - new Date(b.next_hearing).getTime());

  const tabs: { id: Tab; label: string }[] = [
    { id: "diary",  label: "📁 My Case Diary" },
    { id: "sms",    label: "💬 SMS Lookup" },
    { id: "courts", label: "🏛️ Court Links" },
  ];

  const inp = "w-full bg-[var(--bg-3)] border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--gold)]/50";

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "var(--bg-2)" }}>
        <div>
          <h2 className="font-display text-xl" style={{ color: "var(--gold-light)" }}>
            📁 {t.caseStatusTracker}
          </h2>
          <p className="text-[0.72rem] mt-0.5" style={{ color: "var(--text-3)" }}>
            Your personal case diary — log, track & manage your cases
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-3)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-[0.7rem] font-medium transition-colors ${
              tab === id
                ? "border-b-2 border-[var(--gold)] text-[var(--gold-light)]"
                : "text-[var(--text-3)] hover:text-[var(--text-2)]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ══ DIARY TAB ══ */}
        {tab === "diary" && (
          <>
            {/* Upcoming hearings */}
            {upcoming.length > 0 && (
              <div className="rounded-xl p-3.5"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <p className="text-[0.7rem] font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Calendar size={13} /> Upcoming hearings
                </p>
                <div className="space-y-1.5">
                  {upcoming.map(c => {
                    const d = daysUntil(c.next_hearing)!;
                    return (
                      <div key={c.case_uuid} className="flex items-center justify-between gap-2">
                        <span className="text-[0.68rem] truncate" style={{ color: "var(--text-2)" }}>{c.title}</span>
                        <span className={`text-[0.65rem] font-semibold flex-shrink-0 ${d <= 3 ? "text-red-400" : "text-amber-400"}`}>
                          {d === 0 ? "Today!" : d === 1 ? "Tomorrow" : `${d} days`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add button */}
            <button onClick={openAdd}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: "var(--gold)", color: "#000" }}>
              <Plus size={15} /> Add New Case
            </button>

            {/* Form */}
            {showForm && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: "var(--bg-2)", border: "1px solid rgba(201,146,10,0.25)" }}>
                <p className="text-[0.75rem] font-semibold" style={{ color: "var(--gold-light)" }}>
                  {editCase ? "✏️ Edit Case" : "➕ New Case"}
                </p>

                <div>
                  <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Case Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Sharma vs State — Bail Application" className={inp} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Type</label>
                    <select value={form.case_type} onChange={e => setForm(f => ({ ...f, case_type: e.target.value }))} className={inp}>
                      {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof STATUSES[number] }))} className={inp}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Court</label>
                    <input value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))}
                      placeholder="e.g. Delhi District Court" className={inp} />
                  </div>
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">CNR / Case No.</label>
                    <input value={form.case_number} onChange={e => setForm(f => ({ ...f, case_number: e.target.value }))}
                      placeholder="e.g. DLCT010012342024" className={`${inp} font-mono`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Filed Date</label>
                    <input type="date" value={form.filed_date} onChange={e => setForm(f => ({ ...f, filed_date: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Next Hearing</label>
                    <input type="date" value={form.next_hearing} onChange={e => setForm(f => ({ ...f, next_hearing: e.target.value }))} className={inp} />
                  </div>
                </div>

                <div>
                  <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                        className="flex-1 py-1.5 rounded-lg text-[0.65rem] font-medium capitalize transition-all"
                        style={{
                          background: form.priority === p ? PRIORITY_COLOR[p] + "33" : "var(--bg-3)",
                          border: `1px solid ${form.priority === p ? PRIORITY_COLOR[p] : "rgba(255,255,255,0.08)"}`,
                          color: form.priority === p ? PRIORITY_COLOR[p] : "var(--text-3)",
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[0.62rem] text-[var(--text-3)] uppercase tracking-widest block mb-1">Notes / Updates</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Lawyer name, what happened last hearing, important instructions…"
                    rows={3} className={`${inp} resize-none`} />
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving || !form.title.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                    style={{ background: "var(--gold)", color: "#000" }}>
                    <Save size={14} /> {saving ? "Saving…" : "Save Case"}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl text-sm"
                    style={{ background: "var(--bg-3)", color: "var(--text-3)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Cases list */}
            {loading ? (
              <div className="text-center py-10 text-[0.75rem]" style={{ color: "var(--text-3)" }}>
                Loading your cases…
              </div>
            ) : cases.length === 0 && !showForm ? (
              <div className="text-center py-10 space-y-2">
                <FileText size={32} className="mx-auto opacity-20" style={{ color: "var(--text-3)" }} />
                <p className="text-[0.75rem]" style={{ color: "var(--text-3)" }}>No cases yet. Add your first case above.</p>
                <p className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>
                  Log your court, case number, next hearing, and notes — like a personal case diary.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cases.map(c => {
                  const days  = daysUntil(c.next_hearing);
                  const isOpen = expandedId === c.case_uuid;
                  const cnr   = c.case_number.replace(/[-\s]/g, "").toUpperCase();

                  return (
                    <div key={c.case_uuid} className="rounded-xl overflow-hidden"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>

                      {/* Row */}
                      <div className="p-3.5 flex items-start gap-3 cursor-pointer select-none"
                        onClick={() => setExpandedId(isOpen ? null : (c.case_uuid ?? null))}>
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: PRIORITY_COLOR[c.priority] ?? "#6b7280" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[0.8rem] font-semibold truncate" style={{ color: "var(--text)" }}>{c.title}</span>
                            <StatusBadge status={c.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-[0.65rem]" style={{ color: "var(--text-3)" }}>
                              {c.case_type}{c.court ? ` · ${c.court}` : ""}
                            </span>
                            {c.next_hearing && (
                              <span className={`text-[0.65rem] font-medium flex items-center gap-1 ${
                                days !== null && days <= 3 ? "text-red-400" : days !== null && days <= 7 ? "text-amber-400" : "text-green-400"
                              }`}>
                                <Calendar size={10} />
                                {days === 0 ? "Today!" : days === 1 ? "Tomorrow" : days !== null ? `${days}d` : c.next_hearing}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown size={14} className={`flex-shrink-0 transition-transform mt-1 ${isOpen ? "rotate-180" : ""}`}
                          style={{ color: "var(--text-3)" }} />
                      </div>

                      {/* Detail */}
                      {isOpen && (
                        <div className="border-t px-3.5 pb-3.5 pt-3 space-y-3"
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.68rem]">
                            {c.case_number && (
                              <><span style={{ color: "var(--text-3)" }}>CNR / Case No.</span>
                              <span className="font-mono" style={{ color: "var(--text-2)" }}>{c.case_number}</span></>
                            )}
                            {c.filed_date && (
                              <><span style={{ color: "var(--text-3)" }}>Filed</span>
                              <span style={{ color: "var(--text-2)" }}>{c.filed_date}</span></>
                            )}
                            {c.next_hearing && (
                              <><span style={{ color: "var(--text-3)" }}>Next Hearing</span>
                              <span style={{ color: "var(--text-2)" }}>{c.next_hearing}</span></>
                            )}
                          </div>

                          {c.notes && (
                            <div className="rounded-lg p-2.5" style={{ background: "var(--bg-3)" }}>
                              <p className="text-[0.65rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{c.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {c.case_number && (
                              <button onClick={() => copyAndOpenEcourts(c.case_number)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.68rem] font-medium transition-all"
                                style={{ background: "rgba(201,146,10,0.12)", border: "1px solid rgba(201,146,10,0.3)", color: "var(--gold-light)" }}>
                                {copiedCnr === cnr
                                  ? <><Check size={11} /> Copied! eCourts opening…</>
                                  : <><Copy size={11} /> Copy CNR & Open eCourts <ExternalLink size={10} /></>}
                              </button>
                            )}
                            <button onClick={() => openEdit(c)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.68rem] font-medium transition-all"
                              style={{ background: "var(--bg-3)", border: "1px solid var(--border-md)", color: "var(--text-2)" }}>
                              <Edit3 size={11} /> Edit
                            </button>
                            <button onClick={() => handleDelete(c)} disabled={deletingId === c.case_uuid}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.68rem] font-medium transition-all disabled:opacity-40"
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                              <Trash2 size={11} /> {deletingId === c.case_uuid ? "…" : "Remove"}
                            </button>
                          </div>

                          <p className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>
                            💡 eCourts needs a CAPTCHA — your CNR is copied to clipboard so you can paste it instantly.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* App tip */}
            <div className="rounded-xl p-3.5"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-[0.7rem] font-semibold text-green-400 mb-1">📱 Skip the CAPTCHA — use the eCourts App</p>
              <p className="text-[0.68rem] mb-2" style={{ color: "var(--text-2)" }}>
                The official eCourts app lets you enter your CNR directly — no CAPTCHA, instant case status.
              </p>
              <div className="flex gap-2">
                <a href="https://play.google.com/store/apps/details?id=in.gov.ecourts.eCourtsServices"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-medium text-white"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <Smartphone size={10} /> Android
                </a>
                <a href="https://apps.apple.com/in/app/ecourts-services/id1339779446"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-medium text-white"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <Smartphone size={10} /> iOS
                </a>
              </div>
            </div>
          </>
        )}

        {/* ══ SMS TAB ══ */}
        {tab === "sms" && (
          <>
            <div className="rounded-xl p-4"
              style={{ background: "rgba(201,146,10,0.06)", border: "1px solid rgba(201,146,10,0.2)" }}>
              <p className="text-[0.72rem] font-semibold mb-1" style={{ color: "var(--gold-light)" }}>
                💬 eCourts SMS Service — no internet needed
              </p>
              <p className="text-[0.68rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                Works in rural areas without data. Official government service, free of cost.
              </p>
            </div>

            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <div className="rounded-lg p-3 text-center space-y-1"
                style={{ background: "var(--bg-3)", border: "1px solid var(--border-md)" }}>
                <p className="text-[0.65rem]" style={{ color: "var(--text-3)" }}>Send SMS to</p>
                <p className="text-2xl font-bold text-white tracking-wider">9766899899</p>
                <p className="text-[0.65rem]" style={{ color: "var(--text-3)" }}>Message format</p>
                <p className="text-base font-mono font-semibold" style={{ color: "var(--gold-light)" }}>
                  ECOURTS &lt;space&gt; &lt;CNR Number&gt;
                </p>
                <p className="text-[0.62rem] mt-1" style={{ color: "var(--text-3)" }}>
                  Example: ECOURTS DLCT010012342024
                </p>
              </div>
            </div>

            {cases.filter(c => c.case_number).length > 0 && (
              <div className="space-y-2">
                <p className="text-[0.65rem] uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Quick SMS for your saved cases
                </p>
                {cases.filter(c => c.case_number).map(c => {
                  const cnr = c.case_number.replace(/[-\s]/g, "").toUpperCase();
                  return (
                    <a key={c.case_uuid}
                      href={`sms:9766899899?body=${encodeURIComponent("ECOURTS " + cnr)}`}
                      className="flex items-center justify-between p-3 rounded-xl transition-all"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-[0.73rem] font-medium" style={{ color: "var(--text)" }}>{c.title}</p>
                        <p className="text-[0.65rem] font-mono" style={{ color: "var(--text-3)" }}>{cnr}</p>
                      </div>
                      <MessageSquare size={14} style={{ color: "var(--gold)" }} />
                    </a>
                  );
                })}
              </div>
            )}

            <div className="rounded-xl p-3.5"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-[0.7rem] font-semibold text-green-400 mb-0.5">Standard SMS charges apply</p>
              <p className="text-[0.68rem]" style={{ color: "var(--text-2)" }}>
                Usually free on most plans. Government service — no spam, no subscription.
              </p>
            </div>
          </>
        )}

        {/* ══ COURTS TAB ══ */}
        {tab === "courts" && (
          <div className="space-y-2">
            {HIGH_COURTS.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
                style={{
                  background: i === 0 ? "rgba(201,146,10,0.07)" : "var(--bg-2)",
                  border: i === 0 ? "1px solid rgba(201,146,10,0.3)" : "1px solid var(--border)",
                }}>
                <span className="text-[0.8rem] font-medium"
                  style={{ color: i === 0 ? "var(--gold-light)" : "var(--text)" }}>
                  {i === 0 ? "🏛️ " : "⚖️ "}{c.name}
                </span>
                <ExternalLink size={13} className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: i === 0 ? "var(--gold)" : "var(--text-3)" }} />
              </a>
            ))}
            <div className="rounded-xl p-3.5 mt-2"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <p className="text-[0.7rem] font-semibold text-blue-400 mb-0.5">🆓 {t.freeLegalAid}</p>
              <p className="text-[0.68rem]" style={{ color: "var(--text-2)" }}>{t.freeLegalAidDesc}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
