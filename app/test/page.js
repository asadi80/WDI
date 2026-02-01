"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ClipboardPaste,
  Image as ImageIcon,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import ToolLayout from "@/components/tool-layout/ToolLayout";
import WaferCanvas from "@/components/tool-layout/WaferCanvas";
import { MODULES } from "@/components/tool-layout/MODULES";

const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

export default function WaferImagePage() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [moduleKey, setModuleKey] = useState("PM2ST1");
  const fileRef = useRef(null);
  const [selectedEDX, setSelectedEDX] = useState([]);
  const [plan, setPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lpKey, setLpKey] = useState("LP1");
  const [lpImage, setLpImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    if (!token) {
      router.replace("/login");
      return;
    }

    // ✅ token exists → allow page
    setLoading(false);
  }, []);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setImage(base64);
    setLpImage(base64);
  };

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
            const base64 = await fileToBase64(blob);
            setImage(base64);
            setLpImage(base64);
            // setImage(URL.createObjectURL(blob));
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

  const handleCheckboxChange = (edx) => {
    setSelectedEDX((prev) =>
      prev.includes(edx) ? prev.filter((v) => v !== edx) : [...prev, edx],
    );
  };

  const getModuleType = (key) => {
    if (key.startsWith("PM")) return "PM";
    if (key.startsWith("LL")) return "LL";
    if (key.startsWith("TM")) return "TM";
    if (key.startsWith("EFEM")) return "EFEM";
    return "UNKNOWN";
  };

  const getStage = (key) => {
    const m = key.match(/ST\d+/);
    return m ? m[0] : null;
  };

  const isLP = (k) => k.startsWith("LP");
  const isPM = (k) => k.startsWith("PM");
  const isLL = (k) => k.startsWith("LL");
  const isTM = (k) => k.startsWith("TM");

  const getLinkedModules = (selectedKey) => {
    const stage = getStage(selectedKey);
    const result = new Set();

    if (isLP(selectedKey)) {
      result.add(selectedKey);
      return Array.from(result);
    }

    if (selectedKey === "EFEM") {
      result.add("EFEM");
      //   result.add("LP1");
      //   result.add("LP2");
      //   result.add("LP3");
      return Array.from(result);
    }

    // result.add("LP1");
    // result.add("LP2");
    // result.add("LP3");
    result.add("EFEM");

    Object.keys(MODULES).forEach((k) => {
      if ((isLL(k) || isTM(k)) && k.endsWith(stage)) {
        result.add(k);
      }
    });

    if (isLL(selectedKey) || isTM(selectedKey)) {
      Object.keys(MODULES).forEach((k) => {
        if (isPM(k) && k.endsWith(stage)) {
          result.add(k);
        }
      });
    }

    if (isPM(selectedKey)) {
      result.add(selectedKey);
    }

    return Array.from(result);
  };

  const handleSave = async () => {
    if (!image || !moduleKey || !lpKey) {
      alert("Select image, LP, and wafer location first");
      return;
    }

    setSaving(true);

    try {
      // ✅ LP IS A MODULE → combine them
      const moduleKeys = [lpKey, moduleKey];
      const payload = {
        image: {
          source: "upload",
          data: image, // base64
        },
        selectedModule: moduleKeys,
        linkedModules: Array.from(
          new Set([
            ...getLinkedModules(moduleKey),
            lpKey, // 👈 add LP here
          ]),
        ),
        stage: getStage(moduleKey),
        moduleType: getModuleType(moduleKey),
        edxCategories: selectedEDX,
        plan,
      };

      const res = await fetch("/api/wafer-location-session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const result = await res.json();
      const sessionId = result._id || result.id;

      console.log("Saved session:", result);
      // ✅ SUCCESS UI
      setMessage("Wafer location saved successfully!");

      // ✅ redirect after short delay (nice UX)
      setTimeout(() => {
        router.push(`/wafer-sessions/${sessionId}`);
      }, 800);
    } catch (err) {
      console.error("Frontend error AFTER save:", err);

      // ❌ ERROR MESSAGE
      setError("Failed to save wafer location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const linkedModules = getLinkedModules(moduleKey);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors mb-4"
          >
            ← Back to Home
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📸 Wafer Image Analysis
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Upload or paste wafer images and map to equipment locations
              </p>
            </div>
            {image && (
              <button
                onClick={clearImage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear Image
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>

            <button
              onClick={handlePasteClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste from Clipboard
            </button>

            {image && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Image loaded</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Wafer Location:
              </label>
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
              <select
                value={moduleKey}
                onChange={(e) => setModuleKey(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
          </div>

          {/* Info badges */}
          {image && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Module: {moduleKey}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Type: {getModuleType(moduleKey)}
              </span>
              {getStage(moduleKey) && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  Stage: {getStage(moduleKey)}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Linked: {linkedModules.length} module
                {linkedModules.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Tool Layout */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Equipment Layout
          </h2>
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
            {image &&
              linkedModules.map((key) => {
                const m = MODULES[key];
                return (
                  <div
                    key={key}
                    className="opacity-60 absolute pointer-events-none"
                    style={{
                      left: m.x + m.w / 2 - 62,
                      top: m.y + m.h / 2 - 62,
                    }}
                  >
                    <WaferCanvas moduleKey={key} imageSrc={image} />
                  </div>
                );
              })}
          </ToolLayout>
        </div>

        {/* EDX Selection & Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EDX Categories */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              EDX Categories
            </h2>
            <div className="space-y-3">
              {Object.entries(EDX_COLORS).map(([edx, color]) => (
                <label
                  key={edx}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEDX.includes(edx)
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEDX.includes(edx)}
                    onChange={() => handleCheckboxChange(edx)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-gray-900">{edx}</span>
                  </div>
                  {selectedEDX.includes(edx) && (
                    <span className="text-orange-600 text-sm font-medium">
                      ✓ Selected
                    </span>
                  )}
                </label>
              ))}
            </div>

            {selectedEDX.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                  Selected: {selectedEDX.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Action Plan
            </h2>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none font-mono text-sm"
              placeholder="Enter action plan, notes, or observations...

Examples:
- Clean chamber with O₂ plasma
- Replace Ti-coated shields
- Inspect showerhead for flaking
- Run seasoning wafers post-clean"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            />
            <div className="mt-2 text-xs text-gray-500">
              {plan.length} characters
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Ready to save?</h3>
              <p className="text-sm text-gray-600 mt-1">
                This will save the wafer image, location mapping, EDX
                categories, and action plan.
              </p>
              {message && (
                <div className="mb-3 rounded-lg bg-green-100 text-green-800 px-4 py-2">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-3 rounded-lg bg-red-100 text-red-800 px-4 py-2">
                  {error}
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!image || !moduleKey || saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Wafer Location"}
            </button>
          </div>

          {/* Validation message */}
          {!image && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                ⚠️ Please upload or paste an image before saving
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
