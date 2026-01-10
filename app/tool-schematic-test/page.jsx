"use client";

import { useEffect, useRef, useState } from "react";

/*
  Responsive, centered schematic
  Scales uniformly without breaking shape
*/

const DESIGN_W = 1100;
const DESIGN_H = 750;

export default function ToolSchematicTest() {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  /* =============================
     AUTO SCALE BASED ON SCREEN
  ============================== */
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;

      const s = Math.min(clientWidth / DESIGN_W, clientHeight / DESIGN_H);

      setScale(s);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      {/* CENTERING CONTAINER */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        {/* SCALE WRAPPER */}
        <div
          className="origin-center"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
          }}
        >
          {/* ================= TOOL ================= */}
          <div className="relative w-full h-full bg-gray-100 border rounded shadow">
            {/* LPs */}
            <div className="absolute left-5 top-[160px] space-y-8">
              <LP label="LP1" />
              <LP label="LP2" />
              <LP label="LP3" />
            </div>

            {/* EFEM */}
            <div className="absolute left-[141px] top-[70px] w-[220px] h-[620px] bg-gray-200 border-2 rounded relative">
              <Label text="EFEM" />

              <Station y={260} label="ST1" />
              
            </div>

            {/* LL */}
            <div className="absolute left-[360px] top-[250px] w-[150px] h-[260px] bg-gray-300 border-2 rounded">
              <Label text="LL" />
              <Station y={30} label="ST2" />
              <Station y={140} label="ST1" />
            </div>

            {/* TM */}
            <div className="absolute left-[510px] top-[200px] w-[300px] h-[350px] bg-gray-300 border-2 rounded">
              <Label text="TM" />
              <Station y={70} label="ST2" />
              <Station y={180} label="ST1" />
            </div>

            {/* PM3 */}
            <div className="absolute left-[530px] top-[70px]">
              <PM label="PM3" />
            </div>

            {/* PM2 – vertical */}
            <div className="absolute left-[940px] top-[250px] rotate-90 origin-top-left">
              <PM label="PM2" />
            </div>

            {/* PM1 */}
            <div className="absolute left-[530px] top-[550px]">
              <PM label="PM1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Label({ text }) {
  return (
    <span className="absolute top-1 left-2 text-xs font-medium text-gray-700">
      {text}
    </span>
  );
}

function LP({ label }) {
  return (
    <div className="relative w-[120px] h-[120px] bg-gray-300 border-2 rounded">
      <Label text={label} />
      <div className="absolute inset-4 rounded-full border bg-gray-100" />
    </div>
  );
}

function PM({ label }) {
  return (
    <div className="relative w-[260px] h-[130px] bg-black rounded">
      <span className="absolute top-1 left-2 text-xs text-white">{label}</span>

      <div className="absolute left-4 top-6 w-[80px] h-[80px] rounded-full bg-gray-200 border">
        <span className="absolute -bottom-4 left-2 text-[10px] text-white">
          ST1
        </span>
      </div>

      <div className="absolute right-4 top-6 w-[80px] h-[80px] rounded-full bg-gray-200 border">
        <span className="absolute -bottom-4 left-2 text-[10px] text-white">
          ST2
        </span>
      </div>
    </div>
  );
}

function Station({ y, label }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[90px] h-[90px] rounded-full bg-red-200 border"
      style={{ top: y }}
    >
      <span className="absolute -bottom-4 left-2 text-[10px]">{label}</span>
    </div>
  );
}
