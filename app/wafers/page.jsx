"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WafersPage() {
  const [wafers, setWafers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wafers")
      .then(res => res.json())
      .then(data => {
        setWafers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
        
              {/* 🔙 HOME */}
              <div className="max-w-xl mx-auto mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
                >
                  ← Back to Home
                </Link>
              </div>

      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📀 CU Wafers</h1>
        <p className="text-gray-500 text-sm">
          Uploaded wafers and inspection metadata
        </p>

          <Link
          href="/upload"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          + Upload CU Data
        </Link>
      </div>

      {/* 🔹 LOADING */}
      {loading && (
        <div className="text-gray-500">Loading wafers...</div>
      )}

      {/* 🔹 EMPTY */}
      {!loading && wafers.length === 0 && (
        <div className="text-gray-500">No wafers found.</div>
      )}

      {/* 🔹 TABLE CARD */}
      {!loading && wafers.length > 0 && (
        <div className="overflow-auto rounded-xl border shadow-sm bg-white">

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Wafer ID</th>
                <th className="p-3 text-left">Lot</th>
                <th className="p-3 text-left">Slot</th>
                <th className="p-3 text-left">Chamber</th>
                <th className="p-3 text-left">Week</th>
                <th className="p-3 text-left">Inspection Time</th>
              </tr>
            </thead>

            <tbody>
              {wafers.map(w => (
                <tr
                  key={w.waferId}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* 🔗 LINK */}
                  <td className="p-3 font-medium text-blue-600">
                    <Link
                      href={`/wafer/${w.waferId}`}
                      className="hover:underline"
                    >
                      {w.waferId}
                    </Link>
                  </td>

                  <td className="p-3">{w.lot}</td>
                  <td className="p-3">{w.slotId}</td>

                  {/* 🏭 CHAMBER BADGE */}
                  <td className="p-3">
                    <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs">
                      {w.chamber || "N/A"}
                    </span>
                  </td>

                  <td className="p-3">{w.week}</td>

                  <td className="p-3 text-gray-600">
                    {new Date(w.inspectionTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* 🔹 FOOTER INFO */}
      <div className="text-xs text-gray-400">
        Total wafers: {wafers.length}
      </div>

    </div>
  );
}
