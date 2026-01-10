"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [cuCount, setCuCount] = useState(0);
const [ncCount, setNcCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/wafers").then((r) => r.json()),
      fetch("/api/ncWafers").then((r) => r.json()),
    ])
      .then(([cu, nc]) => {
        setCuCount(cu.length);
        setNcCount(nc.length);
      })
      .catch(() => {
        setCuCount(0);
        setNcCount(0);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      {/* 🔹 HEADER */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            🧠 Wafer Defect Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Analyze EDX defect patterns, visualize wafer maps, and compare
            reference wafers
          </p>
        </div>

        {/* 🔹 STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/wafers">
            <div className="group bg-white rounded-xl border border-gray-200 hover:border-orange-400 shadow-sm p-6 hover:shadow-md transition">
              <div className="text-sm text-gray-500">CU Reference wafers</div>
              <div className="text-3xl font-bold mt-1">
                {cuCount === null ? "—" : cuCount}
              </div>
            </div>
          </Link>
          <Link href="/nc-wafers">
            <div className="group bg-white rounded-xl border border-gray-200 hover:border-green-400 shadow-sm p-6 hover:shadow-md transition">
              <div className="text-sm text-gray-500">NC Reference wafers</div>
              <div className="text-3xl font-bold mt-1">
                {ncCount === null ? "—" : ncCount}
              </div>
            </div>
          </Link>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="text-sm text-gray-500">Data source</div>
            <div className="text-lg font-semibold mt-1">CU EDX Inspections</div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="text-sm text-gray-500">Capabilities</div>
            <div className="text-sm mt-2 text-gray-700">
              Wafer maps · EDX categories · Feature extraction
            </div>
          </div>
        </div>

        {/* 🔹 ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/*  Upload */}
          <Link
            href="/upload"
            className="group bg-white rounded-xl border border-gray-200 hover:border-orange-400 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">ADD</div>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-blue-600">
                  Upload Reference Data
                </h2>
                <p className="text-sm text-gray-600">
                  Import Excel CU EDX inspection files
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/upload-nc"
            className="group bg-white rounded-xl border border-gray-200 hover:border-green-400 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">ADD</div>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-blue-600">
                  Upload Reference Data
                </h2>
                <p className="text-sm text-gray-600">
                  Import Excel NC EDX inspection files
                </p>
              </div>
            </div>
          </Link>

          {/* 📊 Compare */}
          <Link
            href="/compare"
            className="group bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-blue-600">
                  Compare Wafers
                </h2>
                <p className="text-sm text-gray-600">
                  Match new wafers against reference database
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* 🔹 FOOTER */}
        <div className="text-xs text-gray-400 pt-6">
          Internal analytics tool · Wafer EDX defect intelligence
        </div>
      </div>
    </div>
  );
}
