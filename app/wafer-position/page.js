"use client";

import { useRef, useState } from "react";
import { Upload, ClipboardPaste, Image as ImageIcon } from "lucide-react";

import ToolLayout from "@/components/tool-layout/ToolLayout";
import WaferCanvas from "@/components/tool-layout/WaferCanvas";
import { MODULES } from "@/components/tool-layout/MODULES";

export default function WaferImagePage() {
  const [image, setImage] = useState(null);
  const [moduleKey, setModuleKey] = useState("PM2ST1");
  const fileRef = useRef(null);

  /* ---------- File upload ---------- */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  /* ---------- Paste button ---------- */
  const handlePasteClick = async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert("Clipboard image paste not supported in this browser.");
        return;
      }

      const items = await navigator.clipboard.read();

      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            setImage(URL.createObjectURL(blob));
            return;
          }
        }
      }

      alert("No image found in clipboard.");
    } catch (err) {
      console.error(err);
      alert("Unable to read from clipboard. Try Ctrl+V instead.");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm text-sm font-medium transition"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>

        {/* Paste button */}
        <button
          onClick={handlePasteClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm text-sm font-medium transition"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste from Clipboard
        </button>

        {/* Preview indicator */}
        {image && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <ImageIcon className="w-4 h-4" />
            Image loaded
          </div>
        )}

        {/* Module selector */}
        <select
          value={moduleKey}
          onChange={(e) => setModuleKey(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm bg-white"
        >
          {Object.keys(MODULES).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <ToolLayout activeModule={moduleKey}>
        {image && (
          <div
            className="absolute pointer-events-none"
            style={{
              left:
                MODULES[moduleKey].x +
                MODULES[moduleKey].w / 2 -
                62,
              top:
                MODULES[moduleKey].y +
                MODULES[moduleKey].h / 2 -
                62,
            }}
          >
            <WaferCanvas moduleKey={moduleKey} imageSrc={image} />
          </div>
        )}
      </ToolLayout>
    </div>
  );
}
