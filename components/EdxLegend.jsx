import { EDX_COLORS } from "@/lib/edxColors";

export default function EdxLegend() {
  return (
    <div className="space-y-1 text-sm">
      <h3 className="font-semibold">EDX Categories</h3>

      {Object.entries(EDX_COLORS).map(([label, color]) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
