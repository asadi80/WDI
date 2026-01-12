"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* EDX Colors */
const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

/* Degree to Radian conversion */
const deg = (d) => (d * Math.PI) / 180;

/* Manual notch rotations for each module */
export const MODULE_WAFER_ROTATION = {
  // EFEM + LPs
  EFEM: deg(-90),
  LP1: deg(-90),
  LP2: deg(-90),
  LP3: deg(-90),

  // PM3
  PM3ST1: deg(134),
  PM3ST2: deg(-130),

  // PM2
  PM2ST1: deg(-40),
  PM2ST2: deg(-136),

  // PM1
  PM1ST1: deg(50),
  PM1ST2: deg(-50),

  // TM
  TMST1: deg(130),
  TMST2: deg(60),

  // LL
  LLST1: deg(120),
  LLST2: deg(60),
};

export default function WaferPhysicalLocation({
  locationKey,
  manualLocation,
  onChangeLocation,
  defects = [],
}) {
  const canvasRef = useRef(null);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  /* Module geometry definitions */
  const MODULES = {
    LP1: { x: 26, y: 155, w: 107, h: 106, label: "LP 1" },
    LP2: { x: 26, y: 325, w: 107, h: 106, label: "LP 2" },
    LP3: { x: 26, y: 493, w: 107, h: 106, label: "LP 3" },

    EFEM: { x: 153, y: 325, w: 108, h: 105, label: "EFEM" },

    LLST1: { x: 376, y: 387, w: 107, h: 110, label: "LL ST1" },
    LLST2: { x: 376, y: 261, w: 107, h: 110, label: "LL ST2" },

    TMST1: { x: 601, y: 390, w: 104, h: 97, label: "TM ST1" },
    TMST2: { x: 601, y: 272, w: 103, h: 102, label: "TM ST2" },

    PM1ST1: { x: 727, y: 563, w: 112, h: 102, label: "PM 1 ST1" },
    PM1ST2: { x: 596, y: 563, w: 112, h: 102, label: "PM 1 ST2" },

    PM2ST1: { x: 946, y: 265, w: 112, h: 102, label: "PM 2 ST1" },
    PM2ST2: { x: 946, y: 388, w: 112, h: 108, label: "PM 2 ST2" },

    PM3ST1: { x: 735, y: 88, w: 112, h: 102, label: "PM 3 ST1" },
    PM3ST2: { x: 605, y: 88, w: 112, h: 102, label: "PM 3 ST2" },
  };

  function resolveModuleFromChamber(chamber) {
    if (!chamber) return null;

    const s = chamber.toUpperCase().replace(/\s+/g, "");

    // PM modules
    if (/PM1[-_]?S1/.test(s)) return "PM1ST1";
    if (/PM1[-_]?S2/.test(s)) return "PM1ST2";

    if (/PM2[-_]?S1/.test(s)) return "PM2ST1";
    if (/PM2[-_]?S2/.test(s)) return "PM2ST2";

    if (/PM3[-_]?S1/.test(s)) return "PM3ST1";
    if (/PM3[-_]?S2/.test(s)) return "PM3ST2";

    // TM modules
    if (/TM[-_]?ST1|TM[-_]?S1/.test(s)) return "TMST1";
    if (/TM[-_]?ST2|TM[-_]?S2/.test(s)) return "TMST2";

    // LL modules
    if (/LL[-_]?ST1|LL[-_]?S1/.test(s)) return "LLST1";
    if (/LL[-_]?ST2|LL[-_]?S2/.test(s)) return "LLST2";

    // LP modules
    if (/LP1/.test(s)) return "LP1";
    if (/LP2/.test(s)) return "LP2";
    if (/LP3/.test(s)) return "LP3";

    // EFEM
    if (s.startsWith("APT")) return "EFEM";

    return null;
  }

  /* Resolve the active location */
  const resolvedKey = useMemo(() => {
    if (manualLocation && MODULES[manualLocation]) {
      return manualLocation;
    }

    const parsed = resolveModuleFromChamber(locationKey);
    if (parsed && MODULES[parsed]) {
      return parsed;
    }

    return null;
  }, [locationKey, manualLocation]);

  const box = resolvedKey ? MODULES[resolvedKey] : null;

  /* Calculate defect statistics */
  const defectStats = useMemo(() => {
    const edxCounts = {};
    defects.forEach((d) => {
      edxCounts[d.edxCategory] = (edxCounts[d.edxCategory] || 0) + 1;
    });
    return { total: defects.length, byType: edxCounts };
  }, [defects]);

  /* Draw wafer on canvas */
  useEffect(() => {
    if (!canvasRef.current || !box) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const size = Math.round(120 * 1.03);
    const cx = size / 2;
    const cy = size / 2;
    const r = Math.round(46 * 1.03);

    const angle = MODULE_WAFER_ROTATION[resolvedKey] || 0;

    ctx.clearRect(0, 0, size, size);

    // Rotate canvas
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);

    // Draw wafer body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.90)";
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw notch (fixed at 6 o'clock on wafer)
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx - 7, cy + r - 10);
    ctx.lineTo(cx + 7, cy + r - 10);
    ctx.closePath();
    ctx.fillStyle = "#2563eb";
    ctx.fill();

    // Draw defects
    defects.forEach((d) => {
      const x = cx + (d.x / 200) * r;
      const y = cy - (d.y / 200) * r;

      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = EDX_COLORS[d.edxCategory] || "#666";
      ctx.fill();
    });

    ctx.restore();
  }, [box, defects, resolvedKey]);

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Equipment Layout</h3>
          <p className="text-sm text-gray-500">
            {resolvedKey ? (
              <>
                Wafer location: <span className="font-medium text-gray-700">{MODULES[resolvedKey].label}</span>
              </>
            ) : (
              "No location detected"
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Defect count badge */}
          {defectStats.total > 0 && (
            <div className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
              {defectStats.total} defect{defectStats.total !== 1 ? "s" : ""}
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-white rounded transition-colors"
              title="Zoom out"
            >
              −
            </button>
            <span className="px-2 text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-white rounded transition-colors"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white rounded transition-colors"
              title="Reset zoom"
            >
              Reset
            </button>
          </div>

          {/* Location override */}
          {onChangeLocation && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Override:</label>
              <select
                value={manualLocation || ""}
                onChange={(e) => onChangeLocation(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Auto-detect</option>
                {Object.entries(MODULES).map(([k, m]) => (
                  <option key={k} value={k}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Equipment map */}
      <div className="overflow-auto border-2 border-gray-200 rounded-xl bg-gray-50 shadow-inner">
        <div
          className="relative bg-gray-100"
          style={{
            width: 1100 * zoomLevel,
            height: 750 * zoomLevel,
            transition: "all 0.2s ease",
          }}
        >
          <img
            src="/equipment-layout.png"
            alt="Tool Layout"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ imageRendering: zoomLevel > 1 ? "crisp-edges" : "auto" }}
          />

          {/* Module boxes */}
          {Object.entries(MODULES).map(([name, m]) => {
            const isActive = name === resolvedKey;
            const isHovered = name === hoveredModule;

            return (
              <div
                key={name}
                onMouseEnter={() => setHoveredModule(name)}
                onMouseLeave={() => setHoveredModule(null)}
                className={`absolute border-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-blue-500 bg-blue-500/10"
                    : isHovered
                    ? "border-blue-300 bg-blue-300/10"
                    : "border-blue-400/40 bg-transparent"
                }`}
                style={{
                  left: m.x * zoomLevel,
                  top: m.y * zoomLevel,
                  width: m.w * zoomLevel,
                  height: m.h * zoomLevel,
                }}
              >
                {/* Module label */}
                <span
                  className={`absolute -top-5 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : isHovered
                      ? "bg-blue-400 text-white"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                  style={{ fontSize: 10 * zoomLevel }}
                >
                  {name}
                </span>

                {/* Tooltip on hover */}
                {isHovered && !isActive && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                    {m.label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Wafer visualization */}
          {box && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: (box.x + box.w / 2 - 62) * zoomLevel,
                top: (box.y + box.h / 2 - 62) * zoomLevel,
              }}
            >
              <canvas
                ref={canvasRef}
                width={124}
                height={124}
                style={{
                  width: 124 * zoomLevel,
                  height: 124 * zoomLevel,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Defect legend (if defects present) */}
      {defectStats.total > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Defect Distribution on Wafer</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(defectStats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: EDX_COLORS[type] || "#666" }}
                />
                <span className="text-xs text-gray-700">
                  {type}: <span className="font-medium">{count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No location warning */}
      {!resolvedKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ Unable to determine wafer location from chamber data.
            {onChangeLocation && " Use the override dropdown to manually select a module."}
          </p>
        </div>
      )}
    </div>
  );
}