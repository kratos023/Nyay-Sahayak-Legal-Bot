"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, useTranslation, detectBrowserLanguage, LANGUAGE_META } from "@/lib/translations";

const LANG_CODE_TO_NAME: Record<string, string> = {
  en:"English", hi:"Hindi", bn:"Bengali", te:"Telugu", ta:"Tamil",
  mr:"Marathi", gu:"Gujarati", kn:"Kannada", ml:"Malayalam", pa:"Punjabi", or:"Odia",
};

interface LanguageContextType {
  language: Language;
  uiLang: Language;           // UI language (what interface shows)
  langName: string;           // Full English name e.g. "Marathi" — use for outputLang sync
  setLanguage: (l: Language) => void;
  setUiLang: (l: Language) => void;
  t: ReturnType<typeof useTranslation>;
  isHindi: boolean;
  simpleMode: boolean;
  setSimpleMode: (v: boolean) => void;
  firstVisit: boolean;
  completeFirstVisit: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState]   = useState<Language>("en"); // chat I/O lang
  const [uiLang, setUiLangState]       = useState<Language>("en"); // UI lang
  const [simpleMode, setSimpleModeState] = useState(false);
  const [firstVisit, setFirstVisit]    = useState(false);
  const [hydrated, setHydrated]        = useState(false);

  useEffect(() => {
    const saved    = localStorage.getItem("nyay-ui-lang") as Language | null;
    const savedIO  = localStorage.getItem("nyay-io-lang") as Language | null;
    const savedSimple = localStorage.getItem("nyay-simple") === "1";
    // "chosen" is cleared on logout, so this will be false on every fresh login
    const seen     = localStorage.getItem("nyay-lang-chosen") === "1";

    const detected = detectBrowserLanguage();

    if (saved) {
      setUiLangState(saved);
    } else if (!seen && detected !== "en") {
      setUiLangState(detected);
    }

    if (savedIO) setLanguageState(savedIO);
    else if (!seen && detected !== "en") setLanguageState(detected);

    setSimpleModeState(savedSimple);
    // Always show picker on fresh login (seen is false after logout)
    setFirstVisit(!seen);
    setHydrated(true);
  }, []);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("nyay-io-lang", l);
  };

  const setUiLang = (l: Language) => {
    setUiLangState(l);
    localStorage.setItem("nyay-ui-lang", l);
  };

  const setSimpleMode = (v: boolean) => {
    setSimpleModeState(v);
    localStorage.setItem("nyay-simple", v ? "1" : "0");
  };

  const completeFirstVisit = () => {
    setFirstVisit(false);
    localStorage.setItem("nyay-lang-chosen", "1");
  };

  const t = useTranslation(uiLang);

  if (!hydrated) return null; // prevent SSR mismatch

  return (
    <LanguageContext.Provider value={{
      language, uiLang, langName: LANG_CODE_TO_NAME[uiLang] ?? "English",
      setLanguage, setUiLang, t,
      isHindi: uiLang !== "en",
      simpleMode, setSimpleMode,
      firstVisit, completeFirstVisit,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
