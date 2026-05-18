"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { Send, Upload, ArrowRight, Share2 } from "lucide-react";
import MessageBubble, { TypingIndicator } from "./MessageBubble";
import SuggestionChips from "./SuggestionChips";
import VoiceButton from "./VoiceButton";
import { transcribeAudio } from "@/lib/api";
import { LANG_CODE } from "./VoiceButton";
import type { Message, Suggestions } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUICK_TOPIC_DEFS = [
  { icon: "👨‍👩‍👧", key: "familyLaw",      q: "What are the grounds for divorce in India?" },
  { icon: "🏪",      key: "consumerRights", q: "How can I file a consumer complaint?" },
  { icon: "🏠",      key: "propertyLaw",    q: "What documents are needed for property registration?" },
  { icon: "⚖️",     key: "criminalLaw",    q: "What are my rights if I am arrested by police?" },
] as const;

interface Props {
  userId: string; messages: Message[];
  inputLang: string; outputLang: string; enableTTS: boolean;
  simpleMode?: boolean;
  pendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
  onMessagesChange: (msgs: Message[]) => void;
  onOpenLocation: () => void; onOpenFIR: () => void;
  onOpenReport: () => void;   onOpenDocs: () => void;
}

export default function ChatWindow({
  userId, messages, inputLang, outputLang, enableTTS, simpleMode = false,
  pendingMessage, onPendingMessageConsumed,
  onMessagesChange, onOpenLocation, onOpenFIR, onOpenReport, onOpenDocs
}: Props) {
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [streamingText, setStreamingText] = useState(""); // text being streamed in
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [shareMsg, setShareMsg]       = useState<string | null>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const audioUploadRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (pendingMessage && !loading) {
      submit(pendingMessage);
      onPendingMessageConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingText]);

  useEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 120) + "px";
  }, [input]);

  // Cleanup abort on unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function submit(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text, language: inputLang };
    const updatedWithUser  = [...messages, userMsg];
    onMessagesChange(updatedWithUser);
    setInput(""); setSuggestions(null); setLoading(true); setStreamingText("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, message: text,
          input_language: inputLang, output_language: outputLang,
          enable_tts: enableTTS, simple_mode: simpleMode,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "chunk") {
              accumulated += event.text;
              setStreamingText(accumulated);
            } else if (event.type === "done") {
              // Commit streamed message to messages array
              const aiMsg: Message = {
                role: "assistant",
                content: accumulated,
                language: outputLang,
              };
              onMessagesChange([...updatedWithUser, aiMsg]);
              setStreamingText("");
              if (event.suggestions) setSuggestions(event.suggestions);
              if (enableTTS && event.audio_base64) {
                new Audio(`data:audio/wav;base64,${event.audio_base64}`).play().catch(() => {});
              }
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            // Ignore malformed SSE lines
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return; // user cancelled
      setStreamingText("");
      onMessagesChange([...updatedWithUser, {
        role: "assistant",
        content: err?.message?.includes("Rate limit")
          ? `⏳ ${err.message}`
          : "⚠️ Could not reach the server. Please ensure the backend is running.",
      }]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
  }

  function handleTranscribed(text: string) {
    setInput(prev => prev ? `${prev} ${text}` : text);
    textareaRef.current?.focus();
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await transcribeAudio(file, LANG_CODE[inputLang] || "hi");
      if (res.text) handleTranscribed(res.text);
    } catch { alert("Could not transcribe. Please try again."); }
    e.target.value = "";
  }

  // ── WhatsApp sharing ───────────────────────────────────────────────────────
  function shareOnWhatsApp(content: string) {
    const stripped = content
      .replace(/#{1,6}\s/g, "")       // headings
      .replace(/\*\*(.*?)\*\*/g, "$1") // bold
      .replace(/\*(.*?)\*/g, "$1")     // italic
      .replace(/^[-•]\s/gm, "• ")      // bullets
      .replace(/\n{3,}/g, "\n\n")      // extra blank lines
      .trim();

    const header  = `*Nyay-Sahayak — Legal Information*\n_AI-powered assistant for Indian law_\n\n`;
    const footer  = `\n\n_This is general legal information only. Please consult a qualified lawyer for specific advice._\n🔗 nyaysahayak.in`;
    const maxLen  = 1900;
    const body    = stripped.length > maxLen ? stripped.slice(0, maxLen) + "…" : stripped;
    const message = header + body + footer;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    setShareMsg(null);
  }

  function handleShareClick(content: string) {
    if (navigator.share) {
      // Native share sheet on mobile
      navigator.share({
        title: "Legal Information — Nyay-Sahayak",
        text: content.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").trim(),
      }).catch(() => {});
    } else {
      setShareMsg(content);
    }
  }

  const isEmpty = messages.length === 0;
  const isStreaming = loading && streamingText.length > 0;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>

      {/* ── Header bar ── */}
      <div className="flex-shrink-0 px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.04)",
                 background: "linear-gradient(180deg, rgba(13,17,32,0.95) 0%, transparent 100%)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-[0.75rem] text-[var(--text-3)] uppercase tracking-widest">
            Legal AI · {outputLang}
          </p>
        </div>
        <p className="text-[0.7rem] text-[var(--text-3)]">
          {messages.length > 0 ? `${Math.ceil(messages.length / 2)} exchange${messages.length > 2 ? "s" : ""}` : "New conversation"}
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">

        {/* Empty state */}
        {isEmpty && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-10 py-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.68rem]
                text-[var(--gold-light)] border border-[var(--gold)]/20 mb-2"
                style={{ background: "rgba(201,146,10,0.06)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                AI Legal Assistant · India
              </div>
              <h1 className="font-display text-4xl text-gold-gradient leading-tight">
                Nyay-Sahayak
              </h1>
              <p className="text-[0.85rem] text-[var(--text-3)] max-w-xs mx-auto leading-relaxed">
                Ask any legal question in your language — Hindi, Tamil, Telugu and 8 more.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full max-w-md stagger">
              {QUICK_TOPIC_DEFS.map(({ icon, key, q }) => (
                <button key={key} onClick={() => submit(q)}
                  className="group text-left px-4 py-3.5 rounded-2xl border transition-all duration-200
                    hover:border-[var(--gold)]/30 active:scale-[0.98]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                  <span className="text-xl block mb-2">{icon}</span>
                  <p className="text-[0.78rem] font-medium text-[var(--text-2)] group-hover:text-[var(--text)] transition-colors">{t[key]}</p>
                  <p className="text-[0.68rem] text-[var(--text-3)] mt-1 line-clamp-2 leading-relaxed">{q}</p>
                  <div className="flex items-center gap-1 mt-2 text-[0.62rem] text-[var(--text-3)]
                    group-hover:text-[var(--gold-light)] transition-colors">
                    Ask this <ArrowRight size={9} />
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[0.68rem] text-[var(--text-3)] flex items-center gap-1.5">
              {t.tapMicToSpeak} — {inputLang}
            </p>
          </div>
        )}

        {/* Committed messages */}
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-up group" style={{ animationDelay: `${Math.min(i * 0.03, 0.2)}s` }}>
            <MessageBubble message={msg} outputLanguage={outputLang} />

            {/* Share button on AI messages */}
            {msg.role === "assistant" && (
              <div className="ml-11 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleShareClick(msg.content)}
                  className="flex items-center gap-1 text-[0.62rem] text-[var(--text-3)] hover:text-green-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  <Share2 size={10} /> Share on WhatsApp
                </button>
              </div>
            )}

            {msg.role === "assistant" && i === messages.length - 1 && suggestions && (
              <div className="ml-11 mt-3">
                <SuggestionChips
                  suggestions={suggestions}
                  onFollowUp={q => submit(q)}
                  onOpenLocation={onOpenLocation}
                  onOpenFIR={onOpenFIR}
                  onOpenReport={onOpenReport}
                  onOpenDocs={onOpenDocs}
                />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message — live text appearing */}
        {isStreaming && (
          <div className="animate-fade-up">
            <MessageBubble
              message={{ role: "assistant", content: streamingText, language: outputLang }}
              outputLanguage={outputLang}
              streaming
            />
          </div>
        )}

        {/* Typing indicator — only while waiting for first chunk */}
        {loading && !isStreaming && <div className="animate-fade-up"><TypingIndicator /></div>}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── WhatsApp share modal (desktop fallback) ── */}
      {shareMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShareMsg(null)}>
          <div className="rounded-2xl p-6 max-w-sm w-full space-y-4"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border-md)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white">Share this answer</h3>
            <button onClick={() => shareOnWhatsApp(shareMsg)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-colors"
              style={{ background: "#25D366" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </button>
            <button onClick={() => {
              navigator.clipboard.writeText(shareMsg.replace(/#{1,6}\s/g,"").replace(/\*\*/g,"").trim());
              setShareMsg(null);
            }}
              className="w-full py-2.5 rounded-xl text-sm text-[var(--text-2)] border border-white/10 hover:bg-white/5 transition-colors">
              Copy to clipboard
            </button>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 px-4 md:px-8 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)",
                 background: "linear-gradient(0deg, var(--bg-2) 0%, transparent 100%)" }}>
        <div className="flex items-end gap-2 rounded-2xl px-4 py-3 border input-glow transition-all duration-300"
          style={{ background: "var(--bg-3)", borderColor: "rgba(255,255,255,0.08)" }}>
          <textarea ref={textareaRef} rows={1} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.typeYourMessage}
            className="flex-1 bg-transparent text-[0.875rem] text-[var(--text)] placeholder:text-[var(--text-3)]
              resize-none focus:outline-none leading-relaxed"
            style={{ minHeight: "22px" }}
          />
          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            <VoiceButton language={inputLang} onTranscribed={handleTranscribed} disabled={loading} />
            <input ref={audioUploadRef} type="file" className="hidden"
              accept=".wav,.mp3,.m4a,.ogg,.webm" onChange={handleAudioUpload} />
            <button onClick={() => audioUploadRef.current?.click()} disabled={loading}
              className="p-1.5 rounded-xl text-[var(--text-3)] hover:text-[var(--text-2)]
                hover:bg-white/8 transition-all disabled:opacity-40"
              title="Upload audio">
              <Upload size={14} />
            </button>
            <button onClick={() => loading ? abortRef.current?.abort() : submit(input)}
              disabled={!input.trim() && !loading}
              className="p-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: loading ? "var(--bg-4)" : (input.trim() ? "var(--gold)" : "var(--bg-4)"),
                       color: loading ? "#ef4444" : (input.trim() ? "#000" : "var(--text-3)") }}
              title={loading ? "Stop generating" : "Send"}>
              {loading
                ? <span className="text-[0.6rem] font-bold px-0.5">■</span>
                : <Send size={14} />}
            </button>
          </div>
        </div>
        <p className="text-[0.62rem] text-[var(--text-3)] text-center mt-2">
          General legal information only — consult a qualified lawyer for specific advice
        </p>
      </div>
    </div>
  );
}
