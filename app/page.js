"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [cuCount, setCuCount] = useState(null);
  const [ncCount, setNcCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/wafers").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch CU wafers");
        return r.json();
      }),
      fetch("/api/ncWafers").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch NC wafers");
        return r.json();
      }),
    ])
      .then(([cu, nc]) => {
        setCuCount(cu.length);
        setNcCount(nc.length);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setCuCount(0);
        setNcCount(0);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-3">
            Wafer Defect Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze EDX defect patterns, visualize wafer maps, and compare reference wafers with advanced analytics
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link href="/wafers" className="group">
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-400 shadow-sm hover:shadow-lg p-6 transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">CU Wafers</div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-xl">📀</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
                ) : (
                  cuCount ?? "—"
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Click to view all CU wafers</p>
            </div>
          </Link>

          <Link href="/nc-wafers" className="group">
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 shadow-sm hover:shadow-lg p-6 transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">NC Wafers</div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-xl">📀</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
                ) : (
                  ncCount ?? "—"
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Click to view all NC wafers</p>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total Wafers</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-900">
              {loading ? (
                <div className="animate-pulse bg-blue-200 h-10 w-20 rounded"></div>
              ) : (
                (cuCount ?? 0) + (ncCount ?? 0)
              )}
            </div>
            <p className="text-xs text-blue-600 mt-2">Combined database</p>
          </div>
{/* 
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-600 uppercase tracking-wide">Data Source</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔬</span>
              </div>
            </div>
            <div className="text-lg font-semibold text-purple-900 mt-2">
              CU EDX Inspections
            </div>
            <p className="text-xs text-purple-600 mt-1">High-precision defect analysis</p>
          </div> */}
        </div>

        {/* Main Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Upload CU */}
            <Link href="/upload" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-400 shadow-sm hover:shadow-xl p-8 transition-all duration-200 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Upload CU Data
                </h3>
                <p className="text-gray-600 text-sm">
                  Import Excel CU EDX inspection files and add to reference database
                </p>
                <div className="mt-4 text-orange-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started <span>→</span>
                </div>
              </div>
            </Link>

            {/* Upload NC */}
            <Link href="/upload-nc" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 shadow-sm hover:shadow-xl p-8 transition-all duration-200 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Upload NC Data
                </h3>
                <p className="text-gray-600 text-sm">
                  Import Excel NC EDX inspection files and add to reference database
                </p>
                <div className="mt-4 text-green-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started <span>→</span>
                </div>
              </div>
            </Link>

            {/* Compare */}
            <Link href="/compare" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-xl p-8 transition-all duration-200 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Compare Wafers
                </h3>
                <p className="text-gray-600 text-sm">
                  Match new wafers against reference database using advanced pattern matching
                </p>
                <div className="mt-4 text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Start comparing <span>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Capabilities</h2>
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Wafer Mapping</h3>
                <p className="text-sm text-gray-600">
                  Interactive visualization of defect locations with precise spatial coordinates
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧪</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">EDX Analysis</h3>
                <p className="text-sm text-gray-600">
                  Categorize and analyze defects by elemental composition patterns
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Pattern Matching</h3>
                <p className="text-sm text-gray-600">
                  Compare wafer signatures and identify similar defect patterns
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Recent Activity or Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span>
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link href="/wafers" className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                <span className="text-sm text-gray-700 group-hover:text-orange-600">View all CU wafers</span>
                <span className="text-orange-600">→</span>
              </Link>
              <Link href="/ncWafers" className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors group">
                <span className="text-sm text-gray-700 group-hover:text-green-600">View all NC wafers</span>
                <span className="text-green-600">→</span>
              </Link>
              <Link href="/compare" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                <span className="text-sm text-gray-700 group-hover:text-blue-600">Start comparison</span>
                <span className="text-blue-600">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Getting Started
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p className="text-gray-300">Upload your CU or NC reference wafer data using Excel files</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p className="text-gray-300">Browse and analyze wafer maps with EDX defect visualization</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p className="text-gray-300">Compare new wafers to find matching patterns in your database</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Internal Analytics Tool · Wafer EDX Defect Intelligence Platform
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by advanced pattern recognition and spatial analysis
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Desgined By: Abdurraouf Sadi
            </p>
        </div>

      </div>
    </div>
  );
}