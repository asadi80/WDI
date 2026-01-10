"use client";

import { useEffect, useMemo, useRef } from "react";

/* =========================
   EDX COLORS
========================= */
const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

/* =========================
   DEG → RAD
========================= */
const deg = (d) => (d * Math.PI) / 180;

/* =========================
   MANUAL NOTCH ROTATIONS
   (your instructions)
========================= */
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

/* =========================
   COMPONENT
========================= */
export default function WaferPhysicalLocation({
  locationKey,
  manualLocation,
  onChangeLocation,
  defects = [],
}) {
  const canvasRef = useRef(null);

  /* =========================
     MODULE GEOMETRY
  ========================= */
  const MODULES = {
    LP1: { x: 24, y: 145, w: 107, h: 106 },
    LP2: { x: 24, y: 321, w: 107, h: 106 },
    LP3: { x: 24, y: 497, w: 107, h: 106 },

    EFEM: { x: 153, y: 320, w: 108, h: 105 },

    LLST1: { x: 376, y: 387, w: 107, h: 110 },
    LLST2: { x: 376, y: 261, w: 107, h: 110 },

    TMST1: { x: 600, y: 388, w: 103, h: 106 },
    TMST2: { x: 600, y: 266, w: 103, h: 102 },

    PM1ST1: { x: 726, y: 569, w: 112, h: 102 },
    PM1ST2: { x: 594, y: 569, w: 112, h: 102 },

    PM2ST1: { x: 946, y: 260, w: 112, h: 102 },
    PM2ST2: { x: 946, y: 385, w: 112, h: 108 },

    PM3ST1: { x: 732, y: 76, w: 112, h: 102 },
    PM3ST2: { x: 600, y: 76, w: 112, h: 102 },
  };
  function resolveModuleFromChamber(chamber) {
    if (!chamber) return null;

    // normalize: uppercase, remove spaces
    const s = chamber.toUpperCase().replace(/\s+/g, "");

    // ---------- PM ----------
    if (/PM1[-_]?S1/.test(s)) return "PM1ST1";
    if (/PM1[-_]?S2/.test(s)) return "PM1ST2";

    if (/PM2[-_]?S1/.test(s)) return "PM2ST1";
    if (/PM2[-_]?S2/.test(s)) return "PM2ST2";

    if (/PM3[-_]?S1/.test(s)) return "PM3ST1";
    if (/PM3[-_]?S2/.test(s)) return "PM3ST2";

    // ---------- TM ----------
    if (/TM[-_]?ST1|TM[-_]?S1/.test(s)) return "TMST1";
    if (/TM[-_]?ST2|TM[-_]?S2/.test(s)) return "TMST2";

    // ---------- LL ----------
    if (/LL[-_]?ST1|LL[-_]?S1/.test(s)) return "LLST1";
    if (/LL[-_]?ST2|LL[-_]?S2/.test(s)) return "LLST2";

    // ---------- LP ----------
    if (/LP1/.test(s)) return "LP1";
    if (/LP2/.test(s)) return "LP2";
    if (/LP3/.test(s)) return "LP3";

    // ---------- EFEM / tool ----------
    if (s.startsWith("APT")) return "EFEM";

    return null;
  }

  /* =========================
     RESOLVE LOCATION
  ========================= */
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

useEffect(() => {
  if (!canvasRef.current || !box) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const size = Math.round(120 * 1.03); // +3%
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(46 * 1.03);

  const angle = MODULE_WAFER_ROTATION[resolvedKey] || 0;

  ctx.clearRect(0, 0, size, size);

  // =========================
  // ROTATE WHOLE WAFER SPACE
  // =========================
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.translate(-cx, -cy);

  // =========================
  // WAFER BODY
  // =========================
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  ctx.fill();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // =========================
  // NOTCH (FIXED ON WAFER)
  // 6 o’clock reference
  // =========================
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx - 7, cy + r - 10);
  ctx.lineTo(cx + 7, cy + r - 10);
  ctx.closePath();
  ctx.fillStyle = "#2563eb";
  ctx.fill();

  // =========================
  // DEFECTS (WAFER COORDS)
  // =========================
  defects.forEach((d) => {
    const x = cx + (d.x / 200) * r;
    const y = cy - (d.y / 200) * r; // wafer Y up

    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = EDX_COLORS[d.edxCategory] || "#666";
    ctx.fill();
  });

  ctx.restore();
}, [box, defects, resolvedKey]);


  return (
    <div className="overflow-auto max-h-[px]  rounded  ">
      {/* LOCATION OVERRIDE */}
      {onChangeLocation && (
        <div className="flex items-center gap-3 mt-5 mb-3">
          <span className="text-sm font-medium">Override location:</span>
          <select
            value={manualLocation || ""}
            onChange={(e) => onChangeLocation(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Auto</option>
            {Object.keys(MODULES).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TOOL MAP */}
      <div className="relative w-[1100px] h-[750px] border rounded bg-gray-100">
        <img
          src="/equipment-layout.png"
          alt="Tool Layout"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* MODULE BOXES */}
        {Object.entries(MODULES).map(([name, m]) => (
          <div
            key={name}
            className="absolute border border-blue-400 text-[10px] pointer-events-none"
            style={{
              left: m.x,
              top: m.y,
              width: m.w,
              height: m.h,
            }}
          >
            <span className="absolute -top-4 bg-white px-1">{name}</span>
          </div>
        ))}

        {/* WAFER */}
        {box && (
          <canvas
            ref={canvasRef}
            width={124}
            height={124}
            className="absolute pointer-events-none"
            style={{
              left: box.x + box.w / 2 - 62,
              top: box.y + box.h / 2 - 62,
            }}
          />
        )}
      </div>
    </div>
  );
}
