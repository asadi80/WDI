"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

/* =========================
   Sort Icon (MOVED OUTSIDE)
   ========================= */
function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) {
    return <span className="text-gray-300">⇅</span>;
  }
  return sortConfig.direction === "asc" ? <span>↑</span> : <span>↓</span>;
}

export default function NCWafersPage() {
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

  useEffect(() => {
    fetch("/api/ncWafers")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch NC wafers");
        return res.json();
      })
      .then(data => {
        setWafers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* =========================
     Chambers
     ========================= */
  const chambers = useMemo(() => {
    const unique = [...new Set(wafers.map(w => w.chamber).filter(Boolean))];
    return unique.sort();
  }, [wafers]);

  /* =========================
     Stats
     ========================= */
  const stats = useMemo(() => {
    const total = wafers.length;
    const withDefects = wafers.filter(w => w.defectCount > 0).length;
    const avgDefects =
      wafers.reduce((sum, w) => sum + (w.defectCount || 0), 0) / (total || 1);

    return {
      total,
      withDefects,
      avgDefects: avgDefects.toFixed(1),
    };
  }, [wafers]);

  /* =========================
     Filter + Sort
     ========================= */
  const filteredWafers = useMemo(() => {
    let filtered = wafers.filter(w => {
      const matchesSearch =
        w.waferId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.lot?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChamber =
        filterChamber === "all" || w.chamber === filterChamber;

      let matchesDefect = true;
      if (defectFilter === "with") matchesDefect = (w.defectCount || 0) > 0;
      if (defectFilter === "without") matchesDefect = (w.defectCount || 0) === 0;

      return matchesSearch && matchesChamber && matchesDefect;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [wafers, searchTerm, filterChamber, defectFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getDefectBadgeColor = (count) => {
    if (!count || count === 0) return "bg-green-100 text-green-700";
    if (count < 5) return "bg-yellow-100 text-yellow-700";
    if (count < 10) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">

        {/* Back Button */}
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📀 NC Wafers</h1>
              <p className="text-gray-500 text-sm mt-1">
                Uploaded wafers and inspection metadata
              </p>
            </div>
            <Link
              href="/upload-nc"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              + Upload NC Data
            </Link>
          </div>

          {/* Stats */}
          {!loading && !error && wafers.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Wafers</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">With Defects</div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {stats.withDefects}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Avg Defects</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{stats.avgDefects}</div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        {!loading && !error && filteredWafers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th onClick={() => handleSort("waferId")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        Wafer ID <SortIcon column="waferId" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort("lot")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        Lot <SortIcon column="lot" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort("slotId")} className="p-4 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-end gap-2">
                        Slot <SortIcon column="slotId" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort("chamber")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        Chamber <SortIcon column="chamber" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort("inspectionTime")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        Inspection Time <SortIcon column="inspectionTime" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort("defectCount")} className="p-4 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-end gap-2">
                        Defects <SortIcon column="defectCount" sortConfig={sortConfig} />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredWafers.map(w => (
                    <tr key={w.waferId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">
                        <Link href={`/ncWafer/${w.waferId}`} className="text-blue-600 hover:underline">
                          {w.waferId}
                        </Link>
                      </td>
                      <td className="p-4">{w.lot}</td>
                      <td className="p-4 text-right">{w.slotId}</td>
                      <td className="p-4">{w.chamber || "N/A"}</td>
                      <td className="p-4 text-gray-600">
                        {w.inspectionTime ? new Date(w.inspectionTime).toLocaleString() : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDefectBadgeColor(w.defectCount)}`}>
                          {w.defectCount ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
