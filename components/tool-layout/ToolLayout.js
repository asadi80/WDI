"use client";

import { useState } from "react";
import { MODULES } from "./MODULES";

export default function ToolLayout({ activeModule, zoom = 1, children }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      className="relative bg-gray-100 border-2 border-gray-200 rounded-xl"
      style={{ width: 1100 * zoom, height: 750 * zoom }}
    >
      <img
        src="/equipment-layout.png"
        alt="Tool Layout"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {Object.entries(MODULES).map(([key, m]) => {
        const active = key === activeModule;
        return (
          <div
            key={key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className={`absolute border-2 transition-all ${
              active
                ? "border-blue-500 bg-blue-500/10"
                : hovered === key
                ? "border-blue-300 bg-blue-300/10"
                : "border-blue-400/40"
            }`}
            style={{
              left: m.x * zoom,
              top: m.y * zoom,
              width: m.w * zoom,
              height: m.h * zoom,
            }}
          />
        );
      })}

      {children}
    </div>
  );
}
