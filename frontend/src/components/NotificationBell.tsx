"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Calendar, FileText, Newspaper, Sparkles, Info } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from "@/lib/api";
import GlassMorphCard from "./GlassMorphCard";

interface Props {
  userId: string;
  onNavigate?: (panel: string) => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  hearing:  <Calendar size={13} className="text-blue-400" />,
  deadline: <FileText size={13} className="text-amber-400" />,
  news:     <Newspaper size={13} className="text-sky-400" />,
  followup: <Sparkles size={13} className="text-purple-400" />,
  case:     <Check size={13} className="text-green-400" />,
  system:   <Info size={13} className="text-white/50" />,
};

const PRIORITY_DOT: Record<string, string> = {
  low:    "bg-slate-500",
  normal: "bg-blue-500",
  high:   "bg-amber-500",
  urgent: "bg-red-500 animate-pulse",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ userId, onNavigate }: Props) {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [unread, setUnread]   = useState(0);
  const [marking, setMarking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const { notifications, unread_count } = await getNotifications(userId);
      setNotifs(notifications);
      setUnread(unread_count);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    await markNotificationRead(userId, id);
  }

  async function handleReadAll() {
    setMarking(true);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
    await markAllNotificationsRead(userId);
    setMarking(false);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`relative p-2 rounded-lg transition-all duration-300
          ${open ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"}`}>
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white
            text-[0.55rem] font-bold flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 rounded-2xl border border-white/10
          bg-[#0d1120]/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-white/60" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-900/40 text-red-300 text-[0.6rem] font-bold">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={handleReadAll} disabled={marking}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                  title="Mark all read">
                  <CheckCheck size={12} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Bell size={24} className="text-white/20" />
                <p className="text-white/40 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-all border-b border-white/[0.04] cursor-pointer
                    ${!n.is_read ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
                  onClick={() => {
                    if (!n.is_read) handleRead(n.id);
                    if (n.link_panel && onNavigate) { onNavigate(n.link_panel); setOpen(false); }
                  }}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.is_read ? "bg-transparent" : PRIORITY_DOT[n.priority]}`} />
                    <span>{TYPE_ICON[n.type] || TYPE_ICON.system}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.78rem] leading-tight ${n.is_read ? "text-white/50" : "text-white/90 font-medium"}`}>
                      {n.title}
                    </p>
                    <p className="text-[0.68rem] text-white/40 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[0.6rem] text-white/25 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button onClick={e => { e.stopPropagation(); handleRead(n.id); }}
                      className="p-1 rounded text-white/30 hover:text-white/60 flex-shrink-0 mt-0.5 transition-all">
                      <Check size={10} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/[0.06]">
              <p className="text-[0.62rem] text-white/25 text-center">Last 50 notifications shown</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
