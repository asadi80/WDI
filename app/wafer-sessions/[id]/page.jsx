"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Trash2, MapPin, Layers, FileText } from "lucide-react";
import ToolLayout from "@/components/tool-layout/ToolLayout";
import WaferCanvas from "@/components/tool-layout/WaferCanvas";
import { MODULES } from "@/components/tool-layout/MODULES";

export const dynamic = "force-dynamic";

const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

export default function WaferSessionView({ params }) {
  const { id } = use(params);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/wafer-location-session/${id}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load wafer session");
        setLoading(false);
      });
  }, [id]);

  const handleDownload = () => {
    if (!data?.image?.url) return;
    window.open(data.image.url, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await fetch(`/api/wafer-location-session/${id}`, {
        method: "DELETE",
      });
      alert("Session deleted successfully");
      window.location.href = "/";
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600 mb-4"></div>
          <p className="text-gray-500">Loading wafer session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link
            href="/"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📍 Wafer Location Review</h1>
              <p className="text-gray-500 text-sm mt-1">
                Session ID: <span className="font-mono text-gray-700">{id}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
    
              
              {/* <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button> */}
            </div>
          </div>
        </div>

        {/* Session Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Location</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.selectedModule}</p>
            <p className="text-xs text-gray-500 mt-1">Selected module</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Module Type</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{data.moduleType}</p>
            <p className="text-xs text-gray-500 mt-1">Equipment type</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Stage</h3>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{data.stage || "N/A"}</p>
            <p className="text-xs text-gray-500 mt-1">Process stage</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Linked Modules</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {Array.isArray(data.linkedModules) ? data.linkedModules.length : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Connected locations</p>
          </div>
        </div>

        {/* EDX Categories */}
        {Array.isArray(data.edxCategories) && data.edxCategories.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔬 EDX Categories Detected</h2>
            <div className="flex flex-wrap gap-3">
              {data.edxCategories.map((edx) => (
                <div
                  key={edx}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 shadow-sm"
                  style={{
                    borderColor: EDX_COLORS[edx] || "#9ca3af",
                    backgroundColor: `${EDX_COLORS[edx] || "#9ca3af"}15`,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: EDX_COLORS[edx] || "#9ca3af" }}
                  />
                  <span className="font-medium text-gray-900">{edx}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool Layout */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🗺️ Equipment Layout</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <ToolLayout activeModule={data.selectedModule}>
              {Array.isArray(data.linkedModules) &&
                data.linkedModules.map((key) => {
                  const m = MODULES[key];
                  if (!m) return null;

                  return (
                    <div
                      key={key}
                      className="absolute pointer-events-none"
                      style={{
                        left: m.x + m.w / 2 - 62,
                        top: m.y + m.h / 2 - 62,
                      }}
                    >
                      {data.image?.url && (
                        <WaferCanvas moduleKey={key} imageSrc={data.image.url} />
                      )}
                    </div>
                  );
                })}
            </ToolLayout>
          </div>

          {/* Linked Modules List */}
          {Array.isArray(data.linkedModules) && data.linkedModules.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Linked Modules ({data.linkedModules.length}):
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.linkedModules.map((mod) => (
                  <span
                    key={mod}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mod === data.selectedModule
                        ? "bg-orange-100 text-orange-700 border border-orange-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {mod}
                    {mod === data.selectedModule && " (Primary)"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-900">Action Plan</h2>
          </div>
          
          {data.plan ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {data.plan}
              </pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No action plan provided</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        {data.createdAt && (
          <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
            <p>
              Created: {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}