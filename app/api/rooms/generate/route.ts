import { NextRequest, NextResponse } from "next/server";
import {
  restyleRoom,
  extractItems,
  matchItemsToCatalog,
} from "@/lib/agnes";
import type { Style } from "@/lib/types";

const VARIANT_COUNT = 1;

export async function POST(req: NextRequest) {
  try {
    const { image, style, roomType, additions, budget, inspirationImage } = await req.json();

    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Missing or invalid 'image' data URL" }, { status: 400 });
    }
    if (!["scandi", "muji", "luxe", "industrial", "inspiration"].includes(style)) {
      return NextResponse.json({ error: "Invalid 'style'" }, { status: 400 });
    }

    const safeInspirationImage =
      typeof inspirationImage === "string" && inspirationImage.startsWith("data:image")
        ? inspirationImage
        : undefined;

    const safeRoomType = typeof roomType === "string" && roomType ? roomType : undefined;
    const safeAdditions = Array.isArray(additions)
      ? additions.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
      : [];
    const safeBudget = typeof budget === "number" && budget > 0 ? budget : undefined;

    const variants = await Promise.all(
      Array.from({ length: VARIANT_COUNT }, async () => {
        const { image: afterImage, sourceUrl } = await restyleRoom(
          image,
          style as Style,
          safeRoomType,
          safeAdditions,
          safeInspirationImage
        );
        const rawItems = await extractItems(afterImage);
        const { items, totalCost } = matchItemsToCatalog(rawItems, style as Style, safeBudget);

        return { afterImage, sourceUrl, items, totalCost };
      })
    );

    return NextResponse.json({ variants });
  } catch (err: any) {
    console.error("generate room failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
