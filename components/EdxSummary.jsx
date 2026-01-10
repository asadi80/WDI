import { EDX_COLORS } from "@/lib/edxColors";

export default function EdxSummary({ counts = {} }) {
  return (
    <div className="border rounded p-3 bg-white">
      <h3 className="font-semibold mb-2">EDX Categories</h3>

      {Object.keys(EDX_COLORS).map((cat) => (
        <div
          key={cat}
          className="flex items-center justify-between gap-3 mb-1"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: EDX_COLORS[cat] }}
            />
            <span>{cat}</span>
          </div>

          <span className="font-mono">
            {counts?.[cat] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}
