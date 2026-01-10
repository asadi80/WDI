"use client";

import { useEffect, useRef } from "react";

export default function WaferMapCanvas({
  defects,
  width = 600,
  height = 600,
  waferRadius = 150
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!defects || !defects.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / (2 * waferRadius);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1️⃣ Draw wafer outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, waferRadius * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2️⃣ Draw defects
    defects.forEach(d => {
      if (d.x == null || d.y == null) return;

      const px = centerX + d.x * scale;
      const py = centerY - d.y * scale;

      // Skip defects outside wafer
      const r = Math.sqrt(d.x * d.x + d.y * d.y);
      if (r > waferRadius) return;

      // Size scale (log so big defects don't dominate)
      const size = Math.max(2, Math.log10(d.defectSize || 10) * 3);

      // Color by Carbon
      const carbon = d.elements?.carbon;
      let color = "#999";

      if (carbon != null) {
        if (carbon < 1) color = "#2c7bb6";       // low → blue
        else if (carbon < 2) color = "#abd9e9";
        else if (carbon < 3) color = "#fdae61";
        else color = "#d7191c";                  // high → red
      }

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

  }, [defects, width, height, waferRadius]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", background: "#fff" }}
    />
  );
}
