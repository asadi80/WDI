"use client";
import { useEffect, useRef } from "react";
import { EDX_COLORS } from "@/lib/edxColors";

export default function WaferMap({ defects }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!defects?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const CENTER = 250;
    const RADIUS = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Wafer outline
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.stroke();

    defects.forEach(d => {
      const x = CENTER + d.x;
      const y = CENTER + d.y;

      ctx.fillStyle = EDX_COLORS[d.edxCategory] || EDX_COLORS["Unknown"];

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [defects]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      className="border rounded bg-white"
    />
  );
}
