const LEGEND_ITEMS = [
  { color: "#34d399", label: "Tepat" },
  { color: "#f59e0b", label: "Terlalu tinggi" },
  { color: "#8b5cf6", label: "Terlalu rendah" },
];

export default function PitchLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
