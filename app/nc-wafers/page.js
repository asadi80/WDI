"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

/* Normalize wafer data */
const normalizeWafer = (w) => {
  const edxSet = new Set();
  const elements = { C: 0, N: 0, Si: 0, O: 0, Ti: 0, Ni: 0, Al: 0 };

  (w.defects || []).forEach((d) => {
    if (d.edxCategory) edxSet.add(d.edxCategory);

    if (d.elements) {
      elements.C = Math.max(elements.C, d.elements.carbon || 0);
      elements.N = Math.max(elements.N, d.elements.nitrogen || 0);
      elements.Si = Math.max(elements.Si, d.elements.silicon || 0);
      elements.O = Math.max(elements.O, d.elements.oxygen || 0);
      elements.Ti = Math.max(elements.Ti, d.elements.titanium || 0);
      elements.Ni = Math.max(elements.Ni, d.elements.nickel || 0);
      elements.Al = Math.max(elements.Al, d.elements.aluminum || 0);
    }
  });

  return {
    ...w,
    edx: Array.from(edxSet),
    elements,
  };
};

export default function NCWafersPage() {
  const router = useRouter();
  const [wafers, setWafers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "inspectionTime",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterChamber, setFilterChamber] = useState("all");
  const [defectFilter, setDefectFilter] = useState("all");
  const [filterEdx, setFilterEdx] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }
    fetch("/api/nc-wafers-with-defects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch NC wafers");
        return res.json();
      })
      .then((data) => {
        setWafers(data.map(normalizeWafer));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const chambers = useMemo(
    () => [...new Set(wafers.map((w) => w.chamber).filter(Boolean))].sort(),
    [wafers],
  );

  const edxOptions = useMemo(() => {
    const set = new Set();
    wafers.forEach((w) => w.edx?.forEach((e) => set.add(e)));
    return Array.from(set).sort();
  }, [wafers]);

  const stats = useMemo(() => {
    const total = wafers.length;
    const withDefects = wafers.filter((w) => (w.defectCount || 0) > 0).length;
    const avg =
      wafers.reduce((s, w) => s + (w.defectCount || 0), 0) / (total || 1);

    // Count wafers with critical elements
    const withTi = wafers.filter((w) => w.elements.Ti > 0).length;
    const withMetals = wafers.filter(
      (w) => w.elements.Ni > 0 || w.elements.Al > 0,
    ).length;

    return {
      total,
      withDefects,
      avg: avg.toFixed(1),
      withTi,
      withMetals,
    };
  }, [wafers]);

  const filteredWafers = useMemo(() => {
    let filtered = wafers.filter((w) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        w.waferId?.toLowerCase().includes(term) ||
        w.lot?.toLowerCase().includes(term) ||
        w.chamber?.toLowerCase().includes(term) ||
        w.edx?.some((e) => e.toLowerCase().includes(term)) ||
        Object.entries(w.elements || {}).some(
          ([k, v]) =>
            k.toLowerCase().includes(term) || String(v).includes(term),
        );

      const matchesChamber =
        filterChamber === "all" || w.chamber === filterChamber;

      let matchesDefect = true;
      if (defectFilter === "with") matchesDefect = (w.defectCount || 0) > 0;
      if (defectFilter === "without")
        matchesDefect = (w.defectCount || 0) === 0;

      let matchesEdx = true;
      if (filterEdx !== "all") matchesEdx = w.edx?.includes(filterEdx);

      return matchesSearch && matchesChamber && matchesDefect && matchesEdx;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === bVal) return 0;
        return sortConfig.direction === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
            ? 1
            : -1;
      });
    }

    return filtered;
  }, [wafers, searchTerm, filterChamber, defectFilter, filterEdx, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((p) => ({
      key,
      direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (c) =>
    sortConfig.key !== c ? "⇅" : sortConfig.direction === "asc" ? "↑" : "↓";

  const getElementColor = (element, value) => {
    if (value === 0) return "text-gray-400";
    if (element === "Ti" && value > 0) return "text-red-600 font-bold";
    if ((element === "Ni" || element === "Al") && value > 0)
      return "text-orange-600 font-bold";
    if (value > 10) return "text-red-600 font-semibold";
    if (value > 5) return "text-orange-600 font-semibold";
    return "text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="max-w-xl mx-auto">
          <Link
            href="/main"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📀 NC Wafers Analysis
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Detailed defect and elemental composition data
              </p>
            </div>
            <Link
              href="/upload-nc"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              + Upload NC Data
            </Link>
          </div>

          {/* Statistics Cards */}
          {!loading && !error && wafers.length > 0 && (
            <div className="grid grid-cols-5 gap-4 pt-4 border-t">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">
                  Total Wafers
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.total}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">
                  With Defects
                </div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {stats.withDefects}
                  <span className="text-sm text-red-600 ml-2">
                    ({((stats.withDefects / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">
                  Avg Defects
                </div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.avg}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium">
                  With Ti
                </div>
                <div className="text-2xl font-bold text-orange-900 mt-1">
                  {stats.withTi}
                  <span className="text-sm text-orange-600 ml-2">
                    ({((stats.withTi / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium">
                  With Metals
                </div>
                <div className="text-2xl font-bold text-yellow-900 mt-1">
                  {stats.withMetals}
                  <span className="text-sm text-yellow-600 ml-2">
                    ({((stats.withMetals / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {!loading && wafers.length > 0 && (
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search wafer, lot, chamber, EDX, elements..."
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />

              <select
                value={filterChamber}
                onChange={(e) => setFilterChamber(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Chambers</option>
                {chambers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Defects</option>
                <option value="with">With Defects</option>
                <option value="without">No Defects</option>
              </select>

              <select
                value={filterEdx}
                onChange={(e) => setFilterEdx(e.target.value)}
                className="col-span-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">
                  All EDX Categories ({edxOptions.length})
                </option>
                {edxOptions.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600 mb-4"></div>
            <p className="text-gray-500">Loading NC wafer data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wafers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📀</div>
            <p className="text-gray-500 text-lg">No NC wafer data available</p>
            <Link
              href="/upload-nc"
              className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Upload your first NC wafer →
            </Link>
          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          wafers.length > 0 &&
          filteredWafers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">
                No wafers match your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterChamber("all");
                  setDefectFilter("all");
                  setFilterEdx("all");
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}

        {/* Table */}
        {!loading && !error && filteredWafers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      onClick={() => handleSort("waferId")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Wafer ID <span>{getSortIcon("waferId")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("lot")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Lot <span>{getSortIcon("lot")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("slotId")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Slot <span>{getSortIcon("slotId")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("chamber")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Chamber <span>{getSortIcon("chamber")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("inspectionTime")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Inspection Time{" "}
                        <span>{getSortIcon("inspectionTime")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("defectCount")}
                      className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        Defects <span>{getSortIcon("defectCount")}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      EDX Categories
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Elements (Max %)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredWafers.map((w) => (
                    <tr
                      key={w.waferId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        <Link
                          href={`/ncWafer/${w.waferId}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {w.waferId}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-700">{w.lot}</td>
                      <td className="p-4 text-gray-700">{w.slotId}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                          {w.chamber || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {w.inspectionTime
                          ? new Date(w.inspectionTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            w.defectCount === 0
                              ? "bg-green-100 text-green-700"
                              : w.defectCount < 5
                                ? "bg-yellow-100 text-yellow-700"
                                : w.defectCount < 10
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {w.defectCount || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {w.edx?.map((e) => (
                            <span
                              key={e}
                              className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-medium"
                            >
                              {e}
                            </span>
                          ))}
                          {(!w.edx || w.edx.length === 0) && (
                            <span className="text-gray-400 text-xs">
                              No data
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono">
                          {Object.entries(w.elements).map(([k, v]) => (
                            <div key={k} className={getElementColor(k, v)}>
                              <span className="font-semibold">{k}:</span>{" "}
                              {v.toFixed(1)}
                              {v > 0 && k === "Ti" && (
                                <span className="ml-1">⚠️</span>
                              )}
                              {v > 0 && (k === "Ni" || k === "Al") && (
                                <span className="ml-1">⚡</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing {filteredWafers.length} of {wafers.length} wafer
                {wafers.length !== 1 ? "s" : ""}
              </div>
              {(searchTerm ||
                filterChamber !== "all" ||
                defectFilter !== "all" ||
                filterEdx !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterChamber("all");
                    setDefectFilter("all");
                    setFilterEdx("all");
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {!loading && !error && filteredWafers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Element Indicators
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">⚠️ Ti (Red)</span>
                <span className="text-gray-600">
                  - Hardware erosion critical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold">
                  ⚡ Ni/Al (Orange)
                </span>
                <span className="text-gray-600">
                  - Mechanical wear detected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold">
                  &gt;5% (Bold)
                </span>
                <span className="text-gray-600">- Elevated levels</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
