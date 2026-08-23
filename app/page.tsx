"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"text" | "pdf">("text");

  const [docId, setDocId] = useState("");
  const [ingestStatus, setIngestStatus] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:8000";

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus("Ingesting and embedding...");

    try {
      if (uploadType === "text") {
        const res = await fetch(`${BACKEND_URL}/ingest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, source_type: "text" }),
        });
        const data = await res.json();
        if (res.ok) {
          setDocId(data.document_id);
          setIngestStatus(`Success! Document saved (ID: ${data.document_id})`);
        } else {
          setIngestStatus(`Error: ${data.detail}`);
        }
      } else {
        if (!pdfFile) {
          setIngestStatus("Please select a PDF file.");
          return;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", pdfFile);

        const res = await fetch(`${BACKEND_URL}/ingest-pdf`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setDocId(data.document_id);
          setIngestStatus(
            `Success! PDF saved & vectorized (ID: ${data.document_id})`,
          );
        } else {
          setIngestStatus(`Error: ${data.detail}`);
        }
      }
    } catch (err) {
      setIngestStatus("Failed to connect to backend.");
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_id: docId || null }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.detail);
    } catch (err) {
      setAnswer("Failed to fetch response from backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        VoyageIQ Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ingest Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            1. Ingest Travel Document
          </h2>

          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setUploadType("text")}
              className={`px-3 py-1 rounded-md text-sm ${uploadType === "text" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setUploadType("pdf")}
              className={`px-3 py-1 rounded-md text-sm ${uploadType === "pdf" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Upload PDF
            </button>
          </div>

          <form onSubmit={handleIngest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="e.g., Tokyo Guide"
                required
              />
            </div>

            {uploadType === "text" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content / Chunks
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md h-32"
                  placeholder="Paste text paragraphs here..."
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Upload & Vectorize
            </button>
          </form>
          {ingestStatus && (
            <p className="mt-4 text-sm text-gray-600">{ingestStatus}</p>
          )}
        </div>

        {/* Chat / Query Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">2. Chat with Your Data</h2>
          <form onSubmit={handleChat} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ask a Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="e.g., What can I eat at Tsukiji Market?"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </form>

          {answer && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-semibold text-gray-800">AI Answer:</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
