"use client";

import Link from "next/link";
export default function LandingPage() {
   const isLoggedIn =
    typeof window !== "undefined" && localStorage.getItem("token");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl">🧠</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Wafer Intelligence</span>
            </div>
            
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors shadow-md"
              >
                Sign In
              </Link>
              )}

               {isLoggedIn && (
              <Link
                href="/main"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors shadow-md"
              >
                Main Page
              </Link>
              )}
              {/* <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors shadow-md"
              >
                Get Started
              </Link> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl mb-8 shadow-2xl">
            <span className="text-5xl">🧠</span>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Wafer Defect Intelligence
          </h1>
          
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Advanced semiconductor defect analysis platform powered by AI-driven pattern recognition
          </p>

       

       
        </div>

        {/* What is it Section */}
        <div id="features" className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What is Wafer Intelligence?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform for semiconductor manufacturing engineers to analyze, diagnose, and resolve wafer defects with unprecedented precision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 border border-orange-200">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">EDX Defect Analysis</h3>
              <p className="text-gray-700 leading-relaxed">
                Automatically categorize and analyze defects by elemental composition (C, Si, O, Ti, Ni, Al). 
                Instantly identify contamination sources including polymer buildup, hardware erosion, and cross-contamination.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Interactive Wafer Maps</h3>
              <p className="text-gray-700 leading-relaxed">
                Visualize defect locations with pixel-perfect precision. Click to inspect individual defects, 
                filter by EDX category, and overlay spatial patterns on equipment layouts.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Root Cause Diagnostics</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-powered analysis identifies contamination signatures (Ti = hardware erosion, C+O = polymer, etc.) 
                and provides actionable recommendations for chamber maintenance and process adjustments.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-200">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Equipment Location Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                Map wafers to specific chambers (PM, LL, TM) and identify systemic issues. 
                Track defect patterns across multiple modules and stages for comprehensive failure analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-12 text-white mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Wafer Intelligence?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Analysis</h3>
              <p className="text-gray-300">
                Upload Excel inspection files and get immediate defect diagnostics with severity scoring and confidence levels
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-gray-300">
                Your sensitive manufacturing data stays secure with encrypted storage and access controls
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Actionable Insights</h3>
              <p className="text-gray-300">
                Get specific recommendations: which chambers to clean, which parts to replace, and optimal process settings
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Who Uses Wafer Intelligence?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-orange-600 mb-3">Process Engineers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Diagnose chamber contamination (Ti, Ni, Al detection)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Identify polymer buildup from incomplete cleans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">▸</span>
                  <span>Track defect trends across lots and chambers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-green-600 mb-3">Equipment Engineers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">▸</span>
                  <span>Plan preventive maintenance based on defect signatures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">▸</span>
                  <span>Validate clean effectiveness (monitor C/O levels)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">▸</span>
                  <span>Prioritize hardware replacements by severity</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-3">Quality Assurance</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">▸</span>
                  <span>Monitor yield-impacting defect patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">▸</span>
                  <span>Generate inspection reports with visual maps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">▸</span>
                  <span>Compare CU vs NC reference databases</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-purple-600 mb-3">Fab Managers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">▸</span>
                  <span>Dashboard overview of all wafer locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">▸</span>
                  <span>Track action plans and maintenance schedules</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">▸</span>
                  <span>Analyze tool-level contamination trends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Defect Analysis?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join semiconductor fabs worldwide using AI-powered wafer intelligence
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 text-lg font-bold bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Start Analyzing Now →
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 mt-12 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            Internal Analytics Tool · Wafer EDX Defect Intelligence Platform
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Designed By: Abdurraouf Sadi · Powered by advanced pattern recognition
          </p>
          <p className="text-xs text-gray-400 mt-4">
            © 2026 All rights reserved
          </p>
        </div>

      </div>
    </div>
  );
}