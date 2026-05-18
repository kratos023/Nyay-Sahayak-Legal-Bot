"use client";
import { useEffect, useState } from "react";
import {
  Scale, Plus, Trash2, LogOut, Shield, Languages,
  History, Settings2, ChevronDown, LayoutDashboard, Search
} from "lucide-react";
import { getSessions, deleteSession, newSession } from "@/lib/api";
import type { Session } from "@/lib/api";
import { clsx } from "clsx";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Language, LANGUAGE_META } from "@/lib/translations";
import GlassMorphCard, { FloatingGlassButton } from "@/components/GlassMorphCard";
import NotificationBell from "@/components/NotificationBell";

// Map language codes → full names (for syncing UI picker → outputLang)
const LANG_CODE_TO_NAME: Record<string, string> = {
  en:"English", hi:"Hindi", bn:"Bengali", te:"Telugu", ta:"Tamil",
  mr:"Marathi", gu:"Gujarati", kn:"Kannada", ml:"Malayalam", pa:"Punjabi", or:"Odia",
};

const LANG_OPTIONS = [
  "English","Hindi","Bengali","Telugu","Marathi",
  "Tamil","Gujarati","Kannada","Malayalam","Punjabi","Odia"
];

interface Props {
  userId: string; userName: string; userRole: string;
  inputLang: string; outputLang: string; enableTTS: boolean;
  onInputLangChange: (l: string) => void;
  onOutputLangChange: (l: string) => void;
  onTTSChange: (v: boolean) => void;
  onLoadSession: (msgs: { role: "user" | "assistant"; content: string }[]) => void;
  onNewChat: () => void;
  onOpenLocation: () => void; onOpenDocs: () => void;
  onOpenRights: () => void;   onOpenRTI: () => void; onOpenOCR: () => void;
  onOpenNews: () => void; onOpenFlow: () => void; onOpenLawyers: () => void;
  onOpenTemplates: () => void; onOpenCases: () => void; onOpenFIR2: () => void;
  onOpenDashboard: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  activePanel: string;
  refreshTrigger?: number;
}

const NAV_TOOLS = [
  { id: "location",  icon: "📍", color: "text-teal-400",    activeBg: "bg-teal-950/60 border-teal-700/40" },
  { id: "docs",      icon: "📄", color: "text-blue-400",    activeBg: "bg-blue-950/60 border-blue-700/40" },
  { id: "rights",    icon: "⚖️", color: "text-amber-400",   activeBg: "bg-amber-950/60 border-amber-700/40" },
  { id: "rti",       icon: "📋", color: "text-indigo-400",  activeBg: "bg-indigo-950/60 border-indigo-700/40" },
  { id: "ocr",       icon: "📷", color: "text-orange-400",  activeBg: "bg-orange-950/60 border-orange-700/40" },
  { id: "news",      icon: "📰", color: "text-sky-400",     activeBg: "bg-sky-950/60 border-sky-700/40" },
  { id: "flow",      icon: "🧭", color: "text-violet-400",  activeBg: "bg-violet-950/60 border-violet-700/40" },
  { id: "lawyers",   icon: "👨‍⚖️", color: "text-rose-400",    activeBg: "bg-rose-950/60 border-rose-700/40" },
  { id: "templates", icon: "📝", color: "text-emerald-400", activeBg: "bg-emerald-950/60 border-emerald-700/40" },
  { id: "cases",     icon: "🔎", color: "text-cyan-400",    activeBg: "bg-cyan-950/60 border-cyan-700/40" },
  { id: "fir",       icon: "🚨", color: "text-red-400",     activeBg: "bg-red-950/60 border-red-700/40" },
];

const PANEL_HANDLERS: Record<string, keyof Props> = {
  location: "onOpenLocation", docs: "onOpenDocs",
  rights: "onOpenRights", rti: "onOpenRTI", ocr: "onOpenOCR",
  news: "onOpenNews", flow: "onOpenFlow", lawyers: "onOpenLawyers",
  templates: "onOpenTemplates", cases: "onOpenCases", fir: "onOpenFIR2",
};

