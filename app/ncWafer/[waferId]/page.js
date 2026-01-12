"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import EquipmentMap from "@/components/EquipmentMap";
import DefectDiagnostics from "@/components/DefectDiagnostics";

const EDX_COLORS = {
  "C+Si+O": "#e11d48",
  "C+Si": "#f97316",
  "C+O": "#facc15",
  "Si+O": "#22c55e",
  Unknown: "#9ca3af",
};

export default function NCWaferDetail() {
  const { waferId } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [filterEDX, setFilterEDX] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "defectSize", direction: "desc" });
  
  const canvasRef = useRef(null);

  // Fetch NC wafer data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/ncWafers/${waferId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wafer data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [waferId]);

  // EDX summary and statistics
  const stats = useMemo(() => {
    if (!data) return null;

    const edxCounts = {};
    let totalSize = 0;
    let maxSize = 0;

    data.defects.forEach((d) => {
      edxCounts[d.edxCategory] = (edxCounts[d.edxCategory] || 0) + 1;
      totalSize += d.defectSize || 0;
      maxSize = Math.max(maxSize, d.defectSize || 0);
    });

    const avgSize = data.defects.length > 0 ? (totalSize / data.defects.length).toFixed(2) : 0;

    return { edxCounts, avgSize, maxSize, totalDefects: data.defects.length };
  }, [data]);

  // Filter and sort defects
  const filteredDefects = useMemo(() => {
    if (!data) return [];

    let filtered = data.defects.filter((d) => {
      if (filterEDX === "all") return true;
      return d.edxCategory === filterEDX;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal > bVal ? 1 : -1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, filterEDX, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300">⇅</span>;
    return sortConfig.direction === "asc" ? <span>↑</span> : <span>↓</span>;
  };

  // Draw wafer map
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cx = 250;
    const cy = 250;
    const r = 200;

    const notchAngle = Math.PI / 80;
    const notchDepth = 6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wafer circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cut notch
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
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

    // Draw notch outline
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(notchAngle) * r, cy + Math.cos(notchAngle) * r);
    ctx.lineTo(cx, cy + r - notchDepth);
    ctx.lineTo(cx - Math.sin(notchAngle) * r, cy + Math.cos(notchAngle) * r);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw defects
    filteredDefects.forEach((d, i) => {
      const x = cx + d.x;
      const y = cy - d.y;

      const isSelected = selectedDefect === i;
      
      ctx.fillStyle = EDX_COLORS[d.edxCategory] || "#888";
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [data, filteredDefects, selectedDefect]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mb-4"></div>
          <p className="text-gray-500">Loading NC wafer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">Error: {error}</p>
          <button
            onClick={() => router.push("/nc-wafers")}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to NC Wafers
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-2 inline-flex items-center gap-1"
            >
              Back to Home
            </button>
             <button
              onClick={() => router.push("/nc-wafers")}
              className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-2 inline-flex items-center gap-1 ml-5"
            >
              Back to NC Wafers
            </button>
            <h1 className="text-3xl font-bold tracking-tight">
              NC Wafer {data.wafer.waferId}
            </h1>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(data.wafer.inspectionTime).toLocaleString()}
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Total Defects</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{stats.totalDefects}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Avg Size</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{stats.avgSize}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Max Size</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{stats.maxSize}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">EDX Types</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {Object.keys(stats.edxCounts).length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Wafer Map */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">NC Wafer Map</h2>
            <select
              value={filterEDX}
              onChange={(e) => {
                setFilterEDX(e.target.value);
                setSelectedDefect(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All EDX Types</option>
              {Object.keys(EDX_COLORS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="rounded bg-white mx-auto block cursor-crosshair"
                onClick={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  // Find closest defect
                  let minDist = Infinity;
                  let closestIdx = null;

                  filteredDefects.forEach((d, i) => {
                    const dx = 250 + d.x;
                    const dy = 250 - d.y;
                    const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2);

                    if (dist < 10 && dist < minDist) {
                      minDist = dist;
                      closestIdx = i;
                    }
                  });

                  setSelectedDefect(closestIdx);
                }}
              />
              {selectedDefect !== null && (
                <div className="absolute top-2 left-2 bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-sm">
                  <div className="font-semibold mb-2">Selected Defect</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: EDX_COLORS[filteredDefects[selectedDefect].edxCategory] }}
                      />
                      <span>{filteredDefects[selectedDefect].edxCategory}</span>
                    </div>
                    <div>X: {filteredDefects[selectedDefect].x}</div>
                    <div>Y: {filteredDefects[selectedDefect].y}</div>
                    <div>Size: {filteredDefects[selectedDefect].defectSize}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="space-y-3 text-sm">
              <h3 className="font-medium">EDX Legend</h3>
              {Object.entries(EDX_COLORS).map(([k, c]) => {
                const count = stats.edxCounts[k] || 0;
                const percentage = ((count / stats.totalDefects) * 100).toFixed(1);
                
                return (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: c }}
                      />
                      <span>{k}</span>
                    </div>
                    <span className="text-gray-600 text-xs">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info + Summary */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Wafer Information</h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">Lot</span>
                <span className="font-medium">{data.wafer.lot}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">Slot</span>
                <span className="font-medium">{data.wafer.slotId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">Chamber</span>
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium w-fit">
                  {data.wafer.chamber}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">Week</span>
                <span className="font-medium">{data.wafer.week}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">Parent Entity</span>
                <span className="font-medium">{data.wafer.parentEntity}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">SPC ID</span>
                <span className="font-medium">{data.wafer.spcDataId}</span>
              </div>
            </div>
          </div>

          {/* EDX Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">EDX Distribution</h2>

            <div className="space-y-3">
              {Object.entries(stats.edxCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => {
                  const percentage = ((v / stats.totalDefects) * 100).toFixed(1);
                  
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: EDX_COLORS[k] }}
                          />
                          {k}
                        </span>
                        <span className="font-medium">
                          {v} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: EDX_COLORS[k],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Map */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Wafer Physical Location</h2>

        <EquipmentMap
          locationKey={data.wafer.chamber}
          manualLocation={manualLocation}
          defects={data.defects}
          onChangeLocation={setManualLocation}
        />
      </div>

      {/* ADD THIS - Defect Diagnostics */}
<DefectDiagnostics 
  defects={data.defects} 
  chamber={data.wafer.chamber}
  waferType="NC"
/>

      {/* Defect Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">
            NC Defects ({filteredDefects.length})
          </h2>
          {filterEDX !== "all" && (
            <button
              onClick={() => {
                setFilterEDX("all");
                setSelectedDefect(null);
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="overflow-auto max-h-[420px] border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 border-b">
              <tr>
                <th className="p-3 text-left">#</th>
                <th
                  onClick={() => handleSort("edxCategory")}
                  className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    EDX Category <SortIcon column="edxCategory" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("x")}
                  className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    X <SortIcon column="x" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("y")}
                  className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Y <SortIcon column="y" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("defectSize")}
                  className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Size <SortIcon column="defectSize" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDefects.map((d, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedDefect(i)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedDefect === i ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: EDX_COLORS[d.edxCategory] }}
                      />
                      {d.edxCategory}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{d.x.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">{d.y.toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">{d.defectSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}