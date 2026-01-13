"use client";

import { useEffect, useRef } from "react";
import { MODULE_WAFER_ROTATION } from "./rotations";

export default function WaferCanvas({ moduleKey, imageSrc }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const size = 124;
    const cx = size / 2;
    const cy = size / 2;
    const r = 46;

    const rotation = MODULE_WAFER_ROTATION[moduleKey] || 0;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // 🔄 APPLY ROTATION
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);

      // Clip wafer circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Draw wafer image
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);

      ctx.restore();
    };

    img.src = imageSrc;
  }, [imageSrc, moduleKey]);

  return (
    <canvas
      ref={canvasRef}
      width={124}
      height={124}
      style={{ imageRendering: "auto" }}
    />
  );
}
