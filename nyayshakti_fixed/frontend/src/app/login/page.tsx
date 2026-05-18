"use client";
import { useState, useLayoutEffect, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { translations } from "@/lib/translations";
import type { Language } from "@/lib/translations";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [lang, setLang]         = useState<Language>("en");

  // useLayoutEffect fires BEFORE browser paints → zero flash of English
  useLayoutEffect(() => {
    const saved = localStorage.getItem("nyay-ui-lang") as Language | null;
    if (saved && translations[saved]) setLang(saved);
  }, []);

  // Also update if LanguagePicker picks while on this page
  useEffect(() => {
    function onPick(e: Event) {
      const picked = (e as CustomEvent<string>).detail as Language;
      if (picked && translations[picked]) setLang(picked);
    }
    window.addEventListener("nyay-lang-picked", onPick);
    return () => window.removeEventListener("nyay-lang-picked", onPick);
  }, []);

  const t = translations[lang] ?? translations.en;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push("/");
  }

  const inputCls = `w-full rounded-xl px-4 py-3 text-[0.875rem] border focus:outline-none transition-all`;
  const iStyle   = { background:"var(--bg-3)", borderColor:"var(--border-md)", color:"var(--text)" };

  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden" style={{ background:"var(--bg)" }} suppressHydrationWarning>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        style={{ background:"radial-gradient(circle, var(--gold-light) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm px-4 space-y-8 animate-fade-up">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30" style={{ background:"var(--gold)" }} />
            <div className="relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#b45309,#78350f)", border:"1px solid rgba(201,146,10,0.4)" }}>
              <Scale size={28} className="text-amber-100" />
            </div>
          </div>
          <div suppressHydrationWarning>
            <h1 className="font-display text-3xl" style={{ background:"linear-gradient(90deg,#f0b429,#c9920a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Nyay-Sahayak
            </h1>
            <p className="text-[0.78rem] mt-1" style={{ color:"var(--text-3)" }} suppressHydrationWarning>{t.signInSubtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-4 border" style={{ background:"var(--bg-2)", borderColor:"var(--border-md)" }}>
          {error && (
            <div className="px-4 py-3 rounded-xl text-[0.8rem] text-red-300 animate-scale-in"
              style={{ background:"rgba(127,29,29,0.3)", border:"1px solid rgba(239,68,68,0.3)" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest block" style={{ color:"var(--text-3)" }} suppressHydrationWarning>
                {t.emailLabel}
              </label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" className={inputCls} style={iStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest block" style={{ color:"var(--text-3)" }} suppressHydrationWarning>
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input type={showPw?"text":"password"} required value={password}
                  onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                  className={`${inputCls} pr-10`} style={iStyle} />
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color:"var(--text-3)" }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-[0.875rem] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ background:"linear-gradient(135deg,var(--gold) 0%,#b45309 100%)", color:"#000" }}
              suppressHydrationWarning>
              {loading
                ? <><Loader2 size={15} className="animate-spin"/> {t.signingIn}</>
                : <>{t.signInBtn} <ArrowRight size={15}/></>}
            </button>
          </form>
        </div>

        <p className="text-center text-[0.8rem]" style={{ color:"var(--text-3)" }} suppressHydrationWarning>
          {t.newHere}{" "}
          <Link href="/signup" className="font-medium transition-colors" style={{ color:"var(--gold-light)" }}>
            {t.createAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}
