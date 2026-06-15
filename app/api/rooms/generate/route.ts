import { NextRequest, NextResponse } from "next/server";
import {
  restyleRoom,
  extractItems,
  matchItemsToCatalog,
  generateListingCopy,
} from "@/lib/agnes";
import type { Style } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { image, style, roomType, additions } = await req.json();

    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Missing or invalid 'image' data URL" }, { status: 400 });
    }
    if (!["scandi", "muji", "luxe", "industrial"].includes(style)) {
      return NextResponse.json({ error: "Invalid 'style'" }, { status: 400 });
    }

    const safeRoomType = typeof roomType === "string" && roomType ? roomType : undefined;
    const safeAdditions = Array.isArray(additions)
      ? additions.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
      : [];

    const { image: afterImage, sourceUrl } = await restyleRoom(
      image,
      style as Style,
      safeRoomType,
      safeAdditions
    );
    const rawItems = await extractItems(afterImage);
    const items = matchItemsToCatalog(rawItems, style as Style);
    const listingCopy = await generateListingCopy(style as Style, rawItems);

    return NextResponse.json({ afterImage, items, listingCopy, sourceUrl });
  } catch (err: any) {
    console.error("generate room failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
