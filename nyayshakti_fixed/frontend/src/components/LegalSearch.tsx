"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen, Scale, FileText, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import GlassMorphCard from "./GlassMorphCard";
import { legalSearch, getSearchSuggestions, type SearchResult, type SearchResponse } from "@/lib/api";

interface Props {
  onClose: () => void;
  language: string;
}

const SEARCH_TYPES = [
  { id: "all",           label: "🔍 All",          desc: "Everything" },
  { id: "statute",       label: "📜 Laws",          desc: "Acts & Sections" },
  { id: "case_law",      label: "⚖️ Case Law",      desc: "Court judgments" },
  { id: "constitutional",label: "🏛️ Constitutional", desc: "Constitutional law" },
  { id: "rights",        label: "🛡️ Rights",        desc: "Citizen rights" },
  { id: "procedure",     label: "📋 Procedure",     desc: "Legal process" },
];

const TYPE_STYLE: Record<string, string> = {
  statute:        "bg-blue-900/30 text-blue-300 border-blue-700/30",
  case_law:       "bg-purple-900/30 text-purple-300 border-purple-700/30",
  constitutional: "bg-amber-900/30 text-amber-300 border-amber-700/30",
  procedure:      "bg-teal-900/30 text-teal-300 border-teal-700/30",
  right:          "bg-emerald-900/30 text-emerald-300 border-emerald-700/30",
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  statute:        <FileText size={13} />,
  case_law:       <Scale size={13} />,
  constitutional: <BookOpen size={13} />,
  procedure:      <ChevronRight size={13} />,
  right:          <Sparkles size={13} />,
};

const RELEVANCE_WIDTH: Record<string, string> = { high: "w-full", medium: "w-2/3", low: "w-1/3" };
const RELEVANCE_COLOR: Record<string, string> = {
  high: "bg-green-500", medium: "bg-amber-500", low: "bg-slate-500",
};

const QUICK_EXAMPLES = [
  "What are my rights if police arrest me?",
  "How to file consumer complaint online?",
  "Section 138 cheque bounce procedure",
  "Domestic violence protection order steps",
  "Property registration documents required",
  "Bail conditions under CrPC",
  "RTI application procedure",
  "Workplace harassment POSH Act",
];

