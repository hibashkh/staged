"use client";

import type { Style } from "@/lib/types";

const STYLES: { id: Style; label: string; blurb: string }[] = [
  { id: "scandi", label: "Scandi", blurb: "Light oak, linen, rattan" },
  { id: "muji", label: "Muji", blurb: "Minimal, calm, natural" },
  { id: "luxe", label: "Luxe", blurb: "Velvet, brass, marble" },
  { id: "industrial", label: "Industrial", blurb: "Brick, metal, leather" },
];

export default function StylePicker({
  value,
  onChange,
}: {
  value: Style;
  onChange: (style: Style) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`rounded-xl border p-4 text-left transition ${
            value === s.id
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <div className="font-semibold">{s.label}</div>
          <div className={`text-xs mt-1 ${value === s.id ? "text-neutral-300" : "text-neutral-500"}`}>
            {s.blurb}
          </div>
        </button>
      ))}
    </div>
  );
}
