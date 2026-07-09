"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export default function PitchLegend() {
  const { t } = useLocale();

  const items = [
    { color: "#34d399", label: t("legend.inTune") },
    { color: "#f59e0b", label: t("legend.sharp") },
    { color: "#8b5cf6", label: t("legend.flat") },
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
      {items.map((item) => (
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
