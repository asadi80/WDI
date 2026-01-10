"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NCWafersPage() {
  const [wafers, setWafers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ncWafers")
      .then(res => res.json())
      .then(data => {
        setWafers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Loading NC wafers...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
        
              {/* 🔙 HOME */}
              <div className="max-w-xl mx-auto mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                >
                  ← Back to Home
                </Link>
              </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">📀 NC Wafers</h1>
        <p className="text-gray-500 text-sm">
          Uploaded wafers and inspection metadata
        </p>

        <Link
          href="/upload-nc"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Upload NC Data
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-xl border shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Wafer ID</th>
              <th className="p-3 text-left">Lot</th>
              <th className="p-3 text-right">Slot</th>
              <th className="p-3 text-left">Chamber</th>
              <th className="p-3 text-left">Inspection Time</th>
              <th className="p-3 text-right">Defects</th>
            </tr>
          </thead>

          <tbody>
            {wafers.map(w => (
              <tr
                key={w.waferId}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  <Link
                    href={`/ncWafer/${w.waferId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {w.waferId}
                  </Link>
                </td>

                <td className="p-3">{w.lot}</td>
                <td className="p-3 text-right">{w.slotId}</td>
                <td className="p-3">{w.chamber}</td>

                <td className="p-3">
                  {w.inspectionTime
                    ? new Date(w.inspectionTime).toLocaleString()
                    : "-"}
                </td>

                <td className="p-3 text-right font-medium">
                  {w.defectCount ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {wafers.length === 0 && (
        <div className="text-center text-gray-500">
          No NC wafers uploaded yet
        </div>
      )}
    </div>
  );
}
