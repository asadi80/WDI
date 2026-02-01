"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ToolLayout from "@/components/tool-layout/ToolLayout";
import WaferCanvas from "@/components/tool-layout/WaferCanvas";
import { MODULES } from "@/components/tool-layout/MODULES";

export default function WaferImagePage() {
  const router = useRouter();
  const fileRef = useRef(null);

  /* ---------- auth ---------- */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
    else setLoading(false);
  }, [router]);

  /* ---------- images ---------- */
  const [lpImage, setLpImage] = useState(null);
  const [moduleImage, setModuleImage] = useState(null);

  /* ---------- selected modules ---------- */
  const [lpKey, setLpKey] = useState("LP1");
  const [moduleKey, setModuleKey] = useState("PM2ST1");

  /* ---------- upload → COPY TO BOTH ---------- */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setLpImage(url);
    setModuleImage(url);
  };

  const handlePasteClick = async () => {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          const url = URL.createObjectURL(blob);

          setLpImage(url);
          setModuleImage(url);
          return;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600 mb-4" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/main" className="text-sm text-gray-600">
          ← Back
        </Link>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>

        <button
          onClick={handlePasteClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste
        </button>

        {/* LP selector */}
        <select
          value={lpKey}
          onChange={(e) => setLpKey(e.target.value)}
          className="border rounded-xl px-3 py-2 bg-white text-sm"
        >
          <option value="LP1">LP1</option>
          <option value="LP2">LP2</option>
          <option value="LP3">LP3</option>
        </select>

        {/* Other modules selector */}
        <select
          value={moduleKey}
          onChange={(e) => setModuleKey(e.target.value)}
          className="border rounded-xl px-3 py-2 bg-white text-sm"
        >
          {Object.keys(MODULES)
            .filter((m) => !m.startsWith("LP"))
            .map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>
      </div>

      {/* ✅ BOTH ALWAYS RENDERED */}
      <ToolLayout activeModule={moduleKey}>
        {/* LP IMAGE */}
        {lpImage && MODULES[lpKey] && (
          <div
            className="opacity-60 absolute pointer-events-none"
            style={{
              left: MODULES[lpKey].x + MODULES[lpKey].w / 2 - 62,
              top: MODULES[lpKey].y + MODULES[lpKey].h / 2 - 62,
            }}
          >
            <WaferCanvas imageSrc={lpImage} moduleKey={lpKey} />
          </div>
        )}

        {/* OTHER MODULE IMAGE */}
        {moduleImage && MODULES[moduleKey] && (
          <div
            className="opacity-60 absolute pointer-events-none"
            style={{
              left:
                MODULES[moduleKey].x + MODULES[moduleKey].w / 2 - 62,
              top:
                MODULES[moduleKey].y + MODULES[moduleKey].h / 2 - 62,
            }}
          >
            <WaferCanvas imageSrc={moduleImage} moduleKey={moduleKey} />
          </div>
        )}
      </ToolLayout>
    </div>
  );
}
