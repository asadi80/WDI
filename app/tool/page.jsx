"use client";

import { useEffect, useRef, useState } from "react";

const DESIGN_W = 1100;
const DESIGN_H = 750;

export default function ToolSchematicTest() {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [selectedModule, setSelectedModule] = useState(null);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState("detailed"); // detailed, simplified

  /* Auto scale based on container size */
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;
      const s = Math.min(clientWidth / DESIGN_W, clientHeight / DESIGN_H, 1);

      setScale(s);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleModuleClick = (moduleName) => {
    setSelectedModule(selectedModule === moduleName ? null : moduleName);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Equipment Schematic</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedModule ? (
                  <span>
                    Selected: <span className="font-medium text-blue-600">{selectedModule}</span>
                  </span>
                ) : (
                  "Click any module for details"
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View mode toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    viewMode === "detailed"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Detailed
                </button>
                <button
                  onClick={() => setViewMode("simplified")}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    viewMode === "simplified"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Simplified
                </button>
              </div>

              {/* Labels toggle */}
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
              >
                {showLabels ? "Hide Labels" : "Show Labels"}
              </button>

              {/* Zoom indicator */}
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                {Math.round(scale * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Schematic Area */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center pt-20"
      >
        <div
          className="origin-center transition-transform duration-300"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
          }}
        >
          {/* Tool Layout */}
          <div className="relative w-full h-full bg-white border-2 border-gray-300 rounded-2xl shadow-2xl">
            {/* Background Grid */}
            {viewMode === "detailed" && (
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />
            )}

            {/* Load Ports */}
            <div className="absolute left-5 top-[160px] space-y-8">
              <LP
                label="LP1"
                selected={selectedModule === "LP1"}
                hovered={hoveredModule === "LP1"}
                onClick={() => handleModuleClick("LP1")}
                onMouseEnter={() => setHoveredModule("LP1")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
              <LP
                label="LP2"
                selected={selectedModule === "LP2"}
                hovered={hoveredModule === "LP2"}
                onClick={() => handleModuleClick("LP2")}
                onMouseEnter={() => setHoveredModule("LP2")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
              <LP
                label="LP3"
                selected={selectedModule === "LP3"}
                hovered={hoveredModule === "LP3"}
                onClick={() => handleModuleClick("LP3")}
                onMouseEnter={() => setHoveredModule("LP3")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
            </div>

            {/* EFEM */}
            <Module
              x={141}
              y={130}
              w={220}
              h={480}
              label="EFEM"
              color="bg-blue-50"
              borderColor="border-blue-300"
              selected={selectedModule === "EFEM"}
              hovered={hoveredModule === "EFEM"}
              onClick={() => handleModuleClick("EFEM")}
              onMouseEnter={() => setHoveredModule("EFEM")}
              onMouseLeave={() => setHoveredModule(null)}
              showLabels={showLabels}
              viewMode={viewMode}
            >
              <Station y={200} label="EFEM" showLabels={showLabels} viewMode={viewMode} />
            </Module>

            {/* Load Lock */}
            <Module
              x={360}
              y={250}
              w={150}
              h={260}
              label="LL"
              color="bg-purple-50"
              borderColor="border-purple-300"
              selected={selectedModule === "LL"}
              hovered={hoveredModule === "LL"}
              onClick={() => handleModuleClick("LL")}
              onMouseEnter={() => setHoveredModule("LL")}
              onMouseLeave={() => setHoveredModule(null)}
              showLabels={showLabels}
              viewMode={viewMode}
            >
              <Station y={30} label="ST2" showLabels={showLabels} viewMode={viewMode} />
              <Station y={140} label="ST1" showLabels={showLabels} viewMode={viewMode} />
            </Module>

            {/* Transfer Module */}
            <Module
              x={510}
              y={250}
              w={300}
              h={260}
              label="TM"
              color="bg-green-50"
              borderColor="border-green-300"
              selected={selectedModule === "TM"}
              hovered={hoveredModule === "TM"}
              onClick={() => handleModuleClick("TM")}
              onMouseEnter={() => setHoveredModule("TM")}
              onMouseLeave={() => setHoveredModule(null)}
              showLabels={showLabels}
              viewMode={viewMode}
            >
              <Station y={30} label="ST2" showLabels={showLabels} viewMode={viewMode} />
              <Station y={140} label="ST1" showLabels={showLabels} viewMode={viewMode} />
            </Module>

            {/* PM3 */}
            <div className="absolute left-[530px] top-[120px]">
              <PM
                label="PM3"
                selected={selectedModule === "PM3"}
                hovered={hoveredModule === "PM3"}
                onClick={() => handleModuleClick("PM3")}
                onMouseEnter={() => setHoveredModule("PM3")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
            </div>

            {/* PM2 – vertical */}
            <div className="absolute left-[940px] top-[250px] rotate-90 origin-top-left">
              <PM
                label="PM2"
                selected={selectedModule === "PM2"}
                hovered={hoveredModule === "PM2"}
                onClick={() => handleModuleClick("PM2")}
                onMouseEnter={() => setHoveredModule("PM2")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
            </div>

            {/* PM1 */}
            <div className="absolute left-[530px] top-[510px]">
              <PM
                label="PM1"
                selected={selectedModule === "PM1"}
                hovered={hoveredModule === "PM1"}
                onClick={() => handleModuleClick("PM1")}
                onMouseEnter={() => setHoveredModule("PM1")}
                onMouseLeave={() => setHoveredModule(null)}
                showLabels={showLabels}
                viewMode={viewMode}
              />
            </div>

            {/* Connection Lines */}
            {viewMode === "detailed" && (
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                {/* EFEM to LL */}
                <line
                  x1="361"
                  y1="380"
                  x2="360"
                  y2="380"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* LL to TM */}
                <line
                  x1="510"
                  y1="380"
                  x2="510"
                  y2="380"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Module Info Panel */}
      {selectedModule && (
        <div className="absolute bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-6 z-20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedModule}</h3>
              <p className="text-sm text-gray-500">
                {getModuleDescription(selectedModule)}
              </p>
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-gray-900">{getModuleType(selectedModule)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Stations</span>
              <span className="font-medium text-gray-900">{getStationCount(selectedModule)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Component Definitions */

function Label({ text, selected, hovered }) {
  return (
    <span
      className={`absolute top-2 left-3 text-xs font-semibold transition-colors ${
        selected ? "text-blue-600" : hovered ? "text-gray-900" : "text-gray-600"
      }`}
    >
      {text}
    </span>
  );
}

function LP({ label, selected, hovered, onClick, onMouseEnter, onMouseLeave, showLabels, viewMode }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative w-[120px] h-[120px] border-2 rounded-xl cursor-pointer transition-all ${
        selected
          ? "bg-orange-100 border-orange-400 shadow-lg scale-105"
          : hovered
          ? "bg-orange-50 border-orange-300 shadow-md scale-102"
          : "bg-gray-100 border-gray-300 shadow hover:shadow-md"
      }`}
    >
      {showLabels && <Label text={label} selected={selected} hovered={hovered} />}
      <div
        className={`absolute inset-4 rounded-full border-2 transition-colors ${
          selected
            ? "bg-white border-orange-400"
            : hovered
            ? "bg-white border-orange-300"
            : "bg-white border-gray-300"
        }`}
      />
      {viewMode === "detailed" && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-400 rounded" />
      )}
    </div>
  );
}

function Module({
  x,
  y,
  w,
  h,
  label,
  color,
  borderColor,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showLabels,
  viewMode,
  children,
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute border-2 rounded-xl cursor-pointer transition-all ${color} ${borderColor} ${
        selected
          ? "shadow-2xl scale-105 ring-4 ring-blue-200"
          : hovered
          ? "shadow-xl scale-102"
          : "shadow-md hover:shadow-lg"
      }`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      {showLabels && <Label text={label} selected={selected} hovered={hovered} />}
      {children}
    </div>
  );
}

function PM({ label, selected, hovered, onClick, onMouseEnter, onMouseLeave, showLabels, viewMode }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative w-[260px] h-[130px] rounded-xl cursor-pointer transition-all ${
        selected
          ? "bg-gray-900 shadow-2xl scale-105 ring-4 ring-blue-200"
          : hovered
          ? "bg-gray-800 shadow-xl scale-102"
          : "bg-gray-700 shadow-lg hover:shadow-xl"
      }`}
    >
      {showLabels && (
        <span className="absolute top-2 left-3 text-xs font-semibold text-white">{label}</span>
      )}

      <div
        className={`absolute left-4 top-6 w-[80px] h-[80px] rounded-full border-2 transition-all ${
          selected
            ? "bg-blue-100 border-blue-400 shadow-lg"
            : hovered
            ? "bg-gray-100 border-gray-300 shadow-md"
            : "bg-gray-200 border-gray-400"
        }`}
      >
        {showLabels && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white font-medium">
            ST1
          </span>
        )}
      </div>

      <div
        className={`absolute right-4 top-6 w-[80px] h-[80px] rounded-full border-2 transition-all ${
          selected
            ? "bg-blue-100 border-blue-400 shadow-lg"
            : hovered
            ? "bg-gray-100 border-gray-300 shadow-md"
            : "bg-gray-200 border-gray-400"
        }`}
      >
        {showLabels && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white font-medium">
            ST2
          </span>
        )}
      </div>
    </div>
  );
}

function Station({ y, label, showLabels, viewMode }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[90px] h-[90px] rounded-full bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-pink-400 shadow-md"
      style={{ top: y }}
    >
      {showLabels && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-700">
          {label}
        </span>
      )}
      {viewMode === "detailed" && (
        <div className="absolute inset-2 rounded-full bg-white/30 border border-pink-300" />
      )}
    </div>
  );
}

/* Helper Functions */

function getModuleDescription(module) {
  const descriptions = {
    LP1: "Load Port 1 - Wafer cassette input/output",
    LP2: "Load Port 2 - Wafer cassette input/output",
    LP3: "Load Port 3 - Wafer cassette input/output",
    EFEM: "Equipment Front End Module - Wafer handling",
    LL: "Load Lock - Atmospheric to vacuum transition",
    TM: "Transfer Module - Wafer transport",
    PM1: "Process Module 1 - Deposition chamber",
    PM2: "Process Module 2 - Deposition chamber",
    PM3: "Process Module 3 - Deposition chamber",
  };
  return descriptions[module] || "Equipment module";
}

function getModuleType(module) {
  if (module.startsWith("LP")) return "Load Port";
  if (module.startsWith("PM")) return "Process Chamber";
  if (module === "EFEM") return "Front End Module";
  if (module === "LL") return "Load Lock";
  if (module === "TM") return "Transfer Module";
  return "Unknown";
}

function getStationCount(module) {
  if (module.startsWith("PM")) return 2;
  if (module === "LL" || module === "TM") return 2;
  if (module === "EFEM") return 1;
  return 0;
}