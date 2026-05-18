"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import LocationFinder from "@/components/LocationFinder";
import DocumentPanel from "@/components/DocumentPanel";
import RightsCards from "@/components/RightsCards";
import RTIPanel from "@/components/RTIPanel";
import OCRPanel from "@/components/OCRPanel";
import LegalNews from "@/components/LegalNews";
import GuidedFlow from "@/components/GuidedFlow";
import LawyerFinder from "@/components/LawyerFinder";
import LegalTemplates from "@/components/LegalTemplates";
import CaseTracker from "@/components/CaseTracker";
import FIRPanel from "@/components/FIRPanel";
import Dashboard from "@/components/Dashboard";
import LegalSearch from "@/components/LegalSearch";
import { clearContext } from "@/lib/api";
import type { Message } from "@/lib/api";
import GlassMorphCard from "@/components/GlassMorphCard";

export type Panel =
  | "chat" | "location" | "docs" | "rights" | "rti" | "ocr"
  | "news" | "flow" | "lawyers" | "templates" | "cases" | "fir"
  | "dashboard" | "search";

const LANG_NAME_TO_CODE: Record<string, string> = {
  English:"en", Hindi:"hi", Bengali:"bn", Telugu:"te", Tamil:"ta",
  Marathi:"mr", Gujarati:"gu", Kannada:"kn", Malayalam:"ml", Punjabi:"pa", Odia:"or",
};
const LANG_CODE_TO_NAME: Record<string, string> = {
  en:"English", hi:"Hindi", bn:"Bengali", te:"Telugu", ta:"Tamil",
  mr:"Marathi", gu:"Gujarati", kn:"Kannada", ml:"Malayalam", pa:"Punjabi", or:"Odia",
};

