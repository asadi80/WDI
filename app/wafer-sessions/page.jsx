"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  Search,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

export default function WaferSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/wafer-location-session/getAllInfo")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch sessions");
        return r.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique modules and types
  const modules = useMemo(() => {
    const unique = [
      ...new Set(sessions.map((s) => s.selectedModule).filter(Boolean)),
    ];
    return unique.sort();
  }, [sessions]);

  const types = useMemo(() => {
    const unique = [
      ...new Set(sessions.map((s) => s.moduleType).filter(Boolean)),
    ];
    return unique.sort();
  }, [sessions]);

  // Filter sessions
const filteredSessions = useMemo(() => {
  return sessions.filter((s) => {
    const selectedModuleText = Array.isArray(s.selectedModule)
      ? s.selectedModule.join(" ")
      : String(s.selectedModule ?? "");

    const matchesSearch =
      selectedModuleText
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.moduleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stage?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });
}, [sessions, searchTerm]);


  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups = {};
    filteredSessions.forEach((s) => {
      const date = new Date(s.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(s);
    });
    return groups;
  }, [filteredSessions]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Link
            href="/main"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📍 Saved Wafer Locations
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Browse and review all saved wafer location sessions
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">
                {sessions.length}
              </div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
          </div>

          {/* Filters */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search module, stage, EDX..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Modules</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-600 mb-4"></div>
            <p className="text-gray-500">Loading sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sessions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-gray-500 text-lg mb-2">No saved wafers yet</p>
            <p className="text-gray-400 text-sm">
              Upload a wafer image and save a location to get started
            </p>
            <Link
              href="/wafer-image"
              className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Create your first session →
            </Link>
          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          sessions.length > 0 &&
          filteredSessions.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">No sessions match your filters.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterModule("all");
                  setFilterType("all");
                }}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}

        {/* Sessions List - Grouped by Date */}
        {!loading && !error && Object.keys(groupedSessions).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedSessions)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([date, dateSessions]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {date}
                    </h2>
                    <span className="text-xs text-gray-400">
                      ({dateSessions.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dateSessions.map((s) => (
                      <Link
                        key={s._id}
                        href={`/wafer-sessions/${s._id}`}
                        className="block bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-orange-400 hover:shadow-md transition-all p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Module Info */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span className="text-lg font-bold text-gray-900">
                                  {s.selectedModule}
                                </span>
                              </div>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {s.moduleType}
                              </span>
                              {s.stage && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                  {s.stage}
                                </span>
                              )}
                            </div>

                            {/* EDX Categories */}
                            {s.edxCategories && s.edxCategories.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">
                                  EDX:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {s.edxCategories.map((edx) => (
                                    <span
                                      key={edx}
                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border"
                                      style={{
                                        borderColor:
                                          EDX_COLORS[edx] || "#9ca3af",
                                        backgroundColor: `${EDX_COLORS[edx] || "#9ca3af"}15`,
                                        color: EDX_COLORS[edx] || "#9ca3af",
                                      }}
                                    >
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            EDX_COLORS[edx] || "#9ca3af",
                                        }}
                                      />
                                      {edx}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Linked Modules */}
                            {s.linkedModules && s.linkedModules.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Layers className="w-3 h-3" />
                                <span>
                                  {s.linkedModules.length} linked module
                                  {s.linkedModules.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}

                            {/* Action Plan Preview */}
                            {s.plan && (
                              <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 line-clamp-2">
                                {s.plan}
                              </div>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400">
                              {new Date(s.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && filteredSessions.length > 0 && (
          <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600 text-center">
            Showing {filteredSessions.length} of {sessions.length} session
            {sessions.length !== 1 ? "s" : ""}
            {(searchTerm || filterModule !== "all" || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterModule("all");
                  setFilterType("all");
                }}
                className="ml-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
