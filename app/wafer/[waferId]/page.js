"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import EquipmentMap from "@/components/EquipmentMap";
const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

export default function WaferDetail() {
  const { waferId } = useParams();

  const [data, setData] = useState(null);
  const [manualLocation, setManualLocation] = useState("");

  const canvasRef = useRef(null);

  // 🔹 Fetch wafer data
  useEffect(() => {
    fetch(`/api/wafers/${waferId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [waferId]);

  // 🔹 Draw wafer map
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cx = 250;
    const cy = 250;
    const r = 200;

    // 🔧 ultra-small notch tuning
    const notchAngle = Math.PI / 80; // VERY narrow
    const notchDepth = 6; // VERY shallow

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // =========================
    // Draw wafer
    // =========================
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // =========================
    // Cut notch (triangle only)
    // =========================
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();
    ctx.moveTo(cx, cy + r); // edge center
    ctx.lineTo(
      cx + Math.sin(notchAngle) * (r - notchDepth),
      cy + Math.cos(notchAngle) * (r - notchDepth)
    );
    ctx.lineTo(
      cx - Math.sin(notchAngle) * (r - notchDepth),
      cy + Math.cos(notchAngle) * (r - notchDepth)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // =========================
    // Draw notch edge
    // =========================
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(notchAngle) * r, cy + Math.cos(notchAngle) * r);
    ctx.lineTo(cx, cy + r - notchDepth);
    ctx.lineTo(cx - Math.sin(notchAngle) * r, cy + Math.cos(notchAngle) * r);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // =========================
    // Draw defects
    // =========================
    data.defects.forEach((d) => {
      const x = cx + d.x;
      const y = cy - d.y; // Cartesian correction

      ctx.fillStyle = EDX_COLORS[d.edxCategory] || "#888";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data]);

  if (!data) return <div className="p-6">Loading...</div>;

  // 🔹 EDX summary
  const edxCounts = {};
  data.defects.forEach((d) => {
    edxCounts[d.edxCategory] = (edxCounts[d.edxCategory] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 🧠 HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Wafer {data.wafer.waferId}
        </h1>
        <span className="text-sm text-gray-500">
          {new Date(data.wafer.inspectionTime).toLocaleString()}
        </span>
      </div>

      {/* 🔳 MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 🗺️ WAFER MAP CARD */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="font-semibold text-lg">Wafer Map</h2>

          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="rounded bg-white mx-auto block max-w-full"
            />

            {/* 🎨 LEGEND */}
            <div className="space-y-2 text-sm">
              <h3 className="font-medium">EDX Legend</h3>
              {Object.entries(EDX_COLORS).map(([k, c]) => (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: c }}
                  />
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 METADATA + EDX SUMMARY */}
        <div className="space-y-6">
          {/* 🧾 METADATA */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-3">Wafer Info</h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <b>Lot:</b> {data.wafer.lot}
              </div>
              <div>
                <b>Slot:</b> {data.wafer.slotId}
              </div>
              <div>
                <b>Chamber:</b> {data.wafer.chamber}
              </div>
              <div>
                <b>Parent:</b> {data.wafer.parentEntity}
              </div>
              <div>
                <b>Week:</b> {data.wafer.week}
              </div>
              <div>
                <b>SPC ID:</b> {data.wafer.spcDataId}
              </div>
            </div>
          </div>

          {/* 🧪 EDX SUMMARY */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-3">EDX Distribution</h2>

            <div className="space-y-2 text-sm">
              {Object.entries(edxCounts).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: EDX_COLORS[k] || "#999" }}
                    />
                    {k}
                  </span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 h-fit">
        <h2 className="font-semibold text-lg mb-3">Wafer Physical Location</h2>

        <EquipmentMap
          locationKey={data.wafer.chamber}
          manualLocation={manualLocation}
          defects={data.defects}
          onChangeLocation={setManualLocation}
        />
      </div>

      {/* 📋 DEFECT TABLE */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Defects</h2>

        <div className="overflow-auto max-h-[420px] border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 text-left">EDX</th>
                <th className="p-2 text-right">X</th>
                <th className="p-2 text-right">Y</th>
                <th className="p-2 text-right">Size</th>
                <th className="p-2 text-right">Images</th>
              </tr>
            </thead>
            <tbody>
              {data.defects.map((d, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: EDX_COLORS[d.edxCategory] }}
                      />
                      {d.edxCategory}
                    </span>
                  </td>
                  <td className="p-2 text-right">{d.x}</td>
                  <td className="p-2 text-right">{d.y}</td>
                  <td className="p-2 text-right">{d.defectSize}</td>
                  <td className="p-2 text-right">{d.imageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