export default function Home() {
  const { user, loading, logout } = useAuth();
  const { t, simpleMode, uiLang, setLanguage: setCtxLang, setUiLang: setCtxUiLang } = useLanguage();
  const router = useRouter();

  const [messages, setMessages]             = useState<Message[]>([]);
  const [inputLang, setInputLang]           = useState("English");
  // ✅ outputLang always starts equal to uiLang — syncs on every mount
  const [outputLang, setOutputLangState]    = useState("English");
  const [enableTTS, setEnableTTS]           = useState(false);
  const [panel, setPanel]                   = useState<Panel>("chat");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync outputLang with uiLang whenever context language changes
  useEffect(() => {
    const name = LANG_CODE_TO_NAME[uiLang] ?? "English";
    setOutputLangState(name);
    localStorage.setItem("nyay-output-lang", name);
  }, [uiLang]);

  // Also sync from localStorage on first mount (in case context hasn't updated yet)
  useLayoutEffect(() => {
    const uiCode = localStorage.getItem("nyay-ui-lang") || "en";
    const name = LANG_CODE_TO_NAME[uiCode] ?? "English";
    setOutputLangState(name);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  if (loading || !user) return (
    <div className="h-full flex items-center justify-center relative">
      <GlassMorphCard className="p-8 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 animate-spin" />
          <div className="text-white/80 font-medium">{t.loading}</div>
        </div>
      </GlassMorphCard>
    </div>
  );

  function setOutputLang(lang: string) {
    setOutputLangState(lang);
    localStorage.setItem("nyay-output-lang", lang);
    const code = LANG_NAME_TO_CODE[lang] || "en";
    setCtxLang(code as Parameters<typeof setCtxLang>[0]);
    setCtxUiLang(code as Parameters<typeof setCtxUiLang>[0]);
  }

  async function handleNewChat() {
    await clearContext(user!.user_id);
    setMessages([]);
    setPanel("chat");
  }

  function sendToChat(text: string) {
    setPendingMessage(text);
    setPanel("chat");
    setSidebarOpen(false);
  }

  function openPanel(p: Panel) {
    setPanel(p);
    setSidebarOpen(false);
  }

  const commonProps = { onClose: () => setPanel("chat") };

  return (
    <div className="flex h-full overflow-hidden relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-500 ease-out md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          userId={user.user_id}
          userName={user.name}
          userRole={user.role}
          inputLang={inputLang}
          outputLang={outputLang}
          enableTTS={enableTTS}
          onInputLangChange={setInputLang}
          onOutputLangChange={setOutputLang}
          onTTSChange={setEnableTTS}
          onLoadSession={msgs => { setMessages(msgs); setPanel("chat"); }}
          onNewChat={handleNewChat}
          onOpenLocation={() => openPanel("location")}
          onOpenDocs={() => openPanel("docs")}
          onOpenRights={() => openPanel("rights")}
          onOpenRTI={() => openPanel("rti")}
          onOpenOCR={() => openPanel("ocr")}
          onOpenNews={() => openPanel("news")}
          onOpenFlow={() => openPanel("flow")}
          onOpenLawyers={() => openPanel("lawyers")}
          onOpenTemplates={() => openPanel("templates")}
          onOpenCases={() => openPanel("cases")}
          onOpenFIR2={() => openPanel("fir")}
          onOpenDashboard={() => openPanel("dashboard")}
          onOpenSearch={() => openPanel("search")}
          onLogout={logout}
          activePanel={panel}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <GlassMorphCard hover onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-10 p-3 rounded-xl cursor-pointer">
          <span className="text-lg text-white/80">☰</span>
        </GlassMorphCard>

        <div className={panel === "chat" ? "flex flex-col flex-1 min-h-0 overflow-hidden" : "hidden"}>
          <ChatWindow
            userId={user.user_id}
            messages={messages}
            inputLang={inputLang}
            outputLang={outputLang}
            enableTTS={enableTTS}
            simpleMode={simpleMode}
            pendingMessage={pendingMessage}
            onPendingMessageConsumed={() => setPendingMessage(null)}
            onMessagesChange={(msgs) => { setMessages(msgs); if (msgs.length > 0 && msgs[msgs.length-1].role === "assistant") setRefreshTrigger(p => p + 1); }}
            onOpenLocation={() => openPanel("location")}
            onOpenFIR={() => openPanel("fir")}
            onOpenReport={() => openPanel("docs")}
            onOpenDocs={() => openPanel("docs")}
          />
        </div>
        {panel === "location"  && <LocationFinder {...commonProps} />}
        {panel === "docs"      && (
          <DocumentPanel {...commonProps}
            onOpenLocation={() => openPanel("location")}
            onOpenFIR={() => openPanel("fir")}
            onOpenReport={() => openPanel("docs")}
            userId={user.user_id}
            onSendToChat={sendToChat}
          />
        )}
        {panel === "rights"    && <RightsCards   {...commonProps} language={outputLang} onSendToChat={sendToChat} />}
        {panel === "rti"       && <RTIPanel       {...commonProps} />}
        {panel === "ocr"       && <OCRPanel       {...commonProps} language={outputLang} userId={user.user_id} onSendToChat={sendToChat} />}
        {panel === "news"      && <LegalNews      {...commonProps} language={outputLang} onSendToChat={sendToChat} />}
        {panel === "flow"      && <GuidedFlow     {...commonProps} language={outputLang} userId={user.user_id} onSendToChat={sendToChat} />}
        {panel === "lawyers"   && <LawyerFinder   {...commonProps} language={outputLang} />}
        {panel === "templates" && <LegalTemplates {...commonProps} language={outputLang} />}
        {panel === "cases"     && <CaseTracker    {...commonProps} />}
        {panel === "fir"       && <FIRPanel       {...commonProps} />}
        {panel === "dashboard" && (
          <Dashboard
            userId={user.user_id}
            onClose={() => setPanel("chat")}
            onOpenChat={() => setPanel("chat")}
          />
        )}
        {panel === "search" && (
          <LegalSearch
            onClose={() => setPanel("chat")}
            language={outputLang}
          />
        )}
      </main>
    </div>
  );
}