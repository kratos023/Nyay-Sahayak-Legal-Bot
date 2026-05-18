"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { WifiOff, Wifi, X, Phone } from "lucide-react";

const EMERGENCY = [
  { label: "Police",        number: "100" },
  { label: "Women Helpline",number: "1091" },
  { label: "Emergency",     number: "112" },
  { label: "Legal Aid",     number: "1800-110-370" },
];

export default function OfflineBanner() {
  const { t } = useLanguage();
  const [offline, setOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setWasOffline(true); };
    const goOnline  = () => {
      setOffline(false);
      if (wasOffline) { setShowRestore(true); setTimeout(() => setShowRestore(false), 4000); }
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    // Check initial state
    if (!navigator.onLine) goOffline();
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, [wasOffline]);

  if (showRestore) return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
      px-4 py-2.5 rounded-full text-sm font-medium text-green-300 shadow-xl animate-fade-up"
      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
      <Wifi size={14} /> Back online
    </div>
  );

  if (!offline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-lg mb-4 mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-2)", border: "1px solid rgba(239,68,68,0.3)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2">
            <WifiOff size={14} className="text-red-400" />
            <span className="text-sm font-semibold text-red-300">You are offline</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNumbers(!showNumbers)}
              className="text-[0.7rem] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-400/10">
              <Phone size={10} /> Emergency Numbers
            </button>
          </div>
        </div>

        {/* Emergency numbers (expandable) */}
        {showNumbers && (
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {EMERGENCY.map(({ label, number }) => (
              <a key={number} href={`tel:${number}`}
                className="flex items-center justify-between px-3 py-2 rounded-xl transition-colors hover:bg-white/5"
                style={{ background: "var(--bg-3)", border: "1px solid var(--border)" }}>
                <span className="text-[0.68rem] text-[var(--text-3)]">{label}</span>
                <span className="text-sm font-bold text-green-400">{number}</span>
              </a>
            ))}
          </div>
        )}

        <div className="px-4 py-2.5">
          <p className="text-[0.7rem] text-[var(--text-3)]">
            Chat unavailable. Emergency contacts and your legal rights are still accessible above.
          </p>
        </div>
      </div>
    </div>
  );
}
