import { NextRequest, NextResponse } from "next/server";
import { generateWalkthroughVideo } from "@/lib/agnes";
import type { Style } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { sourceUrl, style } = await req.json();

    if (typeof sourceUrl !== "string" || !sourceUrl) {
      return NextResponse.json({ error: "Missing 'sourceUrl'" }, { status: 400 });
    }
    if (!["scandi", "muji", "luxe", "industrial"].includes(style)) {
      return NextResponse.json({ error: "Invalid 'style'" }, { status: 400 });
    }

    const videoUrl = await generateWalkthroughVideo(sourceUrl, style as Style);
    return NextResponse.json({ videoUrl, videoError: null });
  } catch (err: any) {
    console.error("video walkthrough generation failed:", err);
    return NextResponse.json({ videoUrl: null, videoError: err?.message ?? "Video generation failed" });
  }
}
