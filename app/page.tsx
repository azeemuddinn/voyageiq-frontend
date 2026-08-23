"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: "ai" | "user";
  content: string;
  isError?: boolean;
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [ingestStatus, setIngestStatus] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I've read through your uploaded guides. Ask me anything about routes, hours, or hidden spots—I'll answer only from what you've uploaded.",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  // Inside your Home component, add document fetching state:
  const [documents, setDocuments] = useState<any[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [textInputTitle, setTextInputTitle] = useState("");
  const [textInputContent, setTextInputContent] = useState("");
  const [activeTab, setActiveTab] = useState<"pdf" | "text" | "link">("pdf");

  // Fetch documents on load:
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/documents`);
      const data = await res.json();
      if (res.ok) setDocuments(data.documents);
    } catch (err) {
      console.error("Failed to fetch documents");
    }
  };

  // Call fetchDocuments() right after a successful PDF upload or text ingestion.

  useEffect(() => {
    const saved = localStorage.getItem("voyageiq-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("voyageiq-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("voyageiq-theme", "light");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIngestStatus("Uploading & vectorizing...");
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/ingest-pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setIngestStatus(`Success! Indexed ${file.name}`);
      } else {
        setIngestStatus(`Error: ${data.detail}`);
      }
    } catch (err) {
      setIngestStatus("Failed to connect to backend.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion;
    setInputQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });
      const data = await res.json();
      const answer = data.answer || data.detail;
      const isMissing = answer.includes("I cannot find that");

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: answer, isError: isMissing },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Failed to fetch response from backend.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-[380px] shrink-0 h-screen overflow-y-auto bg-white/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-white text-lg tracking-tight">
              VoyageIQ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="status-dot absolute inline-flex h-full w-full rounded-full bg-sky-500"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              online
            </div>

            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className="theme-track relative w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center px-0.5 shrink-0"
            >
              <span className="theme-knob w-5 h-5 rounded-full bg-white dark:bg-slate-950 shadow-sm flex items-center justify-center relative">
                <svg
                  className={`theme-icon w-3 h-3 text-amber-500 ${darkMode ? "opacity-0 absolute" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg
                  className={`theme-icon w-3 h-3 text-sky-300 ${darkMode ? "opacity-100" : "opacity-0 absolute"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-7">
          {/* Knowledge Base Ingestion Tabs */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Knowledge Base
            </h3>

            <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab("pdf")}
                className={`flex-1 py-1 rounded-md font-medium transition-all ${activeTab === "pdf" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                PDF
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 py-1 rounded-md font-medium transition-all ${activeTab === "text" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Paste Text
              </button>
            </div>

            {activeTab === "pdf" ? (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-sky-500/50 hover:bg-sky-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer block group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <svg
                  className="w-6 h-6 mx-auto text-slate-400 group-hover:text-sky-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drop PDFs or{" "}
                  <span className="text-sky-600 dark:text-sky-400 font-medium">
                    browse
                  </span>
                </p>
              </label>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Document Title"
                  value={textInputTitle}
                  onChange={(e) => setTextInputTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                />
                <textarea
                  placeholder="Paste text content here..."
                  value={textInputContent}
                  onChange={(e) => setTextInputContent(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 h-20 resize-none"
                />
                <button
                  onClick={async () => {
                    if (!textInputTitle || !textInputContent) return;
                    setIngestStatus("Saving text...");
                    const res = await fetch(`${BACKEND_URL}/ingest`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: textInputTitle,
                        content: textInputContent,
                        source_type: "text",
                      }),
                    });
                    if (res.ok) {
                      setIngestStatus("Success!");
                      setTextInputTitle("");
                      setTextInputContent("");
                      fetchDocuments();
                    }
                  }}
                  className="w-full py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Vectorize Text
                </button>
              </div>
            )}

            {ingestStatus && (
              <p className="mt-2 text-xs text-sky-600 dark:text-sky-400 font-medium">
                {ingestStatus}
              </p>
            )}

            {/* Dynamic Document List */}
            <ul className="mt-4 space-y-1.5">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg
                      className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="truncate text-slate-700 dark:text-slate-300 text-xs">
                      {doc.title}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Indexed
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 h-screen flex flex-col min-w-0">
        <header className="shrink-0 px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div>
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              AI Tourist Assistant
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded in your uploaded guides
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "justify-end ml-auto" : ""}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-sky-500 text-white rounded-tr-sm font-medium"
                    : msg.isError
                      ? "bg-amber-50 dark:bg-amber-500/5 border border-amber-300/60 dark:border-amber-500/30 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-8 py-4">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 shadow-sm"
          >
            <textarea
              rows={1}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ask about your documents, travel spots, or guides..."
              className="flex-1 bg-transparent resize-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none py-1.5 max-h-32"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 flex items-center justify-center text-white transition-colors shrink-0 disabled:bg-slate-300"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
