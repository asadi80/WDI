"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) {
      setStatus("❌ Please select a CU Excel file");
      return;
    }

    setLoading(true);
    setStatus("Uploading reference wafer data...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "reference");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`❌ ${data.error || "Upload failed"}`);
      } else {
        setStatus(
          `✅ Upload successful — ${data.wafersProcessed} wafers, ${data.defectsProcessed} defects`
        );
      }
    } catch {
      setStatus("❌ Network error during upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 px-6 py-10">

      {/* 🔙 HOME */}
      <div className="max-w-xl mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* 📦 CARD */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-orange-300 shadow-sm p-8 space-y-6">

        {/* 🔹 HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-orange-700">
            Upload Reference Wafers (CU)
          </h1>
          <p className="text-sm text-gray-600">
            Import CU EDX Excel files to build the reference database
          </p>
        </div>

        {/* 🔹 FILE INPUT */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Excel file (.xlsx, .xls)
          </label>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files[0])}
            className="block w-full text-sm rounded-lg border border-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:bg-orange-50 file:text-orange-700
              hover:file:bg-orange-100
              cursor-pointer"
          />

          {file && (
            <p className="text-xs text-gray-500">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* 🔹 ACTION BUTTON */}
        <button
          onClick={upload}
          disabled={!file || loading}
          className={`w-full py-2.5 rounded-lg font-medium transition-all
            ${
              loading || !file
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]"
            }`}
        >
          {loading ? "Uploading…" : "Upload CU Reference Data"}
        </button>

        {/* 🔹 STATUS */}
        {status && (
          <div
            className={`text-sm p-3 rounded-lg border ${
              status.startsWith("✅")
                ? "bg-green-50 text-green-700 border-green-200"
                : status.startsWith("❌")
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {status}
          </div>
        )}

        {/* 🔹 FOOTNOTE */}
        <div className="text-xs text-gray-400 leading-relaxed">
          Uploaded CU data is grouped by wafer, defects stored individually,
          and wafer-level features are computed automatically.
        </div>

      </div>
    </div>
  );
}
