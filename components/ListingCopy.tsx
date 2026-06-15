"use client";

import { useState } from "react";
import type { ListingCopy as ListingCopyType } from "@/lib/types";

export default function ListingCopy({ copy }: { copy: ListingCopyType }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${copy.title}\n\n${copy.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-neutral-200 p-4 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">{copy.title}</h3>
          <p className="text-sm text-neutral-600 mt-1">{copy.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