export default function Sidebar(props: Props) {
  const {
    userId, userName, userRole, inputLang, outputLang, enableTTS,
    onInputLangChange, onOutputLangChange, onTTSChange,
    onLoadSession, onNewChat, onLogout, activePanel, refreshTrigger = 0,
    onOpenDashboard, onOpenSearch,
  } = props;

  const { language, uiLang, setLanguage, setUiLang, t, isHindi, simpleMode, setSimpleMode } = useLanguage();
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [tab, setTab]             = useState<"history" | "settings">("history");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [toolsOpen, setToolsOpen] = useState(true);

  const hasActiveTool = NAV_TOOLS.some(tool => tool.id === activePanel);
  const dropdownOpen  = toolsOpen || hasActiveTool;
  const activeTool    = NAV_TOOLS.find(tool => tool.id === activePanel);

  useEffect(() => {
    if (!userId) return;
    getSessions(userId).then(setSessions).catch(() => {});
    const iv = setInterval(() => getSessions(userId).then(setSessions).catch(() => {}), 10000);
    return () => clearInterval(iv);
  }, [userId]);

  // Refresh sessions whenever parent signals a new message was sent
  useEffect(() => {
    if (!userId || refreshTrigger === 0) return;
    // Small delay so backend has time to save
    const t = setTimeout(() => getSessions(userId).then(setSessions).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [refreshTrigger, userId]);

  // Expose a refresh function via ref so parent can trigger it after a message is sent
  function refreshSessions() {
    if (userId) getSessions(userId).then(setSessions).catch(() => {});
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  async function handleNew() {
    await newSession(userId).catch(() => {});
    onNewChat();
    // Refresh after short delay to show cleared state
    setTimeout(() => getSessions(userId).then(setSessions).catch(() => {}), 500);
  }

  async function handleLoadSession(s: Session) {
    setLoadingId(s.id);
    const { getSessionMessages } = await import("@/lib/api");
    const msgs = await getSessionMessages(s.id);
    onLoadSession(msgs);
    setLoadingId(null);
    // Mark this session as active
    getSessions(userId).then(setSessions).catch(() => {});
  }

  const getToolLabel = (toolId: string): string => {
    const toolLabels: Record<string, keyof typeof t> = {
      location: "findNearestHelp", docs: "analyzeDocument",
      rights: "knowYourRights", rti: "rtiApplication", ocr: "scanDocument",
      news: "legalNews", flow: "guidedLegalHelp", lawyers: "findLawyer",
      templates: "legalTemplates", cases: "caseStatusTracker", fir: "fileFirDraft",
      dashboard: "dashboard", search: "legalSearch",
    };
    return (t[toolLabels[toolId]] as string) || toolId;
  };

  return (
    <>
      <aside className="flex flex-col w-[240px] h-full flex-shrink-0 relative z-20">
        <GlassMorphCard className="h-full rounded-none border-r border-l-0 border-t-0 border-b-0" hover={false}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Logo */}
            <div className="px-4 pt-5 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-800 opacity-30 blur-lg animate-pulse" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900
                    flex items-center justify-center border border-amber-600/40 shadow-lg">
                    <Scale size={18} className="text-amber-100 drop-shadow-sm" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[1.05rem] bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent leading-none">
                    {t.appName}
                  </p>
                  <p className="text-[0.6rem] text-white/40 tracking-widest uppercase mt-1">{t.legalAI}</p>
                </div>
                <button onClick={() => { const next = uiLang === 'en' ? 'hi' : 'en'; setUiLang(next); setLanguage(next); }}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10
                    flex items-center justify-center text-base hover:bg-white/10 transition-all"
                  title="Toggle language">
                  {language === 'en' ? '🇮🇳' : '🇺🇸'}
                </button>
              </div>
            </div>

            {/* Dashboard + Search quick buttons */}
            <div className="px-4 pb-3 grid grid-cols-2 gap-2 flex-shrink-0">
              <button onClick={onOpenDashboard}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[0.72rem] font-medium transition-all border",
                  activePanel === "dashboard"
                    ? "bg-amber-900/40 text-amber-300 border-amber-700/40"
                    : "text-white/60 border-white/10 hover:bg-white/[0.05] hover:text-white/90"
                )}>
                <LayoutDashboard size={13} />
                Dashboard
              </button>
              <button onClick={onOpenSearch}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[0.72rem] font-medium transition-all border",
                  activePanel === "search"
                    ? "bg-indigo-900/40 text-indigo-300 border-indigo-700/40"
                    : "text-white/60 border-white/10 hover:bg-white/[0.05] hover:text-white/90"
                )}>
                <Search size={13} />
                Legal Search
              </button>
            </div>

            {/* New Chat */}
            <div className="px-4 pb-4 flex-shrink-0">
              <GlassMorphCard hover glow className="rounded-xl">
                <button onClick={handleNew}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[0.85rem] font-medium
                    text-amber-200 transition-all duration-300 hover:text-amber-100">
                  <Plus size={14} strokeWidth={2.5} className="animate-pulse" />
                  {t.newConversation}
                </button>
              </GlassMorphCard>
            </div>

            {/* Tools Dropdown */}
            <div className="px-4 pb-3 flex-shrink-0">
              <GlassMorphCard hover={false} gradient className="rounded-xl">
                <button onClick={() => setToolsOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-[0.8rem]
                    font-medium transition-all duration-300 text-white/80 hover:text-white">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none animate-bounce">
                      {activeTool && !dropdownOpen ? activeTool.icon : "🛠️"}
                    </span>
                    <span>{activeTool && !dropdownOpen ? getToolLabel(activeTool.id) : t.tools}</span>
                  </div>
                  <div className="transition-transform duration-300" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={14} className="text-white/50" />
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="pb-2 space-y-1 animate-in slide-in-from-top-2 duration-300 max-h-52 overflow-y-auto">
                    {NAV_TOOLS.map(({ id, icon, color, activeBg }, index) => {
                      const isActive = activePanel === id;
                      const handler  = PANEL_HANDLERS[id];
                      return (
                        <button key={id}
                          onClick={() => { (props[handler] as () => void)(); setToolsOpen(true); }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-[0.8rem]",
                            "transition-all duration-300 text-left border",
                            "hover:scale-[1.02] hover:shadow-lg",
                            isActive
                              ? `${activeBg} ${color} shadow-lg border-current/20`
                              : "text-white/60 border-transparent hover:bg-white/[0.05] hover:text-white/90",
                            "animate-in slide-in-from-left-2 duration-300"
                          )}
                          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                          <span className="text-base leading-none flex-shrink-0 transition-transform duration-300 hover:scale-110">
                            {icon}
                          </span>
                          <span className="truncate">{getToolLabel(id)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </GlassMorphCard>
            </div>

            <div className="mx-4 border-t border-white/[0.08] my-2 flex-shrink-0" />

            {/* History / Settings tabs */}
            <div className="flex px-4 pt-2 pb-2 gap-1 flex-shrink-0">
              {([
                { id: "history",  icon: History,   label: t.history },
                { id: "settings", icon: Settings2, label: t.settings },
              ] as const).map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[0.7rem] transition-all duration-300",
                    tab === id
                      ? "bg-white/10 text-amber-300 border border-white/20 shadow-lg"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                  )}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "history" ? (
              <div className="flex-1 overflow-y-auto px-3 py-2">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Scale size={18} className="text-white/30" />
                    </div>
                    <p className="text-[0.75rem] text-white/40 text-center leading-relaxed">
                      {t.noData}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sessions.slice(0, 30).map((s, index) => (
                      <GlassMorphCard key={s.id} hover className="rounded-lg animate-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                        <button onClick={() => handleLoadSession(s)}
                          className="w-full group flex items-center gap-3 px-3 py-3 text-left relative">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300
                            ${s.is_active ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-white/30"}`} />
                          <div className="min-w-0 flex-1">
                            <p className={clsx("text-[0.78rem] truncate transition-colors leading-tight",
                              loadingId === s.id ? "text-amber-300" : "text-white/80 group-hover:text-white")}>
                              {loadingId === s.id ? t.loading : s.session_name}
                            </p>
                            <p className="text-[0.65rem] text-white/40 mt-1">{s.message_count} msgs</p>
                          </div>
                          <button onClick={e => handleDelete(s.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                              text-white/40 hover:text-red-400 hover:bg-red-950/30 transition-all flex-shrink-0">
                            <Trash2 size={10} />
                          </button>
                        </button>
                      </GlassMorphCard>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* UI Language — full selector */}
                <GlassMorphCard hover={false} className="p-4 rounded-xl">
                  <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-2 block">
                    {t.inputLanguage} / UI
                  </label>
                  <select
                    value={uiLang}
                    onChange={e => {
                      const code = e.target.value as Language;
                      setUiLang(code);
                      setLanguage(code);
                      // Keep AI output language in sync
                      const name = LANG_CODE_TO_NAME[code] || "English";
                      onOutputLangChange(name);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-[0.8rem] text-white bg-white/5 border border-white/20
                      focus:outline-none focus:border-amber-400/60 transition-all">
                    {(Object.entries(LANGUAGE_META) as [Language, typeof LANGUAGE_META[Language]][]).map(([code, meta]) => (
                      <option key={code} value={code} className="bg-gray-900 text-white">
                        {meta.native} — {meta.english}
                      </option>
                    ))}
                  </select>
                </GlassMorphCard>

                {/* AI Output Language */}
                {[
                  { label: t.outputLanguage, value: outputLang, onChange: onOutputLangChange },
                ].map(({ label, value, onChange }) => (
                  <GlassMorphCard key={label} hover={false} className="p-4 rounded-xl">
                    <label className="text-[0.65rem] text-white/50 uppercase tracking-widest mb-2 block">{label}</label>
                    <select value={value} onChange={e => onChange(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-[0.8rem] text-white bg-white/5 border border-white/20
                        focus:outline-none focus:border-amber-400/60 transition-all">
                      {LANG_OPTIONS.map(l => <option key={l} value={l} className="bg-gray-900 text-white">{l}</option>)}
                    </select>
                  </GlassMorphCard>
                ))}

                {/* Simple Language mode */}
                <GlassMorphCard hover={false} className="p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[0.8rem] text-white/90 font-medium">{t.simpleLanguage}</p>
                      <p className="text-[0.65rem] text-white/50 mt-0.5">{t.simpleLanguageDesc}</p>
                    </div>
                    <button onClick={() => setSimpleMode(!simpleMode)}
                      className="relative w-10 h-6 rounded-full transition-all duration-300 border border-white/20 flex-shrink-0"
                      style={{ background: simpleMode ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.1)" }}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${simpleMode ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                </GlassMorphCard>

                {/* Voice output */}
                <GlassMorphCard hover={false} className="p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[0.8rem] text-white/90">{t.voiceOutput}</p>
                      <p className="text-[0.65rem] text-white/50 mt-0.5">{t.readRepliesAloud}</p>
                    </div>
                    <button onClick={() => onTTSChange(!enableTTS)}
                      className="relative w-10 h-6 rounded-full transition-all duration-300 border border-white/20 flex-shrink-0"
                      style={{ background: enableTTS ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.1)" }}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${enableTTS ? "right-0.5 shadow-amber-500/50" : "left-0.5"}`} />
                    </button>
                  </div>
                </GlassMorphCard>

              </div>
            )}

            {/* Footer */}
            <div className="px-4 pb-4 space-y-3 flex-shrink-0 mt-auto">
              <GlassMorphCard className="p-3 rounded-xl border-red-500/30 bg-red-950/20">
                <div className="animate-pulse">
                  <p className="text-[0.6rem] text-red-300 uppercase tracking-widest font-bold">{t.emergency}</p>
                  <p className="text-[0.75rem] text-red-200 font-mono font-bold mt-1">100 · 1091 · 181</p>
                </div>
              </GlassMorphCard>
              <GlassMorphCard hover className="rounded-xl">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                    text-[0.7rem] font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
                    {userName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8rem] text-white/90 font-medium truncate">{userName}</p>
                    <p className="text-[0.6rem] text-white/50 capitalize">{userRole}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    {/* 🔔 Notification Bell */}
                    <NotificationBell userId={userId} onNavigate={panel => {
                      if (panel === "dashboard") props.onOpenDashboard();
                    }} />
                    {userRole === "admin" && (
                      <Link href="/admin"
                        className="p-2 rounded-lg text-amber-400 hover:bg-amber-900/30 transition-all duration-300"
                        title="Admin Panel">
                        <Shield size={12} />
                      </Link>
                    )}
                    <button onClick={onLogout}
                      className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-950/30 transition-all duration-300"
                      title={t.logout}>
                      <LogOut size={12} />
                    </button>
                  </div>
                </div>
              </GlassMorphCard>
            </div>
          </div>
        </GlassMorphCard>
      </aside>
    </>
  );
}
