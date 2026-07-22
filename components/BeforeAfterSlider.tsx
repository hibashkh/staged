"use client";

import { useRef, useState } from "react";

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
}: {
  beforeSrc: string;
  afterSrc: string;
}) {
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent((x / rect.width) * 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-xl border border-stone-200 shadow-sm select-none"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${percent}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="Before" className="w-full h-full object-cover" style={{ width: `${100 / (percent / 100)}%`, maxWidth: "none" }} />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${percent}%` }}
        onMouseDown={(e) => handleMove(e.clientX)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-clay-600 text-sm font-bold ring-1 ring-stone-200">
          ↔
        </div>
      </div>
      <div className="absolute top-2 left-2 text-xs font-medium bg-stone-900/70 text-white px-2 py-0.5 rounded-full">Before</div>
      <div className="absolute top-2 right-2 text-xs font-medium bg-clay-600/90 text-white px-2 py-0.5 rounded-full">After</div>
    </div>
  );
}
