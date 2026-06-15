"use client";

import type { RoomVariant } from "@/lib/types";

export default function VariantPicker({
  beforeImage,
  variants,
  budget,
  loading,
  onChoose,
  onRegenerate,
}: {
  beforeImage: string;
  variants: RoomVariant[];
  budget: number | null;
  loading: boolean;
  onChoose: (variant: RoomVariant) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Pick your favorite</h2>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
        >
          {loading ? "Generating…" : "Regenerate all"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {variants.map((variant, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChoose(variant)}
            className="text-left rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md hover:border-neutral-400 transition bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={variant.afterImage} alt={`Option ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
            <div className="p-3">
              <div className="font-medium text-sm">Option {i + 1}</div>
              {budget ? (
                <div className="text-sm text-neutral-600 mt-1">
                  ${variant.totalCost} of ${budget} budget
                </div>
              ) : (
                <div className="text-sm text-neutral-600 mt-1">${variant.totalCost} furniture</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
