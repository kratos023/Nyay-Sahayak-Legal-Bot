"use client";
import { useLanguage } from "@/context/LanguageContext";
import { Language, LANGUAGE_META, translations } from "@/lib/translations";
import { Scale } from "lucide-react";

const LANGUAGES_ORDER: Language[] = ["hi", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or", "en"];

const LANG_NAME_MAP: Record<string, string> = {
  en:"English", hi:"Hindi", bn:"Bengali", te:"Telugu", ta:"Tamil",
  mr:"Marathi", gu:"Gujarati", kn:"Kannada", ml:"Malayalam", pa:"Punjabi", or:"Odia",
};

export default function LanguagePicker() {
  const { uiLang, setUiLang, setLanguage, completeFirstVisit, firstVisit } = useLanguage();

  if (!firstVisit) return null;

  const t = translations[uiLang] ?? translations.en;

  function pick(lang: Language) {
    setUiLang(lang);
    setLanguage(lang);
    // Save output language name for page.tsx initialisation
    localStorage.setItem("nyay-output-lang", LANG_NAME_MAP[lang] ?? "English");

    // Dispatch custom event so login/signup pages update immediately
    // (same-tab localStorage writes do NOT fire the window 'storage' event)
    window.dispatchEvent(new CustomEvent("nyay-lang-picked", { detail: lang }));

    completeFirstVisit();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(8,12,24,0.97)", backdropFilter: "blur(20px)" }}>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #c9920a, #7c5a06)" }}>
            <Scale size={24} className="text-amber-100" />
          </div>
          <div className="text-center">
            <p className="font-display text-2xl"
              style={{ background: "linear-gradient(90deg, #f0b429, #c9920a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nyay-Sahayak
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>न्याय-सहायक · ন্যায়-সহায়ক · న్యాయ్-సహాయక్</p>
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-white">{t.chooseLanguage}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{t.chooseLanguageDesc}</p>
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {LANGUAGES_ORDER.map(lang => {
            const meta = LANGUAGE_META[lang];
            const isSelected = lang === uiLang;
            return (
              <button key={lang} onClick={() => pick(lang)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.97]"
                style={{
                  background: isSelected ? "rgba(201,146,10,0.15)" : "rgba(255,255,255,0.04)",
                  border: isSelected ? "1px solid rgba(201,146,10,0.5)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate"
                    style={{ color: isSelected ? "var(--gold-light)" : "var(--text)" }}>
                    {meta.native}
                  </p>
                  <p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {meta.english}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "var(--gold)" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Free legal aid note */}
        <div className="rounded-xl px-4 py-3 text-center"
          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p className="text-[0.72rem] text-green-400 font-medium">🆓 {t.freeLegalAid}</p>
          <p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-3)" }}>{t.freeLegalAidDesc}</p>
        </div>
      </div>
    </div>
  );
}
