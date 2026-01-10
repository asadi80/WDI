"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadNCPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setStatus("❌ Please select an NC Excel file");
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-nc", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`❌ ${data.error || "Upload failed"}`);
      } else {
        setStatus(
          `✅ Upload successful — ${data.ncDefectsInserted} NC defects inserted`
        );
      }
    } catch {
      setStatus("❌ Network error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 px-6 py-10">
         {/* 🔙 HOME */}
              <div className="max-w-xl mx-auto mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                >
                  ← Back to Home
                </Link>
              </div>
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-green-300 shadow-sm p-8 space-y-6">

        {/* 🔹 HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-green-700">
            Upload NC Reference Wafers
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload NC EDX Excel files to populate the NC database
          </p>
        </div>

        {/* 🔹 FILE INPUT */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Excel file (.xlsx, .xls)
          </label>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files[0])}
            className="block w-full text-sm rounded-md border border-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100
              cursor-pointer"
          />

          {file && (
            <div className="text-xs text-gray-500">
              Selected file: <b>{file.name}</b>
            </div>
          )}
        </div>

        {/* 🔹 ACTION */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-2.5 rounded-md font-medium transition
            ${
              loading || !file
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }
          `}
        >
          {loading ? "Uploading..." : "Upload NC Data"}
        </button>

        {/* 🔹 STATUS */}
        {status && (
          <div
            className={`text-sm p-3 rounded-md border ${
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

        {/* 🔹 HELP */}
        <div className="text-xs text-gray-400">
          Uploaded NC data is grouped by wafer, defects stored separately,
          and wafer-level features computed automatically.
        </div>

      </div>
    </div>
  );
}
