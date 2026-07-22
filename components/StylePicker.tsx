"use client";

import type { Style } from "@/lib/types";

const STYLES: { id: Style; label: string; blurb: string; swatch: string }[] = [
  { id: "scandi", label: "Scandi", blurb: "Light oak, linen, rattan", swatch: "linear-gradient(135deg,#e8ddc7,#c9b28b)" },
  { id: "muji", label: "Muji", blurb: "Minimal, calm, natural", swatch: "linear-gradient(135deg,#efece4,#cfc8b8)" },
  { id: "luxe", label: "Luxe", blurb: "Velvet, brass, marble", swatch: "linear-gradient(135deg,#3d2b3d,#b08d57)" },
  { id: "industrial", label: "Industrial", blurb: "Brick, metal, leather", swatch: "linear-gradient(135deg,#6b5a4e,#2f2a26)" },
  { id: "inspiration", label: "Inspiration", blurb: "Upload a photo to match", swatch: "linear-gradient(135deg,#f5cdb8,#d15f38)" },
];

export default function StylePicker({
  value,
  onChange,
}: {
  value: Style;
  onChange: (style: Style) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`rounded-xl border p-3 text-left transition ${
            value === s.id
              ? "border-clay-600 ring-2 ring-clay-500/40 bg-clay-50"
              : "border-stone-200 hover:border-stone-300 bg-white"
          }`}
        >
          <div className="h-10 w-full rounded-lg mb-2" style={{ background: s.swatch }} />
          <div className="font-semibold text-sm text-stone-900">{s.label}</div>
          <div className="text-xs mt-0.5 text-stone-500">{s.blurb}</div>
        </button>
      ))}
    </div>
  );
}
