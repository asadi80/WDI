"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function WafersPage() {
  const [wafers, setWafers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "inspectionTime", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChamber, setFilterChamber] = useState("all");
  const [defectFilter, setDefectFilter] = useState("all");

  useEffect(() => {
    fetch("/api/wafers")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch wafers");
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

  // Get unique chambers for filter
  const chambers = useMemo(() => {
    const unique = [...new Set(wafers.map(w => w.chamber).filter(Boolean))];
    return unique.sort();
  }, [wafers]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = wafers.length;
    const withDefects = wafers.filter(w => (w.defectCount || 0) > 0).length;
    const avgDefects = wafers.reduce((sum, w) => sum + (w.defectCount || 0), 0) / (total || 1);
    return { total, withDefects, avgDefects: avgDefects.toFixed(1) };
  }, [wafers]);

  // Filter and sort wafers
  const filteredWafers = useMemo(() => {
    let filtered = wafers.filter(w => {
      const matchesSearch = 
        w.waferId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.lot?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChamber = filterChamber === "all" || w.chamber === filterChamber;
      
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
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <span className="text-gray-300">⇅</span>;
    return sortConfig.direction === "asc" ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📀 CU Wafers</h1>
              <p className="text-gray-500 text-sm mt-1">
                Uploaded wafers and inspection metadata
              </p>
            </div>
            <Link
              href="/upload"
              className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
            >
              + Upload CU Data
            </Link>
          </div>

          {/* Statistics Cards */}
          {!loading && !error && wafers.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Wafers</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">With Defects</div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {stats.withDefects} <span className="text-sm text-red-600">({((stats.withDefects / stats.total) * 100).toFixed(1)}%)</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Avg Defects</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{stats.avgDefects}</div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          {!loading && wafers.length > 0 && (
            <div className="flex gap-4 pt-4 border-t">
              <input
                type="text"
                placeholder="Search by Wafer ID or Lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <select
                value={filterChamber}
                onChange={(e) => setFilterChamber(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Chambers</option>
                {chambers.map(chamber => (
                  <option key={chamber} value={chamber}>{chamber}</option>
                ))}
              </select>
              <select
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Defects</option>
                <option value="with">With Defects</option>
                <option value="without">No Defects</option>
              </select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-600 mb-4"></div>
            <p className="text-gray-500">Loading wafers...</p>
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
            <p className="text-gray-500 text-lg">No wafers found.</p>
            <Link
              href="/upload"
              className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Upload your first wafer →
            </Link>
          </div>
        )}

        {/* No Results from Filter */}
        {!loading && !error && wafers.length > 0 && filteredWafers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No wafers match your search criteria.</p>
            <button
              onClick={() => { setSearchTerm(""); setFilterChamber("all"); setDefectFilter("all"); }}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear filters
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
                        Wafer ID {getSortIcon("waferId")}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("lot")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Lot {getSortIcon("lot")}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("slotId")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Slot {getSortIcon("slotId")}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("chamber")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Chamber {getSortIcon("chamber")}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("week")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Week {getSortIcon("week")}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("inspectionTime")}
                      className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Inspection Time {getSortIcon("inspectionTime")}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredWafers.map(w => (
                    <tr
                      key={w.waferId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        <Link
                          href={`/wafer/${w.waferId}`}
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
                      <td className="p-4 text-gray-700">{w.week}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(w.inspectionTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing {filteredWafers.length} of {wafers.length} wafer{wafers.length !== 1 ? 's' : ''}
              </div>
              {(searchTerm || filterChamber !== "all" || defectFilter !== "all") && (
                <button
                  onClick={() => { setSearchTerm(""); setFilterChamber("all"); setDefectFilter("all"); }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}