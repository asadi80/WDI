"use client";
import { useEffect, useRef } from "react";

export default function DefectChart({ defects }) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 400, 200);

    defects.slice(0, 100).forEach((d, i) => {
      ctx.fillRect(i * 4, 200 - d.defectSize * 10, 3, d.defectSize * 10);
    });
  }, [defects]);

  return <canvas ref={canvasRef} width={400} height={200} />;
}