export default function LegalSearch({ onClose, language }: Props) {
  const [query, setQuery]           = useState("");
  const [searchType, setSearchType] = useState("all");
  const [results, setResults]       = useState<SearchResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg]     = useState(false);
  const [error, setError]           = useState("");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const s = await getSearchSuggestions(query);
        setSuggestions(s);
      } catch { /* ignore */ }
    }, 300);
  }, [query]);

  async function handleSearch(q?: string) {
    const searchQ = (q || query).trim();
    if (!searchQ) return;
    setQuery(searchQ);
    setShowSugg(false);
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await legalSearch(searchQ, searchType, language);
      setResults(res);
    } catch (e: any) {
      setError("Could not connect to the search service. Please check the backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") { setShowSugg(false); onClose(); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-700/20
            border border-indigo-500/30 flex items-center justify-center">
            <Search size={16} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold text-[0.95rem]">Legal Search</h2>
            <p className="text-white/40 text-[0.65rem]">AI-powered search across Indian laws & case law</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3
            focus-within:border-indigo-500/60 focus-within:bg-white/[0.08] transition-all">
            <Search size={16} className="text-white/40 flex-shrink-0" />
            <input ref={inputRef} value={query}
              onChange={e => { setQuery(e.target.value); setShowSugg(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Search Indian laws, rights, procedures…"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none" />
            {query && (
              <button onClick={() => { setQuery(""); setResults(null); setSuggestions([]); }}
                className="text-white/40 hover:text-white transition-all">
                <X size={14} />
              </button>
            )}
            <button onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-[0.75rem] font-semibold
                hover:bg-indigo-400 disabled:opacity-40 transition-all flex-shrink-0">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Autocomplete suggestions */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/10
              bg-[#0d1120]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map(s => (
                <button key={s} onClick={() => handleSearch(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white
                    transition-all flex items-center gap-2">
                  <Search size={12} className="text-white/30 flex-shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search type filter */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {SEARCH_TYPES.map(({ id, label }) => (
            <button key={id} onClick={() => setSearchType(id)}
              className={`px-3 py-1 rounded-lg text-[0.7rem] transition-all border ${
                searchType === id
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "text-white/40 border-transparent hover:text-white/70 hover:bg-white/[0.05]"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* Quick examples — shown before first search */}
        {!results && !loading && !error && (
          <>
            <p className="text-white/30 text-xs uppercase tracking-widest">Try searching for</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUICK_EXAMPLES.map(ex => (
                <button key={ex} onClick={() => handleSearch(ex)}
                  className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
                    hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all group">
                  <p className="text-[0.78rem] text-white/70 group-hover:text-white transition-colors">{ex}</p>
                  <p className="text-[0.6rem] text-white/30 mt-1 flex items-center gap-1">
                    Search <ChevronRight size={9} />
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
              <Sparkles size={16} className="absolute inset-0 m-auto text-indigo-400" />
            </div>
            <p className="text-white/50 text-sm">Searching Indian law database…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <GlassMorphCard className="rounded-xl p-4 border border-red-500/30 bg-red-950/10">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </div>
          </GlassMorphCard>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Summary */}
            <GlassMorphCard className="rounded-xl p-4 border border-indigo-500/20 bg-indigo-950/10">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-[0.8rem] text-white/80 leading-relaxed">{results.summary}</p>
              </div>
            </GlassMorphCard>

            {/* Result cards */}
            <div className="space-y-3">
              {results.results?.map((r: SearchResult, i: number) => {
                const isExpanded = expanded === `${i}`;
                return (
                  <GlassMorphCard key={i} hover className="rounded-xl p-4 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : `${i}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] border ${TYPE_STYLE[r.type] || "bg-white/10 text-white/60 border-white/10"}`}>
                            {TYPE_ICON[r.type]} {r.type?.replace("_", " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className={`h-1 w-16 rounded-full bg-white/10 overflow-hidden`}>
                              <div className={`h-full rounded-full transition-all ${RELEVANCE_COLOR[r.relevance]} ${RELEVANCE_WIDTH[r.relevance]}`} />
                            </div>
                            <span className="text-[0.6rem] text-white/30 capitalize">{r.relevance}</span>
                          </div>
                        </div>
                        <p className="text-[0.88rem] font-semibold text-white">{r.title}</p>
                        <p className="text-[0.7rem] text-indigo-400/80 font-mono mt-0.5">{r.citation}</p>
                        <p className="text-[0.75rem] text-white/60 mt-2 leading-relaxed line-clamp-2">{r.description}</p>
                      </div>
                      <ChevronRight size={14} className={`text-white/30 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <p className="text-[0.65rem] text-white/40 uppercase tracking-widest mb-2">Key Points</p>
                          <ul className="space-y-1.5">
                            {r.key_points?.map((pt: string, j: number) => (
                              <li key={j} className="flex items-start gap-2 text-[0.75rem] text-white/70">
                                <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/20">
                          <p className="text-[0.65rem] text-emerald-400 uppercase tracking-widest mb-1">💡 What you can do</p>
                          <p className="text-[0.75rem] text-white/70 leading-relaxed">{r.practical_tip}</p>
                        </div>
                      </div>
                    )}
                  </GlassMorphCard>
                );
              })}
            </div>

            {/* Related searches */}
            {results.related_searches?.length > 0 && (
              <div>
                <p className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-2">Related Searches</p>
                <div className="flex flex-wrap gap-2">
                  {results.related_searches.map((s: string) => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="px-3 py-1.5 rounded-full text-[0.7rem] bg-white/[0.04] border border-white/[0.08]
                        text-white/60 hover:text-white hover:border-indigo-500/30 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <GlassMorphCard className="rounded-xl p-3 border border-amber-500/20 bg-amber-950/10">
              <p className="text-[0.65rem] text-amber-400/80 leading-relaxed">
                ⚠️ {results.disclaimer}
                {results.ai_note && ` ${results.ai_note}`}
              </p>
            </GlassMorphCard>
          </>
        )}
      </div>
    </div>
  );
}
